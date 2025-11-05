import { useState } from "react"
import { toast } from "sonner"

interface UseTagsActionBarProps {
	selectedTags: string[]
	onDeleteTags: (tags: string[]) => Promise<void>
}

export function useTagsActionBar({ selectedTags, onDeleteTags }: UseTagsActionBarProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)

	const handleConfirmDelete = async () => {
		try {
			toast.loading(`Deleting ${selectedTags.length} tag(s)...`, {
				id: "deleting-tags",
				description: "Please wait while we process your request",
			})

			await onDeleteTags(selectedTags)
			setIsDialogOpen(false)

			toast.dismiss("deleting-tags")
		} catch (error) {
			console.error("Failed to delete tags:", error)
			toast.dismiss("deleting-tags")
		}
	}

	const handleCancelDelete = () => {
		setIsDialogOpen(false)
		toast.info("Deletion cancelled", {
			description: "No tags were deleted",
			duration: 2000,
		})
	}

	return {
		isDialogOpen,
		setIsDialogOpen,
		handleConfirmDelete,
		handleCancelDelete,
	}
}
