"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { format, formatDistanceToNow } from "date-fns"
import { ArrowUpDown, CalendarDays, HardDrive, Tag } from "lucide-react"
import { Badge, Button, Checkbox, Table } from "@/app/_components/ui"
import type { Repository } from "@/utils/types/registry.interface"
import "./image-tags-table.scss"
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

// Utility function to format file sizes
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

	// If it's the day before yesterday or older, show the actual date
	if (diffInDays >= 2) {
		return format(date, "MMM d, yyyy")
	}

	// For recent dates (today and yesterday), use date-fns relative formatting
	return formatDistanceToNow(date, { addSuffix: true, includeSeconds: true })
}

const getTagVariant = (tag: TagWithDateAndSize) => {
	if (tag.isLatest) return "primary"
	if (tag.name.includes("dev") || tag.name.includes("test")) return "warning"
	if (tag.name.includes("prod") || tag.name.includes("stable")) return "primary"
	return "default"
}

export default function ImageTagsTable({
	repository,
	onSelectionChange,
	onDeleteTags,
	onRefresh,
}: ImageTagsTableProps) {
	const {
		selectedTags,
		isDeleting,
		processedManifestGroups,
		handleSelectionChange,
		handleClearSelection,
		handleDeleteTags,
	} = useImageTagsTable({ repository, onSelectionChange, onDeleteTags, onRefresh })

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
					aria-label="Select all"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => {
						row.toggleSelected(!!value)
					}}
					aria-label="Select row"
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
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="image-tags-table__sort-button"
				>
					<Tag className="image-tags-table__header__icon" size={16} />
					Tags
					<ArrowUpDown className="image-tags-table__sort-icon" size={14} />
				</Button>
			),
			cell: ({ row }) => (
				<div className="image-tags-table__tag-cell">
					<div className="image-tags-table__tags-container">
						{row.original.tags.map((tag) => (
							<Badge
								key={tag.name}
								variant={getTagVariant(tag)}
								className="image-tags-table__tag-badge"
							>
								{tag.name}
							</Badge>
						))}
					</div>
				</div>
			),
		},
		{
			accessorKey: "date",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="image-tags-table__sort-button"
				>
					<CalendarDays className="image-tags-table__header__icon" size={16} />
					Creation time
					<ArrowUpDown className="image-tags-table__sort-icon" size={14} />
				</Button>
			),
			cell: ({ row }) => {
				const value = row.getValue("date") as Date
				const isUnset = value instanceof Date && value.getTime() === 0
				return (
					<span className="image-tags-table__date">
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
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="image-tags-table__sort-button"
				>
					<HardDrive className="image-tags-table__header__icon" size={16} />
					Size
					<ArrowUpDown className="image-tags-table__sort-icon" size={14} />
				</Button>
			),
			cell: ({ row }) => <div>{formatFileSize(row.getValue("size"))}</div>,
		},
		// layers column removed per request
	]

	if (!repository) {
		return null
	}

	return (
		<div className="image-tags-table">
			<TagsActionBar
				selectedTags={selectedTags}
				onClearSelection={handleClearSelection}
				onDeleteTags={handleDeleteTags}
				isDeleting={isDeleting}
			/>
			<div className="image-tags-table__table-wrapper">
				<Table
					columns={columns}
					data={processedManifestGroups}
					enableSelection={true}
					onSelectionChange={handleSelectionChange}
					className="image-tags-table__table"
				/>
			</div>
		</div>
	)
}
