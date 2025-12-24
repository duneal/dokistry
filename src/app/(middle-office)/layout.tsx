import type { ReactNode } from "react"
import { requireAuth } from "@/utils/lib/auth-validate"
import { MiddleOfficeLayoutClient } from "./_components/middle-office-layout-client"

export default async function MiddleOfficeLayout({ children }: { children: ReactNode }) {
	await requireAuth()

	return <MiddleOfficeLayoutClient>{children}</MiddleOfficeLayoutClient>
}
