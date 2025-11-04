"use client"

import { useRouter } from "next/navigation"
import { useId, useState } from "react"
import { toast } from "sonner"

import { PasswordInput } from "@/app/_components/shared"
import Button from "@/app/_components/ui/button"
import Input from "@/app/_components/ui/input"
import { createFirstAdminUser } from "@/utils/lib/auth-actions"
import { clientSignIn } from "@/utils/lib/auth-client"
import Logo from "~/images/logo.svg"
import "./signup.scss"

export default function SignUpPage() {
	const emailId = useId()
	const passwordId = useId()
	const confirmPasswordId = useId()
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsLoading(true)

		const formData = new FormData(e.currentTarget)
		const email = formData.get("email") as string
		const password = formData.get("password") as string
		const confirmPassword = formData.get("confirmPassword") as string

		if (password !== confirmPassword) {
			const errorMessage = "Passwords do not match"
			toast.error("Signup Failed", {
				description: errorMessage,
				duration: 4000,
			})
			setIsLoading(false)
			return
		}

		try {
			const result = await createFirstAdminUser(email, password, email.split("@")[0])

			if (result.error) {
				const errorMessage = result.error || "Sign up failed"
				toast.error("Signup Failed", {
					description: errorMessage,
					duration: 4000,
				})
			} else {
				// Sign in the newly created user
				const signInResult = await clientSignIn.email({
					email,
					password,
					callbackURL: "/dashboard",
				})

				if (signInResult.error) {
					toast.error("Signup Failed", {
						description: "Account created but failed to sign in. Please sign in manually.",
						duration: 4000,
					})
				} else {
					toast.success("Account Created Successfully!", {
						description: "Welcome to Dokistry! Redirecting to dashboard...",
						duration: 3000,
					})
					// Redirect to dashboard after successful signup
					setTimeout(() => {
						router.push("/dashboard")
					}, 500)
				}
			}
		} catch (err) {
			const errorMessage = "An unexpected error occurred"
			toast.error("Signup Failed", {
				description: errorMessage,
				duration: 4000,
			})
			console.error("Sign up error:", err)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="signup">
			<div className="signup__form">
				<form onSubmit={handleSubmit}>
					<h2 className="signup__form__title">
						<Logo width={40} height={40} />
						Sign up
					</h2>

					<div className="signup__form__field">
						<Input
							id={emailId}
							name="email"
							type="email"
							required
							placeholder="Enter your email"
							className="signup__form__field__input"
						/>
					</div>

					<div className="signup__form__field">
						<PasswordInput
							id={passwordId}
							name="password"
							required
							placeholder="Create a password"
							className="signup__form__field__input"
						/>
					</div>

					<div className="signup__form__field">
						<PasswordInput
							id={confirmPasswordId}
							name="confirmPassword"
							required
							placeholder="Confirm your password"
							className="signup__form__field__input"
						/>
					</div>

					<Button
						type="submit"
						variant="primary"
						className="signup__form__submit"
						disabled={isLoading}
					>
						{isLoading ? "Creating Account..." : "Sign up"}
					</Button>
				</form>
			</div>

			<div className="signup__presentation">
				<h1 className="signup__presentation__title">
					<Logo width={50} height={50} />
					Dokistry
				</h1>
			</div>
		</div>
	)
}
