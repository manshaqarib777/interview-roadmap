'use client';

/**
 * Runs a snippet in a Web Worker and streams its console output back.
 *
 * A worker rather than eval-on-the-main-thread for three reasons: an infinite
 * loop can be terminated, the snippet cannot touch the DOM or localStorage,
 * and the UI never blocks. Logs stream as they happen, so `setTimeout`
 * examples — which is most of the async curriculum — actually show their real
 * ordering instead of only the synchronous part.
 */

export type LogLine = { level: 'log' | 'warn' | 'error' | 'info'; text: string };

const WORKER_SRC = `
const fmt = (v, depth = 0) => {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  const t = typeof v;
  if (t === 'string') return depth === 0 ? v : JSON.stringify(v);
  if (t === 'number' || t === 'boolean' || t === 'bigint') return String(v);
  if (t === 'symbol') return v.toString();
  if (t === 'function') return (v.name ? 'ƒ ' + v.name + '()' : 'ƒ ()');
  if (v instanceof Error) return v.name + ': ' + v.message;
  if (Array.isArray(v)) {
    if (depth > 2) return '[…]';
    return '[' + v.map((x) => fmt(x, depth + 1)).join(', ') + ']';
  }
  if (v instanceof Map) return 'Map(' + v.size + ') {' + [...v].map(([k, x]) => fmt(k, depth+1) + ' => ' + fmt(x, depth + 1)).join(', ') + '}';
  if (v instanceof Set) return 'Set(' + v.size + ') {' + [...v].map((x) => fmt(x, depth + 1)).join(', ') + '}';
  if (v instanceof Promise) return 'Promise { <pending> }';
  if (depth > 2) return '{…}';
  const entries = Object.entries(v);
  if (entries.length === 0) return '{}';
  return '{ ' + entries.map(([k, x]) => k + ': ' + fmt(x, depth + 1)).join(', ') + ' }';
};

const emit = (level, args) =>
  self.postMessage({ level, text: args.map((a) => fmt(a)).join(' ') });

console.log = (...a) => emit('log', a);
console.info = (...a) => emit('info', a);
console.warn = (...a) => emit('warn', a);
console.error = (...a) => emit('error', a);
console.table = (...a) => emit('log', a);
console.debug = (...a) => emit('log', a);

self.onerror = (e) => { self.postMessage({ level: 'error', text: String(e.message || e) }); };
self.addEventListener('unhandledrejection', (e) => {
  self.postMessage({ level: 'error', text: 'Uncaught (in promise) ' + fmt(e.reason) });
});

self.onmessage = (e) => {
  try {
    // Indirect eval → runs in global scope, so declarations behave normally.
    (0, eval)(e.data);
  } catch (err) {
    self.postMessage({ level: 'error', text: (err && err.name ? err.name + ': ' + err.message : String(err)) });
  }
  self.postMessage({ __sync: true });
};
`;

let blobUrl: string | null = null;

function workerUrl() {
  if (!blobUrl) {
    blobUrl = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
  }
  return blobUrl;
}

export type RunHandle = { cancel: () => void };

/**
 * @param onLog   called for each console line as it arrives
 * @param onDone  called once, with `timedOut` true if we had to stop it
 */
export function run(
  code: string,
  onLog: (line: LogLine) => void,
  onDone: (info: { timedOut: boolean }) => void,
  { asyncGrace = 1400, hardLimit = 4000 } = {},
): RunHandle {
  let worker: Worker;
  try {
    worker = new Worker(workerUrl());
  } catch {
    onLog({ level: 'error', text: 'Workers are unavailable in this browser.' });
    onDone({ timedOut: false });
    return { cancel: () => {} };
  }

  let finished = false;
  let graceTimer: ReturnType<typeof setTimeout> | undefined;

  const stop = (timedOut: boolean) => {
    if (finished) return;
    finished = true;
    clearTimeout(graceTimer);
    clearTimeout(hardTimer);
    worker.terminate();
    onDone({ timedOut });
  };

  // Backstop for infinite loops — the sync phase never returns.
  const hardTimer = setTimeout(() => stop(true), hardLimit);

  worker.onmessage = (e: MessageEvent) => {
    if (e.data?.__sync) {
      // Synchronous phase over. Keep listening briefly so timers and
      // microtasks get a chance to log.
      graceTimer = setTimeout(() => stop(false), asyncGrace);
      return;
    }
    onLog(e.data as LogLine);
  };

  worker.onerror = (e) => {
    onLog({ level: 'error', text: e.message || 'Worker error' });
    stop(false);
  };

  worker.postMessage(code);

  return { cancel: () => stop(false) };
}
