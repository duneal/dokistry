"use client"

import { useSession } from "./auth-client"

export function useAuth() {
	const { data: session, isPending, refetch } = useSession()

	return {
		user: session?.user || null,
		session: session?.session || null,
		isAuthenticated: !!session?.user,
		isLoading: isPending,
		refetch,
	}
}
