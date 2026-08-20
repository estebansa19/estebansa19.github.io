import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			// Relative path to an image next to the post; Astro optimises it at build time.
			heroImage: image().optional(),
			draft: z.boolean().default(false),
		}),
});

const jobs = defineCollection({
	loader: glob({ base: './src/content/jobs', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		role: z.string(),
		company: z.string(),
		companyUrl: z.url().optional(),
		/** Short one-liner used on the resume index. */
		summary: z.string().optional(),
		date_start: z.coerce.date(),
		// `'present'` marks the current role; anything else is parsed as a date.
		date_end: z.union([z.literal('present'), z.coerce.date()]),
	}),
});

export const collections = { blog, jobs };
