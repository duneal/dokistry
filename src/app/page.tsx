import { redirect } from "next/navigation"

export default async function RootPage() {
	// This page should never be reached due to middleware redirects
	// But if it is, redirect to dashboard as fallback
	redirect("/dashboard")
}
