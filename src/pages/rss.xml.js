import rss from '@astrojs/rss';
import { AUTHOR, SITE_DESCRIPTION } from '../consts';
import { getPosts } from '../utils/content';

export async function GET(context) {
  const posts = await getPosts({ includeDrafts: false });

  return rss({
    title: AUTHOR.name,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
  });
}
