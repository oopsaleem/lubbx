"use client";

import { Button } from "@ui/components/button";
import { useTranslations } from "next-intl";

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
	file: MediaFile;
	onDelete: (id: string) => void;
	onAssignRoom?: (id: string, roomId: string | null) => void;
};

const typeLabels: Record<string, { label: string; color: string }> = {
	PANORAMA: {
		label: "360°",
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	},
	MODEL_3D: {
		label: "3D",
		color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	},
	FLOOR_PLAN: {
		label: "Plan",
		color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	},
	GALLERY_IMAGE: {
		label: "Photo",
		color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
	},
};

export function FileCard({ file, onDelete }: Props) {
	const t = useTranslations();
	const typeInfo = typeLabels[file.type] ?? typeLabels.GALLERY_IMAGE;
	const sizeLabel =
		file.size < 1024 * 1024
			? `${(file.size / 1024).toFixed(0)} KB`
			: `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

	return (
		<div className="group relative overflow-hidden rounded-lg border">
			<div className="aspect-video bg-muted flex items-center justify-center">
				{file.type === "MODEL_3D" ? (
					<span className="text-4xl opacity-30">🧊</span>
				) : (
					<span className="text-4xl opacity-30">🖼</span>
				)}
				<span
					className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-medium ${typeInfo.color}`}
				>
					{typeInfo.label}
				</span>
			</div>
			<div className="p-3">
				<p className="truncate text-sm font-medium">{file.filename}</p>
				<p className="text-xs opacity-50">{sizeLabel}</p>
			</div>
			<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<Button
					variant="destructive"
					size="icon"
					className="h-7 w-7"
					onClick={() => onDelete(file.id)}
				>
					✕
				</Button>
			</div>
		</div>
	);
}
