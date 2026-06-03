"use client";

import { authClient } from "@repo/auth/client";
import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
import { UserAvatar } from "@shared/components/UserAvatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { SidebarMenuButton, useSidebar } from "@ui/components/sidebar";
import {
	BookIcon,
	ChevronsUpDown,
	HardDriveIcon,
	HomeIcon,
	LogOutIcon,
	MoonIcon,
	MoreVerticalIcon,
	SettingsIcon,
	SunIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type Theme, useTheme } from "@shared/components/ThemeProvider";
import Link from "next/link";
import { memo, useCallback, useState } from "react";

const colorModeOptions = [
	{
		value: "system",
		label: "System",
		icon: HardDriveIcon,
	},
	{
		value: "light",
		label: "Light",
		icon: SunIcon,
	},
	{
		value: "dark",
		label: "Dark",
		icon: MoonIcon,
	},
];

export const UserMenu = memo(function UserMenu({
	showUserName,
}: { showUserName?: boolean }) {
	const t = useTranslations();
	const { user } = useSession();
	const { setTheme: setCurrentTheme, theme: currentTheme } = useTheme();
	const [theme, setTheme] = useState(currentTheme ?? "system");
	const { isMobile } = useSidebar();
	const locale = useLocale();
	const dir = locale === "ar" ? "rtl" : "ltr";

	const onLogout = useCallback(() => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.href = new URL(
						config.auth.redirectAfterLogout,
						window.location.origin,
					).toString();
				},
			},
		});
	}, []);

	if (!user) {
		return null;
	}

	const { name, email, image } = user;

	if (showUserName) {
		return (
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger
					render={
						<SidebarMenuButton
							size="lg"
							className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
						/>
					}
				>
					<UserAvatar
						name={name ?? ""}
						avatarUrl={image}
						className="size-8 rounded-lg"
					/>
					<div className="grid flex-1 text-start text-sm leading-tight">
						<span className="truncate font-medium">{name}</span>
						<span className="truncate text-xs">{email}</span>
					</div>
					<ChevronsUpDown className="ms-auto size-4" />
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
					side={isMobile ? "bottom" : "inline-end"}
					align="end"
					sideOffset={4}
					dir={dir}
				>
					<DropdownMenuGroup>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<UserAvatar
									name={name ?? ""}
									avatarUrl={image}
								/>
								<div className="grid flex-1 text-start text-sm leading-tight">
									<span className="truncate font-medium">
										{name}
									</span>
									<span className="truncate text-xs">
										{email}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<SunIcon className="ms-0 me-2 size-4" />
							{t("app.userMenu.colorMode")}
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent dir={dir}>
								<DropdownMenuRadioGroup
									value={theme}
									onValueChange={(value: string) => {
										setTheme(value as Theme);
										setCurrentTheme(value as Theme);
									}}
								>
									{colorModeOptions.map((option) => (
										<DropdownMenuRadioItem
											key={option.value}
											value={option.value}
										>
											<option.icon className="ms-0 me-2 size-4 opacity-50" />
											{option.label}
										</DropdownMenuRadioItem>
									))}
								</DropdownMenuRadioGroup>
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>

					<DropdownMenuSeparator />

					<DropdownMenuGroup>
						<DropdownMenuItem
							render={<Link href="/app/settings/general" />}
						>
							<SettingsIcon className="ms-0 me-2 size-4" />
							{t("app.userMenu.accountSettings")}
						</DropdownMenuItem>
						<DropdownMenuItem
							render={
								<a href="https://lubbx.dev/docs/nextjs" />
							}
						>
							<BookIcon className="ms-0 me-2 size-4" />
							{t("app.userMenu.documentation")}
						</DropdownMenuItem>
						<DropdownMenuItem render={<Link href="/" />}>
							<HomeIcon className="ms-0 me-2 size-4" />
							{t("app.userMenu.home")}
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					<DropdownMenuItem onClick={onLogout}>
						<LogOutIcon className="ms-0 me-2 size-4" />
						{t("app.userMenu.logout")}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger
				className="flex cursor-pointer w-full items-center justify-between gap-2 rounded-lg outline-hidden focus-visible:ring-2 focus-visible:ring-primary md:w-[100%+1rem] md:px-2 md:py-1.5 md:hover:bg-primary/5"
				aria-label="User menu"
			>
				<span className="flex items-center gap-2">
					<UserAvatar name={name ?? ""} avatarUrl={image} />
				</span>

				{showUserName && <MoreVerticalIcon className="size-4" />}
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end">
				<DropdownMenuGroup>
					<DropdownMenuLabel>
						{name}
						<span className="block font-normal text-xs opacity-70">
							{email}
						</span>
					</DropdownMenuLabel>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<SunIcon className="me-2 size-4" />
						{t("app.userMenu.colorMode")}
					</DropdownMenuSubTrigger>
					<DropdownMenuPortal>
						<DropdownMenuSubContent>
							<DropdownMenuRadioGroup
								value={theme}
								onValueChange={(value: string) => {
									setTheme(value as Theme);
									setCurrentTheme(value as Theme);
								}}
							>
								{colorModeOptions.map((option) => (
									<DropdownMenuRadioItem
										key={option.value}
										value={option.value}
									>
										<option.icon className="me-2 size-4 opacity-50" />
										{option.label}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuSubContent>
					</DropdownMenuPortal>
				</DropdownMenuSub>

				<DropdownMenuSeparator />

				<DropdownMenuItem
					render={<Link href="/app/settings/general" />}
				>
					<SettingsIcon className="me-2 size-4" />
					{t("app.userMenu.accountSettings")}
				</DropdownMenuItem>

				<DropdownMenuItem
					render={<a href="https://lubbx.dev/docs/nextjs" />}
				>
					<BookIcon className="me-2 size-4" />
					{t("app.userMenu.documentation")}
				</DropdownMenuItem>

				<DropdownMenuItem render={<Link href="/" />}>
					<HomeIcon className="me-2 size-4" />
					{t("app.userMenu.home")}
				</DropdownMenuItem>

				<DropdownMenuItem onClick={onLogout}>
					<LogOutIcon className="me-2 size-4" />
					{t("app.userMenu.logout")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
});
