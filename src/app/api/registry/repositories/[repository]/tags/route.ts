import { type NextRequest, NextResponse } from "next/server"
import { databaseRegistryService } from "@/features/registry/services"

interface RouteParams {
	params: {
		repository: string
	}
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
	try {
		const { repository } = await params

		// Validate repository name
		if (!repository || typeof repository !== "string") {
			return NextResponse.json({ error: "Invalid repository name" }, { status: 400 })
		}

		// Check if registry is configured
		const hasRegistry = await databaseRegistryService.hasRegistry()
		if (!hasRegistry) {
			return NextResponse.json(
				{
					error: "NO_REGISTRY_CONFIGURED",
					message: "No registry configuration found",
					repository: repository,
					tagsWithDigests: [],
				},
				{ status: 200 },
			)
		}

		// Get repository tags
		const tags = await databaseRegistryService.getRepositoryTags(repository)

		if (!tags || tags.length === 0) {
			return NextResponse.json({ error: "Repository not found or has no tags" }, { status: 404 })
		}

		// Fetch manifest digests for each tag
		const tagsWithDigests = await Promise.all(
			tags.map(async (tag: string) => {
				try {
					const digest = await databaseRegistryService.getManifestDigest(repository, tag)
					return { tag, digest }
				} catch (error) {
					console.warn(`Failed to get digest for tag ${tag}:`, error)
					return { tag, digest: null }
				}
			}),
		)

		return NextResponse.json({
			repository: repository,
			tagsWithDigests: tagsWithDigests.filter(
				(item: { tag: string; digest: string | null }) => item.digest !== null,
			),
		})
	} catch (error) {
		console.error("Tags with digests API error:", error)

		const errorResponse = {
			error: "Failed to fetch tags with digests",
			message: error instanceof Error ? error.message : "Unknown error",
		}

		return NextResponse.json(errorResponse, { status: 500 })
	}
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
	try {
		const { repository } = await params
		const body = await request.json()
		const { tags } = body

		if (!tags || !Array.isArray(tags) || tags.length === 0) {
			return NextResponse.json(
				{ error: "Invalid request: tags array is required" },
				{ status: 400 },
			)
		}

		// Validate repository name
		if (!repository || typeof repository !== "string") {
			return NextResponse.json({ error: "Invalid repository name" }, { status: 400 })
		}

		// Check if registry is configured
		const hasRegistry = await databaseRegistryService.hasRegistry()
		if (!hasRegistry) {
			return NextResponse.json(
				{
					error: "NO_REGISTRY_CONFIGURED",
					message: "No registry configuration found",
				},
				{ status: 400 },
			)
		}

		// Delete the tags
		const result = await databaseRegistryService.deleteTags(repository, tags)

		// Return success response with details
		return NextResponse.json({
			success: true,
			message: `Successfully deleted ${result.success.length} tag(s)`,
			deleted: result.success,
			failed: result.failed,
			summary: {
				total: tags.length,
				successful: result.success.length,
				failed: result.failed.length,
			},
		})
	} catch (error) {
		console.error("Tag deletion API error:", error)

		const errorResponse = {
			error: "Failed to delete tags",
			message: error instanceof Error ? error.message : "Unknown error",
		}

		// Return appropriate status code based on error type
		let statusCode = 500
		if (error instanceof Error) {
			if (error.message.includes("Authentication failed")) {
				statusCode = 401
			} else if (error.message.includes("Access forbidden")) {
				statusCode = 403
			} else if (error.message.includes("not found")) {
				statusCode = 404
			} else if (error.message.includes("not supported")) {
				statusCode = 405
			}
		}

		return NextResponse.json(errorResponse, { status: statusCode })
	}
}
