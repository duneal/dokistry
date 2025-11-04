"use client"

import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_APP_URL,
	plugins: [adminClient()],
})

export const {
	signIn: clientSignIn,
	signUp: clientSignUp,
	signOut: clientSignOut,
	useSession,
} = authClient
