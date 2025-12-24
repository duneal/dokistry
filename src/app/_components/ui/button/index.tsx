import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import type * as React from "react"
import { cn } from "@/utils/lib/shadcn-ui"

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
				primary: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
				secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
				tertiary: "bg-muted text-muted-foreground hover:bg-muted/80",
				destructive: "bg-destructive text-white shadow-sm hover:bg-destructive/90",
				danger: "bg-destructive text-white shadow-sm hover:bg-destructive/90",
				success:
					"bg-emerald-600 text-white shadow-sm hover:bg-emerald-600/90 dark:bg-emerald-500 dark:hover:bg-emerald-500/90",
				warning:
					"bg-amber-500 text-white shadow-sm hover:bg-amber-500/90 dark:bg-amber-600 dark:hover:bg-amber-600/90",
				outline:
					"border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				xs: "h-7 px-2 text-xs rounded",
				sm: "h-8 px-3 text-xs rounded-md",
				regular: "h-9 px-4 py-2",
				md: "h-10 px-4 py-2",
				lg: "h-11 px-6 text-base rounded-md",
				xl: "h-12 px-8 text-base rounded-lg",
				icon: "h-9 w-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "regular",
		},
	},
)

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
	loading?: boolean
}

function Button({
	className,
	variant,
	size,
	asChild = false,
	loading = false,
	disabled,
	children,
	...props
}: ButtonProps) {
	const Comp = asChild ? Slot : "button"

	if (asChild) {
		return (
			<Comp className={cn(buttonVariants({ variant, size, className }))} {...props}>
				{children}
			</Comp>
		)
	}

	return (
		<Comp
			className={cn(buttonVariants({ variant, size, className }))}
			disabled={disabled || loading}
			{...props}
		>
			{loading && <Loader2 className="animate-spin" />}
			{children}
		</Comp>
	)
}

export { Button, buttonVariants }
export default Button
