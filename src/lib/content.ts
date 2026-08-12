import 'server-only';

import fs from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';
import matter from 'gray-matter';
import { unified, type Plugin } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeShiki from '@shikijs/rehype';
import rehypeStringify from 'rehype-stringify';

import {
  hashCode,
  isRunnable,
  narrateCode,
  parseAuthored,
  speakable,
  type NarrationNote,
  type NarrationNotes,
  type Sidecar,
} from './narration';
import {
  BY_N,
  LESSON_INDEX,
  MODULES,
  estimateMinutes,
  hrefOf,
  type IndexedLesson,
} from './curriculum';
import {
  TOPIC_BY_SLUG,
  TOPIC_INDEX,
  hrefOfTopic,
  topicFile,
  type TopicRef,
} from './topics';

/**
 * Markdown → *steps*, not one long page.
 *
 * Each `##` heading becomes its own screen in the reader. That is the whole
 * point: a lesson is a sequence of small ideas you move through, not a wall
 * of text you scroll past. Everything here runs at build time.
 */

const CONTENT_ROOT = path.join(process.cwd(), 'content');

/** The 18-section senior revision format, plus a fallback. */
export type StepKind =
  | 'definition'
  | 'model'
  | 'visual'
  | 'internals'
  | 'usage'
  | 'answer'
  | 'senior'
  | 'mistakes'
  | 'practices'
  | 'interview'
  | 'followup'
  | 'compare'
  | 'code'
  | 'perf'
  | 'debug'
  | 'revision'
  | 'cheatsheet'
  | 'takeaways'
  | 'objectives'
  | 'quiz';

export type Step = {
  id: string;
  index: number;
  title: string;
  kind: StepKind;
  html: string;
  words: number;
  seconds: number;
  /** Only for kind === 'quiz' — rendered markdown, one entry per prompt */
  questionsHtml: string[];
  /** Only for kind === 'interview' — what Interview Mode flips through */
  cards: InterviewCard[];
  /** Read aloud: what can't be read off the page, keyed by `data-narrate` */
  narration: NarrationNotes;
};

export type InterviewCard = {
  /** Plain text — the question the way you'd hear it asked */
  q: string;
  /** Rendered markdown — the answer, revealed on demand */
  aHtml: string;
};

export type Lesson = IndexedLesson & {
  written: boolean;
  steps: Step[];
  minutes: number;
  words: number;
  /** Extracted from the "Common interview questions" step for Interview Mode */
  cards: InterviewCard[];
  prev: IndexedLesson | null;
  next: IndexedLesson | null;
};

/**
 * A rendered checklist topic — the TopicRef plus what getTopic() parses out of
 * the file's markdown. Topics are reference pages, not curriculum lessons, so
 * there is no written/estimate state: the file exists or the page 404s.
 */
export type Topic = TopicRef & {
  /** Parsed from the file's H1 — the file is canonical, never the table */
  title: string;
  /** Parsed from the `**Checklist anchor:**` line — dense concept list */
  description: string;
  steps: Step[];
  minutes: number;
  words: number;
  cards: InterviewCard[];
  /** Titles come from the files, so prev/next carry them (TopicRef has none) */
  prev: TopicRef & { title: string } | null;
  next: TopicRef & { title: string } | null;
};

/* ---------------------------------------------------------------- */
/* markdown → html                                                    */
/* ---------------------------------------------------------------- */

type AnyPlugin = Plugin<never[], never>;
const p = (x: unknown) => x as AnyPlugin;

function linkify() {
  return (tree: { children?: unknown[] }) => {
    const walk = (n: Record<string, unknown>) => {
      if (n.tagName === 'a') {
        const href = String((n.properties as Record<string, unknown>)?.href ?? '');
        if (/^https?:\/\//.test(href)) {
          n.properties = { ...(n.properties as object), target: '_blank', rel: 'noreferrer noopener' };
        }
      }
      for (const c of (n.children as Record<string, unknown>[]) ?? []) walk(c);
    };
    walk(tree as Record<string, unknown>);
  };
}

/**
 * GitHub-style alerts become styled callouts:
 *
 *   > [!NOTE]
 *   > Text…
 *
 * Supported: NOTE, TIP, PITFALL, WARNING, DEEPDIVE, RECAP. Deep dives render
 * collapsed, since they're the optional layer.
 */
const CALLOUTS: Record<string, { cls: string; label: string }> = {
  NOTE: { cls: 'callout-note', label: 'Note' },
  TIP: { cls: 'callout-note', label: 'Tip' },
  PITFALL: { cls: 'callout-pitfall', label: 'Pitfall' },
  WARNING: { cls: 'callout-pitfall', label: 'Watch out' },
  DEEPDIVE: { cls: 'callout-deep', label: 'Deep dive' },
  RECAP: { cls: 'callout-recap', label: 'Recap' },
};

function callouts() {
  return (tree: { children?: Record<string, unknown>[] }) => {
    const walk = (node: Record<string, unknown>) => {
      const kids = (node.children as Record<string, unknown>[]) ?? [];
      kids.forEach((child, i) => {
        if (child.tagName === 'blockquote') {
          const inner = (child.children as Record<string, unknown>[]) ?? [];
          const firstP = inner.find((n) => n.tagName === 'p');
          const textNode = ((firstP?.children as Record<string, unknown>[]) ?? [])[0];
          const raw = String(textNode?.value ?? '');
          const m = /^\[!(\w+)\]\s*\n?/.exec(raw);
          if (!m) return;

          const kind = CALLOUTS[m[1].toUpperCase()];
          if (!kind) return;

          // Strip the marker from the first text node.
          if (textNode) textNode.value = raw.slice(m[0].length);
          if (firstP && !String(textNode?.value ?? '').trim()) {
            firstP.children = ((firstP.children as unknown[]) ?? []).slice(1);
          }

          const title = {
            type: 'element',
            tagName: 'p',
            properties: { className: ['callout-title'] },
            children: [{ type: 'text', value: kind.label }],
          };

          kids[i] = {
            type: 'element',
            tagName: 'div',
            properties: { className: ['callout', kind.cls] },
            children: [title, ...inner],
          };
        }
        walk(child);
      });
    };
    walk(tree as Record<string, unknown>);
  };
}

/**
 * Wrap every table in a scroll frame. The frame owns the border, radius and
 * horizontal overflow, so the table itself can stay `display: table` and
 * actually stretch to full width instead of shrink-wrapping its content.
 */
function tables() {
  return (tree: { children?: Record<string, unknown>[] }) => {
    const walk = (node: Record<string, unknown>) => {
      const kids = (node.children as Record<string, unknown>[]) ?? [];
      kids.forEach((child, i) => {
        if (child.tagName === 'table') {
          kids[i] = {
            type: 'element',
            tagName: 'div',
            properties: { className: ['table-wrap'] },
            children: [child],
          };
          return;
        }
        walk(child);
      });
    };
    walk(tree as Record<string, unknown>);
  };
}

/* ---------------------------------------------------------------- */
/* narration                                                          */
/* ---------------------------------------------------------------- */

type HNode = Record<string, unknown>;

/** Blocks the narrator reads as a unit. A `li` is hit before the `p` inside
 *  it, and stamping stops the walk — otherwise a loose list narrates twice. */
const PROSE_TAGS = new Set(['p', 'li', 'h3', 'h4', 'h5', 'h6']);

/** Concatenated exactly as the DOM will, so a character offset from a
 *  `boundary` event lands on the same character in the rendered text node. */
function textOf(node: HNode): string {
  if (node.type === 'text') return String(node.value ?? '');
  return ((node.children as HNode[]) ?? []).map(textOf).join('');
}

type NarrateOpts = {
  notes: NarrationNotes;
  /** code hash → authored line notes, lifted out of the markdown */
  authored: Map<string, Map<number, string>>;
  sidecar: Sidecar;
  prefix: string;
};

/**
 * Stamp `data-narrate` on every readable block and collect what to say.
 *
 * Runs after Shiki so a code block is inspected in its final shape: the source
 * is read back out of the highlighted tokens, which is also exactly what the
 * `.line` elements the panel highlights contain.
 */
function narrate(opts: NarrateOpts) {
  // Two closures, matching `callouts` and `tables` above: unified calls the
  // outer one as the attacher and uses what it returns as the transformer.
  return () => (tree: HNode) => {
    let seq = 0;

    /** Stamping is what makes a block narratable; the note is optional. */
    const stamp = (node: HNode, note?: NarrationNote) => {
      const id = `${opts.prefix}-${(seq += 1)}`;
      node.properties = { ...(node.properties as object), 'data-narrate': id };
      if (note) opts.notes[id] = note;
    };

    const walk = (node: HNode) => {
      for (const child of ((node.children as HNode[]) ?? [])) {
        const tag = child.tagName as string | undefined;

        if (tag === 'pre') {
          const code = ((child.children as HNode[]) ?? []).find((c) => c.tagName === 'code');
          const source = textOf(code ?? child).replace(/\n$/, '');
          const lang =
            /language-([\w+-]+)/.exec(
              String(((code?.properties as HNode)?.className as string[])?.join(' ') ?? ''),
            )?.[1] ?? '';
          if (source.trim()) {
            stamp(child, {
              kind: 'code',
              source,
              lang,
              runnable: isRunnable(lang),
              lines: narrateCode(
                source,
                lang,
                opts.authored.get(hashCode(source)) ?? new Map(),
                opts.sidecar,
              ),
            });
          }
          continue;
        }

        if (tag && PROSE_TAGS.has(tag)) {
          // No note: the narrator reads the element's own text. A bare "—" or
          // a stray bullet isn't worth an utterance.
          if (textOf(child).trim().length > 2) stamp(child);
          continue;
        }

        if (tag === 'tr') {
          const cells = ((child.children as HNode[]) ?? [])
            .filter((c) => c.tagName === 'td' || c.tagName === 'th')
            .map((c) => textOf(c).replace(/\s+/g, ' ').trim())
            .filter(Boolean);
          // One of the few places the spoken form has to differ from the
          // text: without the commas, the last word of one column and the
          // first of the next are read as a single phrase.
          if (cells.length) stamp(child, { kind: 'say', text: speakable(`${cells.join(', ')}.`) });
          continue;
        }

        walk(child);
      }
    };

    walk(tree);
  };
}

/**
 * The generated line explanations, read once per build.
 *
 * Absent or unparseable is a normal state — nobody has run the generator yet,
 * or this is a fresh clone — and narration falls back to the mechanical layer
 * rather than failing the build.
 */
const loadSidecar = cache(async (): Promise<Sidecar> => {
  try {
    return JSON.parse(
      await fs.readFile(path.join(CONTENT_ROOT, 'narration.json'), 'utf8'),
    ) as Sidecar;
  } catch {
    return {};
  }
});

/**
 * Lift ```narrate fences out of the markdown and key them to the code block
 * they follow, so the author's own words win over anything generated.
 * The fence never reaches the renderer — it is narration, not content.
 */
function liftAuthoredNarration(md: string): {
  body: string;
  authored: Map<string, Map<number, string>>;
} {
  const authored = new Map<string, Map<number, string>>();
  let previous = '';

  const body = md.replace(
    /```([\w+-]*)[^\n]*\n([\s\S]*?)```/g,
    (whole, lang: string, inner: string) => {
      if (lang.toLowerCase() === 'narrate') {
        if (previous) authored.set(hashCode(previous), parseAuthored(inner));
        return '';
      }
      previous = inner.replace(/\n$/, '');
      return whole;
    },
  );

  return { body, authored };
}

async function toHtml(md: string, narration?: NarrateOpts): Promise<string> {
  const pipeline = unified()
    .use(p(remarkParse))
    .use(p(remarkGfm))
    .use(p(remarkRehype), { allowDangerousHtml: true } as never)
    .use(p(rehypeRaw))
    .use(p(rehypeSlug))
    .use(p(callouts))
    .use(p(tables))
    .use(p(linkify))
    .use(p(rehypeShiki), {
      // `dimmed` is GitHub's variant tuned for a mid-grey surface rather than
      // near-black — the right pairing for a #2f2f2f code block. The default
      // dark theme's tokens are pitched for #0d1117 and glare against grey.
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      defaultColor: false,
      fallbackLanguage: 'text',
    } as never);

  // After Shiki, so a code block is inspected in the shape the reader will
  // highlight. Cards and quiz prompts pass no collector — they are never
  // narrated in place, so they cost no extra work.
  if (narration) pipeline.use(p(narrate(narration)));

  const file = await pipeline
    .use(p(rehypeStringify), { allowDangerousHtml: true } as never)
    .process(md);
  return String(file);
}

/* ---------------------------------------------------------------- */
/* splitting                                                          */
/* ---------------------------------------------------------------- */

/** Split on `## ` headings, ignoring anything inside a fenced code block. */
function splitOnH2(md: string): { title: string; body: string }[] {
  const lines = md.split('\n');
  const out: { title: string; body: string[] }[] = [];
  let fenced = false;
  let current: { title: string; body: string[] } | null = null;

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;

    const h2 = !fenced && /^##\s+(?!#)(.*)$/.exec(line);
    if (h2) {
      if (current) out.push(current);
      current = { title: h2[1].trim(), body: [] };
      continue;
    }
    if (current) current.body.push(line);
  }
  if (current) out.push(current);

  return out.map((s) => ({ title: s.title, body: s.body.join('\n').trim() }));
}

/* Order matters — first match wins, so put the specific patterns first. */
const KIND_RULES: [RegExp, StepKind][] = [
  [/you will learn|learning objectives|objectives/i, 'objectives'],
  [/one.line|definition/i, 'definition'],
  [/mental model/i, 'model'],
  [/visual|diagram|flowchart|timeline/i, 'visual'],
  [/how it works|internal|under the hood/i, 'internals'],
  [/real project|production usage|where.*used/i, 'usage'],
  [/interview explanation|30.60|the answer/i, 'answer'],
  [/senior.level|senior insight|deep dive/i, 'senior'],
  [/common mistake|pitfall|gotcha/i, 'mistakes'],
  [/best practice/i, 'practices'],
  [/follow.up/i, 'followup'],
  [/interview question|faq|frequently asked/i, 'interview'],
  [/comparison|vs\.?\s|compare/i, 'compare'],
  [/code example|implementation/i, 'code'],
  [/performance/i, 'perf'],
  [/debug|troubleshoot/i, 'debug'],
  [/quick revision|revision note/i, 'revision'],
  [/cheat.?sheet/i, 'cheatsheet'],
  [/key takeaway|takeaway/i, 'takeaways'],
  [/check your understanding|quiz|self.check/i, 'quiz'],
];

function kindOf(title: string): StepKind {
  const clean = title.replace(/^\d+\.\s*/, '');
  for (const [re, kind] of KIND_RULES) if (re.test(clean)) return kind;
  return 'definition';
}

/**
 * Strip the leading "1. " numbering — the UI supplies its own step numbers —
 * and the inline-code backticks, since a heading renders as plain text.
 */
function cleanTitle(t: string) {
  return t.replace(/^\d+\.\s*/, '').replace(/`/g, '').trim();
}

/** Pull the ordered-list items out of the quiz section. */
function parseQuestions(md: string): string[] {
  return [...md.matchAll(/^\s*\d+\.\s+(.+(?:\n(?!\s*\d+\.|\s*$).*)*)/gm)]
    .map((m) => m[1].replace(/\s+/g, ' ').trim())
    .filter((q) => q.length > 8);
}

/**
 * Interview cards: in the source, a bold **Q…** line followed by a blockquote
 * answer. That shape becomes a flip card in Interview Mode.
 */
type RawCard = { q: string; a: string };

function parseCards(md: string): RawCard[] {
  const cards: RawCard[] = [];
  const blocks = md.split(/\n(?=\*\*Q\d*\.|\*\*Senior follow-up)/);

  for (const block of blocks) {
    const qm = /^\*\*(?:Q\d*\.\s*)?(.+?)\*\*/s.exec(block.trim());
    if (!qm) continue;
    // `[ \t]`, not `\s` — `\s` matches the newline, so a bare `>` separator
    // line would swallow the line after it and keep its own marker, nesting
    // the rest of the answer in a second blockquote.
    const answer = [...block.matchAll(/^>[ \t]?(.*)$/gm)].map((m) => m[1]).join('\n');
    if (!answer.trim()) continue;
    cards.push({
      // The question is rendered as plain text, so drop the markdown marks
      // rather than leaking backticks into a flashcard.
      q: qm[1]
        .replace(/^Senior follow-up:\s*/i, '')
        .replace(/["“”]/g, '')
        .replace(/[`*]/g, '')
        .trim(),
      a: answer.trim(),
    });
  }
  return cards;
}

/** The answer keeps its markdown — code spans matter in a JS answer. */
async function renderCards(raw: RawCard[]): Promise<InterviewCard[]> {
  return Promise.all(raw.map(async (c) => ({ q: c.q, aHtml: await toHtml(c.a) })));
}

const WPM = 210;

/* ---------------------------------------------------------------- */
/* public API                                                         */
/* ---------------------------------------------------------------- */

async function readLesson(l: IndexedLesson): Promise<string | null> {
  try {
    return await fs.readFile(path.join(CONTENT_ROOT, l.module.dir, `${l.file}.md`), 'utf8');
  } catch {
    return null;
  }
}

/**
 * The shared markdown → steps pipeline, used by both lessons and topics.
 *
 * Everything above the first `##` is treated as front-matter prose — for
 * lessons that's the lede, for topics the metadata header (title, checklist
 * anchor, owning-lesson links) is stripped before this is called.
 */
async function stepsFromMd(content: string, prefixBase: string) {
  const raws = splitOnH2(content);

  const steps: Step[] = [];
  let cards: InterviewCard[] = [];
  let totalWords = 0;
  const sidecar = await loadSidecar();

  for (const [index, s] of raws.entries()) {
    if (!s.body) continue;
    const kind = kindOf(s.title);
    const { body, authored } = liftAuthoredNarration(s.body);
    const words = body.split(/\s+/).filter(Boolean).length;
    totalWords += words;
    const narration: NarrationNotes = {};

    // Only interview steps are card-parsed: elsewhere a bold lead-in
    // followed by a blockquote is ordinary prose, not a question.
    const stepCards = kind === 'interview' ? await renderCards(parseCards(body)) : [];
    if (stepCards.length) cards = [...cards, ...stepCards];

    const prefix = `${prefixBase}${index}`;
    const html = await toHtml(body, { notes: narration, authored, sidecar, prefix });

    steps.push({
      id: `step-${index}`,
      index: steps.length,
      title: cleanTitle(s.title),
      kind,
      html,
      words,
      seconds: Math.max(20, Math.round((words / WPM) * 60)),
      questionsHtml: kind === 'quiz' ? await Promise.all(parseQuestions(body).map((q) => toHtml(q))) : [],
      cards: stepCards,
      narration,
    });
  }

  return {
    steps,
    cards,
    words: totalWords,
    minutes: Math.max(1, Math.round(totalWords / WPM)),
  };
}

export const getLesson = cache(
  async (moduleSlug: string, fileSlug: string): Promise<Lesson | null> => {
    const entry = LESSON_INDEX.find((l) => l.module.slug === moduleSlug && l.file === fileSlug);
    if (!entry) return null;

    const i = LESSON_INDEX.findIndex((l) => l.n === entry.n);
    const base = {
      ...entry,
      prev: LESSON_INDEX[i - 1] ?? null,
      next: LESSON_INDEX[i + 1] ?? null,
    };

    const raw = await readLesson(entry);
    if (!raw) {
      return {
        ...base,
        written: false,
        steps: [],
        cards: [],
        words: 0,
        minutes: estimateMinutes(entry),
      };
    }

    const { content } = matter(raw);
    const { steps, cards, words, minutes } = await stepsFromMd(content, 'n');

    return {
      ...base,
      written: true,
      steps,
      cards,
      words,
      minutes,
    };
  },
);

/**
 * Rewrite the markdown links that only make sense in the source tree into the
 * site's URLs. The topic files link to lessons with `../NNN-<file>.md` (relative
 * to topics/); served at /topics/<slug>/ those are dead. All topic lesson links
 * are Laravel lessons, so the module slug is a constant.
 */
function topicLinkRewrite(md: string): string {
  return md
    .replace(/\]\(\.\.\/(\d{3}-[\w-]+)\.md\)/g, '](/lessons/laravel/$1)')
    .replace(/\]\(\.\/topics\/(\d{2}-[\w-]+)\.md\)/g, (_, file: string) => {
      const slug = file.replace(/^\d{2}-/, '');
      return `](/topics/${slug})`;
    });
}

const TOPIC_DIR = '06-laravel/topics';

/**
 * The topic header: everything above the first `---`. Parses the H1 into the
 * title and the `**Checklist anchor:**` line into the description; both fall
 * back gracefully so a content bug degrades instead of breaking the build.
 */
function parseTopicHeader(raw: string): { title: string; description: string; body: string } {
  const sep = raw.indexOf('\n---');
  const header = (sep === -1 ? raw : raw.slice(0, sep)).trim();
  const body = (sep === -1 ? '' : raw.slice(sep + 4)).trim();

  const h1 = /^# Topic \d+ — (.+)$/m.exec(header);
  const anchor = /^\*\*Checklist anchor:\*\*\s*(.+)$/m.exec(header);

  return {
    title: (h1?.[1] ?? '').trim() || 'Laravel Topic',
    description: (anchor?.[1] ?? '').trim() || 'Laravel interview revision topic.',
    body,
  };
}

async function readTopicFile(t: TopicRef): Promise<string | null> {
  try {
    return await fs.readFile(path.join(CONTENT_ROOT, TOPIC_DIR, topicFile(t.n, t.slug)), 'utf8');
  } catch {
    return null;
  }
}

/** One topic, fully rendered — the TopicReader's input. */
export const getTopic = cache(async (slug: string): Promise<Topic | null> => {
  const ref = TOPIC_BY_SLUG.get(slug);
  if (!ref) return null;

  const i = TOPIC_INDEX.findIndex((t) => t.n === ref.n);
  const raw = await readTopicFile(ref);
  if (!raw) return null;

  const { title, description, body } = parseTopicHeader(raw);
  const { steps, cards, words, minutes } = await stepsFromMd(topicLinkRewrite(body), 't');

  // The topic list defines order; titles come from each neighbour's file.
  const withTitle = async (ref: TopicRef | null) => {
    if (!ref) return null;
    const rawNeighbour = await readTopicFile(ref);
    const t = rawNeighbour ? parseTopicHeader(rawNeighbour).title : `Topic ${ref.n}`;
    return { ...ref, title: t };
  };

  return {
    ...ref,
    title,
    description,
    steps,
    cards,
    words,
    minutes,
    prev: await withTitle(TOPIC_INDEX[i - 1] ?? null),
    next: await withTitle(TOPIC_INDEX[i + 1] ?? null),
  };
});

/**
 * Header-only read of every topic — the /topics index. No full pipeline, so it
 * stays cheap even as the topic count grows.
 */
export const getTopics = cache(async (): Promise<{ ref: TopicRef; title: string; description: string }[]> => {
  return Promise.all(
    TOPIC_INDEX.map(async (t) => {
      const raw = await readTopicFile(t);
      const { title, description } = raw ? parseTopicHeader(raw) : { title: `Topic ${t.n}`, description: '' };
      return { ref: t, title, description };
    }),
  );
});

export const getWrittenLessons = cache(async (): Promise<number[]> => {
  const written: number[] = [];
  await Promise.all(
    MODULES.map(async (m) => {
      let files: string[];
      try {
        files = await fs.readdir(path.join(CONTENT_ROOT, m.dir));
      } catch {
        return;
      }
      const present = new Set(files);
      for (const l of m.lessons) if (present.has(`${l.file}.md`)) written.push(l.n);
    }),
  );
  return written.sort((a, b) => a - b);
});

export type SearchRow = {
  /** Distinguishes lessons from topics: they share a number space, so the
   *  palette needs to tell them apart for keys and groups. */
  kind: 'lesson' | 'topic';
  n: number;
  title: string;
  module: string;
  moduleSlug: string;
  href: string;
  difficulty: number;
  frequency: number;
  written: boolean;
  terms: string;
  snippet: string;
};

export const getSearchIndex = cache(async (): Promise<SearchRow[]> => {
  const { SYNONYMS } = await import('./curriculum');

  const lessons = await Promise.all(
    LESSON_INDEX.map(async (l) => {
      const raw = await readLesson(l);
      const body = raw
        ? matter(raw)
            .content.replace(/```[\s\S]*?```/g, ' ')
            .replace(/[#>*_|`-]/g, ' ')
            .replace(/\s+/g, ' ')
        : '';

      const syn = SYNONYMS[l.title.toLowerCase()] ?? [];
      const headings = raw ? [...raw.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) => m[1]) : [];

      return {
        kind: 'lesson' as const,
        n: l.n,
        title: l.title,
        module: l.module.short,
        moduleSlug: l.module.slug,
        href: hrefOf(l),
        difficulty: l.difficulty,
        frequency: l.frequency,
        written: Boolean(raw),
        // One lowercase haystack: title + synonyms + headings + prose.
        terms: [l.title, ...syn, ...headings, l.why, body.slice(0, 2500)]
          .join(' ')
          .toLowerCase(),
        snippet: l.why,
      };
    }),
  );

  // Topics share the lesson shape so the palette can search both — the terms
  // haystack is title + checklist anchor + headings + prose, same as lessons.
  const topics = await Promise.all(
    TOPIC_INDEX.map(async (t) => {
      const raw = await readTopicFile(t);
      const { title, description, body } = raw ? parseTopicHeader(raw) : { title: `Topic ${t.n}`, description: '', body: '' };
      const headings = body ? [...body.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) => m[1]) : [];
      const prose = body
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/[#>*_|`-]/g, ' ')
        .replace(/\s+/g, ' ');

      return {
        kind: 'topic' as const,
        n: t.n,
        title,
        module: 'Laravel',
        moduleSlug: 'laravel',
        href: hrefOfTopic(t),
        difficulty: t.tier,
        frequency: 0,
        written: Boolean(raw),
        terms: [title, description, ...headings, prose.slice(0, 2500)].join(' ').toLowerCase(),
        snippet: description,
      };
    }),
  );

  return [...lessons, ...topics];
});

/** Graph nodes: every lesson, plus whether its file exists. */
export const getGraphData = cache(async () => {
  const written = new Set(await getWrittenLessons());
  return LESSON_INDEX.map((l) => ({
    n: l.n,
    title: l.title,
    href: hrefOf(l),
    module: l.module.slug,
    accent: l.module.accent,
    moduleNum: l.module.num,
    difficulty: l.difficulty,
    frequency: l.frequency,
    why: l.why,
    prereqs: l.prereqs,
    unlocks: LESSON_INDEX.filter((o) => o.prereqs.includes(l.n)).map((o) => o.n),
    written: written.has(l.n),
  }));
});

export type GraphNode = Awaited<ReturnType<typeof getGraphData>>[number];

export function titleOf(n: number) {
  return BY_N.get(n)?.title ?? `Lesson ${n}`;
}
