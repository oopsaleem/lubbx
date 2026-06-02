"use client";

import { ProjectForm } from "@saas/projects/components/ProjectForm";
import { useProject, useUpdateProjectMutation } from "@saas/projects/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
	organizationSlug: string;
	projectId: string;
};

export function EditProjectForm({ organizationSlug, projectId }: Props) {
	const router = useRouter();
	const { data: project, isLoading } = useProject(projectId);
	const updateProjectMutation = useUpdateProjectMutation();

	const handleSubmit = async (data: {
		title: string;
		description?: string;
		address?: string;
		price?: number;
	}) => {
		try {
			await updateProjectMutation.mutateAsync({
				projectId,
				...data,
			});
			toast.success("Project updated");
			router.push(`/app/${organizationSlug}/projects/${projectId}`);
		} catch {
			toast.error("Failed to update project");
		}
	};

	if (isLoading) return null;

	return (
		<ProjectForm
			defaultValues={
				project
					? {
							title: project.title,
							description: project.description ?? undefined,
							address: project.address ?? undefined,
							price: project.price
								? Number(project.price)
								: undefined,
						}
					: undefined
			}
			onSubmit={handleSubmit}
			isLoading={updateProjectMutation.isPending}
		/>
	);
}
