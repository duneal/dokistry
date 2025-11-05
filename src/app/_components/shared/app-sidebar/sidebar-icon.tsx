import { AlertCircle, Dock, LayoutDashboard, Package } from "lucide-react"

interface SidebarIconProps {
	iconName: string
	className?: string
	size?: number
}

export function SidebarIcon({ iconName, className, size = 16 }: SidebarIconProps) {
	const iconProps = {
		className: className || "sidebar__menu__button__icon",
		size,
	}

	switch (iconName) {
		case "LayoutDashboard":
			return <LayoutDashboard {...iconProps} />
		case "Package":
			return <Package {...iconProps} />
		case "Docker":
			return <Dock {...iconProps} />
		case "AlertCircle":
			return <AlertCircle {...iconProps} />
		default:
			return <Package {...iconProps} />
	}
}
