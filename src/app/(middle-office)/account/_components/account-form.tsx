"use client"

import { KeyRound, Loader2, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
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
		return (
			<div className="py-8 text-center text-muted-foreground">
				Please sign in to view your account settings.
			</div>
		)
	}

	const handleNameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsUpdatingName(true)

		try {
			const trimmedName = name.trim()
			const currentName = (user as { name?: string | null })?.name || ""
			if (trimmedName === currentName) {
				toast.info("Name unchanged", {
					description: "The name is the same as the current one.",
				})
				setIsUpdatingName(false)
				return
			}

			if (!trimmedName || trimmedName === "") {
				toast.error("Name cannot be empty", {
					description: "Please enter a valid name.",
				})
				setIsUpdatingName(false)
				return
			}

			const result = await updateUserName(trimmedName)

			if (result.error) {
				toast.error("Failed to update name", {
					description: result.error,
				})
			} else {
				toast.success("Name updated successfully", {
					description: "Your name has been updated.",
				})
				if (refetch) {
					refetch()
				}
				router.refresh()
			}
		} catch (error) {
			toast.error("Failed to update name", {
				description: "An unexpected error occurred.",
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
				toast.info("Email unchanged", {
					description: "The email address is the same as the current one.",
				})
				setIsChangingEmail(false)
				return
			}

			const result = await updateUserEmail(newEmail)

			if (result.error) {
				toast.error("Failed to update email", {
					description: result.error,
				})
			} else {
				toast.success("Email updated successfully", {
					description: "Your email address has been updated.",
				})
				setIsEmailDialogOpen(false)
				setNewEmail("")
				if (refetch) {
					refetch()
				}
				router.refresh()
			}
		} catch (error) {
			toast.error("Failed to update email", {
				description: "An unexpected error occurred.",
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
				toast.error("Current password required", {
					description: "Please enter your current password.",
				})
				setIsChangingPassword(false)
				return
			}

			if (newPassword !== confirmPassword) {
				toast.error("Passwords do not match", {
					description: "Please make sure the new password and confirmation match.",
				})
				setIsChangingPassword(false)
				return
			}

			if (newPassword.length < 8) {
				toast.error("Password too short", {
					description: "Password must be at least 8 characters long.",
				})
				setIsChangingPassword(false)
				return
			}

			const result = await updateUserPassword(currentPassword, newPassword)

			if (result.error) {
				toast.error("Failed to update password", {
					description: result.error,
				})
			} else {
				toast.success("Password updated successfully", {
					description: "Your password has been updated.",
				})
				setIsPasswordDialogOpen(false)
				setCurrentPassword("")
				setNewPassword("")
				setConfirmPassword("")
			}
		} catch (error) {
			toast.error("Failed to update password", {
				description: "An unexpected error occurred.",
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
					<CardTitle>Personal Information</CardTitle>
					<CardDescription>Update your personal information.</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleNameSubmit}>
						<div className="space-y-2">
							<label htmlFor="name" className="text-sm font-medium leading-none">
								Name
							</label>
							<div className="flex gap-2">
								<Input
									id="name"
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Your name"
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
											Updating...
										</>
									) : (
										"Update"
									)}
								</Button>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Account Security */}
			<Card>
				<CardHeader>
					<CardTitle>Account Security</CardTitle>
					<CardDescription>Manage your account security settings.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Email Address */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Mail className="h-5 w-5 text-muted-foreground" />
							<div>
								<label htmlFor="email" className="text-sm font-medium">
									Email Address
								</label>
								<p className="text-sm text-muted-foreground">{userEmail}</p>
							</div>
						</div>
						<Button variant="outline" onClick={() => setIsEmailDialogOpen(true)}>
							Change email
						</Button>
					</div>

					{/* Password */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<KeyRound className="h-5 w-5 text-muted-foreground" />
							<div>
								<label htmlFor="password" className="text-sm font-medium">
									Password
								</label>
								<p className="text-sm text-muted-foreground">
									Your password must be at least 8 characters long.
								</p>
							</div>
						</div>
						<Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
							Change password
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Email Change Dialog */}
			<Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Change email address</DialogTitle>
						<DialogDescription>Update your email address.</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleEmailSubmit}>
						<div className="space-y-4">
							<div className="space-y-2">
								<label htmlFor="currentEmail" className="text-sm font-medium leading-none">
									Current email
								</label>
								<Input
									id="currentEmail"
									type="email"
									value={userEmail}
									disabled
									className="bg-muted"
								/>
								<p className="text-xs text-muted-foreground">Your current email address.</p>
							</div>
							<div className="space-y-2">
								<label htmlFor="newEmail" className="text-sm font-medium leading-none">
									New email
								</label>
								<Input
									id="newEmail"
									type="email"
									value={newEmail}
									onChange={(e) => setNewEmail(e.target.value)}
									placeholder="new@email.com"
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
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isChangingEmail || !newEmail.trim() || newEmail === userEmail}
							>
								{isChangingEmail ? (
									<>
										<Loader2 className="mr-2 size-4 animate-spin" />
										Updating...
									</>
								) : (
									"Update email"
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
						<DialogTitle>Change password</DialogTitle>
						<DialogDescription>Change your password to secure your account.</DialogDescription>
					</DialogHeader>
					<form onSubmit={handlePasswordSubmit}>
						<div className="space-y-4">
							<div className="space-y-2">
								<label htmlFor="currentPassword" className="text-sm font-medium leading-none">
									Current password
								</label>
								<PasswordInput
									id="currentPassword"
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
									placeholder="Enter your current password"
									required
									disabled={isChangingPassword}
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="newPassword" className="text-sm font-medium leading-none">
									New password
								</label>
								<p className="text-xs text-muted-foreground">
									The password must be at least 8 characters long.
								</p>
								<PasswordInput
									id="newPassword"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									placeholder="Enter your new password"
									required
									disabled={isChangingPassword}
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
									Confirm new password
								</label>
								<PasswordInput
									id="confirmPassword"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder="Confirm your new password"
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
								Cancel
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
										Updating...
									</>
								) : (
									"Change password"
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	)
}
