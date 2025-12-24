"use client"

import { useTranslations } from "next-intl"
import type * as React from "react"
import { useCallback } from "react"

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
	SidebarRail,
	useSidebar,
} from "@/app/_components/ui"
import { useAppSidebar } from "@/utils/hooks/use-app-sidebar"
import { useSidebarMenu } from "@/utils/hooks/use-sidebar-menu"
import { cn } from "@/utils/lib/shadcn-ui"
import type { SidebarImage } from "@/utils/types/registry.interface"
import { NavUser } from "./nav-user"
import { RegistrySwitcher } from "./registry-switcher"
import { SidebarIcon } from "./sidebar-icon"

export function AppSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
	const { menuData, isLoading, error, refetch } = useSidebarMenu()
	const { isActiveUrl, isMenuItemActive, isSubItemActive } = useAppSidebar()
	const { isMobile, state, setOpenMobile } = useSidebar()
	const iconSize = state === "collapsed" ? 20 : 18
	const t = useTranslations("sidebar")
	const tCommon = useTranslations("common")

	const handleMenuItemClick = useCallback(() => {
		if (isMobile) {
			setOpenMobile(false)
		}
	}, [isMobile, setOpenMobile])

	const renderMenuItems = (items: SidebarImage[]) => {
		return items.map((subItem) => (
			<SidebarMenuItem key={subItem.title} className="group/menu-item">
				<SidebarMenuButton
					asChild
					isActive={isSubItemActive(subItem)}
					onClick={handleMenuItemClick}
				>
					<a href={subItem.url}>
						{subItem.icon && (
							<SidebarIcon iconName={subItem.icon} size={iconSize} strokeWidth={1.5} />
						)}
						<span>{subItem.title}</span>
					</a>
				</SidebarMenuButton>
			</SidebarMenuItem>
		))
	}

	return (
		<Sidebar collapsible="icon" className={cn("h-screen", className)} {...props}>
			<SidebarHeader>
				<RegistrySwitcher />
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>{t("dashboard")}</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									isActive={isActiveUrl("/dashboard")}
									onClick={handleMenuItemClick}
								>
									<a href="/dashboard">
										<SidebarIcon iconName="LayoutDashboard" size={iconSize} />
										<span>{t("dashboard")}</span>
									</a>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{isLoading ? (
					<SidebarGroup>
						<SidebarGroupLabel>{t("images")}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{Array.from({ length: 3 }, (_, index) => `skeleton-${index}`).map((key) => (
									<SidebarMenuSkeleton key={key} showIcon />
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				) : error ? (
					<SidebarGroup>
						<SidebarGroupLabel>{t("images")}</SidebarGroupLabel>
						<SidebarGroupContent>
							<div className="flex flex-col gap-2 p-4 text-sm text-destructive">
								<p className="m-0 leading-relaxed">
									{t("failedToLoad")}: {error}
								</p>
								<button
									type="button"
									onClick={refetch}
									className="h-8 w-8 flex items-center justify-center rounded-md border border-input bg-transparent text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
								>
									{t("retry")}
								</button>
							</div>
						</SidebarGroupContent>
					</SidebarGroup>
				) : menuData ? (
					menuData.navMain.map((item) => (
						<SidebarGroup key={item.title}>
							<SidebarGroupLabel>{item.title}</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{item.items ? (
										renderMenuItems(item.items)
									) : (
										<SidebarMenuItem>
											<SidebarMenuButton
												asChild
												isActive={isMenuItemActive(item)}
												onClick={handleMenuItemClick}
											>
												<a href={item.url}>
													{item.icon && <SidebarIcon iconName={item.icon} size={iconSize} />}
													<span>{item.title}</span>
												</a>
											</SidebarMenuButton>
										</SidebarMenuItem>
									)}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					))
				) : null}
			</SidebarContent>

			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
