"use client"

import DOMPurify from "dompurify"
import { useEffect, useState } from "react"
import { cn } from "@/utils/lib/shadcn-ui"

interface SafeHtmlProps {
	htmlContent: string
	variant?: "default" | "article" | "content"
	className?: string
}

const variantStyles = {
	default: "",
	article: "prose prose-sm dark:prose-invert max-w-none",
	content: "prose prose-sm dark:prose-invert",
}

const SafeHtml = ({ htmlContent, variant = "default", className, ...props }: SafeHtmlProps) => {
	const [sanitizedHtml, setSanitizedHtml] = useState("")

	useEffect(() => {
		const cleanHtml = DOMPurify.sanitize(htmlContent)
		setSanitizedHtml(cleanHtml)
	}, [htmlContent])

	return (
		<div
			className={cn(variantStyles[variant], className)}
			dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
			{...props}
		/>
	)
}

export default SafeHtml
