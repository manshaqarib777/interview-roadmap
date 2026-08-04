import { ImageResponse } from 'next/og';

import { getLesson } from '@/lib/content';
import { DIFFICULTY_LABEL, LESSON_INDEX, TOTAL_LESSONS, estimateMinutes } from '@/lib/curriculum';
import { Chip, Footer, Frame, OG_SIZE, clamp, markUri } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Interview Roadmap lesson';

type Params = { module: string; slug: string };

/** One card per lesson, all 104 generated at build time. */
export function generateStaticParams(): Params[] {
  return LESSON_INDEX.map((l) => ({ module: l.module.slug, slug: l.file }));
}

export default async function Image({ params }: { params: Promise<Params> }) {
  const { module: modSlug, slug } = await params;
  const entry =
    LESSON_INDEX.find((l) => l.module.slug === modSlug && l.file === slug) ?? LESSON_INDEX[0];

  /* Read the real lesson so the card's read time is the word-count figure the
     page itself shows. A share card promising 15 minutes for a 10-minute page
     is a small lie that costs trust on the click. Falls back to the pre-write
     estimate for lessons that have no file yet. */
  const full = await getLesson(entry.module.slug, entry.file);
  const lesson = entry;
  const minutes = full?.written ? full.minutes : estimateMinutes(entry);

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
            {`Lesson ${lesson.n} of ${TOTAL_LESSONS} · ${lesson.module.title}`}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markUri()} width={56} height={56} alt="" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div
            style={{
              display: 'flex',
              fontSize: lesson.title.length > 34 ? 60 : 72,
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: -2,
              color: '#ffffff',
            }}
          >
            {clamp(lesson.title, 62)}
          </div>
          <div style={{ display: 'flex', fontSize: 27, lineHeight: 1.4, color: '#b4b4b4', maxWidth: 950 }}>
            {clamp(lesson.why, 130)}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            <Chip>{`Asked in ${lesson.frequency}%`}</Chip>
            <Chip>{`${minutes} min read`}</Chip>
            <Chip>{DIFFICULTY_LABEL[lesson.difficulty]}</Chip>
          </div>
        </div>

        <Footer left="INTERVIEW ROADMAP" right={`${lesson.module.short} · L${lesson.n}`} />
      </Frame>
    ),
    size,
  );
}
