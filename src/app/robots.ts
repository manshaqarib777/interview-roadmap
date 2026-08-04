import type { MetadataRoute } from 'next';

import { SITE_URL, url } from '@/lib/seo';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /bookmarks renders from localStorage — for a crawler it is a
        // permanently empty page, so it would only dilute the index.
        disallow: ['/bookmarks'],
      },
    ],
    sitemap: url('/sitemap.xml'),
    host: SITE_URL,
  };
}
