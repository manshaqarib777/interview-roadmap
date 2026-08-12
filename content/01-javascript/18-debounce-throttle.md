# Lesson 18 — Debounce & Throttle

**Interview importance:** ⭐⭐⭐⭐⭐ — the most-requested "implement this on a whiteboard"
function in frontend interviews.

Every autocomplete, search box and resize handler in your career has been saved by one of
these two functions. They're short, they're pure timing logic, and they get asked more than
almost anything else in the JavaScript module — so this lesson builds both from scratch.

## Learning Objectives

By the end of this lesson you should be able to:

- Implement `debounce` from scratch and explain when it fires
- Implement `throttle` from scratch and explain what the "leading edge" means
- Choose debounce vs throttle for a real scenario without hesitating
- Explain the `this`/arguments forwarding and the leading/trailing edge options

## 1. One-line Definition

**Debouncing delays a call until activity stops; throttling limits how often a call can
happen at all.**

```text
debounce  →  wait for silence, then fire once
throttle  →  at most one fire per interval, no matter how noisy the input
```

Search-as-you-type wants debounce. Scroll handlers want throttle.

## 2. Mental Model

- **Debounce is a bouncer who resets the clock.** Every new knock restarts the timer; the
  door opens only after the knocking has stopped for the full wait.
- **Throttle is a turnstile.** It admits at most one person per second, no matter how many
  people queue up in between.

```text
debounce(200):  events → → → → → → →     (all reset the timer)
                fires only at the very end:          ↑

throttle(200):  events → → → → → → →
                fires at most once per window:  ↑  ↑  ↑
```

## 3. Visual Flow

Debounce — every call restarts the timer:

```text
event:  t=0   t=50  t=100  t=150
timer:  restart×3, last one set at t=150
fires:                            ↑ at t=350 (after 200ms of silence)
```

Throttle — calls between windows are dropped:

```text
event:  t=0   t=30  t=60  t=90   t=120  t=150
window: [0 ────── 200)              [200 ───── 400)
fires:  ↑ (first call)       …      ↑ (first after window opens)
```

## 4. How It Works — From Scratch

### Debounce

```js
function debounce(fn, delay) {
  let timer = null;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

Every call clears the previous timer and starts a new one. `fn` runs only after `delay` ms
have passed with no further calls.

```text
calls at t=0, 50, 100 → only ONE execution, 200ms after the last call
```

```narrate
line 3: the timer lives in the closure — private, one per debounced function
line 5: cancel whatever was scheduled — this IS the "reset"
line 6: schedule the real call; `this` and args are captured from THIS invocation
```

### Throttle

```js
function throttle(fn, wait) {
  let inCooldown = false;

  return function (...args) {
    if (inCooldown) return;

    inCooldown = true;
    setTimeout(() => { inCooldown = false; }, wait);

    fn.apply(this, args);
  };
}
```

The first call runs immediately; the cooldown flag blocks every call for the next `wait` ms;
when the cooldown ends, the next call slips through and starts a new window.

```text
calls at t=0, 10, 20, 30 → fn runs at t=0 only; next slot opens at t=200
```

## 5. Real Project Usage

| Scenario | Tool | Why |
|---|---|---|
| Search autocomplete | Debounce 300ms | Wait until the user stops typing |
| `resize` handler | Throttle | Recompute layout at most N times/sec |
| Save-as-you-type | Debounce | Save after a pause in editing |
| Scroll / infinite scroll | Throttle | Check position at most once per frame |
| Button double-click | Debounce | Ignore the burst after the first click |
| Window `scroll` + passive | Throttle | Never more often than a frame allows |

## 6. Interview Explanation

> Debounce runs a function only after input has stopped for a delay — every call resets the
> timer. Throttle runs at most once per interval; the first call executes and later ones are
> dropped until the window opens.
>
> Autocomplete wants debounce — you only care about the final keystroke. Scroll handlers want
> throttle — you want a steady cadence, not one call at the very end.

## 7. Senior-Level Insights

- **The two options interviewers probe are "leading" and "trailing" edges.** Debounce by
  default is *trailing* — it fires after the pause. If the user clicks once, nothing happens
  until the delay passes. Many real apps also want *leading* debounce: run immediately, then
  ignore repeats until the silence. Libraries expose `{ leading, trailing }` flags for this.
- **`this` and arguments must be forwarded.** The wrapper is a real function (not an arrow)
  so it can pass `this` through, or you'll break method calls and event handlers that rely on
  the receiver.
- **Trailing debounce can delay the last update forever** if input never stops. A common
  senior answer adds `maxWait`: force a fire if the delay keeps resetting. That's exactly how
  `lodash.throttle` is implemented — throttle is debounce with `maxWait`.
- **Cancel/cleanup is part of the contract.** A debounced function left on a mounted
  component will fire after unmount and set state on a dead component. Expose a `cancel()`
  and call it in the effect cleanup.
- **Timers aren't precise.** `setTimeout` waits at least the delay; it's the event loop's
  minimum, not a guarantee. Don't build correctness on debounce timing.

## 8. Common Mistakes

**Mistake 1 — using an arrow for the wrapper.** The wrapper needs its own `this` to forward:

```js
const debounce = (fn, delay) => {
  let timer = null;
  return (...args) => {          // ❌ `this` is lost — always undefined
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
```

If a user object calls the debounced method, `this` is gone. Use a `function` expression and
`fn.apply(this, args)`.

**Mistake 2 — the leading-fire variant without a flag** (classic debounce-vs-throttle
confusion):

```js
function debounceLeading(fn, delay) {
  let timer = null;
  let shouldRun = true;                 // ✅ needs its own flag
  return function (...args) {
    if (shouldRun) { fn.apply(this, args); shouldRun = false; }
    clearTimeout(timer);
    timer = setTimeout(() => { shouldRun = true; }, delay);
  };
}
```

Leading debounce is *not* throttle: the rearm is by timer expiry, and intermediate calls
still reset it.

**Mistake 3 — debouncing when you meant throttle** (and vice versa). Debounce with a fast,
continuous stream can starve: if the user never pauses 300ms, nothing ever runs. If the work
must happen on a cadence, throttle.

**Mistake 4 — forgetting to `clearTimeout` on unmount.** The delayed call fires after the
component is gone, and React warns or misbehaves. `cancel()` in cleanup, every time.

## 9. Best Practices

✅ Forward `this` and args with `function` + `fn.apply(this, args)`

✅ Expose `cancel()` (and maybe `flush()`) and call it in effect cleanups

✅ Pick by *cadence*: debounce for "after silence", throttle for "at most every N ms"

✅ Use 150–300ms for typing, ~16–100ms for scroll/resize (frame-rate aware)

✅ Consider leading+trailing (with `maxWait`) for "click" style debounce

❌ Don't debounce work that must happen on a schedule — it can be starved by continuous input

❌ Don't rely on timer precision for correctness — it's a minimum wait, not a guarantee

## 10. Interview Questions

**Q1. What is debounce?**

> A wrapper that postpones a function until input stops. Every call resets a timer; the
> function runs only after the delay passes with no further calls. It's for "wait until
> they finish" — search boxes, save-as-you-type.

**Q2. What is throttle?**

> A wrapper that limits a function to at most once per interval. The first call runs
> immediately, then calls are dropped while a cooldown flag is set. It's for steady-cadence
> work — scroll and resize handlers.

**Q3. Implement `debounce`.**

> A closure holding a timer. Each call clears it and schedules a new one; `this` and args
> are forwarded from the current invocation:

```js
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

**Q4. Implement `throttle`.**

> A closure holding a cooldown flag. Run the first call, set the flag, and clear it when the
> window ends:

```js
function throttle(fn, wait) {
  let inCooldown = false;
  return function (...args) {
    if (inCooldown) return;
    inCooldown = true;
    setTimeout(() => { inCooldown = false; }, wait);
    fn.apply(this, args);
  };
}
```

**Senior follow-up: When would you choose one over the other?**

> When the event matters only once the stream stops — typing, searching — debounce. When work
> must happen on a regular cadence regardless of the noise — scrolling, resizing, mousemove —
> throttle. If debounce could starve because input never pauses, add `maxWait` or switch.

**Senior follow-up: How is leading vs trailing edge implemented?**

> Trailing (default) fires after the pause — that's the plain `debounce`. Leading fires
> immediately then ignores repeats until the delay expires, which needs its own flag.
> Libraries like Lodash expose both flags, and `throttle` is essentially debounce with
> `maxWait` — a forced fire when the stream never pauses.

## 11. Follow-up Questions

**Why does the wrapper need to forward `this`?**

> Because you're replacing the user's function with your own. If an object calls
> `this.save()` through the debounced wrapper, the wrapper's `this` has to reach the original
> `fn`, or the method breaks. The wrapper is a plain `function`, and we call
> `fn.apply(this, args)`.

**What happens if you never `clearTimeout`?**

> The scheduled call fires anyway — after unmount, after the component is gone, possibly
> setting state on a dead component or running work nobody asked for. `cancel()` in effect
> cleanup is the standard fix.

**Is `setTimeout` timing exact?**

> No. It guarantees *at least* the delay. Heavy main-thread work can push the actual fire
> later, which is fine for debounce/throttle (they're about cadence) but not for anything
> that needs real timing precision.

## 12. Comparison Table

| | Debounce | Throttle |
|---|---|---|
| Behaviour | Fires once, after input stops | Fires at most once per interval |
| Resets on new calls | ✅ | ❌ |
| First call runs immediately | ❌ (trailing default) | ✅ (leading) |
| Risk | Starvation if input never pauses | Misses the final event |
| Best for | Search, save, double-click | Scroll, resize, mousemove |
| Lodash | `_.debounce(fn, ms)` | `_.throttle(fn, ms)` |

## 13. Code Example

A working debounce you can run and watch — the burst triggers exactly one execution:

```js
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const log = debounce((msg) => console.log('ran:', msg), 200);

log('a'); log('b'); log('c');     // three calls in one tick → resets

setTimeout(() => log('d'), 300);  // silence since t=0 → 'd' fires at t=500
```

Output:

```text
ran: c
ran: d
```

The `a`, `b`, `c` burst collapses into a single trailing call — with the **last** message,
because the final call's args win. That's the shape of every search-as-you-type box.

## 14. Performance Notes

- **Debounce optimises count, not cadence** — it reduces N calls to 1, at the cost of delay
  (the "lag" you feel in a search box).
- **Throttle optimises rate** — it keeps the stream flowing at a bounded frequency.
- **On scroll/resize, throttle to ~16ms (one frame) or use `requestAnimationFrame`** for
  layout work; the browser can't paint faster than that anyway.
- **If the input already arrives slowly, neither tool is needed** — wrapping in overhead for
  a low-frequency event is pointless. Add these only when you measure the cost.
- **Long delays on trailing debounce feel broken.** 300ms+ on a button makes the UI feel
  dead. Keep interactive delays short.

## 15. Debugging Scenarios

**Scenario 1 — "The search fires on every keystroke."**

You wrapped the handler but called the wrong thing — the two patterns differ in *when* the
wrapper is created:

```jsx
onChange={(e) => debouncedSearch(e.target.value)}   // ✅ same wrapper, new args
onChange={debouncedSearch}                          // ❌ new debounced fn each render
```

A fresh wrapper per render means a fresh timer per render — the debounce never accumulates.
The wrapped function must be created once (or memoized).

**Scenario 2 — "It fires once at the start, never at the end."**

You built leading debounce and the stream never pauses — so the trailing call never happens.
Either accept the drop, or add `maxWait` so a fire is forced on a schedule.

**Scenario 3 — "It fires after I unmounted."**

The timer wasn't cleaned up. Expose `cancel()` and call it in the effect cleanup — the same
`clearInterval` habit from Lesson 5.

**Scenario 4 — "The click handler lost `this`."**

The wrapper was an arrow, so `this` was captured (or `undefined` in strict mode). Switch to a
`function` wrapper and forward with `fn.apply(this, args)`.

## 16. Quick Revision Notes

- Debounce: every call resets the timer → fires once, after silence
- Throttle: cooldown flag → at most one fire per window, first call immediate
- Forward `this` and args — plain `function` wrapper, `fn.apply(this, args)`
- Leading edge = run now, then block; trailing edge = run after the pause
- Throttle ≈ debounce with `maxWait` (Lodash implements it that way)
- Expose `cancel()`; clear timers in effect cleanup
- `setTimeout` is a minimum wait, not precise timing

## 17. Cheat Sheet

```text
debounce(fn, ms):  clearTimeout → setTimeout  →  one call after silence
throttle(fn, ms):  if (!cooldown) { cooldown; run fn; unlock after ms }

_.debounce(fn, ms, { leading, trailing, maxWait })
_.throttle(fn, ms)  ≡  _.debounce(fn, ms, { maxWait: ms })

search/type/save  → debounce  (~200–300ms)
scroll/resize     → throttle  (~16–100ms)
always cancel()   in useEffect cleanup
```

## 18. Key Takeaways

> [!RECAP]
> - Debounce waits for a pause; throttle caps the rate — the two ways to tame a noisy event
> - From scratch, both are a closure plus a timer (or a flag): debounce clears and resets,
>   throttle blocks until the window ends
> - Forward `this` and arguments; expose `cancel()` and clean up timers (Lesson 5 habits)
> - Leading edge fires immediately, trailing fires after the pause; `maxWait` bridges both
> - Search → debounce, scroll/resize → throttle
> - Whiteboard both implementations until they're reflex — they are that common

## Check your understanding

Answer these without looking back.

1. Write `debounce` and `throttle` from memory side by side.
2. A search box fires on every keystroke. What's the one-line fix, and why does a new
   wrapper per render break it?
3. Which tool do you pick for a scroll handler, and why not the other?
4. What does "leading edge" mean, and when does plain debounce feel broken without it?
5. Why must the wrapper forward `this`, and how do you do it?

## What's Next

**Lesson 19 — Arrays & Array Methods.** `map`, `filter` and `reduce` — the vocabulary of
every data transformation, and the standard interview warm-up: implement them yourself.
