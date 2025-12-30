"use client"

import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/app/_components/ui"
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/app/_components/ui/chart"
import type { Repository } from "@/utils/types/registry.interface"

interface DashboardBarChartProps {
	repositories: Repository[]
}

const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 B"
	const k = 1024
	const sizes = ["B", "KB", "MB", "GB", "TB"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

export default function DashboardBarChart({ repositories }: DashboardBarChartProps) {
	const t = useTranslations("dashboard")
	const chartData = useMemo(() => {
		return repositories
			.filter((repo) => repo.totalSize && repo.totalSize > 0)
			.map((repo) => ({
				name: repo.name,
				size: repo.totalSize || 0,
			}))
			.sort((a, b) => b.size - a.size)
			.slice(0, 10)
	}, [repositories])

	const chartConfig = {
		size: {
			label: t("size"),
			theme: {
				light: "oklch(0.24 0.06 248.5)",
				dark: "oklch(0.96 0.03 252)",
			},
		},
	} satisfies ChartConfig

	const totalSize = useMemo(() => {
		return chartData.reduce((sum, item) => sum + item.size, 0)
	}, [chartData])

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("distributionByRepository")}</CardTitle>
				<CardDescription>{t("distributionByRepositoryDescription")}</CardDescription>
			</CardHeader>
			<CardContent>
				{chartData.length > 0 ? (
					<ChartContainer config={chartConfig} className="h-[200px]">
						<BarChart accessibilityLayer data={chartData}>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="name"
								tickLine={false}
								tickMargin={5}
								axisLine={false}
								height={40}
								tick={{ fontSize: 10 }}
								tickFormatter={(value) => {
									const maxLength = 20
									return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value
								}}
							/>
							<ChartTooltip
								cursor={false}
								content={
									<ChartTooltipContent
										labelFormatter={(value) => `${t("repository")}: ${value}`}
										formatter={(value) => formatFileSize(Number(value))}
									/>
								}
							/>
							<Bar dataKey="size" fill="var(--color-size)" radius={8} maxBarSize={30} />
						</BarChart>
					</ChartContainer>
				) : (
					<div className="flex h-[150px] items-center justify-center text-muted-foreground">
						{t("noDataAvailable")}
					</div>
				)}
			</CardContent>
			<CardFooter className="flex-col items-start gap-2 text-sm">
				<div className="flex gap-2 leading-none font-medium">
					{chartData.length > 0
						? `${chartData.length} ${chartData.length === 1 ? t("repository") : t("repositoryPlural")} ${t("repositoriesDisplayed")}`
						: t("noRepositoryWithData")}
				</div>
				<div className="text-muted-foreground leading-none">
					{chartData.length > 0
						? `${t("total")}: ${formatFileSize(totalSize)}`
						: t("addImagesToSeeStats")}
				</div>
			</CardFooter>
		</Card>
	)
}
