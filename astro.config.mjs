// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';
import snapshots from './integrations/snapshots.mjs';

// The config can't query collections, so this mirrors getPosts()'s draft rule on the files.
const blogDir = new URL('./src/content/blog/', import.meta.url);
const hasPublishedPosts = readdirSync(blogDir, { recursive: true, encoding: 'utf8' })
  .filter((file) => /\.mdx?$/.test(file))
  .some((file) => !/^draft:\s*true\s*$/m.test(readFileSync(new URL(file, blogDir), 'utf8')));

// https://astro.build/config
export default defineConfig({
  site: 'https://estebansa19.github.io',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/404') && !page.includes('/social-card') && (hasPublishedPosts || !page.endsWith('/blog/')),
    }),
    // Keep each `output` in sync with `CV_PDF` and `SOCIAL_CARD` in src/consts.ts.
    snapshots([
      { page: '/cv/', output: 'Esteban-Saldarriaga-CV.pdf', maxPages: 1 },
      { page: '/social-card/', output: 'social-card.png', viewport: { width: 1200, height: 630 }, removePage: true },
    ]),
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
