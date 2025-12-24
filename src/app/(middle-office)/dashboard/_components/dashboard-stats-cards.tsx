"use client"

import { HardDrive, Package, Tag } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import {
	Badge,
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/app/_components/ui"
import type { Repository } from "@/utils/types/registry.interface"

interface DashboardStatsCardsProps {
	repositories: Repository[]
}

const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 B"
	const k = 1024
	const sizes = ["B", "KB", "MB", "GB", "TB"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

export default function DashboardStatsCards({ repositories }: DashboardStatsCardsProps) {
	const t = useTranslations("dashboard")
	const totalImages = useMemo(() => {
		return repositories.reduce((sum, repo) => sum + repo.tags.length, 0)
	}, [repositories])

	const totalSize = useMemo(() => {
		return repositories.reduce((sum, repo) => sum + (repo.totalSize || 0), 0)
	}, [repositories])

	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
			<Card className="shadow-xs">
				<CardHeader className="pb-4">
					<CardDescription>{t("repositories")}</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums md:text-3xl">
						{repositories.length.toLocaleString()}
					</CardTitle>
					<CardAction>
						<Badge variant="outline" className="inline-flex items-center gap-2 py-1">
							<Package className="size-3.5" />
							{t("repositories")}
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">{t("totalRepositories")}</div>
					<div className="text-muted-foreground">{t("totalRepositoriesDescription")}</div>
				</CardFooter>
			</Card>

			<Card className="shadow-xs">
				<CardHeader className="pb-4">
					<CardDescription>{t("totalTags")}</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums md:text-3xl">
						{totalImages.toLocaleString()}
					</CardTitle>
					<CardAction>
						<Badge variant="outline" className="inline-flex items-center gap-2 py-1">
							<Tag className="size-3.5" />
							{t("totalTags")}
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">{t("totalTags")}</div>
					<div className="text-muted-foreground">{t("totalTagsDescription")}</div>
				</CardFooter>
			</Card>

			<Card className="shadow-xs">
				<CardHeader className="pb-4">
					<CardDescription>{t("storageUsed")}</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums md:text-3xl">
						{formatFileSize(totalSize)}
					</CardTitle>
					<CardAction>
						<Badge variant="outline" className="inline-flex items-center gap-2 py-1">
							<HardDrive className="size-3.5" />
							{t("storageUsed")}
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">{t("storageUsed")}</div>
					<div className="text-muted-foreground">{t("storageUsedDescription")}</div>
				</CardFooter>
			</Card>
		</div>
	)
}
