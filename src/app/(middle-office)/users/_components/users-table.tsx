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
import { useTranslations } from "next-intl"
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
	const t = useTranslations("users")
	const tCommon = useTranslations("common")

	const handleCreateUser = async (
		email: string,
		password?: string,
		name?: string,
		role?: string,
	) => {
		const trimmedName = name?.trim()
		const trimmedPassword = password?.trim()

		if (!trimmedName || !trimmedPassword) {
			toast.error(t("failedToCreate"), {
				description: t("nameAndPasswordRequired"),
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
				toast.error(t("failedToCreate"), {
					description: result.error,
				})
				return false
			}

			if (result.user) {
				setUsers([...users, result.user as User])
				toast.success(t("createUser"), {
					description: t("userCreated", { email: result.user.email }),
				})
				setIsCreateDialogOpen(false)
				return true
			}

			return false
		} catch (error) {
			toast.error(t("failedToCreate"), {
				description: t("unexpectedError"),
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
				toast.error(t("failedToUpdate"), {
					description: result.error,
				})
				return false
			}

			if (result.user) {
				setUsers(users.map((u) => (u.id === userId ? (result.user as User) : u)))
				toast.success(t("updateUser"), {
					description: t("userUpdated", { email: result.user.email }),
				})
				setEditingUser(null)
				return true
			}

			return false
		} catch (error) {
			toast.error(t("failedToUpdate"), {
				description: t("unexpectedError"),
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
				toast.error(t("failedToDelete"), {
					description: result.error,
				})
			} else {
				setUsers(users.filter((u) => u.id !== userId))
				toast.success(t("deletePermanently"), {
					description: t("userDeleted"),
				})
			}
		} catch (error) {
			toast.error(t("failedToDelete"), {
				description: t("unexpectedError"),
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
					aria-label={tCommon("selectAll")}
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => {
						row.toggleSelected(!!value)
					}}
					aria-label={tCommon("selectRow")}
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
					{t("name")}
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
					{t("email")}
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
					{t("role")}
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
					{t("createdAt")}
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
									<span className="sr-only">{t("openMenu")}</span>
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{!isCurrentUser && (
									<>
										<DropdownMenuItem onSelect={() => setEditingUser(user)}>
											<Pencil className="mr-2 h-4 w-4" />
											{tCommon("edit")}
										</DropdownMenuItem>
										<DropdownMenuItem
											onSelect={() => handleRequestDeleteUser(user)}
											disabled={deletingUserId === user.id}
											className="text-destructive focus:text-destructive"
										>
											<Trash2 className="mr-2 h-4 w-4" />
											{tCommon("delete")}
										</DropdownMenuItem>
									</>
								)}
								{isCurrentUser && (
									<DropdownMenuItem disabled className="text-muted-foreground">
										{t("cannotEditOwnAccount")}
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
									<DialogTitle>{t("editUserTitle")}</DialogTitle>
									<DialogDescription>{t("editUserDescription")}</DialogDescription>
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
					placeholder={t("filterUsers")}
					value={filterValue}
					onChange={(event) => setFilterValue(event.target.value)}
					className="max-w-sm"
				/>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button variant="outline">
							<Plus className="size-4" />
							{t("createUserButton")}
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("createUserTitle")}</DialogTitle>
							<DialogDescription>{t("createUserDescription")}</DialogDescription>
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
					emptyMessage={t("noUsersFound")}
					filterColumn="name"
					filterValue={filterValue}
					defaultSorting={[{ id: "createdAt", desc: true }]}
				/>
			</div>

			<Dialog open={isDeleteDialogOpen} onOpenChange={handleDeleteDialogOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("deleteUserTitle")}</DialogTitle>
						<DialogDescription>
							{t("deleteUserDescription", { email: userPendingDeletion?.email || "" })}
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
							{tCommon("cancel")}
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
									{t("deleting")}
								</>
							) : (
								<>
									<Trash2 className="mr-2 size-4" />
									{t("deletePermanently")}
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
