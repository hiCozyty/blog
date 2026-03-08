import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
//https://fedora.tail8a383a.ts.net:5174/
export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5174,
		host: '127.0.0.1',
		allowedHosts: ['localhost', '127.0.0.1', 'fedora.tail8a383a.ts.net'],
		fs: {
			allow: ['..']
		}
	}
});
