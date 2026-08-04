'use client';

/**
 * A step debugger for the lesson snippets.
 *
 * There is no way to read a JavaScript engine's local scope from outside it,
 * so instead of observing execution we *instrument* it: a `__s(line, snapshot)`
 * call is injected at every statement boundary, and the snapshot is built from
 * arrow functions written inline at that point in the source. Because those
 * arrows are compiled in the real scope, they see exactly what the code sees —
 * including variables that are still in the Temporal Dead Zone, which is the
 * single most useful thing to be able to show in Lessons 1–5.
 */

export type VarState = 'ok' | 'tdz' | 'out-of-scope';
export type VarView = { name: string; value: string; state: VarState };

export type Frame = {
  line: number;
  vars: VarView[];
  stack: string[];
  /** Console lines emitted *before* this step, so output stays in order. */
  logs: { level: string; text: string }[];
};

/* ------------------------------------------------------------------ */
/* Source scanning                                                     */
/* ------------------------------------------------------------------ */

type Mask = { code: string; depth: number[]; stmt: boolean[] };

/**
 * Blanks out strings, template literals, regex and comments so the scanner
 * can look for structure without tripping over `"};"` inside a string.
 * Returns per-character bracket depth and per-line statement-start flags.
 */
function scan(src: string): Mask {
  const out: string[] = [];
  const depth: number[] = [];
  let d = 0; // () [] depth — statements only start at depth 0
  let i = 0;
  let quote: string | null = null;
  let comment: 'line' | 'block' | null = null;

  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];

    if (comment) {
      if (comment === 'line' && c === '\n') comment = null;
      else if (comment === 'block' && c === '*' && next === '/') {
        comment = null;
        out.push(' ');
        depth.push(d);
        i += 1;
        out.push(' ');
        depth.push(d);
        i += 1;
        continue;
      }
      out.push(c === '\n' ? '\n' : ' ');
      depth.push(d);
      i += 1;
      continue;
    }

    if (quote) {
      if (c === '\\') {
        out.push(' ', ' ');
        depth.push(d, d);
        i += 2;
        continue;
      }
      if (c === quote) quote = null;
      out.push(c === '\n' ? '\n' : ' ');
      depth.push(d);
      i += 1;
      continue;
    }

    if (c === '/' && next === '/') { comment = 'line'; out.push(' '); depth.push(d); i += 1; continue; }
    if (c === '/' && next === '*') { comment = 'block'; out.push(' '); depth.push(d); i += 1; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; out.push(' '); depth.push(d); i += 1; continue; }

    if (c === '(' || c === '[') d += 1;
    if (c === ')' || c === ']') d = Math.max(0, d - 1);

    out.push(c);
    depth.push(d);
    i += 1;
  }

  const masked = out.join('');
  const lines = masked.split('\n');

  // Offset of each line start, so we can read depth at the first real char.
  const stmt: boolean[] = [];
  let pos = 0;
  let prevMeaningful = '';

  for (const line of lines) {
    const trimmed = line.trim();
    const firstIdx = line.length - line.trimStart().length;
    const dAt = depth[pos + firstIdx] ?? 0;

    const continuation = /^[.?:,)\]}]|^(?:else\b|case\b|default\b|catch\b|finally\b|\+\+|--)/.test(trimmed);
    // A braceless `if (x)` / `for (…)` on the previous line owns the next one.
    const danglingHeader = /^(?:if|for|while|else)\b[^{]*\)?\s*$/.test(prevMeaningful) && !prevMeaningful.endsWith('{');

    stmt.push(Boolean(trimmed) && dAt === 0 && !continuation && !danglingHeader);

    if (trimmed) prevMeaningful = trimmed;
    pos += line.length + 1;
  }

  return { code: masked, depth, stmt };
}

/** Every name the program declares — the watch list. */
function declaredNames(masked: string): string[] {
  const names = new Set<string>();
  const add = (n?: string) => {
    if (n && !RESERVED.has(n)) names.add(n);
  };

  for (const m of masked.matchAll(/\b(?:let|const|var)\s+([A-Za-z_$][\w$]*)/g)) add(m[1]);
  for (const m of masked.matchAll(/\bfunction\s*\*?\s*([A-Za-z_$][\w$]*)/g)) add(m[1]);
  for (const m of masked.matchAll(/\bclass\s+([A-Za-z_$][\w$]*)/g)) add(m[1]);
  // Simple params: function f(a, b) and (a, b) =>
  for (const m of masked.matchAll(/(?:function\s*\*?\s*[A-Za-z_$][\w$]*\s*|=>\s*)?\(([^()]*)\)\s*(?:=>|\{)/g)) {
    for (const raw of m[1].split(',')) add(raw.trim().split(/[=:\s]/)[0]);
  }
  for (const m of masked.matchAll(/(?:^|[^\w$.])([A-Za-z_$][\w$]*)\s*=>/g)) add(m[1]);
  // Destructuring, shallow: const { a, b } = … / const [a, b] = …
  for (const m of masked.matchAll(/\b(?:let|const|var)\s*[[{]([^\]}]*)[\]}]/g)) {
    for (const raw of m[1].split(',')) add(raw.trim().split(/[=:\s]/).pop());
  }

  return [...names].slice(0, 24); // a watch panel past ~24 rows is unreadable
}

const RESERVED = new Set([
  'if', 'else', 'for', 'while', 'do', 'return', 'function', 'class', 'const', 'let',
  'var', 'new', 'this', 'typeof', 'instanceof', 'in', 'of', 'try', 'catch', 'finally',
  'throw', 'switch', 'case', 'default', 'break', 'continue', 'await', 'async', 'yield',
  'true', 'false', 'null', 'undefined', 'void', 'delete', 'export', 'import', 'from',
]);

/* ------------------------------------------------------------------ */
/* Instrumentation                                                     */
/* ------------------------------------------------------------------ */

/**
 * Wraps every function body so the debugger can show a real call stack:
 *
 *   function f() { BODY }
 *   →  function f() { __enter("f"); try { BODY } finally { __exit(); } }
 *
 * Injected without newlines so line numbers stay aligned with the source the
 * reader is looking at. Runs before statement instrumentation.
 */
function wrapFunctions(src: string): string {
  const { code: masked } = scan(src);
  const edits: { at: number; text: string; close: boolean }[] = [];

  const patterns: [RegExp, number][] = [
    // function name(...) {   /  function (...) {
    [/\bfunction\s*\*?\s*([A-Za-z_$][\w$]*)?\s*\([^()]*\)\s*\{/g, 1],
    // (a, b) => {   /  a => {
    [/(?:\(([^()]*)\)|([A-Za-z_$][\w$]*))\s*=>\s*\{/g, -1],
  ];

  for (const [re, nameGroup] of patterns) {
    re.lastIndex = 0;
    for (const m of masked.matchAll(re)) {
      const open = m.index! + m[0].length - 1;
      // Skip if some earlier pattern already claimed this brace.
      if (edits.some((e) => e.at === open + 1)) continue;

      let depth = 0;
      let close = -1;
      for (let i = open; i < masked.length; i += 1) {
        if (masked[i] === '{') depth += 1;
        else if (masked[i] === '}') {
          depth -= 1;
          if (depth === 0) { close = i; break; }
        }
      }
      if (close === -1) continue;

      const name = nameGroup === 1 ? (m[1] ?? '(anonymous)') : '(arrow)';
      edits.push({ at: open + 1, text: `__enter(${JSON.stringify(name)});try{`, close: false });
      edits.push({ at: close, text: '}finally{__exit();}', close: true });
    }
  }

  // An empty body puts both edits on the same offset, and insertions at one
  // offset land in reverse order — so the closing half has to be applied
  // first or `function f() {}` comes out as `{}finally{…}__enter(…);try{}`.
  edits.sort((a, b) => b.at - a.at || Number(b.close) - Number(a.close));
  let out = src;
  for (const e of edits) out = out.slice(0, e.at) + e.text + out.slice(e.at);
  return out;
}

export function instrument(src: string): { code: string; watch: string[] } {
  const wrapped = wrapFunctions(src);
  const { code: masked, stmt } = scan(wrapped);
  const watch = declaredNames(masked);

  const snapshot =
    watch.length === 0
      ? '{}'
      : `{${watch.map((n) => `${JSON.stringify(n)}:__v(()=>${n})`).join(',')}}`;

  const lines = wrapped.split('\n');
  const out = lines.map((line, i) => {
    if (!stmt[i]) return line;
    const indent = line.slice(0, line.length - line.trimStart().length);
    return `${indent}__s(${i + 1},${snapshot});${line.slice(indent.length)}`;
  });

  return { code: out.join('\n'), watch };
}

/* ------------------------------------------------------------------ */
/* Worker                                                              */
/* ------------------------------------------------------------------ */

const WORKER = `
const MAX = 4000;
const frames = [];
let pending = [];
let stack = ['(global)'];

const fmt = (v, d = 0) => {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  const t = typeof v;
  if (t === 'string') return JSON.stringify(v);
  if (t === 'number' || t === 'boolean' || t === 'bigint') return String(v);
  if (t === 'function') return v.name ? 'ƒ ' + v.name : 'ƒ';
  if (t === 'symbol') return v.toString();
  if (v instanceof Error) return v.name + ': ' + v.message;
  if (d > 1) return Array.isArray(v) ? '[…]' : '{…}';
  if (Array.isArray(v)) return '[' + v.map(x => fmt(x, d + 1)).join(', ') + ']';
  if (v instanceof Map) return 'Map(' + v.size + ')';
  if (v instanceof Set) return 'Set(' + v.size + ')';
  if (v instanceof Promise) return 'Promise {…}';
  const e = Object.entries(v);
  return e.length ? '{ ' + e.map(([k, x]) => k + ': ' + fmt(x, d + 1)).join(', ') + ' }' : '{}';
};

// Reading a TDZ binding throws — that is signal, not failure.
self.__v = (get) => {
  try { return { value: fmt(get()), state: 'ok' }; }
  catch (e) {
    const tdz = e instanceof ReferenceError && /before initialization/.test(e.message);
    return { value: tdz ? 'not initialised yet' : 'not in scope', state: tdz ? 'tdz' : 'out-of-scope' };
  }
};

self.__s = (line, snap) => {
  if (frames.length >= MAX) throw new Error('__STEP_LIMIT__');
  const vars = Object.keys(snap).map(name => ({ name, value: snap[name].value, state: snap[name].state }));
  frames.push({ line, vars, stack: stack.slice(), logs: pending });
  pending = [];
};

self.__enter = (name) => { stack.push(name); };
self.__exit = () => { if (stack.length > 1) stack.pop(); };

const emit = (level, args) => pending.push({ level, text: args.map(a => fmt(a)).join(' ') });
console.log = (...a) => emit('log', a);
console.info = (...a) => emit('info', a);
console.warn = (...a) => emit('warn', a);
console.error = (...a) => emit('error', a);

self.addEventListener('unhandledrejection', (e) => emit('error', ['Uncaught (in promise)', e.reason]));

self.onmessage = (e) => {
  try {
    (0, eval)(e.data);
  } catch (err) {
    if (err && err.message === '__STEP_LIMIT__') {
      pending.push({ level: 'warn', text: 'Stopped after ' + MAX + ' steps.' });
    } else {
      pending.push({ level: 'error', text: err && err.name ? err.name + ': ' + err.message : String(err) });
    }
  }
  // Flush anything logged after the last step.
  if (pending.length) {
    frames.push({ line: -1, vars: frames.length ? frames[frames.length - 1].vars : [], stack: ['(global)'], logs: pending });
    pending = [];
  }
  self.postMessage({ done: true, frames });
};
`;

let url: string | null = null;
const workerUrl = () => (url ??= URL.createObjectURL(new Blob([WORKER], { type: 'text/javascript' })));

/** Instrument, execute, and resolve with the full recorded timeline. */
export function trace(src: string): Promise<{ frames: Frame[]; watch: string[]; error?: string }> {
  return new Promise((resolve) => {
    let built: { code: string; watch: string[] };
    try {
      built = instrument(src);
    } catch {
      resolve({ frames: [], watch: [], error: 'Could not instrument this snippet.' });
      return;
    }

    let worker: Worker;
    try {
      worker = new Worker(workerUrl());
    } catch {
      resolve({ frames: [], watch: [], error: 'Workers are unavailable in this browser.' });
      return;
    }

    const stop = setTimeout(() => {
      worker.terminate();
      resolve({ frames: [], watch: built.watch, error: 'Timed out — possible infinite loop.' });
    }, 5000);

    worker.onmessage = (e: MessageEvent) => {
      clearTimeout(stop);
      worker.terminate();
      resolve({ frames: e.data.frames as Frame[], watch: built.watch });
    };

    worker.onerror = (e) => {
      clearTimeout(stop);
      worker.terminate();
      // A syntax error here means instrumentation broke the source.
      resolve({ frames: [], watch: built.watch, error: e.message || 'Could not run this snippet.' });
    };

    worker.postMessage(built.code);
  });
}
