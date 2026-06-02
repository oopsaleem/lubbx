"use client";

import { useTranslations } from "next-intl";

type Props = {
	modelUrl?: string;
};

export function ModelTab({ modelUrl }: Props) {
	const t = useTranslations();

	if (!modelUrl) {
		return (
			<div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
				<p className="opacity-50">{t("viewer.model.unavailable")}</p>
			</div>
		);
	}

	return (
		<div className="aspect-video rounded-lg bg-black flex items-center justify-center">
			<p className="text-white/50">{t("viewer.model.loading")}</p>
		</div>
	);
}
