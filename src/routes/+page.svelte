<script lang="ts">
	import AppHeader from '$lib/layout/AppHeader.svelte';
	import { createRackReferenceSvg } from '$lib/export/rackSvg';
	import CanvasWorkspace from '$lib/layout/CanvasWorkspace.svelte';
	import ComponentPalette from '$lib/layout/ComponentPalette.svelte';
	import PropertiesPanel from '$lib/layout/PropertiesPanel.svelte';
	import type { LibraryComponent } from '$lib/rack/componentLibrary';
	import { rackPosition, resizedRackTop } from '$lib/rack/rackGeometry';
	import {
		canPlaceDevice,
		canResizeRack,
		highestOccupiedUnit,
		MAX_RACK_UNITS,
		moveDevice,
		moveRack,
		type RackInstallation,
		type RackModel
	} from '$lib/rack/rackModel';
	import { rackCabinetBounds, rackCabinetsOverlap } from '$lib/rack/rackPlacement';

	type RackResizeResult = { ok: boolean; message: string };

	let racks: RackModel[] = $state([]);
	let selectedId = $state<string>();
	let nextRackNumber = 1;
	let nextDeviceNumber = 1;
	let exportStatus = $state<string>();
	let selectedDevice = $derived(
		racks.flatMap((rack) => rack.devices).find((device) => device.id === selectedId)
	);
	let selectedRack = $derived(
		racks.find(
			(rack) => rack.id === selectedId || rack.devices.some((device) => device.id === selectedId)
		)
	);
	let selectedRackOnly = $derived(selectedRack?.id === selectedId ? selectedRack : undefined);

	function move(rackId: string, id: string, startU: number) {
		racks = racks.map((rack) => (rack.id === rackId ? moveDevice(rack, id, startU) : rack));
		selectedId = id;
	}

	function repositionRack(rackId: string, x: number, y: number) {
		racks = racks.map((rack) => (rack.id === rackId ? moveRack(rack, x, y) : rack));
	}

	function renameSelected(name: string) {
		if (!selectedId) return;
		racks = racks.map((rack) =>
			rack.id === selectedId
				? { ...rack, name }
				: {
						...rack,
						devices: rack.devices.map((device) =>
							device.id === selectedId ? { ...device, name } : device
						)
					}
		);
	}

	function resizeSelectedRack(units: number): RackResizeResult {
		if (!selectedRackOnly)
			return { ok: false, message: 'Select a rack before changing its height.' };
		const rack = selectedRackOnly;
		if (!Number.isInteger(units) || units < 1 || units > MAX_RACK_UNITS)
			return {
				ok: false,
				message: `Rack height must be a whole number from 1U to ${MAX_RACK_UNITS}U.`
			};
		if (units === rack.units) return { ok: true, message: `${rack.name} is already ${units}U.` };

		if (!canResizeRack(rack, units)) {
			const highest = highestOccupiedUnit(rack);
			const blocking = rack.devices.find((device) => device.startU + device.sizeU - 1 > units);
			return {
				ok: false,
				message: blocking
					? `Cannot reduce to ${units}U. ${blocking.name} occupies U${blocking.startU}–U${blocking.startU + blocking.sizeU - 1}. Only free space above U${highest} can be removed.`
					: `Cannot reduce to ${units}U while upper rack units are occupied.`
			};
		}

		const index = racks.findIndex((item) => item.id === rack.id);
		const position = {
			x: rack.x ?? rackPosition(index).x,
			y: rack.y ?? rackPosition(index).y
		};
		const nextY = resizedRackTop(position.y, rack.units, units);
		const nextBounds = rackCabinetBounds(units, position.x, nextY, rack.installation);
		const overlap = racks.find((other, otherIndex) => {
			if (other.id === rack.id) return false;
			const otherPosition = {
				x: other.x ?? rackPosition(otherIndex).x,
				y: other.y ?? rackPosition(otherIndex).y
			};
			return rackCabinetsOverlap(
				nextBounds,
				rackCabinetBounds(other.units, otherPosition.x, otherPosition.y, other.installation)
			);
		});
		if (overlap)
			return {
				ok: false,
				message: `Cannot resize to ${units}U because the rack would overlap ${overlap.name}. Move the rack first.`
			};

		const difference = Math.abs(units - rack.units);
		const increasing = units > rack.units;
		racks = racks.map((item) =>
			item.id === rack.id ? { ...item, units, x: position.x, y: nextY } : item
		);
		return {
			ok: true,
			message: increasing
				? `${rack.name} increased to ${units}U. ${difference}U was added at the top; its bottom and equipment stayed in place.`
				: `${rack.name} reduced to ${units}U. ${difference}U of free space was removed from the top.`
		};
	}

	function changeRackInstallation(installation: RackInstallation): RackResizeResult {
		if (!selectedRackOnly)
			return { ok: false, message: 'Select a rack before changing its installation.' };
		const rack = selectedRackOnly;
		if (rack.installation === installation)
			return {
				ok: true,
				message: `${rack.name} is already configured as ${installation === 'floor-stand' ? 'floor stand' : 'wall mount'}.`
			};
		const index = racks.findIndex((item) => item.id === rack.id);
		const position = {
			x: rack.x ?? rackPosition(index).x,
			y: rack.y ?? rackPosition(index).y
		};
		const nextBounds = rackCabinetBounds(rack.units, position.x, position.y, installation);
		const overlap = racks.find((other, otherIndex) => {
			if (other.id === rack.id) return false;
			const otherPosition = {
				x: other.x ?? rackPosition(otherIndex).x,
				y: other.y ?? rackPosition(otherIndex).y
			};
			return rackCabinetsOverlap(
				nextBounds,
				rackCabinetBounds(other.units, otherPosition.x, otherPosition.y, other.installation)
			);
		});
		if (overlap)
			return {
				ok: false,
				message: `Cannot change the installation because the rack would overlap ${overlap.name}. Move the rack first.`
			};

		racks = racks.map((item) => (item.id === rack.id ? { ...item, installation } : item));
		return {
			ok: true,
			message:
				installation === 'floor-stand'
					? `${rack.name} changed to floor stand. Support legs are now shown.`
					: `${rack.name} changed to wall mount. Support legs were removed.`
		};
	}

	function addRack(component: Extract<LibraryComponent, { kind: 'rack' }>, x: number, y: number) {
		const number = nextRackNumber++;
		const id = `rack-${number}`;
		racks = [
			...racks,
			{
				id,
				name: `${component.units}U Rack ${number}`,
				units: component.units,
				installation: component.installation,
				x,
				y,
				devices: []
			}
		];
		selectedId = id;
	}

	function addDevice(
		rackId: string,
		component: Extract<LibraryComponent, { kind: 'device' }>,
		startU: number
	) {
		const rack = racks.find((item) => item.id === rackId);
		if (!rack) return false;
		const number = nextDeviceNumber;
		const device = {
			id: `device-${number}`,
			name: `${component.name} ${number}`,
			startU,
			sizeU: component.sizeU,
			category: component.category
		};
		if (!canPlaceDevice(rack, device, startU)) return false;
		nextDeviceNumber++;
		racks = racks.map((item) =>
			item.id === rackId ? { ...item, devices: [...item.devices, device] } : item
		);
		selectedId = device.id;
		return true;
	}

	function exportSvg() {
		if (racks.length === 0) return;
		const svg = createRackReferenceSvg(racks);
		const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
		const link = document.createElement('a');
		link.href = url;
		link.download = 'rack-installation-reference.svg';
		document.body.append(link);
		link.click();
		link.remove();
		setTimeout(() => URL.revokeObjectURL(url), 0);
		exportStatus = `Exported ${racks.length} rack${racks.length === 1 ? '' : 's'}`;
	}
</script>

<svelte:head>
	<title>Rack Layout Designer</title>
	<meta
		name="description"
		content="Design and organize rack-mounted IT infrastructure in a visual workspace."
	/>
</svelte:head>

<main class="app-shell">
	<AppHeader canExport={racks.length > 0} {exportStatus} onExport={exportSvg} />
	<div class="designer-layout">
		<ComponentPalette />
		<CanvasWorkspace
			{racks}
			{selectedId}
			onSelect={(_, id) => (selectedId = id)}
			onMove={move}
			onContextMenu={(_, id) => (selectedId = id)}
			onRackMove={repositionRack}
			onAddRack={addRack}
			onAddDevice={addDevice}
		/>
		<PropertiesPanel
			device={selectedDevice}
			rack={selectedRackOnly}
			rackName={selectedRack?.name}
			onRename={renameSelected}
			onResizeRack={resizeSelectedRack}
			onChangeRackInstallation={changeRackInstallation}
		/>
	</div>
</main>

<style>
	.app-shell {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		height: 100dvh;
		overflow: hidden;
	}
	.designer-layout {
		display: grid;
		grid-template-columns: minmax(210px, 240px) minmax(420px, 1fr) minmax(230px, 270px);
		min-height: 0;
	}
	@media (max-width: 900px) {
		.designer-layout {
			grid-template-columns: 190px minmax(380px, 1fr);
		}
		.designer-layout :global(.properties) {
			display: none;
		}
	}
	@media (max-width: 650px) {
		.designer-layout {
			grid-template-columns: minmax(0, 1fr);
		}
		.designer-layout :global(.palette) {
			display: none;
		}
	}
</style>
