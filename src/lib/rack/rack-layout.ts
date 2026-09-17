/** Real-world dimensions for a standard 19-inch equipment mounting plane. */
export const RACK_UNIT_HEIGHT_MM = 44.45;
export const RACK_MOUNTING_WIDTH_INCHES = 19;
export const RACK_MOUNTING_WIDTH_MM = RACK_MOUNTING_WIDTH_INCHES * 25.4;

/** Display scale: one rack unit is drawn at 30 CSS pixels high. */
export const UNIT_HEIGHT = 30;
export const RACK_MOUNTING_WIDTH = Math.round(
	RACK_MOUNTING_WIDTH_MM * (UNIT_HEIGHT / RACK_UNIT_HEIGHT_MM)
);

export type Rack = {
	id: string;
	name: string;
	units: number;
};

export type DeviceType = 'network' | 'compute' | 'storage' | 'connectivity';

export type DeviceDefinition = {
	id: string;
	name: string;
	description: string;
	heightU: number;
	type: DeviceType;
};

export type PlacedDevice = {
	instanceId: string;
	deviceDefinitionId: string;
	startU: number;
};

export type DraggedDevice = {
	deviceDefinitionId: string;
	instanceId?: string;
	grabOffsetPx: number;
};

export function rackUToY(startU: number, heightU: number, rackUnits: number): number {
	return (rackUnits - startU - heightU + 1) * UNIT_HEIGHT;
}

export function yToRackU(pointerY: number, heightU: number, rackUnits: number): number {
	const snappedRowFromTop = Math.round(pointerY / UNIT_HEIGHT);
	return rackUnits - snappedRowFromTop - heightU + 1;
}

export function occupiedUnits(startU: number, heightU: number): number[] {
	return Array.from({ length: heightU }, (_, index) => startU + index);
}

export function canPlaceDevice(
	startU: number,
	heightU: number,
	rackUnits: number,
	placedDevices: PlacedDevice[],
	deviceDefinitions: DeviceDefinition[],
	ignoreInstanceId?: string
): boolean {
	if (startU < 1 || startU + heightU - 1 > rackUnits) return false;

	const candidateEndU = startU + heightU - 1;
	return placedDevices.every((placed) => {
		if (placed.instanceId === ignoreInstanceId) return true;
		const definition = deviceDefinitions.find((device) => device.id === placed.deviceDefinitionId);
		if (!definition) return true;
		const placedEndU = placed.startU + definition.heightU - 1;
		return candidateEndU < placed.startU || startU > placedEndU;
	});
}

export function canResizeRack(
	units: number,
	placedDevices: PlacedDevice[],
	deviceDefinitions: DeviceDefinition[]
): boolean {
	return placedDevices.every((placed) => {
		const definition = deviceDefinitions.find((device) => device.id === placed.deviceDefinitionId);
		return definition ? placed.startU + definition.heightU - 1 <= units : true;
	});
}
