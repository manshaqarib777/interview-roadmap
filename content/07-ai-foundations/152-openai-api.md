# Lesson 152 — The OpenAI API

**Interview importance:** ⭐⭐⭐⭐ — the baseline provider: knowing the OpenAI API's shape (messages, tools, structured output, streaming) is the *reference point* every other provider gets compared against (L156).

Lessons 135–151 built the concepts; the next four lessons are the *providers* that ship them. OpenAI is the baseline — the API whose shape (chat completions, responses, tools, structured outputs, streaming, embeddings) became the industry's mental model. If you know the OpenAI API cold, the other two (L153, L154) are *deltas* on it, and the abstraction (L155) becomes a map rather than a mystery.

The distinction this lesson is built on: a **user** knows "OpenAI is ChatGPT's company". A **solutions architect** knows the API surface — the message roles (L142), the tool loop (L144), the structured-output contract (L143), the streaming deltas (L145), and the pricing/tiering reality (L148, L150) — and can build against it, and design *around* it.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the OpenAI API surface: chat completions / responses, models, tools, structured output, streaming, embeddings
- Build a request end to end: messages, temperature (L139), max_tokens, tools (L144), response_format (L143)
- Handle the response: content, tool_calls, finish_reason (L145), usage
- Explain the pricing reality and tiering (L148, L150), and the API's failure modes (L168)
- Compare OpenAI's shape to the abstraction (L155) and the other providers (L156)

## 1. One-Line Definition

**The OpenAI API is the baseline interface for frontier LLMs: a chat-completions (and newer responses) endpoint that takes a list of role-tagged messages, returns generated text, tool calls, or a structured object, streams the output token by token, and prices input and output separately — the shape most other providers mirror.**

The one-sentence interview answer: *"The OpenAI API is the reference shape: you send `messages` with roles (system/user/assistant/tool), and the response is text, tool calls, or schema-valid JSON. Streaming (L145) returns deltas; tools (L144) return declarations you execute; structured output (L143) constrains the shape; and it prices input and output separately (L150). Know this shape and the other providers are deltas on it."*

## 2. Mental Model

Think of the OpenAI API as **a well-defined POST with a rich response** — the "REST of LLMs" that everything else copies.

```text
   YOU POST                              OPENAI RETURNS
   ┌─────────────────────────┐           ┌─────────────────────────┐
   │ model: "gpt-4o-mini"    │           │ content:  "…"           │
   │ messages: [             │           │ tool_calls: [ … ]       │
   │   {system}, {user}      │   ────▶   │ finish_reason: stop     │
   │ ]                       │           │ usage: {in, out}        │
   │ temperature: 0          │           │                         │
   │ max_tokens: 200         │           │ (or: a stream of deltas │
   │ tools: [ … ]            │           │  when stream: true)     │
   │ response_format: schema │           │                         │
   └─────────────────────────┘           └─────────────────────────┘
```

The mental model is **one endpoint, one request shape, a rich response** — and the response type (text / tool calls / JSON / stream) is *requested*, not discovered. That's the whole API: you declare what you want, and the shape comes back.

## 3. Visual Flow — The OpenAI Call Lifecycle

```text
   your code
   ┌──────────────────────────────────────────────────────┐
   │ 1 · build messages:  system + user (+ history)      │
   │ 2 · set params: model, temperature (L139),           │
   │     max_tokens, tools (L144), response_format (L143) │
   └──────────────────┬───────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────┐
   │ 3 · POST /v1/chat/completions (or /v1/responses)    │
   └──────────────────┬───────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────┐
   │ 4 · the response is ONE of:                          │
   │     · content            → render it (L145)          │
   │     · tool_calls         → execute (L144), loop      │
   │     · schema-valid JSON  → parse it (L143)           │
   │     · stream of deltas   → accumulate (L145)         │
   └──────────────────┬───────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────┐
   │ 5 · read finish_reason (stop/length/tool_calls)      │
   │     and usage (input/output tokens, L149)            │
   └──────────────────────────────────────────────────────┘
```

The lifecycle is the shape of every AI feature: **build → post → one-of-four response types → finish_reason + usage.** Once you've internalised it, every OpenAI feature — chat, tools, agents, extraction — is this lifecycle with different params.

## 4. How It Works — The Endpoints That Matter

- **Chat Completions (`/v1/chat/completions`)** — the classic: `messages` in, `choices[0].message` out. The `message` carries `content`, `tool_calls`, and `role`. This is the shape most of the industry (and L155's abstraction) models itself on.
- **Responses (`/v1/responses`)** — the newer surface: a unified API for chat, tools, structured output, and (increasingly) agents. OpenAI's direction; the abstraction (L155) hides which one you're on.
- **The message roles** (L142): `system` (rules), `developer` (tool-behaviour), `user` (input), `assistant` (previous turns), `tool` (tool results, tied by `tool_call_id`, L144).
- **Structured output (L143)** — `response_format: { type: 'json_schema', json_schema: { name, schema, strict } }`: the provider constrains generation to your schema.
- **Streaming (L145)** — `stream: true` → SSE deltas; each chunk's `choices[0].delta` carries `content` and/or `tool_calls` fragments (L144's reassembly).
- **Tools (L144)** — `tools: [{ type: 'function', function: { name, description, parameters } }]`; the model responds with `tool_calls` you execute.
- **Embeddings (L147)** — a *separate* endpoint (`/v1/embeddings`), cheap, non-streaming, for the retrieval pipeline.
- **Usage** — every response includes `usage` (prompt/completion tokens); that's the ground truth for L149's ledger and L332's tracking.

> [!NOTE]
> **The pricing reality (L148, L150).** OpenAI prices input and output separately, output at 3–5× — and tiers are 10–50× apart (small vs flagship). The "same API shape" does not mean "same price": the abstraction (L155) normalises the *calls*, never the *bills*. Cost stays a per-provider model (L150).

## 5. Real Project Usage

- **The baseline for every AI feature.** Chat, extraction (L143), tools (L144), agents (L200) — all of them are the lifecycle above with different params.
- **The reference for the abstraction (L155).** When you design a provider-agnostic layer, the OpenAI shape is the *lingua franca*: messages, roles, tool calls, deltas, finish reasons. The abstraction maps the others *onto* it, not away from it.
- **The eval baseline (L343).** OpenAI models are the standard comparison point — "the small OpenAI model vs the small Anthropic model on my golden set" is the normal first eval.
- **The cost baseline (L150).** OpenAI's pricing is the number other providers are quoted against ("cheaper than OpenAI" / "quality of OpenAI, half the price").
- **The ecosystem baseline.** The OpenAI SDK, the Vercel AI SDK (L160), LangChain (L214) — all treat OpenAI as the default first-class citizen, which is why knowing the shape unlocks the tooling.

The through-line: **OpenAI is not just a provider — it's the API *grammar* the industry speaks.** Learning it is learning the vocabulary that makes L153, L154, and L155 legible.

## 6. Interview Explanation

Say it in four moves:

1. **The shape.** "The OpenAI API is the reference: you POST role-tagged messages, and the response is text, tool calls, schema-valid JSON, or a stream of deltas — depending on what you asked for."
2. **The lifecycle.** "Build messages, set params (temperature, max_tokens, tools, response_format), post, then handle one of the four response types, and read finish_reason and usage."
3. **The levers.** "Tools (L144) return declarations I execute; structured output (L143) constrains the shape; streaming (L145) returns deltas; usage (L149) is the cost ledger."
4. **The role.** "It's the industry baseline — the abstraction (L155) maps other providers onto its shape, and the pricing (L150) is what everyone is compared against."

## 7. Senior-Level Insights

- **The API shape is the industry's mental model (L155).** The abstraction layer you build (or adopt) is *an OpenAI-shaped interface over everything else*. Knowing the base shape cold makes the abstraction a map, not a mystery.
- **The four response types are a state machine.** Content → render; tool_calls → execute and loop (L144); JSON → parse (L143); stream → accumulate (L145). A senior implementation treats the response type as a branch, not a surprise.
- **`finish_reason` is a contract (L145).** `stop` vs `length` vs `tool_calls` changes what your code does next. Handling it is the difference between a truncated answer that looks normal and a designed "continue?" path.
- **Usage is the ground truth for cost (L149, L332).** The response's token counts are what you actually paid; logging them is the measurement half of L150's discipline.
- **The API moves; the concepts don't.** Chat Completions → Responses, model versions, pricing changes — the *shape* evolves, but the concepts (roles, tools, schema, deltas) are stable. The senior skill is holding the concepts, not the endpoint names.

## 8. Common Mistakes

- **Not branching on response type.** Treating every response as `content` breaks tool calls (L144) and structured output (L143) silently.
- **Ignoring `finish_reason`.** A `length` truncation (L145) rendered as a normal answer — the silent cut that looks complete.
- **Forgetting `usage`.** Not logging the actual tokens (L332) — the measurement half of the cost discipline (L150).
- **Hardcoding the model name everywhere (L155).** Every callsite names `gpt-4o-mini` — a model swap becomes a refactor and a re-eval (L148).
- **Not validating structured output (L143).** Trusting the response string instead of parsing + validating at the boundary (L143's rule).
- **Confusing the endpoint versions.** Mixing Chat Completions and Responses shapes in one codebase — the abstraction (L155) exists precisely to prevent this.

## 9. Best Practices

- **Branch on the response type** — content, tool_calls, JSON, or stream — as a designed state machine (L144, L145).
- **Handle `finish_reason` explicitly** — `length` is a "continue?" path, not a silent bug (L145).
- **Log `usage` on every response** (L332) — it's the cost ledger (L150).
- **Keep the model choice behind the abstraction (L155)** — config, not code.
- **Validate structured output at the boundary (L143)** — parse + check, never trust the string.
- **Pin the model version** — a moving model name is a moving eval target (L148, L341).

## 10. Interview Questions

**Q: Describe the OpenAI API's shape.**
> A: One core endpoint taking role-tagged messages — system, user, assistant, tool — plus params for model, temperature (L139), max_tokens, tools (L144), and structured output (L143). The response is content, tool calls, schema-valid JSON, or a stream of deltas (L145), plus a finish_reason and usage. It's the shape most of the industry mirrors.

**Q: How do tools work in the OpenAI API?**
> A: You declare `tools` with a name, description, and JSON schema. The model responds with `tool_calls` — declarations, not executions. My code executes them, and appends the result as a `tool` message tied to the `tool_call_id`, then calls again so the model continues with the result in context (L144).

**Q: How does structured output work?**
> A: You pass `response_format` with a JSON schema. The provider constrains generation so the output is valid against it — malformed JSON is impossible (L143). It's the difference between hoping the model returns JSON and guaranteeing it.

**Q: How do you handle streaming?**
> A: `stream: true` returns an SSE stream of deltas. Each chunk's delta carries content and/or tool-call fragments (L144). I accumulate content for rendering and reassemble tool fragments before executing them. The stream ends with a finish_reason (L145).

## 11. Follow-Up Questions

- What's the difference between Chat Completions and the Responses API?
- How does the OpenAI tool loop differ from Anthropic's (L153)?
- What does `finish_reason: length` mean, and how do you handle it (L145)?
- How does OpenAI's pricing compare to the other providers (L156)?
- How would you abstract OpenAI behind an interface (L155)?

## 12. Comparison Table — The OpenAI Surface

| Capability | OpenAI API | Where it fits |
|---|---|---|
| Chat | `chat.completions` / `responses` | the core (L135) |
| Roles | system / developer / user / assistant / tool | L142 |
| Tools | `tools` → `tool_calls` → `tool` message | L144 |
| Structured output | `response_format: json_schema` | L143 |
| Streaming | `stream: true` → SSE deltas | L145 |
| Embeddings | separate `/embeddings` endpoint | L147 |
| Usage | `usage` on every response | L149, L332 |
| Pricing | input/output split, 3–5× output | L150 |

The senior read: **the table is the baseline against which L153, L154, and L156 are drawn** — every other provider is "like this, except…".

## 13. Code Example — One OpenAI Call, Every Capability

```js
// The OpenAI baseline, end to end: structured output + tool + stream in one shape.
const { OpenAI } = require('openai');
const openai = new OpenAI();

// A tool the model may declare (L144).
const tools = [{
  type: 'function',
  function: {
    name: 'get_stock',
    description: 'Current price of a US ticker.',
    parameters: {
      type: 'object',
      properties: { ticker: { type: 'string' } },
      required: ['ticker'],
    },
  },
}];

async function ask(question) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',                       // tier: config, not code (L155)
    messages: [
      { role: 'system', content: 'Answer concisely. Use tools when needed.' },
      { role: 'user', content: question },
    ],
    temperature: 0.3,                            // sampling knob (L139)
    tools,                                       // the model MAY declare (L144)
    max_tokens: 300,                             // the output budget (L149)
  });

  const { message, finish_reason } = res.choices[0];
  const usage = res.usage;                       // ← the cost ledger (L149, L332)

  if (message.tool_calls) {
    // branch: execute and loop (L144)
    const call = message.tool_calls[0];
    const { ticker } = JSON.parse(call.function.arguments);
    const price = await fetchPrice(ticker);      // ← YOUR execution
    return `${ticker}: $${price}`;
  }
  return message.content;
}
```

```text
What the reader must SEE — the shape, in one file:

  messages (roles, L142) → tools (L144) → response
  branch: content OR tool_calls
  read: finish_reason (L145) + usage (L149)
  model name = config, not hardcoded (L155)
```

```narrate
3-15: The tool spec — schema + description, the model's "what I may call" contract (L144).
17-25: The request shape: roles, sampling, tools, output budget — all the knobs from L139-L149.
29-34: The response branches on type — tool_calls get executed by MY code, not the model.
35: The finish_reason and usage are read, not ignored — truncation and cost are designed-for.
```

> [!TIP]
> This one file is the OpenAI baseline everything else is a delta on (L156). Build it, and L153 (Anthropic) and L154 (Gemini) become "same shape, different dialects" — which is exactly what L155's abstraction formalises.

## 14. Performance Notes

- **The request shape is cache-friendly (L171):** a byte-stable system prompt is a cache key; prompt caching drops TTFT and cost for repeated prefixes (L151, L150).
- **Structured output (L143) can add latency** on complex schemas — constrained sampling costs per token; keep schemas flat (L151).
- **Streaming (L145) is the felt-latency lever** — the deltas start in TTFT; the rest pour in.
- **Pricing tiers are the cost lever (L150):** `gpt-4o-mini` vs `gpt-4o` is 10–50×; route by task (L157).
- **Usage is the measurement (L332):** log `res.usage` per call — the per-request ledger (L149) feeds the monthly model (L150).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Tool call never fires | Description too vague, or `tools` not sent | Rewrite the description (L142); check the request |
| Malformed tool args | Fragments parsed mid-stream (L145) | Buffer until the call is complete (L144) |
| JSON isn't what you asked | `response_format` missing or loose | Add the schema; `strict: true` (L143) |
| Answer cuts off | `max_tokens` too low → `length` | Raise budget; handle `length` (L145) |
| Cost higher than expected | Flagship default, no tiering | Route by tier (L157); log usage (L332) |

## 16. Quick Revision Notes

- OpenAI = **the baseline shape**: messages in, one-of-four response types out (content / tools / JSON / stream).
- Roles: **system / developer / user / assistant / tool** (L142, L144).
- **Tools** → `tool_calls` → execute → `tool` message → loop (L144).
- **Structured output** via `response_format` → schema-valid by construction (L143).
- **Streaming** via `stream: true` → SSE deltas; reassemble tool fragments (L145).
- **Usage** = the cost ledger (L149, L332); **finish_reason** = the truncation contract (L145).

## 17. Cheat Sheet

```text
OPENAI API = the industry baseline shape

REQUEST
  model         (config, not code — L155)
  messages      [system|developer|user|assistant|tool] (L142)
  temperature   sampling knob (L139)
  max_tokens    output budget (L149)
  tools         declarations the model MAY use (L144)
  response_format  json_schema → structured (L143)
  stream: true  → SSE deltas (L145)

RESPONSE — one of four
  content       → render
  tool_calls    → execute (L144), append as tool message, loop
  JSON          → parse + validate (L143)
  stream        → accumulate deltas

ALWAYS READ
  finish_reason  stop | length | tool_calls   (L145)
  usage          input/output tokens          (L149, L332)

RULES
  branch on response type, never assume content
  validate structured output at the boundary (L143)
  log usage per call (L332)
  model choice behind the abstraction (L155)

INTERVIEW, 4 MOVES
  1 shape   "role-tagged messages in, 4 response types out"
  2 lifecycle "build → post → branch → finish_reason + usage"
  3 levers  "tools, structured output, streaming, usage"
  4 role    "the baseline everyone is a delta on (L156)"
```

## 18. Key Takeaways

> [!RECAP]
> - The OpenAI API is the **industry baseline shape**: role-tagged messages in; content, tool calls, schema-valid JSON, or a stream out (L143–L145)
> - The lifecycle is **build → post → branch on response type → read finish_reason + usage**
> - **Tools** return declarations you execute (L144); **structured output** constrains the shape (L143); **streaming** returns deltas (L145)
> - **Usage is the cost ledger** (L149, L332) and **finish_reason is the truncation contract** (L145) — both read, never ignored
> - The model choice is **config behind the abstraction** (L155), never hardcoded
> - Knowing this shape cold makes the other providers (L153, L154) and the abstraction (L155) **deltas on a known baseline**, not mysteries

## Check your understanding

Answer these without looking back.

1. Draw the OpenAI request and list the four response types.
2. What are the message roles, and what does each do (L142)?
3. How does the tool loop work — who declares, who executes (L144)?
4. What does `response_format` guarantee, and what does it not (L143)?
5. Why must you read `finish_reason` and `usage` on every response?
6. How does streaming change the response shape (L145)?
7. Why is the model name a config choice, not code (L155)?
8. What makes OpenAI the "baseline" the other providers are compared against?

## A Closing Note — The Grammar You Already Know

You now hold the API grammar the whole industry speaks: **messages in, one-of-four response types out, finish_reason and usage read, model as config.** Everything in the rest of this module — Anthropic (L153), Gemini (L154), the abstraction (L155), the comparison (L156) — is a delta on this baseline. And everything in the modules after it (the Vercel AI SDK, L160; agents, L200; RAG, L174) speaks this same grammar.

Next: Anthropic's Messages API — the same concepts, its own dialect, and the long-context and tooling strengths that make it a distinct choice.
