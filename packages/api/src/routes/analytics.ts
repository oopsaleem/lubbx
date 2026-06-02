import { db } from "@repo/database";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";

export const analyticsRouter = new Hono()
	.basePath("/analytics")
	.use(authMiddleware);

analyticsRouter.post(
	"/track",
	validator(
		"json",
		z.object({
			projectId: z.string(),
			eventType: z.enum(["VIEW", "SHARE"]),
			metadata: z.record(z.unknown()).optional(),
		}),
	),
	describeRoute({
		tags: ["Analytics"],
		summary: "Track an analytics event",
		responses: { 201: { description: "Event tracked" } },
	}),
	async (c) => {
		const { projectId, eventType, metadata } = c.req.valid("json");

		const event = await db.analyticsEvent.create({
			data: {
				projectId,
				eventType,
				metadata: metadata ?? null,
			},
		});

		return c.json(event, 201);
	},
);

analyticsRouter.get(
	"/:projectId",
	validator("param", z.object({ projectId: z.string() })),
	describeRoute({
		tags: ["Analytics"],
		summary: "Get analytics for a project",
		responses: { 200: { description: "Analytics data" } },
	}),
	async (c) => {
		const { projectId } = c.req.valid("param");

		const [views, shares] = await Promise.all([
			db.analyticsEvent.count({
				where: { projectId, eventType: "VIEW" },
			}),
			db.analyticsEvent.count({
				where: { projectId, eventType: "SHARE" },
			}),
		]);

		return c.json({ views, shares });
	},
);

export const publicAnalyticsRouter = new Hono().basePath("/public/analytics");

publicAnalyticsRouter.post(
	"/track",
	validator(
		"json",
		z.object({
			projectId: z.string(),
			eventType: z.enum(["VIEW", "SHARE"]),
		}),
	),
	describeRoute({
		tags: ["Public Analytics"],
		summary: "Track an analytics event (public, no auth)",
		responses: { 201: { description: "Event tracked" } },
	}),
	async (c) => {
		const { projectId, eventType } = c.req.valid("json");

		await db.analyticsEvent.create({
			data: { projectId, eventType },
		});

		return c.json({ success: true }, 201);
	},
);
