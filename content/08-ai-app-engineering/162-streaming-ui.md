# Lesson 162 — Streaming UI

**Interview importance:** ⭐⭐⭐⭐ — "how do you make an AI UI feel good?" is the product-quality question; the answer is the *streaming UI* — the felt-quality layer built on the parts and states of L161.

Lessons 145 and 161 gave you the mechanism (streaming) and the vocabulary (parts + states). This lesson is the **product layer**: the streaming UI — markdown rendering as tokens arrive, progress indicators, cancellation, and the states that make a stream *feel* like a conversation instead of a loading bar. The felt-quality of ChatGPT, Claude, and Gemini is this lesson.

The distinction this lesson is built on: a **demo** renders text when it's done. A **solutions architect** renders *as it arrives*: markdown that forms incrementally (L161's text parts), tool progress that explains the loop (L164), a Stop button that actually aborts (L145), and states — streaming, tool-running, done, errored — that never leave the user guessing.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the streaming UI's job: make the stream *felt* — TTFT visible, progress shown, states clear (L145)
- Render streaming markdown: incremental, without breaking the formatting
- Show tool progress in the UI (L164): pending → executed, as part of the conversation
- Implement cancellation (L145): a Stop that aborts the upstream call
- Handle the end states: done, length (L149), errored (L168) — as designed UX

## 1. One-Line Definition

**The streaming UI is the product layer that renders the model's stream as it arrives — incremental markdown, visible tool progress, real cancellation, and clear states — turning the parts-and-states of L161 into the felt-quality of a conversation.**

The one-sentence interview answer: *"The streaming UI is where the stream becomes the product: text parts render as incremental markdown (L161), tool-call parts show pending → executed progress (L164), a Stop button aborts the upstream call (L145), and the states — streaming, tool-running, done, errored — are always explicit. The user never waits in silence, never wonders what's happening, and never sees a truncated answer treated as complete (L149)."*

## 2. Mental Model

Think of the streaming UI as **watching a skilled person think out loud** — instead of a messenger who disappears and returns with the whole answer.

```text
   Non-streaming UI                Streaming UI (this lesson)
   ┌────────────────────┐          ┌──────────────────────────┐
   │ [spinner] … 3s …    │          │ "A closure is a function │  ← streaming
   │ [spinner] … 8s …    │          │  that remembers…"        │
   │ [the whole answer]  │          │                          │
   └────────────────────┘          │ [using get_stock…] ✓     │  ← tool progress (L164)
                                    │ "$212.40 — up 1.2%."     │
   feels broken after 2s            │ [Stop]                   │  ← cancellation (L145)
                                    └──────────────────────────┘
                                        feels like a conversation
```

The mental model is **progress replaces waiting**: every moment of the stream is visible, every state is explained, and the user is never left with a spinner and a prayer.

## 3. Visual Flow — The Streaming UI State Machine

```text
   user sends
        │
        ▼
   ┌─────────────────────────────┐
   │ streaming                   │ ← text parts render as markdown (L161)
   │   │                         │
   │   ▼ (tool-call part)        │
   │ tool-running                │ ← "using get_stock…" (L164)
   │   │                         │
   │   ▼ (tool-result part)      │
   │ streaming (continues)       │ ← the answer resumes
   │   │                         │
   │   ▼ (finish part)           │
   ├─────────────────────────────┤
   │ done          stop          │ → the answer stands
   │ done          length        │ → "continued?" (L149) — never silent
   │ errored       error         │ → recovery + partial kept (L168)
   └─────────────────────────────┘
        any state → [Stop] aborts the upstream call (L145)
```

The state machine is L161's, made *visible*: every state has a rendering, and the two end states that need honesty — `length` and `error` — are designed UX, not surprises.

## 4. How It Works — The Streaming UI's Four Jobs

- **Render incremental markdown.** Text parts (L161) arrive as deltas; the UI accumulates them and renders markdown. The tricky part is *incremental correctness*: the markdown is incomplete mid-stream — a code fence is half-open, a list is mid-item. The renderer must handle partial markdown without flashing broken formatting (a common approach: render the raw text progressively and parse only at safe points, or accept minor transient formatting flicker — the senior trade-off).
- **Show tool progress (L164).** A tool-call part renders as "using get_stock…", and the tool-result part flips it to the result — pending → executed, as part of the conversation. The user sees *why* the model paused.
- **Make cancellation real (L145).** The Stop button calls `abort()` on the client; the server aborts the upstream provider call. Cancellation that only hides the text (while the provider keeps billing tokens) is a fake Stop.
- **Handle the end states honestly.** `finish: stop` → done. `finish: length` (L149) → the answer was truncated — render "continued?" rather than a normal-looking half-answer. `error` (L168) → recovery with the partial kept.

> [!NOTE]
> **The honesty rule of the streaming UI.** The two states that decide whether the UI is a product or a demo are `length` (truncation) and `error` (failure). A demo treats both as "done"; a product tells the truth — "this was cut off, continue?" and "this failed, retry or keep the partial." That honesty is the felt-quality people can't name but absolutely feel.

## 5. Real Project Usage

- **Chat products.** Incremental markdown, tool progress, Stop — the ChatGPT/Claude/Gemini feel, built from L161's parts.
- **Copilots and assistants.** The streaming UI shows the tool loop (L164) as visible steps — the user watches the assistant check, run, and answer.
- **Agents (L200).** Tool-call parts become agent steps; the UI renders the sequence — a primitive agent observability (L213) that doubles as user trust.
- **Structured output (L163).** `streamObject` parts render a typed result as it forms — a form that fills in, validated live by the schema (L143).
- **Any human-facing AI output.** Summaries, code, reports — rendered as they're produced, with a Stop that works.

The through-line: **the streaming UI is where AI products earn their feel** — progress instead of waiting, explanation instead of mystery, and honesty about limits.

## 6. Interview Explanation

Say it in four moves:

1. **The frame.** "The streaming UI renders the stream as it arrives — text, tool progress, cancellation, and honest end states — turning L161's parts into the product's feel."
2. **The rendering.** "Text parts render as incremental markdown; tool-call parts show pending → executed (L164); a Stop aborts the upstream call (L145)."
3. **The honesty.** "The end states tell the truth: `length` renders 'continued?' not a silent cut (L149), and `error` shows recovery with the partial kept (L168)."
4. **The why.** "Progress replaces waiting — the user never stares at a spinner, never wonders what's happening, and never trusts a truncated answer as complete."

## 7. Senior-Level Insights

- **The streaming UI is the *product* layer of latency (L145, L151).** TTFT is engineering; the streaming UI is what the user *feels* of it. A 300ms TTFT rendered as a spinner feels worse than a 1s TTFT that streams. The UI is a latency lever.
- **Tool progress is trust (L164, L213).** Showing "checking the database…" explains the pause; hiding it makes the model feel unpredictable. The pending → executed states are the seed of agent observability (L213) and user confidence.
- **Cancellation is a cost control (L145, L150).** A Stop that aborts upstream stops token billing mid-stream (L149) — it's not just UX, it's cost. A fake Stop is a hidden cost leak.
- **Incremental markdown is a rendering trade (L151).** Perfect markdown needs the full text; streaming needs incremental. The senior answer names the trade — progressive rendering with transient formatting flicker, or plain-text-until-stable — and picks per product.
- **The state machine is the testable core (L341).** A UI that's a pure function of the stream's parts is testable: feed parts, assert states. The streaming UI's quality is an eval (L343), not a vibe.

## 8. Common Mistakes

- **Rendering when done.** Waiting for the whole stream (L145) — the spinner that kills the feel, and the demo's tell.
- **Fake Stop.** Hiding the text but not aborting the upstream call (L145) — tokens keep billing (L150), and the user's "stop" was a lie.
- **Tool calls invisible.** No pending state (L164) — the pause is unexplained, the model feels random.
- **`length` treated as done.** The truncated answer, normal-looking (L149) — the honesty rule, broken.
- **Markdown flicker, unfixed.** Mid-stream code fences flashing broken — a rendering trade handled badly (or ignored).
- **No errored state.** A mid-stream failure as a blank UI (L168) — the stream died and the user got nothing.

## 9. Best Practices

- **Stream everything a human reads** (L145) — render the parts as they arrive, never wait for the whole.
- **Model the states explicitly** (L161): streaming, tool-running, done, errored — each with a rendering.
- **Show tool progress** (L164): "using X…" → the result, as conversation.
- **Make Stop real** (L145): abort the upstream call, and surface it as a cost control (L150).
- **Handle `length` honestly** (L149): "continued?" — never a silent cut.
- **Handle `error` with recovery** (L168): keep the partial, offer retry.
- **Decide the markdown trade deliberately** — progressive rendering, accepted flicker, or plain-text-until-stable.

## 10. Interview Questions

**Q: What makes a streaming UI good?**
> A: Progress replaces waiting. Text renders incrementally (L161), tool calls show pending → executed (L164), Stop actually aborts the upstream call (L145), and the end states tell the truth — `length` renders "continued?" (L149), `error` keeps the partial and offers recovery (L168). The user never stares at a spinner and never trusts a truncated answer as complete.

**Q: How do you render markdown that's still streaming?**
> A: It's a trade (L151). The markdown is incomplete mid-stream — a code fence is half-open. I either render progressively and accept transient formatting flicker, or render plain text until a safe parse point. The senior answer names the trade and picks deliberately per product — perfect markdown needs the full text; streaming needs incremental.

**Q: Why is a real Stop button important?**
> A: Two reasons. UX — the user must be able to stop a generation they don't want. And cost (L150) — a Stop that only hides the text keeps billing tokens mid-stream (L149). A fake Stop is a hidden cost leak; a real one aborts the upstream call.

**Q: How do the states make the UI honest?**
> A: Every state has a rendering and tells the truth. Streaming shows the answer forming. Tool-running shows why the model paused (L164). Done means done. `length` means "this was cut off — continue?" (L149). Error means "this failed — keep the partial, retry" (L168). A demo treats `length` and `error` as done; a product tells the truth.

## 11. Follow-Up Questions

- How does the streaming UI compose with structured output (L163)?
- How do agent steps render from tool-call parts (L200, L213)?
- What's the markdown trade, and how do you decide (L151)?
- How does cancellation interact with the token budget (L145, L149)?
- How do you test the streaming UI's states (L341)?

## 12. Comparison Table — Spinner vs Streaming UI

| | Spinner-then-render | Streaming UI (this lesson) |
|---|---|---|
| Waiting | invisible | progress (L145) |
| Tool calls | invisible | pending → executed (L164) |
| Stop | none / fake | real abort (L145) |
| Truncation | silent | "continued?" (L149) |
| Failure | blank | recovery + partial (L168) |
| The feel | a loader | a conversation |

The senior read: **the table is the product spec** — the streaming UI is the difference between "the AI is loading" and "the AI is thinking, with me watching."

## 13. Code Example — The Streaming UI, States and All

```jsx
// The streaming UI: parts, states, Stop, and honest end states.
import { useChat } from 'ai/react';

export function Chat() {
  const {
    messages, input, handleInputChange, handleSubmit,
    isLoading, stop, error,          // ← stop (L145) · error state (L168)
  } = useChat();

  // The markdown trade (L151): render incrementally; the message
  // body is the accumulated deltas, parsed at safe points.
  return (
    <div className="chat">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}

      {/* THE STATES — every one has a rendering (L161) */}
      {isLoading && <StreamingIndicator />}         {/* streaming / tool-running */}
      {error && (                                    {/* errored — honest (L168) */}
        <div className="error">
          The stream failed. <button onClick={retry}>Retry</button>
          <button onClick={clearError}>Keep partial</button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        {isLoading ? (
          <button type="button" onClick={stop}>Stop</button>   {/* real abort (L145) */}
        ) : (
          <button type="submit">Send</button>
        )}
      </form>
    </div>
  );
}
```

```text
What the reader must SEE — the states are the design:

  isLoading → StreamingIndicator (text streaming / tool-running)
  error     → recovery, partial kept (L168)
  Stop      → real abort of the upstream call (L145)
  length    → handled in the message renderer as "continued?" (L149)

  The UI is a state machine with a rendering for every state.
```

```narrate
9-11: The SDK's hooks expose the states — including error (L168) and stop (L145).
14-18: Streaming and tool-running render as one live indicator — progress, not a spinner (L164).
19-24: The errored state is honest UX — retry or keep the partial, never a blank UI (L168).
26-33: Stop aborts the upstream call — a real cancellation, and a cost control (L145, L150).
```

> [!TIP]
> The `error` and `stop` lines are the ones that make it a product: **an errored state with recovery, and a Stop that really stops.** Everything else is rendering; those two are honesty and control — the felt-quality of AI UIs.

## 14. Performance Notes

- **The streaming UI is the felt layer of TTFT (L151).** Rendering deltas as they arrive makes the first token *feel* like the start of the answer — the UI is a latency lever, not just a renderer.
- **Incremental markdown costs render passes (L151).** Re-parsing the growing text each delta can be hot; throttle parsing or render plain text between safe points.
- **Real Stop saves tokens (L150).** Aborting upstream stops billing mid-stream (L149) — cancellation is a cost control with a UI face.
- **Tool progress covers execution latency (L164, L151).** The pending state turns a tool round trip into visible progress instead of dead air.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Text appears all at once | Streaming not wired; UI waits for full (L145) | Render parts as they arrive |
| Stop does nothing | Cancellation not aborting upstream (L145) | Wire `stop()` to the abort path |
| Tool pause unexplained | No tool-pending state (L164) | Render the pending → executed states |
| "Continued?" never shows | `length` not handled (L149) | Handle the finish reason in the renderer |
| Blank on failure | No errored state (L168) | Add recovery + partial-keep |

## 16. Quick Revision Notes

- The streaming UI = **progress replaces waiting** — L161's parts, made visible.
- Render **incremental markdown** (a deliberate trade, L151); show **tool progress** (L164).
- **Real Stop** (L145) aborts upstream — a cost control (L150), not just UX.
- **Honest end states**: `length` → "continued?" (L149); `error` → recovery + partial (L168).
- The UI is **a state machine with a rendering for every state** (L161).
- The streaming UI is the **product layer of latency (L145, L151)**.

## 17. Cheat Sheet

```text
STREAMING UI = the stream, made felt (L161 → product)

FOUR JOBS
  render incremental markdown   (the trade, L151)
  show tool progress            pending → executed (L164)
  make Stop real                abort upstream (L145) — a cost control (L150)
  handle end states honestly    length → "continued?" (L149) · error → recover (L168)

THE STATES (every one has a rendering)
  streaming      the answer forming
  tool-running   "using get_stock…" (L164)
  done           the answer stands
  errored        recovery + partial kept (L168)

THE MARKDOWN TRADE (L151)
  progressive + transient flicker   OR   plain text until a safe point
  name it, pick deliberately

RULES
  never render when done — stream it (L145)
  never fake the Stop (L145, L150)
  never treat length or error as "done" (L149, L168)
  the state machine is testable (L341)

INTERVIEW, 4 MOVES
  1 frame    "progress replaces waiting"
  2 rendering "incremental markdown + tool progress (L164)"
  3 honesty  "length → 'continued?' · error → recover (L149, L168)"
  4 control  "real Stop — a cost control (L145, L150)"
```

## 18. Key Takeaways

> [!RECAP]
> - The streaming UI is **the product layer of the stream** — L161's parts and states, made felt
> - It renders **incremental markdown** (a deliberate trade, L151) and **tool progress** (pending → executed, L164)
> - **Stop is real** (L145) — it aborts the upstream call, which makes it a cost control (L150), not just UX
> - The end states are **honest**: `length` renders "continued?" (L149), `error` keeps the partial and offers recovery (L168) — a demo treats both as done
> - The UI is **a state machine with a rendering for every state** (L161) — and that machine is testable (L341)
> - **Progress replaces waiting** — the user never stares at a spinner, never wonders what's happening, and never trusts a truncated answer as complete

## Check your understanding

Answer these without looking back.

1. What are the streaming UI's four jobs?
2. What is the markdown trade, and how do you decide (L151)?
3. How do tool calls render as progress (L164)?
4. Why is a real Stop a cost control (L145, L150)?
5. What does `length` render, and why (L149)?
6. What does the errored state render, and why (L168)?
7. How is the streaming UI the "product layer of latency" (L145)?
8. Why is the state machine testable (L341)?

## A Closing Note — The Feel of the Product

You now hold the layer that makes AI products feel alive: **incremental markdown, tool progress, a real Stop, and honest end states.** It's the difference between "the AI is loading" and "the AI is thinking, with me watching" — and it's the layer the next lessons slot around: structured generation in the stream (L163), the full tool loop (L164), and the state model that holds it all (L165).
