import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export function middleware(_request: NextRequest) {
	return NextResponse.next()
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|favicons|icons|images).*)"],
}
