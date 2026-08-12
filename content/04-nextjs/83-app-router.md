# Lesson 83 — App Router & File Routing

**Interview importance:** ⭐⭐⭐⭐ — the baseline expectation for any modern Next.js role.

The App Router is the convention that made Next.js teams stop arguing about routing
libraries. Folders *are* routes, files *are* UI, and the file name is the contract: `page`
renders, `layout` wraps, `route` answers APIs. Once you internalize the mapping, a new
codebase reads itself.

This lesson is the foundation of the whole module. If you came here from Lesson 48
(Components & Composition), you already know composition — the App Router is composition
applied to the filesystem, with every convention below building on it. Later lessons on
layouts, dynamic routes and server components assume this mapping, so make it automatic.

## Learning Objectives

By the end of this lesson you should be able to:

- Map a folder structure to the URLs it serves
- Name every special file in `app/` and the one job each one has
- Explain why the folder *name* carries the route but the file *name* carries the role
- Contrast the App Router with the old `pages/` router and the `_app`/`_document` pattern
- Predict what a nested `app/` tree renders, including the root layout

## 1. One-Line Definition

**The App Router is Next.js's file-system router: folders become URL segments, and special file names inside them decide what each level renders.**

## 2. Mental Model

Think of the router as a **filesystem mirror**. What you type into the address bar maps to
folders; what you name the files decides the UI role. Delete a folder and the route
disappears. Rename a folder and the URL changes.

```text
app/
  blog/
    page.tsx      →  /blog
  about/
    page.tsx      →  /about
  layout.tsx      →  wraps every page (the shell)
```

No registration, no route table, no config array. If the folder exists, the route exists.

## 3. Visual Flow

```text
URL:  /blog/hello-world
                 │  path segments
                 ▼
app/
  blog/
    [slug]/                ┌──────────────────────────────┐
      page.tsx  ──────────▶│  Renders <Post />            │
      loading.tsx          │  plus the app/ root layout   │
    layout.tsx             │  around it                   │
  layout.tsx ─────────────▶│  (the outermost <html>)      │
                 │
                 └── every level's layout wraps the one below it
```

The segment is the folder, the view is the `page`, and every ancestor `layout` is a frame
around the whole thing.

## 4. How It Works

Each path segment maps to a folder; inside the folder, **file names carry the role**:

| File in `app/` | Renders | Answers |
|---|---|---|
| `page.tsx` | A route's UI | `/about` |
| `layout.tsx` | A shell that wraps this segment and everything below | every route in it |
| `loading.tsx` | An immediate fallback while the segment streams | every route in it |
| `error.tsx` | An error boundary for the segment | every route in it |
| `not-found.tsx` | The 404 view for the segment | every route in it |
| `route.ts` | No UI — a plain API handler | HTTP methods on that path |

Concretely — a blog with a product page and an API:

```tsx
// app/blog/page.tsx — renders at /blog
export default function BlogPage() {
  return <h1>Blog</h1>;
}
```

```text
GET /blog        →  <h1>Blog</h1> wrapped in every ancestor layout
```

```tsx
// app/api/health/route.ts — renders nothing, serves HTTP
import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({ ok: true });
}
```

```text
GET /api/health  →  200 {"ok":true}   (no page, no HTML — a route handler)
```

`page.tsx` is the only file that *must* exist for a URL to render UI. Everything else —
`layout`, `loading`, `error`, `not-found` — is optional but explains nearly every screen a
production app shows.

> [!NOTE]
> Segments are **case-sensitive and slash-free**: `Blog` and `blog` are different routes,
> and a folder can't contain a literal `/`. Dynamic segments (Lesson 85) are the way around
> the second rule.

## 5. Real Project Usage

| Route | Folder | Special files in it |
|---|---|---|
| Home | `app/` | `page.tsx` + `layout.tsx` |
| Blog index | `app/blog/` | `page.tsx`, `loading.tsx` |
| Single post | `app/blog/[slug]/` | `page.tsx`, `not-found.tsx` |
| Admin section | `app/admin/` | `layout.tsx` (auth guard), `error.tsx` |
| Health check | `app/api/health/` | `route.ts` |

Two conventions that feel magical until you see the tree:

- **Colocation.** A folder can hold its own styles, tests and non-route components — only the
  special file names become routes. Everything else is just a module.
- **`route` wins over `page`.** If both `route.ts` and `page.tsx` exist in a folder, the
  route handler answers and the page never renders. They are two mutually exclusive jobs for
  one path.

## 6. Interview Explanation

> The App Router is Next.js's file-based router. Each folder under `app/` maps to a URL
> segment, and special file names determine what renders: `page.tsx` for the route's UI,
> `layout.tsx` for a wrapping shell, `route.ts` for API handlers, and `loading`, `error` and
> `not-found` for the states around a page. The root `app/layout.tsx` is required and
> renders the `<html>` and `<body>` tags. There's no route configuration file — the
> filesystem is the config.

That's the 30-second answer: *folders are segments, file names are roles, no config to
maintain*.

## 7. Senior-Level Insights

- **"The filesystem is the config" has a maintenance cost you should name.** No central
  route table means a route's existence is scattered across the tree. Senior teams enforce
  the inverse with linting and ownership rules — you can't grep for "all routes", so you
  agree on how they're written.
- **Segments are scoping units, not just URL text.** `layout`, `loading`, `error` and
  `not-found` are scoped to a segment: they wrap *only* their subtree. That's what makes
  parallel teams safe — `app/billing/` can have its own error boundary without touching the
  rest of the app.
- **The router chooses files, then React renders.** File conventions decide *what* renders;
  Server Components (Lesson 86) decide *where* it runs. Keep the two axes separate and every
  Next.js architecture question gets easier.
- **`route.ts` is the API layer's seat.** Teams that move REST endpoints from a separate
  service into `app/api/` get shared types, co-located logic, and the same segment scoping
  for free — at the cost of coupling API and UI deploys.

## 8. Common Mistakes

- **`_app.tsx` / `_document.tsx` in `app/`.** Those belong to the Pages Router. The App
  Router's global shell is `app/layout.tsx`; a stray `_app` in `app/` is dead code that
  confuses everyone.
- **Expecting a segment without `page.tsx` to render.** `app/blog/loading.tsx` without a
  `page.tsx` renders nothing — `page` is what makes the route exist.
- **Putting `route.ts` and `page.tsx` in the same folder.** Only one can own a path; the
  handler silently wins. Split the folder or drop the page.
- **Treating `app/` as the only valid folder.** Route Groups (parenthesized folders) and
  parallel routes exist for structure without a URL segment — Lesson 85 picks that up.
- **Assuming `error.tsx` catches everything.** It's an error boundary for rendering; errors
  in a `layout` above it, or in event handlers, don't land there. Layout-level errors need an
  `error.tsx` one level up.

## 9. Best Practices

✅ Let the folder name be the URL and the file name be the job — never both

✅ Keep a required `app/layout.tsx` with `<html>` and `<body>` as the single app shell

✅ Give every segment the files it actually needs (`loading`, `error`, `not-found`) instead of one global catch-all

✅ Co-locate non-route modules (styles, tests, helpers) next to their route folder

❌ Don't hand-write a route table when the filesystem already is one

❌ Don't render `<html>`/`<body>` anywhere but the root layout — duplicate document tags break hydration

## 10. Interview Questions

**Q1. How does the App Router turn files into routes?**

> Each folder under `app/` maps to one URL segment, and special file names decide the role:
> `page.tsx` renders the route's UI, `layout.tsx` is a wrapping shell, `route.ts` is an API
> handler. `app/blog/page.tsx` serves `/blog`; there's no route table to keep in sync.

**Q2. What is the difference between the `pages/` router and the App Router?**

> `pages/` maps files to routes — `pages/blog.tsx` is `/blog` — one file, one route, with
> `_app.tsx` and `_document.tsx` as the global shell. The App Router maps *folders* to
> segments and gives each one a set of special files (`page`, `layout`, `loading`, `error`,
> `not-found`, `route`), so a single segment can express a whole screen plus its states and
> an API endpoint.

**Q3. What does the root `app/layout.tsx` do that no other file can?**

> It renders the `<html>` and `<body>` tags — the document shell. It's required, it wraps
> every route, and it persists across navigations. No other component should render the
> document tags, because that would break hydration.

**Q4. Can a folder contain non-route files?**

> Yes — that's colocation. Only the reserved file names become routes; anything else in the
> folder (`styles.css`, `post-card.tsx`, `page.test.tsx`) is just an importable module.

**Senior follow-up: How do you find every route in a large App Router codebase?**

> The routes are exactly the folders that contain a `page.tsx` (or a `route.ts`), so a
> search for those two files enumerates them — accounting for Route Groups and dynamic
> segments, which don't add a literal segment. I'd also name the cost of the filesystem
> model: with no central table, teams need lint rules and ownership conventions so routes
> stay discoverable.

## 11. Follow-up Questions

**Can a route render without a `page.tsx`?**

> No — `page` is what makes a route renderable. Without it, the segment contributes its
> layouts but has no view of its own.

**Does `app/layout.tsx` re-render on navigation?**

> Not on client-side navigation — layouts persist across route changes and are not
> re-rendered (Lesson 84). That persistence is exactly why the navigation shell lives there.

**What wins if both `page.tsx` and `route.ts` exist in a folder?**

> The route handler. Both claim the same path, and `route` takes precedence — a silent
> source of "why is my page not rendering".

## 12. Comparison Table

| | Pages Router (old) | App Router (now) |
|---|---|---|
| Maps | Files → routes | Folders → segments |
| One route, one file | ✅ `pages/blog.tsx` | ❌ `app/blog/page.tsx` |
| Global shell | `_app.tsx` + `_document.tsx` | `app/layout.tsx` |
| Per-route states | manual / wrappers | `loading.tsx`, `error.tsx`, `not-found.tsx` |
| API routes | `pages/api/` handlers | `app/…/route.ts` |
| Server Components | ❌ | ✅ default (Lesson 86) |
| Route config file | `next.config` + manual wiring | none — filesystem is the config |

## 13. Code Example

A minimal two-route app, complete and runnable in shape:

```tsx
// app/layout.tsx — required root layout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>Site header</header>
        {children}
      </body>
    </html>
  );
}
```

```text
every route renders inside: <html><body><header>…</header>{page}</body></html>
```

```tsx
// app/blog/page.tsx
import Link from 'next/link';

const posts = ['app-router', 'layouts', 'dynamic-routes'];

export default function BlogPage() {
  return (
    <ul>
      {posts.map((slug) => (
        <li key={slug}>
          <Link href={`/blog/${slug}`}>{slug}</Link>
        </li>
      ))}
    </ul>
  );
}
```

```text
GET /blog → the root layout shell + a <ul> of three links
            no route config touched — the filesystem declared this route
```

```narrate
1-2: The root layout is the app shell; it persists and wraps everything.
4-7: Every route in this app renders inside these tags.
9-13: BlogPage is a plain React component — the file name, not config, gives it /blog.
```

## 14. Performance Notes

- **Layouts are the free performance win.** Because they persist across navigation, their
  UI is never re-rendered client-side — the same reason Lesson 84 leans on them. Keep
  heavy, static shell UI in a layout.
- **Colocation keeps bundles honest.** Non-route files only ship when imported. A stray
  import from a leaf can drag a large module into a page's bundle; the file tree won't warn
  you, bundlers will.
- **`loading.tsx` hides latency, doesn't remove it.** It's the fallback while the segment
  streams — measure the server work behind it before adding it everywhere.
- **Route handlers are the API surface.** Each `route.ts` is separately bundled and
  deployed, so they scale independently of pages — but only if you don't over-share code
  between them and the UI.
- **Don't over-tune.** A two-page app doesn't need granular loading files. Add per-segment
  states where a route is actually slow or actually fails.

## 15. Debugging Scenarios

**Scenario 1: "I created `app/about/page.tsx` and `/about` returns 404."**

The file isn't being picked up. Check the filename (`page.tsx`, exact case), confirm it's
directly inside `app/` (not `app/pages/about/…`), and restart the dev server — new files
are discovered on boot. A parent `app/api/` Route Group can also shadow the path.

**Scenario 2: "I see `_app.tsx`/`_document.tsx` errors in an App Router project."**

Those are Pages Router files sitting in the wrong tree. The App Router's global shell is
`app/layout.tsx` — move the shell logic there and delete the stray files.

**Scenario 3: "My page never renders, but the folder looks right."**

Check for a `route.ts` in the same folder: a route handler claims the whole path, and the
page silently loses. Remove one of the two.

**Scenario 4: "Duplicate `<html>` tags in the DOM."**

Somewhere besides the root layout renders `<html>`/`<body>`. Only `app/layout.tsx` may own
the document tags — a layout in a deeper segment that adds them duplicates the document.

## 16. Quick Revision Notes

- App Router = folders map to URL segments; special file names decide the role
- `page.tsx` makes the route renderable — the only required file for UI
- `layout.tsx` wraps a segment and its subtree; `app/layout.tsx` is required and owns `<html>`/`<body>`
- `loading.tsx` = streaming fallback; `error.tsx` = segment error boundary; `not-found.tsx` = 404 view
- `route.ts` = API handler for that path (HTTP methods, no UI) — wins over `page`
- Old router: files → routes with `_app`/`_document`; new router: folders → segments
- Colocation: non-special files in a route folder are just modules
- `pages/` has no layouts, no Server Components, no per-route states

## 17. Cheat Sheet

```text
app/<segment>/  →  /segment         (folder = URL, file name = job)

page.tsx      → renders the route's UI          (required for UI)
layout.tsx    → shell wrapping this segment      (root one required)
loading.tsx   → fallback while segment streams
error.tsx     → error boundary for the segment
not-found.tsx → 404 view for the segment
route.ts      → HTTP API handler (wins over page.tsx)

app/
  layout.tsx        → <html><body>  (persists, never re-renders)
  page.tsx          → /
  blog/
    page.tsx        → /blog
    [slug]/page.tsx → /blog/:slug   (Lesson 85)
    loading.tsx     → stream fallback
  api/
    health/route.ts → /api/health

Pages Router (old):  pages/blog.tsx → /blog   _app.tsx, _document.tsx
App Router (now):    app/blog/page.tsx + layout.tsx   root layout owns the document
```

## 18. Key Takeaways

> [!RECAP]
> - The App Router is the filesystem as router: every folder under `app/` is a URL segment
> - File names carry the role — `page`, `layout`, `loading`, `error`, `not-found`, `route`
> - `page.tsx` is what makes a route exist; without it the segment has no view
> - The root `app/layout.tsx` is required and is the only place that renders `<html>`/`<body>`
> - The Pages Router mapped files to routes with `_app`/`_document`; the App Router maps folders to segments with per-route states
> - Anything non-special in a route folder is just a co-located module
> - Next stop: layouts — the persistence fact that drives how the whole app is composed

## Check your understanding

Answer these without looking back.

1. What folder renders the home page, and which file makes it a route?
2. Name all six special files in `app/` and the one job each one has.
3. What happens if both `route.ts` and `page.tsx` exist in the same folder?
4. What is the single file that must exist for the app to boot, and why is it unique?
5. How does the same URL get served under the Pages Router vs the App Router?
6. A route needs a loading state, an error boundary and a 404 view. Which files do you add, and where?

## What's Next

**Lesson 84 — Layouts & Nested Layouts.** Layouts do not re-render on navigation. That
single fact drives a lot of design — how the shell persists, how nested segments compose,
and what the root layout really owns.
