# Lesson 54 — Controlled vs Uncontrolled Forms

**Interview importance:** ⭐⭐⭐⭐⭐ — named directly in most React interviews, and in every real product.

There is no form question that survives contact with the words "controlled component". The
distinction is tiny — who owns the input's current value — and everything else in this lesson
falls out of it. Lesson 50 gave you the state side (`useState` and its async updates); Lesson 53
gave you events. A controlled input is just the two bolted together.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the controlled/uncontrolled distinction in one sentence
- Build both versions, including a `ref`-based uncontrolled input
- Say exactly why controlled wins for validation, and what uncontrolled is for
- Debug the "input won't type" failure in thirty seconds
- Compare the two on read, sync, validation, and cost

## 1. One-Line Definition

**A controlled input's value is owned by React state; an uncontrolled input's value is owned by the DOM.**

That's the whole lesson. Controlled means *value + onChange* — state is the single source of
truth and every keystroke goes through a re-render. Uncontrolled means the input keeps its own
value in the DOM and React never looks at it until you ask.

## 2. Mental Model

Think of two filing systems for the same field.

- **Controlled:** the form keeps a master copy of every value; the input is just a window
  onto that copy. If the master copy doesn't change, the window can't — type all you want.
- **Uncontrolled:** the input *is* the copy. React doesn't hold one, so the field works on
  its own, and you reach into the DOM to read or set it when you need to.

One boss per value, is the rule to remember. A controlled input has exactly one boss (state);
an uncontrolled input has one too (its own DOM node). The bugs in this lesson are all "two
bosses" mistakes.

## 3. Visual Flow

```text
Controlled:
  user types "a"
        │
        ▼
  onChange("a")           input's value is PROPS (state)
        │                      │
        ▼                      │
  setValue("a")                │
        │                      │
        ▼                      │
  re-render ──► value="a" ◄────┘   state is the source of truth

Uncontrolled:
  user types "a"
        │
        ▼
  DOM input.value = "a"          React never re-renders
        │
        ▼
  you call ref.current.value only when you need it
```

Controlled is a circle: type → handler → state → render → input. Uncontrolled is a dead end:
the value changes in the DOM and nothing else happens until you read it.

## 4. How It Works

The two sides of the same input.

```jsx {4}
function ControlledName() {
  const [name, setName] = useState('');

  return (
    <input value={name} onChange={(e) => setName(e.target.value)} />
  );
}
```

The `value` prop makes React the owner. When the browser edits the DOM, React immediately
rewrites it from state on the next render — so the input can't hold a value state doesn't know
about. `onChange` fires on every keystroke (it is React's synthetic `input` event, Lesson 53),
and that is the *only* way the value moves.

Uncontrolled, same field:

```jsx {4}
function UncontrolledName() {
  const ref = useRef(null);

  return <input ref={ref} defaultValue="guest" />;
}
```

`defaultValue` seeds the field once, on mount. After that the input owns its value and React
stays out of the way. Reading it later is `ref.current.value`.

> [!NOTE]
> `defaultValue` (not `value`) is the uncontrolled prop. Pass `value` without `onChange` and
> React treats it as controlled-but-readonly — typing does nothing. That "frozen input" is the
> most common controlled/uncontrolled bug in the wild, and we come back to it in Section 8.

## 5. Real Project Usage

Validation is the controlled killer app, because a controlled input gives you a **live value
with zero extra reads** — you derive everything else from the same state that's already
rendering.

| Feature | Controlled | Uncontrolled |
|---|---|---|
| Read the value | it's state, already in scope | `ref.current.value` |
| Validate per keystroke | derive from the same state | listen, store, re-read — now you're controlled |
| Sync two fields | both read the same state | keep refs in sync by hand |
| Disable submit | `disabled={!valid}` | read every ref on submit |
| Reset a form | set the state to `''` | call `form.reset()` or re-mount |
| File inputs | **cannot** be controlled | the only `value` you never read |

The last row is the honest carve-out: `<input type="file">`'s value is set by the OS and read-only
to React, so it's uncontrolled whether you like it or not. You pass a `ref` and read
`files` in your submit handler.

## 6. Interview Explanation

> "A controlled input stores its value in React state and updates it through `onChange`; the
> input renders whatever state holds. An uncontrolled input keeps its value in the DOM, seeded
> once with `defaultValue`, and you read it through a ref. I default to controlled because
> validation and cross-field logic are just derived from state — uncontrolled stays for file
> inputs and the rare third-party widget that manages its own DOM."

## 7. Senior-Level Insights

The question is never *which one is better* — it's *who owns this value, and does anyone else
need it?*

- **Ownership rule of thumb.** A field nobody else reads is a candidate for uncontrolled. The
  moment validation, a submit payload, or a sibling needs the value, it must be owned somewhere
  React can see it — usually that means controlled.
- **Don't skip the form.** Form libraries (`react-hook-form`, `Formik`) are not a third
  category: they are opinionated wrappers that make controlled values cheap. Knowing that
  reframes "which library" as "which ownership model".
- **Know the escape hatches.** If uncontrolled, `form.reset()` and re-mounting (a `key` change)
  are the two sanctioned resets; if controlled, reset is `setState('')`.
- **Rendering cost is rarely the argument.** Section 14 says the size of the win: for most
  forms it's nil. Say "I could use uncontrolled here and re-render on submit — but then
  validation runs a render late and every feature reads through refs".

## 8. Common Mistakes

The frozen input — `value` without `onChange`:

```jsx
<input value={name} />   // ❌ types once, then the DOM edit is overwritten — input is dead
```

The fix is the other half of the pair:

```jsx
<input value={name} onChange={(e) => setName(e.target.value)} />
```

Mistaking `defaultValue` for a fallback. It seeds the *uncontrolled* input once, on mount. If
state later changes, `defaultValue` doesn't follow it — the DOM value stays:

```jsx
<input defaultValue={savedName} />   // ❌ savedName changes → input keeps its old text
```

That's the same trap from the other side: two sources of truth, one of them stale. The
cheat-sheet rule handles every case — read the value from **state** (controlled) or **the DOM**
(uncontrolled), never both.

## 9. Best Practices

✅ Default to controlled — `value={x} onChange={...}` — for anything the app needs to read

✅ Derive validation from the same state: `const valid = email.trim().length > 0`

✅ Use `defaultValue` + a ref when the value is only needed on submit

✅ Leave file inputs uncontrolled and read `ref.current.files`

✅ Disable the submit button off derived state, not by re-reading inputs

❌ Don't pass `value` without `onChange` — that's a frozen input, not an optimization

❌ Don't keep a duplicate `useState` mirror of an input you're controlling; there's already one source of truth

## 10. Interview Questions

**Q1. What is the difference between a controlled and an uncontrolled component?**

> A controlled component gets its value from props — in a form, `value` plus `onChange` wired
> to state — so React renders exactly what state holds. An uncontrolled component keeps its
> value in the DOM, seeded with `defaultValue`, and I read it through a ref.
>
> The tell: does typing go through a re-render? Controlled, yes. Uncontrolled, no.

**Q2. Why would you prefer a controlled form?**

> Because the value is already in React state, validation and cross-field rules become derived
> state (Lesson 55) — compute them in render instead of syncing anything. That removes a whole
> class of "form says one thing, state says another" bugs.

**Q3. When would you use an uncontrolled form?**

> When React doesn't need the value until submit — a search box that only navigates — and
> always for file inputs, whose value React can't own. Also, occasionally, for a third-party
> component that manages its own DOM and would fight a controlled value.

**Q4. What does `defaultValue` do?**

> It seeds an uncontrolled input's DOM value once, on mount. It is not a dynamic value: it
> doesn't update when the prop changes, and React doesn't read the input afterward. That's why
> the controlled prop is `value`, and the uncontrolled one is `defaultValue`.

**Senior follow-up: What happens if you pass `value` but no `onChange`?**

> React treats the input as controlled with no way to update: the first keystroke edits the
> DOM, the next render writes the prop back, and the input appears frozen. It's the classic
> bug, and the fix is to add the handler — or switch to `defaultValue` if you genuinely wanted
> uncontrolled.

## 11. Follow-Up Questions

**Q. How do you reset a controlled form?**

> By resetting the state — every field renders from state, so one `setState` pass clears the
> whole form. That's the payoff of a single source of truth.

**Q. Why can't you control a file input?**

> Because the browser sets its value from the file picker and forbids scripts from writing it.
> React can't render a value into it, so there's nothing to control — you read
> `ref.current.files` instead.

**Q. How do you read an uncontrolled value in a submit handler?**

> From the ref: `const name = nameRef.current.value`. If you find yourself storing that in
> state to share it, you've just rebuilt a controlled input — stop and make it controlled.

## 12. Comparison Table

| | Controlled | Uncontrolled |
|---|---|---|
| Value source | React state (props) | the DOM node |
| Read it | already a variable | `ref.current.value` |
| Write it | `setState` → re-render | `ref.current.value = x` (manual) |
| Default value | `value` initialised in state | `defaultValue` |
| Re-render per keystroke | yes | no |
| Validation | derived from state | needs an event + stored state anyway |
| Reset | one `setState` | `form.reset()` / re-mount |
| File inputs | impossible | required |
| Use when | the app needs the value | only you, at submit, does |

## 13. Code Example

A small signup form, controlled throughout, with live validation:

```jsx
import { useState } from 'react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const valid = email.includes('@') && password.length >= 6;

  function submit(e) {
    e.preventDefault();                    // Lesson 53 — don't reload the page
    console.log('submitting', { email, password });
  }

  return (
    <form onSubmit={submit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button disabled={!valid}>Sign up</button>
    </form>
  );
}
```

```text
typing "a@b" + "secret1"  →  valid: false … false … true  →  button enabled
submit                    →  console: submitting { email: 'a@b', password: 'secret1' }
```

No refs, no listeners, no syncing. `valid` is derived from the same state that renders the
inputs (the exact pattern Lesson 55 formalises), and `disabled` falls out of it.

## 14. Performance Notes

Controlled forms re-render the form on every keystroke. The honest number: for a handful of
inputs that cost is noise — React's reconciliation (Lesson 51) is the thing that keeps it that
way. It only starts mattering with dozens of controlled fields per screen, and even then the
fix is usually moving the field into its own component so the keystroke re-render is isolated,
not switching to uncontrolled.

Uncontrolled skips those re-renders entirely, which is why input-heavy third-party widgets
stay uncontrolled. But "fewer re-renders" is not a reason to abandon controlled: measure first,
scope the re-render second. Validation that runs a render late — because the value only
reaches state on submit — is a correctness cost, not a performance win.

## 15. Debugging Scenarios

**"I can type once, then the input is dead."** `value` without `onChange`. React re-renders
after the edit and overwrites the DOM with the old prop. Fix: add the handler, or switch to
`defaultValue` if you meant uncontrolled.

**"The field shows the saved value on load, but stops following it."** `defaultValue` + state
you expected to sync. `defaultValue` seeds once and never re-applies. If the value must track
props, control it: `value={savedName} onChange={...}`.

**"Two fields that should match don't."** Each field owns its own state. Derive one from the
other, or lift the shared value (Lesson 55).

**"Submitting shows stale values."** You're reading refs you set on an earlier render, or the
submit handler closed over old state (Lesson 5). Read `ref.current` at submit time, or keep
the value in state so the handler always sees the current render's value.

## 16. Quick Revision Notes

- Controlled = `value` + `onChange`; the input renders what state holds
- Uncontrolled = `defaultValue` + ref; the DOM owns the value
- One source of truth per field — state or DOM, never both
- Validation, disable, and cross-field logic are derived state — controlled gives you that free
- File inputs are always uncontrolled
- Frozen input = `value` with no `onChange`; stale field = `defaultValue` you expected to follow props
- Per-keystroke re-renders are fine until you've measured otherwise

## 17. Cheat Sheet

```jsx
// controlled — value + onChange, state is the source of truth
const [email, setEmail] = useState('');
<input value={email} onChange={(e) => setEmail(e.target.value)} />

// uncontrolled — defaultValue seeds once, ref reads later
const emailRef = useRef(null);
<input ref={emailRef} defaultValue="a@b.com" />
const email = emailRef.current.value;   // at submit time

// derive, don't store (Lesson 55)
const valid = email.includes('@');      // computed in render, not synced

// reset
setEmail('');                            // controlled
formRef.current.reset();                 // uncontrolled (or re-mount with a new key)

// file input — always uncontrolled
const fileRef = useRef(null);
<input type="file" ref={fileRef} />
const [file] = fileRef.current.files;
```

## 18. Key Takeaways

> [!RECAP]
> - Controlled: `value` + `onChange` — React state is the source of truth, typing re-renders
> - Uncontrolled: `defaultValue` + ref — the DOM owns the value, React reads it on demand
> - One boss per value; the frozen input is `value` with no `onChange`
> - Validation is derived state, which is exactly what controlled gives you
> - File inputs are always uncontrolled
> - Per-keystroke re-renders are noise until measured

## Check your understanding

Answer these without looking back.

1. In one sentence, what makes an input controlled?
2. What prop seeds an uncontrolled input, and why does it not update later?
3. Walk through what happens in the DOM and in React when a user types one character into a controlled input.
4. Give two concrete things controlled gives you that uncontrolled doesn't.
5. Why can a file input never be controlled?
6. Your colleague's input freezes after the first keystroke. Diagnose it in one sentence.

## What's Next

**Lesson 55 — Derived State & Lifting State.** Where `valid` above came from, and the rule
that "state that can be computed from other state isn't state at all".
