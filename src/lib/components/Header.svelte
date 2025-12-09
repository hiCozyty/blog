<script>
	import { preventDefault } from 'svelte/legacy';

	import MainNav from './MainNav.svelte'
	import HamburgerMenuButton from './HamburgerMenuButton.svelte'
	import { siteTitle } from '$lib/config'

	const focusMain = () => {
		const main = document.querySelector('main');
		main.focus();
	}
</script>


<header>
	<a onclick={preventDefault(focusMain)} class="skip-to-content-link" href="#main">
		Skip to main content
	</a>
	
	<a href="/" class="site-title no-select">
		{siteTitle}
	</a>
	
	<HamburgerMenuButton />
	<MainNav />

</header>
<style>
    .site-title {
        text-decoration: none;
        color: inherit;
    
        display: inline-block; 
        padding: 5px 10px;
		width: 100%;
		/* border:solid black 1px; */
        background-color: transparent;
        border-radius: 25px;    
    }
    
    .site-title:hover {
        /* background-color: var(--lightAccent); */
        color: var(--dark);
		text-decoration: underline;
    }
    
    .site-title:active {
        transform: translate(1px, 1px); 
        /* background-color: color-mix(in srgb, var(--lightAccent) 80%, black); */
    }
</style>