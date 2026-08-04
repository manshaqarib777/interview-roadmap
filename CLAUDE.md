# CLAUDE.md — working rules for this repository

Instructions for Claude Code (and any other agent or human) working in this repo.
Read this before touching a file. It documents the decisions that are already
made, so they don't get re-litigated or accidentally reversed.

---

## What this is

A static curriculum site. **Content and app are separate, and the separation is
load-bearing:**

```
content/       ← the lessons, plain .md — the single source of truth
src/           ← the Next.js app that renders them
exercises/     ← runnable .js files for the coding tasks
public/        ← manifest icons only
```

Markdown → HTML and syntax highlighting happen **at build time** (`src/lib/content.ts`).
Nothing is per-request; every route is prerendered. Editing a `.md` file is all it
takes to change a page — never hard-code lesson prose into a component.

**The curriculum is data.** `src/lib/curriculum.ts` holds all 104 lessons as tuples
(number, title, file, difficulty, interview frequency, prerequisites, why-it-matters).
The dashboard, the knowledge graph, breadcrumbs, sitemap, OG cards and JSON-LD are all
projections of that one table. Add a lesson there, and every one of those updates.
Never duplicate curriculum facts in a component.

---

## Commands

```bash
npm run dev        # http://localhost:3000
npm run build      # prerenders 109 pages + 104 OG images (~50s)
npm run typecheck  # tsc --noEmit
npm run verify     # typecheck + build — run this before every commit
```

There is **no ESLint setup** in this project (`next lint` was removed in Next 16 and
no flat config was added). `npm run verify` is the gate. If you want linting, add it
deliberately — `npm i -D eslint eslint-config-next` plus an `eslint.config.mjs` — and
wire it into `verify` and CI in the same change.

---

## Architecture

| Path | Responsibility |
|---|---|
| `src/lib/curriculum.ts` | The 104-lesson table + derived indexes. Pure data, no I/O. |
| `src/lib/content.ts` | Reads `content/*.md`, parses to steps/cards, highlights code. Build-time only, `cache()`d. |
| `src/lib/seo.ts` | Every title, description, canonical and JSON-LD node. One source of truth. |
| `src/lib/store.ts` | All learner state (progress, bookmarks, prefs) in localStorage. |
| `src/lib/og.tsx` | Shared pieces for generated Open Graph cards (Satori-safe CSS only). |
| `src/app/layout.tsx` | The frame: rail, breadcrumb bar, site-wide JSON-LD, pre-paint script. |
| `src/components/` | UI. Client components only where interaction demands it. |

**Load-bearing details that look like details but aren't:**

- **`@theme inline` in `globals.css`.** Without `inline`, Tailwind can't build
  `color-mix()` from a `var()` and silently drops opacity modifiers — `bg-primary/12`
  compiles fully opaque. Don't remove it.
- **The pre-paint script in `layout.tsx`** sets `class="dark"` and `data-rail` on
  `<html>` before first paint. Theme and rail width are therefore **CSS state, not
  React state** — that's what prevents a flash and a hydration mismatch. Never move
  them into React state.
- **`ProseBlock` is memoised on the HTML string** because `useEnhancedCode` mutates
  that subtree afterwards (it replaces every `<pre>` with a Run/Debug panel). A
  re-render that re-applied `dangerouslySetInnerHTML` would destroy an open debugger.
- **`dynamicParams = false`** on the lesson route: unknown slugs 404 instead of
  attempting a runtime render.

---

## Design system

The palette is **ChatGPT's, exactly**. Light: `#ffffff` canvas, `#f9f9f9` rail,
`#f4f4f4` fills, `#0d0d0d` text. Dark: `#212121` canvas, `#171717` rail, `#2f2f2f`
cards, `#ececec` text. The greys are pure neutrals — no cool or warm tint.

**Rules:**

1. **Never write a raw hex in a component.** Every colour comes from a token in
   `globals.css` (`bg-card`, `text-muted-foreground`, `var(--acc)`). The one exception
   is `src/lib/og.tsx`, which renders through Satori outside the CSS pipeline.
   **The brand lockup is exempt from the monochrome rule** — it is a fixed asset with
   its own blue-to-purple gradient, and it is the only place colour like that appears.
   Don't sample colours out of it into the UI.
2. **One hue per job.** Blue (`--primary`) is interactive text only. Green
   (`--accent`) is progress and the one coloured CTA. Solid buttons are
   black-on-white / white-on-black (`--solid`), never brand-coloured — that is how
   ChatGPT does it. Nothing else gets colour.
3. **No coloured glows, no gradients with hue.** `--brand-grad`, `.mesh`, `.aurora`
   and `.beam` are monochrome on purpose.
4. **Module accents** (`--acc-amber` … `--acc-emerald`) are deliberately low-chroma
   and are declared as named tokens so the graph canvas can read them from JS. Keep
   them muted.
5. **Delete CSS you orphan.** If you remove the last user of a class, remove the
   class in the same change.

---

## Brand assets

The lockup is a raster (`iR` monogram + wordmark + tagline). Every icon and card in
the project is derived from that one source, never redrawn by hand:

| File | Job |
|---|---|
| `public/logo-lockup.png` | Rail brand, dark theme (white ink) |
| `public/logo-lockup-light.png` | Rail brand, light theme (ink inverted, gradient kept) |
| `public/logo-mark.png` | Transparent square mark |
| `public/icon-192.png`, `icon-512.png` | Manifest icons — mark on a `#0d0d0d` rounded tile |
| `public/icon-maskable-512.png` | Android maskable, art inset 30% for the crop |
| `src/app/icon.png`, `favicon.ico`, `apple-icon.png` | Browser and iOS icons |

Rules that come from the artwork itself:

- **It needs two ink variants, and the swap is CSS.** The wordmark and the route are
  white; on a white page they vanish. `Lockup` renders both PNGs and toggles with
  `dark:` — no JS, no flash.
- **Never put the transparent mark on a light surface.** The route and its waypoints
  are white. Use the tiled icon (`icon-192.png`) wherever the background can be light
  — that is why the collapsed rail uses the tile, not the mark.
- **Icons are tiled deliberately.** A transparent favicon would lose half its strokes
  on a light tab bar.
- **Regenerating:** the source raster and the extraction script are not in the repo.
  The pipeline was: crop to the content bounding box (frame and margin excluded) →
  derive alpha from brightness with a floor of 26 so the near-black background goes
  fully transparent → un-premultiply to restore colour → invert only pixels with
  saturation under 45 for the light variant. If you re-cut the assets, keep those
  numbers or the light lockup gets a visible ghost rectangle.
- **Sizes are pre-baked, not scaled in the browser.** The lockup masters are 480px
  wide (~39KB each) for a rail slot 232px wide. Don't ship a 1500px master for a
  30px-tall logo.

---

## Writing a lesson

Every lesson is one `.md` file in `content/<module>/`, and follows the same
18-section structure — each `##` becomes a step in the reader:

| | | |
|---|---|---|
| 1. One-line definition | 7. Senior-level insights | 13. Code example |
| 2. Mental model | 8. Common mistakes | 14. Performance notes |
| 3. Visual flow | 9. Best practices | 15. Debugging scenarios |
| 4. How it works | 10. Interview questions | 16. Quick revision notes |
| 5. Real project usage | 11. Follow-up questions | 17. Cheat sheet |
| 6. Interview explanation | 12. Comparison table | 18. Key takeaways |

- Prose above the first `##` is the lede, not a step.
- Section titles drive behaviour: an "objectives" title renders as the *You will
  learn* card, a "quiz" title renders interactive questions, and the interview
  questions section is card-parsed (**bold question** followed by a blockquote answer).
  See `kindOf()` in `content.ts` before renaming a heading.
- Code fences: ` ```js {2,5-7} ` highlights lines. JS/TS blocks get Run/Debug.
- After adding a lesson file, add its row to `curriculum.ts` **and** `README.md`.

---

## Code conventions

**Comments explain *why*, never *what*.** The code already says what it does. A
comment earns its place by recording a decision, a trade-off, or a trap:

```ts
// Reads from the curriculum table rather than getLesson(): the table already has
// everything the card needs, so 104 OG images cost no markdown parsing.
```

Not `// get the lesson`. Match the surrounding density — this codebase comments the
non-obvious and stays silent elsewhere.

- **Server by default.** Add `'use client'` only when there's interaction or browser
  API use. `content.ts` must never reach the client graph.
- **Types over assertions.** No `any`. `as` only at genuine trust boundaries
  (parsed markdown, `localStorage`).
- **`useSyncExternalStore`, not context**, for learner state — see `store.ts`.
- Prefer editing an existing file over adding one. This repo has no barrel files,
  no `utils.ts` dumping ground.

---

## SEO and metadata

`src/lib/seo.ts` owns all of it. Rules:

1. **`NEXT_PUBLIC_SITE_URL` must be set for production builds.** Everything absolute
   — canonicals, OG image URLs, sitemap entries, JSON-LD `@id`s — derives from it.
   A wrong canonical is worse than no canonical.
2. **Every indexable page needs a self-referencing canonical.** The reader has
   client state (hashes, modes, `?q=`) that must never fork the indexed URL.
3. **Titles are written once**, by `lessonTitle()`/`lessonDescription()`, so a
   `<title>` can never disagree with its `<h1>`.
4. **Thin pages are `noindex, follow`** — unwritten lessons and `/bookmarks`
   (localStorage-backed, permanently empty to a crawler).
5. **JSON-LD goes out as one `@graph` per page** so nodes can reference each other
   by `@id`. Add nodes to `seo.ts`, not inline in a page.
6. Structured data changes get validated against the Rich Results Test before
   they ship. Don't add `FAQPage` — Google restricted those results to
   authoritative health/government sites in 2023.

---

## Learner state

`src/lib/store.ts` — localStorage, key `roadmap:v3`.

- **Bump the key and migrate** when the shape changes. Leave the previous key in
  place so a rollback doesn't lose anyone's progress.
- **Everything read back is untrusted.** `sanitize()` validates and clamps every
  field: storage survives deploys, can be hand-edited, and one bad value (`done`
  arriving as an object) would throw inside render and take down every page.
- **Writes are coalesced** (200ms) and flushed on `pagehide` / `visibilitychange`.
  If you add a mutation, route it through `commit()` — never call
  `localStorage.setItem` directly.

---

## Git workflow

**Commit as soon as a unit of work is finished — don't batch.** A unit is:

- **one lesson written** (`content(js): write lesson 6 — primitive vs reference types`)
- **one fix landed** (`fix(topbar): stop prose reading through the sticky bar`)
- **one self-contained improvement** (`feat(rail): fill the brand slot with the lockup`)

The moment it builds and looks right, commit it. Never leave several unrelated
changes sitting in the working tree — a lesson, a palette tweak and a build fix in
one commit can't be reviewed, can't be reverted independently, and hides which change
broke something.

**Write commit messages as the author of the work.** Describe the change and why it
was made — nothing else. No tool, assistant or generator attribution, no
`Co-Authored-By` trailers, no "generated with" footers, no emoji robots. The same
applies to PR descriptions and to anything that ends up in the repository's history.
The history is a record of decisions about this codebase, not of how the text was
typed.

**Branch off `main`, never commit to it directly.**

```
feat/collapsible-rail      # a new capability
fix/rail-hydration-flash   # a defect
chore/bump-next            # deps, config, tooling
docs/lesson-05-closures    # content and docs
refactor/lesson-reader     # behaviour-preserving change
```

**Conventional Commits**, imperative mood, subject under 72 characters:

```
feat(rail): collapse to an icon strip and remember the state
fix(store): validate localStorage before it reaches render
content(js): write lesson 5 — closures
```

Scopes in use: `rail`, `reader`, `graph`, `store`, `seo`, `theme`, `content`,
`ci`, `deps`.

**Body explains why, not what** — the diff covers what. Reference the trade-off you
made and anything you deliberately left out.

**One logical change per commit.** A palette swap and a layout refactor are two
commits. If you can't describe the commit in one line without "and", split it.

**Never commit:** `.env*` (except `.env.example`), `.next/`, `node_modules/`,
screenshots, scratch files, or generated icons other than the committed
`src/app/icon.svg`, `favicon.ico`, `apple-icon.png` and `public/icon-*.png`.

---

## DevOps

**CI** (`.github/workflows/ci.yml`) runs on every push and PR: `npm ci`, typecheck,
build. The build is the real test in this repo — it prerenders all 109 pages and 104
OG images, so a broken component, a bad token or a Satori-illegal style fails there.

**Before opening a PR:**

- [ ] `npm run verify` passes
- [ ] Checked in **both themes** — the palette is theme-symmetric by design
- [ ] Checked at **1440px and ~400px**, and with the rail **collapsed**
- [ ] No raw hex added to a component; no orphaned CSS left behind
- [ ] `README.md` / `PROGRESS.md` updated if a lesson landed
- [ ] Screenshots in the PR for anything visual

**Deploys** are Vercel's git integration: `main` → production, every PR → a preview
URL. Don't add a deploy workflow; it would double-deploy.

**Environment variables** — declare every new one in `.env.example` with a comment,
then add it in the Vercel dashboard for all three environments. Anything named
`NEXT_PUBLIC_*` ships to the browser: never put a secret behind that prefix.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | production | Canonical origin for canonicals, OG, sitemap, JSON-LD |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | optional | Search Console meta tag; omitted entirely when unset |

**Rollback** is a Vercel instant rollback to the previous deployment, then a
`git revert` of the offending commit — in that order, so the fix is live before the
history is tidy.

---

## Definition of done

A change is finished when it builds, it reads correctly in both themes at both
widths, the decisions behind it are in comments where the next person will look, and
nothing was left half-migrated. If you couldn't finish part of it, say so explicitly
rather than narrowing the task quietly.
