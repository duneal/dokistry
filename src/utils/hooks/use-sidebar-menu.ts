import { useCallback, useEffect, useState } from "react"
import { clientRegistryService } from "@/features/registry/services/client-registry.service"
import type { SidebarMenuData } from "@/utils/types/registry.interface"

interface UseSidebarMenuReturn {
	menuData: SidebarMenuData | null
	isLoading: boolean
	error: string | null
	refetch: () => void
}

export function useSidebarMenu(): UseSidebarMenuReturn {
	const [menuData, setMenuData] = useState<SidebarMenuData | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchMenuData = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)
			const data = await clientRegistryService.getSidebarMenuData()
			setMenuData(data)
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to load menu data"
			setError(errorMessage)
			console.error("Error fetching sidebar menu data:", err)
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchMenuData()
	}, [fetchMenuData])

	return {
		menuData,
		isLoading,
		error,
		refetch: fetchMenuData,
	}
}
