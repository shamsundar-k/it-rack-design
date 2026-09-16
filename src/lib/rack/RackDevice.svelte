<script lang="ts">
	import { UNIT_HEIGHT, rackUToY, type DeviceDefinition } from './rack-layout';

	let {
		definition,
		instanceId,
		startU,
		rackUnits,
		selected,
		onSelect,
		onDragStart,
		onDragEnd
	}: {
		definition: DeviceDefinition;
		instanceId: string;
		startU: number;
		rackUnits: number;
		selected: boolean;
		onSelect: () => void;
		onDragStart: (event: DragEvent) => void;
		onDragEnd: () => void;
	} = $props();
</script>

<button
	class:selected
	class="rack-device type-{definition.type}"
	style:top={`${rackUToY(startU, definition.heightU, rackUnits)}px`}
	style:height={`${definition.heightU * UNIT_HEIGHT}px`}
	draggable="true"
	onclick={onSelect}
	ondragstart={onDragStart}
	ondragend={onDragEnd}
	type="button"
	aria-label={`${definition.name}, U${startU} to U${startU + definition.heightU - 1}. Drag to move.`}
>
	<span class="status-light"></span>
	<span class="rack-device-copy">
		<strong>{definition.name}</strong>
		<small>U{startU}{definition.heightU > 1 ? `–U${startU + definition.heightU - 1}` : ''}</small>
	</span>
	<span class="device-face" aria-hidden="true">
		{#each Array(Math.max(2, definition.heightU * 2)) as _}<i></i>{/each}
	</span>
	<span class="drag-grip" aria-hidden="true">⠿</span>
</button>
