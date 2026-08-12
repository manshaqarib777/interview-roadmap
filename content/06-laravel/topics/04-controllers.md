# Topic 4 — Controllers

**Checklist anchor:** resource controllers · single-action · dependency injection · controller middleware · form requests · invokable controllers · separation of concerns

**Owning lesson:** [113 Controllers, Requests & Responses](../113-controllers.md)

---

## The one-sentence answer

**A controller is the traffic cop between HTTP and your application — it takes the request, validates it, calls a service or model, and returns a response, without containing business logic itself.**

## The mental model

The controller is the **thinnest layer in the stack**. Its whole job:

```text
HTTP request
    │
    ▼
Controller  ── validate ──► call a service/model ──► return a Response
    │
    ▼
(no business logic here — that lives in services and models)
```

The "fat controller" anti-pattern the checklist warns about:

```text
Controller
 ↓
50 lines business logic
 ↓
Database
 ↓
Email
 ↓
Payment
```

...is a controller trying to be the whole app. It couples the logic to HTTP, makes it untestable outside a request, and guarantees duplication. The fix is **separation of concerns**: controllers coordinate, services do the work, models hold the data.

## How it works

### Resource controllers — the seven actions

```php
Route::resource('posts', PostController::class);
// index, create, store, show, edit, update, destroy

class PostController extends Controller
{
    public function index() { return Post::all(); }
    public function store(StorePostRequest $request) { /* create */ }
    public function show(Post $post) { return $post; }       // model binding
    public function update(UpdatePostRequest $request, Post $post) { }
    public function destroy(Post $post) { /* delete */ }
}
```

### Single-action (invokable) controllers

```php
Route::get('/newsletter/preview', SendNewsletterPreview::class);

class SendNewsletterPreview
{
    public function __invoke(Request $request) { /* one job */ }
}
```

Use when a route needs exactly **one action** — no REST shape, just a single job.

### Dependency injection

```php
class OrderController extends Controller
{
    public function __construct(
        private OrderService $orders,        // injected by the container
        private Mailer $mailer,
    ) {}

    public function store(StoreOrderRequest $request)
    {
        $order = $this->orders->create($request->validated());
        return redirect()->route('orders.show', $order);
    }
}
```

### Form requests — validation + authorization moved out

```php
class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Order::class);
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'exists:products,id'],
        ];
    }
}
```

The controller's `store(StoreOrderRequest $request)` receives an **already-validated, already-authorized** request — `$request->validated()` is safe data. That's validation (Lesson 121) and authorization (Lesson 123) out of the controller entirely.

### Controller middleware

```php
class PostController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth')->except(['index', 'show']);
    }
}
```

## Interview questions

**Q1. What is a resource controller?**
> A controller with the seven standard REST actions — index, create, store, show, edit, update, destroy — wired by one `Route::resource()` line. It gives CRUD a consistent shape: same method names, same route names, same URLs, every time. `apiResource` drops the two view routes for API-only.

**Q2. What is an invokable controller?**
> A single-action controller with just `__invoke()`. Use it when a route maps to exactly one job with no CRUD shape — a newsletter preview, an export, a redirect. It keeps one-job handlers from polluting a resource controller.

**Q3. How does dependency injection work in controllers?**
> The container resolves the controller and reads its constructor type-hints, building and injecting each dependency — services, mailers, repositories. Method injection works too: `show(Post $post)` gets the bound model. Controllers never `new` their dependencies; they declare them.

**Q4. What are form requests for?**
> They move validation and authorization out of the controller into a request class. `rules()` holds the validation, `authorize()` gates who may submit. The controller receives an already-validated, already-authorized request, so its body is just the happy path.

**Q5. Why shouldn't business logic live in controllers?**
> Controllers are the HTTP seam. Business logic — payments, inventory, email — belongs in services so it's independent of HTTP: testable without a request, reusable across controllers/commands/jobs, and not duplicated. A controller that "works" in Postman but can't be unit-tested is a symptom of the fat-controller anti-pattern.

**Senior follow-up: How thin is "thin", exactly?**
> Thin enough that the controller's body reads like an index: validate (via form request), call one service method, return the response — with no `if` trees about business rules. If a controller method grows past a few lines of orchestration, the logic is trying to escape into a service.

## Common mistakes

❌ The fat controller — 50 lines of logic, DB, email, payment in one method.

❌ Writing validation inline with `$request->validate()` when it's reused — extract a form request.

❌ Putting `new Service()` inside the controller instead of constructor injection.

❌ One route per custom action on a resource controller instead of an invokable or dedicated controller.

## Quick revision notes

- Controller = **traffic cop**: validate → call service → respond
- **Resource** = 7 standard actions · **Invokable** = one action (`__invoke`)
- **DI** in constructor + method injection (`Post $post`)
- **Form requests** = validation + authorization, out of the controller
- **Controller middleware** = route-level gates, `except`/`only`
- Business logic → **services**, not controllers

## Check your understanding

1. What are the seven resource actions, and what does `apiResource` drop?
2. When is an invokable controller the right call?
3. How does the container inject a controller's dependencies?
4. What exactly does a form request remove from the controller?
5. What's the sign a controller has gotten fat?
