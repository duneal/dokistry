import { NextResponse } from "next/server"

export async function GET() {
	try {
		// Basic health check - just return OK if the server is running
		return NextResponse.json({
			status: "ok",
			timestamp: new Date().toISOString(),
			service: "dokistry",
		})
	} catch (error) {
		console.error("Health check failed:", error)
		return NextResponse.json(
			{
				status: "error",
				timestamp: new Date().toISOString(),
				service: "dokistry",
				error: "Health check failed",
			},
			{ status: 500 },
		)
	}
}
