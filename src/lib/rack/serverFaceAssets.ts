import serverFace1UUrl from '$lib/assets/server-face-1u.svg';
import serverFace2UUrl from '$lib/assets/server-face-2u.svg';
import serverFace3UUrl from '$lib/assets/server-face-3u.svg';
import serverFace4UUrl from '$lib/assets/server-face-4u.svg';
import serverBack1UUrl from '$lib/assets/server-back-1u.svg';
import serverBack2UUrl from '$lib/assets/server-back-2u.svg';
import serverBack3UUrl from '$lib/assets/server-back-3u.svg';
import serverBack4UUrl from '$lib/assets/server-back-4u.svg';

export type ServerView = 'front' | 'back';

const serverFaceUrls = new Map<number, string>([
	[1, serverFace1UUrl],
	[2, serverFace2UUrl],
	[3, serverFace3UUrl],
	[4, serverFace4UUrl]
]);

const serverBackUrls = new Map<number, string>([
	[1, serverBack1UUrl],
	[2, serverBack2UUrl],
	[3, serverBack3UUrl],
	[4, serverBack4UUrl]
]);

const loadedImages = new Map<string, HTMLImageElement>();
const pendingImages = new Map<string, Promise<HTMLImageElement>>();

export function loadServerFaceImage(
	rackUnits: number,
	view: ServerView = 'front'
): Promise<HTMLImageElement> {
	const url = (view === 'back' ? serverBackUrls : serverFaceUrls).get(rackUnits);
	if (!url) return Promise.reject(new Error(`No server ${view} asset exists for ${rackUnits}U.`));
	const key = `${view}-${rackUnits}`;

	const loaded = loadedImages.get(key);
	if (loaded) return Promise.resolve(loaded);

	const pending = pendingImages.get(key);
	if (pending) return pending;

	const request = new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		image.onload = () => {
			loadedImages.set(key, image);
			pendingImages.delete(key);
			resolve(image);
		};
		image.onerror = () => {
			pendingImages.delete(key);
			reject(new Error(`Unable to load the ${rackUnits}U server ${view}.`));
		};
		image.src = url;
	});
	pendingImages.set(key, request);
	return request;
}

export async function loadServerFaceImages(
	view: ServerView = 'front'
): Promise<ReadonlyMap<number, HTMLImageElement>> {
	const urls = view === 'back' ? serverBackUrls : serverFaceUrls;
	const images = new Map<number, HTMLImageElement>();
	await Promise.all(
		[...urls.keys()].map(async (rackUnits) => {
			images.set(rackUnits, await loadServerFaceImage(rackUnits, view));
		})
	);
	return images;
}
