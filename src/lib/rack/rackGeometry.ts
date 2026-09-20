// Preserve the original server drawing's physical scale; zoom is a separate transform.
export const MOUNTING_WIDTH_MM = 482.6;
export const RACK_UNIT_MM = 44.45;
export const MOUNTING_WIDTH_PX = 600;
export const PX_PER_MM = MOUNTING_WIDTH_PX / MOUNTING_WIDTH_MM;
export const mmToPx = (mm: number) => mm * PX_PER_MM;
export const rackUnitsToPx = (units: number) => mmToPx(units * RACK_UNIT_MM);
export const railWidth = mmToPx(20);
// Three evenly spaced visual holes per U, including across SVG tile seams.
export const railHolePitch = rackUnitsToPx(1) / 3;
export const mountingBoltYs = (sizeU: number) => [
	railHolePitch / 2,
	rackUnitsToPx(sizeU) - railHolePitch / 2
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
