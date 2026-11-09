import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/data';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/wp-json/', '/wp-admin/', '/comments/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
