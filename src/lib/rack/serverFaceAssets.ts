import serverFace1UUrl from '$lib/assets/server-face-1u.svg';
import serverFace2UUrl from '$lib/assets/server-face-2u.svg';
import serverFace3UUrl from '$lib/assets/server-face-3u.svg';
import serverFace4UUrl from '$lib/assets/server-face-4u.svg';

const serverFaceUrls = new Map<number, string>([
	[1, serverFace1UUrl],
	[2, serverFace2UUrl],
	[3, serverFace3UUrl],
	[4, serverFace4UUrl]
]);

const loadedImages = new Map<number, HTMLImageElement>();
const pendingImages = new Map<number, Promise<HTMLImageElement>>();

export function loadServerFaceImage(rackUnits: number): Promise<HTMLImageElement> {
	const url = serverFaceUrls.get(rackUnits);
	if (!url) return Promise.reject(new Error(`No server face asset exists for ${rackUnits}U.`));

	const loaded = loadedImages.get(rackUnits);
	if (loaded) return Promise.resolve(loaded);

	const pending = pendingImages.get(rackUnits);
	if (pending) return pending;

	const request = new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		image.onload = () => {
			loadedImages.set(rackUnits, image);
			pendingImages.delete(rackUnits);
			resolve(image);
		};
		image.onerror = () => {
			pendingImages.delete(rackUnits);
			reject(new Error(`Unable to load the ${rackUnits}U server face.`));
		};
		image.src = url;
	});
	pendingImages.set(rackUnits, request);
	return request;
}

export async function loadServerFaceImages(): Promise<ReadonlyMap<number, HTMLImageElement>> {
	await Promise.all([...serverFaceUrls.keys()].map(loadServerFaceImage));
	return loadedImages;
}
