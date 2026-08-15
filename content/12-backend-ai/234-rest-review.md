# Lesson 234 — REST Best Practices (Review)

**Interview importance:** ⭐⭐⭐⭐ — "what's the REST baseline?" — the answer is *resources, status codes, pagination* — the conventions your AI API extends (L233).**

L233 built the AI API; this lesson is the **baseline it extends**: REST best practices — the conventions every API should follow: resources and their representations (L234), the status codes (L234), pagination (L234), versioning (L341), and the error shape (L143). The AI API (L233) is *more* than REST — but it builds on REST's discipline: consistent resources, correct status codes, and predictable errors (L234).

The distinction this lesson is built on: a **demo** has endpoints with inconsistent shapes. A **solutions architect** follows the conventions: the resources (L234), the status codes (L234), the pagination (L234), and the versioning (L341) — the baseline that makes an API predictable and the AI layer (L233) an extension, not a break (L234).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the REST baseline: resources and their representations (L234)
- Explain the status codes: the correct code for each outcome (L234)
- Explain pagination: offset vs cursor, and the shape (L234)
- Explain versioning and the error shape (L341, L143)
- Explain how the AI API extends the baseline (L233)

## 1. One-Line Definition

**REST best practices are the API baseline — resources and their representations (L234), the correct status codes (L234), pagination (L234), versioning (L341), and a consistent error shape (L143) — the conventions that make an API predictable, and the baseline the AI API (L233) extends rather than breaks (L234).**

The one-sentence interview answer: *"REST is the baseline the AI API extends (L234). The conventions: resources — the API exposes resources (users, chats, messages) with consistent representations (L234). Status codes — the correct code for each outcome: 200 for success, 201 for creation, 400 for bad input (L143), 401 for unauthenticated (L237), 404 for missing, 429 for the rate limit (L170). Pagination — lists return pages, offset or cursor (L234), with the shape documented. Versioning — the API's breaking changes are versioned (L341). And the error shape — every error is the same shape (L143). The AI API (L233) builds on this: the chat endpoint is a resource or an action (L173), the streaming is the response (L251), and the errors stay REST-shaped (L234). The baseline is what makes the API predictable (L234)."*

## 2. Mental Model

Think of the REST baseline as **the house style of the API's language.** Every letter (the request) and every reply (the response) follows the house rules: a letter about a resource addresses it the same way (the resource conventions, L234); the reply's tone is chosen by the outcome (the status codes, L234) — a "yes" is 200, a "you can't" is 403, a "not found" is 404; a long list arrives in pages (pagination, L234); and every error letter is the same format (the error shape, L143). The AI API's letters — the chat, the generation — follow the same house style, even though their content is new (L233). The house works because the style is consistent (L234).

```text
   the house style (L234)
   ┌────────────────────────────────────────────────────────┐
   │ resources — consistent representations (L234)          │
   │ status codes — the code matches the outcome (L234)     │
   │ pagination — lists in pages (L234)                     │
   │ versioning — breaking changes versioned (L341)         │
   │ errors — one shape (L143)                              │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the house style**: consistent conventions that make the API predictable, with the AI layer following the same rules (L234).

## 3. Visual Flow — A RESTful Exchange

```text
   a client request (L234)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE RESOURCE (L234)                                  │
   │     GET /users/42 → the user's representation (L234)     │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE OUTCOME → THE STATUS CODE (L234)                 │
   │     200 · 201 · 400 (L143) · 401 (L237) · 404 · 429     │
   │     (L170) — the code matches what happened              │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE LIST → PAGINATION (L234)                         │
   │     the page shape: data, nextCursor (L234)              │
   └──────────────────────────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · THE ERROR → THE SHAPE (L143)                         │
   │     every error: code, message, details (L234)           │
   └──────────────────────────────────────────────────────────┘
```

The flow is the baseline: **resource → status → pagination → error shape** — the conventions the AI API extends (L234).

## 4. How It Works — The Conventions

- **Resources (L234).** The API exposes resources — users, chats, messages — with consistent representations: the fields, the shapes, the names (L234). The resource conventions make the API self-consistent (L234).
- **Status codes (L234).** The correct code for the outcome: 200 (success), 201 (created), 400 (bad input, L143), 401 (unauthenticated, L237), 403 (forbidden, L238), 404 (missing), 429 (rate limited, L170), 5xx (server failure, L168). The code is the outcome's vocabulary (L234).
- **Pagination (L234).** Lists return pages: offset/limit or cursor-based (L234), with the shape documented — the page's items and the next page's cursor (L234).
- **Versioning (L341).** Breaking changes are versioned — the API's URL or header carries the version (L341) — so the clients aren't broken (L234).
- **The error shape (L143).** Every error is the same shape: a code, a message, and the details (L143) — so the client handles errors uniformly (L234).

> [!NOTE]
> **The AI API extends the baseline; it doesn't break it (L233, L234).** The chat endpoint (L233) can be an action-style endpoint (L173) — but its errors are REST-shaped (L143), its auth is the REST auth (L237), its rate limits return 429 (L170), and its breaking changes are versioned (L341). The streaming response (L251) is the extension — a 200 with a stream instead of a JSON body (L234). The senior design keeps the AI layer an extension of the conventions (L233): the baseline's predictability survives the AI's novelty (L234).

## 5. Real Project Usage

- **The chat API (L233).** `POST /chats/:id/messages` (L234) — the resource-shaped chat, with the streaming response (L251) as the extension (L234).
- **The generation API (L233).** `POST /generations` (L234) — 201 on creation, 400 on the bad schema (L143), 429 on the limit (L170).
- **The history API (L234).** `GET /chats/:id/messages?cursor=…` — cursor pagination (L234).
- **The AI SaaS (L260).** The full REST baseline (L234) under the AI layer (L233) — resources, codes, pagination, versioning (L341).
- **Anything with an API (L234).** The baseline is the predictability (L234) — the conventions every endpoint follows (L234).

The through-line: **the baseline is the predictability** — resources, codes, pagination, and errors consistent, with the AI layer as the extension (L234).

## 6. Interview Explanation

Say it in four moves:

1. **The resources.** "Consistent representations (L234) — the API's nouns."
2. **The codes.** "The status code matches the outcome (L234) — 200 to 5xx."
3. **The pages.** "Lists paginate (L234) — offset or cursor, documented."
4. **The extension.** "The AI API (L233) builds on it: REST-shaped errors (L143), versioned (L341), streaming as the extension (L251)."

## 7. Senior-Level Insights

- **The conventions are the predictability (L234).** The senior answer treats the baseline as the API's contract (L234): consistent resources (L234), correct codes (L234), and one error shape (L143) — the client can rely on it (L234).
- **The status codes are the outcome's vocabulary (L234).** The senior answer uses the code that says what happened (L234): 429 for the rate limit (L170), 401 for the auth (L237), 400 for the schema (L143) — the code is the first message (L234).
- **Cursor pagination is the scale answer (L234).** The senior answer uses cursors for the large lists (L234) — the offset's cost (L234) vs the cursor's stability (L234).
- **The AI layer is versioned like the rest (L341).** The prompt contracts (L163) and the schemas (L143) are versioned (L341) — the AI API's breaking changes are announced like any API's (L234).
- **The error shape is the client's friend (L143).** One error shape (L143) — the client's error handling is written once (L234).

## 8. Common Mistakes

- **Inconsistent resources (L234).** The same thing shaped differently across endpoints (L234) — the client re-learns each route (L234).
- **Wrong status codes (L234).** 200 for everything (L234) — the client can't tell success from failure (L234).
- **No pagination (L234).** The full list in one response (L234) — the payload explodes (L234).
- **Unversioned breaking changes (L341).** The clients break on the deploy (L341) — the version (L341) missing (L234).
- **Inconsistent errors (L143).** Each endpoint's error a different shape (L143) — the client's handling duplicated (L234).
- **The AI layer breaking the baseline (L233).** The streaming and the schemas ignoring the conventions (L234) — the predictability lost (L234).

## 9. Best Practices

- **Keep the representations consistent** (L234) — the resources' shapes (L234).
- **Use the correct status codes** (L234) — 200 to 5xx, by outcome (L143, L170).
- **Paginate the lists** (L234) — cursor for the large (L234).
- **Version the breaking changes** (L341) — the API's URL or header (L234).
- **One error shape** (L143) — code, message, details (L234).
- **Extend, don't break** (L233) — the AI layer follows the conventions (L234).

## 10. Interview Questions

**Q: What are the REST best practices?**
> A: The baseline (L234): resources with consistent representations (L234); the correct status code for each outcome — 200, 201, 400 (L143), 401 (L237), 404, 429 (L170); pagination for the lists (L234); versioning for the breaking changes (L341); and one error shape (L143). The conventions make the API predictable (L234).

**Q: How does the AI API extend REST?**
> A: It builds on the baseline (L233): the chat and generation endpoints follow the resource conventions (L234), the errors are REST-shaped (L143), the auth is the REST auth (L237), the limits return 429 (L170), and the breaking changes are versioned (L341). The extension is the streaming response (L251) — a 200 with a stream instead of a JSON body (L234). The AI layer extends; it doesn't break (L234).

**Q: Offset or cursor pagination?**
> A: By the list's shape (L234). Offset is simple — `?offset=0&limit=50` — but it degrades with the large lists (L234) and shifts as items are added (L234). Cursor is stable: `?cursor=…` returns the next page anchored to the last item (L234). For the lists that grow — chat histories, message logs — cursor is the senior answer (L234).

**Q: What's the error shape?**
> A: One shape for every error (L143): a code — a machine-readable identifier; a message — the human-readable explanation; and details — the specifics (L234). The client writes the error handling once (L234). The AI API's schema errors (L143), rate limits (L170), and auth failures (L237) all return the same shape (L234).

## 11. Follow-Up Questions

- What are the resource conventions (L234)?
- Which status code for which outcome (L234)?
- When is cursor pagination right (L234)?
- How do you version the API (L341)?
- What's in the error shape (L143)?

## 12. Comparison Table — Ad-Hoc vs RESTful

| | Ad-hoc (L234) | RESTful (this lesson) |
|---|---|---|
| Resources (L234) | inconsistent | consistent representations |
| Codes (L234) | 200 for everything | the code matches the outcome |
| Lists (L234) | full payloads | paginated |
| Changes (L341) | break the clients | versioned |
| Errors (L143) | per-endpoint | one shape |
| The client (L234) | re-learns each route | handles them once |

The senior read: **the right column is the baseline** — the predictability the AI API extends (L234).

## 13. Code Example — The Baseline

```js
// REST best practices: resources, codes, pagination, errors (L234).
// THE RESOURCE (L234) — a consistent representation.
GET /chats/:id/messages
  → 200 {
      items: [{ id, role, content, createdAt }],        // the representation (L234)
      nextCursor: 'msg_9f3k…',                          // the pagination (L234)
    }

// THE STATUS CODES (L234) — the outcome's vocabulary.
200  // the representation            (L234)
201  // the resource created          (L234)
400  // the schema invalid            (L143)
401  // unauthenticated               (L237)
404  // the resource missing          (L234)
429  // the rate limit exceeded       (L170)

// THE ERROR SHAPE (L143) — one shape for every error.
{
  error: {
    code: 'rate_limited',                                // machine-readable (L234)
    message: 'You have exceeded the per-minute limit.',  // human-readable (L234)
    details: { retryAfterSec: 30 },                      // the specifics (L234)
  },
}

// VERSIONING (L341) — the breaking changes announced.
POST /v2/chats/:id/messages      // the version in the URL (L341)
```

```text
What the reader must SEE — the baseline's four conventions:

  the resource representation → consistent (L234)
  the status codes             → by outcome (L234)
  the pagination cursor        → the next page (L234)
  the one error shape          → handled once (L143)

  The house style — the baseline the AI API extends (L233).
```

```narrate
2-6: The resource — a consistent representation with the pagination cursor (L234).
8-14: The status codes — the outcome's vocabulary (L234), including the AI-specific 429 (L170) and 400 (L143).
16-23: The error shape — one shape for every error (L143): code, message, details (L234).
25-26: The versioning — the breaking changes announced in the URL (L341).
```

> [!TIP]
> The line that makes the API predictable: **`nextCursor: 'msg_9f3k…'`** beside **`code: 'rate_limited'`** — the pagination and the error shape (L234). **The house style is consistent — the client can rely on it, and the AI layer extends it (L233).**

## 14. Performance Notes

- **The pagination is the payload control (L151).** The cursor (L234) keeps the lists bounded (L234) — the large histories (L166) page instead of exploding (L234).
- **The status codes are free (L151).** The correct code (L234) costs nothing and saves the client a request (L234).
- **The error shape is the debugging aid (L143).** The consistent errors (L234) — the client and the trace (L213) read them uniformly (L234).
- **The versioning is the deploy safety (L341).** The versioned API (L341) allows the progressive rollouts (L302) — the breaking change announced, not silent (L234).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The client can't parse | Inconsistent shapes (L234) | The resource representations (L234) |
| Errors unclear | 200 for everything (L234) | The correct codes (L143) |
| Huge payloads | No pagination (L234) | The cursor (L234) |
| Deploys break clients | Unversioned changes (L341) | The version (L341) |
| The AI errors differ | The AI layer breaks the baseline (L233) | The one error shape (L143) |

## 16. Quick Revision Notes

- REST = **the API baseline** (L234): resources, codes, pagination, errors.
- Resources: **consistent representations** (L234).
- Codes: **the outcome's vocabulary** (L234) — 200 to 5xx (L170).
- Pagination: **offset or cursor** (L234), documented.
- Versioning: **breaking changes versioned** (L341).
- The AI layer: **extends, doesn't break** (L233).

## 17. Cheat Sheet

```text
REST BEST PRACTICES = the API baseline

THE CONVENTIONS (L234)
  resources  consistent representations — the API's nouns (L234)
  codes      the status matches the outcome (L234)
             200 · 201 · 400 (L143) · 401 (L237) · 404 · 429 (L170)
  pagination offset (simple) · cursor (stable, for the large) (L234)
  versioning the breaking changes in the URL / header (L341)
  errors     one shape: code + message + details (L143)

THE AI EXTENSION (L233)
  the chat/generation endpoints follow the resource rules (L234)
  the errors are REST-shaped (L143) · the limits are 429 (L170)
  the streaming response is the extension (L251)
  the AI layer extends the baseline; it doesn't break it (L234)

THE PAYOFF (L234)
  the client handles the API once — predictable, consistent
  the trace (L213) reads the same shapes

INTERVIEW, 4 MOVES
  1 resources "consistent representations (L234)"
  2 codes     "the status matches the outcome (L234)"
  3 pages     "pagination — cursor for the large (L234)"
  4 extension "the AI layer extends, doesn't break (L233)"
```

## 18. Key Takeaways

> [!RECAP]
> - REST best practices are **the API baseline** (L234): resources, status codes, pagination, versioning (L341), and the error shape (L143)
> - **The resources are consistent** (L234) — the representations, the names, the shapes (L234)
> - **The status codes match the outcomes** (L234) — 200 to 5xx, with the AI-specific 400 (L143) and 429 (L170)
> - **The lists paginate** (L234) — cursor for the stable, large lists (L234)
> - **The breaking changes are versioned** (L341) — the clients aren't broken on the deploy (L234)
> - **The AI API extends the baseline** (L233) — REST-shaped errors (L143), REST auth (L237), and the streaming response (L251) as the extension (L234)

## Check your understanding

Answer these without looking back.

1. What are the four conventions (L234)?
2. Which status code for which outcome (L234)?
3. When is cursor pagination right (L234)?
4. Why version the breaking changes (L341)?
5. What's in the error shape (L143)?
6. How does the AI API extend the baseline (L233)?
7. Why is the consistency the predictability (L234)?
8. What does the streaming response extend (L251)?

## A Closing Note — The House Style, Set

You now hold the baseline: **the consistent resources, the outcome-matching codes, the paginated lists, the versioned changes, and the one error shape.** The API is now predictable — and the AI layer extends it, rather than breaking it (L234).

Next: the alternative shape — GraphQL basics (L235), when an AI product wants a schema, not routes.
