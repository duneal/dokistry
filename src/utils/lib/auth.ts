import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { admin } from "better-auth/plugins"
import { db } from "./db"
import { account, session, user, verification } from "./db/schema"

const baseConfig = {
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user,
			session,
			account,
			verification,
		},
	}),
	user: {
		changeEmail: {
			enabled: true,
		},
		deleteUser: {
			enabled: true,
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		cookieCache: {
			enabled: true,
			maxAge: 60 * 60 * 24 * 7, // 7 days
		},
	},
	advanced: {
		database: {
			generateId: () => crypto.randomUUID(),
		},
	},
	plugins: [
		admin({
			defaultRole: "user",
		}),
		nextCookies(), // Must be the last plugin in the array
	],
}

export const auth = betterAuth({
	...baseConfig,
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
		autoSignIn: true,
	},
})

export const authAdmin = betterAuth({
	...baseConfig,
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
		autoSignIn: false,
	},
})
