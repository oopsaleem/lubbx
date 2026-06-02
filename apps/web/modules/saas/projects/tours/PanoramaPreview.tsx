"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";

type Hotspot = {
	id: string;
	yaw: number;
	pitch: number;
	labelEn: string;
	labelAr?: string;
	targetSceneId?: string | null;
	externalUrl?: string | null;
};

type Props = {
	panoramaUrl?: string;
	hotspots?: Hotspot[];
	initialPitch?: number;
	initialYaw?: number;
	editMode?: boolean;
	onHotspotClick?: (yaw: number, pitch: number) => void;
};

export function PanoramaPreview({
	panoramaUrl,
	hotspots,
	initialPitch = 0,
	initialYaw = 0,
	editMode = false,
	onHotspotClick,
}: Props) {
	const t = useTranslations();
	const containerRef = useRef<HTMLDivElement>(null);

	if (!panoramaUrl) {
		return (
			<div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
				<p className="opacity-50">{t("projects.tours.noPanorama")}</p>
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className="relative aspect-video overflow-hidden rounded-lg bg-black"
		>
			<div className="flex h-full items-center justify-center">
				<p className="text-white opacity-50">
					{t("projects.tours.panoramaPlaceholder")}
				</p>
			</div>
			{editMode && (
				<div className="absolute bottom-4 left-4 rounded-md bg-background/80 px-3 py-1 text-xs backdrop-blur">
					{t("projects.tours.editMode")}
				</div>
			)}
		</div>
	);
}
