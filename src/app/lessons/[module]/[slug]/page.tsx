import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getLesson } from '@/lib/content';
import { BY_N, LESSON_INDEX, hrefOf, milestoneFor, type IndexedLesson } from '@/lib/curriculum';
import {
  LOCALE,
  SITE_NAME,
  breadcrumbNode,
  graph,
  lessonDescription,
  lessonKeywords,
  lessonNode,
  lessonTitle,
} from '@/lib/seo';
import { LessonReader } from '@/components/lesson-reader';
import { JsonLd } from '@/components/json-ld';
import { LessonStatusPill } from '@/components/shell-client';

type Params = { module: string; slug: string };

export function generateStaticParams(): Params[] {
  return LESSON_INDEX.map((l) => ({ module: l.module.slug, slug: l.file }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { module: m, slug } = await params;
  const lesson = await getLesson(m, slug);
  if (!lesson) return {};

  const path = hrefOf(lesson);
  const description = lessonDescription(lesson, lesson.minutes);

  return {
    title: lessonTitle(lesson),
    description,
    keywords: lessonKeywords(lesson),
    // Self-referencing canonical on every lesson. The reader has client-side
    // state (?q=, hashes, modes) that must never fork the indexed URL.
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      url: path,
      title: lessonTitle(lesson),
      description,
      siteName: SITE_NAME,
      locale: LOCALE,
      section: lesson.module.title,
      tags: lessonKeywords(lesson),
    },
    twitter: { card: 'summary_large_image', title: lessonTitle(lesson), description },
    // A queued lesson has no body yet — thin content that would be crawled,
    // judged empty and counted against the site. Let it be followed, not
    // indexed, until it's written.
    ...(lesson.written ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function LessonPage({ params }: { params: Promise<Params> }) {
  const { module: modSlug, slug } = await params;
  const lesson = await getLesson(modSlug, slug);
  if (!lesson) notFound();

  const milestone = milestoneFor(lesson.n);
  const path = hrefOf(lesson);
  const prereqs = lesson.prereqs
    .map((n) => BY_N.get(n))
    .filter((l): l is IndexedLesson => Boolean(l));

  return (
    <div className={`acc-${lesson.module.accent} page`}>
      {/* The lesson itself, plus the trail that got you here. The breadcrumb
          markup is what produces the "Roadmap › JavaScript › Closures" line in
          a result instead of a raw URL. */}
      <JsonLd
        id="ld-lesson"
        data={graph(
          lessonNode(lesson, {
            minutes: lesson.minutes,
            words: lesson.words,
            prereqs,
            path,
          }),
          breadcrumbNode([
            { name: 'Roadmap', path: '/' },
            { name: lesson.module.title, path: '/graph' },
            { name: lesson.title, path },
          ]),
        )}
      />
      {/* Location is the bar's job now, so the head carries identity: which
          lesson this is, and whether you've finished it. */}
      <header className="mb-6">
        <p className="eyebrow mb-2.5 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--acc)]" />
          <span className="num">Lesson {lesson.n}</span>
          {milestone && (
            <>
              <span className="text-[var(--input)]">·</span>
              <span>
                {milestone.id} {milestone.title}
              </span>
            </>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[2rem] leading-[1.12] font-bold tracking-[-0.02em] text-balance sm:text-[2.5rem]">
            {lesson.title}
          </h1>
          <LessonStatusPill n={lesson.n} written={lesson.written} />
        </div>
      </header>

      {lesson.written ? (
        <LessonReader lesson={lesson} />
      ) : (
        <NotWritten n={lesson.n} title={lesson.title} why={lesson.why} />
      )}
    </div>
  );
}

function NotWritten({ n, title, why }: { n: number; title: string; why: string }) {
  return (
    <div className="panel overflow-hidden">
      <div className="border-b bg-muted px-6 py-4">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-faint uppercase">
          Why this matters
        </p>
        <p className="mt-1.5 text-[15px] text-foreground">{why}</p>
      </div>
      <div className="px-6 py-10 text-center">
        <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl bg-secondary text-faint">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </div>
        <h2 className="text-base font-semibold">Not written yet</h2>
        <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-muted-foreground">
          Lessons are written one at a time so each one stays dense and worth the ten minutes.
          This one is queued.
        </p>
        <p className="mt-5 inline-block rounded-lg bg-muted px-4 py-2 font-mono text-[11.5px] text-muted-foreground">
          Ask Claude Code: “write Lesson {n} — {title}”
        </p>
      </div>
    </div>
  );
}
