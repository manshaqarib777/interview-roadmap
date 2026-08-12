import { ImageResponse } from 'next/og';

import { MODULES, TOTAL_LESSONS } from '@/lib/curriculum';
import { Chip, Footer, Frame, OG_SIZE, Wordmark } from '@/lib/og';
import { SITE_URL } from '@/lib/seo';

export const alt = `Interview Roadmap — ${TOTAL_LESSONS} React, TypeScript and Next.js concepts, each revisable in ten minutes`;
export const size = OG_SIZE;
export const contentType = 'image/png';

/** The card that appears when the site root is shared. */
export default function Image() {
  return new ImageResponse(
    (
      <Frame>
        <Wordmark />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 66,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              color: '#ffffff',
            }}
          >
            {TOTAL_LESSONS} concepts. Ten minutes each.
          </div>
          <div style={{ display: 'flex', fontSize: 28, color: '#b4b4b4', maxWidth: 900 }}>
            Senior-level full-stack interview revision — definition, mental model, internals,
            trade-offs, cheat sheet.
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            {MODULES.map((m) => (
              <Chip key={m.slug}>{m.short}</Chip>
            ))}
          </div>
        </div>

        <Footer left="RUNNABLE CODE · STEP DEBUGGER · FLASHCARDS" right={SITE_URL.replace(/^https?:\/\//, '')} />
      </Frame>
    ),
    size,
  );
}
