import { getActiveOrganization } from "@saas/auth/lib/server";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { CreateProjectForm } from "./components/CreateProjectForm";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ organizationSlug: string }>;
}) {
	const { organizationSlug } = await params;
	const organization = await getActiveOrganization(
		organizationSlug as string,
	);
	return {
		title: organization?.name,
	};
}

export default async function NewProjectPage({
	params,
}: {
	params: Promise<{ organizationSlug: string }>;
}) {
	const { organizationSlug } = await params;
	const t = await getTranslations();

	const organization = await getActiveOrganization(
		organizationSlug as string,
	);
	if (!organization) return notFound();

	return (
		<div>
			<PageHeader
				title={t("projects.new.title")}
				subtitle={t("projects.new.subtitle")}
			/>

			<CreateProjectForm
				organizationSlug={organizationSlug}
				organizationId={organization.id}
			/>
		</div>
	);
}
