import { getActiveOrganization } from "@saas/auth/lib/server";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProjectsListWrapper } from "./components/ProjectsListWrapper";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ organizationSlug: string }>;
}) {
	const { organizationSlug } = await params;
	const t = await getTranslations();
	return {
		title: t("projects.title"),
	};
}

export default async function ProjectsPage({
	params,
}: {
	params: Promise<{ organizationSlug: string }>;
}) {
	const { organizationSlug } = await params;
	const t = await getTranslations();

	const organization = await getActiveOrganization(organizationSlug);
	if (!organization) return notFound();

	return (
		<div>
			<PageHeader
				title={t("projects.title")}
				subtitle={t("projects.subtitle")}
			/>

			<ProjectsListWrapper
				organizationSlug={organizationSlug}
				organizationId={organization.id}
			/>
		</div>
	);
}
