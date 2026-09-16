<script lang="ts">
	import type { DeviceDefinition, DraggedDevice } from '$lib/rack/rack-layout';

	let {
		devices,
		onDragStart,
		onDragEnd
	}: {
		devices: DeviceDefinition[];
		onDragStart: (dragged: DraggedDevice) => void;
		onDragEnd: () => void;
	} = $props();

	function dragStart(event: DragEvent, device: DeviceDefinition) {
		if (!event.dataTransfer) return;
		event.dataTransfer.effectAllowed = 'copy';
		event.dataTransfer.setData('text/plain', device.id);
		const source = event.currentTarget as HTMLElement;
		onDragStart({
			deviceDefinitionId: device.id,
			grabOffsetPx: event.clientY - source.getBoundingClientRect().top
		});
	}
</script>

<aside class="library" aria-labelledby="library-title">
	<div class="section-heading">
		<div>
			<p class="eyebrow">Inventory</p>
			<h2 id="library-title">Device library</h2>
		</div>
		<span class="count">{devices.length}</span>
	</div>

	<p class="library-intro">Drag a device onto an open rack position.</p>

	<div class="device-list">
		{#each devices as device}
			<button
				class="library-device type-{device.type}"
				draggable="true"
				ondragstart={(event) => dragStart(event, device)}
				ondragend={onDragEnd}
				type="button"
				aria-label={`Drag ${device.name}, ${device.heightU} rack units`}
			>
				<span class="device-icon" aria-hidden="true">
					{#if device.type === 'network'}↔{:else if device.type === 'compute'}▦{:else if device.type === 'storage'}≡{:else}⌁{/if}
				</span>
				<span class="device-copy">
					<strong>{device.name}</strong>
					<small>{device.description}</small>
				</span>
				<span class="u-badge">{device.heightU}U</span>
			</button>
		{/each}
	</div>

	<div class="tip">
		<span aria-hidden="true">✦</span>
		<p><strong>Placement tip</strong><br />Devices snap to the nearest rack unit.</p>
	</div>
</aside>
