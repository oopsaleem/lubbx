export type DetectedMediaType =
	| "panorama"
	| "model_3d"
	| "floor_plan"
	| "gallery_image";

const extensionMap: Record<string, DetectedMediaType> = {
	glb: "model_3d",
	gltf: "model_3d",
	tiff: "floor_plan",
	pdf: "floor_plan",
};

const mimeTypeMap: Record<string, string> = {
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	glb: "model/gltf-binary",
	pdf: "application/pdf",
	tiff: "image/tiff",
	tif: "image/tiff",
};

export function getMimeType(fileName: string): string {
	const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
	return mimeTypeMap[ext] ?? "application/octet-stream";
}

export function detectMediaType(fileName: string): DetectedMediaType {
	const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
	return extensionMap[ext] ?? "gallery_image";
}

export function getFileSizeLabel(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function detectPanorama(
	file: File,
): Promise<{ width: number; height: number; isPanorama: boolean }> {
	return new Promise((resolve) => {
		const img = new Image();
		const url = URL.createObjectURL(file);
		img.onload = () => {
			URL.revokeObjectURL(url);
			const aspect = img.width / img.height;
			resolve({
				width: img.width,
				height: img.height,
				isPanorama: aspect >= 2,
			});
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			resolve({ width: 0, height: 0, isPanorama: false });
		};
		img.src = url;
	});
}

export function validateFileSize(file: File): boolean {
	return file.size <= 100 * 1024 * 1024;
}
