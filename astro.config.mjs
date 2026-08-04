// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://estebansa19.github.io',
	integrations: [mdx(), sitemap()],
	compressHTML: true,
	build: {
		inlineStylesheets: 'always'
	},
	trailingSlash: 'ignore'
});
