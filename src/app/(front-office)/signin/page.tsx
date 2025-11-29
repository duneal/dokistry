import { requireSigninAccess } from "@/utils/lib/auth-validate"
import { SigninForm } from "./signin-form"

export default async function SignInPage() {
	await requireSigninAccess()

	return <SigninForm />
}
