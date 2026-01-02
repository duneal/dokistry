"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { format, formatDistanceToNow } from "date-fns"
import {
	ArrowUpDown,
	CalendarDays,
	HardDrive,
	MoreHorizontal,
	Search,
	Tag,
	Trash2,
} from "lucide-react"
import { useTranslations } from "next-intl"
import * as React from "react"
import {
	Badge,
	Button,
	Checkbox,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Input,
	Table,
} from "@/app/_components/ui"
import type { Repository } from "@/utils/types/registry.interface"
import TagsActionBar from "./tags-action-bar"
import {
	type ManifestGroup,
	type TagWithDateAndSize,
	useImageTagsTable,
} from "./use-image-tags-table"

interface ImageTagsTableProps {
	repository: Repository | undefined
	onSelectionChange?: (selectedTags: string[]) => void
	onDeleteTags?: (tags: string[]) => Promise<void>
	onRefresh?: () => void
}

const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 B"

	const k = 1024
	const sizes = ["B", "KB", "MB", "GB", "TB"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))

	return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

const formatRelativeTime = (date: Date) => {
	const now = new Date()
	const diffInMs = now.getTime() - date.getTime()
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

	if (diffInDays >= 2) {
		return format(date, "MMM d, yyyy")
	}

	return formatDistanceToNow(date, { addSuffix: true, includeSeconds: true })
}

const getTagVariant = (tag: TagWithDateAndSize) => {
	if (tag.isLatest) return "default"
	if (tag.name.includes("dev") || tag.name.includes("test")) return "warning"
	if (tag.name.includes("prod") || tag.name.includes("stable")) return "default"
	return "secondary"
}

export default function ImageTagsTable({
	repository,
	onSelectionChange,
	onDeleteTags,
	onRefresh,
}: ImageTagsTableProps) {
	const [filterValue, setFilterValue] = React.useState("")
	const {
		selectedTags,
		isDeleting,
		processedManifestGroups,
		handleSelectionChange,
		handleClearSelection,
		handleDeleteTags,
	} = useImageTagsTable({ repository, onSelectionChange, onDeleteTags, onRefresh })
	const t = useTranslations("images")
	const tCommon = useTranslations("common")

	const columns: ColumnDef<ManifestGroup>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected()
							? true
							: table.getIsSomePageRowsSelected()
								? "indeterminate"
								: false
					}
					onCheckedChange={(value) => {
						table.toggleAllPageRowsSelected(!!value)
					}}
					aria-label={tCommon("selectAll")}
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => {
						row.toggleSelected(!!value)
					}}
					aria-label={tCommon("selectRow")}
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "tags",
			header: ({ column }) => (
				<Button
					variant="ghost"
					size="xs"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="-ml-4 my-1"
				>
					<Tag className="size-4" />
					{t("tags")}
					<ArrowUpDown className="ml-2 size-3" />
				</Button>
			),
			cell: ({ row }) => (
				<div className="flex flex-wrap gap-1.5">
					{row.original.tags.map((tag) => (
						<Badge key={tag.name} variant={getTagVariant(tag)}>
							{tag.name}
						</Badge>
					))}
				</div>
			),
			filterFn: (row, _id, value) => {
				const tags = row.original.tags as TagWithDateAndSize[]
				const searchValue = (value as string)?.toLowerCase() || ""
				if (!searchValue) return true
				return tags.some((tag) => tag.name.toLowerCase().includes(searchValue))
			},
		},
		{
			accessorKey: "date",
			header: ({ column }) => (
				<Button
					variant="ghost"
					size="xs"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="-ml-4"
				>
					<CalendarDays className="size-4" />
					{t("creationTime")}
					<ArrowUpDown className="ml-2 size-3" />
				</Button>
			),
			cell: ({ row }) => {
				const value = row.getValue("date") as Date
				const isUnset = value instanceof Date && value.getTime() === 0
				return (
					<span className="text-sm text-muted-foreground">
						{!value || isUnset ? "-" : formatRelativeTime(value)}
					</span>
				)
			},
		},
		{
			accessorKey: "size",
			header: ({ column }) => (
				<Button
					variant="ghost"
					size="xs"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="-ml-4"
				>
					<HardDrive className="size-4" />
					{t("size")}
					<ArrowUpDown className="ml-2 size-3" />
				</Button>
			),
			cell: ({ row }) => <span className="text-sm">{formatFileSize(row.getValue("size"))}</span>,
		},
		{
			id: "actions",
			enableHiding: false,
			cell: ({ row }) => {
				const manifestGroup = row.original
				const tagNames = manifestGroup.tags.map((tag) => tag.name)

				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-6 w-8 p-0">
								<span className="sr-only">{t("openMenu")}</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => handleDeleteTags(tagNames)}
								disabled={isDeleting}
								className="text-destructive focus:text-destructive"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								{tCommon("delete")}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)
			},
		},
	]

	if (!repository) {
		return null
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center py-4 m-0">
				<div className="relative max-w-sm">
					<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder={t("filterTags")}
						value={filterValue}
						onChange={(event) => setFilterValue(event.target.value)}
						className="pl-9"
					/>
				</div>
			</div>
			<div className="relative">
				<TagsActionBar
					selectedTags={selectedTags}
					onClearSelection={handleClearSelection}
					onDeleteTags={handleDeleteTags}
					isDeleting={isDeleting}
				/>
				<Table
					columns={columns}
					data={processedManifestGroups}
					enableSelection={true}
					enablePagination={true}
					onSelectionChange={handleSelectionChange}
					emptyMessage={t("noTagsFound")}
					filterColumn="tags"
					filterValue={filterValue}
					defaultSorting={[{ id: "date", desc: true }]}
				/>
			</div>
		</div>
	)
}
