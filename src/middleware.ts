import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { auth } from "@/utils/lib/auth"
import { APP_URL } from "./utils/constants/config"

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	let session = null
	try {
		session = await auth.api.getSession({ headers: request.headers })
	} catch {
		// Session retrieval failed, treat as unauthenticated
		session = null
	}

	// Not authenticated → check if admin exists to determine redirect
	if (!session) {
		const adminExists = await fetch(`${APP_URL}/api/admin/exists`, {
			cache: "no-store",
		})

		// If no admin exists, redirect to signup
		if (!adminExists && pathname !== "/signup") {
			return NextResponse.redirect(new URL("/signup", request.url))
		}

		// If admin exists, redirect to signin
		if (adminExists && pathname !== "/signin") {
			return NextResponse.redirect(new URL("/signin", request.url))
		}
	}

	// Authenticated → always redirect to dashboard
	if (session && pathname !== "/dashboard" && !pathname.startsWith("/images/")) {
		return NextResponse.redirect(new URL("/dashboard", request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
