import { useCallback, useEffect, useMemo, useState } from "react"
import type { Repository } from "@/utils/types/registry.interface"

export interface TagWithDateAndSize {
	name: string
	date: Date
	isLatest: boolean
	size: number
	layers: number
	digest?: string
}

export interface ManifestGroup {
	manifestDigest: string
	tags: TagWithDateAndSize[]
	size: number
	layers: number
	date: Date
}

interface UseImageTagsTableProps {
	repository: Repository | undefined
	onSelectionChange?: (selectedTags: string[]) => void
	onDeleteTags?: (tags: string[]) => Promise<void>
	onRefresh?: () => void
}

export function useImageTagsTable({
	repository,
	onSelectionChange,
	onDeleteTags,
	onRefresh,
}: UseImageTagsTableProps) {
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [isDeleting, setIsDeleting] = useState(false)
	const [tagsWithDigests, setTagsWithDigests] = useState<{ tag: string; digest: string }[]>([])
	const [, setIsLoadingDigests] = useState(false)

	useEffect(() => {
		const fetchDigests = async () => {
			if (!repository?.name || !repository?.tags?.length) return

			setIsLoadingDigests(true)
			try {
				const response = await fetch(
					`/api/registry/repositories/${encodeURIComponent(repository.name)}/tags`,
				)
				if (response.ok) {
					const data = await response.json()
					setTagsWithDigests(data.tagsWithDigests || [])
				} else {
					console.error("Failed to fetch manifest digests")
					setTagsWithDigests([])
				}
			} catch (error) {
				console.error("Error fetching manifest digests:", error)
				setTagsWithDigests([])
			} finally {
				setIsLoadingDigests(false)
			}
		}

		fetchDigests()
	}, [repository?.name, repository?.tags])

	const processedManifestGroups = useMemo((): ManifestGroup[] => {
		if (!repository?.tags || !repository?.tagsWithSize) return []

		const processedTags = repository.tags.map((tag) => {
			let date = new Date()

			const readableDateMatch = tag.match(
				/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})/,
			)
			if (readableDateMatch) {
				const [, monthStr, day, year] = readableDateMatch
				const monthMap: { [key: string]: number } = {
					Jan: 0,
					Feb: 1,
					Mar: 2,
					Apr: 3,
					May: 4,
					Jun: 5,
					Jul: 6,
					Aug: 7,
					Sep: 8,
					Oct: 9,
					Nov: 10,
					Dec: 11,
				}
				const month = monthMap[monthStr]
				const parsedDate = new Date(parseInt(year, 10), month, parseInt(day, 10))

				const currentYear = new Date().getFullYear()
				if (parsedDate.getFullYear() >= 1900 && parsedDate.getFullYear() <= currentYear + 10) {
					date = parsedDate
				}
			} else {
				const dateMatch = tag.match(/(\d{4})-?(\d{2})-?(\d{2})/)
				if (dateMatch) {
					const [, year, month, day] = dateMatch
					const parsedDate = new Date(
						parseInt(year, 10),
						parseInt(month, 10) - 1,
						parseInt(day, 10),
					)

					const currentYear = new Date().getFullYear()
					if (parsedDate.getFullYear() >= 1900 && parsedDate.getFullYear() <= currentYear + 10) {
						date = parsedDate
					}
				} else {
					const versionDateMatch = tag.match(/(\d{8})/)
					if (versionDateMatch) {
						const dateStr = versionDateMatch[1]
						const year = dateStr.substring(0, 4)
						const month = dateStr.substring(4, 6)
						const day = dateStr.substring(6, 8)
						const parsedDate = new Date(
							parseInt(year, 10),
							parseInt(month, 10) - 1,
							parseInt(day, 10),
						)

						const currentYear = new Date().getFullYear()
						if (parsedDate.getFullYear() >= 1900 && parsedDate.getFullYear() <= currentYear + 10) {
							date = parsedDate
						}
					}
				}
			}

			const tagWithSize = repository.tagsWithSize?.find((t) => t.name === tag)
			const size = tagWithSize?.size || 0
			const layers = tagWithSize?.layers || 0

			const tagWithDigest = tagsWithDigests.find((t) => t.tag === tag)
			const digest = tagWithDigest?.digest

			return {
				name: tag,
				date,
				isLatest: tag === "latest",
				size,
				layers,
				digest,
			}
		})

		const manifestGroups = new Map<string, ManifestGroup>()

		processedTags.forEach((tag) => {
			const digest = tag.digest || tag.name

			if (manifestGroups.has(digest)) {
				const group = manifestGroups.get(digest)!
				group.tags.push(tag)
				if (tag.date > group.date) {
					group.date = tag.date
				}
			} else {
				manifestGroups.set(digest, {
					manifestDigest: digest,
					tags: [tag],
					size: tag.size,
					layers: tag.layers,
					date: tag.date,
				})
			}
		})

		const sortedGroups = Array.from(manifestGroups.values()).map((group) => ({
			...group,
			tags: group.tags.sort((a, b) => {
				if (a.isLatest && !b.isLatest) return -1
				if (!a.isLatest && b.isLatest) return 1
				return a.name.localeCompare(b.name)
			}),
		}))

		return sortedGroups
	}, [repository?.tags, repository?.tagsWithSize, tagsWithDigests])

	const handleSelectionChange = useCallback(
		(selectedRows: ManifestGroup[]) => {
			const tagNames = selectedRows.flatMap((row) => row.tags.map((tag) => tag.name))
			setSelectedTags(tagNames)
			onSelectionChange?.(tagNames)
		},
		[onSelectionChange],
	)

	const handleClearSelection = useCallback(() => {
		setSelectedTags([])
		onSelectionChange?.([])
	}, [onSelectionChange])

	const handleDeleteTags = useCallback(
		async (tags: string[]) => {
			if (!onDeleteTags) return

			setIsDeleting(true)
			try {
				await onDeleteTags(tags)
				setSelectedTags((prev) => prev.filter((tag) => !tags.includes(tag)))
				onSelectionChange?.(selectedTags.filter((tag) => !tags.includes(tag)))

				if (onRefresh) {
					onRefresh()
				}
			} catch (error) {
				console.error("Failed to delete tags:", error)
			} finally {
				setIsDeleting(false)
			}
		},
		[onDeleteTags, selectedTags, onSelectionChange, onRefresh],
	)

	return {
		selectedTags,
		isDeleting,
		processedManifestGroups,
		handleSelectionChange,
		handleClearSelection,
		handleDeleteTags,
	}
}
