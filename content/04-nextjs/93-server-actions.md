# Lesson 93 — Server Actions

**Interview importance:** ⭐⭐⭐⭐ — mutations without an API route. New enough that a solid answer stands out.

Server Actions are how Next.js lets a Server Component hand a mutation to the client as an
RPC call — no API route, no `fetch`, just a function reference in a form. The stack is still
young, so most candidates can't explain them. This is your chance to be the exception.

This lesson builds directly on Lesson 92: once you know route handlers, Server Actions are
best understood as their mirror image — same server-side work, different caller. You'll also
need the Server/Client boundary from Lesson 88, because `'use server'` only makes sense in
that context.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what `'use server'` does and where it is and isn't allowed
- Wire a form to an action with `action={fn}` and read its data
- Explain progressive enhancement and why it makes Server Actions compelling
- Use `revalidatePath` and `revalidateTag` to refresh cached UI after a mutation
- Say when a Server Action is the right tool — and when a route handler still wins

## 1. One-line definition

**A Server Action is an async function marked with `'use server'` that runs on the server but can be invoked directly from a client component or form — with no API route and no `fetch`.**

## 2. Mental model

Think of a Server Action as a **function call that jumps the network**.

Normal frontend work: the client `fetch`es an endpoint, sends JSON, gets JSON back, handles
loading and errors by hand. A Server Action collapses that into one arrow: your form
references a function, Next.js turns it into a hidden POST, and it executes on the server.
What used to be *"build an API, then a client"* becomes *"just call a function"*.

## 3. Visual flow

```text
        <form action={createPost}>
              │
              ▼  (no client JS needed)
   browser POSTs the form → Next.js serialises the call
              │
              ▼
   'use server' action runs on the server
      read formData / validate / write to DB
              │
              ▼
   revalidatePath('/posts')   ← refresh cached UI
              │
              ▼
   fresh page, next render serves the new data
```

## 4. How it works

You mark a module (or a single function) as server-only. Next.js compiles that export into a
POSTable reference the client can call — without the function body ever reaching the client.

```ts
// app/actions.ts
'use server';

export async function createPost(formData: FormData) {
  const title = String(formData.get('title'));
  await db.post.create({ data: { title } });   // server-only: DB access is fine here
}
```

A Client Component imports and calls it like a normal function:

```tsx
// app/page.tsx (client)
'use client';
import { useActionState } from 'react';
import { createPost } from './actions';

export function NewPostForm() {
  const [state, action, pending] = useActionState(createPost, { ok: false });

  return (
    <form action={action}>
      <input name="title" required />
      <button disabled={pending}>{pending ? 'Saving…' : 'Create'}</button>
    </form>
  );
}
```

```text
submit → POST /…/createPost → action runs server-side → revalidate → new UI
```

The client never sees `createPost`'s body — just a secure reference the server understands.
Serialisation handles the arguments (form data, serialisable JSON), the return value comes
back the same way, and `pending` tracks the round trip.

```narrate
line 1-2: 'use server' at the top of the file marks every export as a server action.
line 3: the action takes FormData by default; reading it server-side keeps parsing where it belongs.
line 6-7: 'use client' flips the form component to the client so it can call the action.
line 12: the action reference itself can be passed as the form's action — that's the whole trick.
```

## 5. Real project usage

| Pattern | Code |
|---|---|
| Form submit (title, comment, cart) | `<form action={createPost}>` |
| Any event handler (button, on-demand invalidation) | `startTransition(() => updatePrefs(formData))` |
| Revalidate after a mutation | `revalidatePath('/posts')` or `revalidateTag('posts')` |
| Call an action from another action | `await createPost(data)` inside `'use server'` code |

### Revalidating after a mutation

Without revalidation, the client refetches nothing — the cached page stays stale. `revalidatePath`
and `revalidateTag` tell Next.js the data changed:

```ts
// app/actions.ts
'use server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { db } from '@/lib/db';

export async function updateProfile(formData: FormData) {
  const name = String(formData.get('name'));
  await db.user.update({ data: { name } });

  revalidatePath('/settings');        // refresh this path
  revalidateTag('user:' + currentUser.id); // refresh everything tagged
}
```

```text
revalidatePath('/settings')  →  the settings page refetches on next render
revalidateTag('user:42')     →  every fetch tagged 'user:42' refetches (Lesson 91)
```

> [!TIP]
> Lesson 91 covers the two caching layers — full route cache and the data cache. That's the
> same `revalidatePath`/`revalidateTag` pairing this lesson needs. If the action's mutation
> doesn't appear, your mental model of those layers is wrong, not the code.

## 6. Interview explanation

> A Server Action is an async function marked with `'use server'`. Next.js turns it into an
> RPC-style POST I can call directly from a form or a client event handler — no API route,
> no manual `fetch`. The function runs server-side, so DB calls and secrets stay on the
> server. Because the call is a plain form POST, it works even before JavaScript loads —
> that's progressive enhancement. After a mutation I call `revalidatePath` or `revalidateTag`
> so the cached UI refreshes. I'd use it for my own app's mutations, and reach for a route
> handler when an external machine needs to call me (Lesson 92).

## 7. Senior-level insights

- **They're the modern default for your own mutations.** Next.js 14+ points new work at
  Server Actions, not API routes. The senior take is *understanding the boundary from
  Lesson 92*: route handlers are a public contract for any HTTP client; Server Actions are
  an internal call convention for your own forms and components. Both run server-side; the
  caller decides.
- **Progressive enhancement is the killer feature.** `action={fn}` is a plain form action
  first, enhanced by React second. It works without JavaScript, then upgrades to optimistic
  updates and `useActionState` when JS loads. Very few candidates can say that sentence.
- **You can't call a Server Action like a client function by accident.** The boundary rules
  from Lesson 88 still apply: a `'use client'` component can *invoke* an action, but the
  action's code never ships to the client — the bundle contains only a reference and a
  POST. That asymmetry is the whole security story.
- **Invalidation is part of the mutation.** A senior answer ties the action to cache
  invalidation: mutate, then `revalidatePath`/`revalidateTag` or return a `revalidate` value
  from `'use cache'` (Next 15.2+). A mutation that leaves the cache stale is a bug, not a
  missing feature.

## 8. Common mistakes

```ts
// ❌ 'use server' inside a client component file
'use client';
'use server';      // error: you can't stack the directives
```

The **module-level** form goes in its own file; the **inline** form is one `async` function
marked at the top of its body, defined in a Server Component:

```tsx
// app/page.tsx (server component)
export default function Page() {
  async function create(data: FormData) {   // inline server action
    'use server';
    await createThing(data);
  }
  return <form action={create}>…</form>;
}
```

```text
inline form:   async function name(params) { 'use server'; … }
module form:   'use server';  at the top of its own file
```

Other classic slips:

- **Serialising unsupported values.** Server Actions accept serialisable arguments. A `Date`
  needs `toString()`/ISO, a class instance needs plain data — non-serialisable input breaks
  the RPC.
- **Calling an action in a render path.** Actions are for events and transitions, not for
  `useEffect` calls or render-time side effects — those belong in `fetch` or a route
  handler.
- **Forgetting `await`.** Actions are async; `await` them everywhere, including inside
  transitions.
- **Mistaking `action={fn}` for `action={() => fn()}`.** The arrow form runs in the
  browser (client-side event handling) and skips the progressive-enhancement path — the
  function reference form is the server action.

## 9. Best practices

✅ Pass `action={fn}` — the reference, not a wrapper — so enhancement works before JS loads

✅ Keep `'use server'` files small and focused; each export is a POSTable surface

✅ Validate `formData` server-side with a schema (zod) before writing to the DB

✅ End a mutation with `revalidatePath` or `revalidateTag` — stale cache is a bug

✅ Prefer `useActionState` + `useTransition` over a manual `fetch` for your own forms

❌ Don't run secret logic in a Client Component — put it in the action, never the bundle

❌ Don't pass non-serialisable values (Date instances, class instances) into an action

❌ Don't call actions from render or `useEffect` — events and transitions only

❌ Don't use a Server Action where an external machine calls you — that's a route handler (Lesson 92)

## 10. Interview questions

**Q1. What are Server Actions?**

> Async functions marked with `'use server'`. Next.js turns them into server-side calls I
> can invoke from a form or a client event handler — no API route, no `fetch`. The function
> runs on the server, so secrets and DB access stay there, and the client only gets a secure
> reference plus a POST.

**Q2. How do you use them with forms?**

> `<form action={createPost}>` — the action reference *is* the handler. The action receives
> a `FormData` object, which I read and validate server-side. `useActionState` from React 19
> gives me the returned state and a `pending` flag for the button. If JavaScript isn't
> loaded, the form still posts and the action still runs — progressive enhancement.

**Q3. How do Server Actions compare to Route Handlers?**

> A route handler (Lesson 92) is a public HTTP endpoint — any client can call it, so it's
> right for webhooks, OAuth callbacks and mobile apps. A Server Action is an internal
> calling convention for my own components and forms: no URL, no fetch, and enhanced
> progressively. Same server-side work; the caller decides which one I reach for.

**Q4. How do you keep the UI fresh after a Server Action mutates data?**

> `revalidatePath('/posts')` tells Next.js to refetch that route on the next render, and
> `revalidateTag('posts')` refreshes every fetch carrying that tag (Lesson 91). I end each
> mutation with one or the other — otherwise the cached page keeps serving the old data.

**Q5. Can a Server Action be called from a Client Component?**

> Yes — that's the point. A client component can invoke a server action in an event handler
> or transition, and the action runs server-side. What never happens is the action's body
> shipping to the client: only a serialisable reference and a POST are in the bundle. The
> Server/Client boundary (Lesson 88) is what makes this safe.

**Senior follow-up: When would you refuse to use a Server Action?**

> If the endpoint must be callable by something other than my own UI — a webhook like
> Stripe, a third-party OAuth callback, or a native app — I'd use a route handler instead,
> because those callers aren't React components and can't reference an action. I'd also
> avoid actions for long-running or streaming work that a route handler and a worker queue
> handle better. For my own forms and buttons, Server Actions are the default.

## 11. Follow-up questions

**What does `'use server'` actually do at build time?**

> It marks the module's exports as server-only functions. Next.js compiles each one into a
> POSTable endpoint with a generated reference — the client bundle gets the reference, not
> the code. At runtime, calling the reference is an RPC over POST.

**What is the inline form of a Server Action, and when would you use it?**

> An `async function` in a Server Component whose body starts with `'use server'`. Use it
> for one-off mutations that don't need to be reused across files — it keeps the action next
> to the form that uses it. The module-level form is for actions you import from multiple
> places.

**How do optimistic updates work with Server Actions?**

> `useTransition` lets you update the UI optimistically while the action runs; `useOptimistic`
> holds the pending value and reconciles it against the server's response. Both are part of
> the progressive-enhancement story — the form works first, gets fast second.

## 12. Comparison table

| | Server Action | Route Handler |
|---|---|---|
| Caller | Your forms / components | Any HTTP client |
| Syntax | `action={fn}` or `startTransition` | `export async function POST(req)` |
| Network hop | None visible — RPC-style POST | Explicit `fetch` |
| Progressive enhancement | ✅ (plain form first) | ❌ (needs JS) |
| Where secrets live | Server, always | Server, always |
| Revalidation built in | ✅ `revalidatePath`/`revalidateTag` | Manual (`router.refresh()`) |
| Best for | In-app mutations | Webhooks, callbacks, third-party clients |

## 13. Code example

```tsx
// app/actions.ts
'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({ title: z.string().min(1).max(80) });

export async function addTodo(formData: FormData) {
  const parsed = schema.safeParse({ title: formData.get('title') });
  if (!parsed.success) return { error: 'Invalid title' };

  await db.todo.create({ data: { title: parsed.data.title, done: false } });
  revalidatePath('/todos');
  return { ok: true };
}
```

```tsx
// app/todos/page.tsx (client)
'use client';
import { useActionState } from 'react';
import { addTodo } from './actions';

export function TodoForm() {
  const [state, action, pending] = useActionState(addTodo, null);

  return (
    <form action={action}>
      <input name="title" />
      <button disabled={pending}>{pending ? 'Adding…' : 'Add'}</button>
      {state?.error && <p style={{ color: 'red' }}>{state.error}</p>}
    </form>
  );
}
```

```text
submit "Buy milk"  →  action validates → DB insert → revalidatePath('/todos')
  → server returns { ok: true }  →  form resets, todo list refetches on next render
```

Validation happens *twice* on purpose: zod on the client is for UX, zod on the server is
for truth. `revalidatePath` at the end is what makes the new todo actually appear.

## 14. Performance notes

- **One round trip, not two.** A server action replaces `fetch` + loading state + error
  handling in one call — less client code, fewer network hops. The form's first paint is
  still the static HTML; the action call is a single POST.
- **Serialisation is the hidden cost.** Every argument and return value crosses the wire as
  JSON. Keep payloads small — pass ids, not whole objects, and return minimal state.
- **`revalidatePath`/`revalidateTag` are cheap cache-busting, not refetches.** They mark the
  cache stale; the next render does the work. Don't fear calling them on every action.
- **Streaming and long tasks stay in route handlers.** Actions have a 1 MB body limit and
  aren't built for backpressure-heavy streaming — a route handler with a worker queue is the
  right shape for those (Lesson 92).

## 15. Debugging scenarios

**Scenario 1: "My action runs but the UI never updates."**

You mutated without revalidating. Add `revalidatePath` (or `revalidateTag`) at the end of
the action. Check which layer is stale: route cache needs `revalidatePath`, data cache needs
`revalidateTag` (Lesson 91).

**Scenario 2: "Serialisation error on submit."**

You passed a non-serialisable value — a `Date` instance, a class instance, a `Map` with
non-string keys. Convert to plain JSON before the action, or read it from `formData`
server-side instead of passing it in.

**Scenario 3: "The form submits, but nothing happens without JavaScript."**

You wrote `action={() => createPost(formData)}` — an arrow, so the enhancement path is gone
and the action needs React's JS. Use `action={createPost}` directly to keep the plain-HTML
fallback.

**Scenario 4: "'use server' in a client component is an error."**

Directives can't stack. Either move the action to its own `'use server'` file and import it,
or use the inline form inside a Server Component. The compiler's error message points at
the exact file.

## 16. Quick revision notes

- `'use server'` (module) or `async function f() { 'use server'; … }` (inline) = server action
- The client gets a reference + POST; the body never ships to the browser
- Forms: `<form action={fn}>`; events: `startTransition(() => fn())`
- Plain form first, enhancement after — that's progressive enhancement
- `useActionState` gives state + `pending`; `useOptimistic` gives optimistic UI
- Mutate → `revalidatePath`/`revalidateTag` → the cached page refreshes on next render
- Arguments and returns must be serialisable
- Route handlers (Lesson 92) win when an external machine is the caller

## 17. Cheat sheet

```text
module form   →  'use server' at top of file, every export is an action
inline form   →  async function f(p) { 'use server'; … }   (in a Server Component)

form  →  <form action={fn}>   (reference, not arrow)
event →  startTransition(() => fn(data))
state →  const [s, action, pending] = useActionState(fn, initial)

after mutate:
  revalidatePath('/path')      route cache (Lesson 91)
  revalidateTag('tag')         data cache (Lesson 91)

serialisable only: primitives, plain objects/arrays, FormData — no Date/Map/class instances
```

## 18. Key takeaways

> [!RECAP]
> - A Server Action is an async function marked `'use server'` that runs server-side but is callable from your own components — no API route, no `fetch`
> - The client receives only a serialisable reference; the function body never ships (Lesson 88's boundary, applied)
> - `<form action={fn}>` gives progressive enhancement: a plain form POST that upgrades to optimistic updates
> - `useActionState` provides the returned state and a `pending` flag; `useTransition`/`useOptimistic` handle the rest
> - Mutations are incomplete without cache invalidation: `revalidatePath`/`revalidateTag` from `next/cache`
> - Arguments and return values must be serialisable — pass ids, not objects
> - Reach for route handlers (Lesson 92) when the caller is a webhook, callback or external client

## Check your understanding

Answer these without looking back.

1. What is the difference between the module-level and the inline form of `'use server'`?
2. Why is `<form action={fn}>` different from `<form action={() => fn()}>`?
3. What does progressive enhancement mean for a Server Action form?
4. You call an action, the DB updates, but the page shows old data. What's missing, and which two functions fix it?
5. Why can't a Client Component see a server action's body?
6. Give three cases where a route handler (Lesson 92) beats a Server Action.

## What's Next

**Lesson 94 — Middleware.** Auth gating, redirects and A/B tests: how Next.js runs code at
the edge before a request ever reaches a route. Expect "give me three use cases" in the
interview — this lesson has them ready.
