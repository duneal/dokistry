"use client"

import { useTranslations } from "next-intl"
import { useId } from "react"
import { PasswordInput } from "@/app/_components/shared"
import { Button, Card, CardContent, Input } from "@/app/_components/ui"
import Logo from "~/images/logo.svg"
import { useSignup } from "./use-signup"

export function SignupForm() {
	const emailId = useId()
	const passwordId = useId()
	const confirmPasswordId = useId()
	const { isLoading, handleSubmit } = useSignup()
	const t = useTranslations("auth")
	const tCommon = useTranslations("common")

	return (
		<div className="flex min-h-screen w-full flex-row">
			{/* Form Section */}
			<div className="flex w-full items-center justify-center bg-muted/40 md:w-2/5">
				<Card className="w-full max-w-md">
					<CardContent className="p-8">
						<form onSubmit={handleSubmit} className="space-y-4">
							<h2 className="flex items-center justify-center gap-2 pb-2 text-2xl font-medium text-foreground">
								{t("signUp")}
							</h2>

							<div className="flex flex-col item-center gap-2">
								<label
									htmlFor={emailId}
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									{tCommon("email")}
								</label>
								<Input
									id={emailId}
									name="email"
									type="email"
									required
									placeholder={t("enterEmail")}
									className="w-full"
								/>
							</div>

							<div className="flex flex-col item-center gap-2">
								<label
									htmlFor={passwordId}
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									{tCommon("password")}
								</label>
								<PasswordInput
									id={passwordId}
									name="password"
									required
									placeholder={t("createPassword")}
									className="w-full"
								/>
							</div>

							<div className="flex flex-col item-center gap-2">
								<label
									htmlFor={confirmPasswordId}
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									{tCommon("confirm")} {tCommon("password")}
								</label>
								<PasswordInput
									id={confirmPasswordId}
									name="confirmPassword"
									required
									placeholder={t("confirmPassword")}
									className="w-full"
								/>
							</div>

							<Button type="submit" className="w-full" disabled={isLoading} loading={isLoading}>
								{isLoading ? t("creatingAccount") : t("signUp")}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>

			{/* Presentation Section */}
			<div className="hidden md:flex w-3/5 items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/70">
				<h1 className="flex items-center gap-2 text-2xl font-bold text-primary-foreground">
					<Logo width={110} height={110} className="[&_path]:fill-primary-foreground" />
				</h1>
			</div>
		</div>
	)
}
