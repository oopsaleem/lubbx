"use client";

import { ProjectDetail } from "@saas/projects/components/ProjectDetail";
import {
	useDeleteProjectMutation,
	useProject,
	useToggleProjectStatusMutation,
} from "@saas/projects/lib/api";
import { useActiveOrganizationQuery } from "@saas/organizations/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
	organizationSlug: string;
	projectId: string;
};

export function ProjectDetailWrapper({ organizationSlug, projectId }: Props) {
	const router = useRouter();
	const { data: organization } = useActiveOrganizationQuery(organizationSlug);
	const { data: project, isLoading } = useProject(projectId);
	const toggleStatusMutation = useToggleProjectStatusMutation();
	const deleteMutation = useDeleteProjectMutation();

	const handleToggleStatus = async () => {
		if (!project) return;
		try {
			await toggleStatusMutation.mutateAsync({
				projectId,
				status: project.status === "DRAFT" ? "PUBLISHED" : "DRAFT",
			});
			toast.success("Status updated");
		} catch {
			toast.error("Failed to update status");
		}
	};

	const handleDelete = async () => {
		if (!organization) return;
		try {
			await deleteMutation.mutateAsync({
				projectId,
				organizationId: organization.id,
			});
			toast.success("Project deleted");
			router.push(`/app/${organizationSlug}/projects`);
		} catch {
			toast.error("Failed to delete project");
		}
	};

	return (
		<ProjectDetail
			project={project as any}
			organizationSlug={organizationSlug}
			onToggleStatus={handleToggleStatus}
			onDelete={handleDelete}
			isLoading={isLoading}
		/>
	);
}
