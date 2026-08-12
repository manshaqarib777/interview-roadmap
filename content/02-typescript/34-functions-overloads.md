# Lesson 34 — Functions & Overloads

**Interview importance:** ⭐⭐⭐ — how you type the thing you write every day; later lessons build directly on this.

Every interview has a "write a function with types" moment, and this is the vocabulary for it. We'll cover the three ways to describe a function — inline, as a type alias, and as an `interface` — then the one genuinely tricky part: overloads, where one function has several call signatures and a single implementation.

## Learning Objectives

By the end of this lesson you should be able to:

- Write a function type in all three syntaxes without hesitating
- Explain the difference between the call signature and the implementation signature
- Use overloads for the "one function, many accepted call shapes" pattern
- Describe what `this` parameters and `void` do in a function type
- Say why overload order matters, and when to prefer a union parameter instead

## 1. One-line definition

**A function type is the shape of a call — parameters in, return type out — and an overload lets one function accept several different call shapes.**

The syntax is `(a: number, b: number) => number`. That arrow is the "callable" marker; read it as "takes, returns".

## 2. Mental model

A function type is a **contract for calling**, not for implementing. The compiler checks two directions against it:

- callers must match the parameters exactly, and
- the implementation must be assignable to every overload's return type.

```text
function type:     (id: number) => User
                       │            │
                  callers give      callers get
                  exactly this      exactly this
```

The type says nothing about *how* the body works — that's the implementation's business.

## 3. Visual flow

```text
        function double(n: number): number        ← function declaration
        ───────────────────────────────────
        type Double = (n: number) => number       ← type alias
        interface Doubler { (n: number): number } ← interface call signature
        ───────────────────────────────────
        all three describe the SAME call shape:
              (number) → number
```

An overload adds a second contract on top of the same body:

```text
   overload 1:   (a: string, b: string) => string
   overload 2:   (a: number, b: number) => number
   ─────────────────────────────────────────────
   implementation: (a: string | number, b: string | number) => string | number
   ─────────────────────────────────────────────
   callers see overloads 1 and 2; the body sees the implementation
```

The call signatures are public; the implementation signature is private.

## 4. How it works

Three equivalent ways to write the same type:

```ts
// 1. inline in a variable or parameter
const greet: (name: string) => string = (name) => `Hi ${name}`;

// 2. type alias — reusable, the daily default
type Greet = (name: string) => string;

// 3. interface call signature — for when you also want properties
interface Greeter {
  (name: string): string;
  greeting: string;      // a property ON the function — callable + data
}
```

All three accept `(name: string) => string` implementations. The interface version additionally describes a function that *carries properties*, like `fetch` with its `.then` or a helper with a `.defaults`.

Optional and rest parameters work exactly as you'd expect:

```ts
type Log = (msg: string, level?: 'info' | 'warn') => void;
type Sum = (...nums: number[]) => number;
```

Now overloads. One function, several accepted call shapes:

```ts
function format(input: number, opts?: { decimals?: number }): string;
function format(input: string, opts?: { upper?: boolean }): string;
function format(input: number | string, opts?: any): string {
  if (typeof input === 'number') {
    return input.toFixed(opts?.decimals ?? 2);
  }
  return opts?.upper ? input.toUpperCase() : input;
}

console.log(format(3.14159, { decimals: 2 }));
console.log(format('hello', { upper: true }));
```

Output:

```text
3.14
HELLO
```

The two `function format(...)` lines *above* the body are overload signatures. The third line — with the union parameter — is the **implementation signature**, which callers never see. It exists so the body can actually handle both cases; TypeScript checks each overload against it.

```narrate
line 1: overload 1 — number callers see this signature only
line 2: overload 2 — string callers see this one
line 3: implementation signature — wider than both overloads; callers never see it
line 6: the body branches on the runtime type; the overloads guarantee the call site narrows
```

> [!NOTE]
> The implementation signature must be **compatible with every overload** — usually it's the union of all their parameters. If an overload isn't assignable to the implementation, the compiler tells you exactly which one failed.

## 5. Real project usage

Typing the functions a codebase reaches for daily:

```ts
type ApiError = { status: number; message: string };

// callbacks / event handlers — the classic (event) => void
type Handler = (e: Event) => void;

// function-returning-function (currying, from Lesson 16)
type Mapper = <T, R>(arr: T[], fn: (item: T) => R) => R[];

// overloads in the wild: `document.createElement`
function el(tag: 'div'): HTMLDivElement;
function el(tag: 'span'): HTMLSpanElement;
function el(tag: string): HTMLElement;
function el(tag: string): HTMLElement {
  return document.createElement(tag);
}
```

Overloads shine when the return type *depends on the argument*, not just when arguments vary. `createElement('div')` should return `HTMLDivElement`, not a generic `HTMLElement` — a union parameter alone can't express that.

## 6. Interview explanation

> A function type describes a call: parameters in, return out. I can write it inline, as a type alias, or as an interface call signature. Overloads are for when one function legitimately accepts several call shapes — I write one signature per shape, then a wider implementation signature the callers never see. The compiler matches each overload against the implementation and each call site against the overloads.

## 7. Senior-level insights

The junior answer stops at "overloads let a function take different types". The senior answer adds the *why*:

- **Overloads are compile-time dispatch.** There's no runtime dispatch beyond what the body does — the overloads are erased. So they're only worth it when the return type genuinely depends on the call shape.
- **When the only difference is the parameter types and the return is the same, a union parameter beats overloads.** `(a: string | number) => string` is one signature, no overload ceremony.
- **Overloads are a last resort.** If you need more than two or three, the real problem is usually that the function does too much — split it, or revisit the design.
- **Ordering matters.** TypeScript matches overloads top-down, so put the most specific signature first. `(tag: 'div')` before `(tag: string)`.

## 8. Common mistakes

**Mistake 1 — writing the implementation signature as an overload.** The widest signature must not be listed among the public ones, or callers can call it with anything and the narrowing benefit is lost:

```ts
function f(x: string | number): string | number;   // ❌ this leaks the wide type
function f(x: string | number): string | number {
  return typeof x === 'string' ? x.toUpperCase() : x;
}
f(true);  // no error — the wide signature accepts anything
```

```text
(no error — the union signature accepted the boolean)
```

The implementation belongs on its own line, below the overloads, unlisted.

**Mistake 2 — swapping the order.** A specific overload after a broad one is shadowed — the compiler matches top-down, so the broad one wins and the specific one never fires.

**Mistake 3 — forgetting `void` for handlers.** A function type `(e: Event) => void` means "I won't use the return value", which accepts both `() => {}` and `() => 'hi'`. That's the *feature* that makes callbacks assignable — don't "fix" it by typing the return as `undefined`.

## 9. Best practices

✅ Prefer a type alias (`type Fn = (…) => …`) as the default — it's the least ceremony

✅ Use an interface call signature only when the function also carries properties

✅ Reach for overloads only when the return type depends on the argument

✅ List overloads most-specific first

✅ Use `void` for handlers and callbacks — it's deliberately permissive about the return

❌ Don't overload for "different params, same return" — a union parameter is simpler

❌ Don't include the wide implementation signature in the public overload list

## 10. Interview questions

**Q1. What are the different ways to type a function?**

> Three. Inline on the variable or parameter, a type alias — `type Fn = (a: number) => string` — which is my default, and an interface call signature, which I use when the function also carries properties. They're interchangeable for plain functions; the alias is cleaner for combinations like unions of function types.

**Q2. What is a function overload?**

> Several call signatures on one function. Each describes an accepted call shape, and a single implementation behind them handles all of them. The public signatures are what callers see; the implementation signature is wider and never exposed. It's compile-time dispatch — the overloads vanish at runtime.

**Q3. When would you use overloads instead of a union parameter?**

> When the return type depends on which branch was taken. `createElement('div')` returning `HTMLDivElement` versus `createElement('span')` returning `HTMLSpanElement` can't be expressed with `(tag: string) => HTMLElement` — the return has to track the argument. If the return type is the same either way, a union parameter is simpler and I use that.

**Senior follow-up: Why must the implementation signature be wider than the overloads?**

> Because it has to be able to *handle* every overload — the compiler checks each public signature against it. If I declared the body as `(a: string, b: string) => string` only, the number overload couldn't be implemented by it. So the implementation parameter is the union of all the overload parameters, and its return type is the union of the return types. The body then narrows at runtime.

## 11. Follow-up questions

**What does `void` in a function type actually mean?**

> It means the caller won't rely on the return value. That's what makes a function returning `string` assignable to a `() => void` — the assignability is one-way, deliberately. If you type the return as `undefined` instead, that permissiveness disappears and ordinary callbacks stop fitting.

**Can a function type have optional and rest parameters?**

> Yes — `?` for optional, `...` for rest, exactly like implementations: `(msg: string, level?: number) => void` and `(...args: number[]) => number`. The one difference: a rest parameter in a function *type* must be an array or tuple type.

**How do you type the `this` of a function?**

> With a fake first parameter: `function f(this: Window, x: number)`. It's erased at runtime and only used for type-checking the body and the call site. `strictBindCallApply` in `tsconfig` makes `.bind`/`.call`/`.apply` check the same signature.

## 12. Comparison table

| Syntax | Readability | Reusability | Extra features |
|---|---|---|---|
| Inline `(a: number) => string` | fine for one-off params | ❌ repeated each time | none |
| Type alias `type Fn = …` | clean, named | ✅ share across files | unions, intersections of functions |
| Interface call signature | verbose | ✅ | properties on the function |
| Overloads | most verbose | per-function | return type depends on argument |

## 13. Code example

A small query-builder that shows the overload pattern paying off:

```ts
type Where = Record<string, string | number>;

function find(table: string, id: number): { table: string; id: number };
function find(table: string, where: Where): { table: string; where: Where };
function find(table: string, query: number | Where): unknown {
  if (typeof query === 'number') return { table, id: query };
  return { table, where: query };
}

console.log(find('users', 7));
console.log(find('users', { role: 'admin' }));
```

Output:

```text
{ table: 'users', id: 7 }
{ table: 'users', where: { role: 'admin' } }
```

The `id` branch returns `{ table, id }`; the `where` branch returns `{ table, where }`. Callers get the precise shape for whichever form they used.

## 14. Performance notes

Function types are **erased at runtime** — zero cost, they're pure compile-time contracts. Overloads are equally free: no runtime dispatch is generated, the body is one ordinary function. The only "cost" is ergonomic: more overloads mean more signatures the compiler checks at each call site, which is negligible until you're writing dozens. If you ever feel a performance or complexity pain from overloads, the design, not the type system, is the problem.

## 15. Debugging scenarios

**"This overload signature is not compatible with its implementation signature."** The body's parameter type doesn't cover one of the overloads. Widen the implementation — usually to the union of the overload parameters — or fix the overload to fit the body.

**"Expected 0 arguments, but got 1."** A function type with no parameters rejects arguments. If the callee may ignore them, widen the type to accept them.

**"Type 'string | number' is not assignable to type 'string'."** You called an overloaded function and the compiler resolved to the broad signature — often because a specific overload came *after* a broad one. Reorder most-specific first.

**"Function lacks ending return statement and return type does not include 'undefined'."** An overloaded body has a code path that returns nothing. Make the missing path return explicitly, or widen the implementation's return type.

## 16. Quick revision notes

- A function type is `(params) => Return` — a contract for calling
- Three syntaxes: inline, `type` alias (default), `interface` call signature
- `void` return = "caller won't use the result" — deliberately permissive
- Overloads: several public signatures + one wider implementation signature
- Implementation signature is never exposed to callers
- Return-type-depends-on-argument → overloads; otherwise → union parameter
- Overloads are compile-time only — erased, zero runtime cost
- `this` parameter is a fake first param: `function f(this: Window, …)`

## 17. Cheat sheet

```ts
// the three syntaxes
type Fn = (a: number) => string;            // type alias — default
interface Callable { (a: number): string }  // interface, with properties
const fn: (a: number) => string = …;        // inline

// optional / rest / this
type A = (m: string, level?: number) => void;
type B = (...nums: number[]) => number;
function c(this: Window, x: number): void;

// overloads
function find(id: number): User;
function find(email: string): User;
function find(q: number | string): User { … }
```

```text
(no runtime output — these are type-level definitions)
```

## 18. Key takeaways

> [!RECAP]
> - A function type describes a call: parameters in, return out
> - Type alias is the default; interface call signature is for callable-with-properties
> - Overloads are several public signatures over one implementation signature
> - The implementation signature is wider and never exposed to callers
> - Reach for overloads when the return type depends on the argument
> - Same-return, different-params → use a union parameter instead
> - Overloads and function types are erased at runtime — zero cost
> - Next stop: Lesson 35's `keyof`, `typeof` and indexed access give you the operators to type these functions more precisely

## Check your understanding

Answer these without looking back.

1. Write one function type in all three syntaxes.
2. What does `(e: Event) => void` accept, and why is that a feature?
3. When do you reach for overloads instead of a union parameter?
4. Why must the implementation signature be wider than the overloads?
5. What's wrong with listing the wide signature among the public overloads?
6. Why does overload order matter?

## What's Next

**Lesson 35 — keyof, typeof & Indexed Access.** The three operators every advanced type is built from — how you read keys off a type, values off a value, and elements out of a shape.
