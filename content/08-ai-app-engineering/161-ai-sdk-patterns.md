# Lesson 161 — AI SDK Patterns: Streams, Parts, Tool Calls

**Interview importance:** ⭐⭐⭐⭐ — "how does the streaming UI actually work?" is the state-machine question; the answer is the *parts* — text, tool calls, finish reasons — and the UI states around them.

Lesson 160 gave you the SDK; this lesson is the **patterns it speaks** — the stream as a sequence of *parts* (text deltas, tool-call parts, finish reasons, L145), and the UI state machine around them (streaming, tool-pending, tool-executed, done, errored). This is the layer between `streamText` and the felt-quality (L162): understanding the parts is what lets you render tool progress (L164), handle truncation (L145), and build a UI that isn't a text box with a spinner.

The distinction this lesson is built on: a **demo** renders `text`. A **solutions architect** treats the stream as a *typed sequence of parts* and the UI as a *state machine*: text parts append, tool-call parts trigger execution and render as pending → executed, finish reasons end the stream with meaning (`stop` vs `length` vs `tool_calls`), and errors are states, not crashes.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the stream as a sequence of parts: text, tool-call, tool-result, finish reason (L145)
- Draw the UI state machine: idle → streaming → tool-running → done / errored (L162)
- Handle tool-call parts: render pending, execute, show the result back in context (L164)
- Handle finish reasons deliberately: stop, length, tool_calls (L145)
- Use the SDK's `Message.parts` model to build a parts-aware UI

## 1. One-Line Definition

**The AI SDK patterns are the conventions of the stream — a typed sequence of parts (text, tool-call, tool-result, finish reason) delivered over the wire format (L145) — and the UI state machine that renders them (streaming, tool-pending, tool-executed, done, errored).**

The one-sentence interview answer: *"The stream is a sequence of parts, not a string: text parts append, tool-call parts declare a tool (L144), tool-result parts carry it back, and a finish reason ends it (L145). The UI is a state machine over those parts — streaming, tool-pending, tool-executed, done, errored. Render the parts, handle the reasons, and the felt-quality (L162) and the tool loop (L164) both fall out."*

## 2. Mental Model

Think of the stream as **a typed conversation, delivered one sentence at a time** — where the "sentences" are parts, and each part has a type that tells the UI what to do.

```text
   the stream, as typed sentences:

   {type:"text",        delta:"The price of AAPL"}     → append to the answer
   {type:"text",        delta:" is $212.40."}          → append
   {type:"tool-call",   name:"get_stock", args:{…}}    → show "checking…", execute (L164)
   {type:"tool-result", name:"get_stock", result:…}    → show the result
   {type:"text",        delta:"Up 1.2% today."}        → append
   {type:"finish",      reason:"stop"}                 → done — stop rendering
```

The mental model is **type-driven rendering**: the UI doesn't render "the response" — it renders *parts*, and each part type has a rendering rule. That's the whole pattern.

## 3. Visual Flow — The Stream, the Parts, and the States

```text
   CLIENT state machine (L162)          THE STREAM (parts, L145)
   ┌────────────────────────┐
   │ idle                   │          user sends
   │   │                   │
   │   ▼                   │
   │ streaming ────────────┼────────── {text:"Let me check"}
   │   │                   │          {text:" the current"}
   │   │                   │          {text:" price."}
   │   ▼                   │
   │ tool-pending ─────────┼────────── {tool-call: get_stock, args}
   │   │  execute (L164)   │              │
   │   ▼                   │              ▼  your server runs it
   │ tool-executed ────────┼────────── {tool-result: $212.40}
   │   │                   │          {text:"Up 1.2% today."}
   │   ▼                   │
   │ done ─────────────────┼────────── {finish: stop}
   │ (or: errored, L168)   │
   └────────────────────────┘
```

The picture is the whole lesson: **the stream supplies typed parts; the UI is a state machine over them.** Streaming (L145) and tool calling (L164) are not separate features — they're the same stream, different part types.

## 4. How It Works — The Parts, the States, the Reasons

### The parts (what the stream carries)

| Part | Carries | The UI does |
|---|---|---|
| `text` | a text delta (L145) | append to the streaming answer |
| `tool-call` | name + args (L144) | show "using tool…", execute server-side (L164) |
| `tool-result` | the tool's output | show the result, keep it in context |
| `finish` | the reason | end the stream, handle the reason |

### The states (what the UI is in)

- **streaming** — text parts are landing; render them as they arrive (L162).
- **tool-pending** — a tool-call part arrived; show progress (L164), execute.
- **tool-executed** — the result is back; show it, and keep streaming.
- **done** — the finish part arrived; stop, and handle the reason.
- **errored** — the stream failed mid-way (L168); show recovery, not a crash.

### The finish reasons (how the stream ends, L145)

- `stop` — natural end. Done.
- `length` — hit `max_tokens` (L149): *truncated*. Handle it — "continued" or "give me more", never a silent cut.
- `tool_calls` — the model wants more tools: execute (L164) and continue the loop.
- `error` — the provider failed (L168): recovery path, not a blank UI.

> [!NOTE]
> **The reason is a contract (L145).** `stop`, `length`, and `tool_calls` mean three different next-actions. A UI that treats all three as "done" silently breaks truncation handling and tool loops — the two most common AI-UI bugs. Handle the reasons explicitly and both disappear.

## 5. Real Project Usage

- **Chat with tools (L164).** The assistant streams text, declares a tool, shows "checking the database…", gets the result, and continues — all through the parts.
- **Truncation-aware UI.** The `length` reason renders "the answer was cut off — continue?" instead of a normal-looking half-answer (L145, L149).
- **Agent-style steps (L200).** Each tool-call part is a visible step; the UI shows the agent's progress as a sequence of executed tools — the observability (L213) starts here.
- **Structured output in the stream (L163).** `streamObject` emits object parts; the UI renders a typed result as it forms, validated by the schema (L143).
- **Cancellation (L145).** The user stops the stream; the UI aborts, and the partial parts are kept or discarded deliberately.

The through-line: **parts are the universal stream vocabulary** — text, tools, objects, reasons — and the patterns of rendering them are what make an AI UI an *application* rather than a terminal.

## 6. Interview Explanation

Say it in four moves:

1. **The frame.** "The stream is a sequence of typed parts, not a string — text, tool-call, tool-result, finish reason (L145)."
2. **The state machine.** "The UI is a state machine over them: streaming, tool-pending, tool-executed, done, errored (L162)."
3. **The reasons.** "The finish reason is a contract: `stop` is done, `length` is truncated (handle it, L149), `tool_calls` means execute and continue the loop (L164)."
4. **The payoff.** "Render the parts, handle the reasons, and the felt-quality (L162) and the tool loop (L164) both fall out of the same stream."

## 7. Senior-Level Insights

- **The parts model is the *interface* of the AI UI (L145).** Text, tools, objects, reasons — a typed stream means the UI is a renderer over a contract, not a parser over a string. That's the architecture difference.
- **Tool-call parts make execution *visible* (L164, L213).** The pending → executed states are the user's window into the tool loop — and the seed of agent observability (L213). A UI that shows tool progress is a UI that explains itself.
- **The finish reason is where the product's honesty lives (L145).** Handling `length` and `error` as first-class states is what separates a product that tells the truth about its limits from one that silently truncates.
- **The patterns compose with structured output (L163).** Object parts + schema validation + typed rendering is the same parts model, aimed at data instead of prose — one stream vocabulary, two products.
- **The state machine is testable (L341).** A parts-driven UI is a pure function of the stream: feed it parts, assert the states. That's the testing boundary of the whole UI layer.

## 8. Common Mistakes

- **Rendering `text` only.** Tool-call parts ignored (L164) — the tool loop happens invisibly or not at all.
- **Treating all finish reasons as "done".** `length` silently truncates (L145); `tool_calls` breaks the loop (L164).
- **State in a string, not a machine.** "Is it loading?" as a boolean instead of streaming/tool-pending/done states (L162, L165).
- **Executing tools client-side.** The tool-call part executed in the client (L172, L315) — the key and privileges leak.
- **No errored state.** A mid-stream failure (L168) as a crash instead of a recovery state.
- **Buffering the parts.** Collecting the whole stream before rendering (L145) — the felt-quality, destroyed.

## 9. Best Practices

- **Render `messages[i].parts`, not `content`** — the parts are the contract (L145).
- **Model the UI as a state machine** — streaming, tool-pending, tool-executed, done, errored (L162).
- **Handle the finish reasons explicitly** — `stop` / `length` / `tool_calls` / `error` (L145, L149).
- **Execute tools server-side, always** (L164, L315) — the part triggers; your route runs.
- **Show tool progress** — pending → executed is the user's window into the loop (L213).
- **Add an errored state with recovery** (L168) — never a blank UI on a mid-stream failure.

## 10. Interview Questions

**Q: What's in the stream besides text?**
> A: Typed parts (L145): text deltas, tool-call parts (name + args, L144), tool-result parts, and a finish reason. The stream is a sequence of parts, not a string — and the UI renders each part type deliberately.

**Q: How do you handle a tool-call part in the UI?**
> A: Three states (L164). The part arrives → render "using tool…" (tool-pending). My server route executes it — never the client (L315). The result comes back as a tool-result part → render it (tool-executed), and the stream continues. The pending → executed states are the user's window into the loop.

**Q: Why does the finish reason matter?**
> A: It's a contract (L145): `stop` means done, `length` means the answer hit `max_tokens` and was truncated (L149) — I render "continued?" not a silent cut — and `tool_calls` means execute and continue the loop (L164). Treating all three as "done" breaks truncation handling and tool loops.

**Q: How is this a state machine, not a loading flag?**
> A: A boolean "loading" can't express the states (L162, L165): streaming (text landing), tool-pending (executing), tool-executed (result shown), done, errored. The UI is a state machine over the parts — each part type transitions a state, and each state has a rendering rule.

## 11. Follow-Up Questions

- How do tool-result parts stay tied to their tool-call (L144)?
- How does `streamObject` emit parts differently (L163)?
- How do you render agent steps from tool-call parts (L200, L213)?
- What happens to the parts when the user cancels (L145)?
- How do you test a parts-driven UI (L341)?

## 12. Comparison Table — Parts vs a Plain String

| | Plain string response | Parts stream (L145) |
|---|---|---|
| Text | the whole thing | text deltas, appended |
| Tool calls | absent / embedded | first-class tool-call parts (L164) |
| Tool results | absent | tool-result parts, tied by id (L144) |
| Finish | absent | finish reason: stop / length / tool_calls |
| UI state | loading boolean | a state machine (L162) |
| Failure | crash / blank | errored state (L168) |

The senior read: **the parts model is the difference between rendering an answer and rendering a process** — and tools, agents, and structured output all need the process.

## 13. Code Example — Rendering the Parts

```jsx
// A parts-aware UI: render the stream as typed parts (L145, L164).
import { useChat } from 'ai/react';

function AssistantMessage({ message }) {
  // message.parts — the typed stream (L145). Each part has a render rule.
  return message.parts.map((part, i) => {
    switch (part.type) {
      case 'text':
        return <p key={i}>{part.text}</p>;              // append the delta (L162)

      case 'tool-call':                                 // the model declared (L164)
        return (
          <div key={i} className="tool-pending">
            Using {part.toolName}…                       // ← visible progress
          </div>
        );

      case 'tool-result':                               // your server ran it
        return (
          <div key={i} className="tool-result">
            {part.toolName}: {JSON.stringify(part.result)}
          </div>
        );

      default:
        return null;
    }
  });
}

export function Chat() {
  const { messages, input, handleSubmit } = useChat();
  // Finish reason handling (L145): 'length' → show "continued?" (L149).
  return (
    <div>
      {messages.map((m) => (
        <AssistantMessage key={m.id} message={m} />
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

```text
What the reader must SEE — the renderer is a switch over parts:

  text         → append (L162)
  tool-call    → "Using X…" — pending, visible (L164)
  tool-result  → show the result, tied to the call

  The UI is a renderer over a typed contract — not a parser
  over a string. That's the whole pattern.
```

```narrate
6-8: Text parts append — the streaming answer (L162).
10-15: Tool-call parts render as visible progress — pending state (L164).
16-21: Tool-result parts show the executed output — executed state.
24-28: The state machine runs over the parts; finish reasons handled separately (L145).
```

> [!TIP]
> The switch over `part.type` is the entire pattern in miniature: **each part type has a render rule, and the UI is a state machine over them.** Add `finish` handling (L145) and an errored state (L168) and you have a production AI UI.

## 14. Performance Notes

- **The parts model preserves streaming (L145).** Each part renders as it arrives — TTFT stays felt-fast; the UI never waits for the whole stream.
- **Tool-call execution adds a round trip (L164, L151).** The pending state covers the execution latency — visible progress, not dead air.
- **Rendering parts is cheap** — a switch over typed objects; the cost is the provider's, not the UI's.
- **Cancellation (L145) is a first-class state** — aborting the stream stops the parts; the partial is kept or discarded deliberately (L162).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Tool results never show | Tool-call parts not rendered (L164) | Render `parts`, not just text |
| Answers silently truncated | `length` treated as done (L145, L149) | Handle the finish reason; raise budget |
| Tools execute client-side | Tool execution in the component (L315) | Move execution to the server route |
| UI stuck "loading" | No distinct tool-pending state (L162) | Model the states; render progress |
| Mid-stream crash, blank UI | No errored state (L168) | Add recovery; keep the partial |

## 16. Quick Revision Notes

- The stream = **a sequence of typed parts** (text, tool-call, tool-result, finish) — not a string (L145).
- The UI = **a state machine** over the parts: streaming, tool-pending, tool-executed, done, errored (L162).
- **Finish reasons are a contract**: `stop` / `length` (truncated, L149) / `tool_calls` (continue, L164) / `error` (L168).
- **Tool execution is server-side** (L164, L315) — the part triggers; your route runs.
- **Parts make tools and agents visible** (L213) — the pending → executed states are the user's window.
- The pattern is **testable** — a renderer over a typed contract (L341).

## 17. Cheat Sheet

```text
AI SDK PATTERNS = the stream as parts, the UI as states

THE PARTS (L145)
  text          delta → append (L162)
  tool-call     name + args → pending, execute server-side (L164)
  tool-result   output → executed, tied to the call (L144)
  finish        reason → end the stream

THE STATES (L162)
  streaming · tool-pending · tool-executed · done · errored (L168)

THE FINISH REASONS (L145)
  stop         natural end
  length       truncated → "continued?" (L149)
  tool_calls   execute + continue the loop (L164)
  error        recovery path (L168)

RULES
  render parts, never just text
  execute tools server-side, always (L315)
  handle every finish reason deliberately
  model the UI as a state machine, not a loading flag
  the parts model is testable (L341)

INTERVIEW, 4 MOVES
  1 frame    "typed parts, not a string (L145)"
  2 states   "streaming · tool-pending · done · errored"
  3 reasons  "stop / length / tool_calls / error — a contract"
  4 payoff   "felt-quality (L162) + tool loop (L164) from one stream"
```

## 18. Key Takeaways

> [!RECAP]
> - The stream is **a sequence of typed parts** — text, tool-call, tool-result, finish reason (L145) — not a string
> - The UI is **a state machine over the parts**: streaming, tool-pending, tool-executed, done, errored (L162)
> - **Finish reasons are a contract**: `stop` (done), `length` (truncated — handle it, L149), `tool_calls` (continue the loop, L164), `error` (recover, L168)
> - **Tool execution is server-side, always** (L164, L315) — the part triggers; your route runs
> - **Parts make the process visible** — pending → executed is the user's window into the tool loop, and the seed of agent observability (L213)
> - Render the parts, handle the reasons, and **the felt-quality (L162) and the tool loop (L164) both fall out of the same stream**

## Check your understanding

Answer these without looking back.

1. Name the part types in the stream, and what each one carries.
2. Draw the UI state machine and its transitions.
3. What does each finish reason mean, and what's the next action (L145)?
4. Why must tool execution be server-side (L315)?
5. How do you render a tool-call part as pending → executed (L164)?
6. What's wrong with a boolean "loading" flag (L162, L165)?
7. How do the parts compose with structured output (L163)?
8. Why is a parts-driven UI testable (L341)?

## A Closing Note — The Vocabulary of the Stream

You now hold the vocabulary every AI UI speaks: **typed parts, a state machine, and finish reasons as a contract.** It's the layer that makes streaming (L145) and tool calling (L164) one mechanism, and it's what the next lesson builds into the felt-quality itself — the streaming UI (L162), where the parts become the product's feel.
