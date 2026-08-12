# Lesson 48 — Components & Composition

**Interview importance:** ⭐⭐⭐⭐ — composition is the answer to most "how would you build"
questions in a React interview.

A component is a function that returns an element — that's it. Everything else in React
(framework, router, page, screen) is built by calling such functions and nesting the results.
Composition means building new UI by combining existing pieces, and it's the pattern that
answers more interview questions than any other: "how would you build X?" → "split it up, then
compose the parts."

Components are functions in the sense of Lessons 11 and 12: declarations hoist, arrows don't,
and a capitalised call `<Card />` is just a call to your function with props.

## Learning Objectives

By the end of this lesson you should be able to:

- Define a component precisely, and say what makes it renderable
- Use the `children` prop to compose layouts, with JSX, arrays and functions
- Split a screen into components and explain *why* it helps
- Recognise prop drilling and name the alternatives (Lesson 63)
- Answer "how would you build X" with the composition answer

## 1. One-line definition

**A component is a function that takes props and returns a React element — and composition
is building new components out of existing ones, especially via the `children` prop.**

## 2. Mental model

Components are like `<article>` tags in HTML: each one knows how to render its own content,
and you nest them to build a page. Composition is the difference between one giant document
and a page assembled from independent blocks — each block replaceable and reusable.

The `children` prop is the key: it's the hole in a layout where the caller's content goes,
like a photo frame that accepts any picture.

## 3. Visual flow

```text
  <Page>
    <Header />                     <Page>        <-- component
      │                             │
      ▼                             │ children
    <Sidebar />                     │
      │                             ├── <Header />     (own data)
      ▼                             ├── <Sidebar />    (own data)
    <Main>                          │
      │                             └── <Main>
      │   title, items                  │ title, items
      ▼                                 └── <Card title={..} />
    <Card title={...} />
```

Each box only knows its own props. `<Page>` never needs to know what `<Header>` renders —
that's the whole point of composition.

## 4. How it works

Two equivalent spellings of the same component. Both take a props object; both return an
element:

```jsx
// function declaration — hoisted
function Greeting({ name }) {
  return <p>Hello, {name}!</p>;
}

// arrow function — not hoisted
const Farewell = ({ name }) => <p>Goodbye, {name}!</p>;

// Components are just functions that return elements
console.log(<Greeting name="Mansha" />);
```

Output:

```text
{ type: [Function: Greeting],
  key: null,
  ref: null,
  props: { name: 'Mansha' } }
```

Note the type is the *function itself*, not a string — that's what distinguishes a component
from a DOM tag in Lesson 47.

The **`children` prop** is what composition is built on. Every component receives it, whether
you destructure it or not:

```jsx
function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="card-body">{children}</div>
    </div>
  );
}

const card = <Card title="Overview">
  <p>Any content at all.</p>
</Card>;

console.log(card.props.children.type);
```

Output:

```text
p
```

The nested `<p>` landed in `props.children` — a slot filled by whoever uses `<Card>`. The
caller decides the content; `Card` decides the chrome around it.

`children` is just a prop, so it can be anything: a string, an element, an array, or a
**function** (render props, Lesson 73):

```jsx
function List({ children }) {
  return <ul>{children}</ul>;   // children: array of <li> elements
}

function DataList({ data, render }) {
  return <ul>{data.map(render)}</ul>;   // children as a function
}
```

## 5. Real project usage

| Problem | Composition answer |
|---|---|
| Shared page layout | A `<Layout>` component with `children` for the content slot |
| Reusable card/modal | `<Card>` / `<Modal>` taking `title`, `footer`, `children` |
| Lists | `<List>` with `<Item>` children, or `data.map(<Item />)` |
| Generic containers | `<div className="…">{children}</div>` wrappers, e.g. `Container`, `Section` |
| Flexible headers | `<Header>` with `actions` or `extra` slots |
| Any "would you build X?" | "Split it into small pieces and compose them" |

Splitting a screen into components helps for three concrete reasons:

- **Readability** — the render function stays a few lines of composition instead of 100 lines
  of markup
- **Reuse** — the same `<Card>` / `<Field>` / `<Button>` appears across screens with
  different children
- **Testability** — small pure components are trivial to test in isolation (Lesson 99)

## 6. Interview explanation

> A component is a function that returns an element. Composition is building bigger
> components out of smaller ones, and the `children` prop is what makes it work — a component
> can render its own structure while leaving a slot for whatever the caller passes. So
> layouts, lists and reusable UI are built by nesting components, not by config objects or
> giant conditionals.

## 7. Senior-level insights

- **The `children` prop is the flagship composition pattern.** If an interview starts with
  "how would you build…", the answer begins with splitting the UI and ends with wiring the
  pieces through `children`.
- **Composition over configuration.** A `<Button variant="primary">` config prop is fine;
  a `<Button>` with twenty config options is a design smell. The composed alternative is a
  `<PrimaryButton>` that internally renders the base `<Button>`.
- **A component is a function — but it's not *called* like one.** You write `<Card />`, not
  `Card()`. Hand-writing `Card()` in the render body runs the component mid-render, loses the
  element identity React relies on (Lesson 51), and breaks hook rules (Lesson 66).
- **Named, pure, small components.** Component purity (Lesson 14) is what makes React
  predictable: same props in, same element out.
- **Fragments are composition too** — grouping children without an extra DOM node.

## 8. Common mistakes

- Huge render functions: one component, 150 lines of JSX. Split it.
- `<div>` soup: wrapper divs everywhere instead of fragments `<>…</>`, especially for lists.
- Calling components as functions in the render body (`{Card()}`) instead of `<Card />`.
- Re-creating components inside render: `const Item = () => …` inside a parent makes React
  remount it on every render (identity changes every time).
- Treating the whole app as one component and passing 30 props down — prop drilling (Lesson 49).
- Deeply nested props for styling/behaviour that should have been `children` or context.

## 9. Best practices

✅ Split when a render function exceeds ~50 lines or mixes concerns

✅ Use `children` for layouts and wrappers — the caller decides content

✅ Give a component one job and a descriptive name: `UserCard`, not `Thing`

✅ Keep components pure: same props → same output (Lesson 14)

✅ Compose instead of configuring: a small hierarchy of focused components

❌ Don't define components inside other components' render bodies

❌ Don't call components as plain functions in JSX position

❌ Don't build configuration-driven mega-components with ten `variant`s

## 10. Interview questions

**Q1. What is a component?**

> A function that takes a props object and returns a React element. React calls it during
> rendering and uses the returned element tree to build the UI. A capitalised tag like
> `<Card />` is how a component is referenced in JSX.

**Q2. What is composition?**

> Building bigger components from smaller ones, passing elements down through props —
> especially `children`. Instead of one component that configures everything, you split the
> UI and let each parent decide its own structure, nesting components together.

**Q3. What is the `children` prop?**

> A special prop every component receives, containing the elements written between its
> opening and closing tags. A layout component renders its own structure and puts
> `{children}` in the content slot — the caller decides what goes in, the component decides
> the chrome around it. It can also be a function, which is the render-prop pattern.

**Q4. How would you build a reusable modal?**

> Split it: a `Modal` that handles the overlay, focus and escape key and takes `title`,
> `onClose` and `children`; a `ConfirmDialog` built on `Modal` with its own actions; and the
> app just composes them. The structure is one level of generic base plus composed
> specialisations — no configuration flags needed.

**Q5. How do you avoid huge render functions?**

> Extract. If a block of JSX has a clear name, it becomes its own component with props. The
> parent render then reads as a short list of composed pieces instead of a wall of markup —
> which is also the answer to most "how would you build" questions in interviews.

**Senior follow-up: Composition vs configuration — when is configuration right?**

> Configuration wins when the variation is genuinely data-driven — a small set of options
> that changes a rendering, like a `variant` prop on a button. It loses when components grow
> boolean flags and conditional branches for every feature. The test: if composing two small
> components is clearer than adding a tenth prop, compose. Real libraries do both — a base
> primitive plus composed specialisations.

## 11. Follow-up questions

**What is prop drilling, and how do you avoid it?**

> Passing props through components that don't use them, just to reach a deeper one. The
> first fix is better composition — moving the shared piece up or restructuring. When state
> genuinely belongs high, context (Lesson 63) skips the intermediate components without
> turning into a global state manager.

**Why is `children` better than an `items` prop for some cases?**

> Because it's a slot: the caller brings any structure — a button, a form, nested cards —
> rather than forcing a data shape on the parent. `children` composes; a data prop
> configures. Each has its place.

**What's the difference between a component and an element?**

> A component is a function (the *type*). An element is the object returned when React calls
> it (the *instance*). `<Card />` creates an element whose type is the `Card` function;
> `{ type: Card, props }` is data. Same distinction as function vs call result.

## 12. Comparison table

| | `children` | config props | context | render props |
|---|---|---|---|---|
| What flows | elements | values | values | a function |
| Who decides content | caller | parent | ancestors | caller |
| Coupling | loose | tight | loose (but hidden) | loose |
| Typical use | layouts, wrappers | data, variants | shared state | flexible rendering |
| Overuse risk | awkward deep nesting | prop explosion | over-rendering | verbose JSX |

## 13. Code example

A layout built by composition — three pieces, no shared state:

```jsx
function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="card-body">{children}</div>
    </div>
  );
}

function CardGrid({ children }) {
  return <div className="card-grid">{children}</div>;
}

// The app composes cards into a grid — Card and CardGrid know nothing about each other.
const grid = (
  <CardGrid>
    <Card title="One">First card's content.</Card>
    <Card title="Two">Second card's content.</Card>
  </CardGrid>
);

console.log(grid.props.children.length);        // two cards in the grid
console.log(grid.props.children[0].props.title); // first card's title
```

Output:

```text
2
One
```

The grid only sees its `children`; the cards only see their own props. Nothing had to know
about anything else.

## 14. Performance notes

- Composition itself is free — it's just function calls and element objects (Lesson 47).
- Splitting components is the *first* re-render tool: a change in `<Card>` re-renders only
  that branch, not the whole tree.
- `children` identity is a real optimisation surface: when a parent re-renders but the
  `children` reference it passes is stable, memoised children (Lesson 67) can skip work.
- Creating a component inside another component's render breaks identity every render —
  React remounts it, which is worse than any micro-optimisation.

## 15. Debugging scenarios

**Component doesn't render, no error.** A lowercase name made it a DOM tag, or the component
returns `null` for the current props. Check the tag case (Lesson 47) and the return path.

**"Element type is invalid: expected a string or a class/function but got: object."** A
module object was passed where a component was expected — `import { Card }` when the file has
`export default Card`, or an undefined default export.

**A component remounts and loses state on every parent render.** Likely a component defined
inside the render body — new function identity each render. Hoist it out of the parent.

**Children render in the wrong place, or not at all.** Forgot `{children}` in the layout —
the slot is missing, so content vanishes. Forgetting to render a prop at all is the same
family.

**Layout looks right but state resets when switching views.** Each render produces fresh
elements; if the *position* of a component changes (different branch, different key), React
treats it as a new component (Lesson 51). Keys fix this — Lesson 52.

## 16. Quick revision notes

- Component = function(props) → element; Capitalised in JSX
- Composition = nesting components; the flagship pattern is `children`
- `children` is a slot: caller decides content, component decides chrome
- `children` can be a string, element, array, or function (render props)
- Hand-raise `Card()` calls in render — use `<Card />`
- Don't define components inside render bodies (identity breaks)
- Split renders: named pieces beat a wall of JSX
- Composition over configuration for "how would you build X"
- Context (Lesson 63) fixes prop drilling when restructuring isn't enough

## 17. Cheat sheet

```jsx
// 1. A component is a function returning an element
function Avatar({ user }) {
  return <img src={user.avatar} alt={user.name} className="avatar" />;
}

// 2. Compose with children — the layout defines the slot
function Page({ title, children }) {
  return (
    <main>
      <header>{title}</header>
      <section>{children}</section>
    </main>
  );
}

// 3. Use it
function App() {
  return (
    <Page title="Dashboard">
      <Avatar user={currentUser} />       {/* slot content */}
      <p>Whatever the caller wants.</p>
    </Page>
  );
}

// 4. Favour composition over config props
//    ❌ <Button variant="primary" size="lg" disabled={!ok} …>
//    ✅ <PrimaryButton /> = <Button /> composed with defaults
```

## 18. Key takeaways

> [!RECAP]
> - A component is a function that returns an element; `<Card />` is a call, `Card` is the type
> - Composition is building bigger UI from smaller components, primarily via `children`
> - `children` is a slot — the caller brings the content, the component brings the chrome
> - `children` can be an element, an array, or a function (render props)
> - Split big renders into named, pure, single-purpose components
> - Prefer composition over configuration for flexible UI
> - Components defined inside renders remount every time — hoist them out
> - Prop drilling is a symptom; restructure first, then reach for context (Lesson 63)

## Check your understanding

Answer these without looking back.

1. Define a component in one sentence.
2. What is the `children` prop, and what can its value be?
3. Why is a card built from `children` more flexible than one with `items` and `footer`
   props? When is the data prop still the right call?
4. Give two reasons splitting a large render into components helps.
5. What's wrong with calling `Card()` directly inside JSX instead of `<Card />`?
6. Why does defining a component inside another component's render body cause remounts?
7. How do you answer "how would you build X" in an interview?

## What's Next

**Lesson 49 — Props.** Data flows down through the props object — how to type, default,
destructure, and pass props without losing the composability this lesson just built.
