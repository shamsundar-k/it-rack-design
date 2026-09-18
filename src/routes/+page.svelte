<script lang="ts">
	import Server from '$lib/Server.svelte';
</script>

<svelte:head>
	<title>Server</title>
	<meta name="description" content="Server design workspace" />
</svelte:head>

<main>
	<Server height={2} />
	<Server height={1} />
	<Server height={4} />
</main>
