import fs from 'node:fs/promises';
import path from 'node:path';

import type { MetadataRoute } from 'next';

import { getWrittenLessons } from '@/lib/content';
import { LESSON_INDEX, hrefOf } from '@/lib/curriculum';
import { TOPIC_INDEX, hrefOfTopic } from '@/lib/topics';
import { url } from '@/lib/seo';

export const dynamic = 'force-static';

/**
 * `lastModified` from the markdown file's mtime.
 *
 * A sitemap that claims every page changed today is noise a crawler learns to
 * ignore; real per-file dates are what make it worth fetching. Unwritten
 * lessons have no file, hence null.
 */
async function lessonModified(dir: string, file: string): Promise<Date | null> {
  try {
    const stat = await fs.stat(path.join(process.cwd(), 'content', dir, `${file}.md`));
    return stat.mtime;
  } catch {
    return null;
  }
}

/** Topic files live in their own directory, with the derived filename. */
async function topicModified(topic: { n: number; slug: string }): Promise<Date | null> {
  const file = `${String(topic.n).padStart(2, '0')}-${topic.slug}.md`;
  try {
    const stat = await fs.stat(path.join(process.cwd(), 'content', '06-laravel', 'topics', file));
    return stat.mtime;
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const written = new Set(await getWrittenLessons());

  const lessons = await Promise.all(
    LESSON_INDEX.map(async (l) => {
      const modified = await lessonModified(l.module.dir, l.file);
      const isWritten = written.has(l.n);

      return {
        url: url(hrefOf(l)),
        lastModified: modified ?? undefined,
        // Written lessons are reviewed as the curriculum evolves; stubs change
        // only when they get written, and there is no point asking for a
        // frequent recrawl of a placeholder.
        changeFrequency: (isWritten ? 'monthly' : 'yearly') as 'monthly' | 'yearly',
        /* Priority scales with interview frequency, so the pages people
           actually search for outrank the long tail within the site. It is a
           weak hint at best, but it costs nothing to get it right. */
        priority: isWritten ? Math.min(0.9, 0.55 + (l.frequency / 100) * 0.35) : 0.2,
      };
    }),
  );

  const topics = await Promise.all(
    TOPIC_INDEX.map(async (t) => {
      const modified = await topicModified(t);
      return {
        url: url(hrefOfTopic(t)),
        lastModified: modified ?? undefined,
        changeFrequency: 'monthly' as const,
        // Tier is the topic analog of the lessons' interview-frequency scaling:
        // the must-know pages deserve a nudge over the long tail.
        priority: t.tier === 1 ? 0.8 : t.tier === 2 ? 0.7 : 0.6,
      };
    }),
  );

  const now = new Date();
  const newestLesson = lessons
    .map((l) => l.lastModified)
    .filter((d): d is Date => d instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const newestTopic = topics
    .map((t) => t.lastModified)
    .filter((d): d is Date => d instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const newest = newestTopic && (!newestLesson || newestTopic > newestLesson) ? newestTopic : newestLesson;

  return [
    {
      url: url('/'),
      lastModified: newest ?? now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: url('/graph'),
      lastModified: newest ?? now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: url('/topics'),
      lastModified: newestTopic ?? now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...lessons,
    ...topics,
  ];
}
