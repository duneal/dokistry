import { requireSignupAccess } from "@/utils/lib/auth-validate"
import { SignupForm } from "./signup-form"

export default async function SignUpPage() {
	await requireSignupAccess()

	return <SignupForm />
}
