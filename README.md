# Resume & blog

My resume, one-page CV and blog, live at https://estebansa19.github.io/.

Built with Astro and deployed to GitHub Pages on every push to `main`. It also rebuilds on the
1st of each month, so my age and tenure stay current.

## Run it

Needs Node 24+.

```sh
npm install
npx playwright install chromium-headless-shell  # once; the build prints the CV PDF with it
npm run dev                                      # http://localhost:4321
```

`npm run check` type-checks and `npm run build` builds to `dist/`. CI runs both on every PR.

## Update it

- **New job:** add a Markdown file to `src/content/jobs/`, with the bullets as the body.

  ```md
  ---
  role: 'Senior Software Engineer'
  company: 'Company'
  companyUrl: 'https://example.com'
  summary: 'One line for the timeline'
  date_start: '2026-01-01'
  date_end: 'present'
  stack: ['Ruby on Rails', 'PostgreSQL']
  ---
  ```

- **Skills:** `src/data/skills.ts`. A job's `stack` can only use skills from this list, and
  every skill needs at least one job, or the build fails.
- **Education:** `src/data/education.ts`. Entries with a `cvTitle` also go on the CV.
- **Title, headline and contact details:** `src/consts.ts`.
- **Blog post:** copy `src/content/blog/hello-world.md`. `draft: true` keeps a post off the live
  site but visible in `npm run dev`. The blog link appears once a post is published.

## Generated at build time

`integrations/snapshots.mjs` renders two files from the built site:

- `Esteban-Saldarriaga-CV.pdf`, printed from `/cv`. The build fails if it runs past one page.
- `social-card.png`, the 1200×630 image link previews show.
