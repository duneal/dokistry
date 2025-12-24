"use client"

import type { ReactNode } from "react"
import { AppSidebar, Header } from "@/app/_components/shared"
import { SidebarInset, SidebarProvider } from "@/app/_components/ui"

interface MiddleOfficeLayoutClientProps {
	children: ReactNode
}

export function MiddleOfficeLayoutClient({ children }: MiddleOfficeLayoutClientProps) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<Header />
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
