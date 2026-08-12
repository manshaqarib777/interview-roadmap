# Lesson 43 — `infer`

**Interview importance:** ⭐⭐⭐⭐⭐ — the single keyword that separates "knows TypeScript" from "writes type-level code".

`infer` is the pattern-matcher inside conditional types: it declares a fresh type variable,
then lets TypeScript solve for it from the type you're matching against. Reimplementing
`ReturnType<T>` with `infer` is a strong senior demonstration — and it's exactly the kind of
thing you'll be asked to do live, usually as a follow-up to Lesson 39's utility types.

## Learning Objectives

By the end of this lesson you should be able to:

- Read a conditional type out loud, including the `infer` clause
- Reimplement `ReturnType<T>` from scratch and explain each token
- Reimplement `Awaited<T>`, `ElementType<T>` and `Flatten<T>`
- Explain where `infer` can appear (and where it can't)
- Recognise when an interview answer needs `infer` — and when it doesn't

## 1. What Is `infer`?

**`infer` declares a type variable *inside* a conditional type's `extends` clause and lets
TypeScript figure out what it should be from the type being matched.**

Every conditional type is a pattern match:

```text
T extends Pattern ? Match   : No-match
        └─────┬────┘
        `infer X` names a hole in the pattern
        TypeScript solves for X from T
```

If the pattern fits, `infer X` is bound to whatever part of `T` lined up with it and is
usable in the true branch. If the pattern doesn't fit, the whole conditional collapses to
the false branch and `X` never exists there.

## 2. Mental Model

Think of `infer` as **destructuring for types**.

When you write `const [first, ...rest] = arr`, JavaScript splits an array and binds names to
the pieces. `T extends [infer Head, ...infer Tail] ? …` does the same thing to a tuple type —
bind `Head` to the first element, bind `Tail` to the rest. A runtime pattern-match with
variables; the variables are just declared with `infer` instead of `const`.

## 3. Visual Flow

```text
type ReturnType<T> =
  T extends (...args: any[]) => infer R
                │                    │
                │   solve for R      │
                ▼                    ▼
      ┌────────────────┐     ┌────────────────┐
      │  T is a fn     │     │  T is NOT a    │
      │  signature     │     │  fn signature  │
      └───────┬────────┘     └───────┬────────┘
              │                      │
              ▼                      ▼
        R (the return type)    never (no match)
```

## 4. How It Works

`ReturnType` is defined in the standard library, but here is the whole thing, written out:

```ts
type MyReturnType<T> =
  T extends (...args: any[]) => infer R ? R : never;

type A = MyReturnType<() => string>;          // string
type B = MyReturnType<(x: number) => number>; // number
type C = MyReturnType<number>;                // never
```

Output:

```text
A = string
B = number
C = never
```

Line by line:

```ts
type MyReturnType<T> =
  //  1.  T must match a function signature:  (...args: any[]) => …
  T extends (...args: any[]) => infer R
  //  2.  …where `infer R` is a hole where the return type sits.
  //      If the signature fits, TypeScript binds R to the real return type.
  ? R   // 3.  Match  → hand back the solved R
  : never; // 4. No match → never (there was no return type to find)
```

> [!DEEPDIVE]
> `any[]` in the parameter slot is deliberate. We want to match **any** function, regardless
> of its parameters, so we accept them loosely with `any[]`. That widens the parameters to a
> rest of `any` — it costs you nothing here, because we only extract the return side. The
> false branch is `never` (Lesson 45) rather than a fallback type, because "not a function"
> has no return type at all.
>
> Also note: `infer R` is declared *in the condition* but used *in the true branch*. That is
> the whole trick — the scope of `R` is exactly the conditional's `?` branch.

### More than one `infer` in a pattern

A pattern can have several holes; TypeScript solves for all of them at once:

```ts
type Swap<Pair extends readonly [any, any]> =
  Pair extends readonly [infer A, infer B] ? [B, A] : never;

type Swapped = Swap<['left', 'right']>; // ['right', 'left']
```

Output:

```text
Swapped = ['right', 'left']
```

`A` and `B` are bound by position — the first slot, then the second — and reused in the true
branch in whatever order you like.

## 5. Reimplementing the Useful Ones

The flagship material. These four are the `infer` patterns interviewers actually reach for.

### `ReturnType<T>` — the classic

```ts
type MyReturnType<T> =
  T extends (...args: any[]) => infer R ? R : never;

declare function fetchUser(id: string): Promise<{ id: string; name: string }>;

type User = MyReturnType<typeof fetchUser>;
```

Output:

```text
User = Promise<{ id: string; name: string }>
```

### `Awaited<T>` — unwrap promises, recursively

```ts
type MyAwaited<T> =
  T extends Promise<infer U> ? MyAwaited<U> : T;

type A = MyAwaited<Promise<string>>;              // string
type B = MyAwaited<Promise<Promise<number>>>;     // number
type C = MyAwaited<Promise<Promise<Promise<boolean>>>>; // boolean
```

Output:

```text
A = string
B = number
C = boolean
```

The `? MyAwaited<U>` branch is a **recursive call**: keep unwrapping until the outer `Promise`
is gone, then fall through to the plain `T`. This is the exact pattern the standard library's
`Awaited<T>` (the type `await` uses, and the one behind `Promise.all` inference) is built on.

### `ElementType<T>` — the element of any collection

```ts
type ElementType<T> =
  T extends (infer E)[] ? E
  : T extends ReadonlyArray<infer E> ? E
  : T extends Promise<infer E> ? E
  : never;

type A = ElementType<string[]>;        // string
type B = ElementType<ReadonlyArray<number>>; // number
type C = ElementType<Promise<boolean>>;      // boolean
```

Output:

```text
A = string
B = number
C = boolean
```

One `infer` variable can be reused across branches of the same conditional — but each branch
redeclares it with its own `infer E`. Note the two array branches: the mutable one first,
then `ReadonlyArray`. Order matters, because a `readonly` array also matches the first
pattern with `any` elements.

### `Flatten<T>` — the interview favourite

```ts
type Flatten<T> =
  T extends Array<infer U> ? U : T;

type A = Flatten<string[]>;        // string
type B = Flatten<number[]>;        // number
type C = Flatten<'flat'>;          // 'flat' — no match, handed back as-is
type D = Flatten<string[][]>;      // string[] — flattens one level only
```

Output:

```text
A = string
B = number
C = 'flat'
D = string[]
```

```narrate
line 1: type Flatten<T> — one generic parameter, T
line 2: T extends Array<infer U> — "if T is an array of something, call that something U"
line 3: ? U : T — "then the element type; otherwise T unchanged"
```

That is the whole of `Flatten`. It's the go-to starter exercise for `infer` because the
shape is tiny but every moving part is visible.

## 6. Real Project Usage

| Where | The `infer` at work |
|---|---|
| `ReturnType<typeof fn>` in tests/helpers | Extract what a function returns without annotating it twice |
| `Awaited<T>` on API response types | Turn `Promise<Response>` into the response type itself |
| Unwrapping `React.ComponentProps<typeof X>` | Pulls the prop type out of a component |
| Event map patterns (Lesson 42) | `T extends { [K]: infer E }` binds the payload of each event |
| Form/route tuples | `Tuple extends [infer First, ...infer Rest]` splits a fixed shape |

The everyday superpower: you **never write the same type twice**. A helper that takes the
*typeof* of a function, an element, or a promise and returns its inside type is small,
reusable, and reads better than a hand-written duplicate annotation.

## 7. Interview Explanation

> Conditional types run a pattern match: `T extends Pattern ? A : B`. `infer X` declares a
> variable *inside* the pattern. TypeScript tries to fit `T` into that pattern; where it
> lines up with `X`, `X` is bound to that piece and is available in the `A` branch. If the
> pattern doesn't fit, we take `B` and `X` doesn't exist there.
>
> The canonical example is `ReturnType<T>`:
> `T extends (...args: any[]) => infer R ? R : never`. For a function type, `R` becomes the
> return type. For anything else, the pattern fails and we get `never`.

That, plus a live reimplementation, is a senior-grade answer in under thirty seconds.

## 8. Senior-Level Insights

- **`infer` is local to one conditional.** Each `infer` declaration's scope is exactly the
  `?` branch of the conditional that contains it. You can't name it outside, and you can't
  reuse it in a sibling conditional.
- **Recursion is how you flatten.** `Awaited<T>` recurses through `Promise` layers;
  `Flatten`'s non-recursive form only strips one level. Interviewers escalate "reimplement
  `ReturnType`" into "make it recursive" on purpose.
- **Solve for the holes, not the whole.** A conditional matches structurally — tuple
  position, array element, promise payload — and `infer` captures exactly the hole you
  named. Nothing else in `T` is bound.
- **`any` matches anything, `never` matches nothing.** If you want "any function", match
  `(...args: any[]) => …`. If nothing should match, the false branch is `never` — and it
  *can't* match because nothing lines up with `infer X` when the pattern already failed.
- **Know when NOT to use it.** If you just need "the return type of this one function", a
  plain `ReturnType` is better than a bespoke type. `infer` earns its place in reusable
  utilities, not one-off annotations.

## 9. Common Mistakes

❌ Using `infer` **outside** an `extends` clause — a syntax error.

```ts
type Bad<T> = infer X; // 💥 'infer' declarations are only permitted in the 'extends' clause of a conditional type
```

❌ Declaring two `infer`s with the same name in one pattern — duplicate bindings collide.

```ts
type Bad<T> = T extends [infer X, infer X] ? X : never; // 💥 duplicate identifier
```

❌ Forgetting that a failed match produces the false branch, so `infer X` is unreachable
there — referencing it in the false branch is an error, and it is *not* `unknown` or `any`.

❌ Reaching for `any` instead of `infer` when you need the inside of a type.

```ts
type Bad<T> = T extends Array<any> ? any : T; // loses the element type
type Good<T> = T extends Array<infer E> ? E : T; // ✅ keeps it
```

❌ Expecting a non-recursive `Flatten` to handle nested arrays — it strips exactly one level.

## 10. Best Practices

✅ Write `infer` patterns smallest-first: name only the hole you need

✅ Make the false branch explicit — usually `never` — so the utility has a defined edge case

✅ Recursion for nested structures: `Awaited`, deep `Flatten`, deep `Readonly`

✅ Put `infer` utilities in a shared `types.ts` and give them readable names

✅ Test utilities with `type X = MyType<…>` assertions (use `expect-type` in a real codebase)

❌ Don't shadow a pattern you only need once; a concrete type beats clever inference

## 11. Interview Questions

**Q1. What does `infer` do?**

> It's how conditional types bind a type to a variable. Inside `T extends SomePattern`, I can
> write `infer X` and TypeScript solves for `X` when `T` matches the pattern, making it
> available in the true branch.
>
> The classic example: `T extends (...args: any[]) => infer R ? R : never` — that's
> `ReturnType`, extracted from the pattern rather than hard-coded anywhere.

**Q2. Can you reimplement `ReturnType<T>`?** *(the flagship question)*

> ```ts
> type MyReturnType<T> =
>   T extends (...args: any[]) => infer R ? R : never;
> ```
>
> The conditional tries to match `T` against a function signature. If it fits, `R` is bound
> to the return type and we return `R`. If it doesn't, we return `never`. The `any[]` for
> parameters deliberately accepts any function, since I only want the return side.

**Q3. Can `infer` appear outside a conditional type?**

> No. `infer` is only legal inside the `extends` clause of a conditional type, and its scope
> is that conditional's true branch. You can't declare a free-standing `infer` variable, and
> you can't use the bound type in the false branch.

**Q4. Where is `infer` used in the standard library?**

> `ReturnType<T>`, `Parameters<T>` (the `...infer P` rest), `Awaited<T>` (a recursive
> `Promise` unwrap), `InstanceType<T>` and `NonNullable`-style utilities all lean on it. The
> general shape is: pattern-match a container type and bind the part you care about.

**Q5. How do you unwrap a nested promise type?**

> Recursively. `Awaited<T>` is roughly
>
> ```ts
> type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;
> ```
>
> Each layer strips one `Promise`, recursing until the base type is reached. `await` relies
> on exactly this: `Awaited<Promise<Promise<string>>>` is `string`.

**Senior follow-up: Reimplement `Awaited` or a deep `Flatten`.**

> For `Awaited`:
>
> ```ts
> type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;
> ```
>
> For a deep flatten, recurse into the element type as well:
>
> ```ts
> type FlattenDeep<T> =
>   T extends Array<infer U> ? FlattenDeep<U> : T;
>
> type A = FlattenDeep<number[][][]>; // number
> ```
>
> The recursion is what makes both work: `infer` peels the container, then the type calls
> itself on what was inside. The difference between this and a one-level `Flatten` is the
> recursive call in the true branch.

## 12. Follow-up Questions

**Can you reimplement `Parameters<T>`?**

> Swap the hole from the return side to the parameter side: `T extends (...args: infer P) => any ? P : never`. The result is the tuple of parameter types — `[string, number]` for `(a: string, b: number) => void`.

**What happens to `infer` in the false branch?**

> It's out of scope. The false branch can't name it, and a failed match simply doesn't bind
> it. That's why the false branch needs its own concrete type, usually `never`.

**Can two conditionals share an `infer`?**

> No — each `infer` belongs to its own conditional. To combine results you nest conditionals
> or chain them; there's no "global" type variable.

**Does `infer` have a runtime cost?**

> No. `infer` is compile-time only. TypeScript resolves the conditional during type-checking
> and emits nothing — the output JavaScript is identical with or without it.

## 13. Comparison Table

| Utility | Pattern | Returns |
|---|---|---|
| `ReturnType<T>` | `T extends (...args: any[]) => infer R` | `R` — the return type |
| `Parameters<T>` | `T extends (...args: infer P) => any` | `P` — parameter tuple |
| `Awaited<T>` | `T extends Promise<infer U> ? Awaited<U>` | Unwrapped, recursive |
| `ElementType<T>` | `T extends (infer E)[]` | `E` — the element type |
| `Flatten<T>` | `T extends Array<infer U>` | `U` — one level deep |
| `FlattenDeep<T>` | `T extends Array<infer U> ? FlattenDeep<U>` | Deepest element |

## 14. Code Example

Put it together: a small library of `infer` utilities plus a real-looking use.

```ts
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;
type ElementType<T> =
  T extends (infer E)[] ? E
  : T extends ReadonlyArray<infer E> ? E
  : T extends Promise<infer E> ? E
  : never;
type Flatten<T> = T extends Array<infer U> ? U : T;

declare function fetchUser(id: string): Promise<{ id: string; name: string }>;

type UserResponse = MyAwaited<MyReturnType<typeof fetchUser>>; // { id: string; name: string }
type FirstUser = ElementType<UserResponse[]>; // { id: string; name: string }
type Id = Flatten<string[]>;                  // string

console.log('types resolved');
```

Output:

```text
types resolved
```

> [!NOTE]
> `MyAwaited<MyReturnType<typeof fetchUser>>` reads as: take the return type of
> `fetchUser`, then unwrap its promise. Nesting `infer` utilities is composition — the same
> way you'd compose functions.

## 15. Performance Notes

`infer` itself costs nothing at runtime — it's erased. The only cost is at compile time:

- **Recursive conditionals** (`Awaited`, deep `Flatten`) add work per nesting level. Keep
  them shallow or bounded.
- **Deeply nested unions** in a conditional can make instantiation slow — a pathological
  `Awaited<HugeUnion>` fans out.
- TypeScript stops "runaway" recursion with `ts(2589)` / `ts(2321)` errors and an
  instantiation-depth limit; a circular type alias that never bottoms out fails to compile.

In day-to-day app code this never matters. It becomes relevant only when a shared type
utility is applied across a very large codebase, where a couple of milliseconds per file
adds up.

## 16. Debugging Scenarios

**"I get `never` and I expected a real type."** The pattern didn't match. Check the shape:
`T extends (infer E)[]` won't match a tuple `[a, b]` written as a tuple — tuples are not
arrays. Match `readonly (infer E)[]` or `readonly [infer A, ...infer Rest]` instead.

**"Duplicate identifier" on a second `infer X`.** You redeclared the same name in one
pattern. Rename it — each hole needs a distinct variable.

**"'infer' declarations are only permitted in the 'extends' clause."** You wrote `infer`
outside a conditional, or in the true branch. It belongs only in the pattern: the left side
of `extends`.

**A recursive type says "excessively deep and possibly infinite".** Your recursion never
bottoms out. Add a terminal branch — usually a plain `T` fallthrough like `Awaited`'s
`: T` — so the recursion stops when the container is gone.

## 17. Quick Revision Notes

- `infer` = pattern-match with a type variable, inside a conditional type
- Scope: the conditional's true branch only; false branch can't name it
- `ReturnType<T>` = `T extends (...args: any[]) => infer R ? R : never`
- `Awaited<T>` = recurse on `Promise<infer U>`
- `ElementType<T>` = match array, then readonly array, then promise, else `never`
- `Flatten<T>` = `T extends Array<infer U> ? U : T` — one level
- Recursion is the upgrade: deep flatten, `Awaited`, `Promise.all` inference
- One `infer` per hole; distinct names in one pattern
- `any` accepts anything (match), `never` means no match
- Compile-time only — zero runtime output

## 18. Key Takeaways

> [!RECAP]
> - `infer` is `const` for types — declare it inside the pattern, and TypeScript binds it
> - Scope is the conditional's true branch, and only that branch
> - `ReturnType<T>` is `T extends (...args: any[]) => infer R ? R : never` — memorise it, then explain it
> - Recursion makes `infer` unbounded: `Awaited` and `FlattenDeep` are the same idea, recursing on the hole
> - Multiple holes (`[infer A, infer B]`) bind by position
> - Always define the false branch — `never` is the honest "no match"
> - Zero runtime cost; compile-time only
> - Reimplementing these utilities live is the strongest senior signal there is

## Check your understanding

Answer these without looking back.

1. In one sentence, what does `infer` do — and where is it allowed to appear?
2. Reimplement `ReturnType<T>` from memory and explain the `any[]`.
3. Why must the false branch not reference `infer X`?
4. What makes `Awaited<T>` handle `Promise<Promise<boolean>>`?
5. Write `ElementType<T>` for arrays and `ReadonlyArray`.
6. What does `Flatten<string[][]>` give you, and why isn't it `string`?
7. When would you *not* reach for `infer`?

## What's Next

**Lesson 44 — satisfies & as const.** The modern pair that keeps precise literal types
while checking the shape — modern TypeScript many candidates haven't caught up with yet.
