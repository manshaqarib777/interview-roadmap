import type { Metadata } from 'next';
import Link from 'next/link';

import { getWrittenLessons } from '@/lib/content';
import { LESSON_INDEX, MODULES, TOTAL_LESSONS, hrefOf } from '@/lib/curriculum';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, breadcrumbNode, graph } from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';
import { Achievements, ContinueCard, DashboardRail, ModuleGrid, StatsRow } from './dashboard-client';

/**
 * The home page keeps the title template's default (no `%s · Roadmap` suffix),
 * because "Interview Roadmap · Interview Roadmap" is how you waste the most
 * valuable 60 characters on the site.
 */
export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} — ${TOTAL_LESSONS} React, TypeScript & Next.js Interview Concepts`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
};

export default async function DashboardPage() {
  const written = await getWrittenLessons();

  // Highest interview-frequency lessons that actually exist — "if you only
  // have an hour before the interview, do these".
  const priority = LESSON_INDEX.filter((l) => written.includes(l.n))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 6);

  return (
    <div className="relative">
      <div className="mesh" />

      <JsonLd id="ld-home" data={graph(breadcrumbNode([{ name: 'Roadmap', path: '/' }]))} />

      <div className="page relative">
        <header className="mb-7">
          <p className="eyebrow mb-3">{TOTAL_LESSONS} concepts · {MODULES.length} modules · revise each in 10 min</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="max-w-2xl text-[2rem] leading-[1.12] font-bold tracking-tight text-balance sm:text-[2.4rem]">
              Interview revision, not a textbook
            </h1>
            <span className="pill">In progress</span>
          </div>
          <p className="mt-1.5 max-w-xl text-[15px] text-muted-foreground">
            {TOTAL_LESSONS} concepts across JavaScript, TypeScript, React, Next.js and Laravel. Each one
            is built to be revised in under ten minutes — definition, mental model, internals,
            trade-offs, cheat sheet.
          </p>
        </header>

        <div className="page-cols">
          <div className="min-w-0 space-y-9">
            <ContinueCard written={written} />

            <StatsRow writtenCount={written.length} />

            <section>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-sm font-semibold tracking-tight">Modules</h2>
                <Link href="/graph" className="text-[11.5px] text-faint transition-colors hover:text-foreground">
                  See the dependency map →
                </Link>
              </div>
              <ModuleGrid written={written} />
            </section>

            {priority.length > 0 && (
              <section>
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 className="text-sm font-semibold tracking-tight">Highest interview frequency</h2>
                  <span className="text-[11px] text-faint">If you only have an hour</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {priority.map((l) => (
                    <Link
                      key={l.n}
                      href={hrefOf(l)}
                      className={`panel lift spot acc-${l.module.accent} group flex items-center gap-3 p-3`}
                    >
                      <span className="num grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-[11px] font-semibold text-muted-foreground">
                        {l.frequency}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium">{l.title}</span>
                        <span className="block text-[11px] text-faint">{l.module.short}</span>
                      </span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-faint transition-transform group-hover:translate-x-0.5">
                        <path d="M9 6l6 6-6 6" strokeLinecap="round" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <Achievements />
          </div>

          <aside className="page-aside chrome no-print">
            <DashboardRail writtenCount={written.length} />
          </aside>
        </div>
      </div>
    </div>
  );
}
