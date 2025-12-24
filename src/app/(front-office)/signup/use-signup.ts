import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"
import { createFirstAdminUser } from "@/utils/lib/auth-actions"
import { clientSignIn } from "@/utils/lib/auth-client"

export function useSignup() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const t = useTranslations("auth")

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsLoading(true)

		const formData = new FormData(e.currentTarget)
		const email = formData.get("email") as string
		const password = formData.get("password") as string
		const confirmPassword = formData.get("confirmPassword") as string

		if (password !== confirmPassword) {
			const errorMessage = t("passwordsDoNotMatch")
			toast.error(t("signupFailed"), {
				description: errorMessage,
				duration: 4000,
			})
			setIsLoading(false)
			return
		}

		try {
			const result = await createFirstAdminUser(email, password, email.split("@")[0])

			if (result.error) {
				const errorMessage = result.error || t("signupFailed")
				toast.error(t("signupFailed"), {
					description: errorMessage,
					duration: 4000,
				})
			} else {
				const signInResult = await clientSignIn.email({
					email,
					password,
					callbackURL: "/dashboard",
				})

				if (signInResult.error) {
					toast.error(t("signupFailed"), {
						description: t("signupSignInFailed"),
						duration: 4000,
					})
				} else {
					toast.success(t("signupSuccess"), {
						description: t("signupSuccessDescription"),
						duration: 3000,
					})
					setTimeout(() => {
						router.push("/dashboard")
					}, 500)
				}
			}
		} catch (err) {
			const errorMessage = t("unexpectedError")
			toast.error(t("signupFailed"), {
				description: errorMessage,
				duration: 4000,
			})
			console.error("Sign up error:", err)
		} finally {
			setIsLoading(false)
		}
	}

	return {
		isLoading,
		handleSubmit,
	}
}
