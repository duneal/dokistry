"use client"

import { Pencil, Plus } from "lucide-react"
import { useId } from "react"
import PasswordInput from "@/app/_components/shared/password-input"
import { Button } from "@/app/_components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/app/_components/ui/dialog"
import { Input } from "@/app/_components/ui/input"
import { cn } from "@/utils/lib/shadcn-ui"
import type { Registry } from "@/utils/types/registry.interface"
import { useRegistryForm } from "./use-registry-form"

interface RegistryFormProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onRegistrySaved?: (registry: Registry) => void
	className?: string
	registry?: Registry | null
}

export function RegistryForm({
	open,
	onOpenChange,
	onRegistrySaved,
	className,
	registry,
}: RegistryFormProps) {
	const urlId = useId()
	const usernameId = useId()
	const passwordId = useId()

	const {
		isEditMode,
		isSubmitting,
		isTestingConnection,
		formData,
		handleInputChange,
		handleSubmit,
		handleDialogOpenChange,
	} = useRegistryForm({ registry, onOpenChange, onRegistrySaved })

	return (
		<Dialog open={open} onOpenChange={handleDialogOpenChange}>
			<DialogContent className={cn("sm:max-w-md", className)}>
				<DialogHeader>
					<DialogTitle>{isEditMode ? "Edit Registry" : "Add a Registry"}</DialogTitle>
					<DialogDescription>
						{isEditMode
							? "Update the Docker registry information."
							: "Add a new Docker registry to your list of available registries."}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label
							htmlFor={urlId}
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Registry URL
						</label>
						<Input
							id={urlId}
							type="url"
							placeholder="https://registry.example.com"
							value={formData.url}
							onChange={(e) => handleInputChange("url", e.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<label
							htmlFor={usernameId}
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Username
						</label>
						<Input
							id={usernameId}
							type="text"
							placeholder="Enter username"
							value={formData.username}
							onChange={(e) => handleInputChange("username", e.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<label
							htmlFor={passwordId}
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Password
						</label>
						<PasswordInput
							id={passwordId}
							placeholder={isEditMode ? "Leave empty to keep current password" : "Enter password"}
							value={formData.password}
							onChange={(e) => handleInputChange("password", e.target.value)}
							required={!isEditMode}
						/>
					</div>
					<DialogFooter>
						<Button
							type="submit"
							loading={isSubmitting || isTestingConnection}
							disabled={isTestingConnection}
						>
							{isTestingConnection ? (
								"Testing connection..."
							) : isEditMode ? (
								<>
									<Pencil className="mr-2 size-4" />
									Update Registry
								</>
							) : (
								<>
									<Plus className="mr-2 size-4" />
									Add Registry
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}

export function RegistryAddForm(props: Omit<RegistryFormProps, "registry">) {
	return <RegistryForm {...props} />
}
