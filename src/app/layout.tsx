import type { Metadata, Viewport } from "next"

import type { ReactNode } from "react"
import { Toaster } from "sonner"

import { nunitoSans } from "@/utils/fonts"
import { ReactQueryProvider } from "@/utils/providers/ReactQueryProvider"

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
		<html lang="fr">
			<body className={`${nunitoSans.variable}`}>
				<ReactQueryProvider>
					{children}
					<Toaster position="bottom-right" richColors />
				</ReactQueryProvider>
			</body>
		</html>
	)
}
