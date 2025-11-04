import { NextResponse } from "next/server"
import { databaseRegistryService } from "@/features/registry/services"

export async function GET() {
	try {
		// Test registry connection
		const connectionTest = await databaseRegistryService.testConnection()

		if (!connectionTest.success) {
			return NextResponse.json(
				{
					error: "Registry connection failed",
					details: connectionTest.error,
				},
				{ status: 500 },
			)
		}

		// Get repositories
		const repositories = await databaseRegistryService.getRepositories()

		// Get repositories with tags
		const repositoriesWithTags = await databaseRegistryService.getRepositoriesWithTags()

		return NextResponse.json({
			connectionTest,
			repositories,
			repositoriesWithTags,
		})
	} catch (error) {
		console.error("Registry debug API error:", error)
		return NextResponse.json(
			{
				error: "Failed to debug registry",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		)
	}
}
