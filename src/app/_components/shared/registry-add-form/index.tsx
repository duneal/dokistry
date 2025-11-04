"use client"

import { Plus } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"
import PasswordInput from "@/app/_components/shared/password-input"
import Button from "@/app/_components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/app/_components/ui/dialog"
import Input from "@/app/_components/ui/input"
import { createRegistry, updateSelectedRegistry } from "@/utils/lib/auth-actions"
import type { Registry } from "@/utils/types/registry.interface"
import "./registry-add-form.scss"

interface RegistryFormData {
	url: string
	username: string
	password: string
}

interface RegistryAddFormProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onRegistryAdded?: (registry: Registry) => void
	className?: string
}

export function RegistryAddForm({
	open,
	onOpenChange,
	onRegistryAdded,
	className,
}: RegistryAddFormProps) {
	const [isSubmitting, setIsSubmitting] = React.useState(false)
	const [formData, setFormData] = React.useState<RegistryFormData>({
		url: "",
		username: "",
		password: "",
	})

	const urlId = React.useId()
	const usernameId = React.useId()
	const passwordId = React.useId()

	const handleInputChange = (field: keyof RegistryFormData, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			const result = await createRegistry(formData.url, formData.username, formData.password)

			if (result.error) {
				toast.error("Failed to add registry", {
					description: result.error,
					duration: 4000,
				})
			} else if (result.registry) {
				const newRegistry = result.registry

				await updateSelectedRegistry(newRegistry.id)

				setFormData({ url: "", username: "", password: "" })
				onOpenChange(false)

				if (onRegistryAdded) {
					onRegistryAdded(newRegistry)
				}
			}
		} catch (error) {
			// Check if this is a redirect error (which is expected and handled by Next.js)
			if (error instanceof Error && error.message === "NEXT_REDIRECT") {
				// Let Next.js handle the redirect
				throw error
			}

			toast.error("Failed to add registry", {
				description: "An unexpected error occurred",
				duration: 4000,
			})
			console.error("Failed to add registry:", error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleDialogOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			setFormData({ url: "", username: "", password: "" })
		}
		onOpenChange(newOpen)
	}

	return (
		<Dialog open={open} onOpenChange={handleDialogOpenChange}>
			<DialogContent className={className}>
				<DialogHeader>
					<DialogTitle>Add a Registry</DialogTitle>
					<DialogDescription>
						Add a new Docker registry to your list of available registries.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="registry-add-form">
					<div className="registry-add-form__field">
						<label htmlFor={urlId} className="registry-add-form__label">
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
					<div className="registry-add-form__field">
						<label htmlFor={usernameId} className="registry-add-form__label">
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
					<div className="registry-add-form__field">
						<label htmlFor={passwordId} className="registry-add-form__label">
							Password
						</label>
						<PasswordInput
							id={passwordId}
							placeholder="Enter password"
							value={formData.password}
							onChange={(e) => handleInputChange("password", e.target.value)}
							required
						/>
					</div>
					<DialogFooter>
						<Button type="submit" variant="primary" loading={isSubmitting}>
							<Plus className="registry-add-form__button__icon" size={18} />
							Add Registry
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
