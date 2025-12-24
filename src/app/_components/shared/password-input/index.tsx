"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Input } from "@/app/_components/ui/input"
import { cn } from "@/utils/lib/shadcn-ui"

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	variant?: "default" | "error" | "success" | "warning"
}

const PasswordInput = ({ variant = "default", className, ...props }: PasswordInputProps) => {
	const [showPassword, setShowPassword] = useState(false)

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword)
	}

	return (
		<div className="relative">
			<Input
				type={showPassword ? "text" : "password"}
				variant={variant}
				className={cn("pr-10", className)}
				{...props}
			/>
			<button
				type="button"
				className="absolute right-0 top-0 h-full px-3 py-2 cursor-pointer hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
				onClick={togglePasswordVisibility}
				aria-label={showPassword ? "Hide password" : "Show password"}
			>
				{showPassword ? (
					<EyeOff className="h-4 w-4" strokeWidth={1.5} />
				) : (
					<Eye className="h-4 w-4" strokeWidth={1.5} />
				)}
			</button>
		</div>
	)
}

export default PasswordInput
