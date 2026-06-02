"use client";

import { useTranslations } from "next-intl";

type Props = {
	projectId: string;
};

export function TourTab({ projectId }: Props) {
	const t = useTranslations();

	return (
		<div className="aspect-video rounded-lg bg-black flex items-center justify-center">
			<p className="text-white/50">{t("viewer.tour.loading")}</p>
		</div>
	);
}
