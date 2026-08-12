'use strict';
// Lesson 72 — Compound Components. Run with:  node exercises/03-react/72-compound-components.js
// Predict every output BEFORE running. Write your prediction in the comment.
//
// React-less stand-ins: `createContext()` returns { Provider, display }.
//   - Provider is a FUNCTION: call it with (children, value); it pushes the
//     value into every MOUNTED display child — like a real context Provider
//     (Lesson 63).
//   - display() creates a consumer. It only receives values AFTER onMount()
//     is called, and stops as soon as the returned unsubscribe runs.
// Every createContext() call is an independent provider with its own
// consumers — the same isolation two <Select> mounts have in React.

function createContext() {
  const consumers = new Set(); // every display() created from this context

  function Provider(children, value) {
    for (const consumer of consumers) {
      if (consumer._active) consumer._receive(value); // only mounted consumers
    }
    return children;
  }

  function display() {
    const node = {
      _active: false,
      _receive(v) {
        this.value = v;
      },
      value: null,
      onMount() {
        node._active = true;
        return () => {
          node._active = false;
        };
      },
    };
    consumers.add(node); // this consumer belongs to this provider
    return node;
  }

  return { Provider, display };
}

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (one consumer, two provider updates)
function task1() {
  const SelectContext = createContext();
  const option = SelectContext.display();
  option.onMount(); // the option is mounted inside <Select>

  SelectContext.Provider(null, { value: 'react' });
  console.log('option sees:', option.value.value);

  SelectContext.Provider(null, { value: 'vue' });
  console.log('option sees:', option.value.value);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (context is per-Provider — isolation)
function task2() {
  const CtxA = createContext();
  const CtxB = createContext(); // a SECOND provider — its own consumers set
  const a = CtxA.display();
  const b = CtxB.display();

  a.onMount();
  b.onMount();
  CtxA.Provider(null, 'from A');
  CtxB.Provider(null, 'from B');

  console.log('a sees:', a.value);
  console.log('b sees:', b.value);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement makeContext: each call returns an independent { Provider, display }
// pair — so two <Select>s never share state, the way two <Select> mounts in
// React each get their own useState (Lesson 72, "The Cost" section).
function makeContext() {
  // your code here
}

function task3() {
  const Ctx1 = makeContext();
  const Ctx2 = makeContext();
  const d1 = Ctx1.display();
  const d2 = Ctx2.display();

  d1.onMount();
  d2.onMount();

  Ctx1.Provider(null, 'first select');
  Ctx2.Provider(null, 'second select');

  console.log('d1 sees:', d1.value); // must be 'first select'
  console.log('d2 sees:', d2.value); // must be 'second select'
  console.log('isolated?', d1.value === 'first select' && d2.value === 'second select');
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (TWO consumers of ONE provider)
function task4() {
  const Ctx = createContext();
  const trigger = Ctx.display();
  const option = Ctx.display();

  trigger.onMount();
  option.onMount();
  Ctx.Provider(null, { value: 'react', open: false });

  const state = { value: 'vue', open: true }; // ONE provider update…
  Ctx.Provider(null, state);

  console.log('trigger sees:', trigger.value.value, 'open:', trigger.value.open);
  console.log('option sees:', option.value.value);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Implement register(consumer): mount the consumer and return an object with
// .unsubscribe(). While registered, the consumer receives every provider
// update; AFTER unsubscribe it must go stale (stop receiving). This is why a
// real provider tears down its listeners — the Lesson 5 memory-leak note.
function register(consumer) {
  // your code here
  return { unsubscribe: () => {} };
}

function task5() {
  const Ctx = createContext();
  const hooked = Ctx.display();
  const oneShot = Ctx.display();

  hooked.onMount();                  // stays mounted the whole time
  const reg = register(oneShot);     // mounted through register

  Ctx.Provider(null, 'hello');
  const whileRegistered = oneShot.value;
  reg.unsubscribe();                 // now unmounted — must go stale

  Ctx.Provider(null, 'world');

  console.log('hooked sees:', hooked.value);               // must be 'world'
  console.log('oneShot while registered:', whileRegistered); // must be 'hello'
  console.log('oneShot after unsubscribe:', oneShot.value);  // must STILL be 'hello'
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Implement createStore(value): an object with:
//   .get()            → current value
//   .set(next)        → update the value and NOTIFY every subscriber
//   .subscribe(fn)    → add a subscriber, return an unsubscribe function
// This is the "parent owns the state" rule (Lesson 72) minus the DOM:
// every child reads one source of truth through the provider.
function createStore(value) {
  // your code here
}

function task6() {
  const store = createStore({ count: 0 });
  const seen = [];
  store.subscribe((v) => seen.push(v.count));
  store.set({ count: 1 });
  store.set({ count: 2 });
  const off = store.subscribe((v) => seen.push('late:' + v.count));
  store.set({ count: 3 });
  off(); // unsubscribed — must NOT see the next update
  store.set({ count: 4 });

  console.log('get:', store.get().count); // must be 4
  console.log('seen:', seen.join(','));   // must be 0,1,2,late:3
}
// task6();

module.exports = { createContext, makeContext, register, createStore };
