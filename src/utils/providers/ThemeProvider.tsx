"use client"

import { type Attribute, ThemeProvider as NextThemesProvider } from "next-themes"
import type { ReactNode } from "react"

interface ThemeProviderProps {
	children: ReactNode
	attribute?: string
	defaultTheme?: string
	enableSystem?: boolean
	disableTransitionOnChange?: boolean
}

export function ThemeProvider({
	children,
	attribute = "class",
	defaultTheme = "system",
	enableSystem = true,
	disableTransitionOnChange = true,
	...props
}: ThemeProviderProps) {
	return (
		<NextThemesProvider
			attribute={attribute as Attribute | Attribute[] | undefined}
			defaultTheme={defaultTheme}
			enableSystem={enableSystem}
			disableTransitionOnChange={disableTransitionOnChange}
			{...props}
		>
			{children}
		</NextThemesProvider>
	)
}
