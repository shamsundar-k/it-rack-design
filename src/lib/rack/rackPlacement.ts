import {
	rackCabinetSideWidth,
	rackBottomExtension,
	RACK_TOP_COVER_HEIGHT
} from './rackCabinetArtwork.ts';
import { rackUnitsToPx, rackWidth } from './rackGeometry.ts';
import type { RackInstallation } from './rackModel.ts';

export interface RackCabinetBounds {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

export function rackCabinetBounds(
	units: number,
	x: number,
	y: number,
	installation: RackInstallation = 'floor-stand'
): RackCabinetBounds {
	const sideWidth = rackCabinetSideWidth(units);
	return {
		left: x - sideWidth,
		top: y - RACK_TOP_COVER_HEIGHT,
		right: x + rackWidth + sideWidth,
		bottom: y + rackUnitsToPx(units) + rackBottomExtension(installation)
	};
}

export function rackCabinetsOverlap(a: RackCabinetBounds, b: RackCabinetBounds): boolean {
	return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}
