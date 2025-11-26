<script>
	import { currentPage, isMenuOpen } from '../assets/js/store';

	let { href, children } = $props();

	let isCurrentPage = $currentPage.startsWith(href);

	const maybeCloseMenu = () => {
		if (href != $currentPage) {
			isMenuOpen.set(false);
		}
	};
</script>

<li>
	<a class="no-select"
		{href}
		onclick={maybeCloseMenu}
		class:active={isCurrentPage}
		aria-current={isCurrentPage ? 'page' : false}
	>
		{@render children?.()}
	</a>
</li>


<style>
    li {
        list-style: none;
    }
    
    a {
        text-decoration: none;
        color: inherit;
        
        transition: 
		 	color 0.1s ease-in-out,
            background-color 0.1s ease-in-out, 
            transform 0.1s ease-out,
            box-shadow 0.1s ease-out;
            
        display: inline-block; 
        padding: 5px 10px;
        background-color: transparent;
        border-radius: 25px;    
    }
    
    a:hover {
		text-decoration: underline;
        background-color: var(--lightAccent);
        color: var(--dark);

    }
    
    a:active {
		color: var(--dark);
		background-color: var(--lightAccent);
        transform: translate(1px, 1px); 
		background-color: color-mix(in srgb, var(--lightAccent) 80%, black);

    }

</style>