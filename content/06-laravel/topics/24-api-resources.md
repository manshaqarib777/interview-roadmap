# Topic 24 — API Resources

**Checklist anchor:** `UserResource::make($user)` · `UserResource::collection($users)` · why use them · resource vs model · conditional includes · standardized responses

**Owning lesson:** [133 Laravel API + Next.js & Payments](../133-api-nextjs-stripe.md)

---

## The one-sentence answer

**An API Resource is the transformation layer between a model and its JSON — it defines exactly what the client sees, so the API contract never leaks the model's internals.**

## The mental model

```text
Model (full row: id, name, email, password_hash, created_at, updated_at, ...)
   │  UserResource::make($user)
   ▼
{ "id": 7, "name": "Ada", "email": "ada@x.com", "links": {...} }
   │  the client sees ONLY this shape
```

Without a resource, `return $user;` serializes **everything** — including columns that must never ship (`password_hash`, internal flags). A resource is the **curator**: it picks the fields, formats them, and standardizes the shape.

## How it works

### The resource

```php
php artisan make:resource UserResource
```

```php
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'joined_at' => $this->created_at->toIso8601String(),
            'orders' => OrderResource::collection($this->whenLoaded('orders')),  // conditional
        ];
    }
}
```

### Using it

```php
UserResource::make($user);                        // one model → one JSON object
UserResource::collection($users);                 // many → { "data": [...] }
```

### Resource vs model (the checklist's question)

| | Model serialized raw | API Resource |
|---|---|---|
| What ships | Every attribute | Only what you declare |
| Shape control | None (DB columns) | You define it |
| Formatting | Raw DB values | `toIso8601String()`, computed fields |
| Hidden columns | `$hidden` (a leak waiting to happen) | Not even considered |
| Relations | Whatever eager-loaded + exposed | Explicit, conditional |
| The point | The row | The **contract** |

A resource answers "what does the client need?" — the model answers "what's in the table?" Those are different questions, and only the resource knows the first.

### Conditional includes (relationships)

```php
'orders' => OrderResource::collection($this->whenLoaded('orders')),
// ships ONLY if the relationship was eager-loaded:
//   User::with('orders')->get()  →  orders included
//   User::get()                  →  orders omitted

'is_admin' => $this->when($this->is_admin, true),
// conditional on a value

'secret' => $this->when($request->user()->can('view-secrets', $this->resource), ...),
// conditional on authorization
```

### Standardizing responses

```php
// every resource follows the same shape:
{ "data": {...} }          // single
{ "data": [...], "links": {...}, "meta": {...} }   // collection (paginated)
```

Pagination with resources keeps the `data` key stable while `links`/`meta` carry the page info — the client parses one envelope for every endpoint.

## Interview questions

**Q1. Why use API Resources?**
> To control the API contract. A resource declares exactly what the client sees — fields, formats, computed values — instead of serializing the model's every attribute (including `password_hash` and internal flags). It's the transformation layer between "the row" and "what the client needs."

**Q2. Resource vs model?**
> A model is the database row with all its attributes. A resource is the *presentation* of that row — the curated JSON shape. Raw model serialization leaks columns and formats; the resource picks and formats deliberately. The senior distinction: the model answers "what's in the table," the resource answers "what does the client get?"

**Q3. How do you conditionally include relationships?**
> `'orders' => OrderResource::collection($this->whenLoaded('orders'))` — the relationship ships only if it was eager-loaded (`with('orders')`). That keeps the payload honest: unloaded relations are omitted, loaded ones are included, no extra queries and no missing keys.

**Q4. How do you standardize API responses?**
> Every endpoint returns through a resource: `{ "data": {...} }` for one, `{ "data": [...], "links", "meta" }` for collections. Nested relations are resources too (`OrderResource` inside `UserResource`), so the whole payload follows one shape. Clients parse one envelope.

**Q5. What's `make()` vs `collection()`?**
> `UserResource::make($user)` wraps a single model; `UserResource::collection($users)` wraps a collection — returning `{ "data": [...] }`. Both funnel through the same `toArray`, so single and list responses are consistent.

**Senior follow-up: When does a resource become overkill?**
> For a tiny internal API where "return the row" is fine — a resource adds ceremony with no contract to protect. But the moment the API is consumed externally, or a field must never ship, the resource is the enforcement point. The senior rule: resources at the API boundary, kept thin — transformation only, no business logic.

## Common mistakes

❌ Returning the model raw — leaking columns and inconsistent shapes.

❌ Business logic inside resources — they're transformation, not services (Lesson 53).

❌ Always-including relationships — load lazily or omit; `whenLoaded` is the tool.

❌ Formatting in the frontend — ISO dates and computed fields belong in the resource.

## Quick revision notes

- Resource = **the API contract layer** — declares what the client sees
- `make($model)` = one · `collection($models)` = `{ data: [...] }`
- **`whenLoaded()`** = include only eager-loaded relations
- `when()` = value/authorization-conditional fields
- Standard envelope: `{ data, links, meta }`
- Thin transformation — no business logic

## Check your understanding

1. What exactly does a resource protect the API from?
2. How does `whenLoaded` keep payloads honest?
3. `make()` vs `collection()` — what's in the JSON?
4. When is returning the model raw acceptable?
5. Where does a resource's responsibility end?
