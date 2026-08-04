'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { MODULES } from '@/lib/curriculum';
import { Icon } from './icons';

/**
 * The bar's left cluster: collapse control, back, breadcrumbs.
 *
 * Rail state lives on <html> as a data attribute, not in React. Two reasons:
 * the pre-paint script in layout.tsx can set it before anything renders (no
 * shift), and CSS alone can then reflow the frame — so collapsing the rail
 * costs no re-render anywhere in the tree.
 */
export function RailToggle() {
  const toggle = () => {
    const el = document.documentElement;

    // Below lg the rail is a drawer over the content, so the same control
    // opens it rather than collapsing it.
    if (!window.matchMedia('(min-width: 1024px)').matches) {
      el.dataset.drawer = el.dataset.drawer === 'open' ? 'closed' : 'open';
      return;
    }

    const next = el.dataset.rail === 'collapsed' ? 'open' : 'collapsed';
    el.dataset.rail = next;
    try {
      localStorage.setItem('roadmap:rail', next);
    } catch {
      /* private mode — the rail just won't remember */
    }
  };

  return (
    <button onClick={toggle} className="icon-btn shrink-0" aria-label="Toggle navigation" title="Toggle navigation">
      <span className="lg:hidden">
        <Icon name="menu" size={17} />
      </span>
      <span className="rail-chevron hidden lg:grid">
        <Icon name="chevronRight" size={17} />
      </span>
    </button>
  );
}

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  if (pathname === '/') return null;

  return (
    <button onClick={() => router.back()} className="back-btn shrink-0" aria-label="Go back">
      <Icon name="chevronRight" size={14} className="rotate-180" />
      <span className="hidden sm:inline">Back</span>
    </button>
  );
}

type Crumb = { label: string; href?: string; accent?: string };

function crumbsFor(pathname: string): Crumb[] {
  if (pathname === '/') return [{ label: 'Dashboard' }];
  if (pathname === '/graph') return [{ label: 'Roadmap', href: '/' }, { label: 'Knowledge graph' }];
  if (pathname === '/bookmarks') return [{ label: 'Roadmap', href: '/' }, { label: 'Saved' }];

  const lesson = pathname.match(/^\/lessons\/([^/]+)\/([^/]+)/);
  if (lesson) {
    const [, modSlug, file] = lesson;
    const mod = MODULES.find((m) => m.slug === modSlug);
    const l = mod?.lessons.find((x) => x.file === file);
    return [
      { label: 'Roadmap', href: '/' },
      { label: mod?.short ?? modSlug, accent: mod?.accent },
      { label: l ? `L${l.n} · ${l.title}` : file },
    ];
  }

  return [{ label: 'Roadmap', href: '/' }];
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const crumbs = crumbsFor(pathname);

  return (
    <nav aria-label="Breadcrumb" className="crumbs min-w-0">
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          /* Narrow screens keep only the leaf crumb — separators go with the
             labels they separate, otherwise you get a row of stray slashes. */
          <span
            key={`${c.label}-${i}`}
            className={`min-w-0 items-center gap-2 ${last ? 'flex flex-1' : 'hidden sm:flex'}`}
          >
            {i > 0 && <span className="crumb-sep hidden sm:inline">/</span>}
            {c.accent && (
              <span className={`acc-${c.accent} h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--acc)]`} />
            )}
            {c.href && !last ? (
              <Link href={c.href} className="crumb">
                {c.label}
              </Link>
            ) : (
              <span className={last ? 'crumb-current' : 'crumb'}>{c.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
