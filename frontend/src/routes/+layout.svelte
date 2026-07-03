<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import { session, authLoading } from "$lib/stores/auth.js";
	import LoginPage from "$lib/components/LoginPage.svelte";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Habtub</title>
</svelte:head>

{#if $authLoading}
	<div class="flex items-center justify-center h-screen bg-bg">
		<span class="text-muted text-xs font-mono tracking-widest animate-pulse"
			>HABTUB</span
		>
	</div>
{:else if !$session}
	<LoginPage />
{:else}
	{@render children()}
{/if}
