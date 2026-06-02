import { getActiveOrganization } from "@saas/auth/lib/server";

export async function getProjectList(organizationSlug: string) {
	const organization = await getActiveOrganization(organizationSlug);
	if (!organization) return null;
	return organization;
}
