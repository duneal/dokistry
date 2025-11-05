"use client"

import type { ReactNode } from "react"
import { AppSidebar, Header } from "@/app/_components/shared"
import { SidebarInset, SidebarProvider } from "@/app/_components/ui"

export default function MiddleOfficeLayout({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<Header />
				{children}
			</SidebarInset>
		</SidebarProvider>
	)
}
