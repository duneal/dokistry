"use client"

import { Pencil, UserCircle2Icon } from "lucide-react"
import { useId, useState } from "react"
import { toast } from "sonner"
import { PasswordInput } from "@/app/_components/shared"
import { Button, Input } from "@/app/_components/ui"
import { updateUserEmail, updateUserPassword } from "@/utils/lib/auth-actions"
import "./settings-form.scss"

interface SettingsFormProps {
	user: {
		id: string
		email: string
		role?: string | null
	}
}

export default function SettingsForm({ user }: SettingsFormProps) {
	const emailId = useId()
	const currentPasswordId = useId()
	const newPasswordId = useId()
	const confirmPasswordId = useId()

	const [email, setEmail] = useState(user.email)
	const [currentPassword, setCurrentPassword] = useState("")
	const [newPassword, setNewPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
	const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

	const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsUpdatingEmail(true)

		try {
			if (email === user.email) {
				toast.info("Email unchanged", {
					description: "The email address is the same as the current one.",
				})
				setIsUpdatingEmail(false)
				return
			}

			const result = await updateUserEmail(email)

			if (result.error) {
				toast.error("Failed to update email", {
					description: result.error,
				})
			} else {
				toast.success("Email updated successfully", {
					description: "Your email address has been updated.",
				})
			}
		} catch (error) {
			toast.error("Failed to update email", {
				description: "An unexpected error occurred.",
			})
			console.error("Email update error:", error)
		} finally {
			setIsUpdatingEmail(false)
		}
	}

	const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsUpdatingPassword(true)

		try {
			if (!currentPassword || currentPassword.trim() === "") {
				toast.error("Current password required", {
					description: "Please enter your current password.",
				})
				setIsUpdatingPassword(false)
				return
			}

			if (newPassword !== confirmPassword) {
				toast.error("Passwords do not match", {
					description: "Please make sure the new password and confirmation match.",
				})
				setIsUpdatingPassword(false)
				return
			}

			if (newPassword.length < 8) {
				toast.error("Password too short", {
					description: "Password must be at least 8 characters long.",
				})
				setIsUpdatingPassword(false)
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
			setIsUpdatingPassword(false)
		}
	}

	return (
		<div className="settings-form">
			<div className="settings-form__section">
				<div className="settings-form__section__subsection">
					<h2 className="settings-form__section__subsection__title">
						<UserCircle2Icon
							size={24}
							className="settings-form__section__subsection__title__icon"
						/>
						Profile
					</h2>
					<form onSubmit={handleEmailSubmit} className="settings-form__section__subsection__form">
						<div className="settings-form__section__subsection__form__field">
							<label
								htmlFor={emailId}
								className="settings-form__section__subsection__form__field__label"
							>
								Email
							</label>
							<Input
								id={emailId}
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								placeholder="you@example.com"
							/>
						</div>
						<Button type="submit" variant="primary" loading={isUpdatingEmail}>
							<Pencil size={16} className="settings-form__button-icon" />
							Update Email
						</Button>
					</form>
				</div>

				<div className="settings-form__section__subsection">
					<form
						onSubmit={handlePasswordSubmit}
						className="settings-form__section__subsection__form"
					>
						<div className="settings-form__section__subsection__form__field">
							<label
								htmlFor={currentPasswordId}
								className="settings-form__section__subsection__form__field__label"
							>
								Current password
							</label>
							<PasswordInput
								id={currentPasswordId}
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								required
								placeholder="Enter your current password"
							/>
						</div>
						<div className="settings-form__section__subsection__form__field">
							<label
								htmlFor={newPasswordId}
								className="settings-form__section__subsection__form__field__label"
							>
								New password
							</label>
							<PasswordInput
								id={newPasswordId}
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								required
								placeholder="New password"
							/>
						</div>
						<div className="settings-form__section__subsection__form__field">
							<label
								htmlFor={confirmPasswordId}
								className="settings-form__section__subsection__form__field__label"
							>
								Confirm new password
							</label>
							<PasswordInput
								id={confirmPasswordId}
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								placeholder="Confirm new password"
							/>
						</div>
						<Button type="submit" variant="primary" loading={isUpdatingPassword}>
							<Pencil size={16} className="settings-form__button-icon" />
							Update Password
						</Button>
					</form>
				</div>
			</div>
		</div>
	)
}
