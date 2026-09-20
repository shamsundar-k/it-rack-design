import type KonvaNamespace from 'konva';
import { MOUNTING_WIDTH_PX, rackUnitsToPx } from './rackGeometry';

export function createServerArtwork(
	Konva: typeof KonvaNamespace,
	rackUnits: number,
	name?: string
) {
	const width = MOUNTING_WIDTH_PX;
	const height = rackUnitsToPx(rackUnits);
	const server = new Konva.Group({ listening: false });
	// Artwork retains the standalone component's 4px top inset.
	const face = new Konva.Group({ y: 4 });
	server.add(face);
	face.add(
		new Konva.Rect({
			width,
			height,
			cornerRadius: 4,
			fillLinearGradientStartPoint: { x: 0, y: 0 },
			fillLinearGradientEndPoint: { x: 0, y: height },
			fillLinearGradientColorStops: [
				0,
				'#83909e',
				0.05,
				'#566371',
				0.45,
				'#35424f',
				0.95,
				'#26323f',
				1,
				'#192430'
			],
			stroke: '#93a4b4',
			strokeWidth: 1
		})
	);
	for (let y = 4; y < height - 3; y += 3) {
		face.add(
			new Konva.Line({
				points: [5, y, width - 5, y],
				stroke: '#cbd5e1',
				opacity: 0.035,
				strokeWidth: 1
			})
		);
	}
	const panelHeight = height - 12;
	face.add(
		new Konva.Rect({
			x: 10,
			y: 6,
			width: 98,
			height: panelHeight,
			cornerRadius: 3,
			fill: '#111c27',
			stroke: '#627281',
			strokeWidth: 1
		})
	);
	face.add(
		new Konva.Rect({
			x: 15,
			y: 11,
			width: 3,
			height: panelHeight - 10,
			cornerRadius: 1,
			fill: '#45b8cd'
		})
	);
	face.add(
		new Konva.Text({
			x: 26,
			y: 13,
			text: `${rackUnits}U`,
			fontSize: 10,
			fontStyle: 'bold',
			fontFamily: 'Inter, sans-serif',
			fill: '#c7d6e1'
		})
	);
	// Power and indicator lights remain distinct even on the compact 1U face.
	face.add(
		new Konva.Circle({
			x: 87,
			y: 21,
			radius: 7,
			fill: '#243746',
			stroke: '#7392a6',
			strokeWidth: 1
		})
	);
	face.add(
		new Konva.Arc({
			x: 87,
			y: 21,
			innerRadius: 3,
			outerRadius: 4,
			angle: 280,
			rotation: -50,
			fill: '#82dfbd'
		})
	);
	face.add(new Konva.Line({ points: [87, 16, 87, 20], stroke: '#82dfbd', strokeWidth: 1.5 }));
	for (const [i, color] of ['#66d4a5', '#56b4d3', '#495664'].entries()) {
		face.add(new Konva.Circle({ x: 29 + i * 13, y: 34, radius: 2, fill: color }));
	}
	if (rackUnits > 1) {
		for (let y = 49; y < height - 17; y += 5) {
			for (let x = 27; x < 92; x += 6)
				face.add(new Konva.Rect({ x, y, width: 3, height: 2, fill: '#425463', cornerRadius: 0.5 }));
		}
	}
	const rows = Math.min(4, Math.max(1, Math.round(rackUnits)));
	const bayX = 120;
	const bayWidth = 112;
	const gap = 5;
	const labelHeight = 17;
	const bayHeight = Math.min(30, (height - labelHeight - 15 - (rows - 1) * gap) / rows);
	const bayAreaHeight = rows * bayHeight + (rows - 1) * gap;
	const startY = 7 + Math.max(0, (height - labelHeight - 14 - bayAreaHeight) / 2);
	for (let row = 0; row < rows; row++) {
		for (let column = 0; column < 4; column++) {
			const x = bayX + column * (bayWidth + gap);
			const y = startY + row * (bayHeight + gap);
			face.add(
				new Konva.Rect({
					x,
					y,
					width: bayWidth,
					height: bayHeight,
					cornerRadius: 2,
					fill: '#0b121a',
					stroke: '#73818c',
					strokeWidth: 0.7
				})
			);
			face.add(
				new Konva.Rect({
					x: x + 4,
					y: y + 3,
					width: bayWidth - 22,
					height: bayHeight - 6,
					cornerRadius: 1,
					fillLinearGradientStartPoint: { x: 0, y: 0 },
					fillLinearGradientEndPoint: { x: 0, y: bayHeight },
					fillLinearGradientColorStops: [0, '#344350', 1, '#1d2a36'],
					stroke: '#425665',
					strokeWidth: 0.5
				})
			);
			for (let vent = 0; vent < 10; vent++) {
				face.add(
					new Konva.Line({
						points: [x + 10 + vent * 7, y + 6, x + 10 + vent * 7, y + bayHeight - 6],
						stroke: '#0d1822',
						strokeWidth: 2
					})
				);
			}
			face.add(
				new Konva.Rect({
					x: x + bayWidth - 16,
					y: y + 3,
					width: 11,
					height: bayHeight - 6,
					cornerRadius: 1,
					fill: '#516372'
				})
			);
			face.add(
				new Konva.Line({
					points: [x + bayWidth - 12, y + 6, x + bayWidth - 12, y + bayHeight - 6],
					stroke: '#8797a4',
					strokeWidth: 1
				})
			);
			face.add(
				new Konva.Circle({
					x: x + bayWidth - 10.5,
					y: y + bayHeight - 6,
					radius: 1.5,
					fill: (row + column) % 3 === 0 ? '#7bddb1' : '#315c52'
				})
			);
		}
	}
	// Full-width nameplate sits below the disks, outside the status panel.
	face.add(
		new Konva.Rect({
			x: bayX,
			y: height - labelHeight,
			width: 463,
			height: 13,
			cornerRadius: 2,
			fill: '#17232f',
			stroke: '#5a6c7b',
			strokeWidth: 0.5
		})
	);
	face.add(
		new Konva.Text({
			x: bayX + 8,
			y: height - labelHeight + 1,
			width: 447,
			height: 12,
			text: name ?? `${rackUnits}U SERVER`,
			fontFamily: 'Inter, sans-serif',
			fontSize: 10,
			fontStyle: 'bold',
			letterSpacing: 0.3,
			align: 'center',
			verticalAlign: 'middle',
			wrap: 'none',
			ellipsis: true,
			fill: '#e1eaf0'
		})
	);
	return server;
}
