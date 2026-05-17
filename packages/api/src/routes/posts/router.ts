import {
	PostSchema,
	createPost,
	deletePost,
	getPostById,
	getPostsByOrganizationId,
	getPostsByUserId,
	updatePost,
} from "@repo/database";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth";
import { verifyOrganizationMembership } from "../organizations/lib/membership";

const MessageSchema = z.object({
	role: z.enum(["user", "assistant"]),
	content: z.string(),
});

export const postsRouter = new Hono()
	.basePath("/posts")
	.use(authMiddleware)
	.get(
		"/",
		describeRoute({
			tags: ["POSTS"],
			summary: "Get posts",
			description: "Get all posts for current user",
			responses: {
				200: {
					description: "Posts",
					content: {
						"application/json": {
							schema: resolver(
								z.object({ posts: z.array(PostSchema) }),
							),
						},
					},
				},
			},
		}),
		validator(
			"query",
			z.object({ organizationId: z.string().optional() }).optional(),
		),
		async (c) => {
			const query = c.req.valid("query");
			const posts = await (query?.organizationId
							? getPostsByOrganizationId({
									limit: 10,
									offset: 0,
									organizationId: query?.organizationId,
								})
							: getPostsByUserId({
									limit: 10,
									offset: 0,
									authorId: c.get("user").id,
								}));

			return c.json({ posts });
		},
	)
	.get(
		"/:id",
		describeRoute({
			tags: ["POSTS"],
			summary: "Get post",
			description: "Get a post by id",
			responses: {
				200: {
					description: "Post",
					content: {
						"application/json": {
							schema: resolver(z.object({ post: PostSchema })),
						},
					},
				},
			},
		}),
		async (c) => {
			const { id } = c.req.param();

			const post = await getPostById(id);

			if (!post) {
				throw new HTTPException(404, { message: "Post not found" });
			}

			if (post.organizationId) {
				await verifyOrganizationMembership(
					post.organizationId,
					c.get("user").id,
				);
			} else if (post.authorId !== c.get("user").id) {
				throw new HTTPException(403, { message: "Forbidden" });
			}

			return c.json({ post });
		},
	)
	.post(
		"/posts",
		describeRoute({
			tags: ["POSTS"],
			summary: "Create post",
			description: "Create a new post",
			responses: {
				200: {
					description: "Post",
					content: {
						"application/json": {
							schema: resolver(z.object({ post: PostSchema })),
						},
					},
				},
			},
		}),
		validator(
			"json",
			z.object({
				title: z.string(),
				content: z.string(),
			}),
		),
		async (c) => {
			const { title, content } = c.req.valid("json");
			const user = c.get("user");

			// if (content) {
			// 	await verifyOrganizationMembership(content, user.id);
			// }

			const post = await createPost({
				title,
                content,
				authorId: user.id,
			});

			if (!post) {
				throw new HTTPException(500, {
					message: "Failed to create post",
				});
			}

			return c.json({ post });
		},
	)
	.put(
		"/:id",
		describeRoute({
			tags: ["POSTS"],
			summary: "Update post",
			description: "Update a post by id",
			responses: {
				200: {
					description: "Post",
					content: {
						"application/json": {
							schema: resolver(z.object({ post: PostSchema })),
						},
					},
				},
			},
		}),
		validator("json", z.object({ 
			title: z.string(), 
			content: z.string(), 
		})),
		async (c) => {
			const { id } = c.req.param();
			const { title } = c.req.valid("json");
			const { content } = c.req.valid("json");
			const user = c.get("user");

			const post = await getPostById(id);

			if (!post) {
				throw new HTTPException(404, { message: "Post not found" });
			}

			if (post.organizationId) {
				await verifyOrganizationMembership(
					post.organizationId,
					user.id,
				);
			} else if (post.authorId !== c.get("user").id) {
				throw new HTTPException(403, { message: "Forbidden" });
			}

			const updatedPost = await updatePost({
				id,
				title,
				content,
			});

			return c.json({ post: updatedPost });
		},
	)
	.delete(
		"/:id",
		describeRoute({
			tags: ["POSTS"],
			summary: "Delete post",
			description: "Delete a post by id",
			responses: {
				204: {
					description: "Post deleted",
				},
			},
		}),
		async (c) => {
			const { id } = c.req.param();
			const user = c.get("user");
			const post = await getPostById(id);

			if (!post) {
				throw new HTTPException(404, { message: "Post not found" });
			}

			if (post.organizationId) {
				await verifyOrganizationMembership(
					post.organizationId,
					user.id,
				);
			} else if (post.authorId !== c.get("user").id) {
				throw new HTTPException(403, { message: "Forbidden" });
			}

			await deletePost(id);

			return c.body(null, 204);
		},
	)