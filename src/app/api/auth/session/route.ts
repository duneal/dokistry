import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { auth } from "@/utils/lib/auth"

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: request.headers })
		return NextResponse.json({ session })
	} catch {
		return NextResponse.json({ session: null })
	}
}
