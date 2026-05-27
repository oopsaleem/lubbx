"use client";

import { DirectionProvider } from "@ui/components/direction";
import type { PropsWithChildren } from "react";

export function DirectionProviderWrapper({
	children,
	direction,
}: PropsWithChildren<{ direction: "ltr" | "rtl" }>) {
	return (
		<DirectionProvider dir={direction}>{children}</DirectionProvider>
	);
}
