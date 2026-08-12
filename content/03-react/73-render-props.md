# Lesson 73 — Render Props

**Interview importance:** ⭐⭐⭐ — foundational, later lessons build directly on this.

"Props are data" is Lesson 49. Render props are the upgrade: **props are code** — a function
the parent calls to hand you its state and a say in what gets rendered. Everything you've
been writing maps onto it: `children` *is* a prop, and a function as `children` is a render
prop. So is `render`, `renderItem`, `renderOption` — the same idea under different names.

Foundational is the right word: `useContext` (Lesson 63) was a render-prop in its pre-hooks
life, and Lesson 74's HOCs are literally render props inverting who owns the component. Learn
this one properly and two lessons of context arrive free.

## Learning Objectives

By the end of this lesson you should be able to:

- Define a render prop as a function prop whose return value gets rendered
- Explain how the parent's state reaches the caller through the function's argument
- Name the common spellings: `children`, `render`, `renderItem`, `renderOption`
- Compare render props with plain children and with HOCs
- Recognise the pattern in real libraries (form libraries, router, react-motion)

## 1. One-Line Definition

**A render prop is a prop whose value is a function — the parent calls it and renders what it
returns, passing its own state into the function's argument.**

```jsx
<Mouse render={(pos) => <span>{pos.x}, {pos.y}</span>} />
```

The parent owns the state (`pos`); the caller owns the markup. Both sides agree on one
function signature — the contract.

## 2. Mental Model

Props are inputs, right? Lesson 49. Now add the twist: **a prop can be a function that
returns JSX.**

```text
Parent                              Caller
owns state  ──pos──▶  render(pos)   owns markup
   ▲                                  │
   └────────── returns JSX ◀──────────┘
```

It's the **inversion of control** from Lesson 48, made explicit: the parent says "I'll track
the mouse, you decide what to draw with it." The caller gives up state, the parent gives up
the UI. Each does what it's best at.

## 3. Visual Flow

```text
   <Mouse render={fn}/>            ← caller supplies the fn
        │
        ▼
   Mouse renders — calls fn(pos)   ← state flows IN as the argument
        │
        ▼
   fn returns <span>{pos.x},{pos.y}</span>   ← markup flows OUT
        │
        ▼
   Mouse renders fn's return value
```

The cycle repeats on every state change: the parent re-renders, re-calls the function with
fresh state, and the caller's markup updates in place.

## 4. How It Works

A plain children render prop:

```jsx
function Mouse({ children }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return children(pos);          // ← call it; don't render it as a child
}

function App() {
  return (
    <Mouse>
      {(pos) => (
        <span>Mouse: {pos.x}, {pos.y}</span>
      )}
    </Mouse>
  );
}
```

`children` is just a prop (Lesson 48), and here its value is a function. `Mouse` returns
`children(pos)` — it **calls** the function with its state. That single line is the whole
pattern.

> [!TIP]
> The tell-tale bug is writing `{children}` instead of `children(pos)`. One renders the
> function as a child (a crash, or "function is not a valid React child"); the other calls it
> and renders the result. Same fix: call the function.

The equivalent `render` spelling, when the function lives in a named prop:

```jsx
<Mouse render={(pos) => <span>Mouse: {pos.x}, {pos.y}</span>} />
```

**Props are the mechanism.** A render prop is still a prop — it follows every prop rule from
Lesson 49 (identity, re-creation, re-render timing). What changes is the *type* of the value
and what the parent does with it. That's why the relationship to props is the examinable
part: same channel, different payload, and the parent *invokes* instead of just reading.

The parent even gets to pass extra arguments, so render props scale to "give me your state
and let me compute":

```jsx
function DataList({ data, children }) {
  return <ul>{data.map((item) => children(item))}</ul>;   // one argument per row
}
```

## 5. The Contract: State Flows In, Markup Flows Out

The parent calls the function with whatever it owns — position, value, row, error. The caller
returns what should appear on screen. Both sides stay decoupled:

| The parent knows | The caller knows |
|---|---|
| Where the state comes from | What the state looks like on screen |
| When to update it | When to re-render (re-call) it |
| The function signature | The function's return — the JSX |

Neither needs the other's internals. `Mouse` doesn't care whether you render a `<span>` or an
SVG line; you don't care how the listener is wired. The signature is the whole interface.

## 6. Real Project Usage

| Library | The render prop |
|---|---|
| **React Router (v5-era)** | `<Route render={(props) => <Post {...props} />} />` — route state as the argument |
| **react-motion** | `<Motion style={{x}}>{interpolated => …}</Motion>` |
| **Downshift / form libraries** | `render`-style props exposing state and helpers to the caller |
| **Your own lists** | `<List renderItem={(row) => <Row row={row} />} />` — `children` over a row |

That last row is the pattern's everyday home: **the stateful wrapper, the stateless
rendering.** If you're writing a component that owns data but shouldn't dictate its layout,
you're writing a render-prop component.

## 7. What Render Props Give You

**1. State + full control of the UI, together.** A modal that knows `isOpen` (its state) but
lets you decide what the backdrop looks like. A list that owns the data but not the row
markup. That pairing — *I'll track it, you draw it* — is the pattern's whole value.

**2. Composition stays shallow.** Render props are just props, so they compose through plain
JSX — no wrappers stacking up (contrast with Lesson 74's wrapper hell).

**3. They compose with everything else.** A render-prop component can itself be a compound
(shared context), can be wrapped in `React.memo` (Lesson 67) if the function is stable
(Lesson 62), and can hand its state to a second render prop. There's no special position in
the tree — just a prop that's a function.

> [!DEEPDIVE]
> Before hooks, `useContext` was `<Context.Consumer>{(value) => …}</Context.Consumer>` — a
> render prop, exactly this shape. Custom hooks (Lesson 65) are now the *preferred* way to
> share "state you can call", which is why new code reaches for `useMouse()` more often than
> `<Mouse render={…}>`. But the pattern hasn't died — it's the standard answer when the
> *rendering* is the point: form fields, lists, routing, animation.

## 8. The Cost: Inline Functions and Re-Renders

```jsx
<Mouse render={(pos) => <span>{pos.x}, {pos.y}</span>} />
```

That arrow function is **new on every render** of the caller. It flows down as a fresh prop
every time, so a memoised `Mouse` (Lesson 67) sees a changed prop and re-renders anyway —
the exact "memo needs stable references" rule from Lesson 71. Fix it by hoisting the function
or wrapping it in `useCallback` (Lesson 62), when the cost is actually measured.

There's also a subtle scoping trap: closures in render props capture the render they were
created in, exactly as Lesson 5 describes. If the caller's state is stale inside the render
prop, that's the same stale-closure mechanism — fix the closure, not the pattern.

## 9. Senior-Level Insights

- **Define it as a contract.** "A render prop is a function prop the parent calls, passing
  its state in and rendering what comes back." One sentence, no hedging.
- **Say "the signature is the API."** Parent and caller agree on one function signature —
  that's what makes the pattern safe to reuse and easy to test.
- **Trace `children` back to Lesson 48.** "`children` is a prop" is the foundation; "a
  function as `children` is a render prop" is the upgrade. Nail that lineage and you sound
  like someone who thinks in first principles.
- **Know the history.** Context consumers and the old React Router were render props, and
  custom hooks now do most of the same jobs — but render props still win when the caller
  needs to shape the *output*, not just receive the state.
- **The comparison question is coming.** "HOC vs render prop vs hook?" is a real interview
  question — this lesson is half of that answer; Lesson 74 is the other half.

## 10. Common Mistakes

**1. Rendering the function instead of calling it.**

```jsx
return children;        // ❌ React tries to render a function
return children(pos);   // ✅ call it first, then render the result
```

**2. Treating render props as "children but special".**

`children` and `render` are two spellings of one idea, not two features. Mixing them
(`render` here, `children` there) is fine as long as the component defines one contract and
documents it.

**3. Forgetting the function is recreated per render.**

```jsx
<Mouse render={(pos) => <span>{pos.x}</span>} />   // new function each render
```

Fine for a small component. A performance trap only once memo (Lesson 67) is involved —
stabilise with `useCallback` if a profile says so.

**4. Capturing stale state in the closure.**

```jsx
<Counter render={(count) => <Badge n={count + bonus} />} />  // bonus is the render's value
```

The render prop closes over `bonus` from the render that created it — Lesson 5's stale
closure, wearing a React costume.

**5. Nesting render props so deep it's unreadable.**

```jsx
<A render={(a) => (
  <B render={(b) => (
    <C render={(c) => <div>{a}{b}{c}</div>} />
  )} />
)} />
```

Composition is a strength; pyramid-shaped composition is a code smell. Extract a component
per level, or reach for a hook (Lesson 65) when the shape gets this deep.

## 11. Best Practices

✅ Call the function — `children(pos)` — and render the result

✅ Document the contract: what arguments the function receives and what it must return

✅ Use `children` for "the one render function" and named props (`renderItem`, `renderRow`)
for per-item variants

✅ Keep the stateful parent free of layout opinions — that's the caller's job

✅ Reach for a custom hook (Lesson 65) when the state, not the rendering, is what you're
sharing

❌ Don't render the function itself, don't pass it through `props.children` unchanged

❌ Don't memoise a consumer of an inline render prop and expect it to skip renders

❌ Don't build pyramid nesting — extract components instead

## 12. Interview Questions

**Q1. What is a render prop?**

> A prop whose value is a function that returns JSX. The parent calls it, passing its own
> state into the argument, and renders whatever the function returns. The caller gives up the
> state, the parent gives up the markup — each does what it's best at. `children` as a
> function is the common spelling.

**Q2. How does a render prop let the parent share state?**

> The function's argument is the channel. The parent re-calls the function on every render,
> passing fresh state — so the caller's markup updates without the caller owning or managing
> that state. State flows in through the argument, markup flows out through the return value.

**Q3. Render prop vs children — what's the difference?**

> They're the same prop. `children` is just a prop whose value can be a function; when it is,
> it's a render prop. Both follow the props rules from Lesson 49. The distinction people draw
> is convention: `children` for the primary render function, named props for secondary ones.

**Q4. What are the downsides?**

> Inline render functions are new references each render, which defeats memoisation unless
> stabilised. Deep nesting of render props gets unreadable fast. And hooks now cover most of
> the "share state" cases more simply — so render props are strongest when shaping the output
> is the point, not just receiving the state.

**Senior follow-up: HOC vs render prop vs hook — how do you choose?**

> They're three ways to give a component something: an HOC wraps it and injects props, a
> render prop is called with the state, and a hook returns it. I default to hooks — simplest,
> no wrapper, and the Rules of Hooks (Lesson 66) are a fair price. I'd use a render prop when
> the caller must control the rendering around the state, and an HOC only in legacy code or
> when the wrapping is invisible to the consumer — like `connect` in Redux.

## 13. Follow-up Questions

**Can you build a render-prop component with TypeScript?**

> Yes — type the function's argument and return value: `render: (pos: Point) => ReactNode`.
> That's the contract made checkable. The parent's generic over the row type in a
> `DataList<T>` is where it gets genuinely useful.

**Does a render prop break memoisation?**

> Only if the function is recreated inline, because it's a new prop reference every render.
> Hoist it or wrap it in `useCallback`, and a memoised parent can skip. Without memo, the
> new reference costs nothing — the old "measure first" rule from Lesson 71.

**How do you test a render-prop component?**

> Call the render function with a fake state and assert on what it returns — the parent's
> contract is just "calls this function with X", so the test is a spy. That decoupling is a
> big reason the pattern is easy to test.

## 14. Comparison Table

| | `children` (plain) | Render prop | HOC (Lesson 74) | Custom hook (Lesson 65) |
|---|---|---|---|---|
| What's shared | JSX from parent | State + rendering control | Injected props | State + helpers |
| Shape | `<Card>…</Card>` | `<Mouse>{(pos) => …}</Mouse>` | `withAuth(Component)` | `const m = useMouse()` |
| Ownership of state | Parent owns all | Parent owns, caller draws | Wrapper owns, injects | The hook's caller |
| Wrapper nesting | None | None | Stacked (wrapper hell) | None |
| Typical use | Layout composition | Lists, forms, router | Legacy/`connect` | Modern default |

## 15. Code Example: The Full Pattern

```jsx
function Mouse({ children }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return children(pos);           // ← call the render prop with the state
}

function App() {
  return (
    <Mouse>
      {({ x, y }) => (
        <div>
          Mouse is at ({x}, {y})
          <img src={cursor} alt="" style={{ left: x, top: y }} />
        </div>
      )}
    </Mouse>
  );
}
```

```text
Mouse is at (312, 148)         ← the div is the caller's markup; the numbers are the parent's state
[ cursor image follows the pointer ]
```

The caller's markup references the parent's state directly — no props, no wiring, just the
function argument. That's the whole pattern, and the reason it's foundational.

## 16. Performance Notes

- **Default cost:** an inline render function is a new reference each render — irrelevant
  unless memo (Lesson 67) is in play, in which case it defeats the memo unless stabilised.
- **When it matters:** render props on hot paths — per-row list rendering, per-frame
  animation — combined with memo. Stabilise with `useCallback` (Lesson 62) after a profile.
- **When it doesn't:** single-use wrappers, form fields, small trees. Lesson 71's rule
  applies: don't optimise what the profiler hasn't shown.
- **Stale closures** (Lesson 5) are the real correctness risk, and they're invisible to the
  profiler — they only show up as "the render prop saw an old value".

## 17. Debugging Scenarios

**"Function is not a valid React child."** You wrote `{children}` where the prop is a
function. Call it: `{children(pos)}`. The error message is React saying "you gave me a
function to render" — which is precisely the thing render props must not do.

**"The render prop sees stale state."** The function closed over an old render's value —
Lesson 5's mechanism. Add the value to the caller's dependency/effect, or compute it inside
the render prop instead of capturing it.

**"My memoised parent still re-renders."** The inline render function is a new prop every
time (Lesson 67's "unstable prop" case). Hoist the function or wrap it in `useCallback` —
but only after a profile says the re-renders cost something.

**"Nothing renders inside my component."** The parent calls the function but you returned
`null` for the current state — or the parent never calls it at all. Add a `children(pos)`
return path and check for early `return null` branches that skip the call.

## 18. Quick Revision Notes

- Render prop = a prop that is a function; the parent calls it and renders the result
- `children(pos)` — state flows in as the argument, JSX flows out as the return value
- `children`, `render`, `renderItem`, `renderOption` — one idea, different names
- It's still a prop: Lesson 49 rules apply, including re-creation on every render
- Inversion of control from Lesson 48: parent owns state, caller owns markup
- History: context consumers and old React Router; hooks (Lesson 65) are now the default,
  but render props rule when shaping output is the point
- Inline functions defeat memo unless stabilised; stale closures are the correctness trap

## 19. Cheat Sheet

```jsx
// Parent — owns state, calls the contract
function Tracker({ children }) {
  const [n, setN] = useState(0);
  return children(n);
}

// Caller — owns markup, receives state
<Tracker>{(n) => <span>count: {n}</span>}</Tracker>

// Named variant — same idea, explicit prop
<Tracker render={(n) => <span>count: {n}</span>} />
```

## 20. Key Takeaways

> [!RECAP]
> - A render prop is a function prop: the parent calls it and renders what it returns
> - State flows in through the argument; markup flows out through the return value
> - `children` as a function is a render prop — `children` is just a prop, from Lesson 48
> - The parent gives up the UI, the caller gives up the state — each does what it's best at
> - It's the ancestor of the context consumer, and still the right tool for lists, forms,
>   routing and animation
> - Watch the two traps: rendering the function instead of calling it, and stale closures
> - Hooks are the modern default for sharing state, but render props are the answer when the
>   caller must shape the output

## Check your understanding

Answer these without looking back.

1. Define a render prop without using the phrase "render prop".
2. What happens on every parent render: where does state enter, and where does markup leave?
3. Why is `children` a render prop? What does Lesson 48 say about `children` that makes this
   obvious?
4. Write the one line that most render-prop components are built around, and the classic bug
   next to it.
5. Why does an inline render function defeat `React.memo` — and what's the fix?
6. Name two places you've used a render prop without calling it that, and one case where a
   hook is now the better answer.

## What's Next

**Lesson 74 — Higher-Order Components.** The pattern that used render props to wrap whole
components — and the one hooks largely replaced. You'll learn the `withX` shape, why wrapper
hell was a real cost, and how to answer "why did hooks win?" — which is the actual interview
question.