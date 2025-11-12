"use client"

import { useId } from "react"
import { PasswordInput } from "@/app/_components/shared"
import { Button, Checkbox, Input } from "@/app/_components/ui"
import Logo from "~/images/logo.svg"
import "./signin.scss"
import { useSignin } from "./use-signin"

export default function SignInPage() {
	const emailId = useId()
	const passwordId = useId()
	const rememberId = useId()
	const { isLoading, handleSubmit } = useSignin()

	return (
		<div className="signin">
			<div className="signin__form">
				<form onSubmit={handleSubmit}>
					<h2 className="signin__form__title">
						<Logo width={40} height={40} />
						Sign in
					</h2>
					<div className="signin__form__field">
						<Input
							id={emailId}
							name="email"
							type="email"
							required
							placeholder="Enter your email"
							className="signin__form__field__input"
						/>
					</div>

					<div className="signin__form__field">
						<PasswordInput
							id={passwordId}
							name="password"
							required
							placeholder="Enter your password"
							className="signin__form__field__input"
						/>
					</div>

					<div className="signin__form__remember">
						<Checkbox id={rememberId} name="rememberMe" />
						<label htmlFor={rememberId} className="signin__form__remember__label">
							Remember me
						</label>
					</div>

					<Button
						type="submit"
						variant="primary"
						className="signin__form__submit"
						disabled={isLoading}
					>
						{isLoading ? "Signing in..." : "Sign in"}
					</Button>
				</form>
			</div>

			<div className="signin__presentation">
				<h1 className="signin__presentation__title">
					<Logo width={50} height={50} />
					Dokistry
				</h1>
			</div>
		</div>
	)
}
