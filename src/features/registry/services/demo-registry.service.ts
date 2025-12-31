import type {
	ImageManifest,
	RegistryRepositoriesResponse,
	Repository,
	TagWithSize,
} from "@/utils/types/registry.interface"
import type { IRegistryService } from "./registry-service.interface"

const DEMO_LATENCY_MS = 150

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const generateDigest = (input: string): string => {
	const hash = input
		.split("")
		.reduce((acc, char) => {
			const hash = ((acc << 5) - acc + char.charCodeAt(0)) | 0
			return hash
		}, 0)
		.toString(16)
	return `sha256:${hash.padStart(64, "0")}`
}

const generateCreatedAt = (daysAgo: number): string => {
	const date = new Date()
	date.setDate(date.getDate() - daysAgo)
	return date.toISOString()
}

const DEMO_REPOSITORIES: Repository[] = [
	{
		name: "frontend/web-app",
		tags: ["latest", "v1.2.3", "v1.2.2", "v1.1.0", "dev"],
		tagsWithSize: [
			{
				name: "latest",
				size: 245 * 1024 * 1024,
				compressedSize: 89 * 1024 * 1024,
				layers: 12,
				createdAt: generateCreatedAt(2),
			},
			{
				name: "v1.2.3",
				size: 243 * 1024 * 1024,
				compressedSize: 87 * 1024 * 1024,
				layers: 12,
				createdAt: generateCreatedAt(5),
			},
			{
				name: "v1.2.2",
				size: 240 * 1024 * 1024,
				compressedSize: 85 * 1024 * 1024,
				layers: 11,
				createdAt: generateCreatedAt(12),
			},
			{
				name: "v1.1.0",
				size: 235 * 1024 * 1024,
				compressedSize: 82 * 1024 * 1024,
				layers: 10,
				createdAt: generateCreatedAt(30),
			},
			{
				name: "dev",
				size: 248 * 1024 * 1024,
				compressedSize: 91 * 1024 * 1024,
				layers: 13,
				createdAt: generateCreatedAt(0),
			},
		],
		totalSize: 1211 * 1024 * 1024,
		totalCompressedSize: 434 * 1024 * 1024,
	},
	{
		name: "backend/api-service",
		tags: ["latest", "v2.0.1", "v2.0.0", "v1.9.5", "staging"],
		tagsWithSize: [
			{
				name: "latest",
				size: 156 * 1024 * 1024,
				compressedSize: 52 * 1024 * 1024,
				layers: 8,
				createdAt: generateCreatedAt(1),
			},
			{
				name: "v2.0.1",
				size: 155 * 1024 * 1024,
				compressedSize: 51 * 1024 * 1024,
				layers: 8,
				createdAt: generateCreatedAt(4),
			},
			{
				name: "v2.0.0",
				size: 154 * 1024 * 1024,
				compressedSize: 50 * 1024 * 1024,
				layers: 8,
				createdAt: generateCreatedAt(8),
			},
			{
				name: "v1.9.5",
				size: 152 * 1024 * 1024,
				compressedSize: 49 * 1024 * 1024,
				layers: 7,
				createdAt: generateCreatedAt(20),
			},
			{
				name: "staging",
				size: 157 * 1024 * 1024,
				compressedSize: 53 * 1024 * 1024,
				layers: 9,
				createdAt: generateCreatedAt(0),
			},
		],
		totalSize: 774 * 1024 * 1024,
		totalCompressedSize: 255 * 1024 * 1024,
	},
	{
		name: "database/postgres",
		tags: ["15-alpine", "15", "14-alpine", "14"],
		tagsWithSize: [
			{
				name: "15-alpine",
				size: 78 * 1024 * 1024,
				compressedSize: 28 * 1024 * 1024,
				layers: 5,
				createdAt: generateCreatedAt(3),
			},
			{
				name: "15",
				size: 245 * 1024 * 1024,
				compressedSize: 95 * 1024 * 1024,
				layers: 6,
				createdAt: generateCreatedAt(7),
			},
			{
				name: "14-alpine",
				size: 76 * 1024 * 1024,
				compressedSize: 27 * 1024 * 1024,
				layers: 5,
				createdAt: generateCreatedAt(15),
			},
			{
				name: "14",
				size: 240 * 1024 * 1024,
				compressedSize: 93 * 1024 * 1024,
				layers: 6,
				createdAt: generateCreatedAt(25),
			},
		],
		totalSize: 639 * 1024 * 1024,
		totalCompressedSize: 243 * 1024 * 1024,
	},
	{
		name: "cache/redis",
		tags: ["7-alpine", "7", "6-alpine"],
		tagsWithSize: [
			{
				name: "7-alpine",
				size: 32 * 1024 * 1024,
				compressedSize: 12 * 1024 * 1024,
				layers: 4,
				createdAt: generateCreatedAt(2),
			},
			{
				name: "7",
				size: 118 * 1024 * 1024,
				compressedSize: 45 * 1024 * 1024,
				layers: 5,
				createdAt: generateCreatedAt(6),
			},
			{
				name: "6-alpine",
				size: 30 * 1024 * 1024,
				compressedSize: 11 * 1024 * 1024,
				layers: 4,
				createdAt: generateCreatedAt(18),
			},
		],
		totalSize: 180 * 1024 * 1024,
		totalCompressedSize: 68 * 1024 * 1024,
	},
	{
		name: "monitoring/prometheus",
		tags: ["latest", "v2.45.0", "v2.44.0"],
		tagsWithSize: [
			{
				name: "latest",
				size: 198 * 1024 * 1024,
				compressedSize: 72 * 1024 * 1024,
				layers: 7,
				createdAt: generateCreatedAt(1),
			},
			{
				name: "v2.45.0",
				size: 197 * 1024 * 1024,
				compressedSize: 71 * 1024 * 1024,
				layers: 7,
				createdAt: generateCreatedAt(5),
			},
			{
				name: "v2.44.0",
				size: 195 * 1024 * 1024,
				compressedSize: 70 * 1024 * 1024,
				layers: 7,
				createdAt: generateCreatedAt(14),
			},
		],
		totalSize: 590 * 1024 * 1024,
		totalCompressedSize: 213 * 1024 * 1024,
	},
	{
		name: "tools/nginx",
		tags: ["alpine", "latest", "1.25"],
		tagsWithSize: [
			{
				name: "alpine",
				size: 23 * 1024 * 1024,
				compressedSize: 8 * 1024 * 1024,
				layers: 3,
				createdAt: generateCreatedAt(1),
			},
			{
				name: "latest",
				size: 142 * 1024 * 1024,
				compressedSize: 55 * 1024 * 1024,
				layers: 4,
				createdAt: generateCreatedAt(2),
			},
			{
				name: "1.25",
				size: 141 * 1024 * 1024,
				compressedSize: 54 * 1024 * 1024,
				layers: 4,
				createdAt: generateCreatedAt(10),
			},
		],
		totalSize: 306 * 1024 * 1024,
		totalCompressedSize: 117 * 1024 * 1024,
	},
]

class DemoRegistryService implements IRegistryService {
	async hasRegistry(): Promise<boolean> {
		await delay(DEMO_LATENCY_MS)
		return true
	}

	async testConnection(): Promise<{ success: boolean; error?: string }> {
		await delay(DEMO_LATENCY_MS)
		return { success: true }
	}

	async getRepositories(): Promise<string[]> {
		await delay(DEMO_LATENCY_MS)
		return DEMO_REPOSITORIES.map((repo) => repo.name)
	}

	async getRepositoryTags(repositoryName: string): Promise<string[]> {
		await delay(DEMO_LATENCY_MS)
		const repository = DEMO_REPOSITORIES.find((repo) => repo.name === repositoryName)
		if (!repository) {
			throw new Error("Repository not found")
		}
		return repository.tags
	}

	async getTagWithSize(repositoryName: string, tag: string): Promise<TagWithSize> {
		await delay(DEMO_LATENCY_MS)
		const repository = DEMO_REPOSITORIES.find((repo) => repo.name === repositoryName)
		if (!repository) {
			throw new Error("Repository not found")
		}

		const tagWithSize = repository.tagsWithSize?.find((t) => t.name === tag)
		if (!tagWithSize) {
			throw new Error("Tag not found")
		}

		return tagWithSize
	}

	async getImageManifest(repositoryName: string, tag: string): Promise<ImageManifest> {
		await delay(DEMO_LATENCY_MS)
		const repository = DEMO_REPOSITORIES.find((repo) => repo.name === repositoryName)
		if (!repository) {
			throw new Error("Repository not found")
		}

		const tagWithSize = repository.tagsWithSize?.find((t) => t.name === tag)
		if (!tagWithSize) {
			throw new Error("Tag not found")
		}

		const digest = generateDigest(`${repositoryName}:${tag}`)
		const configDigest = generateDigest(`${repositoryName}:${tag}:config`)

		const layers = Array.from({ length: tagWithSize.layers }, (_, i) => ({
			mediaType: "application/vnd.docker.image.rootfs.diff.tar.gzip",
			size: Math.floor(tagWithSize.size / tagWithSize.layers),
			digest: generateDigest(`${repositoryName}:${tag}:layer:${i}`),
		}))

		return {
			schemaVersion: 2,
			mediaType: "application/vnd.docker.distribution.manifest.v2+json",
			config: {
				mediaType: "application/vnd.docker.container.image.v1+json",
				size: 5000,
				digest: configDigest,
			},
			layers,
		}
	}

	async getRepositoriesWithTags(): Promise<RegistryRepositoriesResponse> {
		await delay(DEMO_LATENCY_MS)
		return { repositories: DEMO_REPOSITORIES }
	}

	async getManifestDigest(repositoryName: string, tag: string): Promise<string> {
		await delay(DEMO_LATENCY_MS)
		const repository = DEMO_REPOSITORIES.find((repo) => repo.name === repositoryName)
		if (!repository) {
			throw new Error("Repository not found")
		}

		const tagExists = repository.tags.includes(tag)
		if (!tagExists) {
			throw new Error("Tag not found")
		}

		return generateDigest(`${repositoryName}:${tag}`)
	}

	async deleteTag(repositoryName: string, tag: string): Promise<void> {
		await delay(DEMO_LATENCY_MS)
		const repository = DEMO_REPOSITORIES.find((repo) => repo.name === repositoryName)
		if (!repository) {
			throw new Error("Repository not found")
		}

		const tagExists = repository.tags.includes(tag)
		if (!tagExists) {
			throw new Error("Tag not found")
		}

		return Promise.resolve()
	}

	async deleteTags(
		repositoryName: string,
		tags: string[],
	): Promise<{ success: string[]; failed: { tag: string; error: string }[] }> {
		await delay(DEMO_LATENCY_MS)
		const repository = DEMO_REPOSITORIES.find((repo) => repo.name === repositoryName)
		if (!repository) {
			return {
				success: [],
				failed: tags.map((tag) => ({ tag, error: "Repository not found" })),
			}
		}

		const results = { success: [] as string[], failed: [] as { tag: string; error: string }[] }

		for (const tag of tags) {
			const tagExists = repository.tags.includes(tag)
			if (tagExists) {
				results.success.push(tag)
			} else {
				results.failed.push({ tag, error: "Tag not found" })
			}
		}

		return results
	}
}

export const demoRegistryService = new DemoRegistryService()
