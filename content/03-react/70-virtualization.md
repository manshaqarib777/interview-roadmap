# Lesson 70 — Virtualization

**Interview importance:** ⭐⭐⭐⭐ — the correct answer to "how do you render 100,000 rows"
is not a faster loop, a smaller component, or a better key. It's not rendering most of the
rows at all.

Rendering 100,000 rows means 100,000 DOM nodes, and the browser pays a real price for
every one of them — layout, style, paint. Windowing (virtualization) sidesteps the whole
problem: only the rows you can actually see exist in the DOM, and the rest are computed
away before they ever become nodes. It's the difference between trying to make a
100,000-element list fast and realising the user can only ever look at ~10 at once.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what windowing/virtualization is and why naive rendering of large lists is slow
- Use `react-window` to virtualize fixed-height rows with `FixedSizeList`
- Convert a fixed-height list to dynamic heights with `VariableSizeList` and explain the trade-off
- Explain overscan, `itemCount`/`itemSize`, and why virtualization requires absolute sizing
- Say when virtualization is the wrong tool (100 rows, infinite scroll, layout shift)

## 1. One-line definition

**Virtualization (windowing) renders only the rows currently visible in the viewport —
plus a small overscan buffer — and swaps them as the user scrolls, so the DOM contains
tens of nodes instead of hundreds of thousands.**

## 2. Mental model

A projector showing a film reel. The film has 100,000 frames, but the projector only ever
has a handful loaded in its gate at a time — the frames about to show, the ones showing,
and the ones just past. The reel itself is never loaded into the projector; it's a
catalogue of what *could* be shown, indexed by frame number.

A windowed list works the same way. The data array is the reel — all 100,000 items, held
in JavaScript. The list renders only the frames inside the "gate" (the viewport plus
overscan). Scroll is the crank that advances the gate: the outgoing rows unmount, the
incoming ones mount, and the browser never sees more than a window's worth of DOM.

## 3. Visual flow

```text
   ┌──────────────────────────┐
   │  spacer div (total ~40px │   <- the real scrollbar height
   │  per row × 100,000 rows) │      is faked by one tall spacer
   │                          │
   │  ┌─ viewport (scrollTop)┐│
   │  │   visible window     ││   <- only these rows are real
   │  │   render 0..N rows   ││
   │  └──────────────────────┘│
   │  row 41 (overscan)       │   <- a few extra above and below,
   │  row 42                  │      so fast scrolls don't flash blank
   └──────────────────────────┘

   scrollTop ──► compute startIndex ──► render rows[startIndex..endIndex]
```

## 4. How it works

The list component knows the viewport's height and each row's height. From `scrollTop` it
computes which rows are visible:

```js
const startIndex = Math.floor(scrollTop / rowHeight);
const endIndex   = Math.ceil((scrollTop + viewportHeight) / rowHeight);
```

It renders only those rows, absolutely positioned at their cumulative offset, inside a
container with a spacer that has the *total* height of all rows. The browser sees one tall
spacer and real content only in the middle — so native scrolling, the scrollbar, and the
position feel exactly like a 100,000-row list, while the DOM holds ~a dozen nodes.

`react-window` (`FixedSizeList` / `VariableSizeList`) is the standard React
implementation; `react-virtualized` is its older, heavier predecessor (a `Grid`, `List`
and `Table` suite; more features, more to learn). All of them require **absolute
sizing**: the rows must have a known height so the math can position them. Percentage
heights, `auto` heights, and content-driven heights have no number to compute with.

## 5. Real project usage

| Library | Component | Row heights | Use for |
|---|---|---|---|
| **react-window** | `FixedSizeList` | fixed, one number | logs, feeds, simple tables |
| **react-window** | `VariableSizeList` | measured per row | chat messages, trees |
| **react-window** | `Grid` | rows + columns | spreadsheets, image grids |
| **react-virtualized** | `List` / `Table` / `Grid` | both | legacy codebases; needs more setup |

Fixed-height list:

```jsx {2-4}
import { FixedSizeList as List } from 'react-window';

<List
  height={600}
  itemCount={100000}
  itemSize={40}
  width="100%"
>
  {({ index, style }) => <Row style={style} index={index} />}
</List>
```

The render-prop gets `index` and a `style` — the `style` (absolute `top`, computed from
`index × itemSize`) must be applied for the row to land in the right place. `itemCount`
and `itemSize` drive the spacer and the position math; `height` is the viewport.

## 6. Interview explanation

> Virtualization renders only the rows inside the viewport, plus a small overscan buffer
> on each side. A spacer div with the total height of all rows keeps the scrollbar honest,
> and scrolling just swaps which rows are mounted. That's why 100,000 rows stay smooth:
> the DOM never holds more than a window's worth of nodes.
>
> `react-window`'s `FixedSizeList` covers the common case — a known row height, so the
> list can compute positions in O(1). `VariableSizeList` handles measured heights at the
> cost of binary search. The trade-off against rendering everything is memory, layout and
> paint cost per node, which is why a 100-item list doesn't need it and a 100,000-item
> list can't afford not to.

## 7. Senior-level insights

- **Name the real cost, not "too many nodes".** Every extra node costs memory, layout
  time, and style/paint work — and React's reconciliation walks the whole tree on each
  update. Say: *"100,000 rows means 100,000 nodes; layout and paint scale with the DOM,
  so the fix is fewer nodes, not faster rows."*
- **Overscan is a latency/CPU trade-off you control.** More overscan rows = fewer blank
  flashes on fast scrolls, but more nodes to mount. `react-window` defaults to 1; a
  smoother-feeling list might use 3–5. A senior answer names the dial and its cost.
- **Scroll anchoring is the deep trap.** Variable-height content under a windowed list
  shifts row positions as you scroll, causing jumpiness. Solutions: fix row heights, or
  use a scroll-anchoring mechanism. Mentioning it shows you've shipped one of these.
- **Combine with the other three lessons.** A windowed row is a component that re-renders
  on every parent update — memo it (Lesson 67). Loading row data on scroll pairs with
  lazy code and data (Lesson 68). And virtualization composes with code splitting
  (Lesson 69): windowing keeps the DOM small, splitting keeps the *code* small.
- **Virtualization is a *last resort* answer, said in the right order.** The honest
  senior answer to "100,000 rows": first reduce the data (pagination, grouping,
  server-side filtering), then virtualize what remains. Jumping straight to a library
  suggests you haven't questioned the requirement.

## 8. Common mistakes

**Mistake 1 — virtualizing a small list.**

```jsx
<List itemCount={25} itemSize={40} … />   // ❌ 25 rows need no windowing
```

The overhead — absolute positioning, overscan management, per-row measurement — costs
more than 25 plain rows ever would. Window when the DOM node count is genuinely a
problem, typically in the thousands.

**Mistake 2 — missing the required `style`.**

```jsx
{({ index }) => <Row index={index} />}   // ❌ rows pile up at top: missing style
```

Every row must receive and apply the render-prop `style` — it holds the absolute
position. Dropping it makes all rows render on top of each other.

**Mistake 3 — the list has no fixed height.** A `height` of `"auto"` gives the math
nothing to work with. The viewport needs a concrete height — either a number or a
measured container.

**Mistake 4 — variable-height content treated as fixed.** Chat rows, expanding cards and
wrapped text have changing heights. Forcing them into `FixedSizeList` clips or overlaps
them; use `VariableSizeList` and measure the heights.

**Mistake 5 — no fallback for row-height changes.** Changing a row's height *after* it
renders (expanding an accordion) breaks the position math unless the library is told to
re-measure. Call the resize methods or the rows slide around.

## 9. Best practices

✅ Virtualize only when the node count is the actual problem — thousands of rows, and measurable

✅ Use `FixedSizeList` when you can; `VariableSizeList` only when heights genuinely vary

✅ Apply the render-prop `style` to every row — it's the positioning, not a suggestion

✅ Give the viewport a concrete height; use a measured container when you need it responsive

✅ Set overscan a little higher on touch devices, where scroll can jump in one gesture

✅ Memo the row component so windowed rows skip re-renders (Lesson 67)

❌ Don't window 100 rows because it "feels modern" — it adds complexity with nothing to save

❌ Don't use percentage/auto heights with a windowed list

❌ Don't forget to re-measure when row content height can change after render

## 10. Interview questions

**Q1. How do you render a list of 100,000 items?**

> First, question the 100,000: pagination, grouping or server-side filtering usually
> removes most of them. For the rest, virtualize — render only the rows in the viewport
> plus an overscan buffer, with a spacer div holding the total height so the scrollbar
> stays accurate. `react-window`'s `FixedSizeList` handles the fixed-height case; the DOM
> stays at a few dozen nodes no matter how long the list is.

**Q2. What is overscan?**

> The number of extra rows rendered above and below the visible window. It's a buffer so
> fast scrolling doesn't flash blank space while new rows mount. More overscan feels
> smoother but adds DOM nodes and mount work; it's a small latency-versus-CPU dial.

**Q3. Fixed vs variable row heights — what's the difference?**

> Fixed height lets the list compute positions in O(1): `index × itemSize`, and
> `startIndex = scrollTop / itemSize`. Variable heights need the list to accumulate or
> binary-search a list of measured offsets, which is more work and more memory. Fixed is
> the default; variable only when content genuinely varies — chat messages, trees.

**Senior follow-up: Why does virtualization require absolute positioning?**

> Because the list has to place each visible row at its exact offset in the flow — the
> spot it would occupy in the full list — while the spacer owns the total scrollable
> height. Absolute `top` is how the library pins a row to `index × itemSize` (or the
> measured offset) regardless of how many rows are mounted. If rows used normal flow,
> they'd stack from the top of the viewport and the scroll position would be meaningless.
> That's also why a row's `style` is mandatory: it *is* the position.

## 11. Follow-up questions

**When is virtualization the wrong tool?**

> For lists under a few hundred rows, where plain rendering is faster and simpler; for
> content with heavily variable heights, where measuring costs more than the rendering
> saved; and when the rows are interactive and frequently re-rendered, since windowing
> adds mount/unmount churn on top. Also wrong as the first answer — reduce the data
> before you window it.

**How does virtualization interact with infinite scroll?**

> Infinite scroll loads more data as the user approaches the end — usually by appending a
> batch and bumping `itemCount`. Windowing and infinite scroll compose naturally:
> windowing keeps the DOM small while the data array grows without bound. The two are
> often confused, but they answer different questions — how many nodes, versus when to
> fetch more data.

**What breaks when a row's height changes after it renders?**

> The position math. Every subsequent row's offset shifts, so rows jump or overlap.
> `VariableSizeList` exposes methods to re-measure (`resetAfterIndex`); without them the
> list renders with stale offsets. This is the scroll-anchoring problem, and it's the
> main reason to prefer fixed heights when you can.

## 12. Comparison table

| | Naive render | Pagination | Infinite scroll | Windowing/Virtualization |
|---|---|---|---|---|
| DOM nodes | 100,000 | one page | grows without bound | ~viewport rows + overscan |
| User can reach row 99,000 | via scrollbar | via page navigation | by scrolling forever | by scrolling |
| Data loaded | all upfront | per page | per batch | all in memory, rendered on demand |
| Smoothness at 100k rows | poor | good | degrades | good |
| Best for | small lists | server-side datasets | feeds | huge client-side lists |

## 13. Code example

A working windowed list with overscan:

```jsx
import { FixedSizeList as List } from 'react-window';

const ROWS = Array.from({ length: 100000 }, (_, i) => `Row ${i}`);

function App() {
  return (
    <List
      height={600}
      itemCount={ROWS.length}
      itemSize={40}
      width={400}
      overscanCount={5}
    >
      {({ index, style }) => (
        <div style={style}>        // style = absolute position — required
          {ROWS[index]}
        </div>
      )}
    </List>
  );
}
```

Output (what the DOM actually contains, not what the data has):

```text
<div style="height: 4000000px">          // spacer — total scrollable height
  <div style="position:absolute; top: 840px">Row 21</div>
  <div style="position:absolute; top: 880px">Row 22</div>
  <div style="position:absolute; top: 920px">Row 23</div>
  <div style="position:absolute; top: 960px">Row 24</div>
  <div style="position:absolute; top: 1000px">Row 25</div>   // visible window
  <div style="position:absolute; top: 1040px">Row 26</div>
  <div style="position:absolute; top: 1080px">Row 27</div>
  <div style="position:absolute; top: 1120px">Row 28</div>
  <div style="position:absolute; top: 1160px">Row 29</div>   // + overscan above/below
  …a few dozen rows total, regardless of itemCount…
</div>
```

100,000 items in the data, ~a dozen nodes in the DOM. Scroll to row 99,999 and the *same*
handful of nodes re-render with new `top` values — the browser never sees more than a
viewport's worth.

```narrate
2: the 100,000-row dataset lives in JavaScript, not in the DOM
5-10: itemCount and itemSize drive the spacer and the position math
11: overscan mounts extra rows beyond the visible window
13: index and style are the whole contract — style is the absolute position
16: the spacer's 4,000,000px height is what the scrollbar reflects
```

## 14. Performance notes

When it matters: lists in the tens of thousands where memory, layout and paint time are
measurable. The benefit is bounded by how often the user scrolls — a list they scroll
through once gains less than one they live in. Combine with memoised rows (Lesson 67) so
scrolling re-renders only the swapped rows, not the whole list.

When it doesn't: a few hundred rows where rendering everything is cheaper than the
windowing machinery; layouts where row height is genuinely unpredictable; and lists whose
rows are cheap but whose *data* is enormous — there, reducing the data (filtering,
pagination, grouping) beats windowing.

Watch for: the windowed list's own re-render on every scroll tick; row measurement cost
for variable heights; and layout shift when row content changes size — all three are where
windowed lists silently stop being "fast".

## 15. Debugging scenarios

**"All my rows are stacked at the top of the viewport."** The `style` from the render
prop isn't being applied. Every row must spread it onto its root element — it carries the
absolute `top` offset.

**"The scrollbar is tiny / the list thinks it's empty."** A wrong `itemSize` makes the
spacer's height wrong and positions land in the wrong place. For fixed lists it must be
the exact pixel height of a row; for variable lists, the measurement must actually run
before rendering.

**"Rows overlap or leave gaps when heights vary."** The list was set up fixed-height over
variable content. Switch to `VariableSizeList` (or measure and re-measure) and call
`resetAfterIndex` when a row's height changes after mount.

**"Fast scrolling shows a blank flash."** Raise `overscanCount`. If it persists, the row
mount cost is the bottleneck — memoise the row component so mounting a row is cheap.

**"The list is slow even with windowing."** Check the row component: a windowed row that
re-renders on every parent update recreates the same DOM work the window was supposed to
avoid. Memo the row, keep its props stable, and confirm the data array itself isn't being
rebuilt each render.

## 16. Quick revision notes

- Virtualization = only visible rows (plus overscan) exist as DOM nodes
- A spacer div fakes the total scroll height; scroll just swaps mounted rows
- `FixedSizeList` for known heights — O(1) math; `VariableSizeList` when heights vary
- Overscan: buffer rows above/below the viewport; higher = smoother, more nodes
- Absolute sizing required — no percentage/auto heights in a windowed list
- Every row must apply the render-prop `style`
- `react-virtualized` is the older, heavier predecessor of `react-window`
- Virtualize after reducing the data, not before
- Rows are components: memoise them (Lesson 67) for smooth scrolling

## 17. Cheat sheet

```jsx
// fixed heights — the default
<FixedSizeList height={600} itemCount={rows.length} itemSize={40} width="100%">
  {({ index, style }) => <Row style={style} index={index} />}
</FixedSizeList>
```

- `itemCount` — data length, drives the spacer
- `itemSize` — exact row height, drives positions
- `height` — viewport height; must be concrete
- `overscanCount` — buffer above/below the window
- `style` on every row = the absolute position; never drop it
- `VariableSizeList` when content height varies; re-measure on change
- Reduce data first (pagination/filter), virtualize second

## 18. Key takeaways

> [!RECAP]
> - Virtualization renders only the viewport's rows — 100,000 rows, ~a dozen DOM nodes
> - A tall spacer fakes the scrollbar; scrolling swaps which rows are mounted
> - `FixedSizeList` is the default; `VariableSizeList` for measured, varying heights
> - Absolute sizing and the render-prop `style` are required, not optional
> - Overscan trades a few extra nodes for blank-free fast scrolling
> - Memo the row component so windowed rows skip re-renders (Lesson 67)
> - Reduce the data before windowing it — virtualization is the last resort that works

## Check your understanding

Answer these without looking back.

1. Why is a 100,000-row list slow even with memoised rows? What does windowing change?
2. What exactly is overscan, and what's the trade-off in choosing its value?
3. Why must a windowed list have a concrete height and absolute row positions?
4. What happens if the render-prop `style` isn't applied to a row?
5. Fixed vs variable row heights — what does `VariableSizeList` pay for its flexibility?
6. When would you *not* reach for virtualization?

## What's Next

**Lesson 71 — When NOT to Optimize.** You now know the tools — memo, lazy loading,
splitting, windowing. The senior skill is knowing when each is a waste of time, and
saying so unprompted.