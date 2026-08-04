### Esteban's Resume & Blog (Astro)

Personal resume and blog for Esteban Saldarriaga Alzate. Built with Astro, content collections, and minimal, accessible styling.

- **Live site**: `https://estebansa19.github.io/`
- **Tech**: Astro 7, MDX, RSS, Sitemap, TypeScript support

### Project structure

```text
public/                # Static assets (favicon, images, fonts, manifest)
src/
  components/          # Reusable UI components
  content/
    blog/              # Blog posts (Markdown/MDX)
    jobs/              # Resume experience entries (Markdown)
  layouts/             # Page/post layouts
  pages/               # Routed pages
  styles/              # Global CSS
astro.config.mjs       # Astro configuration
```

### Local development

- `npm install`
- `npm run dev` → open `http://localhost:4321`

### Build & preview

- `npm run build` → outputs to `dist/`
- `npm run preview` → serve the production build locally

### Content authoring

- **Blog posts**: add a Markdown or MDX file under `src/content/blog/` with frontmatter fields like:

```md
---
title: 'Post title'
description: 'Short description'
pubDate: 'YYYY-MM-DD'
heroImage: '/blog-placeholder-1.jpg'  # or use any custom image under /public
---
```

- **Jobs (experience)**: add a Markdown file under `src/content/jobs/` with:

```md
---
title: 'Role — Company'
date_start: 'YYYY-MM-DD'
date_end: 'YYYY-MM-DD' | 'present'
---

Bullet points describing responsibilities and impact.
```

### SEO & metadata

- Global metadata is handled in `src/components/BaseHead.astro` using `SITE_TITLE` and `SITE_DESCRIPTION` from `src/consts.ts`.
- Open Graph and Twitter cards use the page `image` (defaults to `/blog-placeholder-1.jpg`).

### Favicon

- Custom animated ruby favicon at `public/favicon.svg`. This replaces the default Astro favicon.
- Referenced from `BaseHead.astro` and `public/site.webmanifest`.

### Deployment

- The site is deployed to GitHub Pages via `.github/workflows/deploy.yml`, and the base URL is set to `https://estebansa19.github.io/` in `astro.config.mjs`.
- The workflow builds the site, uploads `dist/` as a GitHub Pages artifact, and deploys it on every push to `main`.
