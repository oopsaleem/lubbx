import { db } from "@repo/database";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";

export const toursRouter = new Hono()
	.basePath("/projects/:projectId/tours")
	.use(authMiddleware);

const tourSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	sortOrder: z.number().optional(),
});

const sceneSchema = z.object({
	mediaFileId: z.string(),
	initialPitch: z.number().default(0),
	initialYaw: z.number().default(0),
	initialZoom: z.number().default(100),
	hotspots: z.array(z.any()).default([]),
	sortOrder: z.number().optional(),
});

const hotspotSchema = z.object({
	id: z.string(),
	yaw: z.number(),
	pitch: z.number(),
	labelEn: z.string(),
	labelAr: z.string().optional(),
	targetSceneId: z.string().nullable().optional(),
	externalUrl: z.string().nullable().optional(),
});

async function checkAccess(projectId: string, userId: string) {
	const project = await db.project.findUnique({ where: { id: projectId } });
	if (!project) throw new HTTPException(404);

	const membership = await db.member.findUnique({
		where: {
			organizationId_userId: {
				organizationId: project.organizationId,
				userId,
			},
		},
	});
	if (!membership) throw new HTTPException(403);

	return project;
}

// List tours
toursRouter.get(
	"/",
	validator("param", z.object({ projectId: z.string() })),
	describeRoute({
		tags: ["Tours"],
		summary: "List tours for a project",
		responses: { 200: { description: "Tour list" } },
	}),
	async (c) => {
		const { projectId } = c.req.valid("param");
		const user = c.get("user");
		await checkAccess(projectId, user.id);

		const tours = await db.virtualTour.findMany({
			where: { projectId },
			include: { _count: { select: { scenes: true } } },
			orderBy: { sortOrder: "asc" },
		});
		return c.json(tours);
	},
);

// Create tour
toursRouter.post(
	"/",
	validator("param", z.object({ projectId: z.string() })),
	validator("json", tourSchema),
	describeRoute({
		tags: ["Tours"],
		summary: "Create a tour",
		responses: { 201: { description: "Tour created" } },
	}),
	async (c) => {
		const { projectId } = c.req.valid("param");
		const data = c.req.valid("json");
		const user = c.get("user");
		await checkAccess(projectId, user.id);

		const tour = await db.virtualTour.create({
			data: {
				projectId,
				createdById: user.id,
				name: data.name,
				description: data.description,
				sortOrder: data.sortOrder ?? 0,
			},
		});
		return c.json(tour, 201);
	},
);

// Get tour
toursRouter.get(
	"/:tourId",
	validator("param", z.object({ projectId: z.string(), tourId: z.string() })),
	describeRoute({
		tags: ["Tours"],
		summary: "Get tour details",
		responses: { 200: { description: "Tour details" } },
	}),
	async (c) => {
		const { projectId, tourId } = c.req.valid("param");
		const user = c.get("user");
		await checkAccess(projectId, user.id);

		const tour = await db.virtualTour.findUnique({
			where: { id: tourId },
			include: {
				scenes: { orderBy: { sortOrder: "asc" } },
			},
		});

		if (!tour || tour.projectId !== projectId) throw new HTTPException(404);
		return c.json(tour);
	},
);

// Update tour
toursRouter.put(
	"/:tourId",
	validator("param", z.object({ projectId: z.string(), tourId: z.string() })),
	validator("json", tourSchema),
	describeRoute({
		tags: ["Tours"],
		summary: "Update tour",
		responses: { 200: { description: "Tour updated" } },
	}),
	async (c) => {
		const { projectId, tourId } = c.req.valid("param");
		const data = c.req.valid("json");
		const user = c.get("user");
		await checkAccess(projectId, user.id);

		const tour = await db.virtualTour.findUnique({ where: { id: tourId } });
		if (!tour || tour.projectId !== projectId) throw new HTTPException(404);

		const updated = await db.virtualTour.update({
			where: { id: tourId },
			data,
		});
		return c.json(updated);
	},
);

// Delete tour
toursRouter.delete(
	"/:tourId",
	validator("param", z.object({ projectId: z.string(), tourId: z.string() })),
	describeRoute({
		tags: ["Tours"],
		summary: "Delete tour",
		responses: { 200: { description: "Tour deleted" } },
	}),
	async (c) => {
		const { projectId, tourId } = c.req.valid("param");
		const user = c.get("user");
		await checkAccess(projectId, user.id);

		const tour = await db.virtualTour.findUnique({ where: { id: tourId } });
		if (!tour || tour.projectId !== projectId) throw new HTTPException(404);

		await db.virtualTour.delete({ where: { id: tourId } });
		return c.json({ success: true });
	},
);

// List scenes
toursRouter.get(
	"/:tourId/scenes",
	validator("param", z.object({ projectId: z.string(), tourId: z.string() })),
	describeRoute({
		tags: ["Tours"],
		summary: "List scenes in a tour",
		responses: { 200: { description: "Scene list" } },
	}),
	async (c) => {
		const { tourId } = c.req.valid("param");
		const scenes = await db.panoramaScene.findMany({
			where: { tourId },
			include: { mediaFile: true },
			orderBy: { sortOrder: "asc" },
		});
		return c.json(scenes);
	},
);

// Create scene
toursRouter.post(
	"/:tourId/scenes",
	validator("param", z.object({ projectId: z.string(), tourId: z.string() })),
	validator(
		"json",
		sceneSchema.extend({
			hotspots: z.array(hotspotSchema).default([]),
		}),
	),
	describeRoute({
		tags: ["Tours"],
		summary: "Add a scene to a tour",
		responses: { 201: { description: "Scene created" } },
	}),
	async (c) => {
		const { projectId, tourId } = c.req.valid("param");
		const data = c.req.valid("json");
		const user = c.get("user");
		await checkAccess(projectId, user.id);

		const scene = await db.panoramaScene.create({
			data: {
				tourId,
				mediaFileId: data.mediaFileId,
				initialPitch: data.initialPitch,
				initialYaw: data.initialYaw,
				initialZoom: data.initialZoom,
				hotspots: data.hotspots,
				sortOrder: data.sortOrder ?? 0,
			},
		});
		return c.json(scene, 201);
	},
);

// Update scene
toursRouter.put(
	"/:tourId/scenes/:sceneId",
	validator(
		"param",
		z.object({
			projectId: z.string(),
			tourId: z.string(),
			sceneId: z.string(),
		}),
	),
	validator(
		"json",
		sceneSchema
			.extend({
				hotspots: z.array(hotspotSchema).default([]),
			})
			.partial(),
	),
	describeRoute({
		tags: ["Tours"],
		summary: "Update a scene",
		responses: { 200: { description: "Scene updated" } },
	}),
	async (c) => {
		const { sceneId } = c.req.valid("param");
		const data = c.req.valid("json");

		const scene = await db.panoramaScene.update({
			where: { id: sceneId },
			data,
		});
		return c.json(scene);
	},
);

// Delete scene
toursRouter.delete(
	"/:tourId/scenes/:sceneId",
	validator(
		"param",
		z.object({
			projectId: z.string(),
			tourId: z.string(),
			sceneId: z.string(),
		}),
	),
	describeRoute({
		tags: ["Tours"],
		summary: "Delete a scene",
		responses: { 200: { description: "Scene deleted" } },
	}),
	async (c) => {
		const { sceneId } = c.req.valid("param");
		const user = c.get("user");
		const scene = await db.panoramaScene.findUnique({
			where: { id: sceneId },
		});
		if (!scene) throw new HTTPException(404);

		const tour = await db.virtualTour.findUnique({
			where: { id: scene.tourId },
		});
		if (!tour) throw new HTTPException(404);

		await checkAccess(tour.projectId, user.id);
		await db.panoramaScene.delete({ where: { id: sceneId } });
		return c.json({ success: true });
	},
);

// Reorder scenes
toursRouter.patch(
	"/:tourId/scenes/reorder",
	validator("param", z.object({ projectId: z.string(), tourId: z.string() })),
	validator(
		"json",
		z.object({
			scenes: z.array(
				z.object({ id: z.string(), sortOrder: z.number() }),
			),
		}),
	),
	describeRoute({
		tags: ["Tours"],
		summary: "Reorder scenes",
		responses: { 200: { description: "Scenes reordered" } },
	}),
	async (c) => {
		const { tourId } = c.req.valid("param");
		const { scenes } = c.req.valid("json");

		await Promise.all(
			scenes.map((s) =>
				db.panoramaScene.update({
					where: { id: s.id, tourId },
					data: { sortOrder: s.sortOrder },
				}),
			),
		);
		return c.json({ success: true });
	},
);

// Save hotspots
toursRouter.put(
	"/:tourId/scenes/:sceneId/hotspots",
	validator(
		"param",
		z.object({
			projectId: z.string(),
			tourId: z.string(),
			sceneId: z.string(),
		}),
	),
	validator("json", z.object({ hotspots: z.array(hotspotSchema) })),
	describeRoute({
		tags: ["Tours"],
		summary: "Save hotspots for a scene",
		responses: { 200: { description: "Hotspots saved" } },
	}),
	async (c) => {
		const { sceneId } = c.req.valid("param");
		const { hotspots } = c.req.valid("json");

		const scene = await db.panoramaScene.update({
			where: { id: sceneId },
			data: { hotspots },
		});
		return c.json(scene);
	},
);
