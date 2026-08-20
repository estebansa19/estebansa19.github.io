# Esteban's Resume & Blog

Personal resume and blog for Esteban Saldarriaga Alzate. Built with Astro, content collections, and minimal, accessible styling.

- **Live site**: https://estebansa19.github.io/
- **Tech**: Astro 7, MDX, RSS, Sitemap, TypeScript

## Project structure

```text
public/                  # Static assets served as-is (favicon, fonts, manifest, robots, OG image)
src/
  assets/                # Images processed & optimised by Astro at build time
  components/            # Reusable UI components
  content/
    blog/                # Blog posts (Markdown/MDX)
    jobs/                # Resume experience entries (Markdown)
  data/                  # Static structured data (education)
  layouts/
    BaseLayout.astro     # The single <html> shell — head, header, footer
    BlogPost.astro       # Blog article layout
  pages/                 # Routed pages
  styles/global.css      # Design tokens + base element styles
  utils/                 # Small shared helpers
astro.config.mjs
```

Every page renders through `BaseLayout.astro`, so `<head>`, the header and the footer are defined in exactly one place.

## Local development

```sh
npm install
npm run dev      # http://localhost:4321
```

| Command           | Action                                        |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start the dev server                          |
| `npm run build`   | Build the production site to `dist/`          |
| `npm run preview` | Serve the production build locally            |
| `npm run check`   | Type-check Astro, TypeScript and content data |

`npm run check` also runs in CI before the build, so a type error fails the deploy rather than shipping.

## Content authoring

### Blog posts

Add a Markdown or MDX file under `src/content/blog/`. `src/content/blog/hello-world.md` is a
draft template — copy it to start a new post. The filename becomes the URL.

```md
---
title: 'Post title'
description: 'Short description, used for meta tags and the RSS feed'
pubDate: 'YYYY-MM-DD'
updatedDate: 'YYYY-MM-DD' # optional
heroImage: './cover.jpg'  # optional, path relative to the post file
draft: false              # true keeps it out of the build
---
```

Hero images are referenced **relative to the post file**, not from `public/`, so Astro can
resize them and emit modern formats. Drop the original in next to the post — no manual resizing.

Drafts are visible with `npm run dev` but are excluded from the built pages, the RSS feed and
the nav link. While the blog has no published posts, the Blog link is hidden from the header
automatically.

### Jobs (experience)

Add a Markdown file under `src/content/jobs/`:

```md
---
role: 'Senior Software Engineer'
company: 'Company name'
companyUrl: 'https://example.com'  # optional
summary: 'One line shown on the resume index'  # optional
date_start: 'YYYY-MM-DD'
date_end: 'YYYY-MM-DD'  # or 'present' for the current role
---

Bullet points describing responsibilities and impact.
```

Entries sort themselves by start date, newest first.

## SEO & metadata

- Site-wide metadata lives in `src/consts.ts` and is rendered by `src/components/BaseHead.astro`.
- Every page emits `Person` and `WebSite` JSON-LD; the resume adds `ProfilePage` with one
  `Occupation` per job, and posts add `BlogPosting`.
- Page titles use the `Page — Esteban` template; the home page supplies its own full title.
- `sitemap-index.xml` and `rss.xml` are generated at build time. The 404 page is excluded from the sitemap.

## Design

The site is monospace throughout — headings, dates, labels, navigation and code are set in
JetBrains Mono. The one exception is long-form prose (anything inside `.prose`), which uses
IBM Plex Sans, because a monospace body is tiring to read at article length.

Both are variable fonts, latin subset, self-hosted from `public/fonts/` and preloaded — no
request ever leaves the site for a font.

Experience is a timeline: a hairline rail with a dot per role. The current role's dot is
filled and haloed in the accent colour; past roles are hollow and fill on hover.

## Theming

Light and dark are driven by `data-theme` on `<html>`. The visitor's OS preference is used
until they pick a theme with the header toggle, after which the choice is stored in
`localStorage`. An inline script in `<head>` resolves the theme before first paint, so the
page never flashes the wrong one.

Colours are CSS custom properties defined once in `src/styles/global.css` — change them there
and both themes follow.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which type-checks, builds, and publishes
`dist/` to GitHub Pages.
