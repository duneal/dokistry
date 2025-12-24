import { NoRegistryEmptyState } from "@/app/_components/shared"
import { databaseRegistryService } from "@/features/registry"
import type { Repository } from "@/utils/types/registry.interface"
import DashboardBarChart from "./_components/dashboard-bar-chart"
import DashboardStatsCards from "./_components/dashboard-stats-cards"

export const dynamic = "force-dynamic"

export default async function Dashboard() {
	const hasRegistry = await databaseRegistryService.hasRegistry()

	if (!hasRegistry) {
		return (
			<main className="flex flex-1 items-center justify-center p-4">
				<NoRegistryEmptyState />
			</main>
		)
	}

	const data = await databaseRegistryService.getRepositoriesWithTags()
	const repositories = data.repositories as Repository[]

	return (
		<main className="flex flex-col gap-6 p-4">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground">
					Vue d&apos;ensemble de vos repositories Docker et statistiques de stockage
				</p>
			</div>
			<DashboardStatsCards repositories={repositories} />
			<DashboardBarChart repositories={repositories} />
		</main>
	)
}
