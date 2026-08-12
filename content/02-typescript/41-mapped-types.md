# Lesson 41 — Mapped Types

**Interview importance:** ⭐⭐⭐⭐ — knowing how `Partial` and `Readonly` are actually implemented is a favourite senior-screen question.

You've been using mapped types since Lesson 39 without naming them — every `Partial`, `Readonly`, `Pick` and `Record` is one. A mapped type is a type-level `map` over the keys of an object: it iterates `keyof T` (Lesson 35), and for every key produces a property. Understand this one loop and the entire utility toolbox stops being magic.

## Learning Objectives

By the end of this lesson you should be able to:

- Read and write the `[K in keyof T]` mapping syntax
- Build `Partial`, `Readonly` and `Record` from scratch
- Modify keys with `as` and `?`/`readonly` modifiers
- Compose mapped types with the conditionals from Lesson 40
- Explain why mapped types are compile-time only and stay in sync with the source

## 1. One-line definition

**A mapped type transforms every property of a type: `type Mapped<T> = { [K in keyof T]: T[K] }` reads "for each key `K` of `T`, produce a property `K` of type `T[K]`."**

It's a `map` over an object's keys, running in the type system — the same idea as `array.map`, but the output is a new *type*.

## 2. Mental model

You already know this loop in JavaScript:

```js
const mapped = {};
for (const key of Object.keys(source)) {
  mapped[key] = transform(source[key]);
}
```

The mapped type is the same thing with every runtime word replaced by a type-level word:

```text
runtime                          type-level
─────────────────────────────    ─────────────────────────────
const source                     T (the type parameter)
Object.keys(source)              keyof T
for (const key of …)             [K in keyof T]
transform(source[key])           some type using T[K]
const mapped = { … }             { … } the resulting object type
```

## 3. Visual flow

```text
        { id: number; name: string }
                 │
         keyof T → 'id' | 'name'
                 │
   ┌─────────────┴─────────────┐
   │      [K in keyof T]       │   one pass per key
   └─────────────┬─────────────┘
                 │
   'id'    →  id:  <T['id']>      number
   'name'  →  name: <T['name']>    string
                 │
                 ▼
        { id: number; name: string }   (unchanged — no modifier applied)
```

The loop produces one property per key; modifiers (`?`, `readonly`) and the `as` clause change what gets emitted.

## 4. How it works

The core syntax is a type-level `for` loop:

```ts
type Identity<T> = { [K in keyof T]: T[K] };

type User = { id: number; name: string };
type Same = Identity<User>;   // { id: number; name: string }
```

Now apply the two modifiers from Lesson 39's toolbox:

```ts
type MyPartial<T> = { [K in keyof T]?: T[K] };          // every property optional
type MyReadonly<T> = { readonly [K in keyof T]: T[K] }; // every property read-only
```

```text
(no runtime output — these are type-level definitions)
```

`?` and `readonly` are placed **inside** the loop, so they apply to every produced property. Change the *key set* instead, and you get `Pick` (from Lesson 39):

```ts
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
```

Change the *value* and you get `Record`:

```ts
type MyRecord<K extends keyof any, V> = { [P in K]: V };
```

> [!NOTE]
> `K extends keyof any` is the standard way to say "`K` is any valid key type" — `string | number | symbol`. `Record` deliberately does not constrain `K` to keys of `T`, because there is no `T` — the keys are declared fresh.

## 5. Real project usage

**Turn a tuple of route names into a config object** (Lesson 42 will generate these names at type level):

```ts
type RouteConfig = { [R in 'home' | 'about' | 'contact']: string };

const routes: RouteConfig = {
  home: '/',
  about: '/about',
  contact: '/contact',
};
```

**Derive a form state from a data type** — every field optional, plus a dirty flag:

```ts
type User = { name: string; email: string };

type FormState = { [K in keyof User]?: { value: User[K]; dirty: boolean } };

const form: FormState = {
  name: { value: 'Ali', dirty: true },   // email may be missing
};
```

**Keep a configuration type in lockstep with the source type** — add a field to `Settings` and the `SettingsKey` union updates automatically:

```ts
type Settings = { theme: 'dark' | 'light'; verbose: boolean };
type SettingsKey = keyof Settings;                 // 'theme' | 'verbose'

function setSetting(key: SettingsKey, value: unknown) { /* … */ }
setSetting('theme', 'dark');      // ✅
// setSetting('fontSize', 12);    // ❌ not a key of Settings
```

## 6. Interview explanation

> A mapped type is a type-level map over an object's keys. `{ [K in keyof T]: T[K] }` iterates every key of `T` and produces one property per key. Add `?` or `readonly` inside the loop and every property gets that modifier — that's literally how `Partial` and `Readonly` are implemented. `Pick` maps over a chosen key subset, `Record` maps over fresh keys with a fixed value type. It's compile-time only, and because it's derived from the source type, the two can never drift apart.

## 7. Senior-level insights

- **Mapped types compose with conditionals** (Lesson 40). `{ [K in keyof T]: T[K] extends string ? K : never }` produces a type whose value is `never` for non-string keys — and with `as` (below) you can filter keys out of the result entirely.
- **The `as` clause renames keys** — the type-level equivalent of array `.map`'s transform:

```ts
type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };
```

- **`key remapping` via `as` is how `Exclude` becomes a key filter**: `{ [K in keyof T as K extends 'secret' ? never : K]: T[K] }` drops the `secret` key.
- **They're the answer to "how would you type a global store"** — the state shape, the action map and the selector map can all be derived from one source type, and they stay in sync by construction.

## 8. Common mistakes

**Mistake 1 — forgetting `keyof`.** `{ [K in T]: … }` isn't a mapped type — the iteration variable needs a key set:

```ts
type Bad = { [K in User]: string };   // ❌ 'User' refers to a value — need keyof User
```

```text
'User' only refers to a type, but is being used as a value here.
```

**Mistake 2 — putting `?` or `readonly` in the wrong place.** They belong *inside* the brackets, next to `K`, not after the value:

```ts
type Wrong = { [K in keyof T]: T[K]? };   // ❌ '?' is a modifier on the property, not the value
```

**Mistake 3 — expecting the result to stay in sync at runtime.** Mapped types are erased. The derived type being accurate at compile time does not update any runtime object — validation remains a separate concern.

> [!PITFALL]
> Mapping over `keyof T` copies only the *own, enumerable, known* keys. Optional and `readonly` properties are preserved as-is unless you explicitly modify them; methods and index signatures need their own handling if you want a deep copy.

## 9. Best practices

✅ Derive related types (form state, config, DTOs) from a source type with a mapped type instead of writing them twice

✅ Use `as` to rename or filter keys when a plain pass-through isn't enough

✅ Build custom modifiers (like a `DeepReadonly`) by composing a mapped type with a conditional from Lesson 40

✅ Reach for the built-in utilities from Lesson 39 for the standard jobs — a hand-rolled `Partial` is only needed in interviews

❌ Don't map over a value (`[K in User]`) — always `keyof` first

❌ Don't write `T[K]` when you mean the whole object `T` — indexed access (Lesson 35) picks one property

## 10. Interview questions

**Q1. What is a mapped type?**

> A type-level map over the keys of an object. `{ [K in keyof T]: T[K] }` iterates every key of `T` and produces a property per key. The result is a new type whose shape is derived from `T` — same idea as `array.map`, but for types, and fully erased at runtime.

**Q2. How is `Partial` actually implemented?**

> `type Partial<T> = { [P in keyof T]?: T[P] };`. It maps over every key of `T`, keeps the value type `T[P]`, and adds the `?` modifier so each property becomes optional. `Readonly` is the same loop with `readonly` instead of `?`.

**Q3. How do you build `Record<K, V>` from scratch?**

> `type Record<K extends keyof any, V> = { [P in K]: V };`. The key set is `K` itself — constrained to valid key types — and every property has the fixed value type `V`. No source object type is involved, because the keys are declared fresh.

**Q4. What does the `as` clause do?**

> It renames or filters the produced keys — the transform step of the map. `{ [K in keyof T as \`get${string & K}\`]: … }` renames every key, and mapping a key to `never` removes it from the result, which is how you filter keys at type level.

**Q5. Can a mapped type change the value types?**

> Yes — `T[K]` is just a starting point. `{ [K in keyof T]: T[K][] }` wraps every value in an array, `{ [K in keyof T]: () => T[K] }` makes every property a getter, and conditionals (Lesson 40) can branch per property.

**Senior follow-up: Implement `DeepReadonly` — every nested object read-only too.**

> I compose a mapped type with a conditional: `type DeepReadonly<T> = { readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K] };`. For each property, if the value is an object I recurse, otherwise I keep it. Since the recursion is inside the mapped type, it's still one pass per level. One caveat: `object` matches arrays and functions too, so a production version would handle those explicitly.

## 11. Follow-up questions

**What's the difference between a mapped type and an index signature?**

> An index signature — `{ [key: string]: V }` — allows *any* string key. A mapped type — `{ [K in 'a' | 'b']: V }` — enumerates a *fixed* set of keys. Mapped types give you per-key value types via `T[K]`; index signatures give one value type for all keys.

**Can mapped types iterate over tuples and arrays?**

> Yes. Mapping over a tuple's keys preserves its length and order — `{ [K in keyof T]: … }` applied to a tuple produces a tuple. That's how `Readonly<[a, b]>` and the array-manipulation helpers keep their tuple-ness.

**Why is `K extends keyof any` used instead of `keyof T`?**

> `Record` has no source type to take keys from — the keys are the point. `keyof any` is `string | number | symbol`, the complete set of legal keys, so `K` can be any key union the caller chooses.

## 12. Comparison table

| Mapped type | Key set | Modifier | Value | Typical use |
|---|---|---|---|---|
| `{ [K in keyof T]: T[K] }` | all keys of `T` | — | same | identity/copy |
| `{ [K in keyof T]?: T[K] }` | all keys | `?` | same | `Partial` |
| `{ readonly [K in keyof T]: T[K] }` | all keys | `readonly` | same | `Readonly` |
| `{ [P in K]: T[P] }` | keys in `K` | — | `T[P]` | `Pick` |
| `{ [P in K]: V }` | keys in `K` | — | `V` | `Record` |
| `{ [K in keyof T as \`get${K}\`]: … }` | renamed | — | per-property | getters/methods |

## 13. Code example

Reimplementing the Lesson 39 toolbox by hand — and showing they're all the same loop:

```ts
type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type MyRecord<K extends keyof any, V> = { [P in K]: V };

type User = { id: number; name: string };

const draft: MyPartial<User> = { name: 'Ali' };          // id optional
const locked: MyReadonly<User> = { id: 1, name: 'Ali' };
const byId: MyRecord<number, User> = { 1: { id: 1, name: 'Ali' } };

// locked.name = 'x';  // ❌ read-only property
console.log(draft, locked, byId);
```

```text
{ name: 'Ali' } { id: 1, name: 'Ali' } { '1': { id: 1, name: 'Ali' } }
```

Three utilities, one mental model: **the loop `[K in …]`, the modifier `?`/`readonly`, and the value expression `T[K]` or `V`.**

## 14. Performance notes

**Zero runtime cost** — mapped types compile to nothing. On compile time they're cheap for normal object types; the cost scales with the number of keys and with *nested* mapped types (each level is another pass, and deep recursion can hit TypeScript's instantiation-depth limit). In practice: deriving a handful of related types from one source type is free; a `DeepReadonly` over a huge nested API type is where you'd feel it — and where memoisation by the compiler usually saves you anyway.

## 15. Debugging scenarios

**"'User' only refers to a type, but is being used as a value here."** You wrote `[K in User]` instead of `[K in keyof User]` — the loop iterates keys, so it needs `keyof`.

**"'X' is not assignable to type 'Y'."** The produced type doesn't match what you assigned. Check the modifier: a `readonly` property can't be reassigned, an optional property may be `undefined` on read, and a `Record`'s key union must cover every key you use.

**"'K' cannot be used to index type 'T'."** `K` isn't constrained to `keyof T`. Add `K extends keyof T` to the type parameter, or index via `K & keyof T`.

**"Type instantiation is excessively deep."** A nested or recursive mapped type went too deep. Simplify the recursion or add a base case.

## 16. Quick revision notes

- Mapped type = type-level `map` over keys: `{ [K in keyof T]: T[K] }`
- `?` and `readonly` go inside the loop → they hit every property
- `Partial` = `{ [P in keyof T]?: T[P] }`; `Readonly` = `{ readonly [P in keyof T]: T[P] }`
- `Pick` maps over a key subset: `{ [P in K]: T[P] }`; `Record` over fresh keys: `{ [P in K]: V }`
- `as` renames or filters keys — map a key to `never` to drop it
- Compose with conditionals (Lesson 40) for per-property branches and deep recursion
- Erased at runtime; derived types can't drift from their source
- `K extends keyof any` = "any legal key type" (`string | number | symbol`)

## 17. Cheat sheet

```ts
type Mapped<T> = { [K in keyof T]: T[K] };            // identity map

// the built-ins from scratch (Lesson 39)
type Partial<T> = { [P in keyof T]?: T[P] };
type Readonly<T> = { readonly [P in keyof T]: T[P] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Record<K extends keyof any, V> = { [P in K]: V };

// key transformation with `as`
type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };

// key filtering with `as` + conditional (Lesson 40)
type WithoutSecret<T> = {
  [K in keyof T as K extends 'secret' ? never : K]: T[K];
};

// deep recursion
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
```

```text
(no runtime output — type-level definitions, erased at compile time)
```

## 18. Key takeaways

> [!RECAP]
> - A mapped type is `{ [K in keyof T]: T[K] }` — a type-level loop over keys
> - `?` and `readonly` inside the loop apply to every property — that's how `Partial` and `Readonly` are really implemented
> - `Pick` maps over a chosen key subset, `Record` over fresh keys with a fixed value type
> - `as` renames keys; mapping a key to `never` filters it out
> - Mapped types compose with conditionals for per-property logic and deep recursion
> - Derived types stay in lockstep with their source — one edit, everywhere updates
> - Compile-time only: zero runtime cost, cost grows with nesting depth
> - Next stop: Lesson 42 uses `as`-renaming and string interpolation to generate event names and routes at type level

## Check your understanding

Answer these without looking back.

1. Write a mapped type that makes every property of `T` an array of its current type.
2. Implement `Partial` and `Readonly` from scratch.
3. What do `?` and `readonly` do when placed inside a mapped type's brackets?
4. How is `Record<K, V>` different from a mapped type over `keyof T`?
5. How would you filter a key out of a mapped type's result?
6. Why can't a mapped type's derived shape drift out of sync with the source type?

## What's Next

**Lesson 42 — Template Literal Types.** String interpolation at the type level — `on${Capitalize<…>}` event names and route strings, the trick that shows genuine depth in a TypeScript interview.
