import type {
	ImageManifest,
	RegistryRepositoriesResponse,
	TagWithSize,
} from "@/utils/types/registry.interface"

export interface IRegistryService {
	hasRegistry(): Promise<boolean>
	testConnection(): Promise<{ success: boolean; error?: string }>
	getRepositories(): Promise<string[]>
	getRepositoryTags(repositoryName: string): Promise<string[]>
	getTagWithSize(repositoryName: string, tag: string): Promise<TagWithSize>
	getImageManifest(repositoryName: string, tag: string): Promise<ImageManifest>
	getRepositoriesWithTags(): Promise<RegistryRepositoriesResponse>
	getManifestDigest(repositoryName: string, tag: string): Promise<string>
	deleteTag(repositoryName: string, tag: string): Promise<void>
	deleteTags(
		repositoryName: string,
		tags: string[],
	): Promise<{ success: string[]; failed: { tag: string; error: string }[] }>
}
