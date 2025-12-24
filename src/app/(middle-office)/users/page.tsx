import { redirect } from "next/navigation"
import { getAllUsers, getSession } from "@/utils/lib/auth-actions"
import UsersTable from "./_components/users-table"

export default async function UsersPage() {
	const session = await getSession()

	if (!session?.user) {
		redirect("/signin")
	}

	if (session.user.role !== "admin") {
		redirect("/dashboard")
	}

	const usersResult = await getAllUsers()

	if (usersResult.error) {
		return (
			<main className="flex flex-1 flex-col p-4">
				<div className="w-full">
					<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
						<p>{usersResult.error}</p>
					</div>
				</div>
			</main>
		)
	}

	return (
		<main className="flex flex-1 flex-col p-4">
			<div className="w-full space-y-6">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Users</h1>
					<p className="text-muted-foreground">
						Manage user accounts, roles, and permissions for your Dokistry instance
					</p>
				</div>
				<UsersTable
					initialUsers={(usersResult.users || []).map((user) => ({
						...user,
						role: user.role === "admin" ? "admin" : "user",
					}))}
				/>
			</div>
		</main>
	)
}
