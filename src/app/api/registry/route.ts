import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { auth } from "@/utils/lib/auth"
import { db } from "@/utils/lib/db"
import { registry } from "@/utils/lib/db/schema"

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		})

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const registries = await db.select().from(registry).where(eq(registry.userId, session.user.id))

		return NextResponse.json({ registries })
	} catch (error) {
		console.error("Error fetching registries:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		})

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const body = await request.json()
		const { url, username, password } = body

		if (!url || !username || !password) {
			return NextResponse.json(
				{ error: "Missing required fields: url, username, password" },
				{ status: 400 },
			)
		}

		const newRegistry = await db
			.insert(registry)
			.values({
				id: nanoid(),
				url,
				username,
				password,
				userId: session.user.id,
			})
			.returning()

		return NextResponse.json({ registry: newRegistry[0] })
	} catch (error) {
		console.error("Error creating registry:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}
