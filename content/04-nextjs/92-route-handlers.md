# Lesson 92 — Route Handlers

**Interview importance:** ⭐⭐ — the fundamentals; foundational, and later lessons build directly on it.

Route Handlers are the Next.js way to expose custom HTTP endpoints — and, from the very
next lesson, the thing Server Actions are compared against. You don't need this every day
(when you do, it matters a lot), but the basics should be second nature: `route.ts`,
`GET`/`POST`/`PUT`/`DELETE`, and the `NextRequest`/`NextResponse` types.

## Learning Objectives

By the end of this lesson you should be able to:

- Write a `route.ts` handler for each of the four main HTTP verbs
- Read request data (`params`, `searchParams`, body, cookies) and write a `NextResponse`
- Explain how a dynamic route handler compares with a Server Component's `fetch`
- List the cases where a route handler beats a Server Action, and vice versa
- Say why `request.url` works and `searchParams` on a plain object doesn't

## 1. One-line definition

**A Route Handler is a file named `route.ts` that exports functions for HTTP verbs — one export per method — and Next.js turns each export into an endpoint.**

## 2. Mental model

Think of `route.ts` as the "plain old Node" corner of your Next.js app.

Everything else — Server Components, Server Actions — runs in Next.js's render pipeline with
its own conventions. A route handler is the closest thing to writing `app.get('/api/x', …)`
in Express: you get a raw `Request`, you return a `Response`, and you control the status and
headers yourself. Same request/response objects, same HTTP, no renderer in between.

## 3. Visual flow

```text
  client / webhook / curl / any HTTP client
                     │
                     ▼
              app/api/checkout/route.ts
   ┌──────────────────────────────────────────┐
   │  export async function POST(req) { … }   │
   │                                          │
   │  1. read body / params / cookies         │
   │  2. do the work (DB, Stripe, auth)       │
   │  3. return NextResponse.json(…, {status})│
   └──────────────────────────────────────────┘
                     │
                     ▼
        JSON/redirect/stream back to caller
```

## 4. How it works

Any `route.ts` under the `app/` folder becomes an endpoint at that path. You can place it
alongside a page (collision is an error), and route segments give you dynamic pieces. The
handler is *server-only* — by default it runs in the Node runtime, where your API keys live.

```ts
// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ ok: true, at: request.url });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sku, qty } = body as { sku: string; qty: number };
  return NextResponse.json({ id: 'ord_' + Math.random().toString(36).slice(2) }, { status: 201 });
}
```

```text
GET  /api/checkout  →  200 { ok: true, at: "http://localhost:3000/api/checkout" }
POST /api/checkout  →  201 { id: "ord_0n4k2m9x" }
```

All HTTP methods are supported (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`).
A handler runs when the method matches; if none matches, Next.js returns `405 Method Not
Allowed`.

```narrate
line 4-7: a GET export = the endpoint's GET behaviour. The function can be async because it may await a database.
line 9-13: body arrives as JSON by default. Typing it back in is on you — fetch handlers don't validate.
line 10: NextResponse.json() wraps JSON.stringify plus the Content-Type header for you.
```

### The dynamic piece — `params`

```ts
// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;             // in Next 15+, params is a Promise
  return NextResponse.json({ user: id });
}
```

```text
GET /api/users/42  →  200 { "user": "42" }
```

Before Next 15, `params` was a plain object: `ctx.params.id`. Today it's a `Promise`, so you
`await` it. TypeScript won't let you guess wrong — the type guard is the answer.

> [!PITFALL]
> With `GET`, the handler receives the request object **without** a second `context`
> argument — so in a static `route.ts`, `params` is never available in `GET`. Either make
> the route dynamic (`cookies()`, `headers()`, searchParams) or read `params` in the
> second argument of a non-GET handler like `POST`.

## 5. Real project usage

| Need | Route Handler? | Server Action? |
|---|---|---|
| Webhook (Stripe sends events to you) | ✅ | ❌ |
| Third-party callback / OAuth redirect target | ✅ | ❌ |
| Native mobile app or CLI calling your API | ✅ | ❌ |
| Form submit with progressive enhancement | ❌ | ✅ |
| Revalidating after a mutation | ❌ | ✅ (with `revalidatePath`) |

The pattern to remember: **route handlers are for *other machines* calling you; server
actions are for *your own* components mutating data.** Lesson 93 sets out the boundary in
full.

## 6. Interview explanation

> A Route Handler is a `route.ts` file that exports HTTP-method functions. Each export maps
> to that verb at that path, so `app/api/checkout/route.ts` with a `POST` export gives you
> `POST /api/checkout`. The handler receives `NextRequest`, returns `NextResponse`, and can
> read params, the body, cookies and headers. It's server-side, so secrets stay in the
> process. I'd use it when something outside my own UI — a webhook, a third-party callback,
> a mobile client — needs to talk to my backend.

## 7. Senior-level insights

- **Why route handlers exist:** sometimes you need a real HTTP endpoint. The App Router
  merged the old API routes and the page router into one file, so instead of a `pages/api`
  folder you get an endpoint for free wherever a `route.ts` sits. Saying that — *"the same
  route-segment system as pages, but HTTP verbs instead of JSX"* — shows you know the
  architecture, not just the syntax.
- **When they beat Server Actions (Lesson 93):** the split is by *caller*. A route handler
  is a public contract — any HTTP client can hit it, with arbitrary headers and bodies, so
  webhooks, callbacks and non-React clients need it. Server Actions assume a form or a
  component made the call. "Who's calling?" is the deciding question.
- **Static by default:** a `GET` route handler with no dynamic API usage is cached as a
  static response at build time. Use `request.url` or `NextResponse` streaming and it
  becomes dynamic. The real senior tell is *knowing whether your handler is static or
  dynamic* — because that's what decides whether a webhook payload ever arrives.

## 8. Common mistakes

```ts
// ❌ reading searchParams from the plain request
export async function GET(request: Request) {
  request.searchParams;            // undefined — plain Request has no such property
}
```

`searchParams` lives on `NextRequest`:

```ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { page } = Object.fromEntries(request.nextUrl.searchParams);
  return Response.json({ page });
}
```

Other classic slips:

- **Awaiting the body twice.** `await request.json()` consumes the stream — the second call
  returns nothing. Read it once and keep the value.
- **Returning a 200 when the client sent a bad request.** Webhook callers retry on
  non-2xx; an unconditional `200` makes failures invisible. Return `400`/`500` deliberately.
- **Typing `params` as a plain object** in Next 15+ — it's a `Promise`, and the `GET`
  handler has no second argument to read it from anyway.
- **Forgetting the `405`.** A route with only a `POST` export answers `GET` with
  `405 Method Not Allowed` by default — that's correct, not a bug.

## 9. Best practices

✅ Export one function per verb — the naming *is* the routing

✅ Read the body once, validate the shape, then use the data

✅ Use `NextResponse.json()` for JSON and pass an explicit `{ status }`

✅ Let webhook client libraries do the signature verification — don't hand-roll HMAC

✅ Return meaningful status codes so clients and webhooks can react correctly

❌ Don't mutate the request body stream or read it twice

❌ Don't put secrets in a Client Component and send them — route handlers keep them server-side

❌ Don't use a route handler for a form your own React components submit — Lesson 93's
Server Actions are the modern default for that

## 10. Interview questions

**Q1. What is a Route Handler in Next.js?**

> A `route.ts` file under the `app/` folder that exports HTTP-method functions. Each export
> becomes that verb on that path, so a `POST` export in `app/api/checkout/route.ts` gives
> `POST /api/checkout`. Handlers receive a `NextRequest` and return a `NextResponse`, run
> server-side, and replace the old API routes.

**Q2. How do you read dynamic data in a route handler?**

> `params` come from the route segment — in Next 15+ they're a `Promise`, so I await them
> (`ctx.params`). `searchParams` and the pathname come from `request.nextUrl`. The body
> comes from `await request.json()`. Cookies are `request.cookies` or `cookies()` from
> `next/headers`.

**Q3. When does a Route Handler beat a Server Action?**

> When the caller isn't one of my own React components. A route handler is a plain HTTP
> endpoint, so webhooks (Stripe sends events), third-party OAuth callbacks and non-browser
> clients like mobile apps or CLIs all need it. Server Actions are the choice for mutations
> triggered by my own forms and components.

**Q4. How do you make a route handler dynamic?**

> Route handlers are static by default. Using `request.url`, `cookies()` or `headers()` at
> the top level, or opting into streaming with `ReadableStream` and
> `TextEncoder`-based responses, makes the handler dynamic. A static `GET` with `params`
> is actually impossible — the route becomes dynamic the moment you use a runtime API.

**Senior follow-up: Your team's checkout form should call a route handler — when would you push back?**

> If the form is submitted by one of our own React components, I'd argue for a Server
> Action instead — it gives us progressive enhancement for free (Lesson 93), keeps the
> request flowing through our framework, and skips a manual fetch layer. I'd keep the
> route handler only if the same endpoint must also serve third-party clients or
> webhooks. The right shape is usually *one* contract, chosen by who calls it.

## 11. Follow-up questions

**What's the difference between an API route and a Route Handler?**

> API routes were the Pages Router's mechanism — a `pages/api/` folder, and one file per
> endpoint. Route Handlers are the App Router's version: `route.ts` anywhere under
> `app/`, sharing the route-segment system with pages. Same idea, one unified system.

**Why can't I use a Route Handler inside a Server Component?**

> Route handlers respond to HTTP requests — they're server-side *endpoints*. Server
> Components run during rendering. If you need data at render time you `fetch` it (Lesson
> 89); you don't call an endpoint. Server Actions fill the mutation side, which is Lesson
> 93.

**What is the `405` you mentioned, and when does it happen?**

> `405 Method Not Allowed`. If a route defines a `POST` but no `GET`, an incoming `GET`
> gets `405` with an `Allow` header. It's automatic — a signal that the endpoint exists but
> doesn't support that verb.

## 12. Comparison table

| | Route Handler | Server Action |
|---|---|---|
| Where it lives | `route.ts` under `app/` | `'use server'` module or inline action |
| Who can call it | Any HTTP client | Your forms / components (or `startTransition` wrappers) |
| Progressive enhancement | ❌ | ✅ (Lesson 93) |
| Best for | Webhooks, callbacks, mobile/CLI clients | Form submits and in-app mutations |
| Caching | Static by default (GET) | Rerun per call; revalidate explicitly |
| Client-side story | Needs `fetch` + loading state | `useActionState`, `useTransition` built in |

## 13. Code example

```ts
// app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const event = JSON.parse(payload) as { type: string };

  switch (event.type) {
    case 'checkout.session.completed':
      console.log('session completed → fulfil the order');
      break;
    default:
      console.log('unhandled event:', event.type);
  }

  return NextResponse.json({ received: true });
}
```

```text
POST /api/stripe/webhook   →  200 { "received": true }
```

Stripe sends a raw body, so `request.text()` beats `request.json()`. Next.js's own docs
suggest using the Stripe SDK's `constructEvent` for signature verification — the point of
this snippet is the shape: read the event, switch on its type, acknowledge it.

## 14. Performance notes

- **Static GET handlers are served from the edge of your cache** — zero server work per
  request, which is why "default static" matters. Don't add dynamic APIs to a handler that
  could stay static (Lesson 90 covers the caching trade-offs).
- **Node runtime vs Edge runtime:** route handlers default to Node.js, which can run Prisma,
  the Stripe SDK, anything. The Edge runtime has a smaller surface — no Node APIs — but
  boots faster and runs closer to users. Choose Node for heavy handlers, Edge for
  lightweight ones.
- **Don't serialise what you don't need.** The response body is part of the cache key and
  the network cost. Return the smallest useful JSON.
- **Body size limits apply** (1 MB for Server Actions, ~4 MB for route handlers in App
  Router) — file uploads need streaming, not a big JSON payload.

## 15. Debugging scenarios

**Scenario 1: "My route handler returns 404 for a path that exists."**

Check for a collision — a `page.tsx` and a `route.ts` in the same segment are an error, and
the build fails with a clear message. If the file is there and the path is right, restart
the dev server: adding a new route sometimes needs a reload.

**Scenario 2: "The webhook never fires / always fails."**

Two suspects. First, tunnels: `localhost` isn't reachable from Stripe, so use a tool like
`ngrok` for local webhook testing. Second, signature verification: the `stripe-signature`
header is missing or stale. Verify with the SDK, and log the headers on failure.

**Scenario 3: "I get a 405 from my own endpoint."**

You defined the verb the client isn't using. Check the client's method — a form POSTing to
a route that only exports `GET` gets exactly this. Also check the handler's export name for
a typo (`Post` instead of `POST`).

**Scenario 4: "My params are a Promise and nothing works."**

You're on Next 15+. `await` them — or if you're on Next 14, drop the await and read them
directly. The TS error tells you which one you're on.

## 16. Quick revision notes

- `route.ts` exports HTTP-method functions; the export name is the verb
- `NextRequest` adds `nextUrl` (pathname + searchParams); `NextResponse.json()` wraps a JSON body
- `params` in Next 15+ is a `Promise` — await it in the second argument
- Handlers are server-side, so secrets and DB calls belong here, never in Client Components
- A `GET` route handler is static by default; dynamic APIs make it dynamic
- `405` is automatic when the verb isn't defined
- Route handlers = other machines call you; Server Actions = your own forms (Lesson 93)
- Body is a stream: read it once, with the parser that fits (`json()`, `text()`, `formData()`)

## 17. Cheat sheet

```text
GET/POST/PUT/PATCH/DELETE   →  export async function VERB(request, ctx)
ctx.params                  →  Promise<{ [key]: string }>     (await it)
request.nextUrl.searchParams →  URLSearchParams
request.json() / .text() / .formData()  →  body (read once)
NextResponse.json(body, { status })    →  JSON response
static by default  →  dynamic when you use request.url / cookies() / headers()
```

## 18. Key takeaways

> [!RECAP]
> - A Route Handler is a `route.ts` file whose exported function names become HTTP verbs
> - `NextRequest`/`NextResponse` sit on top of the standard `Request`/`Response`
> - Dynamic segments give you `params` (a Promise in Next 15+); query strings live on `request.nextUrl`
> - Route handlers run server-side and are the home for secrets, DB calls and webhook logic
> - They are the right tool when *other machines* call you — webhooks, OAuth callbacks, mobile clients
> - Your own forms and mutations reach for Server Actions instead (Lesson 93)
> - "Static by default" is a feature: don't casually break a handler's static cache

## Check your understanding

Answer these without looking back.

1. Write the file layout for an endpoint at `/api/users/[id]` handling `GET` and `DELETE`.
2. Why does `request.searchParams` fail on a plain `Request`, and where do you read it instead?
3. Which HTTP status does Next.js return when a route defines only `POST` and receives a `GET`?
4. Give three caller types that force you to choose a route handler over a Server Action.
5. Why does `params` need an `await` in Next 15+, and in which argument is it available?
6. When is a `GET` route handler static, and what makes it dynamic?

## What's Next

**Lesson 93 — Server Actions.** Mutations without an API route: `'use server'`, `action={fn}`,
progressive enhancement, and the `revalidatePath`/`revalidateTag` pair that keeps the
pipeline flowing. The natural next step after "route handlers are for other machines".
