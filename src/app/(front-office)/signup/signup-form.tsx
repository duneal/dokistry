"use client"

import { useId } from "react"

import { PasswordInput } from "@/app/_components/shared"
import Button from "@/app/_components/ui/button"
import Input from "@/app/_components/ui/input"
import Logo from "~/images/logo.svg"
import "./signup.scss"
import { useSignup } from "./use-signup"

export function SignupForm() {
	const emailId = useId()
	const passwordId = useId()
	const confirmPasswordId = useId()
	const { isLoading, handleSubmit } = useSignup()

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
