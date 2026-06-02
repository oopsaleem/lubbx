import { apiClient } from "@shared/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const toursListQueryKey = (projectId: string) =>
	["tours", projectId] as const;

export const tourDetailQueryKey = (tourId: string) => ["tour", tourId] as const;

export const scenesListQueryKey = (tourId: string) =>
	["scenes", tourId] as const;

export function useToursList(projectId: string) {
	return useQuery({
		queryKey: toursListQueryKey(projectId),
		queryFn: async () => {
			const response = await apiClient.projects[":projectId"].tours.$get({
				param: { projectId },
			});
			if (!response.ok) throw new Error("Failed to fetch tours");
			return response.json();
		},
		enabled: !!projectId,
	});
}

export function useTour(tourId: string, projectId: string) {
	return useQuery({
		queryKey: tourDetailQueryKey(tourId),
		queryFn: async () => {
			const response = await apiClient.projects[":projectId"].tours[
				":tourId"
			].$get({
				param: { projectId, tourId },
			});
			if (!response.ok) throw new Error("Failed to fetch tour");
			return response.json();
		},
		enabled: !!tourId && !!projectId,
	});
}

export function useCreateTourMutation(projectId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: { name: string; description?: string }) => {
			const response = await apiClient.projects[":projectId"].tours.$post(
				{
					param: { projectId },
					json: data,
				},
			);
			if (!response.ok) throw new Error("Failed to create tour");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: toursListQueryKey(projectId),
			});
		},
	});
}

export function useDeleteTourMutation(projectId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (tourId: string) => {
			const response = await apiClient.projects[":projectId"].tours[
				":tourId"
			].$delete({
				param: { projectId, tourId },
			});
			if (!response.ok) throw new Error("Failed to delete tour");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: toursListQueryKey(projectId),
			});
		},
	});
}

export function useCreateSceneMutation(tourId: string, projectId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: {
			mediaFileId: string;
			initialPitch?: number;
			initialYaw?: number;
		}) => {
			const response = await apiClient.projects[":projectId"].tours[
				":tourId"
			].scenes.$post({
				param: { projectId, tourId },
				json: data,
			});
			if (!response.ok) throw new Error("Failed to create scene");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: scenesListQueryKey(tourId),
			});
		},
	});
}

export function useSaveHotspotsMutation(tourId: string, projectId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			sceneId,
			hotspots,
		}: { sceneId: string; hotspots: unknown[] }) => {
			const response = await apiClient.projects[":projectId"].tours[
				":tourId"
			].scenes[":sceneId"].hotspots.$put({
				param: { projectId, tourId, sceneId },
				json: { hotspots },
			});
			if (!response.ok) throw new Error("Failed to save hotspots");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: scenesListQueryKey(tourId),
			});
		},
	});
}
