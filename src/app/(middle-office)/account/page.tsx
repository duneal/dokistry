import AccountForm from "./_components/account-form"

export default function AccountPage() {
	return (
		<main className="flex flex-1 flex-col p-4">
			<div className="w-full space-y-6">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Account</h1>
					<p className="text-muted-foreground">Manage your account settings and preferences</p>
				</div>
				<AccountForm />
			</div>
		</main>
	)
}
