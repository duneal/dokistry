"use client"

import { ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/app/_components/ui"
import { Button } from "@/app/_components/ui/button"
import { type Locale, localeNames, locales } from "@/utils/types/i18n.interface"
import { type FlagCode, flags } from "../flag"

export function LanguageSwitcher() {
	const [locale, setLocale] = useState<Locale>("en")

	useEffect(() => {
		const storedLocale = document.cookie
			.split("; ")
			.find((row) => row.startsWith("NEXT_LOCALE="))
			?.split("=")[1] as Locale | undefined

		if (storedLocale && locales.includes(storedLocale)) {
			setLocale(storedLocale)
		}
	}, [])

	const CurrentFlag = flags[locale as FlagCode]

	const handleLocaleChange = (newLocale: Locale) => {
		document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
		setLocale(newLocale)
		window.location.reload()
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="w-fit px-3 gap-2">
					<CurrentFlag className="h-5 w-8" />
					<span className="text-xs font-semibold uppercase">{locale}</span>
					<ChevronDown className="h-3 w-3" />
					<span className="sr-only">Change language</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				{locales.map((loc) => {
					const FlagComponent = flags[loc as FlagCode]
					return (
						<DropdownMenuItem
							key={loc}
							onClick={() => handleLocaleChange(loc)}
							className="flex items-center gap-2 cursor-pointer"
						>
							<FlagComponent className="h-4 w-6" />
							<span>{localeNames[loc]}</span>
							{locale === loc && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
						</DropdownMenuItem>
					)
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
