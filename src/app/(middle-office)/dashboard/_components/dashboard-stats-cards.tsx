"use client"

import { HardDrive, Package, Tag } from "lucide-react"
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
					<CardDescription>Images/dépôts</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums md:text-3xl">
						{repositories.length.toLocaleString()}
					</CardTitle>
					<CardAction>
						<Badge variant="outline" className="inline-flex items-center gap-2 py-1">
							<Package className="size-3.5" />
							Images/dépôts
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">Total des images/dépôts</div>
					<div className="text-muted-foreground">Nombre total d'images Docker</div>
				</CardFooter>
			</Card>

			<Card className="shadow-xs">
				<CardHeader className="pb-4">
					<CardDescription>Tags</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums md:text-3xl">
						{totalImages.toLocaleString()}
					</CardTitle>
					<CardAction>
						<Badge variant="outline" className="inline-flex items-center gap-2 py-1">
							<Tag className="size-3.5" />
							Tags
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">Total des tags</div>
					<div className="text-muted-foreground">Toutes les tags de tous les images</div>
				</CardFooter>
			</Card>

			<Card className="shadow-xs">
				<CardHeader className="pb-4">
					<CardDescription>Stockage</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums md:text-3xl">
						{formatFileSize(totalSize)}
					</CardTitle>
					<CardAction>
						<Badge variant="outline" className="inline-flex items-center gap-2 py-1">
							<HardDrive className="size-3.5" />
							Stockage
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">Espace utilisé</div>
					<div className="text-muted-foreground">Taille totale de toutes les images réunies</div>
				</CardFooter>
			</Card>
		</div>
	)
}
