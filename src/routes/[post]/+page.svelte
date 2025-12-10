<!-- This file renders each individual blog post for reading. Be sure to update the svelte:head below -->
<script>
	let { data } = $props();

	const { title, excerpt, date, updated, coverImage, coverWidth, coverHeight, categories } =
		data.meta;
	const { PostContent } = data;
</script>

<svelte:head>
	<!-- Be sure to add your image files and un-comment the lines below -->
	<title>{title}</title>
	<meta name="description" content={excerpt} />
	<meta property="og:type" content="article" />

	<meta property="og:title" content={title} />
	<meta name="twitter:title" content={title} />

	<meta property="og:description" content={excerpt} />
	<meta name="twitter:description" content={excerpt} />

	<!-- THIS IS THE IMPORTANT PART -->
	<meta property="og:image" content={data.meta.image} />
	<meta name="twitter:image" content={data.meta.image} />

	<meta property="og:image:width" content={coverWidth} />
	<meta property="og:image:height" content={coverHeight} />

	<meta name="robots" content="noai, noimageai" />
	<meta name="ai-models" content="noindex, nofollow, noarchive" />
	<meta http-equiv="X-Robots-Tag" content="noai, noindex, noarchive" />
</svelte:head>

<article class="post">
	<!-- You might want to add an alt frontmatter attribute. If not, leaving alt blank here works, too. -->
	<img
		class="cover-image"
		src={coverImage}
		alt=""
		style="aspect-ratio: {coverWidth} / {coverHeight};"
		width={coverWidth}
		height={coverHeight}
	/>

	<h1>{title}</h1>

	<div class="meta">
		<b>Published:</b>
		{date}
		<br />
		<b>Updated:</b>
		{updated}
	</div>

	<PostContent />

	{#if categories}
		<aside class="post-footer">
			<h2>Posted in:</h2>
			<ul class="post-footer__categories">
				{#each categories as category}
					<li>
						<a href="/blog/category/{category}/">
							{category}
						</a>
					</li>
				{/each}
			</ul>
		</aside>
	{/if}
</article>

<style>
	.post-footer__categories a {
		border-radius: 25px; /* Adjust this value - higher = rounder */
	}

	/* Or target more specifically if needed */
	.post-footer__categories li a {
		border-radius: 25px;
	}
</style>
