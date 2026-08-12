import type { Metadata } from 'next';

import { getGraphData } from '@/lib/content';
import { TOTAL_LESSONS } from '@/lib/curriculum';
import { breadcrumbNode, graph } from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';
import { KnowledgeGraph } from '@/components/knowledge-graph';

export const metadata: Metadata = {
  title: 'Knowledge Graph — Every Concept and Its Prerequisites',
  description: `All ${TOTAL_LESSONS} JavaScript, TypeScript, React, Next.js and Laravel concepts as one dependency map: nodes are concepts, edges are prerequisites, laid out left to right in the order you should learn them.`,
  keywords: [
    'frontend learning path',
    'react learning roadmap',
    'javascript prerequisites',
    'interview preparation plan',
  ],
  alternates: { canonical: '/graph' },
  openGraph: {
    type: 'website',
    url: '/graph',
    title: 'Knowledge Graph — Every Concept and Its Prerequisites',
    description:
      'Nodes are concepts, edges are prerequisites. The map lights up as you learn.',
  },
};

/**
 * The one page that stays full-bleed.
 *
 * Its right rail is the selection panel inside the canvas — a second, static
 * rail beside it would take width from the map and duplicate what clicking a
 * node already shows.
 */
export default async function GraphPage() {
  const nodes = await getGraphData();

  return (
    <div className="flex h-[calc(100dvh-var(--topbar-h))] flex-col">
      <JsonLd
        id="ld-graph"
        data={graph(
          breadcrumbNode([
            { name: 'Roadmap', path: '/' },
            { name: 'Knowledge graph', path: '/graph' },
          ]),
        )}
      />

      <div className="chrome flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b px-4 py-3 sm:px-6">
        <h1 className="text-base font-semibold tracking-tight">Knowledge Graph</h1>
        <p className="text-[12.5px] text-muted-foreground">
          Left to right is prerequisite order. Hover a node to isolate its dependencies; click for
          detail.
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <KnowledgeGraph nodes={nodes} />
      </div>
    </div>
  );
}
