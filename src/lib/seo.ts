/**
 * One source of truth for everything a crawler reads.
 *
 * Titles, descriptions, canonicals and structured data all derive from the
 * curriculum table rather than being written twice — so a lesson can't end up
 * with a `<title>` that disagrees with its `<h1>`, which is the single most
 * common on-page SEO defect in content sites this size.
 */

import { DIFFICULTY_LABEL, type IndexedLesson, type ModuleDef } from './curriculum';

/**
 * The canonical origin. Every absolute URL — canonicals, OG images, sitemap
 * entries, JSON-LD `@id`s — is built from this, so pointing the site at a real
 * domain is a one-line change.
 *
 * Set NEXT_PUBLIC_SITE_URL in the environment before the production build.
 * Duplicate content across two hostnames is the fastest way to lose ranking,
 * and a wrong canonical is worse than no canonical.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://interview-roadmap.vercel.app')
  .replace(/\/+$/, '');

export const SITE_NAME = 'Interview Roadmap';
export const SITE_TAGLINE = 'React · TypeScript · Next.js interview prep';
export const AUTHOR = 'Interview Roadmap';
export const LOCALE = 'en_US';

export const SITE_DESCRIPTION =
  'Senior-level frontend interview revision: 104 concepts across JavaScript, TypeScript, React and Next.js, each revisable in under ten minutes with runnable code, a step debugger and interview flashcards.';

/** Absolute URL for a site-relative path. */
export function url(path = '/') {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/* ---------------------------------------------------------------- */
/* Keywords                                                          */
/*                                                                   */
/* Keywords are not a ranking factor and haven't been for years. They  */
/* are kept short and honest here because some aggregators and         */
/* internal search tools still read them — not as a ranking play.      */
/* ---------------------------------------------------------------- */

export const SITE_KEYWORDS = [
  'frontend interview questions',
  'react interview questions',
  'typescript interview questions',
  'next.js interview questions',
  'javascript interview preparation',
  'senior frontend engineer interview',
  'closures',
  'event loop',
  'react hooks',
  'server components',
];

export function lessonKeywords(lesson: IndexedLesson): string[] {
  return [
    `${lesson.title} interview question`,
    `${lesson.title} explained`,
    `${lesson.module.short} interview questions`,
    'frontend interview preparation',
  ];
}

/* ---------------------------------------------------------------- */
/* Titles and descriptions                                           */
/* ---------------------------------------------------------------- */

/**
 * A lesson's meta description.
 *
 * Uses the curriculum's `why` line — written for humans, one sentence, already
 * says what the reader gains — then appends the concrete signals (module,
 * frequency, read time) that make a SERP snippet worth clicking. Capped near
 * 155 characters because Google truncates around there on desktop.
 */
export function lessonDescription(lesson: IndexedLesson, minutes: number) {
  const lead = lesson.why.replace(/\s+/g, ' ').trim();
  const tail = ` ${lesson.module.short} · asked in ${lesson.frequency}% of interviews · ${minutes} min read.`;
  const budget = 158 - tail.length;
  const head = lead.length > budget ? `${lead.slice(0, budget - 1).trimEnd()}…` : lead;
  return head + tail;
}

/** `Closures — JavaScript Interview Prep` reads better in a SERP than a bare title. */
export function lessonTitle(lesson: IndexedLesson) {
  return `${lesson.title} — ${lesson.module.short} Interview Prep`;
}

/* ---------------------------------------------------------------- */
/* JSON-LD                                                           */
/*                                                                   */
/* Emitted as one `@graph` per page rather than several loose script  */
/* tags: nodes can then reference each other by `@id`, which is how   */
/* you tell a crawler "this lesson belongs to that course, published  */
/* by that organisation" instead of three unrelated assertions.       */
/* ---------------------------------------------------------------- */

type Json = Record<string, unknown>;

const ORG_ID = url('/#organization');
const SITE_ID = url('/#website');
const COURSE_ID = url('/#course');

export function organizationNode(): Json {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: url('/'),
    description: SITE_DESCRIPTION,
    logo: {
      '@type': 'ImageObject',
      url: url('/icon-512.png'),
      width: 512,
      height: 512,
      caption: SITE_NAME,
    },
  };
}

export function websiteNode(): Json {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: url('/'),
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: 'en',
    publisher: { '@id': ORG_ID },
    // Declares the ⌘K palette as the site's search endpoint. Harmless if
    // Google never renders a sitelinks searchbox; correct if it does.
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: url('/?q={search_term_string}') },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** The whole curriculum as one Course, with each module as a part. */
export function courseNode(modules: ModuleDef[], totalLessons: number): Json {
  return {
    '@type': 'Course',
    '@id': COURSE_ID,
    url: url('/'),
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    inLanguage: 'en',
    provider: { '@id': ORG_ID },
    educationalLevel: 'Intermediate to advanced',
    teaches: modules.map((m) => m.title),
    numberOfLessons: totalLessons,
    isAccessibleForFree: true,
    // A self-paced online course with no fixed schedule is exactly what
    // `courseWorkload` + `courseMode: online` is for.
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT18H',
      inLanguage: 'en',
    },
    hasPart: modules.map((m) => ({
      '@type': 'Course',
      '@id': url(`/#module-${m.slug}`),
      name: m.title,
      description: m.blurb,
      provider: { '@id': ORG_ID },
      numberOfLessons: m.lessons.length,
      isAccessibleForFree: true,
    })),
  };
}

export function breadcrumbNode(trail: { name: string; path?: string }[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: url(item.path) } : {}),
    })),
  };
}

/**
 * A single lesson.
 *
 * `LearningResource` rather than `Article`: this is study material with
 * prerequisites and a difficulty, and the vocabulary for that exists. The
 * prereq edges become `competencyRequired`, which is the closest schema.org
 * has to the dependency graph the site is built around.
 */
export function lessonNode(
  lesson: IndexedLesson,
  opts: { minutes: number; words: number; prereqs: IndexedLesson[]; path: string },
): Json {
  return {
    '@type': ['LearningResource', 'Article'],
    '@id': url(`${opts.path}#lesson`),
    url: url(opts.path),
    name: lesson.title,
    headline: lessonTitle(lesson),
    description: lessonDescription(lesson, opts.minutes),
    inLanguage: 'en',
    isPartOf: { '@id': COURSE_ID },
    isAccessibleForFree: true,
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    learningResourceType: ['Lesson', 'Reference material'],
    educationalLevel: DIFFICULTY_LABEL[lesson.difficulty] || 'Intermediate',
    teaches: lesson.title,
    about: {
      '@type': 'DefinedTerm',
      name: lesson.title,
      inDefinedTermSet: {
        '@type': 'DefinedTermSet',
        name: `${lesson.module.title} concepts`,
      },
    },
    timeRequired: `PT${Math.max(1, opts.minutes)}M`,
    ...(opts.words > 0 ? { wordCount: opts.words } : {}),
    ...(opts.prereqs.length > 0
      ? {
          competencyRequired: opts.prereqs.map((p) => ({
            '@type': 'DefinedTerm',
            name: p.title,
            url: url(`/lessons/${p.module.slug}/${p.file}`),
          })),
        }
      : {}),
  };
}

/** Wraps nodes into the `@graph` envelope that goes in the script tag. */
export function graph(...nodes: Json[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
