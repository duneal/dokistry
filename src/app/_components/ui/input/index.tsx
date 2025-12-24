import type * as React from "react"
import { cn } from "@/utils/lib/shadcn-ui"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	variant?: "default" | "error" | "success" | "warning"
}

function Input({ className, type = "text", variant = "default", ...props }: InputProps) {
	const variantStyles = {
		default: "",
		error: "border-destructive focus-visible:ring-destructive",
		success: "border-emerald-500 focus-visible:ring-emerald-500",
		warning: "border-amber-500 focus-visible:ring-amber-500",
	}

	return (
		<input
			type={type}
			className={cn(
				"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				variantStyles[variant],
				className,
			)}
			{...props}
		/>
	)
}

export { Input }
export default Input
