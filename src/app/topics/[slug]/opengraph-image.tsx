import { ImageResponse } from 'next/og';

import { getTopic } from '@/lib/content';
import { TIER_LABEL, TOPIC_INDEX, TOTAL_TOPICS } from '@/lib/topics';
import { Chip, Footer, Frame, OG_SIZE, clamp, markUri } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Interview Roadmap topic';

type Params = { slug: string };

/** One card per topic, all 75 generated at build time. */
export function generateStaticParams(): Params[] {
  return TOPIC_INDEX.map((t) => ({ slug: t.slug }));
}

export default async function Image({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const topic = await getTopic(slug);
  const ref = TOPIC_INDEX.find((t) => t.slug === slug);

  return new ImageResponse(
    (
      <Frame>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: '#8f8f8f',
            }}
          >
            {`Topic ${ref?.n ?? '—'} of ${TOTAL_TOPICS} · Laravel`}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markUri()} width={56} height={56} alt="" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div
            style={{
              display: 'flex',
              fontSize: (topic?.title.length ?? 0) > 34 ? 60 : 72,
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: -2,
              color: '#ffffff',
            }}
          >
            {clamp(topic?.title ?? 'Laravel Topic', 62)}
          </div>
          <div style={{ display: 'flex', fontSize: 27, lineHeight: 1.4, color: '#b4b4b4', maxWidth: 950 }}>
            {clamp(topic?.description ?? 'Laravel interview revision.', 130)}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            {ref && <Chip>{TIER_LABEL[ref.tier]}</Chip>}
            {ref && <Chip>{ref.milestone}</Chip>}
            <Chip>{`${topic?.minutes ?? 10} min read`}</Chip>
          </div>
        </div>

        <Footer left="INTERVIEW ROADMAP" right="LARAVEL INTERVIEW TOPICS" />
      </Frame>
    ),
    size,
  );
}
