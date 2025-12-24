"use client"

import { BadgeCheck, ChevronsUpDown, LogOut, Moon, Sun, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useCallback, useEffect, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import { Button } from "@/app/_components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu"
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/app/_components/ui/sidebar"
import { useAppSidebar } from "@/utils/hooks/use-app-sidebar"
import { useAuth } from "@/utils/lib/auth-hooks"

export function NavUser() {
	const { isMobile } = useSidebar()
	const { user, isLoading } = useAuth()
	const { isActiveUrl, handleLogout } = useAppSidebar()
	const router = useRouter()
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	const handleMenuItemClick = useCallback(() => {
		if (isMobile) {
			// Close sidebar on mobile after navigation
		}
	}, [isMobile])

	if (isLoading || !user) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton size="lg" disabled>
						<Avatar className="h-8 w-8 rounded-lg">
							<AvatarFallback className="rounded-lg">...</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium">Loading...</span>
							<span className="truncate text-xs text-muted-foreground">Please wait</span>
						</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		)
	}

	const userName =
		(user as { name?: string; image?: string })?.name || user.email?.split("@")[0] || "User"
	const userEmail = user.email || ""
	const userImage = (user as { name?: string; image?: string })?.image || null
	const userInitials =
		userName
			.split(" ")
			.map((n: string) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2) ||
		userEmail[0]?.toUpperCase() ||
		"U"
	const isAdmin = user.role === "admin"

	const settingsMenuItems = [
		{
			url: "/account",
			icon: BadgeCheck,
			label: "Account",
			isActive: isActiveUrl("/account"),
		},
		...(isAdmin
			? [
					{
						url: "/users",
						icon: Users,
						label: "Users",
						isActive: isActiveUrl("/users"),
					},
				]
			: []),
	]

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={userImage || undefined} alt={userName} />
								<AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{userName}</span>
								<span className="truncate text-xs text-muted-foreground">{userEmail}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal flex items-center justify-between gap-4">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage src={userImage || undefined} alt={userName} />
									<AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{userName}</span>
									<span className="truncate text-xs text-muted-foreground">{userEmail}</span>
								</div>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="[&_svg]:!size-5"
								onClick={(e) => {
									e.stopPropagation()
									setTheme(theme === "dark" ? "light" : "dark")
								}}
								disabled={!mounted}
							>
								{mounted && theme === "dark" ? (
									<Sun strokeWidth={1.5} />
								) : (
									<Moon strokeWidth={1.5} />
								)}
								<span className="sr-only">Toggle theme</span>
							</Button>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{settingsMenuItems.length > 0 && (
							<>
								<DropdownMenuGroup>
									{settingsMenuItems.map((item) => {
										const IconComponent = item.icon
										return (
											<DropdownMenuItem
												key={item.url}
												onClick={() => {
													router.push(item.url)
													handleMenuItemClick()
												}}
											>
												<IconComponent size={16} />
												{item.label}
											</DropdownMenuItem>
										)
									})}
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
							</>
						)}
						<DropdownMenuItem onClick={handleLogout}>
							<LogOut size={16} />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
