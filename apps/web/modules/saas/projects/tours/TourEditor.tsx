"use client";

import { Button } from "@ui/components/button";
import { useTranslations } from "next-intl";
import { useState } from "react";

type Props = {
	tourId: string;
	projectId: string;
};

export function TourEditor({ tourId, projectId }: Props) {
	const t = useTranslations();
	const [previewMode, setPreviewMode] = useState(false);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="font-medium text-lg">
					{t("projects.tours.editor")}
				</h3>
				<Button
					variant="outline"
					onClick={() => setPreviewMode(!previewMode)}
				>
					{previewMode
						? t("projects.tours.edit")
						: t("projects.tours.preview")}
				</Button>
			</div>

			<div className="grid gap-6 lg:grid-cols-[1fr_250px]">
				<div className="space-y-4">
					<div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
						<p className="opacity-50">
							{t("projects.tours.panoramaPlaceholder")}
						</p>
					</div>
				</div>

				<div className="space-y-4">
					<div className="rounded-lg border p-4">
						<h4 className="mb-2 text-sm font-medium">
							{t("projects.tours.scenes")}
						</h4>
						<p className="text-sm opacity-50">
							{t("projects.tours.noScenes")}
						</p>
					</div>

					<div className="rounded-lg border p-4">
						<h4 className="mb-2 text-sm font-medium">
							{t("projects.tours.hotspots")}
						</h4>
						<p className="text-sm opacity-50">
							{t("projects.tours.noHotspots")}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
