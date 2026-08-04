/**
 * Shared pieces for the generated Open Graph cards.
 *
 * These render through Satori, not a browser: it implements a deliberate
 * subset of CSS. Two consequences shape everything below —
 *   1. every flex container needs its `display: flex` spelled out;
 *   2. the mark is passed in as an SVG data URI rather than as JSX `<svg>`,
 *      which is the one path guaranteed to rasterise identically to the
 *      favicon.
 */

import fs from 'node:fs';
import path from 'node:path';

export const OG_SIZE = { width: 1200, height: 630 };

const PAPER = '#ffffff';

/**
 * Brand art as a base64 data URI.
 *
 * Satori can't fetch a relative path — an `<img src="/logo.png">` has no origin
 * to resolve against during a build — so the bytes are inlined. Read once per
 * process and memoised: 104 lesson cards would otherwise re-read the same file
 * 104 times.
 */
const assetCache = new Map<string, string>();

export function asset(file: string) {
  const hit = assetCache.get(file);
  if (hit) return hit;
  const bytes = fs.readFileSync(path.join(process.cwd(), 'public', file));
  const uri = `data:image/png;base64,${bytes.toString('base64')}`;
  assetCache.set(file, uri);
  return uri;
}

/** The full lockup, white-ink variant, for the dark card. */
export const lockupUri = () => asset('logo-lockup.png');

/** The square tiled mark, for cards where the lockup would crowd the text. */
export const markUri = () => asset('icon-192.png');

/** Native lockup aspect, so callers can scale by height without distortion. */
export const LOCKUP_RATIO = 480 / 111;

/** Hard character cap — Satori has no line clamping, so truncate the string. */
export function clamp(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: '#171717',
        // One soft highlight instead of the site's animated mesh — enough to
        // stop 1200x630 of flat grey reading as an error page.
        backgroundImage:
          'radial-gradient(1000px 520px at 88% -12%, rgba(255,255,255,0.10), transparent 62%)',
        color: '#ececec',
        fontFamily: 'sans-serif',
      }}
    >
      {children}
    </div>
  );
}

/** The lockup carries the name and tagline itself — no text beside it. */
export function Wordmark({ height = 62 }: { height?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={lockupUri()} height={height} width={Math.round(height * LOCKUP_RATIO)} alt="" />
    </div>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 20px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.14)',
        fontSize: 24,
        color: '#d9d9d9',
      }}
    >
      {children}
    </div>
  );
}

export function Footer({ left, right }: { left: string; right: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 22,
        color: '#8f8f8f',
      }}
    >
      <div style={{ display: 'flex', letterSpacing: 2 }}>{left}</div>
      <div style={{ display: 'flex' }}>{right}</div>
    </div>
  );
}
