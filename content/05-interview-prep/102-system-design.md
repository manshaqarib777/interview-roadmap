# Lesson 102 — Frontend System Design

**Interview importance:** ⭐⭐⭐⭐⭐ — the round that decides mid versus senior.

This is the interview that breaks people. The prompt sounds like an engineering task — "design
a feed" — but it is really a **communication exercise with a timer**. Mid-level candidates jump
into components and get lost in their own detail. Senior candidates run a fixed, repeatable
process: clarify, estimate, design, discuss trade-offs.

There is no "right answer" to grade you against. The interviewer is watching *how you get to an
answer*: which requirements you pull out, what you quantify, how you order your design, and
whether you can defend the trade-offs you made. This lesson gives you the process, the
vocabulary, and one full worked walkthrough to imitate out loud.

## Learning Objectives

By the end of this lesson you should be able to:

- Run the four phases of a system-design interview in order — clarify, estimate, design, trade-offs
- Turn any prompt ("feed", "chat app", "dashboard") into a list of requirements instead of a list of components
- Ask for the three numbers that matter: DAU, data size, latency budget
- Draw a component tree, data model, and state diagram on a whiteboard from a blank prompt
- Walk one design end to end — "real-time collaborative editor" — out loud in under 30 minutes
- Defend the three big trade-offs: rendering, updates, caching, and when a state library earns its place

## 1. One-line definition

**Frontend system design is the practice of turning a vague product prompt into a concrete
architecture — requirements, data, components, state, performance — out loud, under time
pressure, so an interviewer can hear how you think.**

## 2. Mental model

You are a staff engineer in a kickoff meeting. A product person just said "make us a feed like
Twitter." Your job is **not** to start building — it is to ask questions until the thing is
buildable, write the shape of it down, and leave with the team aligned.

The interview is the same meeting, compressed. You are not demonstrating that you can build the
feed. You are demonstrating that you would be *safe to hand a large feature to* — that you ask
the right questions before anyone writes code.

Keep this shape in your head for the whole interview:

```text
        ┌────────────────────────────────────────────────────────┐
        │  THE PROMPT: "design a feed / chat / dashboard"        │
        └──────────────┬─────────────────────────────────────────┘
                       │  1 · CLARIFY   (5 min)  who, what, how big
                       ▼
              ┌───────────────────┐   2 · ESTIMATE  (5 min)
              │  requirements     │   DAU, data size, latency budget
              │  + constraints    │   ... three numbers you can defend
              └──────────┬────────┘
                         │  3 · DESIGN   (15 min)
                         ▼
        ┌──────────────────────────────────────────────┐
        │  data model  →  API  →  component tree       │
        │  →  state strategy  →  perf targets          │
        │  →  error / loading / a11y                   │
        └──────────┬───────────────────────────────────┘
                   │  4 · TRADE-OFFS   (rest of the time)
                   ▼
        "given X I chose A; the cost is Y; I'd switch if Z"
```

Every prompt maps onto that spine. The prompt gives you nothing but a noun; everything else is
questions you asked.

## 3. Visual flow

The four phases in one picture — this is the clock you are actually racing:

```text
 0:00                     5:00                     10:00                        25:00                30:00
   │                        │                         │                             │                  │
   ▼                        ▼                         ▼                             ▼                  ▼
┌──────────┐          ┌────────────┐           ┌────────────────────────┐      ┌────────────────┐   ┌──────────┐
│ CLARIFY  │─────────▶│ ESTIMATE   │──────────▶│ DESIGN                 │─────▶│ TRADE-OFFS     │──▶│ WRAP     │
│          │          │            │           │                        │      │                │   │          │
│ · who    │          │ · DAU      │           │ 1. data model          │      │ · rendering    │   │ · what   │
│   uses it│          │ · scale    │           │ 2. API surface         │      │   (CSR vs SSR) │   │   I'd    │
│ · what   │          │   of data  │           │ 3. component tree      │      │ · optimistic   │   │   build  │
│   is the │          │ · latency  │           │ 4. state strategy      │      │   updates      │   │   first  │
│   core   │          │   budget   │           │ 5. performance targets │      │ · caching      │   │ · risks  │
│   loop   │          │            │           │ 6. error/loading/a11y  │      │ · state lib    │   │          │
│ · non-   │          │            │           │                        │      │                │   │          │
│   goals  │          │            │           │                        │      │                │   │          │
└──────────┘          └────────────┘           └────────────────────────┘      └────────────────┘   └──────────┘
   "can I       →       "what do I    →           "here is the thing"      →     "and here is why"  →   "next step"
   build this?"          need to know?"
```

Three rules that keep you senior the whole time:

1. **Clarify before you estimate.** Design a chat app for 10 friends ≠ chat app for 10 million
   concurrent users. The answer changes every downstream choice.
2. **Estimate before you design.** You cannot choose a data model or a caching layer until you
   know the scale you are designing for.
3. **Design before you optimize.** Draw the whole system first; discuss trade-offs at the end.
   Optimising a half-defined system is how people talk for 25 minutes and deliver nothing.

## 4. How it works — the canonical framework

Here is the exact script, phase by phase. Learn these six boxes; the walkthrough in
Section 13 runs them on a real prompt.

### Phase 1 · Clarify (5 min)

Convert the noun into requirements. Two buckets:

- **Functional:** what must it do? List features in priority order. For a feed: view feed,
  post, like, comment, follow, infinite scroll. Ask "is search in scope? notifications?" —
  scoping questions are the cheapest way to look senior.
- **Non-functional:** how must it behave? Performance budget, real-time needs, devices,
  offline, accessibility, security. State the three you will actually design for and say the
  rest are out of scope.

### Phase 2 · Estimate (5 min)

Ask for, or propose, **three numbers**: DAU (daily active users), the size of the data you
serve, and the latency budget. A senior answer rounds them and attaches a constraint:

> "Let's say 1M DAU, 10% online at peak — 100k concurrent. Each feed item is ~5 KB, users
> scroll 30 items, so ~150 KB per load. Budget: first paint under 2 s on mid-tier Android,
> scrolling at 60 fps."

The numbers exist so that every design decision below has a justification. "We virtualise
because 30 items × 5 KB with 100k concurrent readers makes the naive list too slow to render"
is a sentence that only works because you estimated first.

### Phase 3 · Design (15 min) — the six boxes

| Box | What you draw | The question it answers |
|---|---|---|
| **Data model** | entities + fields + relations | What is the source of truth? |
| **API design** | endpoints + request/response shapes | How does the client talk to it? |
| **Component tree** | components + props + ownership | Who renders what? |
| **State strategy** | what state lives where | Where does each piece of truth live? (Lesson 82) |
| **Performance targets** | budgets + techniques | Will it be fast enough at scale? (Lesson 90) |
| **Error / loading / a11y** | states + fallbacks + semantics | What happens when it goes wrong? (Lesson 76) |

### Phase 4 · Trade-offs (rest of the time)

Pick the three decisions you made and defend each: the alternative, why you rejected it, and
the trigger that would make you switch. Cover the four classic axes from Section 12: rendering
strategy, optimistic vs pessimistic updates, caching strategy, and state library or not.

> [!TIP]
> Talk about **why you are NOT doing something** as often as what you are doing. Interviewers
> hear "I'd use TanStack Query" a hundred times a week. They almost never hear "I would *not*
> put the feed in Redux, because the list is server state with no client business logic — a
> cache is the right tool." That sentence alone moves a mid answer to senior.

## 5. Real project usage

Here is the framework against three of the most common prompts — read these as "what to say
out loud during phase 1", not as finished designs.

### "Design a feed"

```text
FUNCTIONAL (in priority order)          NON-FUNCTIONAL
· infinite scrolling list               · LCP < 2 s on mid-tier devices
· post / like / comment                 · 60 fps while scrolling (image-heavy!)
· follow/unfollow                       · < 1 KB of JS blocking first paint
· image + video content                 · accessible: alt text, focus order
ASK: is search / notifications /        ESTIMATE: 1M DAU, 10% peak concurrent,
personalisation in scope?               items ~5 KB × 30 per page = 150 KB/load
```

The senior move on a feed is spotting that it is **an append-only list of large media items**
— which drives three decisions instantly: paginate or virtualise the list (Lesson 70), lazy-load
images, and keep the client-side data layer a *cache*, not a store (Lesson 82).

### "Design a chat app"

```text
FUNCTIONAL                          NON-FUNCTIONAL
· message list                      · < 100 ms perceived send (optimistic!)
· send / receive (real-time)        · message order is CRITICAL — a clock or
· presence (online/typing)          ·   sequence number, never client timestamps
· read receipts                     · offline queue (sent but not delivered)
ASK: 1:1 or groups? media?          · ESTIMATE: 10k users, 10 msg/user/min peak =
history depth?                       · ~1.7k msg/s — doable, but order at that
                                     · rate needs a server-assigned sequence
```

Chat is the prompt that rewards **state strategy** and **optimistic updates** the most (Section
12): the only place you must render a message before the server confirms it.

### "Design a dashboard"

```text
FUNCTIONAL                              NON-FUNCTIONAL
· KPI cards + charts                    · first load < 2 s (the whole selling point)
· filters (date range, region)          · chart re-render budget: < 16 ms per frame
· table with sort / paginate            · accessibility: charts need a text table
ASK: live or snapshot data?             ·   alongside them — screen readers can't
which metrics are expensive?            ·   read a canvas. ESTIMATE: 10k metrics,
                                        ·   window 30 days → 300k points per chart
```

Dashboards look simple and are not: the data is wide (many series), deep (many points), and
expensive. The senior answers are **query-time aggregation** (never ship 300k raw points) and
**canvas/SVG for charts**, not DOM. See the checklist in Section 9.

> [!NOTE]
> Every one of these prompts is solved by the same six boxes. If you can run the framework on a
> feed, you can run it on any noun they invent. The noun is decoration.

## 6. Interview explanation

The 30-second answer when someone asks "how do you approach a system design question?":

> I run four phases. First I clarify — I turn the prompt into functional and non-functional
> requirements and ask what's in scope. Then I estimate: DAU, data size, and a latency budget,
> so the design has numbers behind it. Then I design in a fixed order — data model, API,
> component tree, state strategy, performance targets, and error and accessibility states.
> Finally I discuss trade-offs: I defend the decisions I made, name what each one costs, and say
> what would make me change my mind.

That is the whole lesson in seven sentences. Say it the way you'd say it to a colleague, not a
script.

## 7. Senior-level insights

- **Ask about scale before anything else.** Two words — "for how many users?" — separate
  seniors from people who design a toy. A chat app for 10 people is a WebSocket and a list. For
  10M concurrent it is sharded presence, ordered message queues, and offline sync.
- **Make the data model first.** Components are downstream of data. If you draw the entities and
  relations first, the component tree writes itself and you look calm while you do it.
- **Name the trade-off you'd accept.** "I'd ship the slower-but-simpler approach because this is
  a v1 and we can instrument it" is a senior sentence. Certainty about a single right answer is
  a mid-level tell.
- **Write down every number you state.** Interviewers remember "150 KB per page load" and will
  reuse it. Round everything so you can do the arithmetic in your head.
- **Close with next steps.** End with "first milestone: authenticated post flow with a
  placeholder feed, then virtualisation, then optimistic likes." That is what a tech lead sounds
  like.

## 8. Common mistakes

- **Designing before clarifying.** Fifteen minutes of components for a product you never
  defined. Fix: spend the first five minutes asking questions, out loud.
- **Panicking at the prompt.** "Design a chat app" is not a test of WhatsApp trivia. It is the
  six boxes wearing a noun.
- **No numbers.** "Use a CDN" with no scale to justify it is a vibe, not a decision.
- **Diving into one box.** A perfect WebSocket design while data model, loading states, and
  accessibility go undrawn is a fail — breadth is the grading rubric.
- **Forgetting error and loading states.** Mid-level designs are happy-path machines. Seniors
  draw the empty state, the retry button, and the error boundary (Lesson 76) before they stop.
- **Talking at the interviewer, not with them.** System design is collaborative. Pause after
  each box: "does that match what you had in mind?".
- **Committing to one answer and defending it forever.** If the interviewer pushes, the senior
  response is "fair — then I'd switch to X and the cost is Y", not a louder restatement.

## 9. Best practices

✅ **Clarify** — turn the prompt into functional + non-functional requirements before drawing anything

✅ **Estimate** — propose DAU, data size, and a latency budget; round the numbers

✅ **Design in the fixed order** — data model → API → components → state → performance → errors/a11y

✅ **Draw, don't recite** — a whiteboard diagram per box; the interviewer is watching you think on a board

✅ **Name what each decision costs** — every choice has a trade-off; say both sides

✅ **Keep the user-visible budget honest** — e.g. first paint < 2 s, 60 fps scroll, < 1 KB of blocking JS

❌ **Don't start with components** — components are the last thing, and the least interesting

❌ **Don't give unquantified answers** — "a CDN and a cache" with no scale is noise

❌ **Don't design in isolation** — check in with the interviewer after each phase

❌ **Don't skip the failure states** — errors, empty states, and a11y are where seniority shows

## 10. Interview questions

**Q1. Walk me through how you'd design a system from a prompt.**

> I'd run four phases. Clarify first — functional requirements, non-functional requirements, and
> scope. Then estimate — DAU, data size, latency budget. Then design in a fixed order: data
> model, API, component tree, state strategy, performance, and failure states. Then I'd discuss
> the trade-offs of the decisions I made and close with what I'd build first.

**Q2. What metrics do you need before you start designing?**

> Three. Daily active users, and an estimate of peak concurrency. The size of the data I'm
> serving — per-item size times how many a user touches. And a latency budget — first paint,
> interaction, and frame rate. Everything in the design is downstream of those numbers.

**Q3. How do you decide between rendering the page on the server or the client?**

> It depends on what the page is. Content that must be indexed or read quickly — docs, articles,
> public pages — gets server rendering for the first paint. Highly interactive, authenticated
> app shells — dashboards, editors, chat — get client rendering. The real answer is usually a
> hybrid, and Next.js makes that a per-page decision (Lessons 86–88).

**Q4. When would you use a state management library?**

> When there is shared client state that many components mutate, with business rules attached —
> a cart, a form wizard, an editor. For server data I would not: a cache like TanStack Query
> (Lesson 81) owns fetching, and local `useState` owns ephemeral UI. Library state is the
> smallest of the three buckets (Lesson 82), not the default.

**Q5. How do you design for performance at scale?**

> I set the budget first — say 2 s LCP, 60 fps scroll — then design the data layer around it.
> Pagination or virtualisation for long lists, lazy-loading for media, code-splitting for
> routes. Then I measure against the budget. The cache (Lesson 90) is the biggest lever: stop
> re-fetching what hasn't changed.

**Q6. How do you handle real-time updates?**

> I'd default to optimistic updates with a server-confirmed result: render the new state
> immediately, reconcile when the server responds, roll back on failure. I'd scope it by
> consequence — a like is trivially optimistic; a payment is not. Real-time transport — polling
> vs SSE vs WebSocket — is a separate decision driven by message rate and freshness needs.

**Senior follow-up: The interviewer pushes back — "optimistic updates sound like a lot of work. Why not just refetch after every action?"**

> Refetch-after-action is simpler and it is the right call when the action is rare or the
> consequence is high — it's exactly what I'd ship for the first version of a dashboard filter.
> The reason I'd invest in optimistic updates for a feed or chat is that those products live and
> die on perceived latency: a like that takes 600 ms to render feels broken. I'd prototype the
> refetch version, measure it against the latency budget, and switch when the budget forces me
> to. The trigger is the budget, not taste.

## 11. Follow-up questions

**"Why is a feed a cache problem and not a state problem?"**

> Because the list is a projection of server data — read-heavy, mutated by other users, and
> discardable. A cache knows how to keep it fresh, deduplicate requests, and expire it. Client
> state management is for data the client owns and mutates. Using Redux for server lists is
> using a state machine as a fetch layer — it works, and then you reimplement invalidation
> yourself.

**"What if the product needs to work offline?"**

> Then the architecture changes: I'd add a local store for mutations, an outbox that replays
> when the connection returns, and conflict resolution — probably last-write-wins for v1. I'd
> call it out as a scope decision, because offline is one of the most expensive requirements to
> bolt on later.

**"How do you estimate a number you've never measured?"**

> I pick the nearest thing I have data for and scale it. If I don't have data, I state my
> assumption out loud — "I'll assume 10 messages per active user per minute" — and round it.
> Interviewers grade the reasoning and the honesty, not the accuracy.

**"What would you build first?"**

> The thinnest vertical slice that exercises every layer: for a chat app, one-to-one messaging
> end to end — send, persist, deliver, render — with the real-time path, before presence,
> before groups, before read receipts. Vertical first, then breadth.

## 12. Comparison table

The four trade-off axes you must be ready to defend:

| Axis | Option A | Option B | When A | When B |
|---|---|---|---|---|
| **Rendering** | Server-render (SSR/SSG) | Client-render (CSR/SPA) | Public, indexable, read-heavy; first paint matters (L86–88) | Authenticated, highly interactive app shell |
| **Updates** | Optimistic (render then confirm) | Pessimistic (wait for server) | Low-consequence, high-frequency: likes, messages | High-consequence, rare: payments, edits that lock |
| **Caching** | Cache client-side (TanStack Query) | Fetch on every action | Read-heavy lists; fresh-enough beats fresh (L90) | Data that must be live; writes dominate reads |
| **State** | Library (Redux/Zustand) | Local + server state only | Shared mutable client data with business rules | Server data (cache it) + ephemeral UI (use `useState`) |

## 13. Code example — the full worked walkthrough

Now we run the whole process end to end. Prompt:

> **"Design a real-time collaborative document editor — like Google Docs."**

Follow along as if you were in the room. **Say each box out loud** — that is the skill this
lesson is actually training.

### Phase 1 · Clarify — what are we building?

Out loud:

> "Let me make sure I understand the scope. I'll assume a web editor for multiple users editing
> one document at the same time, seeing each other's changes live, with comments. I'll treat
> version history as out of scope for now, and audio/video calling as out of scope. Is that the
> right frame?"

Write down the two buckets:

```text
FUNCTIONAL                          NON-FUNCTIONAL
· rich text editing in-browser      · keystroke-to-pixel < 100 ms local
· real-time multi-user sync         · remote changes visible < 500 ms
· live cursors / presence           · every doc state versioned & recoverable
· comments on a selection           · collaborative correctness:
ASK: offline? version history?        concurrent edits NEVER lose either one
import/export? mobile?              · ESTIMATE (Section 13.1): 1M DAU,
                                      ~1.5M edits/day across 100k docs
```

The load-bearing question is the last non-functional one: **two users edit the same word at
the same time — who wins, and does anyone lose text?** Every hard decision in this design is
answering that.

### Phase 2 · Estimate

Out loud — and write the numbers:

```text
· 1M DAU · 5% concurrent at peak = 50k users online
· 100k documents · avg doc ~50 KB of text ops
· traffic: 100k users × 15 edits/day = 1.5M edits/day
            ≈ 20 edits/sec average, ~300/sec at peak
· per edit: a few hundred bytes of op payload
· budget: local keystroke < 100 ms · remote echo < 500 ms
```

Two of those numbers drive everything downstream: the **edit rate** (300 ops/sec peak — tiny;
this is not a scale problem, it is a *consistency* problem) and the **latency budget**
(keystroke-to-pixel under 100 ms).

> [!NOTE]
> The insight to say out loud: *"The hard part of this design isn't throughput — 300 ops a
> second is nothing for a server. The hard part is ordering concurrent edits so nobody's text
> is lost."* That sentence is the whole round.

### Phase 3 · Design — the six boxes

**Box 1 · Data model.** The document is a list of ops (insert/delete/retain with an author and
a sequence number), plus a doc-level version:

```text
            ┌──────────────────────────────────────────────────────┐
            │  Document  ──────────── has many ──▶  Op              │
            │  · id  · title          ·  id  · type (insert|delete) │
            │  · version (last       ·  pos · text · authorId      │
            │    applied op seq)     ·  seq (server-assigned)      │
            │  · ownerId              │  └── ordered by (docId, seq)│
            └─────────────────────────┴─────────────────────────────┘
```

Why a list of ops instead of a blob of text? Because "edit the same word concurrently" has a
correct answer only if every change is a small, ordered, replayable operation. Ops are the unit
of sync, the unit of conflict resolution, and the unit of audit — one structure, three jobs.

**Box 2 · API design.** The read/write API is ordinary REST; the live channel is a WebSocket:

```ts
// REST — coarse sync (join, catch-up, history)
GET    /docs/:id                  // snapshot + current version
POST   /docs/:id/ops              // append one op; returns its server seq
GET    /docs/:id/ops?since=412    // ops newer than version 412 (catch-up)

// WebSocket — live sync (documented channel)
connect /ws/docs/:id
→ from client: { type: 'op', op: { … }, baseSeq: 412 }
← from server: { type: 'op-ack', opId, seq: 413 }        // order decided HERE
← to everyone: { type: 'op', op, seq: 413, authorId }    // broadcast
← to everyone: { type: 'presence', userId, cursor, atSeq }
```

The deliberate asymmetry: clients *propose* ops with the last sequence they saw, and the server
*assigns* the authoritative order. That one rule — **the server decides order** — is the
conflict-resolution strategy, and it buys you the correctness requirement for free.

**Box 3 · Component tree.** Now it writes itself from the data model:

```text
        <DocApp>                  — session, ws connection, op sync
           │
        <EditorPane>              — the editable surface
           │
        ┌──┴───────────┐
    <Toolbar>        <EditorContent>        — only this re-renders on edits
                        │
              <RemoteCursor/>   (per remote user)
        <CommentThread/>        (anchored to a text selection)
```

The ownership rule to state: *"Only the text that actually changed re-renders. The toolbar and
layout never touch the editing loop."* That is the performance decision, made at the component
boundary, before we ever talk about memoization.

**Box 4 · State strategy** (reference Lesson 82). Three layers, kept deliberately separate:

```text
┌────────────────────────────────────────────────────────────────────┐
│  server state (the source of truth):                                │
│    doc snapshot + op log + live cursor positions                     │
│    → TanStack Query cache: keyed by doc id, invalidation = new ops   │
├────────────────────────────────────────────────────────────────────┤
│  client-only derived state:                                          │
│    current selection, which comment thread is open, sidebar open?    │
│    → local useState / context — never shared with the sync loop      │
├────────────────────────────────────────────────────────────────────┤
│  ephemeral: this keystroke's composition buffer                      │
│    → local component state, discarded on blur                        │
└────────────────────────────────────────────────────────────────────┘
```

The sentence to say out loud: *"The doc is server state — I cache it, I don't put it in Redux.
Redux would force me to reimplement caching, deduplication and invalidation that a query cache
already gives me."* Reference Lessons 81–82 for the reasoning.

**Box 5 · Performance targets.** The budget from Phase 2, made concrete:

```text
· local keystroke → visible      < 100 ms   (no network in that path)
· remote echo                    < 500 ms   (ws + op apply, no full re-render)
· edit re-render                 < 16 ms    (only EditorContent, not the page)
· join a doc (snapshot + catch-up) < 2 s   (1 REST call + replay < 200 ops)
```

The keystroke rule is the load-bearing one: typing must **never wait on the network**. The local
echo applies the op to the editor immediately; the server confirmation only reconciles order
afterwards.

**Box 6 · Error, loading, and accessibility.** Reference Lesson 76 and say each one out loud:

```text
LOADING   skeleton editor → then snapshot → then live ops fill in
ERROR     offline banner + "changes pending" chip; local ops queue in memory;
          reconnect → resend queue → server acks in order
          (app-level: <ErrorBoundary> around EditorContent, Lesson 76)
EMPTY     first-open: template text with a blinking cursor
A11Y      toolbar focusable & keyboard-driven · cursors announced via aria-live
          · canvas-based cursors need an accessible summary · 4.5:1 contrast
          · selection comments reachable by keyboard, not only mouse
```

### Phase 4 · Trade-offs — three decisions, defended

Say this part as a dialogue with the interviewer — it is the phase where mid becomes senior.

**Trade-off 1 — Rendering: an SPA, not SSR.**

> "This is an authenticated, intensely interactive app shell — server rendering buys nothing and
> costs a hydration round-trip on every keystroke. I'd ship a client-rendered SPA. If SEO
> mattered for public docs, I'd add SSR for the read view only."

**Trade-off 2 — Optimistic updates.**

> "Keystrokes are optimistic by construction — they have to be, under a 100 ms budget. The
> reconcile step is: when the server assigns a sequence, I reorder the local buffer to match and
> replay. A like-button is trivially optimistic; here the cost is that out-of-order replays can
> briefly jump the cursor. I'd ship the simple in-order version first and measure."

**Trade-off 3 — Caching and the state library.**

> "The doc is server state, so it lives in a query cache keyed by document, invalidated by the
> op stream — not in Redux. I'd only reach for a state library for the comment threads, where
> there is real shared client logic across components. The whole design has no global state
> store, and that's a feature."

Then the closer — one minute, no new ideas:

> "First milestone: one document, two users, one shared cursor — the full sync path with the
> server ordering ops, before comments, before presence polish. Then comments, then presence,
> then version history, which we scoped out. The risks I'd watch are op-ordering correctness
> and the 100 ms typing budget — both are instrumentable from day one."

And here is the whole design, one picture:

```text
        Users (50k concurrent)
              │  https (REST)            │  wss (live ops + presence)
              ▼                          ▼
        ┌──────────────────┐    ┌──────────────────┐
        │  Doc API         │    │  Sync Service    │
        │  snapshots · ops │    │  assigns seq     │──► op log
        │  history         │    │  broadcasts      │    (ordered,
        └────────┬─────────┘    └────────┬─────────┘     replayable)
                 │                       │
                 ▼                       ▼
        ┌──────────────────────────────────────────────┐
        │  Client:  query cache (doc = server state)   │
        │            + local op buffer (optimistic)    │
        │            + EditorContent (only thing that  │
        │              re-renders on an edit)          │
        └──────────────────────────────────────────────┘
```

> [!TIP]
> This walkthrough is a template, not a script to memorise. Swap the noun — feed, dashboard —
> and the six boxes hold. Practise it out loud three times and the process stops being a list
> and becomes the way you think.

## 14. Performance notes

- **When it matters:** the system-design round is 40% performance reasoning. Every latency
  budget you state should be attached to a technique — "under 2 s LCP, so I'm server-rendering
  and code-splitting the route."
- **The client rendering budget** — 60 fps, < 100 ms per interaction, < 16 ms per frame — is the
  one interviewers probe most, because it forces you to say *what re-renders* and *what gets
  virtualised or memoized*.
- **Cache first (Lesson 90), compute second.** The cheapest request is the one you never make:
  client caching, dedup, and stale-while-revalidate dominate algorithmic micro-tuning.
- **It stops mattering** when the interviewer says "ignore performance for now" — then drop it,
  say "I'd measure before optimising", and move on. Belabouring perf the interviewer scoped out
  is a classic signal you don't listen.

## 15. Debugging scenarios

You are the senior on call for these four — each is a live system-design failure, diagnosed:

- **Scenario A — the feed that stutters on scroll.** Symptom: 30 fps on mid-tier phones.
  Cause: every scroll frame re-renders the whole list; 5 KB items × 50 nodes each. Fix:
  virtualise the list (Lesson 70) and memoize row components. The lesson: the perf problem was
  decided by the component tree, not the cache.
- **Scenario B — chat messages appear in the wrong order.** Symptom: user A sees "hi", "bye";
  user B sees "bye", "hi". Cause: client timestamps, which are untrustworthy across machines.
  Fix: server-assigned sequence numbers, exactly the design rule from Section 13. The lesson:
  ordering is a server concern, never a client clock.
- **Scenario C — an edit is silently lost on a flaky connection.** Symptom: two collaborators
  both edited the same word; one version vanished. Cause: no replay — the losing op was
  discarded on failure. Fix: queue the op, resend on reconnect, apply in server order. The
  lesson: error handling and correctness are designed in Phase 1, not discovered in prod.
- **Scenario D — the dashboard's first load is 6 seconds of blank.** Symptom: one giant data
  fetch for 300k chart points. Cause: no skeleton, no pagination, no aggregation. Fix:
  render the shell instantly, query-time-aggregate to a few hundred points, then hydrate. The
  lesson: loading states are part of the design (Lesson 76), not an afterthought.

## 16. Quick revision notes

- Four phases, in order, every time: **clarify → estimate → design → trade-offs**
- Three numbers to ask for: **DAU, data size, latency budget** — round them, defend them
- Six design boxes: **data model, API, component tree, state, performance, errors/a11y**
- Draw the **data model first** — components are downstream of data
- Server data → **cache** (Lesson 90); shared client data → **state library** (Lesson 82);
  ephemeral UI → **useState**
- Optimistic updates for **low-consequence, high-frequency** actions; pessimistic for the rest
- Loading, error, empty, a11y states are **required boxes, not bonus marks** (Lesson 76)
- Always close with: **what I'd build first, and what I'd watch out for**

## 17. Cheat sheet

```text
THE 4 PHASES                      THE 3 NUMBERS
 1 clarify   5 min   scope + reqs    · DAU → peak concurrency
 2 estimate  5 min   3 numbers       · data size per page load
 3 design   15 min   6 boxes         · latency budget (LCP, frame)
 4 tradeoffs rest    defend + switch

THE 6 BOXES (design phase)          THE 4 TRADE-OFF AXES
 1 data model                       · SSR vs CSR        (L86–88)
 2 API design                       · optimistic vs pessimistic
 3 component tree                   · cache vs fetch     (L90)
 4 state strategy                   · state lib vs none  (L82)
 5 performance targets
 6 error / loading / a11y           THE CLOSER
                                    "first milestone: <thinnest
SENTENCE STARTERS                   vertical slice>; risks: <two>"
 · "Let me clarify the scope…"
 · "I'll assume …"                  ⚠ never: components first,
 · "The load-bearing requirement      unquantified answers,
   is …"                              no failure states
 · "Given X I chose A; the cost
   is Y; I'd switch if Z"
```

## 18. Key takeaways

> [!RECAP]
> - System design is a **process test, not a product test** — the prompt is a noun; the
>   grading is how you get from noun to architecture
> - Run the four phases in order: **clarify → estimate → design → trade-offs**, with the clock
> - Estimate first: **DAU, data size, latency budget** — every later decision cites these
> - Design in six boxes: **data model, API, component tree, state strategy, performance,
>   error/loading/a11y** — data model first, components last
> - The three cross-cutting rules: server data is a **cache** (Lesson 90), state goes where it
>   belongs (Lesson 82), failure states are designed in (Lesson 76)
> - Defend trade-offs like a lead: what you chose, what it cost, and what would make you switch
> - Close with the **thinnest vertical slice** and your top two risks — that's the senior closer

## Check your understanding

Answer these without looking back.

1. Name the four phases of a system-design interview, in order, and what each one produces.
2. What three numbers do you need before you start designing — and why does each one change the
   design?
3. Why is the data model the first design box, before the component tree?
4. "Design a chat app" — give the clarifying question that most changes the architecture, and
   the requirement it exposes.
5. Why does the collaborative editor assign ordering on the **server** instead of trusting
   client clocks? What breaks if you use timestamps?
6. In the editor walkthrough, which component is allowed to re-render on an edit, and why does
   that decision exist?
7. Give the sentence that defends using a query cache instead of a state library for server
   data — then the counter-case where a library is right.
8. What three things must every design include besides the happy path? (Think error, loading,
   and the third.)

## What's Next

**Lesson 103 — Portfolio Projects.** Three production-quality projects beat twenty tutorials.
You'll learn how to pick projects that demonstrate the skills from this lesson, how to present
trade-offs you actually made, and how to tell the story of each one in a design interview.
