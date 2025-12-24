"use client"

import { CheckCircle, Loader2, Trash2, XCircle } from "lucide-react"
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

	if (selectedTags.length === 0) {
		return null
	}

	return (
		<div className="absolute bottom-full left-0 right-0 z-10 mb-2 flex items-center justify-between rounded-lg border bg-background p-2 shadow-md">
			<div className="flex items-center gap-2">
				<Badge variant="secondary" className="flex items-center gap-1.5">
					<CheckCircle className="size-3.5" />
					{selectedTags.length} tag{selectedTags.length !== 1 ? "s" : ""} selected
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
							Delete
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								Delete {selectedTags.length} tag
								{selectedTags.length !== 1 ? "s" : ""}
							</DialogTitle>
							<DialogDescription>
								This action cannot be undone. The selected tags will be permanently deleted, do you
								want to continue?
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								size="xs"
								onClick={handleCancelDelete}
								disabled={isDeleting}
							>
								<XCircle className="mr-2 size-4" />
								Cancel
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
										Deleting...
									</>
								) : (
									<>
										<Trash2 className="mr-2 size-4" />
										Delete Permanently
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
