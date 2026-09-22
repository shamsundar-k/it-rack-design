<script lang="ts">
	import type { RackDevice } from '$lib/rack/rackModel';
	let {
		device,
		rackName,
		onRename
	}: { device?: RackDevice; rackName?: string; onRename: (name: string) => void } = $props();
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
	input {
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
	input:focus-visible {
		border-color: #60a5fa;
		outline: 2px solid #dbeafe;
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
