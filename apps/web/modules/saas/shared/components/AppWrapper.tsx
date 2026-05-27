"use client";

import { AppSidebar } from "@saas/shared/components/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@ui/components/sidebar";
import { useLocale } from "next-intl";
import type { PropsWithChildren } from "react";
import { config } from "@repo/config";
import { OrganizationSelect } from "@saas/organizations/components/OrganizationSelect";


export function AppWrapper({ children }: PropsWithChildren) {
	const locale = useLocale();
	const dir = locale === "ar" ? "rtl" : "ltr";

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header
					className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
					dir={dir}
				>
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						{config.organizations.enable &&
												!config.organizations.hideOrganization && (
													<OrganizationSelect className="px-2 pb-2" />
												)}
					</div>
				</header>
				<div className="px-4 pb-4">
					<main className="border rounded-2xl bg-card px-4 md:p-8 min-h-full w-full">
						<div className="container px-0">{children}</div>
					</main>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
