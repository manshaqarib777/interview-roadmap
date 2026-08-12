# Lesson 32 — Union & Intersection Types

**Interview importance:** ⭐⭐⭐ — modelling "one of these shapes" correctly is most of
day-to-day TypeScript.

Union types are the single most common type you'll write after primitives and objects —
every API that can succeed *or* fail, every nullable field, every "one of these" is a
union. Intersections combine shapes. Get the mental model right (OR vs AND) and most
real-world type design becomes mechanical.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain unions (OR) and intersections (AND) in one sentence each
- Write a literal union like `'small' | 'large'` and use it as an enum substitute
- Read a discriminated union of object shapes and know its member types
- Explain why a union of objects only exposes the **common** properties
- Combine shapes with `&` and understand when it's an interface `extends`

## 1. One-line definition

**A union type `A | B` is a value that is *either* `A` or `B`; an intersection type
`A & B` is a single value that is *both* `A` and `B` at once.**

## 2. Mental model

"OR" versus "AND".

- **Union = OR.** `string | null` is "a string, or nothing". `User | Guest` is "one of
  these two shapes". A value only has to satisfy *one* member.
- **Intersection = AND.** `A & B` is "everything `A` requires *and* everything `B`
  requires". It's a shape with the fields of both.

The everyday example: an event handler. `MouseEvent | KeyboardEvent` — *either* kind of
event arrives. A shape that is `Draggable & Clickable` — *both* capabilities.

## 3. Visual flow

```text
Union  A | B  — one of the two:
        ┌─────────┐   ┌─────────┐
        │    A    │   │    B    │
        └─────────┘   └─────────┘
        value is EITHER of these

        ╔═══════════════════════╗
        ║   accessible: common  ║  ← the properties A and B both have
        ║   properties only     ║
        ╚═══════════════════════╝

Intersection  A & B  — both at once:
        ┌───────────────┐
        │   A fields    │
        │   B fields    │
        └───────────────┘
        value has ALL of A and ALL of B
```

## 4. How it works

### Unions

```ts
type Id = string | number;

function render(id: Id): string {
  return `id: ${id}`;
}

console.log(render(42));
console.log(render('user_7'));
```

Output:

```text
id: 42
id: user_7
```

Both a `string` and a `number` are assignable to `string | number`. Nothing else is:

```ts
// render(true);  // 💥 Type 'boolean' is not assignable to type 'string | number'
```

### Literal unions — the enum substitute

Union literals encode a fixed set of allowed values, which replaces enums in most modern
TypeScript:

```ts
type Size = 'small' | 'medium' | 'large';

function label(s: Size): string {
  return `Size: ${s}`;
}

console.log(label('medium'));
```

Output:

```text
Size: medium
```

`'medium'` matches one of the three literals, so it typechecks. `label('huge')` would
error — the type system now knows the only valid sizes. Because the union is just
strings, it works with autocomplete, narrowing (Lesson 33), and structural checks.

### Unions of objects — common properties only

When a union's members are objects, you can only read the properties **all** members
have, without narrowing:

```ts
type Success = { status: 'ok'; data: string };
type Failure = { status: 'error'; error: string };

type Result = Success | Failure;

function summarize(r: Result): string {
  // r.data          // 💥 property 'data' does not exist on type 'Failure'
  return r.status;   // ✅ both members have `status`
}

console.log(summarize({ status: 'ok', data: 'payload' }));
console.log(summarize({ status: 'error', error: 'boom' }));
```

Output:

```text
ok
error
```

`data` doesn't exist on `Failure`, so it's off-limits until the type is narrowed. `status`
exists on both, so it's always safe. This is the "only common properties" rule — and the
`status` literal here is the *discriminant* that makes narrowing possible (Lesson 33
and Lesson 38).

```narrate
line 9: r.status is safe because every member of the union declares it
line 8: r.data is rejected — Failure has no such property
```

### Intersections

```ts
type HasName = { name: string };
type HasAge = { age: number };

type Person = HasName & HasAge;

const person: Person = { name: 'Mansha', age: 28 };

console.log(person.name, person.age);
```

Output:

```text
Mansha 28
```

A `Person` has *all* the fields of both pieces. Intersections are the type-alias way to
compose — the counterpart to `interface ... extends` from Lesson 31.

> [!TIP]
> Intersecting **objects** adds fields. Intersecting a **literal union** like
> `'a' | 'b'` with something narrows the set of allowed values — `'a' | 'b'` & `'b'` is
> just `'b'`. Same operator, two directions: AND accumulates objects, filters literals.

## 5. Real project usage

| Pattern | Type |
|---|---|
| Nullable field | `string \| null` |
| Either/or result | `Success \| Failure` (discriminated union) |
| Fixed choices | `type Size = 'small' \| 'medium' \| 'large'` |
| Multiple accepted inputs | `string \| string[]` |
| A record plus extra capabilities | `Record<string, string> & { extra: boolean }` |
| React refs | `HTMLElement \| null` |

Discriminated unions in real code — an API call that can go three ways:

```ts
type ApiState =
  | { status: 'loading' }
  | { status: 'success'; data: string }
  | { status: 'error'; error: Error };

const state: ApiState = { status: 'success', data: 'hello' };

console.log(state.status);
```

Output:

```text
success
```

Each member has a literal `status`, so the union is *discriminated*: reading `status`
tells you which member you're looking at, and later narrowing (Lesson 33) can unlock
`data` or `error` safely. This exact shape — loading/success/error — is the most common
pattern in application TypeScript (Lesson 38 covers it in depth).

## 6. Interview explanation

> A union is OR — the value is one of the listed types. An intersection is AND — one
> value with all the listed shapes. Unions with literal types give you fixed-choice
> values instead of enums, and unions of objects are the natural model for "one of
> these". The catch: a union of objects only exposes the properties they have in
> common, until you narrow.

## 7. Senior-level insights

A senior answer adds the nuances that separate one-line definitions from real usage:

- **`never` is the empty union.** A type with no members. Narrowing exhausts a union
  when nothing is left — the compiler's way of proving your switch covered every case.
- **Discriminated unions are the flagship pattern.** A literal `status`/`kind` field on
  every member turns a plain union into one you can switch on and narrow exhaustively.
  This is *the* day-to-day TypeScript pattern for state machines and API results.
- **Unions propagate through the language.** `Promise<T | null>`, `T[] | undefined`,
  `Array<T | null>` — most production types are unions inside other shapes. Getting
  comfortable reading nested unions is most of real-world type-reading.
- **`A & B` can be impossible.** Intersect types with incompatible fields — say `{ a:
  string } & { a: number }` — and `a` has no valid value, so the intersection collapses
  to `never`. The compiler doesn't always warn you; the type is just unusable.

## 8. Common mistakes

**Treating unions as "all of them".** `string | number` accepts *one* value that is a
string *or* a number — not both. (There's no value that's both, which is exactly what an
intersection of primitives like `string & number` would require — it collapses to
`never`.)

**Reading member-only properties without narrowing.** The "common properties only" rule
is the #1 source of union errors:

```ts
type Success = { status: 'ok'; data: string };
type Failure = { status: 'error'; error: string };
type Result = Success | Failure;

function bad(r: Result): string {
  // return r.data;   // 💥 'data' does not exist on type 'Failure'
  return r.status;
}
```

Output:

```text
(compile-time only — the comment would error, r.status compiles)
```

The fix isn't a cast — it's narrowing on the discriminant (Lesson 33):

```ts
function good(r: Result): string {
  return r.status === 'ok' ? r.data : r.error;
}

console.log(good({ status: 'ok', data: 'payload' }));
console.log(good({ status: 'error', error: 'boom' }));
```

Output:

```text
payload
boom
```

**Wrapping a union in an array type backwards.** `string | number[]` is "a string, or an
array of numbers" — not "an array of strings or numbers". The latter is
`(string | number)[]`. The parentheses decide the meaning:

```ts
type A = string | number[];          // string  OR  number[]
type B = (string | number)[];        // array of (string or number)
```

**Using `any` instead of a union.** `any` disables checking for everything; a union
keeps checking and narrows. If the value is "string or number", write
`string | number`, not `any` — you keep autocomplete and compile-time safety.

> [!PITFALL]
> **Intersecting two object types with the same property name.** `{ a: string } & {
> a: number }` makes `a` impossible — the intersection is `never`. If you're
> intersecting shapes, make sure shared fields are compatible or explicitly overridden.

## 9. Best practices

✅ Use literal unions instead of `enum` for fixed choices

✅ Model results as discriminated unions: `Success | Failure` with a `status` literal

✅ Read unions as "one of" and intersections as "all of" — say it out loud while writing

✅ Put the discriminant first and give it a literal type

✅ Prefer `string | null` over optional-`any`-style avoidance of null handling

❌ Don't read member-only properties until you've narrowed (Lesson 33)

❌ Don't reach for `any` when a union would preserve checking

❌ Don't intersect types with conflicting fields — the result silently becomes `never`

## 10. Interview questions

**Q1. What is a union type?**

> A type that can be one of several types — `string | number` accepts either. The value
> satisfies exactly one member. Unions are the natural model for "one of these" and,
> with literal members, for fixed-choice values like `'small' | 'medium' | 'large'`.

**Q2. What is an intersection type?**

> A type that combines multiple shapes — `A & B` requires all the fields of both. It's
> the composition tool for type aliases, the counterpart to `interface ... extends`.

**Q3. Why can't you read a property that only one union member has?**

> Because the union is `Success | Failure` — the value could be *either*. Reading
> `data` is only safe once the type system knows it's a `Success`, which requires
> narrowing on the discriminant. Without narrowing, only the common properties are
> guaranteed to exist.

**Q4. What is a discriminated union?**

> A union where every member carries a literal field — `status: 'ok'` vs
> `status: 'error'`. That literal is the discriminant: checking it narrows the union to
> one member, so the compiler then allows the member-specific properties. It's the
> standard pattern for API results and state machines.

**Senior follow-up: What does `never` have to do with unions?**

> `never` is the union with no members — nothing can be assigned to it. When narrowing
> eliminates every member of a union, what's left is `never`. That's how exhaustive
> checks work: after handling every case, the default branch receives `never`, and if a
> new member is added later, the compiler flags the switch as non-exhaustive. It's the
> type system's completeness proof.

## 11. Follow-up questions

**Q: When would you use a literal union instead of an enum?**

> Almost always. A union of string literals is plain data — it works with
> autocomplete, narrowing, and serialization, and it's erased at runtime. Enums add
> runtime objects and (with numeric enums) reverse mappings. Teams that prefer
> minimalism default to literal unions.

**Q: How do you model a value that can be absent?**

> `T | null` for genuinely nullable data, and `T | undefined` (or an optional property)
> for "may not exist". For values that can be both, `T | null | undefined`. Narrowing
> (Lesson 33) makes these safe to consume.

**Q: Can you union and intersect at the same time?**

> Yes — `(A | B) & C` means "C, plus either A or B". TypeScript has full
> distributivity and simplification rules for these combinations, so the types compose
> exactly like set algebra.

## 12. Comparison table

| | Union `A \| B` | Intersection `A & B` |
|---|---|---|
| Meaning | OR — one of them | AND — both at once |
| Primitive example | `string \| number` | `string & number` → `never` |
| Object example | `Success \| Failure` | `HasName & HasAge` |
| Fields visible | Common to all members only | All fields of both |
| Fixed choices | `'small' \| 'large'` | — |
| Narrowing | Yes — via guards/discriminant | Not needed — fields already known |
| Runtime cost | None (erased) | None (erased) |
| Interface counterpart | — | `interface X extends A, B` |

## 13. Code example

A complete program using a discriminated union end to end:

```ts
type Payload =
  | { kind: 'text'; body: string }
  | { kind: 'image'; url: string; alt: string }
  | { kind: 'empty' };

function render(p: Payload): string {
  switch (p.kind) {
    case 'text':
      return p.body;                       // ✅ narrowed: body exists
    case 'image':
      return `<img src="${p.url}" alt="${p.alt}" />`;
    case 'empty':
      return '';
    default:
      const exhaustive: never = p;         // ✅ any new member fails to compile here
      return exhaustive;
  }
}

console.log(render({ kind: 'text', body: 'hello' }));
console.log(render({ kind: 'image', url: '/a.png', alt: 'a' }));
console.log(render({ kind: 'empty' }));
```

Output:

```text
hello
<img src="/a.png" alt="a" />
```

The `switch` on `kind` narrows each case to its member, and the `default` branch
demands `never` — the compiler itself guarantees the union is fully handled.

```narrate
line 4-6: three members, each with a literal `kind` discriminant
line 8-16: switching on `kind` narrows to one member per case, unlocking its fields
line 14-16: the exhaustive check — if a fourth member is ever added, this stops compiling
```

## 14. Performance notes

Unions and intersections are compile-time constructs — **zero runtime cost**, both are
erased. The performance story is entirely in the checker:

- Large unions make the compiler do more work, but TypeScript flattens and
  simplifies them aggressively.
- Deeply nested unions/intersections in *mapped or conditional types* (Lesson 39+)
  are where type-level computation can slow builds — that's a type-programming concern,
  not a data concern.
- At the value level, a union variable compiles to the same JavaScript as an untyped
  one. No runtime checks are ever emitted.

## 15. Debugging scenarios

**"`Property 'data' does not exist on type 'Failure'`."** You're reading a
member-specific property before narrowing. Check the discriminant first, or narrow with
a guard (Lesson 33).

**"`Type 'boolean' is not assignable to type 'string | number'`."** The value isn't a
member of the union. Either the value is genuinely outside the set (fix the value) or
the union is too narrow (widen it).

**"The intersection type is `never`."** Conflicting fields — `{ a: string } & { a:
number }`. There's no value with both. Find the shared property and reconcile it.

**"My switch doesn't flag a missing case."** The union's members may share a
discriminant value (two members both `status: 'ok'`), so the compiler can't
distinguish them — or the default branch isn't typed as `never`. Give every member a
unique literal.

> [!TIP]
> Hover any type in your editor to see it *simplified*. If TypeScript collapsed your
> union to `never` or flattened an intersection unexpectedly, the hover shows you the
> truth immediately — faster than reasoning it out.

## 16. Quick revision notes

- Union = OR (`A | B` — one of them); Intersection = AND (`A & B` — all of both)
- Literal unions replace enums: `'small' | 'medium' | 'large'`
- A union of objects exposes only **common** properties until you narrow
- A literal field on every member makes a **discriminated union** — switchable and exhaustive
- `(string | number)[]` ≠ `string | number[]` — parentheses decide
- `A & B` with conflicting fields collapses to `never`
- `never` = empty union; used to prove exhaustive switches
- Both are erased — zero runtime cost

## 17. Cheat sheet

```text
nullable:     string | null
either/or:    Success | Failure
choices:      type Size = 'small' | 'medium' | 'large'
union array:  (string | number)[]
optional:     string | undefined
compose:      type Person = HasName & HasAge
exhaustive:   default: { const n: never = x; return n; }
discriminated:
  type R =
    | { status: 'ok'; data: string }
    | { status: 'error'; error: string };
  switch (r.status) { case 'ok': ... case 'error': ... }
parentheses:  T | U[]  is T or (array of U)   —  (T | U)[]  is array of either
```

## 18. Key takeaways

> [!RECAP]
> - Union = OR, one of the members; intersection = AND, all of the members
> - Literal unions are the idiomatic replacement for enums
> - Unions of objects expose only **common** properties until you narrow
> - Discriminated unions (a literal `status`/`kind` on each member) are the flagship pattern
> - `never` proves exhaustive handling — the compiler checks your switches for you
> - Intersecting conflicting fields collapses to `never`
> - All erased at compile time — no runtime cost

## Check your understanding

Answer these without looking back.

1. State the difference between `A | B` and `A & B` in one sentence each.
2. Why can't you read `data` on a `Success | Failure` value directly?
3. What makes a union *discriminated*, and what does the discriminant unlock?
4. What is `never`, and how is it used to prove a switch is exhaustive?
5. Why is `(string | number)[]` different from `string | number[]`?
6. What happens when you intersect `{ a: string }` with `{ a: number }`?
7. Why are literal unions preferred over enums in modern TypeScript?

## What's Next

**Lesson 33 — Narrowing & Type Guards.** How you turn an unknown API response into
something safe to use. You'll learn `typeof`, `instanceof`, `in`, `Array.isArray`,
discriminant narrowing, and `x is T` predicates — the machinery that makes the unions
from this lesson safe to consume.
