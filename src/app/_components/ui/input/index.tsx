import clsx from "clsx"
import type React from "react"
import "./input.scss"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	variant?: "default" | "error" | "success" | "warning"
}

const Input = ({
	type = "text",
	variant = "default",
	className,
	...props
}: React.ComponentProps<"input"> & InputProps) => {
	const inputClassName = clsx("input", `input--type-${type}`, `input--${variant}`, className)

	return <input className={inputClassName} type={type} {...props} />
}

export default Input
