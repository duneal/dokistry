import { NextResponse } from "next/server"
import { databaseRegistryService } from "@/features/registry/services"

export async function GET() {
	try {
		const hasRegistry = await databaseRegistryService.hasRegistry()

		if (!hasRegistry) {
			return NextResponse.json(
				{
					error: "NO_REGISTRY_CONFIGURED",
					message: "No registry configuration found",
					repositories: [],
				},
				{ status: 200 },
			)
		}

		const repositories = await databaseRegistryService.getRepositoriesWithTags()
		return NextResponse.json(repositories)
	} catch (error) {
		console.error("Registry API error:", error)
		const errorResponse = {
			error: "Failed to fetch repositories",
			message: error instanceof Error ? error.message : "Unknown error",
		}
		return NextResponse.json(errorResponse, { status: 500 })
	}
}
