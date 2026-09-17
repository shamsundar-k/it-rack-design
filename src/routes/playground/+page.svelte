<script lang="ts">
	import { onMount } from 'svelte';
	import type KonvaNamespace from 'konva';
	import RackIllustration from '$lib/rack/RackIllustration.svelte';
	import { RACK_MOUNTING_WIDTH, UNIT_HEIGHT } from '$lib/rack/rack-layout';

	let canvasHost: HTMLDivElement;
	let position = $state({ x: 0, y: 0 });
	let isDragging = $state(false);
	const playgroundRackUnits = 14;
	const stageHeight = playgroundRackUnits * UNIT_HEIGHT;
	const rackUnits = Array.from({ length: playgroundRackUnits }, (_, index) => playgroundRackUnits - index);

	onMount(() => {
		let disposed = false;
		let stage: KonvaNamespace.Stage | undefined;
		let server: KonvaNamespace.Group | undefined;
		let resizeObserver: ResizeObserver | undefined;

		async function createCanvas() {
			const Konva = (await import('konva')).default;
			if (disposed) return;

			const serverWidth = 600;
			const serverHeight = 116;
			stage = new Konva.Stage({
				container: canvasHost,
				width: canvasHost.clientWidth,
				height: stageHeight
			});

			const serverLayer = new Konva.Layer();
			stage.add(serverLayer);

			server = new Konva.Group({ draggable: true });

			// Main server chassis: an abstract 2U front panel.
			const chassis = new Konva.Rect({
				x: 0,
				y: 4,
				width: serverWidth,
				height: 108,
				cornerRadius: 10,
				fillLinearGradientStartPoint: { x: 0, y: 0 },
				fillLinearGradientEndPoint: { x: 0, y: 108 },
				fillLinearGradientColorStops: [0, '#177fac', 0.5, '#086a9b', 1, '#05547f'],
				stroke: '#06486f',
				strokeWidth: 2,
				shadowColor: '#245f7a',
				shadowBlur: 20,
				shadowOffsetY: 10,
				shadowOpacity: 0.3
			});

			const controlPanel = new Konva.Rect({
				x: 18,
				y: 18,
				width: 104,
				height: 80,
				cornerRadius: 7,
				fill: '#07557f',
				stroke: '#3092b6',
				strokeWidth: 1
			});

			// Mounting handles extend beyond the chassis and include bolt points.
			const leftHandle = new Konva.Rect({
				x: -22,
				y: 13,
				width: 24,
				height: 90,
				cornerRadius: [7, 2, 2, 7],
				fill: '#0a5b85',
				stroke: '#064264',
				strokeWidth: 2
			});

			const rightHandle = leftHandle.clone({
				x: serverWidth - 2,
				cornerRadius: [2, 7, 7, 2]
			});

			server.add(chassis, controlPanel, leftHandle, rightHandle);

			for (const x of [-10, serverWidth + 10]) {
				server.add(
					new Konva.Rect({
						x: x - 4,
						y: 39,
						width: 8,
						height: 34,
						cornerRadius: 4,
						fill: '#063d5c'
					}),
					new Konva.Circle({ x, y: 24, radius: 3, fill: '#b7d5df', stroke: '#053650' }),
					new Konva.Circle({ x, y: 92, radius: 3, fill: '#b7d5df', stroke: '#053650' })
				);
			}

			// Status LEDs live together on the control panel.
			for (const [index, color] of ['#4be095', '#f7c948', '#57b8ff'].entries()) {
				server.add(
					new Konva.Circle({
						x: 38 + index * 25,
						y: 35,
						radius: 5,
						fill: color,
						shadowColor: color,
						shadowBlur: 8,
						shadowOpacity: 0.5
					})
				);
			}

			server.add(
				new Konva.Text({
					x: 33,
					y: 50,
					text: '2U SERVER',
					fontFamily: 'Inter, sans-serif',
					fontSize: 9,
					fontStyle: 'bold',
					letterSpacing: 1.2,
					fill: '#a9d9e8'
				}),
				new Konva.Circle({
					x: 70,
					y: 78,
					radius: 11,
					fill: '#06466c',
					stroke: '#67abc3',
					strokeWidth: 1
				}),
				new Konva.Circle({ x: 70, y: 78, radius: 3, fill: '#d9f5ff' })
			);

			// Eight populated HDD trays: thin, wide modules in two rows.
			for (let row = 0; row < 2; row += 1) {
				for (let column = 0; column < 4; column += 1) {
					const x = 145 + column * 108;
					const y = 17 + row * 39;
					server.add(
						new Konva.Rect({
							x,
							y,
							width: 98,
							height: 32,
							cornerRadius: 4,
							fillLinearGradientStartPoint: { x: 0, y: 0 },
							fillLinearGradientEndPoint: { x: 0, y: 32 },
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

			// A slim top highlight keeps the server readable at small scales.
			server.add(
				new Konva.Rect({
					x: 12,
					y: 9,
					width: serverWidth - 24,
					height: 2,
					cornerRadius: 1,
					fill: '#65b9d0',
					opacity: 0.55
				})
			);

			serverLayer.add(server);

			function fitServerToStage() {
				if (!stage || !server) return;
				const padding = 28;
				const scale = Math.min(1, (stage.width() - padding * 2) / (serverWidth + 48));
				server.scale({ x: scale, y: scale });
				server.position({
					x: Math.max(padding, (stage.width() - serverWidth * scale) / 2),
					y: (stage.height() - serverHeight * scale) / 2
				});
				position = { x: Math.round(server.x()), y: Math.round(server.y()) };
				stage.batchDraw();
			}

			server.dragBoundFunc((nextPosition) => {
				if (!stage || !server) return nextPosition;
				const width = (serverWidth + 44) * server.scaleX();
				const height = serverHeight * server.scaleY();
				return {
					x: Math.max(12, Math.min(nextPosition.x, stage.width() - width - 12)),
					y: Math.max(12, Math.min(nextPosition.y, stage.height() - height - 12))
				};
			});

			server.on('dragstart', () => {
				isDragging = true;
				if (stage) stage.container().style.cursor = 'grabbing';
			});

			server.on('dragmove', () => {
				if (server) position = { x: Math.round(server.x()), y: Math.round(server.y()) };
			});

			server.on('dragend', () => {
				isDragging = false;
				if (stage) stage.container().style.cursor = 'grab';
			});

			server.on('mouseenter', () => {
				if (stage) stage.container().style.cursor = 'grab';
			});

			server.on('mouseleave', () => {
				if (stage && !isDragging) stage.container().style.cursor = 'default';
			});

			function resizeCanvas() {
				if (!stage) return;
				stage.width(canvasHost.clientWidth);
				fitServerToStage();
			}

			fitServerToStage();
			resizeObserver = new ResizeObserver(resizeCanvas);
			resizeObserver.observe(canvasHost);
		}

		void createCanvas();

		return () => {
			disposed = true;
			resizeObserver?.disconnect();
			stage?.destroy();
		};
	});
</script>

<svelte:head>
	<title>Server Node Playground</title>
	<meta name="description" content="A draggable Konva server node playground." />
</svelte:head>

<main class="playground-page">
	<header>
		<div>
			<p>Konva playground · Step 01</p>
			<h1>Draggable server node</h1>
			<span>Drag the server anywhere inside the canvas.</span>
		</div>
		<a href="/">Back to rack designer</a>
	</header>

	<section class="canvas-card" aria-labelledby="canvas-heading">
		<div class="canvas-heading">
			<div>
				<i class:active={isDragging}></i>
				<h2 id="canvas-heading">Canvas</h2>
			</div>
			<code>x: {position.x} · y: {position.y}</code>
		</div>
		<RackIllustration
			units={rackUnits}
			mountingHeight={stageHeight}
			mountingWidth={RACK_MOUNTING_WIDTH}
			stageMinHeight={stageHeight + 88}
			ariaLabel="14U rack mounting area with a draggable server"
		>
			<div class="canvas-host" bind:this={canvasHost} aria-label="Draggable server canvas"></div>
		</RackIllustration>
		<footer>
			<span><kbd>Drag</kbd> Move server</span>
			<span>Konva.Group + Konva.Rect</span>
		</footer>
	</section>
</main>

<style>
	:global(body) {
		background: radial-gradient(circle at 50% 0%, #ffffff 0, #f2f7fa 42rem, #eaf1f5 100%);
	}

	.playground-page {
		width: min(1080px, calc(100% - 32px));
		margin: 0 auto;
		padding: 54px 0 80px;
		color: #173246;
	}

	header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 24px;
		margin-bottom: 26px;
	}

	header p {
		margin: 0 0 10px;
		color: #087da8;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	h1 {
		margin: 0 0 10px;
		font-size: clamp(32px, 6vw, 52px);
		letter-spacing: -0.04em;
	}

	header span {
		color: #637b8c;
		font-size: 14px;
	}

	header a {
		flex: 0 0 auto;
		padding: 10px 13px;
		border: 1px solid #cad9e2;
		border-radius: 8px;
		background: #ffffff;
		color: #49697c;
		font-size: 10px;
		text-decoration: none;
	}

	.canvas-card {
		width: fit-content;
		margin: 0 auto;
		overflow: hidden;
		border: 1px solid #cfdee6;
		border-radius: 14px;
		background: #ffffff;
		box-shadow: 0 28px 70px rgb(45 85 108 / 0.13);
	}

	.canvas-heading,
	.canvas-card footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 18px;
	}

	.canvas-heading {
		height: 60px;
		border-bottom: 1px solid #d7e3e9;
	}

	.canvas-heading > div {
		display: flex;
		align-items: center;
		gap: 9px;
	}

	.canvas-heading i {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #9bafbb;
	}

	.canvas-heading i.active {
		background: #48dda3;
		box-shadow: 0 0 9px #48dda3;
	}

	h2 {
		margin: 0;
		font-size: 13px;
	}

	.canvas-heading code {
		color: #6c8493;
		font-size: 10px;
	}

	.canvas-host {
		position: absolute;
		inset: 0;
		z-index: 4;
	}

	.canvas-host :global(canvas) {
		display: block;
	}

	.canvas-card footer {
		height: 48px;
		border-top: 1px solid #d7e3e9;
		color: #667e8e;
		font-size: 9px;
	}

	.canvas-card footer span:first-child {
		display: flex;
		align-items: center;
		gap: 7px;
	}

	kbd {
		padding: 4px 7px;
		border: 1px solid #c8d8e1;
		border-radius: 5px;
		background: #edf4f7;
		color: #456779;
		font: inherit;
	}

	@media (max-width: 620px) {
		.playground-page {
			padding-top: 34px;
		}

		header {
			align-items: flex-start;
			flex-direction: column;
		}

		.canvas-card footer span:last-child {
			display: none;
		}
	}
</style>
