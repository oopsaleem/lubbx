import { getActiveOrganization } from "@saas/auth/lib/server";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProjectDetailWrapper } from "./components/ProjectDetailWrapper";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ organizationSlug: string; projectId: string }>;
}) {
	const { organizationSlug } = await params;
	const organization = await getActiveOrganization(
		organizationSlug as string,
	);
	return {
		title: organization?.name,
	};
}

export default async function ProjectDetailPage({
	params,
}: {
	params: Promise<{ organizationSlug: string; projectId: string }>;
}) {
	const { organizationSlug, projectId } = await params;
	const t = await getTranslations();

	const organization = await getActiveOrganization(
		organizationSlug as string,
	);
	if (!organization) return notFound();

	return (
		<div>
			<PageHeader
				title={t("projects.detail.title")}
				subtitle={t("projects.detail.subtitle")}
			/>

			<ProjectDetailWrapper
				organizationSlug={organizationSlug}
				projectId={projectId}
			/>
		</div>
	);
}
