# Lesson 98 — Top TypeScript Interview Questions

**Interview importance:** ⭐⭐⭐⭐⭐ — for a TypeScript role, the single highest-frequency question set in the roadmap.

Rehearsal. You learned interface vs type (Lesson 31), generics (Lesson 36), utility types
(Lesson 39) and `infer` (Lesson 43) in the module above. Knowing them and saying them
under pressure are different skills — this lesson is where you practise the second one.

TypeScript interviews reward a particular kind of precision. The questions are not "what
does this API do" but "why would you choose this over that" — and the answers you give here
are also the review comments you will make at work. Say every answer out loud.

## Learning Objectives

By the end of this lesson you should be able to:

- Answer the top TypeScript interview questions out loud, from memory
- Explain *why* one construct beats another — the trade-off, not just the feature
- Reimplement `Partial` and `ReturnType` from scratch at the whiteboard
- Explain what `strict` turns on, and why `unknown` beats `any`
- Rehearse the harder follow-ups so the round never feels like a surprise

## 1. One-line Definition

**This is a rehearsal round: the most-asked TypeScript interview questions from Lessons 29–46, with model answers worth saying out loud.**

The interview tests whether you understand the type system as a tool — not whether you can recite its grammar.

## 2. Mental Model

TypeScript interviews are the **oral exam** for a language you have been writing.

In the lessons you learned the grammar: what an interface is, how a conditional type is
evaluated, what `infer` does. This lesson is the oral: you have to *produce* the grammar
from memory, under time, and justify your choices. Oral exams reward fluency — the ability
to reach for the right construct without hunting for it.

## 3. Visual Flow

```text
The rehearsal loop — do this for every question:
                                      ┌──────────────────────┐
                                      │                      ▼
  ┌────────────┐      ┌────────────┐  │   ┌──────────────────────────┐
  │  Read the  │ ───▶ │  Say your  │──┘   │  Compare with the model  │
  │  question  │      │  answer    │      │  answer — mark the gap   │
  └────────────┘      └────────────┘      └────────────┬─────────────┘
      (cover the answer)     (out loud)                │
                                                       ▼
                                        ┌──────────────────────────┐
                                        │  Re-say the answer       │
                                        │  until it is clean and   │
                                        │  complete — then move on │
                                        └──────────────────────────┘
```

If you cannot say it cleanly twice in a row, you have not finished the question.

## 4. How It Works

The questions follow the natural shape of the type system — the same path the module took:

| Theme | Questions | From lessons |
|---|---|---|
| Shapes | interface vs type | 31 |
| Generics | generics, generic constraints | 36, 37 |
| Flow | unions, narrowing, discriminated unions | 32, 33, 38 |
| The toolbox | utility types, keyof/typeof/indexed access | 35, 39 |
| Type-level programming | conditional types, mapped types, `infer`, template literals | 40, 41, 42, 43 |
| Everyday modern TS | `satisfies`, `as const`, `unknown` vs `any` vs `never`, `strict` | 44, 45, 46 |

The interview is a sample of these themes, not a separate subject. When you cannot answer,
the fix is to return to the lesson — not to memorise the answer.

### The TypeScript answer shape

TypeScript questions are almost all comparison questions, and the comparison answer has a
shape of its own:

```text
1. DEFINE  — what each construct is, in one line
2. COMPARE — the difference that matters (often: when each is checked)
3. DECIDE  — which you reach for, and when you would switch

"An interface is an open, extensible shape — it can be re-opened and merged, and it
 extends cleanly. A type alias is a closed union or computed type; it cannot merge,
 but it can express things interfaces cannot. I default to interface for object
 shapes I expect other teams to extend — API contracts — and use type for unions,
 tuples and anything computed."
```

## 5. Real Project Usage

Every one of these answers is a decision you already make in a codebase:

| Question being asked | Where you use it at work |
|---|---|
| "Interface or type?" | The public API of a package vs the internal union of states |
| "Explain generics" | `useState<T>`, `useQuery<T>`, a typed `fetch` wrapper |
| "Narrow a union" | `if (res.ok)` before reading `res.data` on a discriminated response |
| "Why `unknown`?" | Parsing `JSON.parse` and API payloads until the shape is proven |
| "Reimplement `Partial`" | Form state, patch requests, configs that are partially filled |
| "What does `strict` turn on?" | The tsconfig you read on the first day of every job |

## 6. Interview Explanation

> TypeScript interviews sample the type system: shapes (interface vs type), flow (unions and
> narrowing), generics, the utility-type toolbox, and type-level programming with conditional
> and mapped types. The questions are comparisons, and the strong answer defines each
> construct, states the difference that matters, then says which one they reach for and when.

## 7. Senior-Level Insights

- **Know the internal mental model.** `interface` extends by *declaration merging and inheritance*; `type` is a *structural alias* — whatever the expression evaluates to. Saying "an interface describes a shape that can be extended; a type alias is a name for a computed type" shows you understand the machinery, not just the syntax.
- **The trade-off is the answer.** For "interface vs type", the senior answer includes *when it stops mattering*: once the codebase is on one convention, consistency beats cleverness. Same for `any` vs `unknown`: "I don't ban `any` — I quarantine it behind a typed boundary."
- **Reimplement from scratch, confidently.** `Partial`, `Pick`, `ReturnType` — being able to write them from first principles (the mapped type, the conditional with `infer`) is the single strongest TypeScript signal.
- **Bring it back to DX.** The reason you choose a construct is developer experience: compile-time safety, autocomplete, refactorability. "Types are a second program that checks the first while you write it" lands better than any syntax recital.
- **When you do not know, say what you do know** — and how you would verify it. Confident honesty beats a confident guess.

## 8. Common Mistakes

- **Answering with syntax instead of semantics.** "`interface Foo {}` is the syntax, `type Foo = {}` is the syntax" answers nothing. The question is *what changes when you pick one*.
- **`any` as a reflexive answer.** "Just use `any`" is the fastest way to fail a TypeScript interview. The senior move is to say what the type *should* be, and to quarantine the escape hatch.
- **Reciting utility types without being able to build them.** Saying what `Partial` does is easy; writing the mapped type behind it is the actual test.
- **Confusing `unknown` and `any`.** They look interchangeable; the difference — `unknown` demands narrowing before use, `any` disables checking — is the entire point of the question.
- **Forgetting that types are erased.** Conditional types and `infer` are compile-time-only; the runtime still gets plain JavaScript. Saying "types are erased" early frames every type-level question correctly.
- **Not predicting the type.** Interviewers write a generic function and ask "what is the type of `x`?" — train by predicting before you check with the compiler.

## 9. Best Practices

✅ Default to `interface` for object shapes and `type` for unions, tuples and computed types — and follow the team's convention once one exists

✅ Use `unknown` at trust boundaries (`JSON.parse`) and narrow; use `any` only as a quarantined escape hatch behind a typed boundary

✅ Reach for the utility types first, then `keyof`/`typeof`/indexed access — write the custom type only when the toolbox runs out

✅ Turn `strict` on and leave it on; migrate progressively with targeted `@ts-expect-error` where the codebase demands it

✅ Prefer `satisfies` when you want inference *and* a constraint check; prefer `as const` when you want a literal type

❌ Don't reach for `as` to silence errors — it lies to the compiler for you

❌ Don't answer with "just make it `any`"

❌ Don't over-engineer: a conditional mapped type with three `infer`s is not better than a readable union when the union expresses the same thing

## 10. Interview Questions

**Q1. What is the difference between an interface and a type alias?**

> An interface is an open, extensible shape — it can be re-opened and merged (declaration
> merging), and it extends cleanly. A type alias is a name for whatever the type expression
> evaluates to: it cannot merge, but it can express unions, tuples, mapped and conditional
> types. I default to interface for object shapes that other teams will extend, and type
> for everything computed — unions, tuples, intersections.

**Q2. What are generics?**

> A function, type or class parameterised over another type. `identity<T>(x: T): T` is a
> function whose input and output are the *same* type without naming it in advance. The
> compiler infers `T` from each call site, so `useState<number>(0)` and `useQuery<User>(…)`
> get type-checked per use. They are how a library stays general and still type-checks
> precisely.

**Q3. What is union narrowing?**

> A union type means a value is one of several types, and narrowing is shrinking that to a
> single one using checks the compiler can follow. `typeof`, `in` checks, truthiness,
> `instanceof`, discriminated-union `kind` fields — each check removes members from the
> union in that branch. The compiler tracks this *control-flow analysis* as it walks the
> code. "Narrowing is the flow of the type following the flow of your checks" is the whole
> idea.

**Q4. What is a discriminated union?**

> A union whose members share a literal tag field, like `kind` or `type`. Checking that tag
> narrows the union in one step — after `if (res.state === 'error')`, the compiler knows the
> value is exactly the error variant. It is the single most useful pattern for modelling
> API responses: `loading | success | error` states as one union, exhaustively switchable.

**Q5. What are utility types? Give three examples.**

> Built-in generic type functions — they transform types instead of values. `Partial<T>`
> makes every property optional. `Pick<T, K>` keeps only the named keys. `Omit<T, K>` keeps
> everything except them. `Record<K, V>` builds an object type from a key union, and
> `ReturnType<F>` extracts a function's return type. In practice I reach for `Pick`/`Omit`
> to derive types from an API contract instead of duplicating it.

**Q6. How do conditional types work?**

> A conditional type is `T extends U ? X : Y` — evaluated against the *type* at compile time,
> not a value at runtime. When `T` is generic, the check distributes over unions: each union
> member is tested separately. That distribution is why
> `type NonNullable<T> = T extends null | undefined ? never : T` works on every member.
> Conditional types are how TypeScript becomes a programming language on top of itself.

**Q7. How do mapped types work?**

> A mapped type iterates over the keys of one type to build another:
> `type Partial<T> = { [K in keyof T]?: T[K] }`. `keyof` collects the keys, `[K in …]`
> iterates them, and the property type can be transformed — made optional, made `readonly`,
> wrapped in `Promise`, renamed. It is how `Partial`, `Readonly` and `Pick` are actually
> implemented, and it is the reason you can derive one API shape from another.

**Q8. What is `infer`?**

> A keyword that appears inside conditional types to *capture* a type from a larger one:
> `type ReturnType<F> = F extends (...args: any) => infer R ? R : never`. The conditional
> matches the function signature, `infer R` grabs the return type, and the true branch
> yields it. It is how you extract parts of a type without naming them in advance — like
> pattern-matching the type level. It only works inside the `extends` clause of a
> conditional type.

**Q9. What is the difference between `unknown` and `any`?**

> `any` disables type checking on the value — you can do anything with it and the compiler
> stays silent, so errors escape to runtime. `unknown` is the safe top type: you cannot do
> anything with it *until you narrow it*. That narrowing requirement is the whole difference.
> At a trust boundary like `JSON.parse`, the return is `any` — I immediately assign it to
> `unknown` and prove the shape before using it.

**Q10. What is `never`?**

> The bottom type — a value that can never exist. A function that always throws returns
> `never`; an exhaustive `switch` whose default throws makes the compiler prove every case
> was handled, because a variable that is `never` after the switch means no member was left
> out. It also shows up when conditional types filter a union to nothing. `never` is the
> type-level "impossible", and it is how you make the compiler do the exhaustiveness work.

**Q11. What does `strict` mode turn on?**

> The strict flag enables a family of checks — the ones everyone actually means when they
> say "strict TypeScript": `strictNullChecks` (null and undefined are not assignable to
> other types), `noImplicitAny` (no silent `any`), plus `strictFunctionTypes`,
> `strictBindCallApply`, `noImplicitThis`, `strictPropertyInitialization` and
> `useUnknownInCatchVariables`. `strictNullChecks` is the one that changes the most code:
> it turns every `null`/`undefined` into a type error you must handle.

**Q12. What is `keyof`?**

> A type operator that collects the keys of an object type into a union of literal types.
> `keyof User` for `{ id: number; name: string }` is `'id' | 'name'`. It is the foundation
> of mapped types and indexed access, and it makes object code type-safe: a function that
> takes `(obj: T, key: keyof T)` cannot be called with a wrong key.

**Q13. What is `satisfies`?**

> An operator that checks a value against a type *without* widening the value's type to it —
> you get the constraint check *and* the narrow inferred type. The classic case:
> `const routes = { home: '/', user: (id) => \`/user/${id}\` } satisfies Record<string, string | Function>`
> keeps the literal `'/'` and the exact function signature, while still proving the object
> fits the record. Before `satisfies`, you had to choose between a loose `Record` annotation
> and losing the narrow types. `satisfies` gives you both.

**Q14. What is `as const`?**

> An assertion that makes a value's type as literal as possible — no widening. `const x = { a: 1 }`
> infers `{ a: number }`; `as const` infers `{ readonly a: 1 }`. It turns string literals
> into their literal types, objects into readonly shapes, and arrays into readonly tuples.
> It is the tool for config objects and route maps where you want the exact values as
> types, and it is also why a const object can satisfy a `keyof` union.

**Q15. How do `Pick` and `Omit` work internally?**

> `Pick` is a mapped type over the chosen keys:
> `type Pick<T, K extends keyof T> = { [P in K]: T[P] }`.
> `Omit` removes keys, and the standard implementation builds on `Pick` and `Exclude`:
> `type Omit<T, K> = Pick<T, Exclude<keyof T, K>>`.
> `Exclude<keyof T, K>` computes the keys minus the ones to drop, then `Pick` keeps exactly
> those. Both are derived types — no runtime code, just compile-time type functions.

**Q16. How do you type a generic fetch wrapper?**

> A function generic over the response shape:
>
> ```ts
> async function get<T>(url: string): Promise<T> {
>   const res = await fetch(url);
>   if (!res.ok) throw new Error(res.statusText);
>   return res.json() as Promise<T>;
> }
> ```
>
> `get<User>('/api/users/1')` then returns a `Promise<User>` — the `as` cast is quarantined
> at exactly one trust boundary: `res.json()` genuinely returns `any`, and this is the
> single place the untrusted payload becomes a typed value.

**Q17. What happens to types at runtime?**

> Nothing — types are erased. TypeScript compiles to JavaScript by stripping annotations,
> interfaces and type aliases; there is no runtime type information unless you add it
> yourself (type guards are plain runtime checks, `zod` schemas are runtime values). That
> is why a `class` survives compilation but an `interface` does not, and why you cannot
> `instanceof` a type alias.

**Q18. How do you model a state machine with types?**

> A discriminated union is the natural fit — one tag field, one variant per state:
>
> ```ts
> type State =
>   | { status: 'idle' }
>   | { status: 'loading' }
>   | { status: 'success'; data: User }
>   | { status: 'error'; error: Error };
> ```
>
> Checking `state.status` narrows to the exact variant, the `data` field only exists in the
> success branch, and an exhaustive switch with a `never` default makes the compiler verify
> that adding a state later breaks every switch — compile-time state machine.

**Senior follow-up: Write `ReturnType` from scratch, and explain the two subtle parts.**

> ```ts
> type ReturnType<T extends (...args: any) => any> =
>   T extends (...args: any) => infer R ? R : any;
> ```
>
> Two subtleties. First, `infer R` only works inside the `extends` clause of a conditional
> type — it is how the type-level "pattern match" captures the return type. Second, the
> constraint `T extends (...args: any) => any` keeps the input honest: `ReturnType<string>`
> is a compile error, not a silent `any`. The `any` on `...args` is deliberate — we do not
> care about the parameter types, only the return.

## 11. Follow-up Questions

**Why is `unknown` assignable to `any`, but not the other way around?**

> `unknown` is the top type: every type is assignable to it. `any` is the escape hatch: it
> is assignable to and from everything, in both directions. The asymmetry that matters is
> *usage*: once a value is `unknown`, you cannot use it until you narrow it, whereas a value
> typed `any` can be used immediately — and its errors escape all checking. So `unknown` is
> the safe place to put untrusted data; `any` is where checking goes silent.

**When would a mapped type produce an incompatible output?**

> When the mapped keys are not the same set as the source keys. Mapping over `keyof T` keeps
> the shape structurally compatible; mapping over a *different* key union (say, an
> independent `K`) produces a different object type that is not assignable back to `T`.
> Also, conditional types inside the mapped type can change property types in ways that break
> assignability — which is exactly what `Exclude`/`Extract`-based derivations rely on.

**What is a generic constraint, and why does it matter?**

> `T extends SomeType` limits what `T` can be, so inside the function you can safely use
> properties of `SomeType` on `T`. `function getLength<T extends { length: number }>(x: T)` —
> the constraint is what lets the body call `.length` without error. The distinction from a
> union: a union lists the exact allowed types; a constraint declares the *minimum shape*
> any `T` must have, and callers can pass any subtype.

## 12. Comparison Table

| | `interface` | `type` alias |
|---|---|---|
| Extends | `extends`, re-opens (merging) | Intersection `&` |
| Declaration merging | ✅ | ❌ |
| Unions, tuples, mapped, conditional | ❌ | ✅ |
| Best for | Public object contracts, class shapes | Computed types, unions |

| | `any` | `unknown` |
|---|---|---|
| Checking on the value | Disabled | Required (narrow first) |
| Assignable to | Everything | Nothing (must narrow) |
| Assignable from | Everything | Everything |
| Use at | Quarantined escape hatch | Trust boundaries, `JSON.parse` |

| | `satisfies T` | `as T` |
|---|---|---|
| Checks value against T | ✅ | ✅ |
| Keeps inferred narrow type | ✅ | ❌ (overrides to T) |
| Silences mismatches | No — it errors | Yes — it asserts |
| Use for | Config, routes, records | Narrowing at a trust boundary |

## 13. Code Example

The reimplementation gauntlet. Cover the answers, then read on.

```ts
type MyPartial<T> = { [K in keyof T]?: T[K] };

type MyReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any;

type Config = { theme: string; retries: number };
type Loose = MyPartial<Config>;
type Result = MyReturnType<(n: number) => string>;

const c: Loose = {};                 // ✅ every key is optional
const r: Result = 'ok';              // ✅ inferred string

console.log(c, r);
```

Output:

```text
{} ok
```

`MyPartial` is the mapped type from first principles. `MyReturnType` captures the return
with `infer`. The types exist only at compile time — the runtime output is plain values.

```narrate
1: the mapped type — iterate keyof T, make each property optional
2: the conditional type — match a function signature and capture its return
3-4: sample inputs to both type functions
6-7: the resulting types behave exactly like the built-ins
9-10: types are erased at runtime — only values survive to the output
```

And the `satisfies` version of the same idea:

```ts
const routes = {
  home: '/',
  user: (id: number) => `/user/${id}`,
} satisfies Record<string, string | ((id: number) => string)>;

console.log(routes.home, routes.user(7));
```

Output:

```text
/ /user/7
```

`satisfies` checks the record constraint *and* keeps the narrow types: `routes.home` is the
literal `'/'`, `routes.user` keeps its exact signature. Annotating with `Record<string, …>`
instead would widen both and lose the literal types.

## 14. Performance Notes

- **Rehearsal cost is time, and it is the cheapest investment in the module.** Ten minutes
  out loud per question beats an hour re-reading definitions silently.
- **The bottleneck is retrieval, not knowledge** — practise *saying* the answers, not
  recognising them.
- **The type-level questions have real compile-time cost at work.** Conditional types over
  huge unions, and deeply nested `infer`s, slow the compiler noticeably. Mentioning that you
  prefer a readable union when it expresses the same thing is a genuine senior signal.
- **Utility types are free to use** — they are erased before runtime, and `Pick`/`Omit`/
  `Partial` cost nothing in the bundle. The performance question is never about the types
  themselves, only about how complex you make the compiler solve at type-check time.

## 15. Debugging Scenarios

**Scenario 1: "The interviewer asks you to reimplement a utility type and your mind goes blank."**

Start from what the built-in does, in words: "`Partial` makes every property optional."
Then translate: optional means `?`, every property means `[K in keyof T]`. Two lines later
you have `{ [K in keyof T]?: T[K] }`. Say the words before the syntax.

**Scenario 2: "The type says `X is not assignable to Y` and you don't see why."**

Hover the actual types at both ends — in the interview, say that out loud. "Let me check
what the compiler thinks each side is." The mismatch is almost always one of three things:
the shape differs, a union member is missing, or a `satisfies`/`as` changed the inferred
type. Name the three, then check.

**Scenario 3: "Your generic function body errors on a property you 'know' exists."**

The constraint does not declare it — `T` is generic, so only `T extends …` properties are
visible. The fix is adding the constraint or narrowing. That exact moment is a classic
interview follow-up, so being able to diagnose it out loud is a strong signal.

**Scenario 4: "`unknown` is everywhere and narrowing feels like busywork."**

Frame it as the trust boundary it is: the cost of proving the shape is the price of safety
at `JSON.parse`. Say "I prove the shape once, in one place, instead of sprinkling `any`
through the codebase" — that is the senior framing of the same decision.

## 16. Quick Revision Notes

- Interface: open, merges, extends; type alias: name for any computed type, no merging
- Generics: `T` inferred per call site; constraints declare the minimum shape
- Narrowing: `typeof`, `in`, truthiness, `instanceof`, discriminated-union tags
- Discriminated unions: a literal tag field makes the whole variant fall out of one check
- Utility types: `Partial`, `Pick`, `Omit`, `Record`, `ReturnType` — reimplement the first and last by hand
- Conditional types: `T extends U ? X : Y`, distributes over unions
- Mapped types: `[K in keyof T]` — how `Partial`/`Readonly` are built
- `infer`: captures a type inside `extends` — the `ReturnType` trick
- `unknown` demands narrowing; `any` disables checking; `never` is the bottom type
- `strict` = the family: `strictNullChecks`, `noImplicitAny`, and the rest
- `satisfies`: constraint check *and* narrow inference; `as const`: literal types, no widening
- Types are erased at runtime — interfaces vanish, classes survive

## 17. Cheat Sheet

```text
ANSWER SHAPE:  define → compare → decide

PARTIAL:        type Partial<T> = { [K in keyof T]?: T[K] }
RETURNTYPE:     type ReturnType<T extends (...args: any) => any> =
                  T extends (...args: any) => infer R ? R : any
OMIT:           type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
NONNULLABLE:    type NonNullable<T> = T extends null | undefined ? never : T

NARROW WITH:    typeof · in · instanceof · truthiness · discriminant tag

PICK RULE:      interface for shapes you extend · type for unions and computed types
                any at trust boundaries? NO → unknown, then narrow
```

## 18. Key Takeaways

> [!RECAP]
> - This is rehearsal: the type system is revision; the new skill is producing the answers out loud
> - TypeScript questions are comparisons — define each construct, state the difference that matters, then decide
> - Interface is open and merges; type alias expresses unions and computed types — the trade-off is the answer
> - `unknown` demands narrowing; `any` disables checking; `never` is impossible — each has a job
> - Utility types are the toolbox; reimplementing `Partial` and `ReturnType` by hand is the whiteboard proof
> - Conditional, mapped types and `infer` are compile-time programs — types are erased at runtime
> - `strict` is a family of checks; `satisfies` gives constraint plus narrow inference; `as const` freezes literals
> - If you cannot say an answer cleanly twice, you have not finished the question

## Check your understanding

Answer these without looking back.

1. Say the interface-vs-type answer out loud: define each, compare, decide.
2. Write `Partial<T>` and `ReturnType<T>` from memory — then check section 13.
3. Why does `unknown` need narrowing and `any` does not — and which do you use at `JSON.parse`?
4. What is a discriminated union, and how does one tag check narrow the whole variant?
5. What does `strict` actually turn on, and which check changes the most code?
6. What is the difference between `satisfies` and `as`?
7. Where can `infer` appear, and what does it capture?
8. Why does a `class` survive compilation but an `interface` does not?

## What's Next

**Lesson 99 — Top React Interview Questions.** The same rehearsal format for React:
batching, effects and cleanup, keys, reconciliation, `useMemo` vs `useCallback`, context
re-renders and error boundaries — the questions that decide React screens.
