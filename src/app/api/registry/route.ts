import { nanoid } from "nanoid"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { isDemoMode } from "@/utils/constants/registry"
import { auth } from "@/utils/lib/auth"
import { db } from "@/utils/lib/db"
import { registry } from "@/utils/lib/db/schema"
import type { Registry } from "@/utils/types/registry.interface"

function getDemoRegistries(userId: string): Registry[] {
	const now = new Date().toISOString()
	return [
		{
			id: "demo-registry-1",
			url: "https://demo-registry-1.example.com",
			username: "demo-user-1",
			password: "demo-password-1",
			userId,
			createdAt: now,
			updatedAt: now,
		},
		{
			id: "demo-registry-2",
			url: "https://demo-registry-2.example.com",
			username: "demo-user-2",
			password: "demo-password-2",
			userId,
			createdAt: now,
			updatedAt: now,
		},
	]
}

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		})

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		if (isDemoMode()) {
			const demoRegistries = getDemoRegistries(session.user.id)
			return NextResponse.json({ registries: demoRegistries })
		}

		const registries = await db.select().from(registry)

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

		if (isDemoMode()) {
			return NextResponse.json({ error: "Cannot create registries in demo mode" }, { status: 403 })
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
