<script lang="ts">
	import RackCanvas from '$lib/rack/RackCanvas.svelte';
	import { moveDevice, type RackModel } from '$lib/rack/rackModel';
	let racks: RackModel[] = $state([
		{
			id: 'rack-1',
			name: 'Rack 01',
			units: 9,
			devices: [
				{ id: 'server-1', name: 'Application server', startU: 4, sizeU: 2 },
				{ id: 'server-2', name: 'Network server', startU: 1, sizeU: 1 }
			]
		}
	]);
	let selectedId = $state<string>();
	let draftName = $state('');
	let nameError = $state('');
	let selectedDevice = $derived(
		racks.flatMap((rack) => rack.devices).find((device) => device.id === selectedId)
	);
	$effect(() => {
		draftName = selectedDevice?.name ?? '';
		nameError = '';
	});
	function rename(event: SubmitEvent) {
		event.preventDefault();
		const name = draftName.trim();
		if (!name) {
			nameError = 'Enter a server name.';
			return;
		}
		racks = racks.map((rack) => ({
			...rack,
			devices: rack.devices.map((device) =>
				device.id === selectedId ? { ...device, name } : device
			)
		}));
		selectedId = undefined;
	}

	function move(rackId: string, id: string, startU: number) {
		racks = racks.map((rack) => (rack.id === rackId ? moveDevice(rack, id, startU) : rack));
		selectedId = id;
	}
</script>

<svelte:head>
	<title>Rack</title>
	<meta name="description" content="Physically scaled rack rails and mounted equipment." />
</svelte:head>
<main>
	<RackCanvas
		{racks}
		{selectedId}
		onSelect={(_, id) => {
			selectedId = id;
		}}
		onMove={move}
	/>
	{#if selectedDevice}
		<form class="name-editor" onsubmit={rename}>
			<label for="server-name"
				>Server name <span>{selectedDevice.sizeU}U · U{selectedDevice.startU}</span></label
			>
			<div class="fields">
				<input
					id="server-name"
					bind:value={draftName}
					maxlength="60"
					required
					aria-invalid={!!nameError}
					aria-describedby={nameError ? 'name-error' : undefined}
				/>
				<button type="submit">Save</button>
				<button
					type="button"
					onclick={() => {
						selectedId = undefined;
					}}>Cancel</button
				>
			</div>
			{#if nameError}<p id="name-error" role="alert">{nameError}</p>{/if}
		</form>
	{/if}
</main>

<style>
	.name-editor {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		width: min(520px, calc(100% - 24px));
		padding: 16px;
		border: 1px solid #425875;
		border-radius: 10px;
		background: #172338;
		box-shadow: 0 8px 28px #0006;
	}
	label {
		display: flex;
		justify-content: space-between;
		margin-bottom: 10px;
		font-size: 14px;
	}
	span {
		color: #94a3b8;
	}
	.fields {
		display: flex;
		gap: 8px;
	}
	input,
	button {
		font: inherit;
		color: #e2e8f0;
		border: 1px solid #425875;
		border-radius: 5px;
		padding: 9px;
	}
	input {
		min-width: 0;
		flex: 1;
		background: #0b1423;
	}
	button {
		background: #223e59;
		cursor: pointer;
	}
	input:focus-visible,
	button:focus-visible {
		outline: 2px solid #38bdf8;
		outline-offset: 2px;
	}
	p {
		margin: 10px 0 0;
		color: #fda4af;
		font-size: 13px;
	}
</style>
