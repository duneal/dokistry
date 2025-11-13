import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { MIDDLE_OFFICE_PATHS } from "./utils/constants/navigation"

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	const baseUrl = new URL(request.url).origin

	let session = null
	try {
		const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
			headers: {
				cookie: request.headers.get("cookie") || "",
			},
			cache: "no-store",
		})
		const sessionData = await sessionResponse.json()
		session = sessionData.session
	} catch {
		session = null
	}

	if (!session) {
		try {
			const adminResponse = await fetch(`${baseUrl}/api/admin/exists`, {
				cache: "no-store",
			})
			const adminData = await adminResponse.json()
			const adminExists = adminData.adminExists

			if (!adminExists && pathname !== "/signup") {
				return NextResponse.redirect(new URL("/signup", request.url))
			}

			if (adminExists && pathname !== "/signin") {
				return NextResponse.redirect(new URL("/signin", request.url))
			}
		} catch {
			if (pathname !== "/signin") {
				return NextResponse.redirect(new URL("/signin", request.url))
			}
		}
	}

	// Authenticated → always redirect to dashboard
	if (
		session &&
		!Object.values(MIDDLE_OFFICE_PATHS).includes(pathname as keyof typeof MIDDLE_OFFICE_PATHS) &&
		!Object.values(MIDDLE_OFFICE_PATHS).some((p) => pathname.startsWith(p))
	) {
		return NextResponse.redirect(new URL(MIDDLE_OFFICE_PATHS.DASHBOARD, request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
