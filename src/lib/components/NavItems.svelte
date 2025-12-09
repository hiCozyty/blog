<script>
	import { navItems } from '$lib/config';
	import NavItem from './NavItem.svelte';
</script>

<ul>
	{#each navItems as page}
		<NavItem href={page.route}>
			{page.title}
		</NavItem>
	{/each}
</ul>

<style>
    ul {
        display: flex;
        flex-direction: row; 
        gap: 0.5rem;
        padding: 0;
        margin: 0;
        list-style: none;
    }
    
    /* When inside the open sliding menu, stack vertically */
    :global(.main-nav.open) ul {
        flex-direction: column;
    }
</style>