"use server"

import { readFile } from "fs/promises"
import { join } from "path"

export async function getScript(type: string): Promise<{ content: string } | { error: string }> {
	try {
		if (type !== "docker" && type !== "docker-no-restart") {
			return { error: "Script type not available" }
		}

		const scriptPath = join(
			process.cwd(),
			"src",
			"features",
			"garbage-collector",
			"scripts",
			`${type}.sh`,
		)

		const scriptContent = await readFile(scriptPath, "utf-8")

		return { content: scriptContent }
	} catch (error) {
		console.error("Error reading script file:", error)
		return {
			error: error instanceof Error ? error.message : "Failed to read script file",
		}
	}
}
