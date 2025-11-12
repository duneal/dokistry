import { redirect } from "next/navigation"
import { getSession } from "@/utils/lib/auth-actions"
import SettingsForm from "./_components/settings-form"
import "./settings.scss"

export default async function SettingsPage() {
	const session = await getSession()

	if (!session?.user) {
		redirect("/signin")
	}

	return (
		<main className="settings">
			<div className="settings__container">
				<SettingsForm user={session.user} />
			</div>
		</main>
	)
}
