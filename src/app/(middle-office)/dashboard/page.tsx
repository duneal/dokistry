import { NoRegistryEmptyState } from "@/app/_components/shared"
import { databaseRegistryService } from "@/features/registry"
import type { Repository } from "@/utils/types/registry.interface"
import DashboardChart from "./_components/dashboard-chart"
import "./dashboard.scss"

export const dynamic = "force-dynamic"

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

	return (
		<main className="dashboard">
			<DashboardChart repositories={repositories} />
		</main>
	)
}
