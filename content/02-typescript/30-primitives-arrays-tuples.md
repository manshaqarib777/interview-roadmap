# Lesson 30 — Primitives, Arrays & Tuples

**Interview importance:** ⭐⭐ — foundational; every later lesson builds on these forms.

These are the vocabulary of every annotation you'll ever write. Get the primitive names
right, learn the two array syntaxes, and understand where tuples behave like arrays but
stricter. There's little to memorise here — the value is fluency.

## Learning Objectives

By the end of this lesson you should be able to:

- Name all the TypeScript primitive types and match them to JavaScript values
- Write the two array syntaxes and explain why they're identical
- Annotate a tuple and read a tuple type at a glance
- Explain why `readonly` matters for arrays and tuples
- Distinguish the primitive types from wrapper-object types

## 1. One-line definition

**The primitive types are the types of the basic values from Lesson 1 (`number`,
`string`, `boolean`, plus `null`, `undefined`, `symbol`, `bigint`), and arrays and
tuples are the two list forms built on top of them.**

## 2. Mental model

Labels on the boxes from Lesson 1.

JavaScript values live in labelled boxes; the label is the type. `"Mansha"` has the
label `string`, `42` has `number`, `true` has `boolean`. An array is a box of boxes —
`number[]` is "a box full of number boxes". A tuple is a box with a *fixed number* of
slots in a *fixed order*: `[string, number]` is "two slots, first a string, then a
number".

## 3. Visual flow

```text
 values        type            notes
─────────────────────────────────────────────────────
 "hello"  →    string          text
 42       →    number          integers and floats share one type
 true     →    boolean
 null     →    null
 undefined →   undefined
 Symbol() →    symbol          unique per call
 10n      →    bigint

 list forms
─────────────────────────────────────────────────────
 [1,2,3]      →    number[]          homogeneous, any length
 ["a", 1]     →    (string | number)[]   homogeneous union of slots
 ["a", 1]     →    [string, number]  tuple — fixed length, fixed order
```

## 4. How it works

The primitives map 1:1 onto JavaScript's own primitive values:

```ts
let name: string = 'Mansha';
let age: number = 28;
let active: boolean = true;
let nothing: null = null;
let unset: undefined = undefined;
let key: symbol = Symbol('id');
let big: bigint = 10n;

console.log(name, age, active, nothing, unset, big);
```

Output:

```text
Mansha 28 true null undefined 10n
```

`symbol` and `bigint` have no `console.log`-visible content, so the variables are
declared without logging them.

> [!NOTE]
> `number` covers integers *and* floats — there is no `int` or `float` in TypeScript.
> `3` and `3.14` are both `number`. Same for negatives and `NaN`/`Infinity`.

### Arrays

Two syntaxes, one meaning:

```ts
const scores: number[] = [10, 20, 30];
const names: Array<string> = ['Mansha', 'Ali'];

console.log(scores, names);
```

Output:

```text
[ 10, 20, 30 ] [ 'Mansha', 'Ali' ]
```

`T[]` and `Array<T>` are identical — pick one and stay consistent (most codebases use
`T[]`). Either way the type says: any number of elements, every one a `T`. A `number[]`
with no elements is still a valid `number[]`.

### Tuples

```ts
const entry: [string, number] = ['age', 28];

console.log(entry[0], entry[1]);
```

Output:

```text
age 28
```

A tuple fixes **length** and **order**. The value must be exactly two slots, the first a
string, the second a number. Attempts to put a number first fail:

```ts
const bad: [string, number] = [28, 'age'];
```

The compiler error:

```text
error TS2322: Type 'number' is not assignable to type 'string'.
```

Tuples are the reason TypeScript can model pairs and small fixed records precisely:
`[x, y]` coordinates, `[key, value]` pairs, `useState` returning `[T, setter]`.

### Readonly

Arrays and tuples are mutable by default — `push`, `splice` and element assignment are
all allowed. `readonly` opts out:

```ts
const fixed: readonly [number, number] = [3, 4];
// fixed[0] = 9;              // ❌ cannot assign to a readonly index
// fixed.push(5);             // ❌ property 'push' does not exist

const growable: number[] = [1];
growable.push(2);
console.log(growable);
```

Output:

```text
[ 1, 2 ]
```

For arrays the equivalent is `ReadonlyArray<T>`; `readonly number[]` is the common short
form.

> [!PITFALL]
> `const` only freezes the *binding* (Lesson 1) — `const arr = [1]` still allows
> `arr.push(2)`. If you mean "this list must not change", say `readonly` on the type.
> And `readonly` is a compile-time rule only: it is erased, so it adds no runtime cost.

## 5. Real project usage

| Pattern | Type |
|---|---|
| A list of IDs | `number[]` |
| An API's JSON payloads | `ApiResponse[]` |
| Coordinates | `[number, number]` |
| A `[key, value]` pair before building a `Map` | `[string, number]` |
| A fixed configuration record | `readonly [string, number, boolean]` |
| React `useState` return | `[T, Dispatch<SetStateAction<T>>]` |

Coordinates, concretely:

```ts
type Point = [number, number];

function distance(a: Point, b: Point): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

console.log(distance([0, 0], [3, 4]));
```

Output:

```text
5
```

Destructuring makes tuples read naturally:

```ts
const [x, y] = [3, 4] as [number, number];
console.log(x, y);
```

Output:

```text
3 4
```

## 6. Interview explanation

> The primitive types — `string`, `number`, `boolean`, `null`, `undefined`, `symbol`,
> `bigint` — mirror JavaScript's own primitives. `number` covers both integers and
> floats. Arrays are homogeneous lists written `T[]` or `Array<T>`, any length. Tuples
> are fixed-length, fixed-order lists written `[string, number]`, used for pairs and
> small records. `readonly` makes either immutable at compile time.

## 7. Senior-level insights

A senior answer adds the fine distinctions most people miss:

- **Wrapper objects vs primitives.** `'x'` is a `string`; `new String('x')` is an
  object that happens to look like one. Don't annotate with `String`/`Number`/`Boolean`
  — the capitalised names are the object wrappers and are almost never what you mean.
- **Tuple push is the classic trap.** Even with `const`, `entry.push('extra')` is
  allowed by default, because tuples are arrays at runtime. `readonly` blocks it — and
  a `readonly` tuple is what you actually want for anything "fixed".
- **A tuple is an array to JS.** Because of that, methods like `push` exist on it.
  Being able to say "tuples are just arrays with a stricter compile-time shape, which
  is why `readonly` matters" is a strong answer.
- **Inference prefers arrays.** `const p = [3, 4]` infers `number[]`, not a tuple. To
  get a tuple you annotate or use `as const` (Lesson 35's `typeof` lesson covers the
  mechanics).

## 8. Common mistakes

**`String` instead of `string`.** Capitalised names are the wrapper-object types:

```ts
let s: String = 'hi';      // ⚠️ legal but wrong — use `string`
```

`string` (lowercase) is the primitive; `String` is an object type that `string` happens
to be assignable to. Rule: primitives are lowercase.

**Confusing tuples and arrays.** `[string, number]` is not the same as
`(string | number)[]` — the tuple fixes the layout, the union array allows any mix, any
length. Both are valid for the same value `['a', 1]`, which is exactly why the
annotation decides the meaning.

**Forgetting `readonly`.** Defaulting to mutable lists is fine for local variables, but
for a function parameter or a public API shape, a mutable `T[]` invites callers to
mutate something they don't own. `readonly T[]` says "you may read, not write".

**Assuming arrays are fixed length.** A `number[]` with three elements is still a
`number[]` after `push` makes it four. If the length matters, it's a tuple.

> [!PITFALL]
> **Empty arrays and inference.** `const nums = []` infers `never[]` ("a list of
> nothing") and later widenings can error. If the array is empty at declaration but will
> hold values later, annotate it: `const nums: number[] = [];`

## 9. Best practices

✅ Use `number` for every numeric value — there is no `int`/`float` distinction

✅ Prefer `T[]` and use it consistently; keep `Array<T>` for generic contexts

✅ Reach for a tuple when length and order are part of the meaning

✅ Mark lists you don't intend to mutate as `readonly`

✅ Prefer primitive names (`string`) over wrapper names (`String`) in every annotation

❌ Don't annotate with `String`, `Number` or `Boolean`

❌ Don't use `any[]` when the element type is knowable

❌ Don't use a tuple where a plain array (or an object) would be clearer — naming beats position

## 10. Interview questions

**Q1. What are the primitive types in TypeScript?**

> `string`, `number`, `boolean`, `null`, `undefined`, `symbol` and `bigint`. They map
> directly to JavaScript's primitive values — `number` covers both integers and floats.

**Q2. What's the difference between an array and a tuple?**

> An array is homogeneous — any number of elements, all the same type. A tuple fixes
> length and position: `[string, number]` is exactly two elements, first a string, then
> a number. At runtime both are arrays; the difference exists only in the type system.

**Q3. What is the difference between `string` and `String`?**

> `string` is the primitive type — lowercase, the normal one you want. `String` is the
> wrapper object type created by `new String(...)`. A primitive `string` is assignable
> to `String`, but annotating with `String` invites confusion and is almost never right.

**Q4. Why is `readonly` important for tuples?**

> Because a tuple is just an array at runtime, methods like `push` exist on it — so by
> default a "fixed" tuple can still grow. `readonly [string, number]` blocks mutation at
> compile time, which is usually what a fixed pair should be.

**Senior follow-up: Can you spot why `const point = [3, 4]` is not a tuple?**

> Inference gives it the widest useful type, `number[]` — an array of any length. If a
> function expects a `[number, number]` tuple, that inferred array won't satisfy it
> without an annotation or `as const`. The moment a fixed-length pair is the intent,
> the type has to say so explicitly.

## 11. Follow-up questions

**Q: When would you use a tuple over an object?**

> When the position is the meaning — coordinates, `[key, value]` pairs, `useState`'s
> return — and when a tiny throwaway pair doesn't deserve named fields. As soon as the
> pair grows past two fields or the meaning of a slot isn't obvious, an object wins:
> `{ x: number; y: number }` beats `[number, number]` for readability.

**Q: Can a tuple have optional elements?**

> Yes — `[string, number?]` means the second slot may be absent, and the tuple's length
> becomes "one or two". TypeScript even models the remaining elements explicitly with a
> trailing `...rest: string[]` for variadic tuples.

**Q: What is `ReadonlyArray<T>`?**

> The same idea as `readonly` for arrays. `ReadonlyArray<T>` and `readonly T[]` are
> equivalent — no `push`, `splice` or index assignment at compile time. Prefer
> `readonly T[]`; it reads more naturally.

## 12. Comparison table

| Type | Example | Length | Order | Mutability |
|---|---|---|---|---|
| Array `T[]` | `number[]` | Any | Irrelevant (same type) | Mutable by default |
| `readonly` array | `readonly number[]` | Any | Irrelevant | Read-only |
| Tuple | `[string, number]` | Fixed | Fixed | Mutable by default |
| `readonly` tuple | `readonly [string, number]` | Fixed | Fixed | Read-only |
| Union array | `(string \| number)[]` | Any | Any mix | Mutable by default |
| Object (next lesson) | `{ x: number }` | — | Named fields | Mutable by default |

## 13. Code example

A complete program exercising all the forms:

```ts
const tags: string[] = ['ts', 'js'];
const point: readonly [number, number] = [3, 4];
const pair: [string, number] = ['retries', 3];

function describe(labels: readonly string[]): string {
  return labels.join(', ');
}

console.log(describe(tags));
console.log(point[0], point[1]);
console.log(`${pair[0]}: ${pair[1]}`);
```

Output:

```text
ts, js
3 4
retries: 3
```

The `readonly` array parameter means `describe` promises not to modify the list it's
given — callers can pass a mutable `string[]` in safely, because a mutable list *is
assignable* to its readonly form.

## 14. Performance notes

Type annotations have **zero runtime cost** — `: number[]` is erased. The value of
readonly/immutability here is correctness, not speed; a mutating program is usually
*slower* than an immutable one only because of the bugs it causes, not the code itself.

Where it matters at runtime: `Array` methods and tuple destructuring compile to plain
JavaScript, so the performance characteristics are identical to hand-written JS. The
only "cost" is compile time — the typechecker doing more work when the types are more
precise, which is exactly the work you want it doing.

## 15. Debugging scenarios

**"`'x' is not assignable to type 'number'` everywhere."** The annotation and the value
disagree. Check whether a value arriving from another module (or `JSON.parse`) is
actually a different type than you assumed — the error is the compiler being honest.

**"My empty array errors when I push."** `const nums = []` inferred `never[]`. Annotate
it: `const nums: number[] = []`.

**"The tuple is suddenly longer."** Somewhere a `.push()` slipped through, or a wider
type was assigned. Search the call sites; then make the tuple `readonly` so the
compiler catches it next time.

**"`number[]` won't fit a `[number, number]` parameter."** The inferred type is wider
than the tuple. Fix at the source with an annotation (`const p: [number, number] = [3,
4]`) or `as const`.

> [!TIP]
> When a type error points at a value that looks correct, hover the value in your editor
> to see the type the compiler *actually* inferred — usually wider than you expected,
> and that's the mismatch.

## 16. Quick revision notes

- Primitives: `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`
- `number` = integers + floats, one type only
- Arrays: `T[]` ≡ `Array<T>`; homogeneous, any length
- Tuples: `[string, number]` — fixed length, fixed order
- Tuples are arrays at runtime → `push` works unless `readonly`
- `readonly T[]` / `readonly [..]` — compile-time immutability, zero runtime cost
- `const` protects the binding; `readonly` protects the contents
- Primitive names are lowercase — never `String`/`Number`/`Boolean` wrappers
- Inference widens `[3, 4]` to `number[]` — annotate or use `as const` for tuples

## 17. Cheat sheet

```text
numbers:      let n: number = 42;
strings:      let s: string = 'hi';
booleans:     let b: boolean = true;
nullish:      let x: null = null;      let u: undefined = undefined;
symbol:       let k: symbol = Symbol('id');
bigint:       let big: bigint = 10n;

arrays:       number[]        Array<number>      (identical)
readonly:     readonly number[]                  ReadonlyArray<number>
tuples:       [string, number]                   readonly [number, number]
union list:   (string | number)[]
variadic:     [string, ...number[]]

inference:    const n = 1;   // n: number
              const nums = [];      // never[]  → annotate: number[]
              const p = [3, 4];     // number[] → annotate: [number, number]
```

## 18. Key takeaways

> [!RECAP]
> - Primitives mirror JS values: `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`
> - `number` covers integers and floats — there is no `int`
> - `T[]` and `Array<T>` are the same; use `T[]` consistently
> - Tuples fix length and order: `[string, number]`
> - At runtime tuples are arrays, so `readonly` is what makes a "fixed" pair actually fixed
> - Annotations are erased — types cost nothing at runtime

## Check your understanding

Answer these without looking back.

1. List all seven primitive types.
2. Why does `number` need to cover both `3` and `3.14`?
3. What is the difference between `[string, number]` and `(string | number)[]`?
4. Why can you call `push` on a tuple — and how do you stop it?
5. What is the difference between `string` and `String`?
6. Why does `const p = [3, 4]` infer an array, and how do you get a tuple?
7. What is the difference between `const` and `readonly` for arrays?

## What's Next

**Lesson 31 — Objects, Interfaces & Type Aliases.** Where day-to-day TypeScript really
lives. You'll shape objects with `interface` and `type`, and prepare the single most
asked interview question in TypeScript: interface vs type.
