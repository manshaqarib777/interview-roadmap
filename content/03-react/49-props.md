# Lesson 49 — Props

**Interview importance:** ⭐⭐⭐ — props are to React what arguments are to functions, and
everything that follows builds on them.

Props are the one-way data channel of a React app: parent → child, through the props object,
read-only. Props in, elements out — that contract is what makes components predictable
(Lesson 48) and what makes React's rendering model testable. It's foundational: later lessons
build directly on this.

Two mental shifts from JavaScript land: props flow *down* only, and they are *read-only* from
the child's perspective. Everything else you already know — they're just function arguments.

## Learning Objectives

By the end of this lesson you should be able to:

- Read a component's props with destructuring and defaults
- Say precisely why props are read-only, and what the mutation pitfall is
- Pass any value through props — primitives, functions, elements, children
- Handle props in TypeScript with a typed `Props` interface
- Distinguish props (inputs) from state (internal, Lesson 50)

## 1. One-line definition

**Props are the read-only arguments a parent passes to a component — one plain object per
call, flowing strictly downward.**

## 2. Mental model

Think of a component as a function and props as its parameters: `<Card title="x" />` is
`Card({ title: 'x' })` in disguise (Lesson 47). The parent chooses the arguments, the child
only reads them.

For the data-flow picture: props are gravity — data falls down. If a child needs something
the parent didn't pass, you lift state or use context (Lessons 55 and 63), never a side
channel.

## 3. Visual flow

```text
        App
         │  <UserCard user={user} onSelect={handleSelect} />
         ▼
      UserCard                       <-- receives  { user, onSelect }
       │  <Avatar user={user} />         user flows further down
       ▼
      Avatar                        <-- receives  { user }
```

Props never travel sideways or up. Every level only knows what it was given.

## 4. How it works

Props arrive as one object; destructuring in the parameter list is the house style:

```jsx
function Greeting({ name, lang = 'en' }) {
  return <p>{lang === 'en' ? `Hello, ${name}!` : `مرحباً، ${name}!`}</p>;
}

const el = <Greeting name="Mansha" />;

console.log(el.props);            // what the parent passed
console.log(<Greeting name="Ali" lang="ar" />.props);
```

Output:

```text
{ name: 'Mansha' }
{ name: 'Ali', lang: 'ar' }
```

`lang` defaults to `'en'` when the parent omits it — default parameter syntax (Lesson 11),
nothing special.

Values that come through props — a function handler, an element (from Lesson 48), children:

```jsx
function Greeting({ name, onGreet, children }) {
  return <button onClick={onGreet}>{children || `Hello, ${name}!`}</button>;
}

const el = <Greeting name="Mansha" onGreet={() => console.log('hi')}>
  <strong>Welcome!</strong>
</Greeting>;

console.log(el.props.onGreet);   // the function, passed as a value
console.log(el.props.children.type);
```

Output:

```text
[Function (anonymous)]
strong
```

The `onGreet` handler travelled as a normal value, and the nested `<strong>` landed in
`children` — both just props.

In TypeScript, props are a typed interface (Lesson 31):

```tsx
type GreetingProps = {
  name: string;
  lang?: 'en' | 'ar';            // optional, union-typed
  onGreet?: () => void;
};

function Greeting({ name, lang = 'en', onGreet }: GreetingProps) {
  return <button onClick={onGreet}>{lang === 'en' ? name : `مرحباً ${name}`}</button>;
}
```

Unknown or mistyped props now fail at compile time instead of rendering `undefined` at
runtime.

## 5. Real project usage

| What flows down | Example |
|---|---|
| Data | `<UserCard user={user} />` |
| Callbacks | `<SearchInput onChange={setQuery} />` |
| Configuration | `<Button variant="primary" disabled={!valid} />` |
| Elements (children) | `<Modal title="…" footer={<Actions />}>{content}</Modal>` |
| Functions (render props) | `<DataList data={rows} render={row => <Row {...row} />} />` |
| Style classes | `<Card className="featured" />` |

Callbacks are the interesting case — the parent passes a function, the child calls it with
its own arguments:

```jsx
function SearchBox({ onQueryChange }) {
  // the child owns the input; the parent owns the state
  return <input onChange={(e) => onQueryChange(e.target.value)} />;
}
```

The input is *controlled* — value lives in the parent — which is the pattern Lesson 54 builds
on.

## 6. Interview explanation

> Props are the read-only arguments a component receives from its parent. They flow one way,
> down the tree, and a component never changes its own props — it renders from them. Anything
> can travel through props: values, functions, elements. Because they're just inputs, a
> component with the same props renders the same output, which is what makes React
> predictable.

## 7. Senior-level insights

- **Props are the public API of a component.** A well-designed component takes few props that
  are obvious at the call site — the signature *is* the documentation.
- **Functions as props are the composition seam.** `children` and render props (Lessons 48
  and 73) are props doing the heavy lifting.
- **Read-only is the contract.** Props are inputs; state (Lesson 50) is internal; derived
  values are computed in render (Lesson 55). Mixing the three is the source of most sync bugs.
- **Naming matters.** `onSomething` for callbacks, `something` for data — a codebase where
  the handler naming is consistent reads itself. TS enforces it (Lesson 31).
- **Destructuring in the signature** beats `props.` noise — but keep the pattern, whatever
  it is. Consistency across a team beats micro-preference.

## 8. Common mistakes

- **Mutating props** — `user.name = 'x'` inside a child. It works until it doesn't, because
  it silently changes the parent's data (Lesson 6's reference semantics). Read-only means
  read-only.
- **Prop drilling** — threading `onEdit`, `onDelete`, `onArchive` through five components
  that never use them. Restructure, then context (Lesson 63).
- **`defaultProps` where a default parameter would do** — the function-syntax default is
  simpler and type-checks.
- **Missing default for a required-looking prop** — `undefined` renders as nothing; in TS,
  make the prop required unless the default is real.
- **Passing keys or refs as if they were props** — `key` is special (Lesson 52), `ref` too
  (Lesson 60); they never reach `props`.
- **Shadowing** — `const { name } = props` then `props.name` elsewhere; pick destructuring.

## 9. Best practices

✅ Destructure props in the parameter list, with defaults at the same spot

✅ `onXxx` for function props, plain names for data — consistent everywhere

✅ Keep props typed with a named `Props` type in TS

✅ Pass children instead of content props where the caller should own structure (Lesson 48)

✅ Name props after what they mean, not how they render: `variant`, not `isBlue`

❌ Don't mutate props in a child — copy or lift instead

❌ Don't spread `{...props}` onto DOM elements blindly (class/aria issues; Lesson 47)

❌ Don't thread the same prop through five levels when composition fixes it

## 10. Interview questions

**Q1. What are props?**

> The read-only arguments a component receives from its parent — one object per call. Props
> flow one way, down the tree, and a component never changes them; it renders from them.
> They can carry values, functions, or elements, and `children` is just the special prop for
> nested JSX.

**Q2. Are props read-only? Why?**

> Yes. The component is a function and props are its inputs; changing them would mutate the
> parent's data and break the "same props → same output" guarantee that makes React's render
> model predictable. If a child needs different data, the parent re-renders it with new props
> (Lesson 51). The child never writes to them.

**Q3. How do you pass data from child to parent?**

> You don't pass data up — you pass a callback down. The parent passes `onChange`, the child
> calls it with its own value, and the parent decides what to do. That keeps the one-way data
> flow intact.

**Q4. What's the difference between props and state?**

> Props come from the parent, are read-only, and changing them re-renders the component.
> State is internal to the component, created with `useState`, and owned by the component
> itself. Same effect on rendering, opposite ownership.

**Q5. How do you set default values for props?**

> Default parameters in the destructuring — `function Card({ title = 'Untitled' })`. No
> `defaultProps` needed. In TypeScript, mark truly optional props with `?` and the union
> types make the defaults type-safe.

**Senior follow-up: When does prop drilling stop being acceptable, and what do you do?**

> When a prop is only a courier — the intermediate components never use it, just forward it.
> First restructure: compose so the value is passed where it's needed (Lesson 48). If the
> value genuinely belongs high, use context (Lesson 63) to skip the middle layers. What you
> don't do is reach for a global store for a prop that's just traveling two levels.

## 11. Follow-up questions

**Can a component change its own props?**

> No — that's what state is for. A component that tries to mutate props is breaking the
> contract and corrupting the parent's data. New data arrives as new props on the next
> render (Lesson 51).

**What happens if a required prop is missing?**

> In plain JS, `undefined` — often silently rendering nothing. In TypeScript, a compile
> error, which is exactly why typed props (Lesson 31) catch the whole class of bug.

**Why are keys not props?**

> `key` is read by React's reconciliation (Lesson 52) to track list items across renders —
> it never reaches the component, so you can't read `props.key`. It's metadata for React,
> not data for the component.

## 12. Comparison table

| | Props | State | Context |
|---|---|---|---|
| Where defined | parent | component | ancestor provider |
| Direction | parent → child | internal | ancestor → consumers |
| Mutability | read-only | update via setter | read-only |
| Causes re-render | when parent passes new ones | on update | when value changes |
| When to use | inputs, callbacks | internal data | shared data across branches (Lesson 63) |

## 13. Code example

Props end to end — data, callback and children in one component:

```jsx
function UserCard({ user, onSelect, children }) {
  return (
    <div className="user-card">
      <img src={user.avatar} alt={user.name} />
      <h3>{user.name}</h3>
      <p>{user.role}</p>
      {children}
      <button onClick={() => onSelect(user)}>View</button>
    </div>
  );
}

const el = (
  <UserCard user={{ name: 'Mansha', role: 'Engineer', avatar: 'm.png' }} onSelect={u => console.log('selected', u.name)}>
    <span className="badge">online</span>
  </UserCard>
);

console.log(el.props.user.name);      // data
console.log(el.props.onSelect);       // callback
console.log(el.props.children.type);  // children — an element
```

Output:

```text
Mansha
[Function (anonymous)]
span
```

One call site, three kinds of prop, all read by `UserCard` as a single `props` object.

## 14. Performance notes

- Props are values, not bindings: when the parent re-renders, the child gets a *new props
  object* — even if nothing changed. That's the re-render model of Lesson 51.
- The cost is identity, not shape. `{...props}` spreads and inline object props create fresh
  references each render, which matters for memoisation (Lesson 67).
- Callbacks defined inline re-create identity each render too — relevant to `useCallback`
  (Lesson 62), not usually a problem on its own.
- Deep prop chains are a readability problem before they're a performance one.

## 15. Debugging scenarios

**Child renders `undefined`/blank where a value should be.** The prop was never passed or is
mistyped. In TS this is a compile error; in JS, log the props object at the top of the
component to see what arrived.

**"Cannot read property of undefined" inside a child.** An object prop arrived as
`undefined` — the parent didn't pass it yet (async data, Lesson 25). Guard or default:
`user?.name` or `user = {}` as a default parameter.

**Component doesn't re-render when a prop "changes".** You mutated the object instead of
passing a new reference — React compares props by reference (Lesson 51). Copy and pass a new
object: `setUser({ ...user, name: 'x' })`.

**A callback prop calls with stale data.** The handler was created in an earlier render and
closed over old state (Lesson 5). The fix is usually in the parent's state handling (Lesson 50),
not the child.

**The whole tree flashes/re-renders when you type.** A state update in a high component
(Lesson 50) re-renders everything below; props are just the delivery mechanism. Narrow the
state (Lesson 48) or memoise (Lesson 67).

## 16. Quick revision notes

- Props = read-only function arguments, flowing parent → child
- Destructure in the signature; defaults are default parameters
- Anything can be a prop: values, functions, elements, children
- `children` is a prop too (Lesson 48)
- Never mutate props — copy or lift instead
- Child → parent communication is a callback prop, never data-up
- `key` and `ref` are special; they never land in `props`
- Prop drilling: restructure, then context (Lesson 63)
- Type props with a `Props` interface in TS (Lesson 31)

## 17. Cheat sheet

```tsx
type ButtonProps = {
  label: string;
  variant?: 'primary' | 'ghost';       // optional, typed
  disabled?: boolean;
  onClick?: () => void;                // callback prop
  children?: React.ReactNode;          // slot prop
};

function Button({ label, variant = 'primary', disabled, onClick, children }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} disabled={disabled} onClick={onClick}>
      {label}
      {children}
    </button>
  );
}

// Usage — data, callback and children in one call:
<Button label="Save" variant="primary" onClick={() => save()}>
  <span className="icon">💾</span>
</Button>
```

## 18. Key takeaways

> [!RECAP]
> - Props are the read-only, one-way inputs a component receives from its parent
> - They're ordinary function arguments — destructure them, default them, type them
> - Data flows down; communication flows up as callback props
> - `children` is a prop; so is a render function (Lesson 73)
> - Mutating props corrupts the parent's data — new data arrives as new props (Lesson 51)
> - Missing props are `undefined` in JS and compile errors in TS
> - Prop drilling is a design smell: restructure, then use context (Lesson 63)
> - Props vs state is the ownership question — props are external, state is internal (Lesson 50)

## Check your understanding

Answer these without looking back.

1. What exactly does `<Card title="x" />` do at runtime, in terms of functions?
2. Why can't a child change its own props? What would it break?
3. How does a child communicate *up* to its parent?
4. What are three kinds of value that can travel through a prop?
5. How do you give a prop a default value — and how does that look in TypeScript?
6. Why are `key` and `ref` not accessible as props?
7. What's the difference between props and state? Whose job is each?

## What's Next

**Lesson 50 — State & `useState`.** The flip side of the ownership coin: how components
hold their own data, why updates are asynchronous and batched, and the stale-closure trap
that trips everyone up.
