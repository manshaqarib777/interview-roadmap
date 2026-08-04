'use client';

import { useEffect } from 'react';

/**
 * Cursor spotlight.
 *
 * One delegated listener on the document, rAF-throttled, writing two CSS
 * custom properties on whichever `.spot` element is under the pointer. The
 * gradient itself is pure CSS — React never re-renders, so this stays at
 * 60fps no matter how many cards are on screen.
 */
export function Spotlight() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Coarse pointers have no hover state; the listener would be dead weight.
    if (!window.matchMedia('(hover: hover)').matches) return;

    let frame = 0;
    let pending: { el: HTMLElement; x: number; y: number } | null = null;

    const flush = () => {
      frame = 0;
      if (!pending) return;
      const { el, x, y } = pending;
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
      pending = null;
    };

    const onMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('.spot');
      if (!el) return;
      const r = el.getBoundingClientRect();
      pending = { el, x: e.clientX - r.left, y: e.clientY - r.top };
      if (!frame) frame = requestAnimationFrame(flush);
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}

/** Fixed monochrome noise over the whole page. ~3% opacity, zero cost. */
export function Grain() {
  return <div className="grain" aria-hidden />;
}
