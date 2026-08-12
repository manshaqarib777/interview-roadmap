# Lesson 39 — Utility Types

**Interview importance:** ⭐⭐⭐⭐⭐ — the most common TypeScript interview questions after `any` vs `unknown`. Expect to be asked to reimplement one of these by hand.

TypeScript ships a toolbox of **utility types** — generic types that transform other types. They're the standard answer to "how do I build a type from a type", and nearly every real codebase uses several of them. The interview twist is that interviewers rarely stop at "what does `Pick` do?" — they ask you to *build* it, which is Lesson 41's territory. For now we master the toolbox: what each one does, when to reach for it, and how to name the pattern behind it.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what a utility type is in one sentence
- Match every major utility to its transformation
- Reimplement `Partial` and `Pick` by hand
- Choose the right utility for a real shape problem
- Say which utilities are compile-time only and which are nearly free to use everywhere

## 1. One-line definition

**A utility type is a generic type that transforms another type — `Partial<X>`, `Pick<X, K>` and friends are just functions that run on types.**

Like generics from Lesson 36, they're erased at runtime. They exist to save you from writing the same shape transformation twice.

## 2. Mental model

Picture a type as a shape cut out of card:

```text
User {
  id, name, email, age, admin
}
```

Utility types are scissors, tape and a hole punch you can apply to that card:

| Utility | What it does to the card |
|---|---|
| `Partial` | makes every cut-out optional — any part may be missing |
| `Required` | makes every part mandatory again |
| `Readonly` | seals each part — nobody may change it |
| `Pick` | keeps only the parts you name |
| `Omit` | keeps everything except the parts you name |
| `Record` | stamps the same shape on every key you give it |

## 3. Visual flow

```text
              ┌──────────────────────────────────────────┐
              │              Source type                 │
              │  { id: number; name: string; age: number } │
              └──────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────────────────────┐
        │               │                               │
   Pick<User, 'id'|'name'>   Omit<User, 'age'>      Partial<User>
        │               │                               │
   { id: number;      { id: number;               { id?: number;
     name: string }     name: string }              name?: string;
                                                    age?: number }
```

One source type, three utility types, three different results — the utility is just a filter over the keys and a modifier over the properties.

## 4. How it works

Each utility is a plain generic type — nothing magical. Here's the mental model that unifies them: **read a utility as `Result<Source, Keys>`**. `Pick<User, 'id' | 'name'>` reads "from `User`, keep the keys `'id'` and `'name'`"; `Omit` is the same sentence with "drop" instead of "keep".

```ts
type User = {
  id: number;
  name: string;
  email: string;
};

type PublicUser = Pick<User, 'id' | 'name'>;
type AccountUser = Omit<User, 'email'>;
type DraftUser = Partial<User>;

const pub: PublicUser = { id: 1, name: 'Ali' };
const draft: DraftUser = { id: 1 };              // email and name allowed to be missing

console.log(pub, draft);
```

```text
{ id: 1, name: 'Ali' } { id: 1 }
```

Every utility respects the same rule as the rest of the type system: **it's erased at runtime, so you get compile-time safety with zero runtime cost** (unless you add runtime validation, which is a separate layer).

> [!NOTE]
> `Pick` and `Omit` are the mirror of each other: `Pick<T, K>` keeps the listed keys, `Omit<T, K>` removes the listed keys — `Omit<T, K>` is literally `Pick<T, Exclude<keyof T, K>>` in TypeScript's own implementation.

## 5. Real project usage

A React component that shows a user but must never leak the password:

```ts
type SafeUser = Omit<User, 'passwordHash'>;
```

An API that accepts a partial update — `PATCH` semantics:

```ts
async function patchUser(id: number, changes: Partial<User>) {
  return api.patch(`/users/${id}`, changes);   // any subset of fields is legal
}
```

A lookup map keyed by ID — `Record<K, V>`:

```ts
type UserById = Record<number, User>;           // { [id: number]: User }
const users: UserById = { 42: { id: 42, name: 'Ali' } };
```

Extracting the return type of a function you didn't write:

```ts
declare function getConfig(): { theme: 'dark'; verbose: boolean };
type Config = ReturnType<typeof getConfig>;     // { theme: 'dark'; verbose: boolean }
```

> [!TIP]
> `typeof` (from Lesson 35) feeds values into `ReturnType` and `Parameters`; `keyof` feeds keys into `Pick` and `Omit`. Type utilities compose with the operators you already know.

## 6. Interview explanation

> Utility types are generic types that build one type from another. `Partial<T>` makes every property optional, `Pick<T, K>` keeps only the keys in `K`, `Omit<T, K>` removes them, `Record<K, V>` maps every key in `K` to a value of type `V`, and `ReturnType<F>` extracts a function's return type. They're compile-time only — erased at runtime, so no cost. And yes, I can implement `Pick` and `Partial` by hand: `Pick` is `{ [K in Keys]: T[K] }` and `Partial` is `{ [K in keyof T]?: T[K] }`.

## 7. Senior-level insights

The junior answer lists the utilities. The senior answer groups them and reaches for them **before** defining a custom type. The grouping that lands well:

- **Shape adjustment** — `Partial`, `Required`, `Readonly`
- **Key selection** — `Pick`, `Omit`
- **Construction** — `Record` (the one that builds instead of editing)
- **Union filtering** — `Exclude`, `Extract`, `NonNullable`
- **Function introspection** — `ReturnType`, `Parameters`

A senior also names the seam where utilities run out: when a transformation is more than editing a shape — like a real-time check or runtime validation — the type system stops being the right tool.

## 8. Common mistakes

**Mistake 1 — treating `Omit` as if it takes the keys you want.** `Omit<User, 'name'>` removes `name`, it doesn't keep it. When the keys you want are the short list, reach for `Pick`; when the keys you want to drop are the short list, reach for `Omit`.

**Mistake 2 — expecting `Partial` to change runtime behaviour.** It only relaxes the type:

```ts
async function save(draft: Partial<User>) {
  await db.save(draft);            // no type error — but the DB may reject missing fields
}
```

```text
(compiles — the runtime may still fail; add validation)
```

**Mistake 3 — keying `Record` with a union that doesn't fit the value.** `Record<'a' | 'b', number>` guarantees every key in the union is present — a third key or a missing one is an error:

```ts
const r: Record<'a' | 'b', number> = { a: 1 };  // ❌ Property 'b' is missing
```

```text
Type '{ a: number; }' is missing the following properties from type 'Record<"a" | "b", number>': b
```

> [!PITFALL]
> The `Record<'a' | 'b', …>` pattern is also how people accidentally create an **overly-wide** type. If the map will actually contain arbitrary string keys, `Record<string, V>` is honest; a narrow key union will reject valid data at compile time.

## 9. Best practices

✅ Reach for a utility before writing a `{ [key in …] }` loop by hand

✅ Prefer `Omit` for "everything except" over listing keys that can grow

✅ Use `ReturnType<typeof fn>` over duplicating a return shape by hand

✅ Use `Partial` for update/DTO inputs where every field may be missing

❌ Don't `Pick` then redefine the same keys locally — the point is a single source of truth

❌ Don't wrap values in `Partial` when you actually mean "could be `undefined`" — that's `T | undefined`

## 10. Interview questions

**Q1. What is a utility type?**

> A generic type that transforms another type. `Partial<T>`, `Pick<T, K>` and the rest are just type-level functions: they take a type and produce a new one. Like all generics, they're erased at runtime, so they add no cost.

**Q2. `Partial<T>` vs `Required<T>` vs `Readonly<T>`?**

> `Partial<T>` makes every property optional — a whole type where each field may be missing. `Required<T>` does the reverse, stripping the `?` from every property. `Readonly<T>` doesn't touch optionality; it marks every property as read-only, so assignment after creation is a compile error.

**Q3. `Pick<T, K>` vs `Omit<T, K>`?**

> `Pick` keeps only the keys in `K` — you name what survives. `Omit` keeps everything *except* the keys in `K` — you name what gets removed. `Omit<T, K>` is implemented as `Pick<T, Exclude<keyof T, K>>`.

**Q4. When would you use `Record<K, V>`?**

> Any time I want a map with a known key set — lookups by ID, per-route config, a dictionary of handlers. `Record<'home' | 'about', Component>` guarantees every route is handled and that each handler has the right component type.

**Q5. How do `ReturnType` and `Parameters` work?**

> They take a function type and extract its return type or its parameter list. `Parameters` gives a tuple, so index `[0]`, `[1]` or spread it. They combine with `typeof` when I only have a function value.

**Senior follow-up: Reimplement `Pick` and `Partial` manually.**

> `Pick` is a mapped type over the chosen keys: `type MyPick<T, K extends keyof T> = { [P in K]: T[P] };`. `Partial` maps over every key and adds `?`: `type MyPartial<T> = { [P in keyof T]?: T[P] };`. Both are erased at runtime, so my versions behave identically to the built-ins — which is exactly why the built-ins exist: the implementation is a couple of lines of type code.

## 11. Follow-up questions

**Can utility types be composed?**

> Yes, and that's the point. `Partial<Omit<User, 'id'>>` is an update payload: everything except the immutable `id`, all optional. `Record<Route, ReturnType<typeof load>>` builds a map of already-loaded values. Each utility is one transformation; composition chains them.

**Is there a runtime cost?**

> No. They're erased during compilation — nothing survives to the emitted JavaScript. The cost is purely in your head: you must know what shape each utility produces.

**What if the keys I need aren't a literal union?**

> `Pick` and `Omit` are fine with any key type that `keyof` can produce. But the key set has to be *known* to the compiler — that's the same rule as `keyof` from Lesson 35. If the keys are genuinely dynamic at runtime, that's not a type-level problem anymore.

## 12. Comparison table

| Utility | Input | Output | Typical use |
|---|---|---|---|
| `Partial<T>` | any object type | same keys, all optional | PATCH/DTO inputs |
| `Required<T>` | any object type | same keys, none optional | sealing a draft before save |
| `Readonly<T>` | any object type | same keys, all read-only | config, immutable models |
| `Pick<T, K>` | type + key union | only the keys in `K` | projecting a public shape |
| `Omit<T, K>` | type + key union | everything except `K` | stripping secrets/internals |
| `Record<K, V>` | key union + value type | `{ [k in K]: V }` | maps, lookups, configs |
| `Exclude<A, B>` | two unions | members of `A` not in `B` | filtering union members |
| `Extract<A, B>` | two unions | members of `A` in `B` | narrowing to a subset |
| `NonNullable<T>` | any type | `T` minus `null`/`undefined` | cleaning API payloads |
| `ReturnType<F>` | function type | its return type | typing wrapped results |
| `Parameters<F>` | function type | tuple of its params | typing wrapper args |

## 13. Code example

A small API layer exercising several utilities at once:

```ts
type User = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
};

type PublicUser = Omit<User, 'passwordHash'>;
type CreateUser = Omit<User, 'id'>;
type UpdateUser = Partial<CreateUser>;
type UserMap = Record<number, PublicUser>;

declare function fetchUser(id: number): Promise<PublicUser>;
declare function saveUser(u: CreateUser): Promise<PublicUser>;

async function handle(name: string, email: string, changes: UpdateUser) {
  const created = await saveUser({ name, email, passwordHash: 'hash' });
  const merged: CreateUser = { name, email, passwordHash: 'hash', ...changes };
  const saved = await saveUser(merged);
  return [created, saved] as const;
}
```

```text
(compiles clean — every shape is derived, never duplicated)
```

Every public type here is *derived* from `User`. Changing `User` once updates the whole layer, and no other file has to repeat the shape.

## 14. Performance notes

At runtime: **zero cost** — all utilities are erased. The only "performance" question is compile time, and utility types are cheap: they're short generic aliases the compiler resolves quickly. Composition is fine; there's no practical blow-up from `Partial<Omit<…>>`. The real performance risk is *not* the utilities themselves but the generated code size of whatever you build on top — unrelated to the type layer.

## 15. Debugging scenarios

**"The object literal may only specify known properties."** You passed an extra key to a `Pick`ed or `Partial`ed type. Pick the key into the type, or widen to `Omit` if the object genuinely carries more fields.

**"Property 'x' does not exist on type 'Partial<…>'."** You forgot every property is now optional, so the type is `T | undefined` on read. Check with an `if`, or use a non-null assertion only when you've proven it's set.

**"Type 'X' is not assignable to type 'Record<…>'."** The value shape doesn't fit the mapped value type, or the key union doesn't cover the keys you're assigning. Fix the `Record` arguments, not the object.

**"Argument of type 'typeof fn' is not assignable."** You fed `ReturnType` a *value* instead of a *type* — wrap it: `ReturnType<typeof fn>`.

## 16. Quick revision notes

- Utility types are generic types that transform other types
- `Partial`/`Required`/`Readonly` adjust every property; `Pick`/`Omit` filter keys
- `Record<K, V>` builds a map; `Exclude`/`Extract`/`NonNullable` filter unions
- `ReturnType`/`Parameters` introspect functions and pair with `typeof`
- They're erased at runtime — zero cost, compile-time only
- `Pick` = `{ [P in K]: T[P] }`; `Partial` = `{ [P in keyof T]?: T[P] }`
- Interviewers ask for one reimplementation — be ready (Lesson 41 does all of them)

## 17. Cheat sheet

```ts
// shape adjustment
type A = Partial<User>;      // every property optional
type B = Required<A>;        // every property required again
type C = Readonly<User>;     // every property read-only

// key selection
type D = Pick<User, 'id' | 'name'>;   // only listed keys
type E = Omit<User, 'id'>;            // everything except listed keys

// construction
type F = Record<'home' | 'about', Component>;

// union filtering
type G = Exclude<'a' | 'b' | 'c', 'a'>;      // 'b' | 'c'
type H = Extract<'a' | 'b' | 'c', 'a' | 'b'>; // 'a' | 'b'
type I = NonNullable<string | null | undefined>; // string

// function introspection
type J = ReturnType<typeof fn>;   // fn's return type
type K = Parameters<typeof fn>;   // tuple of fn's parameters
```

```text
(no runtime output — these are type-level definitions)
```

## 18. Key takeaways

> [!RECAP]
> - A utility type is a generic type that transforms another type — compile-time only, zero runtime cost
> - Group them by job: shape (`Partial`/`Required`/`Readonly`), keys (`Pick`/`Omit`), maps (`Record`), unions (`Exclude`/`Extract`/`NonNullable`), functions (`ReturnType`/`Parameters`)
> - `Omit<T, K>` removes keys, `Pick<T, K>` keeps them — don't confuse the two
> - Derive public/DTO shapes from one source type instead of duplicating them
> - Composition works: `Partial<Omit<User, 'id'>>` is a classic update payload
> - Reimplementing `Pick`/`Partial` is a stock interview question — know the two-line versions
> - Next stop: Lesson 40 shows the conditional types that power `Exclude` and `ReturnType`

## Check your understanding

Answer these without looking back.

1. Define a utility type in one sentence.
2. What's the difference between `Pick<User, 'id' | 'name'>` and `Omit<User, 'age'>`?
3. Which utility would you use to type a map of user IDs to user objects?
4. How do you get the return type of a *function value* like `fn`?
5. Write `MyPick` and `MyPartial` by hand.
6. Why does `Partial<T>` not give you runtime safety?

## What's Next

**Lesson 40 — Conditional Types.** `T extends U ? X : Y` is where TypeScript becomes a programming language in its own right — it's the mechanism hiding behind `Exclude`, `Extract` and `ReturnType`.
