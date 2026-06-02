"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FloorPlanTab } from "./FloorPlanTab";
import { GalleryTab } from "./GalleryTab";
import { ModelTab } from "./ModelTab";
import { TourTab } from "./TourTab";

type TabInfo = {
	available: boolean;
	count: number;
};

type Props = {
	projectId: string;
	title: string;
	description?: string | null;
	tabs: {
		tour: TabInfo;
		model3d: TabInfo;
		floorPlan: TabInfo;
		gallery: TabInfo;
	};
};

export function PropertyViewer({ projectId, title, description, tabs }: Props) {
	const t = useTranslations();
	const [activeTab, setActiveTab] = useState("tour");

	const availableTabs = [
		{
			id: "tour",
			label: t("viewer.tabs.tour"),
			available: tabs.tour.available,
		},
		{
			id: "model3d",
			label: t("viewer.tabs.model3d"),
			available: tabs.model3d.available,
		},
		{
			id: "floorPlan",
			label: t("viewer.tabs.floorPlan"),
			available: tabs.floorPlan.available,
		},
		{
			id: "gallery",
			label: t("viewer.tabs.gallery"),
			available: tabs.gallery.available,
		},
	].filter((tab) => tab.available);

	const hasAnyContent = availableTabs.length > 0;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl">{title}</h1>
				{description && (
					<p className="mt-2 opacity-60">{description}</p>
				)}
			</div>

			{hasAnyContent ? (
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList>
						{availableTabs.map((tab) => (
							<TabsTrigger key={tab.id} value={tab.id}>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>

					<TabsContent value="tour" className="mt-4">
						<TourTab projectId={projectId} />
					</TabsContent>

					<TabsContent value="model3d" className="mt-4">
						<ModelTab />
					</TabsContent>

					<TabsContent value="floorPlan" className="mt-4">
						<FloorPlanTab />
					</TabsContent>

					<TabsContent value="gallery" className="mt-4">
						<GalleryTab />
					</TabsContent>
				</Tabs>
			) : (
				<div className="flex flex-col items-center justify-center py-24 text-center">
					<p className="text-lg opacity-60">
						{t("viewer.empty.title")}
					</p>
					<p className="mt-2 text-sm opacity-40">
						{t("viewer.empty.description")}
					</p>
				</div>
			)}
		</div>
	);
}
