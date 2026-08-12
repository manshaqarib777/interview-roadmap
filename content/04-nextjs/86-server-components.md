# Lesson 86 — Server Components

**Interview importance:** ⭐⭐⭐⭐⭐ — the defining Next.js interview question today.

React Server Components (RSC) inverted the default: your components now render on the
server and ship **zero client JavaScript** unless you ask for it. "Why is my page server-
rendered but has no JS?" isn't a bug — it's the architecture working as designed.

This lesson is the mental model. If you came here from Lesson 83's App Router, you already
know *which* files map to routes; this is about *what actually runs where*, and how a
single component tree can span two machines.

## Learning Objectives

By the end of this lesson you should be able to:

- Say what a Server Component actually is: rendered on the server, serialized, no hydration JS
- Explain why the default component is a Server Component, and why that changes your bundle
- Write and run an async Server Component
- Explain why you can't use hooks or event handlers in a Server Component — with the *why*
- Draw the tree that spans the server/client boundary, with children of either kind
- State what the RSC payload actually contains (HTML + the serialized tree), and where hydration happens

## 1. What is a Server Component?

**A React component that renders on the server, serializes its result, and ships the browser no JavaScript to run it.**

Not "server-side rendered markup" in the old SSR sense — the RSC model is deeper. In the
App Router, every component is a Server Component by default, and a Server Component:

- Runs **once per request**, on the server, with direct access to the database and the filesystem
- Can be `async` — `await` a database query right in the component body
- Never ships to the browser — no component function, no hooks, no hydration bundle
- Sends the client only its **rendered output**: HTML plus the serialized tree (the RSC payload)

The sentence to have ready: *"A Server Component is a component whose code never reaches
the client. The server runs it, serializes the result, and the browser only receives
output — so it can't use hooks, state, or event handlers."*

## 2. Mental Model

Think of a Server Component as a **pre-cooked meal**; a Client Component is a recipe you
hand the kitchen.

| | Server Component | Client Component |
|---|---|---|
| Kitchen | Server, once per request | Server *and* browser |
| What ships | The finished dish (HTML + payload) | The recipe (JS to run) |
| Can you change it at the table? | ❌ — it's already cooked | ✅ — that's interactivity |

The old mental model — "SSR renders HTML on the server, then hydrates it client-side" —
still assumes every component runs on both machines. RSC changes that: a Server Component
runs **exactly once, on the server**, and is never re-run or hydrated. That is the whole
architectural shift, and it's the first thing to make clear in an interview.

## 3. Visual Flow

```text
                SERVER                        │        BROWSER
                                              │
  ┌──────────────────────────────┐            │   ┌──────────────────────┐
  │  app/page.tsx  (Server)      │            │   │  HTML:  rendered page │
  │  ┌────────────────────────┐  │            │   │  payload: serialized  │
  │  │  await db.getPost(id)  │  │   renders  │   │  tree + props         │
  │  └────────────────────────┘  │───────────▶│   │                       │
  │  <Article post={post}/>      │            │   │  No <Article> JS.     │
  │  (no hooks, no handlers,     │            │   │  No hydration for it. │
  │   zero client JS)            │            │   └──────────────────────┘
  └──────────────────────────────┘            │
       runs once per request                  │     hydration happens
       ↑ filesystem / DB / secrets            │     only for client JS
```

Note the asymmetry: the browser receives **output** (HTML + serialized tree), never the
component's source. A Server Component cannot be interactive because nothing on the client
could run it.

## 4. How It Works: Async Components and the RSC Payload

Two mechanisms make RSC work.

**1. Async components.** A Server Component can `await` directly in its body — no
`useEffect`, no loading state, no data-fetching library:

```tsx
// app/posts/[slug]/page.tsx — Server Component
import { getPost } from '@/lib/db';

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost(params.slug);   // ← runs on the server, per request

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}
```

```text
request for /posts/hello → getPost('hello') runs on the server
                        → HTML with <h1>hello</h1> + <p>…</p> ships to the browser
                        → zero JavaScript for this component
```

```narrate
1-3: An async component is the normal way to read data in the App Router.
4-6: The component awaits the database directly — no useEffect, no loading state.
9-13: It returns JSX like any component, but the whole thing ran on the server.
```

**2. The RSC payload.** The server doesn't just send HTML. It also sends a serialized
description of the rendered tree — a JSON-like stream called the RSC payload — so the
client can reconcile without re-running your components:

```text
RSC payload (simplified — this is what the network actually carries):

M1:{"id":2485,"chunks":["app/page-…js"]}
J0:["$","div",null,{"children":[
  ["$","h1",null,{"children":"Products"}],
  ["$","./Counter","c0",{"count":0}],
  ["$","p",null,{"children":"rendered on the server"}]
]}]
```

Each `["$", type, ref, props]` entry is a **serialized React element**. Server-rendered
elements arrive as plain markup in the HTML; only elements marked as client references
(such as `./Counter` above) are handed to the client runtime and hydrated. This payload is
exactly why the browser can update that `<h1>` when server data changes without ever having
the `page.tsx` source.

> [!DEEPDIVE]
> The RSC payload is a streaming, incremental protocol (`M` = module reference, `J` = JSX
> element, `S` = symbol, `D` = Date, `A` = array). `Date`, `Map`, `Set` and `RegExp` get
> special encoding tags precisely because plain JSON can't round-trip them. Lesson 88 covers
> exactly which values survive the crossing.

## 5. The Default-Server Fact

**In the App Router, every component is a Server Component unless you add `use client`.**

There is no opt-in flag, no `.server.jsx` extension — server is the default and `use client`
(Lesson 87) is the only escape hatch. That is the inversion to internalize:

```text
Pages Router (old):  page.tsx  +  component.tsx
                     run on client, SSR'd for SEO         →  JS everywhere

App Router (now):    page.tsx  +  component.tsx  +  use client.tsx
                     run on server by default            →  JS only where asked
```

Consequences that sound like bugs but are the design:

- **A component with no `use client` ships zero JS** — not "less JS", *zero*.
- **`useState` in a Server Component is a build error**, not a silent misfeature.
- **The bundle shrinks automatically.** Shared UI (layouts, cards, text) stops duplicating
  into every page's JavaScript.
- **Only the leaves opt into JavaScript.** You keep the tree mostly server and sprinkle
  `use client` components where interaction genuinely lives.

> [!TIP]
> The bundle intuition: a Server Component's code is *never in the client bundle at all* —
> it contributes nothing, not even dead-code weight. That's why a RSC-heavy page can render
> and still show "0 KB" of framework JS in DevTools.

## 6. Real Project Usage

| Where | How |
|---|---|
| **Read-heavy pages** | Blog post, product page, docs — `await` the DB, render, done |
| **Public pages with SEO** | Full HTML ships for crawlers; no client JS to slow it down |
| **Layouts & navigation shell** | Lesson 84: layouts re-render on navigation — keeping them server means that re-render costs no client work |
| **Dashboards** | Table rows, summaries, charts *server-side*; only the chart's interactivity becomes a Client Component |
| **Anything secret** | DB credentials, API keys, business logic — importable only where the client can never reach |

A canonical pattern: the **server shell, client island** split. The page and most of its
tree stay server; a single interactive island opts in:

```tsx
// app/posts/page.tsx — Server Component (default)
import PostCard from './post-card';
import LikeButton from './like-button';   // has 'use client'

export default async function PostsPage() {
  const posts = await getPosts();          // server-only

  return (
    <div className="grid">
      {posts.map((post) => (
        <PostCard key={post.id} post={post}>
          <LikeButton count={post.likes} />   // island of interactivity
        </PostCard>
      ))}
    </div>
  );
}
```

```text
server renders the grid + every card's text     →  HTML in the response
LikeButton ships as a client module reference   →  the only JS this page loads
```

The page owns the data, the card owns the markup, and the button owns the interactivity —
each side doing what only it can do.

## 7. Interview Explanation

> A Server Component is a React component that renders on the server, serializes its
> result, and sends the browser no JavaScript to run it. In the App Router it's the
> default: no opt-in, no directive — every component is a Server Component until it says
> `use client`.
>
> Server Components can be async, so they `await` the database directly in the render
> instead of fetching in an effect. The server sends HTML plus a serialized tree — the RSC
> payload — describing the rendered output. Because the component's code never reaches the
> client, it can't use state, effects, or event handlers; those need a Client Component
> (Lesson 87). The payoff is that non-interactive UI stops shipping any JavaScript at all.

That's the 30-second answer: *what it is, that it's the default, async, the payload, and
the trade* (no interactivity).

## 8. Senior-Level Insights

- **"Runs once per request" is the RSC contract, not an implementation detail.** Your
  component is not "SSR'd then hydrated" — it runs on the server, produces output, and is
  *never executed again*. Saying that framing separates you from candidates who describe
  old-style SSR.
- **The payload is the innovation.** React didn't invent server rendering; it invented a
  *transport* that lets server and client elements coexist in one tree. The stream protocol
  means the client can reconcile and update parts of that tree without owning the components
  that rendered it.
- **Caching, not re-rendering, is the scaling lever.** Because a Server Component runs per
  request, the way you make it fast is by caching its data — `unstable_cache`, or Next.js's
  fetch/route caching (Lesson 90). "RSC is slow because it renders per request" is a
  beginner's argument; the senior answer is about the cache layer underneath.
- **Streaming for free.** Async components can stream: the shell ships immediately and each
  `await` flushes its section when ready. That's Suspense's server-side half (Lesson 91).

## 9. Common Mistakes

- **"Server Components are just SSR."** SSR renders the same component on both machines.
  RSC runs it *only* on the server and never hydrates it. Different model, different bundle
  profile, different answer.
- **`useState` / `useEffect` in a Server Component.** Not a warning — a build error:
  "You're importing a component that needs `useState`." Hooks are a client-runtime feature;
  a component that never runs on the client can't use them.
- **`onClick` on a server element.** The handler can't be serialized (Lesson 88), so you
  get a build error telling you the component "cannot be converted to a Client Component"
  or that you're passing a function to a server component.
- **Assuming `"use client"` makes the *whole file* client.** It marks the boundary file and
  its *imported* dependencies; server children you pass it still render on the server. The
  full rules are Lesson 87 and Lesson 88.
- **Thinking zero client JS is a bug.** When a page shows no JS in DevTools, that's RSC
  working — the page has no interactivity to pay for.
- **Treating async components as global.** The `await` is per-component-instance, not a
  cache. Two pages awaiting the same query each pay for it — that's what caching (Lesson
  90) is for.

## 10. Best Practices

✅ Let the default work: no `use client` until a component needs state, an effect, or a handler

✅ `await` data in the Server Component body instead of fetching in a client effect

✅ Keep layouts and read-only UI server — the biggest automatic bundle win

✅ Push interactive bits to the leaves, so the server tree stays large and the client JS tiny

✅ Use the server for anything secret: env vars, tokens, DB logic never ship

❌ Don't add `use client` "just in case" — every directive costs client JS

❌ Don't pass database objects wholesale to Client Components; pass the plain serializable
fields they need (Lesson 88)

❌ Don't put fetch-heavy client components inside a server page when the same data could be
awaited above them

## 11. Interview Questions

**Q1. What is a React Server Component?**

> A component that renders on the server, serializes its output, and sends the browser no
> JavaScript to run it. The browser gets the finished HTML and a serialized tree — the RSC
> payload — so it can update that part of the page without owning the component's code.
> Because the code never ships, Server Components can't use state, effects, or event
> handlers.

**Q2. Why is the default a Server Component?**

> Because most UI doesn't need to be interactive, and making the non-interactive majority
> zero-JS shrinks the bundle for free — the page ships HTML, not framework runtime code, for
> everything that doesn't respond to the user. Interactivity is the exception, so it's the
> part that opts in (Lesson 87).

**Q3. Can a Server Component be async? What does that give you?**

> Yes — in fact async is a core feature. The component `await`s the database or an API
> directly in its body and renders with the result. That removes the whole fetch-in-effect
> dance, the loading states, and the data-fetching library. Combined with Suspense it also
> enables streaming: the shell can flush before slow data sections are ready.

**Q4. What exactly does the browser receive from a Server Component?**

> Two things: the rendered HTML — which is what shows up and what SEO sees — and an entry in
> the RSC payload, a serialized description of the element tree. Client component references
> in that payload are what the browser hydrates. The component's source code is never
> transmitted.

**Q5. When does a Server Component's code re-run?**

> When the server renders the route again — a new request, a navigation, or a cache
> invalidation. It never re-runs "on the client" because it doesn't exist on the client.
> That's why `useEffect` isn't available: effects are for work that must happen after a
> render, and there is no render to attach to.

**Senior follow-up: A page with only Server Components shows 0 KB of JS. Walk through what
happens when the user clicks a link to it.**

> The browser requests the route; the server runs the components — database awaits included
> — and streams back HTML plus the RSC payload. The browser renders the HTML with no
> hydration step, so the page is interactive *for static content* instantly: no JS to parse,
> compile, or execute. Next.js's client-side router still prefetches and patches the payload
> so navigation stays instant — but "instant" here is one network round-trip, not a JS
> boot-up. The cost of zero JS is that nothing on that page can react to user input, which
> is fine for a read-only page and wrong for, say, a search box.

## 12. Follow-up Questions

**How is RSC different from classic SSR?**

> Classic SSR runs the same components on the server to produce HTML, then *re-runs them on
> the client* to hydrate — every component ends up in the bundle twice. RSC runs a component
> once, on the server, and the client only receives the output. No second execution, no
> hydration JS for that component.

**Why can't a Server Component use hooks?**

> Hooks are a client-runtime feature: `useState` manages state that lives in the browser's
> React runtime, `useEffect` schedules work after a render that happens in the browser. A
> Server Component's render happens on the server and never happens again — there's no
> runtime on the client to host those hooks. The build rejects them so the mistake can't
> ship.

**Does an async Server Component block the whole page?**

> Not necessarily. Each `await` inside a Suspense boundary can stream independently — the
> already-rendered shell flushes first, and each pending section flushes when its data
> arrives. Without Suspense, the await blocks that section's output. The failure mode to
> know: `await` *inside* a Suspense boundary streams; awaiting before it delays it.

## 13. Comparison Table

| | Server Component | Client Component (Lesson 87) |
|---|---|---|
| Runs on | Server, once per request | Server (pre-render) + browser (hydration) |
| Async component | ✅ `await` in body | ❌ — fetch in an effect or the data hooks |
| Hooks & handlers | ❌ build error | ✅ |
| Ships code to browser | ❌ zero JS | ✅ the component's JS |
| Access to DB / filesystem / secrets | ✅ | ❌ |
| Bundle weight | 0 bytes | Its own chunk |
| When to use | Anything non-interactive | Anything the user interacts with |

## 14. Code Example

```tsx
// app/posts/page.tsx — full Server Component, runnable shape
type Post = { id: number; title: string };

// stand-in for the real database call
async function getPosts(): Promise<Post[]> {
  return [
    { id: 1, title: 'RSC payloads' },
    { id: 2, title: 'Zero client JS' },
  ];
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <main>
      <h1>Posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </main>
  );
}
```

```text
GET /posts → getPosts() awaits on the server → HTML:
  <main><h1>Posts</h1><ul><li>RSC payloads</li><li>Zero client JS</li></ul></main>
  client JS for this page: 0 KB
```

```narrate
1: This whole component runs on the server — none of it ships.
6-8: A stand-in for a real database query, awaited like any promise.
11: The await is what makes this an async Server Component.
16-22: Plain JSX over the awaited data — the entire component.
```

## 15. Performance Notes

- **The win is load-time JS, and it's structural.** Non-interactive UI contributes *zero*
  bytes. Frameworks that ship a runtime for every component can't match that by
  minification — this is the difference between smaller and absent.
- **Server work moves the cost, it doesn't delete it.** The DB query and the render now
  happen on your server per request. That's why caching (Lesson 90) and streaming matter
  here more than anywhere else.
- **Streaming hides the slow parts.** Wrap slow async sections in Suspense and the shell
  paints immediately; each section flushes when ready. First-paint and time-to-interactive
  both improve.
- **Zero-JS pages have an interesting performance profile.** The page is interactively
  instant (nothing to hydrate) but contains no interactivity. Optimize for *that* trade,
  not for "JS is always bad".
- **Don't over-tune.** A page of plain server markup doesn't need memo, context, or
  code-splitting tricks. RSC already removed the work; adding machinery adds complexity.

## 16. Debugging Scenarios

**Scenario 1: "My page has no interactivity — I click the button and nothing happens."**

The button is inside a Server Component. A Server Component's output can't run handlers, so
the click has nothing to attach to. Fix: move the interactive part into a `use client`
component (Lesson 87) and render it as a child of the server page — the island pattern.

**Scenario 2: "Build fails: 'You're importing a component that needs useState.'"**

You're using a hook inside a component that has no `use client`. Either add the directive,
or — better — restructure so the hook lives in a small client component and the server
component stays server. The error message is the compiler doing its job, not a bug.

**Scenario 3: "My component shows 'Text content does not match server-rendered HTML.'"**

A server-rendered value differs from the client's value — classic cause: `new Date()` or
`Math.random()` in a Server Component, or a value rendered both server-side and in a client
component. Fix: render dynamic values in the client island only, or push them to an effect.

**Scenario 4: "The page is slow even though it ships no JS."**

The slowness is server-side: per-request database work with no cache. This is the caching
lesson (Lesson 90), not an RSC problem. Check whether the query is duplicated across pages
and whether the route is being re-rendered when it doesn't need to be.

## 17. Quick Revision Notes

- Server Component = renders on the server, serializes, **zero client JS**
- Default in the App Router — no directive needed; `use client` is the opt-out (Lesson 87)
- Async components: `await` the DB right in the body — no effects, no fetch library
- Runs once per request; never re-runs on the client, never hydrates
- No hooks, no event handlers — build errors, not runtime surprises
- Client gets HTML + the RSC payload (serialized tree); client references hydrate
- Bundle effect: non-interactive UI contributes **0 bytes**
- Old-SSR difference: SSR runs components twice, RSC runs them once on the server
- Per-request cost is real → caching (Lesson 90) and Suspense streaming are your levers

## 18. Cheat Sheet

```text
RSC = server renders once  →  serializes output  →  browser gets HTML + payload, no JS

DEFAULT      →  server        →  async OK, hooks ❌, handlers ❌, zero client JS
"use client" →  boundary file  →  pre-rendered on server, hydrated on client (L87)

payload stream:   M = module ref    J = JSX element
                  D = Date          A = array     S = symbol

RSC fast path:  await data → Suspense boundary → stream → cache (L90)
```

## 19. Key Takeaways

> [!RECAP]
> - A Server Component is a component that runs on the server and never ships its code — the browser gets rendered output, not JavaScript
> - It's the **default**: every component is a Server Component until it says `use client`
> - Async components `await` the database directly in the render — no effects, no fetch library
> - No hooks, no event handlers: nothing on the client exists to run them
> - The RSC payload is the serialized tree (HTML + module references) that lets the client update server-rendered UI without owning it
> - The bundle payoff is structural: non-interactive UI contributes exactly zero bytes
> - Per-request server rendering is the cost — caching (Lesson 90) and streaming are the levers

## Check your understanding

Answer these without looking back.

1. What is a Server Component, in one sentence that doesn't say "server-side rendering"?
2. Why can't a Server Component use `useState`? Answer with the mechanism, not the rule.
3. What two things does the browser actually receive for a server-rendered part of the page?
4. A page of only Server Components shows 0 KB of JS. Why is that correct, and what does it mean for interactivity?
5. How is RSC different from classic SSR in terms of how many times a component runs?
6. What does `await` inside a Suspense boundary give you that a plain await doesn't?
7. You need to render a list of posts AND let users like each one. Which parts stay server, which become client — and why?

## What's Next

**Lesson 87 — Client Components.** `use client` doesn't "make a file client-side" — it marks
a boundary. Where the line sits, what still runs on the server, and why the directive
appears at the top of files you'd never expect.
