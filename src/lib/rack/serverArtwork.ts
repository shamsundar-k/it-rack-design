import type KonvaNamespace from 'konva';
import { MOUNTING_WIDTH_PX, rackUnitsToPx } from './rackGeometry';

export function createServerArtwork(
	Konva: typeof KonvaNamespace,
	rackUnits: number,
	name?: string
) {
	const width = MOUNTING_WIDTH_PX;
	const serverHeight = rackUnitsToPx(rackUnits);
	const layout = { diskRows: Math.min(4, Math.max(1, Math.round(rackUnits))) };
	const driveHeight = 24;
	const driveRowGap = 7;
	const driveAreaHeight = layout.diskRows * driveHeight + (layout.diskRows - 1) * driveRowGap;
	const labelY = serverHeight - 14;
	// Reserve a dedicated name strip below the bays, including on a 1U chassis.
	const driveStartY = 12 + Math.max(0, (labelY - 6 - 12 - driveAreaHeight) / 2);
	const server = new Konva.Group({ listening: false });
	server.add(
		new Konva.Rect({
			x: 0,
			y: 4,
			width,
			height: serverHeight,
			cornerRadius: 10,
			fillLinearGradientStartPoint: { x: 0, y: 0 },
			fillLinearGradientEndPoint: { x: 0, y: serverHeight },
			fillLinearGradientColorStops: [0, '#177fac', 0.5, '#086a9b', 1, '#05547f'],
			stroke: '#06486f',
			strokeWidth: 2,
			shadowColor: '#245f7a',
			shadowBlur: 20,
			shadowOffsetY: 10,
			shadowOpacity: 0.3
		}),
		new Konva.Rect({
			x: 18,
			y: 18,
			width: 104,
			height: serverHeight - 30,
			cornerRadius: 7,
			fill: '#07557f',
			stroke: '#3092b6',
			strokeWidth: 1
		})
	);

	const leftHandle = new Konva.Rect({
		x: -22,
		y: 13,
		width: 24,
		height: serverHeight - 20,
		cornerRadius: [7, 2, 2, 7],
		fill: '#0a5b85',
		stroke: '#064264',
		strokeWidth: 2
	});
	server.add(leftHandle, leftHandle.clone({ x: width - 2, cornerRadius: [2, 7, 7, 2] }));

	for (const x of [-10, width + 10]) {
		server.add(
			new Konva.Rect({
				x: x - 4,
				y: serverHeight / 2 - 17,
				width: 8,
				height: 34,
				cornerRadius: 4,
				fill: '#063d5c'
			}),
			new Konva.Circle({ x, y: 18, radius: 3, fill: '#b7d5df', stroke: '#053650' }),
			new Konva.Circle({
				x,
				y: serverHeight - 14,
				radius: 3,
				fill: '#b7d5df',
				stroke: '#053650'
			})
		);
	}

	for (const [index, color] of ['#4be095', '#f7c948', '#57b8ff'].entries()) {
		server.add(
			new Konva.Circle({
				x: 38 + index * 25,
				y: 24,
				radius: 5,
				fill: color,
				shadowColor: color,
				shadowBlur: 8,
				shadowOpacity: 0.5
			})
		);
	}

	const serverLabel = new Konva.Text({
		x: 145,
		y: labelY,
		text: name ?? `${rackUnits}U SERVER`,
		width: 422,
		height: 14,
		align: 'center',
		ellipsis: true,
		wrap: 'none',
		fontFamily: 'Inter, sans-serif',
		fontSize: 11,
		fontStyle: 'bold',
		letterSpacing: 0.2,
		fill: '#a9d9e8'
	});
	server.add(
		serverLabel,
		new Konva.Circle({
			x: 70,
			y: serverHeight - 30,
			radius: 11,
			fill: '#06466c',
			stroke: '#67abc3',
			strokeWidth: 1
		}),
		new Konva.Circle({ x: 70, y: serverHeight - 30, radius: 3, fill: '#d9f5ff' })
	);

	for (let row = 0; row < layout.diskRows; row += 1) {
		for (let column = 0; column < 4; column += 1) {
			const x = 145 + column * 108;
			const y = driveStartY + row * (driveHeight + driveRowGap);
			server.add(
				new Konva.Rect({
					x,
					y,
					width: 98,
					height: driveHeight,
					cornerRadius: 4,
					fillLinearGradientStartPoint: { x: 0, y: 0 },
					fillLinearGradientEndPoint: { x: 0, y: driveHeight },
					fillLinearGradientColorStops: [0, '#193b50', 1, '#0b293a'],
					stroke: '#4b9ab7',
					strokeWidth: 1
				}),
				new Konva.Rect({
					x: x + 8,
					y: y + 4,
					width: 80,
					height: 3,
					cornerRadius: 2,
					fill: '#4a7183'
				}),
				new Konva.Rect({
					x: x + 9,
					y: y + 15,
					width: 61,
					height: 4,
					cornerRadius: 2,
					fill: '#071c28'
				}),
				new Konva.Circle({
					x: x + 87,
					y: y + 17,
					radius: 2.5,
					fill: (row + column) % 3 === 0 ? '#55e69a' : '#2e7994'
				})
			);
		}
	}

	server.add(
		new Konva.Rect({
			x: 12,
			y: 9,
			width: width - 24,
			height: 2,
			cornerRadius: 1,
			fill: '#65b9d0',
			opacity: 0.55
		})
	);

	return server;
}
