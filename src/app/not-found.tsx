import { FileQuestion, Home } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/app/_components/ui"

export const metadata: Metadata = {
	title: "404 - Page Not Found",
	robots: {
		index: false,
		follow: false,
	},
}

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
			<div className="flex flex-col items-center gap-4 text-center">
				<div className="rounded-full bg-muted p-4">
					<FileQuestion className="size-12 text-muted-foreground" />
				</div>
				<div className="space-y-2">
					<h1 className="text-4xl font-bold">404</h1>
					<h2 className="text-xl font-semibold">Page Not Found</h2>
					<p className="text-muted-foreground max-w-md">
						The page you are looking for doesn't exist or has been moved.
					</p>
				</div>
			</div>
			<Button asChild>
				<Link href="/">
					<Home className="mr-2 size-4" />
					Go Home
				</Link>
			</Button>
		</div>
	)
}
