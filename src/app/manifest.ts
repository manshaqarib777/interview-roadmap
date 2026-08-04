import type { MetadataRoute } from 'next';

import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '@/lib/seo';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    lang: 'en',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    // Light values: the splash screen shows before any JS runs, so it can't
    // know the user's theme. White matches the default and never flashes dark.
    background_color: '#ffffff',
    theme_color: '#ffffff',
    categories: ['education', 'productivity', 'developer'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // Padded variant: Android crops maskable icons to whatever shape the
      // launcher uses, so the mark sits inside the safe zone here.
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Knowledge graph', short_name: 'Graph', url: '/graph' },
      { name: 'Saved lessons', short_name: 'Saved', url: '/bookmarks' },
    ],
  };
}
