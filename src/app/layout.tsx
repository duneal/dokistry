import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import type { ReactNode } from "react"
import { Toaster } from "sonner"

import { ReactQueryProvider } from "@/utils/providers/ReactQueryProvider"
import { ThemeProvider } from "@/utils/providers/ThemeProvider"
import type { Locale } from "@/utils/types/i18n.interface"
import { locales } from "@/utils/types/i18n.interface"
import "./globals.css"

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
})

export const revalidate = 300

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

export default async function RootLayout({ children }: { children: ReactNode }) {
	const cookieStore = await cookies()
	const localeCookie = cookieStore.get("NEXT_LOCALE")?.value
	const locale = (locales.includes(localeCookie as Locale) ? localeCookie : "en") as Locale
	const messages = await import(`../i18n/messages/${locale}.json`).then((m) => m.default)

	return (
		<html lang={locale} className={inter.variable} suppressHydrationWarning>
			<body className="font-sans antialiased">
				<NextIntlClientProvider messages={messages} locale={locale}>
					<ThemeProvider>
						<ReactQueryProvider>
							{children}
							<Toaster position="bottom-right" richColors />
						</ReactQueryProvider>
					</ThemeProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	)
}
