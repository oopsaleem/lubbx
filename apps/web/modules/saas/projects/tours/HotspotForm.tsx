"use client";

import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { useTranslations } from "next-intl";

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
	hotspot: Hotspot;
	onUpdate: (hotspot: Hotspot) => void;
	onDelete: () => void;
};

export function HotspotForm({ hotspot, onUpdate, onDelete }: Props) {
	const t = useTranslations();

	return (
		<div className="space-y-3 rounded-lg border p-4">
			<div className="flex items-center justify-between">
				<h4 className="text-sm font-medium">
					{t("projects.tours.hotspot")}
				</h4>
				<Button variant="ghost" size="sm" onClick={onDelete}>
					{t("projects.actions.delete")}
				</Button>
			</div>

			<div className="space-y-2">
				<Label>{t("projects.tours.labelEn")}</Label>
				<Input
					value={hotspot.labelEn}
					onChange={(e) =>
						onUpdate({ ...hotspot, labelEn: e.target.value })
					}
				/>
			</div>

			<div className="space-y-2">
				<Label>{t("projects.tours.labelAr")}</Label>
				<Input
					value={hotspot.labelAr ?? ""}
					onChange={(e) =>
						onUpdate({ ...hotspot, labelAr: e.target.value })
					}
				/>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-2">
					<Label>Yaw</Label>
					<Input
						type="number"
						value={hotspot.yaw}
						onChange={(e) =>
							onUpdate({
								...hotspot,
								yaw: Number(e.target.value),
							})
						}
					/>
				</div>
				<div className="space-y-2">
					<Label>Pitch</Label>
					<Input
						type="number"
						value={hotspot.pitch}
						onChange={(e) =>
							onUpdate({
								...hotspot,
								pitch: Number(e.target.value),
							})
						}
					/>
				</div>
			</div>
		</div>
	);
}
