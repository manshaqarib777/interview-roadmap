'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';

import { BY_N, MODULES, hrefOf } from '@/lib/curriculum';
import { useStore } from '@/lib/store';
import { EmptyState } from '@/components/lesson-parts';
import { MetaRow, RailCard } from '@/components/rail';

/** The rail mirrors the dashboard's: what's in the list, broken down. */
export function BookmarksRail({ written }: { written: number[] }) {
  const { state } = useStore();
  const writtenSet = new Set(written);
  const saved = state.bookmarks.map((n) => BY_N.get(n)).filter(Boolean);

  const doneCount = saved.filter((l) => l && state.done.includes(l.n)).length;
  const readyCount = saved.filter((l) => l && writtenSet.has(l.n)).length;
  const avgFrequency = saved.length
    ? Math.round(saved.reduce((a, l) => a + (l?.frequency ?? 0), 0) / saved.length)
    : 0;

  const byModule = MODULES.map((m) => ({
    mod: m,
    count: saved.filter((l) => l?.module.slug === m.slug).length,
  })).filter((r) => r.count > 0);

  return (
    <>
      <RailCard title="General">
        <MetaRow label="Saved">
          <span className="num">{saved.length}</span>
        </MetaRow>
        <MetaRow label="Available">
          <span className="num">{readyCount}</span>
          <span className="text-faint"> written</span>
        </MetaRow>
        <MetaRow label="Completed">
          <span className="num">{doneCount}</span>
        </MetaRow>
        <MetaRow label="Avg. frequency">
          {saved.length ? <span className="num">asked in {avgFrequency}%</span> : <span className="text-faint">—</span>}
        </MetaRow>
      </RailCard>

      <RailCard title="By module">
        {byModule.length === 0 ? (
          <p className="text-[12.5px] leading-relaxed text-faint">
            Nothing saved yet, so there's nothing to break down.
          </p>
        ) : (
          byModule.map(({ mod, count }) => (
            <div key={mod.slug} className={`acc-${mod.accent} meta-row`}>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--acc)]" />
                <span className="text-muted-foreground">{mod.short}</span>
              </span>
              <span className="num meta-val">{count}</span>
            </div>
          ))
        )}
      </RailCard>
    </>
  );
}

export function BookmarkList({ written }: { written: number[] }) {
  const { state, toggleBookmark } = useStore();
  const writtenSet = new Set(written);
  const items = state.bookmarks.map((n) => BY_N.get(n)).filter(Boolean);

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nothing saved yet"
        body="Bookmark a lesson from the toolbar while reading, and it lands here. Build a shortlist of the concepts you keep having to look up — that list is your revision plan."
        action={
          <Link href="/" className="btn btn-primary">
            Find something to read
          </Link>
        }
      />
    );
  }

  return (
    <ul className="space-y-2">
      <AnimatePresence initial={false}>
        {items.map((l) => {
          if (!l) return null;
          const done = state.done.includes(l.n);
          return (
            <motion.li
              key={l.n}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -12, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={`panel acc-${l.module.accent} group flex items-center gap-3 overflow-hidden p-3.5`}
            >
              <span className="h-8 w-1 shrink-0 rounded-full bg-[var(--acc)]" />
              <Link href={hrefOf(l)} className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium">{l.title}</span>
                <span className="block truncate text-[11.5px] text-faint">
                  {l.module.short} · L{l.n} · asked in {l.frequency}% of interviews
                  {!writtenSet.has(l.n) && ' · not written yet'}
                </span>
              </Link>
              {done && (
                <span className="shrink-0 rounded-md bg-success/12 px-2 py-0.5 text-[10.5px] text-success">
                  done
                </span>
              )}
              <button
                onClick={() => toggleBookmark(l.n)}
                aria-label={`Remove ${l.title} from saved`}
                className="shrink-0 rounded-lg p-1.5 text-faint opacity-0 transition-all group-hover:opacity-100 hover:bg-secondary hover:text-destructive focus-visible:opacity-100"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
