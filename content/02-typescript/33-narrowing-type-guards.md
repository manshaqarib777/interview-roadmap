# Lesson 33 — Narrowing & Type Guards

**Interview importance:** ⭐⭐⭐⭐ — how you turn an unknown API response into something
safe to use.

Types describe the shape of your data, but data that enters your program at runtime —
API responses, `JSON.parse` output, form values — doesn't carry types. Narrowing is how
you go from "this could be anything" to "this is a `string`" (or a `User`, or an
`Admin`) using ordinary runtime checks, and the compiler tracks those checks for you.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain narrowing as "the compiler tracks your runtime checks"
- Use `typeof`, `instanceof`, `in`, and `Array.isArray` to narrow values
- Narrow discriminated unions on their literal field (Lesson 32's pattern)
- Write a custom type predicate (`x is T`) and validate an unknown API response
- Handle `unknown` safely instead of casting it to `any`

## 1. One-line definition

**Narrowing is the compiler watching your ordinary runtime checks and shrinking a
value's type to what those checks prove — and a type guard is a function that makes
that narrowing reusable.**

## 2. Mental model

A security checkpoint that stamps your badge.

The front door hands you a box stamped **`unknown`** — "we don't know what's inside".
You inspect it: "is it a string?" stamp. "Is it an array?" stamp. Each check that passes
changes the stamp, and TypeScript remembers exactly which stamps the box has acquired.
A type guard is a trained inspector — one named, reusable function whose stamp the
compiler trusts.

## 3. Visual flow

```text
 API response  ──►  unknown / any       (untrusted at the boundary)
                       │
     typeof x === 'string'  ──►  string
     typeof x === 'number'  ──►  number
     Array.isArray(x)      ──►  unknown[]   →  then narrow elements
     x instanceof Date     ──►  Date
     'kind' in x           ──►  the member that has `kind`
     x.kind === 'ok'       ──►  the `{ status: 'ok'; ... }` member

 each runtime check narrows the type; the compiler tracks it
 for the rest of the block, and re-widens after the block ends
```

## 4. How it works

Narrowing is the compiler *recomputing the type* after each check. The checks are plain
JavaScript — `typeof`, `instanceof`, `in`, `.isArray` — and the types follow:

### `typeof`

```ts
function describe(value: string | number): string {
  if (typeof value === 'string') {
    return `string: ${value.toUpperCase()}`;   // ✅ narrowed to string
  }
  return `number: ${value.toFixed(2)}`;        // ✅ narrowed to number
}

console.log(describe('hi'));
console.log(describe(3.14159));
```

Output:

```text
string: HI
number: 3.14
```

Inside the `if`, `value` is a `string`; after it, a `number`. The type follows the
runtime truth. After the block, the union returns.

> [!NOTE]
> `typeof` only narrows the *primitive* types — `string`, `number`, `boolean`,
> `symbol`, `bigint`, `function`. For everything else it returns `'object'`, which
> tells you nothing about which object shape you have — that's `in`, `instanceof`, and
> predicates.

### `Array.isArray`

```ts
function firstItem(x: string | string[]): string {
  if (Array.isArray(x)) {
    return x[0];          // ✅ narrowed to string[]
  }
  return x;               // ✅ narrowed to string
}

console.log(firstItem(['a', 'b']));
console.log(firstItem('solo'));
```

Output:

```text
a
solo
```

`Array.isArray` is itself a type guard — the compiler recognises it and narrows to
`string[]` (with `unknown[]` for an `unknown` input).

### `instanceof`

```ts
function describeError(err: Error | string): string {
  if (err instanceof Error) {
    return `Error: ${err.message}`;   // ✅ narrowed to Error
  }
  return `String: ${err}`;            // ✅ narrowed to string
}

console.log(describeError(new Error('boom')));
console.log(describeError('not an error'));
```

Output:

```text
Error: boom
String: not an error
```

`instanceof` narrows to the class and *all its subclasses* — handy for DOM types
(`instanceof HTMLInputElement`) and for distinguishing your own class instances.

### The `in` operator

`in` narrows by *property presence* — the correct tool for object shapes:

```ts
type Fish = { swim: () => string };
type Bird = { fly: () => string };

function move(pet: Fish | Bird): string {
  if ('swim' in pet) {
    return pet.swim();    // ✅ narrowed to Fish
  }
  return pet.fly();       // ✅ narrowed to Bird
}

console.log(move({ swim: () => 'swimming' }));
console.log(move({ fly: () => 'flying' }));
```

Output:

```text
swimming
flying
```

If a property exists on only one union member, `in` narrows to that member.

> [!TIP]
> `in` checks *presence* on the object (own or inherited) — it's the closest thing to
> "does this object have this key", and it's the standard way to branch on shape.

### Discriminated-union narrowing

The pattern from Lesson 32: a literal field on every member, and `switch`/`if` on it:

```ts
type Result =
  | { status: 'ok'; data: string }
  | { status: 'error'; error: string };

function handle(r: Result): string {
  if (r.status === 'ok') {
    return `data: ${r.data}`;         // ✅ narrowed to the 'ok' member
  }
  return `error: ${r.error}`;         // ✅ narrowed to the 'error' member
}

console.log(handle({ status: 'ok', data: 'payload' }));
console.log(handle({ status: 'error', error: 'boom' }));
```

Output:

```text
data: payload
error: boom
```

The literal `status` is the *discriminant*: once the runtime check proves it's `'ok'`,
the compiler knows the whole value is the `'ok'` member and unlocks `data`. Combined
with `switch` and an exhaustive `never` default (Lesson 32), this handles every case
and proves it.

```narrate
line 7: checking r.status === 'ok' narrows the union to the ok member
line 9: after the if, the only remaining member is the error member
```

## 5. Real project usage

The daily job of a frontend developer: an API response arrives, and nobody typed it for
you. First `unknown`, then narrow:

```ts
function parseUser(raw: unknown): { id: number; name: string } {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('not an object');
  }
  const obj = raw as Record<string, unknown>;
  if (typeof obj.id !== 'number' || typeof obj.name !== 'string') {
    throw new Error('bad shape');
  }
  return { id: obj.id, name: obj.name };   // ✅ every field proven
}

console.log(parseUser({ id: 1, name: 'Mansha' }));
```

Output:

```text
{ id: 1, name: 'Mansha' }
```

`typeof raw !== 'object' || raw === null` first rules out primitives and `null` (both
`typeof`-report `'object'`), then each field is validated before being trusted. This is
hand-rolled runtime validation — the same discipline libraries like Zod formalise.

> [!TIP]
> `typeof null === 'object'` — a JS quirk. When narrowing `unknown` objects, check
> `raw === null` explicitly; it's the null check people forget.

## 6. Interview explanation

> Narrowing means the compiler tracks your runtime checks: after `typeof x ===
> 'string'`, it treats `x` as a `string` for the rest of that block. The main guards are
> `typeof` (primitives), `instanceof` (classes), `in` (property presence), and
> `Array.isArray` (arrays). For unions of objects, a literal discriminant field lets
> you narrow by value. When the built-ins aren't enough, I write a type predicate — a
> function returning `x is T` — which validates an `unknown` API response field by
> field and then gives the result a safe type.

## 7. Senior-level insights

A senior answer adds *where the trust boundary is*:

- **Narrowing only works on types that have something to narrow.** A value typed `any`
  can't be narrowed usefully — it stays `any`. That's why the safe boundary type is
  `unknown`: it forces you to prove the shape before use, and `any` is the exact shape
  of "no proof required".
- **Guards compose into a contract.** A well-written predicate like `isUser(x)` is
  documentation and runtime validation at once. Teams that take this seriously build a
  schema layer (Zod, io-ts) that *generates* the predicate from the type.
- **`unknown` is your friend at every boundary.** `JSON.parse`, fetch responses, DOM
  reads, `localStorage` — type them `unknown` and narrow, rather than asserting with
  `as`, which is a promise the compiler can't verify.
- **`as` is the escape hatch, not the default.** `as` is how you *assert* a type
  without proving it — the compiler takes your word. Prefer narrowing that proves; use
  `as` only when you know something the compiler can't (e.g. after a guard you've
  already verified by hand).

## 8. Common mistakes

**Narrowing `null` with `typeof`.** `typeof null` is `'object'`, so
`if (typeof x === 'object')` does *not* exclude `null`:

```ts
function len(x: string | null): number {
  // if (typeof x === 'string') return x.length;   // ✅ fine
  return x === null ? 0 : x.length;                // ✅ explicit null check
}

console.log(len('hi'), len(null));
```

Output:

```text
2 0
```

`typeof` has no `'null'` result. For nullable values, check `x === null` directly.

**Checking `typeof x === 'object'` to identify a shape.** It only proves "not a
primitive, not a function" — `null`, arrays, and every object all pass. For arrays use
`Array.isArray`; for shapes use `in`, a discriminant, or a predicate.

**Reaching for `as` instead of narrowing.** Casting skips the proof:

```ts
const raw: unknown = JSON.parse('{"id":1}');
// const user = raw as { id: number };   // ⚠️ a promise, not a proof
```

If the runtime value is missing `id`, the cast doesn't throw — it silently hands you
`undefined` later. A real guard checks the shape at runtime and fails fast.

**Forgetting that narrowing is block-scoped.** A guard narrows the current block only:

```ts
function f(x: string | null): number {
  if (x) return x.length;   // ✅ narrowed here
  return 0;                 // narrow doesn't leak past the block
}
```

Output:

```text
(compiles — each block narrows independently)
```

The moment control leaves the block, the union is restored.

> [!PITFALL]
> **`unknown` is not `any`.** `unknown` forces you to prove the shape before use —
> it's "I don't know what this is, check it". `any` is "I don't care, no checking
> ever". Every untrusted boundary should be typed `unknown`; `any` there is how type
> safety quietly leaks out of a codebase.

## 9. Best practices

✅ Type every external boundary as `unknown`, then narrow before use

✅ Use `typeof` for primitives, `instanceof` for classes, `in` for shape, `Array.isArray` for arrays

✅ Give discriminated unions a literal field and narrow with `switch`

✅ Write a `x is T` predicate for shapes you validate more than once

✅ Check `null` explicitly — `typeof` can't do it

❌ Don't cast `unknown` with `as` when a guard can prove the type

❌ Don't use `typeof x === 'object'` to mean "this is my object type"

❌ Don't rely on a narrow from one block outside that block

## 10. Interview questions

**Q1. What is narrowing in TypeScript?**

> The compiler tracking runtime checks and shrinking the type accordingly. After
> `typeof x === 'string'`, `x` is treated as a `string` in that block; after
> `Array.isArray(x)`, as an array. The type follows the control flow and re-widens
> when the block ends.

**Q2. What type guards does TypeScript recognise?**

> The built-ins: `typeof` (primitives), `instanceof` (class instances), `in`
> (property presence), and `Array.isArray` (arrays). Plus truthiness and equality
> checks like `x === null` and `x.kind === 'ok'` — and user-defined predicates of the
> form `x is T` for anything custom.

**Q3. How do you narrow a discriminated union?**

> Check the discriminant — the literal field every member shares. If
> `r.status === 'ok'`, the compiler knows the whole value is the `'ok'` member and
> unlocks its fields. `switch` on the discriminant handles every member, and a `never`
> default proves exhaustiveness.

**Q4. What is a type predicate?**

> A function whose return type is `x is T` — "this function proves `x` is a `T`". The
> compiler trusts the predicate wherever the function is used, so one well-written
> guard can validate an `unknown` API response once and be reused across the app.

**Q5. What's the difference between `unknown` and `any`?**

> `unknown` is "could be anything — prove it before use". The compiler forces you to
> narrow it. `any` is "no checking at all" — it disables the type system for that
> value. Every external boundary should be `unknown`; `any` is how safety leaks away.

**Senior follow-up: How do you validate an API response in TypeScript?**

> I type the fetch result as `unknown`, then pass it through a validator. For a simple
> shape, hand-written narrowing: check it's an object, that it's not `null`, then
> validate each field with `typeof` checks, throwing on mismatch. For shapes used
> across the app, I write a type predicate `isUser(x): x is User` so the proof is
> reusable — and on teams that do this a lot, I'd use a schema library like Zod, which
> derives the validator from a schema and keeps the runtime check in sync with the type.

## 11. Follow-up questions

**Q: When does narrowing fail?**

> When the type has nothing concrete to narrow — `any` never narrows. When the guard
> doesn't prove anything the compiler can use, like `typeof x === 'object'` for a
> specific shape. And when the value is `unknown` but you skip the proof and use `as`
> instead — that's assertion, not narrowing.

**Q: Can a predicate be wrong?**

> Yes — a type predicate is only as trustworthy as its implementation. If `isUser` has
> a bug and returns `true` for a non-user, the compiler believes it, and the bad value
> flows on with a `User` type. That's why predicates should validate every field you
> rely on, and why schema libraries are worth it when validation is central.

**Q: Why does the type re-widen after a block?**

> Because control flow may exit the block and come back through a different path — the
> guard proved nothing about the value outside its own block. Inside the `if`, the
> type is narrow; outside, the original union is restored. That's the same reason
> narrowing is per-block.

## 12. Comparison table

| Guard | Syntax | Narrows to | Use for |
|---|---|---|---|
| `typeof` | `typeof x === 'string'` | A primitive type | Strings, numbers, booleans |
| `instanceof` | `x instanceof Date` | A class (and subclasses) | Class instances, DOM types |
| `in` | `'swim' in x` | The member that has the key | Object shapes, union members |
| `Array.isArray` | `Array.isArray(x)` | Array type | Arrays (and `unknown[]` from `unknown`) |
| Equality | `x === null` / `x.kind === 'ok'` | Literal / discriminant member | Null checks, discriminated unions |
| Truthiness | `if (x)` | Non-falsy subset | Guarding against `null`/`undefined`/`0`/`''` |
| Predicate | `function isT(x): x is T` | Your custom type | Reusable shape validation |

## 13. Code example

A complete program that turns an `unknown` API response into a typed value using a
reusable predicate:

```ts
type User = { id: number; name: string };

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.id === 'number' && typeof obj.name === 'string';
}

function getUsers(raw: unknown): User[] {
  if (!Array.isArray(raw)) throw new Error('expected an array');
  return raw.filter(isUser);      // ✅ each element now proven to be a User
}

const response: unknown = [
  { id: 1, name: 'Mansha' },
  { id: 'nope' },                 // filtered out — not a User
];

console.log(getUsers(response));
```

Output:

```text
[ { id: 1, name: 'Mansha' } ]
```

`isUser` is a type predicate: inside `filter`, the compiler trusts it, so `raw.filter(
isUser)` is a `User[]`. The invalid entry is dropped by the runtime check, and the
result is safe to use.

```narrate
line 4: the predicate signature — the compiler treats a truthy return as proof of User
line 5-7: the actual runtime validation every field must pass
line 11: Array.isArray narrows unknown to unknown[], then filter(isUser) narrows to User[]
```

## 14. Performance notes

Narrowing is **zero-cost at runtime** — the checks are the same `typeof`/`instanceof`
calls you'd write in plain JavaScript anyway. The type-level narrowing is erased.

The only runtime cost is the *validation itself*, which is exactly the cost of being
correct:

- A hand-written guard runs in O(fields) — negligible for typical payloads.
- Predicates used in `filter` run once per element; that's the job they're doing.
- Schema libraries (Zod) add a dependency and slightly more allocation, but the checks
  are still ordinary JavaScript.
- TypeScript never emits runtime type checks — if you want them, you write the guard
  explicitly. That explicitness is the point.

## 15. Debugging scenarios

**"`Property 'data' does not exist on type 'Failure'` — but I checked `status`."** The
check is outside the block where you read `data`, or the discriminant literal doesn't
match the member exactly. Put the check and the read in the same block, and make sure
the literals match character-for-character.

**"Narrowing never happens on my `unknown`."** `unknown` narrows fine — but only with
real checks. If you `as`-cast it to `any` first, checking is disabled. Remove the cast
and narrow the `unknown` directly.

**"`typeof x === 'object'` lets `null` through."** Right — `typeof null` is
`'object'`. Add `x === null` to the guard, or use a predicate that rejects nulls
explicitly.

**"My predicate passes but the value crashes at runtime."** The predicate is lying —
it returned `true` for a value that isn't a `User`. Fix the validation (add the
missing field checks), because the compiler now trusts the predicate's word.

> [!TIP]
> When a value arrives from `fetch` or `localStorage` and the types "just work", check
> whether someone `as`-cast it — that's an unverified promise. Type it `unknown` and
> narrow, and the compiler will tell you exactly where the real risk is.

## 16. Quick revision notes

- Narrowing = the compiler tracking runtime checks and shrinking the type per block
- Guards: `typeof` (primitives), `instanceof` (classes), `in` (shape), `Array.isArray` (arrays)
- Discriminated unions narrow on a literal field via `switch`/`if`
- Predicates (`x is T`) make narrowing reusable — validate once, trust everywhere
- `unknown` at every boundary; `as` only when you can't prove but must assert
- `typeof null === 'object'` — always check `null` explicitly
- Narrowing is block-scoped; types re-widen after the block
- Predicates are only as safe as their implementation — validate every field

## 17. Cheat sheet

```text
primitives:   if (typeof x === 'string')   // string | number → string
classes:      if (x instanceof Error)      // Error | string → Error
shape:        if ('swim' in pet)           // Fish | Bird → Fish
arrays:       if (Array.isArray(x))        // → unknown[] / T[]
null:         if (x === null)              // typeof can't do this
truthy:       if (x)                       // rules out null/undefined/0/''
discriminant: switch (r.status) { case 'ok': r.data ... case 'error': r.error ... }
predicate:    function isUser(v: unknown): v is User { ... }
boundary:     const raw: unknown = await fetch(url).then(r => r.json());
use:          if (isUser(raw)) { raw.name }   // ✅
assert:       raw as User                     // ⚠️ unverified promise — last resort
```

## 18. Key takeaways

> [!RECAP]
> - Narrowing is the compiler tracking runtime checks — types follow the control flow
> - `typeof`, `instanceof`, `in`, and `Array.isArray` cover the common cases
> - Discriminated unions narrow on a literal field; use `switch` for exhaustive handling
> - Type predicates (`x is T`) make validation reusable and trustworthy
> - Type every external boundary as `unknown`, then narrow — not `any`, not `as`
> - `typeof null === 'object'`: always check null explicitly
> - Guards run at runtime, which is the point — types alone protect nothing at the boundary

## Check your understanding

Answer these without looking back.

1. What does "the compiler tracks your runtime checks" mean, concretely?
2. Name the four built-in guards and what each narrows to.
3. Why does `typeof x === 'object'` not prove `x` is your object type?
4. How do you narrow a discriminated union, and what does it unlock?
5. Write the signature of a type predicate. When is one worth writing?
6. What is the difference between `unknown` and `any` at a boundary?
7. Why is a predicate only as safe as its implementation?

## What's Next

**Lesson 34 — Functions & Overloads.** You'll learn how to type parameters, returns and
`this`, why overloads are a compile-time feature, and how function types — which you've
already seen as properties in Lesson 31 — work as first-class citizens.
