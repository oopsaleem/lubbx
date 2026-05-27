"use client";

import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { useOrganizationListQuery } from "@saas/organizations/lib/api";
import { ActivePlanBadge } from "@saas/payments/components/ActivePlanBadge";
import { UserAvatar } from "@shared/components/UserAvatar";
import { useRouter } from "@shared/hooks/router";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@ui/components/sidebar";
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { OrganizationLogo } from "./OrganizationLogo";

export function OrganizationSwitch() {
	const t = useTranslations();
	const { user } = useSession();
	const router = useRouter();
	const { isMobile } = useSidebar();
	const { activeOrganization, setActiveOrganization } =
		useActiveOrganization();
	const { data: allOrganizations } = useOrganizationListQuery();

	if (!user) {
		return null;
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							/>
						}
					>
						<div className="flex flex-1 items-center justify-start gap-2 text-sm overflow-hidden">
							{activeOrganization ? (
								<>
									<OrganizationLogo
										name={activeOrganization.name}
										logoUrl={activeOrganization.logo}
										className="hidden size-6 sm:block"
									/>
									<span className="block flex-1 truncate">
										{activeOrganization.name}
									</span>
									{config.organizations.enableBilling && (
										<ActivePlanBadge
											organizationId={
												activeOrganization.id
											}
										/>
									)}
								</>
							) : (
								<>
									<UserAvatar
										className="hidden size-6 sm:block"
										name={user.name ?? ""}
										avatarUrl={user.image}
									/>
									<span className="block truncate">
										{t(
											"organizations.organizationSelect.personalAccount",
										)}
									</span>
									{config.users.enableBilling && (
										<ActivePlanBadge />
									)}
								</>
							)}
							<ChevronsUpDownIcon className="ms-auto size-4 group-data-[collapsible=icon]:hidden" />
						</div>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						align="start"
						side={isMobile ? "bottom" : "inline-end"}
						sideOffset={4}
					>
						{!config.organizations.requireOrganization && (
							<>
								<DropdownMenuGroup>
									<DropdownMenuLabel className="text-foreground/60 text-xs">
										{t(
											"organizations.organizationSelect.personalAccount",
										)}
									</DropdownMenuLabel>
									<DropdownMenuRadioGroup
										value={
											activeOrganization?.id ?? user.id
										}
										onValueChange={(value: string) => {
											if (value === user.id) {
												router.replace("/app");
											}
										}}
									>
										<DropdownMenuRadioItem
											value={user.id}
											className="flex cursor-pointer items-center justify-center gap-2 ps-3"
										>
											<div className="flex flex-1 items-center justify-start gap-2">
												<UserAvatar
													className="size-8"
													name={user.name ?? ""}
													avatarUrl={user.image}
												/>
												{user.name}
											</div>
										</DropdownMenuRadioItem>
									</DropdownMenuRadioGroup>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
							</>
						)}
						<DropdownMenuGroup>
							<DropdownMenuLabel className="text-foreground/60 text-xs">
								{t(
									"organizations.organizationSelect.organizations",
								)}
							</DropdownMenuLabel>
							<DropdownMenuRadioGroup
								value={activeOrganization?.slug}
								onValueChange={(organizationSlug: string) =>
									setActiveOrganization(organizationSlug)
								}
							>
								{allOrganizations?.map((organization) => (
									<DropdownMenuRadioItem
										key={organization.slug}
										value={organization.slug}
										className="flex cursor-pointer items-center justify-center gap-2 ps-3"
									>
										<div className="flex flex-1 items-center justify-start gap-2">
											<OrganizationLogo
												className="size-8"
												name={organization.name}
												logoUrl={organization.logo}
											/>
											{organization.name}
										</div>
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuGroup>

						{config.organizations
							.enableUsersToCreateOrganizations && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuGroup>
									<DropdownMenuItem
										render={
											<Link href="/app/new-organization" />
										}
										className="text-primary! cursor-pointer text-sm"
									>
										<PlusIcon className="size-6 rounded-md bg-primary/20 p-1" />
										{t(
											"organizations.organizationSelect.createNewOrganization",
										)}
									</DropdownMenuItem>
								</DropdownMenuGroup>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
