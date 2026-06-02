import { config } from "@repo/config";
import { SessionProvider } from "@saas/auth/components/SessionProvider";
import { sessionQueryKey } from "@saas/auth/lib/api";
import { getOrganizationList, getSession } from "@saas/auth/lib/server";
import { ActiveOrganizationProvider } from "@saas/organizations/components/ActiveOrganizationProvider";
import { organizationListQueryKey } from "@saas/organizations/lib/api";
import { purchasesQueryKey } from "@saas/payments/lib/api";
import { getPurchases } from "@saas/payments/lib/server";
import { ConfirmationAlertProvider } from "@saas/shared/components/ConfirmationAlertProvider";
import { getServerQueryClient } from "@shared/lib/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Layout({ children }: PropsWithChildren) {
	const queryClient = getServerQueryClient();

	const [session, orgList, purchases] = await Promise.all([
		getSession(),
		config.organizations.enable
			? getOrganizationList()
			: Promise.resolve(undefined),
		config.users.enableBilling
			? getPurchases()
			: Promise.resolve(undefined),
	]);

	await queryClient.prefetchQuery({
		queryKey: sessionQueryKey,
		queryFn: () => session,
	});

	if (config.organizations.enable && orgList) {
		await queryClient.prefetchQuery({
			queryKey: organizationListQueryKey,
			queryFn: () => orgList,
		});
	}

	if (config.users.enableBilling && purchases) {
		await queryClient.prefetchQuery({
			queryKey: purchasesQueryKey(),
			queryFn: () => purchases,
		});
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<SessionProvider>
				<ActiveOrganizationProvider>
					<ConfirmationAlertProvider>
						{children}
					</ConfirmationAlertProvider>
				</ActiveOrganizationProvider>
			</SessionProvider>
		</HydrationBoundary>
	);
}
