# Lesson 45 — `unknown` vs `any` vs `never`

**Interview importance:** ⭐⭐⭐⭐ — a direct, frequently-asked question with a crisp correct answer.

The single most common TypeScript vocabulary question — and one where a precise answer
signals real depth. The crisp version: `any` disables checking, `unknown` forces narrowing,
`never` is uninhabitable. Everything else is elaborating on those three facts.

## Learning Objectives

By the end of this lesson you should be able to:

- State the difference between `any`, `unknown` and `never` in one sentence each
- Explain why `unknown` is the safe version of `any`
- Say when you would actually use `never`
- Narrow `unknown` correctly (and explain why `typeof` narrowing matters)
- Spot the `never` in a conditional type and explain where it comes from

## 1. One-line Definition

**`any` disables type checking, `unknown` is a safe top type that forces you to narrow, and
`never` is the bottom type that no value can inhabit.**

## 2. Mental Model

Picture a type hierarchy:

- **`any`** — the "no checks" escape hatch. It accepts everything and gives you nothing back
  in return: no errors, no narrowing, no safety.
- **`unknown`** — the "we don't know yet" box. Everything fits *in*, but you can't take
  anything *out* until you prove what it is. It's `any` with a seatbelt.
- **`never`** — the empty set. Not "no value yet" like `undefined` — a type with **zero**
  possible values. You can never have one; you can only infer one.

```text
                    any — accepts everything, checks nothing
                     │
        ┌────────────┴────────────┐
   assignable to any      assignable to any     unknown — accepts everything,
        │                          │              but nothing can be used
        ▼                          ▼              until narrowed
     string                      number
        └────────────┬────────────┘
                     ▼
                  never — the bottom: nothing is assignable TO it
```

## 3. Visual Flow

```text
        assignable FROM            assignable TO
   ┌─────────────────────┐   ┌─────────────────────┐
   │  any    → any type  │   │  any type → any     │  ✅ always
   │  any    → unknown   │   │  any type → unknown │  ✅ always
   │  any    → string    │   │  string   → any     │  ✅ always
   │  unknown → string   │   │  string   → unknown │  ✅ always
   │  string → unknown   │   │  unknown  → string  │  ❌ needs narrowing
   │  never  → string    │   │  string   → never   │  ❌ never
   └─────────────────────┘   └─────────────────────┘
```

Everything is assignable to `unknown`; only `never` (and `any`) are assignable to
`never`'s siblings freely; only `any` flows both ways everywhere.

## 4. How It Works

### `any` — checks are off

```ts
function getAny(): any {
  return JSON.parse('{"x": 1}');
}

const value = getAny();
value.foo.bar.baz;        // no error — `any` walks right past this
console.log(value + 1);   // no error either
```

Output:

```text
undefined + 1 → NaN
```

> [!PITFALL]
> `value.foo.bar.baz` compiled cleanly. Every one of those property accesses would throw at
> runtime — but `any` suppressed the errors, so they land on the user instead of your
> terminal. This is the "type safety leaks out" property of `any`.

### `unknown` — safe, but you must narrow

```ts
function getUnknown(): unknown {
  return JSON.parse('{"x": 1}');
}

const value = getUnknown();

// value.foo;              // 💥 'value' is of type 'unknown'
// value + 1;              // 💥 same

if (typeof value === 'object' && value !== null && 'x' in value) {
  console.log((value as { x: number }).x); // narrowing got us here
}
```

Output:

```text
1
```

The compiler refuses to let you touch `unknown` until you prove what it is. That's the
entire safety difference from `any`: the *use* requires narrowing (Lesson 33).

> [!TIP]
> For unknown data from `JSON.parse`, prefer a **type guard** (Lesson 33) over a cast: a
> reusable `isUser(x): x is User` function turns an `unknown` API response into a typed
> value with one trustworthy check, instead of a scattered `as` here and there.

### `never` — the uninhabitable type

```ts
type Never = never;

// const n: Never = 1;   // 💥 Type 'number' is not assignable to type 'never'

function fail(message: string): never {
  throw new Error(message);
}

// No value can ever be `never` — it's a type with zero members.
```

Output:

```text
(no output — the assignment above is a compile error)
```

`never` appears where TypeScript knows something can't happen: the empty array
`const x = []` in strict mode infers `never[]` until widened, and a `switch` that handled
every case of a union leaves a `never` in the default branch.

## 5. Real Project Usage

| Scenario | Type | Why |
|---|---|---|
| `JSON.parse` results | `unknown` | You must prove the shape before use (Lesson 33 guards) |
| API layer return types | `unknown` | Untrusted data stays untrusted until validated |
| Migration from JS | `any` (temporarily) | Lifts errors while you convert files incrementally |
| Third-party libs with bad types | `any` | Avoids a permanent `@ts-ignore` |
| Exhaustive `switch` / `never` check | `never` | Compile error if a new union member appears |
| Conditional type false branch | `never` | "No match" — Lesson 43's `? R : never` |
| Empty collections before fill | `never[]` | Strict mode until values are assigned |

The flagship `never` pattern — exhaustive checks:

```ts
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number };

function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.radius ** 2;
    case 'square': return s.side ** 2;
    default:
      return assertNever(s); // ✅ any new Shape kind → compile error here
  }
}

function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(x)}`);
}

console.log(area({ kind: 'circle', radius: 2 }));
```

Output:

```text
12.566370614359172
```

Add a `{ kind: 'triangle' }` member and the `default` branch stops compiling — `s` is no
longer `never`. This is the strongest practical use of `never` in a codebase.

## 6. Interview Explanation

> `any` turns off checking — anything goes, and nothing is caught. `unknown` is the safe
> version: every type is assignable to it, but you can't *use* a value until you narrow it,
> so untrusted data has to be proven before it's touched. `never` is the empty type — no
> value exists. It shows up where TypeScript proves something can't happen, like the
> `default` branch of an exhaustive `switch`, and in conditional types as the "no match"
> result.

## 7. Senior-Level Insights

- **`unknown` is the answer to "safe `any`".** `unknown` + a type guard (Lesson 33) is the
  standard way to handle `JSON.parse`, `fetch` responses and anything crossing a boundary.
- **`any` is a policy decision, not a type.** You use it deliberately at the edge of a
  migration, and you contain it — never let it flow through your domain model.
- **`never` is how you make exhaustive switches safe.** A function
  `(x: never) => never` in the `default` branch turns "we forgot a case" into a compile
  error the moment a new union member is added (Lesson 38).
- **The hierarchy question is a trap.** Some interviewers ask "is `any` assignable to
  `never`?" The precise answer: `any` is assignable to `never` because `any` is assignable
  to everything — it's the one exception to the bottom type's rule.
- **`never[]` vs `[]`.** An empty array literal infers `never[]` in strict mode until it's
  given a real element type. That's the `never` most people meet first, usually while
  mutating state.

## 8. Common Mistakes

❌ Using `any` where `unknown` would do — you lose every error the compiler could give you.

```ts
let data: any = JSON.parse(raw);          // ❌ any: no checks later
let data: unknown = JSON.parse(raw);      // ✅ must narrow before use
```

❌ Assuming `unknown` is assignable to concrete types — it isn't; you must narrow it.

```ts
function f(x: unknown) {
  return x.toUpperCase();                 // 💥 'x' is of type 'unknown'
}
```

❌ Forgetting `typeof` narrowing: `typeof x === 'object'` still needs the null check.

❌ Writing `never` in a default branch without the `assertNever` function — the branch should
throw, and the function types it.

❌ Confusing `never` with `undefined` or `void`. `undefined` is a value; `never` is a type
with no values at all.

## 9. Best Practices

✅ Type external data as `unknown` at the boundary, then validate with guards (Lesson 33)

✅ Reserve `any` for migration escapes and genuinely untyped interop — and contain it

✅ Use `assertNever` in the `default` branch of exhaustive switches over unions

✅ Let `never` appear in conditional types — `? R : never` is the honest "no match" (Lesson 43)

✅ Treat `never[]` as "array of nothing yet" and annotate it once you know the element

❌ Don't cast `as any` to silence an error you don't understand

❌ Don't use `unknown` where the type is already known — that's just losing information

## 10. Interview Questions

**Q1. What's the difference between `any` and `unknown`?**

> `any` disables checking completely — it accepts everything and lets you use it as
> anything, which means errors surface at runtime instead of compile time. `unknown` is the
> safe top type: everything is assignable to it, but you can't use the value until you
> narrow it. So `unknown` is what you want for untrusted data — it forces you to prove the
> shape before touching it.

**Q2. What is `never` used for?**

> It's the bottom type — no value inhabits it. I use it in exhaustive switches: a function
> `(x: never) => never` in the `default` branch makes the compiler error if a new union
> member appears. It also shows up in conditional types as the "no match" branch, and in
> strict mode `const x = []` starts life as `never[]`.

**Q3. Is `any` assignable to `never`?**

> Yes — technically. `any` is assignable to everything, including `never`. But you can never
> actually *have* a `never` value, so it's the one weird exception to the bottom type's rule.
> Everything else that's not `any` is not assignable to `never`.

**Q4. When would you choose `unknown` over `any`?**

> Whenever the value crosses a trust boundary: `JSON.parse`, a `fetch` response, data from
> `localStorage`. `unknown` forces me to narrow it — with a type guard — before use. `any`
> skips that and pushes the failure into production.

**Q5. Can you have a value of type `never`?**

> No — `never` is uninhabitable, by definition. You can only *infer* it: an exhaustive
> switch's default branch, a conditional type's false branch, an empty array before it's
> widened. The value never exists; the type is TypeScript telling you something can't
> happen.

**Senior follow-up: How would you type an API response you don't trust?**

> ```ts
> type User = { id: number; name: string };
>
> function isUser(x: unknown): x is User {
>   return typeof x === 'object' && x !== null &&
>     'id' in x && typeof (x as { id: unknown }).id === 'number' &&
>     'name' in x && typeof (x as { name: unknown }).name === 'string';
> }
>
> async function fetchUser(): Promise<User> {
>   const res = await fetch('/api/user');
>   const data: unknown = await res.json();
>   if (!isUser(data)) throw new Error('malformed user');
>   return data; // ✅ narrowed: unknown → User
> }
>
> console.log(await fetchUser().catch(e => e.message));
> ```
>
> Output:
>
> ```text
> malformed user
> ```
>
> The response starts as `unknown`, gets validated by a guard, and only then becomes a
> `User`. `any` would have let the unvalidated shape flow everywhere; this keeps the check
> at the boundary where it belongs.

## 11. Follow-up Questions

**What's the type of `[]` in strict mode, and why?**

> `never[]` — the compiler can't know what elements will be pushed, so it infers the
> uninhabited element type until a real element type arrives or you annotate it.

**Why does an exhaustive switch need `assertNever`?**

> Without it, adding a new union member makes the `default` branch silently fall through at
> runtime. With `(x: never) => never`, the compiler itself reports the uncovered member.

**Is `void` the same as `undefined` or `never`?**

> No. `void` is the return type for functions whose result you ignore — the value is
> undefined-ish. `undefined` is a real value. `never` has no value at all; a `never`
> function never returns, it throws or hangs.

**What happens when `unknown` meets a union?**

> `unknown` absorbs the union — `unknown | string` collapses to `unknown`. Likewise `never`
> disappears from unions: `never | string` is `string`. The top type and the bottom type
> are each other's identity elements.

## 12. Comparison Table

| | `any` | `unknown` | `never` |
|---|---|---|---|
| Kind | escape hatch | safe top type | bottom type |
| Values it accepts | everything | everything | nothing |
| Use without narrowing | ✅ | ❌ | — |
| Assignable to concrete types | ✅ (anything) | ❌ | ✅ (vacuously) |
| Catches errors | ❌ | ✅ (forces checks) | ✅ (exhaustiveness) |
| Typical use | migration, bad libs | API/data boundaries | exhaustive switches, no-match branches |
| In a union | absorbs | absorbs | disappears |
| In conditional types | often a mistake | the "need to check" input | the "no match" output |

## 13. Code Example

One flow showing all three:

```ts
type Result = { ok: true; data: string } | { ok: false; error: string };

// unknown in: JSON from an untrusted source
const raw: unknown = '{"ok":true,"data":"hello"}';

function parseResult(x: unknown): Result | never {
  if (typeof x !== 'object' || x === null) return { ok: false, error: 'not an object' };
  if (!('ok' in x)) return { ok: false, error: 'missing ok' };
  return { ok: true, data: String((x as { data?: unknown }).data ?? '') };
}

const parsed: Result = parseResult(raw); // unknown → narrowed → Result
console.log(parsed);

// any — the escape hatch, deliberately avoided above
const anything: any = parsed;
console.log('still compiles with any:', anything.ok);
```

Output:

```text
{ ok: true, data: 'hello' }
still compiles with any: true
```

```narrate
line 5: unknown in — the untrusted input is typed unknown, not any
line 8: parseResult narrows unknown to Result, returning never on impossible paths
line 13: the safe value flows on as Result; any only appears where we choose to escape
```

## 14. Performance Notes

All three are **compile-time only** — zero runtime cost. The interesting performance story
is negative: `any` has no compile-time cost but pushes failures to runtime (which costs
everything); `unknown` trades a little checking time for correctness; `never` costs nothing.
At runtime there is no difference at all between the three — the emitted JavaScript is
identical. `unknown`'s only "cost" is the extra guard code you write, which is the point.

## 15. Debugging Scenarios

**"`'value' is of type 'unknown'` everywhere."** You're using the value without narrowing.
Add a guard (`typeof`, `in`, a custom type predicate) before use — that's the feature, not
a bug.

**"I can't get rid of the `any` without breaking 40 call sites."** That's a migration
signal: start with `unknown` at the boundary, add guards, and type the smallest
surface area. `any` confined to one function beats `any` flowing through forty.

**"My exhaustive switch no longer errors when I add a member."** The `default` branch is
probably missing `assertNever`, or the function's parameter is typed more broadly than
`never`. Add the `(x: never) => never` helper and the error returns.

**"`const x = []` won't let me push."** Strict mode inferred `never[]`. Annotate it —
`const x: string[] = []` — and the push is fine.

## 16. Quick Revision Notes

- `any` — checks off; use at the edge, contain it
- `unknown` — everything fits in, nothing comes out until narrowed
- `never` — zero values; inferred, never held
- Narrow `unknown` with guards (Lesson 33) before touching it
- `assertNever` in the `default` of an exhaustive switch
- `any` is assignable to `never` — the one exception
- `never | T` collapses to `T`; `unknown | T` collapses to `unknown`
- `const x = []` is `never[]` in strict mode
- All three are compile-time only — no runtime footprint

## 17. Cheat Sheet

```ts
// any — escape hatch, no checks
let anything: any = 1;
anything.foo.bar;            // ✅ compiles, 💥 at runtime

// unknown — safe top type, must narrow
let safe: unknown = { x: 1 };
if (typeof safe === 'object' && safe !== null) {
  // safe is usable here
}

// never — uninhabitable, inferred not held
type Bottom = never;
function fail(): never { throw new Error('nope'); }

// the exhaustive-check pattern
function assertNever(x: never): never {
  throw new Error(`Unexpected: ${JSON.stringify(x)}`);
}
```

## 18. Key Takeaways

> [!RECAP]
> - `any` disables checking — use it as a contained escape hatch, not a lifestyle
> - `unknown` is the safe top type: everything in, nothing out until narrowed
> - `never` is the bottom type — no value exists; you infer it, you never hold it
> - Narrow `unknown` at the boundary with type guards from Lesson 33
> - `assertNever` makes exhaustive switches self-policing
> - `any` is assignable to `never`; `never | T` is `T`; `unknown | T` is `unknown`
> - All three cost nothing at runtime — the choice is purely about checking

## Check your understanding

Answer these without looking back.

1. Give the one-sentence difference between `any`, `unknown` and `never`.
2. Why can't you use an `unknown` value directly — and how do you make it usable?
3. What's the difference between `never` and `undefined`?
4. Write the `assertNever` pattern and explain what it protects against.
5. Why is `any` assignable to `never`?
6. What does `unknown | string` collapse to? What does `never | string` collapse to?
7. Where would you use `unknown` in a real codebase instead of `any`?

## What's Next

**Lesson 46 — tsconfig & Strict Mode.** What `strictNullChecks` actually turns on, and why
teams stage the migration.
