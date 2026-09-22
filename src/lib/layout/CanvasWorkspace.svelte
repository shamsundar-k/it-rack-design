<script lang="ts">
	import RackCanvas from '$lib/rack/RackCanvas.svelte';
	import type { LibraryComponent } from '$lib/rack/componentLibrary';
	import type { RackModel } from '$lib/rack/rackModel';

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
</script>

<section class="workspace" aria-label="Rack design canvas">
	<div class="workspace-bar">
		<div>
			<strong>Rack floor</strong>
			<span
				>{racks.length
					? `${racks.length} rack${racks.length === 1 ? '' : 's'} · Front view`
					: 'Empty canvas'}</span
			>
		</div>
		<div class="canvas-help"><span aria-hidden="true">↕</span> Drag components to place</div>
	</div>
	<div class="canvas-shell">
		<RackCanvas
			{racks}
			{selectedId}
			{onSelect}
			{onMove}
			{onContextMenu}
			{onRackMove}
			{onAddRack}
			{onAddDevice}
		/>
		{#if racks.length === 0}
			<div class="empty-canvas" aria-hidden="true">
				<div class="empty-rack"></div>
				<strong>Start with a rack</strong>
				<span>Drag a rack from the library and drop it here.</span>
			</div>
		{/if}
	</div>
</section>

<style>
	.workspace {
		display: grid;
		grid-template-rows: 54px minmax(0, 1fr);
		min-width: 0;
		min-height: 0;
		background: #f5f7fa;
	}
	.workspace-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		padding: 0 18px;
		border-bottom: 1px solid #dce3ec;
		background: rgb(255 255 255 / 85%);
	}
	.workspace-bar div:first-child {
		display: grid;
		gap: 2px;
	}
	.workspace-bar strong {
		color: #344054;
		font-size: 13px;
	}
	.workspace-bar span,
	.canvas-help {
		color: #7b8798;
		font-size: 11px;
	}
	.canvas-help {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.canvas-help span {
		color: #2563eb;
		font-size: 16px;
	}
	.canvas-shell {
		position: relative;
		min-height: 0;
		background-color: #f7f9fc;
	}
	.empty-canvas {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		justify-items: center;
		pointer-events: none;
		color: #667085;
		text-align: center;
	}
	.empty-canvas strong {
		margin-top: 14px;
		color: #344054;
		font-size: 14px;
	}
	.empty-canvas span {
		margin-top: 5px;
		font-size: 12px;
	}
	.empty-rack {
		width: 48px;
		height: 66px;
		border: 3px solid #aeb9c8;
		border-radius: 4px;
		background: repeating-linear-gradient(to bottom, #dbe2ea 0 4px, #f8fafc 4px 8px);
		box-shadow: 0 8px 22px rgb(51 65 85 / 10%);
	}
</style>
