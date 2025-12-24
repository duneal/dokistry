import { cookies } from "next/headers"
import { getRequestConfig } from "next-intl/server"
import type { Locale } from "@/utils/types/i18n.interface"
import { locales } from "@/utils/types/i18n.interface"

export default getRequestConfig(async () => {
	const cookieStore = await cookies()
	const localeCookie = cookieStore.get("NEXT_LOCALE")?.value
	const locale = (locales.includes(localeCookie as Locale) ? localeCookie : "en") as Locale

	return {
		locale,
		messages: (await import(`./messages/${locale}.json`)).default,
	}
})
