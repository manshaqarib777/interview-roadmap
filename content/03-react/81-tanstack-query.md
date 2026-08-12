# Lesson 81 — TanStack Query

**Interview importance:** ⭐⭐⭐⭐ — server state is not client state. Understanding that distinction is a senior marker.

When you say "server state", most candidates mentally file it under the same heading as
the cart and the theme. It is not. The server already owns the source of truth, the cache
and the invalidation rules — your client merely *mirrors* it. Caching that mirror by hand
in a store or an effect is how real apps end up with stale data, duplicate fetches and
invalidation logic that nobody trusts. This lesson is the case for treating server state
as its own class and letting TanStack Query own it.

The async mechanics come from Lesson 25 (`async/await`) and the re-render traps from
Lesson 77 (Context). You will use both: Query's cache lives in an external store, exactly
like Zustand's from Lesson 80 — but the data inside it is the server's, not yours.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain why server state must not live in a global store (Lesson 80's trap, stated properly)
- Use `useQuery` with a key and fetcher, and `useMutation` for writes
- Separate `staleTime` from `gcTime`, and state what each controls
- Name the three refetch strategies and when each fires
- Invalidate, and say why "refetch after mutation" is the correct default

## 1. What is TanStack Query?

**TanStack Query is a cache of server state for your client — it fetches, deduplicates, caches, retries and invalidates data you do not own.**

It is not a data-fetching library in the "wrapper around `fetch`" sense. Give it a key and
a function that returns a promise, and it manages the whole lifecycle: loading, error,
success, staleness, background refetch, retries, and keeping multiple components in sync
through one shared cache.

## 2. Mental Model

Think of it as the **browser's HTTP cache, but for application data and keyed by you**.

The browser caches a URL; Query caches a `queryKey`. The browser decides freshness from
headers; Query decides it from `staleTime`. The browser revalidates on navigation; Query
revalidates on mount, on window focus, on network reconnect — configurable per query.

The contrast that matters: a global store is a *whiteboard* (Lesson 80) — you write the
data and it stays until you overwrite it. TanStack Query is a *window into the server* —
the cache is a mirror that knows it is a mirror. It never asks "is this data correct?", it
asks "is this data still fresh?", because only the server knows the true answer.

## 3. Visual Flow

```text
  useQuery(['todos'], fetchTodos)
         │ key = cache identity, fetcher = how to get the data
         ▼
  ┌────────────────── CACHE ──────────────────┐
  │  ['todos'] → { data, status, updatedAt }  │
  └───────────────────────────────────────────┘
         │
  ┌──────┴───────────┬──────────────────┬───────────────────┐
  ▼                  ▼                  ▼                   ▼
 1st mount       2nd mount          data older       window focus /
  → fetch         → serve cache     than staleTime   network back
  → status:        → instant,       → background     → background refetch
    loading          no spinner       refetch
```

One fetch per key while anything is subscribed; the rest is cache hits with freshness
rules layered on top.

## 4. How It Works

Two hooks cover almost everything. `useQuery` reads; `useMutation` writes.

```jsx {4,12}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function TodoList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  const queryClient = useQueryClient();
  const addTodo = useMutation({
    mutationFn: createTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });

  if (isLoading) return <p>Loading…</p>;
  if (isError) return <p>Failed: {error.message}</p>;

  return (
    <ul>
      {data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
      <button onClick={() => addTodo.mutate({ title: 'buy milk' })}>Add</button>
    </ul>
  );
}
```

```text
mount           → status loading → fetch → status success, data rendered
mount again     → cache hit (staleTime window) → no fetch, instant render
addTodo.mutate  → POST runs → onSuccess → invalidate ['todos'] → refetch → list updates
```

```narrate
4: the queryKey is the cache address — same key, same cache entry
8-9: queryFn just returns a promise; the cache owns everything around it
12: onSuccess + invalidate is the whole server-state write pattern
```

### Cache keys

`queryKey` is an array. It is the cache address, compared structurally (deeply, like
`useShallow` from Lesson 80). Every query parameter that affects the result goes in the
key — the classic `['todos', { filter: 'done' }]`. Two queries with equal keys share one
cache entry; unequal keys are independent.

### staleTime vs gcTime

These are the two clocks, and mixing them up is a top-3 mistake.

| | `staleTime` | `gcTime` (formerly `cacheTime`) |
|---|---|---|
| What it controls | How long data is considered *fresh* | How long an unused cache entry *lives* |
| After it expires | Background refetch on next read | Entry is garbage-collected |
| Default | `0` (instantly stale) | 5 minutes |
| Mental model | The freshness window | The memory budget |

Data can be fresh but old — inside `staleTime`, served from cache without a refetch even
hours later. Data can be stale but still cached — past `staleTime`, you get the old value
instantly and a background refetch updates it. `gcTime` is only about what happens to an
entry *no component is subscribed to*.

## 5. Real Project Usage

```jsx
function ProfileCard({ userId }) {
  const { data: profile } = useQuery({
    queryKey: ['user', userId],            // cache address — parameterised
    queryFn: () => fetch(`/api/users/${userId}`).then((r) => r.json()),
    staleTime: 60_000,                     // 1 minute of freshness
  });

  const { data: todos } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/api/todos').then((r) => r.json()),
    refetchOnWindowFocus: false,           // keep default ON — but you may opt out
  });

  return (
    <aside>
      <h2>{profile?.name ?? '…'}</h2>
      <p>{todos?.length ?? 0} todos</p>
    </aside>
  );
}
```

```text
mount ['user', 42]  → fetch → cached; re-mounts within 60s → cache hit
mount ['todos']     → fetch → cached; tab-away and back → NO refetch (opted out)
```

Common real-app patterns:

| Pattern | Code | Why |
|---|---|---|
| List + detail sharing data | `['todos']` and `['todos', id]` | cache keys nest; detail can update the list's cached item |
| Search | `['users', { q }]` | the query string is part of the cache address |
| Refetch after a write | `invalidateQueries({ queryKey: ['todos'] })` | the default correct answer to "how do I refresh?" |
| Optimistic update | `onMutate` sets cached data, `onError` rolls it back | UI responds instantly; server confirms later |
| Disabling a query | `enabled: !!userId` | no fetch until the args exist |

`refetchOnWindowFocus` defaults to *on* because it is genuinely useful: you tab away, the
server's data changed, and the user comes back to a background refetch instead of a stale
page. It is a feature, not a bug — disable it per query only when the data truly never
changes.

## 6. Interview Explanation

> TanStack Query is a cache of server state, keyed by a `queryKey` and fed by a `queryFn`.
> `useQuery` deduplicates concurrent reads, caches the result, and applies freshness rules:
> inside `staleTime` data is served without a fetch, past it a background refetch runs on
> the next read, and `gcTime` governs how long an *unused* entry survives. Writes go
> through `useMutation`, and after a mutation you invalidate the affected keys so the cache
> refetches. Server state is not client state: the server owns the source of truth, so the
> client's job is mirroring it with the right freshness rules — not storing copies it must
> keep in sync by hand.

## 7. Senior-Level Insights

- **Start from the ownership claim.** "The server owns the truth; my client owns a mirror
  of it." Everything else — caching, staleness, invalidation — is a consequence. That is
  the sentence that separates this answer from a library demo.
- **Staleness is a feature, not a bug.** A cache that always fetches is not a cache. The
  whole point of `staleTime` is serving data you know might be out of date, because it is
  cheaper than fetching — and the UI still updates in the background.
- **Keys are the design surface.** A cache key that omits a parameter silently returns the
  wrong data. Designing keys to mirror the request (`['todos', { filter }]`) is the senior
  move; "just make it work" is how stale caches happen.
- **Invalidate is the write-to-read bridge.** The correct default after any mutation is
  `invalidateQueries` on the affected key. Optimistic updates are the optimisation on top,
  not a replacement — you still invalidate to let the server reconcile.
- **The cache is shared, so components coordinate for free.** Three components querying
  `['todos']` cause one fetch and stay in sync. That coordination is exactly what a global
  store made you hand-roll (Lesson 80).

## 8. Common Mistakes

- **Putting server data in a global store.** It duplicates data you do not own, and you
  inherit the job of keeping it fresh — retries, background refetch, deduplication. Zustand
  has none of that (Lesson 80). The data has a home already: the server.
- **Confusing `staleTime` with `gcTime`.** Setting `gcTime: 60_000` does not make data
  fresher; it makes the *unused cache entry* die in a minute. The two clocks are
  orthogonal. Mixing them up in an interview costs more than a senior answer should.
- **`queryKey` with `new Date()` or a random value.** A key that changes identity on every
  render is a cache miss every render — infinite refetching. Keys must be deterministic
  from the query's inputs.
- **Missing keys in the key.** `['todos']` for two different filters serves one filter's
  data to the other. Parameters that change the result belong in the key.
- **Awaiting the fetch in an effect and `setState`-ing the result.** That is hand-rolled
  server state: no dedup, no retry, no cache. The code written in Lesson 25's spirit, now
  unnecessary.
- **Refetching everything after every mutation.** Invalidate the affected key, not the
  whole cache — `invalidateQueries({ queryKey: ['todos'] })`, not `invalidateQueries()`.

## 9. Best Practices

✅ Model every read as `useQuery`, every write as `useMutation` — no exceptions

✅ Put every request parameter in the `queryKey` — the key is the cache address

✅ Give `staleTime` an honest value per query; default `0` is "always refetch"

✅ Invalidate the affected key after a mutation — that is the default write pattern

✅ Keep `refetchOnWindowFocus` on unless you have a reason not to

✅ Let `enabled` gate parameter-dependent queries instead of fetching with `undefined`

❌ Don't store server data in Zustand/Context — no cache, no retry, no invalidation (Lesson 80)

❌ Don't set `staleTime` huge as a lazy way to "avoid fetching" — that is how bugs go stale

## 10. Interview Questions

**Q1. Why shouldn't server state live in a global store?**

> Because the store treats the data as client-owned: whatever you write stays until you
> overwrite it, and freshness, retries, deduplication and invalidation are all on you. The
> server already owns that data, its cache and its rules — the client's job is to mirror
> it with the right freshness policy. TanStack Query is that mirror: a keyed cache that
> knows it is stale, refetches in the background, dedupes concurrent readers and
> invalidates on writes. Putting the mirror in Zustand re-implements all of that, worse.

**Q2. What is the difference between `staleTime` and `gcTime`?**

> `staleTime` is how long data is considered fresh — inside it, reads are served from the
> cache with no fetch; past it, the next read triggers a background refetch. `gcTime` is
> how long an *unused* cache entry survives before it is garbage-collected — it only
> matters once nothing is subscribed to that key. Freshness and memory are independent
> clocks: data can be fresh for an hour and garbage-collected in five minutes of disuse.

**Q3. When does TanStack Query refetch?**

> On a new subscriber when the data is stale (past `staleTime`), on window focus and on
> network reconnect by default, and after you invalidate or manually refetch. Inside
> `staleTime`, a new subscriber is a cache hit with no fetch. The refetch-on-stale-then-
> read policy is why the cache can serve instantly while still staying current.

**Q4. What is a `queryKey`, and how do you choose one?**

> The cache address, structurally compared. Queries with equal keys share one cache entry
> and one fetch. Every parameter that changes the result goes in the key — `['todos']` for
> the list, `['todos', id]` for one item, `['users', { q }]` for search. If the key omits a
> parameter the result depends on, the cache silently serves the wrong data.

**Q5. How do you update the cache after a mutation?**

> The default is invalidate-and-refetch: in the mutation's `onSuccess`, call
> `queryClient.invalidateQueries({ queryKey: ['todos'] })`, and Query refetches that key.
> For snappier UIs you add an optimistic update — write the expected result into the cache
> in `onMutate` and roll it back in `onError` — but you still invalidate afterwards so the
> server's actual response reconciles the cache.

**Senior follow-up: The user tabs away for ten minutes, comes back, and the list looks
stale. What actually happened?**

> Probably nothing wrong — that is the system working. The data went past `staleTime`, and
> on window focus Query fired a background refetch. The user saw the old list because the
> render served the cached value first (no spinner), and the fresh data replaced it
> moments later. If they never saw the update, the refetch failed and the cache kept the
> previous data with an error available to inspect — or `refetchOnWindowFocus` was disabled
> on that query. The right response is checking the query's state, not blaming the cache.

## 11. Follow-up Questions

**How does TanStack Query avoid duplicate fetches?**

> By key. Two components mounting with the same `queryKey` within the same window
> subscribe to the same cache entry, and the first fetch serves both — concurrent
> deduplication. A separate cache entry per subscriber is exactly the problem a global
> store inherits by hand.

**What is an optimistic update, and when would you skip it?**

> You write the expected result into the cache before the request resolves (`onMutate`),
> so the UI responds instantly, and roll it back on failure (`onError`). I skip it when the
> response shape is unpredictable or the write is rare and cheap — a spinner for 200ms is
> simpler than rollback code that can itself have bugs.

**How does this compare with Zustand (Lesson 80)?**

> They solve different problems. Zustand is a client-state store: the whiteboard you write
> and own. TanStack Query is a server-state cache: a mirror of data the server owns, with
> freshness rules. Putting server data in Zustand loses dedup, retries, background refetch
> and invalidation; putting ephemeral client state in Query abuses a cache as a store.
> Production apps run both — Zustand for the session and cart, Query for every endpoint.

## 12. Comparison Table

| | Zustand (L80) | TanStack Query | Hand-rolled (L25 + effect) |
|---|---|---|---|
| Owns the data | Client | Server (mirrored) | Server (mirrored, badly) |
| Cache | Manual | Automatic, keyed | None |
| Dedup concurrent reads | ❌ | ✅ | ❌ |
| Retries | ❌ | ✅ (default 3) | ❌ |
| Background refetch | ❌ | ✅ (focus / reconnect) | ❌ |
| Staleness model | None | `staleTime` / `gcTime` | None |
| Invalidation after write | Manual | `invalidateQueries` | Manual |
| Loading/error states | Manual | Built in | Manual |

## 13. Code Example

The invalidation loop, modelled without React — keys, a cache, and refetch-after-write:

```js
// A minimal TanStack-Query core: keyed cache + refetch-after-invalidate.
function createQueryCache() {
  const entries = new Map();           // key → { data, stale, updatedAt }

  return {
    get(key) { return entries.get(key); },
    set(key, entry) { entries.set(key, { ...entry, updatedAt: Date.now() }); },
    invalidate(key) {
      const entry = entries.get(key);
      if (entry) entry.stale = true;   // mark for refetch, keep the old data
    },
    has(key) { return entries.has(key); },
  };
}

const fetchTodos = () => Promise.resolve([{ id: 1, title: 'learn queries' }]);
const cache = createQueryCache();

async function readTodos() {
  const key = ['todos'];
  const cached = cache.get(key);

  if (cached && !cached.stale) {
    console.log('cache hit —', cached.data.map((t) => t.title).join(', '));
    return cached.data;
  }

  console.log('fetching…');
  const data = await fetchTodos();
  cache.set(key, { data, stale: false });
  return data;
}

async function addTodo(title) {
  await Promise.resolve();             // pretend POST succeeded
  cache.invalidate(['todos']);         // the mutation's onSuccess
  await readTodos();                   // next read refetches
}

await readTodos();                     // fetch → cache
await readTodos();                     // cache hit, still fresh
await addTodo('buy milk');
console.log('final:', cache.get(['todos']).data.map((t) => t.title).join(', '));
```

```text
fetching…
cache hit — learn queries
fetching…
final: learn queries
```

The second `fetching…` is invalidation doing its job: the old data was kept (so a UI could
render it instantly), then the next read replaced it. That is the `staleTime`/`invalidate`
loop, and it is the pattern the real library automates.

```narrate
18: a fresh entry is served without touching the network
24: invalidation marks stale — it does not delete or fetch
26-27: the next read sees "stale" and refetches
```

## 14. Performance Notes

- **One fetch per key per freshness window is the whole win.** N components reading
  `['todos']` cost one request, not N. Hand-rolled state costs N minus luck.
- **`staleTime` trades freshness for requests.** Raise it for data that rarely changes
  (user settings), keep it near zero for data that must be current (balances). The default
  of `0` is "always refetch", which is correct and also why people think the library
  "fetches too much" — they want `staleTime`, not `refetchOnWindowFocus: false`.
- **`gcTime` is a memory budget, not a freshness knob.** Long `gcTime` keeps entries
  around for instant revisit; the cost is memory per entry. Default 5 minutes is fine for
  most apps.
- **Big caches are fine — that is the cache's job.** The performance surface is the
  fetcher and the render work, not the cache lookup. Profile before "optimising" a cache
  that is doing its job (Lesson 71).

## 15. Debugging Scenarios

**Scenario 1: "My list shows yesterday's data and never refreshes."**

Almost always an over-eager `staleTime`, or `refetchOnWindowFocus: false` on a query that
should keep it. Check the query's state in the Query DevTools: if `isStale` is false, the
freshness window is the answer. The fix is lowering `staleTime` for that query, not
clearing the cache.

**Scenario 2: "Search results from the previous query flash in."**

The old query's cache entry was reused because the key ignored the search term. Fix the
key: `['users', { q }]` — a different term is a different cache entry, and the previous
one can even be `placeholderData` while the new fetch runs.

**Scenario 3: "Two screens show different data for the same list."**

Different cache keys — maybe one omits a filter parameter. Equal keys share an entry; if
the data differs, the keys differ. Compare the actual key arrays in DevTools.

**Scenario 4: "After a save, the UI still shows the old value."**

The mutation's `onSuccess` does not invalidate the read key. Add
`invalidateQueries({ queryKey: ['todos'] })` — or, if the mutation returns the new entity,
`setQueryData` to update the cached item directly. Both are the write-to-read bridge; the
first is the default.

## 16. Quick Revision Notes

- Server state = the server's data, mirrored in the client — not yours to store (L80 trap)
- `useQuery({ queryKey, queryFn })` — key is the cache address, fetcher is the promise
- `useMutation({ mutationFn, onSuccess })` — writes; `invalidateQueries` on the affected key
- `staleTime` = freshness window; `gcTime` = how long an unused entry lives — two clocks
- Refetch triggers: stale read, window focus, network reconnect, invalidation, manual
- Concurrent reads with the same key share one fetch — deduplication by key
- Hand-rolling this in an effect + store loses dedup, retries, focus refetch (L25, L80)
- Query DevTools: `isStale`, `isFetching`, the key — read them before debugging blind

## 17. Cheat Sheet

```text
useQuery({ queryKey: ['todos', { filter }], queryFn, staleTime, enabled })
useMutation({ mutationFn: postTodo, onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }) })

queryKey   → cache address, structural equality, all params inside
staleTime  → fresh window; past it, reads trigger background refetch   (default 0)
gcTime     → lifetime of an UNUSED entry before GC                     (default 5min)
refetchOnWindowFocus / refetchOnReconnect → default ON
invalidateQueries({ queryKey })  → mark stale, refetch on next read
setQueryData(key, updater)       → write into the cache directly (optimistic)
```

## 18. Key Takeaways

> [!RECAP]
> - Server state is the server's data; the client owns a mirror, not a copy (Lesson 80's trap)
> - `useQuery` reads through a keyed cache; `useMutation` writes; invalidate the affected key
> - `staleTime` = freshness window, `gcTime` = unused-entry lifetime — never swap them
> - Refetch on stale read, focus and reconnect — by default, and usually correct
> - The key is the design surface: parameters that change the result belong inside it
> - Concurrent readers with the same key share one fetch — deduplication for free
> - Don't hand-roll this in effects and stores (Lessons 25, 77, 80) — the cache is the point

## Check your understanding

Answer these without looking back.

1. Say in one sentence why server state does not belong in a Zustand store.
2. Write a `useQuery` for `['user', userId]` with a one-minute `staleTime`.
3. A mutation just saved a todo. What does its `onSuccess` need to do, and why?
4. `staleTime` vs `gcTime`: give a scenario where data is fresh but the entry is gone.
5. Name all four refetch triggers and which one fires when you return to a background tab.
6. What happens if two components query `['todos']` at the same time — how many fetches?
7. A search result flashes stale data for the previous term. What is the key bug?

## What's Next

**Lesson 82 — Local vs Global vs Server State.** You now hold three tools with distinct
jobs: React's local state, Context, a store, and a server-state cache. The architecture
question is which one a *feature* gets — and the answer is a decision rule, not a library
preference.
