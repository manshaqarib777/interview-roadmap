'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

import type { InterviewCard } from '@/lib/content';
import { DIFFICULTY_LABEL, type IndexedLesson } from '@/lib/curriculum';

/* ================================================================= *
 * Why this matters — shown before the first step
 * ================================================================= */

export function WhyCard({
  lesson,
  prereqs,
  unlocks,
}: {
  lesson: IndexedLesson;
  prereqs: { n: number; title: string; href: string; done: boolean }[];
  unlocks: { n: number; title: string; href: string }[];
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`panel sheen acc-${lesson.module.accent} overflow-hidden`}
    >
      <div className="border-b bg-muted px-5 py-3">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-faint uppercase">
          Why this matters
        </p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-foreground">{lesson.why}</p>
      </div>

      <div className="grid grid-cols-2 divide-x divide-border sm:grid-cols-4">
        <Stat label="Difficulty" value={DIFFICULTY_LABEL[lesson.difficulty]}>
          <Dots filled={lesson.difficulty} total={5} />
        </Stat>
        <Stat label="Interview freq." value={`${lesson.frequency}%`}>
          <Meter value={lesson.frequency} />
        </Stat>
        <Stat label="Module" value={lesson.module.short}>
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--acc)]" />
        </Stat>
        <Stat label="Lesson" value={`#${lesson.n}`} />
      </div>

      {(prereqs.length > 0 || unlocks.length > 0) && (
        <div className="grid gap-4 border-t px-5 py-4 sm:grid-cols-2">
          {prereqs.length > 0 && (
            <LinkGroup
              label="Requires"
              items={prereqs.map((p) => ({ ...p, muted: !p.done }))}
            />
          )}
          {unlocks.length > 0 && <LinkGroup label="Unlocks" items={unlocks} />}
        </div>
      )}
    </motion.section>
  );
}

function Stat({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="px-5 py-3.5">
      <p className="text-[10px] tracking-[0.08em] text-faint uppercase">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
      {children && <div className="mt-2 flex items-center gap-1">{children}</div>}
    </div>
  );
}

function Dots({ filled, total }: { filled: number; total: number }) {
  return (
    <>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1 w-4 rounded-full transition-colors ${
            i < filled ? 'bg-[var(--acc)]' : 'bg-input'
          }`}
        />
      ))}
    </>
  );
}

function Meter({ value }: { value: number }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-input">
      <motion.div
        className="h-full rounded-full bg-[var(--acc)]"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      />
    </div>
  );
}

function LinkGroup({
  label,
  items,
}: {
  label: string;
  items: { n: number; title: string; href: string; muted?: boolean }[];
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] tracking-[0.08em] text-faint uppercase">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((i) => (
          <Link
            key={i.n}
            href={i.href}
            className={`group inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-all hover:-translate-y-px hover:border-input hover:bg-muted ${
              i.muted ? 'text-faint' : 'text-muted-foreground'
            }`}
          >
            <span className="num text-[10px] opacity-50">{i.n}</span>
            {i.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ================================================================= *
 * Quiz — self-assessment, because these answers are spoken not typed
 * ================================================================= */

/** `questions` are pre-rendered HTML — code spans survive the trip. */
export function Quiz({ questions }: { questions: string[] }) {
  const [marks, setMarks] = useState<Record<number, 'solid' | 'shaky'>>({});
  const answered = Object.keys(marks).length;
  const solid = Object.values(marks).filter((m) => m === 'solid').length;
  const finished = answered === questions.length && questions.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Answer each one out loud. Then rate yourself honestly.
        </p>
        <span className="num text-xs text-faint">
          {answered}/{questions.length}
        </span>
      </div>

      {questions.map((q, i) => {
        const mark = marks[i];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={`panel p-4 transition-colors ${
              mark === 'solid'
                ? 'border-[color-mix(in_srgb,var(--success)_45%,transparent)]'
                : mark === 'shaky'
                  ? 'border-[color-mix(in_srgb,var(--warning)_45%,transparent)]'
                  : ''
            }`}
          >
            <div className="flex gap-3">
              <span className="num mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-secondary text-[11px] font-semibold text-muted-foreground">
                {i + 1}
              </span>
              <div
                className="prose prose-quiz flex-1"
                dangerouslySetInnerHTML={{ __html: q }}
              />
            </div>

            <div className="mt-3 flex gap-2 pl-8">
              <button
                onClick={() => setMarks((m) => ({ ...m, [i]: 'solid' }))}
                className={`btn px-3 py-1.5 text-xs ${
                  mark === 'solid'
                    ? 'bg-[color-mix(in_srgb,var(--success)_16%,transparent)] text-success'
                    : 'btn-ghost'
                }`}
              >
                I could explain it
              </button>
              <button
                onClick={() => setMarks((m) => ({ ...m, [i]: 'shaky' }))}
                className={`btn px-3 py-1.5 text-xs ${
                  mark === 'shaky'
                    ? 'bg-[color-mix(in_srgb,var(--warning)_16%,transparent)] text-warning'
                    : 'btn-ghost'
                }`}
              >
                Need another pass
              </button>
            </div>
          </motion.div>
        );
      })}

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="panel overflow-hidden p-4 text-sm"
          >
            {solid === questions.length ? (
              <p className="text-success">
                All solid. You are ready for the next lesson.
              </p>
            ) : (
              <p className="text-muted-foreground">
                <span className="font-semibold text-warning">
                  {questions.length - solid} to revisit.
                </span>{' '}
                Scroll back to those steps before moving on — that is the whole point of
                rating yourself.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================= *
 * Interview Mode — question first, answer on demand
 * ================================================================= */

export function InterviewCards({ cards }: { cards: InterviewCard[] }) {
  const [open, setOpen] = useState<Set<number>>(new Set());

  const toggle = (i: number) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  if (cards.length === 0) {
    return (
      <EmptyState
        title="No interview cards in this step"
        body="Interview Mode turns the question sections of a lesson into flashcards. This step doesn't have any — try a lesson's “Common interview questions” step."
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {cards.map((c, i) => {
        const isOpen = open.has(i);
        return (
          <div key={i} className="panel overflow-hidden">
            <button
              onClick={() => toggle(i)}
              className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted"
            >
              <span className="mt-0.5 rounded-md bg-primary/12 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                Q{i + 1}
              </span>
              <span className="flex-1 text-[15px] leading-snug font-medium">{c.q}</span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="mt-1 text-faint"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div
                    className="prose prose-card border-t bg-muted px-4 py-3.5"
                    dangerouslySetInnerHTML={{ __html: c.aHtml }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      <p className="pt-1 text-center text-xs text-faint">
        Say your answer out loud before revealing. That is the part that actually transfers.
      </p>
    </div>
  );
}

/* ================================================================= *
 * Completion
 * ================================================================= */

export function CompleteCard({
  title,
  nextHref,
  nextTitle,
  nextN,
}: {
  title: string;
  nextHref?: string;
  nextTitle?: string;
  nextN?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      className="panel beam relative overflow-hidden p-7 text-center"
    >
      <div className="mesh !inset-x-0 !-top-56 !h-72 opacity-40" />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 16 }}
        className="relative mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <motion.path
            d="M20 6 9 17l-5-5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          />
        </svg>
      </motion.div>

      <h3 className="relative mt-4 text-lg font-semibold">Lesson complete</h3>
      <p className="relative mt-1 text-sm text-muted-foreground">
        You now understand <span className="text-foreground">{title}</span>.
      </p>

      {nextHref && (
        <div className="relative mt-6">
          <p className="text-[10px] tracking-[0.1em] text-faint uppercase">Up next</p>
          <Link href={nextHref} className="btn btn-primary mt-2">
            {nextN ? `L${nextN} · ` : ''}
            {nextTitle}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      )}
    </motion.div>
  );
}

/* ================================================================= *
 * Empty states — never a bare "nothing here"
 * ================================================================= */

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="panel px-6 py-10 text-center">
      <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl bg-secondary text-faint">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
        {body}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
