"use client"

import clsx from "clsx"
import { PanelLeft } from "lucide-react"
import React, {
	createContext,
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useState,
} from "react"
import "./sidebar.scss"

// Sidebar Context
interface SidebarContextValue {
	isOpen: boolean
	setIsOpen: (open: boolean) => void
	isCollapsed: boolean
	setIsCollapsed: (collapsed: boolean) => void
	isMobile: boolean
	toggleSidebar: () => void
	toggleCollapsed: () => void
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined)

export const useSidebar = () => {
	const context = useContext(SidebarContext)
	if (!context) {
		throw new Error("useSidebar must be used within a SidebarProvider")
	}
	return context
}

// Sidebar Provider
interface SidebarProviderProps {
	children: React.ReactNode
	defaultOpen?: boolean
	defaultCollapsed?: boolean
}

const DESKTOP_BREAKPOINT = 1024

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : React.useEffect

const SidebarProvider = ({
	children,
	defaultOpen = false,
	defaultCollapsed = false,
}: SidebarProviderProps) => {
	const [isOpen, setIsOpen] = useState(defaultOpen)
	const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
	const [isMobile, setIsMobile] = useState(false)

	const updateForViewport = useCallback((matchesDesktop: boolean) => {
		setIsMobile(!matchesDesktop)
		setIsCollapsed(false)
		setIsOpen(matchesDesktop)
	}, [])

	useIsomorphicLayoutEffect(() => {
		if (typeof window === "undefined") {
			return undefined
		}

		const mediaQuery = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`)
		updateForViewport(mediaQuery.matches)

		const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
			updateForViewport(event.matches)
		}

		if (typeof mediaQuery.addEventListener === "function") {
			mediaQuery.addEventListener("change", handleChange)
		} else if (typeof mediaQuery.addListener === "function") {
			mediaQuery.addListener(handleChange)
		}

		return () => {
			if (typeof mediaQuery.removeEventListener === "function") {
				mediaQuery.removeEventListener("change", handleChange)
			} else if (typeof mediaQuery.removeListener === "function") {
				mediaQuery.removeListener(handleChange)
			}
		}
	}, [updateForViewport])

	const toggleSidebar = useCallback(() => {
		setIsOpen((prev) => !prev)
	}, [])

	const toggleCollapsed = useCallback(() => {
		setIsCollapsed((prev) => !prev)
	}, [])

	const value = useMemo(
		() => ({
			isOpen,
			setIsOpen,
			isCollapsed,
			setIsCollapsed,
			isMobile,
			toggleSidebar,
			toggleCollapsed,
		}),
		[isCollapsed, isMobile, isOpen, toggleCollapsed, toggleSidebar],
	)

	return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

// Main Sidebar Component
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode
	collapsible?: boolean
	defaultCollapsed?: boolean
}

const Sidebar = ({ children, className, ...props }: SidebarProps) => {
	const { isOpen, isCollapsed, isMobile, setIsOpen } = useSidebar()

	const handleOverlayClick = () => {
		if (!isMobile) {
			return
		}

		setIsOpen(false)
	}

	return (
		<>
			<div
				className={clsx("sidebar", isCollapsed && "sidebar--collapsed", className)}
				data-state={isOpen ? "open" : "closed"}
				{...props}
			>
				<div className="sidebar__panel">{children}</div>
			</div>
			{isOpen && (
				<div
					className="sidebar__overlay"
					data-state={isOpen ? "open" : "closed"}
					onClick={handleOverlayClick}
				/>
			)}
		</>
	)
}

// Sidebar Header
interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode
}

const SidebarHeader = ({ children, className, ...props }: SidebarHeaderProps) => {
	return (
		<div className={clsx("sidebar__header", className)} {...props}>
			{children}
		</div>
	)
}

// Sidebar Content
interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode
}

const SidebarContent = ({ children, className, ...props }: SidebarContentProps) => {
	return (
		<div className={clsx("sidebar__content", className)} {...props}>
			{children}
		</div>
	)
}

// Sidebar Group
interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode
}

const SidebarGroup = ({ children, className, ...props }: SidebarGroupProps) => {
	return (
		<div className={clsx("sidebar__group", className)} {...props}>
			{children}
		</div>
	)
}

// Sidebar Group Label
interface SidebarGroupLabelProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode
}

const SidebarGroupLabel = ({ children, className, ...props }: SidebarGroupLabelProps) => {
	return (
		<div className={clsx("sidebar__group__label", className)} {...props}>
			{children}
		</div>
	)
}

// Sidebar Group Content
interface SidebarGroupContentProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode
}

const SidebarGroupContent = ({ children, className, ...props }: SidebarGroupContentProps) => {
	return (
		<div className={clsx("sidebar__group__content", className)} {...props}>
			{children}
		</div>
	)
}

// Sidebar Menu
interface SidebarMenuProps extends React.HTMLAttributes<HTMLUListElement> {
	children: React.ReactNode
}

const SidebarMenu = ({ children, className, ...props }: SidebarMenuProps) => {
	return (
		<ul className={clsx("sidebar__menu", className)} {...props}>
			{children}
		</ul>
	)
}

// Sidebar Menu Item
interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {
	children: React.ReactNode
	isActive?: boolean
}

const SidebarMenuItem = ({
	children,
	className,
	isActive = false,
	...props
}: SidebarMenuItemProps) => {
	return (
		<li
			className={clsx("sidebar__menu__item", isActive && "sidebar__menu__item--active", className)}
			{...props}
		>
			{children}
		</li>
	)
}

// Sidebar Menu Button
interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode
	asChild?: boolean
}

const SidebarMenuButton = ({
	children,
	asChild = false,
	className,
	...props
}: SidebarMenuButtonProps) => {
	const buttonClassName = clsx("sidebar__menu__button", className)

	if (asChild && React.isValidElement(children)) {
		return React.cloneElement(children, {
			className: clsx(
				buttonClassName,
				(children.props as unknown as { className: string })?.className,
			),
			...props,
		} as unknown as React.ReactElement)
	}

	return (
		<button className={buttonClassName} {...props}>
			{children}
		</button>
	)
}

// Sidebar Rail
interface SidebarRailProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string
}

const SidebarRail = ({ className, ...props }: SidebarRailProps) => {
	return <div className={clsx("sidebar__rail", className)} {...props} />
}

// Sidebar Inset
interface SidebarInsetProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode
}

const SidebarInset = ({ children, className, ...props }: SidebarInsetProps) => {
	const { isOpen, isCollapsed } = useSidebar()

	return (
		<div
			className={clsx("sidebar-inset", className)}
			data-sidebar-state={isOpen ? "open" : "closed"}
			data-sidebar-collapsed={isCollapsed ? "true" : "false"}
			{...props}
		>
			{children}
		</div>
	)
}

// Sidebar Trigger
interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	className?: string
}

const SidebarTrigger = ({ className, ...props }: SidebarTriggerProps) => {
	const { isMobile, toggleCollapsed, toggleSidebar } = useSidebar()

	const handleClick = () => {
		if (isMobile) {
			toggleSidebar()
			return
		}

		toggleCollapsed()
	}

	return (
		<button className={clsx("sidebar__trigger", className)} onClick={handleClick} {...props}>
			<PanelLeft className="sidebar__trigger__icon" />
		</button>
	)
}

export {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
}
