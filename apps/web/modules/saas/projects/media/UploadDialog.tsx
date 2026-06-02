"use client";

import { Button } from "@ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@ui/components/dialog";
import { Progress } from "@ui/components/progress";
import { useTranslations } from "next-intl";
import { useCallback, useRef } from "react";
import { getFileSizeLabel, validateFileSize } from "../lib/media-utils";

type UploadFile = {
	file: File;
	progress: number;
	status: "pending" | "uploading" | "confirming" | "done" | "error";
	error?: string;
};

type Props = {
	uploadState: {
		files: UploadFile[];
		isUploading: boolean;
	};
	onAddFiles: (files: File[]) => void;
	onReset: () => void;
};

export function UploadDialog({ uploadState, onAddFiles, onReset }: Props) {
	const t = useTranslations();
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(e.target.files ?? []).filter(
				validateFileSize,
			);
			if (files.length > 0) {
				onAddFiles(files);
			}
			if (inputRef.current) inputRef.current.value = "";
		},
		[onAddFiles],
	);

	const hasFiles = uploadState.files.length > 0;
	const completedCount = uploadState.files.filter(
		(f) => f.status === "done",
	).length;

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>{t("projects.media.upload")}</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{t("projects.media.upload")}</DialogTitle>
				</DialogHeader>

				<input
					ref={inputRef}
					type="file"
					multiple
					className="hidden"
					onChange={handleFileSelect}
					accept=".jpg,.jpeg,.png,.glb,.gltf,.pdf,.tiff,.tif"
				/>

				<Button
					variant="outline"
					onClick={() => inputRef.current?.click()}
					disabled={uploadState.isUploading}
				>
					{t("projects.media.selectFiles")}
				</Button>

				{hasFiles && (
					<div className="max-h-64 space-y-3 overflow-y-auto">
						{uploadState.files.map((file, i) => (
							<div
								key={i}
								className="space-y-1 rounded-lg border p-3"
							>
								<div className="flex items-center justify-between text-sm">
									<span className="truncate">
										{file.file.name}
									</span>
									<span className="shrink-0 opacity-50">
										{getFileSizeLabel(file.file.size)}
									</span>
								</div>
								<Progress value={file.progress} />
								{file.status === "error" && (
									<p className="text-xs text-destructive">
										{file.error}
									</p>
								)}
								{file.status === "done" && (
									<p className="text-xs text-green-600">
										{t("projects.media.uploaded")}
									</p>
								)}
							</div>
						))}
					</div>
				)}

				{hasFiles && !uploadState.isUploading && completedCount > 0 && (
					<Button variant="outline" onClick={onReset}>
						{t("projects.media.clear")}
					</Button>
				)}
			</DialogContent>
		</Dialog>
	);
}
