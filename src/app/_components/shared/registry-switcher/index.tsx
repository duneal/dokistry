"use client"

import { ChevronsUpDown, Loader2, Pencil, Plus, Server, Trash2, XCircle } from "lucide-react"
import Button from "@/app/_components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/app/_components/ui/dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu"
import { SidebarMenuButton, useSidebar } from "@/app/_components/ui/sidebar"
import { removeFromString } from "@/utils/helpers/text"
import { useAuth } from "@/utils/lib/auth-hooks"
import { Separator } from "../../ui"
import { RegistryForm } from "../registry-form"
import "./registry-switcher.scss"
import { useRegistrySwitcher } from "./use-registry-switcher"

interface RegistrySwitcherProps {
	defaultRegistry?: string
}

export function RegistrySwitcher({ defaultRegistry }: RegistrySwitcherProps) {
	const {
		registries,
		selectedRegistry,
		isDialogOpen,
		isDeleteDialogOpen,
		isEditDialogOpen,
		registryToDelete,
		registryToEdit,
		isDeleting,
		isDropdownOpen,
		isLoading,
		setIsDialogOpen,
		setIsDropdownOpen,
		handleRegistryAdded,
		handleRegistrySelect,
		handleAddRegistryClick,
		handleEditClick,
		handleDeleteClick,
		handleConfirmDelete,
		handleCancelDelete,
		handleDeleteDialogOpenChange,
		handleEditDialogOpenChange,
		handleRegistrySaved,
	} = useRegistrySwitcher({ defaultRegistry })
	const { isMobile } = useSidebar()
	const { user } = useAuth()
	const isAdmin = user?.role === "admin"
	const dropdownMenuPlacement = isMobile
		? { side: "bottom" as const, align: "center" as const, sideOffset: 8, collisionPadding: 16 }
		: { side: "right" as const, align: "start" as const, sideOffset: 10 }

	return (
		<div className="registry-switcher">
			<DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
				<DropdownMenuTrigger asChild>
					<SidebarMenuButton className="registry-switcher__trigger">
						<div className="registry-switcher__icon">
							<Server className="registry-switcher__icon__svg" size={18} />
						</div>
						<div className="registry-switcher__content">
							<span className="registry-switcher__content__title">Registry</span>
							<span className="registry-switcher__content__subtitle">
								{selectedRegistry
									? removeFromString(removeFromString(selectedRegistry, "https://"), "http://")
									: "No registry selected"}
							</span>
						</div>
						<ChevronsUpDown className="registry-switcher__chevron" size={18} />
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="registry-switcher__dropdown" {...dropdownMenuPlacement}>
					{isLoading ? (
						<div className="registry-switcher__loading">Loading registries...</div>
					) : registries.length === 0 ? (
						<div className="registry-switcher__empty">No registries found</div>
					) : (
						registries.map((registry) => (
							<DropdownMenuItem
								key={registry.id}
								onSelect={() => handleRegistrySelect(registry.url)}
								className={`registry-switcher__item ${registry.url === selectedRegistry ? "registry-switcher__item--selected" : ""}`}
							>
								<span className="registry-switcher__item__text">
									{removeFromString(removeFromString(registry.url, "https://"), "http://")}
								</span>
								{isAdmin && (
									<div className="registry-switcher__item__actions">
										<button
											type="button"
											className="registry-switcher__item__action registry-switcher__item__action--edit"
											onClick={(e) => {
												e.preventDefault()
												e.stopPropagation()
												handleEditClick(registry)
											}}
										>
											<Pencil className="registry-switcher__item__action__icon" size={16} />
										</button>
										<button
											type="button"
											className="registry-switcher__item__action registry-switcher__item__action--delete"
											onClick={(e) => {
												e.preventDefault()
												e.stopPropagation()
												handleDeleteClick(registry)
											}}
										>
											<Trash2 className="registry-switcher__item__action__icon" size={16} />
										</button>
									</div>
								)}
							</DropdownMenuItem>
						))
					)}
					{isAdmin && (
						<>
							<Separator orientation="horizontal" />
							<DropdownMenuItem
								className="registry-switcher__add-button"
								onSelect={(e) => {
									e.preventDefault()
									handleAddRegistryClick()
								}}
							>
								<Button variant="ghost" size="sm">
									<Plus size={18} />
									Add a registry
								</Button>
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<RegistryForm
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				onRegistrySaved={handleRegistryAdded}
				className="registry-switcher__dialog"
			/>

			<RegistryForm
				open={isEditDialogOpen}
				onOpenChange={handleEditDialogOpenChange}
				onRegistrySaved={handleRegistrySaved}
				registry={registryToEdit}
				className="registry-switcher__dialog"
			/>

			<Dialog open={isDeleteDialogOpen} onOpenChange={handleDeleteDialogOpenChange}>
				<DialogContent className="registry-switcher__delete-dialog">
					<DialogHeader>
						<DialogTitle>Delete Registry</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete <strong>{registryToDelete?.url}</strong>? This action
							cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="ghost" size="sm" onClick={handleCancelDelete} disabled={isDeleting}>
							<XCircle className="registry-switcher__delete-dialog__icon" size={16} />
							Cancel
						</Button>
						<Button variant="danger" size="sm" onClick={handleConfirmDelete} disabled={isDeleting}>
							{isDeleting ? (
								<>
									<Loader2
										className="registry-switcher__delete-dialog__icon registry-switcher__delete-dialog__icon--spinning"
										size={16}
									/>
									Deleting...
								</>
							) : (
								<>
									<Trash2 className="registry-switcher__delete-dialog__icon" size={16} />
									Delete Permanently
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
