<script lang="ts">
	import { tick } from 'svelte';
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
	let editing = $state(false);
	let menu = $state<{ x: number; y: number }>();
	let menuElement = $state<HTMLDivElement>();
	let renameButton = $state<HTMLButtonElement>();
	let nameInput = $state<HTMLInputElement>();
	async function openMenu(_rackId: string, id: string, event: MouseEvent) {
		selectedId = id;
		editing = false;
		menu = {
			x: Math.max(8, Math.min(event.clientX, window.innerWidth - 208)),
			y: Math.max(8, Math.min(event.clientY, window.innerHeight - 64))
		};
		await tick();
		renameButton?.focus();
	}
	async function editName() {
		menu = undefined;
		editing = true;
		await tick();
		nameInput?.focus();
		nameInput?.select();
	}
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
		editing = false;
		selectedId = undefined;
	}

	function move(rackId: string, id: string, startU: number) {
		racks = racks.map((rack) => (rack.id === rackId ? moveDevice(rack, id, startU) : rack));
		selectedId = id;
		editing = false;
		menu = undefined;
	}
</script>

<svelte:head>
	<title>Rack</title>
	<meta name="description" content="Physically scaled rack rails and mounted equipment." />
</svelte:head>
<svelte:window
	onpointerdown={(event) => {
		if (menu && !menuElement?.contains(event.target as Node)) menu = undefined;
	}}
	onkeydown={(event) => {
		if (event.key === 'Escape') {
			menu = undefined;
			editing = false;
		}
	}}
	onresize={() => {
		menu = undefined;
	}}
/>
<main>
	<RackCanvas
		{racks}
		{selectedId}
		onSelect={(_, id) => {
			selectedId = id;
		}}
		onMove={move}
		onContextMenu={openMenu}
	/>
	{#if menu}
		<div
			class="context-menu"
			bind:this={menuElement}
			role="menu"
			aria-label="Server actions"
			style:left={`${menu.x}px`}
			style:top={`${menu.y}px`}
		>
			<button bind:this={renameButton} role="menuitem" onclick={editName}>Rename server</button>
		</div>
	{/if}
	{#if editing && selectedDevice}
		<form class="name-editor" onsubmit={rename}>
			<label for="server-name"
				>Server name <span>{selectedDevice.sizeU}U · U{selectedDevice.startU}</span></label
			>
			<div class="fields">
				<input
					id="server-name"
					bind:this={nameInput}
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
						editing = false;
						selectedId = undefined;
					}}>Cancel</button
				>
			</div>
			{#if nameError}<p id="name-error" role="alert">{nameError}</p>{/if}
		</form>
	{/if}
</main>

<style>
	.context-menu {
		position: fixed;
		z-index: 20;
		width: 200px;
		padding: 6px;
		border: 1px solid #425875;
		border-radius: 8px;
		background: #172338;
		box-shadow: 0 8px 28px #0008;
	}
	.context-menu button {
		width: 100%;
		text-align: left;
		border: 0;
		background: transparent;
	}
	.context-menu button:hover {
		background: #223e59;
	}

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
