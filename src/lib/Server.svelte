<script lang="ts">
	import { onMount } from 'svelte';
	import type KonvaNamespace from 'konva';

	// The drawing's logical width represents the EIA-310 19-inch mounting width.
	const MOUNTING_WIDTH_MM = 482.6;
	const RACK_UNIT_MM = 44.45;
	const MOUNTING_WIDTH_PX = 600;
	const PX_PER_MM = MOUNTING_WIDTH_PX / MOUNTING_WIDTH_MM;
	const mmToPx = (millimetres: number) => millimetres * PX_PER_MM;
	const rackUnitsToPx = (units: number) => mmToPx(units * RACK_UNIT_MM);
	const BASE_SERVER_RACK_UNITS = 2;
	const BASE_SERVER_HEIGHT_PX = rackUnitsToPx(BASE_SERVER_RACK_UNITS);
	const SERVER_LAYOUTS = {
		1: { diskRows: 1 },
		2: { diskRows: 2 },
		3: { diskRows: 3 },
		4: { diskRows: 4 }
	} as const;
	const getServerLayout = (units: number) =>
		SERVER_LAYOUTS[Math.min(4, Math.max(1, Math.round(units))) as keyof typeof SERVER_LAYOUTS];

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
		let serverLabel: KonvaNamespace.Text | undefined;
		let resizeObserver: ResizeObserver | undefined;
		let renderedRackUnits: number | undefined;

		async function createServer() {
			const Konva = (await import('konva')).default;
			if (disposed) return;

			const width = MOUNTING_WIDTH_PX;
			const serverHeight = serverHeightPx;
			const layout = getServerLayout(rackUnits);
			renderedRackUnits = rackUnits;
			const driveHeight = 32;
			const driveRowGap = 7;
			const driveAreaHeight = layout.diskRows * driveHeight + (layout.diskRows - 1) * driveRowGap;
			const driveStartY = (serverHeight - driveAreaHeight) / 2;
			stage = new Konva.Stage({
				container: canvasHost,
				width: canvasHost.clientWidth,
				height: stageHeightPx
			});
			const layer = new Konva.Layer();
			stage.add(layer);
			server = new Konva.Group();

			server.add(
				new Konva.Rect({
					x: 0,
					y: 4,
					width,
					height: serverHeight,
					cornerRadius: 10,
					fillLinearGradientStartPoint: { x: 0, y: 0 },
					fillLinearGradientEndPoint: { x: 0, y: serverHeight },
					fillLinearGradientColorStops: [0, '#177fac', 0.5, '#086a9b', 1, '#05547f'],
					stroke: '#06486f',
					strokeWidth: 2,
					shadowColor: '#245f7a',
					shadowBlur: 20,
					shadowOffsetY: 10,
					shadowOpacity: 0.3
				}),
				new Konva.Rect({
					x: 18,
					y: 18,
					width: 104,
					height: serverHeight - 30,
					cornerRadius: 7,
					fill: '#07557f',
					stroke: '#3092b6',
					strokeWidth: 1
				})
			);

			const leftHandle = new Konva.Rect({
				x: -22,
				y: 13,
				width: 24,
				height: serverHeight - 20,
				cornerRadius: [7, 2, 2, 7],
				fill: '#0a5b85',
				stroke: '#064264',
				strokeWidth: 2
			});
			server.add(leftHandle, leftHandle.clone({ x: width - 2, cornerRadius: [2, 7, 7, 2] }));

			for (const x of [-10, width + 10]) {
				server.add(
					new Konva.Rect({
						x: x - 4,
						y: serverHeight / 2 - 17,
						width: 8,
						height: 34,
						cornerRadius: 4,
						fill: '#063d5c'
					}),
					new Konva.Circle({ x, y: 18, radius: 3, fill: '#b7d5df', stroke: '#053650' }),
					new Konva.Circle({
						x,
						y: serverHeight - 14,
						radius: 3,
						fill: '#b7d5df',
						stroke: '#053650'
					})
				);
			}

			for (const [index, color] of ['#4be095', '#f7c948', '#57b8ff'].entries()) {
				server.add(
					new Konva.Circle({
						x: 38 + index * 25,
						y: 24,
						radius: 5,
						fill: color,
						shadowColor: color,
						shadowBlur: 8,
						shadowOpacity: 0.5
					})
				);
			}

			serverLabel = new Konva.Text({
				x: 33,
				y: 39,
				text: `${rackUnits}U SERVER`,
				fontFamily: 'Inter, sans-serif',
				fontSize: 9,
				fontStyle: 'bold',
				letterSpacing: 1.2,
				fill: '#a9d9e8'
			});
			server.add(
				serverLabel,
				new Konva.Circle({
					x: 70,
					y: serverHeight - 30,
					radius: 11,
					fill: '#06466c',
					stroke: '#67abc3',
					strokeWidth: 1
				}),
				new Konva.Circle({ x: 70, y: serverHeight - 30, radius: 3, fill: '#d9f5ff' })
			);

			for (let row = 0; row < layout.diskRows; row += 1) {
				for (let column = 0; column < 4; column += 1) {
					const x = 145 + column * 108;
					const y = driveStartY + row * (driveHeight + driveRowGap);
					server.add(
						new Konva.Rect({
							x,
							y,
							width: 98,
							height: driveHeight,
							cornerRadius: 4,
							fillLinearGradientStartPoint: { x: 0, y: 0 },
							fillLinearGradientEndPoint: { x: 0, y: driveHeight },
							fillLinearGradientColorStops: [0, '#193b50', 1, '#0b293a'],
							stroke: '#4b9ab7',
							strokeWidth: 1
						}),
						new Konva.Rect({
							x: x + 8,
							y: y + 6,
							width: 80,
							height: 4,
							cornerRadius: 2,
							fill: '#4a7183'
						}),
						new Konva.Rect({
							x: x + 9,
							y: y + 20,
							width: 61,
							height: 6,
							cornerRadius: 2,
							fill: '#071c28'
						}),
						new Konva.Circle({
							x: x + 87,
							y: y + 23,
							radius: 2.5,
							fill: (row + column) % 3 === 0 ? '#55e69a' : '#2e7994'
						})
					);
				}
			}

			server.add(
				new Konva.Rect({
					x: 12,
					y: 9,
					width: width - 24,
					height: 2,
					cornerRadius: 1,
					fill: '#65b9d0',
					opacity: 0.55
				})
			);
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
					stage.destroy();
					stage = undefined;
					server = undefined;
					void createServer();
					return;
				}
				stage.height(stageHeightPx);
				serverLabel?.text(`${rackUnits}U SERVER`);
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
