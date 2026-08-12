# Lesson 71 — When NOT to Optimize

**Interview importance:** ⭐⭐⭐ — saying this unprompted marks you as senior more than any optimisation trick.

Optimisation is a reflex for most candidates: "I'd wrap it in `useMemo`." The senior answer is
a question first — *should* you? This lesson is the counterweight to Lessons 61 and 67, the
half of the story those lessons only gesture at. Everyone knows what memo does. Almost nobody
can say why adding it everywhere makes an app *slower*.

Read this as the "measure first, optimise second" argument. It is also an interview strategy
lesson: interviewers ask about `useMemo` precisely to hear the word **no**.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain why a re-render is not the same thing as a wasted render
- Say what memo actually costs and when it pays for itself
- Give the rule of thumb for when a re-render is cheap enough to ignore
- Describe the profile-before-optimise workflow in one sentence
- Answer "how do you optimise a React app?" without reaching for memo

## 1. What "Optimisation" Usually Means Here

**A React app is slow when the user sees it slow — everything else is a re-render you can afford.**

"Optimising React" almost always means *reducing re-renders*: fewer components re-rendering,
less work per render, less memory churn. The tools are `React.memo`, `useMemo`, `useCallback`,
`useId`, lazy loading, and (from Lesson 70) virtualisation.

The unasked question is whether those re-renders were a problem at all. Most are not.

## 2. Mental Model

You are buying insurance.

Every `useMemo` is a premium you pay on **every single render** — a dependency comparison, a
cache lookup, extra code to read — to protect against a claim you hope never happens: a render
that actually costs something.

An insurance policy on a glass of water is silly, and so is memo on a render that takes 50
microseconds. You only insure the expensive things, and only after you've seen one break.

The profiler is your claims adjuster. Without it you're guessing which policies to buy.

## 3. Visual Flow

```text
   "This app is slow"
          │
          ▼
   1. MEASURE ── Profile the real interaction (DevTools Profiler)
          │
          ▼
   2. FIND    ── the component that actually re-renders too much
          │
          ▼
   3. FIX     ── the cause, not the symptom
                  │
                  ▼
   4. PROVE   ── re-profile: is it faster? (if not, revert)
```

Optimisation is step 3. Most people skip 1, 2 and 4 and are doing nothing but step 3, blind.

## 4. How It Works: The Cost of Memo

`useMemo` from Lesson 61 does not make renders free. It *trades* work:

```jsx
const sorted = useMemo(() => sort(list), [list]);   // dependency check EVERY render
```

Every render pays for the `list` reference comparison — and the whole point of Lesson 67 is
that comparisons are only free when the references are cheap to hold on to. If `list` is
rebuilt on every render anyway, the memo checks a *different* array each time, misses, and
recomputes — so you now pay the check **and** the sort, every render. Strictly worse than
just sorting.

`React.memo` has the same shape. Each parent render pays a shallow prop comparison on every
child — and pays it **twice** if you also wrapped it in `useCallback` to keep the props
stable (Lesson 62's whole point was that `useCallback` is usually the wrong tool). A memoised
component that re-renders anyway is pure overhead.

Memo also fights the mental model: a component that *doesn't* re-render when you expect it to
is a stale-UI bug waiting to happen, and that debugging hour is part of the cost too.

> [!TIP]
> The honest sentence from Lesson 62 applies to the whole family: **when in doubt, leave it
> out.** React's default rendering is correct and simple. Every memo is complexity you
> accepted for a reason — have the reason.

## 5. When Re-Renders Are Cheap

A re-render is cheap when the component is **small and local**: a few dozen DOM nodes, no
expensive calculations, no heavy libraries doing work in render. React re-renders
function-body-cheap components in microseconds; the diff (Lesson 51) skips unchanged
subtrees for free.

```jsx
function Row({ name }) {          // tiny, stateless, leaf component
  return <li>{name}</li>;
}

function List({ rows }) {
  return (
    <ul>
      {rows.map((r) => (
        <Row key={r.id} name={r.name} />
      ))}
    </ul>
  );
}
```

Every keystroke in a parent that re-renders `List` re-renders every `Row` — and it does not
matter. The work is a string in, a `<li>` out. This is the default state of most real apps:
**most re-renders are cheap and should be ignored.**

> [!NOTE]
> The rules of hooks (Lesson 66) let every component re-render freely without corrupting
> state. That freedom is a *feature* — it means correctness never depends on your memo being
> perfect. Optimising it away is trading a safety property for microseconds.

## 6. The Memo Checklist — from Lesson 67, Applied

Ask in this order, and stop at the first "no":

| Check | If it fails… |
|---|---|
| Is it a component re-rendering? | Not a memo problem — look at the code it runs |
| Does it re-render often? (per keystroke / per frame) | Occasionally is fine, let it re-render |
| Does a render do heavy work? | Only then does memo matter |
| Did the profiler show it? | No profile, no problem |

The profiler showing a re-render is **not** evidence of a problem. A re-render is only a
problem when it takes long enough to feel slow. Lesson 56's warning applies here: React is
not automatically fast, but it's also not automatically slow.

## 7. Real Project Usage

The senior pattern is **memo only the boundaries**, not the leaves:

| Boundary | What memo buys you |
|---|---|
| A `List`/`Table`/`Grid` fed a stable slice of state | Stops hundreds of leaf re-renders |
| A heavy render tree (charts, editors, code viewers) | One render measured in milliseconds |
| A component re-rendering every keystroke | The per-frame budget is tiny |

Everything else — small cards, form fields, icons, buttons — stays unmemoised, by design.
The team's review comment is "why is this memoised?" and the answer is usually "no good
reason", and that's fine: you'll revert it.

## 8. How to Answer "How Do You Optimise a React App?"

The 30-second answer:

> I profile first, then optimise the things the profiler shows. React's default rendering is
> correct, and most re-renders are cheap, so I add `React.memo` and `useMemo` at boundaries —
> lists, heavy subtrees — and only where a measurement shows they matter. I spend most of my
> time on what the profiler *doesn't* show: network waterfalls, bundle size, and code that
> runs in render that shouldn't.

That last clause is the senior move. Most "slow React apps" are slow for reasons that have
nothing to do with re-renders — and no amount of `useMemo` fixes a 2 MB bundle or five
serialised API calls.

## 9. Senior-Level Insights

- **A re-render ≠ a wasted render.** A render that produces the same output is only wasted if
  producing it cost more than skipping the comparison cost.
- **Say "I'd profile it" with a straight face.** It's the correct answer to every
  un-anchored "how do you optimise" question.
- **Know what the profiler can't show.** Render time is one number. The waterfall, the
  bundle, the layout thrash from a `display: none` carousel — those are the real app-killers.
- **Optimising late is safer than optimising early.** Code without memo is easy to read,
  refactor and debug. Memo is the opposite. A senior keeps the codebase optimisable, not
  optimised.
- **The price is paid in the future.** Every memo is a debt against the next refactor — the
  next person must update the dependency array *and* reason about why the component stopped
  re-rendering. Have the receipt.

## 10. Common Mistakes

**1. Memoising everything "to be safe".**

```jsx
const x = useMemo(() => a + b, [a, b]);   // ❌ adding numbers
const y = useCallback(() => setZ(z + 1), [z]);  // ❌ setter never needs it
```

Cheap work in, dependency check every render, zero benefit. It also breaks the mental model
for the next reader.

**2. Memoising props you recreate anyway.**

```jsx
const opts = useMemo(() => ({ size: 'lg' }), []);   // stable, but…
<Select options={opts} />                            // …if Select isn't memoised, irrelevant
```

Memo on one side is meaningless if the consumer isn't memoised. The two halves must pair.

**3. Optimising before profiling.**

Guessing which component is slow is wrong roughly every time. The profiler answers in ten
seconds what an hour of speculation won't.

**4. Fixing the symptom, not the cause.**

```jsx
// ❌ pathological: recreate the list, memo the sort that re-runs anyway
const sorted = useMemo(() => list.sort(), [list]);
// ✅ fix the cause: memo the expensive upstream computation, or move it out of render
const list = useMemo(() => expensiveDerivation(), [raw]);
```

## 11. Best Practices

✅ Measure first, optimise second, prove the result third — and revert what you can't prove

✅ Memo boundaries (lists, heavy subtrees), not leaves

✅ Let small, cheap, leaf components re-render by default

✅ Before reaching for memo, ask "does the heavy work belong in render at all?"

✅ Leave a one-line comment next to every memo explaining what it's protecting

❌ Don't memo before you have a profile

❌ Don't memo cheap work — the dependency check costs as much as the work

❌ Don't micro-optimise code that runs once (mount, navigation, a submit handler)

❌ Don't treat the profiler showing a re-render as a bug — re-renders are the default

> [!PITFALL]
> The worst failure mode is silent: memo "fixes" a bug by making a component stop
> re-rendering, and nobody notices the stale UI until it ships. Optimisation that changes
> behaviour is not optimisation — revert it.

## 12. Interview Questions

**Q1. How do you optimise a React app?**

> I profile first. The profiler shows which components actually re-render too much, and I
> memo those — `React.memo` on boundaries like lists and heavy subtrees, `useMemo` for
> expensive derivations. I don't memo leaves or cheap work, because the comparison costs more
> than the render it saves.

**Q2. Why not wrap everything in `useMemo`?**

> Every render pays the dependency comparison, and the memo only helps if the dependencies
> are stable and the work is expensive. Memoising cheap work, or work whose inputs are
> recreated anyway, is slower than not memoising — and it makes the code harder to read and
> easier to break. So: profile first, memo what the profile shows.

**Q3. When is a re-render a problem?**

> When it costs more than skipping it — a big subtree, a heavy calculation, work that happens
> per frame. If it takes microseconds and the output is identical, it's not a problem. The
> profiler tells you which case you're in.

**Q4. Your app feels slow. Where do you look first?**

> The profiler for render time, then the network waterfall and bundle size — most "slow
> React" is slow before React ever runs. I fix causes: code in render that shouldn't be
> there, big bundles, serialised requests — not re-renders I guessed at.

**Senior follow-up: When would you NOT add `React.memo`, even to a list?**

> When the list is small and cheap to render, when it re-renders rarely, or when its props
> are rebuilt on every parent render anyway — then memo is pure overhead on a component that
> re-renders regardless. I'd rather profile it and, if it's fine, leave it alone. Not
> memoising keeps the code correct and simple, and I can add it in ten minutes if a profile
> ever says I need it.

## 13. Follow-up Questions

**How is `useMemo` different from `React.memo`?**

> `useMemo` caches the result of a computation inside one component; `React.memo` skips
> re-rendering a component when its props are referentially unchanged. They're the same idea
> at two scales — both trade a cheap comparison for expensive work, and both need stable
> references to pay off.

**What does the profiler actually show you?**

> Which components render, why they rendered, and how long each render took. The "why" is the
> valuable column — it shows the state change or parent render that triggered the work. Then
> I know whether to memo, lift state, or restructure.

**Is there such a thing as too much memo?**

> Yes. Memoised components that re-render anyway pay double, memo makes the mental model of
> "state changed, so everything re-renders" harder to reason about, and every dependency
> array is a future refactor trap. Too much memo is a real cost, which is why it gets added
> deliberately and rarely.

## 14. Comparison Table

| | Cheap re-render | Expensive re-render |
|---|---|---|
| Small leaf component | ✅ leave it | 💡 memo if *often* + *unstable props* |
| List of 10 rows | ✅ leave it | 💡 `React.memo` if it re-renders constantly |
| Chart / editor subtree | ✅ leave it | ✅ memo — the profile showed it |
| `useMemo` for `a + b` | ❌ overhead | ❌ overhead |
| Code in render that's expensive | ❌ not a memo problem | ❌ not a memo problem — move it out |
| Slow network / big bundle | ❌ not a render problem | ❌ not a render problem |

## 15. Code Example: Measure, Then Decide

```js
// A profile says List re-renders 200×/s while typing, each render ~1ms.
// 200 × 1ms = 200ms/s = 20% of one frame's budget on ONE list.
// That's the measured problem — so the memo is justified:
```

```jsx
const List = React.memo(function List({ rows, onSelect }) {
  return (
    <ul>
      {rows.map((r) => (
        <li key={r.id} onClick={() => onSelect(r.id)}>{r.name}</li>
      ))}
    </ul>
  );
});
```

And the required partner — the callback must be stable, or the memo is dead weight:

```jsx
const onSelect = useCallback((id) => open(id), []);   // stable across renders
```

After the change, re-profile: the list now renders once per keystroke instead of 200 times.
That pair — *a measurement, a targeted memo, a re-measurement* — is the entire skill.

## 16. Performance Notes

- **When it matters:** heavy render subtrees, huge lists, work on the per-frame budget,
  components re-rendering far more often than they change.
- **When it doesn't:** small leaves, rare renders, code that runs once, and anything the
  profiler hasn't complained about.
- **The common trap:** "memo the expensive thing" without checking whether the expensive
  thing was *re-rendering* — a memo on top of a re-created input is overhead on overhead.
- **The real wins are usually elsewhere:** fewer and smaller re-renders come from lifting
  state (Lesson 55), splitting components, and moving derivations out of render — not from
  memo. And bundle size + network beat all of them.

## 17. Debugging Scenarios

**"I added `useMemo` and it's slower."** The dependencies are being recreated each render, so
the memo misses and you pay both the check and the work. Remove the memo — it was overhead.

**"My memoised component still re-renders."** Either a prop reference changed (often a new
object or inline function from the parent) or a parent re-render reached it another way.
Check the profiler's "why did this render" column; then fix the reference or drop the memo.

**"My memoised component stopped updating."** The memo is now *skipping* renders you wanted.
Check the dependency array / prop comparison for a missed value. This is the silent-stale-UI
failure mode — when fixing it feels like debugging a memo, the memo was the mistake.

**"I can't tell if my optimisation helped."** You don't have a before/after. Re-profile the
exact same interaction with the memo present and removed. No difference → remove it.

## 18. Quick Revision Notes

- Memo trades a per-render comparison for skipping expensive work — it only wins when the
  work is expensive **and** the comparison is cheap
- A re-render is only a problem if it costs more than skipping it
- Most re-renders are cheap: leave leaves alone
- Memoise boundaries: lists, heavy subtrees, per-frame work
- `React.memo` needs stable props; `useCallback` is the partner, and usually unnecessary
- The senior workflow: profile → find → fix the cause → re-profile → revert if no win
- "Slow React" is usually bundle + network, not re-renders

## 19. Cheat Sheet

> [!NOTE]
> **The decision procedure:**
>
> 1. Did you profile it? — no → stop. Yes → 2
> 2. Is a component re-rendering too often? — no → look at code/network/bundle. Yes → 3
> 3. Is each render expensive? — no → ignore it. Yes → 4
> 4. Memo the boundary, keep props stable, re-profile. No improvement → revert.

## 20. Key Takeaways

> [!RECAP]
> - Saying "I'd profile first" is the senior answer to every optimisation question
> - Most re-renders are cheap and should be left alone — memo has a per-render cost
> - Memo only pays off when the work is expensive and the inputs are stable
> - Memo the boundaries, never the leaves
> - Fix causes (code in render, bundle, network), not guessed-at re-renders
> - Prove every optimisation with a before/after profile, and revert what you can't prove

## Check your understanding

Answer these without looking back.

1. What's the difference between a re-render and a wasted render?
2. What does `useMemo` cost on every render, even when it hits the cache?
3. Why is memoising a component whose props are rebuilt each render worse than doing nothing?
4. Give the rule for when a re-render is cheap enough to ignore.
5. Walk through the full measure-fix-prove workflow, and what you do if step 4 shows no gain.
6. Name two "slow app" causes that no amount of `React.memo` will fix.

## What's Next

**Lesson 72 — Compound Components.** The pattern behind real component libraries like Radix
and Headless UI: components that share state invisibly through context, and talk to each
other through a parent instead of props.