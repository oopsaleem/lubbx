"use client";

import { ProjectForm } from "@saas/projects/components/ProjectForm";
import { useCreateProjectMutation } from "@saas/projects/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
	organizationSlug: string;
	organizationId: string;
};

export function CreateProjectForm({ organizationSlug, organizationId }: Props) {
	const router = useRouter();
	const createProjectMutation = useCreateProjectMutation();

	const handleSubmit = async (data: {
		title: string;
		description?: string;
		address?: string;
		price?: number;
	}) => {
		try {
			const project = await createProjectMutation.mutateAsync({
				...data,
				organizationId,
			});
			toast.success("Project created");
			router.push(`/app/${organizationSlug}/projects/${project.id}`);
		} catch {
			toast.error("Failed to create project");
		}
	};

	return (
		<ProjectForm
			onSubmit={handleSubmit}
			isLoading={createProjectMutation.isPending}
		/>
	);
}
