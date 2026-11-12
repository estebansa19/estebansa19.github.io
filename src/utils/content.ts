import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * Blog posts, newest first.
 *
 * Drafts are visible while running `astro dev` so you can preview them, and are
 * excluded from anything that ships: the built pages, the nav link and the feed.
 */
export async function getPosts({ includeDrafts = import.meta.env.DEV } = {}): Promise<
  CollectionEntry<'blog'>[]
> {
  const posts = await getCollection('blog', ({ data }) => includeDrafts || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/** Whether the built site has a post; until then the blog stays out of nav, footer and feed links. */
export async function hasPublishedPosts(): Promise<boolean> {
  return (await getPosts({ includeDrafts: false })).length > 0;
}
