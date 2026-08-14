'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { GraphNode } from '@/lib/content';
import { DIFFICULTY_LABEL } from '@/lib/curriculum';
import { useStore } from '@/lib/store';

/**
 * Dependency map of the whole curriculum.
 *
 * Layout is a layered DAG, not a force simulation: nodes are placed by
 * prerequisite depth (longest path from a root), so left-to-right reads as
 * "what you must know before what". That is deterministic — the map looks the
 * same every visit, which matters if you're using it to orient yourself — and
 * it costs one pass instead of hundreds of simulation ticks.
 */

/* Module hues come from the theme tokens (globals.css) rather than literals,
   so the canvas follows the light/dark switch instead of fighting it. */
const ACCENT: Record<string, string> = {
  amber: 'var(--acc-amber)',
  sky: 'var(--acc-sky)',
  cyan: 'var(--acc-cyan)',
  violet: 'var(--acc-violet)',
  emerald: 'var(--acc-emerald)',
  red: 'var(--acc-red)',
  lime: 'var(--acc-lime)',
  teal: 'var(--acc-teal)',
  indigo: 'var(--acc-indigo)',
  fuchsia: 'var(--acc-fuchsia)',
  orange: 'var(--acc-orange)',
  pink: 'var(--acc-pink)',
  slate: 'var(--acc-slate)',
  blue: 'var(--acc-blue)',
  green: 'var(--acc-green)',
  purple: 'var(--acc-purple)',
  rose: 'var(--acc-rose)',
  copper: 'var(--acc-copper)',
  steel: 'var(--acc-steel)',
};

/** var() can't take a hex alpha suffix — mix instead. */
const fade = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

const COL_W = 230;
const ROW_H = 44;
const PAD = 70;

type Placed = GraphNode & { x: number; y: number; depth: number };

function layout(nodes: GraphNode[]): { placed: Placed[]; width: number; height: number } {
  const byN = new Map(nodes.map((n) => [n.n, n]));
  const depthCache = new Map<number, number>();

  const depthOf = (n: number, seen = new Set<number>()): number => {
    if (depthCache.has(n)) return depthCache.get(n)!;
    if (seen.has(n)) return 0; // defensive: cycles would break the layering
    seen.add(n);
    const node = byN.get(n);
    const d = !node || node.prereqs.length === 0
      ? 0
      : 1 + Math.max(...node.prereqs.map((p) => depthOf(p, seen)));
    depthCache.set(n, d);
    return d;
  };

  const columns = new Map<number, GraphNode[]>();
  for (const n of nodes) {
    const d = depthOf(n.n);
    if (!columns.has(d)) columns.set(d, []);
    columns.get(d)!.push(n);
  }

  const maxRows = Math.max(...[...columns.values()].map((c) => c.length));
  const height = maxRows * ROW_H + PAD * 2;
  const depths = [...columns.keys()].sort((a, b) => a - b);

  const placed: Placed[] = [];
  for (const d of depths) {
    const col = columns.get(d)!.sort((a, b) => a.moduleNum - b.moduleNum || a.n - b.n);
    // Centre each column vertically so the graph reads as a spine.
    const offset = (maxRows - col.length) / 2;
    col.forEach((n, i) => {
      placed.push({ ...n, depth: d, x: PAD + d * COL_W, y: PAD + (offset + i) * ROW_H });
    });
  }

  return { placed, width: depths.length * COL_W + PAD * 2, height };
}

export function KnowledgeGraph({ nodes }: { nodes: GraphNode[] }) {
  const { state } = useStore();
  const done = useMemo(() => new Set(state.done), [state.done]);

  const { placed, width, height } = useMemo(() => layout(nodes), [nodes]);
  const pos = useMemo(() => new Map(placed.map((n) => [n.n, n])), [placed]);

  const [hover, setHover] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const dragging = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  /* Fit the graph to the viewport on mount ----------------------- */
  const fit = useCallback(() => {
    const el = shellRef.current;
    if (!el) return;
    const k = Math.min(el.clientWidth / width, el.clientHeight / height, 1);
    setView({ x: (el.clientWidth - width * k) / 2, y: (el.clientHeight - height * k) / 2, k });
  }, [width, height]);

  useEffect(() => {
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [fit]);

  /* focus = the node under the cursor, or the selected one -------- */
  const focus = hover ?? selected;
  const related = useMemo(() => {
    if (focus === null) return null;
    const n = pos.get(focus);
    if (!n) return null;
    return new Set<number>([focus, ...n.prereqs, ...n.unlocks]);
  }, [focus, pos]);

  const matches = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return null;
    return new Set(placed.filter((n) => n.title.toLowerCase().includes(term)).map((n) => n.n));
  }, [q, placed]);

  const edges = useMemo(
    () =>
      placed.flatMap((n) =>
        n.prereqs
          .map((p) => pos.get(p))
          .filter((s): s is Placed => Boolean(s))
          .map((s) => ({ from: s, to: n, key: `${s.n}-${n.n}` })),
      ),
    [placed, pos],
  );

  /* pan + zoom ---------------------------------------------------- */
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = shellRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setView((v) => {
      const k = Math.min(2.2, Math.max(0.25, v.k * (e.deltaY < 0 ? 1.12 : 0.89)));
      const ratio = k / v.k;
      return { k, x: mx - (mx - v.x) * ratio, y: my - (my - v.y) * ratio };
    });
  };

  const isDim = (n: Placed) =>
    (filter !== null && n.module !== filter) ||
    (related !== null && !related.has(n.n)) ||
    (matches !== null && !matches.has(n.n));

  const sel = selected !== null ? pos.get(selected) : null;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* ---- controls ------------------------------------------- */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5">
        <div className="panel glass flex items-center gap-1 p-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter nodes…"
            className="h-7 w-36 bg-transparent px-2 text-xs outline-none placeholder:text-faint"
          />
          {q && (
            <button onClick={() => setQ('')} className="px-1.5 text-xs text-faint hover:text-foreground">
              ✕
            </button>
          )}
        </div>

        <div className="panel glass flex gap-0.5 p-1">
          {Object.entries(ACCENT).map(([acc, hex]) => {
            const mod = placed.find((n) => n.accent === acc)?.module;
            if (!mod) return null;
            const on = filter === mod;
            return (
              <button
                key={acc}
                onClick={() => setFilter(on ? null : mod)}
                title={mod}
                className={`h-6 rounded-md px-2 text-[11px] font-medium capitalize transition-all ${
                  on ? 'text-foreground' : 'text-faint hover:text-muted-foreground'
                }`}
                style={on ? { background: fade(hex, 13), boxShadow: `inset 0 0 0 1px ${fade(hex, 33)}` } : undefined}
              >
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: hex }} />
                {mod === 'interview-prep' ? 'interview' : mod}
              </button>
            );
          })}
        </div>
      </div>

      <div className="absolute top-3 right-3 z-20 flex gap-1.5">
        <div className="panel glass flex items-center gap-0.5 p-1">
          <button onClick={() => setView((v) => ({ ...v, k: Math.max(0.25, v.k * 0.85) }))} className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary" title="Zoom out">−</button>
          <span className="num w-10 text-center text-[11px] text-faint">{Math.round(view.k * 100)}%</span>
          <button onClick={() => setView((v) => ({ ...v, k: Math.min(2.2, v.k * 1.18) }))} className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary" title="Zoom in">+</button>
          <div className="mx-0.5 h-4 w-px bg-border" />
          <button onClick={fit} className="rounded-md px-2 text-[11px] text-muted-foreground hover:bg-secondary" title="Fit to screen">Fit</button>
        </div>
      </div>

      {/* ---- canvas --------------------------------------------- */}
      <div
        ref={shellRef}
        onWheel={onWheel}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('[data-node]')) return;
          dragging.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = dragging.current;
          if (!d) return;
          setView((v) => ({ ...v, x: d.vx + (e.clientX - d.x), y: d.vy + (e.clientY - d.y) }));
        }}
        onPointerUp={() => (dragging.current = null)}
        className="grid-bg scan relative h-full w-full cursor-grab active:cursor-grabbing"
      >
        <svg width="100%" height="100%" className="touch-none select-none">
          <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
            {/* edges */}
            <g>
              {edges.map(({ from, to, key }) => {
                const active =
                  related !== null && related.has(from.n) && related.has(to.n);
                const dim = related !== null && !active;
                const mx = (from.x + to.x) / 2;
                return (
                  <path
                    key={key}
                    d={`M${from.x + 6},${from.y} C${mx},${from.y} ${mx},${to.y} ${to.x - 6},${to.y}`}
                    fill="none"
                    stroke={active ? ACCENT[to.accent] : 'var(--input)'}
                    strokeWidth={active ? 1.6 : 0.9}
                    opacity={dim ? 0.12 : active ? 0.85 : 0.35}
                    style={{ transition: 'opacity .18s, stroke .18s, stroke-width .18s' }}
                  />
                );
              })}
            </g>

            {/* nodes */}
            {placed.map((n) => {
              const hex = ACCENT[n.accent];
              const isDone = done.has(n.n);
              const dim = isDim(n);
              const isFocus = focus === n.n;
              const ready = n.prereqs.every((p) => done.has(p));

              return (
                <g
                  key={n.n}
                  data-node
                  transform={`translate(${n.x},${n.y})`}
                  opacity={dim ? 0.16 : 1}
                  style={{ transition: 'opacity .18s', cursor: 'pointer' }}
                  onPointerEnter={() => setHover(n.n)}
                  onPointerLeave={() => setHover(null)}
                  onClick={() => setSelected(n.n === selected ? null : n.n)}
                >
                  {/* ready-to-learn halo */}
                  {ready && !isDone && n.written && (
                    <circle r="11" fill="none" stroke={hex} strokeWidth="1" opacity="0.45">
                      <animate attributeName="r" values="8;13;8" dur="2.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.45;0;0.45" dur="2.6s" repeatCount="indefinite" />
                    </circle>
                  )}

                  <circle
                    r={isFocus ? 8 : 6}
                    fill={isDone ? hex : 'var(--card)'}
                    stroke={hex}
                    strokeWidth={isDone ? 0 : 1.6}
                    strokeDasharray={n.written ? undefined : '2.5 2.5'}
                    style={{
                      transition: 'r .18s cubic-bezier(.34,1.56,.64,1), fill .3s',
                      filter: isFocus || isDone ? `drop-shadow(0 0 7px ${fade(hex, 56)})` : undefined,
                    }}
                  />

                  {isDone && (
                    <path
                      d="M-2.6 0 L-0.7 2 L2.8 -2"
                      fill="none"
                      stroke="var(--background)"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  <text
                    x="13"
                    y="3.5"
                    fontSize="10.5"
                    fill={isFocus ? 'var(--foreground)' : 'var(--muted-foreground)'}
                    style={{ transition: 'fill .18s', pointerEvents: 'none' }}
                  >
                    {n.title.length > 26 ? `${n.title.slice(0, 25)}…` : n.title}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* ---- legend --------------------------------------------- */}
      <div className="panel glass absolute bottom-3 left-3 z-20 flex items-center gap-3 px-3 py-2 text-[11px] text-faint">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> completed</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full border border-primary" /> available</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full border border-dashed border-faint" /> not written</span>
        <span className="hidden sm:inline">· drag to pan, scroll to zoom</span>
      </div>

      {/* ---- detail panel --------------------------------------- */}
      <AnimatePresence>
        {sel && (
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="panel glass absolute top-16 right-3 bottom-3 z-20 w-[19rem] overflow-y-auto scroll-thin p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className="rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold"
                style={{ background: fade(ACCENT[sel.accent], 12), color: ACCENT[sel.accent] }}
              >
                L{sel.n}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="text-faint transition-colors hover:text-foreground"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <h3 className="mt-2 text-base leading-snug font-semibold">{sel.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{sel.why}</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <MiniStat label="Difficulty" value={DIFFICULTY_LABEL[sel.difficulty]} />
              <MiniStat label="Asked in" value={`${sel.frequency}%`} />
            </div>

            <NodeList title="Requires" ns={sel.prereqs} pos={pos} done={done} />
            <NodeList title="Unlocks" ns={sel.unlocks} pos={pos} done={done} />

            <div className="sticky bottom-0 mt-5 bg-gradient-to-t from-card via-card pt-3">
              {sel.written ? (
                <Link href={sel.href} className="btn btn-primary w-full">
                  {done.has(sel.n) ? 'Review lesson' : 'Start lesson'}
                </Link>
              ) : (
                <p className="rounded-lg border border-dashed px-3 py-2.5 text-center text-[11px] text-faint">
                  Not written yet
                </p>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-2">
      <p className="text-[9.5px] tracking-wider text-faint uppercase">{label}</p>
      <p className="mt-0.5 text-xs font-semibold">{value}</p>
    </div>
  );
}

function NodeList({
  title,
  ns,
  pos,
  done,
}: {
  title: string;
  ns: number[];
  pos: Map<number, Placed>;
  done: Set<number>;
}) {
  if (ns.length === 0) return null;
  return (
    <div className="mt-4">
      <p className="mb-1.5 text-[9.5px] tracking-wider text-faint uppercase">{title}</p>
      <div className="space-y-1">
        {ns.map((n) => {
          const node = pos.get(n);
          if (!node) return null;
          return (
            <Link
              key={n}
              href={node.href}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{
                  background: done.has(n) ? ACCENT[node.accent] : 'transparent',
                  boxShadow: `inset 0 0 0 1px ${ACCENT[node.accent]}`,
                }}
              />
              <span className="truncate">{node.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
