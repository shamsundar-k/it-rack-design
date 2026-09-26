export interface RackDevice {
	id: string;
	name: string;
	startU: number;
	sizeU: number;
	category?: 'server' | 'switch' | 'storage';
}
export type RackInstallation = 'wall-mount' | 'floor-stand';

export interface RackModel {
	id: string;
	name: string;
	units: number;
	installation: RackInstallation;
	x?: number;
	y?: number;
	devices: RackDevice[];
}

export const MAX_RACK_UNITS = 52;

export function highestOccupiedUnit(rack: RackModel): number {
	return rack.devices.reduce(
		(highest, device) => Math.max(highest, device.startU + device.sizeU - 1),
		0
	);
}

export function canResizeRack(rack: RackModel, units: number): boolean {
	return (
		Number.isInteger(units) &&
		units > 0 &&
		units <= MAX_RACK_UNITS &&
		highestOccupiedUnit(rack) <= units
	);
}
export function canPlaceDevice(rack: RackModel, device: RackDevice, startU: number): boolean {
	return (
		Number.isInteger(startU) &&
		Number.isInteger(device.sizeU) &&
		device.sizeU > 0 &&
		startU >= 1 &&
		startU + device.sizeU - 1 <= rack.units &&
		!rack.devices.some(
			(other) =>
				other.id !== device.id &&
				startU < other.startU + other.sizeU &&
				other.startU < startU + device.sizeU
		)
	);
}
export function moveDevice(rack: RackModel, id: string, startU: number): RackModel {
	const device = rack.devices.find((item) => item.id === id);
	if (!device || !canPlaceDevice(rack, device, startU)) return rack;
	return {
		...rack,
		devices: rack.devices.map((item) => (item.id === id ? { ...item, startU } : item))
	};
}

export function moveRack(rack: RackModel, x: number, y: number): RackModel {
	if (!Number.isFinite(x) || !Number.isFinite(y)) return rack;
	return { ...rack, x, y };
}
