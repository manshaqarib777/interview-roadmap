# Lesson 40 — Conditional Types

**Interview importance:** ⭐⭐⭐⭐ — this is where TypeScript stops being a type checker and becomes a programming language in its own right.

Generics (Lesson 36) gave you parameters; conditional types give you *logic*. With `T extends U ? X : Y` you can branch on shapes, distribute over unions, and reach into function signatures with `infer` (Lesson 43 builds on exactly this). It's the hardest jump in the module — but once the ternary clicks, you can read — and write — the type-level code behind `Exclude`, `ReturnType` and half of modern library types.

## Learning Objectives

By the end of this lesson you should be able to:

- Read and write a conditional type
- Explain what *distributive* means and why it makes conditionals feel like a map over unions
- Predict when `never` makes a distributive result collapse
- Explain the condition's runtime cost (none) and its compile-time value
- Use conditional types to build `Exclude`, `Extract` and `NonNullable`

## 1. One-line definition

**A conditional type is a ternary that runs on types: `T extends U ? X : Y` — "if `T` is assignable to `U`, the result is `X`, otherwise `Y`."**

`extends` here is **assignability**, not inheritance — the same check `const a: U = t` would perform. The whole expression is evaluated by the compiler and resolves to a single type.

## 2. Mental model

It's the same ternary you already write in JavaScript, but the operands are types:

```ts
const msg = score > 50 ? 'pass' : 'fail';   // value-level ternary
type M   = N extends 50 ? 'pass' : 'fail';  // type-level ternary
```

Reading order matters: `T extends U ? X : Y` parses as `(T extends U) ? X : Y`. The branch chosen depends only on assignability — a pure compile-time decision.

## 3. Visual flow

```text
        T extends U ?
          │
   ┌──────┴───────┐
  yes            no
   │              │
   ▼              ▼
   X              Y

  Example: string extends string ? 'A' : 'B'
           string extends string → yes → 'A'
```

One condition, two type results, decided entirely at compile time — nothing survives to runtime.

## 4. How it works

A conditional type reads like a function: **the type parameters are inputs, the ternary is the body, and the result is the type the compiler resolves to.**

```ts
type IsString<T> = T extends string ? 'yes' : 'no';

type A = IsString<'hello'>;   // 'yes'  — 'hello' is assignable to string
type B = IsString<42>;        // 'no'   — 42 is not
type C = IsString<string>;    // 'yes'  — string extends string
```

The check is **assignability**, exactly what this would test:

```ts
function check<T>(t: T) {
  const s: string = t;        // same test the conditional performs
  return s;
}
```

> [!NOTE]
> The condition tests *whether a value of type `T` could be used where a `U` is expected* — subtype/supertype direction matters. `string extends string` is yes; `string extends 'a' | 'b'` is no (not every string is `'a'` or `'b'`).

## 5. Real project usage

**Filter a union at type level** — the implementation of `Exclude<T, U>`:

```ts
type Exclude<T, U> = T extends U ? never : T;

type Result = Exclude<'a' | 'b' | 'c', 'a'>;   // 'b' | 'c'
```

**Narrow a union to members that fit** — `Extract<T, U>`:

```ts
type Extract<T, U> = T extends U ? T : never;

type Shape = { kind: 'circle'; r: number } | { kind: 'square'; s: number };
type OnlyCircles = Extract<Shape, { kind: 'circle' }>;   // { kind: 'circle'; r: number }
```

**Clean nullable payloads** — `NonNullable<T>`:

```ts
type NonNullable<T> = T extends null | undefined ? never : T;

type Clean = NonNullable<string | null | undefined>;     // string
```

**Branch a function's behaviour on its input**:

```ts
type AsyncResult<T> = T extends Promise<infer U> ? U : T;

type A = AsyncResult<Promise<number>>;   // number
type B = AsyncResult<number>;            // number — no Promise wrapper
```

> [!TIP]
> `Exclude`/`Extract`/`NonNullable` from Lesson 39 are *not* magic — they're each one conditional type over a union, and you can write them in an interview in one line.

## 6. Interview explanation

> A conditional type is a type-level ternary: `T extends U ? X : Y`. `extends` means *assignable to*, not class inheritance — it's the same check the compiler does when you assign a value. Because a conditional over a naked type parameter *distributes*, applying it to a union runs the check against each member, which is how `Exclude<T, U>` works: `T extends U ? never : T` removes the members that match. A caveat I always watch for: a branch that yields `never` collapses out of the union result.

## 7. Senior-level insights

The junior answer defines a conditional type and stops. A senior answer shows they think in terms of **resolution strategy**:

- **The branch is chosen lazily** — the compiler only evaluates the side that's actually needed, which matters when a branch contains an expensive or recursive type.
- **Distributivity is opt-out via brackets** — `[T] extends [U]` stops distribution when you want the check against the union *as a whole* (Lesson 41's `IsUnion` pattern and `DeepReadonly` rely on this).
- **The `infer` keyword completes the language** — conditionals alone can test, but `infer` lets you *extract* (`ReturnType<T>` is `T extends (...args: any[]) => infer R ? R : never`). That pairing is Lesson 43.
- **Everything here is erased** — "does this run at runtime?" has the same answer as always: no.

## 8. Common mistakes

**Mistake 1 — writing the branches backwards.** `T extends U ? X : Y` — `X` is the *true* branch. Swapping them silently inverts every result.

**Mistake 2 — forgetting distributivity and being surprised the union "splits".**

```ts
type Filter<T> = T extends 'a' ? 1 : 2;

type Result = Filter<'a' | 'b'>;   // 1 | 2, NOT 2
```

```text
1 | 2
```

`'a'` hits the true branch, `'b'` the false branch, and the results are unioned.

**Mistake 3 — the `never` gotcha.** A distributive conditional where the true branch is `never` *drops* members instead of producing `never`:

```ts
type Drop<T> = T extends 'a' ? never : T;

type R = Drop<'a' | 'b' | 'c'>;    // 'b' | 'c' — 'a' vanished, result is NOT never
```

```text
'b' | 'c'
```

This is exactly how `Exclude` works — and it's also why `Filter<never>` resolves to `never` (distributing over `never` yields nothing).

> [!PITFALL]
> A distributive conditional over `never` produces `never`, full stop — `Exclude<never, any>` is `never`. When your generic helper mysteriously turns everything into `never`, this is the usual culprit.

**Mistake 4 — assuming a conditional is a runtime check.** `T extends U ? X : Y` is decided at compile time; it generates no branch in the emitted JavaScript.

## 9. Best practices

✅ Use a conditional when a type's shape depends on another type's shape — filtering, unwrapping, branching

✅ Write `Exclude`/`Extract`/`NonNullable` from memory — they're the three one-liners interviewers ask for

✅ Reach for a conditional instead of an overload when the return type *depends on the input type*

✅ Add a trailing fallback (`? X : never` or a sensible default) so the false branch never silently broadens to `any`

❌ Don't use a conditional where a union of the results is simpler — distribution is elegant, but over-engineering a two-member union is noise

❌ Don't forget brackets (`[T] extends [U]`) when you need the whole-union check — the default distributes

## 10. Interview questions

**Q1. What is a conditional type?**

> A type-level ternary: `T extends U ? X : Y`. `extends` means *assignable to*, the same relationship the compiler checks on assignment. If `T` is assignable to `U` the type resolves to `X`, otherwise to `Y`. It's evaluated fully at compile time and erased at runtime.

**Q2. What does "distributive" mean for conditional types?**

> When the checked type is a naked type parameter, applying the conditional to a union runs it against *each member*, then unions the results. So `Filter<'a' | 'b'>` with `T extends 'a' ? 1 : 2` gives `1 | 2`. Distribution is what makes utilities like `Exclude` work over unions.

**Q3. How is `Exclude<T, U>` implemented?**

> `type Exclude<T, U> = T extends U ? never : T;`. It distributes over `T`: matching members become `never` (and drop out of the union), non-matching members survive. `Extract` is the same idea with the branches swapped.

**Q4. Why does `Filter<never>` come out as `never`?**

> A distributive conditional distributes over `never` — and distributing over an empty union produces an empty union. That's why `never` flows through conditional types so aggressively, and why a helper that "works for everything" quietly returns `never` for `never`.

**Q5. What is `infer`, in one sentence?**

> `infer` declares a type variable inside a conditional's true branch that the compiler fills by matching: `T extends Promise<infer U> ? U : T` extracts what the promise resolves to. It's how `ReturnType` and `Parameters` (Lesson 39) are built, and it's Lesson 43's whole topic.

**Senior follow-up: How do you stop a conditional from distributing?**

> Wrap both sides in a tuple: `[T] extends [U] ? X : Y`. That changes the check from *each member* to the union as a whole. It's the standard trick behind `IsUnion<T>` and for writing `DeepReadonly` that must treat an object type as one unit.

## 11. Follow-up questions

**Is there a runtime cost?**

> No. The compiler resolves the condition and erases it. Conditional types are a compile-time language — the emitted JavaScript is identical whether you used them or not.

**Can conditionals be recursive?**

> Yes, with care — a conditional can reference itself on the `T` type parameter it's "shrinking". Recursive conditional types are how deep utilities (`DeepPartial`, `DeepReadonly`) walk nested shapes, and they're the main place where compile-time performance starts to matter.

**What happens when neither branch is chosen?**

> That can't happen — the ternary always has two branches. But the *resolved result* can be `never`, which is worth treating as the "this type is impossible" signal rather than an error.

## 12. Comparison table

| Conditional type | What it computes | Example result |
|---|---|---|
| `T extends U ? X : Y` | branch on assignability | `IsString<'a'>` → `'yes'` |
| `T extends U ? never : T` | drop matching members | `Exclude<'a'\|'b','a'>` → `'b'` |
| `T extends U ? T : never` | keep matching members | `Extract<'a'\|'b','a'>` → `'a'` |
| `T extends null \| undefined ? never : T` | drop nullish | `NonNullable<string\|null>` → `string` |
| `T extends Promise<infer U> ? U : T` | unwrap async value | `Awaited<Promise<number>>` → `number` |
| `T extends (...args: any[]) => infer R ? R : never` | extract return type | `ReturnType<typeof fn>` |

## 13. Code example

A type that picks a different shape per input kind — distribution at work:

```ts
type LoadResult<T extends string> =
  T extends 'user' ? { id: number; name: string }
  : T extends 'post' ? { id: number; title: string }
  : never;

type A = LoadResult<'user'>;               // { id: number; name: string }
type B = LoadResult<'post'>;               // { id: number; title: string }
type Both = LoadResult<'user' | 'post'>;   // union of both shapes

const a: A = { id: 1, name: 'Ali' };
const both: Both = { id: 2, title: 'Hello' };   // one member is enough

console.log(a, both);
```

```text
{ id: 1, name: 'Ali' } { id: 2, title: 'Hello' }
```

Feeding the *whole union* produces the union of all branch results — one type, three shapes, zero runtime code.

## 14. Performance notes

**Compile time is where conditional types have a cost**, and it's usually a non-issue: each conditional is a few comparisons the compiler memoises. The cost grows with recursion (deep utility types) and with *instantiation depth* — TypeScript caps recursion at ~50 levels, so a deeply recursive conditional can hit "Type instantiation is excessively deep" rather than hang. **Runtime cost is zero** — everything erases. Practical rule: prefer the built-in utilities for the common cases; reserve hand-rolled conditionals for the cases they don't cover.

## 15. Debugging scenarios

**"Type instantiation is excessively deep and possibly infinite."** Your conditional is recursing without a base case, or the recursion is too deep. Add a base branch that stops the recursion, or simplify the type.

**"Type 'X' does not satisfy the constraint."** The checked type doesn't fit the constraint on `U`. Check assignability direction — `string extends 'a'` is false, which is the opposite of what a lot of people assume.

**"Type 'never' is not assignable to …"** A distributive conditional produced `never` for this input. Almost always the `never` gotcha: a union member hit the `never` branch, or you distributed over `never` itself.

**"Argument of type 'X' is not assignable to parameter of type 'U'."** Your conditional resolved to a narrower branch than the caller expected — the false branch (`never` or a fallback) is usually the leak.

## 16. Quick revision notes

- Conditional type = type-level ternary: `T extends U ? X : Y`
- `extends` means **assignable to**, not inheritance
- Naked type parameters **distribute** over unions — one check per member, results unioned
- `never` in a distributive result drops that member — and distributing over `never` yields `never`
- `Exclude` = `T extends U ? never : T`; `Extract` = swap the branches; `NonNullable` checks `null | undefined`
- `infer` inside the true branch extracts matched parts — `Promise<infer U>` unwraps
- Zero runtime cost; compile-time cost matters only with deep recursion
- `[T] extends [U]` disables distribution when you need the whole-union check

## 17. Cheat sheet

```ts
type IsString<T> = T extends string ? 'yes' : 'no';
type A = IsString<'a'>;                    // 'yes'
type B = IsString<42>;                     // 'no'

// the three utility one-liners
type MyExclude<T, U> = T extends U ? never : T;
type MyExtract<T, U> = T extends U ? T : never;
type MyNonNullable<T> = T extends null | undefined ? never : T;

// unwrapping with infer
type Awaited<T> = T extends Promise<infer U> ? U : T;
type R = Awaited<Promise<number>>;         // number

// stop distribution
type Whole<T> = [T] extends [string] ? 'whole-string' : 'not';
type W = Whole<string | number>;           // 'not' — checked as one union
```

```text
(no runtime output — type-level definitions, erased by the compiler)
```

## 18. Key takeaways

> [!RECAP]
> - Conditional types bring branching to the type system: `T extends U ? X : Y`
> - `extends` is assignability — the same check an assignment would perform
> - Distribution over naked type parameters is the superpower: one check per union member, results unioned
> - `never` is the trap: it drops members from distributive results and swallows `never` itself
> - `Exclude`, `Extract` and `NonNullable` are each one conditional one-liner — write them from memory
> - `infer` in the true branch extracts matched parts; that's Lesson 43's deep dive
> - `[T] extends [U]` is the bracket trick for whole-union checks
> - Compile-time-only: zero runtime cost, performance is a recursion-depth concern

## Check your understanding

Answer these without looking back.

1. Write a conditional type that returns `'number'` when `T` is a number and `'other'` otherwise.
2. What does `extends` mean in a conditional — and how is it different from inheritance?
3. Why does `Filter<'a' | 'b'>` with `T extends 'a' ? 1 : 2` produce `1 | 2`?
4. Implement `MyExclude` and `MyExtract` from memory.
5. Why does a distributive conditional over `never` produce `never` — and why does that matter for `Exclude`?
6. How would you check a union *as a whole* instead of distributing over it?

## What's Next

**Lesson 41 — Mapped Types.** How `Partial` and `Readonly` are actually implemented — the `[K in keyof T]` syntax that transforms every property of a type, and how it composes with the conditionals from this lesson.
