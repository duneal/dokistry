"use server"

import axios from "axios"
import { APIError } from "better-auth/api"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "./auth"
import { db } from "./db"
import { registry, user } from "./db/schema"

export async function signInAction(formData: FormData) {
	const email = formData.get("email") as string
	const password = formData.get("password") as string
	const rememberMe = formData.get("rememberMe") === "on"

	console.log(rememberMe)

	try {
		// With nextCookies plugin, cookies are automatically set
		const result = await auth.api.signInEmail({
			body: {
				email,
				password,
				rememberMe,
			},
		})

		if (!result.user) {
			redirect("/signin?error=invalid-credentials")
		}

		redirect("/dashboard")
	} catch (error) {
		// Check if this is a redirect error (which is expected)
		if (error instanceof Error && error.message === "NEXT_REDIRECT") {
			// Re-throw redirect errors so Next.js can handle them
			throw error
		}

		// Handle API errors
		if (error instanceof APIError) {
			console.log(error.message, error.status)
		}

		redirect("/signin?error=unexpected-error")
	}
}

export async function signUpAction(formData: FormData) {
	const email = formData.get("email") as string
	const password = formData.get("password") as string
	const confirmPassword = formData.get("confirmPassword") as string

	if (password !== confirmPassword) {
		redirect("/signup?error=password-mismatch")
	}

	try {
		// Check if any admin exists
		const adminExists = await db.select().from(user).where(eq(user.role, "admin")).limit(1)

		// If admin exists, prevent signup
		if (adminExists.length > 0) {
			redirect("/signup?error=registration-unavailable")
		}

		// With nextCookies plugin, cookies are automatically set
		const result = await auth.api.signUpEmail({
			body: {
				name: email.split("@")[0], // Use email prefix as name
				email,
				password,
			},
		})

		// Better Auth returns success if user is created, null if not
		if (!result.user) {
			redirect("/signup?error=account-creation-failed")
		}

		// If no admin exists, promote the first user to admin
		const currentAdminCheck = await db.select().from(user).where(eq(user.role, "admin")).limit(1)

		if (currentAdminCheck.length === 0 && result.user.id) {
			const headersList = await headers()
			await auth.api.setRole({
				body: {
					userId: result.user.id,
					role: "admin",
				},
				headers: headersList,
			})
		}

		redirect("/dashboard")
	} catch (error) {
		// Check if this is a redirect error (which is expected)
		if (error instanceof Error && error.message === "NEXT_REDIRECT") {
			// Re-throw redirect errors so Next.js can handle them
			throw error
		}

		// Handle API errors
		if (error instanceof APIError) {
			console.log(error.message, error.status)
		}

		console.error("Signup error details:", error)
		redirect("/signup?error=unexpected-error")
	}
}

export async function signUp(email: string, password: string) {
	try {
		// Check if any admin exists
		const adminExists = await db.select().from(user).where(eq(user.role, "admin")).limit(1)

		// If admin exists, prevent signup
		if (adminExists.length > 0) {
			return { error: "Registration is not available" }
		}

		const result = await auth.api.signUpEmail({
			body: {
				name: email.split("@")[0], // Use email prefix as name
				email,
				password,
				callbackURL: "/dashboard",
			},
		})

		// Better Auth returns success if user is created, null if not
		if (!result.user) {
			return { error: "Failed to create account" }
		}

		// If no admin exists, promote the first user to admin
		const currentAdminCheck = await db.select().from(user).where(eq(user.role, "admin")).limit(1)

		if (currentAdminCheck.length === 0 && result.user.id) {
			const headersList = await headers()
			await auth.api.setRole({
				body: {
					userId: result.user.id,
					role: "admin",
				},
				headers: headersList,
			})
		}

		return { success: true }
	} catch (error) {
		// Handle API errors
		if (error instanceof APIError) {
			console.log(error.message, error.status)
		}

		console.error("Signup error details:", error)
		return { error: "An unexpected error occurred" }
	}
}

export async function getSession() {
	try {
		const headersList = await headers()
		const session = await auth.api.getSession({
			headers: headersList,
		})
		return session
	} catch (error) {
		if (error instanceof APIError) {
			console.error("Session retrieval error:", error.message, error.status)
		}
		return null
	}
}

export async function checkAdminExists() {
	try {
		const adminExists = await db.select().from(user).where(eq(user.role, "admin")).limit(1)

		return adminExists.length > 0
	} catch {
		return false
	}
}

export async function getUserRegistries() {
	try {
		const session = await getSession()
		if (!session?.user) {
			redirect("/signin")
		}

		const registries = await db.select().from(registry).where(eq(registry.userId, session.user.id))

		// Convert Date objects to strings for the interface
		const formattedRegistries = registries.map((reg) => ({
			...reg,
			createdAt: reg.createdAt.toISOString(),
			updatedAt: reg.updatedAt.toISOString(),
		}))

		return { registries: formattedRegistries }
	} catch (error) {
		console.error("Error fetching registries:", error)
		return { error: "Failed to fetch registries" }
	}
}

export async function getUserWithSelectedRegistry() {
	try {
		const session = await getSession()
		if (!session?.user) {
			redirect("/signin")
		}

		const userData = await db
			.select({
				id: user.id,
				selectedRegistryId: user.selectedRegistryId,
			})
			.from(user)
			.where(eq(user.id, session.user.id))
			.limit(1)

		if (userData.length === 0) {
			return { error: "User not found" }
		}

		return { user: userData[0] }
	} catch (error) {
		console.error("Error fetching user:", error)
		return { error: "Failed to fetch user" }
	}
}

export async function updateSelectedRegistry(registryId: string) {
	try {
		const session = await getSession()
		if (!session?.user) {
			redirect("/signin")
		}

		// Verify the registry belongs to the user
		const userRegistry = await db
			.select()
			.from(registry)
			.where(eq(registry.id, registryId))
			.limit(1)

		if (userRegistry.length === 0) {
			return { error: "Registry not found" }
		}

		if (userRegistry[0].userId !== session.user.id) {
			return { error: "Unauthorized" }
		}

		// Update user's selected registry
		await db
			.update(user)
			.set({ selectedRegistryId: registryId })
			.where(eq(user.id, session.user.id))

		return { success: true }
	} catch (error) {
		console.error("Error updating selected registry:", error)
		return { error: "Failed to update selected registry" }
	}
}

export async function testRegistryConnection(
	url: string,
	username: string,
	password: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		const baseUrl = url.replace(/\/$/, "")
		const auth = Buffer.from(`${username}:${password}`).toString("base64")

		const result = await axios.get(`${baseUrl}/v2/`, {
			headers: {
				Authorization: `Basic ${auth}`,
				Accept: "application/json",
				"User-Agent": "Dokistry/1.0",
			},
			timeout: 10000,
		})

		console.log("Result:", result)

		return { success: true }
	} catch (error) {
		if (axios.isAxiosError(error)) {
			if (error.response?.status === 401) {
				return { success: false, error: "Authentication failed: Invalid credentials" }
			}
			if (error.response?.status === 403) {
				return { success: false, error: "Access forbidden: Insufficient permissions" }
			}
			if (error.response?.status === 404) {
				return { success: false, error: "Registry endpoint not found" }
			}
			if (error.code === "ECONNABORTED") {
				return { success: false, error: "Connection timeout: Registry did not respond" }
			}
			if (error.code === "ECONNREFUSED") {
				return { success: false, error: "Connection refused: Cannot reach registry" }
			}
			if (error.code === "ENOTFOUND") {
				return { success: false, error: "Host not found: Invalid registry URL" }
			}
			return {
				success: false,
				error: error.message || "Failed to connect to registry",
			}
		}
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
		}
	}
}

export async function createRegistry(url: string, username: string, password: string) {
	try {
		const session = await getSession()
		if (!session?.user) {
			redirect("/signin")
		}

		const newRegistry = await db
			.insert(registry)
			.values({
				id: crypto.randomUUID(),
				url,
				username,
				password,
				userId: session.user.id,
			})
			.returning()

		// Convert Date objects to strings for the interface
		const formattedRegistry = {
			...newRegistry[0],
			createdAt: newRegistry[0].createdAt.toISOString(),
			updatedAt: newRegistry[0].updatedAt.toISOString(),
		}

		return { registry: formattedRegistry }
	} catch (error) {
		// Check if this is a redirect error (which is expected)
		if (error instanceof Error && error.message === "NEXT_REDIRECT") {
			// Re-throw redirect errors so Next.js can handle them
			throw error
		}

		console.error("Error creating registry:", error)
		return { error: "Failed to create registry" }
	}
}

export async function updateRegistry(
	registryId: string,
	url: string,
	username: string,
	password: string,
) {
	try {
		const session = await getSession()
		if (!session?.user) {
			redirect("/signin")
		}

		// Verify the registry belongs to the user
		const userRegistry = await db
			.select()
			.from(registry)
			.where(eq(registry.id, registryId))
			.limit(1)

		if (userRegistry.length === 0) {
			return { error: "Registry not found" }
		}

		if (userRegistry[0].userId !== session.user.id) {
			return { error: "Unauthorized" }
		}

		// Prepare update data - only update password if provided
		const updateData: {
			url: string
			username: string
			password?: string
			updatedAt: Date
		} = {
			url,
			username,
			updatedAt: new Date(),
		}

		// Only update password if it's provided (not empty)
		if (password && password.trim() !== "") {
			updateData.password = password
		}

		// Update the registry
		const updatedRegistry = await db
			.update(registry)
			.set(updateData)
			.where(eq(registry.id, registryId))
			.returning()

		// Convert Date objects to strings for the interface
		const formattedRegistry = {
			...updatedRegistry[0],
			createdAt: updatedRegistry[0].createdAt.toISOString(),
			updatedAt: updatedRegistry[0].updatedAt.toISOString(),
		}

		return { registry: formattedRegistry }
	} catch (error) {
		// Check if this is a redirect error (which is expected)
		if (error instanceof Error && error.message === "NEXT_REDIRECT") {
			// Re-throw redirect errors so Next.js can handle them
			throw error
		}

		console.error("Error updating registry:", error)
		return { error: "Failed to update registry" }
	}
}

export async function deleteRegistry(registryId: string) {
	try {
		const session = await getSession()
		if (!session?.user) {
			redirect("/signin")
		}

		// Verify the registry belongs to the user
		const userRegistry = await db
			.select()
			.from(registry)
			.where(eq(registry.id, registryId))
			.limit(1)

		if (userRegistry.length === 0) {
			return { error: "Registry not found" }
		}

		if (userRegistry[0].userId !== session.user.id) {
			return { error: "Unauthorized" }
		}

		// Check if this is the user's selected registry
		const userData = await db
			.select({
				selectedRegistryId: user.selectedRegistryId,
			})
			.from(user)
			.where(eq(user.id, session.user.id))
			.limit(1)

		const isSelectedRegistry = userData[0]?.selectedRegistryId === registryId

		// Delete the registry
		await db.delete(registry).where(eq(registry.id, registryId))

		// If this was the selected registry, clear the selection or select another one
		if (isSelectedRegistry) {
			const remainingRegistries = await db
				.select()
				.from(registry)
				.where(eq(registry.userId, session.user.id))
				.limit(1)

			if (remainingRegistries.length > 0) {
				// Select the first remaining registry
				await db
					.update(user)
					.set({ selectedRegistryId: remainingRegistries[0].id })
					.where(eq(user.id, session.user.id))
			} else {
				// Clear selection if no registries remain
				await db.update(user).set({ selectedRegistryId: null }).where(eq(user.id, session.user.id))
			}
		}

		return { success: true }
	} catch (error) {
		// Check if this is a redirect error (which is expected)
		if (error instanceof Error && error.message === "NEXT_REDIRECT") {
			// Re-throw redirect errors so Next.js can handle them
			throw error
		}

		console.error("Error deleting registry:", error)
		return { error: "Failed to delete registry" }
	}
}

export async function getCurrentSelectedRegistry() {
	try {
		const session = await getSession()
		if (!session?.user) {
			redirect("/signin")
		}

		// Get user with selected registry
		const userData = await db
			.select({
				id: user.id,
				selectedRegistryId: user.selectedRegistryId,
			})
			.from(user)
			.where(eq(user.id, session.user.id))
			.limit(1)

		if (userData.length === 0) {
			return { error: "User not found" }
		}

		const userRecord = userData[0]

		// If no selected registry, get the first one
		if (!userRecord.selectedRegistryId) {
			const firstRegistry = await db
				.select()
				.from(registry)
				.where(eq(registry.userId, session.user.id))
				.limit(1)

			if (firstRegistry.length === 0) {
				return { error: "No registries found" }
			}

			// Auto-select the first registry
			await db
				.update(user)
				.set({ selectedRegistryId: firstRegistry[0].id })
				.where(eq(user.id, session.user.id))

			return { registry: firstRegistry[0] }
		}

		// Get the selected registry
		const selectedRegistry = await db
			.select()
			.from(registry)
			.where(eq(registry.id, userRecord.selectedRegistryId))
			.limit(1)

		if (selectedRegistry.length === 0) {
			return { error: "Selected registry not found" }
		}

		return { registry: selectedRegistry[0] }
	} catch (error) {
		console.error("Error getting current selected registry:", error)
		return { error: "Failed to get current selected registry" }
	}
}

export async function createFirstAdminUser(email: string, password: string, name: string) {
	try {
		// Check if any admin exists
		let adminExists: (typeof user.$inferSelect)[]
		try {
			adminExists = await db.select().from(user).where(eq(user.role, "admin")).limit(1)
		} catch (dbError) {
			console.error("Database query error when checking admin:", dbError)
			return {
				error:
					"Database connection error. Please ensure the database is running and migrations have been applied.",
			}
		}

		// If admin exists, prevent creation
		if (adminExists.length > 0) {
			return { error: "Registration is not available" }
		}

		// Create user normally (this handles password hashing, etc.)
		const signupResult = await auth.api.signUpEmail({
			body: {
				email,
				password,
				name,
			},
		})

		if (!signupResult.user) {
			return { error: "Failed to create account" }
		}

		// Directly update database to set admin role (bypassing Better Auth permission checks)
		// This is safe because we've verified no admin exists
		await db.update(user).set({ role: "admin" }).where(eq(user.id, signupResult.user.id))

		return { success: true, user: signupResult.user }
	} catch (error) {
		console.error("Create first admin user error:", error)

		if (error instanceof APIError) {
			console.error("API Error:", error.message, error.status)
		}

		return { error: "An unexpected error occurred" }
	}
}
