import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
	createRegistry,
	testRegistryConnection,
	updateRegistry,
	updateSelectedRegistry,
} from "@/utils/lib/auth-actions"
import type { Registry } from "@/utils/types/registry.interface"

interface RegistryFormData {
	url: string
	username: string
	password: string
}

interface UseRegistryFormProps {
	registry?: Registry | null
	onOpenChange: (open: boolean) => void
	onRegistrySaved?: (registry: Registry) => void
}

export function useRegistryForm({ registry, onOpenChange, onRegistrySaved }: UseRegistryFormProps) {
	const isEditMode = !!registry
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isTestingConnection, setIsTestingConnection] = useState(false)
	const [formData, setFormData] = useState<RegistryFormData>({
		url: "",
		username: "",
		password: "",
	})

	useEffect(() => {
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

	return {
		isEditMode,
		isSubmitting,
		isTestingConnection,
		formData,
		handleInputChange,
		handleSubmit,
		handleDialogOpenChange,
	}
}
