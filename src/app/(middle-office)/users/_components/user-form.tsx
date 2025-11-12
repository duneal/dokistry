"use client"

import { Pencil, Plus } from "lucide-react"
import { useId, useMemo, useState } from "react"
import { PasswordInput } from "@/app/_components/shared"
import { Button } from "@/app/_components/ui"
import { DialogFooter } from "@/app/_components/ui/dialog"
import Input from "@/app/_components/ui/input"
import "./user-form.scss"

interface UserFormProps {
	user?: {
		id: string
		name: string
		email: string
		role: string
	}
	onSubmit: (email: string, password?: string, name?: string, role?: string) => Promise<boolean>
	onCancel: () => void
}

export default function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
	const emailId = useId()
	const nameId = useId()
	const passwordId = useId()
	const roleId = useId()

	const [email, setEmail] = useState(user?.email || "")
	const [name, setName] = useState(user?.name || "")
	const [password, setPassword] = useState("")
	const [role, setRole] = useState<"admin" | "user">((user?.role as "admin" | "user") || "user")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const isEditMode = useMemo(() => Boolean(user), [user])

	const submitLabel = isEditMode ? "Update user" : "Create user"
	const SubmitIcon = isEditMode ? Pencil : Plus

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			const passwordToUse = password.trim() !== "" ? password : undefined
			const success = await onSubmit(email.trim(), passwordToUse, name.trim(), role)

			if (success && !isEditMode) {
				setEmail("")
				setName("")
				setPassword("")
				setRole("user")
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="user-form">
			<div className="user-form__field">
				<label htmlFor={nameId} className="user-form__label">
					Name
				</label>
				<Input
					id={nameId}
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
					placeholder="Enter full name"
				/>
			</div>

			<div className="user-form__field">
				<label htmlFor={roleId} className="user-form__label">
					Role
				</label>
				<select
					id={roleId}
					value={role}
					onChange={(e) => setRole(e.target.value as "admin" | "user")}
					className="user-form__select"
					required
				>
					<option value="user">Member</option>
					<option value="admin">Admin</option>
				</select>
			</div>

			<div className="user-form__field">
				<label htmlFor={emailId} className="user-form__label">
					Email
				</label>
				<Input
					id={emailId}
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					placeholder="user@example.com"
				/>
			</div>

			<div className="user-form__field">
				<label htmlFor={passwordId} className="user-form__label">
					{isEditMode ? "New password (optional)" : "Password"}
				</label>
				<PasswordInput
					id={passwordId}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required={!isEditMode}
					placeholder={isEditMode ? "Leave empty to keep current password" : "Enter password"}
				/>
			</div>

			<DialogFooter>
				<Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button type="submit" variant="primary" loading={isSubmitting}>
					<SubmitIcon className="user-form__button__icon" size={16} />
					{submitLabel}
				</Button>
			</DialogFooter>
		</form>
	)
}
