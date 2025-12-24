"use client"

import { Pencil, Plus } from "lucide-react"
import { useId, useMemo, useState } from "react"
import { PasswordInput } from "@/app/_components/shared"
import { Button, Input } from "@/app/_components/ui"
import { DialogFooter } from "@/app/_components/ui/dialog"
import { cn } from "@/utils/lib/shadcn-ui"

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
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<label
					htmlFor={nameId}
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
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

			<div className="space-y-2">
				<label
					htmlFor={roleId}
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					Role
				</label>
				<select
					id={roleId}
					value={role}
					onChange={(e) => setRole(e.target.value as "admin" | "user")}
					className={cn(
						"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
						"file:border-0 file:bg-transparent file:text-sm file:font-medium",
						"placeholder:text-muted-foreground",
						"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
						"disabled:cursor-not-allowed disabled:opacity-50",
					)}
					required
				>
					<option value="user">Member</option>
					<option value="admin">Admin</option>
				</select>
			</div>

			<div className="space-y-2">
				<label
					htmlFor={emailId}
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
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

			<div className="space-y-2">
				<label
					htmlFor={passwordId}
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
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
				<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button type="submit" loading={isSubmitting}>
					<SubmitIcon className="mr-2 size-4" />
					{submitLabel}
				</Button>
			</DialogFooter>
		</form>
	)
}
