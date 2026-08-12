# Lesson 82 — Local vs Global vs Server State

**Interview importance:** ⭐⭐⭐⭐⭐ — the architecture question. Answer it with a decision rule, not a library preference.

Every state-management interview eventually lands here: *"where does this state live,
and why?"* Most candidates answer with a library preference — "we use Redux at work" —
which is exactly the wrong layer. The question is not which tool you like. It is which
*class* the state belongs to, because the class dictates the tool. A senior answer starts
with a decision rule and only names a library after the rule has done its work.

This is the capstone of the state-management arc. Lesson 78 gave you Redux's formal store,
Lesson 80 the lightweight store, Lesson 81 the server-state cache. This lesson is the
architecture that decides between them — and explains why most real apps are boring on
purpose: four tools, four jobs, no overlaps.

## Learning Objectives

By the end of this lesson you should be able to:

- Classify any piece of state into local, shared-UI, cross-cutting client, or server state
- Apply the four-way decision rule and justify each branch out loud
- Walk a full feature through the rule — where each value lives and why
- Explain why server state is a class of its own, even though it looks like "data"
- Answer "should I use Redux/Zustand/Context?" with a rule, not a preference

## 1. What is State Architecture?

**State architecture is the discipline of deciding where every value in your app lives, based on what the value is — not on which library you like.**

Four classes, four homes: **ephemeral UI state** stays in the component, **shared UI
state** travels through Context, **cross-cutting client state** lives in a store, and
**server state** lives in a server-state cache. The decision rule maps any value to one
of the four — and most bugs that get blamed on libraries are really values living in the
wrong class.

## 2. Mental Model

Think of the app as a **house with four rooms, and every value has a natural room**.

- A value only one person uses at a time stays in that person's pocket (**local**).
- A value the whole household shares — the Wi-Fi password — is written once and read by
  everyone (**Context**).
- A value that is shared *and* changes often — the shopping list on the fridge — needs a
  real board with people subscribing to it (**store**).
- The outside world's facts — the weather, the parcel tracker — are not yours at all.
  You keep a *mirror* of them, updated by the service that owns them (**server-state
  cache**).

The architecture question is just: *which room does this value belong to?* You decide the
room by the value's nature, and only then pick the furniture (the library). Nobody picks
furniture first and then decides the room — which is exactly what "we use Redux" does.

## 3. Visual Flow

```text
                    ┌────────────────────────────────────────┐
                    │            a value appears             │
                    └──────────────────┬─────────────────────┘
                                       │
                    ┌──────────────────▼─────────────────────┐
                    │  1. Does the server own it?             │
                    │     (fetched / written to an API)      │
                    └──────────┬──────────────┬──────────────┘
                       yes     │              │  no
                               ▼              ▼
              ┌───────────────────────┐   ┌───────────────────────────────┐
              │ SERVER STATE          │   │  2. Who uses it?               │
              │ TanStack Query (L81)  │   └───────┬───────────┬────────────┘
              └───────────────────────┘   one    │           │  many
                                           comp  │           ▼
                                           ▼  ┌───────────────────────────────┐
                          ┌───────────────────────┐   │  3. Does anything OUTSIDE│
                          │ LOCAL STATE           │   │     React read/write it? │
                          │ useState (L50)        │   └───────┬───────────┬────┘
                          └───────────────────────┘    no    │           │  yes
                                                        ▼    │           ▼
                                          ┌──────────────────────┐  ┌──────────────────┐
                                          │ SHARED UI STATE      │  │ CROSS-CUTTING    │
                                          │ Context (L77)        │  │ CLIENT STATE     │
                                          │ theme, locale        │  │ Zustand (L80)    │
                                          └──────────────────────┘  │ Redux (L78)      │
                                                                     └──────────────────┘
```

Four questions, four homes. The rule's power is that it asks the *same* questions for a
checkbox and for a dashboard — the answers are just different.

## 4. How It Works — The Decision Rule

The rule in words, in the order you apply it:

1. **Server owns it?** (fetched from, or written to, an API) → **server state** — TanStack Query (Lesson 81).
2. **One component uses it?** → **local state** — `useState` (Lesson 50).
3. **Many components share it, all inside React?** → **shared UI state** — Context (Lesson 77).
4. **Anything outside React touches it** — a second tab, a WebSocket, a timer, middleware, another module → **cross-cutting client state** — a store: Zustand (Lesson 80), or Redux Toolkit (Lesson 78) for stricter teams.

Worked example — the cart, end to end:

```jsx {2}
function CartItem({ item }) {
  const [qty, setQty] = useState(1);              // 1 component → LOCAL (L50)
  // …
}

const ThemeContext = createContext('light');      // shared, read-only, rarely changes → CONTEXT (L77)

const useCart = create((set) => ({                // shared + written from anywhere → STORE (L80)
  items: [],
  add: (item) => set((s) => ({ items: [...s.items, item] })),
}));

const { data: products } = useQuery({             // server owns the catalogue → QUERY (L81)
  queryKey: ['products'],
  queryFn: fetchProducts,
});
```

```text
qty         → useState        → dies when the component unmounts
theme       → Context         → read by many, written almost never
cart items  → Zustand store   → written from buttons all over the tree
products    → TanStack Query  → the server's data, mirrored
```

Each value answered a different question, so each value lives in a different place. No
tool was chosen "because the team uses it" — the rule chose it.

## 5. Real Project Usage

A realistic mid-sized app classified with the rule:

| Value | Class | Home | Why the rule says so |
|---|---|---|---|
| Form field values | Local | `useState` | one component, dies on unmount |
| Expanded accordion item | Local | `useState` | same — even if nested, it is not shared |
| Theme (light/dark) | Shared UI | Context | many consumers, near-static, React-internal |
| Locale | Shared UI | Context | same shape — read everywhere, written rarely |
| Current user session | Cross-cutting | Zustand store | read everywhere *and* written from outside React |
| Cart contents | Cross-cutting | Zustand store | written from buttons across the tree |
| Toasts | Cross-cutting | Zustand store | pushed from anywhere, even non-React code |
| Products, orders, profile | Server | TanStack Query | the server owns them — fetch, cache, invalidate |

The boring observation: almost everything is local, a few things are Context, a handful
are a store, and every API read is a query. That distribution *is* the architecture.

## 6. Interview Explanation

> I classify state by what it is, not by a library. If the server owns the value, it is
> server state and belongs in TanStack Query — the server is the source of truth, and the
> cache mirrors it with freshness rules. If one component uses the value, it is local —
> `useState`, and it dies with the component. If several components share it but nothing
> outside React touches it, that is shared UI state — Context, fine for theme and locale.
> If it is shared *and* something outside React reads or writes it — a second tab, a
> timer, a WebSocket — it is cross-cutting client state, and it goes in a store: Zustand
> for most apps, Redux where the team needs stricter discipline. The rule answers every
> "which library?" question before any library is named.

## 7. Senior-Level Insights

- **The rule is the answer; the libraries are the vocabulary.** Interviewers hear a
  hundred "we use Redux" answers. Saying "first I ask who owns the data" moves you into a
  different band instantly.
- **Server state is a class, not a smell.** It looks like "data", so juniors put it in the
  store with everything else. Naming the distinction — the server owns the truth, the
  client mirrors it (Lesson 81) — is the senior marker.
- **Context is for sharing, not for state.** Lesson 77's re-render-every-consumer cost is
  fine for theme and locale, and wrong for anything high-frequency. The rule keeps Context
  small and honest instead of using it as a budget global store.
- **Ask the ownership question about writes, too.** A value that is *written* from outside
  React cannot live in a component — that is what pushes the session and the cart out of
  Context and into a store.
- **The right answer is often "both", and that is fine.** A dashboard page uses local
  state for its tabs, Context for the shared filter bar, a store for the session, and
  queries for every chart's data. Four tools in one feature is the rule working, not a
  mess.
- **The rule survives new libraries.** It classifies the state, and any tool that fits the
  class is interchangeable — which is exactly why "we use Redux" is the wrong thing to say.

## 8. Common Mistakes

- **"We use Redux" instead of the rule.** A library preference is not an architecture.
  It fails the moment the interviewer asks *why not Context here?* — because you never
  decided, you just copied.
- **Putting server data in a global store.** The most expensive mistake in this space:
  duplicate copies of data you do not own, no dedup, no retry, no invalidation. It is the
  Lesson 80 trap wearing an architecture.
- **Context as a default for "shared".** Sharing is necessary but not sufficient. If
  anything outside React writes the value, or it changes at high frequency, Context is the
  wrong home — its broadcast cost (Lesson 77) is exactly the symptom.
- **Storing local-only state globally.** One component's input, in the store, re-rendering
  every consumer of the store on every keystroke. The rule's question 2 exists precisely
  to stop this.
- **Ignoring the "outside React" question.** A WebSocket or timer writing to a Context
  value needs the provider to re-render *everything*. The moment that appears, the value's
  class changed and its home must too.
- **Treating the rule as rigid.** The four classes are a decision aid, not a law. If a
  value straddles a boundary, name the straddle out loud — that reasoning is worth more in
  an interview than a clean-but-wrong assignment.

## 9. Best Practices

✅ Ask the four questions in order — server-owned, single-user, React-only, outside-React — every time

✅ Start local: only move a value up the ladder when a real consumer forces it

✅ Keep Context for genuinely shared, near-static UI state (theme, locale, feature flags)

✅ Use a store when anything outside React reads or writes the value

✅ Route every API read through TanStack Query — server state is its own class (Lesson 81)

✅ Name the straddle when a value sits between classes — the reasoning is the answer

❌ Don't answer architecture questions with a library name — answer with the rule, then the tool

❌ Don't put server data in a store, or a single input in a store, or high-frequency state in Context

## 10. Interview Questions

**Q1. Where do you put your state — Context, Redux, or Zustand?**

> I don't start from the library. I classify the value: does the server own it? Then it is
> server state and goes in TanStack Query. Does one component use it? Then it is local —
> `useState`. Do several components share it and nothing outside React touches it? Shared
> UI state — Context, fine for theme and locale. Is it shared *and* something outside
> React reads or writes it? Cross-cutting client state — a store, Zustand for most apps,
> Redux where the team wants stricter rules. The rule picks the tool; I don't pick the
> tool first.

**Q2. Why is server state different from client state?**

> Because of ownership. Client state is mine — I create it, update it, and I am the source
> of truth. Server state is the server's — the source of truth, the cache and the
> invalidation rules all live there, and my client only mirrors it. A mirror needs
> freshness, deduplication, retries and invalidation; a store provides none of those.
> That's why server data belongs in TanStack Query and client data in local state, Context
> or a store. (Lesson 81 is the full argument.)

**Q3. When would you choose Context over a store?**

> When the value is genuinely shared across the tree but changes rarely and nothing outside
> React touches it — theme, locale, a feature flag. Context's cost is that every consumer
> re-renders when the value changes (Lesson 77), so I keep it for near-static, read-mostly
> state. The moment the value changes often, or something outside React writes it, I move
> it to a store — the subscription model there only re-renders the components that
> selected that slice (Lesson 80).

**Q4. When would you choose Redux over Zustand?**

> The rule decides the class first; both are stores for cross-cutting client state. I'd
> choose Redux Toolkit when the team needs the structure — strict update discipline,
> serialisable state, action history, middleware for complex side effects (Lesson 78). I'd
> choose Zustand for the same class with less ceremony — direct actions, fewer concepts,
> faster to onboard (Lesson 80). The state class is identical; the trade-off is discipline
> versus simplicity.

**Q5. Walk me through where the state lives in an e-commerce app.**

> Line items and quantities — the cart is cross-cutting client state: written from product
> buttons all over the tree, read by the cart page and the checkout. Zustand, because it
> is shared and written from anywhere. The product catalogue, orders and stock are server
> state — TanStack Query, with the cart optimistically updating from the server's
> confirmation. The theme and locale are shared UI state — Context, near-static. And the
> expanded-accordion index on the product page is local — `useState`, it dies with the
> component. Four classes, four homes.

**Senior follow-up: The session token expires mid-use. Where does that state live, and
how do you react to it?**

> The session is cross-cutting client state — read everywhere, and written by code outside
> React (the token-refresh timer). So it lives in a store. The expiry detection is a
> server concern: the 401 comes from a query or a mutation, and the handler calls a
> `logout()` action on the session store plus an `invalidateQueries()` on everything
> behind auth. The store holds the *fact* of being logged in; TanStack Query holds the
> *data* that depends on it. That split — session in the store, responses in the cache —
> is the architecture, and the failure mode to avoid is caching the session token in a
> query and losing it the moment the cache clears.

## 11. Follow-up Questions

**What state should never leave the component?**

> Anything only that component uses, and anything that should vanish with it — form
> fields, hover state, a loaded-once flag, the open/closed state of a local accordion.
> Moving it up the ladder only re-renders more of the app for no reader. Lesson 55's
> lifting rule is the inverse: lift only when a real consumer appears.

**How do you decide between one global store and several?**

> By domain, not by "global". A session store, a cart store, a UI store — each holds one
> domain and keeps subscriptions narrow, so an update to the cart never wakes a consumer
> of the session (Lesson 80's selector model). A single mega-store is the same trap as
> Context's broadcast, just with more ceremony.

**Can local state become global without changing the value?**

> The value doesn't change class by moving — its *usage* does. When a second consumer
> appears, or something outside React starts writing it, the class changed and the home
> should follow. The interview-friendly way to say it: I start local and promote a value
> only when the consumers force it — never preemptively.

## 12. Comparison Table

| | Local (L50) | Context (L77) | Store (L80/L78) | TanStack Query (L81) |
|---|---|---|---|---|
| Owns the data | Component | App (via provider) | Client (app-wide) | Server (mirrored) |
| Re-render scope | The component | Every consumer | Selected subscribers | Query subscribers |
| Outside-React access | ❌ | ❌ | ✅ | ✅ |
| Caching / freshness | ❌ | ❌ | ❌ | ✅ |
| Best for | Form fields, ephemeral UI | Theme, locale, DI | Session, cart, toasts | Every API read/write |
| Lifespan | Until unmount | App lifetime | App lifetime | Cache lifetime |
| Setup | Built-in | Built-in | One `create` (L80) | QueryClient + provider |

## 13. Code Example

The rule applied to one feature — a notification bell — where all four classes appear:

```js
// Pure-JS model of Lesson 82: one feature, four classes, four homes.

// 1. LOCAL — the dropdown's open/closed flag. One component, dies with it.
function BellMenu() {
  let open = false;                    // useState in real React (L50)
  return { open, toggle: () => (open = !open) };
}

// 2. CONTEXT — the bell icon variant, shared + read-mostly (L77).
const themeContext = { value: 'light', consumers: ['BellIcon', 'Layout'] };

// 3. STORE — the unread count + markAllRead, written from outside React (L80).
function createStore(initial) {
  let state = initial;
  const listeners = new Set();
  return {
    get: () => state,
    set: (partial) => {
      state = { ...state, ...partial };
      listeners.forEach((l) => l());
    },
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
  };
}
const notifications = createStore({ unread: 3, markAllRead: () => notifications.set({ unread: 0 }) });

// 4. SERVER STATE — the notification list, owned by the API (L81).
const serverNotifications = [
  { id: 1, text: 'Mansha replied', read: false },
  { id: 2, text: 'PR approved', read: false },
];

function classify(value) {
  if (value.serverOwned) return 'server state → TanStack Query (L81)';
  if (value.uses === 'one-component') return 'local state → useState (L50)';
  if (value.reactOnly && value.writes === 'rare') return 'shared UI state → Context (L77)';
  if (value.outsideReact) return 'cross-cutting client state → Zustand (L80)';
  return 'shared client state → store or Context — name the straddle';
}

const cases = [
  { name: 'dropdown open', uses: 'one-component', outsideReact: false, serverOwned: false },
  { name: 'theme', uses: 'many', reactOnly: true, writes: 'rare', outsideReact: false, serverOwned: false },
  { name: 'unread count', uses: 'many', reactOnly: false, outsideReact: true, serverOwned: false },
  { name: 'notification list', serverOwned: true, uses: 'many', outsideReact: false },
];

console.log('server data is server data:', serverNotifications.length, 'items');
console.log('bell dropdown →', classify(cases[0]));
console.log('theme →', classify(cases[1]));
console.log('unread count →', classify(cases[2]));
console.log('notification list →', classify(cases[3]));

const unread = notifications.get().unread;
notifications.get().markAllRead();
console.log('unread:', unread, '→ after markAllRead:', notifications.get().unread);
```

```text
server data is server data: 2 items
bell dropdown → local state → useState (L50)
theme → shared UI state → Context (L77)
unread count → cross-cutting client state → Zustand (L80)
notification list → server state → TanStack Query (L81)
unread: 3 → after markAllRead: 0
```

One feature, four classes, and the `classify` function is a one-line version of the whole
lesson. Interviewers asking "where does state live?" are really asking you to reproduce
this table — for their feature, under pressure.

```narrate
15-17: the store's set/notify loop is Zustand's core, in miniature (Lesson 80)
22-29: classify() IS the decision rule — the four questions, as code
31-34: the same value tested against the rule four times
```

## 14. Performance Notes

- **Local state is the cheapest state that exists.** It renders one component and dies on
  unmount. The rule's default should be local — every promotion up the ladder adds
  re-render surface.
- **Context's cost scales with consumers.** One value change re-renders every consumer
  (Lesson 77). Fine for theme; a per-keystroke value in Context is a self-inflicted
  re-render storm.
- **Stores scale by selector.** Zustand/Redux re-render only the components whose selected
  slice changed (Lesson 80). That is the scaling story — not "global is bad", but "global
  with narrow subscriptions".
- **Server state performance is a cache story.** Deduplication (one fetch per key), stale
  hits served instantly, background refetch — Lesson 81's numbers are the performance
  argument for the class split.
- **The performance win is the split itself.** The common failure is one tool doing four
  jobs, which re-renders too much *and* refetches too much at once. Measure before
  micro-optimising (Lesson 71) — usually the class assignment is the bug, not the library.

## 15. Debugging Scenarios

**Scenario 1: "Every keystroke in the search box re-renders the whole dashboard."**

The input's value lives in a store or Context instead of local state. The value is
single-component — the rule sends it to `useState` (Lesson 50). Global placement made a
per-keystroke change broadcast to every subscriber.

**Scenario 2: "The list shows stale data after a save."**

The saved data is server state living in a store (or worse, a copied object). Nothing
invalidates it. Move the read to `useQuery`, the write to `useMutation`, and invalidate
the key on success (Lesson 81) — the cache refreshes itself.

**Scenario 3: "Two components on the same page disagree about the user."**

The session is in two places — a Context value on one screen and a store on another. The
rule says the session is cross-cutting (written by a token-refresh timer outside React),
so it has one home: the store. A single home makes "disagreement" impossible.

**Scenario 4: "Nothing re-renders when a WebSocket pushes an update."**

The value being pushed is server-owned, but it was `setState`-ed into local state by a
component that is not mounted where the update lands. Classify it as server state
(Lesson 81): subscribe the query to the WebSocket channel, and every component reading
that key updates automatically.

**Scenario 5: "We migrated to Zustand and the app got faster — except the theme."**

The theme was already fine in Context. The migration moved a near-static, read-only value
into the store, adding ceremony for zero gain. The rule says: leave shared read-mostly
values in Context, and the migration shrinks to just the state that actually needed to
move.

## 16. Quick Revision Notes

- Four classes: local, shared-UI (Context), cross-cutting client (store), server (query)
- Decision rule, in order: server-owned → one-component → React-only → outside-React
- Start local; promote only when consumers force it — never preemptively
- Context = sharing, not state management — near-static values only (L77)
- Store = shared AND written/read from outside React (L80/L78)
- Server state = the server's data, mirrored; cache + invalidate (L81)
- Answer with the rule first; the library name comes after
- Most real apps: lots of local, some Context, a few stores, every API read a query

## 17. Cheat Sheet

```text
DECISION RULE
  1. server owns it?            → TanStack Query   (L81)
  2. one component?             → useState         (L50)
  3. shared, React-only?        → Context          (L77)   (theme, locale)
  4. shared + outside React?    → store            (L80)   (Zustand) / (L78) (Redux)

CLASS          HOME        RE-RENDERS            BEST FOR
local          useState    the component         form fields, ephemeral UI
shared UI      Context     every consumer        theme, locale, feature flags
client state   store       selected subscribers  session, cart, toasts
server state   query       query subscribers     every API read/write

TRAPS
  server data in a store  →  stale, no retry, no invalidation   (L80→L81)
  high-frequency in Context  →  broadcast re-render storm        (L77)
  single input in a store →  keystrokes re-render the world      (L50)
```

## 18. Key Takeaways

> [!RECAP]
> - State architecture classifies the value first, then picks the tool — never the reverse
> - Four classes and four homes: local (`useState`), shared-UI (Context), cross-cutting
>   client (store), server (TanStack Query)
> - The rule: server-owned → query; one component → local; React-only shared → Context;
>   shared with outside-React access → store
> - Server state is a class of its own — the server owns the truth, the client mirrors it (Lesson 81)
> - Context is for sharing near-static UI state, not for being a budget global store (Lesson 77)
> - A store earns its place when something outside React reads or writes the value (Lessons 78, 80)
> - Start local, promote when consumers force it, and name the straddle when a value sits
>   between classes — that reasoning is the senior answer

## Check your understanding

Answer these without looking back.

1. Say the four-way decision rule in one sentence, in the right order.
2. Classify: a checkbox inside a table row. Then say why it must not live higher.
3. The theme lives in Context; the cart lives in a store. Which question separates them?
4. Why is server state a class of its own, and what does the store version lose?
5. A WebSocket starts pushing stock updates. Which class did that state just become, and what moves?
6. Walk one feature of your choice (search bar, auth flow, notifications) through all four questions.
7. Someone says "we use Redux" to the architecture question. What do you say instead?

## What's Next

**Lesson 83 — App Router & File Routing.** The state discussion is the last pure-React
architecture question — Next.js changes where the answer runs. Routing, layouts and the
server/client boundary are the baseline expectation for any modern Next.js role, and
Lesson 82's classes get a new home: some state now lives on the server for good.
