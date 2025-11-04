"use client"

import { Check, ChevronsUpDown, Plus, Server } from "lucide-react"
import * as React from "react"
import Button from "@/app/_components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu"
import { SidebarMenuButton } from "@/app/_components/ui/sidebar"
import {
	getUserRegistries,
	getUserWithSelectedRegistry,
	updateSelectedRegistry,
} from "@/utils/lib/auth-actions"
import type { Registry } from "@/utils/types/registry.interface"
import { Separator } from "../../ui"
import { RegistryAddForm } from "../registry-add-form"
import "./registry-switcher.scss"

interface RegistrySwitcherProps {
	defaultRegistry?: string
}

export function RegistrySwitcher({ defaultRegistry }: RegistrySwitcherProps) {
	const [registries, setRegistries] = React.useState<Registry[]>([])
	const [selectedRegistry, setSelectedRegistry] = React.useState<string>("")
	const [isDialogOpen, setIsDialogOpen] = React.useState(false)
	const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
	const [isLoading, setIsLoading] = React.useState(false)

	// Fetch registries and user's selected registry on component mount
	React.useEffect(() => {
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

	const handleRegistryAdded = async (newRegistry: Registry) => {
		setRegistries((prev) => [...prev, newRegistry])
		setSelectedRegistry(newRegistry.url)
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
								{selectedRegistry || "No registry selected"}
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
								{registry.url}
								{registry.url === selectedRegistry && (
									<Check className="registry-switcher__item__check" size={18} />
								)}
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

			<RegistryAddForm
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				onRegistryAdded={handleRegistryAdded}
				className="registry-switcher__dialog"
			/>
		</div>
	)
}
