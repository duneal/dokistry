import { redirect } from "next/navigation"
import { getAllUsers, getSession } from "@/utils/lib/auth-actions"
import UsersTable from "./_components/users-table"
import "./users.scss"

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
			<main className="users">
				<div className="users__container">
					<div className="users__error">
						<p>{usersResult.error}</p>
					</div>
				</div>
			</main>
		)
	}

	return (
		<main className="users">
			<div className="users__container">
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
