import { apiClient } from "@shared/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const projectsListQueryKey = (
	organizationId: string,
	params?: Record<string, unknown>,
) => ["projects", organizationId, params] as const;

export const projectDetailQueryKey = (projectId: string) =>
	["project", projectId] as const;

export function useProjectsList(
	organizationId: string,
	params?: { page?: number; limit?: number; search?: string },
) {
	return useQuery({
		queryKey: projectsListQueryKey(organizationId, params),
		queryFn: async () => {
			const response = await apiClient.projects.$get({
				query: {
					organizationId,
					page: params?.page ?? 1,
					limit: params?.limit ?? 20,
					search: params?.search,
				},
			});
			if (!response.ok) throw new Error("Failed to fetch projects");
			return response.json();
		},
	});
}

export function useProject(projectId: string) {
	return useQuery({
		queryKey: projectDetailQueryKey(projectId),
		queryFn: async () => {
			const response = await apiClient.projects[":projectId"].$get({
				param: { projectId },
			});
			if (!response.ok) throw new Error("Failed to fetch project");
			return response.json();
		},
		enabled: !!projectId,
	});
}

export function useCreateProjectMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: {
			title: string;
			description?: string;
			address?: string;
			price?: number;
			organizationId: string;
		}) => {
			const response = await apiClient.projects.$post({
				json: data,
			});
			if (!response.ok) throw new Error("Failed to create project");
			return response.json();
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: projectsListQueryKey(variables.organizationId),
			});
		},
	});
}

export function useUpdateProjectMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			projectId,
			...data
		}: {
			projectId: string;
			title?: string;
			description?: string;
			address?: string;
			price?: number;
		}) => {
			const response = await apiClient.projects[":projectId"].$put({
				param: { projectId },
				json: data,
			});
			if (!response.ok) throw new Error("Failed to update project");
			return response.json();
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: projectDetailQueryKey(variables.projectId),
			});
		},
	});
}

export function useDeleteProjectMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			projectId,
			organizationId,
		}: {
			projectId: string;
			organizationId: string;
		}) => {
			const response = await apiClient.projects[":projectId"].$delete({
				param: { projectId },
			});
			if (!response.ok) throw new Error("Failed to delete project");
			queryClient.invalidateQueries({
				queryKey: projectsListQueryKey(organizationId),
			});
		},
	});
}

export function useToggleProjectStatusMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			projectId,
			status,
		}: {
			projectId: string;
			status: "DRAFT" | "PUBLISHED";
		}) => {
			const response = await apiClient.projects[
				":projectId"
			].status.$patch({
				param: { projectId },
				json: { status },
			});
			if (!response.ok) throw new Error("Failed to toggle status");
			return response.json();
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: projectDetailQueryKey(variables.projectId),
			});
		},
	});
}

export function useAddRoomMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			projectId,
			name,
		}: {
			projectId: string;
			name: string;
		}) => {
			const response = await apiClient.projects[":projectId"].rooms.$post(
				{
					param: { projectId },
					json: { name },
				},
			);
			if (!response.ok) throw new Error("Failed to add room");
			return response.json();
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: projectDetailQueryKey(variables.projectId),
			});
		},
	});
}

export function useRemoveRoomMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			projectId,
			roomId,
		}: {
			projectId: string;
			roomId: string;
		}) => {
			const response = await apiClient.projects[":projectId"].rooms[
				":roomId"
			].$delete({
				param: { projectId, roomId },
			});
			if (!response.ok) throw new Error("Failed to remove room");
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: projectDetailQueryKey(variables.projectId),
			});
		},
	});
}
