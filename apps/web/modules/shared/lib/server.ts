import "server-only";
import { createQueryClient } from "@shared/lib/query-client";

import type { AppRouter } from "@repo/api";
import { hc } from "hono/client";
import { headers } from "next/headers";
import { cache } from "react";

export const getServerQueryClient = cache(createQueryClient);

const HOP_BY_HOP_HEADERS = [
	"connection",
	"keep-alive",
	"proxy-authenticate",
	"proxy-authorization",
	"te",
	"trailers",
	"transfer-encoding",
	"upgrade",
];

export const getServerApiClient = async () => {
	const headerEntries = (await headers()).entries();
	const headerObject: Record<string, string> = {};

	for (const [key, value] of headerEntries) {
		if (!HOP_BY_HOP_HEADERS.includes(key.toLowerCase())) {
			headerObject[key] = value;
		}
	}

	const port = process.env.PORT ?? 3000;
	const baseUrl = `http://localhost:${port}`;

	return hc<AppRouter>(baseUrl, {
		init: {
			credentials: "include",
			headers: headerObject,
		},
	}).api;
};
