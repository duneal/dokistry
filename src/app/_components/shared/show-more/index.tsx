"use client"

import { ShowMore as ShowMoreReactTruncate } from "@re-dev/react-truncate"
import type React from "react"
import { useMediaQuery } from "react-responsive"
import { cn } from "@/utils/lib/shadcn-ui"

interface ShowMoreProps {
	children: React.ReactNode
	lines?: number
	className?: string
	mediaQuery?: number
	variant?: "default" | "compact" | "expanded"
}

const variantStyles = {
	default: "",
	compact: "text-sm",
	expanded: "text-base",
}

const ShowMore = ({
	children,
	lines = 3,
	className,
	mediaQuery,
	variant = "default",
	...props
}: ShowMoreProps) => {
	const isUnderMediaQuery = useMediaQuery({
		maxWidth: mediaQuery ?? 0,
	})

	return (
		<div className={cn("relative", variantStyles[variant], className)}>
			<ShowMoreReactTruncate
				lines={mediaQuery ? (isUnderMediaQuery ? lines : 0) : lines}
				className="[&_button]:text-primary [&_button]:font-medium [&_button]:hover:underline [&_button]:cursor-pointer"
				{...props}
			>
				{children}
			</ShowMoreReactTruncate>
		</div>
	)
}

export default ShowMore
