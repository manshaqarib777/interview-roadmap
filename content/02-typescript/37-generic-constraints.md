# Lesson 37 — Generic Constraints

**Interview importance:** ⭐⭐⭐⭐ — `extends` inside a generic, where most people stall.

A bare generic accepts anything. A **constraint** — `T extends SomeType` — narrows what `T` is allowed to be, which is what lets the body actually do things with it. This lesson covers the three shapes you'll meet constantly: `T extends SomeType` (the general form), `K extends keyof T` (keys of a given type), and `T extends string` (the literal-friendly special case).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what `T extends SomeType` means in one sentence
- Write a constraint that lets the body call a method on `T` safely
- Write `K extends keyof T` for key-safe lookups and `T extends string` for literal types
- Diagnose the classic "constraint unsatisfied" error and fix it
- Say why a constrained generic beats `any` — the interview follow-up

## 1. One-line definition

**A constraint is a promise the caller makes: `T extends SomeType` means "`T` may be any type, as long as it is assignable to `SomeType`" — and inside the body, `T` can assume everything `SomeType` provides.**

The body gets capabilities; the caller keeps freedom. That trade is the whole feature.

## 2. Mental model

A bare generic is a blank cheque — useful, but the body can't spend it:

```text
   <T>               →  T could be anything → body can do NOTHING with it
   <T extends Length>→  T is "something with .length" → body may use .length
```

The constraint is a **type-level promise**: the compiler proves every call site satisfies it, and in return the body is allowed to rely on it. Like a function parameter defaulting to a known interface, but enforced at compile time.

## 3. Visual flow

```text
   function logLength<T extends { length: number }>(value: T): T {
     console.log(value.length);   // ✅ allowed — the constraint guarantees it
     return value;
   }

   logLength('hello');        →  T = string     ✅ string has .length
   logLength([1, 2, 3]);      →  T = number[]   ✅ arrays have .length
   logLength(42);             →  ❌ number has no .length — rejected
```

The call site that fails is the whole point: the constraint turns a runtime `undefined` bug into a compile-time error.

## 4. How it works

### `T extends SomeType` — the general constraint

```ts
function logLength<T extends { length: number }>(value: T): T {
  console.log(value.length);
  return value;
}

const s = logLength('hello');       // s: string — T preserved, not widened
const a = logLength([1, 2, 3]);     // a: number[]
// logLength(42);                   // ❌ 42 has no .length

console.log(s, a);
```

Output:

```text
5 3 hello [ 1, 2, 3 ]
```

Without the constraint, `value.length` is a compile error — a bare `T` offers no properties. With it, the body is safe and the return still tracks the *actual* type: `logLength('hello')` returns `string`, not `{ length: number }`. Constraining does not flatten.

```narrate
line 1: extends { length: number } — T may be anything WITH a .length
line 2: the body may now use .length — that's the capability the constraint bought
line 4: the return is T, so the caller keeps the exact type, not the constraint
line 6: 42 fails the check at compile time — before any code runs
```

### `K extends keyof T` — constrain a key to a type's keys

```ts
function pick<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: 'Ali', email: 'ali@example.com' };

console.log(pick(user, 'id'));      // number
console.log(pick(user, 'name'));    // string
// pick(user, 'age');               // ❌ 'age' is not a key of user
```

Output:

```text
1 Ali
```

The two-parameter form is the workhorse: `T` is the object, `K` is constrained to be one of its keys, and indexed access (`T[K]`, from Lesson 35) returns exactly that property's type. The compiler checks the key at every call site.

### `T extends string` — the literal-friendly special case

```ts
type Route = 'home' | 'about' | 'contact';

function routeTo<T extends Route>(route: T): string {
  return `/${route}`;
}

console.log(routeTo('home'));       // /home
console.log(routeTo('about'));      // /about
// routeTo('help');                 // ❌ 'help' is not a Route
```

Output:

```text
/home
/about
```

Why not just take a `Route` parameter? Because the return of `routeTo('home')` here is a plain `string` — but if the return *depends* on the specific literal (a mapped type over routes, Lesson 41 territory), `<T extends Route>` preserves which route you passed. The constraint says "any route is fine, but you must be one of them".

## 5. Real project usage

```ts
// a generic that needs real capabilities — the everyday case
function total<T extends { price: number }>(items: T[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

const cart = [
  { name: 'shirt', price: 25 },
  { name: 'hat', price: 10 },
];
console.log(total(cart));
```

Output:

```text
35
```

```ts
// constraining keys — a safe "get or default" helper
function getOrDefault<T, K extends keyof T>(obj: T, key: K, fallback: T[K]): T[K] {
  return obj[key] ?? fallback;
}

const settings = { theme: 'dark', retries: 3 };
console.log(getOrDefault(settings, 'theme', 'light'));
console.log(getOrDefault(settings, 'retries', 0));
```

Output:

```text
dark
3
```

The capabilities a constraint grants — `.price`, `.length`, "is a valid key", "is one of these literals" — are exactly what the body needs to do real work instead of just passing `T` through.

## 6. Interview explanation

> A constraint is `T extends SomeType` — it says T can be any type as long as it's assignable to `SomeType`, and then the body can rely on whatever `SomeType` provides. `K extends keyof T` constrains a key parameter to a type's keys, and `T extends string` keeps literal types. The caller gives up freedom; the body gains capabilities — and the compiler checks every call site.

## 7. Senior-level insights

The junior answer knows the syntax. The senior answer knows what constraints are *for*:

- **A constraint is a capability grant, not a restriction for its own sake.** The question is always "what does the body need to do with `T`?" — that need becomes the constraint. `logLength` needs `.length`, so `T extends { length: number }`.
- **Constraints prevent the "bare `T` can do nothing" wall.** This is the number-one stall point in live coding: someone writes `<T>`, tries to call a method, and hits an error. The fix is never `any` — it's adding the constraint that supplies the method.
- **Constraining does not widen.** `logLength('hello')` returns `string`, not the constraint type. A senior preserves the connection between input and output (Lesson 36) while narrowing what's allowed in.
- **`keyof` constraints (from Lesson 35) are how you keep the return type exact** — `T[K]` only works because `K extends keyof T` proves the key exists.

## 8. Common mistakes

**Mistake 1 — "fixing" the constraint error with `any`.** The error exists because the body needs a capability. `any` grants it silently and moves the risk to callers:

```ts
function badLength<T>(value: T): number {
  return (value as any).length;   // ❌ compiles, but nothing is checked
}
badLength(42);                    // no error — returns undefined at runtime
```

```text
(compiles — `any` hid the missing .length; 42 has no length at runtime)
```

The constraint version rejects `badLength(42)` at compile time. That's the entire value.

**Mistake 2 — constraining when you don't need to.** `function id<T extends object>(x: T): T` adds nothing the body uses. Constraints are for capabilities, not decoration.

**Mistake 3 — over-constraining with a concrete type.** `<T extends string>` where the body only needs *any* string is fine for literals, but if you genuinely accept any string, just type the parameter `string` — don't drag a type parameter in.

## 9. Best practices

✅ Constrain to the smallest interface the body needs: `T extends { length: number }`

✅ Use `K extends keyof T` for key-safe lookups and updates

✅ Use `T extends string` (or a literal union) to preserve literal types

✅ Keep the return type as `T` when you want to preserve the exact input type

❌ Don't reach for `any`/`as any` to silence a constraint error — fix the constraint

❌ Don't add constraints the body never uses

## 10. Interview questions

**Q1. What is a generic constraint?**

> It's `T extends SomeType` — a promise that `T` is assignable to `SomeType`, which lets the body use `SomeType`'s members. The caller gives up some freedom, the body gains capabilities, and the compiler checks every call site. `function logLength<T extends { length: number }>(v: T)` can read `v.length`; `logLength(42)` is a compile error.

**Q2. What is `K extends keyof T`?**

> It constrains a type parameter to be one of another type's keys. `pick<T, K extends keyof T>(obj: T, key: K): T[K]` — `K` can only be a real key of `T`, and the return is that property's exact type via indexed access. It's the pattern behind safe lookup helpers, and it combines Lesson 35's operators with Lesson 36's generics.

**Q3. When would you use `T extends string`?**

> When I want to accept only certain literal strings — `T extends 'a' | 'b'` — or to preserve which literal was passed, which matters when the return type depends on it. If I don't care about literals, a plain `string` parameter is simpler. The constraint is about keeping specificity, not about restricting for fun.

**Senior follow-up: Why is a constrained generic better than `any`?**

> `any` disables checking — it grants every capability silently, so the error moves to runtime or to the caller. A constraint grants exactly the capabilities the body needs, and the compiler proves every call site satisfies them before the code runs. `logLength<any>` would let `42` through; `T extends { length: number }` rejects it at compile time. Same body, opposite safety.

## 11. Follow-up questions

**Can I constrain to a union?**

> Yes — and that's the classic trick for literal types. `T extends 'red' | 'green' | 'blue'` means `T` is one of those three literals, and code that checks `T` can narrow on each. This is how you type-safe a finite set of options while keeping which one was chosen.

**What's the difference between a constraint and a conditional type?**

> A constraint is a *check* that happens at the call site — a filter on what `T` may be. A conditional type (`T extends U ? X : Y`, Lesson 40) *computes* a different type from `T` — it's a function that runs on types. Same `extends` keyword, different job: one gates, the other transforms.

**Do constraints survive to the emitted JavaScript?**

> No. `extends` clauses, like all type syntax, are erased at compile time. The emitted function is plain JavaScript with no constraint in sight — the checks all happened before the code ran.

## 12. Comparison table

| Constraint | Meaning | Typical body use | Caller gets |
|---|---|---|---|
| `<T>` | anything | pass-through only | full freedom |
| `<T extends { length: number }>` | has `.length` | read `.length` | any length-bearing type |
| `<T, K extends keyof T>` | `K` is a key of `T` | `obj[key]` returns `T[K]` | only valid keys |
| `<T extends string>` | `T` is a string literal | preserve/return the literal | only the allowed literals |

## 13. Code example

A `findById` over a constrained shape — generic, safe, and typed to the element:

```ts
type Entity = { id: number };

function findById<T extends Entity>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}

const users = [
  { id: 1, name: 'Ali', role: 'admin' },
  { id: 2, name: 'Omar', role: 'editor' },
];

const found = findById(users, 1);
console.log(found?.name, found?.role);
```

Output:

```text
Ali admin
```

`T extends Entity` guarantees `.id` exists, and `findById` still returns the *full* user type — `{ id, name, role }` — not a flattened `Entity`. Constraint and specificity both preserved.

## 14. Performance notes

Constraints are **erased at runtime** — zero cost, compile-time only. The only performance note is negative: a poorly-constrained generic that compiles to `any` doesn't cost runtime either, but it *moves* bugs to runtime, which costs real money in production. A constraint that catches a bad call before deploy is the cheapest safety you can buy. Compile-time cost scales with how many distinct `T` instantiations the compiler resolves — negligible for normal code.

## 15. Debugging scenarios

**"Type 'number' does not satisfy the constraint '…'."** The argument isn't assignable to what the constraint requires. Either the caller is genuinely wrong (fix the call site), or the constraint is too tight (widen it to what the body actually needs).

**"Property 'length' does not exist on type 'T'."** A bare `T` with no constraint — the body is trying to use a capability nobody granted. Add the constraint that supplies `.length` (or whatever the property is). This is the most common live-coding stall.

**"'K' could be instantiated with an arbitrary type which could be unrelated to 'keyof T'."** TypeScript can't prove a key constraint is satisfied — usually when the generic flows through another layer. Constrain the outer layer too, or restructure so `K` is checked where it enters.

**"Argument of type 'string' is not assignable to parameter of type '"a" | "b"'."** A `T extends 'a' | 'b'` rejected a broad `string`. That's the constraint working — pass a literal, or widen the union if it should accept more.

## 16. Quick revision notes

- `T extends SomeType` — T must be assignable to `SomeType`; body gains its members
- `K extends keyof T` — K must be a real key; `T[K]` is the exact property type
- `T extends string` / a literal union — keep literals, reject out-of-set strings
- Constraints don't widen: `logLength('hi')` still returns `string`
- Never "fix" a constraint error with `any` — the constraint is the point
- Constrain to the smallest capability the body needs
- Erased at runtime — zero cost
- `extends` reappears in Lesson 40 as the conditional-type operator

## 17. Cheat sheet

```ts
// general capability constraint
function logLength<T extends { length: number }>(v: T): T { … }

// key constraint — combines Lesson 35 + Lesson 36
function pick<T, K extends keyof T>(obj: T, key: K): T[K] { … }

// literal-union constraint
type Route = 'home' | 'about';
function go<T extends Route>(r: T): string { … }

// constraint + multi-param
function keyBy<T, K extends keyof T>(items: T[], key: K): Record<T[K], T> { … }
```

```text
(no runtime output — these are type-level definitions)
```

## 18. Key takeaways

> [!RECAP]
> - `T extends SomeType` = "any type assignable to `SomeType`", granting the body its members
> - The number-one live-coding stall is a bare `T` with nothing to use — the fix is a constraint, not `any`
> - `K extends keyof T` keeps lookups key-safe and returns the exact property type
> - `T extends string` / a literal union preserves literals and rejects out-of-set values
> - Constraining never widens the return — `T` keeps the caller's actual type
> - `any` grants capabilities silently; constraints grant them with proof
> - Erased at runtime — zero cost
> - Next stop: Lesson 38 applies everything — discriminated unions for loading/error/success states

## Check your understanding

Answer these without looking back.

1. What does `T extends { length: number }` promise, and what does the body gain?
2. Write `pick<T, K extends keyof T>` and say what it returns.
3. Why use `T extends string` instead of a plain `string` parameter?
4. What's the correct fix for "Property 'length' does not exist on type 'T'"? Why is `any` the wrong one?
5. Does a constraint widen or preserve the input type? Prove it.
6. What's the difference between a constraint and a conditional type?

## What's Next

**Lesson 38 — Discriminated Unions.** The single most useful pattern in application TypeScript — loading/error/success states, exhaustive narrowing with `never`, and why every real codebase is built on it.
