# Lesson 121 — Validation & Form Requests

**Interview importance:** ⭐⭐⭐ — every backend round has one. Rules, custom rules,
`authorize()`, and validation inside Form Requests.

Validation is the first line of defence between your app and everything that hits it — and it
is also one of the most common senior-in-the-room filters, because the difference between a
junior and a senior answer is *where* the validation lives. The junior validates in the
controller; the senior reaches for a Form Request class. The interviewer is listening for
`authorize()` — because authorization inside the form request is how you keep the controller
thin and the rules next to the thing they describe.

## Learning Objectives

By the end of this lesson you should be able to:

- Validate an incoming request with `$request->validate()` and read the resulting 422 + error bag
- Move that same logic into a Form Request with `rules()` and `authorize()`
- Write the common rules from memory (`required`, `email`, `unique:users`, `exists`, `min/max`, `confirmed`, `sometimes`, `nullable`)
- Write a custom rule with `Rule::custom` (the `passes()`/`message()` object) and attach custom messages
- Handle `sometimes` and `nullable`, nested array validation, and conditional validation
- Describe the 422 JSON shape that an API client receives

## 1. What is Validation?

**Validation is the process of rejecting a request before your business logic runs, based on a declarative list of rules for each field.**

It answers one question: *is this input safe and well-formed enough to trust?* Laravel runs
your rules and collects every failure at once, instead of bailing on the first error. That
batching is the whole UX difference — the user fixes ten problems in one submit, not ten.

## 2. Mental Model

Validation is a **filter at the gate**, not a check scattered through the handler.

Picture a form as a queue of papers (fields) arriving at a desk. The rules are the clerk who
reads each paper and stamps it **PASS** or **FAIL**. Every failed paper goes into one tray —
the **error bag** — and the clerk sends the whole tray back at once. Only papers that pass
every check reach the desk (your controller). The controller never sees a bad paper, so it
never has to wonder whether the data is safe.

## 3. Visual Flow

```text
 request body
      │
      ▼
 ┌─────────────┐   run every rule on every field
 │  validator  │   (collect ALL failures — do not stop at the first)
 └──────┬──────┘
        │
    ┌───┴───┐
    ▼       ▼
  fail     pass
    │       │
    ▼       ▼
  422     controller
 errors   uses $request->validated()
    │
    ▼
 error bag → rendered back into the form (or JSON for APIs)
```

## 4. How It Works

The simplest form — inline validation in the controller:

```php
public function store(Request $request)
{
    $validated = $request->validate([
        'name'  => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'unique:users,email'],
        'password' => ['required', 'string', 'min:8', 'confirmed'],
    ]);

    User::create($validated);   // only validated data, ever
}
```

What the client receives on failure:

```text
Status: 422 Unprocessable Content
{ "message": "The name field is required. (and 2 more errors)",
  "errors": {
    "name":     ["The name field is required."],
    "email":    ["The email has already been taken."],
    "password": ["The password confirmation does not match."]
  } }
```

For a browser request (no `Accept: application/json`), the same 422 redirects back to the
previous page and Laravel flashes the errors into the session. In a Blade view you read them
with `$errors` — the **error bag**:

```blade
@error('email')
    <span class="text-red-500">{{ $message }}</span>
@enderror
```

> [!TIP]
> Pass **arrays of rules** (`['required', 'max:255']`), not pipes (`'required|max:255'`).
> Arrays are the documented style, compose cleanly with `Rule::…` objects, and never break on
> a pipe character inside a rule's value.

## 5. Real Project Usage

| Where | What it guards | Typical rules |
|---|---|---|
| **Registration** | Identity rows | `required`, `email`, `unique:users`, `confirmed`, `min:8` |
| **Profiles / settings** | Optional fields | `sometimes`, `nullable`, `string`, `max` |
| **Nested payloads** | Arrays from the client | `array`, `*.name`, `*.quantity` with `min:1` |
| **API resources** | Machine clients | same rules, but the 422 is JSON and *never* redirects |
| **Import / bulk endpoints** | Rows in a batch | `required`, `array`, `between:1,1000` on the top level |

The single most common production mistake this prevents: `unique:users,email` without it,
two rows with the same email quietly appear and every "login with email" breaks forever.

## 6. Interview Explanation

> I validate with `$request->validate()` for one-off routes, and move anything reused into a
> Form Request class — the `rules()` method declares what's allowed, and `authorize()` decides
> who may submit it. Rules are an array per field: `required`, `email`, `unique:users,email`,
> `min:8`, `confirmed`. Failures come back as a single 422 with an `errors` object keyed by
> field, and for browser requests the errors are flashed into the session error bag.
>
> For anything non-standard I write a custom rule — an object with `passes()` and `message()`
> — or use the newer `Rule::custom` closure. And I always build from `$request->validated()`
> so only checked data ever reaches the model.

## 7. Senior-Level Insights

- **`authorize()` is the part people forget.** A Form Request's `authorize()` runs *before*
  `rules()`. Returning `false` gives a plain 403 — no validation messages, no information
  leak. Authorization inside the request is the difference between "I know validation" and "I
  keep my controllers thin".
- **`unique:users,email` ignores the current row by default.** On `update`, the user's own row
  fails the rule — the classic "can't save my own profile" bug. The fix is `Rule::unique('users')->ignore($user->id)`, or `ignore($user)` when a route-model-bound model is present.
- **`sometimes` vs `nullable` are different.** `sometimes` means *validate only if present*;
  `nullable` means *present-but-empty is allowed*. For an optional update field you almost
  always want `['sometimes', 'nullable', 'string']` — or `'sometimes'` alone when the rule
  list should be skipped entirely for absent fields.
- **Validation is the cheap outer layer, not the whole defence.** Rules stop garbage; they
  don't stop a malicious-but-well-formed payload. Sanitisation, policy checks (Lesson 123) and
  escaping at render time are separate layers. A custom rule is exactly the right place for
  domain constraints that SQL and HTML can't express.
- **Rate limiting (Lesson 128) sits in front of validation.** Attackers hammering the login
  form with guesses should be throttled before your validator spends any work on them.

## 8. Common Mistakes

❌ Using `confirmed` without a `_confirmation` field — `confirmed` checks `field_confirmation`
by definition, and silently passes when the second field is missing:

```php
'password' => ['required', 'confirmed'],   // needs password_confirmation in the request
```

❌ Forgetting `sometimes` on update routes, so an absent optional field fails `required`:

```php
'bio' => ['string', 'max:1000'],   // ❌ absent field is fine, but "max" on null errors too
```

```php
'bio' => ['sometimes', 'nullable', 'string', 'max:1000'],   // ✅
```

❌ Writing `unique` without the table (defaults to the *route param name*) or forgetting to
ignore the current row on updates.

❌ Putting business rules in the controller instead of a Form Request, so the same rules get
re-written three times in three controllers.

## 9. Best Practices

✅ Build from `$request->validated()` — never from the raw `$request->all()`

✅ Use rule **arrays**; keep the pipe syntax only for old code

✅ One Form Request per resource action (`StoreUserRequest`, `UpdateUserRequest`), with
`authorize()` returning the relevant policy check

✅ Name custom messages per-field (`'email.required' => '…'`) rather than rewriting Laravel's

✅ `sometimes` for optional fields, `nullable` for empty-is-OK fields

✅ Custom rules as invokable classes or `Rule::custom` closures — keep them small and testable

❌ Don't validate in the model layer — models `fill()` from validated arrays and stay dumb

## 10. Interview Questions

**Q1. How do you validate input in Laravel?**

> `$request->validate([...])` returns only the validated data — I pass an array of rules keyed
> by field, and on failure Laravel responds with a 422 and an errors bag. For anything reused
> or non-trivial, I extract a Form Request class.

**Q2. What is a Form Request and when do you use one?**

> A Form Request is a class that encapsulates the rules and the authorization for one
> endpoint. Its `rules()` method returns the validation array, and `authorize()` decides
> whether the current user may submit the request at all. I use one whenever the same field
> set is validated in more than one place, or when the request needs a policy check — it keeps
> controllers thin.

**Q3. What does `unique:users,email` actually do?**

> It runs a query against the `users` table's `email` column and fails if the value already
> exists. On updates you must chain `->ignore($user->id)`, or the user's own row will fail the
> rule. The underlying query is a `SELECT count(*)` — a cheap existence check, not a fetch.

**Q4. Difference between `sometimes` and `nullable`?**

> `sometimes` means "only run these rules if the field is present in the request". `nullable`
> means "an explicitly empty value is acceptable". For an optional profile field you usually
> want both — `['sometimes', 'nullable', 'string', 'max:255']`.

**Q5. How do you write a custom validation rule?**

> A class implementing `ValidationRule` with a `passes($attribute, $value)` method and a
> `message()`, or the closure form `Rule::custom(fn ($attribute, $value, $fail) => ...)`.
> Either way, the rule is just another entry in the field's rule array.

**Q6. How does validation behave differently for APIs?**

> The validator looks at the request's `Accept` header. For JSON requests it returns a 422
> with `{ "message": ..., "errors": { field: [messages] } }`. For browser requests it
> redirects back with the errors flashed into the session error bag.

**Senior follow-up: Where do you draw the line between `$request->validate()` and a Form Request?**

> One-off endpoints get inline validation. The moment a rule set is duplicated, or the request
> needs an authorization check, or the rules grow past ~10 lines, I extract a Form Request.
> The class is also the natural unit to unit-test — `assertValid()` and `assertInvalid()` on
> the rules without touching a controller.

## 11. Follow-up Questions

**How do you validate nested arrays?**

> With dot notation into the array's `*` wildcard: `'items' => ['required', 'array']`,
> `'items.*.sku' => ['required', 'string']`, `'items.*.qty' => ['required', 'integer', 'min:1']`.
> On failure, the error keys come back dotted — `items.0.sku` — so the client can map them
> back onto the form.

**Can you validate conditionally, based on another field?**

> Yes — `required_if:field,value`, `required_unless`, `required_with` / `required_without`, or
> the closure form `Rule::when($request->type === 'card', ['required', 'digits:16'])`. For
> anything non-trivial, the closure keeps the condition readable.

**What are custom messages for?**

> To replace Laravel's default copy per field-rule pair: `'email.required' => 'An email is needed.'`
> and a catch-all `'required' => 'The :attribute field is required.'`. Defaults are fine for
> internal tools; customer-facing copy almost always needs custom messages.

## 12. Comparison Table

| | Inline `validate()` | Form Request |
|---|---|---|
| Where the rules live | Controller | Own class |
| `authorize()` check | Manual / forgotten | Built-in, runs before `rules()` |
| Reuse across routes | Copy-paste | `type-hint` the class in the method |
| Testability | Via feature test hitting the route | Unit-test `rules()` directly |
| When to use | One-off endpoints | Duplicated rules, policy checks, anything complex |

| Rule | What it checks |
|---|---|
| `required` | Field present and not empty |
| `email` | Valid email format |
| `unique:table,col` | Value absent from the table (add `->ignore($id)` on updates) |
| `exists:table,col` | Value *present* in the table |
| `min:n` / `max:n` | Length (strings/arrays/files) or numeric bound |
| `confirmed` | Matches `field_confirmation` |
| `sometimes` | Rules run only if the field is present |
| `nullable` | Explicit empty values allowed |

## 13. Code Example

A complete registration Form Request — authorization *and* rules in one place:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        // false → 403, before any rule runs
        return $this->user()?->can('create', User::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role'     => ['required', Rule::in(['admin', 'editor', 'member'])],
            'profile'  => ['sometimes', 'array'],
            'profile.bio' => ['sometimes', 'string', 'max:1000'],
            'coupon'   => ['nullable', Rule::custom(function ($attr, $value, $fail) {
                if (strlen($value) !== 8) {
                    $fail('The :attribute is not a valid coupon code.');
                }
            })],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'We need your email to create the account.',
            'role.in'        => 'Role must be admin, editor or member.',
        ];
    }
}
```

```narrate
line 10:  authorize() runs FIRST — a 403 here means rules() never even executes
line 17:  Rule::unique is the object form, easy to extend with ->ignore() later
line 21:  confirmed needs password_confirmation in the payload
line 25:  nested rule — profile.bio validated only when profile is present
line 27:  Rule::custom — a closure is enough for a one-off check
line 33:  per-field-rule message keys override Laravel's defaults
```

Controller side — the request is just type-hinted:

```php
public function store(StoreUserRequest $request)
{
    $user = User::create($request->validated());
    return redirect()->route('users.show', $user);
}
```

Behavior of the same request with three bad fields:

```text
POST /users  (Accept: application/json)
→ 422 Unprocessable Content
{ "message": "The name field is required. (and 2 more errors)",
  "errors": {
    "name":     ["The name field is required."],
    "email":    ["The email has already been taken."],
    "password": ["The password confirmation does not match."]
  } }

POST /users  (browser, invalid role)
→ 302 back to the form
   session errors: { "role": ["Role must be admin, editor or member."] }
```

## 14. Performance Notes

- **One query per `unique`/`exists` rule.** A form with five of them is five small `SELECT`
  existence checks per submit. Fine at normal volume; on a high-traffic registration endpoint
  it's a real cost — consider debouncing client-side and keeping the rule (correctness wins).
- **The `*` wildcard runs per element.** `items.*.qty` on a 1,000-row payload is 1,000
  min/max evaluations plus whatever the rule itself costs.
- **The validator is lazy.** `$request->validated()` triggers the run once; calling it twice
  re-validates. Cache it in a local if the controller uses it more than once.
- When validation *isn't* the bottleneck: it's microseconds per field. The cost worth
  worrying about is the queries the rules generate — not the rules themselves.

## 15. Debugging Scenarios

| Symptom | Cause | Fix |
|---|---|---|
| `422` but no `errors` key | Request came without `Accept: application/json`, so Laravel redirected instead | Send the JSON `Accept` header, or check the session bag in browser flow |
| "The email has already been taken" on your *own* update | `unique` not ignoring the current row | `Rule::unique('users')->ignore($this->user())` |
| `password confirmation does not match` with one field | `confirmed` needs `field_confirmation` present | Add `password_confirmation` to the form / payload |
| Optional field errors when absent | Rule like `max:255` runs on `null` | Add `sometimes` (skip) and `nullable` (allow empty) |
| 403 with no message | `authorize()` returned `false` | That's by design — check the policy, not the rules |
| Array errors keyed `items.0.sku` don't map to the form | Client expects the same dotted keys | Render the error by its dotted key, don't flatten |

## 16. Quick Revision Notes

- Validation = a **declarative rule list** per field; failures batch into one 422 + error bag
- `$request->validate()` returns **validated data only**; build models from it, never `all()`
- **Form Request** = `rules()` + `authorize()`; `authorize()` runs first, `false` → 403
- Common rules: `required`, `email`, `unique:users,email`, `exists`, `min/max`, `confirmed`,
  `sometimes`, `nullable`
- `unique` needs `->ignore($id)` on updates; `confirmed` needs the `_confirmation` field
- Custom rules: class with `passes()`/`message()`, or `Rule::custom(fn($a, $v, $fail) => …)`
- Conditional: `required_if`, `required_unless`, `Rule::when(...)`
- Nested: `items` + `items.*.sku` with dotted error keys
- Custom messages: `'email.required' => '…'` keys in `messages()`
- API 422 shape: `{ "message", "errors": { field: [msgs] } }`; browsers get a redirect + bag

## 17. Cheat Sheet

```text
Validate inline:
  $validated = $request->validate([
      'name' => ['required', 'string', 'max:255'],
      'email' => ['required', 'email', 'unique:users,email'],
  ]);

Form Request:
  php artisan make:request StoreUserRequest
  authorize() : bool          → 403 when false (runs before rules())
  rules()     : array         → the rule list
  messages()  : array         → 'field.rule' => 'custom copy'

Rules cheat:
  required | email | confirmed | nullable | sometimes
  min:n | max:n | between:a,b | in:a,b,c | array | integer | string
  unique:table,column,except,idColumn   (object form: Rule::unique('users')->ignore($id))
  exists:table,column                   (checks the value IS in the table)
  required_if:field,value | required_unless | required_with | required_without
  Rule::in([...]) | Rule::when($cond, [...]) | Rule::custom($closure)

Read the errors:
  $errors->first('email')          blade: @error('email') @enderror
  $validator->errors()             manual validator object
  422 JSON: { "message": "...", "errors": { field: [messages] } }
```

## 18. Key Takeaways

> [!RECAP]
> - Validation is a **declarative rule list**, not scattered `if` statements
> - `$request->validate()` returns only validated data — never build from `$request->all()`
> - **Form Requests** bundle `rules()` **and** `authorize()`; the 403 from `authorize()` runs first
> - Know the common rules cold: `required`, `email`, `unique`, `exists`, `min/max`, `confirmed`, `sometimes`, `nullable`
> - `unique` must `ignore()` the current row on updates; `confirmed` needs the `_confirmation` field
> - Custom logic lives in `Rule::custom` closures or `passes()`/`message()` classes
> - `sometimes` skips absent fields, `nullable` accepts empties — use both for optional data
> - Nested arrays validate via `items.*.field` and report dotted keys
> - APIs get a 422 JSON shape; browsers get a redirect + session error bag
> - Rules are the cheap outer layer — authorization (Lesson 123) is the next one

## Check your understanding

Answer these without looking back.

1. What HTTP status and JSON shape does failed validation return to an API client?
2. In a Form Request, which method runs first: `rules()` or `authorize()`? What does `authorize()` returning `false` produce?
3. Why does `unique:users,email` fail on your *own* update, and what's the fix?
4. What's the difference between `sometimes` and `nullable`? Write the rule list for an optional `bio` field.
5. What second field does `confirmed` require, and what happens if it's missing?
6. Write a custom rule that rejects a `coupon` shorter than 8 characters, using the closure form.
7. How do you validate a nested `items` array where each element needs a `qty` of at least 1?
8. Where do custom messages go, and what's the key format?

## What's Next

**Lesson 122 — Authentication.** Now that input is trusted, who is making the request?
Guards, sessions, Sanctum vs Passport vs Fortify — the "who are you?" half of the auth story.
