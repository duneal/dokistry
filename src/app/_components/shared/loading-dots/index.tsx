import { cn } from "@/utils/lib/shadcn-ui"

interface LoadingDotsProps {
	size?: "small" | "medium" | "large"
	className?: string
}

const sizeClasses = {
	small: "size-1.5",
	medium: "size-2",
	large: "size-3",
}

const gapClasses = {
	small: "gap-1",
	medium: "gap-1.5",
	large: "gap-2",
}

function LoadingDots({ size = "medium", className = "" }: LoadingDotsProps) {
	return (
		<div className={cn("flex items-center justify-center", gapClasses[size], className)}>
			<div
				className={cn(
					"animate-bounce rounded-full bg-primary",
					sizeClasses[size],
					"[animation-delay:-0.3s]",
				)}
			/>
			<div
				className={cn(
					"animate-bounce rounded-full bg-primary",
					sizeClasses[size],
					"[animation-delay:-0.15s]",
				)}
			/>
			<div className={cn("animate-bounce rounded-full bg-primary", sizeClasses[size])} />
		</div>
	)
}

export { LoadingDots }
export default LoadingDots
