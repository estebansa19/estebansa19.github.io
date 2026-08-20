---
title: 'Hello world'
description: 'A starting point — copy this file to begin a new post.'
pubDate: '2026-01-01'
draft: true
---

This post is a **template**. It has `draft: true`, so it shows up while you run
`npm run dev` but never reaches the built site, the nav link or the RSS feed.

To publish something, copy this file, rename it (the filename becomes the URL),
and remove the `draft` line.

## Frontmatter

| Field         | Required | Notes                                                   |
| ------------- | -------- | ------------------------------------------------------- |
| `title`       | yes      | Used for the heading, `<title>` and social cards.        |
| `description` | yes      | One sentence; used for meta description and the feed.    |
| `pubDate`     | yes      | `YYYY-MM-DD`.                                            |
| `updatedDate` | no       | Shown next to the publish date when present.             |
| `heroImage`   | no       | Path **relative to this file**, e.g. `./cover.jpg`.      |
| `draft`       | no       | `true` keeps the post out of the build. Defaults false.  |

Hero images are optimised at build time, so drop the original next to the post
rather than resizing it by hand.
