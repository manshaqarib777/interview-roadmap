# Lesson 153 — The Anthropic API

**Interview importance:** ⭐⭐⭐ — the second frontier provider; knowing it as a *delta on the OpenAI baseline* (L152) is what makes provider choice (L156) an architecture decision.

Lesson 152 established the baseline shape: messages in, one-of-four response types out. The Anthropic API is **the same concepts in its own dialect** — the Messages API, system prompts as a top-level parameter, tool use with `input_schema`, extended thinking, and its own pricing (L150). Learn it as a *delta on the baseline*, and the comparison lesson (L156) becomes a table, not a mystery.

The distinction this lesson is built on: a **fan** knows "Anthropic makes Claude". A **solutions architect** knows the API surface — system as a parameter, `tool_use`/`tool_result` blocks, the long-context and extended-thinking strengths, and where its dialect differs from L152's — and can design against it, and *for* it.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the Anthropic API surface: Messages API, system parameter, tool use blocks, extended thinking
- Build a request end to end: system, messages, max_tokens, tools (L144), streaming (L145)
- Handle the response: content blocks, `tool_use`/`tool_result`, stop_reason, usage
- Explain the differences from the OpenAI baseline (L152) — and what maps 1:1
- Compare Anthropic to OpenAI and Gemini on the axes that matter (L156)

## 1. One-Line Definition

**The Anthropic API is the Messages endpoint: a request with a separate system prompt, a list of user/assistant messages, and optional tools and extended thinking — returning content blocks that can be text, tool-use declarations, or thinking, with its own stop reasons and usage — the same concepts as the OpenAI baseline (L152) in a distinct dialect.**

The one-sentence interview answer: *"Anthropic's Messages API is the same shape as the baseline (L152) with its own dialect: the system prompt is a top-level parameter; the response is a list of content blocks — text, `tool_use`, `thinking`, or `tool_result`; tools are declared with an `input_schema`; and the stop reason plays the role of OpenAI's finish_reason. The concepts map 1:1 — roles, tools, streaming, structured output — the endpoints differ."*

## 2. Mental Model

Think of the Anthropic API as **the same engine, a different dashboard.** The concepts are identical to L152 — messages, roles, tools, streaming, structured output, usage — but the controls are arranged differently: the system prompt has its own dial, the response comes back as named blocks instead of one string, and thinking is a first-class block.

```text
   OpenAI baseline (L152)              Anthropic dialect (this lesson)
   ┌─────────────────────────┐        ┌─────────────────────────┐
   │ messages: [             │        │ system: "…"             │  ← its own dial
   │   {system}, {user}      │        │ messages: [{user}, …]   │
   │ ]                       │        │ max_tokens: 300         │
   │ tools: [ {function} ]   │        │ tools: [{input_schema}] │
   │ response: content OR    │        │ response: content       │
   │   tool_calls            │        │   blocks: [text],       │
   └─────────────────────────┘        │   [tool_use], [thinking]│
                                      └─────────────────────────┘
        same concepts ──── the dialect differs ──── same concepts
```

The mental model for interviews: **know the baseline (L152), and Anthropic is "like that, except"** — the differences are the lesson, and they're mostly in the *dialect*, not the concepts.

## 3. Visual Flow — The Anthropic Request → Response

```text
   your code
   ┌──────────────────────────────────────────────────────┐
   │ 1 · build:  system (top-level) + messages            │
   │     + max_tokens (REQUIRED) + tools (L144)           │
   │     + thinking (extended thinking, optional)         │
   └──────────────────┬───────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────┐
   │ 2 · POST /v1/messages                                │
   └──────────────────┬───────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────┐
   │ 3 · response: content is a LIST of blocks            │
   │     [{type:"text", text:"…"},                        │
   │      {type:"tool_use", id, name, input},             │
   │      {type:"thinking", thinking:"…"}]                │
   └──────────────────┬───────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────┐
   │ 4 · you:  render text · execute tool_use (L144)      │
   │     · append tool_result block · loop                │
   │     · read stop_reason (end_turn/tool_use/… )        │
   │     · read usage (input/output tokens, L149)         │
   └──────────────────────────────────────────────────────┘
```

The lifecycle is the same as L152 — **build → post → branch on blocks → loop on tool_use → read stop_reason + usage** — with blocks replacing the single response string.

## 4. How It Works — The Anthropic Dialect

- **The system prompt is a top-level parameter** (`system: "…"`), not a message role. It's still the rules-and-role layer (L142) and still the cache key (L171) — but it lives in its own field. A stable system parameter is byte-stable → prompt caching.
- **`max_tokens` is required.** Anthropic does not default it; forgetting it is an error. The output budget (L149) is a *mandatory* line, which makes the discipline (L149) enforced by the API.
- **Content comes back as blocks**, not one string. Text, `tool_use` (with `id`, `name`, `input`), and `thinking` (extended thinking) are separate, typed blocks — the branch-on-response-type discipline (L152) is explicit here.
- **The tool loop (L144)** uses `tool_use` blocks and `tool_result` blocks: the model emits a `tool_use` block, you execute, and append a `tool_result` block with the matching `tool_use_id` — then call again.
- **Extended thinking** is a first-class feature: a `thinking` block before the answer, used for hard reasoning (L140's desert). It costs more output tokens (L150) and adds latency (L151) — it's a *deliberate* tool for the hard tail, not a default (L157).
- **Structured output** maps to L143 via the tool schema: declare a tool whose `input_schema` is your JSON schema, and the model's `tool_use.input` is your structured output. (Anthropic also has a native structured-output mode on some models.)
- **`stop_reason`** plays the role of OpenAI's `finish_reason`: `end_turn` (done), `tool_use` (execute and loop), `max_tokens` (truncated, L145), `stop_sequence` (you stopped it).

> [!NOTE]
> **The honest delta.** For most features, OpenAI (L152) and Anthropic are interchangeable behind the abstraction (L155) — same concepts, same latencies, same cost *shape* (L150). The real differentiators are: Anthropic's long-context strength, first-class extended thinking, and the `input_schema`-as-structured-output pattern; OpenAI's broader API surface and embeddings (L147). L156 turns this into a decision table.

## 5. Real Project Usage

- **Long-context tasks.** Anthropic's long-context handling is a genuine strength — big-document analysis (L138), codebase-scale context, long-form agent transcripts (L200).
- **Hard reasoning via extended thinking.** When the flagship tier is warranted (L148, L157), extended thinking is the tool for novel multi-step reasoning (L140's desert) — budget the extra output tokens (L150).
- **Structured output via tool schema (L143).** Declaring a tool whose `input_schema` is your JSON schema is the Anthropic-structured-output pattern — the `tool_use.input` is your typed record.
- **Tool-heavy agents (L144, L200).** The block-based loop — `tool_use` in, `tool_result` back — is explicit and observable, which suits agent design (L213).
- **The second provider in a multi-provider stack (L155, L156).** Routing between OpenAI and Anthropic by task, cost, or eval result — the abstraction makes it a config change.

The through-line: **Anthropic is the "same grammar, different dialect" provider** — and the senior skill is knowing the dialect differences well enough to route (L156) without rewriting.

## 6. Interview Explanation

Say it in four moves:

1. **The frame.** "Anthropic's Messages API is the same concepts as the OpenAI baseline (L152) in a different dialect."
2. **The dialect.** "System prompt is a top-level parameter; content comes back as blocks — text, tool_use, thinking; tools use an input_schema; stop_reason plays the role of finish_reason."
3. **The loop.** "The model emits a tool_use block, I execute it, append a tool_result block with the matching id, and call again (L144)."
4. **The differentiators.** "Its strengths are long context, first-class extended thinking, and input_schema-as-structured-output (L143). The comparison table (L156) is where I'd actually choose between it and OpenAI."

## 7. Senior-Level Insights

- **The dialect differences are *mapping* knowledge, not new concepts (L155).** A well-built abstraction means swapping OpenAI ↔ Anthropic is config + re-eval (L148, L341) — the senior skill is knowing the *concepts* so the dialect is trivial.
- **`max_tokens` being required is the API enforcing L149.** Anthropic makes the output budget (L149) a mandatory line — a useful nudge that the reserve is non-negotiable.
- **Extended thinking is a *costed* tool (L150, L151).** The thinking block is extra output tokens and latency — route it to the hard tail (L157), never the default path. Naming that trade is a senior answer.
- **The block-based response is *more* observable (L213).** `tool_use`, `thinking`, and `text` as separate blocks make agent tracing (L213, L329) explicit — a real advantage for agent observability.
- **Provider choice is a *task* decision, not a loyalty (L156).** Long context → Anthropic; embeddings/ecosystem → OpenAI; multimodal-native → Gemini. The table decides, never the brand.

## 8. Common Mistakes

- **Treating the system prompt as a message role.** It's a top-level parameter in Anthropic — and it's still the cache key (L171).
- **Forgetting `max_tokens`.** It's *required* — an error, not a default. The output budget (L149) is enforced.
- **Parsing the response as one string.** Content is a *list of blocks* — text, tool_use, thinking. Branch on block type (L152's discipline).
- **Not appending `tool_result` with the matching id.** The loop breaks without the `tool_use_id` link (L144).
- **Using extended thinking by default.** It's a cost/latency trade (L150, L151) for the hard tail — not the chat default.
- **Assuming 1:1 API shapes.** The concepts map, the *endpoints* don't — the abstraction (L155) exists exactly for this.

## 9. Best Practices

- **Keep the system parameter byte-stable** — it's the cache key (L171).
- **Branch on content-block type** — text / tool_use / thinking, each handled deliberately (L152).
- **Set `max_tokens` consciously every call** — the API enforces the output budget (L149).
- **Complete the tool loop exactly**: execute, append `tool_result` with the `tool_use_id`, call again (L144).
- **Use extended thinking only for the hard reasoning tail** (L148, L157), with the cost/latency budget named (L150, L151).
- **Keep it behind the abstraction (L155)** — the dialect stays at the adapter, not the feature code.

## 10. Interview Questions

**Q: How does the Anthropic API differ from OpenAI's (L152)?**
> A: Same concepts, different dialect. The system prompt is a top-level parameter; the response is a list of content blocks — text, tool_use, thinking — instead of one string; tools use an `input_schema`; and `stop_reason` plays the role of `finish_reason`. The tool loop and structured-output concepts map 1:1.

**Q: How does tool calling work in Anthropic?**
> A: The model emits a `tool_use` block with an id, name, and input. My code executes it and appends a `tool_result` block with the matching `tool_use_id`, then calls again so the model continues with the result in context (L144). It's the declare→execute→return loop, in blocks.

**Q: How do you get structured output from Anthropic?**
> A: The L143 pattern maps cleanly: declare a tool whose `input_schema` is your JSON schema, and the model's `tool_use.input` is your structured output — schema-valid by construction. Anthropic also has a native structured-output mode on some models, but the tool-schema pattern is the portable one (L155).

**Q: When would you choose Anthropic over OpenAI?**
> A: The comparison table (L156) decides: long-context work and first-class extended thinking are Anthropic strengths; a broader API surface, embeddings (L147), and ecosystem are OpenAI strengths. For most features they're interchangeable behind the abstraction (L155) — I'd choose on the axis my feature needs and the eval results (L343).

## 11. Follow-Up Questions

- What is extended thinking, and when is it worth the cost (L150)?
- How does the `tool_use`/`tool_result` loop differ from OpenAI's (L152)?
- How does prompt caching (L171) interact with the top-level system parameter?
- Where does Anthropic sit in the provider comparison (L156)?
- How would you route between OpenAI and Anthropic behind one interface (L155)?

## 12. Comparison Table — Anthropic vs the Baseline

| Concept | OpenAI (L152) | Anthropic |
|---|---|---|
| System prompt | a message role | top-level `system` parameter |
| Response | one string / tool_calls | list of blocks (text, tool_use, thinking) |
| Tools | `tools[].function` | `tools[].input_schema` |
| Tool result | `tool` message + `tool_call_id` | `tool_result` block + `tool_use_id` |
| Stop reason | `finish_reason` | `stop_reason` |
| Structured output | `response_format` | `input_schema` as a tool (L143) |
| Extended thinking | optional | first-class `thinking` block |
| `max_tokens` | optional | **required** |

The senior read: **the columns map 1:1 at the concept level** — which is exactly why the abstraction (L155) can normalise them, and why the comparison (L156) is a table, not a rewrite.

## 13. Code Example — The Anthropic Dialect, End to End

```js
// The Anthropic dialect: system as parameter, blocks, the tool loop (L144).
const { Anthropic } = require('@anthropic-ai/sdk');
const anthropic = new Anthropic();              // reads ANTHROPIC_API_KEY

async function ask(question) {
  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    system: 'Answer concisely. Use tools when needed.',   // ← its own dial (L142)
    messages: [{ role: 'user', content: question }],
    max_tokens: 300,                                      // ← REQUIRED (L149)
    tools: [{
      name: 'get_stock',
      description: 'Current price of a US ticker.',
      input_schema: {                                    // ← the schema (L143)
        type: 'object',
        properties: { ticker: { type: 'string' } },
        required: ['ticker'],
      },
    }],
  });

  // Content is a LIST of blocks — branch on type (L152's discipline).
  for (const block of res.content) {
    if (block.type === 'tool_use') {
      const { ticker } = block.input;
      const price = await fetchPrice(ticker);            // ← YOUR execution
      // append the tool_result and loop (L144) — tied by tool_use_id
      return anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        system: 'Answer concisely.',
        messages: [
          { role: 'user', content: question },
          { role: 'assistant', content: res.content },
          {
            role: 'user',
            content: [{ type: 'tool_result', tool_use_id: block.id, content: `${ticker} $${price}` }],
          },
        ],
        max_tokens: 300,
      }).then((r2) => r2.content[0].text);
    }
    if (block.type === 'text') return block.text;
  }
}
```

```text
What the reader must SEE — the dialect, named:

  system        → top-level parameter (the cache key, L171)
  content       → a LIST of blocks, branch on type
  tool_use      → you execute, append tool_result (L144)
  max_tokens    → required, the enforced budget (L149)
  stop_reason   → the "why did it end" (L145)
```

```narrate
4-6: The request: system as its own parameter, max_tokens required — the output budget enforced (L149).
9-20: Tools use input_schema — the L143 structured-output pattern, pointed outward.
23-30: The loop: tool_use block → MY execution → tool_result tied by tool_use_id → call again (L144).
31-33: Text comes back as a block too — branch on type, never assume one string.
```

> [!TIP]
> This is the whole dialect in one file: **system-as-parameter, blocks, the tool loop, required max_tokens.** Put it behind the abstraction (L155) and the feature code never knows which provider it's on — which is the point of the next lesson.

## 14. Performance Notes

- **`max_tokens` required = the budget enforced (L149).** The API refuses to guess, so the output reserve is always explicit — a discipline nudge.
- **Extended thinking costs output tokens (L150) and latency (L151).** The thinking block is *extra generation* before the answer — budget it on the hard tail, never the default (L157).
- **Prompt caching (L171) applies to the stable `system` parameter.** A byte-stable system prompt is the cache key; long system prompts get the ~10% cached-prefix economics.
- **Long context is a strength but still O(n²) in attention (L136, L138).** Anthropic's long-context handling is good; the input-size cost is physics, not dialect.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| "max_tokens is required" error | The output budget line was omitted (L149) | Set `max_tokens` explicitly every call |
| Tool result never reaches the model | `tool_result` missing the matching `tool_use_id` (L144) | Tie the id exactly; append the block |
| Answer stops with no reason | `stop_reason: max_tokens` — truncation (L145) | Raise the budget; handle the reason |
| System prompt not having effect | System as a message role, not the parameter | Move it to the top-level `system` field |
| Cost spike on hard tasks | Extended thinking on by default (L150) | Route thinking to the hard tail only (L157) |

## 16. Quick Revision Notes

- Anthropic = **the same concepts as L152, in its own dialect** — system-as-parameter, content blocks, `input_schema` tools.
- The tool loop: **`tool_use` block → execute → `tool_result` + `tool_use_id` → call again** (L144).
- **`max_tokens` is required** — the output budget (L149), enforced.
- **`stop_reason`** plays `finish_reason`'s role (L145).
- Strengths: **long context, first-class extended thinking, input_schema structured output (L143)**.
- Provider choice is a **task decision (L156)**, behind the abstraction (L155).

## 17. Cheat Sheet

```text
ANTHROPIC API = the baseline (L152) in its own dialect

DIALECT DIFFERENCES
  system        top-level parameter  (the cache key, L171)
  content       a LIST of blocks     → branch on type
  tools         input_schema         (the L143 pattern)
  max_tokens    REQUIRED             (the budget, L149, enforced)
  stop_reason   end_turn | tool_use | max_tokens | stop_sequence

THE TOOL LOOP (L144)
  model → tool_use {id, name, input}
  you   → execute
  you   → append tool_result {tool_use_id, content}
  call again → model continues with the result

BLOCK TYPES
  text      → render
  tool_use  → execute + loop
  thinking  → extended reasoning (cost it, L150)

DIFFERENTIATORS
  long-context strength · extended thinking
  input_schema structured output (L143)
  the block-based response is observability-friendly (L213)

RULES
  set max_tokens every call
  keep the system parameter byte-stable (L171)
  route extended thinking to the hard tail (L157)
  behind the abstraction (L155) — dialect at the adapter

INTERVIEW, 4 MOVES
  1 frame    "same concepts, different dialect"
  2 dialect  "system param, blocks, input_schema, stop_reason"
  3 loop     "tool_use → execute → tool_result → continue"
  4 choice   "long-context/thinking strengths → L156 decides"
```

## 18. Key Takeaways

> [!RECAP]
> - The Anthropic API is the **same concepts as the OpenAI baseline (L152) in its own dialect** — system-as-parameter, content blocks, `input_schema` tools
> - The tool loop is **`tool_use` → execute → `tool_result` + `tool_use_id` → continue** (L144)
> - **`max_tokens` is required** — the output budget (L149) enforced by the API, and **`stop_reason`** plays `finish_reason`'s role (L145)
> - Its differentiators: **long-context strength, first-class extended thinking, and `input_schema`-as-structured-output** (L143)
> - The concepts map 1:1, which is **why the abstraction (L155) can normalise providers** — dialect lives at the adapter
> - Provider choice is a **task decision (L156)**: long context and hard reasoning → Anthropic; the table decides, never the brand

## Check your understanding

Answer these without looking back.

1. Name the dialect differences between Anthropic and the OpenAI baseline (L152).
2. How does the tool loop work in Anthropic — block by block (L144)?
3. Why is `max_tokens` significant in Anthropic, and what does it enforce (L149)?
4. What are the content block types, and how do you branch on them?
5. How do you get structured output from Anthropic (L143)?
6. When would extended thinking be worth its cost (L150, L157)?
7. Where does Anthropic win in the provider comparison (L156)?
8. Why does the abstraction (L155) make the dialect differences an adapter detail?

## A Closing Note — The Second Dialect

You now speak two dialects of the same grammar: the baseline (L152) and Anthropic's (this lesson). The senior value isn't memorising endpoints — it's holding the *concepts* so each dialect is a mapping, and so the abstraction (L155) can normalise them. Next: the third provider — Gemini, the multimodal-native dialect (L154), then the abstraction (L155) and the comparison (L156) that turn all three into a decision table.
