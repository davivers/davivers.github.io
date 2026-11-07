import { getCollection, type CollectionEntry } from 'astro:content';

/** A blog post entry (frontmatter in `data`, Markdown in `body`). */
export type BlogPost = CollectionEntry<'blog'>;

/** Prefixes an internal path with the configured `base`, e.g. withBase('/blog/'). */
export const withBase = (href: string): string =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}${href}`;

/** All posts, newest first. Drafts are included only in `npm run dev`. */
export async function getPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Formats a date in pt-BR, e.g. "07 de nov. de 2026". */
export const formatDate = (date: Date): string =>
  date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** Average reading speed used by `readingTime`. */
const WORDS_PER_MINUTE = 200;

/** Estimated reading time label, e.g. "4 min de leitura". */
export const readingTime = (post: BlogPost): string => {
  const words = (post.body ?? '').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min de leitura`;
};
