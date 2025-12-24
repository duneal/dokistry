"use client"

import { useTranslations } from "next-intl"
import { useId } from "react"
import { PasswordInput } from "@/app/_components/shared"
import { Button, Checkbox, Input } from "@/app/_components/ui"
import Logo from "~/images/logo.svg"
import { useSignin } from "./use-signin"

export function SigninForm() {
	const emailId = useId()
	const passwordId = useId()
	const rememberId = useId()
	const { isLoading, handleSubmit } = useSignin()
	const t = useTranslations("auth")

	return (
		<div className="flex min-h-screen w-full flex-row">
			{/* Form Section */}
			<div className="flex w-full items-center justify-center bg-muted/40 md:w-2/5">
				<form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 p-8">
					<h2 className="flex items-center justify-center gap-2 pb-4 text-2xl font-medium text-foreground">
						<Logo width={40} height={40} />
						{t("signIn")}
					</h2>

					<div className="space-y-2">
						<Input
							id={emailId}
							name="email"
							type="email"
							required
							placeholder={t("enterEmail")}
							className="w-full"
						/>
					</div>

					<div className="space-y-2">
						<PasswordInput
							id={passwordId}
							name="password"
							required
							placeholder={t("enterPassword")}
							className="w-full"
						/>
					</div>

					<div className="flex items-center gap-2 pt-4">
						<Checkbox id={rememberId} name="rememberMe" />
						<label
							htmlFor={rememberId}
							className="text-sm font-medium leading-none text-muted-foreground cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							{t("rememberMe")}
						</label>
					</div>

					<Button type="submit" className="w-full mt-4" disabled={isLoading} loading={isLoading}>
						{isLoading ? t("signingIn") : t("signIn")}
					</Button>
				</form>
			</div>

			{/* Presentation Section */}
			<div className="hidden md:flex w-3/5 items-center justify-center bg-primary">
				<h1 className="flex items-center gap-2 text-2xl font-bold text-primary-foreground">
					<Logo width={50} height={50} className="[&_path]:fill-primary-foreground" />
					Dokistry
				</h1>
			</div>
		</div>
	)
}
