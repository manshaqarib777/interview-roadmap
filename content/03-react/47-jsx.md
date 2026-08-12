# Lesson 47 — JSX

**Interview importance:** ⭐⭐⭐ — you write it every day, but most candidates can't say what it is.

JSX is a function call. Knowing what it compiles to explains the rules around it: why it's
`className` and not `class`, why you can embed expressions but not statements, why components
must be capitalised, why comments look weird. Once you see every JSX tag as the first argument
of a function call, there is nothing left to memorise.

It is not HTML, not a template language, and not a requirement. It's a compile-time transform
(from the toolchain world of Lesson 28) that turns markup-looking code into plain function
calls before your code ever runs.

## Learning Objectives

By the end of this lesson you should be able to:

- Say what JSX compiles to, and name both runtime transforms
- Explain the `className` rule and every other naming rule from the transform
- Distinguish expressions from statements inside `{}` — and know which are legal
- Translate any JSX snippet into `createElement` calls in your head
- Answer "what is JSX" with the function-call answer, not "HTML in JS"

## 1. One-line definition

**JSX is syntax sugar for a function call — `React.createElement(type, props, ...children)` in
the classic runtime, `jsx(type, props)` in the automatic runtime (React 17+).**

## 2. Mental model

Think of JSX as shorthand the compiler expands into nested function calls before your code
runs — like `2 ** 10` is shorthand for a loop of multiplications. The tag is the function
name, the attributes become one props object, and the children become the remaining arguments.

You never see the expansion in production. But every rule about JSX is a rule about a
function call, which is why understanding the expansion is the whole trick.

## 3. Visual flow

```text
  <div className="card">
    <h1>Hello</h1>
  </div>

        │  Babel / esbuild / SWC (build time)
        ▼

  createElement('div', { className: 'card' },
    createElement('h1', null, 'Hello'),
  )

        │  React runtime (render time)
        ▼

  { type: 'div',
    props: { className: 'card',
             children: [ { type: 'h1', props: { children: 'Hello' } } ] } }
```

## 4. How it works

A mini `createElement` shows the exact shape JSX produces. Real React returns an object
with `type` and `props`; children are normal arguments:

```js
function createElement(type, props, ...children) {
  return { type, props: props || {}, children };
}

// This is exactly what  <div className="card">Hello</div>  becomes:
const el = createElement('div', { className: 'card' }, 'Hello');

console.log(JSON.stringify(el, null, 2));
```

Output:

```text
{
  "type": "div",
  "props": {
    "className": "card"
  },
  "children": [
    "Hello"
  ]
}
```

Every rule falls out of this shape:

- **`class` → `className`.** `class` is a reserved word in JS, so it can't be a bare object
  key. Same story for `for` → `htmlFor`, `tabindex` → `tabIndex`, `stroke-width` →
  `strokeWidth`.
- **Lowercase tag → string; Capitalised tag → component.** The first argument is a string
  (`'div'`) for DOM elements, or a function reference for your components.
- **Expressions, not statements.** `{}` evaluates an *expression*. `if`, `for`, `const` are
  *statements* — they produce no value, so they can't appear there.

```js
const ok = true;

// ✅ Any expression works — a ternary is an expression.
const el = createElement('p', null, ok ? 'yes' : 'no');

// ❌ Statements produce no value — this is a SyntaxError in JS itself.
// const bad = createElement('p', null, if (ok) 'yes');

console.log(el.children[0]);
```

Output:

```text
yes
```

The automatic runtime (React 17+, the default) moves children into the props object and
drops the variadic `...children` — same object shape, slightly different call:

```js
// <div className="card">Hello</div>  compiles to:
function _jsx(type, props) {
  return { type, ...props };
}

console.log(_jsx('div', { className: 'card', children: 'Hello' }));
```

Output:

```text
{ type: 'div', className: 'card', children: 'Hello' }
```

```narrate
line: Both transforms are the same idea — a plain object describing a node.
line: The rules around JSX (className, casing, expressions) are just rules about that object's keys and values.
```

## 5. Real project usage

| Pattern | JSX | What's happening |
|---|---|---|
| Conditional render | `{isLoggedIn ? <Profile /> : <LoginButton />}` | ternary is an expression |
| List | `{items.map(i => <Item key={i.id} data={i} />)}` | `map` returns an array of elements |
| Event handler | `<button onClick={() => save(id)}>Save</button>` | the handler is a value in braces |
| Spread props | `<Input {...field} />` | props object spread into the call |
| Dynamic tag | `const Tag = as === 'a' ? 'a' : 'button'; return <Tag />;` | first argument decides |

## 6. Interview explanation

> JSX is syntax sugar for a function call. `<div className="card">Hi</div>` compiles — at
> build time, not runtime — into `createElement('div', { className: 'card' }, 'Hi')`, which
> returns a plain object describing that part of the UI. The rules follow from that: reserved
> words get renamed (`class` → `className`), capitalised tags are component references while
> lowercase tags are DOM strings, and inside `{}` you can write any expression because the
> result is just an argument to the call.

## 7. Senior-level insights

- **JSX is data.** Elements are plain, immutable descriptors. You can store them, pass them
  as props (that's the `children` slot and render props from Lessons 48 and 73), conditionally
  pick one, even transform them.
- **Fresh objects every render is normal.** Elements are recreated on every render by design;
  reconciliation (Lesson 51) decides what actually changes. "Too many elements" is almost
  never the bottleneck.
- **Fragments exist because one call returns one root.** `return <>…</>` wraps children in a
  `type: Fragment` element that renders no DOM node.
- **Know both runtimes.** Naming the classic vs automatic transform — and that automatic has
  been the default since React 17 — instantly signals you've read modern docs.
- **`key` is not a prop.** It's read by React's reconciliation, not passed to your component
  (Lesson 52).

## 8. Common mistakes

- `class="x"` instead of `className="x"` — silently ignored (and a console warning).
- A statement in braces: `{if (ok) <p />}` — SyntaxError.
- `{count && <p>…</p>}` when `count` is `0` — renders a literal `0`.
- Lowercase custom component: `<myButton />` becomes a DOM tag `'mybutton'`, not your
  component.
- Comments written as HTML: `<!-- … -->` renders as visible text; the JSX form is
  `{/* … */}`.
- `onclick` (HTML) instead of `onClick` — React events are camelCase and synthetic.

## 9. Best practices

✅ Use `className`, `htmlFor`, `tabIndex` — every DOM attribute is camelCased

✅ Use ternaries and `&&` for conditionals; extract the branch when it gets long

✅ Use fragments `<>…</>` instead of wrapping divs that exist only to satisfy one root

✅ Keep JSX in `return`-shaped renders — extraction (Lesson 48) beats monster expressions

❌ Don't write `class`, `for` or kebab-case attributes in JSX

❌ Don't put a statement inside `{}` — compute the value above the `return`

## 10. Interview questions

**Q1. What is JSX?**

> Syntax sugar for a function call. It compiles at build time to `createElement` (classic
> runtime) or `jsx` (automatic runtime), producing a plain object with `type` and `props`
> that describes a node in the UI tree. It's not HTML and not a template language.

**Q2. Why `className` and not `class`?**

> Because JSX compiles to an object literal, and `class` is a reserved word in JavaScript —
> `{ class: 'x' }` is invalid. So the DOM attribute is renamed `className`. The same rename
> covers `for` → `htmlFor`, `tabindex` → `tabIndex`, and every kebab-case attribute to camelCase.

**Q3. What can you put inside `{}`?**

> Any JavaScript expression — a value, a variable, a ternary, a `map` call, another JSX
> element. Not statements: `if`, `for`, `switch`, `const` produce no value and are SyntaxErrors.
> If you need a statement, compute the value above the `return` and embed the variable.

**Q4. Can a component start with a lowercase letter?**

> It compiles, but it stops being your component. Lowercase tags become strings — `'div'`,
> `'button'` — while Capitalised tags become function references. A lowercase `<myButton />`
> becomes a DOM element called `mybutton`, which doesn't exist.

**Q5. What does JSX compile to?**

> Two runtime transforms. Classic: `React.createElement(type, props, ...children)`, where
> children are extra arguments. Automatic (React 17+ default): `jsx(type, props)` with
> children folded into the props object. Both return the same shape: `{ type, props }`.

**Senior follow-up: Why does React bother with JSX at all — why not just call createElement?**

> Because the call-based form is unreadable at scale — ten nested `createElement`s for one
> card. JSX trades a build step for source that mirrors the output tree. The deeper point is
> that the UI is *data*: because elements are plain objects, they can be passed around,
> stored, and transformed — which is exactly what composition (Lesson 48) and render props
> (Lesson 73) exploit.

## 11. Follow-up questions

**Is JSX a template language?**

> No. Templates interpolate strings at runtime; JSX is compiled to function calls at build
> time and never does string parsing. That's why there are no runtime escaping concerns the
> way there are in server-side templates.

**Can you use JSX without React?**

> Yes — with the automatic runtime or a custom `jsx` pragma, JSX compiles to whatever function
> you point it at. Preact, Solid and others do exactly this. The transform is generic; React
> is just the most common target.

**Is JSX required to build a React app?**

> No. You can call `createElement` directly, or use `createElement`-style helpers. JSX is a
> developer-experience layer, not a runtime requirement.

## 12. Comparison table

| | JSX | HTML | Template string | `createElement` |
|---|---|---|---|---|
| Processed at | build time | served as-is | runtime | runtime |
| Is it a value? | yes, an element | no | yes, a string | yes, an element |
| Expressions | `{expr}` | none | `${expr}` | arguments |
| `class` keyword | `className` | `class` | n/a | `className` |
| Components | Capitalised tags | none | none | function refs |
| Escaping | by construction | needs care | needs care | by construction |

## 13. Code example

A tiny renderer proves the whole pipeline — compile, object, string output:

```js
function createElement(type, props, ...children) {
  return { type, props: props || {}, children };
}

function render(el) {
  if (typeof el === 'string' || typeof el === 'number') return String(el);
  const { type, props, children } = el;
  const attrs = Object.entries(props)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join('');
  return `<${type}${attrs}>${children.map(render).join('')}</${type}>`;
}

// What  <div className="card"><h1>Hi</h1><p>It works</p></div>  becomes:
const tree = createElement(
  'div',
  { className: 'card' },
  createElement('h1', null, 'Hi'),
  createElement('p', null, 'It works')
);

console.log(render(tree));
```

Output:

```text
<div class="card"><h1>Hi</h1><p>It works</p></div>
```

## 14. Performance notes

- JSX itself costs nothing at runtime — it's compiled away. The objects it creates are the
  work, and they're cheap by design.
- Fresh elements per render are expected; React diffs them (Lesson 51). Avoiding *unnecessary
  renders* matters far more than the element allocations.
- Never use a template string to build UI: string parsing per render, no escaping by
  construction, and React can't reconcile strings.

## 15. Debugging scenarios

**"Element type is invalid: expected a string (for built-in components) or a class/function
but got: object".** You passed a module object instead of the component — `import Card from
'./Card'` gives the default export; `import { Card }` with a named export. The first argument
is `undefined` or an object, not a string or function.

**Warning: "Invalid DOM property `class`. Did you mean `className`?"** An HTML attribute
slipped through. Same family: `for` → `htmlFor`, `tabindex` → `tabIndex`.

**Visible text like `<!-- comment -->` or `0` on screen.** `{/* */}` is the comment form;
`<!-- -->` renders as text. `{count && <p/>}` renders `0` when `count` is falsy-but-printable
— use `{count > 0 && <p/>}` or a ternary.

**Whitespace text nodes.** Line breaks between elements in the source become text children;
they're usually harmless, but they show up when you inspect `props.children`. Formatting
tricks: put elements on one line or use fragments.

## 16. Quick revision notes

- JSX compiles to a function call → element object `{ type, props }`
- Classic runtime: `React.createElement(type, props, ...children)`
- Automatic runtime (17+): `jsx(type, props)` — children live in `props`
- Reserved words are renamed: `class`→`className`, `for`→`htmlFor`, `tabindex`→`tabIndex`
- Lowercase tag = DOM string; Capitalised tag = component reference
- `{}` takes expressions only — statements are SyntaxErrors
- `key` is special, not a prop; `ref` and `children` are special too
- Comments: `{/* … */}`; fragments: `<>…</>`; self-closing for void tags

## 17. Cheat sheet

```jsx
// One root per return
return (
  <section className="card">           {/* camelCase, not class */}
    <h1>{title}</h1>                    {/* expressions only */}
    {items.map(i => <Item key={i.id} />)}  {/* key on the outermost element */}
    {ok ? <A /> : <B />}                {/* ternary for conditionals */}
    {count > 0 && <p>{count}</p>}       {/* && needs a boolean-ish guard */}
    {/*
      comments look like this
    */}
  </section>
);
```

## 18. Key takeaways

> [!RECAP]
> - JSX is syntax sugar for a function call — compiled away at build time, zero runtime cost
> - It produces a plain `{ type, props }` object — the UI is data
> - `class` → `className` (and friends) because `class` is a reserved word
> - Lowercase tags are DOM strings; Capitalised tags are component references
> - `{}` accepts expressions, never statements
> - Both the classic and automatic runtimes exist; automatic is the default since React 17
> - `key`, `ref` and `children` are special props, not ordinary data

## Check your understanding

Answer these without looking back.

1. What does `<div className="card">Hi</div>` compile to in the classic runtime? Write the call.
2. Why can't you write `class` as a JSX attribute?
3. Give three DOM attributes that are renamed in JSX.
4. Why is `{if (ok) <p />}` a SyntaxError while `{ok && <p />}` is fine?
5. What happens if you write a component with a lowercase first letter, and why?
6. Name two differences between the classic and automatic runtime transforms.
7. What's the difference between `{/* comment */}` and `<!-- comment -->` in JSX?

## What's Next

**Lesson 48 — Components & Composition.** Composition over configuration is the answer to
most "how would you build" questions — how `children` and splitting turn a wall of JSX into
a team-maintainable component tree.
