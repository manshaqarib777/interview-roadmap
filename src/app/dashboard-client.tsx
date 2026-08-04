'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';

import { BY_N, LESSON_INDEX, MODULES, TOTAL_LESSONS, hrefOf } from '@/lib/curriculum';
import { achievementsOf, streakOf, useStore } from '@/lib/store';
import { readRecents } from '@/components/command-palette';
import { Icon, MODULE_ICON } from '@/components/icons';
import { MetaRow, RailCard } from '@/components/rail';

/* ================================================================= *
 * Continue — the single most important element on the page
 * ================================================================= */

export function ContinueCard({ written }: { written: number[] }) {
  const { state } = useStore();
  const writtenSet = useMemo(() => new Set(written), [written]);
  const done = useMemo(() => new Set(state.done), [state.done]);

  // Where you actually were, else the first unfinished written lesson.
  const resume = state.lastLesson && !done.has(state.lastLesson.n)
    ? BY_N.get(state.lastLesson.n)
    : undefined;
  const target =
    resume ??
    LESSON_INDEX.find((l) => writtenSet.has(l.n) && !done.has(l.n)) ??
    LESSON_INDEX[0];

  const steps = state.steps[target.n]?.length ?? 0;
  const pct = steps > 0 ? Math.min(95, steps * 12) : 0;
  const isResume = Boolean(resume) || steps > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`panel float beam spot acc-${target.module.accent} relative overflow-hidden`}
    >
      <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-[var(--acc)] opacity-[0.07] blur-3xl" />

      <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <span className="tile h-11 w-11 self-start"><Icon name={MODULE_ICON[target.module.slug]} size={20} /></span>

        <div className="min-w-0 flex-1">
          <p className="eyebrow flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--acc)]" />
            {isResume ? 'Pick up where you left off' : 'Start here'}
          </p>

          <h2 className="mt-2 text-2xl leading-tight font-semibold tracking-tight">
            {target.title}
          </h2>

          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{target.why}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-faint">
            <span>{target.module.short}</span>
            <span>·</span>
            <span className="num">Lesson {target.n}</span>
            <span>·</span>
            <span>~{6 + target.difficulty * 2} min</span>
            {pct > 0 && (
              <>
                <span>·</span>
                <span className="text-[var(--acc)]">{pct}% through</span>
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Ring value={done.size} total={TOTAL_LESSONS} />
          <Link href={hrefOf(target)} className="btn btn-primary glow-ring h-11 px-5">
            {isResume ? 'Resume' : 'Begin'}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function Ring({ value, total }: { value: number; total: number }) {
  const pct = total ? value / total : 0;
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative hidden h-14 w-14 sm:block" title={`${value} of ${total} complete`}>
      <svg viewBox="0 0 56 56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="var(--secondary)" strokeWidth="4" />
        <motion.circle
          cx="28" cy="28" r={r} fill="none" stroke="var(--acc)" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </svg>
      <span className="num absolute inset-0 grid place-items-center text-[11px] font-semibold">
        {Math.round(pct * 100)}%
      </span>
    </div>
  );
}

/* ================================================================= *
 * Stats
 * ================================================================= */

export function StatsRow({ writtenCount }: { writtenCount: number }) {
  const { state } = useStore();
  const streak = streakOf(state.days);
  const stepsRead = Object.values(state.steps).reduce((a, s) => a + s.length, 0);

  const stats = [
    { icon: 'checkCircle', label: 'Lessons done', value: String(state.done.length), sub: `of ${TOTAL_LESSONS}` },
    { icon: 'flame', label: 'Day streak', value: String(streak), sub: streak === 0 ? 'start today' : 'keep going' },
    { icon: 'layers', label: 'Steps read', value: String(stepsRead), sub: '~2 min each' },
    { icon: 'bookmark', label: 'Saved', value: String(state.bookmarks.length), sub: 'bookmarks' },
    { icon: 'book', label: 'Available', value: String(writtenCount), sub: 'written so far' },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 2xl:grid-cols-5">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i, duration: 0.35 }}
          className="panel float lift spot p-3.5"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="eyebrow">{s.label}</p>
            <span className="tile h-6 w-6"><Icon name={s.icon} size={12} /></span>
          </div>
          <p className="num mt-1 text-2xl font-semibold tracking-tight">{s.value}</p>
          <p className="text-[10.5px] text-faint">{s.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ================================================================= *
 * Module cards
 * ================================================================= */

export function ModuleGrid({ written }: { written: number[] }) {
  const { state } = useStore();
  const writtenSet = useMemo(() => new Set(written), [written]);
  const done = useMemo(() => new Set(state.done), [state.done]);

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {MODULES.map((mod, i) => {
        const total = mod.lessons.length;
        const complete = mod.lessons.filter((l) => done.has(l.n)).length;
        const availableCount = mod.lessons.filter((l) => writtenSet.has(l.n)).length;
        const pct = (complete / total) * 100;
        const nextUp =
          mod.lessons.find((l) => writtenSet.has(l.n) && !done.has(l.n)) ?? mod.lessons[0];

        return (
          <motion.div
            key={mod.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={`/lessons/${mod.slug}/${nextUp.file}`}
              className={`panel float lift spot acc-${mod.accent} group block h-full overflow-hidden`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-[10px] tracking-[0.1em] text-faint uppercase">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--acc)]" />
                      Module {mod.num}
                    </p>
                    <h3 className="mt-1.5 text-lg font-semibold tracking-tight">{mod.title}</h3>
                  </div>
                  <span className="num shrink-0 rounded-lg bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                    {complete}/{total}
                  </span>
                </div>

                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{mod.blurb}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {mod.milestones.map((ms) => {
                    const inRange = mod.lessons.filter((l) => l.n >= ms.range[0] && l.n <= ms.range[1]);
                    const msDone = inRange.filter((l) => done.has(l.n)).length;
                    const complete = msDone === inRange.length;
                    return (
                      <span
                        key={ms.id}
                        title={ms.claimWhen}
                        className={`rounded-md border px-2 py-0.5 text-[10.5px] transition-colors ${
                          complete
                            ? 'border-[var(--acc)] text-[var(--acc)]'
                            : 'text-faint'
                        }`}
                      >
                        {ms.id} · {ms.title}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="h-1 w-full bg-secondary">
                <motion.div
                  className="h-full bg-[var(--acc)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                />
              </div>

              <div className="flex items-center justify-between border-t bg-muted px-5 py-2.5 text-[11.5px]">
                <span className="text-faint">
                  {availableCount === 0 ? 'Lessons queued' : `${availableCount} available`}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground transition-transform group-hover:translate-x-0.5">
                  {complete === 0 ? 'Start' : complete === total ? 'Review' : 'Continue'}
                  <Icon name="arrowRight" size={13} />
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ================================================================= *
 * Right rail — the same General / Activity pair every page uses
 * ================================================================= */

export function DashboardRail({ writtenCount }: { writtenCount: number }) {
  const { state } = useStore();
  const streak = streakOf(state.days);
  const done = state.done.length;

  /* Recents live in localStorage, written by the command palette. Read after
     mount so the server and client first paints agree. */
  const [recent, setRecent] = useState<number[]>([]);
  useEffect(() => setRecent(readRecents()), [state.lastLesson]);

  const items = recent.map((n) => BY_N.get(n)).filter(Boolean).slice(0, 6);

  return (
    <>
      <RailCard title="General">
        <MetaRow label="Modules">{MODULES.length}</MetaRow>
        <MetaRow label="Concepts">
          <span className="num">{TOTAL_LESSONS}</span>
        </MetaRow>
        <MetaRow label="Written">
          <span className="num">{writtenCount}</span>
          <span className="text-faint"> of {TOTAL_LESSONS}</span>
        </MetaRow>
        <MetaRow label="Completed">
          <span className="num">{done}</span>
          <span className="text-faint"> · {Math.round((done / TOTAL_LESSONS) * 100)}%</span>
        </MetaRow>
        <MetaRow label="Day streak">
          <span className="num">{streak}</span>
        </MetaRow>
        <MetaRow label="Saved">
          <span className="num">{state.bookmarks.length}</span>
        </MetaRow>
      </RailCard>

      <RailCard
        title="Activity"
        action={
          items.length > 0 ? <span className="num text-[11px] text-faint">{items.length}</span> : undefined
        }
      >
        {items.length === 0 ? (
          <p className="text-[12.5px] leading-relaxed text-faint">
            Nothing opened yet. Lessons you visit show up here, most recent first.
          </p>
        ) : (
          <ul className="mt-1 space-y-0.5">
            {items.map((l) => {
              if (!l) return null;
              const isDone = state.done.includes(l.n);
              return (
                <li key={l.n}>
                  <Link
                    href={hrefOf(l)}
                    className={`acc-${l.module.accent} flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted`}
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--acc)]" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px]">{l.title}</span>
                      <span className="block truncate text-[10.5px] text-faint">
                        {l.module.short} · L{l.n}
                      </span>
                    </span>
                    {isDone && (
                      <Icon name="check" size={12} className="shrink-0 text-[var(--success)]" strokeWidth={3} />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </RailCard>
    </>
  );
}

/* ================================================================= *
 * Achievements
 * ================================================================= */

export function Achievements() {
  const { state } = useStore();
  const done = useMemo(() => new Set(state.done), [state.done]);

  const moduleDone = Object.fromEntries(
    MODULES.map((m) => [m.slug, m.lessons.every((l) => done.has(l.n))]),
  );
  const list = achievementsOf(state, moduleDone);
  const earned = list.filter((a) => a.earned).length;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold tracking-tight">Achievements</h2>
        <span className="num text-[11px] text-faint">
          {earned}/{list.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {list.map((a) => (
          <div
            key={a.id}
            title={a.hint}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[12px] transition-all ${
              a.earned
                ? 'border-primary/40 bg-primary/8 text-foreground'
                : 'border-dashed text-faint'
            }`}
          >
            <span className={a.earned ? 'text-primary' : 'opacity-40'}>
              <Icon name={a.earned ? 'trophy' : 'lock'} size={12} />
            </span>
            {a.label}
          </div>
        ))}
      </div>
    </div>
  );
}
