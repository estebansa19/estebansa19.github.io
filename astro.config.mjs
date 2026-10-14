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
  // CSS and JS are inlined into each page. They are only a few KB gzipped, and
  // GitHub Pages caches every file for just 10 minutes, so separate files
  // mostly add requests to the critical path rather than saving bytes.
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    build: {
      // Applies to scripts only; other assets keep Vite's default limit.
      assetsInlineLimit: (filePath) => (filePath.endsWith('.js') ? true : undefined),
    },
  },
  trailingSlash: 'ignore',
});
