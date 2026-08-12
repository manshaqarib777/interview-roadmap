# Lesson 52 — Lists & Keys

**Interview importance:** ⭐⭐⭐⭐⭐ — "Why are keys important?" is close to a guaranteed question. Index keys are the trap.

Lesson 51 said reconciliation diffs position by position: same type in place, different type
replaced. Lists break that rule's assumptions — items move, get inserted and get deleted —
so React needs you to say which item is which. That's the `key` prop: a stable identity for
a sibling. Get it wrong with an index and you get the classic bug: **the wrong input value
kept after a reorder**.

You already know why this bites: Lesson 6's reference equality — a new array each render —
tells React *what* to render; keys tell React *which item is which*.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what a key is for, in terms of Lesson 51's reconciliation
- Explain why index keys silently corrupt state after an insert or reorder
- Show the wrong-value-after-reorder bug and fix it with a stable key
- Explain what "stable, unique, and constant across renders" means for a key
- Know what key reuse means after deletion (ID re-use and duplicate keys)
- Say why you might need a stable ID for items you create locally

## 1. What are Keys?

**A key is a stable identity for a list item — a string (or number) React uses to match
each item in the new list to its old self across renders.**

Reconciliation is position-based for single elements. Keys are how you override position
for siblings, so React knows that *this* `<li>`, wherever it now sits, is the same `<li>`
from before.

## 2. Mental Model

Your list is a row of labelled lockers. The **position** is "third locker from the left".
The **key** is the name taped to the locker.

Now everything shifts: someone unlocks locker 3 and finds you're gone; new lockers are
pushed in at the front. Position-based reconciliation looks only at position — "third locker"
now belongs to someone else. Keyed reconciliation reads the names: "Mansha's locker" is
still Mansha's, wherever it is now.

Without keys React is the confused janitor, moving people's belongings between lockers
because a spot opened up at the front.

## 3. Visual Flow

```text
  OLD list                    NEW list (sorted by name)
  [0] Beea       key="b"      [0] Ali         key="a"   ← new, mount
  [1] Ali        key="a"      [1] Beea        key="b"   ← moved, reorder
  [2] Cam        key="c"      [2] Cam         key="c"   ← same position, update in place

  With keys:     React matches by identity:  a→moved, b→moved, c→kept, + mount a
  Without keys:  position 0 = "Beea" vs "Ali" → different key? same node? → mismatch
```

## 4. How It Works

The element from Lesson 51 has a `key` field. When React diffs two lists of siblings it
first matches items by key, then applies the type rule from Lesson 51 to each match:

```jsx
{items.map(item => <Item key={item.id} data={item} />)}
```

Same key → React keeps the old component instance and its DOM node, then updates props.
New key → mount. Missing key → unmount. Key unchanged but position changed → **move**, not
remount.

Move is the important one: it means React can reorder DOM nodes without destroying state —
which is exactly what index keys break, as the next section shows.

> [!TIP]
> Keys only need to be unique **among siblings**, not globally. The same `key="a"` in two
> different lists is fine. Keys on the *element* (the item in `map`) — never on the
> component's internal `props.key`, which you can't even read.

## 5. Why Not Index? — The Index-Key Trap

The index changes when the list changes, so it fails the one job a key has: staying stable.

```jsx {10}
function Todos() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'a' },
    { id: 2, text: 'b' },
    { id: 3, text: 'c' },
  ]);

  return (
    <ul>
      {todos.map((todo, i) => (
        <li key={i}>            {/* ❌ index key — identity shifts on insert */}
          <input defaultValue={todo.text} />
        </li>
      ))}
    </ul>
  );
}
```

The user types "Z" into the *second* input. Now `setTodos` **unshifts** a new item to the
front:

```text
key 0 ← { id: 4, text: 'new' }   (input 1:  "Z" is now here)      ← mount
key 1 ← { id: 1, text: 'a' }     (input 2:  was {id:2}'s "b" box)
key 2 ← { id: 2, text: 'b' }     (input 3:  was {id:3}'s "c" box)
```

Each `key={i}` matched *a different item* than before, so every input kept its DOM state —
and the "Z" the user typed into item 2's box stayed visible while belonging to the *wrong*
item. Index keys didn't move anything; they silently relabelled everything.

```text
after unshift with key={i}:
  [0] new   (input shows "Z" ← stale value from the old second box)
  [1] a     (input shows "b" ← stale value from the old third box)
  [2] b     (input shows "c" ← stale value from the old fourth box)
after unshift with key={item.id}:
  [0] new   (empty input)
  [1] a     ("Z" stays with item a's box, as the user typed)
  [2] b     ("b" stays with item b's box)
```

The list re-rendered correctly — the *tree* is right. The DOM state is wrong, because
reconciliation was told each node was a different item. That is the whole lesson in one
paragraph.

## 6. A Working Example

```jsx
function TodoList() {
  const [items, setItems] = useState([
    { id: 'a', text: 'First' },
    { id: 'b', text: 'Second' },
    { id: 'c', text: 'Third' },
  ]);

  const addFirst = () =>
    setItems((prev) => [{ id: Date.now().toString(), text: 'New' }, ...prev]);

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <input defaultValue={item.text} />
        </li>
      ))}
    </ul>
  );
}
```

```text
with key={item.id}:  insert at front → input for "First" keeps its text, new row mounts empty
with key={i}:        insert at front → every input's text shifts one row down (wrong)
```

## 7. The Reorder Bug, in Plain JavaScript

Keys are a React concept, but the mismatch they prevent is general. This is the same bug,
unmounted:

```js
// Simulates keyed vs index-keyed reconciliation for a reorder.
function reconcile(prev, next, keyOf) {
  const keyed = (list) => list.map((item) => keyOf(item));
  const prevKeys = new Set(keyed(prev));
  const nextKeys = new Set(keyed(next));
  const mounted = next.filter((item) => !prevKeys.has(keyOf(item)));
  const moved = next.filter((item) => prevKeys.has(keyOf(item)) && prev.indexOf(item) !== next.indexOf(item));
  return { mounted: mounted.map((i) => i.id), moved: moved.map((i) => i.id) };
}

const prev = [{ id: 1 }, { id: 2 }, { id: 3 }];
const next = [{ id: 3 }, { id: 1 }, { id: 2 }];

console.log('by id   →', reconcile(prev, next, (x) => x.id));
console.log('by index→', reconcile(prev, next, (_, i) => i));
```

Output:

```text
by id   → { mounted: [], moved: [3, 1, 2] }
by index→ { mounted: [2, 3], moved: [1] }
```

With the index as key, `2` and `3` look brand new — so their DOM nodes (and state) would be
destroyed and rebuilt. With the id, nothing remounts; the same three items just move.

## 8. What Makes a Good Key?

**Stable, unique, and constant across renders.** "Stable" means it survives reorders,
inserts and deletes; "unique" means among siblings; "constant" means it doesn't change for
the same item between renders.

| Source | Good? | Why |
|---|---|---|
| `item.id` from the server/DB | ✅ | Permanent, unique, never changes |
| `crypto.randomUUID()` per item (created once) | ✅ | Unique and constant — if you keep it in the item |
| A UUID generated **in render** | ❌ | New value every render — remounts constantly |
| `Math.random()` / `Date.now()` in render | ❌ | Same as above, plus duplicates possible |
| The array **index** | ❌ | Changes on insert/delete/reorder |
| `id` that changes on every edit | ❌ | One edit remounts the whole list |
| Truncated/derived values | ⚠️ | Only if they stay unique and constant |

## 9. Best Practices

✅ Use the item's permanent ID from the server when one exists

✅ For locally-created items (new drafts, unsaved rows), generate a stable ID once — on
creation, not in render — and keep it on the item

✅ Give **fragments** a key with the `key` attribute on `<Fragment key={id}>` (or the
shorthand `<>` can't take one)

✅ Keep keys unique among siblings and constant across renders

✅ For read-only static lists, using index is *acceptable* — but a stable key is still
better and just as cheap

❌ Don't use the array index when items can be inserted, deleted, reordered, or hold state

❌ Don't generate keys inside `map`'s render — `key={Math.random()}` or `key={Date.now()}`

❌ Don't use a key that changes on every edit

❌ Don't rely on `props.key` — it's not available to the component

## 10. Interview Questions

**Q1. Why are keys important in React lists?**

> React reconciles lists positionally — without keys it decides "same position, same
> element", which is wrong when items move. Keys give each item a stable identity, so
> React can match the new list to the old one by *which item it is* rather than *where it
> sits*. That's what lets it keep DOM nodes and state across reorders, inserts and deletes
> instead of destroying and rebuilding them.

**Q2. Why is using the array index as a key bad?**

> The index isn't stable — it describes a position, and positions change when the list
> changes. Insert an item at the front and every item shifts; with `key={i}` each element
> now matches a *different* item than before, so React relabels the nodes. DOM state like
> input text silently sticks to the wrong rows. The classic symptom is typing into one
> input and having the text jump to another row after a reorder.

**Q3. What makes a good key?**

> Three properties: stable — it doesn't change when the list changes; unique among
> siblings; and constant across renders for the same item. The item's permanent ID from
> the server is ideal. For locally-created items, generate a stable ID once at creation
> and store it on the item — never `Math.random()` or `Date.now()` in render.

**Q4. What happens if two items have the same key?**

> It's a duplicate-key violation — React warns and the reconciliation is ambiguous: the
> first match wins, so updates, moves and deletes can target the wrong element, producing
> glitchy, hard-to-debug UI. Uniqueness is among siblings only — the same key value in two
> different lists is fine.

**Q5. Do keys affect performance?**

> Indirectly. A keyed list lets React *move* nodes instead of destroying and rebuilding
> them, so it avoids the expensive part. But keys exist for correctness, not speed — the
> wrong key doesn't just slow things down, it produces the wrong DOM state.

**Senior follow-up: You have a list of unsaved form rows with no server IDs. What do you use for keys?**

> I'd give each row a stable ID at creation and store it on the row — `crypto.randomUUID()`
> or an incrementing counter, generated once when the row is created, never in render.
> The same object keeps the same ID across its whole life, so reconciliation is correct
> whether rows are added, removed or reordered.

## 11. Follow-up Questions

**Is it ever OK to use the index as a key?**

> Only when the list is static and read-only — no inserts, deletes, reorders, and no
> stateful children. But a stable ID costs the same and removes the question entirely, so
> I default to a real key even there. Interviewers ask this to see whether you understand
> *why* index fails, not to hear "never".

**Why do I get a "key should be unique" warning but the UI looks fine?**

> Because your list is short or the mismatch doesn't touch stateful children. The warning
> is a correctness warning, not a visual one — the bug waits until a reorder or insert
> involves an element with DOM state, and then it looks exactly like the input-text case
> above.

**How does React reconcile two lists when there are no keys at all?**

> It falls back to position: index `i` in the old list matches index `i` in the new list.
> That's the same as using the index as a key — same failure mode when the list changes.

**Where can keys go besides list items?**

> Anywhere you want React to treat a repeated element as a distinct instance — an element
> that changes "type" in a way you want to force-remount, or `<Fragment key=...>` items in
> a list. A key change means "this is a different element now", so it's also the sanctioned
> way to reset state on purpose.

## 12. Comparison Table

| Key source | Stable across reorder/insert? | Keeps DOM state? | When it works |
|---|---|---|---|
| Server/DB `id` | ✅ | ✅ | Always |
| Stable ID created at item creation | ✅ | ✅ | Local drafts, unsaved rows |
| Array index | ❌ — shifts when list changes | ❌ — state sticks to wrong rows | Static, read-only lists |
| `Math.random()` / `Date.now()` in render | ❌ — new every render | ❌ — remounts everything | Never |
| ID that changes on edit | ❌ — remounts on first change | ❌ | Never |

## 13. Performance Notes

- **Keyed moves beat rebuilds.** Moving a DOM node is cheaper than destroying it and
  building a new one — and it preserves focus, scroll and input state, which a rebuild
  silently loses.
- **Keys don't stop re-rendering.** A list re-renders when its data re-renders; keys only
  decide what reconciliation *does* with the DOM. (The render-count problem is Lesson 67's
  `React.memo` territory.)
- **Index keys on large static tables** cost nothing extra because nothing moves — but the
  instant sorting or filtering is added, they bite.
- **Long lists at scale** are a virtualization problem (Lesson 70), not a key problem —
  keys keep correctness, virtualization keeps the DOM small.

## 14. Debugging Scenarios

**Scenario 1: "Input text jumps to the wrong row after a reorder."**

Classic index-key. Confirm by checking the `map` — `key={i}`. Fix with `key={item.id}`.
The DOM nodes were relabelled, not moved; stable keys let React actually move them.

**Scenario 2: "Everything remounts whenever I add one item — the whole list flickers."**

The key is unstable — `Math.random()`, `Date.now()`, or something computed in render. Every
render produces fresh keys, so every item looks new and is rebuilt. Generate the ID once,
at item creation.

**Scenario 3: "React logs a duplicate-key warning."**

Two siblings share a key value. The first match wins and later items become unreachable
for reconciliation. Check for truncated IDs or derived keys colliding — and remember
uniqueness is only among siblings.

**Scenario 4: "My component can't read its own key."**

Keys aren't props. React consumes the `key` field of the element and never passes it down.
If the component needs the ID, pass it as a separate prop: `<Item key={id} id={id} />`.

## 15. Quick Revision Notes

- A key = stable identity for a sibling, so reconciliation matches by *which item*, not *where it sits*
- Same key → update in place; new key → mount; missing key → unmount; same key, new position → move
- Index keys shift with the list — the classic "wrong input value kept after reorder" bug
- Good key: stable, unique among siblings, constant across renders
- Server IDs first; stable IDs created once for local items; never `Math.random()`/`Date.now()` in render
- Keys only need uniqueness among siblings, not globally
- Keys are for correctness, not performance — the index trap produces wrong DOM state, not slow rendering

## 16. Cheat Sheet

```text
{items.map(item => <Item key={item.id} ... />)}
              │
              └─ key = stable identity
                 ✅ item.id (server) | id created once at item creation
                 ❌ index | Math.random() | Date.now() | anything new each render

same key              → update in place (keep DOM + state)
new key               → mount
key disappears        → unmount
same key, moved       → move node, keep state
index key + reorder   → every item relabelled → stale DOM state
```

## 17. Key Takeaways

> [!RECAP]
> - Keys give list items a stable identity so reconciliation matches by identity, not position
> - Same key → update in place; new key → mount; missing key → unmount; moved key → move
> - Index keys are the trap: positions shift, so identity shifts — input text sticks to the wrong rows
> - A good key is stable, unique among siblings, and constant across renders
> - Prefer server IDs; for local items create a stable ID once and store it on the item
> - Never generate keys in render — `Math.random()` and `Date.now()` remount everything
> - Keys exist for correctness first, performance second

## Check your understanding

Answer these without looking back.

1. What problem does the `key` prop solve, in terms of Lesson 51's reconciliation?
2. Draw the "wrong input value kept after reorder" sequence with `key={i}` — where does the stale text end up?
3. What are the three properties of a good key?
4. A list is sorted with `key={item.id}` — what does React do with the moved nodes?
5. You create a list of unsaved rows. Where do the keys come from?
6. Two different lists both use `key="a"`. Is that a bug?
7. Why can't a component read its own key?

## What's Next

**Lesson 53 — Events & Synthetic Events.** Handling a click looks like a DOM thing, but
React intercepts every event before your handler runs — at the root. Knowing what React's
event system does (and doesn't do) is exactly the foundation the next lesson builds on.
