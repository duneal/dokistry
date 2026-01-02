"use client"

import {
	AlertTriangle,
	CheckCircle,
	Clock,
	Code,
	Copy,
	Loader2,
	Search,
	XCircle,
} from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/app/_components/ui/card"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/app/_components/ui/dialog"
import { Input } from "@/app/_components/ui/input"
import { getScript } from "@/features/garbage-collector/actions/get-script"

type DeploymentType = "docker" | "docker-no-restart" | "dokploy" | "coolify"

type DeploymentStatus = "available" | "notAvailable" | "notYetDeveloped" | "inDevelopment"

interface DeploymentConfig {
	type: DeploymentType
	status: DeploymentStatus
}

const deploymentConfigs: DeploymentConfig[] = [
	{ type: "docker", status: "available" },
	{ type: "docker-no-restart", status: "available" },
	{ type: "dokploy", status: "notYetDeveloped" },
	{ type: "coolify", status: "notYetDeveloped" },
]

const getScriptLocal = (type: DeploymentType): string => {
	switch (type) {
		case "dokploy":
			return `dokploy exec registry registry garbage-collect --delete-untagged /etc/docker/registry/config.yml`
		case "coolify":
			return `coolify exec registry registry garbage-collect --delete-untagged /etc/docker/registry/config.yml`
		default:
			return ""
	}
}

const getStatusVariant = (
	status: DeploymentStatus,
): "success" | "warning" | "destructive" | "secondary" => {
	switch (status) {
		case "available":
			return "success"
		case "notAvailable":
			return "destructive"
		case "notYetDeveloped":
			return "warning"
		case "inDevelopment":
			return "secondary"
		default:
			return "secondary"
	}
}

const getStatusIcon = (status: DeploymentStatus) => {
	switch (status) {
		case "available":
			return <CheckCircle className="size-3" />
		case "notAvailable":
			return <XCircle className="size-3" />
		case "notYetDeveloped":
			return <Clock className="size-3" />
		case "inDevelopment":
			return <Code className="size-3" />
		default:
			return null
	}
}

const getLogoPath = (type: DeploymentType): string => {
	if (type === "docker-no-restart") {
		return `/images/registry-setup/docker.svg`
	}
	return `/images/registry-setup/${type}.svg`
}

export function GarbageCollectorCards() {
	const t = useTranslations("garbageCollector")
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedType, setSelectedType] = useState<DeploymentType | null>(null)
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [scriptContent, setScriptContent] = useState<string>("")
	const [isLoadingScript, setIsLoadingScript] = useState(false)
	const [scriptError, setScriptError] = useState<string | null>(null)

	const filteredDeployments = useMemo(() => {
		if (!searchQuery.trim()) {
			return deploymentConfigs
		}
		const query = searchQuery.toLowerCase()
		return deploymentConfigs.filter((config) => {
			const title = t(`${config.type}.title`).toLowerCase()
			const description = t(`${config.type}.description`).toLowerCase()
			return title.includes(query) || description.includes(query)
		})
	}, [searchQuery, t])

	const handleCardClick = (type: DeploymentType, status: DeploymentStatus) => {
		if (status !== "available") {
			return
		}
		setSelectedType(type)
		setIsDialogOpen(true)
	}

	useEffect(() => {
		if (!isDialogOpen || !selectedType) {
			return
		}

		if (selectedType === "docker" || selectedType === "docker-no-restart") {
			setIsLoadingScript(true)
			setScriptError(null)
			setScriptContent("")

			getScript(selectedType)
				.then((result) => {
					if ("error" in result) {
						setScriptError(result.error)
					} else {
						setScriptContent(result.content)
					}
					setIsLoadingScript(false)
				})
				.catch((error) => {
					console.error("Error loading script:", error)
					setScriptError("Failed to load script")
					setIsLoadingScript(false)
				})
		} else {
			setScriptContent(getScriptLocal(selectedType))
		}
	}, [isDialogOpen, selectedType])

	const handleCopyScript = async (
		type: DeploymentType,
		status: DeploymentStatus,
		event?: React.MouseEvent,
	) => {
		if (event) {
			event.stopPropagation()
		}
		if (status !== "available") {
			return
		}
		const script =
			type === "docker" || type === "docker-no-restart" ? scriptContent : getScriptLocal(type)
		if (!script) {
			toast.error(t("scriptCopyFailed"))
			return
		}
		try {
			await navigator.clipboard.writeText(script)
			toast.success(t("scriptCopied"))
		} catch {
			toast.error(t("scriptCopyFailed"))
		}
	}

	return (
		<>
			<div>
				<div className="relative max-w-sm">
					<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="search"
						placeholder={t("searchPlaceholder")}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{filteredDeployments.map((config) => (
					<Card
						key={config.type}
						className={`relative transition-all ${
							config.status === "available"
								? "cursor-pointer hover:shadow-lg"
								: "cursor-not-allowed opacity-75"
						}`}
						onClick={() => handleCardClick(config.type, config.status)}
					>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-2 pb-2">
										<Image
											src={getLogoPath(config.type)}
											alt={t(`${config.type}.title`)}
											width={24}
											height={24}
											className="shrink-0"
										/>
										<CardTitle>{t(`${config.type}.title`)}</CardTitle>
									</div>
									<CardDescription>{t(`${config.type}.description`)}</CardDescription>
								</div>
								{config.status === "available" && (
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 shrink-0"
										onClick={(e) => handleCopyScript(config.type, config.status, e)}
										title={t("copyScript")}
									>
										<Copy className="size-4" />
									</Button>
								)}
							</div>
						</CardHeader>
						<CardContent>
							<Badge variant={getStatusVariant(config.status)} size="sm" className="gap-1.5">
								{getStatusIcon(config.status)}
								{t(`status.${config.status}`)}
							</Badge>
						</CardContent>
					</Card>
				))}
			</div>

			{filteredDeployments.length === 0 && (
				<div className="py-8 text-center text-muted-foreground">{t("noResults")}</div>
			)}

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
					<DialogHeader>
						<DialogTitle>{t("scriptDialog.title")}</DialogTitle>
						<DialogDescription>{t("scriptDialog.description")}</DialogDescription>
					</DialogHeader>
					{selectedType && (
						<div className="space-y-4 flex flex-col min-h-0">
							{selectedType === "docker-no-restart" && (
								<div className="flex items-start gap-3 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
									<AlertTriangle className="size-5 shrink-0 text-yellow-600 dark:text-yellow-500 mt-0.5" />
									<div className="flex-1 space-y-1">
										<p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
											{t("docker-no-restart.warning.title")}
										</p>
										<p className="text-sm text-yellow-800 dark:text-yellow-300">
											{t("docker-no-restart.warning.description")}
										</p>
									</div>
								</div>
							)}
							<div className="relative rounded-md bg-muted p-4 overflow-auto max-h-[40vh]">
								{(selectedType === "docker" || selectedType === "docker-no-restart") &&
									!isLoadingScript &&
									!scriptError && (
										<Button
											variant="ghost"
											size="icon"
											className="absolute right-2 top-2 h-8 w-8 shrink-0 z-10"
											onClick={() => {
												const config = deploymentConfigs.find((c) => c.type === selectedType)
												if (config) {
													handleCopyScript(selectedType, config.status)
												}
											}}
											title={t("copyScript")}
										>
											<Copy className="size-4" />
										</Button>
									)}
								{(selectedType === "docker" || selectedType === "docker-no-restart") &&
									isLoadingScript && (
										<div className="flex items-center justify-center py-8">
											<Loader2 className="size-6 animate-spin text-muted-foreground" />
										</div>
									)}
								{(selectedType === "docker" || selectedType === "docker-no-restart") &&
									scriptError && (
										<div className="py-8 text-center text-destructive">{scriptError}</div>
									)}
								{(selectedType === "docker" || selectedType === "docker-no-restart") &&
									!isLoadingScript &&
									!scriptError && (
										<pre className="overflow-x-auto text-sm">
											<code>{scriptContent}</code>
										</pre>
									)}
								{selectedType !== "docker" && selectedType !== "docker-no-restart" && (
									<pre className="overflow-x-auto text-sm">
										<code>{getScriptLocal(selectedType)}</code>
									</pre>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	)
}
