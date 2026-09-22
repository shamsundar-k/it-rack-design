<script lang="ts">
	import AppHeader from '$lib/layout/AppHeader.svelte';
	import CanvasWorkspace from '$lib/layout/CanvasWorkspace.svelte';
	import ComponentPalette from '$lib/layout/ComponentPalette.svelte';
	import PropertiesPanel from '$lib/layout/PropertiesPanel.svelte';
	import type { LibraryComponent } from '$lib/rack/componentLibrary';
	import { canPlaceDevice, moveDevice, moveRack, type RackModel } from '$lib/rack/rackModel';

	let racks: RackModel[] = $state([]);
	let selectedId = $state<string>();
	let nextRackNumber = 1;
	let nextDeviceNumber = 1;
	let selectedDevice = $derived(
		racks.flatMap((rack) => rack.devices).find((device) => device.id === selectedId)
	);
	let selectedRack = $derived(
		racks.find((rack) => rack.devices.some((device) => device.id === selectedId))
	);

	function move(rackId: string, id: string, startU: number) {
		racks = racks.map((rack) => (rack.id === rackId ? moveDevice(rack, id, startU) : rack));
		selectedId = id;
	}

	function repositionRack(rackId: string, x: number, y: number) {
		racks = racks.map((rack) => (rack.id === rackId ? moveRack(rack, x, y) : rack));
	}

	function renameSelected(name: string) {
		if (!selectedId) return;
		racks = racks.map((rack) => ({
			...rack,
			devices: rack.devices.map((device) =>
				device.id === selectedId ? { ...device, name } : device
			)
		}));
	}

	function addRack(component: Extract<LibraryComponent, { kind: 'rack' }>, x: number, y: number) {
		const number = nextRackNumber++;
		racks = [
			...racks,
			{
				id: `rack-${number}`,
				name: `${component.units}U Rack ${number}`,
				units: component.units,
				x,
				y,
				devices: []
			}
		];
		selectedId = undefined;
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
			sizeU: component.sizeU
		};
		if (!canPlaceDevice(rack, device, startU)) return false;
		nextDeviceNumber++;
		racks = racks.map((item) =>
			item.id === rackId ? { ...item, devices: [...item.devices, device] } : item
		);
		selectedId = device.id;
		return true;
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
	<AppHeader />
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
			rackName={selectedRack?.name}
			onRename={renameSelected}
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
