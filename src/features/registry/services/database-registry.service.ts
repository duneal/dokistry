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

	private async makeRequest<T>(endpoint: string): Promise<T> {
		await this.initializeConfig()

		try {
			const response: AxiosResponse<T> = await axios.get(`${this.baseUrl}${endpoint}`, {
				headers: {
					Authorization: `Basic ${this.auth}`,
					Accept: "application/json",
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
			const layers = manifest.layers || []
			let configSize = 0
			let totalSize = 0
			let compressedSize = 0

			// Check if this is Docker Registry v1 format (schema version 1)
			if (manifest.schemaVersion === 1) {
				// For v1 manifests, we can't easily get exact sizes without additional API calls
				// Instead, we'll use a reasonable estimation based on the number of layers
				if (manifest.fsLayers && manifest.fsLayers.length > 0) {
					// Estimate size based on number of layers
					// Docker images typically range from 100MB to 2GB, with most being 200-800MB
					const estimatedSizePerLayer = 150 * 1024 * 1024 // 150MB per layer
					totalSize = manifest.fsLayers.length * estimatedSizePerLayer
					compressedSize = Math.floor(totalSize * 0.7) // Assume 70% compression ratio
				}
			} else {
				// Docker Registry v2 format (schema version 2)
				if (manifest.config?.size) {
					configSize = manifest.config.size
				}

				// Calculate total size from layers
				if (layers && layers.length > 0) {
					totalSize = layers.reduce((sum, layer) => sum + (layer.size || 0), 0)
					compressedSize = layers.reduce((sum, layer) => sum + (layer.size || 0), 0)
				}

				// Add config size to total
				totalSize += configSize
			}

			return {
				name: tag,
				size: totalSize,
				compressedSize: compressedSize,
				layers: layers.length,
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

		try {
			const headResponse = await axios.head(url, {
				headers,
				timeout: 10000,
			})
			const digestFromHead = extractDigestFromHeaders(headResponse.headers)
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
			const digestFromHeaders = extractDigestFromHeaders(response.headers)
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
