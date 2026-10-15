// @ts-check
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Prints the built `/cv` page to a PDF once the site is built, so the download
 * is always generated from the same content as the page.
 *
 * Nothing is served over the network: headless Chromium requests a made-up
 * origin and every request is answered straight from the build output.
 *
 * @param {{ page: string; output: string }} options
 * @returns {import('astro').AstroIntegration}
 */
export default function cvPdf({ page, output }) {
  return {
    name: 'cv-pdf',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const started = performance.now();
        const root = fileURLToPath(dir);
        const origin = 'http://cv.local';
        const { chromium } = await import('playwright');
        const browser = await chromium.launch();

        try {
          const tab = await browser.newPage();
          await tab.route(`${origin}/**`, async (route) => {
            let path = decodeURIComponent(new URL(route.request().url()).pathname);
            if (path.endsWith('/')) path += 'index.html';
            try {
              const body = await readFile(join(root, path));
              await route.fulfill({ body, contentType: CONTENT_TYPES[extname(path)] });
            } catch {
              await route.fulfill({ status: 404 });
            }
          });

          await tab.goto(`${origin}${page}`, { waitUntil: 'networkidle' });
          await tab.evaluate(() => document.fonts.ready);
          // `tagged` writes the document structure (headings, lists, reading
          // order) into the PDF, which is what screen readers and parsers use.
          const pdf = await tab.pdf({ preferCSSPageSize: true, printBackground: true, tagged: true });
          await writeFile(join(root, output), pdf);

          const pages = pdf.toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g)?.length ?? 0;
          const size = `${(pdf.length / 1024).toFixed(0)} KB`;
          const time = `${Math.round(performance.now() - started)}ms`;
          logger.info(`${output} (${pages} ${pages === 1 ? 'page' : 'pages'}, ${size}) in ${time}`);
          if (pages > 1) logger.warn('The CV no longer fits on one page.');
        } finally {
          await browser.close();
        }
      },
    },
  };
}

/** @type {Record<string, string>} */
const CONTENT_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
};
