"use client";

import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Skeleton } from "@ui/components/skeleton";
import { useTranslations } from "next-intl";
import Link from "next/link";

type Project = {
	id: string;
	title: string;
	description?: string | null;
	status: "DRAFT" | "PUBLISHED";
	createdAt: string;
	_count: {
		rooms: number;
		mediaFiles: number;
	};
};

type Props = {
	projects: Project[];
	organizationSlug: string;
	isLoading?: boolean;
};

export function ProjectList({ projects, organizationSlug, isLoading }: Props) {
	const t = useTranslations();

	if (isLoading) {
		return (
			<div className="grid gap-4 @2xl:grid-cols-2 @4xl:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<Skeleton key={i} className="h-40 rounded-lg" />
				))}
			</div>
		);
	}

	if (projects.length === 0) {
		return (
			<Card className="flex flex-col items-center justify-center py-16">
				<CardContent className="text-center">
					<p className="mb-4 text-lg opacity-60">
						{t("projects.empty.title")}
					</p>
					<Link href={`/app/${organizationSlug}/projects/new`}>
						<Button>{t("projects.empty.cta")}</Button>
					</Link>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid gap-4 @2xl:grid-cols-2 @4xl:grid-cols-3">
			{projects.map((project) => (
				<Link
					key={project.id}
					href={`/app/${organizationSlug}/projects/${project.id}`}
				>
					<Card className="h-full transition-shadow hover:shadow-md">
						<CardHeader>
							<div className="flex items-start justify-between gap-2">
								<CardTitle className="text-lg">
									{project.title}
								</CardTitle>
								<span
									className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
										project.status === "PUBLISHED"
											? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
											: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
									}`}
								>
									{project.status}
								</span>
							</div>
						</CardHeader>
						<CardContent>
							{project.description && (
								<p className="mb-3 line-clamp-2 text-sm opacity-60">
									{project.description}
								</p>
							)}
							<div className="flex gap-4 text-xs opacity-50">
								<span>
									{project._count.rooms}{" "}
									{t("projects.counts.rooms")}
								</span>
								<span>
									{project._count.mediaFiles}{" "}
									{t("projects.counts.media")}
								</span>
							</div>
						</CardContent>
					</Card>
				</Link>
			))}
		</div>
	);
}
