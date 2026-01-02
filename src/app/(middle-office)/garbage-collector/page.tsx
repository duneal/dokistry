import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { GarbageCollectorCards } from "./_components/garbage-collector-cards"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("garbageCollector")
	return {
		title: t("title"),
		description: t("description"),
	}
}

export default async function GarbageCollector() {
	const t = await getTranslations("garbageCollector")

	return (
		<main className="flex flex-col gap-6 p-4">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
				<p className="text-muted-foreground">{t("description")}</p>
			</div>
			<GarbageCollectorCards />
		</main>
	)
}
