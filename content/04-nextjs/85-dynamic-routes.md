# Lesson 85 — Dynamic Routes

**Interview importance:** ⭐⭐⭐⭐ — foundational — later lessons build directly on this.

Lesson 83's mapping handled fixed routes: one folder, one URL. The web isn't fixed — it's
`/blog/hello-world`, `/products/42`, `/docs/nextjs/app-router`. Dynamic routes are the
`[slug]` folders that turn one file into a whole tree of URLs, plus the `params` object that
tells you which URL you're serving. Nearly every lesson after this one (86, 89, 90, 91)
touches these segments, so this is the vocabulary they all assume.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what a `[slug]` folder does and the URL shape it captures
- Read `params` (a `Promise`) in a Server Component and render with it
- Use `generateStaticParams` to pre-render a known set of routes
- Contrast static rendering, dynamic rendering and `dynamicParams` behavior
- Describe catch-all and optional catch-all segments, and when to use each
- Say why a dynamic page's params decide its caching and revalidation story

## 1. One-Line Definition

**A dynamic route is a segment written as `[name]` — one folder and one file that serve any value in that URL position, delivered to the page as `params`.**

## 2. Mental Model

Think of a `[slug]` folder as a **wildcard slot**: the folder name defines a variable, the
URL supplies its value, and the page receives a bag of those values. The slot holds one
URL segment — `/blog/[slug]` captures exactly one word. A catch-all `[...slug]` is a slot
that grabs everything after it, like `/*`.

```text
app/blog/[slug]/page.tsx

/blog/app-router   →  params.slug = 'app-router'
/blog/layouts      →  params.slug = 'layouts'
/blog/hello-world  →  params.slug = 'hello-world'

one file, three URLs, three different params
```

## 3. Visual Flow

```text
request  /blog/hello-world
                 │
                 ▼
app/blog/
  [slug]/
    page.tsx            →  params = { slug: 'hello-world' }
    not-found.tsx       →  rendered when no post matches
  layout.tsx            →  wraps every post
app/layout.tsx          →  wraps everything
                 │
                 ▼
server:  generateStaticParams() lists known slugs → pre-rendered statically
         unknown slug (dynamicParams)             → rendered on demand (or 404)
```

Static params get pre-rendered at build time; everything else is decided per request — that
single fork is the whole caching story of dynamic routes.

## 4. How It Works

A folder with brackets captures its URL segment into a `params` object:

```text
app/
  blog/
    [slug]/
      page.tsx        →  /blog/:slug         params: { slug }
  posts/
    [id]/
      page.tsx        →  /posts/:id          params: { id }
  [lang]/
    docs/[...slug]/   →  /:lang/docs/*       params: { lang, slug: string[] }
```

The segment value is delivered as `params` — in a Server Component it's a `Promise`, so
you await it (Lesson 86's async components make this natural):

```tsx
// app/blog/[slug]/page.tsx — Server Component
import { getPost } from '@/lib/db';

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;        // params is a Promise in the App Router
  const post = await getPost(slug);

  if (!post) return <NotFound />;       // no match → not-found.tsx renders

  return <article><h1>{post.title}</h1></article>;
}
```

```text
GET /blog/hello-world
  → params resolves to { slug: 'hello-world' }
  → getPost('hello-world') runs on the server
  → no match renders the not-found view, still wrapped in layouts
```

```narrate
1: The [slug] folder captures one segment; params carries it.
2-3: params is a Promise in a Server Component — await it before reading.
5-6: The awaited slug is what the page renders from.
8: A missing post falls through to the not-found boundary, not a crash.
```

> [!NOTE]
> In `pages/` (old router) `params` was a plain synchronous object available to
> `getServerSideProps`. In the App Router it's a `Promise<Record<string, string | string[]>>`
> — `await params` is the new norm.

## 5. Real Project Usage

| Pattern | Folder | `params` you get |
|---|---|---|
| Blog posts | `app/blog/[slug]/page.tsx` | `{ slug: string }` |
| Product pages | `app/products/[id]/page.tsx` | `{ id: string }` |
| Localized docs | `app/[lang]/docs/[...slug]/page.tsx` | `{ lang: string, slug: string[] }` |
| Catch-all dashboards | `app/dashboard/[...segments]/page.tsx` | `{ segments: string[] }` |

Pre-rendering a known set — the canonical `generateStaticParams` usage:

```tsx
// app/blog/[slug]/page.tsx
import { getAllPosts } from '@/lib/db';

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}
```

```text
build time: for each slug returned, Next.js pre-renders /blog/<slug> as static HTML
            visits to those URLs need no server work; unknown slugs fall back to
            on-demand rendering (or 404) depending on dynamicParams
```

The static list is the optimization and the 404 rule in one: known URLs are pre-built,
unknown ones are the app's decision.

## 6. Interview Explanation

> A dynamic route is a folder written `[name]` — `app/blog/[slug]/page.tsx` — that captures
> one URL segment into a `params` object, so a single file serves `/blog/app-router`,
> `/blog/layouts`, and every other slug. In a Server Component, `params` is a Promise that
> you await before reading the value. `generateStaticParams` returns the list of known
> values, and those routes are pre-rendered at build time; slugs outside the list render on
> demand when `dynamicParams` is true, or 404 when it isn't. A catch-all `[...name]`
> captures the rest of the path as an array, and `[[...name]]` makes even that optional.

That's the 30-second answer: *bracket folder, awaited params, static list at build, on
demand for the rest*.

## 7. Senior-Level Insights

- **"One file, many URLs" is the route-count problem.** A dynamic route collapses N URLs
  into one file, which means metrics, logging and access rules all key off `params`, not
  the path. Senior engineers design around that: the slug is data, so validation and
  normalization happen in the page or a shared helper, once.
- **`params` is the caching key.** Whether a dynamic page renders statically, dynamically,
  or with revalidation (Lessons 90 and 91) is decided per segment value. The same file can
  be static for known slugs and dynamic for unknown ones — params is the fork in the road.
- **Static ≠ always static.** `generateStaticParams` is a build-time list, but with
  ISR/revalidation that list can grow and refresh at runtime. Saying "static params are
  frozen at build" is the answer a candidate who read the docs once gives.
- **Catch-alls are a route architecture decision.** `[...slug]` hands you an array and
  punts the routing to your code. Use it for genuinely tree-shaped paths (docs, dashboards);
  for one level of variation a `[slug]` is simpler and keeps the 404 semantics for free.

## 8. Common Mistakes

- **Reading `params` without awaiting.** In a Server Component `params` is a `Promise`.
  `params.slug` directly throws/never resolves; `const { slug } = await params` is the fix.
- **Expecting numeric params.** Segments are strings — `/products/42` gives `id: "42"`.
  Parse before use: `Number(id)`, or validate before it reaches the database.
- **Forgetting `dynamicParams`.** With it `false`, a URL outside `generateStaticParams`
  returns 404. With it `true` (default), unknown slugs render on demand. Which one you want
  changes the app's failure behavior — pick deliberately.
- **Using a catch-all where a `[slug]` fits.** `[...slug]` makes `/blog/a/b/c` all valid
  and pushes parsing into your code; a single `[slug]` keeps one level and native 404s.
- **Duplicating segment names in one path.** `app/[slug]/[slug]/` reuses one key — the
  second overrides the first. Rename one of the folders.
- **Returning the wrong shape from `generateStaticParams`.** The keys must match the
  segment names exactly — `{ slug }` for `[slug]`, `{ lang }` for `[lang]` — and catch-alls
  expect arrays, not strings.

## 9. Best Practices

✅ Await `params` in every Server Component that reads it

✅ Treat segment values as strings — parse, validate, normalize before use

✅ Return `generateStaticParams` with keys matching segment names, arrays for catch-alls

✅ Set `dynamicParams` explicitly so unknown-slug behavior is a decision, not a default

✅ Keep one level of variation in `[slug]`; reach for `[...slug]` only for trees

❌ Don't read `params.slug` directly in an async Server Component

❌ Don't let unvalidated params reach a database query — that's the injection surface

## 10. Interview Questions

**Q1. What is a dynamic route in the App Router?**

> A folder written with brackets, like `app/blog/[slug]/page.tsx`, that captures one URL
> segment into a `params` object. The same file serves every value of that segment —
> `/blog/anything` — and the page reads which value it got from `params`.

**Q2. How do you access `params` in a Server Component?**

> `params` is passed as a prop and is a `Promise` in a Server Component, so you await it:
> `const { slug } = await params`. This lets the framework defer segment resolution while
> the component streams. In the old `pages/` router it was a plain synchronous object.

**Q3. What does `generateStaticParams` do?**

> It returns the list of known segment values. At build time Next.js pre-renders each one
> as static HTML — `/blog/hello-world` for every returned slug. The page then serves those
> URLs with zero server work per request, and the app decides what happens for values not
> in the list.

**Q4. What happens for a slug not in `generateStaticParams`?**

> It depends on `dynamicParams`. With the default `true`, the route renders on demand when
> requested. With `false`, an unknown slug returns 404. That switch is how you choose
> between "render anything" and "only what I enumerated".

**Q5. What is a catch-all segment?**

> `[...slug]` captures the rest of the path as an array — `/docs/a/b/c` gives `{ slug:
> ['a','b','c'] }`. The optional form `[[...slug]]` also matches when nothing is there.
> They're for tree-shaped routes like docs and dashboards where a fixed segment can't
> express the depth.

**Senior follow-up: A product page must always show fresh prices, but you also want it to
load fast. How do you reconcile those with a dynamic route?**

> The route is one file; the segment value decides the strategy. `generateStaticParams`
> pre-renders the product list, but the pricing data inside is fetched with revalidation
> (Lesson 90) — or the page is marked dynamic and the expensive fetch is cached — so known
> URLs still get a static shell while prices stay current. The insight is that params isn't
> just data for rendering; it's the key that selects each URL's caching and revalidation
> policy, and I'd make that per-segment decision explicit instead of one global setting.

## 11. Follow-up Questions

**Is `params` a string or a number?**

> Always a string — URL segments are text. `/products/42` yields `"42"`, so parse with
> `Number(id)` and validate before the value touches a database query or an ID comparison.

**Can dynamic segments be nested?**

> Yes — `app/[lang]/docs/[...slug]/` is valid, and `params` merges them: `{ lang, slug }`.
> Just don't reuse a name twice in one path, or the later segment overrides the earlier one.

**Do dynamic routes re-render on every request?**

> Only when they're dynamically rendered. Statically generated params (and ISR-revalidated
> ones, Lesson 91) are served from the cache; the "render every request" path is what you
> get with `dynamicParams` on-demand rendering or `force-dynamic`. Params selects the mode,
> not the file.

## 12. Comparison Table

| | `[slug]` | `[...slug]` | `[[...slug]]` |
|---|---|---|---|
| Matches | one segment | one or more | zero or more |
| `params` value | `string` | `string[]` | `string[]` or `[]` |
| `/blog` | ❌ | ❌ | ✅ |
| `/blog/a` | ✅ | ✅ | ✅ |
| `/blog/a/b` | ❌ | ✅ | ✅ |
| Use when | one level of variation | tree-shaped paths | optional catch-all (e.g. root landing) |

## 13. Code Example

A complete dynamic route with static params and a catch-all, runnable in shape:

```tsx
// app/blog/[slug]/page.tsx
const posts = ['app-router', 'layouts', 'dynamic-routes'];

export function generateStaticParams() {
  return posts.map((slug) => ({ slug }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <article><h1>Post: {slug}</h1></article>;
}
```

```text
build time: /blog/app-router, /blog/layouts, /blog/dynamic-routes pre-rendered
GET /blog/app-router  →  <h1>Post: app-router</h1>  (served statically)
GET /blog/unknown     →  rendered on demand (dynamicParams) or 404
```

```narrate
1-2: The full slug list — what generateStaticParams enumerates.
4-6: Each slug in the array becomes a static URL at build time.
8-10: params is a Promise; awaiting it yields the segment value for this request.
```

```tsx
// app/docs/[...slug]/page.tsx — catch-all
export default async function DocsPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return <p>Docs: {slug.join(' / ')}</p>;
}
```

```text
GET /docs/nextjs/app-router  →  <p>Docs: nextjs / app-router</p>
GET /docs/nextjs             →  <p>Docs: nextjs</p>
```

The same file serves any depth — the array is what you join or walk.

## 14. Performance Notes

- **`generateStaticParams` is the fastest mode.** Known slugs ship as static files — zero
  server work, CDN-cacheable, instant on repeat visits. The list size is the only cost.
- **On-demand rendering moves work per request.** Unknown slugs render when asked; that
  per-request cost is real and is exactly what Lesson 90's caching exists to absorb.
- **The list is a memory/scale knob.** A huge product catalog wants pagination or
  revalidation (Lesson 91), not an unbounded static list. Think in *which* URLs must be
  static, not *how many*.
- **Catch-alls are harder to cache well.** The deeper the path, the more combinations — a
  catch-all with fine-grained revalidation can generate more work than it saves.
- **Don't over-tune.** A small blog pre-renders everything and needs nothing else. The
  per-segment caching matrix is only worth it when you actually have hot and cold URLs.

## 15. Debugging Scenarios

**Scenario 1: "My dynamic page renders `[object Promise]`."**

You read `params` without awaiting. `params` is a `Promise` in a Server Component —
`params.slug` is `undefined`, and `String(params)` yields `[object Promise]`. Fix:
`const { slug } = await params`.

**Scenario 2: "Unknown slugs render a blank page instead of 404."**

The page renders without checking the fetched record, and `dynamicParams` allows on-demand
rendering. Return a `notFound()` (or render the not-found view) when the record is missing,
and decide whether `dynamicParams: false` better matches the app.

**Scenario 3: "A catch-all route shadows a fixed route."**

`app/blog/[...slug]` can match paths a fixed `app/blog/featured` also claims. Static
segments win over dynamic ones — if the wrong handler serves, reorder or rename so the
static route is found first.

**Scenario 4: "`generateStaticParams` returns routes that 404 at runtime."**

The returned keys don't match the segment names, or the values contain characters that
aren't valid in a URL. Keys must equal the bracket names exactly, and values should be
slug-safe (encode or normalize before returning).

## 16. Quick Revision Notes

- `[slug]` folder = one captured segment; `[...slug]` = rest of path as `string[]`
- `params` is a `Promise` in Server Components — always `await` it
- Segment values are strings; parse/validate before they reach a DB query
- `generateStaticParams` returns known values → pre-rendered at build time
- `dynamicParams: true` (default) renders unknown slugs on demand; `false` → 404
- Catch-all `[[...slug]]` also matches zero segments
- Static segments win over dynamic ones when paths overlap
- `params` is the key that picks each URL's caching mode (Lessons 90–91)

## 17. Cheat Sheet

```text
app/blog/[slug]/page.tsx   →  /blog/:slug        params: { slug: string }
app/[lang]/docs/[...slug]/ →  /:lang/docs/*      params: { lang, slug: string[] }
app/[[...slug]]/page.tsx   →  /* or /            params: { slug: string[] } (may be [])

rules:
  folder name in []  =  the param key
  segment value      =  always a string
  await params       =  required in Server Components
  generateStaticParams()  returns [{ key: value }, …]  →  static at build
  dynamicParams: false    →  unknown values 404
  [...name] = array      [[...name]] = optional

comparison:
  [slug]        one level       /blog/a        params.slug = 'a'
  [...slug]     one or more     /blog/a/b      params.slug = ['a','b']
  [[...slug]]   zero or more    /blog          params.slug = []
```

## 18. Key Takeaways

> [!RECAP]
> - A dynamic route is a bracketed folder that captures one URL segment into `params`
> - In a Server Component `params` is a `Promise` — `await` it before reading
> - Segment values are strings; validate and parse before they reach a query
> - `generateStaticParams` pre-renders the known set; `dynamicParams` decides the rest
> - Catch-alls (`[...slug]`) and optional catch-alls (`[[...slug]]`) serve tree-shaped paths
> - Static segments win over dynamic ones on overlapping paths
> - `params` isn't just render data — it's the key that selects each URL's caching policy
> - This is the vocabulary every later lesson (86, 89, 90, 91) builds on

## Check your understanding

Answer these without looking back.

1. What does the folder `app/products/[id]` capture, and what does `params` look like for `/products/42`?
2. Why must you `await` `params` in a Server Component?
3. What does `generateStaticParams` return, and what does Next.js do with it at build time?
4. What is the difference between `dynamicParams: true` and `dynamicParams: false`?
5. When would you choose `[...slug]` over `[slug]`?
6. What does `params` contain for `/docs/guide/setup` served by `app/docs/[...slug]/page.tsx`?
7. A dynamic page shows stale prices. Which knob — and which lesson — fixes it?

## What's Next

**Lesson 86 — Server Components.** You know which files map to routes and what `params`
means; now learn what actually runs where — async components, the RSC payload, and why a
page with zero client JS isn't a bug.
