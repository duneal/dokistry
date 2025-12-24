"use client"

import { CheckCircle, Loader2, Trash2, XCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import {
	Badge,
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/app/_components/ui"
import { useTagsActionBar } from "./use-tags-action-bar"

interface TagsActionBarProps {
	selectedTags: string[]
	onClearSelection: () => void
	onDeleteTags: (tags: string[]) => Promise<void>
	isDeleting?: boolean
}

export default function TagsActionBar({
	selectedTags,
	onDeleteTags,
	isDeleting = false,
}: TagsActionBarProps) {
	const { isDialogOpen, setIsDialogOpen, handleConfirmDelete, handleCancelDelete } =
		useTagsActionBar({ selectedTags, onDeleteTags })
	const t = useTranslations("images")
	const tCommon = useTranslations("common")

	if (selectedTags.length === 0) {
		return null
	}

	return (
		<div className="absolute bottom-full left-0 right-0 z-10 mb-2 flex items-center justify-between rounded-lg border bg-background p-2 shadow-md">
			<div className="flex items-center gap-2">
				<Badge variant="secondary" className="flex items-center gap-1.5">
					<CheckCircle className="size-3.5" />
					{selectedTags.length} {selectedTags.length === 1 ? t("tag") : t("tags")}{" "}
					{t("tagsSelected")}
				</Badge>
			</div>

			<div className="flex items-center gap-2">
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button variant="destructive" size="sm" disabled={isDeleting}>
							{isDeleting ? (
								<Loader2 className="mr-2 size-4 animate-spin" />
							) : (
								<Trash2 className="mr-2 size-4" />
							)}
							{tCommon("delete")}
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{t("deleteTagsTitle")} ({selectedTags.length})
							</DialogTitle>
							<DialogDescription>{t("deleteTagsDescription")}</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								size="xs"
								onClick={handleCancelDelete}
								disabled={isDeleting}
							>
								<XCircle className="mr-2 size-4" />
								{tCommon("cancel")}
							</Button>
							<Button
								variant="destructive"
								size="xs"
								onClick={handleConfirmDelete}
								disabled={isDeleting}
							>
								{isDeleting ? (
									<>
										<Loader2 className="mr-2 size-4 animate-spin" />
										{t("deleting")}
									</>
								) : (
									<>
										<Trash2 className="mr-2 size-4" />
										{t("deletePermanently")}
									</>
								)}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	)
}
