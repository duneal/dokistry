"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import Input from "@/app/_components/ui/input"

import "./password-input.scss"

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	variant?: "default" | "error" | "success" | "warning"
}

const PasswordInput = ({ variant = "default", className, ...props }: PasswordInputProps) => {
	const [showPassword, setShowPassword] = useState(false)

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword)
	}

	return (
		<div className="password-input">
			<Input
				type={showPassword ? "text" : "password"}
				variant={variant}
				className={className}
				{...props}
			/>
			<button
				type="button"
				className="password-input__toggle"
				onClick={togglePasswordVisibility}
				aria-label={showPassword ? "Hide password" : "Show password"}
			>
				{showPassword ? (
					<EyeOff className="password-input__toggle__icon" size={20} strokeWidth={1.2} />
				) : (
					<Eye className="password-input__toggle__icon" size={20} strokeWidth={1.2} />
				)}
			</button>
		</div>
	)
}

export default PasswordInput
