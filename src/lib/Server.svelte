<script lang="ts">
	import { onMount } from 'svelte';
	import type KonvaNamespace from 'konva';
	import { createServerArtwork } from './rack/serverArtwork';

	import { MOUNTING_WIDTH_PX, rackUnitsToPx } from './rack/rackGeometry';
	const BASE_SERVER_RACK_UNITS = 2;

	let { height = BASE_SERVER_RACK_UNITS }: { height?: number } = $props();

	let canvasHost: HTMLDivElement;
	let rackUnits = $derived(Number.isFinite(height) && height > 0 ? height : BASE_SERVER_RACK_UNITS);
	let serverHeightPx = $derived(rackUnitsToPx(rackUnits));
	let stageHeightPx = $derived(Math.ceil(serverHeightPx + 8));
	let updateDimensions: (() => void) | undefined;

	$effect(() => {
		stageHeightPx;
		updateDimensions?.();
	});

	onMount(() => {
		let disposed = false;
		let stage: KonvaNamespace.Stage | undefined;
		let server: KonvaNamespace.Group | undefined;
		let resizeObserver: ResizeObserver | undefined;
		let renderedRackUnits: number | undefined;

		async function createServer() {
			const Konva = (await import('konva')).default;
			if (disposed) return;

			const width = MOUNTING_WIDTH_PX;
			const serverHeight = serverHeightPx;
			renderedRackUnits = rackUnits;
			stage = new Konva.Stage({
				container: canvasHost,
				width: canvasHost.clientWidth,
				height: stageHeightPx
			});
			const layer = new Konva.Layer();
			stage.add(layer);
			server = createServerArtwork(Konva, rackUnits);
			layer.add(server);

			function fitServer() {
				if (!stage || !server) return;
				const scale = Math.min(1, (stage.width() - 48) / (width + 44));
				server.scale({ x: scale, y: scale });
				server.position({
					x: (stage.width() - width * scale) / 2,
					y: (stage.height() - serverHeight * scale) / 2
				});
				stage.batchDraw();
			}

			function resizeCanvas() {
				if (!stage) return;
				stage.width(canvasHost.clientWidth);
				fitServer();
			}

			updateDimensions = () => {
				if (!stage) return;
				if (renderedRackUnits !== rackUnits) {
					resizeObserver?.disconnect();
					stage.destroy();
					stage = undefined;
					server = undefined;
					void createServer();
					return;
				}
				stage.height(stageHeightPx);
				fitServer();
			};

			fitServer();
			resizeObserver = new ResizeObserver(resizeCanvas);
			resizeObserver.observe(canvasHost);
		}

		void createServer();
		return () => {
			disposed = true;
			updateDimensions = undefined;
			resizeObserver?.disconnect();
			stage?.destroy();
		};
	});
</script>

<div
	class="server"
	bind:this={canvasHost}
	role="img"
	aria-label={`Blue ${rackUnits}U rack server`}
	style:height={`${stageHeightPx}px`}
></div>

<style>
	.server {
		width: min(100%, 680px);
	}
</style>
