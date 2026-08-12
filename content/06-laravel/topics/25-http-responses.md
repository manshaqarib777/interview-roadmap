# Topic 25 — HTTP Responses

**Checklist anchor:** 200/201/204/400/401/403/404/409/422/429/500 · especially 401 vs 403

**Owning lessons:** [113 Controllers, Requests & Responses](../113-controllers.md) · [128 Rate Limiting & Security](../128-security.md)

---

## The one-sentence answer

**HTTP status codes are the universal contract between your API and its clients — each one says precisely *what happened*, and 401 vs 403 is the single most-tested distinction.**

## The mental model

The status code is the **first thing every client reads**. It answers one question: *"did it work, and if not, whose fault is it?"*

```text
2xx  it worked
3xx  look elsewhere
4xx  the client got it wrong (or isn't allowed)
5xx  the server got it wrong
```

Get the code right and clients can react without parsing your body. Get it wrong and even a perfect response body is misleading — a 200 with an error payload is how integrations silently break.

## The codes that matter

### Success

| Code | Meaning | When |
|---|---|---|
| **200 OK** | The default success | `return $resource;` or a view |
| **201 Created** | A resource was created | `return response()->json($order, 201);` |
| **204 No Content** | Succeeded, nothing to return | Delete, or an update returning nothing |

### Client errors

| Code | Meaning | When |
|---|---|---|
| **400 Bad Request** | Malformed request | Invalid JSON, missing required field (before validation semantics) |
| **401 Unauthorized** | **Not authenticated** | No/invalid token, not logged in |
| **403 Forbidden** | **Authenticated, not allowed** | Logged in but not an admin |
| **404 Not Found** | Resource missing | Wrong URL, or no such model |
| **409 Conflict** | State conflict | Duplicate, version conflict, concurrent edit |
| **422 Unprocessable Entity** | Validation failed | Laravel's validation failure status |
| **429 Too Many Requests** | Rate limited | `throttle` middleware fired |

### Server errors

| Code | Meaning |
|---|---|
| **500 Internal Server Error** | Something broke server-side |

## 401 vs 403 — the distinction that gets asked

| | 401 Unauthorized | 403 Forbidden |
|---|---|---|
| The question | **"Who are you?"** | **"What are you allowed to do?"** |
| State | Not authenticated | Authenticated, but not authorized |
| Typical fix | Log in / provide a token | Gain permission / different role |
| Example | No `Authorization` header | User is logged in but isn't an admin |

The one-liner to remember:

> **401 is authentication (who you are); 403 is authorization (what you may do).**

In Laravel:

```php
// 401 — the auth layer rejects you
abort(401);                       // or the auth middleware
// 403 — the policy/gate rejects you
abort_unless($user->can('update', $post), 403);
```

## How Laravel produces them

```php
abort(404);                                    // NotFoundHttpException
abort_if(!$order->belongsTo($user), 403);      // gate-style block
abort_unless($request->user()->can('view', $order), 403);

return response()->json($order);               // 200
return response()->json($order, 201);          // created
return response()->json([], 204);              // no content

// validation failure → 422 automatically (form requests / validate())
// throttle:60,1 → 429 automatically when exceeded
```

## Interview questions

**Q1. What's the difference between 401 and 403?**
> 401 means *not authenticated* — the server doesn't know who you are; provide credentials or a token. 403 means *authenticated but not authorized* — the server knows you, but you don't have permission for this action. In short: 401 is about identity, 403 is about permission.

**Q2. When should an API return 422 vs 400?**
> 422 is Laravel's validation-failure status — the request is well-formed but fails business rules (invalid fields). 400 is for malformed requests — unparseable JSON, wrong content type. Laravel's form requests and `validate()` return 422 with the field errors, which is what frontends expect to render.

**Q3. What's the difference between 200 and 201?**
> 200 says the request succeeded. 201 specifically says a resource was *created* — it's the correct response for a successful store/create action, often with a `Location` header pointing at the new resource. Using 201 lets clients distinguish "created something" from "read/generic success."

**Q4. When does Laravel return 429?**
> When the `throttle` middleware is exceeded — `throttle:60,1` on a route returns 429 Too Many Requests once the limit is hit, with headers showing the rate limit and retry-after. It's the API's rate-limiting signal (Lesson 35).

**Q5. What's the difference between 404 and 403 for a resource that exists but isn't yours?**
> 404 says "doesn't exist"; 403 says "you're not allowed." Some APIs return 404 for resources you can't see, to avoid leaking that they exist. Laravel's model binding 404s by default; if you want to hide existence, you scope the lookup so unauthorized users get 404 rather than 403.

**Senior follow-up: When would you deliberately return 404 instead of 403?**
> To avoid existence leaks in multi-tenant or private-resource systems. If "this order exists but isn't yours" returned 403, an attacker could probe which order IDs exist. Returning 404 for anything you can't see hides the data model — the tenant-leak defence from Lesson 134.

## Common mistakes

❌ Returning 200 for validation failures — clients can't distinguish success from error.

❌ Using 401 when you mean 403 (or vice versa) — the whole point of the contract is precision.

❌ Returning 500 for client mistakes — 4xx tells the client it's their fix, not yours.

❌ Returning 403 for "not authenticated" — that's 401; 403 implies you *know* the user.

## Quick revision notes

- **2xx** worked · **3xx** redirect · **4xx** client's fault · **5xx** server's fault
- **200** success · **201** created · **204** no content
- **401 = who you are** (auth) · **403 = what you may do** (authz) — the must-know pair
- **404** missing · **409** conflict · **422** validation · **429** rate limited · **500** broke
- Laravel: `abort()`, `response()->json($x, $code)`, form requests → 422, throttle → 429

## Check your understanding

1. In one sentence each: 401 vs 403.
2. When does Laravel return 422, and what does the body look like?
3. What's the right code for "resource created" vs "successful read"?
4. When would you return 404 instead of 403 on purpose?
5. Why is a 200-with-error-body a bad API design?
