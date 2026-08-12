# Lesson 35 — keyof, typeof & Indexed Access

**Interview importance:** ⭐⭐⭐⭐ — the three operators every advanced type is built from.

`keyof`, `typeof` and indexed access are the plumbing under every advanced TypeScript type — `Pick`, mapped types, conditional types, you name it. This lesson makes them instinctive. The trick to remember: two of them work on **values**, one works on **types**, and they meet in the middle via `keyof`.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what each of `keyof`, `typeof` and indexed access does in one sentence
- Say which operator operates on values and which operates on types
- Use indexed access `T[K]` to read a property type and to look up a tuple element
- Combine all three to type the output of a function or the keys of a config
- Diagnose the two most common operator mix-ups

## 1. One-line definition

**`keyof T` reads the keys of a type, `typeof v` reads the type of a value, and `T[K]` reads the type of a property — the three moves for "derive a type from something that already exists".**

`typeof` is the only one that works on values; the other two work on types.

## 2. Mental model

```text
   the VALUE world                the TYPE world
   ────────────────               ───────────────
   const user = {                 type User = {
     id: 1,                          id: number;
     name: 'Ali',                    name: string;
   }                               }
        │                                │
        │ typeof user                     │ keyof User
        ▼                                ▼
   type of the value:            union of the keys:
   { id: number;                 'id' | 'name'
     name: string }
```

`typeof` reaches from the value world into the type world; `keyof` works entirely inside the type world. `T[K]` reads inside a type — `User['name']` is `string`.

## 3. Visual flow

```text
   value:  const user = { id: 1, name: 'Ali' }
              │ typeof
              ▼
   type:   type T = { id: number; name: string }
              │ keyof
              ▼
   keys:   'id' | 'name'
              │ indexed access T[K]
              ▼
   prop:   T['name'] = string
```

One value, three derivations — and each derivation is the *inverse* of the next: `typeof` goes value→type, `keyof` goes type→keys, `T[K]` goes type+key→property type.

## 4. How it works

**`typeof v`** — take a value, get its type:

```ts
const config = { url: '/api', retries: 3 };
type Config = typeof config;   // { url: string; retries: number }

const point = { x: 1, y: 2 };
type Pt = typeof point;        // { x: number; y: number }
```

`typeof` works on any value expression — a variable, a function, an array. It does not run anything; it just reads the type of what's there.

**`keyof T`** — take a type, get the union of its keys:

```ts
type User = { id: number; name: string; email: string };
type UserKey = keyof User;     // 'id' | 'name' | 'email'

const key: UserKey = 'name';   // ✅ any single key
```

For a union of objects, `keyof` gives the keys **common to every member**:

```ts
type A = { a: number; shared: string };
type B = { b: number; shared: string };
type K = keyof (A | B);        // 'shared' — the only key both have
```

**Indexed access `T[K]`** — take a type and a key, get the property's type:

```ts
type User = { id: number; name: string };
type Id = User['id'];          // number
type Any = User['id' | 'name']; // number | string  — union of property types
type All = User[keyof User];   // number | string   — the value union of the object

// tuples: index a tuple by a literal to get the element type
type Tuple = [string, number, boolean];
type Second = Tuple[1];        // number
type Head = Tuple[0];          // string
type Elems = Tuple[number];    // string | number | boolean — every element
```

```narrate
line 1: User['id'] — indexed access with a literal key
line 2: User['id' | 'name'] — a union of keys gives a union of property types
line 3: User[keyof User] — keyof plus indexed access reads the whole value union
line 6: tuples are indexable too; [number] reads every element's type
```

Indexed access is the "look inside" operator: it's how every type-transforming type (`Pick`, mapped types, `ReturnType`) reads properties. Lesson 39 builds on exactly this.

## 5. Real project usage

**Typing an object you only have as a value** — the `typeof` pattern:

```ts
const theme = { dark: true, accent: '#0ff', radius: 4 } as const;
type Theme = typeof theme;
// { readonly dark: true; readonly accent: '#0ff'; readonly radius: 4 }
```

**A config whose keys must match an object's keys** — `keyof`:

```ts
type User = { id: number; name: string };
const defaults: Record<keyof User, unknown> = { id: 0, name: '' };
```

**A lookup function typed by the object's own keys** — all three together:

```ts
const users = { 1: 'Ali', 2: 'Omar' };
type Id = keyof typeof users;         // '1' | '2'

function nameFor(id: Id): string {
  return users[id];                    // ✅ only valid keys compile
}

console.log(nameFor('1'));
// nameFor(1);   // ❌ number isn't '1' | '2'
```

Output:

```text
Ali
```

`keyof typeof users` is the pattern for "the type of an object's keys" — you'll meet it constantly in real codebases and in Lesson 39's utility types.

## 6. Interview explanation

> `typeof` takes a value and gives its type — `typeof config` becomes the type of the config object. `keyof` takes a type and gives the union of its keys — `keyof User` is `'id' | 'name'`. Indexed access reads a property's type: `User['id']` is `number`. Together they let me derive types from existing values and shapes instead of repeating them by hand.

## 7. Senior-level insights

The junior answer defines the three operators. The senior answer treats them as **one composition**:

- The canonical recipe is `keyof typeof obj` — "the keys of the object I already have" — and `T[K]` for "the type stored at that key".
- With `keyof` and indexed access you can express the whole family of type transformations *without any magic*: `Pick<T, K>` is `{ [P in K]: T[P] }`, `Partial<T>` is `{ [P in keyof T]?: T[P] }`. The built-in utilities are just these operators, wrapped. (Lesson 39 covers them.)
- A senior knows `keyof` on a union is the *intersection* of keys, and `keyof` on an array is `number | 'length' | …` — the array's own members, not its element type.
- When the object is `as const`, `typeof` reads the literal values, not just the broad types — which is why `keyof typeof` on a `const` map gives you exact literal keys.

## 8. Common mistakes

**Mistake 1 — using `typeof` on a type.** It's a value operator:

```ts
type User = { id: number };
type Bad = typeof User;   // ❌ 'User' only refers to a type
```

```text
error TS2693: 'User' only refers to a type, but is being used as a value here.
```

`typeof` needs a value on the right. For a type you want `keyof` or indexed access, not `typeof`.

**Mistake 2 — forgetting `typeof` in `keyof typeof`.** `keyof users` on a *value* is an error — `keyof` needs a type. The fix is almost always `keyof typeof users`.

**Mistake 3 — expecting `T[keyof T]` to be the keys.** It's the **value** union — all the property types joined. Keys are `keyof T`; values are `T[keyof T]`.

## 9. Best practices

✅ Reach for `keyof typeof obj` to type "keys of this object I already have"

✅ Use `T[K]` to read a property's type instead of re-declaring it

✅ Pair `keyof` with `as const` for exact literal keys

✅ Combine all three: `keyof typeof` for keys, `T[K]` for values, `typeof` for value→type

❌ Don't use `typeof` on a type, or `keyof` on a value

❌ Don't duplicate a shape you can derive with `typeof value` or `T[K]`

## 10. Interview questions

**Q1. What is the difference between `keyof` and `typeof`?**

> `typeof` works on values and produces their type — `typeof config` is the type of the `config` object. `keyof` works on types and produces the union of their keys — `keyof User` is `'id' | 'name'`. One moves from the value world to the type world; the other stays inside the type world.

**Q2. What is indexed access in TypeScript?**

> The `T[K]` syntax: it reads the type of a property. `User['id']` is `number`. With a union of keys it gives a union of property types, and with `keyof` it gives the whole value union of an object. It's the lookup operator the utility types are built on.

**Q3. How would you type the keys of an object you already have?**

> `keyof typeof obj`. The `typeof` turns the value into a type, and `keyof` reads its keys. With a `const` object annotated `as const`, that gives the exact literal keys rather than the broad `string`.

**Senior follow-up: How do `keyof` and indexed access relate to the built-in utility types?**

> They're the implementation. `Pick<T, K>` is a mapped type over the chosen keys: `{ [P in K]: T[P] }` — indexed access reading each chosen key's type. `Partial<T>` maps over every key with a `?`: `{ [P in keyof T]?: T[P] }`. So the utilities are literally `keyof` plus indexed access wrapped in a generic. Learning the operators first is what makes the utilities obvious rather than magic.

## 11. Follow-up questions

**What does `keyof` give you for a union type?**

> Only the keys that exist on *every* member — the intersection. `keyof (A | B)` where `A = { a, shared }` and `B = { b, shared }` is just `'shared'`. If you want the keys of any member, you need a mapped type over the union (Lesson 41).

**Can I index into an array or tuple?**

> Yes. A tuple with a literal index gives the element type at that position — `Tuple[1]` is `number`. `Tuple[number]` gives the union of every element type. For a plain array, `T[number]` is the element type — that's how `Array<T>` exposes it.

**Does `typeof` run the value?**

> No. It's purely compile-time — it reads the type of the expression without executing it. `typeof` in TypeScript is the *type* operator, not the JavaScript runtime `typeof` that returns `'string'`, `'object'` and friends. Different feature, same keyword.

## 12. Comparison table

| Operator | Operates on | Produces | Example | Result |
|---|---|---|---|---|
| `typeof` | a value | a type | `typeof config` | `{ url: string; retries: number }` |
| `keyof` | a type | union of keys | `keyof User` | `'id' \| 'name'` |
| indexed access | a type + key(s) | a property type | `User['id']` | `number` |
| `keyof typeof` | a value | union of keys | `keyof typeof users` | `'1' \| '2'` |

## 13. Code example

Deriving an entire API client's types from a single config object:

```ts
const endpoints = {
  users: '/users',
  posts: '/posts',
  comments: '/comments',
} as const;

type Endpoint = keyof typeof endpoints;     // 'users' | 'posts' | 'comments'
type Path = typeof endpoints[Endpoint];     // '/users' | '/posts' | '/comments'

function buildUrl(e: Endpoint): string {
  return `https://api.example.com${endpoints[e]}`;
}

console.log(buildUrl('users'));
console.log(buildUrl('posts'));
```

Output:

```text
https://api.example.com/users
https://api.example.com/posts
```

`buildUrl('nope')` is a compile error — `Endpoint` only admits the three real routes. Two type lines derived the whole contract from one value.

```narrate
line 1: the config object — as const keeps the literal values
line 5: keyof typeof endpoints — the three literal route names
line 6: typeof endpoints[Endpoint] — indexed access over typeof: the path strings
line 8: buildUrl only accepts a route that exists
```

## 14. Performance notes

All three operators are **erased at runtime** — zero runtime cost, pure compile-time reading. The only performance story is compile time, and it's negligible for these: `keyof` and indexed access on ordinary objects resolve instantly. They only start to matter at all when you nest them dozens of levels deep in pathological mapped types — and even then the cost is a few milliseconds of checking, not a runtime concern.

## 15. Debugging scenarios

**"'X' only refers to a type, but is being used as a value here."** You wrote `typeof User` where `User` is a type. Either remove `typeof` (and use `keyof` / indexed access) or point it at an actual value.

**"'users' refers to a value, but is being used as a type here."** You wrote `keyof users` — `keyof` needs a type. Add `typeof`: `keyof typeof users`.

**"Property 'x' does not exist on type '…'."** Your `T[K]` used a key that isn't on the type, or `keyof` produced a narrower union than you assumed. Check whether the type is a union (whose `keyof` is the intersection) or a plain object.

**"'string' is not assignable to type 'never'."** An indexed access over an empty or impossible key set. Often the key union was accidentally emptied — e.g. `keyof` on a union of types with no common keys gives `never`.

## 16. Quick revision notes

- `typeof` = value → type (compile-time only, never runs the value)
- `keyof` = type → union of keys; on a union of objects → only the common keys
- `T[K]` = type + key → property type; `T[keyof T]` = all property types
- `T[number]` on an array/tuple = element types
- The canonical combo: `keyof typeof obj` — keys of an object you already have
- Pair `as const` with `typeof` to read exact literals
- The utility types in Lesson 39 are built from `keyof` + indexed access

## 17. Cheat sheet

```ts
const config = { url: '/api', retries: 3 };
type C = typeof config;               // { url: string; retries: number }

type User = { id: number; name: string };
type K = keyof User;                  // 'id' | 'name'
type Id = User['id'];                 // number
type V = User[keyof User];            // number | string

type Tup = [string, number];
type Second = Tup[1];                 // number
type Elems = Tup[number];             // string | number

const obj = { a: 1, b: 2 } as const;
type OKeys = keyof typeof obj;        // 'a' | 'b'
```

```text
(no runtime output — these are type-level definitions)
```

## 18. Key takeaways

> [!RECAP]
> - `typeof` moves from a value to its type; `keyof` moves from a type to its keys; `T[K]` reads a property's type
> - `keyof typeof obj` is the daily pattern for "keys of this object"
> - `T[keyof T]` is the value union of an object; `T[number]` is the element type of an array or tuple
> - `keyof` on a union of objects gives only the common keys
> - Pair with `as const` to preserve exact literal types
> - All three are compile-time only — zero runtime cost
> - These operators are the implementation of the utility types in Lesson 39
> - Next stop: Lesson 36 uses them everywhere once you start writing generics

## Check your understanding

Answer these without looking back.

1. Which operator works on values, and which work on types?
2. What does `keyof typeof users` produce, and why do you need both halves?
3. What is `User['id' | 'name']`? What is `User[keyof User]`?
4. How do you read the element type of an array, and of a tuple position?
5. What does `keyof` return for a union of two different object types?
6. Why does `as const` change what `typeof` gives you?

## What's Next

**Lesson 36 — Generics.** The second-most-asked TypeScript topic. Generics are functions over types — and `keyof` and indexed access are exactly the tools a generic body needs.
