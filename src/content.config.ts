import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Blog posts: every `src/content/blog/*.md` file.
 * The file name becomes the URL: `/blog/<file-name>/`.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    /** Post title. */
    title: z.string(),
    /** One-line summary, used in lists, meta description and RSS. */
    description: z.string(),
    /** Publication date, YYYY-MM-DD. */
    date: z.coerce.date(),
    /** Lowercase tags used by the filter on /blog/, e.g. [wazuh, sysmon]. */
    tags: z.array(z.string()).default([]),
    /** `true` hides the post outside `npm run dev`. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
