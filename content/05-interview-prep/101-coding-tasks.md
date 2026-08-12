# Lesson 101 — Common Coding Tasks

**Interview importance:** ⭐⭐⭐⭐⭐ — a live-coding round decides your offer more than any whiteboard talk.

Debounced search, infinite scroll, modal, tabs, toast. These five prompts cover a huge
fraction of real frontend live-coding rounds, and every one of them is a *reusable pattern*,
not a one-off. Build each once and you can reproduce any of them in a room, under pressure,
with clean-enough code.

This lesson is a drill, not a lecture. Each task gets the same treatment: the prompt,
the design decision, the code, the edge cases, and the question the interviewer will follow
up with. We assume you already know the building blocks — debounce from Lesson 18, custom
hooks from Lesson 65, controlled inputs from Lesson 54 — and we wire them together the way
you would in a real round.

> [!NOTE]
> The pattern across all five: **build the primitive once, wrap it in a hook, drop it into a
> component.** Interviewers aren't grading your JSX — they're grading whether you reach for
> that pattern immediately.

## Learning Objectives

By the end of this lesson you should be able to:

- Implement `useDebounce` and wire it into a controlled search input that fetches on the trailing value
- Implement `useInfiniteScroll` with `IntersectionObserver` and say why it beats a scroll listener
- Build an accessible modal: portal or fixed overlay, Escape to close, and a minimal focus trap
- Build a controlled tabs component with arrow-key navigation and an `aria-selected` pattern
- Build a toast system with an imperative `toast()` API, auto-dismiss timers and a context-backed store
- Explain the one design decision behind each task and handle the edge cases interviewers probe

## 1. What Are Common Coding Tasks?

**Small, self-contained UI features — debounced search, infinite scroll, modal, tabs, toast — that interviewers use to watch you code live.**

They are the "live-coding round" version of a frontend screen. The scope is intentionally
small so the round measures *how you build*, not how much you memorised. Every task maps to
a real product feature, which is exactly why they repeat: one round's modal is the next
round's toast. Each is a pattern you can write from muscle memory.

## 2. Mental Model

You're a contractor handed five small tickets on day one. Each ticket is a *feature*, not a
task: "add search with debounce", "load more when the user scrolls to the bottom". A senior
doesn't build these from scratch every time — they reach for a tiny reusable hook they've
written before and adapt it.

That's the entire lesson. **The hook is the deliverable, the component is the demo.** The
component proves the hook works; the hook is what you keep.

## 3. Visual Flow

The five tasks, and the one idea each rides on:

```text
Task            The one idea                The reusable piece
─────────────────────────────────────────────────────────────────────
1. Debounced    wait for a pause, then      useDebounce(value, delay)
   search       fetch the trailing value    → + useSearch()
─────────────────────────────────────────────────────────────────────
2. Infinite     fire when the sentinel      useInfiniteScroll(cb)
   scroll       enters the viewport         → IntersectionObserver
─────────────────────────────────────────────────────────────────────
3. Modal        escape to close, trap the   Modal + useFocusTrap
                focus inside the dialog     → createPortal
─────────────────────────────────────────────────────────────────────
4. Tabs         one index of state,         useTabs(count) → keys +
                keys for keyboard           arrow handling
─────────────────────────────────────────────────────────────────────
5. Toast        an imperative API over      ToastProvider + useToast
                a context-backed store      → toast('Saved') anywhere
─────────────────────────────────────────────────────────────────────
```

Read it as a pipeline: pick the state → put it in a hook → subscribe a component. Task 5 is
the same pipeline with the state moved into context so any component can reach it.

## 4. How It Works

Everything here is three primitives you already own: **state, effects, and refs.** The
variety comes from how you combine them.

- **State** drives the UI: `query`, `page`, `activeTab`, `toasts[]`.
- **Effects** do the side-effect work: subscribing to observers, starting timers, wiring key listeners.
- **Refs** hold values that must *not* trigger renders: the observer, the timer id, the latest query.

The one mental rule that keeps all five tasks clean: **if a value must survive renders
without causing one, it's a ref; if it must show up in the UI, it's state.** Confusing those
two is the cause of most bugs in this lesson.

Then two smaller rules do the rest:

1. **Clean up every effect.** Return the unsubscribe/clear function. An infinite scroll that
   never disconnects its observer, or a toast that never clears its timer, is a leak wearing
   a feature.
2. **Every mutation goes through the state setter.** In infinite scroll that's the
   `setItems(prev => [...prev, ...page])` append — mutating `items.push()` is Lesson 6's
   reference trap: the old and new arrays are the same object, and React skips the render.

## 5. Real Project Usage

Every one of these ships in production, every day.

| Feature | Where you've used it | The hook it became |
|---|---|---|
| **Debounced search** | Every search box: product search, Gmail, code search | `useDebounce` + a fetch effect |
| **Infinite scroll** | Twitter/X timelines, Instagram, every feed | `useInfiniteScroll` + `IntersectionObserver` |
| **Modal** | Confirm dialogs, login, image lightboxes | `Modal` + portal + focus trap |
| **Tabs** | Settings pages, dashboards, pricing tables | `useTabs` with keyboard support |
| **Toast** | "Saved", "Copied link", error banners | `ToastProvider` + `toast()` |

Now let's build all five, one by one.

### Task 1 — Debounced Search

The prompt, verbatim from real rounds: *"Build a search box that fetches results only after
the user stops typing."*

Two decisions to make before writing code. First: **controlled or uncontrolled?** The input
value needs to drive the search, so it's controlled — `value` from state, `onChange` updates
it. Second: **what fires the fetch?** Two candidates:

- Debounce the input *event* (`onChange` → `debounce(fetch)`) — the timer is inside the event handler.
- Debounce the input *value* (`useDebounce(value, 300)` + an effect on the debounced value) — the timer is inside the hook.

The second one is the answer interviewers want, because it's testable and it decouples
"what's in the box" from "what did we search for". Lesson 18's debounce reference is exactly
this: wait 300ms of silence, then act on the trailing value. We wrap that in a hook (from
Lesson 65) so any component can use it.

```js
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);          // cancel the pending update on every change
  }, [value, delay]);

  return debounced;
}
```

```text
user types "r"        → value="r"        → timer A starts → 300ms → debounced="r"
user types "re" (at 100ms)               → timer A cleared → timer B starts
user types "rea" (at 200ms)              → timer B cleared → timer C starts
(no keystroke for 300ms)                 → timer C fires → debounced="rea"
```

```narrate
line 1: useDebounce takes the raw value plus a delay, and returns a delayed copy.
line 4-6: every render sets a fresh timer; when the value changes again before the timer
          fires, the cleanup clears it. Only 300ms of silence lets one through.
line 8: the caller uses this returned value as the "real" search term.
```

That hook is the pattern. Now the component, and note where the effect *dependencies* come
from: we re-run the fetch effect only when the *debounced* value changes, not on every
keystroke. This is the value-debounce win over event-debounce — the effect is trivially
correct because its dependency is exactly the thing that should trigger it.

```jsx
function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;                          // ignore stale responses
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setResults(data); });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products…"
      />
      <ul>
        {results.map((r) => <li key={r.id}>{r.name}</li>)}
      </ul>
    </div>
  );
}
```

```text
Render result:
  [ search products…            ]
  • Wireless Mouse
  • Mechanical Keyboard
typing updates the input instantly; the list only changes 300ms after you stop.
```

```narrate
line 4: the input is controlled — the box and `query` can never disagree.
line 6-9: the effect depends on the DEBOUNCED value, so typing alone never fetches.
line 10: cancelled flag — the classic answer to "what if a slow response arrives last?"
line 20: encodeURIComponent — free correctness points interviewers notice.
```

> [!TIP]
> Name the two debounce candidates out loud before coding. Saying *"I'll debounce the value,
> not the event, so the effect dependency is the debounced value"* is worth more than the
> code itself.

### Task 2 — Infinite Scroll

The prompt: *"Load the next page of results when the user scrolls to the bottom."*

**`IntersectionObserver`, not a scroll listener.** It's the senior answer, and it's honestly
simpler: you attach it to a *sentinel element* (a tiny div at the bottom of the list) and
get a callback the moment that element enters the viewport — no math, no `scroll` event, no
`getBoundingClientRect`. A scroll listener means listening to a high-frequency event,
reading positions, and manually checking the threshold; the observer is declarative and the
browser does the geometry.

```js
function useInfiniteScroll(loadMore) {
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);           // attach this to the bottom element
  const loadMoreRef = useRef(loadMore);       // see the stable-callback note below

  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreRef.current();
      },
      { rootMargin: '200px' }                 // preload before the edge
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();       // cleanup — the observer must die with the effect
  }, []);

  return sentinelRef;
}
```

```text
List grows downward. When the sentinel div approaches the viewport bottom:
  [ entry 1 ]  ┐
  [ entry 2 ]  │   viewport
  [ entry 3 ]  │
  ─────────────┘
  ( sentinel )   ← rootMargin 200px makes the observer fire EARLY
  → loadMore() → next page appended → sentinel moves back out of range
```

```narrate
line 2-4: two refs — the observer and the sentinel element. Neither may trigger renders.
line 8-9: keep the latest loadMore in a ref so the once-created observer always calls the
          CURRENT callback — a closure over a stale one is the classic infinite-scroll bug.
line 12-13: isIntersecting is the whole test. rootMargin preloads so the fetch happens
            before the user reaches the very bottom.
line 17: disconnect on cleanup — leaving the observer attached to an unmounted list is a leak.
```

Why the `loadMoreRef` dance? The observer effect runs once with `[]`. If `loadMore` changes
(a new page closure, new filters), the observer still calls the *first* one — a stale
closure, exactly Lesson 5. Keeping the latest callback in a ref means the once-created
observer always fires with the current logic. This "ref for the latest callback" trick shows
up in every one of these tasks.

```jsx
function Feed() {
  const [items, setItems] = useState(seedItems);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useInfiniteScroll(() => {
    if (!hasMore) return;
    setPage((p) => {
      fetch(`/api/items?page=${p + 1}`)
        .then((r) => r.json())
        .then((next) => {
          setItems((prev) => [...prev, ...next.items]);   // append, don't push
          setHasMore(next.hasMore);
        });
      return p + 1;
    });
  });

  return (
    <div>
      {items.map((item) => <div key={item.id}>{item.title}</div>)}
      {hasMore && <div ref={sentinelRef} />}   {/* the sentinel — this is all the observer needs */}
    </div>
  );
}
```

```text
Render result: an endlessly-growing feed of <div>s; a new page loads as you near the bottom.
```

> [!PITFALL]
> Two classic failures. **Stale callback**: the observer was created once and keeps calling
> the first `loadMore` — fixed by the ref above. **Missing keys**: `items.map` without a
> stable `key` means React re-renders everything instead of appending, and the scroll
> position visibly jumps. Both get asked as follow-ups.

### Task 3 — Modal

The prompt: *"Build a modal that closes on Escape and keeps focus inside."*

Two design decisions to state up front. **Portal or fixed overlay?** The answer is a portal
(`createPortal`) when the modal might be nested in a component with `overflow: hidden`,
`transform`, or a low `z-index` — the portal renders into `document.body`, so no ancestor
can clip it. A plain fixed overlay is fine when you control the ancestors; the portal is the
answer that never needs that caveat. **Where does the state live?** In the parent, as a
boolean. The modal is controlled: `open` + `onClose` in, nothing out.

The keyboard part has two halves. Escape closes — a keydown listener on the window. And
*focus is trapped*: the dialog is a focus island. When it opens, focus moves to the dialog
(start on the close button or the dialog itself); Tab cycles within it instead of escaping
to the page behind; when it closes, focus returns to the trigger. For a live-coding round a
**minimal trap** — hold focus inside with a Tab loop — is plenty; the full `inert`/focus
management is the senior follow-up.

```jsx
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

function Modal({ open, onClose, title, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;   // remember who opened us
    dialogRef.current?.focus();                     // focus moves INTO the dialog
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();            // Escape closes — the #1 expectation
      if (e.key === 'Tab') {                        // minimal focus trap
        const focusables = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previousFocus?.focus();                       // and return focus to the trigger
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title">{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body                                    // portal: no ancestor can clip us
  );
}
```

```text
Render result:
  dimmed page behind ─────────────────────┐
                                         │   ( overlay, click = close )
      ┌──────────────────────────┐       │
      │  Delete project?         │       │
      │  This can't be undone.   │       │   ← focus is inside, Tab cycles here
      │  [Cancel]  [Delete]      │       │
      └──────────────────────────┘       │
  Escape closes · focus returns to the button that opened it
```

```narrate
line 5-6: remember who opened the modal so cleanup can hand focus back.
line 11-20: the minimal trap — query focusable elements, loop Tab between first and last.
line 26: role="dialog" + aria-modal + aria-labelledby is the accessible minimum.
line 35: createPortal into document.body escapes any clipping ancestor.
```

> [!NOTE]
> `tabIndex={-1}` on the dialog is what makes `.focus()` work on a non-interactive element.
> Leaving it out is the classic "focus() silently does nothing" bug.

### Task 4 — Tabs

The prompt: *"Build a tabs component. Click a tab, see its panel. Keyboard arrows should move between tabs."*

Tabs are a **controlled index**: one number in state, `activeIndex`, and everything derives
from it. The tab buttons and the panels are both rendered from a single `tabs` array, which
guarantees they can never fall out of sync. The accessibility pattern is the WAI-ARIA tabs
pattern — `role="tablist"` / `role="tab"` / `role="tabpanel"`, wired together with ids — and
the keyboard part is small: arrow keys move the index, and the *roving tabindex* pattern
keeps only the active tab in the tab order.

```jsx
function Tabs({ tabs }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activate = (i) => {
    const next = (i + tabs.length) % tabs.length;   // wrap: 0 → 1 → 2 → 0
    setActiveIndex(next);
    document.getElementById(`tab-${next}`)?.focus(); // keyboard move lands focus too
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); activate(activeIndex + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); activate(activeIndex - 1); }
  };

  return (
    <div>
      <div role="tablist" aria-label="Settings" onKeyDown={onKeyDown}>
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            id={`tab-${i}`}
            role="tab"
            aria-selected={i === activeIndex}
            aria-controls={`panel-${i}`}
            tabIndex={i === activeIndex ? 0 : -1}    // only the active tab is tabbable
            onClick={() => setActiveIndex(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          id={`panel-${i}`}
          role="tabpanel"
          aria-labelledby={`tab-${i}`}
          hidden={i !== activeIndex}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

```text
Render result:
  [ General | Security | Billing ]        ← ArrowRight / ArrowLeft move the selection
  ┌──────────────────────────────┐
  │ Change your password…         │       ← panel 1 shown, others hidden
  └──────────────────────────────┘
```

```narrate
line 2: ONE piece of state — activeIndex. No isActive flags, no per-tab booleans.
line 5-6: the arrow handler wraps around and moves real focus, not just the highlight.
line 15-18: tabindex only on the active tab = the roving tabindex pattern.
line 22: aria-selected drives both screen readers and (with CSS) the visual state.
line 28-32: panels are derived from the same array, so selection and panel can't desync.
```

One important detail: clicking a tab does **not** move focus to it (clicking already focuses
the button), but arrow keys must — that's why the keyboard path calls `.focus()`. Screen
reader users get `aria-selected`, keyboard users get real focus, and the panel swaps via
`hidden`. That's the whole WAI-ARIA tabs pattern in eleven lines.

### Task 5 — Toast

The prompt: *"Build a toast notification system. Any component should be able to show 'Saved' and have it disappear automatically."*

Toasts invert the earlier pattern: instead of a component calling a hook, **the hook is the
API**. You expose an imperative `toast('Saved')` that any component — deep in a tree, in a
callback, in a form submit handler — can call. Implementation: a `ToastProvider` holds the
list in state and renders the stack; `useToast()` returns a `toast` function that appends
and starts an auto-dismiss timer.

The two decisions interviewers probe: **the id** (a counter, because content alone isn't
unique — two "Saved" toasts must be separate) and **the timer** (stored per toast so it can
be cleared on manual dismiss — a toast that keeps its timer after you close it is a memory
leak and a surprise).

```jsx
const ToastContext = createContext(null);
let toastId = 0;                                    // module counter = unique ids

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismiss(id), duration);        // auto-dismiss timer per toast
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            {t.message}
            <button onClick={() => dismiss(t.id)}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx.toast;
}
```

```text
Render result (3 seconds after calling toast('Saved', 'success')):
  ┌──────────────────────┐
  │ ✓ Saved        [×]   │   ← appears bottom-right (or top), then slides out
  └──────────────────────┘
```

```narrate
line 1-2: the context is the channel; the module counter guarantees unique keys.
line 8-10: toast() is the imperative API — call it from anywhere inside the provider.
line 12: each toast gets its own timer; manual dismiss still removes it via the same path.
line 17: aria-live="polite" announces new toasts to screen readers — free a11y points.
```

> [!TIP]
> Now the "Why line" pays off: you've built five features with the same skeleton —
> **state in a hook, side effects cleaned up, imperative escape hatch via ref or context.**
> The toast is the tabs hook with the state moved up into a provider. Same muscles, one more layer.

## 6. Interview Explanation

> The five common coding tasks are small UI features with reusable answers. Debounced
> search: debounce the value in a hook, fetch in an effect that depends on the debounced
> value. Infinite scroll: `IntersectionObserver` on a sentinel element, wrapped in a hook,
> appended state. Modal: controlled `open`, portal to `document.body`, Escape to close, and
> focus returned on unmount. Tabs: one `activeIndex`, arrow keys wrapping it, WAI-ARIA
> roles, only the active tab tabbable. Toasts: context-backed store, imperative `toast()`
> API, per-toast auto-dismiss timers. The through-line: state in a hook, effects cleaned up,
> refs for the non-rendering values.

## 7. Senior-Level Insights

The tasks are the same for juniors and seniors — the *code* differs. The senior signals:

- **Names the design decision before writing it.** "I'll debounce the value, not the event." "Portal, because the button lives inside an overflow container." "A counter for ids, because content isn't unique."
- **Reaches for the hook shape automatically.** `useDebounce`, `useInfiniteScroll`, `useTabs` — the component is a demo of the hook.
- **Talks about the effect lifecycle.** Every effect has a cleanup; the observer disconnects, the timer clears, the listener removes, focus returns.
- **Knows the stale-closure trap everywhere.** The infinite-scroll ref trick, the `cancelled` flag in search, the `loadMoreRef` — all the same Lesson 5 mechanism, anticipated rather than debugged.
- **Adds the a11y minimum without being asked.** `role="dialog"`, `aria-selected`, `aria-live`, `tabIndex` — each is one attribute, and each is noticed.

The juniors code; the seniors talk while they code. Say what you're doing and why, in one
sentence per decision, and the code becomes evidence for the explanation.

## 8. Common Mistakes

1. **Fetching on every keystroke.** The search fires a request per character — debounce the *value*, not the event.
2. **Stale response wins.** A slow earlier request resolves after a fast later one. Fix with the `cancelled` flag (or abort the controller).
3. **`items.push()` instead of append.** Mutating the array is Lesson 6's reference trap: React sees the same array reference and skips the render.
4. **Never disconnecting the observer.** An unmounted feed keeps its `IntersectionObserver` attached to a dead node — a leak the cleanup would have prevented.
5. **Escape listener never removed.** The keydown listener stays on `window` after the modal closes; the next modal has two, then three, then…
6. **Focus trap misses Shift+Tab.** Trapping forward Tab only; backwards Tab walks out of the dialog.
7. **Clicking the overlay closes the modal… but so does clicking inside.** The classic one-line bug: forgetting `e.stopPropagation()` on the dialog.
8. **Content as the toast key.** Two "Saved" toasts collide, one disappears, React warns about duplicate keys.
9. **`focus()` silently doing nothing.** The dialog needs `tabIndex={-1}` before `.focus()` works on it.

## 9. Best Practices

✅ **Debounce the value, not the event** — the effect dependency becomes the debounced value, which is trivially correct

✅ **`IntersectionObserver` over scroll listeners** — declarative, and the browser does the geometry

✅ **Append state functionally** — `setItems(prev => [...prev, ...next])`, never `push`

✅ **Every effect gets a cleanup** — disconnect, clear, remove; then there are no leaks to debug

✅ **Portal the modal into `document.body`** — no ancestor can clip or z-index it away

✅ **Tabs keep one source of truth** — `activeIndex` only; panels are derived from the same array

✅ **Context for anything "any component"** — toast state in a provider, `useToast()` as the API

❌ **Don't trap focus to *inside* the modal but forget to return it on close**

❌ **Don't render panels by conditionals and lose the `hidden`/`aria` wiring**

❌ **Don't start a timer you can't cancel** — a manual-dismissed toast must clear its own timer

## 10. Interview Questions

**Q1. How would you build a debounced search input?**

> Controlled input: `value` in state, and a `useDebounce(value, 300)` hook that returns a
> delayed copy. A fetch effect depends on the debounced value, so typing alone never
> triggers a request — only 300ms of silence does. I also guard against out-of-order
> responses with a cancelled flag or `AbortController`.

**Q2. Infinite scroll: scroll listener or IntersectionObserver?**

> IntersectionObserver. I attach it once to a sentinel element at the bottom of the list and
> get a callback when it enters the viewport, with a `rootMargin` to preload. No scroll
> events, no position math. The hook stores the latest callback in a ref so the once-created
> observer never fires a stale one, and disconnects on cleanup.

**Q3. What makes a modal accessible?**

> Escape closes it, focus moves into the dialog when it opens and returns to the trigger on
> close, and Tab cycles inside it — a minimal trap. The dialog carries `role="dialog"`,
> `aria-modal`, and a labelled title. I'd render it through a portal so no ancestor can clip
> it, and `aria-live` regions elsewhere announce the result.

**Q4. How do tabs work under the hood?**

> A single controlled `activeIndex`. The tab buttons and panels are both mapped from the
> same array, so they can't desync. Arrow keys adjust the index with wraparound and move real
> focus; the active tab is the only one tabbable — the roving tabindex pattern — and
> `aria-selected` mirrors the state for screen readers.

**Q5. How do toasts know when to disappear?**

> Each toast gets its own id from a counter and its own `setTimeout` for auto-dismiss. The
> provider holds the list in state and renders the stack; a dismiss function filters by id,
> and the manual close button and the timer share that same path, so a manual close clears
> the pending timer.

**Senior follow-up: How are all five tasks the same problem?**

> They're all "state in a hook, effects cleaned up". Debounce and toasts are timers; infinite
> scroll and the modal are observers and listeners; tabs is pure state. Each one returns a
> small reusable piece — `useDebounce`, `useInfiniteScroll`, a `Modal`, `useTabs`, `useToast`
> — and the component is just a demo of that piece. The only variation is where the state
> lives: local for tabs, a ref for the observer, context for toasts.

## 11. Follow-up Questions

**What if two search requests overlap and the slow one arrives last?**

> Race the responses. Either a `cancelled` flag flipped in the effect cleanup, or an
> `AbortController` that aborts the previous request when the next one starts. Only the
> response for the latest query is committed.

**Why does the sentinel need a ref, and what breaks without it?**

> The observer needs the *actual DOM node* to observe. If the sentinel is unmounted (no more
> pages), the effect must not observe a null node, and when the node exists it must be the
> current one — the ref re-attaches across renders. And the observer itself must disconnect,
> or the unmounted node keeps being observed.

**Why not just render the modal with `position: fixed`?**

> Fixed is fine until an ancestor has `transform`, `filter`, or `overflow: hidden` — those
> make fixed position relative to that ancestor, not the viewport, and the modal gets
> clipped. A portal into `document.body` sidesteps every ancestor constraint. Mention both
> and you've answered the senior version.

**Why `aria-selected` AND `tabIndex` on tabs — aren't they redundant?**

> Different audiences. `aria-selected` is for screen readers; `tabIndex` is for keyboard
> users — only the active tab should be a Tab stop, so tabbing into the tablist lands on the
> current tab and arrows move from there. Removing either breaks one of the two.

**How would you add a "loading" state to infinite scroll?**

> The simplest honest version: a boolean in state toggled around the fetch, and the sentinel
> renders a spinner when it's true so the observer doesn't double-fire while a page is in
> flight. That flag also answers "why did the same page load twice?"

## 12. Comparison Table

| Aspect | Debounced search | Infinite scroll | Modal | Tabs | Toast |
|---|---|---|---|---|---|
| Core state | `query` + debounced copy | `items`, `page` | `open` boolean | `activeIndex` | `toasts[]` in provider |
| Timing | debounce timer (300ms) | observer callback | Escape keydown | immediate | auto-dismiss timer |
| Reusable piece | `useDebounce` | `useInfiniteScroll` | `Modal` | `useTabs` | `useToast` |
| Key edge case | stale/out-of-order response | stale callback, missing keys | focus trap & return | panel/tab desync | duplicate content ids |
| State location | local hook | local hook + ref | parent, controlled | local hook | context provider |
| A11y minimum | — | — | `role="dialog"`, `aria-modal` | tab roles + `aria-selected` | `aria-live="polite"` |

## 13. Code Example

The full live-coding drill in one gulp — all five hooks, wired into a demo app. This is the
"answer key" shape: primitives first, then a screen that exercises every one. Read it as
the reference for what "complete" means at the end of a round.

```jsx
// ===== Task 1 — debounced search =====
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

// ===== Task 2 — infinite scroll =====
function useInfiniteScroll(loadMore) {
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);
  const loadMoreRef = useRef(loadMore);

  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreRef.current();
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  return sentinelRef;
}

// ===== Task 3 — modal =====
function Modal({ open, onClose, title, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;
    dialogRef.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title">{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body
  );
}

// ===== Task 4 — tabs =====
function Tabs({ tabs }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activate = (i) => {
    const next = (i + tabs.length) % tabs.length;
    setActiveIndex(next);
    document.getElementById(`tab-${next}`)?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      activate(activeIndex + 1);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      activate(activeIndex - 1);
    }
  };

  return (
    <div>
      <div role="tablist" aria-label="Settings" onKeyDown={onKeyDown}>
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            id={`tab-${i}`}
            role="tab"
            aria-selected={i === activeIndex}
            aria-controls={`panel-${i}`}
            tabIndex={i === activeIndex ? 0 : -1}
            onClick={() => setActiveIndex(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          id={`panel-${i}`}
          role="tabpanel"
          aria-labelledby={`tab-${i}`}
          hidden={i !== activeIndex}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}

// ===== Task 5 — toasts =====
const ToastContext = createContext(null);
let toastId = 0;

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            {t.message}
            <button onClick={() => dismiss(t.id)}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx.toast;
}

// ===== Demo screen: all five, working together =====
function App() {
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  return (
    <ToastProvider>
      <Search />                                  {/* 1: debounced search   (Task 1) */}
      <Feed />                                    {/* 2: infinite scroll    (Task 2) */}
      <Tabs                                       {/* 4: tabs               (Task 4) */}
        tabs={[
          { id: 'general', label: 'General', content: 'Profile settings…' },
          { id: 'security', label: 'Security', content: 'Password & sessions…' },
          { id: 'billing', label: 'Billing', content: 'Plans & invoices…' },
        ]}
      />
      <button onClick={() => toast('Saved!', 'success')}>Save</button>  {/* 5: toast (Task 5) */}
      <button onClick={() => setShowModal(true)}>Delete project</button>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Delete project?">
        <p>This can't be undone.</p>
      </Modal>                                     {/* 3: modal              (Task 3) */}
    </ToastProvider>
  );
}
```

```text
Render result: a search box that queries on pause, a feed that loads as you scroll,
tabs you can drive with arrows, a modal that closes on Escape, and toasts that
auto-dismiss after three seconds — every hook above working at once.
```

> [!DEEPDIVE]
> **What the interviewer is actually scoring.** It's never "did the modal close on Escape".
> It's the three habits visible in these five implementations: (1) **state boundaries** —
> you know what belongs in state, a ref, or an effect before you write it; (2) **lifecycle
> hygiene** — every effect names its cleanup, and you can say what leaks if it's missing;
> (3) **abstraction level** — you produce a `useDebounce`, not a wall of inline timers. If
> you demonstrate all three once, the interviewer stops testing the feature and starts
> talking to you like a colleague.

## 14. Performance Notes

- **When it matters:** a search over a large dataset (or a server) — every keystroke is a request; a long feed with big rows — observe, don't listen to scroll, and virtualize at thousands of rows (from Lesson 76).
- **When it doesn't:** a 20-row list still benefits from the *structure* (one observer, one effect) but needs no tuning; debouncing an in-memory filter of 50 items is premature.
- **The real costs to name:** network requests in search; renders on every appended page in infinite scroll (keys decide whether it's an append or a full re-render); the keydown listener in the modal lives for the modal's lifetime — fine, but it must not accumulate; each toast holds a timer — cap the stack (e.g. keep the newest 5) if toasts can flood.
- **Measure, then memo.** If `Search` re-renders the whole screen on each keystroke, that's the place for `React.memo` on the results list — not before you've measured it.

## 15. Debugging Scenarios

**"My search fires two requests per pause."**

> The debounce hook is fine — the fetch effect is running twice. Check the dependencies: if
> `results` or the fetch function is in the `[...]` array, the effect re-runs whenever they
> change, restarting the debounce. The dependency list should be exactly `[debouncedQuery]`
> (plus a stable fetch, or via the ref trick from Task 2).

**"The feed loads the same page twice."**

> The observer fired twice before the state updated, or `loadMore` wasn't guarded. Two fixes:
> a `loading` flag in the callback, and `if (!hasMore) return`. Both are the interviewer's
> favorite follow-up for a reason.

**"Modal doesn't close on Escape — but only sometimes."**

> The keydown listener is attached when `open` flips to `true` and removed on cleanup. If
> `onClose` changes identity every render, the effect re-subscribes constantly — and if the
> modal is rendered while `open` was already `true`, the effect never ran. The fix is stable
> callbacks (`useCallback`) and the same `open`-gated effect shape as above.

**"Focus escapes the modal on Shift+Tab."**

> The trap only handles forward Tab. The Shift+Tab branch — checking `document.activeElement
> === first` and wrapping to `last` — is the missing half. Also verify the dialog itself has
> `tabIndex={-1}` or the initial `.focus()` is a silent no-op.

**"Toasts stay forever when the page is left open."**

> A timer was created without a matching cleanup, or a manual dismiss doesn't clear the
> pending timer, so a *removed* toast re-fires later. Keep the timer id per toast, clear it
> on dismiss, and cancel on unmount. The `dismiss` function must be the same one the timer
> captured — hence `useCallback`.

## 16. Quick Revision Notes

- Debounced search = **value debounce + effect on the debounced value + cancelled-flag guard**.
- Infinite scroll = **sentinel element + `IntersectionObserver` + latest-callback ref + functional append**.
- Modal = **controlled `open`, portal to body, Escape to close, focus in on open and back on close**.
- Tabs = **one `activeIndex`, derived panels, arrow keys with wraparound, roving `tabIndex` + `aria-selected`**.
- Toast = **context store + imperative `toast()` + per-toast id counter + auto-dismiss timer**.
- Every effect has a cleanup; every ref holds something that must not cause a render.
- The same five patterns — with keys, focus, `aria-*`, and stable callbacks — are what the interviewer is actually watching for.

## 17. Cheat Sheet

```text
useDebounce(value, delay):
  state debounced ← value; effect sets timer, clears it on change

useInfiniteScroll(cb):
  sentinel ref + IntersectionObserver({ rootMargin })
  → latest cb in a ref → isIntersecting → cb()
  cleanup: observer.disconnect()

Modal:
  open gated effect → save prev focus → focus dialog
  keydown: Escape → onClose · Tab → wrap within focusables
  cleanup: remove listener → restore focus
  render: createPortal → overlay + role="dialog" tabIndex={-1}

Tabs:
  activeIndex only · activate(i) wraps + focuses · keys → ArrowRight/Left
  button: role="tab" aria-selected tabIndex={0|-1}
  panel:  role="tabpanel" hidden={i !== activeIndex}

Toast:
  provider holds toasts[] · toast(msg, type, ms) → push + setTimeout(dismiss)
  dismiss(id) filters · aria-live="polite" · stack capped at N
```

## 18. Key Takeaways

> [!RECAP]
> - All five tasks are the same skeleton: **state in a hook, effects cleaned up, refs for the non-rendering values**
> - Debounce the **value**, not the event — the effect dependency becomes the debounced value
> - **`IntersectionObserver` on a sentinel** beats a scroll listener, and the latest callback goes in a ref
> - The modal is **controlled `open`, portal to body, Escape to close, focus in and back out**
> - Tabs are **one `activeIndex`**; panels derive from the same array; arrows wrap and move real focus
> - Toasts are **context + an imperative `toast()` API**, with per-toast ids and timers
> - Stale closures, missing keys, and un-cleaned effects are the three bugs that show up across all five — name them before they bite
> - Build each once, and the live-coding round becomes "recite the pattern", not "invent under pressure"

## Check your understanding

Answer these without looking back.

1. Why debounce the *value* rather than the event — what does the fetch effect's dependency list become?
2. Write `useDebounce` from memory, including the cleanup.
3. Why does infinite scroll keep the latest callback in a ref? What breaks if the effect closure captures the first one?
4. Name the two bugs a missing `observer.disconnect()` produces.
5. What does `tabIndex={-1}` do for a modal dialog, and why is `role="dialog"` not enough on its own?
6. Write the minimal focus trap — both Tab directions — and explain where focus goes on close.
7. Tabs: why does clicking a tab not need `.focus()` but arrow keys do?
8. Why must a toast id come from a counter and not from the message content?
9. What does the toast's manual close button and its auto-dismiss timer share, and why does that matter?

## What's Next

**Lesson 102 — Frontend System Design.** Same "state, then explain" instinct, scaled up:
you'll design whole screens instead of features, and the habits from this lesson — naming
decisions, drawing the data flow, thinking about the lifecycle — become the skeleton of a
full system-design answer.
