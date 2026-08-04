# Lesson 4 — The Temporal Dead Zone

**Interview importance:** ⭐⭐⭐⭐☆ — the follow-up question when you answer hoisting well.

The gap between a variable existing and being usable. It sounds like an edge case and it's
actually a design decision — one that turned a whole class of silent bugs into immediate
errors.

## Learning Objectives

By the end of this lesson you should be able to:

- Say exactly where the zone opens and closes
- Explain why an error is better than `undefined`
- Explain why `typeof` is no longer a universal safety net
- Recognise that function parameters have a TDZ of their own
- Answer "so is `let` hoisted or not?" without hesitating

## 1. Three States, Not Two

Most people think a variable is either declared or not. There are three states, and the
middle one is the whole lesson.

| State | Reading it gives you |
|---|---|
| **Not declared** | `ReferenceError: x is not defined` |
| **Declared, uninitialised** | `ReferenceError: Cannot access 'x' before initialization` |
| **Declared and initialised** | The value |

`var` skips the middle state — it's initialised to `undefined` immediately. `let`, `const`
and `class` sit in it, and that's the Temporal Dead Zone.

> [!NOTE]
> "Temporal" because it's about *time*, not place. The same line of code is fine or fatal
> depending on whether execution has passed the declaration yet.

## 2. Where the Zone Opens and Closes

It opens when the scope is entered and closes on the line where the declaration is
evaluated:

```js
{
  // ── TDZ for `value` starts here ──
  // console.log(value);   💥 Cannot access 'value' before initialization

  let value = 'ready';
  // ── TDZ ends on the line above ──

  console.log(value);      // ✅ 'ready'
}
```

The boundary is the **declaration**, not the top of the file and not the assignment. `let x;`
with no value ends the zone too — `x` is then initialised to `undefined`, which is a real
value.

## 3. Why an Error Is Better Than `undefined`

`var` answers "you used it too early" with `undefined`, which is a valid value. So the
mistake travels:

```js
var total;
const tax = total * 0.2;      // NaN — no complaint

console.log(tax.toFixed(2));  // 💥 fails here, three steps from the cause
```

The TDZ moves the failure to the moment of the mistake instead of the moment the bad value
is finally used. That's the entire argument, and it's worth being able to say out loud.

## 4. Try It: Watch the Zone Close

```js
let stage = 'before';

{
  // console.log(inner);   ← uncomment to see the error
  let inner = 'ready';
  console.log(stage, inner);
}
```

Output:

```text
before ready
```

> [!TIP]
> Press **Debug** and step through with the variables panel open. Anything in the dead zone
> shows an amber `TDZ` badge — `inner` reads `TDZ` on the first line of the block and
> `'ready'` on the next. You can watch the badge flip on the exact line where the zone
> closes.

## 5. `typeof` Is No Longer a Safe Guard

For twenty years, `typeof` was the one operator you could point at anything:

```js
console.log(typeof neverDeclared);   // "undefined" — safe, no error
```

Inside a TDZ it throws like any other read:

```js {1}
console.log(typeof soon);   // 💥 ReferenceError
let soon = 1;
```

This is deliberate. A silent `typeof` would have re-created the exact bug the TDZ exists to
prevent. The practical consequence: `typeof x !== 'undefined'` is a feature check for
*globals you might not have*, not a general safety net.

## 6. Parameters Have Their Own Dead Zone

Default parameter values are evaluated left to right, in their own scope, and they follow the
same rule:

```js
function bad(a = b, b = 2) {
  return [a, b];
}

bad();   // 💥 Cannot access 'b' before initialization
```

```js
function fine(a = 1, b = a + 1) {
  return [a, b];
}

console.log(fine());   // ✅ [1, 2]
```

A default can reference a parameter to its **left**, never to its right. Same mechanism, same
error message — and a genuinely good interview question, because it shows the TDZ isn't
something bolted onto `let`.

> [!PITFALL]
> Class declarations are in the TDZ too, which trips people extending a class defined later
> in the file:
>
> ```js
> const dog = new Animal();   // 💥 Cannot access 'Animal' before initialization
> class Animal {}
> ```
>
> Class *expressions* assigned to a `const` behave identically. There's no hoisted-class
> escape hatch, by design.

## 7. Common Interview Questions

**Q1. What is the Temporal Dead Zone?**

> The period between entering a scope and evaluating a `let`, `const` or `class` declaration
> in it. The binding is registered but uninitialised, so reading it throws.
>
> Temporal because it's about execution time — the same line is fine once the declaration has
> been passed.

**Q2. How is a TDZ error different from an undeclared-variable error?**

> The messages tell you different things. `x is not defined` means no such binding exists
> anywhere on the scope chain. `Cannot access 'x' before initialization` means the binding
> exists in this scope and you're early.
>
> The second is usually a much easier fix, which is exactly why the distinction matters.

**Q3. Why does the TDZ exist at all?**

> To make "use before declare" fail immediately. With `var` you get `undefined`, which
> propagates into arithmetic as `NaN` or into a property read as a crash three steps later.
> Moving the error to the cause is the point.
>
> It also makes `const` meaningful — a binding readable before its initialiser would
> effectively have two values.

**Q4. Is `typeof` safe on a variable in the TDZ?**

> No. It throws, unlike on a genuinely undeclared name where it returns `"undefined"`. That
> was intentional: a silent `typeof` would have reintroduced the failure mode the TDZ was
> added to remove.

**Q5. Do function parameters have a TDZ?**

> Yes. Defaults are evaluated left to right in their own scope, so `function f(a = b, b = 2)`
> throws when called without arguments, while `function f(a = 1, b = a + 1)` is fine. A
> default can look left, never right.

**Senior follow-up: If `let` is hoisted, what is actually different from `var`?**

> The initialisation, not the registration. Both are registered during scope creation. `var`
> is initialised to `undefined` at that moment; `let` and `const` are marked uninitialised
> and only get a value when execution reaches the declaration.
>
> Everything else follows from that one difference — the error instead of `undefined`,
> `typeof` throwing, and `const` being able to guarantee a single assignment.

## 8. Best Practices

✅ Declare variables at the top of the scope where they're used

✅ Treat a TDZ error as useful information — it tells you the binding exists

✅ Keep `class` declarations above their first use, like any other `const`

❌ Don't reach for `var` to "avoid" the TDZ — you're trading an error for a silent bug

❌ Don't use `typeof` as a general existence check inside a module

## 9. Coding Exercise

Predict each one before running.

```js
// 1
{
  console.log(a);
  var a = 1;
}

// 2 — uncomment to see it fail
// {
//   console.log(b);
//   let b = 2;
// }

// 3
function f(x = 2, y = x) { return [x, y]; }
console.log(f());
```

<details>
<summary>Answers</summary>

1. `undefined` — `var` is initialised during creation
2. `ReferenceError: Cannot access 'b' before initialization` — the TDZ
3. `[2, 2]` — a default may reference anything to its left

</details>

Now the classic:

```js
const x = 'outer';

{
  console.log(x);   // 💥 not 'outer'
  const x = 'inner';
}
```

<details>
<summary>Why?</summary>

Entering the block starts a TDZ for the inner `x`. The lookup finds that binding
immediately — shadowing applies to the whole block, including the lines above the
declaration — so it never reaches the outer one. The error is `Cannot access 'x' before
initialization`, which tells you the binding exists.

</details>

## 10. Mini Challenge

Write one snippet that produces all three states in order:

1. `x is not defined`
2. `Cannot access 'y' before initialization`
3. A successful read

Then explain, in one sentence each, what the engine knew at the moment of each line.

## 11. Lesson Summary

> [!RECAP]
> - Three states: not declared, declared-but-uninitialised (the TDZ), initialised
> - The zone opens when the scope is entered and closes at the declaration, not the assignment
> - `let`, `const` and `class` have one; `var` doesn't, because it starts at `undefined`
> - `typeof` throws inside the zone — it is not an escape hatch
> - Default parameters have their own TDZ: a default may reference anything to its left
> - The point is failing at the mistake instead of three steps later

## Check your understanding

Answer these without looking back.

1. Name the three states a variable can be in, and the exact error each of the first two produces.
2. Where does the TDZ open, and where does it close? Is it the declaration or the assignment?
3. Explain to a sceptic why an error is better than `undefined` here.
4. Why does `typeof` throw inside the TDZ when it's normally the safe operator?
5. Why does `function f(a = b, b = 2)` throw while `function f(a = 1, b = a + 1)` doesn't?
6. If `let` is hoisted like `var`, what is the one thing that actually differs?

## What's Next

**Lesson 5 — Closures.** The single most-asked JavaScript concept, and the engine behind
hooks. You already know the mechanism: it's the scope chain from Lesson 2, observed after the
outer function has returned.
