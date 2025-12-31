import type { Metadata } from "next"
import { NoRegistryEmptyState } from "@/app/_components/shared"
import { defaultRegistryService } from "@/features/registry"
import type { RegistryRepositoriesResponse, Repository } from "@/utils/types/registry.interface"
import ImageDetailsWrapper from "./_components/image-details-wrapper"

export const dynamic = "force-dynamic"

interface ImagePageProps {
	params: Promise<{
		image: string
	}>
}

export async function generateMetadata({ params }: ImagePageProps): Promise<Metadata> {
	const { image } = await params
	const imageName = decodeURIComponent(image)

	return {
		title: `📦 ${imageName}`,
	}
}

export default async function ImagePage({ params }: ImagePageProps) {
	const { image } = await params
	const imageName = decodeURIComponent(image)

	const hasRegistry = await defaultRegistryService.hasRegistry()

	if (!hasRegistry) {
		return (
			<main className="flex flex-1 items-center justify-center p-4">
				<NoRegistryEmptyState />
			</main>
		)
	}

	let repositoriesData: RegistryRepositoriesResponse = { repositories: [] }
	let error: string | null = null

	try {
		repositoriesData = await defaultRegistryService.getRepositoriesWithTags()
	} catch (err) {
		console.error("Failed to fetch registry data:", err)
		error = err instanceof Error ? err.message : "Failed to fetch registry data"
	}

	const emptyRepository = {
		name: imageName,
		tags: [],
	} as Repository
	const repository = repositoriesData.repositories.find((repo) => repo.name === imageName)

	return (
		<main className="flex flex-1 flex-col p-4">
			<div className="w-full">
				<ImageDetailsWrapper
					initialRepository={repository || emptyRepository}
					initialError={error}
					imageName={imageName}
				/>
			</div>
		</main>
	)
}
