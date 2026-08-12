'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';

import type { Topic } from '@/lib/content';
import type { NarrationNotes } from '@/lib/narration';
import { BY_N, hrefOf, type IndexedLesson } from '@/lib/curriculum';
import { TIER_LABEL, TOTAL_TOPICS, hrefOfTopic } from '@/lib/topics';
import { useStore } from '@/lib/store';
import { useEnhancedCode } from './enhance-code';
import { CompleteCard, EmptyState, InterviewCards, Quiz } from './lesson-parts';
import { MetaRow, RailCard } from './rail';
import { ReadAloud } from './read-aloud';
import { ReaderToolbar } from './reader-toolbar';

/**
 * The rendered markdown for one step — memoised on the HTML string because
 * useEnhancedCode mutates this subtree (replacing every `<pre>` with a
 * Run/Debug panel). Same contract as the lesson reader's ProseBlock.
 */
const ProseBlock = memo(function ProseBlock({ html }: { html: string }) {
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
});

/**
 * The topic reader — the lesson reader's skeleton, without the progress
 * machinery. Topics are reference pages: interview mode, focus mode, text
 * settings and read-aloud all work (they're global prefs / narration), but
 * there is no mark-complete or bookmark because topics never join the
 * progress store. Prev/next walks the topic list, not the curriculum.
 */
export function TopicReader({ topic }: { topic: Topic }) {
  const { state, setPrefs } = useStore();
  const bodyRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState('');
  const [reachedEnd, setReachedEnd] = useState(false);

  const interview = state.prefs.interview;
  const sections = useMemo(
    () => (interview ? topic.steps.filter((s) => s.cards.length > 0) : topic.steps),
    [interview, topic.steps],
  );

  const narrationNotes = useMemo(
    () => Object.assign({}, ...sections.map((s) => s.narration)) as NarrationNotes,
    [sections],
  );

  // Re-key on the mode: swapping cards for prose replaces the DOM the code
  // enhancer attached to.
  useEnhancedCode(bodyRef, `t${topic.n}:${interview}`);

  /* Scroll-spy — same observer as the lesson reader. */
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

  const owningLessons = useMemo(
    () =>
      topic.owningLessons
        .map((n) => BY_N.get(n))
        .filter((l): l is IndexedLesson => Boolean(l)),
    [topic.owningLessons],
  );

  return (
    <div className="page-cols" style={readerStyle}>
      <div className="reader min-w-0">
        {/* ---- the content, one flow ------------------------------- */}
        <div ref={bodyRef} className="space-y-12">
          {interview && sections.length === 0 && (
            <EmptyState
              title="No interview cards in this topic"
              body="Interview Mode turns a topic's “Common interview questions” step into flashcards. This one doesn't have that step yet — exit Interview Mode to read it normally."
            />
          )}
          {sections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className={`reveal scroll-mt-28 ${s.kind === 'objectives' ? 'will-learn' : ''}`}
            >
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
              title={topic.title}
              label="Topic complete"
              nextHref={topic.next ? hrefOfTopic(topic.next) : undefined}
              nextTitle={topic.next?.title}
            />
          </div>
        )}

        <nav className="chrome no-print mt-6 grid gap-2 sm:grid-cols-2">
          {topic.prev ? (
            <Link href={hrefOfTopic(topic.prev)} className="panel lift p-3">
              <span className="text-[10.5px] text-faint">← Previous</span>
              <p className="mt-0.5 truncate text-[13px] font-medium">{topic.prev.title}</p>
            </Link>
          ) : (
            <span />
          )}
          {topic.next && (
            <Link href={hrefOfTopic(topic.next)} className="panel lift p-3 text-right sm:col-start-2">
              <span className="text-[10.5px] text-faint">Next →</span>
              <p className="mt-0.5 truncate text-[13px] font-medium">{topic.next.title}</p>
            </Link>
          )}
        </nav>
      </div>

      {/* ---- right rail ------------------------------------------- */}
      <aside className="page-aside page-aside-first chrome no-print">
        <ReaderToolbar n={topic.n} variant="topic" />

        <ReadAloud bodyRef={bodyRef} notes={narrationNotes} />

        <RailCard title="General">
          <MetaRow label="Milestone">{topic.milestone}</MetaRow>
          <MetaRow label="Topic">
            <span className="num">
              {topic.n} of {TOTAL_TOPICS}
            </span>
          </MetaRow>
          <MetaRow label="Tier">{TIER_LABEL[topic.tier]}</MetaRow>
          <MetaRow label="Read time">
            <span className="num">{topic.minutes} min</span>
          </MetaRow>
          {owningLessons.length > 0 && (
            <MetaRow label="Part of lesson">
              <span className="flex flex-wrap justify-end gap-1">
                {owningLessons.map((l) => (
                  <Link
                    key={l.n}
                    href={hrefOf(l)}
                    title={l.title}
                    className="max-w-[9rem] truncate rounded-md border px-1.5 py-0.5 text-[11.5px] text-muted-foreground transition-colors hover:border-input hover:text-foreground"
                  >
                    L{l.n} · {l.title}
                  </Link>
                ))}
              </span>
            </MetaRow>
          )}
        </RailCard>

        {/* On-page contents — same scroll-spy as the lesson reader. */}
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
