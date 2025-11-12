"use client"

import type { ColumnDef } from "@tanstack/react-table"
import {
	ArrowUpDown,
	CalendarDays,
	Loader2,
	Mail,
	Pencil,
	Plus,
	Shield,
	Trash2,
	User as UserIcon,
	XCircle,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Badge, Button } from "@/app/_components/ui"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/app/_components/ui/dialog"
import { Table } from "@/app/_components/ui/table"
import { createUser, deleteUser, updateUser } from "@/utils/lib/auth-actions"
import { useAuth } from "@/utils/lib/auth-hooks"
import UserForm from "./user-form"
import "./users-table.scss"

interface User {
	id: string
	name: string
	email: string
	role: "admin" | "user"
	createdAt: string
	updatedAt: string
}

interface UsersTableProps {
	initialUsers: User[]
}

export default function UsersTable({ initialUsers }: UsersTableProps) {
	const { user: currentUser } = useAuth()
	const [users, setUsers] = useState<User[]>(initialUsers)
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [editingUser, setEditingUser] = useState<User | null>(null)
	const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [userPendingDeletion, setUserPendingDeletion] = useState<User | null>(null)

	const handleCreateUser = async (
		email: string,
		password?: string,
		name?: string,
		role?: string,
	) => {
		const trimmedName = name?.trim()
		const trimmedPassword = password?.trim()

		if (!trimmedName || !trimmedPassword) {
			toast.error("Failed to create user", {
				description: "Name and password are required",
			})
			return false
		}

		try {
			const result = await createUser(
				email,
				trimmedPassword,
				trimmedName,
				role as "admin" | "user" | undefined,
			)

			if (result.error) {
				toast.error("Failed to create user", {
					description: result.error,
				})
				return false
			}

			if (result.user) {
				setUsers([...users, result.user as User])
				toast.success("User created successfully", {
					description: `User ${result.user.email} has been created.`,
				})
				setIsCreateDialogOpen(false)
				return true
			}

			return false
		} catch (error) {
			toast.error("Failed to create user", {
				description: "An unexpected error occurred.",
			})
			console.error("Create user error:", error)
			return false
		}
	}

	const handleUpdateUser = async (
		userId: string,
		email?: string,
		password?: string,
		name?: string,
		role?: string,
	) => {
		try {
			const result = await updateUser(
				userId,
				email,
				password,
				name,
				role as "admin" | "user" | undefined,
			)

			if (result.error) {
				toast.error("Failed to update user", {
					description: result.error,
				})
				return false
			}

			if (result.user) {
				setUsers(users.map((u) => (u.id === userId ? (result.user as User) : u)))
				toast.success("User updated successfully", {
					description: `User ${result.user.email} has been updated.`,
				})
				setEditingUser(null)
				return true
			}

			return false
		} catch (error) {
			toast.error("Failed to update user", {
				description: "An unexpected error occurred.",
			})
			console.error("Update user error:", error)
			return false
		}
	}

	const handleRequestDeleteUser = (user: User) => {
		setUserPendingDeletion(user)
		setIsDeleteDialogOpen(true)
	}

	const handleDeleteDialogOpenChange = (open: boolean) => {
		if (!open && deletingUserId) return
		setIsDeleteDialogOpen(open)
		if (!open) {
			setUserPendingDeletion(null)
		}
	}

	const handleConfirmDeleteUser = async () => {
		if (!userPendingDeletion) return

		const userId = userPendingDeletion.id
		setDeletingUserId(userId)

		try {
			const result = await deleteUser(userId)

			if (result.error) {
				toast.error("Failed to delete user", {
					description: result.error,
				})
			} else {
				setUsers(users.filter((u) => u.id !== userId))
				toast.success("User deleted successfully", {
					description: "The user has been deleted.",
				})
			}
		} catch (error) {
			toast.error("Failed to delete user", {
				description: "An unexpected error occurred.",
			})
			console.error("Delete user error:", error)
		} finally {
			setDeletingUserId(null)
			setIsDeleteDialogOpen(false)
			setUserPendingDeletion(null)
		}
	}

	const handleCancelDeleteUser = () => {
		if (deletingUserId) return
		setIsDeleteDialogOpen(false)
		setUserPendingDeletion(null)
	}

	const columns: ColumnDef<User>[] = [
		{
			accessorKey: "name",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="users-table__sort-button"
				>
					<UserIcon className="users-table__header__icon" size={16} />
					Name
					<ArrowUpDown className="users-table__sort-icon" size={14} />
				</Button>
			),
		},
		{
			accessorKey: "email",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="users-table__sort-button"
				>
					<Mail className="users-table__header__icon" size={16} />
					Email
					<ArrowUpDown className="users-table__sort-icon" size={14} />
				</Button>
			),
		},
		{
			accessorKey: "role",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="users-table__sort-button"
				>
					<Shield className="users-table__header__icon" size={16} />
					Role
					<ArrowUpDown className="users-table__sort-icon" size={14} />
				</Button>
			),
			cell: ({ row }) => {
				const role = row.getValue("role") as string
				return <Badge variant={role === "admin" ? "primary" : "secondary"}>{role}</Badge>
			},
		},
		{
			accessorKey: "createdAt",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="users-table__sort-button"
				>
					<CalendarDays className="users-table__header__icon" size={16} />
					Created At
					<ArrowUpDown className="users-table__sort-icon" size={14} />
				</Button>
			),
			cell: ({ row }) => {
				const date = new Date(row.getValue("createdAt"))
				return date.toLocaleDateString()
			},
		},
		{
			id: "actions",
			header: () => null,
			cell: ({ row }) => {
				const user = row.original
				const isCurrentUser = currentUser?.id === user.id

				return (
					<div className="users-table__actions">
						{!isCurrentUser && (
							<Dialog
								open={editingUser?.id === user.id}
								onOpenChange={(open) => !open && setEditingUser(null)}
							>
								<DialogTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setEditingUser(user)}
										className="users-table__actions__button"
									>
										<Pencil size={16} />
									</Button>
								</DialogTrigger>
								<DialogContent className="users-table__dialog">
									<DialogHeader>
										<DialogTitle>Edit User</DialogTitle>
										<DialogDescription>Update user email and password.</DialogDescription>
									</DialogHeader>
									<UserForm
										user={user}
										onSubmit={(email, password, name, role) =>
											handleUpdateUser(user.id, email, password, name, role)
										}
										onCancel={() => setEditingUser(null)}
									/>
								</DialogContent>
							</Dialog>
						)}
						{!isCurrentUser && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleRequestDeleteUser(user)}
								disabled={deletingUserId === user.id}
								loading={deletingUserId === user.id}
								className="users-table__actions__button"
							>
								<Trash2 size={16} />
							</Button>
						)}
					</div>
				)
			},
		},
	]

	return (
		<div className="users-table">
			<div className="users-table__table-wrapper">
				<Table columns={columns} data={users} className="users-table__table" />

				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button variant="ghost" className="users-table__create-row">
							<Plus size={16} />
							Create User
						</Button>
					</DialogTrigger>
					<DialogContent className="users-table__dialog">
						<DialogHeader>
							<DialogTitle>Create User</DialogTitle>
							<DialogDescription>
								Provide the details below to invite a new user to Dokistry.
							</DialogDescription>
						</DialogHeader>
						<UserForm
							onSubmit={(email, password, name, role) =>
								handleCreateUser(email, password, name, role)
							}
							onCancel={() => setIsCreateDialogOpen(false)}
						/>
					</DialogContent>
				</Dialog>
			</div>

			<Dialog open={isDeleteDialogOpen} onOpenChange={handleDeleteDialogOpenChange}>
				<DialogContent className="users-table__delete-dialog">
					<DialogHeader>
						<DialogTitle>Delete User</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete <strong>{userPendingDeletion?.email}</strong>? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleCancelDeleteUser}
							disabled={!!deletingUserId}
						>
							<XCircle className="users-table__delete-dialog__icon" size={16} />
							Cancel
						</Button>
						<Button
							variant="danger"
							size="sm"
							onClick={handleConfirmDeleteUser}
							disabled={!!deletingUserId}
						>
							{deletingUserId ? (
								<>
									<Loader2
										className="users-table__delete-dialog__icon users-table__delete-dialog__icon--spinning"
										size={16}
									/>
									Deleting...
								</>
							) : (
								<>
									<Trash2 className="users-table__delete-dialog__icon" size={16} />
									Delete permanently
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
