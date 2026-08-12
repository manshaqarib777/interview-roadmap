# Topic 16 — Validation

**Checklist anchor:** `$request->validate()` · Form Requests · custom rules · conditional · nested · custom messages · `authorize()` + `rules()`

**Owning lesson:** [121 Validation & Form Requests](../121-validation.md)

---

## The one-sentence answer

**Validation is the gatekeeper between untrusted input and your application — every request is validated at the boundary, before a line of business logic runs.**

## The mental model

Input arrives untrusted — from forms, APIs, JSON, anything. Validation is the **filter at the door**:

```text
raw request
    │
    ▼
VALIDATE ── fail ──► 422 + field errors (Laravel does this for you)
    │
    ▼ pass
validated data ──► controller / service (only safe values from here on)
```

Laravel's shape is `$request->validate([rules])` or a Form Request class. Both produce a **422 with structured field errors** on failure — the frontend renders them, no controller code runs.

## How it works

### The inline form

```php
public function store(Request $request)
{
    $validated = $request->validate([
        'title' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'unique:users,email'],
        'items' => ['required', 'array', 'min:1'],
        'items.*.id' => ['required', 'exists:products,id'],   // nested
    ]);

    // $validated is safe — use it, never $request->all()
}
```

### Form Requests — the senior shape

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
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ];
    }

    public function messages(): array
    {
        return ['items.*.quantity.max' => 'No more than 99 per item.'];
    }
}
```

The controller takes the request, and the request is **already validated and authorized**:

```php
public function store(StoreOrderRequest $request)
{
    Order::create($request->validated());
}
```

`authorize()` gates who may submit; `rules()` gates what's valid. Both run before the controller.

### Conditional validation

```php
'email' => ['required_if:account_type,pro', 'email'],
// or with Rule::when / sometimes:
$request->validate([
    'coupon' => ['sometimes', 'string'],
]);
```

`sometimes` skips validation when the field is absent; `required_if` makes a field required only under a condition.

### Custom rules

```php
// inline closure
'username' => [Rule::unique('users')->ignore($user->id), fn ($a, $v, $fail) => ...],

// a dedicated rule class
php artisan make:rule ValidCoupon
// implements passes() and message(), can inject services
```

### Authorization inside Form Requests

The `authorize()` method is the same as a policy check — if it returns false, the request is rejected with **403** before validation even matters. Form requests are the clean home for both.

## The plain-JS model (what the exercise does)

```js
function validate(data, rules) {
  const errors = {};
  for (const [field, checks] of Object.entries(rules)) {
    for (const check of checks) {
      const err = check(data[field]);
      if (err) { errors[field] = err; break; }   // first failure per field
    }
  }
  return Object.keys(errors).length ? { errors } : { valid: true };
}
```

## Interview questions

**Q1. What happens when validation fails?**
> Laravel throws a `ValidationException` with the field errors. For a web request, it redirects back with the errors flashed (and old input); for an API request, it returns **422 Unprocessable Entity** with a JSON errors object. The controller never runs — the request is stopped at the gate.

**Q2. Form Request vs `$request->validate()`?**
> `$request->validate()` is the quick inline form. A Form Request is a class with `rules()`, `authorize()`, `messages()`, and custom logic — the right choice when validation is reused, is more than a few rules, or carries authorization. The controller signature `store(StoreOrderRequest $request)` makes the boundary explicit.

**Q3. What does `authorize()` do in a Form Request?**
> It's the authorization gate for the request — typically `$this->user()->can('create', Order::class)`. Returning false yields a 403 before validation. It keeps authorization next to the validation it protects, so the controller stays thin.

**Q4. How do you validate nested data?**
> With dot notation: `'items.*.id' => 'exists:products,id'`, `'items.*.quantity' => 'integer|min:1'`. The `*` wildcard applies the rule to every element. Errors come back keyed `items.2.quantity`, which frontends render against the matching field.

**Q5. What is conditional validation?**
> Rules that only apply under conditions — `required_if:account_type,pro`, `sometimes` (only if present), or `Rule::when($condition, [...])`. Use them so a single rule set serves multiple paths instead of duplicating validation.

**Senior follow-up: Where should validation live in a service-layer architecture?**
> At the boundary — the Form Request (or an API validation in the controller). Services assume their inputs are already valid; that keeps services callable from commands, jobs, and tests without re-validating, and keeps the validation contract visible at the HTTP edge. The rule: validate at the door, trust the data inside.

## Common mistakes

❌ Using `$request->all()` in the controller — validated data comes from `$request->validated()`.

❌ Validating inside services — the service should assume valid input (validated at the boundary).

❌ Business rules as ad-hoc `if` checks scattered in controllers — put them in rules or a Form Request.

❌ Raw-outputting validation messages without escaping — the errors are user-influenced (Lesson 37).

## Quick revision notes

- Validate **at the boundary**; the controller only ever sees `validated()`
- `$request->validate()` = inline · **Form Request** = reusable + `authorize()` + `messages()`
- Failure = **422 + field errors** (API) / redirect + errors (web)
- Nested: `items.*.id` · Conditional: `sometimes`, `required_if`, `Rule::when`
- `authorize()` gates **403** before validation — request-level authz

## Check your understanding

1. What does Laravel return on validation failure for web vs API?
2. When do you reach for a Form Request over inline validation?
3. How does `authorize()` interact with `rules()`?
4. Write the nested rule for an array of items with quantity.
5. Why should services assume validated input?
