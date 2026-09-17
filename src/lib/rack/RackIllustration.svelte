<script lang="ts">
	import type { Snippet } from 'svelte';
	import RackUnit from './RackUnit.svelte';

	let {
		units,
		mountingHeight,
		mountingWidth,
		ariaLabel,
		dragActive = false,
		stageMinHeight = 650,
		ondragover,
		ondragleave,
		ondrop,
		children
	}: {
		units: number[];
		mountingHeight: number;
		mountingWidth: number;
		ariaLabel: string;
		dragActive?: boolean;
		stageMinHeight?: number;
		ondragover?: (event: DragEvent) => void;
		ondragleave?: (event: DragEvent) => void;
		ondrop?: (event: DragEvent) => void;
		children: Snippet;
	} = $props();
</script>

<div class="rack-stage" style:--stage-min-height={`${stageMinHeight}px`}>
	<div class="rack-shell" style:--mounting-width={`${mountingWidth}px`}>
		<div class="frame-top"><span></span><span></span><span></span></div>
		<div
			class:drag-active={dragActive}
			class="mounting-area"
			role="group"
			aria-label={ariaLabel}
			style:height={`${mountingHeight}px`}
			{ondragover}
			{ondragleave}
			{ondrop}
		>
			{#each units as unit}
				<RackUnit {unit} />
			{/each}
			{@render children()}
		</div>
		<div class="frame-bottom"></div>
	</div>
</div>

<style>
	.rack-stage {
		min-height: var(--stage-min-height);
		padding: 38px 48px 50px 78px;
		display: flex;
		justify-content: center;
		background-color: #08131d;
		background-image: radial-gradient(#253746 1px, transparent 1px);
		background-size: 18px 18px;
		overflow: auto;
	}

	.rack-shell {
		/* The frame surrounds a proportional 19-inch mounting plane. */
		width: calc(var(--mounting-width) + 58px);
		min-width: 0;
		position: relative;
		padding: 12px 16px;
		border-left: 13px solid #263746;
		border-right: 13px solid #263746;
		background: #101a23;
		box-shadow:
			0 25px 45px rgb(0 0 0 / 0.35),
			inset 0 0 0 1px #35495a;
	}

	.frame-top,
	.frame-bottom {
		position: absolute;
		left: -17px;
		right: -17px;
		height: 14px;
		border: 1px solid #3d5060;
		background: linear-gradient(#2d404f, #192936);
		z-index: 5;
	}

	.frame-top {
		top: -14px;
		display: flex;
		align-items: center;
		justify-content: space-around;
	}

	.frame-top span {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: #0b131a;
		box-shadow: inset 0 0 0 1px #526474;
	}

	.frame-bottom {
		bottom: -14px;
	}

	.mounting-area {
		width: var(--mounting-width);
		position: relative;
		background: #0a131b;
		outline: 1px solid #334757;
	}

	.mounting-area.drag-active {
		outline-color: #2bbda9;
		box-shadow: 0 0 0 3px rgb(43 189 169 / 0.1);
	}

	@media (max-width: 760px) {
		.rack-stage {
			justify-content: flex-start;
			padding-left: 62px;
		}
	}
</style>
