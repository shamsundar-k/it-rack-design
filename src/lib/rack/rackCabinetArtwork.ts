import type KonvaNamespace from 'konva';
import { mmToPx, rackWidth } from './rackGeometry.ts';
import type { RackInstallation } from './rackModel.ts';

export const RACK_BOTTOM_EXTENSION = mmToPx(32);
export const RACK_TOP_COVER_HEIGHT = mmToPx(16);
export const RACK_BOTTOM_COVER_HEIGHT = mmToPx(18);

export function rackBottomExtension(installation: RackInstallation): number {
	return installation === 'floor-stand' ? RACK_BOTTOM_EXTENSION : RACK_BOTTOM_COVER_HEIGHT;
}

export function rackCabinetSideWidth(units: number): number {
	const labelScale = Math.max(1, Math.min(2.5, units / 12));
	return 32 * labelScale + 16;
}

export function createRackCabinet(
	Konva: typeof KonvaNamespace,
	height: number,
	sideWidth: number,
	installation: RackInstallation
): KonvaNamespace.Group {
	const cabinet = new Konva.Group({ listening: false });
	const capHeight = RACK_TOP_COVER_HEIGHT;
	const plinthHeight = RACK_BOTTOM_COVER_HEIGHT;
	const footWidth = mmToPx(20);
	const footHeight = mmToPx(10);

	if (installation === 'floor-stand')
		cabinet.add(
			new Konva.Ellipse({
				x: rackWidth / 2,
				y: height + plinthHeight + footHeight + mmToPx(3),
				radiusX: rackWidth / 2 + sideWidth,
				radiusY: mmToPx(5),
				fill: '#94a3b8',
				opacity: 0.18
			})
		);

	cabinet.add(
		new Konva.Rect({
			width: rackWidth,
			height,
			fill: '#102a46',
			stroke: '#5f7287',
			strokeWidth: 1
		}),
		new Konva.Rect({
			x: -sideWidth,
			width: sideWidth,
			height,
			fillLinearGradientStartPoint: { x: 0, y: 0 },
			fillLinearGradientEndPoint: { x: sideWidth, y: 0 },
			fillLinearGradientColorStops: [0, '#8796a8', 1, '#e5ebf1'],
			stroke: '#6b7d90',
			strokeWidth: 1
		}),
		new Konva.Rect({
			x: rackWidth,
			width: sideWidth,
			height,
			fillLinearGradientStartPoint: { x: 0, y: 0 },
			fillLinearGradientEndPoint: { x: sideWidth, y: 0 },
			fillLinearGradientColorStops: [0, '#e5ebf1', 1, '#8796a8'],
			stroke: '#6b7d90',
			strokeWidth: 1
		})
	);

	cabinet.add(
		new Konva.Rect({
			x: -sideWidth,
			y: -capHeight,
			width: rackWidth + sideWidth * 2,
			height: capHeight,
			cornerRadius: [mmToPx(3), mmToPx(3), 0, 0],
			fillLinearGradientStartPoint: { x: 0, y: 0 },
			fillLinearGradientEndPoint: { x: 0, y: capHeight },
			fillLinearGradientColorStops: [0, '#ffffff', 0.5, '#dce4ec', 1, '#a4b1bf'],
			stroke: '#6b7d90',
			strokeWidth: 1
		}),
		new Konva.Line({
			points: [-sideWidth + mmToPx(3), -mmToPx(3), rackWidth + sideWidth - mmToPx(3), -mmToPx(3)],
			stroke: '#8292a3',
			strokeWidth: 1
		})
	);

	cabinet.add(
		new Konva.Rect({
			x: -sideWidth,
			y: height,
			width: rackWidth + sideWidth * 2,
			height: plinthHeight,
			cornerRadius: [0, 0, mmToPx(3), mmToPx(3)],
			fillLinearGradientStartPoint: { x: 0, y: 0 },
			fillLinearGradientEndPoint: { x: 0, y: plinthHeight },
			fillLinearGradientColorStops: [0, '#a4b1bf', 0.45, '#eef2f6', 1, '#8796a8'],
			stroke: '#6b7d90',
			strokeWidth: 1
		}),
		new Konva.Line({
			points: [
				-sideWidth + mmToPx(4),
				height + mmToPx(4),
				rackWidth + sideWidth - mmToPx(4),
				height + mmToPx(4)
			],
			stroke: '#ffffff',
			strokeWidth: 1,
			opacity: 0.9
		})
	);

	if (installation === 'floor-stand')
		for (const x of [-sideWidth + mmToPx(18), rackWidth + sideWidth - mmToPx(18) - footWidth]) {
			cabinet.add(
				new Konva.Rect({
					x,
					y: height + plinthHeight - 1,
					width: footWidth,
					height: footHeight,
					cornerRadius: [0, 0, mmToPx(2), mmToPx(2)],
					fillLinearGradientStartPoint: { x: 0, y: 0 },
					fillLinearGradientEndPoint: { x: 0, y: footHeight },
					fillLinearGradientColorStops: [0, '#aab7c5', 1, '#64748b'],
					stroke: '#64748b',
					strokeWidth: 1
				})
			);
		}

	return cabinet;
}
