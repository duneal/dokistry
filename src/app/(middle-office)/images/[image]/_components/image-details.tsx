"use client"

import { HardDrive, Tag } from "lucide-react"
import { redirect } from "next/navigation"
import { useCallback } from "react"
import { toast } from "sonner"
import { Badge } from "@/app/_components/ui"
import type { Repository } from "@/utils/types/registry.interface"
import ImageTagsTable from "./image-tags-table"

interface ImageDetailsProps {
	repository: Repository | undefined
	error: string | null
	imageName: string
	onRefresh?: () => void
}

const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 B"

	const k = 1024
	const sizes = ["B", "KB", "MB", "GB", "TB"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))

	return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

export default function ImageDetails({ repository, imageName, onRefresh }: ImageDetailsProps) {
	const handleTagSelection = useCallback((_selectedTags: string[]) => {}, [])

	const handleDeleteTags = useCallback(
		async (tags: string[]) => {
			try {
				const response = await fetch(`/api/registry/repositories/${imageName}/tags`, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ tags }),
				})

				if (!response.ok) {
					const errorData = await response.json()
					throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
				}

				const result = await response.json()

				if (result.summary.successful > 0) {
					toast.success(`Successfully deleted ${result.summary.successful} tag(s)`, {
						description: result.deleted.join(", "),
						duration: 4000,
					})
				}

				if (result.summary.failed > 0) {
					result.failed.forEach((failure: { tag: string; error: string }) => {
						toast.error(`Failed to delete tag: ${failure.tag}`, {
							description: failure.error,
							duration: 6000,
						})
					})
				}

				if (result.summary.failed > 0 && result.summary.successful > 0) {
					toast.warning(`Partial deletion completed`, {
						description: `${result.summary.successful} succeeded, ${result.summary.failed} failed`,
						duration: 5000,
					})
				}

				if (onRefresh && result.summary.successful > 0) {
					onRefresh()
				}
			} catch (error) {
				console.error("Failed to delete tags:", error)
				const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

				toast.error("Failed to delete tags", {
					description: errorMessage,
					duration: 6000,
				})

				throw error
			}
		},
		[imageName, onRefresh],
	)

	if (!repository) {
		redirect("/")
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight pb-1">{repository.name}</h1>
					<div className="flex flex-wrap gap-2">
						<Badge variant="secondary" size="md" className="flex items-center gap-1.5">
							<Tag className="size-3.5" />
							{repository.tags.length} tag
							{repository.tags.length !== 1 ? "s" : ""}
						</Badge>
						<Badge variant="secondary" size="md" className="flex items-center gap-1.5">
							<HardDrive className="size-3.5" />
							{formatFileSize(repository.totalSize || 0)}
						</Badge>
					</div>
				</div>
			</div>

			<ImageTagsTable
				repository={repository}
				onSelectionChange={handleTagSelection}
				onDeleteTags={handleDeleteTags}
				onRefresh={onRefresh}
			/>
		</div>
	)
}
