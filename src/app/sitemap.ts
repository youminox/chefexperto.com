import { MetadataRoute } from 'next';
import { getAllPosts, getAllCategories, SITE_URL } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const categories = getAllCategories();

  // Filter out posts without titles (thin content)
  const validPosts = posts.filter(p => p.title && p.title.length >= 3);

  const postEntries: MetadataRoute.Sitemap = validPosts.map(post => ({
    url: `${SITE_URL}/${post.category}/${post.slug}/`,
    lastModified: new Date(post.modified || post.date).toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${SITE_URL}/${cat.slug}/`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/privacy-policy/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/aviso-legal/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/politica-de-cookies/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/hola-hablamos/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];

  return [
    ...staticPages,
    ...categoryEntries,
    ...postEntries,
  ];
}
