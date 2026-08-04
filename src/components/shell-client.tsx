'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';

import { streakOf, useStore } from '@/lib/store';

/** Mirrors focus-mode into a body attribute so CSS can dim the chrome. */
export function FocusBinder() {
  const { state } = useStore();
  useEffect(() => {
    document.body.dataset.focus = String(state.prefs.focus);
  }, [state.prefs.focus]);
  return null;
}

export function ThemeToggle() {
  const flip = () => {
    const d = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', d);
    try {
      localStorage.setItem('roadmap:theme', d ? 'dark' : 'light');
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={flip}
      aria-label="Toggle theme"
      title="Toggle theme"
      className="icon-btn"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
        <circle cx="12" cy="12" r="4.5" className="hidden dark:block" />
        <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4" className="hidden dark:block" />
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" className="dark:hidden" />
      </svg>
    </button>
  );
}

/** The page-head status pill — the equivalent of a record's OPEN/CLOSED tag. */
export function LessonStatusPill({ n, written }: { n: number; written: boolean }) {
  const { state } = useStore();
  if (!written) return <span className="pill">Queued</span>;
  const done = state.done.includes(n);
  return <span className={`pill ${done ? 'pill-done' : ''}`}>{done ? 'Complete' : 'Open'}</span>;
}

/** Compact status. Progress lives in the sidebar; this is the glanceable copy. */
export function HeaderStatus({ total }: { total: number }) {
  const { state } = useStore();
  const streak = streakOf(state.days);
  const pct = Math.round((state.done.length / total) * 100);

  return (
    <div className="hidden items-center gap-1.5 md:flex">
      {streak > 0 && (
        <span
          className="chip bg-[color-mix(in_srgb,var(--accent)_13%,transparent)] text-[var(--accent)]"
          title={`${streak}-day streak`}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2s5 5.5 5 10a5 5 0 0 1-10 0c0-1.5.6-2.8 1.2-3.8C8.8 9.6 12 7 12 2z" />
          </svg>
          {streak}
        </span>
      )}
      <span className="chip bg-muted text-muted-foreground" title={`${state.done.length} of ${total} complete`}>
        <span className="relative grid h-3.5 w-3.5 place-items-center">
          <svg viewBox="0 0 20 20" className="-rotate-90">
            <circle cx="10" cy="10" r="8" fill="none" stroke="var(--input)" strokeWidth="3.5" />
            <motion.circle
              cx="10" cy="10" r="8" fill="none" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 8}
              animate={{ strokeDashoffset: 2 * Math.PI * 8 * (1 - pct / 100) }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
        </span>
        {pct}%
      </span>
    </div>
  );
}
