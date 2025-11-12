import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
	deleteRegistry,
	getRegistriesList,
	getUserWithSelectedRegistry,
	updateSelectedRegistry,
} from "@/utils/lib/auth-actions"
import type { Registry } from "@/utils/types/registry.interface"

interface UseRegistrySwitcherProps {
	defaultRegistry?: string
}

export function useRegistrySwitcher({ defaultRegistry }: UseRegistrySwitcherProps = {}) {
	const [registries, setRegistries] = useState<Registry[]>([])
	const [selectedRegistry, setSelectedRegistry] = useState<string>("")
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [registryToDelete, setRegistryToDelete] = useState<Registry | null>(null)
	const [registryToEdit, setRegistryToEdit] = useState<Registry | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true)
			try {
				const [registriesResult, userResult] = await Promise.all([
					getRegistriesList(),
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

				let registryToSelect = ""

				if (userResult.user?.selectedRegistryId) {
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
					registryToSelect = defaultRegistry
				}

				if (!registryToSelect && registries.length > 0) {
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
		const selectedRegistry = registries.find((r: Registry) => r.url === registryUrl)
		if (!selectedRegistry) {
			console.error("Registry not found")
			return
		}

		setSelectedRegistry(registryUrl)

		try {
			const result = await updateSelectedRegistry(selectedRegistry.id)
			if (result.error) {
				console.error("Error updating selected registry:", result.error)
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

	return {
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
	}
}
