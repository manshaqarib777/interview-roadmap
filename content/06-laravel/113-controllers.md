# Lesson 113 — Controllers, Requests & Responses

**Interview importance:** ⭐⭐⭐⭐ — thin controllers, form requests, and why business logic never belongs here.

Lessons 111 and 112 built the map and the gates. The controller is the destination: the layer that receives a validated request, does the smallest amount of work needed, and hands back a response. Almost every senior question about "where does this code live?" resolves to this lesson's core idea — separation of concerns.

The request (Lesson 106's flow, again) becomes a `Request` object, the router hands it to your action, and your action must return something Laravel can turn into a response. The gap between those two objects is where clean Laravel code is won or lost.

## Learning Objectives

By the end of this lesson you should be able to:

- Name the seven resource-controller methods and the routes each one answers
- Write a single-action invokable controller and say when it's the right call
- Explain how Laravel resolves controller dependencies from the container
- Move validation into a Form Request and justify the move
- Build a response from `view()`, `json()`, `redirect()` and the `response()` factory
- Argue why a 50-line action is a smell — and where the logic should go

## 1. One-Line Definition

**A controller is the HTTP-facing layer that receives a validated request and returns a response — thin by design, with the request parsing in form requests and the real work delegated elsewhere.**

## 2. Mental Model

Think of a controller as the **maître d'**: it seats the request, takes the order, and serves the result — it does not cook the meal. The recipe (business logic) lives in services, models and jobs; the controller's job is to be a polite, thin go-between.

```text
HTTP request
      │
      ▼
FormRequest (validation, authorization)
      │
      ▼
Controller action (thin: orchestrate, don't compute)
      │
      ├── service / model / job (the actual work)
      ▼
Response: view / json / redirect
```

Every extra line of business logic in the controller is a line that moves the meal into the dining room.

## 3. Visual Flow

```text
POST /posts
      │
      ▼
StorePostRequest::authorize() → who may create?        ┐
StorePostRequest::rules()     → title, body required   │  validation gate
      │                                                │  (fails → 422, never reaches the controller)
      ▼                                                ┘
PostController@store(StorePostRequest $request)
      │
      ├─ $post = Post::create($request->validated());   (delegated to the model)
      ▼
redirect()->route('posts.show', $post)   →  302 → /posts/42
```

The controller action is three lines because everything decision-shaped happened before it (validation) or after it (persistence).

## 4. How It Works

### The seven resource methods

`Route::resource('posts', PostController::class)` (Lesson 111) maps seven HTTP verbs to seven methods. The method name *is* the contract:

```php
// app/Http/Controllers/PostController.php
class PostController extends Controller
{
    public function index()          { /* list all posts */ }
    public function create()         { /* show the create form */ }
    public function store(Request $request)  { /* persist a new post */ }
    public function show(Post $post) { /* show one post */ }
    public function edit(Post $post) { /* show the edit form */ }
    public function update(Request $request, Post $post) { /* persist changes */ }
    public function destroy(Post $post) { /* delete */ }
}
```

```text
GET    /posts           → index
GET    /posts/create    → create
POST   /posts           → store
GET    /posts/{post}    → show
GET    /posts/{post}/edit    → edit
PUT/PATCH /posts/{post}      → update
DELETE /posts/{post}         → destroy

GET /posts/42 → show(Post $post) — route-model binding (Lesson 111) injects the model
```

### Single-action controllers

When an action doesn't fit the seven, a controller with one method keeps the naming honest:

```php
// app/Http/Controllers/SearchPostsController.php
class SearchPostsController
{
    public function __invoke(Request $request)
    {
        return view('posts.search', [
            'posts' => Post::search($request->query('q', ''))->get(),
        ]);
    }
}
```

```php
// routes/web.php
Route::get('/search', SearchPostsController::class);
```

```text
GET /search?q=laravel → the search view with matching posts
```

No method name to invent — `__invoke` *is* the action, and the route references the class directly.

### Dependency injection

Laravel resolves action parameters from the container (Lesson 108): type-hint a service, and it's built and injected for you. The controller never calls `new`:

```php
// app/Http/Controllers/OrderController.php
use App\Services\OrderService;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orders) {}

    public function index()
    {
        return view('orders.index', ['orders' => $this->orders->recent()]);
    }
}
```

```text
GET /orders → 200, the orders.index view rendered with recent orders
             (OrderService was constructed by the container, not by the controller)
```

### Controller middleware

Middleware can be declared from the constructor — the same `auth` from Lesson 112, scoped to specific methods:

```php
use App\Http\Middleware\EnsureUserIsAdmin;

class AdminController extends Controller
{
    public function __construct()
    {
        // only these two methods are gated
        $this->middleware('auth')->only(['index', 'reports']);
        // everything except 'index' is gated
        // $this->middleware('auth')->except(['index']);
    }
}
```

> [!NOTE]
> Constructor middleware is a convenience — the same `auth` can be attached per route in `routes/web.php`. Picking one place (routes) keeps the registration visible; constructor middleware leaks the gate into the controller.

## 5. Real Project Usage

| Concern | Lives in | Not in |
|---|---|---|
| Validation rules, `authorize()` | Form Requests | controller body |
| Business logic, persistence | Services, models, jobs | controller body |
| HTTP mechanics | controllers, middleware | models, services |
| Presentation | Blade views, JSON resources | controllers |
| Querying | Eloquent scopes, query classes | controllers |

The "avoid: controller with 50 lines of business logic" story — the refactor interviewers want you to walk through:

```php
// ❌ fat controller: validation + logic + persistence + redirect all in one body
class OrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'items'   => 'required|array',
            'items.*.sku'  => 'required',
            'items.*.qty'  => 'required|integer|min:1',
        ]);

        $total = 0;
        foreach ($request->input('items') as $item) {
            $product = Product::where('sku', $item['sku'])->firstOrFail();
            if ($product->stock < $item['qty']) {
                return back()->withErrors("Not enough stock for {$product->sku}");
            }
            $total += $product->price * $item['qty'];
        }
        // … more inventory math, tax, persistence, email …

        return redirect()->route('orders.show', $order);
    }
}
```

```text
Why it hurts:  rules are untestable without HTTP, stock math can't run in a job or CLI,
               email is coupled to the request, and any change touches the controller.
```

The refactor keeps the controller thin and moves each concern to its home:

```php
// ✅ thin controller
class OrderController extends Controller
{
    public function store(StoreOrderRequest $request, OrderService $orders)
    {
        $order = $orders->place($request->user(), $request->validated());

        return redirect()->route('orders.show', $order);
    }
}
```

```text
Controller:   3 lines — validate, delegate, respond
FormRequest:  rules() + authorize()
OrderService: stock check, totals, persistence — testable without HTTP
```

> [!TIP]
> The interview answer is one sentence: *the controller validates via a Form Request, delegates to a service, and returns a response — so each piece is testable on its own.* Then name the two pieces that make it true.

## 6. Interview Explanation

> A controller is the thin HTTP layer: it receives an already-validated request and returns a response. The seven resource methods match the seven CRUD routes; single-action invokable controllers cover actions that don't fit. Dependencies are injected by the container — type-hint a service and Laravel builds it. Validation lives in Form Requests, business logic in services and models, and the controller just orchestrates: `StoreOrderRequest`, `OrderService`, then `redirect()`. That separation is what makes each part testable and the controller replaceable.

That's the 30-second answer. The "why" is what earns the senior grade.

## 7. Senior-Level Insights

- **The controller is the least valuable line of code in the app** — and the most visible one. Everything it contains that *isn't* HTTP plumbing is logic that just became hard to test. Senior engineers move logic outward aggressively.
- **Form Requests are the underrated refactor.** `$request->validate()` in the action works — but a Form Request gives the validation a name, a home, and an `authorize()` that answers "may this user do this at all?" before any rule runs.
- **`validated()` is a contract, not a convenience.** `StoreOrderRequest $request` + `$request->validated()` means the controller only ever sees fields that passed the rules. An attacker can't smuggle `admin=1` past `$fillable`-driven `create()`.
- **Thin controllers make services first-class.** When an action grows past three steps, extract `OrderService::place()`. The service is then callable from a command, a job, or the queue (Lesson 124) — the controller was the only thing tying the logic to HTTP.
- **Invokable controllers scale naming.** Seven methods per resource is fine; a `ReportController` with `index`, `export`, `email`, `archive` isn't a resource anymore. One class per action keeps names honest and diffs small.

## 8. Common Mistakes

- **`Request $request` when a Form Request exists** — you get the raw request, validation is back in the controller, and the 422 response is gone.
- **Returning an Eloquent model from an action.** It "works" (serialized as JSON) and quietly skips the response contract — returning a `view()` or `json()` is explicit about what the client gets.
- **Forgetting `validated()`.** Using `$request->all()` re-admits fields the rules never allowed — the mass-assignment bypass from Lesson 115's fillable story.
- **Putting middleware in the constructor and routes both** — two copies of the gate to keep in sync.
- **Fat controllers "for now".** A 50-line `store()` is a debt that compounds: every future caller re-implements the same logic with slightly different bugs.
- **Type-hinting the concrete request in tests** — when the action expects `StoreOrderRequest`, test against the Form Request, not `Request`.

## 9. Best Practices

✅ Keep actions under ~10 lines: validate → delegate → respond

✅ Extract every Form Request with its own `rules()` and `authorize()`

✅ Delegate to services / models — the only testable home for logic

✅ Use `$request->validated()` — never `$request->all()` with a create/update

✅ Return `view()` / `json()` / `redirect()` / `response()` explicitly

✅ One controller per resource; invokable controllers for one-off actions

✅ Let the container inject dependencies — no `new` inside an action

❌ Don't compute, validate or persist inside the controller

❌ Don't mix `web` (view) and `api` (json) responses in one controller — split them

## 10. Interview Questions

**Q1. What does a controller do in Laravel?**

> It's the thin HTTP layer between a validated request and a response. Routes resolve to its actions, the container injects its dependencies, and it orchestrates: pass the request to a service or model, then return a `view()`, `json()` or `redirect()`. Business logic doesn't belong there — that's what makes controllers testable and replaceable.

**Q2. Why should controllers be thin?**

> Because every line of logic inside one is coupled to HTTP: it can't run in a CLI command, a queued job, or a test without a request object. Moving validation to a Form Request and business logic to a service makes each piece testable on its own and callable from anywhere — the controller just becomes the HTTP adapter.

**Q3. What are the seven resource methods?**

> `index`, `create`, `store`, `show`, `edit`, `update`, `destroy` — matching `GET /posts`, `GET /posts/create`, `POST /posts`, `GET /posts/{post}`, `GET /posts/{post}/edit`, `PUT/PATCH /posts/{post}`, `DELETE /posts/{post}`. `Route::resource()` registers all seven in one line.

**Q4. What is an invokable controller?**

> A controller with one action, `__invoke`. `Route::get('/search', SearchPostsController::class)` needs no method name — the class itself is the action. It's for single-use actions that don't fit the seven resource methods.

**Q5. How does dependency injection work in controllers?**

> Laravel's container resolves the action's and constructor's type-hints. Type-hint `OrderService $orders` and the container constructs it and injects it — I never call `new`. That's the same container from Lesson 108 doing resolution at the moment the route runs.

**Q6. How do you validate a request in a controller?**

> Preferably with a Form Request: `public function store(StoreOrderRequest $request)` — the rules live in the request class, `authorize()` gates who may call, and validation failures return a 422 before the controller runs. Inside, `$request->validated()` returns only the fields that passed.

**Q7. What can a controller return?**

> Anything the response factory understands: `view()`, `response()->json(...)`, `redirect()->route(...)`, `back()`, `abort(404)`, a streamed or downloaded file, and any `Response` object. Returning a model works but skips the explicit contract.

**Senior follow-up: Your `store()` action just passed 80 lines. Walk me through the refactor.**

> First, validation out: a `StoreOrderRequest` with `rules()` and `authorize()`, so the action can't even run on bad input. Then business logic out: an `OrderService::place($user, $validated)` that owns stock checks, totals and persistence — now callable from a queued job or a command. The controller becomes `store(StoreOrderRequest $request, OrderService $orders) { $order = $orders->place(...); return redirect()->route('orders.show', $order); }`. Each piece is independently testable, and the HTTP layer is nearly a no-op.

## 11. Follow-up Questions

**What's the difference between `Request $request` and a Form Request?**

> `Request` is the raw incoming request — no rules attached. A Form Request extends it and adds `rules()` and `authorize()`: it *is* the validation step, injected where the action runs. The action sees only valid data.

**What does `authorize()` do, and when does it run?**

> It answers "may this user perform this action?" before any rules run. Returning `false` produces a 403 — the Form Request version of Lesson 112's admin gate, scoped to one action instead of a route group.

**Should controller methods return JSON or views?**

> Depends which group the route is in. `web` routes return views (the HTML lives in Blade, Lesson 114); `api` routes return `response()->json(...)`. Mixing both in one controller confuses the contract — split the controllers.

## 12. Comparison Table

| | Fat controller | Thin controller + Form Request + service |
|---|---|---|
| Validation | `$request->validate()` inline | `rules()` + `authorize()` in a Form Request |
| Business logic | in the action | in a service, model or job |
| Testability | needs HTTP + a browser | each piece standalone |
| Reuse | none — HTTP-bound | CLI, queue, tests reuse the service |
| Change impact | one 50-line action | three small, isolated files |

| | Resource controller | Invokable controller |
|---|---|---|
| Methods | seven, fixed | one, `__invoke` |
| Use | CRUD on one resource | single actions, searches, reports |
| Route | `Route::resource('posts', …)` | `Route::get('/search', SearchPostsController::class)` |

## 13. Code Example

The store flow end to end — Form Request, thin controller, responses:

```php
// app/Http/Requests/StorePostRequest.php
class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;                     // any signed-in user may post
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:120',
            'body'  => 'required|string',
        ];
    }
}
```

```php
// app/Http/Controllers/PostController.php
use App\Http\Requests\StorePostRequest;

class PostController extends Controller
{
    public function store(StorePostRequest $request)
    {
        $post = Post::create($request->validated());

        return redirect()->route('posts.show', $post)
            ->with('status', 'Post published!');
    }

    public function index()
    {
        return response()->json(Post::latest()->paginate(15));
    }
}
```

What the client sees:

```text
POST /posts            (valid)        → 302 → /posts/42  (flash: "Post published!")
POST /posts            (invalid)      → 422 {"message":"The title field is required.",
                                                "errors":{"title":["The title field is required."]}}
GET  /api/posts        (api route)    → 200 {"data":[...],"meta":{"current_page":1,...}}
GET  /posts/42         (resource)     → the posts.show Blade view (Lesson 114)
```

```narrate
4:   authorize() gates the action before any rule runs — 403 when it returns false
9-12: rules() is the whole validation contract; $request->validated() only sees these
18:  the Form Request is type-hinted, so validation runs before the body executes
20:  validated() → only fields that passed the rules reach create()
22:  a redirect is still a response — with a session flash message
27:  a json() response for the api group: same action, explicit contract
```

## 14. Performance Notes

- **Validation cost is per-request.** Form Requests run `authorize()` then `rules()` on every hit. Keep rules cheap — heavy uniqueness checks hit the database (a round-trip per rule); combine and cache where possible.
- **`paginate()` is one query plus a count.** On a large table that count is real work — Lesson 117 covers why it's a favourite senior question, and Lesson 118 the alternatives.
- **Redirects are cheap; the flash store isn't free.** `->with('status', ...)` writes to the session, which writes to its driver. Fine per request — don't flash large payloads.
- **Blade views compile and cache** (Lesson 114) — the first render compiles, subsequent ones read the cache. `view:cache` warms it at deploy.
- **The controller itself is the cheapest part.** It should barely exist — the cost lives in what it calls. If profiling shows a fat controller, the fix is moving logic, not caching the controller.

## 15. Debugging Scenarios

| Symptom | Cause | Fix |
|---|---|---|
| Validation errors ignored, action runs on bad data | `Request` type-hint instead of the Form Request | change the signature to `StorePostRequest $request` |
| 403 that "shouldn't happen" | `authorize()` returns false for this user/role | check the policy condition and the user's role |
| `$request->validated()` is empty | rules don't include the submitted field names | confirm the keys in `rules()` match the input names |
| `Unresolvable dependency` in a controller | the type-hinted class isn't in the container | bind it in a service provider, or make it `readonly`-constructible |
| Models serialized oddly as JSON | returning the model, not `response()->json()` | return an explicit response with the right shape |

## 16. Quick Revision Notes

- Controller = thin HTTP layer: validated request in, response out
- Seven resource methods: `index create store show edit update destroy`
- Invokable: `__invoke()`; the class is the action
- DI: the container resolves action and constructor type-hints (Lesson 108)
- Form Request: `authorize()` + `rules()`; action only sees `validated()`
- Responses: `view()`, `response()->json()`, `redirect()->route()`, `back()`, `abort()`, `response()->download()`
- Controller middleware: `$this->middleware('auth')->only([...])` in the constructor
- Fat controller = logic that can't be tested or reused; move it to services

## 17. Cheat Sheet

```text
Resource controller (Route::resource('posts', PostController::class)):
  index()  create()  store(Request)  show(Post)  edit(Post)  update(Request,Post)  destroy(Post)

Invokable:  Route::get('/search', SearchPostsController::class);
            class SearchPostsController { public function __invoke(Request $r) {...} }

DI:         public function store(StoreOrderRequest $request, OrderService $orders)
            public function __construct(private readonly OrderService $orders)

Middleware: $this->middleware('auth')->only(['index']);  →()->except(['index']);

Responses:
  view('posts.show', ['post' => $post])
  response()->json(['ok' => true], 201)
  redirect()->route('posts.show', $post)->with('status', 'Saved')
  back()->withErrors([...]);   abort(403);   response()->download($path)

Form Request:
  class StorePostRequest extends FormRequest {
      public function authorize(): bool { ... }
      public function rules(): array  { ... }
  }
  // always: $request->validated()
```

## 18. Key Takeaways

> [!RECAP]
> - The controller is the thin HTTP layer: validated request in, explicit response out
> - Seven resource methods ↔ seven CRUD routes; invokable controllers for single actions
> - The container injects dependencies — controllers never call `new`
> - Form Requests own `rules()` and `authorize()`; the action only sees `validated()`
> - Business logic belongs in services, models and jobs — the controller orchestrates
> - `view()`, `json()`, `redirect()` and the `response()` factory cover every response
> - Fat controllers are the #1 code smell in Laravel interviews — and the fix is always the same

## Check your understanding

Answer these without looking back.

1. List the seven resource methods and the HTTP verb + URL each one answers.
2. Write an invokable controller and the route that registers it.
3. How does a controller get its `OrderService` — and what would you do if the service needed configuration?
4. What does `authorize()` gate, and what status does a `false` produce?
5. Write a `store` action that validates via `StorePostRequest`, delegates to a service, and redirects.
6. Your action sees unvalidated data despite a Form Request in the signature. What's the likely cause?
7. Name three response types and the status code each produces.

## What's Next

**Lesson 114 — Blade.** Templates, components, slots, and the escaping rule that keeps XSS
out — how those thin controllers actually render their views.
