import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';

import './globals.css';
import { getSearchIndex, getWrittenLessons } from '@/lib/content';
import { MODULES, TOTAL_LESSONS } from '@/lib/curriculum';
import {
  AUTHOR,
  LOCALE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  courseNode,
  graph,
  organizationNode,
  websiteNode,
} from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';
import { CommandPalette } from '@/components/command-palette';
import { Sidebar } from '@/components/sidebar';
import { FocusBinder, HeaderStatus, ThemeToggle } from '@/components/shell-client';
import { BackButton, Breadcrumbs, RailToggle } from '@/components/topbar-client';
import { Grain, Spotlight } from '@/components/fx';

const display = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono-face', display: 'swap' });

export const metadata: Metadata = {
  // Everything relative below (canonicals, OG images) resolves against this.
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${SITE_NAME} — React, TypeScript & Next.js Interview Prep`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: AUTHOR, url: SITE_URL }],
  creator: AUTHOR,
  publisher: AUTHOR,
  keywords: SITE_KEYWORDS,
  category: 'education',

  alternates: { canonical: '/' },

  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    locale: LOCALE,
    // Images come from opengraph-image.tsx via the file convention — declaring
    // them here as well would produce duplicate og:image tags.
  },

  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Let Google use full-size thumbnails and untruncated snippets. Without
      // these, long-form pages get clipped previews and no image.
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: 'default' },
  formatDetection: { telephone: false, address: false, email: false },

  // Only emitted once the env var is set — an empty verification tag is worse
  // than none, since Search Console reads it as a failed claim.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#212121' },
  ],
};

/**
 * Applies theme and rail width before first paint — no flash, no layout shift.
 * Both are attributes/classes on <html> so CSS can lay out the frame without
 * waiting for React to hydrate and tell it how wide the rail is.
 */
const NO_FLASH = `try{var s=localStorage.getItem('roadmap:theme');var d=s?s==='dark':matchMedia('(prefers-color-scheme:dark)').matches;document.documentElement.classList.toggle('dark',d);document.documentElement.dataset.rail=localStorage.getItem('roadmap:rail')==='collapsed'?'collapsed':'open';document.documentElement.dataset.drawer='closed'}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [written, index] = await Promise.all([getWrittenLessons(), getSearchIndex()]);

  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      </head>
      <body>
        {/* Site-wide graph: who publishes this, what it is, and that the whole
            curriculum is one course. Per-page nodes reference these by @id. */}
        <JsonLd
          id="ld-site"
          data={graph(organizationNode(), websiteNode(), courseNode(MODULES, TOTAL_LESSONS))}
        />

        <FocusBinder />
        <Spotlight />
        <Grain />

        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:panel focus:fixed focus:top-3 focus:left-3 focus:z-[110] focus:px-4 focus:py-2"
        >
          Skip to content
        </a>

        <Sidebar written={written} />

        {/* The bar is where you are, not what you can search — collapse, back
            and breadcrumbs read left to right; search is ⌘K only. */}
        <header className="topbar chrome no-print sticky top-0 z-40">
          <div className="relative flex h-full items-center gap-2 px-3 sm:px-4">
            <RailToggle />
            <BackButton />
            <span className="divider-v mx-0.5 hidden sm:block" />
            <Breadcrumbs />

            <div className="ml-auto flex shrink-0 items-center gap-1.5">
              <HeaderStatus total={TOTAL_LESSONS} />
              <span className="divider-v hidden sm:block" />
              <CommandPalette index={index} />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main id="content" className="main">
          {children}
        </main>
      </body>
    </html>
  );
}
