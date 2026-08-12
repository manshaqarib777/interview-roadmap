# Lesson 88 — The Server/Client Boundary

**Interview importance:** ⭐⭐⭐⭐ — what can cross it, what cannot, and why your import
broke the build.

Lessons 86 and 87 built the two sides: the server tree, the client islands, and the
directive that separates them. This lesson is the wall itself — a directed edge in the
module graph with different rules for each direction. Get these rules right and "why did
my build break?" stops being a mystery; it becomes a checklist.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the boundary as a **directed** edge: server→client crosses, client→server doesn't
- List what can cross the boundary: serializable props, Server Components as children, Server Actions
- Explain what cannot: functions, classes, and most non-serializable values
- Say when a `Date` crosses successfully and why "Date doesn't serialize" is only half the story
- Explain exactly why a `'use server'` import broke your build — and the two-line fix
- State the JSON serialization rules precisely enough to debug a prop error on sight

## 1. What is the Boundary?

**The boundary is the point where server-rendered output hands off to the client runtime — a one-way door: serializable data and rendered children cross from server to client; nothing crosses back.**

`use client` doesn't *make* the boundary; it *marks* where it is. Everything above the mark
in the tree stays server; everything below becomes part of the client runtime. Two kinds of
things traverse it, and only from the server side:

- **Props** — passed from a Server Component to a Client Component. They must be
  serializable, because they travel as JSON inside the RSC payload (Lesson 86).
- **Children** — a Server Component rendered *inside* a Client Component's JSX still runs
  on the server; only its output crosses.

Anything else — a function, a class instance, an import — hits the wall.

## 2. Mental Model

The boundary is a **customs checkpoint at an airport** — and it's one-way.

```text
  SERVER                        │          BORDER          │     CLIENT
                                │                          │
  your data, rendered children, │     luggage scanner      │
  server action references      │      (serialization)     │
        ───────────────────────▶│  ┌────────────────────┐  │──────▶  accepted
                                │  │  JSON-safe only     │  │
                                │  └────────────────────┘  │
                                │                          │
  functions, classes, servers   │   "items prohibited       │
  imports back from the client  │    from entering"         │
                                │◀─────────────────────────│  ❌  rejected
```

The scanner accepts plain data and already-rendered results. It rejects anything that
carries behavior — code can't be transmitted, only references to it. The "luggage" is the
RSC payload; the scanner is the serialization step that runs at the crossing.

## 3. Visual Flow

```text
  Server Component (app/page.tsx)
        │
        │  render, await data
        ▼
  <Page>                         ── server side ──
   │
   │  props: { post: {…} }        plain data        ✅ crosses
   │  children: <StaticFooter/>   rendered output   ✅ crosses
   │  action: updatePost          server action ref ✅ crosses (special case)
   │
   ▼
  <Editor/>  ('use client')      ── client side ──
   │
   │  import { db }  ──────────  ❌ client→server import, build error
   │  props.fn()     ──────────  ❌ functions never arrived (not serializable)
   │
   ▼
  browser hydration
```

Three arrows cross down. Every arrow pointing back up is an error. Keep this picture and
each debugging session is just "which arrow was illegal?"

## 4. How It Works: Two Directions, Two Mechanisms

**Direction 1 — server → client (props and children).** The server serializes what you
pass. Props become JSON in the RSC payload; children are rendered to output server-side
and that output crosses instead. This direction is *composition* — it's how the tree stays
one tree while spanning two machines.

**Direction 2 — client → server (imports).** The client cannot reach back into server
modules, because there is no server runtime in the browser and because those modules
contain code — which serialization can't transmit. An import from a client file into a
server module is therefore a **build error**. The two exceptions that make the round trip
possible — Server Actions and server-rendered children — are covered in Sections 6 and 7.

The asymmetry in one line: *server→client transmits results; client→server transmits
nothing except references to server code the framework registers for you.*

## 5. What Can Cross: Serialization

Any prop you pass across the boundary must survive JSON serialization. The rule of thumb:
if it can't be written as a JSON literal, it can't cross as a prop.

```tsx
// app/page.tsx — Server Component
const theme = { name: 'dark', colors: { bg: '#0b0b0b' } };   // plain object ✅
const tags = ['rsc', 'next', 'react'];                       // array ✅
const when = new Date('2026-01-01T00:00:00Z');               // Date — special case ✅
const map = new Map([['a', 1]]);                             // Map — special case ✅

export default function Page() {
  return <Panel theme={theme} tags={tags} updatedAt={when} lookup={map} />;
}
```

```text
RSC payload (simplified):

J0:["$","$L5",null,{
  "theme":{"name":"dark","colors":{"bg":"#0b0b0b"}},
  "tags":["rsc","next","react"],
  "updatedAt":D("2026-01-01T00:00:00.000Z"),
  "lookup":A(["a",1])
}]
```

```narrate
1-4: Every value here is plain, JSON-safe data — the default passport for the border.
5: Date gets the D tag — serializable through a registered encoder, not raw JSON.
6: Map gets the A tag — same idea: a registered encoder in the RSC protocol.
14-18: The payload shows each prop arriving with its encoder tag applied.
```

**The JSON serialization rules**, precisely:

| Value | Crosses? | Notes |
|---|---|---|
| `string`, `number`, `boolean` | ✅ | The common case |
| `null`, `undefined` | ✅ | `undefined` is dropped in some positions (see below) |
| Plain objects and arrays | ✅ | Keys must be strings; values must themselves be serializable |
| `Date`, `Map`, `Set`, `RegExp` | ✅* | *Only via the RSC protocol's registered encoders (`D`, `A`, `S`) — a hand-rolled JSON call would throw |
| `BigInt` | ✅* | *Special-cased in the RSC payload (`n` tag) — again protocol-level, not plain JSON |
| `Symbol` | ✅ (some) | `Symbol.for`-registered symbols pass; unique symbols throw |
| Typed arrays / `ArrayBuffer` | ✅ | Protocol-level encoders |
| Functions | ❌ | Build error — code can't be serialized (unless it's a registered Server Action, Section 6) |
| Classes / class instances | ❌ | Class logic is code; even if fields serialize, the instance doesn't survive as its class |
| Components | ❌ as props | Pass them as `children`, not as a prop — Section 8 |

## 6. What Can Cross: Server Actions

A Server Action is the one *function* that crosses — because it doesn't cross as code. It
crosses as a **reference**, like a telephone number: the string id is serializable, and the
framework maps it back to server code when the client calls it.

```tsx
// app/actions.ts
'use server';

export async function updatePost(id: number, title: string) {
  // runs on the server — database access is fine here
  await db.posts.update({ id, title });
  revalidatePath('/posts');
}
```

```tsx
// app/components/post-editor.tsx
'use client';

import { updatePost } from '../actions';     // ✅ allowed — it's an action reference

export default function PostEditor({ postId }: { postId: number }) {
  return (
    <form action={updatePost.bind(null, postId)}>
      <input name="title" />
      <button type="submit">Save</button>
    </form>
  );
}
```

```text
payload: "updatePost" arrives as a module reference — an id string, not a function body
at submit: the client sends { id, title } back; the server runs updatePost(…)
```

The client never receives `updatePost`'s body — only a handle. That's the only way
behavior crosses the boundary, and it's the reason the model works: **code stays where it
runs; only references and data travel.**

> [!TIP]
> "Server Actions cross as references, not code" is the sentence that makes the whole
> boundary model click — and it's the correct answer to "can you pass a function to a
> client component?"

## 7. What Cannot Cross (and Why)

**Functions.** Props can't carry `onClick`-style callbacks from server to client. A plain
function has no serialization form — you can't JSON-encode a closure. The build rejects it
the moment it sees one.

```tsx
// app/page.tsx — Server Component
export default function Page() {
  const handleClick = () => console.log('hi');   // ❌ plain function

  return <Button onClick={handleClick} />;       // 💥 build error
}
```

```text
Error: Functions cannot be passed directly to Client Components
       unless you explicitly expose it by marking it with "use server".
```

The fix, if you truly need server behavior: wrap it in `'use server'` (Section 6). If you
need client behavior: define the handler inside the client component, not above the
boundary.

**Classes and instances.** Even "serializable-looking" class fields don't help — the class
*type* is code. Only protocol-registered types (`Date`, `Map`, `Set`, `RegExp`) have
encoders; your own classes don't.

```tsx
class Money {                                        // your class ❌
  constructor(public amount: number) {}
}

// server → client  <Money amount={…}/>  →  build error: unsupported type
```

```text
Error: Only plain objects, and a few built-ins, can be passed to Client Components.
       Classes or null-prototype objects are not supported.
```

```narrate
1-3: A user-defined class — its fields are data, but its type is code.
4: Passing an instance across the boundary fails at build time, not runtime.
```

**Why this isn't negotiable:** serialization happens at the crossing, once. If the payload
could carry behavior, the client would have to *execute* it — which is exactly the attack
and exactly what the model forbids. The boundary's rigidity is a security property, not an
inconvenience.

> [!PITFALL]
> "But my object *is* JSON-serializable" is the most common wrong argument. A class
> instance with only primitive fields still fails, because the instance carries its
> constructor. Convert to a plain object — a DTO — at the boundary, not before it.

## 8. The Directional Rules: Children, Imports, and the Exact Error

**Children cross; imports don't.** A Client Component can render a Server Component passed
as `children` — the server renders it first and ships the output. But it can never
`import` a Server Component: that would pull server code into the client graph, which the
build rejects.

```tsx
// app/components/shell.tsx
'use client';

import ClientThing from './client-thing';     // ✅ client importing client — fine
import ServerWidget from './server-widget';   // 💥 build error — importing a server module

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <ClientThing />
      {children}                               // ✅ server-rendered children, already output
    </div>
  );
}
```

```text
build:  "You're importing a component that needs to run on the server."
fix:    pass it as children from the server side instead of importing it here.
```

**Why your `'use server'` import broke the build — the full story.** Two overlapping
directives cause confusion here:

1. `'use client'` at the top of a file makes it a **client boundary file**.
2. `'use server'` at the top of a file makes it a **server-only module** — it cannot be
   imported from client code at all, and the error message says so.

If a client file imports from a `'use server'` *file* (as opposed to importing an
individual action, which is allowed), the build rejects the import. The two-line fix is to
export the actions from a `'use server'` file — which is the normal pattern — and import
only those named exports:

```tsx
// ❌ client file importing the server module wholesale
import serverHelpers from '../server-helpers';

// ✅ client file importing a registered action (allowed)
import { updatePost } from '../actions';
```

The distinction that resolves the mystery: **importing an action = importing a reference
(the framework registers it and lets it cross); importing a server module = importing code
(the build refuses).** Your build broke because you did the second; the fix is to do the
first.

## 9. Real Project Usage

| Crossing | How |
|---|---|
| **Data from a query** | Server Component awaits the DB (Lesson 86) → passes plain objects down |
| **Static sections inside a client shell** | Pass them as `children`, not as props |
| **Mutations from a form** | A `'use server'` action on the form (Section 6) |
| **Config objects** | Plain, JSON-safe: strings, numbers, booleans, nested plain objects |
| **Encoders** | Let the protocol tag `Date` / `Map` / `Set` — don't pre-stringify them |
| **Shared constants** | A plain `const` module (no directive) can be imported from both sides |

The shape of a healthy boundary-heavy page: server awaits, client interacts, children
bridge, actions mutate — and not one function or class instance ever crosses.

## 10. Interview Explanation

> The boundary is a directed edge in the module graph. Server→client, three things cross:
> serializable props — plain data, with special-cased encoders for things like `Date`,
> `Map` and `Set`; Server Components as children, which render on the server and cross as
> output; and Server Actions, which cross as references, not as code.
>
> Client→server, nothing crosses as an import. Functions, classes, and unregistered values
> can't be serialized, so the build rejects them — which is why passing a callback down, or
> importing a server module up, breaks the build. The whole model exists because code stays
> where it runs: only data and references travel.

## 11. Senior-Level Insights

- **"The boundary is a security boundary, not just a transport detail."** Serialization
  exists to keep behavior out of the payload. Frame it that way and follow-ups about
  "what if you pass a function" answer themselves.
- **`Date` is the nuance question.** "Dates don't serialize" is a mid-level answer. The
  senior answer: *plain* JSON can't express `Date`, but the RSC payload has a registered
  encoder — `D` — so `Date` crosses through the protocol, just not through a hand-rolled
  `JSON.stringify`. Same for `Map`, `Set`, `RegExp`, `BigInt`, and typed arrays.
- **DTOs at the border.** The senior pattern: query the DB (or build domain objects) on
  the server, then map to plain serializable shapes before they cross. Client components
  receive DTOs and stay ignorant of the server. This also makes caching (Lesson 90)
  cleaner — plain data serializes predictably.
- **The children-as-props rule is the composition tool.** "How do I put a server section
  inside a client component?" is answered by `children`, not by a prop. Everyone who
  tries to pass a component as a prop hits the error; the senior answer is the slot.
- **Server Actions as references explains Server Actions.** Their serialization story is
  the same one as everything else — only the payload differs (an id, not a body). If a
  candidate explains actions without mentioning references, they've memorized the API,
  not the mechanism.

## 12. Common Mistakes

- **Passing a function as a prop across the boundary** — `onClick` from a server parent.
  Build error: "Functions cannot be passed directly to Client Components." Fix: define
  handlers in the client component, or use a Server Action if the work must be server-side.
- **Importing a Server Component into a client file.** Build error: "You're importing a
  component that needs to run on the server." Fix: receive it as `children`.
- **Importing a whole `'use server'` module from a client file.** The module is
  server-only. Fix: import the individual actions — those are registered references and
  are allowed.
- **Assuming every "object" crosses.** A class instance doesn't, even with primitive
  fields. Neither does a `Map` through a plain `JSON.stringify` — the encoder is part of
  the RSC payload, not of JSON.
- **Relying on the error message to name the exact line.** The build error points at the
  boundary file, not always at the offending prop. Reduce the prop list to find the
  culprit; the error text lists the unsupported types it saw.
- **Stringifying everything "just in case".** Pre-JSON-ing a `Date` to a string loses the
  protocol's advantage and is a permanent smell. Let the payload encode it.
- **Thinking `undefined` in an object is fine everywhere.** In an array it's allowed;
  in an object it's typically dropped, and as a prop it can disappear. Test at the
  boundary rather than assuming.

## 13. Best Practices

✅ Pass plain data across the boundary; shape it into DTOs on the server before crossing

✅ Use `children` to place server-rendered sections inside client components

✅ Let the RSC protocol encode `Date`, `Map`, `Set` — don't pre-serialize them

✅ Import individual Server Actions from client code; never import the server module

✅ Keep a boundary file's prop surface small and typed — `interface` with primitives + plain objects

✅ Treat `undefined` as unreliable across the boundary — default it on the server side

❌ Don't pass callbacks or arbitrary functions from server to client — they can't serialize

❌ Don't import server modules into client files — children is the composition path

❌ Don't pass class instances or unregistered types — convert to plain objects

❌ Don't build client state from server values that differ per request (hydration mismatch, Lesson 87)

## 14. Interview Questions

**Q1. What can cross the server/client boundary?**

> Three things, all server→client: serializable props — plain data, plus protocol-encoded
> types like `Date`, `Map` and `Set`; Server Components as children, which render on the
> server and cross as output; and Server Actions, which cross as references. Nothing
> crosses client→server as an import.

**Q2. What can't cross, and why?**

> Functions, classes, and anything else that can't be serialized. Functions are code —
> there's no way to represent a closure in the payload, and if behavior could ride the
> payload, the client would have to execute it, which is exactly what the model forbids.
> Classes are code in the same sense: their fields might be data, but their type isn't.
> The build rejects these at compile time, which is why the failure shows up as an error,
> not a runtime surprise.

**Q3. Can a `Date` cross the boundary?**

> Yes — but through the RSC protocol's encoder, not through plain JSON. `Date` isn't
> expressible in JSON, so a naive `JSON.stringify` would throw. The RSC payload registers
> a `D` tag that serializes and deserializes dates across the boundary. Same story for
> `Map`, `Set`, `RegExp`, `BigInt` and typed arrays — they're special-cased by the
> protocol, not by JSON.

**Q4. Why did my `'use server'` import break the build?**

> Because I imported a *server-only module* into a client file, and the build refuses
> that — a `'use server'` file can't be imported from client code at all. The fix is to
> import the individual Server Actions instead: an action is registered with the framework
> and crosses as a reference, while a whole module would cross as code.

**Q5. How do you put a Server Component inside a Client Component?**

> Pass it as `children` from the server side. The server renders it, and its output — not
> its code — crosses the boundary. Importing a Server Component into a client file is a
> build error; rendering it as children is the supported composition pattern.

**Senior follow-up: Design a component that needs server data, server-rendered static UI, and client interactivity — in one tree.**

> I'd split it by responsibility. The outer Server Component awaits the data (Lesson 86)
> and renders the static UI itself. The interactive part is a client island (Lesson 87)
> that receives the data as plain props — a DTO — and renders the static UI via
> `children`, so that markup never ships as client JS. Mutations go through a Server
> Action passed as a form action reference.
>
> The tree stays one component tree, but each piece runs where it must: data and static
> markup on the server, interaction on the client, mutations back on the server. Nothing
> crosses except serializable data, rendered output, and action references — which is the
> boundary contract in action.

## 15. Follow-up Questions

**Is the boundary just a Next.js thing?**

> No — the module-boundary model is React's design (React Server Components); Next.js is
> the framework that implements it in the App Router. The serialization protocol, the
> directives, and the directed-edge semantics all come from RSC. Other RSC frameworks
> implement the same contract with the same rules.

**Why can't the payload just include the function's code?**

> Because then the client would be executing server code — which is both a security hole
> (that's how arbitrary code reaches the browser) and a coherence problem (the client
> would run with different data, credentials and APIs than the server). Serialization
> exists to keep behavior out of the wire format. References are the safe alternative:
> the payload carries an id, and the server is the only place the id resolves to code.

**What happens if you mutate a prop that crossed the boundary?**

> You get what you'd expect from React: props are read-only, and the server render that
> produced them is already finished — there's no server copy to re-sync. The value is a
> snapshot that crossed once. If the client needs to change it, that's state (Lesson 87)
> or a mutation (Server Actions) — never mutation of the received prop.

## 16. Comparison Table

| Crossing the boundary | Works? | Mechanism |
|---|---|---|
| `string` / `number` / `boolean` props | ✅ | JSON in the RSC payload |
| Plain objects / arrays | ✅ | Recursively serialized (string keys) |
| `Date` / `Map` / `Set` / `RegExp` | ✅ | Protocol encoders (`D`, `A`, `S`) |
| `BigInt`, typed arrays | ✅ | Protocol encoders (`n`, etc.) |
| `undefined` | ⚠️ | Dropped in objects; allowed in arrays |
| Functions / callbacks | ❌ | Build error — not serializable |
| Class instances / custom classes | ❌ | Build error — type is code |
| Server Component as `children` | ✅ | Rendered server-side; output crosses |
| Server Component as an import | ❌ | Build error — code can't cross |
| Server Action (named import) | ✅ | Crosses as a registered reference |

## 17. Performance Notes

- **Serialization runs at the crossing, once per payload.** Deep props (large nested
  objects) cost per crossing. Keep the prop surface small — it's both a correctness and a
  performance rule.
- **The payload is streamed, not a single blob.** The RSC stream (Lesson 86) is
  incremental, so a boundary-heavy page can flush server sections before slow client
  islands resolve. Don't assume "one big JSON" — that's the mental model to correct.
- **Client bundle cost is per boundary file, not per crossing.** Importing an action
  doesn't pull server code into the bundle (it's a reference); importing a module would.
  That's why the error is worth fixing correctly rather than working around.
- **Hydration is the client-side cost** (Lesson 87). The boundary doesn't add weight by
  itself; the client chunk of everything inside it does. Push static UI to `children` and
  the chunk shrinks without losing the interactivity.
- **When it doesn't matter:** tiny props on a few boundaries — a string and a number are
  effectively free. Optimize the deep objects and the large trees, not the primitives.

## 18. Debugging Scenarios

**Scenario 1: "Build error: 'Functions cannot be passed directly to Client Components.'"**

You passed a callback from a server component to a client one. Find the offending prop —
usually an `onClick`/`onSubmit`. Fix: define the handler inside the client component, or
wrap server behavior in a `'use server'` action and pass that reference instead.

**Scenario 2: "Build error: 'You're importing a component that needs to run on the
server.'"**

You imported a Server Component (or a server module) into a client file. Fix: don't import
it — receive it as `children` from a server parent. If it's a plain server *module*
(utilities), check for `'use server'` or server-only imports inside it, and keep those
calls on the server.

**Scenario 3: "The build error points at my page, but the page is fine."**

The boundary is in a child file. The error reports where the crossing *would* happen; the
actual payload is assembled at the nearest `use client` file. Check the props each client
component receives, and reduce them one at a time to isolate the unsupported value.

**Scenario 4: "My client component gets `undefined` for a prop I definitely passed."**

Either the prop's value contains `undefined` in a position the serialization drops
(objects), or the value was non-serializable and silently failed to encode. Give the prop
a default on the server side, and confirm the value is a plain, JSON-safe type — no class
instances, no functions hiding in the object.

**Scenario 5: "Passing a `Date` through `JSON.stringify` throws, so the payload breaks."**

You're hand-serializing instead of letting the RSC protocol do it. The `D` encoder handles
`Date` when you pass it as a normal prop. If you pre-stringified it, the client receives a
string and you've lost the type. Pass the `Date` directly; the framework tags it.

## 19. Quick Revision Notes

- Boundary = directed edge: server→client only; nothing crosses back as an import
- Crosses: serializable props, server children (as output), Server Action references
- Blocked: functions, classes, unregistered values — build errors, not runtime failures
- `Date` / `Map` / `Set` / `RegExp` / `BigInt` cross via protocol encoders, not JSON
- `undefined` is unreliable in objects — default props on the server side
- Client→server imports are forbidden; children are the composition path
- Server Actions cross as references: id in the payload, code stays on the server
- "Import the action, not the module" is the fix for the classic `'use server'` build break
- The rigidity is a security property: behavior never rides the wire

## 20. Cheat Sheet

```text
server ──────────────▶ client        (the only legal direction)

  props        plain data + protocol types (Date→D, Map→A, Set→S, BigInt→n)
  children     Server Components render on server, cross as output
  actions      'use server' references — id crosses, code stays

  ❌ functions        ❌ classes          ❌ server imports (build error)

  fix "my import broke":
     client file importing a server module   →  import the action instead
     client file importing a Server Component →  pass it as children

  prop rule:  JSON-safe, no functions, no class instances, plain DTOs at the border
```

## 21. Key Takeaways

> [!RECAP]
> - The boundary is one-way: server→client crosses (data, children, action references); client→server imports are build errors
> - Serializability is the test for props — plain data and protocol-encoded types (`Date`, `Map`, `Set`) pass; functions and classes fail at build time
> - Server Components cross as **children**, never as imports — `children` is the composition tool
> - Server Actions cross as **references**: a registered id in the payload, code that runs only on the server
> - Your `'use server'` import broke because you imported a server module; the fix is importing the individual action
> - The boundary's rigidity is a security property: behavior never rides the wire, only data and references do
> - DTOs at the border keep client components plain, small, and cacheable (Lesson 90)

## Check your understanding

Answer these without looking back.

1. Draw the boundary as a directed edge and name the three things that cross it, each with its mechanism.
2. Why does a class instance fail even when every field is a serializable primitive?
3. Is "you can't pass a `Date` across the boundary" true? Answer with the distinction between JSON and the RSC protocol.
4. A client file imports a `'use server'` module and the build breaks. Explain the error and give the exact fix.
5. How do you render a Server Component inside a Client Component — and why is that different from importing one?
6. Why is the boundary's rigidity a security property rather than a limitation?
7. Your client form needs to update a database row. Walk the full path: which values cross, in which direction, and what never crosses.

## What's Next

**Lesson 89 — Data Fetching.** Fetching in a Server Component versus a client hook — when
and why. You now know where each side runs and what can cross; this lesson is how data
gets to each side, and where the cache lives.
