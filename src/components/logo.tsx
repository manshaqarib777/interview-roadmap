import Image from 'next/image';

import lockupDark from '../../public/logo-lockup.png';
import lockupLight from '../../public/logo-lockup-light.png';
import markTile from '../../public/icon-192.png';

/**
 * The brand lockup.
 *
 * Two rasters, not one: the artwork's wordmark and route are white, so it
 * needs an ink-inverted twin to survive a white page. The swap is CSS
 * (`dark:` variants), so both files are in the initial HTML and switching
 * theme costs no request and can't flash.
 *
 * Statically imported rather than referenced by string path — that gives
 * next/image the real intrinsic dimensions at build time, so the row reserves
 * its height before the bytes land and nothing shifts.
 */
export function Lockup({ width = 208, className = '' }: { width?: number; className?: string }) {
  // Width-driven, because what it has to fit is the rail's inner width — the
  // height follows from the artwork's own aspect ratio.
  const height = Math.round((width * lockupDark.height) / lockupDark.width);
  const common = { width, height, priority: true, sizes: `${width}px` };

  return (
    <span className={`inline-flex shrink-0 items-center ${className}`} style={{ height, width }}>
      <Image {...common} src={lockupDark} alt="Interview Roadmap" className="hidden h-auto w-full dark:block" />
      <Image {...common} src={lockupLight} alt="Interview Roadmap" className="h-auto w-full dark:hidden" />
    </span>
  );
}

/**
 * Square mark for the collapsed rail.
 *
 * Deliberately the *tiled* icon rather than the transparent mark: the route and
 * its waypoints are white, and on a light surface a bare mark loses them.
 */
export function LogoMark({ size = 30, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src={markTile}
      alt="Interview Roadmap"
      width={size}
      height={size}
      priority
      className={`shrink-0 rounded-[9px] ${className}`}
    />
  );
}
