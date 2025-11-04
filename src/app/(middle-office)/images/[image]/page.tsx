import type { Metadata } from "next"
import { NoRegistryEmptyState } from "@/app/_components/shared"
import { databaseRegistryService } from "@/features/registry"
import type { RegistryRepositoriesResponse, Repository } from "@/utils/types/registry.interface"
import ImageDetailsWrapper from "./_components/image-details-wrapper"
import "./image.scss"

interface ImagePageProps {
	params: {
		image: string
	}
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

	const hasRegistry = await databaseRegistryService.hasRegistry()

	if (!hasRegistry) {
		return (
			<main className="image-page">
				<div className="image-page__container">
					<NoRegistryEmptyState />
				</div>
			</main>
		)
	}

	let repositoriesData: RegistryRepositoriesResponse = { repositories: [] }
	let error: string | null = null

	try {
		repositoriesData = await databaseRegistryService.getRepositoriesWithTags()
	} catch (err) {
		console.error("Failed to fetch registry data:", err)
		error = err instanceof Error ? err.message : "Failed to fetch registry data"
	}

	// Find the specific repository
	const emptyRepository = {
		name: imageName,
		tags: [],
	} as Repository
	const repository = repositoriesData.repositories.find((repo) => repo.name === imageName)

	return (
		<main className="image-page">
			<div className="image-page__container">
				<ImageDetailsWrapper
					initialRepository={repository || emptyRepository}
					initialError={error}
					imageName={imageName}
				/>
			</div>
		</main>
	)
}
