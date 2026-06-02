"use client";

import { apiClient } from "@shared/lib/api-client";
import { useCallback, useRef, useState } from "react";
import { detectMediaType, getMimeType } from "./media-utils";

type UploadFile = {
	file: File;
	progress: number;
	status: "pending" | "uploading" | "confirming" | "done" | "error";
	error?: string;
};

type UploadState = {
	files: UploadFile[];
	isUploading: boolean;
};

export function useMediaUpload(projectId: string, maxConcurrent = 3) {
	const [state, setState] = useState<UploadState>({
		files: [],
		isUploading: false,
	});
	const queueRef = useRef<UploadFile[]>([]);
	const activeRef = useRef(0);

	const updateFile = useCallback(
		(index: number, updates: Partial<UploadFile>) => {
			setState((prev) => {
				const files = [...prev.files];
				files[index] = { ...files[index], ...updates };
				return { ...prev, files };
			});
		},
		[],
	);

	const uploadFile = useCallback(
		async (file: UploadFile, index: number) => {
			const mediaType = detectMediaType(file.file.name);
			const mimeType = getMimeType(file.file.name);

			updateFile(index, { status: "uploading" });

			try {
				const initResponse = await apiClient.projects[
					":projectId"
				].media["upload-init"].$post({
					param: { projectId },
					json: {
						files: [
							{
								fileName: file.file.name,
								fileSize: file.file.size,
								mimeType,
								mediaType,
							},
						],
					},
				});

				if (!initResponse.ok) {
					const err = await initResponse.json();
					updateFile(index, {
						status: "error",
						error:
							(err as { message?: string }).message ??
							"Upload init failed",
					});
					return;
				}

				const { uploads } = (await initResponse.json()) as {
					uploads: Array<{
						presignedUrl: string;
						uploadId: string;
						objectKey: string;
					}>;
				};
				const upload = uploads[0];

				await new Promise<void>((resolve, reject) => {
					const xhr = new XMLHttpRequest();
					xhr.upload.onprogress = (e) => {
						if (e.lengthComputable) {
							updateFile(index, {
								progress: Math.round((e.loaded / e.total) * 90),
							});
						}
					};
					xhr.onload = () => resolve();
					xhr.onerror = () => reject(new Error("Upload failed"));
					xhr.open("PUT", upload.presignedUrl);
					xhr.setRequestHeader("Content-Type", mimeType);
					xhr.send(file.file);
				});

				updateFile(index, { status: "confirming", progress: 95 });

				const confirmResponse = await apiClient.projects[
					":projectId"
				].media["upload-confirm"].$post({
					param: { projectId },
					json: {
						uploads: [
							{
								uploadId: upload.uploadId,
								objectKey: upload.objectKey,
								fileSize: file.file.size,
							},
						],
					},
				});

				if (!confirmResponse.ok) {
					updateFile(index, {
						status: "error",
						error: "Confirm failed",
					});
					return;
				}

				updateFile(index, { status: "done", progress: 100 });
			} catch (e) {
				updateFile(index, {
					status: "error",
					error: (e as Error).message ?? "Upload error",
				});
			}
		},
		[projectId, updateFile],
	);

	const processQueue = useCallback(async () => {
		if (queueRef.current.length === 0) {
			setState((prev) => ({ ...prev, isUploading: false }));
			return;
		}

		setState((prev) => ({ ...prev, isUploading: true }));

		while (
			queueRef.current.length > 0 &&
			activeRef.current < maxConcurrent
		) {
			const nextFile = queueRef.current.shift()!;
			const index = state.files.indexOf(nextFile);
			activeRef.current++;
			uploadFile(nextFile, index).finally(() => {
				activeRef.current--;
				processQueue();
			});
		}
	}, [maxConcurrent, state.files, uploadFile]);

	const addFiles = useCallback(
		(files: File[]) => {
			const newFiles: UploadFile[] = files.map((file) => ({
				file,
				progress: 0,
				status: "pending" as const,
			}));

			setState((prev) => {
				const updated = {
					...prev,
					files: [...prev.files, ...newFiles],
				};
				return updated;
			});

			queueRef.current.push(...newFiles);
			processQueue();
		},
		[processQueue],
	);

	const reset = useCallback(() => {
		setState({ files: [], isUploading: false });
		queueRef.current = [];
		activeRef.current = 0;
	}, []);

	return { ...state, addFiles, reset };
}
