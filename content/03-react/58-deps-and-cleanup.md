# Lesson 58 — Dependency Arrays & Cleanup

**Interview importance:** ⭐⭐⭐⭐⭐ — reference equality meets hooks. This is where
Lesson 6 pays off.

Every `useEffect` question eventually becomes a dependency-array question, and every
dependency-array question eventually becomes a reference-equality question. If you can say
what `Object.is` does to an object literal, you can answer half of React interviews.

The other half is cleanup: not what it's for, but *when exactly* it runs. This lesson makes
both precise enough to say out loud without pausing.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what React does to your dependency array on every render
- List what belongs in deps, and what deliberately doesn't
- Say why an object or array in deps re-runs the effect forever (Lesson 6)
- Predict exactly when cleanup runs in any sequence of renders
- State the three `react-hooks` lint rules and why each exists
- Decide when one effect should become two

## 1. One-line definition

**The dependency array is a list of values the effect reads, compared with `Object.is`
against the previous render's list — and cleanup is a function React calls to undo the
previous effect run before the next one starts.**

## 2. Mental model

The dependency array is a *shopping list*, not a *latch*. It answers one question on every
commit: "did any of these things change?" If yes, buy — run the effect. If no, skip. It
never remembers what you *wanted* it to do; it only compares.

Cleanup is the *empty the sink* step. Every time you cook (run the effect), the sink fills
with dishes (subscriptions, timers, listeners). Before you cook again, the sink must be
empty — and on the way out of the kitchen, it must be empty too. React is the one enforcing
both.

## 3. Visual flow

```text
commit happens
      │
      ▼
compare deps[i] with previous deps[i]  —  Object.is, element by element
      │
      ├── all equal ────────────▶ skip effect body entirely
      │
      └── any changed
              │
              ▼
        run cleanup()      ← undo the PREVIOUS run (also on unmount)
              │
              ▼
        run effect body()  ← capture this render's values
```

Two things to notice: the comparison happens on **every commit**, not just when something
changes, and the cleanup always runs *before* the new body — never after. That order is
what makes subscriptions, timers and fetches safe to redo.

## 4. How it works

React stores the previous dependency array on the fiber, one per hook slot. On each commit
it compares element-by-element with `Object.is`:

```js
// what React does to your array, every render
function depsChanged(prevDeps, nextDeps) {
  if (prevDeps === null) return true;                 // first mount — always run
  if (prevDeps.length !== nextDeps.length) return true;
  return nextDeps.some((d, i) => !Object.is(d, prevDeps[i]));
}
```

That's the entire mechanism. Three properties fall out of it:

1. **`Object.is`, not `===`** — `Object.is(NaN, NaN)` is `true`, `Object.is(-0, 0)` is
   `false`. For the values you put in deps, it behaves like `===`.
2. **First mount always runs** — `prevDeps` is `null`, so the comparison can't even
   happen. This is the "runs once" every candidate leans on (Lesson 57).
3. **References, not contents** — for objects and arrays, `Object.is` compares identity.
   Same contents, different reference, *changed*.

The lint rules in Section 9 exist precisely because the array is only as honest as you make
it — React never reads the effect body to check.

> [!TIP]
> After a commit, React runs *all* effects for *all* changed components, in child-before-
> parent order (Lesson 59). The dependency comparison decides *which* effects run; the
> commit decides *when*.

## 5. Why `[]` Is Not "run once like `componentDidMount`"

The empty array is a list with zero entries. Zero entries can never change, so the effect
runs once — after the first commit — and then skips forever. That is the dependency
comparison coming out empty, not a lifecycle switch.

The three facts that make the analogy wrong (from Lesson 57 §5, now with the mechanism):

- `[]` effects run **after paint**; `componentDidMount` ran during commit, before paint.
- In development, Strict Mode runs mount effects **twice** — a lifecycle method never would.
- Every effect has exactly one paired cleanup; `componentDidMount` had no such contract.

One sentence for the interview: *"The empty array means nothing the effect reads can ever
change, so it runs on the first commit and never again — 'run once like `componentDidMount`'
is a coincidence of the comparison, not the design."*

## 6. Real project usage

```jsx
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/users/${userId}`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setUser);
  return () => controller.abort();            // cleanup: cancel stale requests
}, [userId]);                                 // deps: the one value the effect reads
```

```jsx
useEffect(() => {
  const id = setInterval(() => refresh(), 15_000);
  return () => clearInterval(id);             // cleanup: no orphan timers
}, [refresh]);                                // deps: the function, not a list
```

The pattern is uniform: **body opens something, cleanup closes it, deps list what the body
read from the render.** Everything else — where you put the fetch, whether you debounce,
whether the polling function is memoised (Lesson 62) — is detail on top of that skeleton.

## 7. Interview explanation

> On every commit, React compares the dependency array with the one from the previous
> render, element by element, using `Object.is`. If any entry changed — or this is the
> first commit — it runs the cleanup from the previous run, then the effect body.
>
> What belongs in the array is exactly what the body reads: props, state, and the results of
> other hooks. What doesn't: `setState` functions, refs, and values that are stable or
> constant. Objects and arrays are a trap, because a literal is a fresh reference every
> render, so `Object.is` sees a change every time — Lesson 6 is the whole explanation.
>
> Cleanup runs before the next run and on unmount, so the effect can undo its side effects —
> clear the timer, abort the fetch, remove the subscription.

## 8. Common mistakes

**❌ Mistake 1: Omitting a dependency to "make it run once"**

```jsx
const [user, setUser] = useState(null);

useEffect(() => {
  fetch(`/api/users/${userId}`).then(setUser);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);                          // ❌ userId is read but missing — stale data forever
```

Suppressing the lint rule hides the lie. Either the effect genuinely reads nothing from the
render (then why is `userId` in the body?), or it reads `userId` and must depend on it.

**❌ Mistake 2: An object or array in the dependency array**

```jsx {4}
useEffect(() => {
  fetch(`/api/items?sort=${options.sort}`, { signal })
    .then(setItems);
  return () => controller.abort();
}, [options]);                  // ❌ options is a new object every render
```

`options` is a fresh object literal every render, so `Object.is` reports a change every
commit — the effect aborts and refetches forever. The fix (Lesson 6): depend on the
primitive, or memoise the object:

```jsx
}, [options.sort]);             // ✅ depend on the primitive
// or
const options = useMemo(() => ({ sort, dir }), [sort, dir]);   // stable reference
}, [options]);
```

**❌ Mistake 3: Reading a ref and putting it in deps**

```jsx
useEffect(() => {
  inputRef.current.focus();     // ❌ refs are read, never deps
}, [inputRef]);
```

Refs are stable — the same object for the component's whole life (Lesson 60). Adding one to
deps adds nothing (it never changes) and signals you're treating a ref like state. A ref
read *inside* the body is fine; the body runs after mount, when the ref is populated.

**❌ Mistake 4: "Why didn't it run? I put the value in deps"**

```jsx
useEffect(() => {
  setFiltered(products.filter((p) => p.price <= maxPrice));
}, [maxPrice]);                 // ❌ reads `products` — also a dep (or a ref)
```

The effect reads two things, lists one. If `products` changes, the filter silently goes
stale. The lint rule exists for exactly this line.

**❌ Mistake 5: Cleanup that only undoes the last run**

```jsx
useEffect(() => {
  window.addEventListener('scroll', onScroll);
  return () => window.removeEventListener('scroll', onScroll);
}, []);                          // ✅ this one is right
```

The wrong version returns a cleanup that clears a *different* resource than it opened — an
effect that starts one interval and clears another. React only calls what you return; it
cannot know which timer you meant. Body and cleanup must name the same thing.

> [!PITFALL]
> The infamous **infinite loop** is deps + effects feeding each other: effect A sets state,
> which changes an object dependency, which re-runs effect A, which sets state… If an effect
> re-runs with no user interaction and the page pegs the CPU, that's the shape. Fix it by
> removing the object from deps, not by adding `// eslint-disable`.

## 9. Best practices

✅ Declare **exactly** what the body reads from the render — that's the definition of correct deps

✅ Return a cleanup that **undoes** the body — same resource in, same resource out

✅ Depend on primitives; memoise objects (Lesson 61) or lift them out of the render

✅ Treat refs as stable — read them in the body, never list them as deps

✅ Split one effect into several when it does unrelated jobs (Section 11)

✅ Let `react-hooks/exhaustive-deps` drive — its warnings are usually right

❌ Don't omit a dep to force "run once" — that's a lie with a lint-suppress next to it

❌ Don't put objects/arrays created in the render into deps — `Object.is` loops forever (Lesson 6)

❌ Don't list `setState`, refs, or module-level constants — they can't change

❌ Don't set state in an effect to react to another state change — derive instead (Lesson 57 §8)

## 10. Interview questions

**Q1. What exactly goes in the dependency array?**

> Every value the effect body reads from the render: props, state, and values returned by
> other hooks. The array is a declaration — "this effect depends on these" — and it must
> match what the body actually uses.
>
> Things that never go in: `setState` functions (React guarantees they're stable), refs
> (stable for the component's life), and module-level or global values (they're not part of
> any render).

**Q2. Why does `useEffect(..., [options])` fire on every render when `options` looks the same?**

> Because React compares dependencies with `Object.is`, which for objects compares
> *identity*. An object literal is constructed fresh on every render, so it is never the
> same reference as the previous one. Lesson 6: `Object.is({ sort: 'new' }, { sort: 'new' })`
> is `false`.
>
> The fix is to depend on the primitives inside it, or memoise the object so the reference
> is stable.

**Q3. Why do the `react-hooks` lint rules exist?**

> Because React can't read the effect body — the dependency array is the only declaration of
> what the effect needs. The `exhaustive-deps` rule diffs the body against the array at
> compile time and catches two failure modes: values read but not declared (stale effects)
> and values declared but not read (needless re-runs). The rules of hooks — top level, no
> conditionals — exist because hooks are matched to state by call order (Lesson 66).

**Q4. When exactly does cleanup run?**

> Twice, and only twice: before the effect re-runs (i.e. before the next body execution
> after a dependency change), and when the component unmounts. On the first mount there is
> no previous run, so there's nothing to clean. In development Strict Mode there's an extra
> mount/unmount cycle, so the cleanup is exercised there too (Lesson 59).

**Q5. When should you split an effect into two?**

> When it does two unrelated jobs. The rule of thumb: if one half of the body has nothing to
> do with the other's dependencies, they're two effects. A fetch-and-subscribe effect that
> refetches on every subscribe-relevant change re-runs far more than either half needs.
> Splitting gives each its own lifecycle — and its own honest dependency array.

**Senior follow-up: If I read a function in the effect body, should the function be a dependency?**

> Yes — by the letter of the rule, a function created in the render is a new reference every
> render, so it must be either listed (and therefore memoised, Lesson 62) or stable. In
> practice: if the function doesn't read any state or props, define it outside the component
> and it's stable; if it does, wrap it in `useCallback` and add it to deps; otherwise define
> it *inside* the effect body, where it's not a dependency at all because nothing outside
> the effect can change it.

## 11. Follow-up questions

**What happens if the dependency array is omitted entirely?**

> The effect runs after every commit, no comparison at all. That's correct for effects that
> genuinely need to re-sync on every render — but those are rare, and the common outcome is
> needless work or an infinite loop. Prefer an explicit array: you're declaring intent.

**Why is a `[]` effect's cleanup also called on unmount?**

> Because the contract is one cleanup per run. The effect ran once, so exactly one cleanup
> is owed — and unmount is the last opportunity to collect it. React keeps the cleanup
> function on the fiber and calls it when the component is removed, whether or not the
> effect ever re-ran.

**How do you debounce with `useEffect`?**

> Start a `setTimeout` in the body and clear it in the cleanup. Every keystroke changes the
> dependency, the cleanup cancels the pending timer, and only the last one fires. The
> cleanup-before-rerun order is exactly what makes debounce work — without it the timers
> would stack.

**Why does the lint rule complain about a function I only call, never define?**

> Because `exhaustive-deps` can't tell "stable module function" from "fresh render
> function" — it only sees that the body references a value and the array doesn't list it.
> If the function is module-level or imported, add it to the array and the warning goes
> away (it's a no-op, since it never changes), or move the call inside the body so nothing
> is referenced from the render at all.

## 12. Comparison table

| Dependency-array gotcha | Why it breaks | The fix |
|---|---|---|
| Object literal in deps `[{ id }]` | New reference every render (Lesson 6) | Depend on `id` |
| Array literal in deps `[items]` | New reference every render | Depend on length / a slice / a memoised value |
| Function in deps `[onSave]` | New reference every render | `useCallback` (Lesson 62) or define inside the body |
| Prop object from parent `[config]` | Unstable unless the parent memoises it | Memoise at the source (Lesson 61) |
| State that's an object `[filters]` | New object per update | Depend on the primitive fields |
| `[]` with values read inside | Effect is a lie — never re-runs | Add the values, or move them out of the body |
| Refs / `setState` in deps | They never change — dead weight | Remove them |

| | `useEffect` deps | `useMemo` deps | `useCallback` deps |
|---|---|---|---|
| Compared with | `Object.is` | `Object.is` | `Object.is` |
| On change | Re-run body (cleanup first) | Recompute value | New function reference |
| First run | Always runs | Always computes | Always a new function |
| Purpose | Sync with outside world | Cache a derived value | Stabilise a function identity |

## 13. Code example

The same three renders, traced through deps *and* cleanup — see the order for yourself:

```js
const trace = [];
const cleanup = [];
let previous = null;

function commit(label, nextDeps, runEffect) {
  const changed = previous === null || nextDeps.some((d, i) => !Object.is(d, previous[i]));
  trace.push(`${label}: changed=${changed}`);
  if (changed) {
    cleanup.forEach((fn) => fn());        // 1. clean the previous run
    cleanup.length = 0;
    runEffect();                           // 2. run the new body, which may register cleanup
  }
  previous = nextDeps;
}

let listeners = 0;
commit('mount',   ['A'],   () => { listeners += 1; cleanup.push(() => listeners -= 1); });
commit('same',    ['A'],   () => { listeners += 1; cleanup.push(() => listeners -= 1); });
commit('changed', ['B'],   () => { listeners += 1; cleanup.push(() => listeners -= 1); });

console.log(trace.join('\n'));
console.log('active listeners at the end:', listeners);
```

Output:

```text
mount: changed=true
same: changed=false
changed: changed=true
active listeners at the end: 1
```

The "same" commit ran neither the cleanup nor the body. The "changed" commit cleaned the
mount run (down to `0`) and started one fresh listener. One commit, one decision, zero
leaks — that's the whole lesson compressed into ten lines.

## 14. Performance notes

**When it matters:** every commit pays the cost of the `Object.is` comparison (trivial) and
every *changed* deps entry pays the cost of the effect body (not trivial). The expensive
case is a body that's heavy — a fetch, a re-subscribe, a re-render of a chart — re-running
because of an unstable object reference. Fixing the reference (memoise, depend on
primitives) converts "runs every render" into "runs when it must".

**When it doesn't:** the comparison itself is a handful of `Object.is` calls; it is never
the bottleneck. Don't micro-tune dep *length* — tune dep *honesty*. An effect that
genuinely re-syncs on every render is correct even if it "runs too often"; the fix for
excess runs is a better dependency, not a longer one.

> [!NOTE]
> Cleanup is also a perf lever in disguise: a cleanup that's cheap to run makes re-runs
> cheap, which makes dependency changes feel free. An abort of a request that already
> completed costs nothing — that's the pattern to prefer.

## 15. Debugging scenarios

**Scenario 1: "The effect refetches on every keystroke, even unrelated ones."**
Check for an object or array literal in deps, or a missing memoisation on a prop. `Object.is`
on a fresh literal is never equal (Lesson 6). Log the deps values in the body and watch
which render they change on.

**Scenario 2: "The effect never re-runs, even though the value visibly changed."**
The value is read inside the body but missing from deps — the lint rule would have flagged
it. Either add it, or (if it's an object) depend on its primitives. The stale-closure
variant (Lesson 57) is the same bug from the other side: `[]` froze the closure at mount.

**Scenario 3: "Old data flashes in before the new fetch lands."**
The cleanup isn't cancelling the previous request. Without an abort, both requests race and
the slower one wins. Add `AbortController` and abort in the cleanup — the stale request
then no-ops.

**Scenario 4: "The page spins forever after a state update."**
That's the effect loop: deps → setState → new deps reference → effect → deps. Find the
state update inside the effect and remove it (derive instead), or find the object reference
in deps that changes on every render and stabilise it. Check `console.log`s of the dep
values — if they're "the same" but the effect still runs, it's identity, not contents.

**Scenario 5: "The lint rule keeps complaining about something I can't fix."**
Read the complaint — it names the exact value. If it's a function from props, memoise it
with `useCallback` (Lesson 62). If it's a constant, move it out of the component. The
disable comment should be a last resort, and it should come with a reason in the code.

## 16. Quick revision notes

- Deps are compared on **every commit** with `Object.is`, element by element
- First mount always runs — `prevDeps` is `null`, there's nothing to compare
- Deps list **what the body reads from the render** — nothing more, nothing less
- `setState`, refs, module constants: stable — never in deps
- Objects/arrays in deps = new reference every render = infinite re-runs (Lesson 6)
- `[]` = "nothing can change" → runs once — not `componentDidMount`
- Cleanup runs **before** the next body and **on unmount** — never after
- Body opens, cleanup closes, deps declare — same resource in both directions
- `react-hooks/exhaustive-deps` is a compiler for the contract you already signed
- Split effects when halves of the body answer to different dependencies

## 17. Cheat sheet

```jsx
// The decision procedure, in order:
// 1. What does the body READ from the render?   →  that is your dependency array
// 2. Does the body OPEN anything?               →  return a cleanup that CLOSES it
// 3. Is any dep an object or array?             →  depend on primitives, or memoise
// 4. Does the lint rule disagree?               →  the lint rule is usually right

useEffect(() => {
  // open: subscribe / fetch / timer / listener
  return () => {
    // close: the exact same resource
  };
}, [the-primitives-the-body-reads]);
```

```text
Object.is({}, {})    → false   (why object deps loop)
Object.is([], [])     → false   (why array deps loop)
Object.is(NaN, NaN)   → true    (why NaN is a safe dep)
Object.is('a', 'a')   → true    (why primitives are safe deps)
```

## 18. Key takeaways

> [!RECAP]
> - Deps are compared every commit with `Object.is`; first mount always runs
> - The dependency array must match what the body reads — that's the whole contract
> - Objects and arrays in deps are new references every render → the infinite-loop trap (Lesson 6)
> - Refs and `setState` are stable — never list them as dependencies
> - Cleanup runs before the next run and on unmount, and it closes what the body opened
> - `react-hooks/exhaustive-deps` encodes the contract; suppressing it is a confession
> - Split effects whose halves answer to different dependencies
> - `[]` is "nothing can change", not "run once" — Lesson 57's mistake, now with the mechanism

## Check your understanding

Answer these without looking back.

1. On which occasions does React compare the dependency array, and with what operation?
2. Why does the first mount always run, even with `[]`?
3. `useEffect(fn, [user])` where `user` is an object — when does it fire, and why?
4. Name three things that never belong in a dependency array, and why each is excluded.
5. In what order does React run cleanup and the effect body when a dep changes?
6. What does `exhaustive-deps` catch that React itself cannot?
7. An effect sets state from a fetch. When is that correct, and when is it a loop?
8. Two unrelated jobs share one effect. What's the cost, and what's the fix?

## What's Next

**Lesson 59 — Lifecycle & Effect Order.** How effects order against each other and the
paint, why children effect before parents, why Strict Mode double-invokes, and how all of
this maps onto the old lifecycle methods.
