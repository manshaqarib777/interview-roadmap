# Lesson 36 — Generics

**Interview importance:** ⭐⭐⭐⭐⭐ — the second-most-asked TypeScript topic. Expect to write a generic function live.

Generics are functions that run on types: they take a type in and produce a type out, keeping the connection between arguments and return values that a fixed type would break. If you can answer "what's the difference between `any` and generics" calmly, you've cleared a major filter. This lesson covers the identity function, generics over arrays, multiple type parameters, and the classic `first` function — then shows inference at every call site.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain a generic in one sentence and give the "type function" mental model
- Write a generic identity function and trace its inference at call sites
- Write generics over arrays, and the classic `first<T>(arr: T[])`
- Use multiple type parameters and pair them with `keyof` and indexed access from Lesson 35
- Say exactly how a generic differs from `any` — the stock follow-up

## 1. One-line definition

**A generic is a type-level function — it takes one or more type parameters and uses them to keep the types of your arguments and return value connected.**

Where a fixed type says "this is a `number`", a generic says "this is *whatever* you pass, and the return matches it".

## 2. Mental model

Think of a regular function as taking values and returning a value. A generic takes **types** and returns a **type**:

```text
   identity(value: T): T

   call with a number  →  T = number    →  returns number
   call with a string  →  T = string    →  returns string
```

The function body is written once; the type is specialised per call site. TypeScript fills in `T` by looking at the arguments you pass — that filling-in is called **inference**.

## 3. Visual flow

```text
   function identity<T>(value: T): T {
     return value;
   }

   identity(42)      →  T inferred as number   →  result: number
   identity('hi')    →  T inferred as string   →  result: string
   identity<boolean>(true)                     →  explicit, T = boolean
```

Inference flows from the argument to the type parameter, then the return type is computed from `T`. You only write `<boolean>` when inference can't work — the angle brackets are otherwise optional.

## 4. How it works

The generic identity function — everything else in this lesson is a variation:

```ts
function identity<T>(value: T): T {
  return value;
}

const a = identity(42);        // a: number   — T inferred from the argument
const b = identity('hello');   // b: string
const c = identity<boolean>(true); // c: boolean — explicit type argument

console.log(typeof a, typeof b, typeof c);
```

Output:

```text
number string boolean
```

The `T` in `identity<T>` is a **type parameter** — a hole the compiler fills per call. Without it, `identity(value: number): number` would refuse strings, and `identity(value: any): any` would forget the connection entirely.

```narrate
line 1: <T> declares the type parameter — the "input type" of this type function
line 2: T is used in both the parameter and return positions
line 4: inference: the argument 42 is a number, so T = number
line 5: a different call, a different T — one body, many specialisations
line 6: explicit type argument — only needed when inference can't decide
```

### Generic over an array

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const n = first([10, 20, 30]);       // n: number | undefined
const s = first(['a', 'b']);         // s: string | undefined
const firstEmpty = first<number>([]); // explicitly number | undefined

console.log(n, s, firstEmpty);
```

Output:

```text
10 a undefined
```

`arr[0]` on an empty array is `undefined`, so the honest return type is `T | undefined` — with `strictNullChecks` on (Lesson 46), callers are forced to handle the empty case. The `T` is inferred from the array's element type, and the return tracks it.

### Multiple type parameters

```ts
function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}

const p = pair(1, 'one');            // p: [number, string]
const q = pair('x', true);           // q: [string, boolean]

console.log(p, q);
```

Output:

```text
[ 1, 'one' ] [ 'x', true ]
```

Each type parameter is inferred independently from its own argument. Two parameters mean two independent connections — useful whenever a function relates two different types.

### Pairing generics with `keyof` (from Lesson 35)

```ts
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: 'Ali' };
const id = get(user, 'id');          // id: number
const name = get(user, 'name');      // name: string
// get(user, 'email');               // ❌ 'email' isn't a key of user

console.log(id, name);
```

Output:

```text
1 Ali
```

`K extends keyof T` is a *constraint* — Lesson 37's topic. For now note the payoff: `get` returns `T[K]`, the exact type of the property you asked for, not `number | string | undefined`. Inference fills both `T` and `K` from the call.

## 5. Real project usage

The generic functions that appear in real codebases daily:

```ts
// reusable array helpers — same function, any element type
function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

// identity with a narrowed name — map keys to values
function keyBy<T, K extends keyof T>(items: T[], key: K): Record<T[K], T> {
  const out = {} as Record<T[K], T>;
  for (const item of items) out[item[key]] = item;
  return out;
}

const users = [{ id: 1, name: 'Ali' }, { id: 2, name: 'Omar' }];
const byId = keyBy(users, 'id');     // Record<number, { id: number; name: string }>
console.log(byId[1].name);
```

Output:

```text
Ali
```

`keyBy` looks heavy, but it's two generics from this lesson plus a constraint. The type-level result — a `Record` keyed by the actual key type — is what makes the call site safe: `byId[1].name` type-checks because `byId` is `Record<number, User>`.

## 6. Interview explanation

> A generic is a type parameter — a hole the compiler fills in per call site. `function identity<T>(value: T): T` means "whatever type you pass in, that's the type you get back", so the argument and the return stay connected. TypeScript infers `T` from the arguments, so I usually don't write the angle brackets at all. It's erased at runtime — the emitted JavaScript is identical to a plain function.

## 7. Senior-level insights

The junior answer defines a generic. The senior answer explains **why generics exist and where they stop**:

- **The core job is preserving connections.** `first<T>(arr: T[]): T | undefined` keeps element type and return type in lockstep. `any` breaks that connection; a union parameter like `number | string` is wrong because it *widens* the return to the whole union. Generics are the only way to say "the return is the same specific type as the argument".
- **Inference is the feature, not the angle brackets.** When you see `<T>` written at a call site, the senior question is *why* — usually it's an inference failure that a constraint or a default would fix more honestly.
- **Generics compose with everything else in this module.** Constraint them with `extends` (Lesson 37), use them in conditional types (Lesson 40), drive mapped types (Lesson 41).
- A senior also knows the **naming convention**: `T`, `U`, `V` for the general case, meaningful names — `K` for keys, `E` for elements — once the parameter has a role.

## 8. Common mistakes

**Mistake 1 — reaching for `any` instead of a generic.** The return type of `any` is disconnected from the argument, so the error moves to the caller:

```ts
function firstAny(arr: any[]): any { return arr[0]; }
const x: number = firstAny([1, 2, 3]);   // compiles, no safety
const y: number = firstAny(['a', 'b']);  // ALSO compiles — silently wrong
```

```text
(compiles — `any` disabled the check; a generic would have caught the second line)
```

**Mistake 2 — using a union parameter where a generic belongs.** `(arr: (string | number)[]) => string | number` accepts only mixed arrays and returns the wide union. `first<T>` accepts any element type and returns exactly that type.

**Mistake 3 — over-genericising.** Not every function needs a type parameter. If `T` appears once and doesn't connect anything, it's noise. A generic earns its place when the return type (or a second parameter) depends on the type parameter.

## 9. Best practices

✅ Use a generic whenever the return type must track an argument's type

✅ Let inference work — omit `<T>` at the call site unless you must write it

✅ Prefer descriptive type parameter names (`K`, `E`) once the role is clear

✅ Return `T | undefined` from `first`/`last`-style helpers — be honest about emptiness

✅ Constrain with `extends` when a generic needs capabilities (Lesson 37)

❌ Don't use `any` where a generic preserves a connection

❌ Don't add type parameters that don't earn their keep

## 10. Interview questions

**Q1. What are generics and why do they exist?**

> Generics are type parameters — holes in a function or type that the compiler fills per use. They exist to preserve connections: `first<T>(arr: T[]): T | undefined` keeps the element type and the return type linked. `any` and union parameters both break that link by widening; a generic says "whatever you pass, that specific type comes back".

**Q2. What is the difference between `any` and a generic?**

> `any` opts out of checking entirely — the value can be anything and the return type carries no information. A generic is checked: `T` is inferred from the actual argument, so `first([1,2,3])` returns `number | undefined` while `first(['a','b'])` returns `string | undefined`. Same function body, but the type safety moves from "trust me" to "proven per call".

**Q3. Write a generic function that returns the first element of an array.**

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
```

> The `T` is inferred from the array's element type, and the return is `T | undefined` because `arr[0]` can be `undefined` on an empty array. Callers get the exact element type, and under `strictNullChecks` they must handle the empty case.

**Q4. How does TypeScript infer the type parameter?**

> From the arguments at the call site. `identity(42)` gives `T = number`; `pair(1, 'one')` infers two parameters independently — `A = number`, `B = string`. When inference can't decide — no arguments, or a contradictory call — I write the type argument explicitly: `identity<number>()`.

**Senior follow-up: When would you need to write the type argument explicitly?**

> When there's nothing to infer from. `first<number>([])` — an empty array gives no element to read. Or when the return type is what matters and the argument doesn't determine it: a generic that returns a default. Inference is preferred; explicit arguments are the escape hatch, and a senior uses them sparingly because they add noise at every call site.

## 11. Follow-up questions

**Can a generic have a default type?**

> Yes — `function make<T = string>()` makes `T` default to `string` when it can't be inferred. Defaults are common on type-level helpers (like the utilities in Lesson 39) and rare on functions, where a missing type argument usually signals a design question instead.

**Do generics work with arrow functions?**

> Yes, with a subtle syntax quirk. `const first = <T>(arr: T[]): T | undefined => arr[0]` works in `.ts` files, but in `.tsx` the `<T>` looks like JSX — so either use `<T,>` or `extends unknown`: `const first = <T,>(arr: T[]) => arr[0]`. Same generic, different parser.

**What is the runtime cost of generics?**

> Zero. Generics are erased during compilation — the emitted JavaScript is the plain function with no type parameters in sight. The only cost is compile-time checking, which is the point.

## 12. Comparison table

| Approach | Return type of `first` | `first([1,2,3])` | `first(['a','b'])` | Safety |
|---|---|---|---|---|
| `any` | `any` | `any` | `any` | ❌ none |
| Union param | `string \| number \| undefined` | wide union | wide union | ⚠️ leaks |
| Generic `<T>` | `T \| undefined` | `number \| undefined` | `string \| undefined` | ✅ tracked |

## 13. Code example

A small set of array helpers — the generics you'd actually ship:

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

function mapPair<A, B>(arr: [A, B][]): { first: A; second: B }[] {
  return arr.map(([a, b]) => ({ first: a, second: b }));
}

const nums = first([1, 2, 3]);
const words = first(['x', 'y']);
const pairs = mapPair([[1, 'one'], [2, 'two']]);

console.log(nums, words, pairs[0]);
```

Output:

```text
1 x { first: 1, second: 'one' }
```

Two type parameters on `mapPair` keep each element's halves matched — `pairs[0]` is `{ first: number; second: string }`, not a soup of `any`.

## 14. Performance notes

**Zero runtime cost** — generics are erased at compile time; the emitted JavaScript is a plain function. The type parameters exist only for the compiler. The compile-time cost scales with how many distinct instantiations the compiler must produce — dozens of call sites each with a different `T` are fine; a generic over a giant object type that's re-instantiated thousands of times can add seconds to a build. In practice: write generics freely, and only worry if a `tsc` trace points at a hot generic.

## 15. Debugging scenarios

**"Argument of type 'string' is not assignable to parameter of type 'number'."** The generic inferred `T = number` from one argument, and a later argument didn't fit. Either the call genuinely mixes types (use a union or two type parameters) or the inference is being steered wrong — check the first argument.

**"'T' is referenced directly or indirectly in its own type annotation."** A circular generic — the return type refers to `T` through itself. Break the cycle, usually by restructuring the type.

**"Expected 0 type arguments, but got 1."** You wrote `<T>` on a non-generic function, or the generic was on the type and not the value. Match the declaration.

**"Type 'undefined' is not assignable to type 'number'."** `first` returned `T | undefined` and you assigned it to `number` without narrowing. That's `strictNullChecks` doing its job (Lesson 46) — handle the empty case with a guard or a default.

## 16. Quick revision notes

- A generic is a type parameter: `<T>` in the signature, filled per call
- `function first<T>(arr: T[]): T | undefined` — the classic, expect to write it live
- Inference fills `T` from arguments; write `<T>` explicitly only when inference can't
- Multiple parameters: `pair<A, B>(a, b)` — each inferred independently
- Generics preserve connections; `any` and unions break them
- Pair with `keyof`/indexed access from Lesson 35 for property-safe lookups
- Erased at runtime — zero cost
- Constrain with `extends` to give `T` capabilities — Lesson 37

## 17. Cheat sheet

```ts
// identity — the template for everything else
function identity<T>(value: T): T { return value; }

// over arrays — the classic
function first<T>(arr: T[]): T | undefined { return arr[0]; }

// multiple type parameters
function pair<A, B>(a: A, b: B): [A, B] { return [a, b]; }

// with keyof + indexed access (Lesson 35)
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// arrow-function syntax (note the trailing comma in .tsx)
const firstArrow = <T,>(arr: T[]): T | undefined => arr[0];
```

```text
(no runtime output — these are type-level definitions)
```

## 18. Key takeaways

> [!RECAP]
> - A generic is a type parameter — a hole the compiler fills per call site
> - Its job is preserving connections: `first<T>(arr: T[]): T | undefined`
> - Inference fills `T` from the arguments; explicit `<T>` is the escape hatch
> - Multiple type parameters are inferred independently
> - `any` and union parameters break the connection a generic preserves
> - `extends` constraints (Lesson 37) let a generic assume capabilities
> - Erased at runtime — zero cost, compile-time only
> - Next stop: Lesson 37 makes generics useful in the real world with `extends`

## Check your understanding

Answer these without looking back.

1. Write the generic identity function and say what `T` does.
2. Write `first<T>` — then say why the return is `T | undefined` and not `T`.
3. What happens at the call site of `pair(1, 'one')`? What types come back?
4. What does `get<T, K extends keyof T>(obj, key): T[K]` return for `get(user, 'name')`?
5. Why is `any` not a substitute for a generic? Give the failing example.
6. When would you write the type argument explicitly?

## What's Next

**Lesson 37 — Generic Constraints.** `T extends SomeType` is where most people stall — how you tell a generic what it's allowed to assume, from `keyof T` constraints to `T extends string`.
