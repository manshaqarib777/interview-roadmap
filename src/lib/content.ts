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
  BY_N,
  LESSON_INDEX,
  MODULES,
  estimateMinutes,
  hrefOf,
  type IndexedLesson,
} from './curriculum';

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

async function toHtml(md: string): Promise<string> {
  const file = await unified()
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
    } as never)
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
    // Everything above the first ## is front-matter prose; the reader shows it
    // as the lesson lede rather than a step.
    const raws = splitOnH2(content);

    const steps: Step[] = [];
    let cards: InterviewCard[] = [];
    let totalWords = 0;

    for (const [index, s] of raws.entries()) {
      if (!s.body) continue;
      const kind = kindOf(s.title);
      const words = s.body.split(/\s+/).filter(Boolean).length;
      totalWords += words;

      // Only interview steps are card-parsed: elsewhere a bold lead-in
      // followed by a blockquote is ordinary prose, not a question.
      const stepCards = kind === 'interview' ? await renderCards(parseCards(s.body)) : [];
      if (stepCards.length) cards = [...cards, ...stepCards];

      steps.push({
        id: `step-${index}`,
        index: steps.length,
        title: cleanTitle(s.title),
        kind,
        html: await toHtml(s.body),
        words,
        seconds: Math.max(20, Math.round((words / WPM) * 60)),
        questionsHtml:
          kind === 'quiz' ? await Promise.all(parseQuestions(s.body).map(toHtml)) : [],
        cards: stepCards,
      });
    }

    return {
      ...base,
      written: true,
      steps,
      cards,
      words: totalWords,
      minutes: Math.max(1, Math.round(totalWords / WPM)),
    };
  },
);

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

  return Promise.all(
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
