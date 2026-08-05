/**
 * What the narrator says, derived at build time.
 *
 * Deliberately free of `server-only` and of any I/O: `scripts/generate-
 * narration.ts` runs outside Next and needs `hashCode` to agree with the build
 * exactly, or every block looks new and gets regenerated. Reading the sidecar
 * from disk is `content.ts`'s job, which is guarded.
 *
 * The reader speaks a lesson aloud and scrolls to keep up. Everything it needs
 * is computed here, alongside the markdown, for the same reason the HTML is:
 * the client should never parse content. A segment is one narratable block —
 * a paragraph, a list item, a table, a code panel — and it carries the `id`
 * that `content.ts` stamps onto the rendered element as `data-narrate`.
 *
 * That id is the whole synchronisation strategy. Mapping speech back to the
 * page by character offset would mean re-deriving the DOM's text on the client
 * and re-deriving it again after `useEnhancedCode` rewrites every `<pre>`.
 * A stable id per block means the narrator can always find what it is reading
 * with one `querySelector`, however much the subtree has been rewritten.
 */

export type NarratedLine = {
  /** 1-based, matching the `.line` elements the code panel renders */
  n: number;
  code: string;
  /** the spoken explanation */
  say: string;
};

/**
 * Everything the narrator needs that it *cannot* read off the page.
 *
 * Reading order and prose text both come from the DOM at speak time — the
 * rendered HTML already contains every word, so shipping it a second time as
 * data would roughly double a lesson's payload to say nothing new, and would
 * add a way for the two copies to disagree. Only these two cases need data:
 *
 *  - `code`, whose per-line explanations exist nowhere in the markup, and
 *  - `say`, for the handful of blocks whose spoken form differs from their
 *    text — a table row has to be read with pauses between its cells, or the
 *    words of adjacent columns run together.
 */
export type NarrationNote =
  | { kind: 'code'; lines: NarratedLine[]; source: string; lang: string; runnable: boolean }
  | { kind: 'say'; text: string };

/** Keyed by the `data-narrate` id stamped on the rendered element. */
export type NarrationNotes = Record<string, NarrationNote>;

/* ---------------------------------------------------------------- */
/* The mechanical layer                                              */
/*                                                                   */
/* The floor, not the goal. It says *what* a line is, never *why* —   */
/* which is the opposite of how this repo teaches. It exists so every */
/* code block narrates on day one, and so a lesson written after the  */
/* last generator run is never silent.                                */
/* ---------------------------------------------------------------- */

/** Longest first: `===` must be replaced before `==`, `=>` before `=`. */
const SYMBOLS: [RegExp, string][] = [
  [/\.\.\./g, ' spread '],
  [/===/g, ' strictly equals '],
  [/!==/g, ' strictly does not equal '],
  [/=>/g, ' arrow '],
  [/<=/g, ' is at most '],
  [/>=/g, ' is at least '],
  [/==/g, ' loosely equals '],
  [/!=/g, ' does not equal '],
  [/\?\./g, ' optional chaining '],
  [/\?\?/g, ' nullish coalescing '],
  [/&&/g, ' and '],
  [/\|\|/g, ' or '],
  [/\+\+/g, ' increment '],
  [/--/g, ' decrement '],
  [/=/g, ' equals '],
  [/[{}();]/g, ' '],
  [/\s+/g, ' '],
];

export function verbalize(code: string): string {
  const line = code.trim();
  if (!line) return '';

  // A comment is the author already having written the narration. Say it and
  // stop — it beats anything derived from the syntax underneath.
  const comment = /^(?:\/\/|\/\*|\*)\s*(.+?)\s*(?:\*\/)?$/.exec(line);
  if (comment) return comment[1];

  let say = line.replace(/\/\/.*$/, '');
  for (const [re, word] of SYMBOLS) say = say.replace(re, word);
  return say.trim();
}

/**
 * Symbols a speech synthesiser reads as silence.
 *
 * Only applied where the spoken text is already allowed to differ from what's
 * on screen — comparison tables, which is where arrows cluster. In prose the
 * utterance text has to stay character-identical to the element's own text, or
 * the offsets from a `boundary` event mark the wrong words.
 */
export function speakable(text: string): string {
  return text
    .replace(/\s*[→⇒]\s*/g, ' becomes ')
    .replace(/\s*[←⇐]\s*/g, ' from ')
    .replace(/\s*↔\s*/g, ' both ways ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ---------------------------------------------------------------- */
/* Authored overrides                                                */
/* ---------------------------------------------------------------- */

/**
 * A ```narrate fence immediately after a code fence overrides what the
 * narrator says for those lines:
 *
 *     ```narrate
 *     2: this is the closure capturing `count`
 *     5-7: the binding outlives the call that created it
 *     ```
 *
 * Authored narration always wins. The generated sidecar covers every block at
 * once; this is the escape hatch for the ones worth saying properly.
 */
export function parseAuthored(block: string): Map<number, string> {
  const out = new Map<number, string>();
  for (const raw of block.split('\n')) {
    const m = /^\s*(\d+)(?:\s*-\s*(\d+))?\s*:\s*(.+)$/.exec(raw);
    if (!m) continue;
    const from = Number(m[1]);
    const to = m[2] ? Number(m[2]) : from;
    // Backticks read as literal words through a speech synthesiser.
    const say = m[3].replace(/`/g, '').trim();
    for (let n = from; n <= to && n - from < 200; n += 1) out.set(n, say);
  }
  return out;
}

/* ---------------------------------------------------------------- */
/* The generated sidecar                                             */
/* ---------------------------------------------------------------- */

/**
 * Keyed by a hash of the code itself rather than by lesson and position, so
 * editing the prose around a block doesn't invalidate its narration and moving
 * a snippet between lessons carries the narration with it. The generator only
 * pays for hashes it hasn't seen.
 */
export type Sidecar = Record<string, { lines: Record<string, string> }>;

/**
 * A content hash, not a cryptographic one — it only has to be stable and
 * collision-free across a few hundred snippets. Whitespace is normalised so
 * re-indenting a block doesn't force a regeneration.
 */
export function hashCode(source: string): string {
  const normal = source.trim().replace(/[ \t]+$/gm, '');
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < normal.length; i += 1) {
    h1 = Math.imul(h1 ^ normal.charCodeAt(i), 0x01000193);
    h2 = Math.imul(h2 + normal.charCodeAt(i), 0x85ebca6b) ^ (h1 >>> 7);
  }
  return ((h1 >>> 0).toString(16) + (h2 >>> 0).toString(16)).padStart(16, '0');
}

/* ---------------------------------------------------------------- */
/* Assembly                                                          */
/* ---------------------------------------------------------------- */

const RUNNABLE = new Set(['js', 'javascript', 'jsx', 'mjs', 'cjs']);

export function narrateCode(
  source: string,
  lang: string,
  authored: Map<number, string>,
  sidecar: Sidecar,
): NarratedLine[] {
  const generated = sidecar[hashCode(source)]?.lines ?? {};

  return source
    .replace(/\n+$/, '')
    .split('\n')
    .map((code, i) => {
      const n = i + 1;
      return { n, code, say: authored.get(n) ?? generated[String(n)] ?? verbalize(code) };
    })
    // A blank line has nothing to say and a pause there sounds like a fault.
    .filter((l) => l.say.trim().length > 0);
}

export const isRunnable = (lang: string) => RUNNABLE.has(lang.toLowerCase());
