"use client"

import clsx from "clsx"
import { ArrowUpRightIcon, LogOut, MoreVertical } from "lucide-react"
import { useCallback } from "react"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import "./app-sidebar.scss"

import { RegistrySwitcher } from "@/app/_components/shared"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	useSidebar,
} from "@/app/_components/ui"
import type { SidebarImage } from "@/utils/types/registry.interface"
import { SidebarIcon } from "./sidebar-icon"
import { useAppSidebar } from "./use-app-sidebar"
import { useSidebarMenu } from "./use-sidebar-menu"

interface AppSidebarProps {
	className?: string
}

export function AppSidebar({ className }: AppSidebarProps) {
	const { menuData, isLoading, error, refetch } = useSidebarMenu()
	const { isActiveUrl, isMenuItemActive, isSubItemActive, handleSeeImage, handleLogout } =
		useAppSidebar()
	const { isMobile, isCollapsed, setIsOpen } = useSidebar()
	const iconSize = isCollapsed ? 20 : 18

	const handleMenuItemClick = useCallback(() => {
		if (isMobile) {
			setIsOpen(false)
		}
	}, [isMobile, setIsOpen])

	const renderMenuItems = (items: SidebarImage[]) => {
		return items.map((subItem) => (
			<SidebarMenuItem
				key={subItem.title}
				isActive={isSubItemActive(subItem)}
				className="app-sidebar__menu-item"
			>
				<SidebarMenuButton asChild onClick={handleMenuItemClick}>
					<a href={subItem.url}>
						{subItem.icon && <SidebarIcon iconName={subItem.icon} size={iconSize} />}
						<span>{subItem.title}</span>
					</a>
				</SidebarMenuButton>

				{!isMobile && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button type="button" className="app-sidebar__actions">
								<MoreVertical size={16} />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start" sideOffset={10} side="right">
							<DropdownMenuItem onClick={() => handleSeeImage(subItem.url)}>
								<ArrowUpRightIcon size={16} />
								See
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</SidebarMenuItem>
		))
	}

	return (
		<Sidebar className={clsx("app-sidebar", className)}>
			<SidebarHeader>
				<RegistrySwitcher />
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Dashboard</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem isActive={isActiveUrl("/dashboard")}>
								<SidebarMenuButton asChild onClick={handleMenuItemClick}>
									<a href="/dashboard">
										<SidebarIcon iconName="LayoutDashboard" size={iconSize} />
										<span>Dashboard</span>
									</a>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{isLoading ? (
					<SidebarGroup>
						<SidebarGroupLabel>Images</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{Array.from({ length: 3 }, (_, index) => `skeleton-${index}`).map((key) => (
									<SidebarMenuItem key={key}>
										<SidebarMenuButton type="button">
											<SidebarIcon iconName="Package" size={iconSize} />
											<span>
												<Skeleton height={16} width={120} />
											</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				) : error ? (
					<SidebarGroup>
						<SidebarGroupLabel>Images</SidebarGroupLabel>
						<SidebarGroupContent>
							<div className="app-sidebar__error">
								<p>Failed to load images: {error}</p>
								<button type="button" onClick={refetch} className="app-sidebar__retry-button">
									Retry
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
										<SidebarMenuItem isActive={isMenuItemActive(item)}>
											<SidebarMenuButton asChild onClick={handleMenuItemClick}>
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

				<div className="app-sidebar__logout">
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton onClick={handleLogout} type="button">
								<LogOut size={16} />
								<span>Sign out</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</div>
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	)
}
