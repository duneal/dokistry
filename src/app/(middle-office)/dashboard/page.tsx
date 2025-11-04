import { Package } from "lucide-react"
import Link from "next/link"
import { NoRegistryEmptyState } from "@/app/_components/shared"
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui"
import { databaseRegistryService } from "@/features/registry"
import type { Repository } from "@/utils/types/registry.interface"
import DashboardChart from "./_components/dashboard-chart"
import "./dashboard.scss"

export default async function Dashboard() {
	const hasRegistry = await databaseRegistryService.hasRegistry()

	if (!hasRegistry) {
		return (
			<main className="dashboard dashboard--empty">
				<NoRegistryEmptyState />
			</main>
		)
	}

	const data = await databaseRegistryService.getRepositoriesWithTags()
	const repositories = data.repositories as Repository[]

	// Get the 10 latest images based on repository activity
	// For now, we'll use repositories with the most tags as a proxy for "latest activity"
	const latestImages = repositories
		.filter((repo) => repo.tags && repo.tags.length > 0)
		.sort((a, b) => {
			// Sort by number of tags (more tags = more recent activity)
			const tagCountDiff = (b.tags?.length || 0) - (a.tags?.length || 0)
			if (tagCountDiff !== 0) return tagCountDiff

			// If same tag count, sort alphabetically
			return a.name.localeCompare(b.name)
		})
		.slice(0, 10)

	// Helper function to get the latest tag for a repository
	const _getLatestTag = (repo: Repository): string => {
		if (!repo.tags || repo.tags.length === 0) return "no-tags"

		// Look for 'latest' tag first
		if (repo.tags.includes("latest")) return "latest"

		// Otherwise, return the first tag (they're already sorted)
		return repo.tags[0]
	}

	// Static time for all images
	const staticTime = "Updated 2 days ago"

	return (
		<main className="dashboard">
			<Card className="dashboard__card">
				<CardHeader className="dashboard__card__header">
					<div className="dashboard__card__header__content">
						<CardTitle>
							<Package />
							Images
						</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="dashboard__card__content">
					{latestImages.length > 0 ? (
						latestImages.map((repo) => (
							<Link
								key={repo.name}
								href={`/images/${encodeURIComponent(repo.name)}`}
								className="dashboard__card__content__image"
							>
								<Badge>{repo.name}</Badge>
								<span className="dashboard__card__content__image__date">{staticTime}</span>
							</Link>
						))
					) : (
						<div className="dashboard__card__content__empty">
							<p>No images found in the registry</p>
						</div>
					)}
				</CardContent>
			</Card>
			<DashboardChart repositories={repositories} />
		</main>
	)
}
