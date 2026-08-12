# Lesson 20 — Destructuring, Spread & Rest

**Interview importance:** ⭐⭐⭐ — shallow-copy semantics here cause a huge share of
state-mutation bugs.

Three syntaxes, one `...`, and a shallow-copy rule that quietly bites React developers
every single week. This lesson is short by design — the syntax is easy, and the interview
weight lives in one question: *what did you actually copy?*

## Learning Objectives

By the end of this lesson you should be able to:

- Read and write destructuring for objects, arrays and function parameters
- Distinguish spread from rest by where the `...` appears
- Explain why `{ ...obj }` is a shallow copy — and when that breaks
- Use destructuring defaults and renaming without looking them up

## 1. One-line Definition

**Destructuring unpacks values from objects and arrays into variables; spread (`...`)
expands them into new values; rest (`...`) collects the leftovers.**

```js
const user = { name: 'Mansha', age: 28 };
const { name, age } = user;              // destructuring
console.log(name, age);

const nums = [1, 2, 3];
const copy = [...nums];                  // spread — a new array
console.log(copy);

const [first, ...rest] = nums;           // rest — collects the rest
console.log(first, rest);
```

Output:

```text
Mansha 28
[ 1, 2, 3 ]
1 [ 2, 3 ]
```

## 2. Mental Model

- **Destructuring is pattern-matching on the left of `=`.** The shape on the left declares
  which keys or indices to pull out.
- **Spread is unpacking** — it takes an iterable and spreads its items into a new array,
  object or call. `...` on the *right* of an assignment.
- **Rest is packing** — it gathers the remaining items into one variable. `...` in a
  *parameter list* or the *last* position of a pattern.

```text
const [a, ...b] = arr   →  a = first, b = everything after
const { x, ...y } = obj →  x = that key, y = the remaining keys
f(...args)              →  spread into a call
function f(...args)     →  rest, collected into an array
```

## 3. Visual Flow

```text
const { name, ...rest } = user

   user = { name: 'Mansha', age: 28, city: 'Riyadh' }
                 │
   ┌─────────────┴──────────────┐
   name = 'Mansha'              rest = { age: 28, city: 'Riyadh' }
```

```text
const [a, ...others] = [1, 2, 3]

   a = 1          others = [2, 3]
```

## 4. How It Works

Object destructuring matches by key; array destructuring matches by position:

```js
const user = { name: 'Mansha', age: 28, city: 'Riyadh' };

const { name, city } = user;          // pull by key
const { name: fullName } = user;      // rename
const { bio = 'no bio' } = user;      // default for missing keys

console.log(name, city);
console.log(fullName);
console.log(bio);
```

Output:

```text
Mansha Riyadh
Mansha
no bio
```

```js
const [a, , c] = [1, 2, 3];           // skip an index
const [x = 0, y = 0] = [];            // defaults for missing values

console.log(a, c);
console.log(x, y);
```

Output:

```text
1 3
0 0
```

Rest collects leftovers — object rest drops the pulled keys, array rest takes everything
after the pulled positions. And both `...`s are *copies*, not references:

```js
const original = { a: 1, b: { deep: true } };
const shallow = { ...original };

console.log(shallow === original);     // different objects
console.log(shallow.b === original.b); // but the SAME inner object
```

Output:

```text
false
true
```

That last line is the whole lesson. A nested object is shared between the original and the
copy.

```narrate
line 3: object spread copies the top level into a brand-new object
line 4: the nested object is a REFERENCE (Lesson 6) — both objects point at the same one
```

## 5. Real Project Usage

| Pattern | Use |
|---|---|
| `const { data } = await fetch(...)` | Pull a field off a response |
| `const [count, setCount] = useState(0)` | React hook pair |
| `setState(prev => ({ ...prev, ...patch }))` | Immutable update |
| `const { id, ...rest } = props` | Pass props through without the handled one |
| `export const { default: Comp, ...others } = mod` | Re-export shapes |
| `function sum(...nums)` | Accept any number of arguments |

The state-update pattern that dominates React code:

```jsx
const [form, setForm] = useState({ email: '', password: '' });

const update = (field, value) =>
  setForm((prev) => ({ ...prev, [field]: value }));
```

One key updated, every other key preserved, the previous object untouched.

## 6. Interview Explanation

> Destructuring unpacks object keys or array positions into variables. Spread copies an
> object or array into a new one — or expands an iterable into a call. Rest is the inverse:
> it gathers remaining items into a single variable, and it always sits last.
>
> The critical point is that spread is a **shallow** copy — nested objects stay shared by
> reference, which is why spread alone can't do deep state updates.

## 7. Senior-Level Insights

- **Say "shallow" before anyone asks.** "I copy with `{ ...obj }`, which is shallow — nested
  structures are still shared references, so I clone the levels I actually change." That
  sentence is worth more than knowing the syntax.
- **Rest + spread is the prop-filter idiom.** `const { id, ...rest } = props` removes one
  key while keeping a full copy of the rest to spread onto a child. One line, no mutation.
- **Deep clones are rarely the answer.** Cloning five levels to change one field is slow and
  surprising. Copy the levels you change and share the rest — that's what immutable updates
  are *for*.
- **`structuredClone` exists for true deep copies**, and `JSON.parse(JSON.stringify(x))` is
  a lossy, hacky stand-in (drops functions, `undefined`, `Date`s become strings). Prefer the
  real tool when you genuinely need deep.
- **Defaults only apply to `undefined`.** A key present with value `null` is *not* replaced
  by the default — `const { x = 5 } = { x: null }` gives `null`. Small, sharp edge worth
  having ready.

## 8. Common Mistakes

**Mistake 1 — thinking spread is deep.**

```js
const original = { settings: { theme: 'dark' } };
const copy = { ...original };

copy.settings.theme = 'light';       // ✅ allowed — and it CHANGES the original too

console.log(original.settings.theme);
```

Output:

```text
light
```

One assignment, both objects changed. `copy.settings` and `original.settings` are the same
object (Lesson 6). This is the single most common state bug in React apps.

**Mistake 2 — spread over `null` or `undefined` in old code.** Modern JS handles it (`{...null}`
is `{}`), but spreading `undefined` into a *call* still needs a guard.

**Mistake 3 — rest not in last position.**

```js
// const { name, ...rest, age } = user;   // 💥 SyntaxError: Rest element must be last
```

Rest must be the final element in the pattern.

**Mistake 4 — destructuring with the wrong name.** Object destructuring pulls by key — a
misspelled key silently gives `undefined`, no error.

## 9. Best Practices

✅ Use object spread for immutable updates — new top level, changed levels copied

✅ Use `const { id, ...rest } = props` to filter props before spreading onto children

✅ Use destructuring defaults with the key spelling from the source

✅ Use rest parameters for variadic functions — `sum(...nums)`

✅ Reach for `structuredClone` when a deep copy is genuinely needed

❌ Don't rely on spread for deep copies — clone the levels you change

❌ Don't put rest anywhere but last in a pattern

## 10. Interview Questions

**Q1. What is the difference between spread and rest?**

> Position. Spread uses `...` to *expand* — copying an object or array into a new one, or
> spreading an iterable into a call. Rest uses `...` to *collect* — gathering remaining
> items into one variable in a parameter list or pattern. `...args` in a function signature
> is rest; `fn(...args)` is spread.

**Q2. How do you copy an object without mutating the original?**

> `{ ...original }` creates a new object with the same top-level values. It's shallow — nested
> objects are shared by reference. For an immutable update I copy the object and the specific
> nested levels I change:

```js
const next = { ...state, settings: { ...state.settings, theme: 'light' } };
```

**Q3. When does `{ ...obj }` fail as a copy?**

> Whenever the structure is nested. The inner objects aren't copied — they're shared. Change
> `copy.settings.theme` and the original changes with it. Copy each level you modify, or use
> `structuredClone` for a true deep copy.

**Q4. How do you rename a key while destructuring?**

> `const { name: displayName } = user;` — the value of `user.name` lands in `displayName`.

**Senior follow-up: How does this relate to React state?**

> Every `setState` must produce a new object or the render is skipped — so updates are
> written as spreads: `{ ...prev, [field]: value }`. The shallow semantics decide where the
> new object is needed: at the top level, and at every level you change. Sharing unchanged
> levels is the point, not a bug.

**Senior follow-up: What's the cost of deep cloning?**

> A deep clone copies everything — O(n) memory and time even for levels you didn't touch, and
> it can break references like event listeners or class instances. Copying only the changed
> levels is cheaper and preserves identity where it matters. Deep clones belong at
> serialisation boundaries, not in every update.

## 11. Follow-up Questions

**How do you swap two variables with destructuring?**

> `[a, b] = [b, a];` — no temp variable needed.

**What does `const [a, ...rest] = [1, 2, 3]` give you?**

> `a` is `1`, `rest` is `[2, 3]`. Rest collects everything after the pulled positions into a
> new array.

**Do defaults apply when a key exists but is `null`?**

> No. Defaults apply only to `undefined`. `const { x = 5 } = { x: null }` gives `null` — the
> key exists, so the default never runs.

## 12. Comparison Table

| | Destructuring | Spread | Rest |
|---|---|---|---|
| Direction | Unpack into variables | Expand / copy out | Collect leftovers in |
| Position | Left of `=` / params | Right of `=`, in calls | Last in a pattern / params |
| Objects | By key | Copies own keys (shallow) | Remaining keys |
| Arrays | By index | Copies elements (shallow) | Remaining elements |
| Copies? | ❌ (binds values) | ✅ (shallow, new container) | ✅ (new array/object) |

## 13. Code Example

The prop-filter + merge idiom, in one flowing example:

```js
const props = { id: 7, title: 'Lesson 20', theme: 'dark', onClose: () => {} };

const { id, ...rest } = props;             // pull id, keep everything else

const defaults = { theme: 'light' };
const merged = { ...defaults, ...rest };   // later spreads win: theme 'dark'

console.log(id);
console.log(merged);
```

Output:

```text
7
{ theme: 'dark', title: 'Lesson 20', onClose: [Function: onClose] }
```

`id` is handled; `rest` carries the remaining props to spread onto a child component; and
`{ ...defaults, ...rest }` merges with the later spread winning. Every line here is a daily
React pattern.

## 14. Performance Notes

- **Spread is fast** — a shallow copy is a single-object allocation and a key loop. It's the
  cheapest immutable update there is.
- **Deep copies are the slow path.** `structuredClone` and `JSON` round-trips are O(size of
  the whole tree); spread is O(top-level keys). Prefer spread-and-copy-changed-levels in hot
  render paths.
- **Rest in function signatures allocates an array** on every call. For hot, tiny functions,
  that's a measurable overhead at scale — but negligible in normal application code.
- As always: measure, then "optimise".

## 15. Debugging Scenarios

**Scenario 1 — "My `useState` update didn't change anything."**

```js
setForm({ ...form, [field]: value });   // works, but reads a stale `form`
setForm((prev) => ({ ...prev, [field]: value }));   // ✅ functional form
```

The first line can read a stale closure (Lesson 5) when called from an effect with stale
deps. The functional form always gets the current state. When the UI "doesn't update,"
check whether the update returned a *new* object at all.

**Scenario 2 — "Changing one nested field changed everything."**

That's the shared nested reference — Mistake 1. Clone the changed level:

```js
setState(prev => ({ ...prev, settings: { ...prev.settings, theme: 'light' } }));
```

**Scenario 3 — "My destructured variable is `undefined`."**

Misspelled key, or the key simply isn't there. Object destructuring never throws for a
missing key — add a default (`= {}`) or check the source shape first.

**Scenario 4 — "The rest object keeps a key I deleted."**

```js
const { password, ...safeUser } = user;   // password is OUT of safeUser
```

Destructuring *removes* the pulled keys from rest — this is the standard way to strip a
field without mutating.

## 16. Quick Revision Notes

- Destructuring unpacks by key (objects) or position (arrays)
- `...` expands when spreading, collects when resting — position decides
- Rest must be last; defaults apply only to `undefined`
- `{ ...obj }` is shallow — nested objects stay shared references (Lesson 6)
- Immutable update = copy the top level + every level you change
- Rename with `{ key: newName }`; skip indices with `[a, , c]`
- `structuredClone` for true deep copies; `JSON` round-trip is lossy

## 17. Cheat Sheet

```text
const { a, b = 1, c: renamed } = obj      // by key, default, rename
const [x, , z] = arr                      // by position, skip
const { a, ...rest } = obj                // pull a, rest = remainder
const [x, ...rest] = arr                  // x + remainder array

copy    = { ...obj }        shallow — nested shared
copy    = [...arr]          shallow element copy
merged  = { ...a, ...b }    b wins on conflicts
fn(...args)                 spread into a call
function f(...args)         rest, collected into an array
[ a, b ] = [ b, a ]         swap
```

## 18. Key Takeaways

> [!RECAP]
> - Destructuring, spread and rest are one `...` in three positions: unpack, expand, collect
> - Object spread is a **shallow** copy — nested objects stay shared by reference (Lesson 6)
> - The immutable-update idiom is `{ ...prev, [key]: value }`; clone every level you change
> - Rest always sits last; defaults apply only to `undefined`
> - `const { id, ...rest } = props` filters props without mutation
> - Deep copies (`structuredClone`) belong at serialisation boundaries, not in every update

## Check your understanding

Answer these without looking back.

1. In one sentence each: destructuring, spread, rest.
2. Why does `{ ...original }` fail to isolate a nested change — and what's the fix?
3. Write the immutable update that changes `settings.theme` without touching anything else.
4. How do you strip `password` from a user object without mutating it?
5. When do defaults not apply in destructuring?

## What's Next

**Lesson 21 — Call Stack & Execution Contexts.** You cannot explain the event loop without
this — how JavaScript runs one thing at a time, and why a stack overflow is exactly what
the name says.
