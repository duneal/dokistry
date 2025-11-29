import type { ReactNode } from "react"
import { AppSidebar, Header } from "@/app/_components/shared"
import { SidebarInset, SidebarProvider } from "@/app/_components/ui"
import { requireAuth } from "@/utils/lib/auth-validate"

export default async function MiddleOfficeLayout({ children }: { children: ReactNode }) {
	await requireAuth()

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
