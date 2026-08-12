# Lesson 55 — Derived State & Lifting State

**Interview importance:** ⭐⭐⭐⭐ — most "state is out of sync" bugs are state that should have been derived.

Lesson 50 introduced state, Lesson 54 used it in forms. This lesson is about the two questions
that separate a solid React dev from a shaky one: **which values deserve state at all**, and
**where state should live**. The first is answered by deriving in render instead of syncing in
effects; the second by lifting state to the closest common parent.

## Learning Objectives

By the end of this lesson you should be able to:

- Recognise state that is really derived data, and compute it in render instead
- Explain why "state and derived value get out of sync" is an impossible bug when you don't store the derived value
- Lift state between siblings to the closest common parent
- Pass state down as props and changes back up as callbacks — one direction
- Spot the "state that should have been derived" bug in an interview snippet

## 1. One-Line Definition

**Derived state is a value computed from other state during render — never stored. Lifting state is moving state up to the closest common parent so siblings can share it.**

Both rules are the same instinct: **one copy of the truth**. Derived state stops you keeping a
second copy. Lifting state stops two siblings each keeping their own.

## 2. Mental Model

- **Derived state** is a spreadsheet: the "Total" cell is a formula over other cells, not a
  value you type in. If you typed a total and also had a formula, the two would drift apart —
  so the spreadsheet only has the formula.
- **Lifting state** is the office whiteboard. Two teammates each keeping their own count is
  how the numbers diverge. One shared whiteboard, updated by everyone, read by everyone. The
  whiteboard is the closest common parent.

## 3. Visual Flow

```text
DERIVED — compute, don't copy
  state: { items: [...], filter: 'done' }
              │                      │
              ▼                      ▼
  derived: items.filter(...)    derived: items.length
  (computed in render — zero sync, cannot go stale)

LIFTED — shared between siblings
        Counter (owner)
        ┌──────┬──────┐
        │      │      │
        ▼      ▼      ▼
     Button  Button  Display
     (props) (props) (props)
   both buttons call the same callback passed from Counter
```

## 4. How It Works

### Derived state: compute in render

If a value can be computed from state that already exists, it is not state. The rule that
produces the buggy version first:

```jsx {5}
function FilteredList({ items, filter }) {
  const [visible, setVisible] = useState(items);   // ❌ a second copy of the truth

  useEffect(() => {
    setVisible(items.filter((i) => i.status === filter));  // ❌ syncing by hand
  }, [items, filter]);

  return <ul>{visible.map((i) => <li key={i.id}>{i.name}</li>)}</ul>;
}
```

That is state and effect glued together to recreate the same filtering you could just do in
render. Two copies exist; an effect keeps them in sync; every async render glitch in this
component is this pattern. Delete both lines and compute instead:

```jsx {2}
function FilteredList({ items, filter }) {
  const visible = items.filter((i) => i.status === filter);  // ✅ derived, in render

  return <ul>{visible.map((i) => <li key={i.id}>{i.name}</li>)}</ul>;
}
```

`visible` is recomputed on every render, so it can never disagree with `items` and `filter`.
There is nothing to sync because there is nothing stored. The only cost — re-running a filter
per render — is exactly what reconciliation already pays, and `useMemo` (Lesson 61) is the
tool if it ever measurably hurts.

> [!TIP]
> `filter` is a prop in this example. The same rule holds when it's state — the filter lives
> in state (it's typed by the user), the *filtered list* is derived from it (nobody types a
> list, they type a filter).

### Lifting state: the closest common parent

Two siblings that need the same value must not each own a copy. State moves up to their
closest common parent, which owns it, passes the value **down as props**, and passes change
requests **up as callbacks**:

```jsx {3,13}
function Counter() {
  const [count, setCount] = useState(0);         // owned here — the only copy

  return (
    <>
      <Increment onAdd={() => setCount(count + 1)} />
      <Display value={count} />
    </>
  );
}
```

`Increment` calls the prop; the parent updates; `Display` re-renders from the new prop. Siblings
never talk to each other directly — they talk through the parent, which is exactly why "lifting"
is the whole technique. With `useReducer` (Lesson 64) the change requests become `dispatch`
actions, but the shape — one owner, one direction — is identical.

## 5. Real Project Usage

The form from Lesson 54 is the classic lift: a submit button and an input are siblings, and the
button's `disabled` needs the input's value. The input stays controlled (state owned by the
form), and `valid` is **derived** from that state. Notice the pattern composes — derived state
is just a function of state, and lifting is just deciding where state lives:

```jsx {6,12}
function SignupForm() {
  const [email, setEmail] = useState('');          // owned here — the only copy
  const [password, setPassword] = useState('');

  const valid = email.includes('@') && password.length >= 6;   // derived, not stored

  return (
    <form>
      <EmailField value={email} onChange={setEmail} />
      <PasswordField value={password} onChange={setPassword} />
      <button disabled={!valid}>Sign up</button>                 // reads derived value
    </form>
  );
}
```

Every "in sync" flag in a real app — `isValid`, `remaining`, `filtered`, `total` — should be
a question to ask: *can this be computed from state that already exists?* If yes, it's derived.

## 6. Interview Explanation

> "Two rules keep state honest. First, if a value can be computed from state that already
> exists, compute it in render instead of storing it — stored copies are what go out of sync,
> and an effect that re-syncs them is a second bug on top of the first. Second, when two
> siblings need the same value, lift it to their closest common parent and pass it down as a
> prop, with a callback to change it. State flows down, events flow up — one copy of the truth."

## 7. Senior-Level Insights

- **Name the smell.** The classic interview tell is `useEffect` whose only job is to copy a
  prop or another piece of state into `useState`. Say the words: *"you don't need state here,
  you need derived data"* — that sentence is the answer to most "state is out of sync"
  prompts.
- **`useMemo` is a performance tool, not a correctness tool.** It caches a *derived value*; it
  never turns derived data into state. Saying "I'd add `useMemo` if the derivation got
  expensive, but it changes nothing about correctness" lands better than reaching for it.
- **Lifting is the parent of bigger patterns.** Context (Lesson 63) and stores like Redux
  exist because lifting gets awkward past a few levels — but they are *shared* state, and the
  one-direction data flow from this lesson is still the rule inside them.
- **Only state the user or the app truly owns.** Server data, URL params, form fields that
  need live validation — those are state. Almost everything derived from them is not.

## 8. Common Mistakes

The "second copy" bug — storing something you can compute, then syncing it:

```jsx
const [fullName, setFullName] = useState('');              // ❌ stored
useEffect(() => setFullName(`${first} ${last}`), [first, last]);  // ❌ sync

const fullName = `${first} ${last}`;                       // ✅ derived — zero sync
```

Prop copied into state (the "derived state anti-pattern" in the React docs):

```jsx
function Profile({ user }) {
  const [name, setName] = useState(user.name);   // ❌ state forks from the prop
```

Unless the form genuinely edits `name` and saves it later, that `useState` is a second copy
that stops following `user`. If the component must allow local editing that later commits
upward, the honest shapes are a `key`-based remount (see cheat sheet) or fully controlled
parent-owned state — not a silent mirror.

Forgetting the callback half of lifting:

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return <Increment count={count} />;   // ❌ value down, but no way to change it
}
```

The sibling that needs to *change* the value needs a function prop, not just the value.

## 9. Best Practices

✅ Derive everything computable in render — `const visible = items.filter(...)`

✅ Keep exactly one copy of every value: state for the truth, derived for everything else

✅ Lift to the closest common parent — state flows down as props, changes flow up as callbacks

✅ Keep derived values next to the state they're derived from, named for what they are

✅ Give `setCount`-style setters directly as callbacks (`onChange={setEmail}`) when the shape matches

❌ Don't mirror props or state into `useState` and re-sync with `useEffect`

❌ Don't put "totals" or "filtered lists" in state — those are derived values

## 10. Interview Questions

**Q1. What is derived state?**

> A value computed from other state during render instead of stored in its own state. If it
> can be calculated from state that already exists, it isn't state — it's a formula. That
> removes the entire class of "state out of sync" bugs, because there's nothing to sync.

**Q2. What does lifting state up mean?**

> Moving state to the closest common parent of the components that need it. The parent owns
> the state and passes it down as props; children call a callback to request a change, and
> the parent updates. Siblings never talk to each other — they share through the parent.

**Q3. Why is it a problem to copy a prop into local state?**

> Because now two copies exist, and they diverge the moment the prop changes. The copy is
> frozen at mount time, which produces stale UIs. Either use the prop directly, or derive
> from it in render — don't mirror it into state.

**Q4. When should state be lifted?**

> When two or more components need the same value, or when changing it in one place must be
> visible in another. The litmus test: is more than one component reading it, or writing it?
> Then it belongs in their common parent.

**Senior follow-up: How would you fix a `useEffect` that syncs one piece of state into another?**

> Delete the sync. The value being copied is derived, so compute it during render and drop the
> copied state entirely. If the effect is doing real work — fetching, subscribing — that's
> different, but an effect whose only job is copying state into state is the anti-pattern.

## 11. Follow-Up Questions

**Q. Does derived state recompute on every render? Is that slow?**

> Yes, and usually that's fine — reconciliation already re-runs the render, and the derived
> calculation is typically cheaper than the diff it feeds into. If profiling shows it matters,
> `useMemo` caches the result; it's an optimisation, not a correctness change.

**Q. What's the difference between lifting state and using Context?**

> Lifting is explicit: one owner, props down, callbacks up. Context shares state implicitly
> across a tree, but it doesn't make the ownership model simpler — and anything in context
> re-renders its consumers. Lift first; introduce Context (Lesson 63) when prop drilling gets
> noisy, not as a default.

**Q. Can derived state update when the source changes?**

> It's recomputed on every render, so it always reflects the current source — that's the whole
> point. It doesn't "update" in the state sense; it's recalculated, which is what keeps it
> correct.

## 12. Comparison Table

| | Stored state | Derived value |
|---|---|---|
| Source | the thing the user/app owns | other state or props |
| Stored where | `useState` | computed in render |
| Can go stale | yes, if a second copy exists | no — recomputed every render |
| Sync needed | effects, event handlers | never |
| Example | `items`, `filter`, `email` | `visible = items.filter(...)`, `valid` |
| Reset | `setState` | nothing to reset |
| Performance | — | `useMemo` if it ever measurably hurts |

## 13. Code Example

A runnable version of both rules — derive *and* lift — in plain JS:

```js
// LIFTED: `total` lives here, in the shared parent, and flows down as props.
function Cart() {
  const items = [{ price: 10 }, { price: 25 }, { price: 5 }];
  const [qty, setQty] = [3, () => {}]; // simplified: one value, no re-renders here

  return { items, qty, total: items.map((i) => i.price * qty).reduce((a, b) => a + b, 0) };
}

// DERIVED: `total` is computed from items, never stored, never synced.
function totalOf(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

const items = [{ price: 10 }, { price: 25 }, { price: 5 }];

// one source of truth: the items array. Everything else is derived.
console.log('total =', totalOf(items));
console.log('count =', items.length);
console.log('first =', items[0].price);
```

Output:

```text
total = 40
count = 3
first = 10
```

The React version is the same shape wearing JSX — state lives in the parent, siblings receive
it as props, and every "computed" number is a formula, so there is nothing left to go out of
sync.

## 14. Performance Notes

The cost of deriving is re-running a computation per render. For filters, formatting, and
`valid` flags that cost is tiny next to the reconciliation (Lesson 51) that follows — this is
a correctness pattern that happens to be cheap. `useMemo` (Lesson 61) exists for the rare case
where the derivation is genuinely heavy, and it only changes caching, never correctness.

The state you *don't* create is the bigger win: no `useState`, no effect, no setState, no
second render to apply the sync. Removing a stored copy usually removes an entire extra render
pass along with it.

## 15. Debugging Scenarios

**"The UI shows one value but state holds another."** You're reading a stored copy that a
`useEffect` was supposed to keep fresh — one render behind, or frozen since mount. Delete the
copy and derive the value in render; the bug disappears with it.

**"Sibling A updates, sibling B shows the old value."** They each own state. Lift the value to
their common parent, pass it down to both, and give the updater a callback (Section 4).

**"The component ignores new props."** It copied props into `useState` at mount. The props
changed, the copy didn't. Use the prop directly or derive from it.

**"Everything re-renders when I type one character."** That's controlled forms doing their
job (Lesson 54). If it's measurably slow, scope the state to the field's own component — not
by switching the field to uncontrolled and losing validation.

## 16. Quick Revision Notes

- Derived = computed from state in render; stored copies are what go stale
- "State that can be computed from other state isn't state at all"
- An effect whose only job is copying state into state is the anti-pattern — delete it
- Lift to the closest common parent: value down as props, changes up as callbacks
- Siblings never talk to each other — they share through the parent
- One copy of the truth, everywhere
- `useMemo` caches a derived value; it doesn't make derived state into state

## 17. Cheat Sheet

```jsx
// derive, don't store
const visible = items.filter((i) => i.status === filter);   // in render, no useState
const valid = email.includes('@') && password.length >= 6;

// lift — parent owns
function Counter() {
  const [count, setCount] = useState(0);                    // the only copy
  return (
    <>
      <Increment onAdd={() => setCount((c) => c + 1)} />
      <Display value={count} />
    </>
  );
}

// remount-to-reset: give the component a fresh key, not a mirror
<ProfileEditor key={user.id} user={user} />                 // props only, state resets on key change
```

## 18. Key Takeaways

> [!RECAP]
> - If a value can be computed from state that already exists, it is derived, not state — compute it in render
> - Stored copies are what go stale; the "state is out of sync" bug is a stored copy you forgot to sync
> - An effect that copies state into state is the anti-pattern to name and delete
> - Lifting = closest common parent owns; value down as props, changes up as callbacks
> - Siblings communicate through the parent, one direction at a time
> - One copy of the truth is the whole discipline

## Check your understanding

Answer these without looking back.

1. When is a value derived state instead of state?
2. Why can a derived value never be "out of sync" with its source?
3. Your colleague wrote `useState(items)` plus an effect that re-syncs it. What do you tell them?
4. Two sibling components need the same count. Where does the state go, and how do they read and change it?
5. What's the difference between lifting state and Context?
6. Spot the bug: a component copies `props.user.name` into `useState` and the UI never updates when the user changes. Fix it.

## What's Next

**Lesson 56 — The Virtual DOM.** You now know exactly what re-renders and what derives — next:
what React *does* with all of it, and why it is not automatically "fast".
