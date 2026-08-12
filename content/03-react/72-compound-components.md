# Lesson 72 — Compound Components

**Interview importance:** ⭐⭐⭐⭐ — how real component libraries are designed. Great system-design answer.

This is the pattern behind Radix, Headless UI, Reach and pretty much every library you've
used. You already know both halves of it: composition from Lesson 48 — `Select` *is composed
of* `Select.Trigger` and `Select.Option` — and `useContext` from Lesson 63. A compound
component is those two ideas on purpose: siblings that look independent on the surface while
sharing state through context.

The interview payoff is bigger than the pattern itself. "How would you design a `Select`
that's accessible and extensible?" is a standard system-design question, and compound
components are the answer component libraries actually ship.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what "compound" means and why `Select.Option` never needs a `value` prop
- Build a `<Select>` with context-shared state between `Select` and `Select.Option`
- Say why context (not prop drilling) is the mechanism
- Explain the flexibility win over a monolithic `<Select options={…}>` API
- Sketch this pattern in a system-design interview for any composite UI

## 1. One-Line Definition

**A compound component is a parent component that shares implicit state — usually through
context — with its child components, which are exposed as properties of the parent.**

The children are declared inside the parent, so the parent's state reaches them without any
explicit props. `Select.Option` knows it's selected because its parent *is* `Select`.

## 2. Mental Model

The `<select>` HTML element:

```text
<select>          ← the one element that owns the open/selected state
  <option>        ← children, read the state through the parent
  <option>
</select>
```

Now do that in React. The parent owns the state and hands it to its children through context
(Lesson 63) instead of props — which is exactly what compound components are: **HTML's
implicit parent-child relationship, rebuilt in React where HTML's version doesn't exist.**

## 3. Visual Flow

```text
        <Select>                ← owns: isOpen, value, onSelect
           │
           │ createContext + Provider (value, onSelect)
           ▼
   ┌────────────────┐
   │  Select.Trigger │◄── reads value via context; toggles isOpen
   │  Select.Option  │◄── reads selected state; calls onSelect on click
   └────────────────┘
```

Parent state flows down through context; child events flow back up through callbacks in that
same context value. No prop drilling, and the children stay completely decoupled from each
other.

## 4. How It Works

Context is the mechanism (Lesson 63). The parent creates a context, provides `{ value,
onSelect }`, and each compound child consumes it:

```jsx
const SelectContext = createContext(null);

function Select({ children }) {
  const [value, setValue] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ value, onSelect: setValue, isOpen, setIsOpen }}>
      {children}
    </SelectContext.Provider>
  );
}

function Option({ children, value }) {
  const ctx = useContext(SelectContext);

  return (
    <li
      className={ctx.value === value ? 'selected' : ''}
      onClick={() => ctx.onSelect(value)}
    >
      {children}
    </li>
  );
}
```

The parent *provides*; the children *consume*. The children never receive `value` or
`onSelect` as props — the parent's state reaches them through context instead.

Now attach the children to the parent:

```jsx
Select.Trigger = Trigger;
Select.Option = Option;
```

That's the compound part: `Select.Option` is a property of `Select`, which is a documentation
statement and an import convenience — everything comes in as `Select`. (Components as
properties is nothing special — a function in JavaScript is just an object that can carry
properties — but it's what makes the compound surface feel like one component.)

```jsx {4,8}
function App() {
  return (
    <Select>
      <Select.Trigger />
      <Select.Option value="react">React</Select.Option>
      <Select.Option value="vue">Vue</Select.Option>
    </Select>
  );
}
```

No props on `Select.Trigger` or `Select.Option` — the state travels through context. This
allows arbitrary composition: wrap options in a fragment, map over an array, or render them
conditionally, and the wiring still works.

## 5. The Context-Sharing Contract

The shared object is the whole design. Keep it minimal:

```jsx
<SelectContext.Provider value={{ value, onSelect, isOpen, setIsOpen }}>
```

- **Down:** each option reads `value` to know if it's selected and `isOpen` to know if it's visible.
- **Up:** each option calls `onSelect(value)`; the trigger calls `setIsOpen(true)`.
- **No props flow between siblings.** The parent is the only channel — one-way data flow, the
  same rule as everywhere else in React.

> [!TIP]
> A per-component instance of context means the wiring can never cross components — an
> `Option` inside *some other* provider simply doesn't see this `Select`'s state. That
> isolation is what makes compounds safe to nest, which is what a `<Menu>` inside a `<Select>`
> option, or a `<Tabs>` inside a `<Tabs>`, requires.

## 6. How Real Libraries Use It

| Library | Compound surface |
|---|---|
| **Radix UI** | `<Dialog.Root>`, `<Dialog.Trigger>`, `<Dialog.Content>` — context-shared, headless, fully composable |
| **Headless UI** | `<Listbox>`, `<Listbox.Button>`, `<Listbox.Option>` — the `Select` pattern by another name |
| **Chakra / MUI** | `<Menu>`, `<MenuButton>`, `<MenuItem>` — the same shape over a styled base |
| **React Router** | `<Routes>` / `<Route>` — a router "compound": parents and children agree on matching without prop drilling |

The through-line: **libraries expose compounds when a component is really a system of
subcomponents that must stay in sync.** Accessibility (ARIA ids, focus management) and styling
hooks are handled centrally in the parent, so consumers compose freely without reimplementing
state wiring.

> [!DEEPDIVE]
> Headless UI and Radix push this further with **context + render props + headless state**:
> the parent owns the state machine, and the child components own nothing but the hooks that
> consume it. You could think of `<Select.Trigger>` as `useContext(SelectContext)` plus a
> `<button>` — which is precisely why those libraries can swap the DOM freely (they render
> nothing you didn't ask for) while keeping the same compound API.

## 7. Why Not Just a Monolithic `<Select options={…}>`?

Compare the compound API with its natural competitor, props:

```jsx
<Select
  options={['react', 'vue']}
  renderTrigger={...}         // ❌ callbacks/children to do the trigger's job
  renderOption={...}          // ❌ growing, awkward
/>
```

That props-based API grows without bound as needs change, and every new capability is a
breaking change. The compound API composes instead:

| | Monolithic props | Compound components |
|---|---|---|
| Adding an icon to the trigger | New prop, maybe a breaking change | Put the icon inside `<Select.Trigger>` |
| Wrapping options in a group | New `groupBy` prop | `<optgroup>` as a plain component around `Option`s |
| One-off custom option layout | `renderOption` escape hatch | Write your own children — state still flows via context |
| Versioning | Every new prop is API surface | The core never changes; consumers compose |

And the state still lives in exactly one place — the parent — so the compound isn't "free
composition at the cost of wiring everywhere". The wiring is the point, and context keeps it
invisible.

> [!PITFALL]
> The flexibility is the price. Consumers can now reorder, omit and restyle anything, which
> means *you* can't guarantee the DOM shape — and that's a feature, not a bug: the parent
> handles the state and the ARIA wiring, the children own the markup. What you *do* own is
> the contract — `value` must be `onSelect`-able and `isOpen` must be toggleable — and that
> contract is what you document and version.

## 8. The Cost: Re-Renders Through Context

Context has a known bill from Lesson 63: **every consumer re-renders when the value changes,
even if it doesn't use the part that changed.** A keystroke in a search box inside an option
would re-render every option if the value object is recreated per render.

Two mitigations:

1. **Split the context.** One context for state (`value`), one for actions (`onSelect`). An
   option that only reads `value` doesn't re-render when an action identity changes.
2. **Memoise the value** (Lesson 61): `useMemo(() => ({ value, onSelect }), [value])` so the
   object reference only changes when state actually changes.

For a `Select` with a handful of options, neither is necessary — see Lesson 71 about when not
to optimise. For a `Table` with a compound cell API, both matter.

## 9. Senior-Level Insights

- **Lead with the trade-off, not the pattern.** "Compound components trade a props API for
  context-based composition, which is why libraries use them — extensibility without API
  growth."
- **Name the inversion.** A monolithic `<Select options={…}>` pushes the consumer toward one
  rigid layout; a compound *inverts* control — the consumer owns the markup, the component
  owns the state. That inversion is the "why" interviewers want.
- **Cite a library.** Radix and Headless UI are the concrete evidence, and the *same pattern
  is used in React Router and MUI* — so it's not one library's quirk.
- **Mention the escape hatch.** When composition is not enough, libraries fall back to props:
  Radix exposes controlled variants and headless primitives. Real-world design is a blend.
- **Know the context cost and the fix.** Splitting state from actions and memoising the value
  object — that's the part that separates a demo answer from a shipped-system answer.

## 10. Common Mistakes

**1. Putting `value` on every child.**

```jsx
<Select.Option value="react" selected={isOpen} onSelect={...}>React</Select.Option>
```

That's prop drilling, not a compound. The state belongs to the parent, and the child reads it
from context. (The child still needs its own *identity* prop — `value="react"` — so the
parent knows which option was picked.)

**2. Drilling the context through a middle component by hand.**

```jsx
<Select>
  <div>              {/* ❌ a wrapper in the way is FINE — context crosses it */}
    <Select.Option />
  </div>
</Select>
```

The whole point of context is that it crosses arbitrary intermediate elements. If you find
yourself passing `ctx` down as a prop, you've re-implemented drilling and lost the benefit.

**3. Rendering children outside the parent.**

```jsx
const opt = <Select.Option value="x">X</Select.Option>;  // created here…
function App() {
  return <Select>{opt}</Select>;                          // …rendered here — still fine!
}
```

The option only *reads* context when it renders. As long as it's rendered inside the
provider, it works — another flex of the pattern, and a common "wait, that works?" moment.

**4. Forgetting the parent owns the state.** Two `Select`s must never share one `value`
through a module-level variable. Each `<Select>` mounts its own provider with its own
`useState` — state is per-instance by construction.

## 11. Best Practices

✅ Put all shared state in the parent; provide actions and data together, and memoise the
value object (Lesson 61)

✅ Keep context values minimal — split state context from actions context when consumers
re-render too much

✅ Attach children to the parent (`Select.Option = Option`) for a one-import API and clearer
docs

✅ Let children stay dumb — they read context and call the callbacks; the parent owns logic

❌ Don't use props to wire siblings together — that's prop drilling, not composition

❌ Don't bake markup or styling choices into the parent that consumers can't override

❌ Don't put non-state values in the provider object (inline functions/factories) — recreate
them outside render or memoise them

## 12. Interview Questions

**Q1. What is a compound component?**

> A parent component that shares state with its child components through context, with the
> children exposed as properties of the parent — `Select.Option` inside `Select`. The
> children get state implicitly, so callers compose freely without any wiring props.

**Q2. Why use context rather than passing props?**

> Prop drilling forces the parent to know every consumer's needs and rebuilds the API for
> each one. Context reaches through arbitrary composition and keeps the wiring in one place —
> the parent. State still flows down and callbacks flow up; the channel is just context
> instead of props.

**Q3. How would you design an accessible `Select`?**

> As a compound component: a `Select` parent owns open/selected state and the ARIA wiring,
> with `Select.Trigger` and `Select.Option` children consuming it through context. That gives
> consumers full control of the markup — which is what accessibility actually requires —
> while the library owns the state machine and the keyboard handling.

**Q4. What are the downsides?**

> The main one is that context changes re-render every consumer, even ones that don't use
> the changed slice — mitigated by splitting state/action contexts and memoising the value.
> Also, compounds give up a rigid, guaranteed API in exchange for composition, so the
> contract must be documented. And it's more moving parts than a simple `options` array.

**Senior follow-up: How is this different from what Headless UI or Radix do?**

> Same core — parent state through context — taken further. They render nothing themselves
> and expose the state machine through hooks, so consumers get full control of DOM and
> styling while the library owns state, focus management and accessibility. The compound
> surface is the user-friendly layer over that. It's the same pattern, productionised.

## 13. Follow-up Questions

**When would you prefer a plain props API over a compound?**

> When the component has a single fixed structure and few options — a simple `<Select
> options={…}>` where no consumer will restructure anything. Compounds pay in complexity, so
> they're worth it only when flexibility is real: open-ended children, custom markup, or
> multiple coordinated parts.

**Can compound components be controlled?**

> Yes — that's the escape hatch. The parent accepts `value` and `onSelect` as props and
> forwards them through context, giving the consumer the state. Uncontrolled by default,
> controlled on demand, exactly like `useState` from Lesson 50.

**How do you test a compound component?**

> Render the parent with children and assert through the public behaviour — click a trigger,
> see options, select one, read the callback. Because consumers compose children, the tests
> must cover realistic compositions, and the state assertions live at the parent.

## 14. Comparison Table

| | Prop drilling | Context (compound) | Global state (Lesson 82) |
|---|---|---|---|
| Wiring effort | High — every level passes props | Low — one provider, implicit children | Low, but wrong scope for this |
| Flexibility of children | Rigid — parent must know everything | Fully composable | Unrelated concern |
| Re-render blast radius | Contained to the drilled subtree | Every context consumer | Everything subscribed |
| When to use | A few levels, shallow tree | Composite UI with coordinated parts | App-wide shared data |
| Example | `<Panel title={…} body={…}/>` | `<Select>` / `<Select.Option>` | auth, theme, cart |

## 15. Code Example: The Full Pattern

Here's the complete working compound — plus a tiny extra: a `Group` wrapper that needs no
context at all, which is the point of composition.

```jsx
import { createContext, useContext, useState } from 'react';

const SelectContext = createContext(null);

function Select({ children }) {
  const [value, setValue] = useState('react');
  const [isOpen, setIsOpen] = useState(false);

  const api = { value, isOpen, onSelect: setValue, onToggle: () => setIsOpen(v => !v) };

  return (
    <SelectContext.Provider value={api}>
      {children}
    </SelectContext.Provider>
  );
}

function Trigger() {
  const { value, onToggle } = useContext(SelectContext);
  return <button onClick={onToggle}>{value} ▾</button>;
}

function Option({ value, children }) {
  const { value: selected, onSelect } = useContext(SelectContext);
  return (
    <li className={selected === value ? 'selected' : ''} onClick={() => onSelect(value)}>
      {children}
    </li>
  );
}

Select.Trigger = Trigger;
Select.Option = Option;
```

Usage — note the `Group` wrapper, which needs no context and no props:

```jsx
function App() {
  return (
    <Select>
      <Select.Trigger />
      <ul>
        <li><b>Frameworks</b></li>
        <Select.Option value="react">React</Select.Option>
        <Select.Option value="vue">Vue</Select.Option>
      </ul>
    </Select>
  );
}
```

```text
[react ▾]                        ← Trigger renders the current value
  Frameworks                     ← plain <li>, untouched by context
  react     ← marked .selected (selected === 'react')
  vue       ← click → onSelect('vue') → provider value changes → Trigger re-renders
```

> [!TIP]
> The `Trigger` didn't need a single prop. It knows the selected value and how to toggle
> because the provider handed them over. If that sentence feels obvious, you've got the
> pattern.

## 16. Performance Notes

- **The bill:** every consumer re-renders on any context-value change. A tiny `Select` — five
  options, two consumers — is free; ignore it (Lesson 71).
- **When it bites:** hundreds of rows with compound cells, or a value object recreated per
  render. Fix with a memoised provider value, then split state from actions if consumers
  still re-render on changes they don't use.
- **Rules of hooks still apply** (Lesson 66): children call `useContext` unconditionally at
  the top of the component — same constraint as every hook, and compounds don't change it.
- **Wrapping `<Select.Option>` in `React.memo` (Lesson 67) only helps if the context value is
  stable** — which is the same "memo needs stable references" rule from Lesson 71.

## 17. Debugging Scenarios

**"`value` is always null inside `Option`."** The option is rendering outside the provider —
check for a wrapper that renders children in a different tree (portals, a `createPortal`
target, a render-prop callback called outside). The provider must wrap whatever actually
renders the children.

**"Two options are both selected."** `selected === value` compares against a string — if an
option's `value` prop is a number and the parent's state is a string (or vice versa), the
comparison fails. Coerce, or compare the raw value the option passed in.

**"Everything re-renders when I select."** The context value object is recreated on every
render of the parent. Wrap it in `useMemo` (Lesson 61) with the right deps; if consumers
still re-render on changes they ignore, split state from actions into two contexts.

**"An option works, but my custom `div` wrapper's styles reset on select."** The parent owns
state, not markup — your wrapper re-renders because it's a context consumer. Give it a stable
identity or split the context so it doesn't consume the changing slice.

## 18. Quick Revision Notes

- Compound = parent owns state, children consume it via context, attached as
  `Select.Option = Option`
- No props between siblings — down through context, up through callbacks
- Composition in, API growth out: consumers own markup, parent owns state and ARIA
- Real evidence: Radix, Headless UI, MUI, React Router — and HTML's `<select>` is the prototype
- Cost: every consumer re-renders on context change — split context or memoise the value
- Works nested and across arbitrary wrappers because it's plain context

## 19. Cheat Sheet

```jsx
const Ctx = createContext(null);

function Parent({ children }) {
  const [value, setValue] = useState(null);
  // memoise: const api = useMemo(() => ({ value, setValue }), [value]);
  return <Ctx.Provider value={{ value, setValue }}>{children}</Ctx.Provider>;
}

function Child() {
  const { value, setValue } = useContext(Ctx);   // never a prop
  return <button onClick={() => setValue('x')}>{value}</button>;
}

Parent.Child = Child;                            // compound surface
```

## 20. Key Takeaways

> [!RECAP]
> - A compound component is a parent sharing state with its children through context
> - Children are attached to the parent: `Select.Option = Option` — one import, clear docs
> - State flows down, callbacks flow up — the parent is the single channel, no prop drilling
> - Consumers own the markup; the parent owns state, focus and accessibility
> - It's the design behind Radix, Headless UI, MUI and React Router — and HTML's `<select>`
> - The cost is context re-renders: memoise the value object, split state from actions

## Check your understanding

Answer these without looking back.

1. Why does `Select.Option` never receive `selected` or `onSelect` as props?
2. Walk through the full data flow: what happens when an option is clicked?
3. What problem does the compound pattern solve that a monolithic `<Select options={…}>` API
   can't?
4. Why is a plain `<div>` between `Select` and `Select.Option` harmless?
5. Explain the context re-render cost and the two standard mitigations.
6. Name two libraries that use this pattern, and the component that is the HTML prototype
   for it.

## What's Next

**Lesson 73 — Render Props.** The other great composition primitive: passing a function as
`children` so the parent hands rendering control — and its state — to the caller. Compound
components and render props often appear in the same component library.