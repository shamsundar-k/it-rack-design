<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import type KonvaNamespace from 'konva';
	import railUrl from '$lib/assets/rack-rail.svg';
	import { parseLibraryComponent, type LibraryComponent } from './componentLibrary';
	import { createRack } from './createRack';
	import { rackCabinetSideWidth } from './rackCabinetArtwork';
	import { rackPosition, rackUnitsToPx, rackWidth, yToStartU } from './rackGeometry';
	import type { RackModel } from './rackModel';
	import { rackCabinetBounds, rackCabinetsOverlap } from './rackPlacement';

	let {
		racks,
		selectedId,
		onSelect,
		onMove,
		onContextMenu,
		onRackMove,
		onAddRack,
		onAddDevice
	}: {
		racks: RackModel[];
		selectedId?: string;
		onSelect: (rackId: string, id: string) => void;
		onMove: (rackId: string, id: string, u: number) => void;
		onContextMenu: (rackId: string, id: string, event: MouseEvent) => void;
		onRackMove: (rackId: string, x: number, y: number) => void;
		onAddRack: (
			component: Extract<LibraryComponent, { kind: 'rack' }>,
			x: number,
			y: number
		) => void;
		onAddDevice: (
			rackId: string,
			component: Extract<LibraryComponent, { kind: 'device' }>,
			startU: number
		) => boolean;
	} = $props();

	let host: HTMLDivElement;
	let stage: KonvaNamespace.Stage | undefined;
	let status = $state('Drag a rack from the library to begin.');
	let refresh: (() => void) | undefined;
	let fit: (() => void) | undefined;
	let layoutSignature = $derived(racks.map((rack) => `${rack.id}:${rack.units}`).join('|'));

	$effect(() => {
		racks;
		selectedId;
		refresh?.();
	});
	$effect(() => {
		layoutSignature;
		untrack(() => fit?.());
	});

	function rackCoordinates(rack: RackModel, index: number) {
		const fallback = rackPosition(index);
		return { x: rack.x ?? fallback.x, y: rack.y ?? fallback.y };
	}

	function overlapsRack(rackId: string | undefined, units: number, x: number, y: number) {
		const candidate = rackCabinetBounds(units, x, y);
		return racks.some((rack, index) => {
			if (rack.id === rackId) return false;
			const position = rackCoordinates(rack, index);
			return rackCabinetsOverlap(candidate, rackCabinetBounds(rack.units, position.x, position.y));
		});
	}

	function dropPoint(event: DragEvent) {
		if (!stage) return;
		const bounds = host.getBoundingClientRect();
		return {
			x: (event.clientX - bounds.left - stage.x()) / stage.scaleX(),
			y: (event.clientY - bounds.top - stage.y()) / stage.scaleY()
		};
	}

	function acceptDrag(event: DragEvent) {
		if (!event.dataTransfer?.types.includes('application/x-rack-component')) return;
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';
	}

	function dropComponent(event: DragEvent) {
		event.preventDefault();
		const component = parseLibraryComponent(
			event.dataTransfer?.getData('application/x-rack-component') ?? ''
		);
		const point = dropPoint(event);
		if (!component || !point) return;

		if (component.kind === 'rack') {
			const sideWidth = rackCabinetSideWidth(component.units);
			const x = Math.max(sideWidth + 16, point.x - rackWidth / 2);
			const y = Math.max(48, point.y - 28);
			if (overlapsRack(undefined, component.units, x, y)) {
				status = 'Rack cannot overlap another rack.';
				return;
			}
			onAddRack(component, x, y);
			status = `${component.name} added to the canvas.`;
			return;
		}

		const target = racks
			.map((rack, index) => ({ rack, ...rackCoordinates(rack, index) }))
			.find(
				({ rack, x, y }) =>
					point.x >= x &&
					point.x <= x + rackWidth &&
					point.y >= y &&
					point.y <= y + rackUnitsToPx(rack.units)
			);
		if (!target) {
			status = 'Drop equipment inside a rack.';
			return;
		}
		const startU = yToStartU(
			point.y - target.y - rackUnitsToPx(component.sizeU) / 2,
			component.sizeU,
			target.rack.units
		);
		status = onAddDevice(target.rack.id, component, startU)
			? `${component.name} placed at U${startU}.`
			: 'That rack position is occupied.';
	}

	onMount(() => {
		let disposed = false;
		let observer: ResizeObserver | undefined;
		const image = new Image();

		async function initialize() {
			try {
				const [module] = await Promise.all([
					import('konva'),
					new Promise<void>((resolve, reject) => {
						image.onload = () => resolve();
						image.onerror = () => reject(new Error('Unable to load rack rails.'));
						image.src = railUrl;
					})
				]);
				if (disposed) return;
				const Konva = module.default;
				const canvas = new Konva.Stage({
					container: host,
					width: host.clientWidth,
					height: host.clientHeight,
					draggable: true
				});
				stage = canvas;
				const layer = new Konva.Layer();
				canvas.add(layer);

				refresh = () => {
					layer.destroyChildren();
					racks.forEach((rack, index) =>
						layer.add(
							createRack(Konva, {
								rack,
								...rackCoordinates(rack, index),
								railImage: image,
								selectedId,
								onSelect: (id) => onSelect(rack.id, id),
								onContextMenu: (id, contextEvent) => onContextMenu(rack.id, id, contextEvent),
								onMove: (id, u) => onMove(rack.id, id, u),
								onRackMove: (x, y) => onRackMove(rack.id, x, y),
								canMoveRack: (x, y) => !overlapsRack(rack.id, rack.units, x, y),
								onStatus: (text) => (status = text)
							}).group
						)
					);
					layer.batchDraw();
				};
				fit = () => {
					if (racks.length === 0) {
						canvas.scale({ x: 1, y: 1 });
						canvas.position({ x: 0, y: 0 });
						return;
					}
					const bounds = racks.map((rack, index) => {
						const position = rackCoordinates(rack, index);
						return rackCabinetBounds(rack.units, position.x, position.y);
					});
					const minX = Math.min(...bounds.map((box) => box.left)) - 32;
					const maxX = Math.max(...bounds.map((box) => box.right)) + 32;
					const minY = Math.min(...bounds.map((box) => box.top)) - 32;
					const maxY = Math.max(...bounds.map((box) => box.bottom)) + 32;
					const width = Math.max(1, maxX - minX);
					const height = Math.max(1, maxY - minY);
					const scale = Math.max(
						0.05,
						Math.min(1, canvas.width() / width, canvas.height() / height)
					);
					canvas.scale({ x: scale, y: scale });
					canvas.position({
						x: (canvas.width() - width * scale) / 2 - minX * scale,
						y: (canvas.height() - height * scale) / 2 - minY * scale
					});
				};
				function zoomAt(factor: number, point: { x: number; y: number }) {
					const old = canvas.scaleX();
					const scale = Math.max(0.05, Math.min(4, old * factor));
					const local = {
						x: (point.x - canvas.x()) / old,
						y: (point.y - canvas.y()) / old
					};
					canvas.scale({ x: scale, y: scale });
					canvas.position({ x: point.x - local.x * scale, y: point.y - local.y * scale });
				}
				canvas.on('wheel', (wheelEvent) => {
					wheelEvent.evt.preventDefault();
					const pointer = canvas.getPointerPosition();
					if (pointer) zoomAt(wheelEvent.evt.deltaY < 0 ? 1.12 : 1 / 1.12, pointer);
				});
				refresh();
				fit();
				observer = new ResizeObserver(() => {
					canvas.size({ width: host.clientWidth, height: host.clientHeight });
					fit?.();
				});
				observer.observe(host);
			} catch (error) {
				if (!disposed)
					status = error instanceof Error ? error.message : 'Unable to initialize canvas.';
			}
		}

		void initialize();
		return () => {
			disposed = true;
			refresh = undefined;
			fit = undefined;
			observer?.disconnect();
			stage?.destroy();
			stage = undefined;
			image.onload = null;
			image.onerror = null;
		};
	});
</script>

<div
	class="canvas"
	bind:this={host}
	role="application"
	aria-label="Rack layout canvas. Drop racks here, then drop equipment inside them."
	ondragover={acceptDrag}
	ondrop={dropComponent}
></div>
<p class="sr-only" role="status">{status}</p>

<style>
	.canvas {
		width: 100%;
		height: 100%;
		overflow: hidden;
		touch-action: none;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
