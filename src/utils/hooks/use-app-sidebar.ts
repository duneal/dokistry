import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { clientSignOut } from "@/utils/lib/auth-client"
import type {
	SidebarImage,
	SidebarMenuItem as SidebarMenuItemType,
} from "@/utils/types/registry.interface"

export function useAppSidebar() {
	const pathname = usePathname()
	const router = useRouter()

	const isActiveUrl = (url: string): boolean => {
		if (url === "/" && (pathname === "/" || pathname === "/dashboard")) return true
		if (url === "/dashboard" && (pathname === "/" || pathname === "/dashboard")) return true

		if (url.startsWith("/images/") && pathname.startsWith("/images/")) {
			const urlImage = url.replace("/images/", "")
			const pathImage = pathname.replace("/images/", "")
			return decodeURIComponent(urlImage) === decodeURIComponent(pathImage)
		}

		if (url === "/account" && pathname === "/account") return true
		if (url === "/users" && pathname === "/users") return true

		return url === pathname
	}

	const isMenuItemActive = (item: SidebarMenuItemType): boolean => {
		if (isActiveUrl(item.url)) return true
		if (item.items) {
			return item.items.some((subItem) => isActiveUrl(subItem.url))
		}
		return false
	}

	const isSubItemActive = (subItem: SidebarImage): boolean => {
		return isActiveUrl(subItem.url)
	}

	const handleDeleteImage = () => {
		toast.info("Deleting images is not implemented yet")
	}

	const handleLogout = async () => {
		try {
			const result = await clientSignOut()

			if (result.error) {
				toast.error("Failed to sign out")
			} else {
				toast.success("Signed out successfully")
				router.push("/signin")
			}
		} catch (error) {
			console.error("Logout error:", error)
			toast.error("Failed to sign out")
		}
	}

	return {
		isActiveUrl,
		isMenuItemActive,
		isSubItemActive,
		handleDeleteImage,
		handleLogout,
	}
}
