"use client"

import { KeyRound, Loader2, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PasswordInput } from "@/app/_components/shared"
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
} from "@/app/_components/ui"
import { updateUserEmail, updateUserName, updateUserPassword } from "@/utils/lib/auth-actions"
import { useAuth } from "@/utils/lib/auth-hooks"

export default function AccountForm() {
	const { user, isLoading, refetch } = useAuth()
	const router = useRouter()
	const t = useTranslations("account")
	const tCommon = useTranslations("common")

	const [name, setName] = useState("")
	const [newEmail, setNewEmail] = useState("")
	const [currentPassword, setCurrentPassword] = useState("")
	const [newPassword, setNewPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [isUpdatingName, setIsUpdatingName] = useState(false)
	const [isChangingEmail, setIsChangingEmail] = useState(false)
	const [isChangingPassword, setIsChangingPassword] = useState(false)
	const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
	const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)

	useEffect(() => {
		if (user) {
			setName((user as { name?: string | null })?.name || "")
		}
	}, [user])

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2 className="size-6 animate-spin text-muted-foreground" />
			</div>
		)
	}

	if (!user) {
		return <div className="py-8 text-center text-muted-foreground">{t("pleaseSignIn")}</div>
	}

	const handleNameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsUpdatingName(true)

		try {
			const trimmedName = name.trim()
			const currentName = (user as { name?: string | null })?.name || ""
			if (trimmedName === currentName) {
				toast.info(t("nameUnchanged"), {
					description: t("nameUnchangedDescription"),
				})
				setIsUpdatingName(false)
				return
			}

			if (!trimmedName || trimmedName === "") {
				toast.error(t("nameEmpty"), {
					description: t("nameEmptyDescription"),
				})
				setIsUpdatingName(false)
				return
			}

			const result = await updateUserName(trimmedName)

			if (result.error) {
				toast.error(t("nameUpdateFailed"), {
					description: result.error,
				})
			} else {
				toast.success(t("nameUpdateSuccess"), {
					description: t("nameUpdateSuccessDescription"),
				})
				if (refetch) {
					refetch()
				}
				router.refresh()
			}
		} catch (error) {
			toast.error(t("nameUpdateFailed"), {
				description: t("unexpectedError"),
			})
			console.error("Name update error:", error)
		} finally {
			setIsUpdatingName(false)
		}
	}

	const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsChangingEmail(true)

		try {
			if (newEmail === (user.email || "")) {
				toast.info(t("emailUnchanged"), {
					description: t("emailUnchangedDescription"),
				})
				setIsChangingEmail(false)
				return
			}

			const result = await updateUserEmail(newEmail)

			if (result.error) {
				toast.error(t("emailUpdateFailed"), {
					description: result.error,
				})
			} else {
				toast.success(t("emailUpdateSuccess"), {
					description: t("emailUpdateSuccessDescription"),
				})
				setIsEmailDialogOpen(false)
				setNewEmail("")
				if (refetch) {
					refetch()
				}
				router.refresh()
			}
		} catch (error) {
			toast.error(t("emailUpdateFailed"), {
				description: t("unexpectedError"),
			})
			console.error("Email update error:", error)
		} finally {
			setIsChangingEmail(false)
		}
	}

	const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsChangingPassword(true)

		try {
			if (!currentPassword || currentPassword.trim() === "") {
				toast.error(t("currentPasswordRequired"), {
					description: t("currentPasswordRequiredDescription"),
				})
				setIsChangingPassword(false)
				return
			}

			if (newPassword !== confirmPassword) {
				toast.error(t("passwordsDoNotMatch"), {
					description: t("passwordsDoNotMatchDescription"),
				})
				setIsChangingPassword(false)
				return
			}

			if (newPassword.length < 8) {
				toast.error(t("passwordTooShort"), {
					description: t("passwordTooShortDescription"),
				})
				setIsChangingPassword(false)
				return
			}

			const result = await updateUserPassword(currentPassword, newPassword)

			if (result.error) {
				toast.error(t("passwordUpdateFailed"), {
					description: result.error,
				})
			} else {
				toast.success(t("passwordUpdateSuccess"), {
					description: t("passwordUpdateSuccessDescription"),
				})
				setIsPasswordDialogOpen(false)
				setCurrentPassword("")
				setNewPassword("")
				setConfirmPassword("")
			}
		} catch (error) {
			toast.error(t("passwordUpdateFailed"), {
				description: t("unexpectedError"),
			})
			console.error("Password update error:", error)
		} finally {
			setIsChangingPassword(false)
		}
	}

	const userEmail = user.email || ""

	return (
		<div className="space-y-6 max-w-2xl">
			{/* Personal Information */}
			<Card>
				<CardHeader>
					<CardTitle>{t("personalInformation")}</CardTitle>
					<CardDescription>{t("updatePersonalInfo")}</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleNameSubmit}>
						<div className="space-y-2">
							<label htmlFor="name" className="text-sm font-medium leading-none">
								{tCommon("name")}
							</label>
							<div className="flex gap-2">
								<Input
									id="name"
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder={tCommon("name")}
									required
									disabled={isUpdatingName}
									className="flex-1"
								/>
								<Button
									type="submit"
									disabled={
										isUpdatingName ||
										!name.trim() ||
										name === (user as { name?: string | null })?.name
									}
								>
									{isUpdatingName ? (
										<>
											<Loader2 className="mr-2 size-4 animate-spin" />
											{t("updating")}
										</>
									) : (
										tCommon("update")
									)}
								</Button>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t("accountSecurity")}</CardTitle>
					<CardDescription>{t("manageSecurity")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Mail className="h-5 w-5 text-muted-foreground" />
							<div>
								<label htmlFor="email" className="text-sm font-medium">
									{t("emailAddress")}
								</label>
								<p className="text-sm text-muted-foreground">{userEmail}</p>
							</div>
						</div>
						<Button variant="outline" onClick={() => setIsEmailDialogOpen(true)}>
							{t("changeEmail")}
						</Button>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<KeyRound className="h-5 w-5 text-muted-foreground" />
							<div>
								<label htmlFor="password" className="text-sm font-medium">
									{tCommon("password")}
								</label>
								<p className="text-sm text-muted-foreground">{t("passwordRequirement")}</p>
							</div>
						</div>
						<Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
							{t("changePassword")}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Email Change Dialog */}
			<Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("changeEmailTitle")}</DialogTitle>
						<DialogDescription>{t("updateEmailDescription")}</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleEmailSubmit}>
						<div className="space-y-4">
							<div className="space-y-2">
								<label htmlFor="currentEmail" className="text-sm font-medium leading-none">
									{t("currentEmail")}
								</label>
								<Input
									id="currentEmail"
									type="email"
									value={userEmail}
									disabled
									className="bg-muted"
								/>
								<p className="text-xs text-muted-foreground">{t("currentEmailDescription")}</p>
							</div>
							<div className="space-y-2">
								<label htmlFor="newEmail" className="text-sm font-medium leading-none">
									{t("newEmail")}
								</label>
								<Input
									id="newEmail"
									type="email"
									value={newEmail}
									onChange={(e) => setNewEmail(e.target.value)}
									placeholder={t("newEmailPlaceholder")}
									required
									disabled={isChangingEmail}
								/>
							</div>
						</div>
						<DialogFooter className="mt-6">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setIsEmailDialogOpen(false)
									setNewEmail("")
								}}
							>
								{tCommon("cancel")}
							</Button>
							<Button
								type="submit"
								disabled={isChangingEmail || !newEmail.trim() || newEmail === userEmail}
							>
								{isChangingEmail ? (
									<>
										<Loader2 className="mr-2 size-4 animate-spin" />
										{t("updating")}
									</>
								) : (
									t("updateEmail")
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Password Change Dialog */}
			<Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("changePasswordTitle")}</DialogTitle>
						<DialogDescription>{t("changePasswordDescription")}</DialogDescription>
					</DialogHeader>
					<form onSubmit={handlePasswordSubmit}>
						<div className="space-y-4">
							<div className="space-y-2">
								<label htmlFor="currentPassword" className="text-sm font-medium leading-none">
									{t("currentPassword")}
								</label>
								<PasswordInput
									id="currentPassword"
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
									placeholder={t("currentPasswordPlaceholder")}
									required
									disabled={isChangingPassword}
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="newPassword" className="text-sm font-medium leading-none">
									{t("newPassword")}
								</label>
								<p className="text-xs text-muted-foreground">{t("newPasswordDescription")}</p>
								<PasswordInput
									id="newPassword"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									placeholder={t("newPasswordPlaceholder")}
									required
									disabled={isChangingPassword}
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
									{t("confirmNewPassword")}
								</label>
								<PasswordInput
									id="confirmPassword"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder={t("confirmNewPasswordPlaceholder")}
									required
									disabled={isChangingPassword}
								/>
							</div>
						</div>
						<DialogFooter className="mt-6">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setIsPasswordDialogOpen(false)
									setCurrentPassword("")
									setNewPassword("")
									setConfirmPassword("")
								}}
							>
								{tCommon("cancel")}
							</Button>
							<Button
								type="submit"
								disabled={
									isChangingPassword ||
									!currentPassword ||
									!newPassword ||
									!confirmPassword ||
									newPassword !== confirmPassword
								}
							>
								{isChangingPassword ? (
									<>
										<Loader2 className="mr-2 size-4 animate-spin" />
										{t("updating")}
									</>
								) : (
									t("changePassword")
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	)
}
