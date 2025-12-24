import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"
import { cn } from "@/utils/lib/shadcn-ui"

const badgeVariants = cva(
	"inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
				primary: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
				tertiary: "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
				destructive: "border-transparent bg-destructive text-white shadow hover:bg-destructive/80",
				danger: "border-transparent bg-destructive text-white shadow hover:bg-destructive/80",
				success:
					"border-transparent bg-emerald-600 text-white shadow hover:bg-emerald-600/80 dark:bg-emerald-500",
				warning:
					"border-transparent bg-amber-500 text-white shadow hover:bg-amber-500/80 dark:bg-amber-600",
				outline: "text-foreground",
			},
			size: {
				xs: "px-1.5 py-0.5 text-[10px]",
				sm: "px-2 py-0.5 text-xs",
				regular: "px-2.5 py-0.5 text-xs",
				md: "px-3 py-1 text-sm",
				lg: "px-4 py-1.5 text-sm",
				xl: "px-5 py-2 text-base",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "regular",
		},
	},
)

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
	return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { Badge, badgeVariants }
export default Badge
