import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { Session, User } from "@/utils/types/auth.interface"
import { auth } from "./auth"
import { db } from "./db"
import { user } from "./db/schema"

export interface ValidatedSession {
	session: Session
	user: User
}

export async function validateSession(): Promise<ValidatedSession | null> {
	try {
		const headersList = await headers()
		const sessionData = await auth.api.getSession({
			headers: headersList,
		})

		if (!sessionData?.session || !sessionData?.user) {
			return null
		}

		return {
			session: sessionData.session as Session,
			user: sessionData.user as User,
		}
	} catch {
		return null
	}
}

export async function requireAuth(): Promise<ValidatedSession> {
	const session = await validateSession()

	if (!session) {
		const adminExists = await checkAdminExists()

		if (!adminExists) {
			redirect("/signup")
		}

		redirect("/signin")
	}

	return session
}

export async function requireGuest(): Promise<void> {
	const session = await validateSession()

	if (session) {
		redirect("/dashboard")
	}
}

export async function checkAdminExists(): Promise<boolean> {
	try {
		const adminUsers = await db.select().from(user).where(eq(user.role, "admin")).limit(1)

		return adminUsers.length > 0
	} catch {
		return false
	}
}

export async function requireSignupAccess(): Promise<void> {
	const session = await validateSession()

	if (session) {
		redirect("/dashboard")
	}

	const adminExists = await checkAdminExists()

	if (adminExists) {
		redirect("/signin")
	}
}

export async function requireSigninAccess(): Promise<void> {
	const session = await validateSession()

	if (session) {
		redirect("/dashboard")
	}

	const adminExists = await checkAdminExists()

	if (!adminExists) {
		redirect("/signup")
	}
}
