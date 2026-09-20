<script lang="ts">
	import { onMount } from 'svelte';
	import type KonvaNamespace from 'konva';
	import railUrl from '$lib/assets/rack-rail.svg';
	import { createRack } from './createRack';
	import { rackPosition, rackWidth, rackUnitsToPx } from './rackGeometry';
	import type { RackModel } from './rackModel';
	let {
		racks,
		selectedId,
		onSelect,
		onMove,
		onContextMenu
	}: {
		racks: RackModel[];
		selectedId?: string;
		onSelect: (rackId: string, id: string) => void;
		onMove: (rackId: string, id: string, u: number) => void;
		onContextMenu: (rackId: string, id: string, event: MouseEvent) => void;
	} = $props();
	let host: HTMLDivElement;
	let status = $state('Drag equipment to move it. Drag the background to pan.');
	let refresh: (() => void) | undefined;
	let fit: (() => void) | undefined;
	$effect(() => {
		racks;
		selectedId;
		refresh?.();
	});
	onMount(() => {
		let disposed = false;
		let stage: KonvaNamespace.Stage | undefined;
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
								...rackPosition(index),
								railImage: image,
								selectedId,
								onSelect: (id) => onSelect(rack.id, id),
								onContextMenu: (id, event) => onContextMenu(rack.id, id, event),
								onMove: (id, u) => onMove(rack.id, id, u),
								onStatus: (text) => {
									status = text;
								}
							}).group
						)
					);
					layer.batchDraw();
				};
				fit = () => {
					const width = racks.length ? rackPosition(racks.length - 1).x + rackWidth + 32 : 1;
					const height = Math.max(1, ...racks.map((rack) => rackUnitsToPx(rack.units) + 96));
					const scale = Math.max(
						0.05,
						Math.min(1, canvas.width() / width, canvas.height() / height)
					);
					canvas.scale({ x: scale, y: scale });
					canvas.position({
						x: (canvas.width() - width * scale) / 2,
						y: (canvas.height() - height * scale) / 2
					});
				};
				function zoomAt(factor: number, point: { x: number; y: number }) {
					const old = canvas.scaleX();
					const scale = Math.max(0.05, Math.min(4, old * factor));
					const local = { x: (point.x - canvas.x()) / old, y: (point.y - canvas.y()) / old };
					canvas.scale({ x: scale, y: scale });
					canvas.position({ x: point.x - local.x * scale, y: point.y - local.y * scale });
				}
				canvas.on('wheel', (event) => {
					event.evt.preventDefault();
					const pointer = canvas.getPointerPosition();
					if (pointer) zoomAt(event.evt.deltaY < 0 ? 1.12 : 1 / 1.12, pointer);
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
			image.onload = null;
			image.onerror = null;
		};
	});
</script>

<div
	class="canvas"
	bind:this={host}
	role="img"
	aria-label="Rack rails and mounted equipment. Drag equipment to move, drag background to pan, and scroll to zoom."
></div>
<p class="sr-only" role="status">{status}</p>

<style>
	.canvas {
		width: 100%;
		height: 100dvh;
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
