"use client"

import { ChevronsUpDown, Loader2, Pencil, Plus, Server, Trash2 } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
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
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu"
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/app/_components/ui/sidebar"
import { removeFromString } from "@/utils/helpers/text"
import { useRegistrySwitcher } from "@/utils/hooks/use-registry-switcher"
import { useAuth } from "@/utils/lib/auth-hooks"
import { cn } from "@/utils/lib/shadcn-ui"
import { RegistryForm } from "./registry-form"

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

	const selectedRegistryData = registries.find((r) => r.url === selectedRegistry)
	const displayName = selectedRegistryData
		? removeFromString(removeFromString(selectedRegistryData.url, "https://"), "http://")
		: "No registry selected"

	if (!selectedRegistryData && !isLoading && registries.length === 0) {
		return null
	}

	return (
		<>
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
									<Server className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">Registry</span>
									<span className="truncate text-xs text-muted-foreground">{displayName}</span>
								</div>
								<ChevronsUpDown className="ml-auto size-4" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg "
							align="start"
							side={isMobile ? "bottom" : "right"}
							sideOffset={4}
						>
							<DropdownMenuLabel className="text-muted-foreground text-xs px-3 mt-2 mb-1">
								Registries
							</DropdownMenuLabel>
							{isLoading ? (
								<div className="px-2 py-1.5 text-sm text-muted-foreground">
									Loading registries...
								</div>
							) : registries.length === 0 ? (
								<div className="px-2 py-1.5 text-sm text-muted-foreground">No registries found</div>
							) : (
								registries.map((registry) => (
									<DropdownMenuItem
										key={registry.id}
										onSelect={() => handleRegistrySelect(registry.url)}
										className={cn(
											"gap-2 p-2 mx-3 mb-3",
											registry.url === selectedRegistry && "bg-accent",
										)}
									>
										<span className="flex-1 truncate text-sm">
											{removeFromString(removeFromString(registry.url, "https://"), "http://")}
										</span>
										{isAdmin && (
											<div className="flex items-center">
												<button
													type="button"
													className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
													onClick={(e) => {
														e.preventDefault()
														e.stopPropagation()
														handleEditClick(registry)
													}}
												>
													<Pencil className="size-3.5" />
												</button>
												<button
													type="button"
													className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground hover:text-white"
													onClick={(e) => {
														e.preventDefault()
														e.stopPropagation()
														handleDeleteClick(registry)
													}}
												>
													<Trash2 className="size-3.5" />
												</button>
											</div>
										)}
									</DropdownMenuItem>
								))
							)}
							{isAdmin && (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="gap-2 p-2 mx-3 mt-2 mb-1"
										onSelect={(e) => {
											e.preventDefault()
											handleAddRegistryClick()
										}}
									>
										<div className="flex size-6 items-center justify-center rounded-md border bg-background">
											<Plus className="size-4" />
										</div>
										<div className="text-muted-foreground font-medium">Add registry</div>
									</DropdownMenuItem>
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>

			<RegistryForm
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				onRegistrySaved={handleRegistryAdded}
			/>

			<RegistryForm
				open={isEditDialogOpen}
				onOpenChange={handleEditDialogOpenChange}
				onRegistrySaved={handleRegistrySaved}
				registry={registryToEdit}
			/>

			<Dialog open={isDeleteDialogOpen} onOpenChange={handleDeleteDialogOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Registry</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete <strong>{registryToDelete?.url}</strong>? This action
							cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" size="sm" onClick={handleCancelDelete} disabled={isDeleting}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							size="sm"
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
		</>
	)
}
