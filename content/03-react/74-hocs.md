# Lesson 74 — Higher-Order Components

**Interview importance:** ⭐⭐⭐ — largely superseded by hooks — knowing why is the actual question.

An HOC is "a render prop, inverted": instead of the component calling a function with its
state, the function wraps the component and injects props. `connect(mapState)(Component)`,
`withRouter(Component)`, `withStyles` — the pre-hooks React you've almost certainly seen in
legacy code.

The interview twist: **nobody asks you to write an HOC anymore. They ask why hooks replaced
them.** That "why" — wrapper hell, static-typing friction, invisible prop injection — is the
lesson. You should be able to write one from memory *and* explain, in the same breath, why
you wouldn't.

## Learning Objectives

By the end of this lesson you should be able to:

- Write a `withX(Component)` HOC that injects props
- Explain why an HOC is a render prop with the roles inverted (from Lesson 73)
- Describe wrapper hell and how it degrades debugging, typing and refactoring
- Explain precisely why hooks replaced HOCs — and what hooks lose in return
- Name where HOCs still legitimately appear today

## 1. One-Line Definition

**A higher-order component is a function that takes a component and returns a new component
that renders the original with extra props injected.**

```jsx
const Enhanced = withLoading(ProfilePage);
```

`withLoading` is the HOC: it returns a component that shows a spinner while loading, then
renders `ProfilePage` with the data it fetched.

## 2. Mental Model

Think of **function composition** — from Lesson 13 — applied to components:

```text
withAuth( withLoading(ProfilePage) )
    │            │
    └── wrapper ─┘
           │ renders
           ▼
      ProfilePage + authProps + loadingProps
```

Same shape as `compose(f, g)` on plain functions, except the "functions" are components and
the composition happens by nesting wrappers. Each wrapper adds a capability; the innermost
component gets the combined props.

And why the name: a *higher-order function* (Lesson 13) is a function that takes or returns a
function. A component *is* a function, so a function that takes a component and returns a
component is literally a higher-order function — of components.

## 3. Visual Flow

```text
   ProfilePage (pure, takes { user })
        │
        ▼
   withAuth(ProfilePage)
        │
        ▼
   <AuthWrapper>                      ← the new component
        │  renders a spinner OR
        ▼  renders <ProfilePage user={user} />
   props injected: user
```

The wrapper does the work *before* rendering the inner component; the inner component never
knows where `user` came from.

## 4. How It Works

```jsx
function withAuth(WrappedComponent) {
  return function Authenticated(props) {
    const { user } = useAuth();              // hooks are fine INSIDE the wrapper

    if (!user) return <LoginScreen />;
    return <WrappedComponent {...props} user={user} />;
  };
}
```

The HOC returns a *new component*. That component renders the original one, **passing every
prop through** (`{...props}`) **plus the injected ones** (`user`). The `...props` spread is
the rule: the wrapper must not swallow props the caller expected to reach the inner
component.

A second classic, `withLoading` — fetch in the wrapper, spinner until done:

```jsx
function withLoading(WrappedComponent) {
  return function WithLoading(props) {
    const { data, loading } = useFetch(props.url);   // Lesson 65 hook, called at top level

    if (loading) return <Spinner />;
    return <WrappedComponent {...props} data={data} />;
  };
}
```

Usage is composition — exactly Lesson 13's higher-order functions:

```jsx
const ProfileWithAuth = withAuth(withLoading(ProfilePage));
// or, with a compose() helper:
// const ProfileWithAuth = compose(withAuth, withLoading)(ProfilePage);
```

`compose` exists precisely because bare nesting inverts reading order (`withAuth` wraps
`withLoading`'s result). Composition order matters and is the source of many "why is this
prop missing?" bugs — another reason the pattern fell out of favour.

## 5. The HOC Contract

Three rules, in order:

1. **Pass `...props` through.** The wrapper is invisible to the caller's JSX; swallowing a
   prop silently breaks the inner component.
2. **Don't mutate `WrappedComponent`.** Copy it (class-based HOCs wrapped the prototype);
   mutating the original leaks the enhancement to every other use of that component.
3. **Hoist static members.** `ProfilePage.title = 'Profile'` doesn't survive the wrap by
   itself — `withAuth` must copy statics onto the new component, or `ProfilePage.title`
   disappears.

The third rule is pure tedium and a classic real-world bug:

```jsx
function withAuth(WrappedComponent) {
  function Authenticated(props) { /* … */ }
  Authenticated.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  Authenticated.statics = { ...WrappedComponent.statics };   // if you keep statics, copy them
  return Authenticated;
}
```

`displayName` matters for DevTools — without it, the tree shows `Authenticated` for every
wrapped component and debugging becomes guesswork. ("A", "B", "C" wrappers in React DevTools
are the signature of HOCs that forgot their display names.)

## 6. Real Project Usage

Where you've actually seen HOCs — all still in the wild:

| HOC | What it injects |
|---|---|
| `connect(mapState, mapDispatch)(Component)` | **Redux** state + dispatch as props |
| `withRouter(Component)` | **React Router** (v5 and earlier) — route, location, history |
| `withStyles(styles)(Component)` | **MUI v4** — the `classes` prop |
| `withFormik(...)(Component)` | **Formik** (v1/v2) — form state and handlers |
| `React.memo(Component)` | **Not** props — a render skip; but same *shape*: wrap a component, get a component back |

That last row is the nuance interviewers like: **`React.memo` is technically an HOC** — it
takes a component and returns a wrapped one. So the pattern isn't dead; its *prop-injecting*
use case is what hooks replaced. (HOC-in-the-`memo`-sense is still the vocabulary today.)

## 7. The Problems: Wrapper Hell and Its Cousins

**1. Wrapper hell.** Each HOC adds a level to the tree — `withAuth(withLoading(withRouter(X)))`
renders as three nested DOM-free wrappers. In DevTools, in error traces, in profiler flame
charts, every wrapper is noise. And composition order matters, which makes re-ordering a
correctness risk.

**2. Prop collisions.** Two HOCs injecting `data` — whichever wraps closer to the component
wins, and the other silently loses. Nothing tells you; you just get `undefined`.

**3. Invisible dependencies.** `<Enhanced />` looks like a plain component but *requires* a
provider, a store, a router — context above it in the tree. The props contract isn't visible
in the JSX, and TypeScript had to add `Omit` gymnastics to type the injection.

**4. Static-member drift.** Copying `displayName` and statics is manual. Forget it and
`component.title`, DevTools labels and `getDerivedStateFromProps`-style introspection break.

**5. Naming collisions in the JSX.** `const Enhanced = withLoading(X)` — two of those in one
file give you two components with the same name in the same render tree; DevTools can't tell
them apart without `displayName`.

The through-line: **the wrapper is a black box that hides what it does.** Hooks moved that
work out of the wrapper and into the component's own body, where nothing is hidden.

## 8. Why Hooks Replaced HOCs

Compare the same capability both ways:

```jsx
// HOC — the data arrives as an injected prop
function withData(WrappedComponent) {
  return function WithData(props) {
    const { data } = useFetch(props.url);
    return <WrappedComponent {...props} data={data} />;
  };
}
const PageWithData = withData(Page);
```

```jsx
// Hook (Lesson 65) — the component calls the data itself
function Page({ url }) {
  const { data } = useFetch(url);      // no wrapper, no injection
  return <div>{/* … */}</div>;
}
```

| HOC | Hook |
|---|---|
| Data arrives as a prop, invisibly | Data is called in the component body |
| New wrapper per capability → nesting | One component, N hooks |
| Prop collisions (two HOCs, one `data`) | Collisions are impossible — you name the values |
| Statics must be copied by hand | No statics to copy |
| DevTools shows `WithData` wrappers | DevTools shows the component itself |
| Injection hides dependencies from TS | Types are local and explicit |

And the one thing hooks lose: **composition is no longer invisible.** An HOC wrapped any
component without touching its source — `withAuth(Page)` — while a hook requires editing the
component. That invisibility was the HOC's superpower, and it's exactly why `connect` and
`withRouter` hung on so long: **when you can't change the consumer, the HOC is the only tool
that works without touching it.**

> [!DEEPDIVE]
> Why did hooks beat HOCs anyway? Because *invisible dependencies are the bug*. An HOC's
> injected props arrive without a trace in the JSX, so nobody can tell what `<Enhanced />`
> needs. Hooks made the dependency explicit at the call site — `useFetch` is right there in
> the body — and the Rules of Hooks (Lesson 66) replaced invisible composition with visible,
> checkable call order. Explicit beats implicit: same reason `useEffect` won over lifecycle
> methods.

## 9. When HOCs Still Appear

Honest list, and the senior answer to "do you still use them?":

- **Library-level injection** where consumers shouldn't touch their components: Redux's
  `connect`, React Router's old `withRouter`, styled-component/motion wrappers. When you ship
  a library, an HOC is a one-line adoption for the consumer.
- **Cross-cutting, opt-in wrappers** that must apply to *any* component: analytics,
  feature flags, error reporting. One wrapper, zero consumer changes.
- **`React.memo` and `forwardRef`** — HOCs in the memo/ref sense; that vocabulary is current.
- **React.memo plus a manual HOC** is still the sanctioned way to memo a `forwardRef`-based
  component.
- **Legacy codebases.** You will maintain `connect` and `withRouter` in production. Knowing
  how they work is a hireable skill even if you'd write a hook today.

## 10. Senior-Level Insights

- **Open with the inversion.** "An HOC is a render prop turned inside out: instead of the
  component calling a function, the function wraps the component and injects props." That
  frames it as one idea, not a separate feature.
- **Answer the real question.** "Why did hooks win?" gets: invisible dependencies are the
  bug; explicit wins over implicit; hooks compose without nesting and without collisions.
- **Name the one loss honestly.** HOCs can wrap a component you can't modify — that's why
  `connect` and `withRouter` survived. New features with HOCs? Only at library boundaries.
- **Show the depth.** Mention `React.memo` as an HOC-shaped API, `displayName`, the
  `...props` passthrough rule, and statics copying. That's the difference between "I read a
  blog post" and "I've maintained this".
- **Foreshadow Lesson 76.** HOCs return new components — which is exactly why they can't do
  what Error Boundaries do, and why those are still classes.

## 11. Common Mistakes

**1. Forgetting the `...props` passthrough.**

```jsx
function withLoading(WrappedComponent) {
  return function (props) {
    // ❌ swallowed: props.url never reaches the inner component
    return <WrappedComponent data={data} />;
  };
}
```

**2. Mutating the input component.** Copy it; mutating the class leaks to every usage of that
component elsewhere.

**3. Forgetting `displayName`.** Without it, DevTools shows `Authenticated` for every wrapped
component. `displayName` is debugging hygiene.

**4. Order-dependent composition.** `withAuth(withLoading(X))` and
`withLoading(withAuth(X))` can behave differently — the outer wrapper sees the inner one's
wrapped component. Bare nesting reads right-to-left, which is why `compose` exists and why
re-arranging wrappers silently breaks things.

**5. Calling hooks conditionally inside the wrapper.** `if (!user) return <Login/>;` before a
`useFetch` violates the Rules of Hooks (Lesson 66). Hooks must run unconditionally at the
top of the wrapper's render, or the hook order breaks across renders.

**6. Colliding injected props.** Two HOCs both injecting `data` — one silently loses. This
is inherent to the pattern; hooks (where you name every value) can't collide.

## 12. Best Practices

✅ Pass `{...props}` through the wrapper before injecting new props

✅ Copy `WrappedComponent` rather than mutating it

✅ Set `displayName` on the returned component for DevTools

✅ Copy statics if the inner component relies on them

✅ Prefer hooks (Lesson 65) for new code — simpler, typed, no wrapper

❌ Don't hide dependencies from the caller — injected props are invisible in the JSX

❌ Don't stack HOCs where one component with hooks would do

❌ Don't call hooks conditionally inside the wrapper

❌ Don't wrap components that are never memoised anyway — the wrapper adds a layer for nothing

## 13. Interview Questions

**Q1. What is a higher-order component?**

> A function that takes a component and returns a new component. The new component renders
> the original, passes its props through, and injects extra ones — `withAuth(Component)` adds
> `user`, `withLoading(Component)` adds `data`. It's a higher-order function (Lesson 13)
> applied to components, and really a render prop turned inside out.

**Q2. Why did hooks replace HOCs?**

> Injected props are invisible — nothing in the JSX says what `<Enhanced />` needs, and two
> HOCs can collide on the same prop name. Hooks make dependencies explicit at the call site,
> compose without nesting wrappers, and can't collide. Explicit beats implicit — same reason
> `useEffect` replaced lifecycle methods.

**Q3. Do HOCs still have a place?**

> Yes, where the consumer can't be changed: library injection like Redux's `connect` and
> React Router's `withRouter`, and cross-cutting wrappers like analytics or feature flags
> that apply to any component. And `React.memo` is still HOC-shaped. But for new code, hooks
> are the default — HOCs are the tool when you need to wrap something you don't own.

**Q4. What are the practical downsides?**

> Wrapper hell — a nesting layer per capability in DevTools and error traces. Prop
> collisions when two wrappers inject the same name. Manual statics and `displayName` upkeep.
> And invisible dependencies that make TypeScript typing awkward. Each one is a cost hooks
> simply don't have.

**Senior follow-up: How is an HOC different from a render prop?**

> One shape, inverted. A render prop is a function the component calls with its state, so the
> caller controls the markup. An HOC wraps the component and injects props, so the wrapper
> controls what arrives. Render props keep the relationship explicit in the JSX; HOCs hide
> it. That inversion is why HOCs could wrap components you don't own, and why that power
> became the liability hooks fixed.

## 14. Follow-up Questions

**Is `React.memo` an HOC?**

> In shape, yes — it takes a component and returns a wrapped one. But it doesn't inject
> props; it skips re-renders. It's the one HOC-shaped API that's still current, which is a
> useful reminder that the *pattern* outlived the *prop-injection* use case.

**What is wrapper hell?**

> The nesting that accumulates when every capability is a wrapper: `withAuth(withLoading(withRouter(X)))`
> renders three invisible layers, and DevTools, error traces and the profiler all show them.
> Each wrapper is also a place a prop can be swallowed and an order dependency can bite.
> Hooks collapse all of it into one component.

**How do you type an HOC with TypeScript?**

> With generics over the props: `withAuth<P extends object>(C: ComponentType<P>)` returns a
> component whose props are `P` minus the injected keys — the `Omit` problem HOCs are
> infamous for. Hooks don't need this because the caller names every value.

**Can you compose HOCs?**

> Yes — that's the point. `compose(withAuth, withLoading)(Page)` composes right-to-left,
> which is why the helper exists: bare nesting reads backwards and reordering breaks
> behaviour. Composition is the pattern's strength and its readability weakness in one.

## 15. Comparison Table

| | HOC | Render prop (Lesson 73) | Hook (Lesson 65) |
|---|---|---|---|
| Shape | `withX(Component)` | `<X>{(state) => …}</X>` | `const s = useX()` |
| Who injects | The wrapper | The parent (via function arg) | The caller, explicitly |
| Visible in JSX? | No — injected props | Yes — function is in the tree | Yes — in the body |
| Wrapper nesting | Yes — wrapper hell | None | None |
| Prop collision risk | Real (same name) | Real (same arg) | Impossible (named locally) |
| Works on components you don't own | ✅ — the killer feature | ❌ — needs the consumer | ❌ — needs the consumer |
| Today | Legacy + library injection | Lists, forms, router | **The default** |

## 16. Code Example: A Complete HOC

```jsx
// withLoading: fetch in the wrapper, spinner until done, then inject `data`.
function withLoading(WrappedComponent) {
  return function WithLoading(props) {
    const { data, loading } = useFetch(props.url);

    if (loading) return <Spinner />;
    return <WrappedComponent {...props} data={data} />;
  };
}
```

Usage — the wrapper is invisible to the JSX, which is exactly the point and the problem:

```jsx
const ProfileWithLoading = withLoading(ProfilePage);

function App() {
  return <ProfileWithLoading url="/api/me" />;   // looks like a plain component
}
```

```text
[ <Spinner/> while fetching ]          ← the wrapper's work, invisible in JSX
[ <ProfilePage url="/api/me" data={…} /> ]   ← props passed through + `data` injected
[ WithLoading(ProfilePage) in DevTools ]  ← displayName keeps it identifiable
```

Compare with the hook version from Lesson 65 — same fetch, no wrapper, `data` visible in the
component body. That side-by-side *is* the answer to "why did hooks win?".

## 17. Performance Notes

- **Each wrapper is a real component layer** — it renders, and it re-renders with its parent.
  More HOCs, more layers, more re-renders to trace in the profiler.
- **Memo interplay:** wrapping a memoised component with an HOC is fine (the wrapper renders
  the memoised inner one), but injecting unstable values defeats it — same "stable
  references" rule as Lessons 67 and 71.
- **The real cost is hidden:** an HOC's injected prop changes identity on every wrapper
  render, so inner memoisation silently stops working. Hooks don't have this class of bug.
- **When it doesn't matter:** library HOCs like `connect` are precisely engineered (memoised,
  stable selectors); the cost story is about the HOCs *you* write, not the ones you consume.

## 18. Debugging Scenarios

**"The inner component gets `undefined` for an injected prop."** Composition order or a
collision: two wrappers inject the same name, or the wrapper's own render created the value
before the inner component expected it. Check the wrapper stack and the spread — and the
hook-order rule if you added hooks inside.

**"DevTools shows `Authenticated` for everything."** The wrapper didn't set `displayName`.
Set `Authenticated.displayName = \`WithAuth(${Component.displayName ?? Component.name})\`` —
then the tree reads `WithAuth(ProfilePage)`.

**"`Component.title` vanished after wrapping."** Statics weren't copied. The new component is
a *different function*; whatever lived on the original doesn't ride along. Copy statics in
the HOC.

**"The memoised inner component re-renders every time."** The HOC injects a fresh reference
(an object or function created in the wrapper's render). Memoise the injected value — the
Lesson 61/67 "stable references" rule — or accept the render.

**"Hooks error inside my HOC."** You called a hook after an early return
(`if (loading) return …` before `useFetch`). Move every hook call to the top of the wrapper's
component, unconditionally — the Rules of Hooks from Lesson 66.

## 19. Quick Revision Notes

- HOC = function taking a component, returning a component that injects props
- It's a higher-order function (Lesson 13) on components, and a render prop inverted
  (Lesson 73)
- The contract: pass `{...props}`, don't mutate, copy statics, set `displayName`
- The costs: wrapper hell, prop collisions, invisible dependencies, typing friction
- Hooks won because explicit beats implicit — but `connect`/`withRouter` persist where the
  consumer can't change
- `React.memo` is still an HOC-shaped API — the pattern isn't dead, its prop-injection era is
- Still relevant at library boundaries and in the legacy code you'll maintain

## 20. Cheat Sheet

```jsx
function withX(WrappedComponent) {
  function WithX(props) {
    // hooks first, unconditionally (Lesson 66)
    const value = useSharedThing();
    // render the original, spread props through, inject the new ones
    return <WrappedComponent {...props} value={value} />;
  }
  WithX.displayName = `WithX(${WrappedComponent.displayName || WrappedComponent.name})`;
  return WithX;
}

// usage — the wrapper is invisible to the JSX
const Enhanced = withX(Original);
// the hook answer to the same problem (Lesson 65):
//   function Original() { const value = useSharedThing(); return …; }
```

## 21. Key Takeaways

> [!RECAP]
> - An HOC is a function that takes a component and returns a component with props injected
> - It's a higher-order function on components — and a render prop turned inside out
> - The contract: pass props through, don't mutate, copy statics, set `displayName`
> - The costs: wrapper hell, prop collisions, invisible dependencies, typing friction
> - Hooks won because dependencies became explicit — invisible dependencies were the bug
> - HOCs persist where the consumer can't be changed: `connect`, `withRouter`, analytics,
>   feature flags
> - `React.memo` is HOC-shaped and still current — the pattern outlived the prop-injection era

## Check your understanding

Answer these without looking back.

1. Write `withLoading(Component)` from memory — hooks inside the wrapper, spinner, prop
   injection.
2. Explain the three rules of the HOC contract, and what breaks when each is violated.
3. Why is an HOC a render prop "turned inside out"? Say it precisely.
4. List four concrete costs of wrapper hell, with an example bug for each.
5. Give the one capability hooks lost — and the two libraries that survive on it.
6. Why is `React.memo` called HOC-shaped, and what does that tell you about the pattern?

## What's Next

**Lesson 75 — The Provider Pattern.** Where React's modern composition actually lives:
a component that makes state available to a whole subtree through context. You'll build it,
learn the re-render mechanics behind it, and see why it's the backbone of almost every
library you've used.