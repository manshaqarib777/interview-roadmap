/**
 * The Laravel interview topics, as data.
 *
 * Every one of the 75 checklist topics (content/06-laravel/topics/NN-<slug>.md)
 * is a node: it belongs to a milestone (M13–M17), carries a tier from the
 * checklist's priority order (1 = must know, 2 = senior, 3 = full-stack edge),
 * and points at the curriculum lessons that own it. This is the parallel index
 * to LESSON_INDEX — topics are reference pages, not lessons, so they never join
 * the curriculum table or the progress store.
 *
 * The title is deliberately NOT here: each topic file's H1 is canonical, and
 * getTopic() parses it at build time. A duplicated title would silently drift
 * from the page's own h1, which the SEO layer forbids.
 *
 * Tuple format keeps 75 rows readable:
 *   [n, slug, milestone('M13'..'M17'), tier(1|2|3), owningLessons[]]
 */

export type MilestoneId = 'M13' | 'M14' | 'M15' | 'M16' | 'M17';

export type TopicRef = {
  /** 1–75 — the checklist's numbering */
  n: number;
  /** URL slug: the filename minus the "NN-" prefix ("26-queues" → "queues") */
  slug: string;
  milestone: MilestoneId;
  /** 1 = must know · 2 = senior-level · 3 = competitive advantage */
  tier: 1 | 2 | 3;
  /** Curriculum lesson numbers this topic is the drill-down for */
  owningLessons: number[];
};

type Row = [number, string, MilestoneId, 1 | 2 | 3, number[]];

/** The filename is derived so the slug and the file can never disagree. */
export function topicFile(n: number, slug: string) {
  return `${String(n).padStart(2, '0')}-${slug}.md`;
}

const rows = (list: Row[]): TopicRef[] =>
  list.map(([n, slug, milestone, tier, owningLessons]) => ({
    n,
    slug,
    milestone,
    tier,
    owningLessons,
  }));

/* Tiers come straight from the checklist's "Your Priority Order": topics it
   names get their listed tier; anything unlisted is a senior-level (2) topic. */

const topics = rows([
  // M13 · Fundamentals — L105–L110
  [1, 'laravel-fundamentals', 'M13', 1, [105, 106, 107]],
  [5, 'dependency-injection-service-container', 'M13', 1, [108]],
  [6, 'service-providers', 'M13', 2, [109]],
  [7, 'facades-contracts', 'M13', 2, [110]],
  [44, 'artisan', 'M13', 2, [107, 119]],
  [52, 'laravel-contracts', 'M13', 2, [110]],

  // M14 · Routing & Request Handling — L111–L114
  [2, 'routing', 'M14', 2, [111]],
  [3, 'middleware', 'M14', 1, [112]],
  [4, 'controllers', 'M14', 2, [113]],
  [22, 'laravel-blade', 'M14', 2, [114]],
  [25, 'http-responses', 'M14', 2, [113, 128]],

  // M15 · Eloquent & the Database — L115–L121
  [8, 'eloquent-orm', 'M15', 1, [115]],
  [9, 'eloquent-relationships', 'M15', 1, [116]],
  [10, 'eager-loading', 'M15', 2, [117]],
  [11, 'n1-problem', 'M15', 1, [117]],
  [12, 'query-optimization', 'M15', 1, [118]],
  [13, 'query-builder', 'M15', 2, [118]],
  [14, 'database-migrations', 'M15', 2, [119]],
  [15, 'database-transactions', 'M15', 1, [120]],
  [16, 'validation', 'M15', 1, [121]],
  [43, 'seeders', 'M15', 2, [119, 129]],
  [45, 'laravel-collections', 'M15', 2, [118]],
  [46, 'lazy-collections', 'M15', 2, [118]],
  [47, 'pagination', 'M15', 2, [118]],
  [48, 'model-events-observers', 'M15', 2, [115, 125]],
  [49, 'global-scopes', 'M15', 2, [115]],
  [50, 'soft-deletes', 'M15', 2, [115, 119]],
  [51, 'accessors-mutators', 'M15', 2, [115]],
  [63, 'database-indexing', 'M15', 1, [118, 119]],
  [64, 'transactions-concurrency', 'M15', 2, [120]],

  // M16 · Auth, Queues & Async — L122–L129
  [17, 'authentication', 'M16', 1, [122]],
  [18, 'authorization', 'M16', 1, [123]],
  [19, 'laravel-sanctum', 'M16', 2, [122, 133]],
  [20, 'laravel-passport', 'M16', 2, [122]],
  [21, 'laravel-fortify', 'M16', 2, [122]],
  [26, 'queues', 'M16', 1, [124]],
  [27, 'laravel-horizon', 'M16', 2, [124]],
  [28, 'events-listeners', 'M16', 1, [125]],
  [29, 'jobs-vs-events', 'M16', 2, [125]],
  [30, 'notifications', 'M16', 2, [126]],
  [31, 'mail', 'M16', 2, [126]],
  [32, 'laravel-scheduling', 'M16', 2, [126]],
  [33, 'caching', 'M16', 1, [127]],
  [34, 'redis', 'M16', 1, [127]],
  [35, 'rate-limiting', 'M16', 2, [128]],
  [36, 'files-storage', 'M16', 2, [128]],
  [37, 'laravel-security', 'M16', 1, [128]],
  [38, 'encryption-hashing', 'M16', 2, [128]],
  [41, 'laravel-testing', 'M16', 1, [129]],
  [42, 'laravel-factories', 'M16', 2, [129]],
  [58, 'events-vs-observers', 'M16', 2, [125]],
  [59, 'broadcasting-websockets', 'M16', 2, [124, 125]],
  [60, 'laravel-reverb', 'M16', 2, [124]],
  [65, 'queues-distributed-systems', 'M16', 2, [124]],

  // M17 · Senior & Full-Stack — L130–L134
  [23, 'api-development', 'M17', 1, [128, 133]],
  [24, 'api-resources', 'M17', 2, [133]],
  [39, 'laravel-logging', 'M17', 2, [131]],
  [40, 'exception-handling', 'M17', 2, [131, 133]],
  [53, 'service-layer', 'M17', 2, [130]],
  [54, 'repository-pattern', 'M17', 2, [130]],
  [55, 'solid', 'M17', 2, [130]],
  [56, 'design-patterns', 'M17', 2, [130]],
  [57, 'laravel-macros', 'M17', 2, [130]],
  [61, 'laravel-octane', 'M17', 2, [131]],
  [62, 'laravel-performance', 'M17', 2, [131]],
  [66, 'laravel-deployment', 'M17', 2, [131]],
  [67, 'production-optimization', 'M17', 2, [131]],
  [68, 'cicd', 'M17', 2, [131]],
  [69, 'laravel-react-inertia', 'M17', 3, [132]],
  [70, 'laravel-nextjs', 'M17', 3, [133]],
  [71, 'laravel-stripe', 'M17', 3, [133]],
  [72, 'multitenancy', 'M17', 2, [134]],
  [73, 'laravel-ai', 'M17', 3, [134]],
  [74, 'system-design', 'M17', 3, [134]],
  [75, 'senior-scenarios', 'M17', 2, [120, 131, 134]],
]);

export const TOTAL_TOPICS = topics.length;

export const TOPIC_INDEX = [...topics].sort((a, b) => a.n - b.n);

export const TOPIC_BY_SLUG = new Map(TOPIC_INDEX.map((t) => [t.slug, t]));

export const BY_TOPIC_N = new Map(TOPIC_INDEX.map((t) => [t.n, t]));

export function topicHref(slug: string) {
  return `/topics/${slug}`;
}

export function hrefOfTopic(t: { slug: string }) {
  return topicHref(t.slug);
}

/** Milestones in order, with the topic numbers that belong to each. */
export const TOPIC_MILESTONES = ['M13', 'M14', 'M15', 'M16', 'M17'] as const;

export const TIER_LABEL: Record<1 | 2 | 3, string> = {
  1: 'Must know',
  2: 'Senior-level',
  3: 'Competitive edge',
};

export const TIER_LABEL_SHORT: Record<1 | 2 | 3, string> = {
  1: 'Tier 1',
  2: 'Tier 2',
  3: 'Tier 3',
};
