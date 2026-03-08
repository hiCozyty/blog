<script lang="ts">
	import { onMount } from 'svelte';
	import mermaid from 'mermaid';

	export let code: string;
	let container: HTMLDivElement;

	onMount(async () => {
		mermaid.initialize({
			startOnLoad: false,
			theme: 'default',
			securityLevel: 'loose'
		});

		try {
			const { svg } = await mermaid.render(
				'mermaid-' + Math.random().toString(36).substr(2, 9),
				code
			);
			if (container) {
				container.innerHTML = svg;
			}
		} catch (error) {
			console.error('Mermaid rendering error:', error);
			if (container) {
				container.innerHTML = `<p style="color: red;">Diagram rendering failed</p>`;
			}
		}
	});
</script>

<div bind:this={container} class="mermaid-container" />

<style>
	.mermaid-container {
		display: flex;
		justify-content: center;
		margin: 2rem 0;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 8px;
	}
</style>
