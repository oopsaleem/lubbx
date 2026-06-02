"use client";

import { Button } from "@ui/components/button";
import { useTranslations } from "next-intl";

type Scene = {
	id: string;
	sortOrder: number;
	mediaFile: { id: string; filename: string };
	initialYaw: number;
};

type Props = {
	scenes: Scene[];
	activeSceneId?: string | null;
	onSelectScene: (id: string) => void;
	onRemoveScene: (id: string) => void;
	onReorder: (sceneIds: string[]) => void;
};

export function SceneList({
	scenes,
	activeSceneId,
	onSelectScene,
	onRemoveScene,
}: Props) {
	const t = useTranslations();

	return (
		<div className="space-y-2">
			<h3 className="text-sm font-medium">
				{t("projects.tours.scenes")}
			</h3>
			{scenes.length === 0 && (
				<p className="py-4 text-center text-sm opacity-50">
					{t("projects.tours.noScenes")}
				</p>
			)}
			{scenes
				.sort((a, b) => a.sortOrder - b.sortOrder)
				.map((scene) => (
					<div
						key={scene.id}
						className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm ${
							activeSceneId === scene.id
								? "border-primary bg-primary/5"
								: ""
						}`}
						onClick={() => onSelectScene(scene.id)}
					>
						<span className="truncate">
							{scene.mediaFile.filename}
						</span>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={(e) => {
								e.stopPropagation();
								onRemoveScene(scene.id);
							}}
						>
							✕
						</Button>
					</div>
				))}
		</div>
	);
}
