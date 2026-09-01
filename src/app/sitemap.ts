import { MetadataRoute } from 'next';
import { getAllPosts, getAllCategories, SITE_URL } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const categories = getAllCategories();

  const postEntries: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${SITE_URL}/${post.category}/${post.slug}/`,
    lastModified: post.modified || post.date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${SITE_URL}/${cat.slug}/`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...categoryEntries,
    ...postEntries,
  ];
}
