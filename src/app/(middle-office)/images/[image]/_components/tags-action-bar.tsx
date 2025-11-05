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
import "./tags-action-bar.scss"

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
		<div className="tags-action-bar">
			<div className="tags-action-bar__content">
				<div className="tags-action-bar__info">
					<Badge variant="default" size="sm">
						<CheckCircle className="tags-action-bar__icon" size={16} />
						{selectedTags.length} tag{selectedTags.length !== 1 ? "s" : ""} selected
					</Badge>
				</div>

				<div className="tags-action-bar__actions">
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button variant="danger" size="sm" disabled={isDeleting}>
								{isDeleting ? (
									<Loader2
										className="tags-action-bar__icon tags-action-bar__icon--spinning"
										size={16}
									/>
								) : (
									<Trash2 className="tags-action-bar__icon" size={16} />
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
									This action cannot be undone. The selected tags will be permanently deleted, do
									you want to continue?
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleCancelDelete}
									disabled={isDeleting}
								>
									<XCircle className="tags-action-bar__icon" size={16} />
									Cancel
								</Button>
								<Button
									variant="danger"
									size="sm"
									onClick={handleConfirmDelete}
									disabled={isDeleting}
								>
									{isDeleting ? (
										<>
											<Loader2
												className="tags-action-bar__icon tags-action-bar__icon--spinning"
												size={16}
											/>
											Deleting...
										</>
									) : (
										<>
											<Trash2 className="tags-action-bar__icon" size={16} />
											Delete Permanently
										</>
									)}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</div>
	)
}
