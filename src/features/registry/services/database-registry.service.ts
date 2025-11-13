import axios, { type AxiosResponse } from "axios"
import { getCurrentSelectedRegistry } from "@/utils/lib/auth-actions"
import type {
	DockerRegistryCatalogResponse,
	DockerRegistryTagsResponse,
	ImageManifest,
	RegistryRepositoriesResponse,
	Repository,
	TagWithSize,
} from "@/utils/types/registry.interface"

class DatabaseRegistryService {
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
				timeout: 10000, // Increased timeout to 10 seconds
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
					throw new Error("Registry endpoint not found")
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
					Accept: "application/json",
				},
				timeout: 10000, // 10 second timeout for delete operations
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
					throw new Error("Registry endpoint not found")
				}
				if (error.code === "ECONNABORTED") {
					throw new Error("Registry request failed: timeout exceeded")
				}
				throw new Error(`Registry request failed: ${error.message}`)
			}
			throw new Error("Unknown error occurred while connecting to registry")
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

			// Check if this is Docker Registry v1 format (schema version 1)
			if (manifest.schemaVersion === 1) {
				// For v1 manifests, fetch actual blob sizes from the registry
				if (manifest.fsLayers && manifest.fsLayers.length > 0) {
					try {
						// Try to fetch actual blob sizes
						const blobSizes = await Promise.all(
							manifest.fsLayers.map(async (fsLayer) => {
								try {
									await this.initializeConfig()
									const headResponse = await axios.head(
										`${this.baseUrl}/v2/${repositoryName}/blobs/${fsLayer.blobSum}`,
										{
											headers: {
												Authorization: `Basic ${this.auth}`,
											},
											timeout: 5000,
										},
									)
									const contentLength = headResponse.headers["content-length"]
									return contentLength ? parseInt(contentLength, 10) : 0
								} catch {
									return 0
								}
							}),
						)

						totalSize = blobSizes.reduce((sum, size) => sum + size, 0)
						compressedSize = totalSize

						layers = manifest.fsLayers.map((fsLayer, index) => ({
							mediaType: "application/vnd.docker.image.rootfs.diff.tar.gzip",
							size: blobSizes[index],
							digest: fsLayer.blobSum,
						}))
					} catch {
						// Fallback to reasonable estimation if blob fetching fails
						// Use a much smaller per-layer estimate based on typical compressed layer sizes
						const estimatedSizePerLayer = 10 * 1024 * 1024 // 10MB per layer (more realistic)
						totalSize = manifest.fsLayers.length * estimatedSizePerLayer
						compressedSize = totalSize

						layers = manifest.fsLayers.map((fsLayer) => ({
							mediaType: "application/vnd.docker.image.rootfs.diff.tar.gzip",
							size: estimatedSizePerLayer,
							digest: fsLayer.blobSum,
						}))
					}
				}
				// Try to read created date from history[0].v1Compatibility
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
					const response: AxiosResponse<any> = await axios.get(
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
				layers: layers.length,
				createdAt,
			}
		} catch (error) {
			console.error(`Failed to fetch size for ${repositoryName}:${tag}:`, error)
			// Return a fallback size if we can't get the actual size
			return {
				name: tag,
				size: 0,
				compressedSize: 0,
				layers: 0,
			}
		}
	}

	async getImageManifest(repositoryName: string, tag: string): Promise<ImageManifest> {
		try {
			const response = await this.makeRequest<ImageManifest>(
				`/v2/${repositoryName}/manifests/${tag}`,
				"application/vnd.docker.distribution.manifest.v2+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.manifest.v1+json, application/vnd.oci.image.index.v1+json",
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
			Accept:
				"application/vnd.docker.distribution.manifest.v2+json, application/vnd.docker.distribution.manifest.list.v2+json",
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
			const response = await axios.get<ImageManifest>(url, {
				headers,
				timeout: 10000,
			})
			const digestFromHeaders = extractDigestFromHeaders(convertAxiosHeaders(response.headers))
			if (digestFromHeaders) {
				return digestFromHeaders
			}

			// As a last resort, fall back to manifest content digests if available
			if (response.data?.config?.digest) {
				return response.data.config.digest
			}
			if (response.data?.manifests && response.data.manifests.length > 0) {
				const manifestDigest = response.data.manifests.find((manifest) => manifest.digest)?.digest
				if (manifestDigest) {
					return manifestDigest
				}
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error("Authentication failed: Invalid credentials")
				}
				if (error.response?.status === 403) {
					throw new Error("Access forbidden: Insufficient permissions")
				}
				if (error.response?.status === 404) {
					throw new Error("Registry endpoint not found")
				}
				if (error.code === "ECONNABORTED") {
					throw new Error("Registry request failed: timeout exceeded")
				}
				throw new Error(`Registry request failed: ${error.message}`)
			}
			throw new Error("Unknown error occurred while connecting to registry")
		}

		throw new Error("Unable to extract digest from manifest")
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
