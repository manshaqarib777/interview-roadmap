# Lesson 69 — Code Splitting

**Interview importance:** ⭐⭐⭐ — the mechanism behind Lesson 68. Interviewers rarely ask
about chunks by name, but every lazy-loading question is secretly a code-splitting
question: *how does the bundler decide what goes in which file, and how do you read the
result?*

Lazy loading is what you *write*; code splitting is what the bundler *does*. The same
dynamic import produces one file per route, one per component, one per dependency group —
and the difference between a good split and a bad one is exactly the difference between a
fast app and a waterfall of requests. Foundational — later lessons build directly on this.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what a chunk is and how the bundler decides what goes in it
- Distinguish route-level, component-level and vendor splitting
- Explain why a dynamic import creates a separate chunk and an eager import does not
- Use a bundle analyser to find oversized chunks and duplicated dependencies
- Describe the caching trade-off of a shared vendor chunk

## 1. One-line definition

**Code splitting is dividing a single JavaScript bundle into smaller chunks — one per
route, feature, or dependency group — that load on demand instead of all at startup.**

## 2. Mental model

A single PDF of a whole book versus chapters as separate files. The PDF (one bundle)
downloads everything before you can read page one. The chapter files (split chunks) load
the cover and table of contents immediately, and pull each chapter only when you turn to
it. The key insight: *the same total content* — just delivered in the order it's needed.

The bundler is the editor deciding chapter boundaries. It reads your import statements,
and every dynamic `import()` it finds becomes a chapter boundary — the natural place to
cut, because that's where the app itself pauses to wait.

## 3. Visual flow

```text
Build time — bundler walks the import graph
        │
        ▼
 ┌──────────────┐   ┌─────────────────┐   ┌──────────────────┐
 │  main chunk  │   │  routes/Reports │   │  vendors ~react  │
 │  shell+shared│   │  chunk          │   │  chunk (react,   │
 │  (your code) │   │  (page code)    │   │  react-dom, etc)│
 └──────────────┘   └─────────────────┘   └──────────────────┘
        │                   │                        │
        ▼                   ▼                        ▼
  loads at startup     loads on navigate         loads at startup
```

## 4. How it works

The bundler turns your module graph into one or more output files. A module reaches the
main bundle when it's reachable through *eager* imports — `import X from './x'` at the
top of a file. Any module only reached through a **dynamic import** becomes a separate
chunk:

```js
// eager — becomes part of the main bundle
import { Header } from './header';

// dynamic — becomes its own chunk, loaded on first render (Lesson 68)
const Reports = lazy(() => import('./routes/Reports'));
```

The dynamic import is the split point. The bundler detects it at build time, assigns the
module and its dependencies to a new chunk, and injects a tiny loader that fetches that
chunk when the import runs. That's why the import path must be a literal: the analyser has
to see it to cut at it.

Two build-time rules worth knowing:

1. **Shared code gets hoisted up, not duplicated.** Two routes that both import a
   `utils.js` module get that module placed in a common chunk, so it isn't shipped twice.
2. **Vendor splitting** is usually a configuration decision. `react` and `react-dom`
   rarely change, so webpack's `splitChunks` can isolate them in their own chunk — which
   then stays in the browser cache for months while the app chunk changes daily.

## 5. Real project usage

| Split level | What | Example | When |
|---|---|---|---|
| **Route-level** | One chunk per route/page | `lazy(() => import('./routes/Settings'))` | Default for most apps |
| **Component-level** | One chunk per heavy component | `lazy(() => import('./MarkdownEditor'))` | Modals, editors, charts |
| **Vendor** | Third-party code in its own chunk | `react`, `react-dom`, `moment` | Rarely-changing deps |
| **Feature-flag / condition** | Split by a runtime condition | heavy fallback loaded only on old browsers | When the condition is rare |

```jsx {1-3}
const Profile   = lazy(() => import('./routes/Profile'));
const Analytics = lazy(() => import('./routes/Analytics'));
const Reports   = lazy(() => import('./routes/Reports'));
```

Three routes, three chunks. If `Analytics` is only for admins, its charting library ships
in its chunk — regular users never download it. That's the whole point: code for a feature
you don't use is code you shouldn't pay for.

## 6. Interview explanation

> Code splitting is the bundler dividing the app into chunks that load on demand. The
> split points are dynamic imports: any module reached only through `import()` becomes
> its own chunk, fetched when first needed. Route-level splits are the default, because
> pages are the natural units; component-level splits handle modals and editors; vendor
> splitting keeps rarely-changing third-party code in a long-cached chunk.
>
> It doesn't reduce the total code — it changes when it loads. The cost is extra network
> round trips, which is why you split at feature boundaries and audit the result with a
> bundle analyser.

## 7. Senior-level insights

- **Say "chunk" precisely.** A chunk is one output file of the bundler. It contains the
  modules reachable from its entry point (or split point) that no other chunk owns.
  "The route is a chunk" is the sentence that sounds senior; "the file gets smaller"
  is the one that doesn't.
- **The real lever is *what's reachable from the entry*.** Splitting is only valuable
  when it removes code from the initial load. A lazy route nobody visits still splits the
  bundle; a lazy route that's on the home page just delays the same bytes.
- **Duplicate dependencies are the hidden killer.** Two chunks importing the same big
  library, with the bundler configured not to hoist it, ship it twice — the total
  download grows. An analyser shows the duplicated module count instantly.
- **The cache story flips the calculation.** A large, stable vendor chunk is *good* when
  it's cached: the app chunk changes daily, but `react` stays cached for months. The
  trade-off is the initial load size versus how often the browser has to re-fetch the
  changing parts.
- **Mention loading strategy on top of splitting.** Splitting decides *what* loads when;
  prefetching and preloading decide *when the browser starts fetching*. A `preload` for
  the next route hides the loading state entirely. Saying "split into chunks, then
  preload the ones you know are next" is a complete answer.

## 8. Common mistakes

**Mistake 1 — importing heavy code eagerly.** An eager import at the top of a module
pulls the library into whatever chunk owns that module — often the main bundle. The code
is "split" elsewhere but the weight is still on the first load.

**Mistake 2 — the variable import path.** `import(\`./pages/${name}\`)` can't be
statically analysed, so the bundler emits one chunk covering the whole directory — the
split silently disappears (or worse, everything lands in one giant chunk).

**Mistake 3 — over-splitting.** A thousand tiny chunks means a thousand requests on
navigation. Splitting a 2 KB component into its own chunk adds a round trip to save
nothing. Split at feature boundaries, not per component.

**Mistake 4 — duplicating a shared dependency.** Two chunks importing the same heavy
module with the wrong `splitChunks` config ship it twice — more total bytes, and the
browser fetches the duplicate on each route. `webpack-bundle-analyzer` shows it in one
glance.

**Mistake 5 — assuming smaller bundles = faster app.** A chunk is a network request.
Fewer, well-sized chunks usually beat many tiny ones, and a cached vendor chunk beats a
freshly-fetched "smaller" one. Measure with real network conditions.

## 9. Best practices

✅ Split at route level by default — pages are the natural, stable boundaries

✅ Use component-level lazy loading for modals, editors, charts and heavy below-the-fold UI

✅ Let the bundler hoist shared modules into common chunks; enforce it with `splitChunks` when duplicates appear

✅ Run a bundle analyser after every significant dependency change

✅ Preload the next route's chunk when navigation is predictable

❌ Don't split around trivial components — each chunk costs a round trip

❌ Don't use variable import paths; keep split points statically analysable

❌ Don't leave duplicate dependencies invisible — the analyser is the proof, not the build log

## 10. Interview questions

**Q1. What is code splitting?**

> It's dividing the JavaScript bundle into chunks that load on demand. The bundler
> creates a chunk at each dynamic import — a module reached only through `import()` gets
> its own file, fetched when it's first needed. Route-level splitting is the default;
> component-level and vendor splitting handle the rest.

**Q2. How does code splitting relate to lazy loading?**

> Lazy loading is the API you write — `React.lazy(() => import('./X'))`. Code splitting
> is what the bundler does with it: the dynamic import becomes a split point, so `X` and
> its dependencies end up in their own chunk that loads on first render. Lazy loading is
> the *symptom* in your code; code splitting is the *mechanism* in the bundle.

**Q3. How do you find out what's actually in your bundle?**

> With a bundle analyser — `webpack-bundle-analyzer` for webpack, or the Rollup/Vite
> analyser. It shows the chunk sizes, what each chunk contains, and duplicated modules
> across chunks. You look for oversized chunks, eager imports pulling libraries into the
> main bundle, and duplicate dependencies shipped in several chunks.

**Senior follow-up: Why would you keep a large vendor chunk separate from your app code?**

> Because of caching. `react` and `react-dom` barely change, so their chunk stays in the
> browser cache for months. The app chunk changes on every deploy, so it's re-fetched
> often. Separating them means a deploy only invalidates the app chunk — the vendor bytes
> are already on disk. The trade-off is a larger initial download for the vendor chunk.
> This is also why the hash in the chunk filename (`main.a1b2c3.js`) matters: a content
> hash only changes when the chunk's content changes, so unchanged chunks keep their
> cache entries.

## 11. Follow-up questions

**What's the difference between route-level and component-level splitting?**

> Route-level splits the page as a unit — the shell loads first, each page's code loads
> on navigation. Component-level splits a single heavy component regardless of which page
> contains it — a markdown editor or chart used on several pages loads only when it
> actually mounts. Both are dynamic imports; they differ in the granularity of the split.

**How do you choose the split points?**

> At the feature boundaries — routes, modals, and rare features with heavy dependencies.
> The split should remove code from the critical path without creating a waterfall of
> tiny requests. A good rule of thumb: if a chunk would be under a few KB, the round trip
> probably isn't worth it.

**Does code splitting reduce the total download?**

> Usually not much — the total bytes are roughly the same, since all the code eventually
> loads for the features you visit. What changes is *when* it loads: the initial request
> is smaller and the first paint is faster. Done badly, though, it can *increase* total
> bytes through duplicated chunks.

## 12. Comparison table

| | Route-level | Component-level | Vendor |
|---|---|---|---|
| Split point | page/route | component | dependency config |
| Loads when | navigation | component mounts | startup |
| Caching | new on deploy | new on deploy | long-lived |
| Best for | most apps | modals, editors, charts | react, UI libs, moment |
| Risk | preload needed for snappy nav | chunk per component → request flood | bigger initial load |

## 13. Code example

An App shell that loads instantly and pulls each feature on demand:

```jsx {3,9}
import { lazy, Suspense } from 'react';

const Home    = lazy(() => import('./routes/Home'));
const Profile = lazy(() => import('./routes/Profile'));
const Reports = lazy(() => import('./routes/Reports'));

export default function App() {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Home />
    </Suspense>
  );
}
```

At build time the bundler emits: `main.<hash>.js` (shell + shared code), one chunk per
route, and — with a vendor config — one chunk holding `react`/`react-dom`.

```text
dist/
├── main.7f3a9c.js          # shell, router, shared code — loaded at startup
├── home.2b41d0.js          # loaded when Home renders
├── profile.a9e3f1.js       # loaded when Profile renders
├── reports.e8b2aa.js       # loaded when Reports renders
└── vendor.6c22dd.js        # react, react-dom — long-lived cache
```

A user who never opens Reports never downloads `reports.e8b2aa.js` — that's the entire
value of the split. The `lazy` call (Lesson 68) is what triggers each chunk's load.

```narrate
1: the React API pair — lazy creates the split, Suspense handles the wait
3-5: three dynamic imports, three build-time split points
9-11: the boundary owns the fallback for any chunk still loading
```

## 14. Performance notes

When it matters: any app whose initial bundle is dominated by page code or heavy
libraries. Route-level splitting is usually the single biggest win, and it compounds with
caching — the shell rarely changes, so repeat visits are nearly free.

When it doesn't: small apps where the total bundle is already small, and apps where every
chunk is tiny — there the split only adds round trips. Same for apps with an always-eager
user flow, where the "deferred" code loads on every visit anyway.

The number to watch is the **critical-path bytes**: how much JavaScript must load before
first paint. Splitting doesn't reduce it if the heavy code is on the home page — it just
relocates the problem. Pair the split with a bundle analyser and real-device timing, not
bundle-size heuristics.

## 15. Debugging scenarios

**"The initial bundle is still huge after splitting."** Find the eager imports. An
`import { X } from 'heavy-lib'` at the top of a module in the main chunk defeats the
split. Search for direct imports of heavy libraries and replace them with dynamic imports
or dependency injections.

**"A route loads, then immediately loads another chunk before rendering."** That's a
duplicate dependency — the route chunk references a module that lives in another chunk, so
the browser fetches both. The analyser shows the duplicated modules; hoist them with
`splitChunks` or fix the import graph so one chunk owns the module.

**"Navigation to a lazy route shows a long blank."** The chunk is slow or the fallback is
missing. Check the chunk size, and add a `preload` for the next route so the fetch starts
before the click. If the chunk is huge, the split point is too coarse.

**"My `import(\`./pages/${name}\`)` produced one giant file."** Variable paths defeat the
static analysis. Replace them with literal paths, one per page.

**"The app broke after adding `splitChunks`."** A misconfigured vendor split can pull
modules into the wrong chunk or duplicate shared state — two copies of React break hooks.
Check the analyser output and the chunk graph, and keep `splitChunks` conservative.

## 16. Quick revision notes

- Splitting divides one bundle into chunks that load on demand — total code unchanged, timing changes
- The split point is a dynamic import; eager imports pull code into the main bundle
- Route-level by default; component-level for modals/editors; vendor for long-cached deps
- Literal import paths only — variables kill the split
- Shared modules hoist up; duplicates bloat the total
- Content hashes in filenames make unchanged chunks cacheable
- Bundle analyser to find oversized chunks and duplicate dependencies
- Preload the next route to hide the chunk fetch

## 17. Cheat sheet

```jsx
const Profile = lazy(() => import('./routes/Profile'));   // route chunk
const Editor  = lazy(() => import('./Editor'));           // component chunk
```

- A chunk is an output file, cut at a dynamic import
- Eager import → main bundle; dynamic import → own chunk
- Split at feature boundaries, not per component
- Hoist shared modules; dedupe what the analyser flags
- Content-hash filenames (`main.7f3a9c.js`) enable long-lived caching
- Measure critical-path bytes, not raw bundle size

## 18. Key takeaways

> [!RECAP]
> - Code splitting divides the bundle into chunks; a dynamic import is the split point
> - Lazy loading (Lesson 68) is the API you write; code splitting is what the bundler does with it
> - Route-level splitting is the default; component-level and vendor splitting cover the rest
> - Eager imports keep weight on the critical path; variable paths silently undo the split
> - Shared modules hoist up and duplicates bloat — verify with a bundle analyser
> - Content-hashed filenames + vendor chunks turn rarely-changing code into a cache win

## Check your understanding

Answer these without looking back.

1. What is a chunk, and what creates a new one?
2. Why does an eager import defeat a split even when the app "uses lazy loading"?
3. What are the three common split levels, and when do you use each?
4. Why does a variable inside `import()` break the split?
5. How would you find an oversized chunk or a duplicated dependency?
6. Why does keeping `react` in its own chunk make the app faster on repeat visits?

## What's Next

**Lesson 70 — Virtualization.** Splitting decides what *code* loads and when. The last
rendering problem is the opposite: too much content already in the DOM. The answer to
"how do you render 100,000 rows" is not a faster loop — it's not rendering most of them
at all.