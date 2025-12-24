"use client"

import { Plus } from "lucide-react"
import * as React from "react"
import { Button } from "@/app/_components/ui/button"
import { useAuth } from "@/utils/lib/auth-hooks"
import type { Registry } from "@/utils/types/registry.interface"
import { RegistryAddForm } from "../registry-form"

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
		<div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
			<div className="flex flex-col items-center gap-2">
				<div className="rounded-full bg-muted p-4">
					<Plus className="size-8 text-muted-foreground" />
				</div>
				<h3 className="text-lg font-semibold">No registry found</h3>
				<p className="text-sm text-muted-foreground">Add a registry to get started</p>
			</div>
			{isAdmin && (
				<>
					<Button onClick={() => setIsDialogOpen(true)}>
						<Plus className="mr-2 size-4" />
						Add a Registry
					</Button>

					<RegistryAddForm
						open={isDialogOpen}
						onOpenChange={setIsDialogOpen}
						onRegistrySaved={handleRegistryAdded}
					/>
				</>
			)}
		</div>
	)
}
