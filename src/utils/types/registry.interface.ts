export interface DockerRegistryCatalogResponse {
	repositories: string[]
}

export interface DockerRegistryTagsResponse {
	name: string
	tags: string[]
}

export interface ImageManifest {
	schemaVersion: number
	mediaType?: string
	config?: {
		mediaType?: string
		size?: number
		digest?: string
	}
	layers?: Array<{
		mediaType?: string
		size?: number
		digest?: string
	}>
	// Handle different manifest formats
	manifests?: Array<{
		mediaType?: string
		size?: number
		digest?: string
		platform?: {
			architecture?: string
			os?: string
		}
	}>
	// Docker Registry v1 format support
	name?: string
	tag?: string
	architecture?: string
	fsLayers?: Array<{
		blobSum: string
	}>
	history?: Array<{
		v1Compatibility: string
	}>
	signatures?: Array<{
		header: {
			jwk: {
				crv: string
				kid: string
				kty: string
				x: string
				y: string
			}
			alg: string
		}
		signature: string
		protected: string
	}>
}

export interface TagWithSize {
	name: string
	size: number
	compressedSize: number
	layers: number
	createdAt?: string
}

export interface Repository {
	name: string
	tags: string[]
	tagsWithSize?: TagWithSize[]
	totalSize?: number
	totalCompressedSize?: number
}

export interface Registry {
	id: string
	url: string
	username: string
	password: string
	userId: string
	createdAt: string
	updatedAt: string
}

export interface RegistryRepositoriesResponse {
	repositories: Repository[]
}

// Error response types
export interface RegistryErrorResponse {
	error: string
	message?: string
}

// Environment variables interface
export interface RegistryConfig {
	registryUrl: string
	username: string
	password: string
}

// Sidebar menu interfaces
export interface SidebarImage {
	title: string
	url: string
	isActive: boolean
	icon?: string
}

export interface SidebarMenuItem {
	title: string
	url: string
	isActive: boolean
	icon?: string
	items?: SidebarImage[]
}

export interface SidebarMenuData {
	navMain: SidebarMenuItem[]
}
