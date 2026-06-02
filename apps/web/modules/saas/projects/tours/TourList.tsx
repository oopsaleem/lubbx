"use client";

import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { useTranslations } from "next-intl";

type Tour = {
	id: string;
	name: string;
	description?: string | null;
	sortOrder: number;
	_count: { scenes: number };
};

type Props = {
	tours: Tour[];
	onCreate: () => void;
	onDelete: (id: string) => void;
	onSelect: (id: string) => void;
};

export function TourList({ tours, onCreate, onDelete, onSelect }: Props) {
	const t = useTranslations();

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-medium text-lg">
					{t("projects.tours.title")}
				</h3>
				<Button onClick={onCreate}>{t("projects.tours.add")}</Button>
			</div>

			{tours.length === 0 && (
				<Card>
					<CardContent className="py-12 text-center">
						<p className="opacity-60">
							{t("projects.tours.empty")}
						</p>
					</CardContent>
				</Card>
			)}

			<div className="space-y-2">
				{tours
					.sort((a, b) => a.sortOrder - b.sortOrder)
					.map((tour) => (
						<Card
							key={tour.id}
							className="cursor-pointer"
							onClick={() => onSelect(tour.id)}
						>
							<CardHeader className="flex flex-row items-center justify-between py-3">
								<CardTitle className="text-sm">
									{tour.name}
								</CardTitle>
								<div className="flex items-center gap-2">
									<span className="text-xs opacity-50">
										{tour._count.scenes}{" "}
										{t("projects.tours.scenes")}
									</span>
									<Button
										variant="ghost"
										size="sm"
										onClick={(e) => {
											e.stopPropagation();
											onDelete(tour.id);
										}}
									>
										{t("projects.actions.delete")}
									</Button>
								</div>
							</CardHeader>
						</Card>
					))}
			</div>
		</div>
	);
}
