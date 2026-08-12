import type { Metadata } from 'next';
import Link from 'next/link';

import { getTopics } from '@/lib/content';
import { MODULES } from '@/lib/curriculum';
import { TIER_LABEL_SHORT, TOPIC_MILESTONES, hrefOfTopic } from '@/lib/topics';
import { SITE_NAME, breadcrumbNode, graph, url } from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';

export const metadata: Metadata = {
  title: 'Laravel Interview Topics — 75 Checklist Topics',
  description:
    'All 75 topics from the Laravel interview master checklist, each as its own revision page — fundamentals, Eloquent, queues, security, and the senior scenarios.',
  alternates: { canonical: '/topics' },
  openGraph: {
    type: 'website',
    url: '/topics',
    title: 'Laravel Interview Topics — 75 Checklist Topics',
    description:
      'All 75 topics from the Laravel interview master checklist, each as its own revision page — fundamentals, Eloquent, queues, security, and the senior scenarios.',
    siteName: SITE_NAME,
  },
};

/** The Laravel module is MODULES[5]; its milestones carry the M13–M17 titles. */
const MILESTONE_TITLES = new Map(
  MODULES[5].milestones.map((m) => [m.id, m.title] as const),
);

export default async function TopicsIndexPage() {
  const topics = await getTopics();
  const byMilestone = (id: string) =>
    topics.filter((t) => t.ref.milestone === id).sort((a, b) => a.ref.n - b.ref.n);

  return (
    <div className="page">
      <JsonLd
        id="ld-topics"
        data={graph(
          breadcrumbNode([
            { name: 'Roadmap', path: '/' },
            { name: 'Laravel topics', path: '/topics' },
          ]),
        )}
      />

      <header className="mb-7">
        <p className="eyebrow mb-3">Laravel · 75 topics · tiered by priority</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="max-w-2xl text-[2rem] leading-[1.12] font-bold tracking-tight text-balance sm:text-[2.4rem]">
            Laravel interview topics
          </h1>
        </div>
        <p className="mt-1.5 max-w-xl text-[15px] text-muted-foreground">
          Every topic from the master checklist as its own revision page. Tier 1 is must-know,
          Tier 2 is senior-level, Tier 3 is your full-stack edge.
        </p>
      </header>

      <div className="space-y-9">
        {TOPIC_MILESTONES.map((id) => {
          const title = MILESTONE_TITLES.get(id) ?? id;
          const items = byMilestone(id);
          return (
            <section key={id}>
              <div className="mb-3 flex items-baseline gap-2">
                <h2 className="text-sm font-semibold tracking-tight">{id} · {title}</h2>
                <span className="num text-[11px] text-faint">{items.length} topics</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((t) => (
                  <Link
                    key={t.ref.n}
                    href={hrefOfTopic(t.ref)}
                    className="panel lift spot group flex flex-col gap-1.5 p-3"
                  >
                    <span className="flex items-center gap-2">
                      <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-muted text-[11px] font-semibold text-muted-foreground">
                        T{t.ref.n}
                      </span>
                      <span className="chip shrink-0 text-[10px]">
                        {TIER_LABEL_SHORT[t.ref.tier]}
                      </span>
                    </span>
                    <span className="mt-1 block text-[13.5px] leading-snug font-medium">
                      {t.title}
                    </span>
                    {t.description && (
                      <span className="line-clamp-2 block text-[11.5px] leading-snug text-faint">
                        {t.description}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
