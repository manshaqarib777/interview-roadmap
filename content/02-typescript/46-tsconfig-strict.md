# Lesson 46 — tsconfig & Strict Mode

**Interview importance:** ⭐⭐ — asked as "what does strict mode actually do?", more than as a
quiz on every flag.

Every TypeScript project starts with a `tsconfig.json`, and most interviews that touch it
boil down to one question: *what does `strict` turn on?* The honest answer is a handful of
flags, led by `strictNullChecks` — and the follow-up is why teams migrate to strict in
stages rather than flipping the switch. This lesson gives you the flags, the migration
story, and the vocabulary to talk about both.

## Learning Objectives

By the end of this lesson you should be able to:

- List the flags `strict` enables, and say what each one catches
- Explain what `strictNullChecks` changes about `null` and `undefined`
- Explain what `noImplicitAny` catches and why it matters in migration
- Explain what `noUncheckedIndexedAccess` does to array/object indexing
- Explain why teams stage a strict migration — and how

## 1. One-line Definition

**`strict` is a single flag that enables a family of checks — led by `strictNullChecks` and
`noImplicitAny` — so the compiler catches what it otherwise silently ignores.**

## 2. Mental Model

Think of `strict` as the compiler's **opinionated mode**: the difference between a compiler
that only reports what it's *certain* about, and one that reports what is *very likely a
bug*. Each flag is one lens — `strictNullChecks` demands you handle `null`/`undefined`
explicitly, `noImplicitAny` refuses silent `any`, `noUncheckedIndexedAccess` refuses to
pretend `arr[i]` is definitely there.

```text
            tsconfig.json
    ┌────────────┴────────────┐
    │      "strict": true     │
    └────────────┬────────────┘
                 │ enables
    ┌────────────┼─────────────────────────┐
    │            │                         │
    ▼            ▼                         ▼
strictNullChecks   noImplicitAny   noUncheckedIndexedAccess
null/undefined     silent any      arr[i] might be undefined
must be handled    is an error      — handle it
```

## 3. Visual Flow

```text
With strictNullChecks OFF          With strictNullChecks ON
─────────────────────────          ─────────────────────────
let s: string;                     let s: string;
s = null;        ✅ silent         s = null;   💥 Type 'null' is not
s = undefined;   ✅ silent                       assignable to 'string'

let n: number | null = 5;
n.toFixed();     ✅ silent         n.toFixed(); 💥 'n' is possibly 'null'
                                   // narrow first: if (n !== null) …
```

That one flag changes the meaning of every nullable type in your codebase.

## 4. How It Works

`strict` is shorthand. These are the flags it turns on in a modern TypeScript:

```ts
{
  "compilerOptions": {
    "strict": true,
    // which is exactly:
    "strictNullChecks": true,          // null/undefined are not silently in every type
    "noImplicitAny": true,             // a param that fell back to any is an error
    "strictFunctionTypes": true,       // function params are checked contravariantly
    "strictBindCallApply": true,       // bind/call/apply are type-checked
    "strictPropertyInitialization": true, // class fields must be initialised
    "noImplicitThis": true,            // this in callbacks isn't silently any
    "useUnknownInCatchVariables": true // catch (e) is unknown, not any (Lesson 45)
  }
}
```

Output:

```text
(all seven flags are implied by "strict": true)
```

### `strictNullChecks` — the big one

```ts
// With strictNullChecks: false, this compiles:
let maybe: string = null;
maybe.toUpperCase(); // 💥 at runtime: TypeError

// With strict: true, the errors are caught at compile time:
let maybe: string = null; // 💥 Type 'null' is not assignable to type 'string'
```

The effect: `null` and `undefined` are no longer assignable to *every* type. You must
narrow, or type the union explicitly (Lesson 33).

### `noImplicitAny` — no silent escapes

```ts
// Without it, this compiles — `x` is silently any:
function greet(x) {
  return x.toUpperCase(); // type of x: any
}

// With it: 💥 Parameter 'x' implicitly has an 'any' type
```

A bare parameter that can't be inferred is an error, not a silent `any`.

### `noUncheckedIndexedAccess` — indexing might be missing

```ts
// With strict only, this compiles:
const arr: number[] = [1, 2, 3];
const first = arr[0]; // type: number — but arr might be empty at runtime!

// With noUncheckedIndexedAccess: true:
const first = arr[0]; // type: number | undefined  ← forces a check
```

The same applies to object index access: `config[key]` becomes `T | undefined`.

## 5. Real Project Usage

| Flag | What it catches in real code |
|---|---|
| `strictNullChecks` | `user.address.city` crashes when `address` is `null` — the #1 runtime crash |
| `noImplicitAny` | A refactor that silently turned a param into `any` and shipped |
| `noUncheckedIndexedAccess` | `rows[i].id` when `rows` is empty — an off-by-one at runtime |
| `strictPropertyInitialization` | A class field used before `constructor` assigned it |
| `useUnknownInCatchVariables` | `catch (e)` — `e.message` now requires narrowing first |

The migration story — why teams stage it:

```text
Typical staged rollout
──────────────────────
1.  "strict": true          — flip it, watch the errors pour out
2.  noImplicitAny first     — every `any` is now visible and fixable
3.  strictNullChecks next   — the big one; nullable types get unions
4.  noUncheckedIndexedAccess last — most invasive, most new errors
5.  ship, then keep strict  — no flag is ever turned off again
```

## 6. Interview Explanation

> `strict` turns on a family of checks. The headline is `strictNullChecks`: without it,
> `null` and `undefined` are assignable to every type, so `user.address` compiles even when
> `address` might be null — and the crash happens in production. `noImplicitAny` makes an
> un-annotated, un-inferable parameter an error instead of a silent `any`.
> `noUncheckedIndexedAccess` makes `arr[i]` and `obj[key]` `| undefined` because the value
> might genuinely be missing. Teams migrate in stages — `noImplicitAny` first because it's
> mechanical, `strictNullChecks` after because it changes types everywhere, and
> `noUncheckedIndexedAccess` last because it surfaces the most new errors.

## 7. Senior-Level Insights

- **`strict` is a promise, not a setting.** Once a team adopts it, every future PR has to
  handle nullables and can't sneak in `any`. That's the real value — not the first compile
  run, but the next five years.
- **`strictNullChecks` changes the *meaning* of a type.** `string` means "always a string".
  Nullability must be written into the union: `string | null`. Teams that skip this
  migration are living with the ambiguity forever.
- **Stage it by flag, not by file-count.** `noImplicitAny` first (mechanical), then
  `strictNullChecks` (the invasive one), then the rest. Some teams use `@ts-expect-error` /
  `@ts-ignore` as temporary scaffolding, tracked and removed — not as a permanent habit.
- **`noUncheckedIndexedAccess` is the "what's really there" flag.** It surfaces the
  difference between what your code *assumes* and what the data actually guarantees. Worth
  the noise, because it's naming real crashes.
- **The 0.1% rule.** You can always turn a single flag off with a comment and an issue — but
  each exception should be a decision, not a default.
- **Know the older-flag trivia.** `strict` existed before some flags did; on older versions
  `useUnknownInCatchVariables` was separate. Saying "strict enables seven flags today"
  signals you've actually read a `tsconfig`.

## 8. Common Mistakes

❌ Thinking `strictNullChecks` *allows* `null` — it's the opposite. It makes `null` and
`undefined` explicit in unions instead of silently everywhere.

❌ Using `as` to silence strict errors instead of narrowing:

```ts
const x = maybe as string;   // ❌ tells the compiler to shut up
// vs: if (maybe === null) return;  // ✅ handles the real case
```

❌ Adding `// @ts-ignore` above strict errors and shipping — that's a runtime crash with
extra steps.

❌ Flipping `strict: true` on a legacy codebase with zero plan and expecting the compiler to
fix it.

❌ Forgetting `noUncheckedIndexedAccess` when you *do* have it on — the extra
`| undefined` on every index is a feature, not a compiler bug.

❌ Typing every nullable as `any` to "get through" the migration — you've kept the bug and
lost the safety.

## 9. Best Practices

✅ Start every new project with `"strict": true` — the defaults are the safety floor

✅ Make `null`/`undefined` explicit in your types (`string | null`) instead of relying on
loose checks

✅ Use type guards and early returns (Lesson 33) rather than casts to narrow strict errors

✅ For a legacy migration: `noImplicitAny` → `strictNullChecks` → the rest, in that order

✅ Annotate empty collections (`const x: string[] = []`) so `never[]` doesn't bite (Lesson 45)

✅ Treat `arr[i]` and `obj[key]` as possibly-`undefined` when `noUncheckedIndexedAccess` is on

❌ Don't disable strict flags project-wide for convenience — scope exceptions to a file and
an issue

❌ Don't use `@ts-ignore` to absorb errors you haven't understood

## 10. Interview Questions

**Q1. What does `"strict": true` actually turn on?**

> It's shorthand for a family of checks. The headline is `strictNullChecks` — without it,
> `null` and `undefined` are assignable to every type, so crashes happen at runtime instead
> of compile time. It also enables `noImplicitAny`, which makes an un-annotated parameter an
> error; `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`,
> `noImplicitThis` and `useUnknownInCatchVariables`. Together they catch the silent bugs a
> loose compiler lets through.

**Q2. What does `strictNullChecks` change?**

> Without it, `null` and `undefined` are valid values for every type — `string` might hold
> `null` and the compiler won't complain. With it, a type only includes what it says, so
> you write `string | null` explicitly, and you have to narrow before using the value. That
> one flag moves most null-related crashes from runtime to compile time.

**Q3. What is `noImplicitAny`?**

> If a parameter (or other position) can't be inferred and has no annotation, TypeScript
> silently types it `any` unless this flag is on. With `noImplicitAny`, that silent `any` is
> an error, so every escape hatch is a visible, deliberate decision — not an accident.

**Q4. Why would you turn on `noUncheckedIndexedAccess`?**

> Because `arr[i]` and `obj[key]` might genuinely not exist. The flag types the result as
> `T | undefined`, forcing you to handle the missing case. The extra errors it surfaces are
> real crashes the code was already about to have.

**Q5. How would you migrate an old codebase to strict?**

> In stages, by flag. `noImplicitAny` first — it's mechanical: annotate the parameters it
> flags. Then `strictNullChecks`, the invasive one: nullable types become explicit unions,
> and the fixes are mostly narrowing and early returns. Then the rest. Keep
> `noUncheckedIndexedAccess` for last or skip it initially — it surfaces the most new
> errors. Once each stage compiles, never turn the flag off again.

**Senior follow-up: What are the two biggest behaviour changes you'd expect during a strict
migration?**

> First, `strictNullChecks` changes what existing types *mean* — `string` no longer
> includes `null`, so every place that assumed a value was there starts erroring until the
> nullability is made explicit or narrowed. Second, `noImplicitAny` changes what's *allowed*
> — a whole class of "it compiled because it was `any`" code becomes visible. The first is
> about types, the second about discipline. Teams that start with `noImplicitAny` fix the
> discipline first, then face the type change with a compiler that actually tells the truth.

## 11. Follow-up Questions

**Why is `strictNullChecks` the "big one" in migrations?**

> Because it changes the meaning of nearly every type in the codebase. `string` stops
> silently including `null`, so hundreds of sites error at once — it's the flag with the
> widest blast radius, and the one where staging matters most.

**Does `strict` make code slower at runtime?**

> No. Strictness is compile-time only. The emitted JavaScript is identical; the flags only
> change what the compiler reports. The runtime gains come from the crashes you now catch.

**What's the difference between `strict` and `noImplicitAny` alone?**

> `noImplicitAny` is one flag; `strict` enables seven, including it. You can use
> `noImplicitAny` without `strict` — but strict is the package that also handles
> nullability, function variance, and `this`.

**Should a new project ever *not* be strict?**

> Almost never. Strict is the default recommendation for new code. The exceptions are
> short-lived experiments or interop-heavy files — and even those usually get strict within
> a sprint.

## 12. Comparison Table

| Flag | What it catches | Migration difficulty |
|---|---|---|
| `strictNullChecks` | null/undefined sneaking into every type | hard — changes type meanings |
| `noImplicitAny` | silent `any` on un-annotated positions | easy — mechanical annotations |
| `strictFunctionTypes` | unsound function parameter assignments | medium |
| `strictPropertyInitialization` | class fields used before init | easy — constructor or definite-assignment |
| `noImplicitThis` | `this` typed as `any` in callbacks | medium |
| `strictBindCallApply` | mis-typed `bind`/`call`/`apply` | easy |
| `useUnknownInCatchVariables` | `catch (e)` as `any` | easy — narrow or cast |
| `noUncheckedIndexedAccess` | missing array/object entries | medium-hard — most new errors |

## 13. Code Example

A file that only compiles under a loose config — then the strict errors, one by one:

```ts
// task: make this compile under "strict": true

function describe(x: unknown, rows: string[]) {
  console.log((x as { label?: string }).label?.toUpperCase()); // okay — optional chain
  const first = rows[0]; // 💥 with noUncheckedIndexedAccess: string | undefined
  if (typeof first === 'undefined') return 'no rows';
  return first.toUpperCase();
}

console.log(describe({ label: 'hi' }, ['a', 'b']));
console.log(describe(null, []));
```

Output:

```text
HI
no rows
```

```narrate
line 3: optional chaining handles a possibly-missing property safely
line 4: with noUncheckedIndexedAccess, rows[0] is string | undefined — checked on line 5
line 8: describe(null, …) — the guard returns before touching first
```

The code was written *for* strict from the start: optional chaining, explicit
`undefined` check, no silent `any`. That is what a strict-first codebase looks like.

## 14. Performance Notes

All strictness flags are **compile-time only** — zero runtime cost, identical emitted
JavaScript. The only "cost" is developer time during the migration, which is why staging
matters. `noUncheckedIndexedAccess` adds the most noise per line, so it's the one teams
sometimes defer — but each extra `| undefined` is naming a crash the runtime would have
found the expensive way.

## 15. Debugging Scenarios

**"'X' is possibly 'null' everywhere after enabling strict."** That's `strictNullChecks`
doing its job. The fix is narrowing: guard with `if (x === null) return`, early-return,
optional chain (`x?.field`), or make the type explicitly `string | null` where null is
legitimate.

**"'Parameter 'x' implicitly has an 'any' type'."** `noImplicitAny` found a position with
no inference. Annotate it — that's the whole fix — or if it's genuinely untyped, make the
`any` explicit and deliberate.

**"'x' is possibly 'undefined' on `arr[i]`."** `noUncheckedIndexedAccess`. Check the index,
or use a loop that guarantees existence, or accept the `| undefined` and handle it.

**"I added `@ts-ignore` and it didn't silence anything."** If the line below is an unused
`@ts-ignore`, TS flags it with `ts(2578)` — the comment doesn't match an error. Prefer
`@ts-expect-error`, which errors if nothing was suppressed, so stale suppressions surface.

## 16. Quick Revision Notes

- `strict` = seven flags: `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`,
  `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`,
  `useUnknownInCatchVariables`
- `strictNullChecks`: null/undefined not in every type; must narrow
- `noImplicitAny`: silent `any` is an error
- `noUncheckedIndexedAccess`: `arr[i]` / `obj[key]` → `T | undefined`
- Migration order: `noImplicitAny` → `strictNullChecks` → rest → maybe index access last
- All flags compile-time only — zero runtime cost
- Prefer `@ts-expect-error` over `@ts-ignore`; both should be temporary
- `const x = []` is `never[]` under strict — annotate it

## 17. Cheat Sheet

```ts
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,                    // the whole family, in one flag
    "noUncheckedIndexedAccess": true,  // opt-in extra: arr[i] is T | undefined
    "moduleResolution": "bundler",
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

```ts
// strict-first habits
let name: string | null = null;          // nullability explicit
if (name === null) return;               // narrow before use
const item = rows[0];                    // string | undefined under index-access flag
const first: string = rows[0] ?? '';     // handle the missing case
```

## 18. Key Takeaways

> [!RECAP]
> - `strict` enables a family: `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`,
>   `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`,
>   `useUnknownInCatchVariables`
> - `strictNullChecks` is the headline — it makes nullability explicit and moves crashes to compile time
> - `noImplicitAny` makes silent `any` an error — visible decisions instead of accidents
> - `noUncheckedIndexedAccess` types `arr[i]` as possibly-`undefined` — it's naming real crashes
> - Migrate in stages: `noImplicitAny` → `strictNullChecks` → the rest
> - All flags are compile-time only — zero runtime cost
> - `@ts-expect-error` over `@ts-ignore`, and neither should be permanent

## Check your understanding

Answer these without looking back.

1. List the flags `strict` enables, and name the headline one.
2. What does `strictNullChecks` actually change about the type `string`?
3. What is a "silent any", and which flag makes it an error?
4. Why does `noUncheckedIndexedAccess` type `arr[0]` as `string | undefined`?
5. Describe the staged migration order and why `noImplicitAny` comes first.
6. What's the difference between `@ts-ignore` and `@ts-expect-error`?
7. Does strict mode slow down the runtime? Justify your answer.

## What's Next

**Lesson 47 — JSX.** JSX is a function call — knowing what it compiles to explains the
rules around it, and TypeScript's JSX handling will finally make sense.
