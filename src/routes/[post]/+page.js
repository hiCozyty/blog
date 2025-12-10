import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	try {
		// const post = await import(`../../../lib/posts/${params.post}.md`);
		const post = await import(`../../lib/posts/${params.post}.md`);
		const siteUrl = 'https://cozyty.blog';
		return {
			PostContent: post.default,
			meta: { ...post.metadata, slug: params.post, image: siteUrl + post.coverImage }
		};
	} catch (err) {
		error(404, err);
	}
};
