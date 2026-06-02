import { PropertyViewer } from "@saas/viewers/PropertyViewer";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

async function fetchProjectData(projectId: string) {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
	const response = await fetch(
		`${baseUrl}/api/public/projects/${projectId}`,
		{ next: { revalidate: 60 } },
	);

	if (!response.ok) {
		return null;
	}
	return response.json();
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const data = await fetchProjectData(id);
	if (!data) return { title: "Project not found" };
	return { title: data.project.title };
}

export default async function PublicProjectPage({
	params,
}: {
	params: Promise<{ id: string; locale: string }>;
}) {
	const { id } = await params;
	const t = await getTranslations();

	const data = await fetchProjectData(id);
	if (!data) return notFound();

	return (
		<div className="mx-auto max-w-6xl px-4 py-8">
			<PropertyViewer
				projectId={data.project.id}
				title={data.project.title}
				description={data.project.description}
				tabs={data.tabs}
			/>
		</div>
	);
}
