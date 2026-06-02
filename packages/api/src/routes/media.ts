import { config } from "@repo/config";
import { db } from "@repo/database";
import { getSignedUploadUrl } from "@repo/storage";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";

const mediaTypeEnum = z.enum([
	"panorama",
	"model_3d",
	"floor_plan",
	"gallery_image",
]);

const fileSchema = z.object({
	fileName: z.string().min(1),
	fileSize: z
		.number()
		.positive()
		.max(100 * 1024 * 1024),
	mimeType: z.string().min(1),
	mediaType: mediaTypeEnum,
});

const bucketMap: Record<string, string> = {
	panorama: config.storage.bucketNames.panoramas,
	model_3d: config.storage.bucketNames.models,
	floor_plan: config.storage.bucketNames.floorPlans,
	gallery_image: config.storage.bucketNames.gallery,
};

export const mediaRouter = new Hono()
	.basePath("/projects/:projectId/media")
	.use(authMiddleware);

mediaRouter.post(
	"/upload-init",
	validator("param", z.object({ projectId: z.string() })),
	validator(
		"json",
		z.object({
			files: z.array(fileSchema).min(1).max(50),
		}),
	),
	describeRoute({
		tags: ["Media"],
		summary: "Initialize media upload",
		responses: {
			200: { description: "Presigned URLs returned" },
			413: { description: "Storage limit exceeded" },
			429: { description: "Rate limited" },
		},
	}),
	async (c) => {
		const { projectId } = c.req.valid("param");
		const { files } = c.req.valid("json");
		const user = c.get("user");

		const project = await db.project.findUnique({
			where: { id: projectId },
			include: { organization: true },
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

		const totalSize = files.reduce((sum, f) => sum + f.fileSize, 0);

		if (
			project.organization.plan === "FREE" &&
			project.organization.storageLimitBytes &&
			Number(project.organization.storageUsedBytes) + totalSize >
				Number(project.organization.storageLimitBytes)
		) {
			return c.json(
				{
					error: "storage_limit_exceeded",
					message:
						"Storage limit reached. Upgrade your plan to continue uploading.",
					upgradeUrl: "/billing",
				},
				413,
			);
		}

		const uploads = await Promise.all(
			files.map(async (file) => {
				const uploadId = crypto.randomUUID();
				const ext = file.fileName.split(".").pop() || "bin";
				const objectKey = `projects/${projectId}/${file.mediaType}/${uploadId}.${ext}`;
				const bucket = bucketMap[file.mediaType];

				const presignedUrl = await getSignedUploadUrl(objectKey, {
					bucket,
					contentType: file.mimeType,
				});

				return {
					uploadId,
					presignedUrl,
					objectKey,
					fileName: file.fileName,
					mediaType: file.mediaType,
				};
			}),
		);

		return c.json({ uploads });
	},
);

mediaRouter.post(
	"/upload-confirm",
	validator("param", z.object({ projectId: z.string() })),
	validator(
		"json",
		z.object({
			uploads: z.array(
				z.object({
					uploadId: z.string(),
					objectKey: z.string(),
					fileSize: z.number().positive(),
					width: z.number().int().positive().optional(),
					height: z.number().int().positive().optional(),
				}),
			),
		}),
	),
	describeRoute({
		tags: ["Media"],
		summary: "Confirm media upload",
		responses: {
			200: { description: "Media records created" },
			400: { description: "Upload not confirmed" },
			409: { description: "Already confirmed" },
		},
	}),
	async (c) => {
		const { projectId } = c.req.valid("param");
		const { uploads } = c.req.valid("json");
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

		const totalSize = uploads.reduce((sum, u) => sum + u.fileSize, 0);

		const result = await db.$transaction(async (tx) => {
			const mediaRecords = await Promise.all(
				uploads.map(async (upload) => {
					const type = (() => {
						if (upload.objectKey.includes("/model_3d/"))
							return "MODEL_3D";
						if (upload.objectKey.includes("/floor_plan/"))
							return "FLOOR_PLAN";
						if (upload.objectKey.includes("/gallery_image/"))
							return "GALLERY_IMAGE";
						return "PANORAMA";
					})() as
						| "PANORAMA"
						| "MODEL_3D"
						| "FLOOR_PLAN"
						| "GALLERY_IMAGE";

					return tx.mediaFile.create({
						data: {
							projectId,
							uploadedById: user.id,
							filename: upload.uploadId,
							s3Key: upload.objectKey,
							type,
							size: upload.fileSize,
							mimeType:
								type === "MODEL_3D"
									? "model/gltf-binary"
									: "image/jpeg",
							width: upload.width ?? null,
							height: upload.height ?? null,
						},
					});
				}),
			);

			await tx.organization.update({
				where: { id: project.organizationId },
				data: {
					storageUsedBytes: { increment: totalSize },
				},
			});

			return mediaRecords;
		});

		return c.json({
			media: result.map((m) => ({
				id: m.id,
				fileName: m.filename,
				type: m.type,
				size: Number(m.size),
				url: `/api/projects/${projectId}/media/${m.id}/file`,
			})),
			storageUsedBytes: totalSize,
		});
	},
);

mediaRouter.get(
	"/",
	validator("param", z.object({ projectId: z.string() })),
	validator(
		"query",
		z.object({
			roomId: z.string().optional(),
			type: mediaTypeEnum.optional(),
		}),
	),
	describeRoute({
		tags: ["Media"],
		summary: "List media files",
		responses: {
			200: { description: "Media list" },
		},
	}),
	async (c) => {
		const { projectId } = c.req.valid("param");
		const { roomId, type } = c.req.valid("query");
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

		const where: Record<string, unknown> = { projectId };
		if (roomId) where.roomId = roomId;
		if (type) where.type = type.toUpperCase();

		const files = await db.mediaFile.findMany({
			where,
			orderBy: { createdAt: "desc" },
		});

		return c.json(files);
	},
);

mediaRouter.delete(
	"/:mediaId",
	validator(
		"param",
		z.object({ projectId: z.string(), mediaId: z.string() }),
	),
	describeRoute({
		tags: ["Media"],
		summary: "Delete media file",
		responses: {
			200: { description: "Media deleted" },
		},
	}),
	async (c) => {
		const { projectId, mediaId } = c.req.valid("param");
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

		const mediaFile = await db.mediaFile.findUnique({
			where: { id: mediaId },
		});

		if (!mediaFile || mediaFile.projectId !== projectId) {
			throw new HTTPException(404);
		}

		await db.$transaction([
			db.mediaFile.delete({ where: { id: mediaId } }),
			db.organization.update({
				where: { id: project.organizationId },
				data: {
					storageUsedBytes: {
						decrement: Number(mediaFile.size),
					},
				},
			}),
		]);

		return c.json({ success: true });
	},
);

mediaRouter.patch(
	"/:mediaId/assign-room",
	validator(
		"param",
		z.object({ projectId: z.string(), mediaId: z.string() }),
	),
	validator(
		"json",
		z.object({
			roomId: z.string().nullable(),
		}),
	),
	describeRoute({
		tags: ["Media"],
		summary: "Assign media to room",
		responses: {
			200: { description: "Room assigned" },
		},
	}),
	async (c) => {
		const { projectId, mediaId } = c.req.valid("param");
		const { roomId } = c.req.valid("json");
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

		const updated = await db.mediaFile.update({
			where: { id: mediaId, projectId },
			data: { roomId },
		});

		return c.json(updated);
	},
);
