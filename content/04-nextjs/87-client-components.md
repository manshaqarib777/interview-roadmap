# Lesson 87 — Client Components

**Interview importance:** ⭐⭐⭐⭐ — `use client` is a boundary marker, not a file-level
toggle. Widely misunderstood.

Lesson 86 established the new default: components run on the server and ship zero JS. A
Client Component is the deliberate exception — the island where interactivity lives. But
almost everyone gets one thing wrong about it: `use client` does **not** mean "this file
runs in the browser". It marks a **boundary** — the point where the server-rendered tree
hands off to the client runtime. This lesson is that distinction.

## Learning Objectives

By the end of this lesson you should be able to:

- Say what `use client` actually marks: a boundary, not a mode switch for the file
- Explain that Client Components are still pre-rendered to HTML on the server — only hydration happens in the browser
- List exactly what changes at the boundary (hooks, handlers, browser APIs become available)
- Name what does *not* change: imports from server modules are cut off, not converted
- Explain why the directive lives in a file and what that implies for the components in it
- Debunk "use client is a file-level toggle" with a precise mental model

## 1. What is a Client Component?

**A component that is pre-rendered on the server like everything else, then hydrated in the browser so it can hold state and react to input.**

The name is a trap. "Client component" sounds like "runs on the client", but every
component — client or server — is first rendered to HTML on the server. The difference is
what happens next: a Client Component's code also ships to the browser, and the browser
runs it to attach interactivity. That second step, hydration, is the entire reason the
category exists.

The definition to say out loud: *"A Client Component is rendered on the server like any
component, and then hydrated on the client. Hydration is what gives it state, effects, and
event handlers."*

## 2. Mental Model

Picture a **snapshot plus a live feed**.

The server takes a photo of the component — the rendered HTML — and sends it with the
page. That photo is what the user sees instantly, and it's also what SEO and crawlers see.
The component's JavaScript arrives separately and *replays* the render in the browser,
attaching listeners and wiring state to the exact DOM the photo produced. If the photo and
the replay disagree, you get the hydration mismatch warning (Section 16).

```text
server render (HTML)   →   "photo"  →  user sees it instantly, zero JS needed
component JS           →   "live feed" →  hydration replays the render and wires it up
```

The photo is not optional or decorative — it's the pre-render. The live feed is the extra
layer only client components get.

## 3. Visual Flow

```text
                SERVER                                        │        BROWSER
                                                              │
  ┌──────────────────────────────────┐                        │   ┌──────────────────────────┐
  │  app/cart/page.tsx  (server)     │                        │   │  HTML arrives             │
  │  ┌────────────────────────────┐  │                        │   │  ┌────────────────────┐   │
  │  │ <CartHeader/>   (server)   │  │    HTML + payload      │   │  │ render → no hydrate│   │
  │  └────────────────────────────┘  │───────────────────────▶│   │  └────────────────────┘   │
  │  ┌────────────────────────────┐  │    + client JS for     │   │  ┌────────────────────┐   │
  │  │ <CartButton/>  "use client"│  │    the boundary files  │   │  │ hydrate → state,   │   │
  │  │   boundary ────────────────┼──┼──────────┘             │   │  │ effects, handlers  │   │
  │  └────────────────────────────┘  │                        │   │  └────────────────────┘   │
  └──────────────────────────────────┘                        │   └──────────────────────────┘
         everything is pre-rendered                              only client components hydrate
```

Read it as two steps, not one: **every** component is pre-rendered; **only** components
inside the `use client` boundary are hydrated.

## 4. How It Works: The Boundary and the Two Passes

Two things happen to a Client Component, on two different machines.

**Pass 1 — pre-render (server).** The component runs on the server like any other and
produces HTML. Props are serialized and shipped with the RSC payload (Lesson 86).

**Pass 2 — hydration (browser).** The component's code has been bundled as a client
module. The browser loads it and runs it *over the already-rendered HTML*: React rebuilds
the tree in memory, attaches event listeners, restores state, and from then on the
component behaves like a normal React component. This is where hooks work.

```tsx
// app/components/cart-button.tsx
'use client';

import { useState } from 'react';

export default function CartButton({ count }: { count: number }) {
  const [open, setOpen] = useState(false);

  return (
    <button onClick={() => setOpen((v) => !v)}>
      Cart ({count}) {open ? '▲' : '▼'}
    </button>
  );
}
```

```text
server pass:  renders <button>Cart (3) ▼</button>  →  HTML ships
client pass:  loads the module, hydrates → onClick wired, useState becomes live
```

```narrate
1: The directive — it marks this file as the client boundary. Nothing else does.
5-6: Hooks are legal here precisely because hydration gave the component a runtime.
10-12: The handler runs in the browser after hydration.
```

> [!TIP]
> The pre-render is why a Client Component's *initial* markup is in the HTML source. Right-
> click → View Source on a client component and you'll see it — proof it ran on the server.

## 5. What Changes at the Boundary

The boundary is a wall around a subtree. Inside it, the rules of Lesson 86 are suspended:

| | Server side (Lesson 86) | Client side (inside the boundary) |
|---|---|---|
| Hooks (`useState`, `useEffect`, `useContext`) | ❌ build error | ✅ |
| Event handlers (`onClick`, `onChange`) | ❌ build error | ✅ |
| Browser APIs (`localStorage`, `window`, timers) | ❌ undefined | ✅ |
| `async` component body | ✅ | ❌ (but data hooks work — Lesson 89) |
| Direct DB / filesystem / secret access | ✅ | ❌ |
| JS shipped to the browser | 0 bytes | the boundary file's chunk |

The pattern: everything *interactive* becomes legal, and everything *server-only* (async
rendering, direct data access) becomes illegal. The two lists are mirror images.

## 6. The File-Level Toggle Myth

**`use client` is a boundary marker, not a mode switch — a file containing it is not "a
client file".**

Three consequences that shatter the toggle mental model:

**1. Everything imported into a client file becomes client too.** The directive covers the
file's *entire dependency graph* — except server components passed as children. This is why
it's called a boundary: crossing it pulls whatever you import across with you.

```text
'use client' file
   │
   ├── helper.ts          →  becomes client code (and must not touch server APIs)
   ├── Button.tsx         →  becomes client code
   └── server thing?      →  ❌ build error: can't import a Server Component here
```

**2. Server components inside the boundary stay server.** The boundary isn't the file's
contents — it's the crossing point. If a client component renders a Server Component as a
child, that child still runs on the server. Children flow across the boundary from the
server side; imports never flow out from the client side. Lesson 88 covers why this
asymmetry exists.

**3. Not every client-marked file is "interactive".** Some files carry the directive
simply because they need a hook or a handler somewhere — the rest of their UI is static
markup that ships as HTML and hydrates for no interactivity. The toggle reading ("this
file = client code") makes you expect the whole subtree to run in the browser. It doesn't.

The sentence to memorize: *"`use client` marks the boundary where server output hands off
to the client runtime — the file's children and imports come along, and whatever the server
passes down still renders server-side."*

> [!PITFALL]
> The most expensive myth in Next.js interviews: "`use client` makes everything in the file
> run in the browser." Wrong on both halves — the server pre-renders it, and server children
> still render on the server. Say the boundary version and you've already differentiated
> yourself.

## 7. Real Project Usage

| Where | Why it needs the boundary |
|---|---|
| **Buttons, toggles, modals** | `onClick` and local state |
| **Search box / typeahead** | Controlled input + effects for debounce |
| **Charts, maps, editors** | Browser APIs and animation |
| **Themes & settings** | `localStorage`, `useContext` |
| **Any component using a hook** | The hook is the tell — it needs a client runtime |

And a boundary file in practice:

```tsx
// app/components/search-box.tsx
'use client';

import { useState } from 'react';

export default function SearchBox({ placeholder = 'Search…' }) {
  const [q, setQ] = useState('');

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
      />
      <p>You typed: {q}</p>
    </div>
  );
}
```

```text
server:  <input value="" placeholder="Search…"> + <p>You typed: </p>   → HTML
browser: hydration wires value/onChange → typing updates the DOM
```

The `placeholder` prop was serialized by the server and handed to the client — that's how
props cross the boundary (Lesson 88).

## 8. Interview Explanation

> A Client Component is a component that's pre-rendered to HTML on the server like
> everything else, but whose code also ships to the browser, where it's hydrated — React
> replays the render, attaches listeners and restores state. `use client` marks the
> boundary where that hand-off happens.
>
> Crucially, `use client` isn't a file-level toggle. A client file's imports all become
> client code, but any Server Component passed to it as a child still renders on the server.
> What the boundary unlocks is hooks, event handlers, and browser APIs; what it cuts off is
> direct server access and async rendering.

## 9. Senior-Level Insights

- **"Pre-render, then hydrate" is the two-phase answer.** Mid-level answers say "client
  components run in the browser". Senior answers say "they're pre-rendered on the server
  for HTML/SEO, then hydrated in the browser — which is why hydration mismatches exist".
  The two-phase framing is the whole question.
- **The boundary is directional.** Server → client is *composition*: props and children
  cross it. Client → server is *forbidden*: you cannot import a server module into a
  client file. That asymmetry (detailed in Lesson 88) is the source of the classic
  "I just imported a server function and the build exploded" bug.
- **Hydration cost is per boundary, not per component.** One `use client` file hydrates
  once as part of the page. Tiny islands that should be one boundary, split into ten
  files, still hydrate — the cost is the hydration pass, not the file count.
- **Client doesn't mean "not cached".** The server pre-render of a client component is
  still cacheable at the route layer (Lesson 90). Interactivity doesn't forfeit caching;
  it just adds a hydration pass on top.
- **Island design is the senior skill.** Knowing *which* parts need the boundary is a
  design decision, not a syntax decision. Search, auth buttons, live regions — those get
  the boundary. Table markup, headers, static text — those stay server (Lesson 86).

## 10. Common Mistakes

- **"`use client` makes the file run in the browser."** It's pre-rendered on the server and
  hydrated in the browser. Both halves of that sentence matter.
- **Putting `use client` on a component that needs nothing from the client.** No hooks, no
  handlers — it ships JS and hydrates for zero benefit. Leave it server.
- **Putting `use client` on a *page* when only a button inside it is interactive.** The
  whole subtree goes client. Push the directive down to the smallest component that
  actually needs it.
- **Importing a Server Component into a client file.** Not "it becomes server-ish" — a
  build error: "You're importing a component that needs to run on the server." Only *passed
 * children can be server components, never imported ones (Lesson 88).
- **Calling a client component from a server component with a function in props.** The
  function can't cross the boundary — build error (Lesson 88). Pass data, not callbacks.
- **Expecting `useState` to initialize from the server render.** State initializes at
  hydration in the browser. The pre-render can't produce "current" state — that's why
  `localStorage` reads belong in an effect, not in the initializer.

## 11. Best Practices

✅ Start every component as a Server Component; add `use client` only when it needs a hook,
a handler, or a browser API

✅ Push the directive to the **smallest** component that needs it — one interactive island
per leaf beats one client page

✅ Let server components own the data and layout; let client components own the interaction

✅ Keep client components dumb at the edges: receive data as props (Lesson 88), never import
the database

✅ Separate `'use client'` presentational components from logic when it helps reuse — a
client component can still take server-rendered children

❌ Don't use `use client` as a default or a habit — it's a boundary, and every boundary costs
client JS

❌ Don't put server-only imports (DB, SDKs, `fs`) anywhere inside the boundary's import graph

❌ Don't initialize client state from server-passed values that differ per request — the
hydration mismatch is the symptom (Section 16)

## 12. Interview Questions

**Q1. What is a Client Component?**

> A component that's pre-rendered to HTML on the server like any other, but whose code also
> ships to the browser and is hydrated — React re-runs it over the existing HTML to attach
> listeners and restore state. After hydration it behaves like a normal React component.
> `use client` marks the boundary where that hand-off happens.

**Q2. Does a Client Component run on the server?**

> Yes — its initial render happens on the server. That's the pre-render: the HTML ships
> with the page for fast first paint and SEO. The client only *hydrates* that markup; it
> doesn't produce it from scratch. So a client component runs on both machines — at
> different stages.

**Q3. What does `use client` actually do?**

> It marks the boundary file in the module graph. The components in that file, and
> everything they import, get bundled for the client and hydrated. Components passed to it
> as children from the server still render on the server. It's a boundary marker, not a
> "this is a client file" toggle.

**Q4. Why does a client component show up in View Source if it's a client component?**

> Because it was pre-rendered on the server. View Source shows server output — the HTML
> every component produced before shipping. What View Source can't show is the hydration
> pass, because that happens in the browser after the page loads.

**Q5. When is `use client` the wrong choice?**

> When the component needs none of what the boundary provides — no hooks, no handlers, no
> browser APIs. Then the directive only adds client JS and a hydration pass. Also when you
> only need server data: an async server component reads it directly (Lesson 86), while a
> client component needs a data hook or a fetch (Lesson 89).

**Senior follow-up: Your client component needs data from the database. Where does it get
it?**

> I'd prefer to push the data read up into the server tree: the parent Server Component
> awaits the query and passes the result to the client component as props. That keeps the
> database access server-side and the client component small.
>
> When the data genuinely belongs to client interaction — live updates, user-specific
> values — I'd use a data-fetching hook (SWR/React Query or a fetch in an effect, Lesson
> 89), with the Server Component as the loading fallback. The decision rule: if the data is
> the same for everyone, read it on the server and pass it down; if it depends on client
> state or changes live, fetch it client-side.

## 13. Follow-up Questions

**Can a Client Component contain a Server Component?**

> Only as a **child, not as an import**. A server component passed in through `children`
> keeps running on the server and is rendered into the client component's output. Importing
> one is a build error. The boundary is directional: children flow in from the server,
> imports can't flow out from the client.

**Why is the initial render still server-side?**

> Because every route's first render happens on the server in the App Router — that's what
> produces the HTML for SEO and first paint. Client components are pre-rendered as part of
> that pass; the client step is hydration, not initial rendering. One render on the server,
> one replay on the client.

**What breaks hydration?**

> Anything where the browser's first render differs from the server's HTML. Classic causes:
> reading `localStorage` or `window` during render, `new Date()` / `Math.random()` in the
> body, or relying on data that differs per machine. The browser replays the component and
> gets different output than the server photo — a mismatch warning (Section 16).

## 14. Comparison Table

| | Server Component (Lesson 86) | Client Component |
|---|---|---|
| Pre-rendered on server | ✅ | ✅ — both are |
| Hydrated in browser | ❌ never | ✅ |
| Ships its JS to browser | 0 bytes | ✅ |
| Hooks / handlers / browser APIs | ❌ | ✅ |
| Async component body | ✅ | ❌ (use data hooks) |
| DB / secrets / filesystem | ✅ | ❌ |
| Where the code lives | Server only | Server (pre-render) + browser (hydrate) |
| When you choose it | Non-interactive UI | Interactive islands |

## 15. Performance Notes

- **The cost of a client component is a chunk plus a hydration pass.** The chunk is
  download + parse; the pass is a render replay. Both are paid once per page load, per
  boundary.
- **Smaller client tree = cheaper hydration.** Hydration scales with what's inside the
  boundary. Push markup out to server children and the replay shrinks.
- **Hydration isn't free even for "static" client UI.** A client component with no hooks
  still ships JS and hydrates. That's why marking files "just in case" is a real, if small,
  cost.
- **The pre-render keeps first paint and SEO intact.** Because HTML arrives with the page,
  moving a component client-side doesn't hurt initial paint — it only adds the hydration
  step. That's the trade working as designed.
- **Don't tune client components in isolation.** The metric that matters is total client JS
  across the page. One big chart is fine; ten tiny client files each pay a full hydration
  entry cost.

## 16. Debugging Scenarios

**Scenario 1: "Hydration failed because the initial UI does not match what was rendered on
the server."**

The browser's first render differed from the server's HTML. Look for time/random values or
browser reads in the render body — `new Date()`, `Math.random()`, `localStorage` at the top
level. Fix: move those into an effect or the client-only half of the island.

**Scenario 2: "I added `use client` to my page and the bundle ballooned."**

The whole page subtree went client — including all its markup. Fix: move the directive down
into the specific interactive components. A page should usually stay a Server Component
with client islands inside it.

**Scenario 3: "My click handler 'does nothing' on first click."**

The handler is attached at hydration, which may lag the first paint on a slow connection.
The HTML responds to nothing until hydration completes. This is expected behavior, not a
bug — and it's exactly why interactive parts should be small islands that hydrate fast.

**Scenario 4: "Build error: 'You're importing a component that needs to run on the server.'"**

You imported a Server Component into a client file — e.g., a server data module or a
component that reads the DB. You can't cross the boundary with an import. Restructure: pass
the data as props from a server parent, or move the server part up the tree (Lesson 88).

**Scenario 5: "I read `window.innerWidth` in a client component and SSR broke."**

`window` doesn't exist during the server pre-render. Guard it, or read it in an effect and
store it in state — the classic `useEffect(() => setWidth(window.innerWidth), [])` pattern
— so the server pass renders without it and hydration picks it up.

## 17. Quick Revision Notes

- Client Component = pre-rendered on server + hydrated in browser
- `use client` = **boundary marker**, not a file-level toggle
- Everything inside the boundary's import graph becomes client code
- Server children passed in still render on the server — boundaries are directional
- Hooks, handlers, browser APIs: legal inside the boundary, build errors outside it
- Async bodies and direct server access: legal outside, cut off inside
- Pre-render ≠ hydration: the first is server work, the second is browser work
- View Source shows client components because they were pre-rendered
- Smallest-possible-boundary is the design principle (islands)
- Hydration mismatch = browser first render ≠ server HTML — usually time/random/browser reads

## 18. Cheat Sheet

```text
'use client'  =  "this file is the client boundary"

  server pre-renders EVERY component → HTML
  browser hydrates ONLY boundary files → state, effects, handlers

  inside boundary:  hooks ✅  handlers ✅  browser APIs ✅
                    async body ❌  server imports ❌  secrets ❌

  boundary is directional:
     server → client  children + props cross      (OK)
     client → server  imports are cut off         (build error)

  choose it:  needs state / effects / handlers / browser APIs
  skip it:    static markup, layout, read-only UI  (stays server, zero JS)
```

## 19. Key Takeaways

> [!RECAP]
> - A Client Component is pre-rendered on the server, then hydrated in the browser — two passes, two machines
> - `use client` marks a **boundary**, not a file mode: imports cross it, server children don't
> - Hooks, handlers and browser APIs are what the boundary unlocks; async bodies and server access are what it cuts off
> - The directive covers the whole import graph of the file — that's why "just in case" marking is costly
> - The pre-render is why client components appear in View Source and still get SEO
> - Smallest-possible-boundary is the design rule: interactive islands in a server tree (Lesson 86)
> - Hydration mismatch is the diagnostic for anything that renders differently on the two sides

## Check your understanding

Answer these without looking back.

1. In two sentences: where does a Client Component run, in what order, and why is the first pass not optional?
2. What is the difference between the pre-render and hydration? Which one does every component get?
3. `use client` is not a file-level toggle — what is it, and what are the two consequences of that?
4. A client component imports a helper that reads the database. What happens, and how do you fix the design?
5. Why does a client component with no hooks still cost something at runtime?
6. Name three things that become legal inside the boundary and three that become illegal.
7. Your page needs a live search box and a static table of results. Where do you put `use client` — and why not on the page?

## What's Next

**Lesson 88 — The Server/Client Boundary.** What can cross it, what cannot, and why your
import broke the build — serialization rules, server children, and the exact mechanics of
the two directions.
