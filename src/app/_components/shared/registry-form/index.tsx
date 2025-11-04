"use client"

import { Pencil, Plus } from "lucide-react"
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
import {
	createRegistry,
	testRegistryConnection,
	updateRegistry,
	updateSelectedRegistry,
} from "@/utils/lib/auth-actions"
import type { Registry } from "@/utils/types/registry.interface"
import "./registry-form.scss"

interface RegistryFormData {
	url: string
	username: string
	password: string
}

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
	const isEditMode = !!registry
	const [isSubmitting, setIsSubmitting] = React.useState(false)
	const [isTestingConnection, setIsTestingConnection] = React.useState(false)
	const [formData, setFormData] = React.useState<RegistryFormData>({
		url: "",
		username: "",
		password: "",
	})

	const urlId = React.useId()
	const usernameId = React.useId()
	const passwordId = React.useId()

	React.useEffect(() => {
		if (registry) {
			setFormData({
				url: registry.url,
				username: registry.username,
				password: "",
			})
		} else {
			setFormData({ url: "", username: "", password: "" })
		}
	}, [registry])

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
			const passwordToUse =
				isEditMode && !formData.password && registry ? registry.password : formData.password

			if (!passwordToUse) {
				toast.error("Password is required", {
					description: "Please enter a password to test the connection",
					duration: 4000,
				})
				setIsSubmitting(false)
				return
			}

			setIsTestingConnection(true)
			const connectionTest = await testRegistryConnection(
				formData.url,
				formData.username,
				passwordToUse,
			)
			setIsTestingConnection(false)

			if (!connectionTest.success) {
				toast.error("Connection test failed", {
					description: connectionTest.error || "Unable to connect to the registry",
					duration: 5000,
				})
				setIsSubmitting(false)
				return
			}

			toast.success("Connection test passed", {
				description: "Registry credentials are valid",
				duration: 2000,
			})

			let result: { registry?: Registry; error?: string }
			if (isEditMode && registry) {
				result = await updateRegistry(
					registry.id,
					formData.url,
					formData.username,
					formData.password,
				)
			} else {
				result = await createRegistry(formData.url, formData.username, formData.password)
			}

			if (result.error) {
				toast.error(`Failed to ${isEditMode ? "update" : "add"} registry`, {
					description: result.error,
					duration: 4000,
				})
			} else if (result.registry) {
				const savedRegistry = result.registry

				if (!isEditMode) {
					await updateSelectedRegistry(savedRegistry.id)
				}

				setFormData({ url: "", username: "", password: "" })
				onOpenChange(false)

				if (onRegistrySaved) {
					onRegistrySaved(savedRegistry)
				}
			}
		} catch (error) {
			if (error instanceof Error && error.message === "NEXT_REDIRECT") {
				throw error
			}

			toast.error(`Failed to ${isEditMode ? "update" : "add"} registry`, {
				description: "An unexpected error occurred",
				duration: 4000,
			})
			console.error(`Failed to ${isEditMode ? "update" : "add"} registry:`, error)
		} finally {
			setIsSubmitting(false)
			setIsTestingConnection(false)
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
					<DialogTitle>{isEditMode ? "Edit Registry" : "Add a Registry"}</DialogTitle>
					<DialogDescription>
						{isEditMode
							? "Update the Docker registry information."
							: "Add a new Docker registry to your list of available registries."}
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
							placeholder={isEditMode ? "Leave empty to keep current password" : "Enter password"}
							value={formData.password}
							onChange={(e) => handleInputChange("password", e.target.value)}
							required={!isEditMode}
						/>
					</div>
					<DialogFooter>
						<Button
							type="submit"
							variant="primary"
							loading={isSubmitting || isTestingConnection}
							disabled={isTestingConnection}
						>
							{isTestingConnection ? (
								<>Testing connection...</>
							) : isEditMode ? (
								<>
									<Pencil className="registry-add-form__button__icon" size={18} />
									Update Registry
								</>
							) : (
								<>
									<Plus className="registry-add-form__button__icon" size={18} />
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
