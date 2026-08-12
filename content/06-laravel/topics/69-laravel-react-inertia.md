# Topic 69 — Laravel + React / Inertia

**Checklist anchor:** Inertia architecture · server-side routing · React pages · props · forms · validation errors · shared data · middleware · auth · partial reloads · lazy props · SPA navigation · why Inertia over a separate React + REST API

**Owning lesson:** [132 Laravel + React / Inertia](../132-inertia.md)

---

## The one-sentence answer

**Inertia is a glue layer that lets Laravel render React pages server-side — you write Blade-less React, but keep Laravel's routing, auth, validation, and middleware, because the page is delivered as props from a controller.**

## The mental model

The Inertia **handshake**:

```text
Browser (React app, one page shell)
   ↑  XHR with Inertia headers ("give me this page's props")
   ↓
Laravel (routes, controllers, middleware, auth)
   ↓  Inertia::render('Orders/Index', ['orders' => ...]) — a JSON payload:
      { component: "Orders/Index", props: { orders: [...] } }
   ↑
Browser renders the React component with those props — no full reload
```

Laravel stays the **source of truth** — routing, auth, validation, middleware all live server-side (Lesson 4's controllers, Lesson 16's form requests). React is the **view layer**: a component per page, fed props by the controller. That's the whole difference from a separate React + REST API: no API endpoints, no token handling, no duplicated auth — the server just hands the page its data.

## How it works

### The controller — rendering a page

```php
class OrderController extends Controller
{
    public function index()
    {
        return Inertia::render('Orders/Index', [
            'orders' => Order::with('items')->latest()->paginate(20),
        ]);
        // → the browser receives { component: 'Orders/Index', props: { orders } }
    }
}
```

### The React page

```jsx
// resources/js/Pages/Orders/Index.jsx
export default function Index({ orders }) {
  return (
    <div>
      {orders.data.map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}
    </div>
  );
}
```

### Forms & validation errors

```jsx
import { useForm } from '@inertiajs/react';

export default function Create() {
  const { data, setData, post, errors } = useForm({ title: '' });

  return (
    <form onSubmit={(e) => { e.preventDefault(); post('/orders'); }}>
      <input value={data.title} onChange={(e) => setData('title', e.target.value)} />
      {errors.title && <p>{errors.title}</p>}    {/* Laravel's 422 errors, as props */}
    </form>
  );
}
```

The form posts to Laravel normally; validation failure comes back as **error props** (Lesson 16's 422 shape) — no client-side reimplementation of the rules.

### Shared data & auth

```php
// HandleInertiaRequests middleware — data every page gets:
public function share(Request $request): array
{
    return [
        'auth' => ['user' => $request->user()],   // the logged-in user, everywhere
        'flash' => session('status'),
    ];
}
```

Auth is Laravel's session auth (Lesson 17) — the middleware shares the user, and routes stay guarded by Laravel's middleware (Lesson 3).

### Partial reloads & lazy props

```jsx
// reload only SOME props — the page doesn't re-render everything:
router.reload({ only: ['orders'] });

// lazy props — fetched only when the component requests them:
return Inertia::render('Orders/Index', [
    'orders' => fn () => Order::paginate(20),     // lazy — deferred
    'stats'  => Inertia::lazy(fn () => /* heavy */), // only when asked
]);
```

### SPA navigation

```jsx
<Link href="/orders">Orders</Link>   // Inertia intercepts — no full page reload
// → an XHR for the new page's props → React swaps the component
// the SPA feel, with server-rendered pages underneath
```

## Why Inertia instead of a separate React frontend + REST API? (the question)

| | Inertia | Separate React + REST API |
|---|---|---|
| Routing | **Laravel** (one codebase) | React router + API routes (two codebases) |
| Auth | Laravel sessions, `auth` middleware | Tokens (Sanctum), CORS, CSRF (Lessons 19/70) |
| Validation | Form requests → error props (Lesson 16) | API returns 422, frontend maps it |
| State sync | Server sends exactly the page's data | Client fetches + manages API state |
| Duplication | None — controllers are the contract | Validation, auth, and URL logic in two places |
| Best for | **Server-driven apps** — dashboards, admin, CRUD | Public APIs, third-party clients, mobile |

**The senior answer:** Inertia wins when the app is *server-driven* — Laravel owns routing, auth, and validation, and React is the view. A separate API pays off when you *have* external consumers (mobile, third-party) — that's when the API (Lesson 23/70) earns its complexity. For a same-team web app, the API is duplicated plumbing: two routers, two auth systems, two validation stories.

## Interview questions

**Q1. What is Inertia?**
> A glue layer between Laravel and React (or Vue/Svelte). Controllers render React pages — `Inertia::render('Orders/Index', $props)` — delivered over XHR as component+props. Laravel keeps routing, auth, validation, and middleware; React is the view layer. No API endpoints, no tokens — the server hands the page its data.

**Q2. How does Inertia differ from a separate React + REST API?**
> Inertia keeps everything in one Laravel codebase — Laravel routes serve pages, sessions handle auth, form requests validate (error props), and controllers are the contract. A separate API duplicates all of it: a React router, token auth + CORS/CSRF, client-side validation mapping, and API state management. Inertia is for server-driven apps; a separate API is for when external consumers exist.

**Q3. How do forms and validation work?**
> The form posts to Laravel normally — `useForm` + `post('/orders')`. Validation failure returns Laravel's 422 as **error props** (`errors.title`), rendered by the component. Rules live once, in the Form Request (Lesson 16); the frontend renders them, never reimplements them.

**Q4. How does authentication work?**
> Laravel's session auth, untouched — routes use `auth` middleware (Lesson 3/17), and the `HandleInertiaRequests` middleware shares the user to every page (`auth.user` prop). No tokens, no CORS, no localStorage — the session just works.

**Q5. What are partial reloads and lazy props?**
> Partial reloads re-fetch only selected props (`router.reload({ only: ['orders'] })`) instead of the whole page. Lazy props (`Inertia::lazy(fn () => ...)`) defer heavy data until the component actually requests it. Both keep the page payload honest — the SPA feel without fetching everything every time.

**Senior follow-up: When would you move off Inertia to a separate API?**
> The moment external consumers exist — a mobile app, third-party integrations, a public API. That's the trigger: the API's complexity (Lesson 23 — versioning, tokens, rate limits) pays off when *someone else* needs it. For the web app alone, Inertia's single-codebase simplicity is the senior choice; adding an API for an app nobody else consumes is speculative complexity.

## Common mistakes

❌ Building an API + React client when Inertia fits — duplicated routing, auth, and validation.

❌ Client-side validation duplicating form requests — rules live once, server-side.

❌ Fetching in React what the controller already has — the props *are* the data.

❌ Forgetting `HandleInertiaRequests` — shared auth/flash props silently missing.

## Quick revision notes

- Inertia = **Laravel renders React pages** — component + props over XHR
- Routing/auth/validation/middleware stay **server-side**; React is the view
- Forms → `useForm` + `post()` → **error props** (Lesson 16)
- **Shared data** (`auth.user` via middleware) · **partial reloads** (`only`) · **lazy props**
- **SPA navigation** via `<Link>` — no full reloads
- Inertia for **server-driven apps**; a separate API when **external consumers** exist

## Check your understanding

1. What exactly does the Inertia handshake deliver to the browser?
2. Why does a separate React + REST API duplicate auth and validation?
3. How do Laravel's 422 errors become React props?
4. What does `Inertia::lazy()` defer, and why bother?
5. What's the trigger for moving off Inertia to a real API?
