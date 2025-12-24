import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import AccountForm from "./_components/account-form"

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("pages.account")
	return {
		title: t("title"),
		description: t("description"),
	}
}

export default async function AccountPage() {
	const t = await getTranslations("pages.account")
	return (
		<main className="flex flex-1 flex-col p-4">
			<div className="w-full space-y-6">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
					<p className="text-muted-foreground">{t("description")}</p>
				</div>
				<AccountForm />
			</div>
		</main>
	)
}
