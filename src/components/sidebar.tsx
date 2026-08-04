'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { useEffect, useMemo } from 'react';

import { MODULES, TOTAL_LESSONS, lessonHref } from '@/lib/curriculum';
import { streakOf, useStore } from '@/lib/store';
import { Icon, MODULE_ICON, type IconName } from './icons';
import { Lockup, LogoMark } from './logo';

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/', label: 'Dashboard', icon: 'gauge' },
  { href: '/graph', label: 'Knowledge graph', icon: 'network' },
  { href: '/bookmarks', label: 'Saved', icon: 'bookmark' },
];

/**
 * Full-height navigation rail.
 *
 * Collapsed and drawer states are attributes on <html> (see RailToggle), so
 * this component renders identical markup at every width — the only thing
 * that changes is which parts CSS is showing. That's what lets the rail
 * remember "collapsed" across a reload without a hydration flash.
 */
export function Sidebar({ written }: { written: number[] }) {
  const pathname = usePathname();
  const { state } = useStore();

  const writtenSet = useMemo(() => new Set(written), [written]);
  const done = useMemo(() => new Set(state.done), [state.done]);
  const streak = streakOf(state.days);
  const pct = Math.round((done.size / TOTAL_LESSONS) * 100);

  /* Navigating closes the drawer; on desktop the attribute is unused. */
  useEffect(() => {
    document.documentElement.dataset.drawer = 'closed';
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') document.documentElement.dataset.drawer = 'closed';
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const activeModule = MODULES.find((m) => pathname.includes(`/lessons/${m.slug}/`));
  const badge: Record<string, number> = { '/bookmarks': state.bookmarks.length };

  return (
    <>
      <div
        onClick={() => (document.documentElement.dataset.drawer = 'closed')}
        className="sidebar-scrim no-print lg:hidden"
        aria-hidden
      />

      <aside className="sidebar chrome no-print fixed top-0 bottom-0 left-0 z-50 flex flex-col">
        {/* ---- brand: the rail owns it, so the bar can start with nav ---- *
         * The lockup already carries the name and the tagline, so there is no
         * text beside it — a wordmark next to a wordmark reads as a mistake.
         * Collapsed, it falls back to the square mark. */}
        <div className="rail-pad flex h-[86px] shrink-0 items-center px-4">
          <Link href="/" aria-label={`Interview Roadmap — ${TOTAL_LESSONS} concepts`} className="min-w-0">
            <span className="rail-full">
              {/* 232px is the rail's 280 minus its 24px gutters — the lockup
                  fills the width it has rather than floating in it. */}
              <Lockup width={232} />
            </span>
            <span className="rail-mini">
              <LogoMark size={36} />
            </span>
          </Link>
        </div>

        {/* ---- progress ------------------------------------------------ *
         * A ring holding "0" beside the text "0 of 104" said the same thing
         * twice and had nothing to show at zero. A bar carries the number
         * once, reads at a glance, and its empty state is still legible.
         * The ring survives for the collapsed rail, where 64px is all there
         * is and a bar would be a dash. */}
        <div className="rail-pad px-4 pb-3">
          <Link
            href="/"
            title={`${done.size} of ${TOTAL_LESSONS} lessons complete`}
            className="block rounded-xl p-2.5 transition-colors"
          >
            <div className="rail-full">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-semibold tracking-[0.07em] text-faint uppercase">
                  Progress
                </span>
                <span className="num text-[13px] font-semibold">{pct}%</span>
              </div>

              <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="truncate text-[11.5px] text-faint">
                  <span className="num text-muted-foreground">{done.size}</span> of{' '}
                  <span className="num">{TOTAL_LESSONS}</span>
                  {done.size > 0 && ` · ${TOTAL_LESSONS - done.size} to go`}
                </span>
                {streak > 0 && (
                  <span className="chip shrink-0 bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                    <Icon name="flame" size={11} />
                    {streak}
                  </span>
                )}
              </div>
            </div>

            <div className="rail-mini">
              <Ring pct={pct} />
            </div>
          </Link>
        </div>

        {/* ---- primary nav --------------------------------------------- */}
        <nav className="rail-pad space-y-0.5 px-4">
          {NAV.map((n) => {
            const count = badge[n.href] ?? 0;
            return (
              <Link
                key={n.href}
                href={n.href}
                title={n.label}
                data-active={pathname === n.href}
                className="side-row relative"
              >
                <Icon name={n.icon} size={15} />
                <span className="rail-label flex-1 truncate">{n.label}</span>
                {count > 0 && (
                  <>
                    <span className="rail-badge rail-label">{count}</span>
                    <span className="rail-dot" />
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mx-4 my-3.5 h-px bg-[color-mix(in_srgb,var(--foreground)_7%,transparent)]" />

        <p className="side-label rail-label mb-1.5 px-8">Curriculum</p>

        {/* ---- module tree --------------------------------------------- */}
        <div className="rail-scroll rail-pad scroll-thin min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-0.5">
            {MODULES.map((mod) => {
              const isActive = activeModule?.slug === mod.slug;
              const modDone = mod.lessons.filter((l) => done.has(l.n)).length;

              return (
                <details key={mod.slug} open={isActive} className={`acc-${mod.accent} group`}>
                  <summary
                    title={mod.title}
                    className="side-row cursor-pointer list-none font-medium text-foreground"
                  >
                    <span className="side-tile">
                      <Icon name={MODULE_ICON[mod.slug]} size={13} />
                    </span>
                    <span className="rail-label flex-1 truncate">{mod.short}</span>
                    <span className="rail-label text-[11px] text-faint tabular-nums">
                      {modDone}/{mod.lessons.length}
                    </span>
                    <Icon
                      name="chevronRight"
                      size={13}
                      className="rail-label shrink-0 text-faint transition-transform duration-200 group-open:rotate-90"
                    />
                  </summary>

                  <ul className="side-nest rail-label mt-1 mb-1 space-y-0.5">
                    {mod.lessons.map((l) => {
                      const href = lessonHref(mod.slug, l.file);
                      const current = pathname === href;
                      const isWritten = writtenSet.has(l.n);
                      const isDone = done.has(l.n);
                      const partial = (state.steps[l.n]?.length ?? 0) > 0 && !isDone;

                      return (
                        <li key={l.n}>
                          <Link
                            href={href}
                            prefetch={isWritten ? undefined : false}
                            aria-current={current ? 'page' : undefined}
                            data-active={current}
                            className={`side-row py-[6px] text-[13px] ${isWritten ? '' : 'text-faint'}`}
                          >
                            <span className="grid w-3.5 shrink-0 place-items-center">
                              {isDone ? (
                                <Icon name="check" size={11} className="text-[var(--success)]" strokeWidth={3} />
                              ) : partial ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-[var(--acc)]" />
                              ) : (
                                <span className="h-1 w-1 rounded-full bg-[var(--input)]" />
                              )}
                            </span>
                            <span className="flex-1 truncate">{l.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              );
            })}
          </div>
        </div>

        <div className="side-foot rail-center flex items-center gap-2 px-5 py-3">
          <span className="rail-label flex-1 text-[11.5px] text-faint">
            <kbd>⌘K</kbd> to search
          </span>
          <span className="text-[11px] text-faint tabular-nums">{pct}%</span>
        </div>
      </aside>
    </>
  );
}

/** Collapsed-rail progress: a ring with the percentage, green like every other
    progress indicator in the palette. */
function Ring({ pct }: { pct: number }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-9 w-9 shrink-0 place-items-center">
      <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--muted)" strokeWidth="3.5" />
        <motion.circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct / 100) }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <span className="num text-[9.5px] font-semibold">{pct}</span>
    </div>
  );
}
