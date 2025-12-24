import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"
import { Toaster } from "sonner"

import { ReactQueryProvider } from "@/utils/providers/ReactQueryProvider"
import { ThemeProvider } from "@/utils/providers/ThemeProvider"
import "./globals.css"

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
})

export const revalidate = 300 // 5 minutes

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: {
			default: "Dokistry",
			template: `%s | Dokistry`,
		},
		description:
			"🐋🎉 Manage your Docker images very easily, from a modern and easy to use interface.",
		robots: {
			index: false,
			follow: false,
		},
	}
}

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="fr" className={inter.variable} suppressHydrationWarning>
			<body className="font-sans antialiased">
				<ThemeProvider>
					<ReactQueryProvider>
						{children}
						<Toaster position="bottom-right" richColors />
					</ReactQueryProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
