import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
	const response = NextResponse.next()

	const locale = request.cookies.get("NEXT_LOCALE")?.value || "en"
	response.cookies.set("NEXT_LOCALE", locale, {
		path: "/",
		maxAge: 60 * 60 * 24 * 365,
	})

	return response
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|favicons|icons|images).*)"],
}
