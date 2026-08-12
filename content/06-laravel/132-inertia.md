# Lesson 132 — Laravel + React / Inertia

**Interview importance:** ⭐⭐⭐⭐ — the standard "modern Laravel full-stack" answer.

The classic full-stack pairing was Laravel serving Blade templates with a sprinkle of jQuery.
The modern one is Laravel doing **server-side routing with React pages**: you write your React
components as pages, and Laravel decides which one renders — no separate API layer, no CORS,
no frontend build that owns the URL.

This lesson is the Inertia mental model: how a request flows from Laravel route to rendered
React page, why Inertia beats a separate SPA + REST API for first-party apps, and the
trade-offs you're signing up for when you merge the two. You came from Lesson 121 on validation
and Lesson 86 on server components — Inertia is the Laravel-shaped version of "the server owns
the data, the client owns the pixels."

## Learning Objectives

By the end of this lesson you should be able to:

- Trace a request through the Inertia cycle: Laravel route → Inertia response (page + props) → React render
- Explain why Inertia beats a separate SPA + REST API for an internal, first-party app
- Write an `Inertia::render()` response and read the page object it produces
- Wire validation errors from a form request into React form props
- Use shared data, partial reloads, lazy props, and `<Link>` navigation
- State the trade-offs — when you should *not* use Inertia

## 1. What is Inertia?

**Inertia is a glue layer that lets Laravel do the routing while React renders the page — the server sends *page objects* (which component + which props), never HTML fragments and never raw JSON.**

Inertia is not a framework. It is a thin client adapter (about 8 KB) plus a server-side response
helper. Your React components are your Blade templates: pages, loaded from the server, swapped
in place with no full browser reload. There is no API to version, no CORS config, and no frontend
router competing with Laravel's.

The one-sentence interview answer: *"Inertia turns your React components into server-rendered
pages. Laravel decides which component loads and passes it props — the client just hydrates and
renders."*

## 2. Mental Model

Laravel is the brain and the router; React is the renderer.

| | Blade (classic) | Separate SPA + REST API | Inertia |
|---|---|---|---|
| Who owns the URL | Laravel | React Router | **Laravel** |
| Server sends | HTML | JSON | **Page object: `{ component, props, url }`** |
| Client renders | server HTML | fetch → state → render | **props → React render** |
| Full reload on nav | yes | no (SPA) | no (SPA-speed) |
| Forms & validation | server redirect + session errors | client-side, duplicated | **server validates, errors land in props** |

Inertia keeps Blade's *server-owns-the-flow* property and gains the SPA's *no-full-reload*
feel — without the SPA's API layer. That is the whole pitch.

> [!NOTE]
> One route file, one request lifecycle, one source of validation truth. Inertia is the answer
> to "I want React, but I don't want to build and maintain a REST API."

## 3. Visual Flow

```text
 browser                                          Laravel                    React
   │                                                │                          │
   │  GET /users?page=2                             │                          │
   ├───────────────────────────────────────────────▶│  routes/web.php          │
   │                                                │  Route::get('/users',    │
   │                                                │    [UserController::class│
   │                                                │     ,'index']);          │
   │                                                │  ┌───────────────────┐   │
   │                                                │  │ controller queries │   │
   │                                                │  │ $users = User::paginate()│
   │                                                │  └─────────┬─────────┘   │
   │                                                │  Inertia::render(         │
   │                                                │    'Users/Index',         │
   │                                                │    ['users' => $users]    │
   │                                                │  )                       │
   │                                                │           │              │
   │  ◀─────────── page object ─────────────────────│           │              │
   │  { component: 'Users/Index',                   │           │              │
   │    props: { users: {...} }, url: '/users' }    │           ▼              │
   │  ┌─────────────────────────────┐               │   renders the page       │
   │  │ React hydrates & renders    │               │   component with props   │
   │  │ Users/Index with users prop │               │                          │
   │  └─────────────────────────────┘               │                          │
```

The initial page load is a normal full request: Laravel renders a shell HTML page that boots
React and hands it the page object. Every navigation after that is a **visit**: a fetch that
returns a *new* page object, which Inertia swaps in without reloading. You get one mental model
for both — it's always "Laravel decided the page."

## 4. How It Works — the Three-Legged Handshake

Three pieces cooperate:

1. **Server adapter** — the `Inertia::render()` response (Laravel-side helper).
2. **Client adapter** — the `usePage()` hook and the visit mechanism (React-side).
3. **Protocol** — the page object JSON on the wire.

```php
// app/Http/Controllers/UserController.php
use Inertia\Inertia;

public function index()
{
    $users = User::query()->paginate(15);

    return Inertia::render('Users/Index', [
        'users' => $users,          // props are serialized to JSON
    ]);
}
```

```text
HTTP response (the page object on the wire):

{
  "component": "Users/Index",
  "props": {
    "users": {
      "data": [ { "id": 1, "name": "Ada Lovelace" }, ... ],
      "current_page": 1,
      "last_page": 7,
      "total": 98
    }
  },
  "url": "/users",
  "version": "d3f9a2c1"
}
```

```narrate
1-4: 'Users/Index' names the React component to load; the array is its props.
5-8: Eloquent models serialize automatically (paginator included) — no manual mapping.
10-13: The client swaps the component in place and re-renders with these props.
15-17: 'version' is Inertia's asset-reload key — bump assets, and stale pages auto-refresh.
```

On the client, `resources/js/Pages/Users/Index.jsx` is a plain React component:

```jsx
// resources/js/Pages/Users/Index.jsx
import { Link } from '@inertiajs/react';

export default function UsersIndex({ users }) {
  return (
    <div>
      {users.data.map((user) => (
        <div key={user.id}>
          <Link href={`/users/${user.id}`}>{user.name}</Link>
        </div>
      ))}
    </div>
  );
}
```

Inertia resolves the string `'Users/Index'` to the file `resources/js/Pages/Users/Index.jsx`.
That one string is the entire "router": the server names the page, React renders it.

## 5. Real Project Usage

- **Admin dashboards.** Users, orders, reports — internal tools where the URL, the session, and
  the validation live in Laravel and the UI is a React table. This is Inertia's home turf.
- **SaaS app shells.** Billing pages, team settings, subscription management — server-rendered
  pages with React interactivity, sharing one auth session and one CSRF token.
- **Most "React + Laravel" job postings.** "Laravel + Inertia + React" is a common explicit
  stack. Saying "Inertia means I don't maintain a separate frontend repo or an API version"
  is the answer they're listening for.

## 6. Interview Explanation

The 30-second answer to "why Inertia over a separate SPA + REST API?":

> I'd use Inertia for a first-party app where Laravel owns the domain — an internal admin or a
> logged-in product. Laravel routes, validates, and renders; React just renders the page
> component with props. That removes the entire API layer: no endpoints to build or version, no
> CORS configuration, one auth session and one CSRF token, and validation errors flow straight
> into form props instead of being re-implemented client-side. It's faster to build and there's
> less moving surface.
>
> I'd pick a separate SPA + API instead when the API is a product in its own right — a public
> API, a mobile app, third-party integrations — or when the frontend and backend teams need to
> ship and deploy independently.

## 7. Senior-Level Insights

- **Inertia is a deliberate non-choice.** You're choosing *not* to build an API layer, *not* to
  solve CORS, *not* to maintain two auth systems. Name the things you're avoiding — seniors are
  graded on what they don't build.
- **The page object is the contract.** `{ component, props, url }` is versioned by the
  `version` key. The senior framing: the wire format is tiny and stable, which is exactly why
  Inertia needs no versioning ceremony.
- **Server Components (L86) are the conceptual cousin.** RSC and Inertia both say "the server
  decides what the page is; the client renders it." RSC ships serialized *trees*, Inertia ships
  serialized *pages*. Being able to draw that parallel shows you understand the pattern, not
  just the framework.
- **Blade is still the right tool sometimes.** Simple pages, marketing sites, or teams that
  don't want React at all. Inertia is not "Blade is dead" — it's "if you want React, here's the
  least-API way to have it."

## 8. Common Mistakes

❌ Building an API on top of Inertia — exposing JSON endpoints *and* Inertia pages for the same
data. Pick one; mixing means two things to keep in sync.

❌ Putting business logic in React components. The controller and form requests own the rules;
the page is a renderer. React logic that duplicates Laravel validation is the exact cost Inertia
was meant to remove.

❌ Forgetting that *any* prop change re-renders the page. A prop that changes on every request
(e.g. a clock or a random nonce) defeats React's diffing.

❌ Using `Link` for external URLs or full-page links. Inertia intercepts same-app visits; an
external href should be a plain `<a>`.

❌ Ignoring the `version` key on deploy. After deploying new assets, stale pages error until a
reload — the version bump fixes it automatically.

## 9. Best Practices

✅ Keep controllers thin: query, call the service layer (L130), `Inertia::render()`

✅ Validate with Form Requests (L121) — the errors arrive in `errors` props for free

✅ Use `Inertia::share()` for auth/user data — not for page-specific state

✅ Use lazy props for heavy data — `fn () => ...` loads only when requested

✅ Use partial reloads for filters and pagination — only the changed props cross the wire

✅ Wrap destructive actions in `router.post(...)` with method spoofing (`_method: 'delete'`)

❌ Don't use Inertia for a public API or third-party integrations — that's Lesson 133's job

## 10. Interview Questions

**Q1. How does an Inertia page load differ from a Blade page?**

> Both start as a normal Laravel request. Blade returns HTML the browser renders; Inertia
> returns a page object — component name, props, URL — inside a shell HTML page. React hydrates
> that shell and renders the component with the props. Navigation after that is a visit: fetch
> a new page object, swap it in, no full reload.

**Q2. Why choose Inertia over a separate SPA + REST API?**

> For a first-party app, the API layer is pure overhead. Inertia removes it: no endpoints to
> build and version, no CORS config, one session and CSRF token, and validation errors flow to
> forms via props. The cost is coupling — the frontend and backend deploy together — which is
> fine for an internal app and wrong for a public API.

**Q3. How do validation errors reach a React form?**

> The form request (L121) throws `ValidationException`; Inertia catches it and redirects back
> with the errors in session flash. The client merges them into the `errors` prop, keyed by
> field name, and the form renders `errors.email` next to the input. The browser never sees a
> 422 — it sees a redirect with props.

**Q4. What is a partial reload, and when do you use it?**

> A visit that requests only specific props instead of the whole page — `router.reload({ only:
> ['users'] })`. For pagination and filters, the full page would re-fetch everything; partial
> reloads keep the payload to what changed. Lazy props are the same idea in the other
> direction: heavy data isn't fetched until the page asks for it.

**Q5. How does Inertia handle authentication and CSRF?**

> It reuses Laravel's session and CSRF middleware wholesale — there is no token flow to design.
> When a session expires, Inertia's error handler sees a redirect to the login page and can
> show it in place. That shared auth is one of the biggest reasons to prefer Inertia over an
> SPA.

**Q6. When would you *not* use Inertia?**

> When the API is a product: a mobile app, third-party integrations, a public REST/GraphQL
> surface. Or when the frontend team needs to deploy independently of the backend. Those are
> "separate SPA + API" territory — Lesson 133 — and Inertia's coupling is exactly the wrong
> shape for them.

**Senior follow-up: "Your team is growing — how do you keep the Inertia frontend maintainable?"**

> By treating the page components as the UI layer and nothing more: all data comes in as props,
> all mutations go through the server (form requests, service layer), and shared chrome lives in
> a layout component. A type-safe props contract — TypeScript types generated from the PHP
> responses — keeps the two halves honest as the team grows, and the `version` key handles asset
> deploys. The maintainability lever isn't the tool, it's who owns the rules — and with Inertia
> that's unambiguously Laravel.

## 11. Follow-Up Questions

**"Does Inertia do server-side rendering?"**

> The *first* load is server-rendered — Laravel sends the shell HTML with the page object in
> it. Every later visit is client-side. If you need true per-request SSR with full SEO, Inertia
> isn't the tool — that's a Next.js-shaped problem (L86–88).

**"How do you handle the 404 / error pages?"**

> Inertia catches the error responses and maps them to your React error pages by status code —
> an `Errors/404.jsx` renders for a 404, and so on. No per-route handling needed.

**"Can Inertia talk to WebSockets or polling?"**

> Yes — Inertia solves navigation, not real-time. Use Echo + broadcasting or a polling hook in
> your components; when the data changes, the component re-renders from its props.

## 12. Comparison Table

| | Blade | Inertia + React | SPA + REST API |
|---|---|---|---|
| Router | Laravel | **Laravel** | React Router |
| Server sends | HTML | **page object** | JSON |
| API layer to build | none | **none** | full REST API |
| CORS | n/a | **n/a** | must configure |
| Auth / CSRF | session | **session (shared)** | token dance |
| Validation errors to UI | session flash | **props (free)** | re-implement client-side |
| Nav speed | full reload | **SPA-speed** | SPA-speed |
| Frontend/backend decoupling | n/a | **deploy together** | fully independent |
| Public API for third parties | n/a | ❌ not the tool | ✅ the tool (L133) |

## 13. Code Example — Forms, Validation Errors, and Shared Data

A create-user form with server-side validation and shared flash data:

```php
// app/Http/Requests/StoreUserRequest.php  (Lesson 121)
class StoreUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
        ];
    }
}
```

```php
// app/Http/Controllers/UserController.php
public function store(StoreUserRequest $request)
{
    User::create($request->validated());

    return redirect()->back()->with('flash', [
        'message' => 'User created.',
    ]);
}
```

```text
On validation failure (no redirect with data — Inertia intercepts the 422):

  redirect back to /users/create
  session flash: { errors: { email: ["The email has already been taken."] } }
  Inertia merges 'errors' + 'flash' into the props of the current page
```

```php
// app/Http/Middleware/HandleInertiaRequests.php (the default Inertia middleware)
public function share(Request $request): array
{
    return [
        'user' => fn () => $request->user()  // shared data: every page gets it
            ?->only('id', 'name', 'email'),
        'flash' => fn () => $request->session()->get('flash'),
    ];
}
```

```jsx
// resources/js/Pages/Users/Create.jsx
import { useForm, usePage } from '@inertiajs/react';

export default function Create() {
  const { errors, flash } = usePage().props;   // errors: server's form request
  const form = useForm({ name: '', email: '' });

  const submit = (e) => {
    e.preventDefault();
    form.post('/users');                        // a visit; validation errors come back
  };

  return (
    <form onSubmit={submit}>
      <input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
      {errors.name && <p>{errors.name}</p>}
      <input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
      {errors.email && <p>{errors.email}</p>}
      {flash?.message && <p>{flash.message}</p>}
      <button disabled={form.processing}>Create</button>
    </form>
  );
}
```

```text
props received by this page (merged by Inertia):
  { user: { id: 7, name: 'Ada', email: 'ada@x.dev' },   ← shared
    flash: { message: 'User created.' },                ← shared
    errors: { email: ["The email has already been taken."] } }
```

```narrate
4-5: The form request's errors and the session flash arrive as plain props — no fetch, no 422 handling.
7-10: useForm keeps data, processing state, and submit helpers in one object.
14-20: errors render next to their fields; the same page that failed re-renders with them.
1-3: The Inertia middleware shares auth user + flash with EVERY page — that's shared data.
```

> [!PITFALL]
> Validation is **server-side truth** — never "validate in React to avoid the round trip." The
> React errors are just the server's message displayed locally. Inertia gives you that for free;
> a raw SPA makes you re-implement it and drift from the server.

## 14. Performance Notes

- **Partial reloads are the pagination/filter lever.** `router.reload({ only: ['users'] })`
  ships a few KB instead of the whole page. Without it, every page turn re-renders everything.
- **Lazy props defer heavy work.** `'stats' => fn () => $this->stats()` resolves only when the
  page first requests it — an expensive dashboard query doesn't run on every navigation.
- **The page object is small; the bundle is the real weight.** Keep heavy third-party UI in
  code-split chunks (L69) so each page only downloads what it renders.
- **The `version` key is your cache buster.** Bump it on deploy (it's derived from your build),
  and Inertia auto-refreshes stale pages instead of rendering errors.

## 15. Debugging Scenarios

| Symptom | Likely cause | The move |
|---|---|---|
| Page loads blank on first visit | `component` string doesn't match any file | Check `Inertia::render('Users/Index', …)` against `resources/js/Pages/Users/Index.jsx` |
| Validation errors never appear | Middleware not registered, or form request isn't throwing 422 | Confirm `HandleInertiaRequests` is in `web` middleware group; confirm the route uses `web` |
| Everything works but flashes a reload after deploy | Stale `version` | Re-run asset build so the version hash changes; stale tabs auto-reload |
| Nav links do a full page reload | Using `<a>` instead of `<Link>`, or the href is external | Swap to `<Link>`; use a plain anchor for external URLs |
| Props come back as empty `{}` | Shared data throws (e.g. `$request->user()` on a route without session) | Check middleware order — the shared closure runs per request |

## 16. Quick Revision Notes

- The protocol: **request → Laravel route → page object `{ component, props, url }` → React renders**
- Inertia removes the API layer: no endpoints, no CORS, shared session/CSRF, validation errors as props
- `Inertia::render('Users/Index', ['users' => $users])` names the component and its props
- `usePage()` reads props (errors, flash, shared user); `useForm()` posts visits
- `Inertia::share()` for global data; lazy props `fn () => …` for heavy data
- Partial reloads via `only` — pagination and filters stay light
- `<Link>` for in-app navigation; `router.post`/`router.delete` with `_method` for mutations
- Trade-off: less decoupling, no public API for third parties → that's Lesson 133

## 17. Cheat Sheet

```text
SERVER SIDE                          CLIENT SIDE
  Route::get('/users', ...)           <Link href="/users">        ← visit, no reload
  Inertia::render('Users/Index',      router.reload({ only: ['users'] })  ← partial
    ['users' => $users])              useForm().post('/users')    ← mutation + errors
  Inertia::share(['user' => fn()…])   usePage().props.errors      ← validation props
  'stats' => fn() => $this->stats()   usePage().props.user        ← shared data

THE PAGE OBJECT
  { component: 'Users/Index',
    props:     { users, errors, flash, user },
    url:       '/users',
    version:   'asset hash' }

WHY INERTIA        no API layer ▸ no CORS ▸ shared session ▸ errors as props
TRADE-OFFS         coupled deploy ▸ no public API ▸ React = renderer, not owner
```

## 18. Key Takeaways

> [!RECAP]
> - Inertia = **server-side routing with React pages**: Laravel names the page, React hydrates it
> - The wire format is a **page object** — `{ component, props, url, version }` — one model for
>   first load and every navigation
> - Why Inertia over SPA + REST API: **no API layer, no CORS, shared auth/session, validation
>   errors land in form props, faster to build** (L48 composition makes the component pages trivial)
> - `Inertia::render('Users/Index', ['users' => …])` names the component and serializes props
> - Forms + form requests (L121) give you errors-as-props for free — server validation stays the truth
> - `Inertia::share()` for global data, lazy props and partial reloads for payload control
> - `<Link>` gives SPA navigation without a frontend router
> - The trade-offs: **less frontend/backend decoupling, and no public API for third parties** —
>   the "when not to" answer, and exactly what Lesson 133 exists for

## Check your understanding

Answer these without looking back.

1. Trace a request from URL to rendered page in Inertia — name every hop.
2. Give three things Inertia removes compared with a separate SPA + REST API.
3. What exactly is in a page object? Write one from memory.
4. How does a form request's validation error become a React `errors.email` prop?
5. What is shared data vs lazy props vs a partial reload — and when do you reach for each?
6. Why does `<Link>` avoid a full page reload, and when should you *not* use it?
7. State two scenarios where Inertia is the wrong tool.

## What's Next

**Lesson 133 — Laravel API + Next.js & Payments.** The flip side: Laravel as the API for a
Next.js frontend, with Sanctum token auth and Stripe webhooks — never trust the frontend about
money.