<script>
	// import { siteAuthor } from '$lib/config';
	import NavItems from './NavItems.svelte';
</script>

<footer>
	<nav>
		<ul>
			<li>
				<a href="/">Home</a>
			</li>
		</ul>
	</nav>
	<nav>
		<NavItems />
	</nav>

	<!-- <p>&copy;{new Date().getFullYear()} {siteAuthor}</p> -->
</footer>
