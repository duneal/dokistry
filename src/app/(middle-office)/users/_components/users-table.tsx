"use client"

import type { ColumnDef } from "@tanstack/react-table"
import {
	ArrowUpDown,
	CalendarDays,
	Loader2,
	Mail,
	MoreHorizontal,
	Pencil,
	Plus,
	Shield,
	Trash2,
	User as UserIcon,
	XCircle,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
	Badge,
	Button,
	Checkbox,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Input,
} from "@/app/_components/ui"
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
	const [filterValue, setFilterValue] = useState("")
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
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected()
							? true
							: table.getIsSomePageRowsSelected()
								? "indeterminate"
								: false
					}
					onCheckedChange={(value) => {
						table.toggleAllPageRowsSelected(!!value)
					}}
					aria-label="Select all"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => {
						row.toggleSelected(!!value)
					}}
					aria-label="Select row"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "name",
			header: ({ column }) => (
				<Button
					variant="ghost"
					size="xs"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="-ml-4 my-1"
				>
					<UserIcon className="size-4" />
					Name
					<ArrowUpDown className="ml-2 size-3" />
				</Button>
			),
			filterFn: (row, _id, value) => {
				const name = (row.getValue("name") as string)?.toLowerCase() || ""
				const email = (row.original.email as string)?.toLowerCase() || ""
				const searchValue = (value as string)?.toLowerCase() || ""
				if (!searchValue) return true
				return name.includes(searchValue) || email.includes(searchValue)
			},
		},
		{
			accessorKey: "email",
			header: ({ column }) => (
				<Button
					variant="ghost"
					size="xs"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="-ml-4 my-1"
				>
					<Mail className="size-4" />
					Email
					<ArrowUpDown className="ml-2 size-3" />
				</Button>
			),
		},
		{
			accessorKey: "role",
			header: ({ column }) => (
				<Button
					variant="ghost"
					size="xs"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="-ml-4 my-1"
				>
					<Shield className="size-4" />
					Role
					<ArrowUpDown className="ml-2 size-3" />
				</Button>
			),
			cell: ({ row }) => {
				const role = row.getValue("role") as string
				return <Badge variant={role === "admin" ? "default" : "secondary"}>{role}</Badge>
			},
		},
		{
			accessorKey: "createdAt",
			header: ({ column }) => (
				<Button
					variant="ghost"
					size="xs"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="-ml-4 my-1"
				>
					<CalendarDays className="size-4" />
					Created At
					<ArrowUpDown className="ml-2 size-3" />
				</Button>
			),
			cell: ({ row }) => {
				const date = new Date(row.getValue("createdAt"))
				return <span className="text-sm">{date.toLocaleDateString()}</span>
			},
		},
		{
			id: "actions",
			enableHiding: false,
			cell: ({ row }) => {
				const user = row.original
				const isCurrentUser = currentUser?.id === user.id

				return (
					<>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="h-6 w-8 p-0">
									<span className="sr-only">Open menu</span>
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>Actions</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{!isCurrentUser && (
									<>
										<DropdownMenuItem onSelect={() => setEditingUser(user)}>
											<Pencil className="mr-2 h-4 w-4" />
											Edit
										</DropdownMenuItem>
										<DropdownMenuItem
											onSelect={() => handleRequestDeleteUser(user)}
											disabled={deletingUserId === user.id}
											className="text-destructive focus:text-destructive"
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete
										</DropdownMenuItem>
									</>
								)}
								{isCurrentUser && (
									<DropdownMenuItem disabled className="text-muted-foreground">
										You cannot edit or delete your own account
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
						<Dialog
							open={editingUser?.id === user.id}
							onOpenChange={(open) => !open && setEditingUser(null)}
						>
							<DialogContent>
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
					</>
				)
			},
		},
	]

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between py-4 m-0">
				<Input
					placeholder="Filter users..."
					value={filterValue}
					onChange={(event) => setFilterValue(event.target.value)}
					className="max-w-sm"
				/>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button variant="outline">
							<Plus className="size-4" />
							Create User
						</Button>
					</DialogTrigger>
					<DialogContent>
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
			<div className="relative">
				<Table
					columns={columns}
					data={users}
					enableSelection={true}
					enablePagination={true}
					emptyMessage="No users found."
					filterColumn="name"
					filterValue={filterValue}
					defaultSorting={[{ id: "createdAt", desc: true }]}
				/>
			</div>

			<Dialog open={isDeleteDialogOpen} onOpenChange={handleDeleteDialogOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete User</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete <strong>{userPendingDeletion?.email}</strong>? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							size="sm"
							onClick={handleCancelDeleteUser}
							disabled={!!deletingUserId}
						>
							<XCircle className="mr-2 size-4" />
							Cancel
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={handleConfirmDeleteUser}
							disabled={!!deletingUserId}
						>
							{deletingUserId ? (
								<>
									<Loader2 className="mr-2 size-4 animate-spin" />
									Deleting...
								</>
							) : (
								<>
									<Trash2 className="mr-2 size-4" />
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
