import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

interface UseTagsActionBarProps {
	selectedTags: string[]
	onDeleteTags: (tags: string[]) => Promise<void>
}

export function useTagsActionBar({ selectedTags, onDeleteTags }: UseTagsActionBarProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const t = useTranslations("images")

	const handleConfirmDelete = async () => {
		try {
			toast.loading(t("deletingTags", { count: selectedTags.length }), {
				id: "deleting-tags",
				description: t("pleaseWait"),
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
		toast.info(t("deletionCancelled"), {
			description: t("noTagsDeleted"),
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
