import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { DATABASE_URL } from "@/utils/constants/config"
import * as schema from "./schema"

const client = postgres(DATABASE_URL, { prepare: false })
export const db = drizzle(client, { schema })
