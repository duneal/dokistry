"use server"

import crypto from "node:crypto"
import axios from "axios"
import { APIError } from "better-auth/api"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth, authAdmin } from "./auth"
import { db } from "./db"
import { registry, user } from "./db/schema"

function normalizeRegistryUrl(registryUrl: string) {
	const trimmed = registryUrl.trim()
	const normalized = trimmed.replace(/\/+$/, "")
	return normalized || trimmed
}

export async function signInAction(formData: FormData) {
	const email = formData.get("email") as string
	const password = formData.get("password") as string
	const rememberMe = formData.get("rememberMe") === "on"

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

		console.error("Signin error details:", error)
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

export async function getRegistriesList() {
	try {
		const session = await getSession()
		if (!session?.user) {
			redirect("/signin")
		}

		const registries = await db.select().from(registry)

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

		// Verify the registry exists
		const registryExists = await db
			.select()
			.from(registry)
			.where(eq(registry.id, registryId))
			.limit(1)

		if (registryExists.length === 0) {
			return { error: "Registry not found" }
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

		await axios.get(`${baseUrl}/v2/`, {
			headers: {
				Authorization: `Basic ${auth}`,
				Accept: "application/json",
				"User-Agent": "Dokistry/1.0",
			},
			timeout: 10000,
		})

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

		if (session.user.role !== "admin") {
			return { error: "Unauthorized: Only admins can create registries" }
		}

		const normalizedUrl = normalizeRegistryUrl(url)

		const existingRegistries = await db
			.select({ id: registry.id, url: registry.url })
			.from(registry)

		const duplicateRegistry = existingRegistries.some(
			(existingRegistry) => normalizeRegistryUrl(existingRegistry.url) === normalizedUrl,
		)

		if (duplicateRegistry) {
			return { error: "A registry with this URL already exists" }
		}

		const newRegistry = await db
			.insert(registry)
			.values({
				id: crypto.randomUUID(),
				url: normalizedUrl,
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

		if (session.user.role !== "admin") {
			return { error: "Unauthorized: Only admins can update registries" }
		}

		const normalizedUrl = normalizeRegistryUrl(url)

		// Verify the registry exists
		const userRegistry = await db
			.select()
			.from(registry)
			.where(eq(registry.id, registryId))
			.limit(1)

		if (userRegistry.length === 0) {
			return { error: "Registry not found" }
		}

		const allRegistries = await db.select({ id: registry.id, url: registry.url }).from(registry)

		const duplicateRegistry = allRegistries.some(
			(existingRegistry) =>
				existingRegistry.id !== registryId &&
				normalizeRegistryUrl(existingRegistry.url) === normalizedUrl,
		)

		if (duplicateRegistry) {
			return { error: "A registry with this URL already exists" }
		}

		// Prepare update data - only update password if provided
		const updateData: {
			url: string
			username: string
			password?: string
			updatedAt: Date
		} = {
			url: normalizedUrl,
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

		if (session.user.role !== "admin") {
			return { error: "Unauthorized: Only admins can delete registries" }
		}

		// Verify the registry exists
		const userRegistry = await db
			.select()
			.from(registry)
			.where(eq(registry.id, registryId))
			.limit(1)

		if (userRegistry.length === 0) {
			return { error: "Registry not found" }
		}

		// Check if this is any user's selected registry (admin can delete any registry)
		const usersWithSelectedRegistry = await db
			.select({
				id: user.id,
				selectedRegistryId: user.selectedRegistryId,
			})
			.from(user)
			.where(eq(user.selectedRegistryId, registryId))

		// Delete the registry
		await db.delete(registry).where(eq(registry.id, registryId))

		// For each user who had this registry selected, update their selection
		for (const userData of usersWithSelectedRegistry) {
			const remainingRegistries = await db.select().from(registry).limit(1)

			if (remainingRegistries.length > 0) {
				// Select the first remaining registry for this user
				await db
					.update(user)
					.set({ selectedRegistryId: remainingRegistries[0].id })
					.where(eq(user.id, userData.id))
			} else {
				// Clear selection if no registries remain
				await db.update(user).set({ selectedRegistryId: null }).where(eq(user.id, userData.id))
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
			const firstRegistry = await db.select().from(registry).limit(1)

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
			return { error: error.message || "Failed to create account" }
		}

		return { error: "An unexpected error occurred" }
	}
}

export async function changeUserPassword(
	userId: string,
	newPassword: string,
	currentPassword?: string,
) {
	try {
		const session = await getSession()
		if (!session?.user) {
			return { error: "Unauthorized" }
		}

		const headersList = await headers()

		// If changing own password, use Better Auth's changePassword API (requires current password)
		if (session.user.id === userId) {
			if (!currentPassword || currentPassword.trim() === "") {
				return { error: "Current password is required to change your password" }
			}

			const changePasswordResult = await auth.api.changePassword({
				body: {
					currentPassword,
					newPassword,
				},
				headers: headersList,
			})

			if (!changePasswordResult) {
				return { error: "Failed to update password" }
			}

			return { success: true }
		}

		// If admin changing another user's password, use Better Auth's setUserPassword API
		if (session.user.role !== "admin") {
			return { error: "Unauthorized: Only admins can change other users' passwords" }
		}

		// Always use Better Auth's setUserPassword API for admin password changes - no fallback
		const setPasswordResult = await auth.api.setUserPassword({
			body: {
				userId,
				newPassword,
			},
			headers: headersList,
		})

		if (!setPasswordResult) {
			return { error: "Failed to update password" }
		}

		return { success: true }
	} catch (error) {
		if (error instanceof APIError) {
			console.error("Password update error:", error.message, error.status)
			return { error: error.message || "Failed to update password" }
		}
		console.error("Error updating password:", error)
		return { error: "Failed to update password" }
	}
}

export async function updateUserPassword(currentPassword: string, newPassword: string) {
	try {
		const session = await getSession()
		if (!session?.user) {
			return { error: "Unauthorized" }
		}

		return await changeUserPassword(session.user.id, newPassword, currentPassword)
	} catch (error) {
		console.error("Error updating password:", error)
		return { error: "Failed to update password" }
	}
}

export async function updateUserEmail(newEmail: string) {
	try {
		const session = await getSession()
		if (!session?.user) {
			return { error: "Unauthorized" }
		}

		const headersList = await headers()

		const existingUser = await db.select().from(user).where(eq(user.email, newEmail)).limit(1)

		if (existingUser.length > 0 && existingUser[0].id !== session.user.id) {
			return { error: "A user with this email already exists" }
		}

		await auth.api.changeEmail({
			body: {
				newEmail,
			},
			headers: headersList,
		})

		return { success: true }
	} catch (error) {
		if (error instanceof APIError) {
			console.error("Email update error:", error.message, error.status)
			return { error: error.message || "Failed to update email" }
		}
		console.error("Error updating email:", error)
		return { error: "Failed to update email" }
	}
}

export async function getAllUsers() {
	try {
		const session = await getSession()
		if (!session?.user) {
			redirect("/signin")
		}

		if (session.user.role !== "admin") {
			return { error: "Unauthorized" }
		}

		const users = await db.select().from(user)

		const formattedUsers = users.map((u) => ({
			...u,
			createdAt: u.createdAt.toISOString(),
			updatedAt: u.updatedAt.toISOString(),
		}))

		return { users: formattedUsers }
	} catch (error) {
		console.error("Error fetching users:", error)
		return { error: "Failed to fetch users" }
	}
}

export async function createUser(
	email: string,
	password: string,
	name: string,
	role?: "admin" | "user",
) {
	try {
		const session = await getSession()
		if (!session?.user) {
			redirect("/signin")
		}

		if (session.user.role !== "admin") {
			return { error: "Unauthorized" }
		}

		const existingUser = await db.select().from(user).where(eq(user.email, email)).limit(1)

		if (existingUser.length > 0) {
			return { error: "A user with this email already exists" }
		}

		// Use authAdmin to avoid auto sign-in when creating users from admin interface
		const signupResult = await authAdmin.api.signUpEmail({
			body: {
				email,
				password,
				name,
			},
		})

		if (!signupResult.user) {
			return { error: "Failed to create user" }
		}

		// Update role if needed (Better Auth creates users with default role "user")
		if (role && role !== "user") {
			const headersList = await headers()
			await auth.api.setRole({
				body: {
					userId: signupResult.user.id,
					role: role,
				},
				headers: headersList,
			})
		}

		// Fetch the updated user from database to get the correct role
		const newUser = await db.select().from(user).where(eq(user.id, signupResult.user.id)).limit(1)

		if (newUser.length === 0) {
			return { error: "Failed to retrieve created user" }
		}

		const formattedUser = {
			...newUser[0],
			createdAt: newUser[0].createdAt.toISOString(),
			updatedAt: newUser[0].updatedAt.toISOString(),
		}

		return { user: formattedUser }
	} catch (error) {
		if (error instanceof APIError) {
			console.error("Create user error:", error.message, error.status)
			return { error: error.message || "Failed to create user" }
		}
		console.error("Error creating user:", error)
		return { error: "Failed to create user" }
	}
}

export async function updateUser(
	userId: string,
	email?: string,
	password?: string,
	name?: string,
	role?: "admin" | "user",
) {
	try {
		const session = await getSession()
		if (!session?.user) {
			redirect("/signin")
		}

		if (session.user.role !== "admin") {
			return { error: "Unauthorized" }
		}

		const userToUpdate = await db.select().from(user).where(eq(user.id, userId)).limit(1)

		if (userToUpdate.length === 0) {
			return { error: "User not found" }
		}

		const headersList = await headers()

		// Prepare data for Better Auth's adminUpdateUser API
		const updateData: { email?: string; name?: string } = {}

		if (email && email !== userToUpdate[0].email) {
			const existingUser = await db.select().from(user).where(eq(user.email, email)).limit(1)

			if (existingUser.length > 0 && existingUser[0].id !== userId) {
				return { error: "A user with this email already exists" }
			}

			updateData.email = email
		}

		if (name && name !== userToUpdate[0].name) {
			updateData.name = name
		}

		// Use Better Auth's adminUpdateUser API for user data updates (name, email)
		if (Object.keys(updateData).length > 0) {
			await auth.api.adminUpdateUser({
				body: {
					userId,
					data: updateData,
				},
				headers: headersList,
			})
		}

		// Use Better Auth's setRole API for role updates
		if (role && role !== userToUpdate[0].role) {
			await auth.api.setRole({
				body: {
					userId,
					role,
				},
				headers: headersList,
			})
		}

		// Use Better Auth's setUserPassword API for password updates
		if (password && password.trim() !== "") {
			const passwordResult = await changeUserPassword(userId, password)

			if (passwordResult.error) {
				return { error: passwordResult.error }
			}
		}

		// Fetch updated user from database
		const updatedUser = await db.select().from(user).where(eq(user.id, userId)).limit(1)

		if (updatedUser.length === 0) {
			return { error: "Failed to retrieve updated user" }
		}

		const formattedUser = {
			...updatedUser[0],
			createdAt: updatedUser[0].createdAt.toISOString(),
			updatedAt: updatedUser[0].updatedAt.toISOString(),
		}

		return { user: formattedUser }
	} catch (error) {
		if (error instanceof APIError) {
			console.error("Update user error:", error.message, error.status)
			return { error: error.message || "Failed to update user" }
		}
		console.error("Error updating user:", error)
		return { error: "Failed to update user" }
	}
}

export async function deleteUser(userId: string) {
	try {
		const session = await getSession()
		if (!session?.user) {
			redirect("/signin")
		}

		if (session.user.role !== "admin") {
			return { error: "Unauthorized" }
		}

		if (session.user.id === userId) {
			return { error: "Cannot delete your own account" }
		}

		const userToDelete = await db.select().from(user).where(eq(user.id, userId)).limit(1)

		if (userToDelete.length === 0) {
			return { error: "User not found" }
		}

		// Admin deletion: Better Auth's deleteUser API is designed for users deleting
		// their own account (requires password or fresh session). For admin deletion
		// of other users, we use direct database deletion. Better Auth's schema uses
		// CASCADE deletes, so related records (sessions, accounts, etc.) will be
		// automatically deleted by the database foreign key constraints.
		await db.delete(user).where(eq(user.id, userId))

		return { success: true }
	} catch (error) {
		if (error instanceof APIError) {
			console.error("Delete user error:", error.message, error.status)
			return { error: error.message || "Failed to delete user" }
		}
		console.error("Error deleting user:", error)
		return { error: "Failed to delete user" }
	}
}
