"use client";

import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Skeleton } from "@ui/components/skeleton";
import { useTranslations } from "next-intl";
import Link from "next/link";

type Room = {
	id: string;
	name: string;
	sortOrder: number;
};

type Project = {
	id: string;
	title: string;
	description?: string | null;
	address?: string | null;
	price?: number | null;
	status: "DRAFT" | "PUBLISHED";
	featuredImageKey?: string | null;
	createdAt: string;
	rooms: Room[];
	_count: {
		mediaFiles: number;
		virtualTours: number;
	};
};

type Props = {
	project: Project;
	organizationSlug: string;
	onToggleStatus: () => void;
	onDelete: () => void;
	isLoading?: boolean;
};

export function ProjectDetail({
	project,
	organizationSlug,
	onToggleStatus,
	onDelete,
	isLoading,
}: Props) {
	const t = useTranslations();

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-4 w-96" />
				<Skeleton className="h-32 w-full rounded-lg" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="font-bold text-2xl">{project.title}</h1>
					{project.description && (
						<p className="mt-1 opacity-60">{project.description}</p>
					)}
				</div>
				<div className="flex items-center gap-2">
					<Badge
						variant={
							project.status === "PUBLISHED"
								? "default"
								: "secondary"
						}
					>
						{project.status}
					</Badge>
				</div>
			</div>

			{project.address && (
				<p className="text-sm opacity-50">{project.address}</p>
			)}
			{project.price && (
				<p className="font-semibold text-lg">
					{new Intl.NumberFormat("en-US", {
						style: "currency",
						currency: "USD",
					}).format(project.price)}
				</p>
			)}

			<div className="flex flex-wrap gap-2">
				<Button variant="outline" onClick={onToggleStatus}>
					{project.status === "DRAFT"
						? t("projects.actions.publish")
						: t("projects.actions.unpublish")}
				</Button>
				<Link
					href={`/app/${organizationSlug}/projects/${project.id}/edit`}
				>
					<Button variant="outline">
						{t("projects.actions.edit")}
					</Button>
				</Link>
				<Button variant="destructive" onClick={onDelete}>
					{t("projects.actions.delete")}
				</Button>
			</div>

			<div className="grid gap-4 @2xl:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm">
							{t("projects.counts.rooms")}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="font-bold text-2xl">
							{project.rooms.length}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-sm">
							{t("projects.counts.media")}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="font-bold text-2xl">
							{project._count.mediaFiles}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-sm">
							{t("projects.counts.tours")}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="font-bold text-2xl">
							{project._count.virtualTours}
						</p>
					</CardContent>
				</Card>
			</div>

			{project.rooms.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-sm">
							{t("projects.rooms.title")}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="space-y-1">
							{project.rooms
								.sort((a, b) => a.sortOrder - b.sortOrder)
								.map((room) => (
									<li
										key={room.id}
										className="text-sm opacity-70"
									>
										{room.name}
									</li>
								))}
						</ul>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
