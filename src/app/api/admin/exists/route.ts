import { NextResponse } from "next/server"
import { checkAdminExists } from "@/utils/lib/auth-actions"

export async function GET() {
	try {
		const adminExists = await checkAdminExists()
		return NextResponse.json({ adminExists })
	} catch (error) {
		console.error("Error checking admin existence:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}
