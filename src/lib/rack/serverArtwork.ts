import type KonvaNamespace from 'konva';
import { MOUNTING_WIDTH_PX, rackUnitsToPx } from './rackGeometry';

export function createServerArtwork(
	Konva: typeof KonvaNamespace,
	rackUnits: number,
	faceImage: HTMLImageElement,
	name?: string
) {
	const width = MOUNTING_WIDTH_PX;
	const height = rackUnitsToPx(rackUnits);
	const server = new Konva.Group({ listening: false });
	// Preserve the original component's inset; rack rendering offsets this group by -4px.
	const face = new Konva.Group({ y: 4 });
	server.add(face);
	face.add(
		new Konva.Image({
			image: faceImage,
			width,
			height
		})
	);

	const compact = rackUnits === 1;
	face.add(
		new Konva.Text({
			x: 20,
			y: compact ? 5 : 7,
			width: 445,
			height: compact ? 18 : 32,
			text: name ?? `${rackUnits}U SERVER`,
			fontFamily: 'Inter, sans-serif',
			fontSize: compact ? 14 : 21,
			fontStyle: 'bold',
			letterSpacing: 0.3,
			verticalAlign: 'middle',
			wrap: 'none',
			ellipsis: true,
			fill: '#334155'
		})
	);
	return server;
}
