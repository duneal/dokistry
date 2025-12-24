"use client"

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	Separator,
	SidebarTrigger,
} from "@/app/_components/ui"
import { LanguageSwitcher } from "../language-switcher"

export default function Header() {
	const pathname = usePathname()
	const t = useTranslations("header")

	const getPageName = (path: string): string => {
		if (path === "/") return t("dashboard")
		if (path.startsWith("/images/")) {
			const imageName = path.replace("/images/", "")
			return decodeURIComponent(imageName)
		}
		if (path === "/account") return t("account")
		if (path === "/users") return t("users")
		return path.charAt(1).toUpperCase() + path.slice(2)
	}

	const pageName = getPageName(pathname)

	return (
		<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
			<div className="flex items-center gap-2 px-4">
				<SidebarTrigger className="-ml-1" />
				<Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbPage>{pageName}</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</div>
			<div className="ml-auto px-4">
				<LanguageSwitcher />
			</div>
		</header>
	)
}
