# Lesson 1 — Variables (`var`, `let` and `const`)

**Interview importance:** ⭐⭐⭐⭐⭐ — the opening question of most JavaScript screens.

We start from the beginning and build a solid foundation. Even if you already know this,
we'll cover it from an interview perspective and focus on the *why* behind each rule.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what a variable is
- Differentiate between `var`, `let` and `const`
- Understand scope, reassignment and redeclaration
- Explain why `var` is avoided in modern JavaScript
- Answer the common interview questions confidently

## 1. What is a Variable?

A variable is a named container that stores a value.

Think of it as a labelled box:

```text
username    → "Mansha"
age         → 28
isLoggedIn  → true
```

Instead of repeating the value, your code refers to the name.

```js
let username = 'Mansha';

console.log(username);
```

Output:

```text
Mansha
```

## 2. Why Do We Need Variables?

Imagine writing this:

```js
console.log('Mansha');
console.log('Mansha');
console.log('Mansha');
```

Now the name changes. You'd have to update every occurrence.

Instead:

```js
let username = 'Mansha';

console.log(username);
console.log(username);
console.log(username);
```

You change the value once and every reference updates. Variables improve **readability**,
**reusability** and **maintainability**.

## 3. Declaring Variables

JavaScript gives you three keywords:

```js
var company = 'OpenAI';
let city = 'Riyadh';
const country = 'Saudi Arabia';
```

All three create a variable. They behave very differently, and the rest of this lesson is
about how.

## 4. Understanding `var`

`var` was the original way to declare a variable, before ES6 (2015).

```js
var age = 28;
age = 29;

console.log(age);
```

Output:

```text
29
```

A `var` variable can be **declared**, **reassigned** and **redeclared**:

```js
var name = 'Ali';
var name = 'Ahmed';

console.log(name);
```

Output:

```text
Ahmed
```

That last one is the problem. In a large file, redeclaring a name silently replaces the
old one — no warning, no error.

## 5. Understanding `let`

ES6 introduced `let` to fix most of what `var` got wrong.

```js
let score = 100;
score = 150;      // ✅ reassignment is allowed
```

But redeclaring in the same scope is not:

```js
let score = 100;
let score = 200;  // 💥 SyntaxError: Identifier 'score' has already been declared
```

A `let` variable **can be reassigned** but **cannot be redeclared** in the same scope.

## 6. Understanding `const`

`const` declares a binding that cannot be reassigned.

```js
const PI = 3.14159;
PI = 4;           // 💥 TypeError: Assignment to constant variable
```

A `const` variable **cannot be reassigned** and **cannot be redeclared**. It also must be
initialised at declaration — `const x;` on its own is a `SyntaxError`.

## 7. Important Interview Concept: `const` Is Not Immutability

Many people think `const` makes a value immutable. It doesn't. It only stops the *name*
from pointing somewhere else.

```js
const user = { name: 'Mansha' };

user.name = 'John';        // ✅ allowed — same object, different contents

console.log(user);
```

Output:

```text
{ name: 'John' }
```

But this fails:

```js
const user = { name: 'Mansha' };

user = {};                 // 💥 TypeError — pointing the name at a new object
```

Picture `user` as a label stuck on a box. `const` means the label can't be moved to a
different box. You can still open the box and rearrange what's inside.

> [!PITFALL]
> `Object.freeze()` is the tool for actually freezing a value — and it's shallow. Nested
> objects stay mutable, and in non-strict mode failed writes fail *silently*.

## 8. The Loop Trap (and the React Connection)

This is the practical difference between `var` and `let`, and it comes up constantly.

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log('var →', i), 0);
}

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log('let →', j), 0);
}
```

Output:

```text
var → 3
var → 3
var → 3
let → 0
let → 1
let → 2
```

`var` creates **one** `i` for the entire loop. All three callbacks share it, and by the
time they run the loop has finished and `i` is `3`. `let` creates a **new** `j` each
iteration, so each callback has its own.

The same bug wearing a hook:

```jsx {5}
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setInterval(() => setCount(count + 1), 1000);   // ❌ stuck at 1 forever
  }, []);
}
```

The effect ran once, so it captured `count` from the first render — value `0`. Every tick
computes `0 + 1`. The fix is to stop reading the captured value:

```jsx
setCount(prev => prev + 1);   // ✅
```

Being able to say *"that's the `var` loop bug wearing a hook"* lands very well.

## 9. Quick Comparison

| Feature | `var` | `let` | `const` |
|---|---|---|---|
| Reassign | ✅ | ✅ | ❌ |
| Redeclare in same scope | ✅ | ❌ | ❌ |
| Block scoped | ❌ | ✅ | ✅ |
| Function scoped | ✅ | ❌ | ❌ |
| Hoisted | ✅ (as `undefined`) | ✅ (TDZ) | ✅ (TDZ) |
| Must be initialised | ❌ | ❌ | ✅ |

We'll cover scope in Lesson 2, hoisting in Lesson 3 and the Temporal Dead Zone in Lesson 4.

## 10. Best Practices

✅ **Use `const` by default.**

```js
const API_URL = 'https://api.example.com';
```

✅ **Use `let` only when the value genuinely changes.**

```js
let count = 0;
count++;
```

❌ **Avoid `var`** in new code. Keep it only when maintaining something legacy.

> [!NOTE]
> "`const` by default, `let` when it changes, never `var`" is the sentence to have ready.
> It signals you write modern JavaScript without needing to be asked.

## 11. Common Interview Questions

**Q1. What is the difference between `var`, `let` and `const`?**

> `var` is function-scoped, can be redeclared, and is hoisted as `undefined`, so reading it
> early gives you a value instead of an error.
>
> `let` and `const` are block-scoped, can't be redeclared in the same scope, and sit in the
> Temporal Dead Zone until their declaration — reading early throws. `const` additionally
> can't be reassigned.
>
> In practice I use `const` by default, `let` when the value changes, and never `var`.

**Q2. Can you modify an object declared with `const`?**

> Yes. `const` protects the binding, not the contents. `const user = { name: 'Ali' }` still
> allows `user.name = 'Ahmed'` — what it blocks is `user = {}`.
>
> For real immutability you need `Object.freeze()`, and even that is only one level deep.

**Q3. Why is `var` generally avoided?**

> Because it's function-scoped rather than block-scoped, so it leaks out of `if` and `for`
> blocks. It also allows silent redeclaration, and it's hoisted as `undefined` instead of
> throwing, so mistakes surface far away from their cause.

**Q4. Why does a `var` loop with `setTimeout` print the last value?**

> All the callbacks close over the same variable — `var` creates one binding for the whole
> loop. By the time the timers fire, the loop has finished and that binding holds the final
> value. `let` creates a fresh binding per iteration, so each callback captures its own.

**Q5. What happens if you assign to a variable you never declared?**

> In sloppy mode it silently creates a global, no matter how deeply nested you are. In
> strict mode, and inside modules, it throws a `ReferenceError`.

**Senior follow-up: How is the `var` loop bug the same as a stale `useEffect`?**

> They're one mechanism: a function captured a value when it was created and never looked
> again. The loop callback captured `i`; the effect captured `count` from the render it was
> created in.
>
> The fixes rhyme too — give each iteration its own binding with `let`, or stop reading the
> captured value and use `setCount(prev => prev + 1)`.

## 12. Coding Exercise

Predict the output before you press Run.

```js
let age = 25;
age = 30;
console.log(age);

const person = { name: 'Ali' };
person.name = 'Ahmed';
console.log(person.name);

var city = 'Lahore';
var city = 'Karachi';
console.log(city);
```

<details>
<summary>Answer</summary>

```text
30
Ahmed
Karachi
```

`age` is reassignable. `person.name` changes the contents, not the binding. `city` is
redeclared without complaint — which is exactly the `var` behaviour to be wary of.

</details>

## 13. Mini Challenge

Create variables for:

- Your name
- Your age
- An array of your skills
- An object describing a project (title, status, technologies)

Use `const` wherever possible and `let` only where a value will genuinely change later.

```js
// your turn — press Run when you're ready
const name = 'Mansha';
let age = 28;
const skills = ['JavaScript', 'React'];
const project = { title: 'Roadmap', status: 'in progress', technologies: ['Next.js'] };

console.log(name, age, skills, project);
```

## 14. Lesson Summary

> [!RECAP]
> - A variable is a named container for a value
> - `var` is function-scoped, redeclarable, and hoisted as `undefined`
> - `let` is block-scoped and reassignable but not redeclarable
> - `const` is block-scoped and cannot be reassigned — but the value can still be mutated
> - `const` protects the **binding**, not the object's contents
> - `var` makes one variable per loop; `let` makes one per iteration
> - Default to `const`, reach for `let` when it changes, avoid `var`

## Check your understanding

Answer these without looking back.

1. Why is `var` generally discouraged in modern JavaScript?
2. Can a `const` object have its properties changed? Why?
3. When should you use `let` instead of `const`?
4. Which keyword should be your default when declaring a variable?
5. Why does a `var` loop with `setTimeout` print `3, 3, 3`?
6. What does `Object.freeze()` do that `const` doesn't — and what are its limits?

## What's Next

**Lesson 2 — Scope**, one of the most frequently asked JavaScript interview topics. You'll
learn what scope is, the difference between global, function and block scope, what lexical
scope means, and how the scope chain resolves every name you write.
