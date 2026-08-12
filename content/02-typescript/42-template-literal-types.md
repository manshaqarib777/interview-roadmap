# Lesson 42 — Template Literal Types

**Interview importance:** ⭐⭐⭐ — a rarer question, but it shows genuine depth when it lands. Type-safe event names and route strings.

Template literal types are template strings that run at compile time: `` `on${Capitalize<T>}` `` is a type that *generates* strings like `"onClick"` from the type `T`. Interviewers rarely lead with this — but when they probe your type-level fluency, being able to derive event names and route params from a single source type separates a memorised answer from real depth. And this is the last piece you need before `infer` in Lesson 43, which is where string matching gets genuinely powerful.

## Learning Objectives

By the end of this lesson you should be able to:

- Read and write a template literal type
- Use `Capitalize`, `Uncapitalize`, `Uppercase` and `Lowercase`
- Derive `on${Event}` handler names from a source union
- Model route strings and extract their parameter names
- Say why template literal types are erased at runtime

## 1. One-line definition

**A template literal type is a string template that produces string types: `` type Greeting = `hello ${string}` `` means "any string that *starts with* `hello `."**

It's the same backtick syntax you use at runtime, but instead of concatenating values it computes a *type* — one that matches exactly the strings the template describes.

## 2. Mental model

You already write this at runtime:

```js
const handler = `on${'Click'}`;   // "onClick"
```

The template literal type does the same concatenation on types:

```ts
type HandlerName<T extends string> = `on${T}`;
type ClickHandler = HandlerName<'Click'>;   // "onClick"
```

The difference that matters: `` `on${T}` `` doesn't describe *one* string — it describes **every string that fits the pattern**, so `HandlerName<'Click' | 'Hover'>` is `"onClick" | "onHover"`. The pattern is a filter and a generator at once.

## 3. Visual flow

```text
   T = 'Click' | 'Hover' | 'KeyDown'
                  │
            `on${T}`  (template expands over the union)
                  │
   ┌──────────────┼──────────────┐
   ▼              ▼              ▼
"onClick"    "onHover"    "onKeyDown"
                  │
                  ▼
     "onClick" | "onHover" | "onKeyDown"
```

## 4. How it works

The `${…}` placeholder accepts two kinds of things:

- **a literal type** — `` `${'a' | 'b'}` `` pins that slot to exactly those strings
- **the wildcard `string`** (or `number`, `bigint`, `boolean`) — `` `${string}` `` matches *any* string in that slot

```ts
type T1 = `on${'Click'}`;            // exactly "onClick"
type T2 = `on${'Click' | 'Hover'}`;  // "onClick" | "onHover"
type T3 = `on${string}`;             // any string starting with "on"
type T4 = `${string}@${string}`;     // any string containing an "@"
```

The type `string` inside a template is a **wildcard** — it says "any string can go here". That makes template literal types a pattern-matching tool: `T3` is not one type, it's the set of every string that fits the shape.

> [!NOTE]
> `` `${string}` `` is the secret sauce for both uses of this feature: generating names from a fixed union, and *matching* arbitrary strings (route params, `on*` handlers) before `infer` in Lesson 43 extracts the interesting part.

## 5. Real project usage

**Event names.** One source union, and every handler name is derived — add an event, and `onAdd` is *already* a legal handler:

```ts
type AppEvent = 'Click' | 'Hover' | 'Submit';
type HandlerName = `on${AppEvent}`;           // "onClick" | "onHover" | "onSubmit"

type Handlers = { [K in HandlerName]: () => void };

const handlers: Handlers = {
  onClick: () => {},
  onHover: () => {},
  onSubmit: () => {},
};
```

**Route strings.** A route template plus a type for its params:

```ts
type Route = `/users/${number}` | `/users/${number}/posts`;
type RouteParams<R extends string> = R extends `/users/${infer Id}${string}` ? Id : never;

type P = RouteParams<'/users/42/posts'>;   // "42"
```

**Event emitter that refuses unknown events** (the pattern from Lesson 33's narrowing, made type-safe at the source):

```ts
type Events = { click: void; hover: void };
type Emitter = {
  on<K extends keyof Events>(name: `on${Capitalize<string & K>}`, cb: () => void): void;
};

const emitter: Emitter = { on: () => {} };
emitter.on('onClick', () => {});   // ✅
// emitter.on('onScroll', () => {});  // ❌ unknown event
```

> [!TIP]
> `Capitalize<…>` (and `Uncapitalize`, `Uppercase`, `Lowercase`) are the four built-in string utilities — the type-level versions of `toUpperCase` etc. They take a literal or a union of literals and produce the transformed literal type.

## 6. Interview explanation

> A template literal type is a template string that runs at compile time. `` `on${Capitalize<T>}` `` generates event names from a union of event names, so adding `'Click'` to the union automatically makes `"onClick"` a valid handler name. The `${string}` wildcard also lets you *match* shapes — route strings like `/users/${string}` — which is the foundation for extracting parts of a string, and that's where `infer` in Lesson 43 comes in. Everything is erased at runtime: the types only constrain what code compiles.

## 7. Senior-level insights

- **Template literal types turn stringly-typed APIs into safe ones** — event names, routes, CSS class patterns, language codes. The senior move is deriving every string from one source union so the "stringly" part disappears.
- **`Capitalize` and friends pair with `as` remapping** (Lesson 41) to generate *property names*: `` { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] } `` builds a getters object in lockstep with `T`.
- **The `${string}` wildcard is a matching tool, and `infer` completes it** — `` T extends `/users/${infer Id}${string}` `` both validates the shape *and* captures the dynamic part. That's the reading you'll need for Lesson 43.
- **Depth looks like discipline**: knowing when *not* to use template literal types (for runtime-concatenated strings, a plain `string` is the honest type) reads as senior judgement.

## 8. Common mistakes

**Mistake 1 — using a value, not a type, in the placeholder.**

```ts
const route = '/users';
type R = `${route}/:id`;   // ❌ 'route' refers to a value — use a type parameter or literal
```

```text
'route' refers to a value, but is being used as a type here.
```

**Mistake 2 — expecting `` `on${string}` `` to equal `"onClick"`.** It matches *any* string starting with `on` — `"onScroll"`, `"onWhatever"` included. For a closed set, template over a union of literals instead.

**Mistake 3 — assuming template literal types survive to runtime.** They're erased. The type `"onClick"` adds no string-transformation code — you still write the actual strings.

> [!PITFALL]
> `${number}` is a *wildcard for any number*, so `` `/users/${number}` `` matches `/users/42` **and** `/users/999`. If you need one specific ID, you can't express it with a template literal alone — that's a job for the string extraction in Lesson 43 (or a branded type).

## 9. Best practices

✅ Derive every `on*` handler name from one event union — never hand-write the prefix

✅ Use `` `${string}` `` wildcards for shape-matching, not for closed sets

✅ Reach for `Capitalize`/`Uncapitalize` instead of remembering which case a name starts with

✅ Model route param strings with templates + `infer` when you need to validate and extract

❌ Don't template over values — the placeholder takes types

❌ Don't use a template literal type where the real constraint is just `string`; the pattern should buy you safety

## 10. Interview questions

**Q1. What is a template literal type?**

> A template string that runs at compile time. `` `on${T}` `` produces a string type — every string that fits the pattern. Placeholders take literal types or wildcards like `${string}` and `${number}`, so the type describes a shape of strings rather than one value. It's erased at runtime like every type.

**Q2. How would you build type-safe event names?**

> From a union: `` type Events = 'Click' | 'Hover'; type Handler = `on${Events}`; `` gives `"onClick" | "onHover"`. Wire it to a mapped type or a generic method and unknown events fail to compile — add `'Submit'` to the union and `onSubmit` becomes legal automatically.

**Q3. What do `Capitalize` and `Uncapitalize` do?**

> They're the type-level equivalents of `toUpperCase`-first-letter and its inverse. `Capitalize<'click'>` is `"Click"`, `Uncapitalize<'Click'>` is `"click"`. They operate on literal types and unions of literals, and they're what makes `on${Capitalize<…>}` read naturally.

**Q4. Can you model route strings with this?**

> Yes, two ways. For a closed set of routes, a union of literals: `` '/users' | '/users/:id' ``. For *any* route fitting a shape, templates with wildcards: `` `/users/${string}` ``. And when you need the actual value out of the string — the `:id` — that's `infer` in a conditional, which Lesson 43 covers.

**Q5. Are these types checked at runtime?**

> No. Template literal types are fully erased. They constrain what compiles; the emitted JavaScript is the same. If a route or event name arrives at runtime, you still validate it — the type only protects your call sites.

**Senior follow-up: Type an emitter whose event names are always `on` + a known event, and reject anything else.**

> I'd derive the union first: `` type Name<E extends string> = `on${Capitalize<E>}`; ``. Then the emitter method constrains its first argument to that union: `on<K extends string>(name: \`on${Capitalize<K>}\`, cb: () => void)`. With the source events as a closed union, anything not in it — `onScroll` when `Scroll` isn't declared — is a compile error. The same shape handles typed route callbacks: `` on<Route extends \`/users/${string}\`>(route: Route, cb: (params: …) => void) ``.

## 11. Follow-up questions

**How do the four case utilities interact with unions?**

> They distribute like everything else at type level: `Capitalize<'a' | 'b'>` is `"A" | "B"`. That's what makes `` `on${Capitalize<AppEvent>}` `` produce the whole handler union in one expression.

**Can template literal types constrain generic parameters?**

> Yes — that's a core pattern. `` function register<R extends `/api/${string}`>(route: R) `` accepts only route-shaped strings at compile time, and the generic captures the exact literal so callers get precise types back.

**What's the difference between `${string}` and `${any}` in a template?**

> `${any}` is essentially useless — the compiler treats it as matching everything with no useful pattern. `${string}`, `${number}` and `${boolean}` are the meaningful wildcards: they name *which kind* of content the slot accepts.

## 12. Comparison table

| Template | Matches | Use |
|---|---|---|
| `` `on${'Click'}` `` | exactly `"onClick"` | fixed name |
| `` `on${'Click' \| 'Hover'}` `` | `"onClick"` \| `"onHover"` | derived handler names |
| `` `on${Capitalize<E>}` `` | `"on"` + capitalized `E` | prefix + transformed union |
| `` `${string}@${string}` `` | any string containing `@` | shape matching |
| `` `/users/${number}` `` | `/users/` + any number | route shape |
| `` `/users/${string}` `` | `/users/` + anything | route shape, dynamic part |

## 13. Code example

Generate every handler name, then consume it:

```ts
type AppEvent = 'Click' | 'Hover' | 'Submit';

type HandlerName = `on${Capitalize<AppEvent>}`;    // "onClick" | "onHover" | "onSubmit"

type Emitter = {
  on(name: HandlerName, cb: () => void): void;
};

const emitter: Emitter = { on: () => {} };

emitter.on('onClick', () => console.log('clicked'));
emitter.on('onSubmit', () => console.log('submitted'));
// emitter.on('onScroll', () => {});   // ❌ Argument of type '"onScroll"' is not assignable …

console.log('ok');
```

```text
ok
```

Add a fourth event to `AppEvent` and `onWhateverThatIs` compiles instantly — the union is a single source of truth.

## 14. Performance notes

**Zero runtime cost** — template literal types are erased. Compile-time cost is proportional to the size of the unions involved: template types over big unions expand combinatorially, which is the one real price to know. Literal unions in the hundreds are fine; if you're generating names over thousands of members, the compiler will feel it. Practical rule: keep the source unions small and let the derivation happen once.

## 15. Debugging scenarios

**"'X' refers to a value, but is being used as a type."** The placeholder got a runtime value instead of a type. Use a type parameter, a literal, or `typeof` where the value's *type* is what you want.

**"Argument of type 'string' is not assignable to parameter of type '\`on${Capitalize<AppEvent>}\`'."** Something widened to plain `string` before reaching the constrained parameter — a variable typed `string` doesn't carry the literal. Annotate it with the derived union, or let it be inferred.

**"Type instantiation is excessively deep."** A template type over a huge union (or recursive string parsing — Lesson 43's `infer` territory) went too deep. Narrow the union or simplify the recursion.

**"Property 'onScroll' does not exist."** The handler you're assigning isn't part of the derived union — either the event isn't in the source union, or `Capitalize` produced a different casing than you wrote.

## 16. Quick revision notes

- Template literal type = template string at compile time: `` `on${T}` ``
- Placeholders take literal types or wildcards — `${string}`, `${number}`, `${boolean}`
- `Capitalize`/`Uncapitalize`/`Uppercase`/`Lowercase` are the built-in string transforms
- Derive handler names from one event union: `` `on${Capitalize<AppEvent>}` ``
- Wildcards match shapes; closed sets come from literal unions
- `` `${string}` `` + `infer` (Lesson 43) is how you extract dynamic parts
- Erased at runtime; compile cost grows with union size
- `on${...}` event names and route strings are the two showcase answers

## 17. Cheat sheet

```ts
type Name<T extends string> = `on${T}`;
type A = Name<'Click'>;                      // "onClick"
type B = Name<'Click' | 'Hover'>;            // "onClick" | "onHover"

// case utilities
type C = Capitalize<'click'>;                // "Click"
type D = Uncapitalize<'Click'>;              // "click"

// wildcards
type AnyHandler = `on${string}`;             // any string starting with "on"
type Emailish = `${string}@${string}`;       // any string containing "@"

// event names, fully derived
type AppEvent = 'Click' | 'Submit';
type HandlerName = `on${Capitalize<AppEvent}>`;   // "onClick" | "onSubmit"

// route shapes
type UserRoute = `/users/${number}`;
type AnyUserRoute = `/users/${string}`;

// getters via key remapping (Lesson 41)
type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };
```

```text
(no runtime output — type-level definitions, erased by the compiler)
```

## 18. Key takeaways

> [!RECAP]
> - A template literal type is a string template that runs on types — pattern and generator in one
> - `${string}` / `${number}` are wildcards; literal types in placeholders pin a slot exactly
> - `` `on${Capitalize<E>}` `` derives every handler name from one event union — add an event, the handler exists
> - `Capitalize`/`Uncapitalize`/`Uppercase`/`Lowercase` handle case at type level
> - Route strings are the second showcase: closed literals for known routes, wildcards for shapes
> - Extracting the dynamic part of a matched string needs `infer` — the entire next lesson
> - Compile-time only: erased at runtime, compile cost scales with union size
> - "The type generates the strings I would otherwise typo" is the depth signal in an interview

## Check your understanding

Answer these without looking back.

1. Write a template literal type for handler names starting with `handle` instead of `on`.
2. What does `${string}` match — and why is it not the same as a specific literal?
3. Derive the handler union from an event union of `'Load' | 'Save'`.
4. How would you write a route type for `/admin/<anything>`?
5. Which four case utilities does TypeScript ship, and what do they do?
6. Why do template literal types have no runtime footprint?

## What's Next

**Lesson 43 — `infer`.** The keyword that completes the type-level language: match a shape with a template or a conditional, and extract the interesting part out of it. This lesson's route-string matching is the running example.
