// // IMPORTANT: update all these property values in src/lib/config.js
// import { siteTitle } from '$lib/config'

// // export const prerender = true

// export const GET = async () => {	
// 	const data = await Promise.all(
// 		Object.entries(import.meta.glob('$lib/posts/*.md')).map(async ([path, page]) => {
// 			const { metadata } = await page()
// 			const slug = path.split('/').pop().split('.').shift()
// 			return { ...metadata, slug }
// 		})
// 	)
// 	.then(posts => {
// 		return posts.sort((a, b) => new Date(b.date) - new Date(a.date))
// 	})

// 	const body = render(data)
// 	const headers = {
// 		'Cache-Control': `max-age=0, s-max-age=${600}`,
// 		'Content-Type': 'application/xml',
// 	}
// 	return new Response(
// 		body,
// 		{
// 			status: 200,
// 			headers,
// 		}
// 	)
// };

