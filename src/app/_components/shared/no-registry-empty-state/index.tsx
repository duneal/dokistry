"use client"

import { Plus } from "lucide-react"
import * as React from "react"
import Button from "@/app/_components/ui/button"
import { useAuth } from "@/utils/lib/auth-hooks"
import type { Registry } from "@/utils/types/registry.interface"
import { RegistryAddForm } from "../registry-form"
import "./no-registry-empty-state.scss"

interface NoRegistryEmptyStateProps {
	onRegistryAdded?: () => void
}

export function NoRegistryEmptyState({ onRegistryAdded }: NoRegistryEmptyStateProps) {
	const [isDialogOpen, setIsDialogOpen] = React.useState(false)
	const { user } = useAuth()
	const isAdmin = user?.role === "admin"

	const handleRegistryAdded = (_registry: Registry) => {
		if (onRegistryAdded) {
			onRegistryAdded()
		} else {
			window.location.reload()
		}
	}

	return (
		<div className="no-registry-empty-state">
			<p>Add a registry to get started</p>
			{isAdmin && (
				<>
					<Button variant="primary" onClick={() => setIsDialogOpen(true)}>
						<Plus className="no-registry-empty-state__button__icon" size={20} />
						Add a Registry
					</Button>

					<RegistryAddForm
						open={isDialogOpen}
						onOpenChange={setIsDialogOpen}
						onRegistrySaved={handleRegistryAdded}
						className="no-registry-empty-state__dialog"
					/>
				</>
			)}
		</div>
	)
}
