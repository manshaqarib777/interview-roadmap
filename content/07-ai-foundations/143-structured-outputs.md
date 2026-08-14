# Lesson 143 — Structured Outputs & JSON Schemas

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you get reliable JSON out of an LLM?" is *the* production question; the answer separates demos from systems.

Lesson 142 turned the prompt into a contract. This lesson turns the contract into a **guarantee**: the model returns *typed, validated* output — a JSON object that matches your schema, or an error you can handle. This is the single most important reliability primitive in AI engineering: it is what lets a text model be treated as a function in your codebase, and it is the foundation of tool calling (L144), extraction pipelines, and every agent loop that follows.

The distinction this lesson is built on: a **demo builder** parses `response.content` with regex and hopes. A **solutions architect** requests a *structured output* against a JSON schema, validates what comes back, and treats "the model returned malformed JSON" as a designed-for error case, not a surprise.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain structured outputs: the model's output is *constrained* to match your JSON schema, not merely encouraged
- Define a JSON schema in one sentence, and write one for a common extraction task
- Use a provider's structured-output API (OpenAI's `response_format`, Anthropic's tool schema, Gemini's `response_schema`)
- Validate the response on your side — the model can still be *valid but wrong*
- Choose between "structured output" and "prompt says JSON" — and know why the difference matters

## 1. One-Line Definition

**Structured outputs are a provider feature that constrains a model's generation to conform to a JSON schema — so instead of hoping the model emits the shape you asked for, the provider *guarantees* the output is valid against your schema.**

The one-sentence interview answer: *"Structured outputs make the LLM's output machine-readable by construction: you pass a JSON schema, and the provider constrains generation so the returned content parses and validates against it. The model can still be *semantically* wrong — but it can no longer be *malformed*. That turns a text model into a typed function in your codebase."*

## 2. Mental Model

Think of structured outputs as **training wheels for the model's output — or better, a mould.** The prompt says "please output JSON"; the schema *is* the mould the tokens are poured into. The model still chooses the content; the mould decides the shape.

```text
   Prompt-as-JSON (hoping)              Structured output (guaranteed)
   ┌──────────────────────────┐        ┌──────────────────────────┐
   │ "Return JSON like:       │        │ response_format = {      │
   │  {name, price, qty}"     │        │   type: 'json_schema',   │
   │                          │        │   schema: {…}           │
   │ → model may return:      │        │ }                        │
   │  "Sure! Here is the      │        │                          │
   │   JSON: {name:…}"        │        │ → model MUST return      │
   │  or a prose paragraph,   │        │   valid JSON matching    │
   │  or {name:…} without     │        │   the schema — or the    │
   │  quotes, or truncated    │        │   call fails cleanly     │
   └──────────────────────────┘        └──────────────────────────┘
        your parser eats the mess             your parser never sees a mess
```

The key difference: **prompting asks; structured output constrains.** One is a hope you parse around; the other is a contract the provider enforces during generation.

## 3. Visual Flow — The Structured-Output Round Trip

```text
   Your code
   ┌───────────────────────────────────────────────┐
   │ 1 · define the schema                         │
   │     { type: 'object',                         │
   │       properties: {                           │
   │         name:   { type: 'string' },           │
   │         amount: { type: 'number' },           │
   │         tags:   { type: 'array',              │
   │                   items: { type: 'string' } } │
   │       },                                      │
   │       required: ['name','amount'] }           │
   └──────────────────┬────────────────────────────┘
                      ▼
   ┌───────────────────────────────────────────────┐
   │ 2 · send with response_format = schema       │
   │     (the provider constrains the tokens)     │
   └──────────────────┬────────────────────────────┘
                      ▼
   ┌───────────────────────────────────────────────┐
   │ 3 · response: JSON that parses & validates   │
   │     { "name": "Widget", "amount": 4,         │
   │       "tags": ["tools"] }                    │
   └──────────────────┬────────────────────────────┘
                      ▼
   ┌───────────────────────────────────────────────┐
   │ 4 · YOU still validate (trust, verify):      │
   │     - schema-valid?  (yes, guaranteed)       │
   │     - semantically right? (NOT guaranteed)   │
   │     → the model can be valid-but-wrong       │
   └───────────────────────────────────────────────┘
```

The round trip has one asymmetry worth memorising: **the provider guarantees *shape*, never *truth*.** A schema-valid JSON can contain a hallucinated amount, a wrong name, or a fabricated tag. Structured output removes the *parsing* failure — it does not remove the *content* failure (that's L141 and L191's job).

## 4. How It Works — The Mechanism Behind the Guarantee

The provider doesn't "validate after the fact" — it **constrains during generation**. Each token is sampled from a set that keeps the partial output on a path that can still complete to a schema-valid JSON:

- The model generates a *grammar-constrained* token stream: at every step, the possible next tokens are filtered to those that keep the output parseable against the schema.
- It cannot emit a stray `]`, a missing quote, or prose — those would make the output invalid, so they're never sampled.
- The result is deterministic in *shape*: valid JSON, matching your schema, every time (or a clean provider error, which you handle like any API error).

> [!NOTE]
> **The honest version of the guarantee.** The constraint is on *syntactic* validity. The model can still: (a) put a string where you wanted a number if your schema is loose, (b) hallucinate values (L141), (c) return `null` for an optional field it should have filled. So structured outputs eliminate the *parser* failure class, and you still need validation + evals (L343) for the *content* failure class.

## 5. Real Project Usage

- **Extraction pipelines.** Invoice → `{vendor, amount, dueDate}`, email → `{category, priority, actionItems}`. Structured outputs make the downstream parser trivial and the pipeline *typed*.
- **Classification at scale.** Labels as a constrained enum (`['refund','billing','other']`) — the schema itself prevents the model from inventing a category (L142's contract, now enforced).
- **Tool calling (L144).** The tool-call arguments are structured outputs: `{tool: 'get_stock', args: {ticker: 'AAPL'}}`. The agent loop parses this shape; schema-conformance is what makes the loop reliable.
- **Form-filling and data entry.** Turn a document into a typed record — schema in, valid record out, with the model doing the semantic work and the schema doing the shape work.
- **Multi-step agents.** Each step's output feeds the next (L200); if every step is schema-valid, the loop's data flow is type-safe even though the model is stochastic.

The through-line: **structured output is the seam that makes a stochastic text model composable into deterministic systems.** It's not an output nicety — it's the interface design of AI products.

## 6. Interview Explanation

Say it in four moves:

1. **The definition.** "Structured outputs constrain the model's generation to match a JSON schema — the provider guarantees the output is valid against it, not just 'asked for'."
2. **The mechanism.** "The constraint is applied during generation: at each token, only continuations that can still complete to valid JSON are sampled. So malformed output is impossible, not improbable."
3. **The honest limit.** "The guarantee is syntactic. The model can still be semantically wrong — a schema-valid JSON with a hallucinated value. So I validate the shape (guaranteed) and eval the content (my job)."
4. **The consequence.** "That's what makes an LLM composable: a typed function in your codebase, with a defined input contract and a defined output contract — and a parser that never has to guess."

## 7. Senior-Level Insights

- **Structured outputs are the difference between "an AI feature" and "a reliable AI feature".** The parser is where text-model integration breaks in production; schema-constraining the model removes the entire failure class.
- **Design the schema like an API contract.** Field names, types, required vs optional, enum values — they're your interface. A good schema *steers the model*: enums prevent invented labels; required fields force completeness; descriptions in the schema guide values.
- **Pair the schema with a validator on your side.** Provider guarantees shape; your code validates the *received* payload (the SDK version, the model, the proxy can all differ). Validate at the boundary — same rule as any API integration.
- **"Valid but wrong" is the remaining failure surface.** Structured output eliminates parse errors, not hallucinations. The senior architecture is *schema for shape + grounding for truth + evals for regression* (L191, L343).

## 8. Common Mistakes

- **Prompting "return JSON" and parsing with regex.** That's hoping, not engineering — one model update or emoji away from a broken parser.
- **Skipping client-side validation.** The provider guarantees the *response* against the *schema you sent* — but your code should still validate what it receives (different model, SDK, proxy, version).
- **Forgetting the schema steers semantics.** `enum: ['refund','billing']` isn't just validation — it tells the model the allowed answer set. Use the schema as a prompt, not just a check.
- **Assuming valid = correct.** A schema-valid `{amount: 9999}` can still be a hallucinated amount (L141). Structured output fixes the parser, not the truth.
- **Not handling the provider error path.** When the model *can't* produce valid output, the API errors — and unhandled, that's a 500 in your UI. Handle the structured-output failure like any dependency failure (L168).

## 9. Best Practices

- **Use structured outputs for anything that feeds code.** If you parse it, constrain it. Parser-driven features get schemas; prose features don't need them.
- **Write schemas as contracts.** Required fields, tight enums, descriptive field names — the schema is the interface and the instruction.
- **Validate at the boundary.** Parse + validate the response in one place; never trust `content` strings downstream.
- **Keep the schema stable.** The schema is a cache key and an eval contract; changing it is a breaking change (L341).
- **Ground the values too.** Schema for shape, retrieval/tools for truth (L191, L144) — the two guarantees compose.

## 10. Interview Questions

**Q: What are structured outputs, and why do they matter?**
> A: They constrain the model's generation to conform to a JSON schema — the provider guarantees valid output rather than 'asking' for it. They matter because they turn a stochastic text model into a typed function: the parser never guesses, and the failure class of malformed output is removed.

**Q: How does the provider guarantee the JSON is valid?**
> A: The constraint is applied during generation. At every token step, the model can only sample continuations that keep the output on a path to schema-valid JSON. So it can't emit a stray brace or prose — invalid output is impossible, not improbable.

**Q: Does structured output eliminate hallucinations?**
> A: No — and it's important to say so. It guarantees the *shape*, not the *truth*. The model can still return a schema-valid JSON with a hallucinated value. Structured output removes the parser failure; grounding (L191) and evals (L343) handle the content failure.

**Q: When should you NOT use structured output?**
> A: When the output is prose for a human — chat, creative writing, open-ended answers. There's no parser to protect, and a schema would fight the naturalness. I use it wherever the output feeds code, and plain generation where it feeds eyes.

## 11. Follow-Up Questions

- How does a JSON schema steer the model's semantics, not just validate its shape?
- What's the relationship between structured outputs and tool calling (L144)?
- How would you handle the case where the model refuses to produce the schema-valid output?
- Why is client-side validation still needed if the provider guarantees the schema?
- How do you version a schema so old cached outputs stay compatible?

## 12. Comparison Table — Prompted JSON vs Structured Outputs

| | Prompt says "return JSON" | Structured output (schema) |
|---|---|---|
| Guarantee | none — hope, plus parser | valid against the schema |
| Failure mode | malformed, prose, truncation | provider error (clean) |
| Parser complexity | regex, retries, repair | `JSON.parse` + validate |
| Steers semantics | weakly | strongly (enums, required, descriptions) |
| Feeds code | fragile | reliably |
| Best for | prose-ish outputs | anything a parser touches |

The senior read: **the table is a decision rule.** If a parser touches the output, use the schema — the "prompt says JSON" row is a demo, and the structured-output row is the product.

## 13. Code Example — Structured Outputs in Three Providers

```js
// The same extraction task, structured-output API on each provider.
// The schema is the contract — identical shape, provider-specific call.

const invoiceSchema = {
  type: 'object',
  properties: {
    vendor:   { type: 'string' },
    amount:   { type: 'number' },
    currency: { type: 'string', enum: ['USD', 'EUR', 'GBP'] },
    dueDate:  { type: 'string' },   // ISO date
    lineItems: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['vendor', 'amount', 'currency', 'dueDate'],
  additionalProperties: false,
};

// OpenAI — response_format with json_schema
const res = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Extract from this invoice: …' }],
  response_format: {
    type: 'json_schema',
    json_schema: { name: 'invoice', schema: invoiceSchema, strict: true },
  },
});

// Anthropic — tool-use with an input schema (the tool is "return JSON")
//   tools: [{ name: 'extract_invoice', input_schema: invoiceSchema }]
//   → the model emits a tool_use block with the args

// Gemini — responseSchema on the generation config
//   generationConfig: { responseMimeType: 'application/json',
//                       responseSchema: invoiceSchema }

const parsed = JSON.parse(res.choices[0].message.content);
console.log(parsed.amount);   // a number, guaranteed by the schema
```

```text
What the reader must SEE — one schema, three provider dialects:

  OpenAI    response_format.json_schema (strict)
  Anthropic tool_use with input_schema
  Gemini    generationConfig.responseSchema

  The contract is portable; the call is provider-specific (L152-154).
```

```narrate
4-17: The schema is the interface — types, an enum, required fields, no extra keys.
20-25: OpenAI's structured-output call: the provider constrains generation to the schema.
29-32: Anthropic and Gemini express the same contract in their own dialects.
36: The payoff — a parsed object with a number you can trust the *shape* of.
```

> [!TIP]
> The `additionalProperties: false` + `strict: true` combo is the production setting: it forbids the model from slipping extra keys in, which keeps your parser's contract exact.

## 14. Performance Notes

- **Structured outputs can be slower than free-form for complex schemas.** The constrained sampling is a constraint on the token choice; deeply nested or huge schemas cost more per token. Keep schemas flat and small when latency matters (L151).
- **The schema is part of the prompt-cache story.** A stable schema (and a stable system prompt, L142) keeps the request cache-friendly (L171).
- **Malformed-output retries are the hidden cost of prompting-only JSON.** Every "please fix the JSON" retry is extra tokens + latency; structured output removes the retry class entirely.
- **Validation is cheap; do it always.** A few microseconds of schema validation (L344-style, or plain `zod`) is nothing against a retry loop or a parser crash.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Provider returns a structured-output error | The model couldn't produce schema-valid output | Handle it as a clean error path (L168); retry once with a tighter prompt |
| `amount` comes back as a string | Schema said `number` but the model output a string | Check the schema you *sent* (SDK version); tighten with `strict` |
| Extra keys in the output | `additionalProperties` not set to false | Add `additionalProperties: false`; keep the schema exact |
| Valid JSON, wrong values | Content failure, not shape failure (L141) | Ground (L191) + eval (L343); the schema can't fix truth |
| Parser throws on a "guaranteed" output | Client-side validation skipped / proxy altered it | Validate at the boundary, always |

## 16. Quick Revision Notes

- Structured outputs = **schema-constrained generation** — valid JSON by construction, not by hope.
- The constraint is **during generation** (token filtering), not post-hoc validation.
- It guarantees **shape, not truth** — valid-but-wrong is still on you (L141, L191).
- **Schema = contract + instruction**: enums steer, required forces, descriptions guide.
- **Validate at the boundary anyway** — trust the shape, verify the payload.
- Feeds code → **schema**; feeds eyes → **plain prose**. The decision rule is a parser.

## 17. Cheat Sheet

```text
STRUCTURED OUTPUT = the mould the tokens are poured into

MECHANISM
  at each token, sample only continuations that can still
  complete to schema-valid JSON  →  malformed is impossible

THE CONTRACT
  type: object|array|string|number|boolean|null|enum
  required: […]          → forces completeness
  enum: […]              → steers the allowed values
  additionalProperties: false  → forbids extras
  descriptions           → guides what goes in

PROVIDER DIALECTS (same contract)
  OpenAI     response_format.json_schema (strict)
  Anthropic  tool_use input_schema
  Gemini     generationConfig.responseSchema

WHAT IT GUARANTEES / DOESN'T
  ✓ valid shape, every time (or clean provider error)
  ✗ truth — the values can still be hallucinated (L141)

THE DECISION RULE
  feeds code  → structured output
  feeds eyes  → plain prose

INTERVIEW, 4 MOVES
  1 definition "constrains generation to a schema"
  2 mechanism  "token filtering during generation"
  3 limit      "shape yes, truth no"
  4 practice   "schema for shape + grounding for truth + evals"
```

## 18. Key Takeaways

> [!RECAP]
> - Structured outputs **constrain generation to a JSON schema** — valid output by construction, not by hope
> - The guarantee comes from **token-level filtering during generation**: malformed output is impossible, not improbable
> - It guarantees **shape, not truth** — a schema-valid JSON can still be a hallucination (L141), so grounding and evals remain your job
> - The schema is **a contract and an instruction**: enums steer, required forces, descriptions guide
> - **Validate at the boundary anyway** — trust the shape, verify the payload, handle the clean error path
> - This is the seam that makes an LLM **composable**: a typed function with defined input and output contracts — the foundation of tool calling (L144) and every agent loop after it

## Check your understanding

Answer these without looking back.

1. What does structured output guarantee, mechanically?
2. What does it *not* guarantee — and why is that distinction the whole lesson?
3. Write a schema for extracting `{category, amount, date}` from an email.
4. How do the three providers express the same contract?
5. Why is `additionalProperties: false` a production setting?
6. When would you *not* use structured output?
7. Why validate client-side when the provider already guarantees the shape?
8. How does the schema steer the model's semantics, not just check its shape?

## A Closing Note — The Seam Between Stochastic and Deterministic

Structured outputs are the single most important reliability primitive in AI engineering: they are where a stochastic text generator becomes a **typed function** in your system — with a schema for input contract, a schema for output, and a parser that never guesses. Everything that follows — tool calling (L144), the Vercel AI SDK's parts (L160–161), agents (L200), extraction pipelines, evals (L343) — is built on this seam.

Keep the honest sentence close: *the schema guarantees the shape; the architecture guarantees the truth.* Next: the primitive that turns the model from a generator into an *actor* — function calling.
