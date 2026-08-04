import type { Metadata } from 'next';

import { getWrittenLessons } from '@/lib/content';
import { BookmarkList, BookmarksRail } from './bookmarks-client';

/**
 * Kept out of the index on purpose: the list lives in localStorage, so to a
 * crawler this page is permanently empty. `follow` still lets link equity pass
 * through to the lessons it would link to for a signed-in reader.
 */
export const metadata: Metadata = {
  title: 'Saved lessons',
  description: 'Your shortlist of concepts to revise the night before an interview.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/bookmarks' },
};

export default async function BookmarksPage() {
  const written = await getWrittenLessons();

  return (
    <div className="page">
      <header className="mb-7">
        <p className="eyebrow mb-2.5">Shortlist</p>
        <h1 className="text-2xl font-semibold tracking-tight">Saved lessons</h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground">
          Your shortlist for the night before an interview.
        </p>
      </header>

      <div className="page-cols">
        <div className="min-w-0">
          <BookmarkList written={written} />
        </div>

        <aside className="page-aside chrome no-print">
          <BookmarksRail written={written} />
        </aside>
      </div>
    </div>
  );
}
