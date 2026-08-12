# Lesson 38 — Discriminated Unions

**Interview importance:** ⭐⭐⭐⭐⭐ — the single most useful pattern in application TypeScript. Loading/error/success states.

A union (Lesson 32) models "one of these shapes"; narrowing (Lesson 33) decides *which* at runtime. A **discriminated union** makes the decision reliable by giving every member a shared, literal field — the **discriminant** — that TypeScript can narrow on. Every API response, form state and async view in a real app is built on it.

## Learning Objectives

By the end of this lesson you should be able to:

- Define a discriminated union and name its three parts
- Model loading / error / success states as a discriminated union
- Narrow on the discriminant with `switch` and see each case's types
- Write an exhaustive check using `never` that fails the build when a case is missed
- Explain why the discriminant must be a literal type

## 1. One-line definition

**A discriminated union is a union of object types that share one literal field — the discriminant — which tells you, at runtime, which member you're looking at and which types are safe to use.**

The discriminant turns "figure out which shape this is" from a guess into a compiler-verified lookup.

## 2. Mental model

Think of a union as a pile of differently-shaped parcels, all labelled:

```text
   ┌────────────────────┐
   │ kind: 'loading'    │
   └────────────────────┘
   ┌────────────────────┐   ┌─────────────────────┐
   │ kind: 'error'      │   │ kind: 'success'     │
   │ message: string    │   │ data: User[]        │
   └────────────────────┘   └─────────────────────┘
```

The `kind` label is the discriminant. You don't have to guess what's inside — you read the label, and the compiler knows exactly which fields exist on that member.

## 3. Visual flow

```text
   type State =
     | { kind: 'loading' }                                  ← no extra data
     | { kind: 'error';   message: string }                 ← error payload
     | { kind: 'success'; data: User[] }                    ← result payload
        ▲                     ▲
        │                     │
   discriminant:        each member carries its OWN data —
   a literal 'kind'     narrowed automatically when kind matches
```

```ts
switch (state.kind) {
  case 'loading': …   // only { kind: 'loading' }
  case 'error':   …   // only { kind: 'error'; message }
  case 'success': …   // only { kind: 'success'; data }
}
```

Narrowing on the discriminant narrows the *whole object* — that's the payoff.

## 4. How it works

```ts
type User = { id: number; name: string };

type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; data: User[] };

function render(state: State): string {
  switch (state.kind) {
    case 'loading':
      return 'Loading…';                 // only kind: 'loading'
    case 'error':
      return `Error: ${state.message}`;  // ✅ message exists here
    case 'success':
      return `${state.data.length} users`; // ✅ data exists here
  }
}

console.log(render({ kind: 'loading' }));
console.log(render({ kind: 'error', message: 'network down' }));
console.log(render({ kind: 'success', data: [{ id: 1, name: 'Ali' }] }));
```

Output:

```text
Loading…
Error: network down
1 users
```

Inside each `case`, `state` is narrowed to that member: `state.message` compiles in the `error` branch, `state.data` in the `success` branch, and `state.data` in the `loading` branch would be an error. The `kind` field *discriminates* — one check narrows the whole object.

```narrate
line 1: the three members, one union type
line 2: each member has a literal kind — the discriminant
line 5: same field on every member, but a DIFFERENT literal value
line 9: switch on the discriminant — the narrowing trigger
line 11: inside error, state.message is known to exist
line 13: inside success, state.data is known to exist
line 19-21: the same render handles all three states with full type safety
```

> [!NOTE]
> The discriminant must be a **literal type** — `'loading'`, not `string`. If `kind: string`, TypeScript can't narrow, because `'loading'` wouldn't be the *only* possible value. Literal types (Lesson 30) are what make discrimination work.

### Exhaustive narrowing with `never`

The pattern that makes future bugs impossible — the `default` case must be unreachable:

```ts
type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; data: User[] };

function describe(state: State): string {
  switch (state.kind) {
    case 'loading': return 'loading';
    case 'error':   return `error: ${state.message}`;
    case 'success': return `success: ${state.data.length}`;
    default:
      return assertNever(state);   // ✅ compiles while State is exhaustive
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled state: ${JSON.stringify(value)}`);
}
```

Now add a fourth member — `{ kind: 'idle' }` — and `describe` **fails to compile**: `assertNever` receives `{ kind: 'idle' }`, which isn't assignable to `never`. The build breaks exactly where the new case is unhandled. That's the exhaustive-check superpower.

```narrate
line 8: the default branch runs only if no case matched
line 9: assertNever(state) — after all cases, state should be `never`
line 12-14: if a new member appears, this stops compiling — the missed case is a build error
```

## 5. Real project usage

The canonical async state — exactly the loading/error/success shape, used by every data-driven UI:

```ts
type AsyncState<T> =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; data: T };

function render(state: AsyncState<User[]>): string {
  switch (state.kind) {
    case 'loading': return 'Loading…';
    case 'error':   return `Error: ${state.message}`;
    case 'success': return `Found ${state.data.length} users`;
  }
}

// a request lifecycle — the same union at every step
let state: AsyncState<User[]> = { kind: 'loading' };
state = { kind: 'success', data: [{ id: 1, name: 'Ali' }] };
state = { kind: 'error', message: 'timeout' };
```

Real codebases use exactly this union for fetches, mutations and forms. The generic version — `AsyncState<T>` from Lesson 36 — types any payload without writing the three members per endpoint.

> [!TIP]
> This is also how React's `useReducer` (Lesson 64) is typed in the wild: a discriminated union of actions, each with its own payload, and a reducer that switches on `action.type` — the exact `switch`-on-discriminant pattern.

## 6. Interview explanation

> A discriminated union is a union of objects sharing a literal field — the discriminant, usually `kind` or `type`. Checking that one field narrows the whole object, so each branch gets exactly its own fields. I model async states as loading/error/success and use a `switch` on the discriminant; a `default` case with `assertNever(state)` makes the compiler fail the build if I ever add a member and forget to handle it.

## 7. Senior-level insights

The junior answer defines a discriminated union. The senior answer adds what makes it robust:

- **Exhaustiveness is the killer feature.** `assertNever` in the `default` case turns "a new state wasn't handled" from a runtime bug into a build failure. That's the strongest argument for discriminated unions in an interview: they make the compiler enforce completeness.
- **The discriminant must be a literal**, and it should be the *first* thing you check. Keep it a plain literal union — `'loading' | 'error' | 'success'` — never widen it to `string`.
- **Narrowing is the point, not the syntax.** The senior framing: "a discriminated union lets the compiler narrow the whole object on one check, so impossible states become impossible to express". A `{ kind: 'success', message: '…' }` object simply cannot exist.
- **Generic payloads compose** (Lesson 36): `AsyncState<T>` gives you one union for every payload, and constraint + discriminated union together model "any result, one of a few phases".
- Senior answers also mention **runtime guards still matter at the boundary** (Lesson 33): the union types the *inside* of your app; untrusted API data still needs validation at the edge.

## 8. Common mistakes

**Mistake 1 — a non-literal discriminant.** `kind: string` makes narrowing impossible:

```ts
type Bad = { kind: string; data?: unknown };   // ❌ not discriminated
// state.kind === 'success' does NOT narrow — kind is just string
```

```text
(no narrowing — with kind: string, every branch still sees the whole union)
```

**Mistake 2 — mixing shapes of members.** The discriminant field must exist on every member with a literal value; a member without it breaks the pattern and the compiler tells you.

**Mistake 3 — skipping the exhaustive `default`.** Without `assertNever`, adding a member silently falls through — no error until a runtime bug. The `default` + `never` pair is what makes the union self-enforcing.

## 9. Best practices

✅ Name the discriminant `kind` or `type` and give every member a literal value

✅ Use a `switch` on the discriminant — each case narrows the whole object

✅ End every state `switch` with `default: return assertNever(state)`

✅ Model async data as `{ loading } | { error } | { success }` — generic over the payload

✅ Keep the discriminant literal — never widen it to `string`

❌ Don't use optional fields to fake members — that's a bag of `undefined`s, not a union

❌ Don't handle states with scattered `if`s when a `switch` on one field is clearer

## 10. Interview questions

**Q1. What is a discriminated union?**

> A union of object types that share one literal field — the discriminant. Checking that single field narrows the whole object to the right member, so each branch sees exactly its own fields. A typical example is async state: `{ kind: 'loading' } | { kind: 'error', message } | { kind: 'success', data }`.

**Q2. How do you make a discriminated union exhaustive?**

> With a `default` branch that calls `assertNever`, which takes a `never` and throws. After every case has matched, the compiler should know `state` is `never` — so if I add a member and forget to handle it, `assertNever(state)` fails to compile. The missed case becomes a build error instead of a runtime surprise.

**Q3. Why must the discriminant be a literal type?**

> Because narrowing needs to know the *only* values that field can have. If `kind: string`, `state.kind === 'success'` proves nothing — `'success'` is just one of infinitely many strings. A literal union like `'loading' | 'error' | 'success'` tells the compiler exactly which cases exist, so it can narrow each one.

**Senior follow-up: How would you type a Redux-style reducer with a discriminated union?**

> The action type is a discriminated union — `{ type: 'ADD', item } | { type: 'REMOVE', id }` — with `type` as the discriminant. The reducer takes `(state, action)` and switches on `action.type`; each case narrows to that action's exact payload. The `default` case runs `assertNever(action)`, so adding a new action without a reducer branch fails the build. It's the same pattern as async states, with `type` as the discriminant instead of `kind`.

## 11. Follow-up questions

**What's the difference between a discriminated union and a plain union?**

> A plain union (Lesson 32) says "one of these shapes" but nothing tells you *which* without guards. A discriminated union adds the literal discriminant, so one check narrows the whole object. The same `switch` would otherwise need type guards or casts on every branch.

**Can the discriminant be nested or non-string?**

> It must be a literal type — string or number literals both work (`kind: 1 | 2 | 3`). Nested discriminants get awkward fast; keep the discriminant on the top level of each member. One flat field, one switch — anything more is a design smell.

**What about the `error` branch carrying `Error` objects?**

> Fine — `{ kind: 'error', error: Error }` instead of `message`. The member's payload is whatever that state genuinely needs. The union doesn't care what data each member carries, only that the discriminant is a literal shared across all of them.

## 12. Comparison table

| Approach | Tells you which shape? | Narrowing | Missing a case |
|---|---|---|---|
| Plain union + guards | type guards per member | scattered `if`s | runtime bug |
| Discriminated union | one literal field | one `switch` | compile error with `assertNever` |
| Optional-field bag | nothing — anything may be missing | checks on each field | silent `undefined` everywhere |

## 13. Code example

A small fetch simulation — the pattern end to end:

```ts
type User = { id: number; name: string };

type AsyncState<T> =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; data: T };

async function fetchUsers(): Promise<AsyncState<User[]>> {
  try {
    const res = await fetch('/api/users');
    if (!res.ok) return { kind: 'error', message: `HTTP ${res.status}` };
    const data = (await res.json()) as User[];
    return { kind: 'success', data };
  } catch (err) {
    return { kind: 'error', message: err instanceof Error ? err.message : 'unknown' };
  }
}

function render(state: AsyncState<User[]>): string {
  switch (state.kind) {
    case 'loading': return 'Loading…';
    case 'error':   return `Error: ${state.message}`;
    case 'success': return state.data.map((u) => u.name).join(', ');
  }
}

console.log(render({ kind: 'loading' }));
console.log(render({ kind: 'error', message: 'HTTP 500' }));
console.log(render({ kind: 'success', data: [{ id: 1, name: 'Ali' }, { id: 2, name: 'Omar' }] }));
```

Output:

```text
Loading…
Error: HTTP 500
Ali, Omar
```

Every path produces a well-formed `AsyncState`, and `render` never touches a field that isn't guaranteed to exist.

## 14. Performance notes

Discriminated unions are **erased at runtime** — the union and its narrowing cost nothing beyond the ordinary `switch` you already wrote. The pattern is a pure type-level win: no runtime checks generated, no casts, no defensive `?.` chains. The one runtime cost is the discriminant *field itself*, and that's data you'd carry anyway to distinguish states. If anything, discriminated unions reduce runtime cost by removing the scattered `if (state.data)` probes that plain unions encourage.

## 15. Debugging scenarios

**"Property 'message' does not exist on type '…'."** You're reading a field outside its case, or the union isn't discriminated (a non-literal `kind`). Check the discriminant is a literal union, and read member-specific fields inside their cases.

**"'{ kind: 'idle' }' is not assignable to parameter of type 'never'."** The exhaustive check fired — you added a member and haven't handled it. Add the case (or widen the discriminant if the new state is intentional and handled).

**"Type 'string' is not assignable to type '"loading" | "error" | "success"'."** Something assigned a broad string to the discriminant. Widen the literal union deliberately, or fix the value to a valid member.

**"Argument of type … is not assignable to parameter of type 'never'."** In `assertNever` specifically — the compiler thinks the branch is unreachable but a value flowed in. Almost always an unhandled member; the error message literally points at it.

## 16. Quick revision notes

- A discriminated union = union of objects + one shared **literal** discriminant
- Checking the discriminant narrows the whole object
- The canonical trio: `{ kind: 'loading' } | { kind: 'error', message } | { kind: 'success', data }`
- Make it generic: `AsyncState<T>` (Lesson 36) types any payload
- Exhaustiveness: `default: return assertNever(state)` — missed cases fail the build
- The discriminant must be a literal — never `string`
- Same pattern as Redux reducers: `switch (action.type)`
- Erased at runtime — the union costs nothing

## 17. Cheat sheet

```ts
// the canonical discriminated union
type AsyncState<T> =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; data: T };

// narrowing + exhaustiveness in one switch
function render<T>(state: AsyncState<T>): string {
  switch (state.kind) {
    case 'loading': return 'loading';
    case 'error':   return state.message;   // ✅ narrowed
    case 'success': return JSON.stringify(state.data); // ✅ narrowed
    default: return assertNever(state);     // ✅ compile-error on missing case
  }
}

// the exhaustiveness helper
function assertNever(value: never): never {
  throw new Error(`Unhandled: ${JSON.stringify(value)}`);
}
```

```text
(no runtime output — these are type-level definitions)
```

## 18. Key takeaways

> [!RECAP]
> - A discriminated union is a union of objects with one shared **literal** discriminant
> - One check on the discriminant narrows the whole object — no scattered guards
> - Loading/error/success is the canonical model; `AsyncState<T>` generics it (Lesson 36)
> - `default: return assertNever(state)` makes unhandled members a compile error
> - The discriminant must be a literal union — `kind: string` destroys narrowing
> - Same pattern powers Redux reducers: switch on `action.type`
> - Erased at runtime — pure type-level, zero cost
> - Next stop: Lesson 39's utility types build on the unions and generics you now know

## Check your understanding

Answer these without looking back.

1. Define a discriminated union and name its three parts.
2. Model loading/error/success as a union, then write the `switch` that narrows it.
3. What does `assertNever` do, and what happens when you add a new member?
4. Why must the discriminant be a literal type? What breaks with `kind: string`?
5. Rewrite a plain-union-plus-guards version as a discriminated union — what improves?
6. How would you type a Redux action with this pattern?

## What's Next

**Lesson 39 — Utility Types.** `Partial`, `Pick`, `Omit`, `Record`, `ReturnType` — the toolbox built from the operators and generics you now know, and expect to reimplement one by hand.
