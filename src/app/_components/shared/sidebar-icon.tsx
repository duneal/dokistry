import { AlertCircle, BrushCleaning, Dock, LayoutDashboard, Package } from "lucide-react"

interface SidebarIconProps {
	iconName: string
	className?: string
	size?: number
	strokeWidth?: number
}

export function SidebarIcon({
	iconName,
	className,
	size = 16,
	strokeWidth = 1.5,
}: SidebarIconProps) {
	const iconProps = {
		className: className || "sidebar__menu__button__icon",
		size,
		strokeWidth,
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
		case "BrushCleaning":
			return <BrushCleaning {...iconProps} />
		default:
			return <Package {...iconProps} />
	}
}
