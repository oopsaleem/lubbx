import { db } from "@repo/database";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";

export const projectMembersRouter = new Hono()
	.basePath("/projects/:projectId/members")
	.use(authMiddleware);

projectMembersRouter.get(
	"/",
	validator("param", z.object({ projectId: z.string() })),
	describeRoute({
		tags: ["Project Members"],
		summary: "List project members",
		responses: { 200: { description: "Member list" } },
	}),
	async (c) => {
		const { projectId } = c.req.valid("param");

		const members = await db.projectMember.findMany({
			where: { projectId },
			include: {
				user: {
					select: { id: true, name: true, email: true, image: true },
				},
			},
			orderBy: { createdAt: "desc" },
		});

		return c.json(members);
	},
);

projectMembersRouter.post(
	"/invite",
	validator("param", z.object({ projectId: z.string() })),
	validator(
		"json",
		z.object({
			email: z.string().email(),
			role: z.enum(["EDITOR", "VIEWER"]),
		}),
	),
	describeRoute({
		tags: ["Project Members"],
		summary: "Invite a member to a project",
		responses: { 201: { description: "Invitation sent" } },
	}),
	async (c) => {
		const { projectId } = c.req.valid("param");
		const { email, role } = c.req.valid("json");
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

		const existing = await db.projectMember.findFirst({
			where: { projectId, invitedEmail: email, status: "PENDING" },
		});

		if (existing) {
			return c.json(
				{ error: "Invitation already sent to this email" },
				409,
			);
		}

		const member = await db.projectMember.create({
			data: {
				projectId,
				invitedEmail: email,
				role,
			},
		});

		return c.json(member, 201);
	},
);

projectMembersRouter.delete(
	"/:memberId",
	validator(
		"param",
		z.object({ projectId: z.string(), memberId: z.string() }),
	),
	describeRoute({
		tags: ["Project Members"],
		summary: "Remove a member",
		responses: { 200: { description: "Member removed" } },
	}),
	async (c) => {
		const { projectId, memberId } = c.req.valid("param");
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

		await db.projectMember.delete({ where: { id: memberId, projectId } });
		return c.json({ success: true });
	},
);

projectMembersRouter.post(
	"/accept-invitation",
	validator(
		"json",
		z.object({
			token: z.string(),
		}),
	),
	describeRoute({
		tags: ["Project Members"],
		summary: "Accept a project invitation",
		responses: { 200: { description: "Invitation accepted" } },
	}),
	async (c) => {
		const { token } = c.req.valid("json");
		const user = c.get("user");

		const member = await db.projectMember.findUnique({
			where: { id: token },
		});

		if (!member || member.status !== "PENDING") {
			throw new HTTPException(404);
		}

		if (member.invitedEmail !== user.email) {
			throw new HTTPException(403);
		}

		const updated = await db.projectMember.update({
			where: { id: token },
			data: { userId: user.id, status: "ACCEPTED" },
		});

		return c.json(updated);
	},
);
