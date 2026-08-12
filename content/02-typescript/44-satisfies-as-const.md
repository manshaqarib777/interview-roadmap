# Lesson 44 — `satisfies` & `as const`

**Interview importance:** ⭐⭐⭐ — modern TypeScript that many candidates have not caught up with yet.

TypeScript gives you two ways to type a value you've already written. Annotate it and you
lose the precise literal types. Don't annotate it and you lose the checking. `as const` and
`satisfies` split that dilemma: `as const` freezes the value into its most literal type,
`satisfies` checks the value against a shape while keeping what you wrote. Together they're
how modern codebases write typed configuration.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what `as const` does to inference, in one sentence
- Explain what `satisfies` does that an annotation doesn't
- Decide which one a given situation needs — and when you need both
- Recognise the `string[]` vs `readonly ['a', 'b']` trap
- Say when `satisfies` was added and what it replaced

## 1. One-line Definition

**`as const` tells TypeScript to infer the narrowest, read-only literal type for a value;
`satisfies` checks a value against a type without widening it — keeping inference while
checking the shape.**

## 2. Mental Model

An **annotation** is a promise *to* the type system: "this value is exactly `Route[]`". The
type system takes you at your word and widens everything to match.

`satisfies` is a promise *from* the type system: "this value *at least* fits `Route[]` —
now go ahead and use its real, precise type."

`as const` is a lock: "this literal is frozen exactly as written — nothing widens, nothing
becomes mutable."

```text
Annotate   :  const r: Route[] = [...]      →  everything becomes Route
satisfies  :  const r = [...] satisfies Route[]  →  fits the check, keeps the literals
as const   :  const r = [...] as const       →  readonly, literal, nothing widens
```

## 3. Visual Flow

```text
                       ┌──────────────────────────────┐
                       │   a value you already wrote  │
                       └──────────────┬───────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
        `: Type`             `satisfies Type`          `as const`
              │                       │                       │
              ▼                       ▼                       ▼
      widened to Type         checked against        frozen: literal +
      (literal info lost)     Type, but the value    readonly, widest
                              keeps its own type     checking deferred
                              (narrow literals)      to what needs it
```

## 4. How It Works

### Why annotations lose the literals

```ts
type Method = 'GET' | 'POST' | 'PUT';

const api: { path: string; method: Method } = {
  path: '/users',
  method: 'GET',
};

api.method; // type: Method  — the literal 'GET' is gone
```

Output:

```text
api.method = Method (not 'GET')
```

The annotation widened `'GET'` to `Method`. That's correct and safe — but autocomplete and
exhaustive checks can no longer see the exact literal.

### `as const` — freeze the literal

```ts
const methods = ['GET', 'POST'] as const;

// methods: readonly ['GET', 'POST']

const m = methods[0]; // 'GET'  — a literal, not string
```

Output:

```text
m = 'GET'
```

```narrate
line 1: as const turns the array into a readonly tuple of literals
line 3: indexing a literal tuple gives you the exact literal back
```

### `satisfies` — check the shape, keep the value

```ts
type Method = 'GET' | 'POST' | 'PUT';
type Routes = Record<string, { method: Method; handler: () => void }>;

const routes = {
  home: { method: 'GET', handler: () => {} },
  create: { method: 'POST', handler: () => {} },
} satisfies Routes;

routes.home.method;  // 'GET'     ← still the literal
routes.create;       // typed    ← shape was checked
```

Output:

```text
routes.home.method = 'GET'
routes.create = { method: 'POST', handler: () => void }
```

The object is *validated* against `Routes` (a typo like `method: 'DELETE'` errors) while
each field *keeps* its literal type for autocomplete and narrowing.

> [!TIP]
> Before `satisfies` (TS 4.9, 2022) the pattern was `satisfies`-like checks done by hand:
> annotate and lose literals, or write a const assertion and lose the check. Modern code
> uses `satisfies` precisely because it gives both.

## 5. Real Project Usage

| Situation | Tool | Why |
|---|---|---|
| Route table / config object | `satisfies` | Check every route against a `Route[]` shape, keep literal `path`s |
| CSS or theme tokens | `as const` | Freeze token names so autocomplete shows exactly the ones that exist |
| Error maps / event names | `as const` | Exhaustive `switch` over literal keys (pairs with Lesson 38, 42) |
| React props mapping | `satisfies` | Keep narrow prop names, still verify the shape |
| Reading config from `process.env` | `as const` + narrowing | Freeze the defaults, then narrow with guards from Lesson 33 |

A real route table with both:

```ts
type Method = 'GET' | 'POST' | 'PUT';
type Route = { method: Method; handler: () => void };

const routes = {
  home: { method: 'GET', handler: () => {} },
  create: { method: 'POST', handler: () => {} },
} satisfies Record<string, Route>;

routes.home.method; // 'GET' — literal preserved for autocomplete
```

Output:

```text
routes.home.method = 'GET'
```

## 6. Interview Explanation

> `satisfies` checks a value against a type *without changing its inferred type* — so a
> `method: 'GET'` stays `'GET'` instead of widening to a union. `as const` narrows a value
> to its most literal, readonly form — `['GET'] as const` becomes `readonly ['GET']` rather
> than `string[]`. One checks the shape and keeps inference; the other locks the literals.
> You combine them when you need both — `satisfies` the structure, `as const` the literals.

## 7. Senior-Level Insights

- **`satisfies` is not a type — it's a *check*.** It never changes the type of the value, it
  only verifies it. That's the entire difference from an annotation.
- **`as const` makes tuples read-only.** `['a', 'b'] as const` is a `readonly` tuple — you
  can't `.push()` it. That surprises people and is the point: it's a frozen value.
- **`satisfies` + `as const` compose.** The single most useful modern pattern:
  `const x = {...} as const satisfies T;` — freeze the literals *and* validate the shape.
- **`as const` is a type-level *assertion*, not a cast.** You're asking TypeScript to view
  the value at its narrowest; you can't use it to lie about a value's type the way `as`
  allows.
- **The old way was worse.** Before 4.9 teams either widened with annotations or hand-rolled
  `satisfies` via generic helper functions. Mentioning that you know the upgrade path is a
  strong signal.
- **`satisfies` catches the typo, `as const` catches the drift.** A wrong method name is a
  shape error; a config value silently widening to `string` is a precision error. Reach for
  the tool that catches the bug you actually have.

## 8. Common Mistakes

❌ Using `satisfies` with an object type that *doesn't* have the key you wrote — excess
property checks still apply.

```ts
const x = { a: 1 } satisfies { b: number }; // 💥 Object literal may only specify known properties
```

❌ Expecting `as const` arrays to be mutable.

```ts
const ports = [80, 443] as const;
ports.push(8080); // 💥 Property 'push' does not exist on type 'readonly [80, 443]'
```

❌ Widening without realising it — annotating where `satisfies` would have kept the literals.

❌ Using `satisfies` where `as const` was needed: a union of *strings* checks the shape but
the value still widens to `string`.

❌ Reaching for `as` instead of `as const` — `as` lies about types; `as const` narrows them.

## 9. Best Practices

✅ Use `satisfies` to check a value against a shape while keeping its precise type

✅ Use `as const` when you need literal types and readonly tuples (config, maps, tables)

✅ Combine: `as const satisfies T` freezes the literals *and* validates the shape

✅ Keep `satisfies` checks on the object literal itself, not on a variable of that type

✅ Pair `as const` with `satisfies` for exhaustive `switch` statements and event maps

❌ Don't annotate a config object when `satisfies` gives you both checking and precision

❌ Don't use `as const` on values you intend to mutate — it's frozen by design

## 10. Interview Questions

**Q1. What's the difference between `as const` and `satisfies`?**

> `as const` narrows a value to its most literal, readonly type — `['a'] as const` is
> `readonly ['a']`, not `string[]`. `satisfies` checks a value against a type *without*
> changing the value's type — it validates the shape but keeps the literal inference. In
> one line: one freezes literals, the other checks the shape. They compose as
> `as const satisfies T`.

**Q2. Why would you use `satisfies` instead of an annotation?**

> An annotation widens the value to the annotated type, which throws away the literals —
> autocomplete and exhaustive switches lose the exact `'GET'` vs `'POST'`. `satisfies`
> checks the value fits the shape and *keeps* the literal type. For a route table or config
> object you get both safety and precision.

**Q3. What does `as const` do to an array?**

> It infers a readonly tuple of literals. `['GET', 'POST'] as const` becomes
> `readonly ['GET', 'POST']` — so indexing gives you the exact literal `'GET'` instead of
> `string`, and the array is read-only.

**Q4. When do you combine `as const` and `satisfies`?**

> When I need both precision and validation: freeze the literals so the value is at its
> narrowest, and check the whole thing against a type so typos and shape mistakes surface.
> `const routes = {...} as const satisfies Routes;` gives me the union members *and* the
> shape check.

**Q5. What was the situation before `satisfies`?**

> You chose: annotate and lose literals, or leave it unannotated and lose the check. Some
> codebases hand-rolled generic helper functions that did the same check. `satisfies`
> (4.9, 2022) made it a language feature and removed the trade-off.

**Senior follow-up: Design a typed config for a small app using both.**

> ```ts
> type Environment = 'development' | 'production';
> type Config = {
>   apiUrl: string;
>   environment: Environment;
>   features: readonly string[];
> };
>
> const config = {
>   apiUrl: 'https://api.example.com',
>   environment: 'development',
>   features: ['dark-mode', 'beta'],
> } as const satisfies Config;
>
> config.environment; // 'development'  ← literal, exhaustively checkable
> config.features;    // readonly ['dark-mode', 'beta']
> ```
>
> The `as const` locks every literal — the environment can be checked exhaustively. The
> `satisfies` validates the whole thing against `Config`, so a missing field or a typo'd
> key fails to compile. One line gives both, which is why this is the modern default.

## 11. Follow-up Questions

**What happens if I use `satisfies` with a value that doesn't fit the shape?**

> It's a compile error, like an annotation's excess-property check — but the error names the
> actual value's type, not the widened one. Missing keys, wrong types, and unknown
> properties all fail.

**Does `satisfies` have a runtime cost?**

> No. It's purely a compile-time check — the emitted JavaScript is exactly the object
> literal, with no `satisfies` left behind.

**Can I use `as const` on a function call's result?**

> No — it's an assertion on a literal or expression whose *type* you want to freeze. For a
> call result you'd apply it to the literal argument, or rely on a return type instead.

**Why do people call `as const` "literal types on demand"?**

> Because it's the way to get the most precise inference without writing the type by hand —
> `const direction = 'north' as const` is `'north'`, and object literals get all their
> fields frozen at once.

## 12. Comparison Table

| | `: Type` annotation | `satisfies Type` | `as const` |
|---|---|---|---|
| Checks shape | ✅ | ✅ | ❌ (only freezes) |
| Keeps literal types | ❌ (widens) | ✅ | ✅ |
| Readonly | ❌ | ❌ | ✅ |
| Added | forever | TS 4.9 (2022) | TS 3.4 (2019) |
| Best for | APIs, public interfaces | config, route/event tables | token maps, frozen literals |
| Combine with | — | `as const` | `satisfies` |

## 13. Code Example

A theme object that needs literal color names *and* validation:

```ts
type ColorName = 'primary' | 'secondary' | 'danger';
type Theme = { colors: Record<ColorName, string> };

const theme = {
  colors: { primary: '#0af', secondary: '#fa0', danger: '#f00' },
} as const satisfies Theme;

theme.colors.primary;   // '#0af'  ← the literal, not string
// theme.colors.purple; // 💥 Property 'purple' does not exist — typo caught
```

Output:

```text
theme.colors.primary = '#0af'
```

```narrate
line 3: as const satisfies Theme — freeze the literals and validate against Theme at once
line 5: the field keeps its literal '#0af' for autocomplete and exhaustive switches
line 6: a typo'd key fails the satisfies check
```

## 14. Performance Notes

Neither feature has any runtime cost — both are erased. `satisfies` adds a compile-time
check proportional to the shape it's matched against; for a config object that's a handful
of keys, negligible. `as const` makes tuples read-only at the type level only — the emitted
array is still a plain mutable array. The only real performance consideration is on
**editors**: a deeply nested `as const satisfies` tree makes the language service work
harder, but it's well within normal ranges.

## 15. Debugging Scenarios

**"I typed the object but autocomplete shows `string` everywhere."** You annotated it.
Replace `: Routes` with `satisfies Routes` and the literals come back.

**"`Property 'push' does not exist` on an array I made with `as const`."** Right — `as const`
makes readonly tuples. Either drop `as const`, or treat the value as read-only on purpose.

**"The typo wasn't caught."** If the value is `satisfies`-checked, the shape has to include
the key — a `Record<string, …>` will accept any key by design. Use a closed union or an
object type listing the keys to catch unknown ones.

**"`satisfies` says the object may only specify known properties."** The checked type
doesn't have the key you wrote. Either add the key to the type or remove it from the
literal — exactly the kind of error `satisfies` exists to surface.

## 16. Quick Revision Notes

- `satisfies`: check the shape, keep the inferred type — never widens
- `as const`: freeze to literal, readonly types — `readonly ['a', 'b']`
- Annotation: widens, loses literals
- Combined pattern: `as const satisfies T` — both at once
- `satisfies` added TS 4.9 (2022); `as const` added TS 3.4 (2019)
- `as const` arrays are immutable; `satisfies` arrays stay mutable
- Both are compile-time only — zero runtime output
- Old code chose between checking and precision; new code has both

## 17. Cheat Sheet

```ts
type Route = { method: 'GET' | 'POST'; path: string };

// annotation  — loses literals
const r1: Route = { method: 'GET', path: '/' };
r1.method; // 'GET' | 'POST'

// satisfies  — checks shape, keeps literal
const r2 = { method: 'GET', path: '/' } satisfies Route;
r2.method; // 'GET'

// as const   — freezes everything
const r3 = ['GET', 'POST'] as const;
// r3: readonly ['GET', 'POST']

// both       — freeze + validate
const cfg = { method: 'GET', path: '/', flags: ['a'] } as const satisfies Route & { flags: readonly string[] };
```

## 18. Key Takeaways

> [!RECAP]
> - `satisfies` = check the shape without widening; `as const` = freeze the literals
> - An annotation widens; `satisfies` doesn't; `as const` narrows to the extreme
> - `as const` makes arrays `readonly` tuples — expect the `push` error
> - Combine them: `as const satisfies T` is the modern config pattern
> - `satisfies` is 4.9+ — mention the version and the old workarounds in interviews
> - Zero runtime cost; both are purely compile-time

## Check your understanding

Answer these without looking back.

1. In one sentence, what does `satisfies` do that an annotation doesn't?
2. What is the inferred type of `['GET', 'POST'] as const`?
3. Why does annotating a config object lose its literal types — and how does `satisfies` fix that?
4. When would you combine `as const` with `satisfies`? Write the combined syntax.
5. What was the pre-4.9 situation, and why did teams dislike it?
6. Your autocomplete shows `string` instead of `'GET'`. What did you do wrong?

## What's Next

**Lesson 45 — unknown vs any vs never.** A direct, frequently-asked question with a crisp
correct answer — and a comparison table that ends the debate.
