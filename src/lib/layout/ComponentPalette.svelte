<script lang="ts">
	import { componentSections, type LibraryComponent } from '$lib/rack/componentLibrary';

	function startDrag(event: DragEvent, component: LibraryComponent) {
		event.dataTransfer?.setData('application/x-rack-component', JSON.stringify(component));
		if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy';
	}
</script>

<aside class="palette" aria-label="Component library">
	<div class="panel-heading">
		<div>
			<p class="eyebrow">Library</p>
			<h2>Components</h2>
		</div>
	</div>
	<p class="hint">Drag a rack to the canvas, then place equipment inside it.</p>
	<div class="section-list">
		{#each componentSections as section, index}
			<details open={index < 2}>
				<summary><span>{section.name}</span><small>{section.items.length}</small></summary>
				<div class="component-list">
					{#each section.items as component}
						<div
							class="component-card"
							draggable="true"
							role="button"
							tabindex="0"
							ondragstart={(event) => startDrag(event, component)}
						>
							<div
								class:rack-icon={component.kind === 'rack'}
								class:multi-unit={component.kind === 'device' && component.sizeU > 1}
								class="component-icon"
								aria-hidden="true"
							>
								<span></span><i></i><i></i>
							</div>
							<div class="component-copy">
								<strong>{component.name}</strong><small>{component.detail}</small>
							</div>
							<span class="drag-handle" aria-hidden="true">⠿</span>
						</div>
					{/each}
				</div>
			</details>
		{/each}
	</div>
</aside>

<style>
	.palette {
		min-width: 0;
		padding: 22px 14px;
		border-right: 1px solid #dce3ec;
		background: #fff;
		overflow-y: auto;
	}
	.panel-heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		padding: 0 2px;
	}
	.eyebrow,
	h2,
	.hint {
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
	.hint {
		margin: 14px 2px 0;
		color: #667085;
		font-size: 12px;
		line-height: 1.5;
	}
	.section-list {
		display: grid;
		gap: 7px;
		margin-top: 18px;
	}
	details {
		border-bottom: 1px solid #edf0f4;
		padding-bottom: 7px;
	}
	summary {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 9px 4px;
		color: #344054;
		cursor: pointer;
		font-size: 12px;
		font-weight: 700;
		list-style: none;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	summary::before {
		content: '›';
		color: #8a94a6;
		font-size: 18px;
		line-height: 1;
		transition: transform 120ms ease;
	}
	details[open] summary::before {
		transform: rotate(90deg);
	}
	summary small {
		display: grid;
		place-items: center;
		min-width: 22px;
		height: 20px;
		margin-left: auto;
		border-radius: 6px;
		color: #667085;
		background: #f1f5f9;
		font-size: 10px;
	}
	.component-list {
		display: grid;
		gap: 7px;
		padding: 2px 0 5px;
	}
	.component-card {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 9px;
		border: 1px solid #dce3ec;
		border-radius: 8px;
		background: #fff;
		cursor: grab;
		transition: 120ms ease;
	}
	.component-card:hover,
	.component-card:focus-visible {
		border-color: #93b4f5;
		box-shadow: 0 3px 12px rgb(37 99 235 / 9%);
		outline: none;
		transform: translateY(-1px);
	}
	.component-card:active {
		cursor: grabbing;
	}
	.component-icon {
		position: relative;
		flex: 0 0 auto;
		width: 39px;
		height: 23px;
		border: 2px solid #64748b;
		border-radius: 3px;
		background: #e8eef5;
	}
	.component-icon.multi-unit {
		height: 30px;
	}
	.component-icon.rack-icon {
		width: 27px;
		height: 36px;
		margin: 0 6px;
		border-width: 3px;
		background: repeating-linear-gradient(to bottom, #d9e2ec 0 3px, #fff 3px 5px);
	}
	.component-icon span {
		position: absolute;
		left: 4px;
		top: 5px;
		width: 17px;
		height: 3px;
		border-radius: 2px;
		background: #94a3b8;
	}
	.component-icon i {
		position: absolute;
		right: 4px;
		top: 5px;
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: #22c55e;
	}
	.component-icon i + i {
		top: 13px;
		background: #60a5fa;
	}
	.rack-icon span,
	.rack-icon i {
		display: none;
	}
	.component-copy {
		display: grid;
		gap: 2px;
		min-width: 0;
	}
	.component-copy strong {
		color: #344054;
		font-size: 12px;
	}
	.component-copy small {
		color: #8a94a6;
		font-size: 10px;
	}
	.drag-handle {
		margin-left: auto;
		color: #aab3c2;
		font-size: 16px;
	}
</style>
