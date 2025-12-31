import type {
	SidebarImage,
	SidebarMenuData,
	SidebarMenuItem,
} from "@/utils/types/registry.interface"
import { defaultRegistryService } from "./registry-service.factory"

class SidebarMenuService {
	async getSidebarMenuData(): Promise<SidebarMenuData> {
		try {
			// Get repositories with their tags
			const { repositories } = await defaultRegistryService.getRepositoriesWithTags()

			// Create the Images menu item with dynamic data
			const imagesMenuItem: SidebarMenuItem = {
				title: "Images",
				url: "#",
				isActive: false,
				items: repositories.map(
					(repo): SidebarImage => ({
						title: `${repo.name} (${repo.tags.length} tags)`,
						url: `#/images/${repo.name}`,
						isActive: false,
					}),
				),
			}

			// Create the complete menu structure
			const menuData: SidebarMenuData = {
				navMain: [imagesMenuItem],
			}

			return menuData
		} catch (error) {
			console.error("Failed to generate sidebar menu data:", error)

			// Return fallback menu structure in case of error
			return {
				navMain: [
					{
						title: "Images",
						url: "#/images",
						isActive: false,
						items: [
							{
								title: "No images found",
								url: "#",
								isActive: false,
							},
						],
					},
				],
			}
		}
	}
}

export const sidebarMenuService = new SidebarMenuService()
