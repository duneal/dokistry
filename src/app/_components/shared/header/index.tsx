"use client"

import { usePathname } from "next/navigation"
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	Separator,
	SidebarTrigger,
} from "@/app/_components/ui"
import "./header.scss"

export default function Header() {
	const pathname = usePathname()

	const getPageName = (path: string): string => {
		if (path === "/") return "Dashboard"
		if (path.startsWith("/images/")) {
			const imageName = path.replace("/images/", "")
			return decodeURIComponent(imageName)
		}
		return path.charAt(1).toUpperCase() + path.slice(2)
	}

	const pageName = getPageName(pathname)

	return (
		<header className="header">
			<SidebarTrigger />
			<Separator orientation="vertical" />
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbPage>{pageName}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
		</header>
	)
}
