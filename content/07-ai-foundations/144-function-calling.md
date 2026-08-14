# Lesson 144 — Function Calling & Tool Calling

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do agents work?" starts here; function calling is the primitive that turns an LLM from a generator into an *actor*, and it's the most-asked mechanism question in the AI half.

Lesson 143 made the model's *output* a typed contract. This lesson makes the model *capable of action*: it can declare "I need to call `get_stock_price('AAPL')`", wait for the result, and continue. That loop — **model declares, you execute, result goes back into context** — is the primitive underneath every agent (L200), every RAG pipeline that queries a database, and every AI product that does something instead of just saying something.

The distinction this lesson is built on: a **demo builder** treats tools as "the model calls a function". A **solutions architect** knows the division of labour — *the model decides and declares; your code executes and returns; the model never actually runs anything* — and designs that loop for reliability, security, and observability.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the tool-calling loop: model declares a call, your code executes it, the result returns to context
- Explain why the model *declares* but never *executes* — the security boundary is your code
- Define a tool schema (name, description, JSON-schema parameters) and why the description matters
- Handle the loop in code: detect the tool call, run it, feed the result back
- Design tool use for reliability: idempotency, validation, timeouts, and the agent loop (L200)

## 1. One-Line Definition

**Function calling (tool calling) is the provider feature where the model, instead of (or alongside) generating text, emits a structured declaration that it wants a specific tool called with specific arguments — which your code then executes, returning the result into the conversation context so the model can continue.**

The one-sentence interview answer: *"The model doesn't run code — it *declares intent*: 'call get_stock with ticker=AAPL'. My application executes that call, with its own permissions, and feeds the result back into the context. The model then continues with the real data. It's a loop — declare, execute, return, continue — and the security boundary is that the model can only *ask*; my code decides what actually runs."*

## 2. Mental Model

Think of the model as a **competent operator who cannot touch the machine.** It can read the labels on the buttons (the tool descriptions), decide which button to press and what to type, and *ask you to press it*. You press it, read the dial, and tell the operator what it said. The operator then makes the next decision.

```text
   The model (operator)        Your code (the hands)
   ───────────────────         ─────────────────────
   "I need the price of AAPL"  ──▶ get_stock('AAPL')
        │                            │
        │   ←── "AAPL: $212.40" ─────┘
        ▼
   "So AAPL is up 1.2% today…"
```

Three properties make this powerful and safe:

1. **The model is never given a shell or a key.** It asks; your code decides whether the call is allowed (that's the security boundary, deep-dived in L315).
2. **The model can chain.** It can ask for a price, then ask to buy, then ask to confirm — a *sequence of tool calls* is an agent loop (L200).
3. **The tool result is context.** It comes back as a message the model can attend to (L136) — which is why the tool result must be *accurate and complete* (L141's grounding, but sourced from execution).

## 3. Visual Flow — One Tool-Calling Round Trip

```text
   User: "What's AAPL doing today?"

   ┌──────────────────────────────────────────────────┐
   │ 1 · MODEL: decides a tool is needed              │
   │     emits: tool_calls: [                         │
   │       { id: "call_1",                            │
   │         function: { name: "get_stock",           │
   │                     arguments: {ticker:"AAPL"} } │
   │     ]                                            │
   │     (+ maybe a message: "Let me check…")         │
   └──────────────────┬───────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────┐
   │ 2 · YOUR CODE: sees the tool_call, EXECUTES it   │
   │     result = get_stock("AAPL")   ← your function │
   │     (you hold the API key; the model doesn't)    │
   └──────────────────┬───────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────┐
   │ 3 · YOU append the result as a TOOL message:     │
   │     { role: "tool",                              │
   │       tool_call_id: "call_1",                    │
   │       content: "AAPL $212.40 (+1.2%)" }          │
   └──────────────────┬───────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────┐
   │ 4 · MODEL: continues with the result in context  │
   │     "AAPL is up 1.2% at $212.40…"                │
   └──────────────────────────────────────────────────┘
        ── and the loop can repeat (agent, L200) ──
```

The shape to remember: **the tool call is *returned to you*, not executed by the model.** You are the executor; the model is the planner. That split is the whole architecture.

## 4. How It Works — The Tool Schema, and Why the Description Matters

Tools are defined by a **JSON schema** you send with the request (the same machinery as L143, aimed outward):

```text
   tools: [
     {
       type: "function",
       function: {
         name: "get_stock",
         description: "Get the current price of a US stock ticker.",
         parameters: {
           type: "object",
           properties: {
             ticker: { type: "string", description: "e.g. AAPL" },
           },
           required: ["ticker"],
         },
       },
     },
   ]
```

Two parts do different work:

- **The schema constrains the *shape* of the arguments** (L143's machinery): the model must emit `{ticker: "AAPL"}`, typed, or the call is invalid.
- **The description steers *when* the model calls it.** The model decides to use a tool by matching the user's request against the tool descriptions — a poor description means it calls the wrong tool, or calls none. The description is a *prompt* (L142) wearing a schema.

> [!NOTE]
> **Model declares, code executes — this is a security line, not a plumbing detail.** The model's tool call is *intent*, not action. If the model could execute, a prompt-injected instruction (L309, L311) could make it run anything. Because your code executes, you can validate, authorise, rate-limit, and log every call — the trust boundary is in your hands, not the model's.

## 5. Real Project Usage

- **Every "chat with your data" feature.** "What were March sales?" → the model calls `query_sales_db('2026-03')` → your code runs the SQL (with your permissions) → the model answers from the result. This is text-to-SQL done safely: the *model* writes the intent, the *code* executes against your schema.
- **Agents (L200).** The loop — decide, call, read result, decide again — is an agent. Tool calling is the loop's heartbeat.
- **RAG that queries, not just retrieves.** Beyond vector search (L174): "which orders are late?" needs a *query tool*, not an embedding lookup. Tool calling is how the model gets to the database.
- **Actions in products.** "Book the flight / send the email / create the ticket" — the model declares the action; your code executes it (often behind a human approval gate, L208, L324).
- **Coding assistants.** The model doesn't run code; it emits "run `npm test`" — the *IDE/agent* runs it and returns the output (L164, L354).

The through-line: **tool calling is how an LLM product stops being a textbox and starts being a system** — the model reasons, your code acts, and the result is grounded in reality.

## 6. Interview Explanation

Say it in four moves:

1. **The loop.** "The model emits a structured declaration — 'call get_stock with these args' — my code executes it, and the result goes back into context. Then the model continues. Declare → execute → return → continue."
2. **The boundary.** "The model never executes anything. It asks; my code decides. That's the security boundary — the model holds no keys, runs no shells, and every call goes through my validation."
3. **The schema.** "Tools are defined by a JSON schema plus a description. The schema constrains the arguments; the description steers *when* the model calls — it's a prompt wearing a schema."
4. **The consequence.** "That loop is the agent primitive: the model can chain calls, and each result is grounded context. Everything from 'chat with your data' to full agents is this loop at different depths."

## 7. Senior-Level Insights

- **Tool calling is where grounding meets action.** The result of a tool call is *grounded by execution* — the price is real because your code fetched it. That's a stronger guarantee than RAG (L191): the model didn't predict the fact, it received it.
- **The tool surface is the attack surface.** Every tool you expose is a capability the model (or a prompt injection, L309, L311) can request. Design tools with *least privilege*: narrow scopes, read-only defaults, per-user authorisation, and human gates on irreversible actions (L315, L324).
- **Idempotency is the senior tool-design rule.** If your tool call runs twice — retry, double-submit, a flaky network (L169) — the system must be safe. "Send email" should be idempotent (idempotency keys, L255) or gated; "get price" always is.
- **Observability is non-negotiable.** Every tool call is a decision you should be able to replay: what was asked, what ran, what came back (L213, L329). A tool call log is the agent's audit trail.

## 8. Common Mistakes

- **Giving the model a shell or a raw key.** "Let the model run curl" is how a prompt injection becomes a breach (L309, L311). The model declares; your code executes with least privilege.
- **Under-describing tools.** A vague description means the model calls the wrong tool or calls none. The description is the model's only way to know *when* to use it.
- **Not feeding the result back correctly.** The tool result must reference the `tool_call_id`; a mismatched or missing result breaks the loop.
- **Forgetting the result is context.** The tool output goes into the context window (L138) — a huge result eats the budget. Return the *answer*, not the whole dataset.
- **Assuming tool calls are safe because they're "just JSON".** The call is intent, not action — but the *action* is yours, and it needs authorisation, rate limits, and idempotency like any API endpoint.

## 9. Best Practices

- **Expose narrow tools with least privilege.** Each tool does one thing, scoped to the user, read-only by default (L315).
- **Write descriptions as prompts** (L142): "Use when the user asks about a stock's current price. Never for historical data."
- **Validate arguments before executing** — never trust the model's args into a shell or a query (L315).
- **Keep tool results small and answer-shaped** — return the summary the model needs, not the raw dataset (L138, L149).
- **Make tools idempotent or gated.** Reads are safe; writes need idempotency keys and, for irreversible actions, a human approval step (L208, L324).
- **Log every call** — what, when, for whom, and what came back (L213). The audit trail is the product's memory.

## 10. Interview Questions

**Q: How does function calling actually work?**
> A: The model emits a structured tool call — name plus JSON-schema-valid arguments — instead of (or alongside) text. My code detects it, executes the real function with its own permissions, and appends the result as a tool message referencing the call id. The model then continues with that result in context. Declare → execute → return → continue.

**Q: Does the model run the code?**
> A: Never. The model declares intent; my application executes it. That's the security boundary — the model holds no keys and runs no shell. I validate the arguments, authorise the call, execute with least privilege, and return the result. A prompt injection can ask for a call (L309); it can't *make* one that my code doesn't allow.

**Q: What makes a good tool?**
> A: One narrow job, clearly described; a JSON schema that constrains the arguments; least-privilege execution; an idempotent or gated side effect; and a small, answer-shaped result. The description is what lets the model decide *when* to call it — it's a prompt wearing a schema.

**Q: How do tools relate to agents?**
> A: The tool loop — decide, call, read, decide again — *is* the agent loop. A single tool call is one step; an agent is the loop running with a goal, chaining calls until it terminates (L200). Function calling is the primitive; agents are the policy on top.

## 11. Follow-Up Questions

- How do you stop a tool call from being a security hole (L315)?
- What happens when the tool returns an error — how does the model recover (L168)?
- How do you keep tool results from blowing the context window (L138)?
- When should a tool call require human approval (L208)?
- How do you make an agent's tool use observable (L213)?

## 12. Comparison Table — Model vs Tool, and the Loop's Parts

| Part | Who | What it does | Trust |
|---|---|---|---|
| Decide | model | picks a tool from descriptions | stochastic — evals needed |
| Declare | model | emits `{name, arguments}` | schema-valid (L143) |
| Execute | **your code** | runs the real function | deterministic — the boundary |
| Return | your code | appends the result to context | grounded by execution |
| Continue | model | reasons with the result | stochastic again |

The senior read: **the loop alternates stochastic (model) and deterministic (code) steps** — and the architecture is sound exactly where the deterministic steps enforce the safety, validation, and truth the stochastic ones can't.

## 13. Code Example — One Tool Call, End to End

```js
// The full loop: send tools → model declares → you execute → return → continue.
async function askWithTools(question) {
  const messages = [{ role: 'user', content: question }];

  // 1 · tell the model what it MAY call (it decides whether to)
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    tools: [{
      type: 'function',
      function: {
        name: 'get_stock',
        description: 'Current price of a US stock ticker. Use when asked about a live price.',
        parameters: {
          type: 'object',
          properties: { ticker: { type: 'string' } },
          required: ['ticker'],
        },
      },
    }],
  });

  const call = res.choices[0].message.tool_calls?.[0];
  if (!call) return res.choices[0].message.content;   // no tool needed

  // 2 · YOU execute — the model only declared
  const { ticker } = JSON.parse(call.function.arguments);
  const price = await fetchPrice(ticker);              // ← real function, your key

  // 3 · return the result, tied to the call id
  messages.push(
    { role: 'assistant', tool_calls: [call] },
    { role: 'tool', tool_call_id: call.id, content: `${ticker} $${price}` },
  );

  // 4 · the model continues, with the real number in context
  const followUp = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages });
  return followUp.choices[0].message.content;
}
```

```text
What the reader must SEE — who does what:

  the MODEL   declares  "get_stock(ticker=AAPL)"   (schema-valid)
  YOUR CODE   executes  fetchPrice("AAPL")          (your key, your rules)
  YOUR CODE   returns   "AAPL $212.40" as a tool message
  the MODEL   continues "AAPL is up 1.2% today…"
```

```narrate
8-17: The tool spec — name, description, schema. The description steers when it's called.
23-25: The model's declaration, parsed by me — I never pass raw args into anything.
27-28: The execution is mine: real function, my credentials, least privilege.
31-34: The result returns tied to the call id, so the model can continue with ground truth.
```

> [!TIP]
> The line that makes this safe is `fetchPrice` — a function *you* wrote, running with *your* permissions. The model could ask for anything; your code decides what "anything" means. That separation is the entire security story of tools (L315).

## 14. Performance Notes

- **Tool calls add a round trip.** One tool call = one extra API exchange (declare → return). For chat that feels like a beat; for agents it's the normal cost of a step (L145, L151).
- **Tool results eat context.** A fat result (the whole table) blows the window (L138) and slows the next pass. Return the *answer*, not the dataset — summarise server-side first.
- **Parallel tool calls exist.** Providers let the model emit several calls at once (L161); you can execute them concurrently and return all results. Big latency win when the tools are independent.
- **Caching works on the *prefix*.** A stable system prompt + tool definitions + user message are cacheable (L171); tool *results* come after the cache point, so keep the pre-tool prefix stable to win there.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The model calls the wrong tool | Description too vague or overlapping | Rewrite descriptions (they're prompts, L142); narrow scopes |
| The model never calls a tool | Tool not surfaced, or description doesn't match | Check the `tools` array is sent; improve the description |
| The loop breaks after one call | Tool result not tied to `tool_call_id` | Match the id; append as `role: 'tool'` |
| Argument validation errors | Schema too loose / model sent bad args | Tighten the schema; validate before executing |
| Context blows up over calls | Tool results too large | Return answer-shaped summaries (L138, L149) |

## 16. Quick Revision Notes

- The loop: **model declares → your code executes → result returns → model continues**.
- **The model never runs anything.** It asks; your code acts — that's the security boundary (L315).
- Tools are **schema + description**: schema constrains args, description steers *when* to call.
- Tool results are **grounded by execution** — a stronger truth than prediction (L141, L191).
- Design for **least privilege, idempotency, small results, and full logging**.
- The loop is the **agent primitive** (L200) — one call is a step; a goal-running loop is an agent.

## 17. Cheat Sheet

```text
TOOL CALLING = the agent primitive

LOOP
  model declares  {name, arguments}   schema-valid (L143)
  your code executes                   your key, your rules
  your code returns                   tool message, tied to call id
  model continues                     with the result in context

SECURITY BOUNDARY
  model declares → you execute → the model holds nothing
  least privilege · validate args · rate-limit · log everything

TOOL SPEC
  name        the callable
  description THE steering — write it like a prompt (L142)
  parameters  JSON schema — constrains the arguments (L143)

DESIGN RULES
  narrow tools      one job each
  small results     answer-shaped, not the dataset (L138)
  idempotent writes or gated (L208, L255)
  log every call    the audit trail (L213)

INTERVIEW, 4 MOVES
  1 loop    "declare → execute → return → continue"
  2 boundary "the model never executes — my code does"
  3 schema  "description steers, schema constrains"
  4 result  "the loop is the agent primitive"
```

## 18. Key Takeaways

> [!RECAP]
> - Function calling is the loop: **the model declares a structured call, your code executes it, the result returns to context, and the model continues**
> - **The model never executes anything** — it asks; your code acts. That boundary is the security story of every AI product (L315)
> - Tools are **schema + description**: the schema constrains the arguments (L143), the description steers *when* the model calls — it's a prompt wearing a schema
> - Tool results are **grounded by execution** — a real number from a real function is a stronger truth than prediction
> - Design for **least privilege, idempotency, small answer-shaped results, and full observability**
> - This loop, run with a goal, **is the agent** (L200) — and it's the foundation of every AI product that does something rather than just saying something

## Check your understanding

Answer these without looking back.

1. Describe the full tool-calling loop in one sentence.
2. Why is "the model never executes" a security line, not a plumbing detail?
3. What does the tool description do — and why is it a prompt, not documentation?
4. How do you safely return a tool result to the model?
5. Name three tool-design rules for production.
6. Why is a tool result "grounded by execution" stronger than RAG?
7. How does tool calling relate to agents?
8. What happens to the context window across many tool calls, and what's the fix?

## A Closing Note — The Model That Can Act

You now hold the primitive that every agent, every "chat with your data" product, and every AI action is built from: **declare → execute → return → continue.** It is the point where the model stops being a textbox and starts being a system — where it can check the world (L141's grounding, by execution), act on it, and be held accountable for it (L213's audit trail).

The three lessons just completed — prompt as contract (L142), output as schema (L143), action as tool (L144) — are the reliability triad of AI engineering: *steer it, shape it, and let it act.* Everything after this — streaming (L145), multimodal (L146), agents (L200), security (L315) — composes these three.

Next: the felt-quality layer — streaming responses, and why the first token matters more than the last.
