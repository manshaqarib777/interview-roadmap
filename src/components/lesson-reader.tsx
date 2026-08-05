'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';

import type { InterviewCard, Step } from '@/lib/content';
import type { NarrationNotes } from '@/lib/narration';
import {
  BY_N,
  DIFFICULTY_LABEL,
  TOTAL_LESSONS,
  hrefOf,
  type IndexedLesson,
} from '@/lib/curriculum';
import { useStore } from '@/lib/store';
import { useEnhancedCode } from './enhance-code';
import { CompleteCard, EmptyState, InterviewCards, Quiz } from './lesson-parts';
import { MetaRow, RailCard } from './rail';
import { ReadAloud } from './read-aloud';
import { ReaderToolbar } from './reader-toolbar';

type Props = {
  lesson: IndexedLesson & {
    steps: Step[];
    cards: InterviewCard[];
    minutes: number;
    prev: IndexedLesson | null;
    next: IndexedLesson | null;
  };
};

/**
 * The rendered markdown for one step.
 *
 * Memoised on the HTML string, because `useEnhancedCode` mutates this subtree
 * afterwards — it replaces every `<pre>` with a Run/Debug panel. Any re-render
 * that re-applied `dangerouslySetInnerHTML` would throw that away along with
 * an open debugger, so React has to skip the element entirely when the markup
 * hasn't changed.
 */
const ProseBlock = memo(function ProseBlock({ html }: { html: string }) {
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
});

/**
 * One concept, one page.
 *
 * Sections flow top to bottom the way every good reference does; the sticky
 * rail on the right tracks position instead of a stepper chopping the page
 * into slides. Reading position is the navigation.
 */
export function LessonReader({ lesson }: Props) {
  const { state, toggleDone, setPrefs } = useStore();
  const bodyRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState('');
  const [reachedEnd, setReachedEnd] = useState(false);

  const done = state.done.includes(lesson.n);

  /**
   * Interview Mode drops the prose and keeps only the steps that carry
   * question cards — the lesson collapses to the thing you'd actually be
   * asked. Everything else (scroll-spy, the rail, progress) follows from
   * this one list, so it stays honest in both modes.
   */
  const interview = state.prefs.interview;
  const sections = useMemo(
    () => (interview ? lesson.steps.filter((s) => s.cards.length > 0) : lesson.steps),
    [interview, lesson.steps],
  );

  // One lookup for the whole page: the narrator walks the rendered DOM in
  // document order and only needs what it can't read off it, keyed by the id
  // stamped on each block at build time.
  const narrationNotes = useMemo(
    () => Object.assign({}, ...sections.map((s) => s.narration)) as NarrationNotes,
    [sections],
  );

  // Re-key on the mode: swapping cards for prose replaces the DOM the
  // code enhancer attached to.
  useEnhancedCode(bodyRef, `${lesson.n}:${interview}`);

  /* Scroll-spy — one observer, off the main thread. */
  useEffect(() => {
    const nodes = sections
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => Boolean(n));

    const io = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((r) => r.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-104px 0px -68% 0px' },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [sections]);

  /* Sections fade in once, as they enter view. */
  useEffect(() => {
    const nodes = bodyRef.current?.querySelectorAll<HTMLElement>('.reveal');
    if (!nodes?.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((n) => (n.dataset.shown = 'true'));
      return;
    }
    const io = new IntersectionObserver(
      (rs) =>
        rs.forEach((r) => {
          if (r.isIntersecting) {
            (r.target as HTMLElement).dataset.shown = 'true';
            io.unobserve(r.target);
          }
        }),
      { rootMargin: '0px 0px -8% 0px' },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [sections]);

  /* Reaching the end reveals the "what's next" card. */
  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setReachedEnd(true), {
      rootMargin: '0px 0px -10% 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (/^(INPUT|TEXTAREA)$/.test(t.tagName) || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'f') setPrefs({ focus: !state.prefs.focus });
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPrefs, state.prefs.focus]);

  const readerStyle = {
    '--reader-size': `${state.prefs.size}px`,
    '--reader-leading': state.prefs.leading,
    '--reader-width': `${state.prefs.width}rem`,
  } as React.CSSProperties;

  const prereqs = useMemo(
    () => lesson.prereqs.map((n) => BY_N.get(n)).filter((l): l is IndexedLesson => Boolean(l)),
    [lesson.prereqs],
  );

  return (
    <div className="page-cols" style={readerStyle}>
      <div className="reader min-w-0">
        {/* ---- the content, one flow ------------------------------- */}
        <div ref={bodyRef} className="space-y-12">
          {interview && sections.length === 0 && (
            <EmptyState
              title="No interview cards in this lesson"
              body="Interview Mode turns a lesson's “Common interview questions” step into flashcards. This one doesn't have that step yet — exit Interview Mode to read it normally."
            />
          )}
          {sections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className={`reveal scroll-mt-28 ${s.kind === 'objectives' ? 'will-learn' : ''}`}
            >
              {/* The narrator announces the step it is moving into, so a
                  listener knows where they are without watching the page. */}
              <h2
                data-narrate={`${s.id}-title`}
                className={
                  s.kind === 'objectives'
                    ? 'mb-3 text-[1.375rem] font-bold'
                    : 'mb-4 text-[1.75rem] leading-tight font-bold tracking-[-0.015em]'
                }
              >
                {s.title}
              </h2>
              {interview ? (
                <InterviewCards cards={s.cards} />
              ) : s.kind === 'quiz' && s.questionsHtml.length > 0 ? (
                <Quiz questions={s.questionsHtml} />
              ) : (
                <ProseBlock html={s.html} />
              )}
            </section>
          ))}
        </div>

        <div ref={endRef} />

        {/* ---- what's next ---------------------------------------- */}
        {reachedEnd && (
          <div className="mt-14">
            <CompleteCard
              title={lesson.title}
              nextHref={lesson.next ? hrefOf(lesson.next) : undefined}
              nextTitle={lesson.next?.title}
              nextN={lesson.next?.n}
            />
          </div>
        )}

        <nav className="chrome no-print mt-6 grid gap-2 sm:grid-cols-2">
          {lesson.prev ? (
            <Link href={hrefOf(lesson.prev)} className="panel lift p-3">
              <span className="text-[10.5px] text-faint">← Previous</span>
              <p className="mt-0.5 truncate text-[13px] font-medium">{lesson.prev.title}</p>
            </Link>
          ) : (
            <span />
          )}
          {lesson.next && (
            <Link href={hrefOf(lesson.next)} className="panel lift p-3 text-right sm:col-start-2">
              <span className="text-[10.5px] text-faint">Next →</span>
              <p className="mt-0.5 truncate text-[13px] font-medium">{lesson.next.title}</p>
            </Link>
          )}
        </nav>
      </div>

      {/* ---- right rail: General, then position ------------------- *
       * The meta strip that used to sit above the prose lives here, so the
       * page opens on the first sentence instead of on a row of stats. */}
      <aside className="page-aside page-aside-first chrome no-print">
        <ReaderToolbar lesson={lesson} />

        <ReadAloud bodyRef={bodyRef} notes={narrationNotes} />

        <RailCard title="General">
          <MetaRow label="Module">{lesson.module.short}</MetaRow>
          <MetaRow label="Lesson">
            <span className="num">
              {lesson.n} of {TOTAL_LESSONS}
            </span>
          </MetaRow>
          <MetaRow label="Difficulty">
            <span className="flex items-center justify-end gap-2">
              <span className="flex gap-[2px]">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`h-1 w-2.5 rounded-full ${
                      i < lesson.difficulty ? 'bg-[var(--acc)]' : 'bg-input'
                    }`}
                  />
                ))}
              </span>
              {DIFFICULTY_LABEL[lesson.difficulty]}
            </span>
          </MetaRow>
          <MetaRow label="Asked in">
            <span className="num">{lesson.frequency}%</span>
          </MetaRow>
          <MetaRow label="Read time">
            <span className="num">{lesson.minutes} min</span>
          </MetaRow>
          <MetaRow label="Prerequisites">
            {prereqs.length === 0 ? (
              <span className="text-faint">None</span>
            ) : (
              <span className="flex flex-wrap justify-end gap-1">
                {prereqs.map((p) => (
                  <Link
                    key={p.n}
                    href={hrefOf(p)}
                    title={p.title}
                    className="max-w-[9rem] truncate rounded-md border px-1.5 py-0.5 text-[11.5px] text-muted-foreground transition-colors hover:border-input hover:text-foreground"
                  >
                    {p.title}
                  </Link>
                ))}
              </span>
            )}
          </MetaRow>

          <button
            onClick={() => toggleDone(lesson.n)}
            className={`btn mt-3 w-full py-1.5 text-[12.5px] ${done ? 'text-success' : 'btn-ghost'}`}
          >
            <span
              className={`grid h-3.5 w-3.5 place-items-center rounded-full border text-[9px] transition-colors ${
                done ? 'border-success bg-success text-background' : 'border-input'
              }`}
            >
              {done && '✓'}
            </span>
            {done ? 'Completed' : 'Mark complete'}
          </button>
        </RailCard>

        {/* A 15-entry contents list ahead of the prose is worse than no
            contents list, so it only appears once the rail is a real column. */}
        <RailCard
          className="hidden xl:block"
          title="On this page"
          action={
            <span className="num text-[11px] text-faint">
              {sections.findIndex((s) => s.id === active) + 1}/{sections.length}
            </span>
          }
        >
          <div className="mb-2.5 h-[3px] overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-accent"
              animate={{
                width: `${
                  ((sections.findIndex((s) => s.id === active) + 1) /
                    Math.max(sections.length, 1)) *
                  100
                }%`,
              }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <ul className="-mx-1 space-y-0.5">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  data-active={active === s.id}
                  className="nav-pill text-[13px] leading-snug text-muted-foreground"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </RailCard>
      </aside>
    </div>
  );
}
