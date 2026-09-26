<script lang="ts">
	let {
		canExport = false,
		exportStatus,
		onExport
	}: { canExport?: boolean; exportStatus?: string; onExport?: () => void } = $props();
</script>

<header class="app-header">
	<div class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></div>
	<div>
		<h1>Rack Layout Designer</h1>
		<p>Plan and organize your IT infrastructure</p>
	</div>
	<div class="header-actions">
		{#if exportStatus}<span class="export-status" role="status">{exportStatus}</span>{/if}
		<button
			type="button"
			disabled={!canExport}
			onclick={onExport}
			aria-label="Export SVG reference"
		>
			<svg viewBox="0 0 20 20" aria-hidden="true">
				<path d="M10 2v10m0 0 4-4m-4 4L6 8M3 14v3h14v-3" />
			</svg>
			Export SVG
		</button>
		<span class="draft-status">Draft layout</span>
	</div>
</header>

<style>
	.app-header {
		display: flex;
		align-items: center;
		gap: 12px;
		height: 68px;
		padding: 0 24px;
		border-bottom: 1px solid #dce3ec;
		background: #fff;
	}
	.brand-mark {
		display: grid;
		gap: 3px;
		width: 36px;
		height: 36px;
		padding: 7px;
		border-radius: 9px;
		background: #2563eb;
	}
	.brand-mark span {
		border: 1px solid #bfdbfe;
		border-radius: 2px;
		background: #fff;
	}
	h1,
	p {
		margin: 0;
	}
	h1 {
		color: #172033;
		font-size: 18px;
		font-weight: 700;
		letter-spacing: -0.01em;
	}
	p {
		margin-top: 2px;
		color: #667085;
		font-size: 12px;
	}
	.header-actions {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-left: auto;
	}
	.header-actions button {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 7px 10px;
		border: 1px solid #bfdbfe;
		border-radius: 7px;
		color: #1d4ed8;
		background: #eff6ff;
		font: inherit;
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
	}
	.header-actions button:hover:not(:disabled) {
		border-color: #93c5fd;
		background: #dbeafe;
	}
	.header-actions button:focus-visible {
		outline: 2px solid #93c5fd;
		outline-offset: 2px;
	}
	.header-actions button:disabled {
		color: #94a3b8;
		background: #f8fafc;
		cursor: not-allowed;
	}
	.header-actions button svg {
		width: 15px;
		height: 15px;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.7;
	}
	.export-status {
		max-width: 220px;
		overflow: hidden;
		color: #166534;
		font-size: 11px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.draft-status {
		padding: 5px 9px;
		border: 1px solid #dbe4f0;
		border-radius: 999px;
		color: #475467;
		background: #f8fafc;
		font-size: 12px;
		font-weight: 600;
	}
</style>
