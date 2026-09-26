// Preserve the original server drawing's physical scale; zoom is a separate transform.
export const MOUNTING_WIDTH_MM = 482.6;
export const RACK_UNIT_MM = 44.45;
export const MOUNTING_WIDTH_PX = 600;
export const PX_PER_MM = MOUNTING_WIDTH_PX / MOUNTING_WIDTH_MM;
export const mmToPx = (mm: number) => mm * PX_PER_MM;
export const rackUnitsToPx = (units: number) => mmToPx(units * RACK_UNIT_MM);
export const railWidth = mmToPx(20);
// EIA-310 hole centers within a 1U (44.45 mm / 1.75 in) repeating pattern.
// This yields center-to-center gaps of 15.875, 15.875, then 12.7 mm.
export const EIA_RAIL_HOLE_OFFSETS_MM = [6.35, 22.225, 38.1] as const;
export const railHoleYs = EIA_RAIL_HOLE_OFFSETS_MM.map(mmToPx);
export const mountingBoltYs = (sizeU: number) => [
	railHoleYs[0],
	rackUnitsToPx(sizeU) - railHoleYs[0]
];
export const rackWidth = MOUNTING_WIDTH_PX + 2 * railWidth;
export const uToY = (u: number, units: number) => rackUnitsToPx(units - u);
export const deviceY = (startU: number, sizeU: number, units: number) =>
	uToY(startU + sizeU - 1, units);
export const yToStartU = (y: number, sizeU: number, units: number) =>
	Math.max(1, Math.min(units - sizeU + 1, units - Math.round(y / rackUnitsToPx(1)) - sizeU + 1));
export const deviceBounds = (startU: number, sizeU: number, units: number) => ({
	x: railWidth,
	y: deviceY(startU, sizeU, units),
	width: MOUNTING_WIDTH_PX,
	height: rackUnitsToPx(sizeU)
});
export const rackPosition = (index: number) => ({ x: 64 + index * (rackWidth + 96), y: 64 });
export const resizedRackTop = (currentTop: number, currentUnits: number, nextUnits: number) =>
	currentTop + rackUnitsToPx(currentUnits - nextUnits);
