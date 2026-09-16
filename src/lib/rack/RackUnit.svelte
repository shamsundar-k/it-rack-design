<script lang="ts">
	let { unit }: { unit: number } = $props();
</script>

<div class="rack-unit">
	<span class="unit-label">U{String(unit).padStart(2, '0')}</span>
	<div class="mount-holes" aria-hidden="true"><i></i><i></i></div>
</div>
