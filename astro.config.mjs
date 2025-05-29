// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://estebansa.site', // Reemplaza con tu dominio real de GoDaddy
	integrations: [mdx(), sitemap()],
	compressHTML: true,
	build: {
		inlineStylesheets: 'auto'
	},
	trailingSlash: 'ignore'
});
