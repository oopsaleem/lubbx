import { AppWrapper } from "@saas/shared/components/AppWrapper";
import type { PropsWithChildren } from "react";

export default function WithoutOrganizationSlugLayout({
	children,
}: PropsWithChildren) {
	return <AppWrapper>{children}</AppWrapper>;
}
