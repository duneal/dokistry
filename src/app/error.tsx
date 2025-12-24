"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { useEffect } from "react"
import { Button } from "@/app/_components/ui"

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
			<div className="flex flex-col items-center gap-4 text-center">
				<div className="rounded-full bg-destructive/10 p-4">
					<AlertCircle className="size-12 text-destructive" />
				</div>
				<div className="space-y-2">
					<h1 className="text-2xl font-bold">Something went wrong!</h1>
					<p className="text-muted-foreground max-w-md">
						An unexpected error occurred. Please try again or contact support if the problem
						persists.
					</p>
				</div>
			</div>
			<Button onClick={() => reset()}>
				<RefreshCw className="mr-2 size-4" />
				Try again
			</Button>
		</div>
	)
}
