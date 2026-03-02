import axios, { type AxiosResponse } from "axios"
import { createHash } from "crypto"
import { getCurrentSelectedRegistry } from "@/utils/lib/auth-actions"
import type {
	DockerRegistryCatalogResponse,
	DockerRegistryTagsResponse,
	ImageManifest,
	RegistryRepositoriesResponse,
	Repository,
	TagWithSize,
} from "@/utils/types/registry.interface"
import type { IRegistryService } from "./registry-service.interface"

const ESTIMATED_DECOMPRESSION_RATIO = 3.5

const MANIFEST_ACCEPT_HEADER = [
	"application/vnd.docker.distribution.manifest.v2+json",
	"application/vnd.docker.distribution.manifest.list.v2+json",
	"application/vnd.oci.image.manifest.v1+json",
	"application/vnd.oci.image.index.v1+json",
	"application/vnd.docker.distribution.manifest.v1+json",
	"application/vnd.docker.distribution.manifest.v1+prettyjws",
].join(", ")

class DatabaseRegistryService implements IRegistryService {
	private baseUrl: string | null = null
	private auth: string | null = null

	private async initializeConfig() {
		// Get current selected registry from database
		const result = await getCurrentSelectedRegistry()

		if (result.error) {
			// Check if it's a "no registry" error - this is not a critical error, just means no registry configured
			if (result.error === "No registries found") {
				throw new Error("NO_REGISTRY_CONFIGURED")
			}
			throw new Error(`Registry configuration error: ${result.error}`)
		}

		if (!result.registry) {
			throw new Error("NO_REGISTRY_CONFIGURED")
		}

		const registry = result.registry

		// Validate registry configuration
		if (!registry.url || !registry.username || !registry.password) {
			throw new Error("Invalid registry configuration: missing URL, username, or password")
		}

		// Cache the configuration
		if (!this.baseUrl || !this.auth) {
			this.baseUrl = registry.url.replace(/\/$/, "") // Remove trailing slash
			this.auth = Buffer.from(`${registry.username}:${registry.password}`).toString("base64")
		}
	}

	async hasRegistry(): Promise<boolean> {
		try {
			await this.initializeConfig()
			return true
		} catch (error) {
			if (error instanceof Error && error.message === "NO_REGISTRY_CONFIGURED") {
				return false
			}
			throw error
		}
	}

	private async makeRequest<T>(endpoint: string, customAccept?: string): Promise<T> {
		await this.initializeConfig()

		try {
			const response: AxiosResponse<T> = await axios.get(`${this.baseUrl}${endpoint}`, {
				headers: {
					Authorization: `Basic ${this.auth}`,
					Accept: customAccept || "application/json",
					"User-Agent": "Dokistry/1.0",
				},
				timeout: 10000,
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
		await this.initializeConfig()

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
					throw new Error("Manifest not found or already deleted")
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

	async testConnection(): Promise<{ success: boolean; error?: string }> {
		try {
			await this.initializeConfig()

			// Test basic connectivity
			await axios.get(`${this.baseUrl}/v2/`, {
				headers: {
					Authorization: `Basic ${this.auth}`,
					Accept: "application/json",
				},
				timeout: 5000,
			})

			return { success: true }
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			}
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

	async getTagWithSize(repositoryName: string, tag: string): Promise<TagWithSize> {
		try {
			const manifest = await this.getImageManifest(repositoryName, tag)

			// Handle different manifest formats
			let layers = manifest.layers || []
			let configSize = 0
			let totalSize = 0
			let compressedSize = 0
			let createdAt: string | undefined
			let configDigest: string | undefined

			if (manifest.schemaVersion === 1) {
				if (manifest.fsLayers && manifest.fsLayers.length > 0) {
					const uniqueBlobs = Array.from(new Set(manifest.fsLayers.map((l) => l.blobSum)))

					try {
						await this.initializeConfig()
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

				if (manifest.history && manifest.history.length > 0) {
					try {
						const compat = JSON.parse(manifest.history[0].v1Compatibility)
						if (compat?.created) {
							createdAt = compat.created
						}
					} catch {}
				}
			} else if (manifest.manifests && manifest.manifests.length > 0) {
				// Manifest list (multi-arch): fetch the first manifest to get layers and config
				try {
					const first = manifest.manifests[0]
					const actual = await this.makeRequest<ImageManifest>(
						`/v2/${repositoryName}/manifests/${first.digest}`,
					)
					layers = actual.layers || []
					if (actual.config?.size) configSize = actual.config.size
					configDigest = actual.config?.digest
				} catch {}
			} else {
				// Docker Registry v2 single manifest
				if (manifest.config?.size) {
					configSize = manifest.config.size
				}
				configDigest = manifest.config?.digest

				// Calculate total size from layers
				if (layers && layers.length > 0) {
					totalSize = layers.reduce((sum, layer) => sum + (layer.size || 0), 0)
					compressedSize = layers.reduce((sum, layer) => sum + (layer.size || 0), 0)
				}

				// Add config size to total
				totalSize += configSize
			}

			// If we have a config digest, fetch the image config blob to read created date
			if (!createdAt && configDigest) {
				try {
					await this.initializeConfig()
					interface DockerImageConfig {
						created?: string
						[key: string]: unknown
					}
					const response: AxiosResponse<DockerImageConfig> = await axios.get(
						`${this.baseUrl}/v2/${repositoryName}/blobs/${configDigest}`,
						{
							headers: {
								Authorization: `Basic ${this.auth}`,
								Accept: "application/vnd.docker.container.image.v1+json",
								"User-Agent": "Dokistry/1.0",
							},
							timeout: 10000,
						},
					)
					if (response.data?.created) {
						createdAt = response.data.created
					}
				} catch {}
			}

			return {
				name: tag,
				size: totalSize,
				compressedSize: compressedSize,
				estimatedDecompressedSize: Math.round(totalSize * ESTIMATED_DECOMPRESSION_RATIO),
				layers: layers.length,
				createdAt,
			}
		} catch (error) {
			console.error(`Failed to fetch size for ${repositoryName}:${tag}:`, error)
			return {
				name: tag,
				size: 0,
				compressedSize: 0,
				estimatedDecompressedSize: 0,
				layers: 0,
			}
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

	async getRepositoriesWithTags(): Promise<RegistryRepositoriesResponse> {
		try {
			const repositories = await this.getRepositories()
			const repositoriesWithTags: Repository[] = []

			for (const repoName of repositories) {
				try {
					const tags = await this.getRepositoryTags(repoName)

					// Get size information for each tag
					const tagsWithSize: TagWithSize[] = await Promise.all(
						tags.map(async (tag) => {
							try {
								return await this.getTagWithSize(repoName, tag)
							} catch (error) {
								console.warn(`Could not fetch size for ${repoName}:${tag}:`, error)
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

					// Calculate total size for the repository
					const totalSize = tagsWithSize.reduce((sum, tag) => sum + tag.size, 0)
					const totalCompressedSize = tagsWithSize.reduce((sum, tag) => sum + tag.compressedSize, 0)

					repositoriesWithTags.push({
						name: repoName,
						tags,
						tagsWithSize,
						totalSize,
						totalCompressedSize,
					})
				} catch (error) {
					console.warn(`Failed to fetch tags for repository ${repoName}:`, error)
					repositoriesWithTags.push({
						name: repoName,
						tags: [],
						tagsWithSize: [],
						totalSize: 0,
						totalCompressedSize: 0,
					})
				}
			}

			return { repositories: repositoriesWithTags }
		} catch (error) {
			console.error("Failed to fetch repositories with tags:", error)
			throw error
		}
	}

	async getManifestDigest(repositoryName: string, tag: string): Promise<string> {
		await this.initializeConfig()

		const endpoint = `/v2/${repositoryName}/manifests/${tag}`
		const url = `${this.baseUrl}${endpoint}`
		const headers = {
			Authorization: `Basic ${this.auth}`,
			Accept: MANIFEST_ACCEPT_HEADER,
			"User-Agent": "Dokistry/1.0",
		}

		const extractDigestFromHeaders = (
			responseHeaders: Record<string, string | string[] | undefined>,
		) => {
			const digestHeader = responseHeaders["docker-content-digest"]
			if (Array.isArray(digestHeader)) {
				return digestHeader[0]
			}
			return digestHeader ?? null
		}

		const convertAxiosHeaders = (
			axiosHeaders: Record<string, unknown> | unknown,
		): Record<string, string | string[] | undefined> => {
			const converted: Record<string, string | string[] | undefined> = {}
			if (!axiosHeaders || typeof axiosHeaders !== "object") {
				return converted
			}
			for (const [key, value] of Object.entries(axiosHeaders)) {
				if (value === null) {
					converted[key] = undefined
				} else if (typeof value === "string") {
					converted[key] = value
				} else if (Array.isArray(value)) {
					converted[key] = value.filter((v): v is string => typeof v === "string")
				}
			}
			return converted
		}

		try {
			const headResponse = await axios.head(url, {
				headers,
				timeout: 10000,
			})
			const digestFromHead = extractDigestFromHeaders(convertAxiosHeaders(headResponse.headers))
			if (digestFromHead) {
				return digestFromHead
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				// Some registries may not support HEAD for manifests; fall back to GET
				if (error.response?.status !== 405) {
					console.warn(
						`HEAD request for manifest digest failed for ${repositoryName}:${tag}: ${error.message}`,
					)
				}
			} else {
				console.warn(
					`HEAD request for manifest digest failed for ${repositoryName}:${tag}: ${String(error)}`,
				)
			}
		}

		try {
			const response = await axios.get(url, {
				headers,
				timeout: 10000,
				transformResponse: [(data: string) => data],
			})

			const digestFromHeaders = extractDigestFromHeaders(convertAxiosHeaders(response.headers))
			if (digestFromHeaders) {
				return digestFromHeaders
			}

			const rawBody =
				typeof response.data === "string" ? response.data : JSON.stringify(response.data)
			return `sha256:${createHash("sha256").update(rawBody, "utf8").digest("hex")}`
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error("Authentication failed: Invalid credentials")
				}
				if (error.response?.status === 403) {
					throw new Error("Access forbidden: Insufficient permissions")
				}
				if (error.response?.status === 404) {
					throw new Error(`Manifest not found for tag: ${tag}`)
				}
				if (error.code === "ECONNABORTED") {
					throw new Error("Registry request failed: timeout exceeded")
				}
				throw new Error(`Registry request failed: ${error.message}`)
			}
			throw new Error("Unknown error occurred while connecting to registry")
		}
	}

	async deleteTag(repositoryName: string, tag: string): Promise<void> {
		// First get the manifest digest
		const digest = await this.getManifestDigest(repositoryName, tag)

		// Delete using the digest
		await this.makeDeleteRequest(`/v2/${repositoryName}/manifests/${digest}`)
	}

	async deleteTags(
		repositoryName: string,
		tags: string[],
	): Promise<{ success: string[]; failed: { tag: string; error: string }[] }> {
		const results = { success: [] as string[], failed: [] as { tag: string; error: string }[] }

		for (const tag of tags) {
			try {
				await this.deleteTag(repositoryName, tag)
				results.success.push(tag)
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "Unknown error"
				results.failed.push({ tag, error: errorMessage })
			}
		}

		return results
	}
}

export const databaseRegistryService = new DatabaseRegistryService()
