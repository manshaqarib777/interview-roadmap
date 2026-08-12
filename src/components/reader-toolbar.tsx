'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

import { useStore } from '@/lib/store';

/**
 * Reader actions.
 *
 * This used to float against the right edge of the viewport. Now that the page
 * has a real rail, the tools sit at the top of it as a single row — one right
 * edge instead of two competing for the same gutter.
 */
export function ReaderToolbar({
  n,
  variant = 'lesson',
}: {
  n: number;
  /** Topics are reference pages — no progress, so no done/bookmark tools */
  variant?: 'lesson' | 'topic';
}) {
  const { state, toggleBookmark, toggleDone, setPrefs } = useStore();
  const [panel, setPanel] = useState<'type' | null>(null);

  const bookmarked = state.bookmarks.includes(n);
  const done = state.done.includes(n);
  const { prefs } = state;

  return (
    <div className="chrome no-print relative">
      <div className="rail-card flex items-center gap-0.5 p-1.5">
        {variant === 'lesson' && (
          <>
            <Tool
              label={done ? 'Completed' : 'Mark complete'}
              active={done}
              activeColor="var(--success)"
              onClick={() => toggleDone(n)}
            >
              <path d="M20 6 9 17l-5-5" />
            </Tool>

            <Tool
              label={bookmarked ? 'Saved' : 'Bookmark'}
              active={bookmarked}
              activeColor="var(--warning)"
              fill={bookmarked}
              onClick={() => toggleBookmark(n)}
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </Tool>
          </>
        )}

        <Tool
          label="Interview mode  (i)"
          active={prefs.interview}
          activeColor="var(--primary)"
          onClick={() => setPrefs({ interview: !prefs.interview })}
        >
          <path d="M9.1 9a3 3 0 1 1 4.5 2.6c-.9.5-1.6 1.3-1.6 2.4" />
          <path d="M12 17h.01" />
          <circle cx="12" cy="12" r="9" />
        </Tool>

        <Tool
          label="Focus mode  (f)"
          active={prefs.focus}
          activeColor="var(--primary)"
          onClick={() => setPrefs({ focus: !prefs.focus })}
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        </Tool>

        <Tool
          label="Text settings"
          active={panel === 'type'}
          activeColor="var(--primary)"
          onClick={() => setPanel(panel === 'type' ? null : 'type')}
        >
          <path d="M4 7V4h16v3M9 20h6M12 4v16" />
        </Tool>

        <div className="mx-0.5 h-5 w-px bg-border" />

        <Link
          href="/graph"
          title="Knowledge graph"
          className="grid h-8 w-8 place-items-center rounded-lg text-faint transition-colors hover:bg-secondary hover:text-foreground"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            <circle cx="12" cy="5" r="2.5" />
            <circle cx="5" cy="18" r="2.5" />
            <circle cx="19" cy="18" r="2.5" />
            <path d="m10.5 7-4 8.5M13.5 7l4 8.5M7.5 18h9" />
          </svg>
        </Link>
      </div>

      <AnimatePresence>
        {panel === 'type' && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="panel glass absolute top-[calc(100%+6px)] right-0 z-30 w-56 space-y-4 p-4"
          >
            <Slider
              label="Text size"
              value={prefs.size}
              min={15}
              max={21}
              step={1}
              suffix="px"
              onChange={(size) => setPrefs({ size })}
            />
            <Slider
              label="Line height"
              value={prefs.leading}
              min={1.5}
              max={2.1}
              step={0.1}
              onChange={(leading) => setPrefs({ leading })}
            />
            <Slider
              label="Column width"
              value={prefs.width}
              min={38}
              max={62}
              step={2}
              suffix="rem"
              onChange={(width) => setPrefs({ width })}
            />
            <button
              onClick={() => setPrefs({ size: 17, leading: 1.7, width: 46 })}
              className="btn btn-ghost w-full text-xs"
            >
              Reset to defaults
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Tool({
  label,
  active,
  activeColor,
  fill,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  activeColor: string;
  fill?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className="group relative grid h-8 w-8 place-items-center rounded-lg transition-all duration-150 hover:bg-secondary active:scale-90"
      style={{ color: active ? activeColor : 'var(--faint)' }}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill={fill ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
      <span className="pointer-events-none absolute right-10 whitespace-nowrap rounded-md border bg-card px-2 py-1 text-[11px] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
        {label}
        <span className="num text-faint">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-input accent-primary"
        style={{ accentColor: 'var(--primary)' }}
      />
    </label>
  );
}
