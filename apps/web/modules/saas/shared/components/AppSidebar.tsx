"use client";

import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { OrganizationSwitch } from "@saas/organizations/components/OrganizationSwitch";
import { UserMenu } from "@saas/shared/components/UserMenu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@ui/components/sidebar";
import {
	BotMessageSquareIcon,
	HomeIcon,
	SettingsIcon,
	UserCog2Icon,
	UserCogIcon,
	WandIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar() {
	const t = useTranslations();
	const locale = useLocale();
	const dir = locale === "ar" ? "rtl" : "ltr";
	const pathname = usePathname();
	const { user } = useSession();
	const { activeOrganization } = useActiveOrganization();

	const basePath = activeOrganization
		? `/app/${activeOrganization.slug}`
		: "/app";

	const platformItems = [
		{
			label: t("app.menu.start"),
			href: basePath,
			icon: HomeIcon,
			isActive: pathname === basePath,
		},
		{
			label: t("app.menu.aiDemo"),
			href: "/app/ai-demo",
			icon: WandIcon,
		},
		{
			label: t("app.menu.aiChatbot"),
			href: activeOrganization
				? `/app/${activeOrganization.slug}/chatbot`
				: "/app/chatbot",
			icon: BotMessageSquareIcon,
			isActive: pathname.includes("/chatbot"),
		},
	];

	const accountItems = [
		...(activeOrganization
			? [
					{
						label: t("app.menu.organizationSettings"),
						href: `${basePath}/settings`,
						icon: SettingsIcon,
						isActive: pathname.startsWith(`${basePath}/settings/`),
					},
				]
			: []),
		{
			label: t("app.menu.accountSettings"),
			href: "/app/settings",
			icon: UserCog2Icon,
			isActive: pathname.startsWith("/app/settings/"),
		},
		...(user?.role === "admin"
			? [
					{
						label: t("app.menu.admin"),
						href: "/app/admin",
						icon: UserCogIcon,
						isActive: pathname.startsWith("/app/admin/"),
					},
				]
			: []),
	];

	return (
		<>
			<Sidebar
				collapsible="icon"
				dir={dir}
				side={dir === "ltr" ? "left" : "right"}
				variant="floating"
			>
				<SidebarHeader>
					{config.organizations.enable &&
						!config.organizations.hideOrganization && (
							<OrganizationSwitch />
						)}
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>
							{t("app.menu.platform")}
						</SidebarGroupLabel>
						<SidebarMenu>
							{platformItems.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton
										render={<Link href={item.href} />}
										isActive={item.isActive}
										tooltip={item.label}
									>
										<item.icon
											className={
												item.isActive
													? "text-primary"
													: "opacity-50"
											}
										/>
										<span>{item.label}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroup>
					{accountItems.length > 0 && (
						<SidebarGroup>
							<SidebarGroupLabel>
								{t("app.menu.account")}
							</SidebarGroupLabel>
							<SidebarMenu>
								{accountItems.map((item) => (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton
											render={<Link href={item.href} />}
											isActive={item.isActive}
											tooltip={item.label}
										>
											<item.icon
												className={
													item.isActive
														? "text-primary"
														: "opacity-50"
												}
											/>
											<span>{item.label}</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroup>
					)}
				</SidebarContent>
				<SidebarFooter>
					<SidebarMenu>
						<SidebarMenuItem>
							<UserMenu showUserName />
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>
				<SidebarRail />
			</Sidebar>
		</>
	);
}
