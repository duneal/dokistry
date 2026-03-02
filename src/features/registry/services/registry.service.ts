import axios, { type AxiosResponse } from "axios"
import { createHash } from "crypto"
import { REGISTRY_CONFIG, validateRegistryConfig } from "@/utils/constants/registry"
import type {
	DockerRegistryCatalogResponse,
	DockerRegistryTagsResponse,
	ImageManifest,
	RegistryRepositoriesResponse,
	Repository,
	TagWithSize,
} from "@/utils/types/registry.interface"

const ESTIMATED_DECOMPRESSION_RATIO = 3.5

const MANIFEST_ACCEPT_HEADER = [
	"application/vnd.docker.distribution.manifest.v2+json",
	"application/vnd.docker.distribution.manifest.list.v2+json",
	"application/vnd.oci.image.manifest.v1+json",
	"application/vnd.oci.image.index.v1+json",
	"application/vnd.docker.distribution.manifest.v1+json",
	"application/vnd.docker.distribution.manifest.v1+prettyjws",
].join(", ")

class RegistryService {
	private baseUrl: string | null = null
	private auth: string | null = null

	private initializeConfig() {
		if (!validateRegistryConfig()) {
			throw new Error(
				"Missing required Docker registry configuration:" +
					process.env.REGISTRY_URL +
					" " +
					process.env.REGISTRY_USERNAME +
					" " +
					process.env.REGISTRY_PASSWORD,
			)
		}

		if (!this.baseUrl || !this.auth) {
			this.baseUrl = REGISTRY_CONFIG.REGISTRY_URL.replace(/\/$/, "") // Remove trailing slash
			this.auth = Buffer.from(`${REGISTRY_CONFIG.USERNAME}:${REGISTRY_CONFIG.PASSWORD}`).toString(
				"base64",
			)
		}
	}

	private async makeRequest<T>(endpoint: string, customAccept?: string): Promise<T> {
		this.initializeConfig()

		try {
			const response: AxiosResponse<T> = await axios.get(`${this.baseUrl}${endpoint}`, {
				headers: {
					Authorization: `Basic ${this.auth}`,
					Accept: customAccept || "application/json",
				},
				timeout: 5000,
			})

			return response.data
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error("Authentication failed: Invalid credentials")
				}
				if (error.response?.status === 403) {
					throw new Error("Access forbidden: Insufficient permissions")
				}
				if (error.response?.status === 404) {
					throw new Error(`Resource not found: ${endpoint}`)
				}
				if (error.code === "ECONNABORTED") {
					throw new Error("Registry request failed: timeout exceeded")
				}
				throw new Error(`Registry request failed: ${error.message}`)
			}
			throw new Error("Unknown error occurred while connecting to registry")
		}
	}

	private async makeDeleteRequest(endpoint: string): Promise<void> {
		this.initializeConfig()

		try {
			await axios.delete(`${this.baseUrl}${endpoint}`, {
				headers: {
					Authorization: `Basic ${this.auth}`,
					Accept: MANIFEST_ACCEPT_HEADER,
				},
				timeout: 10000,
			})
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error("Authentication failed: Invalid credentials")
				}
				if (error.response?.status === 403) {
					throw new Error("Access forbidden: Insufficient permissions")
				}
				if (error.response?.status === 404) {
					throw new Error("Tag not found or already deleted")
				}
				if (error.response?.status === 405) {
					throw new Error("Delete operation not supported by registry")
				}
				if (error.code === "ECONNABORTED") {
					throw new Error("Registry request failed: timeout exceeded")
				}
				throw new Error(`Delete request failed: ${error.message}`)
			}
			throw new Error("Unknown error occurred while deleting from registry")
		}
	}

	async getManifestDigest(repositoryName: string, tag: string): Promise<string> {
		this.initializeConfig()

		const url = `${this.baseUrl}/v2/${repositoryName}/manifests/${tag}`
		const headers = {
			Authorization: `Basic ${this.auth}`,
			Accept: MANIFEST_ACCEPT_HEADER,
		}

		try {
			const headResponse = await axios.head(url, { headers, timeout: 5000 })
			const digest =
				headResponse.headers["docker-content-digest"] ||
				headResponse.headers["content-digest"] ||
				headResponse.headers.digest
			if (digest) return digest
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status !== 405) {
				console.warn(`HEAD manifest digest failed for ${repositoryName}:${tag}: ${error.message}`)
			}
		}

		try {
			const response = await axios.get(url, {
				headers,
				timeout: 10000,
				transformResponse: [(data: string) => data],
			})

			const digest =
				response.headers["docker-content-digest"] ||
				response.headers["content-digest"] ||
				response.headers.digest
			if (digest) return digest

			const rawBody =
				typeof response.data === "string" ? response.data : JSON.stringify(response.data)
			return `sha256:${createHash("sha256").update(rawBody, "utf8").digest("hex")}`
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 404) {
					throw new Error(`Manifest not found for tag: ${tag}`)
				}
				throw new Error(`Failed to get manifest digest: ${error.message}`)
			}
			throw new Error("Unknown error occurred while getting manifest digest")
		}
	}

	async getRepositories(): Promise<string[]> {
		try {
			const response = await this.makeRequest<DockerRegistryCatalogResponse>("/v2/_catalog")
			return response.repositories || []
		} catch (error) {
			console.error("Failed to fetch repositories:", error)
			throw error
		}
	}

	async getRepositoryTags(repositoryName: string): Promise<string[]> {
		try {
			const response = await this.makeRequest<DockerRegistryTagsResponse>(
				`/v2/${repositoryName}/tags/list`,
			)
			return response.tags || []
		} catch (error) {
			console.error(`Failed to fetch tags for repository ${repositoryName}:`, error)
			throw error
		}
	}

	async getImageManifest(repositoryName: string, tag: string): Promise<ImageManifest> {
		try {
			const response = await this.makeRequest<ImageManifest>(
				`/v2/${repositoryName}/manifests/${tag}`,
				MANIFEST_ACCEPT_HEADER,
			)

			return response
		} catch (error) {
			console.error(`Failed to fetch manifest for ${repositoryName}:${tag}:`, error)
			throw error
		}
	}

	async getTagWithSize(repositoryName: string, tag: string): Promise<TagWithSize> {
		try {
			const manifest = await this.getImageManifest(repositoryName, tag)

			// Handle different manifest formats
			let layers = manifest.layers || []
			let configSize = 0
			let totalSize = 0
			let compressedSize = 0

			if (manifest.schemaVersion === 1) {
				if (manifest.fsLayers && manifest.fsLayers.length > 0) {
					const uniqueBlobs = [...new Set(manifest.fsLayers.map((l) => l.blobSum))]

					try {
						this.initializeConfig()
						const blobSizeMap = new Map<string, number>()
						await Promise.all(
							uniqueBlobs.map(async (blobSum) => {
								try {
									const headResponse = await axios.head(
										`${this.baseUrl}/v2/${repositoryName}/blobs/${blobSum}`,
										{
											headers: {
												Authorization: `Basic ${this.auth}`,
												"User-Agent": "Dokistry/1.0",
											},
											timeout: 10000,
										},
									)
									const contentLength = headResponse.headers["content-length"]
									blobSizeMap.set(blobSum, contentLength ? parseInt(contentLength, 10) : 0)
								} catch {
									blobSizeMap.set(blobSum, 0)
								}
							}),
						)

						totalSize = uniqueBlobs.reduce((sum, b) => sum + (blobSizeMap.get(b) || 0), 0)
						compressedSize = totalSize

						layers = uniqueBlobs.map((blobSum) => ({
							mediaType: "application/vnd.docker.image.rootfs.diff.tar.gzip",
							size: blobSizeMap.get(blobSum) || 0,
							digest: blobSum,
						}))
					} catch {
						const estimatedSizePerLayer = 10 * 1024 * 1024
						totalSize = uniqueBlobs.length * estimatedSizePerLayer
						compressedSize = totalSize

						layers = uniqueBlobs.map((blobSum) => ({
							mediaType: "application/vnd.docker.image.rootfs.diff.tar.gzip",
							size: estimatedSizePerLayer,
							digest: blobSum,
						}))
					}
				}
			}
			// Check if this is a manifest list (multi-architecture)
			else if (manifest.manifests && manifest.manifests.length > 0) {
				// For manifest lists, we need to fetch the actual manifest for a specific platform
				// For now, we'll use the first available manifest
				const firstManifest = manifest.manifests[0]
				if (firstManifest.digest) {
					try {
						const actualManifest = await this.makeRequest<ImageManifest>(
							`/v2/${repositoryName}/manifests/${firstManifest.digest}`,
						)
						layers = actualManifest.layers || []
						if (actualManifest.config?.size) {
							configSize = actualManifest.config.size
						}
					} catch (error) {
						console.warn(`Failed to fetch actual manifest for ${repositoryName}:${tag}:`, error)
					}
				}
			} else {
				// Regular single-architecture manifest (v2)
				layers = manifest.layers || []
				if (manifest.config?.size) {
					configSize = manifest.config.size
				}
			}

			// Calculate total size (uncompressed) - sum of all layer sizes
			if (totalSize === 0) {
				totalSize = layers.reduce((sum, layer) => sum + (layer.size || 0), configSize)
			}

			// Calculate compressed size (what's actually stored) - same as total for now
			if (compressedSize === 0) {
				compressedSize = layers.reduce((sum, layer) => sum + (layer.size || 0), configSize)
			}

			return {
				name: tag,
				size: totalSize,
				compressedSize: compressedSize,
				estimatedDecompressedSize: Math.round(totalSize * ESTIMATED_DECOMPRESSION_RATIO),
				layers: layers.length,
			}
		} catch (error) {
			console.error(`Failed to get size for ${repositoryName}:${tag}:`, error)
			return {
				name: tag,
				size: 0,
				compressedSize: 0,
				estimatedDecompressedSize: 0,
				layers: 0,
			}
		}
	}

	async getRepositoriesWithTags(): Promise<RegistryRepositoriesResponse> {
		try {
			const repositoryNames = await this.getRepositories()

			if (repositoryNames.length === 0) {
				return { repositories: [] }
			}

			const repositories: Repository[] = await Promise.all(
				repositoryNames.map(async (name) => {
					try {
						const tags = await this.getRepositoryTags(name)

						// Get size information for each tag
						const tagsWithSize: TagWithSize[] = await Promise.all(
							tags.map(async (tag) => {
								try {
									return await this.getTagWithSize(name, tag)
								} catch (error) {
									console.warn(`Could not fetch size for ${name}:${tag}:`, error)
									return {
										name: tag,
										size: 0,
										compressedSize: 0,
										estimatedDecompressedSize: 0,
										layers: 0,
									}
								}
							}),
						)

						// Calculate totals
						const totalSize = tagsWithSize.reduce((sum, tag) => sum + tag.size, 0)
						const totalCompressedSize = tagsWithSize.reduce(
							(sum, tag) => sum + tag.compressedSize,
							0,
						)

						return {
							name,
							tags,
							tagsWithSize,
							totalSize,
							totalCompressedSize,
						}
					} catch (error) {
						// If we can't fetch tags for a repository, return it with empty tags
						console.warn(`Could not fetch tags for repository ${name}:`, error)
						return {
							name,
							tags: [],
							tagsWithSize: [],
							totalSize: 0,
							totalCompressedSize: 0,
						}
					}
				}),
			)

			return { repositories }
		} catch (error) {
			console.error("Failed to fetch repositories with tags:", error)
			throw error
		}
	}

	async deleteTag(repositoryName: string, tag: string): Promise<void> {
		try {
			console.log(`Attempting to delete tag: ${repositoryName}:${tag}`)

			// Always try v2 API first, regardless of manifest schema version
			// Many registries use v2 API even with v1 manifests
			console.log("Trying v2 deletion method first...")

			try {
				// Try deleting by tag first (some registries support this)
				console.log("Trying to delete by tag first...")
				await this.makeDeleteRequest(`/v2/${repositoryName}/manifests/${tag}`)
				console.log("Successfully deleted by tag")
				return
			} catch (tagDeleteError) {
				console.log("Delete by tag failed, trying with digest:", tagDeleteError)

				// If that fails, get the manifest digest from the registry headers
				const digest = await this.getManifestDigest(repositoryName, tag)
				console.log("Got digest for deletion:", digest)

				// Delete the manifest by digest
				await this.makeDeleteRequest(`/v2/${repositoryName}/manifests/${digest}`)
				console.log("Successfully deleted by digest")
			}
		} catch (error) {
			console.error(`Failed to delete tag ${repositoryName}:${tag}:`, error)
			throw error
		}
	}

	async deleteTags(
		repositoryName: string,
		tags: string[],
	): Promise<{ success: string[]; failed: { tag: string; error: string }[] }> {
		const results = {
			success: [] as string[],
			failed: [] as { tag: string; error: string }[],
		}

		// Process deletions in parallel for better performance
		const deletionPromises = tags.map(async (tag) => {
			try {
				await this.deleteTag(repositoryName, tag)
				results.success.push(tag)
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "Unknown error"
				results.failed.push({ tag, error: errorMessage })
			}
		})

		await Promise.all(deletionPromises)

		return results
	}
}

export const registryService = new RegistryService()
