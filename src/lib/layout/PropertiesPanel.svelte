<script lang="ts">
	import {
		MAX_RACK_UNITS,
		type RackDevice,
		type RackInstallation,
		type RackModel
	} from '$lib/rack/rackModel';

	type RackResizeResult = { ok: boolean; message: string };
	let {
		device,
		rack,
		rackName,
		onRename,
		onResizeRack,
		onChangeRackInstallation
	}: {
		device?: RackDevice;
		rack?: RackModel;
		rackName?: string;
		onRename: (name: string) => void;
		onResizeRack: (units: number) => RackResizeResult;
		onChangeRackInstallation: (installation: RackInstallation) => RackResizeResult;
	} = $props();

	let rackFeedback = $state<RackResizeResult>();

	$effect(() => {
		rack?.id;
		rackFeedback = undefined;
	});

	function resizeRack(event: Event) {
		if (!rack) return;
		const input = event.currentTarget as HTMLInputElement;
		rackFeedback = onResizeRack(Number(input.value));
		if (!rackFeedback.ok) input.value = String(rack.units);
	}

	function changeRackInstallation(event: Event) {
		if (!rack) return;
		const select = event.currentTarget as HTMLSelectElement;
		rackFeedback = onChangeRackInstallation(select.value as RackInstallation);
		if (!rackFeedback.ok) select.value = rack.installation;
	}
</script>

<aside class="properties" aria-label="Properties panel">
	<div>
		<p class="eyebrow">Inspector</p>
		<h2>Properties</h2>
	</div>
	{#if device}
		<div class="selection-summary">
			<div class="selection-icon" aria-hidden="true"><span></span><i></i></div>
			<div><strong>{device.name}</strong><small>Selected equipment</small></div>
		</div>
		<div class="form-section">
			<label for="device-name">Name</label>
			<input
				id="device-name"
				value={device.name}
				maxlength="60"
				onchange={(event) => onRename(event.currentTarget.value.trim() || device.name)}
			/>
			<label for="device-rack">Rack</label><input id="device-rack" value={rackName} readonly />
			<div class="field-row">
				<div>
					<label for="device-unit">Start unit</label><input
						id="device-unit"
						value={`U${device.startU}`}
						readonly
					/>
				</div>
				<div>
					<label for="device-height">Height</label><input
						id="device-height"
						value={`${device.sizeU}U`}
						readonly
					/>
				</div>
			</div>
		</div>
		<div class="selection-status"><span></span> Positioned in rack</div>
	{:else if rack}
		<div class="selection-summary rack-summary">
			<div class="rack-icon" aria-hidden="true"><span></span><span></span><span></span></div>
			<div><strong>{rack.name}</strong><small>Selected rack cabinet</small></div>
		</div>
		<div class="form-section">
			<label for="rack-name">Name</label>
			<input
				id="rack-name"
				value={rack.name}
				maxlength="60"
				onchange={(event) => onRename(event.currentTarget.value.trim() || rack.name)}
			/>
			<label for="rack-height">Rack height</label>
			<div class="unit-input">
				<input
					id="rack-height"
					type="number"
					min="1"
					max={MAX_RACK_UNITS}
					step="1"
					value={rack.units}
					onchange={resizeRack}
				/>
				<span>U</span>
			</div>
			<p class="field-help">
				The rack grows and shrinks from the top. Its bottom and installed equipment stay fixed.
			</p>
			<label for="rack-installation">Installation</label>
			<select id="rack-installation" value={rack.installation} onchange={changeRackInstallation}>
				<option value="wall-mount">Wall mount</option>
				<option value="floor-stand">Floor stand</option>
			</select>
			<p class="field-help">
				{rack.installation === 'floor-stand'
					? 'Floor-standing racks include support legs.'
					: 'Wall-mounted racks are shown without support legs.'}
			</p>
		</div>
		{#if rackFeedback}
			<div
				class:feedback-success={rackFeedback.ok}
				class:feedback-error={!rackFeedback.ok}
				class="resize-feedback"
				role="status"
				aria-live="polite"
			>
				<span aria-hidden="true">{rackFeedback.ok ? '✓' : '!'}</span>
				{rackFeedback.message}
			</div>
		{:else}
			<div class="selection-status"><span></span> Ready to resize</div>
		{/if}
	{:else}
		<div class="empty-state">
			<div class="empty-icon" aria-hidden="true">⌁</div>
			<strong>No item selected</strong>
			<p>Select equipment in the canvas to inspect its properties.</p>
		</div>
	{/if}
</aside>

<style>
	.properties {
		min-width: 0;
		padding: 22px 18px;
		border-left: 1px solid #dce3ec;
		background: #fff;
		overflow-y: auto;
	}
	.eyebrow,
	h2,
	p {
		margin: 0;
	}
	.eyebrow {
		margin-bottom: 3px;
		color: #2563eb;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	h2 {
		color: #172033;
		font-size: 16px;
	}
	.selection-summary {
		display: flex;
		align-items: center;
		gap: 11px;
		margin-top: 20px;
		padding: 12px;
		border: 1px solid #bfdbfe;
		border-radius: 9px;
		background: #eff6ff;
	}
	.selection-summary div:last-child {
		display: grid;
		gap: 2px;
		min-width: 0;
	}
	.selection-summary strong {
		overflow: hidden;
		color: #1e3a5f;
		font-size: 13px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.selection-summary small {
		color: #5d7491;
		font-size: 11px;
	}
	.selection-icon {
		position: relative;
		width: 39px;
		height: 26px;
		border: 2px solid #64748b;
		border-radius: 3px;
		background: #fff;
	}
	.selection-icon span {
		position: absolute;
		left: 5px;
		top: 7px;
		width: 16px;
		height: 3px;
		border-radius: 3px;
		background: #94a3b8;
	}
	.selection-icon i {
		position: absolute;
		right: 5px;
		top: 7px;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: #22c55e;
	}
	.rack-summary {
		border-color: #cbd5e1;
		background: #f8fafc;
	}
	.rack-icon {
		display: grid;
		gap: 4px;
		width: 32px;
		height: 38px;
		padding: 5px;
		border: 2px solid #64748b;
		border-radius: 3px;
		background: #fff;
	}
	.rack-icon span {
		border: 1px solid #94a3b8;
		border-radius: 1px;
		background: #e2e8f0;
	}
	.form-section {
		display: grid;
		gap: 7px;
		margin-top: 22px;
		padding-top: 20px;
		border-top: 1px solid #e7ecf2;
	}
	label {
		margin-top: 7px;
		color: #475467;
		font-size: 11px;
		font-weight: 700;
	}
	input,
	select {
		width: 100%;
		padding: 9px 10px;
		border: 1px solid #d3dbe6;
		border-radius: 7px;
		color: #344054;
		background: #fff;
		font: inherit;
		font-size: 12px;
	}
	input[readonly] {
		color: #667085;
		background: #f8fafc;
	}
	input:focus-visible,
	select:focus-visible {
		border-color: #60a5fa;
		outline: 2px solid #dbeafe;
	}
	.unit-input {
		position: relative;
	}
	.unit-input input {
		padding-right: 32px;
	}
	.unit-input span {
		position: absolute;
		right: 11px;
		top: 50%;
		color: #64748b;
		font-size: 12px;
		font-weight: 700;
		pointer-events: none;
		transform: translateY(-50%);
	}
	.field-help {
		margin-top: 3px;
		color: #7b8798;
		font-size: 10px;
		line-height: 1.45;
	}
	.field-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 9px;
	}
	.field-row div {
		display: grid;
		gap: 7px;
	}
	.selection-status {
		display: flex;
		align-items: center;
		gap: 7px;
		margin-top: 18px;
		color: #667085;
		font-size: 11px;
	}
	.selection-status span {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #22c55e;
		box-shadow: 0 0 0 3px #dcfce7;
	}
	.resize-feedback {
		display: grid;
		grid-template-columns: 20px 1fr;
		gap: 8px;
		align-items: start;
		margin-top: 18px;
		padding: 10px;
		border: 1px solid;
		border-radius: 7px;
		font-size: 11px;
		line-height: 1.45;
	}
	.resize-feedback span {
		display: grid;
		place-items: center;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		font-weight: 800;
	}
	.feedback-success {
		border-color: #bbf7d0;
		color: #166534;
		background: #f0fdf4;
	}
	.feedback-success span {
		background: #dcfce7;
	}
	.feedback-error {
		border-color: #fecaca;
		color: #991b1b;
		background: #fef2f2;
	}
	.feedback-error span {
		background: #fee2e2;
	}
	.empty-state {
		display: grid;
		justify-items: center;
		margin-top: 42px;
		padding: 24px 10px;
		text-align: center;
	}
	.empty-icon {
		display: grid;
		place-items: center;
		width: 42px;
		height: 42px;
		margin-bottom: 12px;
		border: 1px solid #dce3ec;
		border-radius: 12px;
		color: #7b8798;
		background: #f8fafc;
		font-size: 23px;
	}
	.empty-state strong {
		color: #344054;
		font-size: 13px;
	}
	.empty-state p {
		max-width: 190px;
		margin-top: 6px;
		color: #7b8798;
		font-size: 11px;
		line-height: 1.5;
	}
</style>
