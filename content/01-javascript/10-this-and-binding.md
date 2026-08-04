# Lesson 10 — `this` and Binding

**Interview importance:** ⭐⭐⭐⭐⭐ — four binding rules. Knowing all four calmly is a strong
senior signal.

`this` is not decided by where a function is written. It's decided by **how the function is
called** — with one deliberate exception. Get that sentence right and the rest is bookkeeping.

## Learning Objectives

By the end of this lesson you should be able to:

- State the four binding rules and their precedence
- Explain why a method loses `this` when you pass it as a callback
- Say exactly how arrow functions differ, and why that's the point
- Fix a broken `this` three different ways
- Explain `this` in classes, callbacks and React

## 1. `this` Is Decided at Call Time

Same function, three call sites, three answers:

```js
'use strict';

function whoAmI() {
  return this;
}

const obj = { name: 'obj', whoAmI };

console.log(obj.whoAmI().name);   // called as a method
console.log(whoAmI());            // called plain, in strict mode
console.log(whoAmI.call({ name: 'explicit' }).name);
```

Output:

```text
obj
undefined
explicit
```

Nothing about the function body changed. Only the call did.

## 2. The Four Rules

Check them in this order — the first one that applies wins.

| # | Rule | Call looks like | `this` is |
|---|---|---|---|
| 1 | **`new` binding** | `new Fn()` | The brand-new object |
| 2 | **Explicit binding** | `fn.call(o)`, `fn.apply(o)`, `fn.bind(o)` | Whatever you passed |
| 3 | **Implicit binding** | `obj.fn()` | The object left of the dot |
| 4 | **Default binding** | `fn()` | `undefined` in strict mode, `globalThis` in sloppy |

```js
function show() {
  return this?.label ?? 'no this';
}

const owner = { label: 'owner', show };

console.log(new (function Ctor() { this.label = 'constructed'; })().label);
console.log(show.call({ label: 'explicit' }));
console.log(owner.show());
console.log(show());
```

Output:

```text
constructed
explicit
owner
no this
```

> [!NOTE]
> "The object left of the dot" is the shortcut for rule 3, and it's what makes rule 4 feel
> surprising — take the dot away and there's nothing left to bind to.

## 3. Losing `this`

This is the bug you'll actually meet. Extracting a method throws away the object it came
from:

```js
'use strict';

const counter = {
  count: 0,
  increment() {
    this.count += 1;
    return this.count;
  },
};

console.log(counter.increment());

const detached = counter.increment;
try {
  detached();
} catch (e) {
  console.log(e.constructor.name);
}
```

Output:

```text
1
TypeError
```

`detached` is the same function, called with no dot — so `this` is `undefined` and reading
`this.count` throws. The identical thing happens with callbacks:

```js
setTimeout(counter.increment, 0);       // ❌ same problem
element.addEventListener('click', counter.increment);  // ❌
```

Three fixes:

```js
setTimeout(() => counter.increment(), 0);           // ✅ keep the call site intact
setTimeout(counter.increment.bind(counter), 0);     // ✅ bind it permanently
const bound = counter.increment.bind(counter);      // ✅ store the bound copy
```

## 4. `call`, `apply` and `bind`

```js
function introduce(greeting, punctuation) {
  return `${greeting}, I'm ${this.name}${punctuation}`;
}

const person = { name: 'Ali' };

console.log(introduce.call(person, 'Hi', '!'));
console.log(introduce.apply(person, ['Hello', '.']));

const bound = introduce.bind(person, 'Hey');
console.log(bound('?'));
```

Output:

```text
Hi, I'm Ali!
Hello, I'm Ali.
Hey, I'm Ali?
```

`call` takes arguments one by one, `apply` takes an array — **a**pply for **a**rray is the
usual mnemonic. `bind` doesn't call anything: it returns a new function with `this` locked in,
and can pre-fill arguments (partial application, straight from Lesson 5).

A bound function can't be re-bound:

```js
const rebound = bound.bind({ name: 'Someone else' });
console.log(rebound('!'));
```

Output:

```text
Hey, I'm Ali!
```

## 5. Arrow Functions Take `this` Lexically

Arrow functions have no `this` of their own. They use the `this` of the scope they were
*written* in — which is why they're immune to all four rules above.

```js
const timer = {
  label: 'timer',
  startBroken() {
    setTimeout(function () {
      console.log('broken:', this?.label);      // its own `this`
    }, 0);
  },
  startFixed() {
    setTimeout(() => {
      console.log('fixed:', this.label);        // the enclosing `this`
    }, 0);
  },
};

timer.startBroken();
timer.startFixed();
```

Output:

```text
broken: undefined
fixed: timer
```

That's what arrow functions are *for*. "Shorter syntax" is the answer that costs you the
point — lexical `this` is the reason they exist.

The flip side: an arrow function is the wrong choice for a method, because there's no
enclosing object scope to inherit from.

```js
const bad = {
  name: 'bad',
  greet: () => (this === bad ? 'got the object' : 'this is NOT the object'),
};

const good = {
  name: 'good',
  greet() { return this === good ? 'got the object' : 'this is NOT the object'; },
};

console.log(bad.greet());
console.log(good.greet());
```

Output:

```text
this is NOT the object
got the object
```

Whatever `this` is at that point in the file — `undefined` in a module, the global object in a
script — it is never the object literal, because an object literal doesn't create a scope.

## 6. `this` in Classes

Class bodies are always strict, so a detached method gets `undefined` rather than the global
object:

```js
class Counter {
  count = 0;

  increment() {
    this.count += 1;
    return this.count;
  }

  // A class field holding an arrow — bound to the instance at construction.
  incrementBound = () => {
    this.count += 1;
    return this.count;
  };
}

const c = new Counter();
const loose = c.increment;
const safe = c.incrementBound;

console.log(c.increment());
try { loose(); } catch (e) { console.log(e.constructor.name); }
console.log(safe());
```

Output:

```text
1
TypeError
2
```

The class-field arrow is the standard fix for passing a method as a callback — it's created
per instance with `this` already fixed, which is exactly the trade the memory argument from
Lesson 9 describes.

## 7. Where This Bites in React

```jsx
class Old extends React.Component {
  handleClick() {
    this.setState({ clicked: true });   // ❌ `this` is undefined when passed directly
  }
  render() {
    return <button onClick={this.handleClick}>Click</button>;
  }
}
```

Fixes: bind in the constructor, use a class-field arrow, or wrap in an inline arrow. This is
the single biggest reason function components and hooks feel simpler — with no `this` in
sight, an entire category of bug disappears.

> [!PITFALL]
> `this` in a plain function at module top level isn't the global object in a module — ES
> modules are strict and their top-level `this` is `undefined`. In a CommonJS file it's
> `module.exports`, and in a classic script it's `globalThis`. Same code, three answers.

## 8. Common Interview Questions

**Q1. How is `this` determined?**

> By how the function is called, not where it's defined. In order of precedence: `new`
> binding, then explicit binding with `call`/`apply`/`bind`, then implicit binding — the
> object left of the dot — then the default, which is `undefined` in strict mode and
> `globalThis` in sloppy mode.
>
> Arrow functions are the exception: they have no `this` and use the enclosing scope's.

**Q2. What's the difference between `call`, `apply` and `bind`?**

> `call` and `apply` invoke the function immediately with a given `this` — `call` takes
> arguments individually, `apply` takes them as an array. `bind` doesn't invoke; it returns a
> new function with `this` permanently fixed, and can pre-fill arguments.
>
> A bound function can't be re-bound later.

**Q3. Why does a method lose `this` when passed as a callback?**

> Because passing it copies the function reference, not the object. When the callback is
> later invoked there's no dot, so implicit binding never applies and you fall through to the
> default rule.
>
> Fix it by preserving the call site with an arrow wrapper, or binding it.

**Q4. Why do arrow functions exist?**

> For lexical `this`. An arrow has no binding of its own, so inside a callback it still sees
> the `this` of the surrounding code — which removes the old `const self = this` dance.
>
> The shorter syntax is a bonus, not the reason.

**Q5. When should you *not* use an arrow function?**

> As an object method or a prototype method, because there's no enclosing object scope to
> inherit `this` from. Also as a constructor — arrows can't be called with `new` — and as a
> DOM event handler if you want `this` to be the element.

**Q6. What is `this` inside a plain function call in strict mode?**

> `undefined`. In sloppy mode it's the global object, which is exactly the silent-failure
> case strict mode was designed to remove — you get a `TypeError` at the mistake instead of
> accidentally writing to a global.

**Senior follow-up: What does `new` do to `this`, and how does it beat the other rules?**

> `new` creates a fresh object, links it to the constructor's prototype, and calls the
> constructor with `this` bound to that object — so it wins over implicit binding entirely.
>
> It even beats a bound function for the `this` value: calling `new` on a function created by
> `bind` ignores the bound `this` and uses the new instance, though pre-filled arguments still
> apply.

## 9. Best Practices

✅ Use arrow functions for callbacks, so `this` keeps flowing from the surrounding scope

✅ Use regular functions or class methods for anything called as `obj.method()`

✅ Use a class-field arrow when a method will be passed as a callback

✅ Write `'use strict'` or use modules, so a lost `this` throws instead of hitting the global

❌ Don't use an arrow as an object method

❌ Don't reach for `const self = this` — that's the pre-2015 workaround arrows replaced

## 10. Coding Exercise

Predict every line, then run it.

```js
'use strict';

const obj = {
  name: 'obj',
  regular() { return this?.name; },
  arrow: () => (this === obj ? 'obj' : 'not obj'),
  nested() {
    const inner = () => this?.name;
    return inner();
  },
};

console.log(obj.regular());
console.log(obj.arrow());
console.log(obj.nested());

const loose = obj.regular;
console.log(loose());

console.log(obj.regular.call({ name: 'other' }));
```

<details>
<summary>Answers</summary>

```text
obj
not obj
obj
undefined
other
```

The method gets the object; the arrow property never does; an arrow *inside* a method
inherits that method's `this`; a detached method falls through to the default rule; explicit
binding overrides everything below it.

</details>

## 11. Mini Challenge

Implement `myBind(fn, thisArg, ...preset)` without using the built-in `bind` — returning a
new function that calls `fn` with the fixed `this` and the preset arguments prepended.

Then check your version against the real thing on a method that's been detached from its
object.

## 12. Lesson Summary

> [!RECAP]
> - `this` is set by the **call**, not the definition
> - Precedence: `new` → explicit (`call`/`apply`/`bind`) → implicit (left of the dot) → default
> - Default is `undefined` in strict mode, `globalThis` in sloppy mode
> - Passing a method as a callback drops the dot, and with it the binding
> - Arrow functions have no `this` — they use the enclosing scope's, which is why they exist
> - Never use an arrow as an object or prototype method
> - Class fields holding arrows are the standard fix for callback methods

## Check your understanding

Answer these without looking back.

1. State the four binding rules in precedence order.
2. What is `this` in a plain function call, in strict mode and in sloppy mode?
3. Explain exactly why `setTimeout(obj.method, 0)` breaks, and give two fixes.
4. What's the difference between `call`, `apply` and `bind`?
5. Why is "shorter syntax" the wrong answer to "why do arrow functions exist"?
6. Name two places an arrow function is the wrong tool.

## What's Next

That closes **M1 · Core Mechanics**. Next is **Lesson 11 — Functions: Declarations vs
Expressions**, where hoisting and `this` meet the last piece: how a function is created
decides how it behaves.
