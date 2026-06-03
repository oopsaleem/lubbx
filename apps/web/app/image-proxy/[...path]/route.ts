import { config } from "@repo/config";
import { getSignedUrl } from "@repo/storage";

export const GET = async (
	_req: Request,
	{ params }: { params: Promise<{ path: string[] }> },
) => {
	const { path } = await params;

	const [bucket, filePath] = path;

	if (!(bucket && filePath)) {
		return new Response("Invalid path", { status: 400 });
	}

	const allowedBuckets = Object.values(config.storage.bucketNames);
	if (!allowedBuckets.includes(bucket)) {
		return new Response("Not found", { status: 404 });
	}

	const signedUrl = await getSignedUrl(filePath, {
		bucket,
		expiresIn: 60 * 60,
	});

	const upstream = await fetch(signedUrl);

	if (!upstream.ok) {
		return new Response("Upstream error", {
			status: upstream.status,
		});
	}

	return new Response(upstream.body, {
		headers: {
			"Cache-Control": "max-age=3600",
			"Content-Type":
				upstream.headers.get("Content-Type") ??
				"application/octet-stream",
		},
	});
};
