import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { DATABASE_URL } from "@/utils/constants/config"
import * as schema from "./schema"

const client = postgres(DATABASE_URL, {
	prepare: false,
	max: 10,
	idle_timeout: 20,
	max_lifetime: 60 * 30,
	connect_timeout: 10,
})

export const db = drizzle(client, { schema })
