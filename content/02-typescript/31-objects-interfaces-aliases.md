# Lesson 31 — Objects, Interfaces & Type Aliases

**Interview importance:** ⭐⭐⭐⭐⭐ — "interface vs type" is asked in essentially every
TypeScript interview.

This is where day-to-day TypeScript really lives: naming object shapes. The language
gives you two tools — `interface` and `type` — that overlap almost completely, and the
interview wants to know *when each is right*, plus the one structural distinction that
matters: interfaces are open and extendable, type aliases are not.

## Learning Objectives

By the end of this lesson you should be able to:

- Write and read `interface` and `type` object shapes fluently
- Explain *structural typing* and why an unannotated object literal can satisfy a type
- State the one real difference: interfaces are open (extendable), type aliases are not
- Apply the standard decision rule: `interface` by default, `type` for unions and advanced types
- Explain when declaration merging is useful and when it's dangerous

## 1. One-line definition

**`interface` and `type` both name a shape, and they're interchangeable for plain
objects — except that interfaces are open to extension (declaration merging,
`extends`), while type aliases are closed once defined.**

## 2. Mental model

A contract with a name.

You write a spec — "any object with a `name: string` and an optional `age: number`" —
and give it a name. From then on, anything that matches the spec is accepted: TypeScript
checks the *shape* of a value, not its ancestry. The shape is a door, and the interface
is the frame the door must fit.

## 3. Visual flow

```text
 two ways to name an object shape
─────────────────────────────────────────
  interface User { ... }      type User = { ... }

        │                              │
        ▼                              ▼
   structural: a value fits if it has the same shape — no extends needed

  open (extendable)              closed (fixed)
  ───────────────────            ───────────────────
  interface + interface          type X = A & B
  merges into one shape          (new type from pieces)

  interface B extends A          cannot be reopened or extended
  (inherits A's shape)           after definition
```

## 4. How it works

Both declare a named object shape:

```ts
interface User {
  id: number;
  name: string;
  email?: string;        // optional property
  readonly createdAt: Date;
}

type Account = {
  id: number;
  name: string;
  email?: string;
  readonly createdAt: Date;
};
```

For plain objects these two are **identical in capability**. Both support optional
properties (`?`), `readonly`, methods, generics. Use whichever you prefer.

### Structural typing

A value fits if it *has the shape* — nothing needs to declare it implements anything:

```ts
interface User {
  id: number;
  name: string;
}

function greet(u: User): string {
  return `Hello, ${u.name}`;
}

const admin = { id: 7, name: 'Mansha', role: 'admin' }; // extra props are fine
console.log(greet(admin));
```

Output:

```text
Hello, Mansha
```

`admin` was never annotated as a `User`. It has the required shape, so it *is* one. Extra
properties are allowed because the value is structurally compatible.

> [!PITFALL]
> Extra properties are allowed on *variables* — but a fresh **object literal** gets the
> stricter excess-property check:
>
> ```ts
> // greet({ id: 7, name: 'Mansha', role: 'admin' });  // 💥 'role' does not exist in type 'User'
> ```
>
> The rule of thumb: literals are checked strictly, references are checked structurally.

### The one real difference: open vs closed

Interfaces are **open** — they can be extended and even merged:

```ts
interface User {
  id: number;
  name: string;
}

// ✅ interfaces can be reopened and merged
interface User {
  email: string;
}

const u: User = { id: 1, name: 'Mansha', email: 'm@example.com' };
console.log(u.email);
```

Output:

```text
m@example.com
```

Two declarations of `User` merge into one shape. This is **declaration merging**, and
it's how libraries extend types declared by other libraries.

Type aliases are **closed** — a second declaration is a duplicate, and there is no
`type B = A & { ... }`-style extension that keeps the name:

```ts
type User = { id: number; name: string };
// type User = { email: string };  // 💥 Duplicate identifier 'User'
```

Output:

```text
error TS2300: Duplicate identifier 'User'.
```

Interfaces extend with `extends`; type aliases combine with intersections (Lesson 32):

```ts
interface Admin extends User {
  permissions: string[];
}

type AdminType = User & { permissions: string[] };
```

Both `Admin` and `AdminType` have `id`, `name`, and `permissions`. One uses inheritance,
the other composes pieces.

```narrate
line 1: interface Admin extends User — inheritance, the interface-native way to build
line 3: type AdminType = User & { permissions: string[] } — intersection, the
        type-alias way to get the same shape
```

## 5. Real project usage

| Use case | Tool |
|---|---|
| Props for a React component | `interface` |
| API request/response shapes | `interface` |
| A named union ("one of these shapes") | `type` |
| A function type or a tuple | `type` |
| Merging library types (e.g. `express-session` custom fields) | `interface` (declaration merging) |
| Any shape that's a *combination* rather than a base | `type` with intersections |

Props, concretely:

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick} className={variant}>{label}</button>;
}

console.log(<Button label="Save" onClick={() => {}} />);
```

Output:

```text
<button onClick={...} className="primary">Save</button>
```

The `onClick: () => void` field shows the other thing interfaces do: model functions as
properties (Lesson 34 covers function types in full).

## 6. Interview explanation

> For plain objects, `interface` and `type` are interchangeable. The one real difference
> is that interfaces are **open** — they support declaration merging and `extends` — while
> type aliases are **closed** and combine with intersections. My default is `interface`
> for objects and props; I reach for `type` when I need a union, a function type, a
> tuple, or an advanced mapped type. And shapes are checked structurally: if a value has
> the fields, it fits — no explicit implementation needed.

## 7. Senior-level insights

A senior answer adds *precision* and *trade-offs*:

- **Both support generics; neither is "the simple one".** `interface Box<T> { value: T }`
  and `type Box<T> = { value: T }` are equally capable. The distinction is purely
  open-vs-closed, not capability.
- **Interfaces can be extended, type aliases can't** — but that's also their weakness:
  merging is a global mutation that can silently change a type's meaning. In a
  codebase you control, merging is rarely what you want.
- **Declaration merging is the escape hatch that makes interfaces the default.** It's
  how libraries retrofit types. If you never need it, `type` would work fine for
  objects too — "interface by default" is a convention, not a law.
- **Performance at scale is a real (minor) argument.** Interface shapes are cached by
  name, which makes them marginally faster to check on very large projects. Nobody
  should choose based on this outside the biggest codebases.
- **Don't say "type can't do objects".** In an interview, the strongest answer
  acknowledges the 95% overlap and then states the one distinction precisely.

## 8. Common mistakes

**Believing `type` can't describe objects.** It can — `type User = { id: number }` is
perfectly valid. The difference is never "interface for objects, type for everything
else".

**Using a type alias when you need extension:**

```ts
type Base = { id: number };
// type Extended = Base extends ... ? // no such syntax for aliases
```

An alias can't inherit. You either write `Base & { name: string }` (an intersection) or
switch to `interface Extended extends Base`.

**Forgetting excess-property checks.** Assigning a literal with an unknown property
errors, while assigning the same object via a variable does not:

```ts
interface User { id: number; name: string; }

const extra = { id: 1, name: 'M', secret: true };
const ok: User = extra;                 // ✅ structurally fine
// const bad: User = { id: 1, name: 'M', secret: true };  // 💥 excess property
```

Output:

```text
(no error — the variable assignment is structurally compatible)
```

The literal case fails; the reference case passes. That asymmetry surprises people, and
it's worth having ready.

**Using `?` when you mean "nullable".** `email?: string` means "may be absent" — the
value can be `undefined`. It does *not* mean "may be `null`". If the API sends `null`,
the type must say `email: string | null` (Lesson 32).

> [!PITFALL]
> **Interface merging is a global, silent change.** `interface Window { x: number }`
> affects every file that reads `Window`. It's the correct tool for library extension —
> and a hazard in app code, where an accidental second declaration quietly widens the
> type for everyone.

## 9. Best practices

✅ Use `interface` by default for object shapes, component props, and API types

✅ Use `type` for unions, intersections, function types, tuples, and mapped types

✅ Keep shapes small and focused; compose them rather than one giant interface

✅ Use optional (`?`) for genuinely absent fields and explicit unions for `null`

✅ Prefer `extends` on interfaces; reserve intersections for combining aliases

❌ Don't reopen an interface in app code just because you can — merging is for libraries

❌ Don't say "interface is for objects, type is for everything else" — both do objects

❌ Don't reach for `type` when the thing you want is an interface's extendability

## 10. Interview questions

**Q1. What is the difference between an interface and a type alias?**

> For object shapes they're interchangeable — both support optional properties,
> `readonly`, generics, and methods. The one structural difference: interfaces are
> **open**. They can be extended with `extends` and merged via declaration merging. Type
> aliases are **closed** — they can't be reopened or inherited, and combine with
> intersections instead.

**Q2. When do you use one over the other?**

> Interface by default for objects, props, and API shapes, because open/mergeable is
> useful for libraries and it's the conventional default. Type when I need a union, a
> function type, a tuple, or a mapped/conditional type — the things an interface simply
> can't express.

**Q3. What is structural typing?**

> TypeScript checks shapes, not names. A value is a `User` if it has `id` and `name`
> with the right types — it doesn't need to declare that it implements `User`. This is
> why a function typed to accept `User` happily takes an object with extra properties.

**Q4. Can you extend a type alias?**

> Not with inheritance syntax — there's no `type B extends A`. But you compose one:
> `type B = A & { extra: string }` gives a new type with all of `A` plus the extra
> fields. That's the type-alias equivalent of extending.

**Senior follow-up: What is declaration merging, and when is it a good idea?**

> When two `interface` declarations share a name, they merge into one shape with both
> sets of members. It's how libraries add types to globals like `Window` or to another
> library's interfaces. The catch: merging is global and silent, so in app code it can
> widen a type for every consumer without anyone noticing. Good for extending third-party
> types; rarely good for your own.

## 11. Follow-up questions

**Q: Can interfaces and types both use generics?**

> Yes — `interface Box<T> { value: T }` and `type Box<T> = { value: T }` are equally
> generic. The open/closed difference is the only real distinction.

**Q: What is the excess-property check?**

> When you assign a fresh object literal to a typed target, TypeScript rejects properties
> the type doesn't declare — that's the excess-property check. Assign the same object via
> a variable and it passes, because the check only applies to literals. It exists to catch
> typos like `{ id: 1, naem: 'x' }`.

**Q: Does it matter which one you pick for performance?**

> Nominally yes on very large projects — interfaces are cached by name, so they typecheck
> marginally faster. It's a real but minor effect; team consistency beats micro-tuning.

## 12. Comparison table

| Capability | `interface` | `type` |
|---|---|---|
| Describe an object shape | ✅ | ✅ |
| Optional / `readonly` properties | ✅ | ✅ |
| Methods & call signatures | ✅ | ✅ |
| Generics | ✅ | ✅ |
| Extend another shape | ✅ `extends` | — (intersect instead: `A & B`) |
| Reopen / merge | ✅ **declaration merging** | ❌ **closed once defined** |
| Unions | ❌ | ✅ |
| Tuples | ❌ | ✅ |
| Function types | ✅ (call signature) | ✅ |
| Mapped / conditional types | ❌ | ✅ |
| Inheritance | ✅ `interface B extends A` | — |

## 13. Code example

A complete program combining both tools:

```ts
interface BaseEntity {
  id: number;
  createdAt: Date;
}

interface User extends BaseEntity {
  name: string;
  email?: string;
}

type Permissions = 'read' | 'write' | 'admin';

type AdminUser = User & { permissions: Permissions[] };

function describe(u: AdminUser): string {
  const perms = u.permissions.join(', ');
  return `${u.name} (id ${u.id}) — ${perms}`;
}

const admin: AdminUser = {
  id: 1,
  createdAt: new Date(),
  name: 'Mansha',
  permissions: ['read', 'admin'],
};

console.log(describe(admin));
```

Output:

```text
Mansha (id 1) — read, admin
```

`AdminUser` is a `type` composed from an `interface` (`User`) and an inline shape via an
intersection — exactly the "both tools" pattern used in real codebases.

## 14. Performance notes

Types are erased — zero runtime cost for either keyword. The only performance story is
**compile time**:

- Interfaces are checked by name and cached, so they're slightly cheaper on very large
  projects.
- Type aliases, especially with intersections and unions, make the checker do more work.
- The difference is negligible below tens of thousands of types. Pick by semantics, not
  speed; revisit only on genuinely huge codebases.

## 15. Debugging scenarios

**"`Property 'x' does not exist on type 'User'`."** The type is narrower than the value.
Either the annotation is incomplete, or you're reading a property the type never
declared. Add it to the shape — or check whether you grabbed the wrong type.

**"A literal is rejected, but the same object in a variable passes."** That's the
excess-property check. For a one-off literal, the error is correct — the typo is yours.
If the shape is genuinely allowed, widen the declared type or pass via a variable.

**"The type gained a field nobody added."** You found declaration merging — an
`interface` with the same name somewhere else in the project (or in a library) silently
widened it. Search for the duplicate declaration.

**"`Duplicate identifier 'User'`."** You declared a `type` twice. Reopen one of them as
an `interface`, or rename — aliases are closed, so this is the compiler enforcing it.

> [!TIP]
> Hover over a value and then over the *type* — a mismatch between the inferred type and
> the shape you expected is usually the moment a bug is born. The compiler is telling
> you where the two diverged.

## 16. Quick revision notes

- `interface` and `type` are interchangeable for plain object shapes
- Shapes are checked **structurally** — no explicit implementation needed
- Interfaces are **open**: `extends` + declaration merging
- Type aliases are **closed**: combine with intersections instead
- Decision rule: `interface` by default; `type` for unions, tuples, function types, mapped types
- Excess-property check applies to literals, not references
- `?` means "may be absent", not "may be null" — use unions for null
- Merging is global and silent — right for libraries, wrong for app code

## 17. Cheat sheet

```text
interface User {                      type Account = {
  id: number;                           id: number;
  name: string;                         name: string;
  email?: string;     // optional       email?: string;
  readonly createdAt: Date;             readonly createdAt: Date;
}                                     };

extend:      interface Admin extends User { ... }
merge:       interface User { a: string }  +  interface User { b: number }  →  both
compose:     type Admin = User & { permissions: string[] }
union:       type Result = User | Error
call sig:    interface Fn { (x: number): string }      // or type Fn = (x: number) => string
structural:  { id: number; name: string }  satisfies  User   without implements
excess:      literal props are checked strictly; references are checked by shape only
```

## 18. Key takeaways

> [!RECAP]
> - `interface` and `type` overlap ~95% for objects — identical features, both generic
> - The one real difference: interfaces are **open** (extendable, mergeable); type aliases are **closed**
> - Shapes are **structural** — a value fits if it has the fields, no declaration needed
> - Default to `interface` for objects and props; use `type` for unions, tuples, and advanced types
> - Declaration merging is a global, silent change — a library tool, not an app-code habit
> - Types are erased: choosing one costs nothing at runtime

## Check your understanding

Answer these without looking back.

1. What is the one real difference between `interface` and `type`?
2. Why does `{ id: 1, name: 'M', secret: true }` fit a `User` when stored in a variable, but not as a literal?
3. What is declaration merging, and when is it appropriate?
4. How do you "extend" a type alias?
5. What does `?` mean, and how do you express "may be null"?
6. Why is `interface` the conventional default for component props?

## What's Next

**Lesson 32 — Union & Intersection Types.** Modelling "one of these shapes" correctly
is most of day-to-day TypeScript. You'll combine the types from this lesson and Lesson
30 into the unions and intersections that appear in almost every real signature.
