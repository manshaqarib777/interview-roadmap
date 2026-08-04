'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { SearchRow } from '@/lib/content';
import { useStore } from '@/lib/store';

type Action = {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: string;
  run: () => void;
  keywords?: string;
};

const RECENTS_KEY = 'roadmap:recent';

export function readRecents(): number[] {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function pushRecent(n: number) {
  try {
    const next = [n, ...readRecents().filter((x) => x !== n)].slice(0, 6);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/** Score a lesson row. Title beats synonyms beats prose. */
function scoreRow(row: SearchRow, q: string) {
  const t = row.title.toLowerCase();
  if (t === q) return 1000;
  if (t.startsWith(q)) return 500;
  if (t.includes(q)) return 300;

  // `terms` already contains synonyms, so "state hook" finds useState.
  const at = row.terms.indexOf(q);
  if (at === -1) {
    // last resort: every word must appear somewhere
    const words = q.split(/\s+/).filter(Boolean);
    if (words.length > 1 && words.every((w) => row.terms.includes(w))) return 60;
    return 0;
  }
  return at < 400 ? 180 : 90;
}

export function CommandPalette({ index }: { index: SearchRow[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { state, setPrefs, reset } = useStore();
  const [recents, setRecents] = useState<number[]>([]);

  useEffect(() => {
    if (open) setRecents(readRecents());
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  const actions: Action[] = useMemo(
    () => [
      { id: 'home', label: 'Go to Dashboard', group: 'Navigate', icon: '⌂', run: () => router.push('/'), keywords: 'home overview stats' },
      { id: 'graph', label: 'Open Knowledge Graph', group: 'Navigate', icon: '◈', run: () => router.push('/graph'), keywords: 'map dependencies nodes tree' },
      { id: 'bookmarks', label: 'Open Bookmarks', group: 'Navigate', icon: '⚑', run: () => router.push('/bookmarks'), keywords: 'saved starred' },
      { id: 'theme', label: 'Toggle theme', group: 'Preferences', icon: '◐', run: () => {
          const d = !document.documentElement.classList.contains('dark');
          document.documentElement.classList.toggle('dark', d);
          try { localStorage.setItem('roadmap:theme', d ? 'dark' : 'light'); } catch {}
        }, keywords: 'dark light appearance' },
      { id: 'focus', label: `${state.prefs.focus ? 'Exit' : 'Enter'} focus mode`, hint: 'F', group: 'Preferences', icon: '◉', run: () => setPrefs({ focus: !state.prefs.focus }), keywords: 'distraction free zen' },
      { id: 'interview', label: `${state.prefs.interview ? 'Exit' : 'Enter'} interview mode`, hint: 'I', group: 'Preferences', icon: '?', run: () => setPrefs({ interview: !state.prefs.interview }), keywords: 'flashcards quiz practice' },
      { id: 'reset', label: 'Reset all progress', group: 'Danger', icon: '⟲', run: () => { if (confirm('Erase all progress, bookmarks and streaks?')) reset(); }, keywords: 'clear delete wipe' },
    ],
    [router, state.prefs.focus, state.prefs.interview, setPrefs, reset],
  );

  type Item = { key: string; group: string; icon: string; label: string; sub?: string; hint?: string; run: () => void };

  const items: Item[] = useMemo(() => {
    const term = q.trim().toLowerCase();

    if (!term) {
      const recentItems: Item[] = recents
        .map((n) => index.find((r) => r.n === n))
        .filter((r): r is SearchRow => Boolean(r))
        .map((r) => ({
          key: `r${r.n}`, group: 'Recent', icon: '↺', label: r.title, sub: r.module,
          run: () => { pushRecent(r.n); router.push(r.href); },
        }));

      const suggested: Item[] = index
        .filter((r) => r.written && !state.done.includes(r.n))
        .slice(0, 4)
        .map((r) => ({
          key: `s${r.n}`, group: 'Suggested', icon: '▸', label: r.title, sub: `${r.module} · asked in ${r.frequency}%`,
          run: () => { pushRecent(r.n); router.push(r.href); },
        }));

      return [
        ...recentItems,
        ...suggested,
        ...actions.map((a) => ({ key: a.id, group: a.group, icon: a.icon, label: a.label, hint: a.hint, run: a.run })),
      ];
    }

    const lessons: Item[] = index
      .map((r) => ({ r, s: scoreRow(r, term) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.r.n - b.r.n)
      .slice(0, 7)
      .map(({ r }) => ({
        key: `l${r.n}`,
        group: 'Lessons',
        icon: r.written ? '▸' : '○',
        label: r.title,
        sub: `${r.module} · L${r.n}${r.written ? '' : ' · not written yet'}`,
        run: () => { pushRecent(r.n); router.push(r.href); },
      }));

    const acts: Item[] = actions
      .filter((a) => (a.label + ' ' + (a.keywords ?? '')).toLowerCase().includes(term))
      .map((a) => ({ key: a.id, group: a.group, icon: a.icon, label: a.label, hint: a.hint, run: a.run }));

    return [...lessons, ...acts];
  }, [q, index, actions, recents, router, state.done]);

  useEffect(() => setCursor(0), [q]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      const typing = t && (/^(INPUT|TEXTAREA)$/.test(t.tagName) || t.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === 'Escape') setOpen(false);
      if (e.key === '/' && !typing && !open) {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
    else setQ('');
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector('[data-cursor="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  const fire = (item: Item) => {
    close();
    // Let the dialog unmount first so navigation feels instant, not stuttery.
    requestAnimationFrame(item.run);
  };

  let lastGroup = '';

  return (
    <>
      {/* The bar belongs to breadcrumbs now, so search is one glyph plus ⌘K. */}
      <button
        onClick={() => setOpen(true)}
        className="icon-btn"
        aria-label="Search lessons and concepts"
        title="Search — ⌘K"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={close}
            className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 p-4 pt-[10vh] backdrop-blur-[3px]"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -4 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="panel w-full max-w-xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b px-4">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0 text-faint">
                  <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" />
                </svg>
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, items.length - 1)); }
                    if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
                    if (e.key === 'Enter' && items[cursor]) { e.preventDefault(); fire(items[cursor]); }
                  }}
                  placeholder="Try “state hook”, “event loop”, “ssr vs ssg”…"
                  className="h-12 flex-1 bg-transparent text-[15px] outline-none placeholder:text-faint"
                />
                <kbd>esc</kbd>
              </div>

              <div ref={listRef} className="scroll-thin max-h-[22rem] overflow-y-auto p-1.5">
                {items.length === 0 && (
                  <div className="px-3 py-10 text-center">
                    <p className="text-sm text-muted-foreground">No match for “{q}”</p>
                    <p className="mt-1 text-xs text-faint">
                      Try a concept instead of a phrase — “closure”, “memo”, “caching”.
                    </p>
                  </div>
                )}

                {items.map((item, i) => {
                  const showGroup = item.group !== lastGroup;
                  lastGroup = item.group;
                  const active = i === cursor;
                  return (
                    <div key={item.key}>
                      {showGroup && (
                        <p className="px-2.5 pt-2.5 pb-1 text-[10px] font-semibold tracking-[0.1em] text-faint uppercase">
                          {item.group}
                        </p>
                      )}
                      <button
                        data-cursor={active}
                        onMouseMove={() => setCursor(i)}
                        onClick={() => fire(item)}
                        className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                          active ? 'bg-secondary' : ''
                        }`}
                      >
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-muted text-[11px] text-muted-foreground">
                          {item.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px]">{item.label}</span>
                          {item.sub && <span className="block truncate text-[11px] text-faint">{item.sub}</span>}
                        </span>
                        {item.hint && <kbd>{item.hint}</kbd>}
                        {active && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-faint">
                            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" />
                          </svg>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 border-t bg-muted px-3 py-2 text-[10.5px] text-faint">
                <span className="flex items-center gap-1"><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
                <span className="flex items-center gap-1"><kbd>↵</kbd> open</span>
                <span className="ml-auto flex items-center gap-1"><kbd>←</kbd><kbd>→</kbd> steps · <kbd>⇧</kbd> lessons</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
