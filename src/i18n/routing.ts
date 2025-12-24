import { createNavigation } from "next-intl/navigation"
import { defineRouting } from "next-intl/routing"
import type { Locale } from "@/utils/types/i18n.interface"
import { locales } from "@/utils/types/i18n.interface"

export const routing = defineRouting({
	locales: locales as Locale[],
	defaultLocale: "en",
	localePrefix: "never",
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
