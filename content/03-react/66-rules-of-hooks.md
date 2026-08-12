# Lesson 66 — Rules of Hooks (Internals)

**Interview importance:** ⭐⭐⭐⭐ — the "why can't hooks be conditional?" question, with the
linked-list answer.

Every rule in this lesson follows from one implementation fact: **hooks are a linked list
stored on the fiber, indexed by call order.** That single sentence explains why hooks can't
go in conditionals, loops, or early returns — because the index for "the third hook called"
would silently change meaning. The "why" line to remember: **hooks are a linked list indexed
by call order.**

## Learning Objectives

By the end of this lesson you should be able to:

- Draw the hooks linked list and show what a conditional call does to it
- Explain why call order, not names, identifies a hook
- State the two Rules of Hooks and the three situations that break them
- Name the ESLint rules that enforce them and what each one catches
- Answer the internals question at senior level — including the bailing-out subtlety

## 1. What are the Rules of Hooks?

**Two rules: only call hooks at the top level, and only call them from React functions —
and both exist to protect the call-order index.**

- **Rule 1 — top level only.** No loops, no conditions, no nested functions.
- **Rule 2 — React functions only.** Components or custom hooks (Lesson 65) — never plain
  JavaScript functions, because those have no fiber to attach a list to.

These aren't stylistic preferences. They're the *only* thing that keeps the linked list from
corrupting. Violate them and hooks read each other's state — usually crashing or silently
mixing data.

## 2. Mental Model

Think of a **train of train cars** — one car per hook, in the exact order you wrote them.

- Render 1 attaches: `useState` car, then `useEffect` car, then `useRef` car.
- Render 2 must attach the same cars in the same order. React walks the train car by car,
  matching them by position — it never looks at the label on the car.
- A conditional `if (x) useState()` means: on some renders the train has an extra car, on
  others it doesn't. From car 2 onwards, every hook matches the wrong car. The trains
  desync and state is read from the wrong slot.

The cars are not labeled with hook names — React only knows their position.

## 3. Visual Flow

The desync, drawn:

```text
   Render 1 (flag = true)          Render 2 (flag = false)
   ┌──────────────────────┐        ┌──────────────────────┐
   │ #1 useState(a)       │        │ #1 useState(a)       │   ✅ matches
   │ #2 useState(b)       │        │ #2 useState(b)       │   ✅ matches
   │ #3 if(flag) useState │        │    (skipped!)        │   ❌ removed
   │ #4 useEffect(c)      │        │ #4 useEffect(c)      │   💥 now reads b's slot
   └──────────────────────┘        └──────────────────────┘
         hook #4 matched the wrong memory slot:
         it reads the value that used to be #3's.
```

The moment one conditional call is skipped, **every hook after it** shifts to the wrong slot.
That's why the rules forbid the conditional in the first place — the list has no way to
"remember" that a slot was skipped.

## 4. How It Works

Hooks are not stored in variables or by name. They're a linked list of **hook nodes** stored
on the **fiber** (the per-component data structure behind every instance — Lesson 51). Each
node is a cell: `{ memoizedState, next }`.

```js
// Simplified — what React stores per component, not the real source:
const fiber = {
  memoizedState: {                    // head of the list
    memoizedState: 0,                 // the actual value (useState's [0, fn])
    next: {
      memoizedState: { done: false }, // the effect's queued update
      next: {
        memoizedState: 'light',       // the ref's .current
        next: null,
      },
    },
  },
};
```

`useState(0)`, `useEffect(…)`, `useRef('light')` → three nodes, in call order. During a
re-render, React walks this list in lockstep with the calls your component makes:

```js {6,12}
// During render, React roughly does this per hook call:
const node = currentHook;             // walk to the next node in the list
currentHook = node.next;              // advance the cursor
return createHookResult(node);        // give back the stored value + the setter
```

```narrate
6: React walks to the next node in the list — position by position.
12: There are no names anywhere; the position IS the identity of the hook.
```

There are no names anywhere. The **position** is the identity. This is also why hook state
survives re-renders: it isn't stored in the function (which is re-created each render — the
closures of Lesson 5); it lives on the fiber, keyed by call order.

> [!DEEPDIVE]
> React deviates from a plain linked list internally — the real implementation is a
> single-linked list stored on `fiber.memoizedState`, and the renderer walks it with a
> cursor as hooks are called. The model is exactly the picture above; the details (which
> fields are per-hook, when React advances or rewinds the cursor) are optimisations, not a
> different design.

## 5. Real Project Usage

The three ways real code breaks call order — and the fix for each:

```jsx
// ❌ 1. A conditional — the classic
function Bad({ enabled }) {
  const [a] = useState(0);
  if (enabled) {
    const [b] = useState(1);          // sometimes called, sometimes not
  }
  const [c] = useState(2);            // on "disabled" renders, c reads b's slot
}

// ❌ 2. A loop — the count of hooks changes between renders
function Worse({ count }) {
  const rows = [];
  for (let i = 0; i < count; i++) {
    rows.push(useState(i));           // hook count changes with count
  }
  return rows;
}

// ❌ 3. An early return before a hook
function AlsoBad({ loggedIn }) {
  if (!loggedIn) return <Login />;    // hooks below never run on this render
  const [user] = useState(null);      // next render with loggedIn=true shifts everything
}
```

All three have the same failure: the *number of hook calls* differs between renders, so the
walk desyncs. The fix for all three is the same too — **restructure to keep the hook count
fixed**:

```jsx
// ✅ conditional state → lift the condition, keep the call
function Good({ enabled }) {
  const [a] = useState(0);
  const [b] = useState(null);         // always called
  if (enabled) {
    // compute b from a — but never call a hook here
  }
  const [c] = useState(2);
}

// ✅ dynamic rows → one hook for the data, map in the render body
function Fixed({ count }) {
  const [rows, setRows] = useState([]);
  useEffect(() => { setRows([...Array(count)].map((_, i) => i)); }, [count]);
  return rows.map((r) => <Row key={r} value={r} />);
}
```

The key sentence: **hooks can't be skipped, so skip *inside* the data, not inside the hook
calls.** Conditionals and loops belong in JSX and plain code — never around a hook call.

### The ESLint rules

| Rule | Catches | Message shape |
|---|---|---|
| `react-hooks/rules-of-hooks` | Calls in loops, conditions, nested functions; calls from plain functions | "React Hook 'useState' is called conditionally" |
| `react-hooks/exhaustive-deps` | Dependency arrays missing values (Lesson 58) | "React Hook useEffect has a missing dependency" |

The first one is this lesson's rules, enforced mechanically. The second one is Lesson 58's
contract, and it exists for the same reason — stale closures are call-order bugs wearing a
dependency bug's clothes. Both ship in `eslint-plugin-react-hooks` and both run at lint
time, which is why a hook mistake shows up as a red squiggle before it becomes a runtime bug.

> [!TIP]
> The linter enforces *call order*, not *correct usage*. A hook in a conditional is a
> red squiggle; a hook with a wrong-but-present dependency array passes lint and misbehaves
> at runtime. Lint is a guardrail, not a correctness guarantee.

## 6. Interview Explanation

> "Hooks are a linked list of nodes stored on the fiber, matched by call order — not by
> name. Each render, React walks the list in lockstep with the hook calls the component
> makes. A conditional, loop, or early return changes the number of calls between renders,
> so from the break point onward every hook reads the wrong slot. The rules — top level only,
> React functions only — exist to keep that walk in sync, and the `eslint-plugin-react-hooks`
> rules enforce them."

## 7. Senior-Level Insights

- **The bailing-out subtlety.** React can skip re-rendering a component entirely (e.g. after
  a state update that returns the same value). When it does, *no hooks run* — and that's
  fine, because the call order didn't change, just the timing. The rules care about *order*,
  not about whether hooks run on every single render.
- **Why `useMemo` and `useCallback` are "rules-safe".** They're hooks too — they appear in
  the same linked list and follow the same call-order rules (Lesson 61/62).
- **The hook order is part of your component's API.** Adding a hook in the middle changes
  every index after it. Components that *don't* re-render can hold old lists — which is why
  the classic "conditional hook" bug sometimes doesn't crash immediately: it only corrupts
  when the count actually changes.
- **Hot Module Reloading and the list.** Dev tools that re-render a component with a
  different hook count reproduce the exact desync the rules prevent — knowing the model
  makes these "impossible" dev-mode bugs explainable.
- **"Hooks aren't magic"** is the senior close: same closures as Lesson 5, same pure
  functions as Lesson 14, storage on the fiber from Lesson 51, order as the key.

## 8. Common Mistakes

- **A hook after an early `return`** — silently skipped on some renders.
- **A hook inside `if` "just this once"** — the list has no memory of skipped slots.
- **A hook inside a loop** — the count changes with data.
- **A hook in an event handler or a plain callback** — there is no render phase, so the
  value lands in the wrong list (or corrupts the component's).
- **Deleting a hook in the middle of the list** — shifts every index after it, same bug as
  the conditional.
- **"It worked in dev"** — the corruption only bites when a render actually skips a call;
  code can run fine for a long time and explode on the first condition flip.

## 9. Best Practices

✅ Call hooks at the top level, unconditionally, in the same order every render

✅ Only call hooks from components or custom hooks (`use`-prefixed functions)

✅ Move conditions and loops *inside* hooks or into derived values (Lesson 55) — never around them

✅ Keep `eslint-plugin-react-hooks` on; treat both rules as build-breaking

✅ If you must vary behavior, use one hook and branch on the returned value

❌ Don't put hooks after an early return or inside a nested function

❌ Don't delete or reorder hooks without checking every render path

❌ Don't silence the lint rule — it's the automated version of this entire lesson

## 10. Interview Questions

**Q1. Why can't you call a hook inside a conditional?**

> Hooks are matched by call order, not by name. On a render where the conditional is false,
> that call is skipped, so every hook after it matches a different slot in the linked list.
> The component then reads the wrong state — the bug is order desync, and the rule prevents
> it at the source.

**Q2. How does React remember which hook is which?**

> It doesn't — there are no names. Each hook is a node in a linked list on the fiber, and
> React walks the list in lockstep with the calls. The position is the identity.

**Q3. What are the two Rules of Hooks?**

> Only call hooks at the top level — no conditions, loops, or nesting. And only call them
> from React functions — components or custom hooks — because plain functions have no fiber
> and no render phase to attach a list to.

**Q4. What do the ESLint rules do?**

> `react-hooks/rules-of-hooks` enforces call order and call site — it's this lesson as lint.
> `react-hooks/exhaustive-deps` enforces dependency arrays (Lesson 58). Both are part of
> `eslint-plugin-react-hooks`.

**Senior follow-up: If hooks are identified by order, how does a component that bails out of a re-render keep its state?**

> The bailout skips the walk entirely — no hooks run, but the list is untouched, so nothing
> desyncs. The rules care about *order*, not about running hooks on every render. Skipping a
> render is safe; skipping a hook call mid-render is not.

## 11. Follow-up Questions

**Can custom hooks break the rules?**

> Yes — a custom hook that calls a hook conditionally breaks the rules exactly like a
> component does, because it's part of the same render-phase walk. The `use` prefix is what
> tells the linter to check it (Lesson 65).

**Why does the linter flag a hook called from a plain function even if it works?**

> It "works" until it collides — a plain function's hooks would join the caller's list at
> unpredictable positions. The rules exist to prevent corruption that only shows up later.

**Does hook order matter for `useMemo` and `useCallback`?**

> Yes, they're hooks — same list, same rules. What changes with order is *which slot they
> read*, which is why their dependency arrays matter (Lessons 61–62).

## 12. Comparison Table

| | Inside a conditional/loop | Top level | Plain function |
|---|---|---|---|
| Hook call allowed? | ❌ | ✅ | ❌ |
| What breaks | Index desync — wrong slot reads | Nothing | No fiber to attach to |
| Detected by | `rules-of-hooks` lint | — | `rules-of-hooks` lint |
| Real-world symptom | Wrong state, crashes after the condition flips | — | State corrupted across calls |

## 13. Code Example

```js
// The desync, simulated with plain arrays — the same shape React's list has.
// A "render" walks the list in call order; a skipped call shifts the rest.

function render(hookList, called) {
  let cursor = 0;
  const result = [];
  for (const shouldCall of called) {
    if (shouldCall) {
      result.push(hookList[cursor]);   // read the slot for THIS call position
      cursor += 1;                     // advance to the next node
    }
    // if not called: cursor does NOT advance — every later hook misreads
  }
  return result;
}

const list = ['a', 'b', 'c'];          // the fiber's linked list, by position

console.log(render(list, [true, true, true]));   // all three called: clean walk
console.log(render(list, [true, false, true]));  // b skipped: c reads b's slot
```

Output:

```text
[ 'a', 'b', 'c' ]
[ 'a', 'b' ]
```

First row: the correct walk. Second row: `b` is skipped, so the third call — which is really
`c` — reads `b`'s slot. The same `list`, the same code, different meaning. That is exactly
what happens in a component when a hook goes conditional, and it's why the rule is absolute.

## 14. Performance Notes

- The linked list itself is cheap — a pointer walk per hook per render. The rules aren't a
  performance concern; they're a correctness one.
- **`useMemo`/`useCallback` memoization depends on the walk too** — a stable slot is what
  lets the cached value survive renders (Lesson 61/62). Desync breaks caching before it
  breaks anything else.
- **Bailouts are free** — when React skips a render, the list just isn't walked. The rules
  don't forbid bailing out; they forbid *partial walks*.

## 15. Debugging Scenarios

**Scenario 1 — "State is `undefined` or wrong after a condition flips"**

A hook is conditional and the flip skipped a call. Fix: restructure so every hook call runs
unconditionally, then check the lint output — `rules-of-hooks` names the exact line.

**Scenario 2 — "Lint error: 'React Hook is called conditionally'"**

Exactly the desync above, caught before runtime. Fix the structure, don't suppress the rule.

**Scenario 3 — "Hook works in dev, breaks in prod"**

Both dev and prod enforce the walk; the difference is usually a condition whose value differs
across environments (e.g. an early return gated on an env flag). Reproduce with that flag
and apply the unconditional-call fix.

**Scenario 4 — "Deleting a hook fixed a crash, then another crash appeared"**

Removing a hook mid-list shifted every index after it. The first crash was the desync; the
second is the shifted state. Fix the root cause — call count must be stable across renders.

## 16. Quick Revision Notes

- Hooks are a linked list on the fiber, indexed by call order — no names anywhere
- Rule 1: top level only (no conditions, loops, nested functions)
- Rule 2: components or custom hooks only (no plain functions)
- Skipping one call shifts every hook after it to the wrong slot
- The ESLint pair: `rules-of-hooks` (order/site) and `exhaustive-deps` (dep arrays, Lesson 58)
- The fix is always the same: keep the call count fixed; move conditions into data/JSX

## 17. Cheat Sheet

```text
Hook list (per component instance, on the fiber):
  useState ──▶ useEffect ──▶ useRef ──▶ useMemo ──▶ …
    ▲             ▲            ▲          ▲
    └────── all matched by POSITION, every render ──────┘

Two rules:
  1. Call hooks at the top level — no conditions, loops, or nesting
  2. Call hooks only from components or custom hooks

The desync:
  Render 1:  #1 #2 #3 #4
  Render 2:  #1 #2    #4   ← #4 now reads #3's slot

Lint:
  react-hooks/rules-of-hooks      → order + call site
  react-hooks/exhaustive-deps     → dependency arrays
```

## 18. Key Takeaways

> [!RECAP]
> - Hooks are a linked list on the fiber, matched by call order — never by name
> - A skipped hook call shifts every hook after it to the wrong slot: the root bug
> - Rule 1: top level only. Rule 2: React functions only
> - The `use` prefix (Lesson 65) is what lets the linter enforce both rules
> - Bailing out of a render is safe — the list just isn't walked; partial walks are not
> - The fix is structural: keep call count fixed, move conditions into data and JSX

## Check your understanding

Answer these without looking back.

1. Draw the linked list for `useState` + `useEffect` + `useRef` and label each node.
2. What exactly changes when a conditional hook is skipped? Why does the corruption extend *after* the skip?
3. State both Rules of Hooks and one realistic violation each.
4. Why can't a plain JavaScript function call hooks — what's missing?
5. Which two ESLint rules enforce this lesson, and what does each one catch?
6. Why is a render bailout safe even though "hooks sometimes don't run"?

## What's Next

**Lesson 67 — React.memo.** Shallow prop comparison — and when it makes things measurably
slower. The first tool in the performance module, and the natural partner to the
reconciliation model you've now built.
