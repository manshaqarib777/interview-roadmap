# Lesson 95 — Cookies, Headers & Metadata

**Interview importance:** ⭐⭐ — foundational. Nobody hires you for knowing `cookies()`, but
every auth, theming and SEO feature you'll build sits on it. It's also the reason a whole
class of "why did the build break" errors exists.

This lesson ties three server-side pieces together: reading the request through `cookies()`
and `headers()`, and filling the document `<head>` through the metadata API. The first two
are the same request context you met in middleware (Lesson 94), now inside Server Components
and Route Handlers; the third is how Next.js turns a page into SEO-ready HTML.

## Learning Objectives

By the end of this lesson you should be able to:

- Read cookies and headers in Server Components and Route Handlers with `cookies()` / `headers()`
- Explain why both are async in Next.js 15 and what that did to the API
- Use `generateMetadata` for dynamic, per-route metadata
- Set up a `title` template in the root layout and say what `%s`, `default` and `absolute` do
- Say why reading request data makes a route dynamic

## 1. What Are These APIs?

**`cookies()` and `headers()` are the read-only, request-scoped views of the HTTP request available in Server Components and Route Handlers; the metadata API is how a route declares its `<head>` output.**

Two different jobs in one lesson: the first two are *input* (what the browser sent us), the
metadata API is *output* (what we send back in the head). They meet in `generateMetadata`,
which can read cookies and headers while computing metadata.

## 2. Mental Model

- `cookies()` / `headers()` — **the waiter's notepad.** Every request, the server writes down
  what the browser sent: the session cookie, the locale, the user agent. Your Server
  Component picks up the notepad for *that one request* and reads from it. It's read-only —
  you don't edit the notepad, you jot the bill on the response.
- The metadata API — **the shop sign.** The layout declares the template ("All Store | "),
  each page declares its own title, and the sign out front reads "All Store | About".

## 3. Visual Flow

```text
Browser request
     │  (cookies + headers arrive with the request)
     ▼
┌───────────────────────────────┐
│ Server Component / Route      │
│   const c = await cookies()   │   ← reads request context
│   const h = await headers()   │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ generateMetadata (same request)│  ← resolves <title>, description, OG
└───────────────┬───────────────┘
                │
                ▼
     prerendered at build time  ── static  (no request data read)
                │
     rendered per request       ── dynamic (cookies/headers/params read)
                │
                ▼
          HTML with <head> filled in
```

## 4. How It Works

`cookies()` and `headers()` come from `next/headers`. They are **async and request-scoped**:
they must be `await`ed (Next.js 15+), and they can only be called while a request is being
handled — a Server Component render, a Route Handler, or a Server Action.

```ts
// app/layout.tsx — a Server Component by default
import { cookies, headers } from 'next/headers';

export default async function RootLayout() {
  const cookieStore = await cookies();           // awaited — required in Next 15
  const theme = cookieStore.get('theme')?.value ?? 'light';

  const headerList = await headers();
  const ua = headerList.get('user-agent');

  return (
    <html lang="en">
      <body data-theme={theme}>
        {/* … */}
      </body>
    </html>
  );
}
```

```text
request with Cookie: theme=dark; user-agent: Mozilla/5.0 …
→ <html lang="en"><body data-theme="dark">
```

Why async? Because the underlying Web APIs (`RequestCookies`, `Headers`) are dynamic, and
the static-analysis engine needed a `Promise` boundary it could trace — sync usage was
ambiguous during prerendering. The practical rule: `await` them, and the TypeScript error
`'cookies' should be awaited` disappears.

> [!PITFALL]
> The error "Route … used `cookies()`" means Next.js detected request data during a build-time
> prerender. Reading cookies/headers makes the route **dynamic** — it can no longer be a fully
> static page (Lesson 91). That's by design: the value only exists at request time.

The same functions work in a Route Handler (Lesson 92):

```ts
// app/api/me/route.ts
import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

export async function GET() {
  const token = (await cookies()).get('session')?.value;
  const userAgent = (await headers()).get('user-agent');

  return NextResponse.json({ hasSession: Boolean(token), userAgent });
}
```

```text
curl -H 'Cookie: session=abc123' http://localhost:3000/api/me
→ {"hasSession":true,"userAgent":"curl/8.5.0"}
```

## 5. Real Project Usage

| Feature | The cookie/header you read | Where |
|---|---|---|
| Dark mode | `theme` cookie → `<body data-theme>` | Root layout |
| i18n | `accept-language` header, or a locale cookie | Layout + `generateMetadata` |
| Auth (read side) | `session` cookie → gate or greet the user | Layout, pages, Route Handlers |
| Analytics | `user-agent` → device breakdown | Route Handlers |
| A/B testing | `bucket` cookie → choose the variant | Middleware (Lesson 94) or layout |

The layout + `generateMetadata` combo on the same page:

```ts
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Blog',               // augmented by the root template
};

export async function generateMetadata(): Promise<Metadata> {
  const theme = (await cookies()).get('theme')?.value;
  return {
    description: `Blog — shown to ${theme} theme users`,  // dynamic, request-time
  };
}
```

## 6. Interview Explanation

> `cookies()` and `headers()` give a Server Component or Route Handler read access to the
> current request's cookies and headers. They're async — you `await` them — and they make the
> route dynamic, because the values only exist at request time. Setting cookies happens in
> Server Actions or Route Handlers, not during render.
>
> Metadata is the parallel system for the `<head>`: static `export const metadata` in a
> layout or page, dynamic `generateMetadata` when the title depends on params or request
> data, and a root-level `title.template` like `%s | Acme` that every page title flows
> through.

## 7. Senior-Level Insights

- **`await` is the whole game.** The Next 15 async migration changed every codebase at once.
  Knowing *why* — request context is dynamic and the compiler needed an awaitable boundary —
  beats memorising the codemod.
- **Read-only during render is a rule, not a suggestion.** Setting cookies in a Server
  Component render is illegal. The write path is a Server Action (Lesson 93), a Route
  Handler, or `NextResponse.cookies.set` in middleware.
- **Request data makes routes dynamic — and that has a cache cost.** A page that reads
  cookies can't be a static file; it renders per request. That's correct, but it's why
  Lesson 91's static/dynamic trade-offs exist. `generateMetadata` reading a cookie does the
  same to the metadata path.
- **Metadata merges shallowly.** Child segments override *whole nested fields* (all of
  `openGraph`, not just one key) unless you spread the parent's values back in.
- **`title.template` only applies to child segments.** The segment that defines the template
  doesn't use it on its own title, `default` is required alongside it, and `absolute` is the
  escape hatch.

## 8. Common Mistakes

❌ Forgetting `await` in Next.js 15:

```ts
const token = cookies().get('session');  // 💥 TypeError: cookies is not a function …
const token = (await cookies()).get('session');  // ✅
```

❌ Setting a cookie during render:

```ts
const c = await cookies();
c.set('theme', 'dark');  // 💥 "Cookies can only be modified in a Server Action or Route Handler"
```

❌ Breaking the template — a page title that must ignore `%s`:

```ts
title: { absolute: 'Acme' }  // ✅ ignores the parent template
```

❌ Defining `title.template` with no `default` — the build errors out.

❌ Declaring **both** `metadata` and `generateMetadata` in the same segment — not allowed;
pick one per route.

## 9. Best Practices

✅ `await cookies()` / `await headers()` — every time

✅ Read cookies/headers in Server Components, *set* them in Actions / Route Handlers / middleware

✅ Keep request-data reads in the layout or page that needs them — don't thread them through client components

✅ Put the `title.template` + `default` in the **root** layout

✅ Use `generateMetadata` only when metadata depends on params, searchParams, or request data — otherwise the static `metadata` object is cheaper and prerenderable

❌ Don't read cookies just to pass the value to a client component — that forces the whole page dynamic

## 10. Interview Questions

**Q1. How do you read a cookie in a Server Component?**

> Import `cookies` from `next/headers` and await it: `(await cookies()).get('theme')?.value`.
> It's async in Next.js 15 because request context is dynamic. Reading it opts the route out
> of static prerendering.

**Q2. Why did `cookies()` become async?**

> So the request context is represented by a `Promise` the compiler can trace — sync usage
> was ambiguous during prerendering, where no request exists. The migration codemod rewrote
> every call to `await`, and `NEXT_STATIC_GEN_BAILOUT` was added to explain the "Route used
> cookies()" error.

**Q3. Where are you allowed to *set* cookies?**

> In a Server Action, a Route Handler, or middleware via `NextResponse.cookies.set`. Never in
> a Server Component render — the request has already arrived; the response hasn't been
> written yet. Reading is render-safe; writing is response-time work.

**Q4. What does `generateMetadata` do?**

> It's the async, per-route way to produce `Metadata` — for pages whose title or description
> depends on `params`, `searchParams`, or request data like cookies. Next.js resolves it
> during render and writes the tags into the initial HTML, so crawlers see them without
> JavaScript.

**Q5. How does a `title` template work?**

> In the root layout: `title: { template: '%s | Acme', default: 'Acme' }`. Every child page
> that sets a plain `title` gets `%s` replaced and the template applied — `About` becomes
> `About | Acme`. `default` is required with a template, `absolute` bypasses it, and the
> template only applies to child segments, not the segment that defines it.

**Senior follow-up: How does metadata merging work across nested layouts?**

> Metadata is evaluated from the root segment down to the page and *shallowly merged* — a
> child's string fields override the parent's, and for nested objects like `openGraph` the
> child's whole object replaces the parent's. If a page wants to keep the parent's OG image
> while changing the title, it must spread the parent's fields back in. `generateMetadata`
> also receives the resolved parent metadata as its second argument, so it can extend rather
> than clobber.

## 11. Follow-up Questions

**Do `cookies()` and `headers()` work in middleware too?**

> Middleware gets the request directly — `request.cookies` and `request.headers` on the
> `NextRequest`, no import needed. Same data, earlier in the pipeline (Lesson 94).

**How do you read search params from the metadata API?**

> `generateMetadata` receives `params` and `searchParams` as its first argument, same shape
> as the page component. Both are `Promise`s in Next.js 15.

**What makes a page dynamic, concretely?**

> Reading `cookies()`, `headers()`, `params`, or `searchParams`, or calling
> `fetch(..., { cache: 'no-store' })`. Any of those means the output depends on the request,
> so Next.js renders it per request instead of emitting a static file.

## 12. Comparison Table

| | `cookies()` / `headers()` | `metadata` object | `generateMetadata` |
|---|---|---|---|
| Direction | Input — reads the request | Output — declares `<head>` | Output, computed per route |
| When | Request time (dynamic) | Build time (static) | Request or build, per page |
| Where | Server Components, Route Handlers | `layout.tsx` / `page.tsx` | `layout.tsx` / `page.tsx` |
| Needs data | always | never | when title/description depend on data |
| Effect on route | makes it dynamic | none | dynamic if it reads request data |

## 13. Code Example

A root layout with a theme cookie and a title template, plus a page that resolves its own
metadata from its params:

```ts
// app/layout.tsx
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: { template: '%s | Acme', default: 'Acme' },
  description: 'Acme storefront',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get('theme')?.value ?? 'light';
  return (
    <html lang="en" data-theme={theme}>
      <body>{children}</body>
    </html>
  );
}
```

```ts
// app/products/[id]/page.tsx
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await fetch(`https://api.acme.com/products/${id}`).then((r) => r.json());

  return { title: product.name, description: product.tagline };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  // …render the product…
}
```

```narrate
layout.tsx line 5:  %s is replaced by each page's title; default covers pages with none
layout.tsx line 10: await cookies() — reading the request, so this layout is dynamic
page.tsx line 7:    generateMetadata runs during render, on the same request
page.tsx line 11:   the dynamic title flows through the root template
```

Resulting `<head>` for `/products/42` when the product is "Gizmo":

```text
<html lang="en" data-theme="dark">
  <head>
    <title>Gizmo | Acme</title>
    <meta name="description" content="The gizmo that does everything" />
  </head>
  …
</html>
```

## 14. Performance Notes

- **Reading cookies/headers makes a route dynamic** — it can't be a static file, so it
  renders per request. Use it only where the value genuinely differs per user/request.
- **`generateMetadata` is free to skip.** If a page's metadata is static, export the plain
  `metadata` object; it's resolved at build time and never blocks a request.
- **Fetch inside `generateMetadata` is memoized** for the same data across
  `generateMetadata`, layouts, pages, and Server Components in one render pass — one network
  call, not several.
- **Streaming metadata** (Next 15.2+) lets the initial UI render before slow
  `generateMetadata` finishes; HTML-only crawlers still get the full head.

## 15. Debugging Scenarios

| Symptom | Cause | Fix |
|---|---|---|
| `'cookies' should be awaited` | Next 15 async API used without `await` | `const c = await cookies()` |
| "Route used `cookies()` …" during build | Request data read during prerender | Accept the dynamic route, or restructure so the read isn't needed |
| Cookie is `undefined` in a Server Component | Read at build time, or set after render began | Ensure it's set before the request arrives (login action), read at request time |
| `<title>` shows the raw page title, template ignored | Template defined in the same segment that renders, or no `default` | Move template+default to the root layout; `default` is required |
| Metadata "missing" on social share | `openGraph` fields overridden by a child's shallow merge | Spread parent fields back in `generateMetadata` |

## 16. Quick Revision Notes

- `await cookies()` / `await headers()` — async since Next.js 15, Server Components + Route Handlers only
- Reading request data ⇒ **dynamic route** (can't prerender to static)
- **Set** cookies in Server Actions / Route Handlers / middleware — never during render
- Static `export const metadata` for fixed `<head>`; `generateMetadata` when it depends on data
- Root layout: `title: { template: '%s | Acme', default: 'Acme' }`
- `absolute` ignores the template; `default` is required with a template
- Metadata merges shallowly — child `openGraph` replaces parent `openGraph`
- Fetch in `generateMetadata` is memoized within the render pass

## 17. Cheat Sheet

```text
import { cookies, headers } from 'next/headers';

const c = await cookies();                c.get('theme')?.value
const h = await headers();                h.get('user-agent')

// static metadata (build time):
export const metadata: Metadata = {
  title: { template: '%s | Acme', default: 'Acme' },
  description: '…',
};

// dynamic metadata (request time):
export async function generateMetadata({ params }: Props) {
  return { title: (await product).name };
}

// set cookies — only in a Server Action / Route Handler / middleware:
(await cookies()).set('theme', 'dark');            // ✅ Action/Handler
NextResponse.cookies.set('theme', 'dark');         // ✅ middleware
```

## 18. Key Takeaways

> [!RECAP]
> - `cookies()` and `headers()` are async, read-only request context — Server Components and Route Handlers only
> - Reading them makes a route dynamic; that's why the "Route used cookies()" error exists
> - Writes happen in Server Actions, Route Handlers, or middleware — never during render
> - Static `metadata` for fixed head tags; `generateMetadata` when the head depends on data
> - `title.template` (`%s | Acme`) + `default` lives in the root layout; `absolute` escapes it
> - Metadata is shallow-merged down the segment tree — children replace whole nested fields

## Check your understanding

Answer these without looking back.

1. Why must `cookies()` and `headers()` be awaited in Next.js 15?
2. Where are you allowed to *set* a cookie, and why not in a Server Component render?
3. What happens to a route when it reads a cookie — and why?
4. `export const metadata` vs `generateMetadata` — when do you choose which?
5. Given a root `title: { template: '%s | Acme', default: 'Acme' }`, what is the final title for a page exporting `title: 'About'`?
6. What does `title.absolute` do, and why does `title.template` need `title.default`?
7. How does metadata merge when a child page defines `openGraph`?

## What's Next

**Lesson 96 — Env Vars, Build & Deployment.** What `NEXT_PUBLIC_` actually does to your
bundle, the `.env` files Next.js reads, the build pipeline (`build`/`start`, static vs
dynamic), and shipping on Vercel.
