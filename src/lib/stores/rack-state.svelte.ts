import { deviceDefinitions } from '$lib/devices/device-data';
import {
	canPlaceDevice,
	canResizeRack,
	type DraggedDevice,
	type PlacedDevice,
	type Rack
} from '$lib/rack/rack-layout';

export class RackState {
	rack: Rack = $state({ id: 'rack-a', name: 'Rack A', units: 24 });
	placedDevices: PlacedDevice[] = $state([]);
	draggedDevice: DraggedDevice | null = $state(null);
	candidateU: number | null = $state(null);
	selectedDevice: string | null = $state(null);
	message = $state('');
	private nextInstance = 1;

	get draggedDefinition() {
		return this.draggedDevice
			? deviceDefinitions.find((device) => device.id === this.draggedDevice?.deviceDefinitionId)
			: undefined;
	}

	get candidateIsValid() {
		if (!this.draggedDefinition || this.candidateU === null) return false;
		return canPlaceDevice(
			this.candidateU,
			this.draggedDefinition.heightU,
			this.rack.units,
			this.placedDevices,
			deviceDefinitions,
			this.draggedDevice?.instanceId
		);
	}

	startDrag(dragged: DraggedDevice) {
		this.draggedDevice = dragged;
		this.candidateU = null;
		this.message = '';
	}

	previewAt(startU: number) {
		this.candidateU = startU;
	}

	clearPreview() {
		this.candidateU = null;
	}

	finishDrag() {
		this.draggedDevice = null;
		this.candidateU = null;
	}

	commitDrop() {
		if (!this.draggedDevice || this.candidateU === null || !this.candidateIsValid) return false;

		if (this.draggedDevice.instanceId) {
			const placed = this.placedDevices.find(
				(device) => device.instanceId === this.draggedDevice?.instanceId
			);
			if (placed) placed.startU = this.candidateU;
			this.selectedDevice = this.draggedDevice.instanceId;
		} else {
			const instanceId = `device-${this.nextInstance++}`;
			this.placedDevices.push({
				instanceId,
				deviceDefinitionId: this.draggedDevice.deviceDefinitionId,
				startU: this.candidateU
			});
			this.selectedDevice = instanceId;
		}

		this.message = '';
		this.finishDrag();
		return true;
	}

	setRackUnits(units: number) {
		if (!Number.isInteger(units) || units < 6 || units > 52) {
			this.message = 'Rack height must be a whole number from 6U to 52U.';
			return false;
		}
		if (!canResizeRack(units, this.placedDevices, deviceDefinitions)) {
			this.message = `Move devices above U${units} before reducing the rack.`;
			return false;
		}
		this.rack.units = units;
		this.message = '';
		return true;
	}

	removeSelected() {
		if (!this.selectedDevice) return;
		this.placedDevices = this.placedDevices.filter(
			(device) => device.instanceId !== this.selectedDevice
		);
		this.selectedDevice = null;
		this.message = '';
	}
}
