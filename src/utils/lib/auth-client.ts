"use client"

import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
	// baseURL: "http://127.0.0.1:3000",
	plugins: [adminClient()],
})

export const {
	signIn: clientSignIn,
	signUp: clientSignUp,
	signOut: clientSignOut,
	useSession,
} = authClient
