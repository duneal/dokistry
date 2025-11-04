"use client"

import { ChevronsUpDown, Loader2, Pencil, Plus, Server, Trash2, XCircle } from "lucide-react"
import * as React from "react"
import { useEffect } from "react"
import { toast } from "sonner"
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
import { SidebarMenuButton } from "@/app/_components/ui/sidebar"
import { removeFromString } from "@/utils/helpers/text"
import {
	deleteRegistry,
	getUserRegistries,
	getUserWithSelectedRegistry,
	updateSelectedRegistry,
} from "@/utils/lib/auth-actions"
import type { Registry } from "@/utils/types/registry.interface"
import { Separator } from "../../ui"
import { RegistryForm } from "../registry-form"
import "./registry-switcher.scss"

interface RegistrySwitcherProps {
	defaultRegistry?: string
}

export function RegistrySwitcher({ defaultRegistry }: RegistrySwitcherProps) {
	const [registries, setRegistries] = React.useState<Registry[]>([])
	const [selectedRegistry, setSelectedRegistry] = React.useState<string>("")
	const [isDialogOpen, setIsDialogOpen] = React.useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
	const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
	const [registryToDelete, setRegistryToDelete] = React.useState<Registry | null>(null)
	const [registryToEdit, setRegistryToEdit] = React.useState<Registry | null>(null)
	const [isDeleting, setIsDeleting] = React.useState(false)
	const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
	const [isLoading, setIsLoading] = React.useState(false)

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true)
			try {
				// Fetch registries and user's selected registry in parallel
				const [registriesResult, userResult] = await Promise.all([
					getUserRegistries(),
					getUserWithSelectedRegistry(),
				])

				if (registriesResult.error) {
					console.error("Error fetching registries:", registriesResult.error)
					return
				}

				if (userResult.error) {
					console.error("Error fetching user:", userResult.error)
					return
				}

				const registries = registriesResult.registries || []
				setRegistries(registries)

				// Determine which registry to select
				let registryToSelect = ""

				if (userResult.user?.selectedRegistryId) {
					// User has a saved selected registry
					const selectedRegistry = registries.find(
						(r: Registry) => r.id === userResult.user.selectedRegistryId,
					)
					if (selectedRegistry) {
						registryToSelect = selectedRegistry.url
					}
				}

				if (
					!registryToSelect &&
					defaultRegistry &&
					registries.some((r: Registry) => r.url === defaultRegistry)
				) {
					// Fallback to defaultRegistry prop if provided
					registryToSelect = defaultRegistry
				}

				if (!registryToSelect && registries.length > 0) {
					// Fallback to first registry
					registryToSelect = registries[0].url
				}

				setSelectedRegistry(registryToSelect)
			} catch (error) {
				console.error("Error fetching data:", error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchData()
	}, [defaultRegistry])

	const handleRegistryAdded = async (_newRegistry: Registry) => {
		window.location.reload()
	}

	const handleRegistrySelect = async (registryUrl: string) => {
		// Find the registry by URL to get its ID
		const selectedRegistry = registries.find((r: Registry) => r.url === registryUrl)
		if (!selectedRegistry) {
			console.error("Registry not found")
			return
		}

		// Update local state immediately for better UX
		setSelectedRegistry(registryUrl)

		// Update in database
		try {
			const result = await updateSelectedRegistry(selectedRegistry.id)
			if (result.error) {
				console.error("Error updating selected registry:", result.error)
				// Optionally revert the local state change
			}
		} catch (error) {
			console.error("Error updating selected registry:", error)
		}
	}

	const handleAddRegistryClick = () => {
		setIsDropdownOpen(false)
		setIsDialogOpen(true)
	}

	const handleEditClick = (registry: Registry) => {
		setRegistryToEdit(registry)
		setIsEditDialogOpen(true)
		setIsDropdownOpen(false)
	}

	const handleDeleteClick = (registry: Registry) => {
		setRegistryToDelete(registry)
		setIsDeleteDialogOpen(true)
		setIsDropdownOpen(false)
	}

	const handleConfirmDelete = async () => {
		if (!registryToDelete) return

		setIsDeleting(true)
		try {
			const result = await deleteRegistry(registryToDelete.id)

			if (result.error) {
				toast.error("Failed to delete registry", {
					description: result.error,
					duration: 4000,
				})
			} else {
				toast.success("Registry deleted successfully", {
					duration: 3000,
				})

				setIsDeleteDialogOpen(false)
				setRegistryToDelete(null)

				window.location.reload()
			}
		} catch (error) {
			// Check if this is a redirect error (which is expected and handled by Next.js)
			if (error instanceof Error && error.message === "NEXT_REDIRECT") {
				throw error
			}

			toast.error("Failed to delete registry", {
				description: "An unexpected error occurred",
				duration: 4000,
			})
			console.error("Failed to delete registry:", error)
		} finally {
			setIsDeleting(false)
		}
	}

	const handleCancelDelete = () => {
		setIsDeleteDialogOpen(false)
		setRegistryToDelete(null)
	}

	const handleDeleteDialogOpenChange = (open: boolean) => {
		if (!open && !isDeleting) {
			setIsDeleteDialogOpen(false)
			setRegistryToDelete(null)
		}
	}

	const handleEditDialogOpenChange = (open: boolean) => {
		if (!open) {
			setIsEditDialogOpen(false)
			setRegistryToEdit(null)
		}
	}

	const handleRegistrySaved = async (_registry: Registry) => {
		window.location.reload()
	}

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
				<DropdownMenuContent
					className="registry-switcher__dropdown"
					side="right"
					align="start"
					sideOffset={10}
				>
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
							</DropdownMenuItem>
						))
					)}
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
