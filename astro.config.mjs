// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://estebansa19.github.io',
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => !page.includes('/404'),
		}),
	],
	compressHTML: true,
	// Links are prefetched as they scroll into view — the whole site is a handful
	// of tiny static pages, so navigation becomes effectively instant.
	prefetch: {
		prefetchAll: true,
		defaultStrategy: 'viewport',
	},
	build: {
		// 'auto' inlines only small stylesheets; the shared bundle stays an external
		// file so it is cached once instead of re-sent with every page.
		inlineStylesheets: 'auto',
	},
	trailingSlash: 'ignore',
});
