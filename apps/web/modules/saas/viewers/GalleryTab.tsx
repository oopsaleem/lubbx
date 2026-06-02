"use client";

import { useTranslations } from "next-intl";

type Props = {
	images?: Array<{ id: string; url: string; filename: string }>;
};

export function GalleryTab({ images }: Props) {
	const t = useTranslations();

	if (!images?.length) {
		return (
			<div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
				<p className="opacity-50">{t("viewer.gallery.unavailable")}</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
			{images.map((img) => (
				<div key={img.id} className="overflow-hidden rounded-lg border">
					<div className="aspect-square bg-muted flex items-center justify-center">
						<p className="opacity-30">{img.filename}</p>
					</div>
				</div>
			))}
		</div>
	);
}
