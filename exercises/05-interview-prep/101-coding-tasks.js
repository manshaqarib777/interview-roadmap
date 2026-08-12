'use strict';
// Lesson 101 — Common Coding Tasks. Run with:  node exercises/05-interview-prep/101-coding-tasks.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1: useDebounce (plain JS) ─────────────────────────────────
// Prediction: ______________________
// Implement debounce so it logs the value only after 150ms of silence.
// Hint: setTimeout + clearTimeout; the returned function is the debounced one.
function debounce(fn, delay) {
  // your code here
}

// The hook shape, for reference (runs in the browser, not here):
//   function useDebounce(value, delay) {
//     const [debounced, setDebounced] = useState(value);
//     useEffect(() => {
//       const id = setTimeout(() => setDebounced(value), delay);
//       return () => clearTimeout(id);
//     }, [value, delay]);
//     return debounced;
//   }

function task1() {
  const log = debounce((v) => console.log('searched:', v), 150);
  log('r');          // timer A
  log('re');         // 100ms later → clears A, starts B
  log('rea');        // 100ms later → clears B, starts C
  // 150ms of silence → only the trailing value should fire:
  setTimeout(() => console.log('expected output above: searched: rea'), 400);
}
// task1();

// ── Task 2: useInfiniteScroll (plain JS) ───────────────────────────
// Prediction: ______________________
// Implement makeInfiniteScroll(cb): returns { observe(el), disconnect() }.
// Simulate the IntersectionObserver contract with a tiny manual trigger:
// the returned object tracks whether it is "connected", and expose a
// notify(isIntersecting) method so the test can drive it like a browser would.
function makeInfiniteScroll(cb, { rootMargin } = {}) {
  // your code here
}

function task2() {
  const seen = [];
  const scroll = makeInfiniteScroll((page) => seen.push(page), { rootMargin: '200px' });
  const sentinel = { isConnected: true };

  scroll.notify(false);                                  // sentinel far below → nothing
  scroll.notify(true);                                   // sentinel in viewport → fetch
  scroll.notify(true);                                   // still in view → fetch again
  scroll.disconnect();                                   // unmount → no more callbacks
  scroll.notify(true);

  console.log('fetched pages:', seen);                   // must not include the post-disconnect call
  console.log('connected?', scroll.isConnected());       // must be false
}
// task2();

// ── Task 3: tabs state machine (plain JS) ──────────────────────────
// Prediction: ______________________
// Implement a tabs controller with ONE index of state. Expose:
//   { active, activate(i), next(), prev() }
// Arrow keys use next()/prev() and must WRAP (0 → 2 and 2 → 0 for 3 tabs).
function createTabs(count) {
  // your code here
}

function task3() {
  const tabs = createTabs(3);                             // tabs 0, 1, 2
  console.log('start:', tabs.active);                     // 0

  tabs.activate(1);
  console.log('after activate(1):', tabs.active);         // 1

  tabs.next();                                            // 2
  tabs.next();                                            // wraps → 0
  tabs.prev();                                            // wraps → 2
  console.log('after next,next,prev:', tabs.active);      // 2
}
// task3();

// ── Task 4: modal (plain JS) ───────────────────────────────────────
// Prediction: ______________________
// Implement createModal(): returns { open(), close(), isOpen(), onEscape(cb) }.
// Simulate the browser surface: an array of "listeners" you can fire, plus
// a list of focusable elements so you can assert the trap.
function createModal() {
  // your code here
}

function task4() {
  const modal = createModal();
  modal.onEscape(() => console.log('closed via Escape'));

  modal.open();
  console.log('open?', modal.isOpen());                   // true

  modal.close();
  console.log('open after close?', modal.isOpen());       // false
  modal.emitEscape();                                     // no listener while closed

  modal.open();
  modal.emitEscape();                                     // fires → "closed via Escape"
  console.log('open after escape?', modal.isOpen());      // false
}
// task4();

// ── Task 5: toast (plain JS) ───────────────────────────────────────
// Prediction: ______________________
// Implement createToaster(): returns { toast(message), dismiss(id), list() }.
// Auto-dismiss after the given duration; `dismiss` and the timer must
// share the SAME code path (no timers firing for already-dismissed toasts).
// Keep it synchronous-testable: don't rely on real timers below.
function createToaster({ duration = 50 } = {}) {
  // your code here
}

function task5() {
  const t1 = createToaster({ duration: 20 });
  const a = t1.toast('Saved');
  const b = t1.toast('Copied link');
  console.log('ids unique?', a !== b, '| messages:', t1.list().map((t) => t.message));

  t1.dismiss(a);                                          // manual close
  setTimeout(() => console.log('after 30ms:', t1.list().map((t) => t.message)), 30);

  const t2 = createToaster({ duration: 10 });
  const c = t2.toast('Synced');
  setTimeout(() => console.log('auto-dismissed?', t2.list().length === 0), 30); // true
}
// task5();

module.exports = { debounce, makeInfiniteScroll, createTabs, createModal, createToaster };
