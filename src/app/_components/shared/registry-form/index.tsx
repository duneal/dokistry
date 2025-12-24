"use client"

import { Pencil, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
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
	const t = useTranslations("registry")
	const tCommon = useTranslations("common")

	return (
		<Dialog open={open} onOpenChange={handleDialogOpenChange}>
			<DialogContent className={cn("sm:max-w-md", className)}>
				<DialogHeader>
					<DialogTitle>{isEditMode ? t("editRegistry") : t("addRegistry")}</DialogTitle>
					<DialogDescription>
						{isEditMode ? t("updateDescription") : t("addDescription")}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label
							htmlFor={urlId}
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							{t("registryUrl")}
						</label>
						<Input
							id={urlId}
							type="url"
							placeholder={t("urlPlaceholder")}
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
							{tCommon("username")}
						</label>
						<Input
							id={usernameId}
							type="text"
							placeholder={t("usernamePlaceholder")}
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
							{tCommon("password")}
						</label>
						<PasswordInput
							id={passwordId}
							placeholder={isEditMode ? t("passwordPlaceholderEdit") : t("passwordPlaceholder")}
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
								t("testingConnection")
							) : isEditMode ? (
								<>
									<Pencil className="mr-2 size-4" />
									{t("updateRegistry")}
								</>
							) : (
								<>
									<Plus className="mr-2 size-4" />
									{t("addRegistry")}
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
