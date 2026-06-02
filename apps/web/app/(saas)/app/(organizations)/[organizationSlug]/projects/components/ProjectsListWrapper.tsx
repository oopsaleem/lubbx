"use client";

import { ProjectList } from "@saas/projects/components/ProjectList";
import { useProjectsList } from "@saas/projects/lib/api";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@ui/components/button";

type Props = {
	organizationSlug: string;
	organizationId: string;
};

export function ProjectsListWrapper({
	organizationSlug,
	organizationId,
}: Props) {
	const t = useTranslations();
	const { data, isLoading } = useProjectsList(organizationId);

	return (
		<div className="space-y-6">
			<div className="flex justify-end">
				<Link href={`/app/${organizationSlug}/projects/new`}>
					<Button>{t("projects.new.title")}</Button>
				</Link>
			</div>

			<ProjectList
				projects={data?.projects ?? []}
				organizationSlug={organizationSlug}
				isLoading={isLoading}
			/>
		</div>
	);
}
