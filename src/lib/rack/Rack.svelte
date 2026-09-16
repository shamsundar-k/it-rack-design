<script lang="ts">
	import { deviceDefinitions } from '$lib/devices/device-data';
	import type { RackState } from '$lib/stores/rack-state.svelte';
	import RackDevice from './RackDevice.svelte';
	import RackUnit from './RackUnit.svelte';
	import { UNIT_HEIGHT, rackUToY, yToRackU } from './rack-layout';

	let { state }: { state: RackState } = $props();
	let mountingArea: HTMLDivElement;

	let units = $derived(
		Array.from({ length: state.rack.units }, (_, index) => state.rack.units - index)
	);
	let previewTop = $derived(
		state.draggedDefinition && state.candidateU !== null
			? rackUToY(state.candidateU, state.draggedDefinition.heightU, state.rack.units)
			: 0
	);

	function updatePreview(event: DragEvent) {
		event.preventDefault();
		if (!state.draggedDefinition || !state.draggedDevice) return;
		if (event.dataTransfer)
			event.dataTransfer.dropEffect = state.draggedDevice.instanceId ? 'move' : 'copy';
		const bounds = mountingArea.getBoundingClientRect();
		const proposedTop = event.clientY - bounds.top - state.draggedDevice.grabOffsetPx;
		state.previewAt(yToRackU(proposedTop, state.draggedDefinition.heightU, state.rack.units));
	}

	function drop(event: DragEvent) {
		event.preventDefault();
		state.commitDrop();
	}

	function startPlacedDrag(event: DragEvent, instanceId: string, deviceDefinitionId: string) {
		if (!event.dataTransfer) return;
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', instanceId);
		const source = event.currentTarget as HTMLElement;
		state.startDrag({
			deviceDefinitionId,
			instanceId,
			grabOffsetPx: event.clientY - source.getBoundingClientRect().top
		});
	}
</script>

<section class="rack-panel" aria-labelledby="rack-title">
	<div class="rack-heading">
		<div>
			<p class="eyebrow">Mounting view</p>
			<h2 id="rack-title">{state.rack.name}</h2>
		</div>
		<div class="rack-meta">
			<span><i class="online-dot"></i> Active layout</span>
			<strong>{state.rack.units}U</strong>
		</div>
	</div>

	<div class="rack-stage">
		<div class="rack-shell">
			<div class="frame-top"><span></span><span></span><span></span></div>
			<div
				class:drag-active={state.draggedDevice !== null}
				class="mounting-area"
				role="group"
				aria-label={`${state.rack.name} mounting area, ${state.rack.units} rack units`}
				style:height={`${state.rack.units * UNIT_HEIGHT}px`}
				bind:this={mountingArea}
				ondragover={updatePreview}
				ondragleave={(event) => {
					if (!mountingArea.contains(event.relatedTarget as Node)) state.clearPreview();
				}}
				ondrop={drop}
			>
				{#each units as unit}
					<RackUnit {unit} />
				{/each}

				{#each state.placedDevices as placed (placed.instanceId)}
					{@const definition = deviceDefinitions.find(
						(device) => device.id === placed.deviceDefinitionId
					)}
					{#if definition}
						<RackDevice
							{definition}
							instanceId={placed.instanceId}
							startU={placed.startU}
							rackUnits={state.rack.units}
							selected={state.selectedDevice === placed.instanceId}
							onSelect={() => (state.selectedDevice = placed.instanceId)}
							onDragStart={(event) => startPlacedDrag(event, placed.instanceId, definition.id)}
							onDragEnd={() => state.finishDrag()}
						/>
					{/if}
				{/each}

				{#if state.draggedDefinition && state.candidateU !== null}
					<div
						class:invalid={!state.candidateIsValid}
						class="drop-preview"
						style:top={`${previewTop}px`}
						style:height={`${state.draggedDefinition.heightU * UNIT_HEIGHT}px`}
					>
						<span>{state.candidateIsValid ? 'Release to place' : 'Position unavailable'}</span>
						<strong>U{state.candidateU}</strong>
					</div>
				{/if}
			</div>
			<div class="frame-bottom"></div>
		</div>
	</div>
</section>
