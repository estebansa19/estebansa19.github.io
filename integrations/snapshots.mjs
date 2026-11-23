// @ts-check
import { rm, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @typedef {object} Snapshot
 * @property {string} page
 * @property {string} output `.pdf` is printed; anything else is a PNG screenshot.
 * @property {number} [maxPages]
 * @property {{ width: number; height: number }} [viewport]
 * @property {boolean} [removePage]
 */

const ORIGIN = 'http://snapshot.local';

/**
 * Saves built pages as files, served straight from dist/, so they always match the site.
 * @param {Snapshot[]} snapshots
 * @returns {import('astro').AstroIntegration}
 */
export default function snapshots(snapshots) {
  return {
    name: 'snapshots',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const { chromium } = await import('playwright');
        const browser = await chromium.launch();

        try {
          for (const snapshot of snapshots) {
            const started = performance.now();
            const tab = await browser.newPage({ reducedMotion: 'reduce', ...(snapshot.viewport && { viewport: snapshot.viewport }) });
            await tab.route(`${ORIGIN}/**`, (route) => serve(root, route));
            await tab.goto(`${ORIGIN}${snapshot.page}`, { waitUntil: 'networkidle' });
            await tab.evaluate(() => document.fonts.ready);

            const isPdf = extname(snapshot.output) === '.pdf';
            // `tagged` writes the document structure (headings, lists, reading
            // order) into the PDF, which is what screen readers and parsers use.
            const file = isPdf
              ? await tab.pdf({ preferCSSPageSize: true, printBackground: true, tagged: true })
              : await tab.screenshot();
            await writeFile(join(root, snapshot.output), file);
            if (snapshot.removePage) await rm(join(root, snapshot.page), { recursive: true });

            const pages = isPdf ? (file.toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g)?.length ?? 0) : 0;
            const shape = isPdf
              ? `${pages} ${pages === 1 ? 'page' : 'pages'}`
              : `${snapshot.viewport?.width ?? 1280}×${snapshot.viewport?.height ?? 720}`;
            const size = `${(file.length / 1024).toFixed(0)} KB`;
            logger.info(`${snapshot.output} (${shape}, ${size}) in ${Math.round(performance.now() - started)}ms`);
            if (snapshot.maxPages && pages > snapshot.maxPages) {
              throw new Error(`${snapshot.output} is ${pages} pages; it must fit on ${snapshot.maxPages}.`);
            }
          }
        } finally {
          await browser.close();
        }
      },
    },
  };
}

/** @param {string} root @param {import('playwright').Route} route */
async function serve(root, route) {
  let path = decodeURIComponent(new URL(route.request().url()).pathname);
  if (path.endsWith('/')) path += 'index.html';
  try {
    await route.fulfill({ path: join(root, path) });
  } catch {
    await route.fulfill({ status: 404 });
  }
}
