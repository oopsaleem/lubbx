"use client";

import { Button } from "@ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { HardDriveIcon, MoonIcon, SunIcon } from "lucide-react";
import {
	type Theme,
	useTheme,
} from "@shared/components/ThemeProvider";
import { useState } from "react";
import { useIsClient } from "usehooks-ts";

export function ColorModeToggle() {
	const { resolvedTheme, setTheme, theme } = useTheme();
	const [value, setValue] = useState<Theme>(theme ?? "system");
	const isClient = useIsClient();

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

	if (!isClient) {
		return null;
	}

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					data-test="color-mode-toggle"
					aria-label="Color mode"
				>
					{resolvedTheme === "light" ? (
						<SunIcon className="size-4" />
					) : (
						<MoonIcon className="size-4" />
					)}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent>
				<DropdownMenuRadioGroup
					value={value}
					onValueChange={(value: string) => {
						setTheme(value as Theme);
						setValue(value as Theme);
					}}
				>
					{colorModeOptions.map((option) => (
						<DropdownMenuRadioItem
							key={option.value}
							value={option.value}
							data-test={`color-mode-toggle-item-${option.value}`}
						>
							<option.icon className="mr-2 size-4 opacity-50" />{" "}
							{option.label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
