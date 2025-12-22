import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/utils/Helpers';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Disallow protected routes (require authentication)
      // These paths match all locale variants (e.g., /account, /en/account)
      disallow: ['/dashboard', '/account', '/api'],
    },
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  };
}
