import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { clientSignIn } from "@/utils/lib/auth-client"

export function useSignin() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsLoading(true)

		const formData = new FormData(e.currentTarget)
		const email = formData.get("email") as string
		const password = formData.get("password") as string
		const rememberMe = formData.get("rememberMe") === "on"

		try {
			const result = await clientSignIn.email({
				email,
				password,
				rememberMe,
				callbackURL: "/dashboard",
			})

			const error = result.error as { message?: string } | string | undefined

			if (error) {
				const errorMessage =
					typeof error === "string" ? error : error?.message || "Invalid email or password"
				toast.error("Sign In Failed", {
					description: errorMessage,
					duration: 4000,
				})
			} else {
				toast.success("Signed In Successfully!", {
					description: "Redirecting to dashboard...",
					duration: 3000,
				})
				setTimeout(() => {
					router.push("/dashboard")
				}, 500)
			}
		} catch (err) {
			const errorMessage = "An unexpected error occurred"
			toast.error("Sign In Failed", {
				description: errorMessage,
				duration: 4000,
			})
			console.error("Sign in error:", err)
		} finally {
			setIsLoading(false)
		}
	}

	return {
		isLoading,
		handleSubmit,
	}
}
