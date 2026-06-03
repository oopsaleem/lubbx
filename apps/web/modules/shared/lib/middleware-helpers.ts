import type { Organization, Session } from "@repo/auth";
import type { AppRouter } from "@repo/api";
import { hc } from "hono/client";
import type { NextRequest } from "next/server";

const internalOrigin =
	process.env.NODE_ENV === "development"
		? undefined
		: "http://localhost:3000";

function createInternalApiClient(
	fallbackOrigin: string,
) {
	return hc<AppRouter>(internalOrigin ?? fallbackOrigin, {
		init: { credentials: "include" },
	}).api;
}

export const getSession = async (req: NextRequest): Promise<Session | null> => {
	const response = await fetch(
		new URL(
			"/api/auth/get-session?disableCookieCache=true",
			internalOrigin ?? req.nextUrl.origin,
		),
		{
			headers: {
				cookie: req.headers.get("cookie") || "",
			},
		},
	);

	if (!response.ok) {
		return null;
	}

	try {
		const session = await response.json();
		return session;
	} catch (error) {
		console.error("Error parsing session JSON:", error);
		return null;
	}
};

export const getOrganizationsForSession = async (
	req: NextRequest,
): Promise<Organization[]> => {
	const response = await fetch(
		new URL(
			"/api/auth/organization/list",
			internalOrigin ?? req.nextUrl.origin,
		),
		{
			headers: {
				cookie: req.headers.get("cookie") || "",
			},
		},
	);

	if (!response.ok) {
		return [];
	}

	return (await response.json()) ?? [];
};

export const getPurchasesForSession = async (
	req: NextRequest,
	organizationId?: string,
) => {
	const internalClient = createInternalApiClient(req.nextUrl.origin);
	const response = await internalClient.payments.purchases.$get(
		{
			query: {
				organizationId,
			},
		},
		{
			headers: {
				cookie: req.headers.get("cookie") || "",
			},
		},
	);

	if (!response.ok) {
		return [];
	}

	const purchases = await response.json();

	return purchases;
};
