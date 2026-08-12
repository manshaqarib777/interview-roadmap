# Lesson 84 — Layouts & Nested Layouts

**Interview importance:** ⭐⭐⭐⭐ — layouts do not re-render on navigation. That single fact drives a lot of design.

Lesson 83 showed the file: a `layout.tsx` next to a `page.tsx`. This lesson is about what
that file actually does. A layout is a **persistent frame**: it renders once, wraps its
segment, and survives navigation between the pages under it — the shell stays on screen
while the content swaps. Most layout architecture questions ("where does the sidebar go?",
"why does my header flash on every route change?") are really this one fact, applied.

## Learning Objectives

By the end of this lesson you should be able to:

- Say what a layout is: a persistent shell that wraps a segment and its subtree
- Explain why a layout does not re-render when you navigate between the pages under it
- Draw the nested-layout tree for a multi-segment route and predict what renders where
- State the root-layout requirement and the one thing only it owns (`<html>`/`<body>`)
- Compare layouts against the old `_app`/`_document` approach and against `template.tsx`
- Decide when a shared shell belongs in a layout vs a component

## 1. One-Line Definition

**A layout is a React component that renders once and wraps its segment and everything below it, persisting across navigations — it does not re-render when the page inside it changes.**

## 2. Mental Model

A layout is the **frame of a painting**. You hang the frame once; the artwork inside gets
swapped when you navigate. The frame does not get rebuilt, repainted, or refetched for each
new artwork — only the canvas inside changes.

```text
┌─────────────────────────────────────┐
│  app/layout.tsx                     │  ← frame, mounted once
│  ┌─────────────────────────────────┐│
│  │  app/dashboard/layout.tsx       ││  ← nested frame, mounted once
│  │  ┌─────────────────────────────┐││
│  │  │  page.tsx  ← swapped on nav │││  ← the artwork
│  │  └─────────────────────────────┘││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

The frame persists; the artwork changes.

## 3. Visual Flow

```text
app/
  layout.tsx              root layout      ── mounts on first load
  dashboard/
    layout.tsx            nested layout    ── mounts on first visit
    page.tsx              /dashboard
    settings/
      page.tsx            /dashboard/settings

navigate  /dashboard  →  /dashboard/settings

  root layout        stays mounted,   does NOT re-render
  dashboard layout   stays mounted,   does NOT re-render
  page               unmounts         →  new page mounts
```

Only the innermost page swaps. Every ancestor layout keeps its DOM, its state, and its
server-rendered output untouched.

## 4. How It Works

A layout is a component that receives `children` — the content one level deeper — and wraps
it. Next.js composes the tree for a URL by nesting every layout on the path from the root
down to the page:

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <nav className="sidebar">
      <Link href="/dashboard">Overview</Link>
      <Link href="/dashboard/settings">Settings</Link>
    </nav>
    <main>{children}</main>
  );
}
```

```text
/dashboard/settings renders as:

  <RootLayout>                      ← app/layout.tsx
    <DashboardLayout>               ← app/dashboard/layout.tsx
      <main><SettingsPage/></main>  ← app/dashboard/settings/page.tsx
    </DashboardLayout>
  </RootLayout>
```

```narrate
1: The layout receives children — everything one segment deeper.
4-9: A sidebar that must stay mounted across dashboard pages lives here.
10: children is where the active page renders.
```

Two facts to internalize:

- **A layout must return JSX that accepts `children`.** A layout that drops `children`
  silently hides every page beneath it.
- **`app/layout.tsx` is required** and is the only layout allowed to render `<html>` and
  `<body>`. Nested layouts render their own UI, never the document tags — a second `<html>`
  breaks hydration.

## 5. Real Project Usage

| Need | Where it goes |
|---|---|
| Global shell: `<html>`, nav, footer | `app/layout.tsx` (required, renders `<html>`/`<body>`) |
| Auth-gated area | `app/dashboard/layout.tsx` — the guard runs before any dashboard page renders |
| Per-section chrome (sidebar, tabs) | the section's `layout.tsx` |
| Stable header that never flashes on nav | a layout (it never re-renders) |
| Content that changes per navigation | the `page` (it always re-renders) |

A canonical nested pair — a docs section with its own chrome:

```tsx
// app/docs/layout.tsx
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="docs">
      <aside>TOC</aside>
      <article>{children}</article>
    </div>
  );
}
```

```text
/docs/quickstart and /docs/api both render inside the same TOC + article frame;
navigating between them does not re-render the aside.
```

The sidebar belongs in the layout, not in every page — that is what "layouts do not
re-render on navigation" buys you.

## 6. Interview Explanation

> A layout is a React component that wraps a segment of the tree and persists across
> navigations. It receives `children` and renders them inside its own shell — the shell of
> the root layout is the `<html>`/`<body>` document. When you navigate between two pages
> under the same layout, only the page re-renders; the layout keeps its state, its DOM and
> its effects untouched. Nested layouts compose: `app/dashboard/layout.tsx` wraps
> `app/dashboard/settings/page.tsx` inside the root layout, so a URL renders through every
> ancestor frame.

That's the 30-second answer: *persistent shell, receives children, composes down the
segment tree*.

## 7. Senior-Level Insights

- **"Does not re-render" is a guarantee about client-side navigation.** On a hard reload or
  a server round-trip, the server re-renders layouts too — the persistence is a
  client-navigation property, not "the server caches my shell".
- **State placement follows the frame.** Anything that must survive a page swap lives in the
  layout: the sidebar's open state, the scroll position, the active tab. Anything that must
  reset on navigation lives in the page. That split *is* the layout design.
- **Nested layouts are how you scope authority.** A dashboard layout can enforce auth and
  fetch the user once; deeper layouts can't accidentally bypass it. The tree structure
  encodes who is allowed to render what.
- **Suspense boundaries interact with layouts.** A `loading.tsx` (Lesson 83) is scoped to
  its segment, so a slow page streams inside the layout frame while the shell stays
  interactive — layouts and streaming are what make the App Router feel instant.

## 8. Common Mistakes

- **State in the layout resets because you remount it.** A layout re-mounts when its
  segment changes in the tree — adding or removing a layout above it. `key` and
  conditional-render mistakes upstream also force remounts. "Layouts persist" holds only
  when the layout stays in the tree.
- **Rendering `<html>` in a nested layout.** Only the root layout owns the document tags;
  a nested `<html>` duplicates the document and breaks hydration.
- **Dropping `children`.** A layout that renders a fixed sidebar and forgets `{children}`
  silently renders every nested page invisible. The most common layout "bug" is a missing
  `children`.
- **Putting per-page data in the layout.** Data that only the page needs belongs in the
  page; a layout that awaits the same query for every child re-runs it on every child
  navigation (unless cached, Lesson 90).
- **Reaching for `template.tsx` by default.** A `template` re-mounts on every navigation —
  the opposite of a layout. Use it only when the shell *should* reset (e.g. re-running a
  page transition animation).

## 9. Best Practices

✅ Put shared, navigation-stable chrome in layouts — header, sidebar, footer

✅ Render `<html>`/`<body>` only in the root `app/layout.tsx`

✅ Keep `{children}` in every layout — dropping it hides the whole subtree

✅ Do auth and user fetching in a layout that scopes an area, once

✅ Give a nested section its own layout the moment it gets its own chrome

❌ Don't put per-page data fetches in a layout that wraps many pages

❌ Don't use `template.tsx` when you want persistence — templates are the reset variant

## 10. Interview Questions

**Q1. What is a layout in the App Router, and how does it differ from a page?**

> A layout is a component that wraps a segment and its subtree, receiving `children` and
> rendering them inside a persistent shell. A page is the leaf that changes on navigation.
> Navigate between two pages under the same layout and only the page re-renders — the layout
> keeps its state and DOM.

**Q2. Why don't layouts re-render on navigation?**

> Because the layout stays in the tree while only the page beneath it changes. On
> client-side navigation the router swaps the page's content inside the already-mounted
> layout frame; there is no new render of the frame, so its state and effects survive.
> That's what makes the navigation shell — header, sidebar — feel instant and continuous.

**Q3. What is the root layout, and why is it special?**

> `app/layout.tsx` is required and is the outermost layout. It's the only place that renders
> `<html>` and `<body>` — the actual document. Every other layout renders UI inside that
> document. Without it the app has no document to hydrate.

**Q4. How do nested layouts work?**

> Each segment can add a layout that wraps everything below it. For
> `/dashboard/settings`, the root layout wraps the dashboard layout wraps the settings
> page. Rendering is composition: each layout renders `children`, which is the next layout
> or page down the tree.

**Senior follow-up: Your header flickers on every route change. Where is the bug?**

> The header is being re-rendered, so it's not in a layout where it belongs — or the layout
> is being remounted. I'd check three things: is the header rendered in a layout and not in
> each page; does anything upstream conditionally mount that layout; and is the data it
> renders cached so a navigation doesn't refetch it. The fix is moving the header into the
> persistent frame and keeping its data out of per-page fetches.

## 11. Follow-up Questions

**When would you choose `template.tsx` over `layout.tsx`?**

> When the shell must reset on every navigation — page-transition animations, analytics
> that must re-run, a spotlight that should restart. A template re-mounts its children each
> time; a layout persists them.

**Can a layout be a Server Component?**

> Yes, and by default it is (Lesson 86). A server layout fetches once and passes plain data
> down; client interactivity lives in islands inside it. A layout that needs client state
> (e.g. a sidebar toggle) is the exception that opts in with `use client`.

**Does the layout re-fetch its data when you navigate?**

> The layout itself doesn't re-render, so it doesn't re-run its fetches on client
> navigation — unless the data is marked dynamic or the navigation invalidates its cache
> (Lesson 90). That's precisely why layouts are the right home for data every page in the
> section shares.

## 12. Comparison Table

| | `layout.tsx` | `page.tsx` | `template.tsx` |
|---|---|---|---|
| Role | Persistent shell | The current view | Shell that resets |
| Re-renders on navigation | ❌ | ✅ always | ✅ always |
| Keeps state across nav | ✅ | ❌ | ❌ |
| Root requirement | ✅ required, owns `<html>`/`<body>` | required for a route | optional |
| Receives `children` | ✅ | ❌ renders content | ✅ |
| Old-router equivalent | `_app.tsx`/`_document.tsx` (global only) | a `pages/*.tsx` file | none |

## 13. Code Example

A complete root + nested layout composition, runnable in shape:

```tsx
// app/layout.tsx — the document shell
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>Acme</header>
        {children}
      </body>
    </html>
  );
}
```

```text
root frame: <html><body><header>Acme</header>{…}</body></html>
```

```tsx
// app/shop/layout.tsx — nested frame with its own chrome
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shop">
      <nav>Categories</nav>
      <main>{children}</main>
    </div>
  );
}
```

```text
/shop/checkout renders:
<html><body><header>Acme</header>
  <div class="shop"><nav>Categories</nav><main><CheckoutPage/></main></div>
</body></html>
```

```narrate
1: The root layout is required and owns the document tags.
4-7: Shell UI that must survive navigation — the header — lives here.
10-17: A nested layout composes inside the root frame and adds its own chrome.
12-13: children is where the page beneath renders.
```

## 14. Performance Notes

- **Layouts are the biggest free win in the router.** They render once and never re-render
  on navigation, so all their work — server render, data fetch, hydration — is paid once,
  not per route. This is the lesson's core fact in performance terms.
- **Server layouts avoid duplicate work.** A layout that awaits the current user or the
  section's nav runs once per navigation, not per page. Without the cache layer (Lesson 90),
  that's the cheapest place to share data across a section.
- **The persistence is client-side.** On hard reloads the server re-renders the whole tree,
  so a heavy layout costs a full render on every fresh visit. Mitigate with caching and
  streaming, not by shrinking the layout.
- **Templates cost more, on purpose.** Each navigation re-mounts a template and its subtree,
  so avoid them on hot paths. Layouts are free; templates are a deliberate spend.
- **Don't over-tune.** A small app with one layout needs nothing more. Nested layouts earn
  their complexity when sections genuinely have distinct shells and authority scopes.

## 15. Debugging Scenarios

**Scenario 1: "My pages are blank — the sidebar renders but the content doesn't."**

The layout is missing `{children}`. A layout that renders a fixed frame and never includes
`children` hides every nested page. Add `{children}` inside the frame.

**Scenario 2: "The header flashes and loses state on every navigation."**

The header is not in a layout, or the layout is being remounted. Check where the header is
rendered — it belongs in a layout above the changing pages — and whether anything
conditionally mounts that layout (a `key` change, a dynamic import, a route group
mismatch). Remounting destroys the persistence guarantee.

**Scenario 3: "Duplicate `<html>` tags appear in the DOM."**

A layout other than the root renders the document tags. Nested layouts must only render
their own UI — `<html>`/`<body>` is the root layout's exclusive job.

**Scenario 4: "Layout data is stale after I update the database."**

The layout isn't re-rendering on navigation, so its fetch isn't re-running either — the
shell was cached (Lesson 90). Revalidate the segment or mark the data dynamic; this is the
trade side of "layouts don't re-render".

## 16. Quick Revision Notes

- Layout = persistent shell wrapping a segment; receives `children`; renders once
- Layouts do **not** re-render on client-side navigation — only the page beneath swaps
- Nested layouts compose: every ancestor layout wraps the ones below it
- `app/layout.tsx` is required and is the only file that renders `<html>`/`<body>`
- Dropping `{children}` hides the entire subtree — the classic layout bug
- `template.tsx` is the reset variant: re-mounts on every navigation
- Old router: `_app`/`_document` gave one global shell; the App Router gives one per segment
- Server layouts run once per navigation — the free place to share section data

## 17. Cheat Sheet

```text
layout = frame, mounts once, never re-renders on navigation
page   = artwork, always re-renders

app/
  layout.tsx        → <html><body> … </body></html>   (required, owns document)
  dashboard/
    layout.tsx      → sidebar + {children}            (persists for the section)
    page.tsx        → /dashboard                      (swaps on nav)
    settings/
      page.tsx      → /dashboard/settings

composition:  <RootLayout><DashboardLayout><Page/></DashboardLayout></RootLayout>

navigate page → page:  layouts untouched, page remounts
hard reload:          server re-renders everything

template.tsx = layout that re-mounts children on every navigation

rules:
  ✅ {children} in every layout      ❌ <html> outside the root layout
  ✅ chrome in layouts               ❌ per-page data in a section layout
  ✅ state that survives → layout    ❌ template when you want persistence
```

## 18. Key Takeaways

> [!RECAP]
> - A layout is a persistent frame: it wraps a segment and its subtree and survives navigation
> - Layouts do not re-render on client-side navigation — only the page inside them changes
> - Nested layouts compose: each level renders `children`, down to the page
> - `app/layout.tsx` is required and uniquely owns `<html>`/`<body>`
> - A layout without `{children}` renders its subtree invisible
> - `template.tsx` is the reset counterpart — re-mounts on every navigation
> - The App Router replaced `_app`/`_document`'s single shell with one layout per segment
> - "Where does state survive?" and "layouts don't re-render" are the same question

## Check your understanding

Answer these without looking back.

1. Define a layout in one sentence. What does it receive, and what does it do with it?
2. Why does navigating between two pages under the same layout not re-render the layout?
3. Draw the render tree for `/dashboard/settings` with a root layout and a dashboard layout.
4. Which file is required and the only one allowed to render `<html>` and `<body>`?
5. What happens if a layout omits `{children}`?
6. When is a `template.tsx` the right choice over a layout — and what does it cost?
7. A header must keep its scroll position across navigations. Where does it live, and why?

## What's Next

**Lesson 85 — Dynamic Routes.** `[slug]` segments, `generateStaticParams`, `params` in
server components, and catch-all segments — how one file serves an entire tree of URLs.
