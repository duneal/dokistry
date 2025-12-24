import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { NoRegistryEmptyState } from "@/app/_components/shared"
import { databaseRegistryService } from "@/features/registry"
import type { Repository } from "@/utils/types/registry.interface"
import DashboardBarChart from "./_components/dashboard-bar-chart"
import DashboardStatsCards from "./_components/dashboard-stats-cards"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("dashboard")
	return {
		title: t("title"),
		description: t("description"),
	}
}

export default async function Dashboard() {
	const t = await getTranslations("dashboard")
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
				<h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
				<p className="text-muted-foreground">{t("description")}</p>
			</div>
			<DashboardStatsCards repositories={repositories} />
			<DashboardBarChart repositories={repositories} />
		</main>
	)
}
