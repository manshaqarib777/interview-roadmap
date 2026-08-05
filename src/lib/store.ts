'use client';

import { useCallback, useSyncExternalStore } from 'react';

import { TOTAL_LESSONS } from './curriculum';

/**
 * One tiny external store for all learner state.
 *
 * useSyncExternalStore rather than context + useState: every subscriber sees
 * the same snapshot, tabs stay in sync via the `storage` event, and the
 * explicit server snapshot makes hydration mismatches impossible.
 */

/**
 * Storage keys are versioned so a shape change can never be read as the old
 * shape. `PREV_KEY` is migrated on first load and then left in place: if this
 * build gets rolled back, the reader's progress is still there.
 */
const KEY = 'roadmap:v3';
const PREV_KEY = 'roadmap:v2';

export type State = {
  /** lesson number → step indices completed */
  steps: Record<number, number[]>;
  done: number[];
  bookmarks: number[];
  /** ISO dates (YYYY-MM-DD) the learner was active */
  days: string[];
  lastLesson: { n: number; step: number } | null;
  prefs: {
    size: number; // 15–21 px
    leading: number; // 1.5–2.0
    width: number; // rem
    focus: boolean;
    interview: boolean;
    /** Read aloud */
    rate: number; // 0.6–1.6× speech rate
    voiceURI: string;
    checkpoints: boolean;
    narrateDebug: boolean;
  };
};

const INITIAL: State = {
  steps: {},
  done: [],
  bookmarks: [],
  days: [],
  lastLesson: null,
  prefs: {
    size: 17,
    leading: 1.7,
    width: 46,
    focus: false,
    interview: false,
    rate: 1,
    voiceURI: '',
    checkpoints: true,
    narrateDebug: true,
  },
};

let snapshot: State = INITIAL;
let loaded = false;
const listeners = new Set<() => void>();

/* ---------------------------------------------------------------- */
/* Validation                                                        */
/*                                                                   */
/* Anything in localStorage is untrusted input: it survives across    */
/* deploys, it can be hand-edited in devtools, and it can be a older  */
/* version's shape. Without this pass a single corrupt value — `done` */
/* arriving as an object, say — throws inside `.includes()` on the    */
/* first render and takes down every page that reads progress.        */
/* ---------------------------------------------------------------- */

const clamp = (n: unknown, lo: number, hi: number, fallback: number) =>
  typeof n === 'number' && Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;

/** Lesson numbers: integers inside the curriculum's range, deduped, sorted. */
function lessonNumbers(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<number>();
  for (const raw of value) {
    const n = typeof raw === 'number' ? raw : Number(raw);
    if (Number.isInteger(n) && n >= 1 && n <= TOTAL_LESSONS) seen.add(n);
  }
  return [...seen].sort((a, b) => a - b);
}

function stepMap(value: unknown): Record<number, number[]> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const out: Record<number, number[]> = {};
  for (const [key, indices] of Object.entries(value)) {
    const n = Number(key);
    if (!Number.isInteger(n) || n < 1 || n > TOTAL_LESSONS) continue;
    if (!Array.isArray(indices)) continue;
    const steps = [
      ...new Set(
        indices
          .map((i) => (typeof i === 'number' ? i : Number(i)))
          .filter((i) => Number.isInteger(i) && i >= 0 && i < 64),
      ),
    ].sort((a, b) => a - b);
    if (steps.length) out[n] = steps;
  }
  return out;
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function sanitize(input: unknown): State {
  const raw = (input && typeof input === 'object' ? input : {}) as Partial<State>;
  const prefs = (raw.prefs && typeof raw.prefs === 'object' ? raw.prefs : {}) as Partial<
    State['prefs']
  >;

  const last = raw.lastLesson;
  const lastValid =
    last &&
    typeof last === 'object' &&
    Number.isInteger(last.n) &&
    last.n >= 1 &&
    last.n <= TOTAL_LESSONS &&
    Number.isInteger(last.step);

  return {
    steps: stepMap(raw.steps),
    done: lessonNumbers(raw.done),
    bookmarks: lessonNumbers(raw.bookmarks),
    days: Array.isArray(raw.days)
      ? [...new Set(raw.days.filter((d): d is string => typeof d === 'string' && ISO_DAY.test(d)))]
          .sort()
          .slice(-400)
      : [],
    lastLesson: lastValid ? { n: last.n, step: last.step } : null,
    prefs: {
      // Ranges mirror the toolbar's sliders — a width of 4000rem read back
      // from storage would render an unreadable page with no way to fix it
      // except clearing site data.
      size: clamp(prefs.size, 15, 21, INITIAL.prefs.size),
      leading: clamp(prefs.leading, 1.4, 2.2, INITIAL.prefs.leading),
      width: clamp(prefs.width, 38, 62, INITIAL.prefs.width),
      focus: prefs.focus === true,
      interview: prefs.interview === true,
      rate: clamp(prefs.rate, 0.6, 1.6, INITIAL.prefs.rate),
      // A voice that no longer exists on this machine falls back to the
      // narrator's own pick rather than failing to speak.
      voiceURI: typeof prefs.voiceURI === 'string' ? prefs.voiceURI.slice(0, 200) : '',
      // Default-on preferences have to test for `!== false`, or every reader
      // who saved a preference before this field existed gets it turned off.
      checkpoints: prefs.checkpoints !== false,
      narrateDebug: prefs.narrateDebug !== false,
    },
  };
}

function readKey(key: string): unknown | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // Unparseable JSON means the entry is unusable; treat it as absent rather
    // than letting a syntax error escape into render.
    return null;
  }
}

function load(): State {
  if (loaded) return snapshot;
  loaded = true;
  try {
    // v3 first; fall back to the v2 entry once, then persist forward.
    const current = readKey(KEY);
    if (current) {
      snapshot = sanitize(current);
    } else {
      const legacy = readKey(PREV_KEY);
      snapshot = sanitize(legacy);
      if (legacy) persistNow(snapshot);
    }
  } catch {
    snapshot = INITIAL;
  }
  return snapshot;
}

/* ---------------------------------------------------------------- */
/* Persistence                                                       */
/*                                                                   */
/* Writes are coalesced. Completing a lesson can update several       */
/* fields in the same tick (step, done, streak day, last place) and   */
/* localStorage.setItem is synchronous main-thread work that also     */
/* serialises the whole state — doing it once per burst instead of    */
/* once per field keeps a fast reader from stuttering.                */
/*                                                                   */
/* The flush hooks are what make coalescing safe: a pending write is  */
/* forced out before the page can be discarded, so closing the tab a  */
/* few milliseconds after ticking a lesson can't lose it.             */
/* ---------------------------------------------------------------- */

let writeTimer: ReturnType<typeof setTimeout> | null = null;
let pending: State | null = null;

function persistNow(next: State) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode or quota — never block the UI on persistence */
  }
}

function flush() {
  if (writeTimer !== null) {
    clearTimeout(writeTimer);
    writeTimer = null;
  }
  if (pending) {
    persistNow(pending);
    pending = null;
  }
}

if (typeof window !== 'undefined') {
  // `pagehide` fires where `beforeunload` does not (iOS Safari, back/forward
  // cache); `visibilitychange` covers tab switches and app backgrounding.
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}

function commit(next: State) {
  snapshot = next;
  pending = next;
  if (writeTimer === null) {
    writeTimer = setTimeout(() => {
      writeTimer = null;
      flush();
    }, 200);
  }
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    loaded = false;
    load();
    for (const l of listeners) l();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

const today = () => new Date().toISOString().slice(0, 10);

function touchDay(s: State): State {
  const d = today();
  return s.days.includes(d) ? s : { ...s, days: [...s.days, d].slice(-400) };
}

export function useStore() {
  const state = useSyncExternalStore(
    subscribe,
    load,
    () => INITIAL, // server snapshot
  );

  const completeStep = useCallback((n: number, step: number, totalSteps: number) => {
    const s = load();
    const prev = s.steps[n] ?? [];
    if (prev.includes(step)) return;
    const nextSteps = [...prev, step].sort((a, b) => a - b);
    const allDone = totalSteps > 0 && nextSteps.length >= totalSteps;
    commit(
      touchDay({
        ...s,
        steps: { ...s.steps, [n]: nextSteps },
        done: allDone && !s.done.includes(n) ? [...s.done, n] : s.done,
      }),
    );
  }, []);

  const toggleDone = useCallback((n: number) => {
    const s = load();
    const has = s.done.includes(n);
    commit(
      touchDay({
        ...s,
        done: has ? s.done.filter((x) => x !== n) : [...s.done, n],
      }),
    );
  }, []);

  const toggleBookmark = useCallback((n: number) => {
    const s = load();
    const has = s.bookmarks.includes(n);
    commit({ ...s, bookmarks: has ? s.bookmarks.filter((x) => x !== n) : [...s.bookmarks, n] });
  }, []);

  const setPlace = useCallback((n: number, step: number) => {
    const s = load();
    if (s.lastLesson?.n === n && s.lastLesson.step === step) return;
    commit(touchDay({ ...s, lastLesson: { n, step } }));
  }, []);

  const setPrefs = useCallback((patch: Partial<State['prefs']>) => {
    const s = load();
    commit({ ...s, prefs: { ...s.prefs, ...patch } });
  }, []);

  const reset = useCallback(() => {
    loaded = true;
    commit(INITIAL);
    // Destructive and deliberate: write it through now rather than leaving the
    // old progress on disk for another 200ms.
    flush();
  }, []);

  return { state, completeStep, toggleDone, toggleBookmark, setPlace, setPrefs, reset };
}

/* ---------------------------------------------------------------- */
/* derived                                                            */
/* ---------------------------------------------------------------- */

/** Consecutive days ending today (or yesterday — one grace day). */
export function streakOf(days: string[]): number {
  if (days.length === 0) return 0;
  const set = new Set(days);
  const d = new Date();
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);

  let streak = 0;
  for (;;) {
    if (!set.has(d.toISOString().slice(0, 10))) break;
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export type Achievement = {
  id: string;
  label: string;
  hint: string;
  earned: boolean;
};

export function achievementsOf(s: State, moduleDone: Record<string, boolean>): Achievement[] {
  const streak = streakOf(s.days);
  return [
    { id: 'first', label: 'First Step', hint: 'Finish one lesson', earned: s.done.length >= 1 },
    { id: 'ten', label: 'Momentum', hint: 'Finish 10 lessons', earned: s.done.length >= 10 },
    { id: 'streak3', label: 'Consistency', hint: '3-day streak', earned: streak >= 3 },
    { id: 'streak7', label: 'Habit', hint: '7-day streak', earned: streak >= 7 },
    { id: 'js', label: 'JavaScript', hint: 'Complete Module 1', earned: Boolean(moduleDone.javascript) },
    { id: 'ts', label: 'TypeScript', hint: 'Complete Module 2', earned: Boolean(moduleDone.typescript) },
    { id: 'react', label: 'React', hint: 'Complete Module 3', earned: Boolean(moduleDone.react) },
    { id: 'next', label: 'Next.js', hint: 'Complete Module 4', earned: Boolean(moduleDone.nextjs) },
    { id: 'ready', label: 'Interview Ready', hint: 'Complete all 104', earned: s.done.length >= 104 },
  ];
}
