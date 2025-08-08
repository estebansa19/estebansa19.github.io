### Esteban's Resume & Blog (Astro)

Personal resume and blog for Esteban Saldarriaga Alzate. Built with Astro, content collections, and minimal, accessible styling.

- **Live site**: `https://estebansa.site`
- **Tech**: Astro 5, MDX, RSS, Sitemap, TypeScript support

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
heroImage: '/images/profile.jpg'  # or your custom image in /public/images
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
- Open Graph and Twitter cards use the page `image` (defaults to `/images/profile.jpg`).

### Favicon

- Custom animated ruby favicon at `public/favicon.svg`. This replaces the default Astro favicon.
- Referenced from `BaseHead.astro` and `public/site.webmanifest`.

### Deployment

- The site base URL is set to `https://estebansa.site` in `astro.config.mjs`.
- Deploy the `dist/` folder to your hosting provider of choice.

### Notes

- Placeholder demo images from the original Astro starter were removed. Blog posts now default to `/images/profile.jpg` unless a specific hero image is provided.
