import { db } from "../client";
import type { Post } from "../zod";

export async function getPostsByUserId({
	limit,
	offset,
	authorId,
}: {
	limit: number;
	offset: number;
	authorId: string;
}) {
	return await db.post.findMany({
		where: {
			authorId,
		},
		take: limit,
		skip: offset,
	});
}

export async function getPostsByOrganizationId({
	limit,
	offset,
	organizationId,
}: {
	limit: number;
	offset: number;
	organizationId: string;
}) {
	return await db.post.findMany({
		where: {
			organizationId,
		},
		take: limit,
		skip: offset,
	});
}

export async function getPostById(id: string) {
	return await db.post.findUnique({
		where: {
			id,
		},
	});
}

export async function createPost({
	authorId,
	title,
	content,
}: {
	authorId: string;
	title: string;
	content: string;
}) {
	return await db.post.create({
		data: {
			authorId,
			title,
			content,
		},
	});
}

export async function updatePost({
	id,
	title,
	content,
}: {
	id: string;
	title: string;
	content: Post["content"];
}) {
	return await db.post.update({
		where: {
			id,
		},
		data: {
			title,
			content,
		},
	});
}

export async function deletePost(id: string) {
	return await db.post.delete({
		where: {
			id,
		},
	});
}
