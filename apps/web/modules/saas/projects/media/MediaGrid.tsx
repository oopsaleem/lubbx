"use client";

import { Button } from "@ui/components/button";
import { Skeleton } from "@ui/components/skeleton";
import { useTranslations } from "next-intl";
import { FileCard } from "./FileCard";

type MediaFile = {
	id: string;
	filename: string;
	type: string;
	size: number;
	mimeType: string;
	roomId?: string | null;
	width?: number | null;
	height?: number | null;
	createdAt: string;
};

type Props = {
	files: MediaFile[];
	onDelete: (id: string) => void;
	onAssignRoom?: (id: string, roomId: string | null) => void;
	isLoading?: boolean;
};

export function MediaGrid({ files, onDelete, onAssignRoom, isLoading }: Props) {
	const t = useTranslations();

	if (isLoading) {
		return (
			<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
				{Array.from({ length: 8 }).map((_, i) => (
					<Skeleton key={i} className="aspect-video rounded-lg" />
				))}
			</div>
		);
	}

	if (files.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<p className="mb-4 text-lg opacity-60">
					{t("projects.media.empty.title")}
				</p>
				<p className="mb-6 text-sm opacity-40">
					{t("projects.media.empty.description")}
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
			{files.map((file) => (
				<FileCard
					key={file.id}
					file={file}
					onDelete={onDelete}
					onAssignRoom={onAssignRoom}
				/>
			))}
		</div>
	);
}
