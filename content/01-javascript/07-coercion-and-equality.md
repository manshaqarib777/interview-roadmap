# Lesson 7 — Coercion, Truthy/Falsy & Equality

**Interview importance:** ⭐⭐⭐⭐⭐ — `==` vs `===` is guaranteed. The interesting part is
`0 == ''`.

JavaScript converts types for you, constantly and silently. You don't need to memorise every
rule — you need the handful that come up, and a clear story about why `===` is the default.

## Learning Objectives

By the end of this lesson you should be able to:

- List the falsy values from memory
- Explain what `==` does that `===` doesn't
- Explain `0 == ''`, `null == undefined` and `NaN !== NaN`
- Say why `+` behaves differently from every other operator
- Choose between `||` and `??` correctly

## 1. What Coercion Is

Coercion is JavaScript converting a value from one type to another. It happens **implicitly**
when an operator needs a different type, and **explicitly** when you ask for it.

```js
console.log('5' * 2);        // implicit → number
console.log(Number('5') * 2); // explicit → same result, clearer intent
```

Output:

```text
10
10
```

The rules aren't random, but they are surprising often enough that the profession settled on
"be explicit, and use `===`".

## 2. The Falsy Values

Exactly **eight** values are falsy. Everything else — including `'0'`, `'false'`, `[]` and
`{}` — is truthy.

```text
false
0
-0
0n        (BigInt zero)
""        (empty string)
null
undefined
NaN
```

```js
console.log(Boolean([]), Boolean({}), Boolean('0'), Boolean(' '));
```

Output:

```text
true true true true
```

Empty array, empty object, the string `'0'` and a single space are all **truthy**. That trips
people constantly, especially with `if (arr)` when they meant `if (arr.length)`.

## 3. `==` vs `===`

`===` compares type and value with no conversion. `==` converts first, then compares.

```js
console.log(1 === '1');
console.log(1 == '1');
```

Output:

```text
false
true
```

The conversion rules that actually matter:

| Comparison | Result | Why |
|---|---|---|
| `1 == '1'` | `true` | String converts to number |
| `0 == ''` | `true` | Both convert to `0` |
| `0 == '0'` | `true` | `'0'` converts to `0` |
| `'' == '0'` | `false` | Both are strings — no conversion, different text |
| `null == undefined` | `true` | Special-cased in the spec |
| `null == 0` | `false` | `null` only ever equals `undefined` |
| `NaN == NaN` | `false` | `NaN` is equal to nothing, including itself |
| `[] == false` | `true` | `[]` → `''` → `0`, and `false` → `0` |
| `[1] == 1` | `true` | `[1]` → `'1'` → `1` |

> [!NOTE]
> The one place `==` is genuinely useful is `x == null`, which is `true` for exactly `null`
> and `undefined`. Some style guides allow that single exception; everything else should be
> `===`.

## 4. `NaN` Is Its Own Problem

```js
console.log(NaN === NaN);
console.log(Number.isNaN(NaN));
console.log(Object.is(NaN, NaN));
```

Output:

```text
false
true
true
```

Use `Number.isNaN(x)` — not the global `isNaN(x)`, which coerces first and reports
`isNaN('hello')` as `true`.

## 5. `+` Is the Odd One Out

`+` means addition *or* string concatenation. If either side is a string, it concatenates.
Every other arithmetic operator converts to number.

```js
console.log(1 + '2');
console.log(1 - '2');
console.log('3' * '4');
console.log([] + {});
```

Output:

```text
12
-1
12
[object Object]
```

This is the source of most "why is my total `'105'`?" bugs — one value arrived from an input
or an API as a string.

## 6. How Objects Convert

When an object meets a primitive operator, the engine asks it for a primitive: `valueOf()`
first for numeric contexts, then `toString()`.

```js
console.log([] + '');
console.log([1, 2] + '');
console.log({} + '');
console.log(new Date(0).getTime());
```

Output:

```text

1,2
[object Object]
0
```

An empty array stringifies to `''` — which is why `[] == false` is `true`, and why
`[] == ![]` is also `true`. You can control this yourself:

```js
const money = {
  amount: 50,
  valueOf() { return this.amount; },
  toString() { return `$${this.amount}`; },
};

console.log(money + 10);
console.log(`${money}`);
```

Output:

```text
60
$50
```

## 7. Converting on Purpose

```js
console.log(Number('42'), Number(''), Number('12px'));
console.log(parseInt('12px', 10), parseFloat('3.5rem'));
console.log(String(42), (42).toString());
console.log(Boolean(''), !!'text');
```

Output:

```text
42 0 NaN
12 3.5
42 42
false true
```

`Number()` is all-or-nothing; `parseInt` reads as far as it can and stops. `Number('')` being
`0` rather than `NaN` is the quirk behind `0 == ''`.

## 8. `||` vs `??`

`||` falls back on any **falsy** value. `??` falls back only on `null` or `undefined`.

```js
const count = 0;
const name = '';

console.log(count || 10);
console.log(count ?? 10);
console.log(name || 'Anonymous');
console.log(name ?? 'Anonymous');
```

Output:

```text
10
0
Anonymous

```

If `0` or `''` are legitimate values — a quantity, a cleared text field — `||` silently
throws them away. That's a real bug, and `??` is the fix.

## 9. Common Interview Questions

**Q1. What's the difference between `==` and `===`?**

> `===` compares type and value with no conversion. `==` coerces the operands to a common
> type first, which is why `1 == '1'` is true.
>
> I use `===` everywhere, with the one arguable exception of `x == null` when I want to catch
> both `null` and `undefined`.

**Q2. List the falsy values.**

> `false`, `0`, `-0`, `0n`, the empty string, `null`, `undefined` and `NaN` — eight of them.
> Everything else is truthy, including empty arrays and objects, and the string `'0'`.

**Q3. Why is `0 == ''` true?**

> Because `==` converts both sides to numbers when the types differ, and `Number('')` is `0`.
> Comparing `'' == '0'` is false, though — those are both strings, so no conversion happens
> and the text simply differs.

**Q4. Why is `NaN !== NaN`?**

> Because the spec defines `NaN` as not equal to anything, including itself — it represents
> "not a valid number", and two invalid results aren't meaningfully the same.
>
> To test for it, use `Number.isNaN` or `Object.is`. The global `isNaN` coerces first, so it
> returns true for `'hello'` too.

**Q5. What's the difference between `||` and `??`?**

> `||` falls back on any falsy value; `??` only on `null` or `undefined`. So with a count of
> `0`, `count || 10` gives `10` while `count ?? 10` correctly gives `0`.
>
> I default to `??` for defaults, because `0` and `''` are usually real values.

**Q6. Why does `1 + '2'` give `'12'` but `1 - '2'` give `-1`?**

> `+` is overloaded: if either operand is a string it concatenates. Every other arithmetic
> operator has only the numeric meaning, so it coerces the string to a number.

**Senior follow-up: How does an object become a primitive in a comparison?**

> The engine calls the object's `Symbol.toPrimitive` if present, otherwise `valueOf()` and
> then `toString()`, taking the first primitive it gets — with the order depending on whether
> a number or a string is preferred in that context.
>
> That's the machinery behind `[] == false`: the array becomes `''`, which becomes `0`, and
> `false` is also `0`. You can hook into it deliberately by defining `valueOf` and `toString`
> on your own objects.

## 10. Best Practices

✅ Use `===` and `!==` by default

✅ Use `??` for defaults, `||` only when every falsy value really should fall back

✅ Convert explicitly at the boundary — `Number(input.value)` as soon as it arrives

✅ Check `arr.length` rather than the array itself for emptiness

❌ Don't rely on `==` coercion to "do the right thing"

❌ Don't use the global `isNaN` — use `Number.isNaN`

## 11. Coding Exercise

Predict every line, then run it.

```js
console.log(1 == '1');
console.log(1 === '1');
console.log(0 == '');
console.log('' == '0');
console.log(null == undefined);
console.log(null === undefined);
console.log(NaN == NaN);
console.log([] == false);
console.log(Boolean([]));
console.log(0 || 'fallback');
console.log(0 ?? 'fallback');
```

<details>
<summary>Answers</summary>

```text
true
false
true
false
true
false
false
true
true
fallback
0
```

The two worth being able to explain out loud are `0 == ''` (both become `0`) and
`[] == false` alongside `Boolean([]) === true` — an array is truthy, but it coerces to `0`
in a loose comparison. Those aren't contradictory; they're different operations.

</details>

## 12. Mini Challenge

Write `toNumber(input)` that converts a form value to a number and returns `null` for
anything that isn't a valid one — handling `''`, `'  '`, `'12px'`, `'3.5'`, `null` and
`undefined`.

Then explain why you couldn't just use `Number()` on its own.

## 13. Lesson Summary

> [!RECAP]
> - Eight falsy values; empty arrays and objects are **truthy**
> - `===` compares type and value; `==` converts first
> - `0 == ''` is true because both become `0`; `'' == '0'` is false because both are strings
> - `null` loosely equals only `undefined`; `NaN` equals nothing at all
> - `+` concatenates if either side is a string — every other operator goes numeric
> - Objects convert via `Symbol.toPrimitive`, `valueOf` then `toString`
> - `??` falls back only on `null`/`undefined`; `||` falls back on any falsy value

## Check your understanding

Answer these without looking back.

1. List the eight falsy values.
2. Explain `0 == ''` and `'' == '0'` in the same breath.
3. Why is `NaN !== NaN`, and how do you test for it properly?
4. Why does `[] == false` hold while `if ([])` runs the block?
5. When would `||` produce a bug that `??` wouldn't?
6. What sequence does an object go through to become a primitive?

## What's Next

**Lesson 8 — Objects.** Everything in JavaScript that isn't a primitive is one, so this is
the foundation for prototypes, `this`, and every framework you'll touch.
