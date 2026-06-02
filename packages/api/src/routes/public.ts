import { config } from "@repo/config";
import { db } from "@repo/database";
import { getSignedUrl } from "@repo/storage";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

export const publicRouter = new Hono().basePath("/public");

publicRouter.get(
	"/projects/:projectId",
	validator("param", z.object({ projectId: z.string() })),
	describeRoute({
		tags: ["Public"],
		summary: "Get published project data",
		responses: {
			200: { description: "Project data" },
			404: { description: "Not found or not published" },
		},
	}),
	async (c) => {
		const { projectId } = c.req.valid("param");

		const project = await db.project.findUnique({
			where: { id: projectId, status: "PUBLISHED" },
			include: {
				organization: { select: { id: true } },
				_count: {
					select: {
						virtualTours: true,
						mediaFiles: {
							where: { type: "MODEL_3D" },
						},
					},
				},
				mediaFiles: {
					select: { type: true },
				},
			},
		});

		if (!project) {
			return c.json(
				{
					error: "not_found",
					message: "Project not found or not published.",
				},
				404,
			);
		}

		const countByType: Record<string, number> = {};
		for (const m of project.mediaFiles) {
			const key = m.type.toLowerCase();
			countByType[key] = (countByType[key] ?? 0) + 1;
		}

		return c.json({
			project: {
				id: project.id,
				title: project.title,
				description: project.description,
				address: project.address,
				price: project.price ? Number(project.price) : null,
				featuredImageUrl: project.featuredImageKey
					? `/api/public/files/${project.featuredImageKey}`
					: null,
			},
			tabs: {
				tour: {
					available: project._count.virtualTours > 0,
					count: project._count.virtualTours,
				},
				model3d: {
					available: (countByType["model_3d"] ?? 0) > 0,
					count: countByType["model_3d"] ?? 0,
				},
				floorPlan: {
					available: (countByType["floor_plan"] ?? 0) > 0,
					count: countByType["floor_plan"] ?? 0,
				},
				gallery: {
					available: (countByType["gallery_image"] ?? 0) > 0,
					count: countByType["gallery_image"] ?? 0,
				},
			},
		});
	},
);

publicRouter.get(
	"/projects/:projectId/tours/:tourId",
	validator("param", z.object({ projectId: z.string(), tourId: z.string() })),
	validator(
		"query",
		z.object({ locale: z.enum(["en", "ar"]).optional().default("en") }),
	),
	describeRoute({
		tags: ["Public"],
		summary: "Get tour data with locale-sensitive labels",
		responses: { 200: { description: "Tour data" } },
	}),
	async (c) => {
		const { tourId } = c.req.valid("param");
		const { locale } = c.req.valid("query");

		const tour = await db.virtualTour.findUnique({
			where: { id: tourId },
			include: {
				scenes: {
					orderBy: { sortOrder: "asc" },
					include: { mediaFile: true },
				},
			},
		});

		if (!tour) throw new HTTPException(404);

		const scenes = tour.scenes.map((scene) => ({
			id: scene.id,
			panoramaUrl: scene.mediaFile.s3Key,
			initialPitch: scene.initialPitch,
			initialYaw: scene.initialYaw,
			initialZoom: scene.initialZoom,
			hotspots: (scene.hotspots as Array<Record<string, unknown>>).map(
				(h: Record<string, unknown>) => ({
					id: h.id,
					yaw: h.yaw,
					pitch: h.pitch,
					label:
						locale === "ar"
							? (h.labelAr as string) || (h.labelEn as string)
							: h.labelEn,
					targetSceneId: h.targetSceneId ?? null,
					externalUrl: h.externalUrl ?? null,
				}),
			),
		}));

		return c.json({
			tour: {
				id: tour.id,
				name: tour.name,
				scenes,
			},
		});
	},
);

publicRouter.get(
	"/projects/:projectId/models",
	validator("param", z.object({ projectId: z.string() })),
	describeRoute({
		tags: ["Public"],
		summary: "Get 3D model files",
		responses: { 200: { description: "Model files" } },
	}),
	async (c) => {
		const { projectId } = c.req.valid("param");
		const project = await db.project.findUnique({
			where: { id: projectId, status: "PUBLISHED" },
		});
		if (!project) throw new HTTPException(404);

		const models = await db.mediaFile.findMany({
			where: { projectId, type: "MODEL_3D" },
		});

		const bucket = config.storage.bucketNames.models;
		const files = await Promise.all(
			models.map(async (m) => ({
				id: m.id,
				filename: m.filename,
				url: await getSignedUrl(m.s3Key, { bucket, expiresIn: 3600 }),
			})),
		);

		return c.json(files);
	},
);

publicRouter.get(
	"/projects/:projectId/floor-plans",
	validator("param", z.object({ projectId: z.string() })),
	describeRoute({
		tags: ["Public"],
		summary: "Get floor plan files",
		responses: { 200: { description: "Floor plan files" } },
	}),
	async (c) => {
		const { projectId } = c.req.valid("param");
		const project = await db.project.findUnique({
			where: { id: projectId, status: "PUBLISHED" },
		});
		if (!project) throw new HTTPException(404);

		const plans = await db.mediaFile.findMany({
			where: { projectId, type: "FLOOR_PLAN" },
		});

		const bucket = config.storage.bucketNames.floorPlans;
		const files = await Promise.all(
			plans.map(async (m) => ({
				id: m.id,
				filename: m.filename,
				url: await getSignedUrl(m.s3Key, { bucket, expiresIn: 3600 }),
			})),
		);

		return c.json(files);
	},
);

publicRouter.get(
	"/projects/:projectId/gallery",
	validator("param", z.object({ projectId: z.string() })),
	describeRoute({
		tags: ["Public"],
		summary: "Get gallery images",
		responses: { 200: { description: "Gallery images" } },
	}),
	async (c) => {
		const { projectId } = c.req.valid("param");
		const project = await db.project.findUnique({
			where: { id: projectId, status: "PUBLISHED" },
		});
		if (!project) throw new HTTPException(404);

		const images = await db.mediaFile.findMany({
			where: { projectId, type: "GALLERY_IMAGE" },
		});

		const bucket = config.storage.bucketNames.gallery;
		const files = await Promise.all(
			images.map(async (m) => ({
				id: m.id,
				filename: m.filename,
				url: await getSignedUrl(m.s3Key, { bucket, expiresIn: 3600 }),
			})),
		);

		return c.json(files);
	},
);
