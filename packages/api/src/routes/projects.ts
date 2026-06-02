import { db } from "@repo/database";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";

export const projectsRouter = new Hono().basePath("/projects");

const projectSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	address: z.string().optional(),
	price: z.number().positive().optional(),
});

projectsRouter.use(authMiddleware);

projectsRouter.get(
	"/",
	validator(
		"query",
		z.object({
			organizationId: z.string(),
			page: z.coerce.number().optional().default(1),
			limit: z.coerce.number().optional().default(20),
			search: z.string().optional(),
		}),
	),
	describeRoute({
		tags: ["Projects"],
		summary: "List projects",
		responses: {
			200: {
				description: "List of projects",
				content: {
					"application/json": {
						schema: resolver(
							z.object({
								projects: z.array(z.any()),
								total: z.number(),
								page: z.number(),
								limit: z.number(),
							}),
						),
					},
				},
			},
		},
	}),
	async (c) => {
		const { organizationId, page, limit, search } = c.req.valid("query");
		const user = c.get("user");

		const membership = await db.member.findUnique({
			where: {
				organizationId_userId: { organizationId, userId: user.id },
			},
		});

		if (!membership) throw new HTTPException(403);

		const where = {
			organizationId,
			...(search
				? { title: { contains: search, mode: "insensitive" as const } }
				: {}),
		};

		const [projects, total] = await Promise.all([
			db.project.findMany({
				where,
				include: {
					_count: { select: { rooms: true, mediaFiles: true } },
				},
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * limit,
				take: limit,
			}),
			db.project.count({ where }),
		]);

		return c.json({ projects, total, page, limit });
	},
);

projectsRouter.get(
	"/:projectId",
	validator("param", z.object({ projectId: z.string() })),
	describeRoute({
		tags: ["Projects"],
		summary: "Get project by ID",
		responses: {
			200: { description: "Project details" },
			404: { description: "Project not found" },
		},
	}),
	async (c) => {
		const { projectId } = c.req.valid("param");
		const user = c.get("user");

		const project = await db.project.findUnique({
			where: { id: projectId },
			include: {
				rooms: { orderBy: { sortOrder: "asc" } },
				_count: { select: { mediaFiles: true, virtualTours: true } },
			},
		});

		if (!project) throw new HTTPException(404);

		const membership = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: project.organizationId,
					userId: user.id,
				},
			},
		});

		if (!membership) throw new HTTPException(403);

		return c.json(project);
	},
);

projectsRouter.post(
	"/",
	validator(
		"json",
		projectSchema.extend({
			organizationId: z.string(),
		}),
	),
	describeRoute({
		tags: ["Projects"],
		summary: "Create a project",
		responses: {
			201: { description: "Project created" },
		},
	}),
	async (c) => {
		const data = c.req.valid("json");
		const user = c.get("user");

		const membership = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: data.organizationId,
					userId: user.id,
				},
			},
		});

		if (!membership) throw new HTTPException(403);

		const project = await db.project.create({
			data: {
				title: data.title,
				description: data.description,
				address: data.address,
				price: data.price,
				organizationId: data.organizationId,
				createdById: user.id,
			},
		});

		return c.json(project, 201);
	},
);

projectsRouter.put(
	"/:projectId",
	validator("param", z.object({ projectId: z.string() })),
	validator("json", projectSchema),
	describeRoute({
		tags: ["Projects"],
		summary: "Update a project",
		responses: {
			200: { description: "Project updated" },
			404: { description: "Project not found" },
		},
	}),
	async (c) => {
		const { projectId } = c.req.valid("param");
		const data = c.req.valid("json");
		const user = c.get("user");

		const project = await db.project.findUnique({
			where: { id: projectId },
		});

		if (!project) throw new HTTPException(404);

		const membership = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: project.organizationId,
					userId: user.id,
				},
			},
		});

		if (!membership) throw new HTTPException(403);

		const updated = await db.project.update({
			where: { id: projectId },
			data,
		});

		return c.json(updated);
	},
);

projectsRouter.delete(
	"/:projectId",
	validator("param", z.object({ projectId: z.string() })),
	describeRoute({
		tags: ["Projects"],
		summary: "Delete a project",
		responses: {
			200: { description: "Project deleted" },
			404: { description: "Project not found" },
		},
	}),
	async (c) => {
		const { projectId } = c.req.valid("param");
		const user = c.get("user");

		const project = await db.project.findUnique({
			where: { id: projectId },
		});

		if (!project) throw new HTTPException(404);

		const membership = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: project.organizationId,
					userId: user.id,
				},
			},
		});

		if (!membership) throw new HTTPException(403);

		await db.project.delete({ where: { id: projectId } });

		return c.json({ success: true });
	},
);

projectsRouter.patch(
	"/:projectId/status",
	validator("param", z.object({ projectId: z.string() })),
	validator("json", z.object({ status: z.enum(["DRAFT", "PUBLISHED"]) })),
	describeRoute({
		tags: ["Projects"],
		summary: "Toggle project status",
		responses: {
			200: { description: "Status updated" },
			404: { description: "Project not found" },
		},
	}),
	async (c) => {
		const { projectId } = c.req.valid("param");
		const { status } = c.req.valid("json");
		const user = c.get("user");

		const project = await db.project.findUnique({
			where: { id: projectId },
		});

		if (!project) throw new HTTPException(404);

		const membership = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: project.organizationId,
					userId: user.id,
				},
			},
		});

		if (!membership) throw new HTTPException(403);

		const updated = await db.project.update({
			where: { id: projectId },
			data: { status },
		});

		return c.json(updated);
	},
);

// Room management
projectsRouter.post(
	"/:projectId/rooms",
	validator("param", z.object({ projectId: z.string() })),
	validator(
		"json",
		z.object({ name: z.string().min(1), sortOrder: z.number().optional() }),
	),
	describeRoute({
		tags: ["Projects"],
		summary: "Add a room to a project",
		responses: {
			201: { description: "Room created" },
		},
	}),
	async (c) => {
		const { projectId } = c.req.valid("param");
		const data = c.req.valid("json");
		const user = c.get("user");

		const project = await db.project.findUnique({
			where: { id: projectId },
		});

		if (!project) throw new HTTPException(404);

		const membership = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: project.organizationId,
					userId: user.id,
				},
			},
		});

		if (!membership) throw new HTTPException(403);

		const room = await db.room.create({
			data: {
				projectId,
				name: data.name,
				sortOrder: data.sortOrder ?? 0,
			},
		});

		return c.json(room, 201);
	},
);

projectsRouter.delete(
	"/:projectId/rooms/:roomId",
	validator("param", z.object({ projectId: z.string(), roomId: z.string() })),
	describeRoute({
		tags: ["Projects"],
		summary: "Remove a room",
		responses: {
			200: { description: "Room deleted" },
		},
	}),
	async (c) => {
		const { projectId, roomId } = c.req.valid("param");
		const user = c.get("user");

		const project = await db.project.findUnique({
			where: { id: projectId },
		});

		if (!project) throw new HTTPException(404);

		const membership = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: project.organizationId,
					userId: user.id,
				},
			},
		});

		if (!membership) throw new HTTPException(403);

		await db.room.delete({ where: { id: roomId, projectId } });

		return c.json({ success: true });
	},
);

projectsRouter.patch(
	"/:projectId/rooms/reorder",
	validator("param", z.object({ projectId: z.string() })),
	validator(
		"json",
		z.object({
			rooms: z.array(z.object({ id: z.string(), sortOrder: z.number() })),
		}),
	),
	describeRoute({
		tags: ["Projects"],
		summary: "Reorder rooms",
		responses: {
			200: { description: "Rooms reordered" },
		},
	}),
	async (c) => {
		const { projectId } = c.req.valid("param");
		const { rooms } = c.req.valid("json");
		const user = c.get("user");

		const project = await db.project.findUnique({
			where: { id: projectId },
		});

		if (!project) throw new HTTPException(404);

		const membership = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: project.organizationId,
					userId: user.id,
				},
			},
		});

		if (!membership) throw new HTTPException(403);

		await Promise.all(
			rooms.map((room) =>
				db.room.update({
					where: { id: room.id, projectId },
					data: { sortOrder: room.sortOrder },
				}),
			),
		);

		return c.json({ success: true });
	},
);
