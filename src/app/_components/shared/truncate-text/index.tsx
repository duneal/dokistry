"use client"

import { Truncate } from "@re-dev/react-truncate"
import type React from "react"
import { useState } from "react"
import { cn } from "@/utils/lib/shadcn-ui"

interface TruncateTextProps {
	children: React.ReactNode
	lines: number
	variant?: "default" | "compact" | "expanded"
	className?: string
}

const variantStyles = {
	default: "",
	compact: "text-sm",
	expanded: "text-base",
}

const TruncateText = ({
	children,
	lines,
	variant = "default",
	className,
	...props
}: TruncateTextProps) => {
	const [isTruncated, setIsTruncated] = useState(false)

	return (
		<div className={cn("relative overflow-hidden", variantStyles[variant], className)}>
			<Truncate
				lines={lines}
				onTruncate={(truncated) => {
					setIsTruncated(truncated)
				}}
				className="[&_button]:text-primary [&_button]:font-medium [&_button]:hover:underline [&_button]:cursor-pointer"
				{...props}
			>
				<div className={cn(isTruncated ? "block" : "hidden")}>{children}</div>
			</Truncate>
		</div>
	)
}

export default TruncateText
