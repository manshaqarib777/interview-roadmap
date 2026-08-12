# Topic 57 — Laravel Macros

**Checklist anchor:** collection macros · response macros · custom macros · when useful vs confusing

**Owning lesson:** [130 Service Layer, Repositories & SOLID](../130-solid-patterns.md)

---

## The one-sentence answer

**A macro adds a method to a framework class — `Collection`, `Response`, `Request`, `Str`, `Arr` — from your code, so you extend built-ins without subclassing or editing the framework.**

## The mental model

```php
// somewhere in a provider's boot():
Collection::macro('toUpper', fn () => $this->map(fn ($item) => strtoupper($item)));

// then everywhere:
collect(['a', 'b'])->toUpper();   // ['A', 'B']
```

The macro is **your method grafted onto the framework class**. Inside the closure, `$this` is the instance you called it on — a collection, a response, a request. The framework classes ship a `Macroable` trait that makes this possible; macros are how you extend them without inheritance.

## How it works

### The three common macro homes

```php
// 1. Collection macros — reusable transforms
Collection::macro('toCents', function () {
    return $this->map(fn ($amount) => (int) round($amount * 100));
});

// 2. Response macros — named response shapes
Response::macro('apiError', function (string $message, int $status = 400) {
    return response()->json(['message' => $message, 'errors' => (object) []], $status);
});
// usage: response()->apiError('Invalid request', 422);

// 3. Request macros — reusable input reads
Request::macro('sortableColumn', function (array $whitelist) {
    return in_array($this->input('sort'), $whitelist) ? $this->input('sort') : $whitelist[0];
});
```

Also common: `Str::macro`, `Arr::macro`, `Route::macro`.

### Where they're registered

```php
// AppServiceProvider::boot() — one home for app macros:
public function boot(): void
{
    Collection::macro('toCents', fn () => $this->map(fn ($a) => (int) round($a * 100)));
    Response::macro('apiError', function (string $message, int $status = 400) {
        return response()->json(['message' => $message, 'errors' => (object) []], $status);
    });
}
```

## When they're useful — and when they confuse (the checklist's question)

### Useful when

| Use | Example |
|---|---|
| A transform is used **many places** | `collect($prices)->toCents()` across the app |
| A response shape is **repeated** | `response()->apiError(...)` in every catch |
| The method belongs **to the class's vocabulary** | `$request->sortableColumn($whitelist)` reads like the framework |
| Testing benefits | One definition, many assertions against it |

### Confusing when

| Trap | Why |
|---|---|
| **Hiding logic** — a macro with 50 lines of business logic | It's a service in disguise; callers can't see the dependency |
| **Scattered definitions** — macros in every provider | No single home; "where did `toCents` come from?" |
| **Naming collisions** — a macro that shadows a future framework method | Upgrading Laravel silently breaks it |
| **Testing blind spots** — the macro is untested | It's app code; it needs tests like any other |

**The senior rule:** a macro is for **syntax sugar over a repeated shape** — short, obvious, single-responsibility. The moment a macro grows logic, dependencies, or ambiguity about where it lives, it's a service or a helper method, not a macro.

## Macro vs the alternatives

| | Macro | Service | Helper method / own class |
|---|---|---|---|
| Where it lives | On the framework class | Injected, explicit | Your own code |
| Readability | `$items->toCents()` | `$this->prices->toCents($items)` | `Price::toCents($items)` |
| Dependency visibility | Hidden (no constructor) | Declared (constructor) | Declared (arguments) |
| Best for | Tiny repeated transforms/shapes | Real logic | Anything with state |

## Interview questions

**Q1. What are Laravel macros?**
> A way to add methods to framework classes from your code. `Collection::macro('toCents', fn () => ...)` makes `collect($x)->toCents()` available everywhere. The framework classes are `Macroable`; inside the closure, `$this` is the instance. Common homes: Collection, Response, Request, Str, Arr.

**Q2. What are the common uses?**
> Collection macros for repeated transforms, Response macros for consistent API shapes (`response()->apiError(...)`), and Request macros for repeated input reads. They turn a repeated two-line pattern into a named framework-idiomatic call.

**Q3. When do they become confusing?**
> When they grow past sugar — business logic hidden in a macro, definitions scattered across providers, or a name that collides with the framework. A macro with a dependency or 50 lines isn't a macro, it's a service wearing a disguise. The senior rule: short, obvious, single-responsibility, registered in one place.

**Q4. Macro vs service?**
> A macro is sugar over a repeated shape — tiny, stateless, framework-idiomatic (`$items->toCents()`). A service is explicit logic with declared dependencies (Lesson 53). The test: can the macro's body fit on a few obvious lines? Then it's a macro. Anything with real logic or dependencies belongs in a service.

**Q5. Where should macros be registered?**
> In one provider's `boot()` — typically `AppServiceProvider` — so there's a single home. Scattered registration is the "where did this come from?" trap. And they should be tested like app code: a macro that breaks silently breaks every caller.

**Senior follow-up: Would you macro or build a class for a repeated response shape?**
> Depends on scope. A one-line shape — `response()->apiError($message, $status)` — is a fine macro: it reads like the framework and centralizes the envelope. The moment the shape carries logic (conditional fields, context-aware statuses), it becomes an API Resource (Lesson 24) or a dedicated response class. The line is: sugar for the shape, code for the logic.

## Common mistakes

❌ Macros with business logic — a service in disguise (Lesson 53).

❌ Registering macros in several providers — no single home.

❌ Untested macros — app code is app code; test it.

❌ Shadowing framework method names — an upgrade silently breaks.

## Quick revision notes

- Macro = **your method on a framework class** — `$this` is the instance
- Homes: **Collection** (transforms) · **Response** (shapes) · **Request** (input reads) · Str/Arr
- Register in **one provider's `boot()`**
- Useful: **tiny repeated sugar** · Confusing: **logic, scattered, colliding**
- Macro = sugar · Service = logic — know the line

## Check your understanding

1. What makes a method a macro instead of a helper?
2. Name three framework classes you can macro.
3. When does a macro stop being a macro?
4. Where should macros live, and why?
5. Macro vs service — what's the deciding question?
