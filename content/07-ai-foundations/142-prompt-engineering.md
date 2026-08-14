# Lesson 142 — Prompt Engineering & System/User/Developer Instructions

**Interview importance:** ⭐⭐⭐⭐ — "how do you prompt an LLM well?" is the most-asked practical question in AI interviews; the senior answer is *structured communication with a stochastic pattern-matcher*, not "write better requests".

Lessons 135–141 gave you the mechanism and its failure surface. Prompt engineering is where you *steer* that mechanism: the cheapest, highest-leverage layer of control you have — no new infrastructure, just the words you send. This lesson is the discipline: what a prompt actually is (a specification of the task, the constraints, and the output shape), how the three message roles work, and the patterns that survive contact with real systems.

The distinction this lesson is built on: a **casual user** "writes a good prompt". A **solutions architect** treats the prompt as *an interface contract* — versioned, tested, and cached like code, with system/user/developer roles doing different jobs. The difference between the two is whether the prompt is a vibe or a spec.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what a prompt actually does: it sets the context, task, constraints, and output contract for a stochastic pattern-matcher
- Use the three message roles correctly: system (rules), developer (tool-behaviour), user (the input)
- Write a prompt as a *spec*: task, constraints, format, examples, failure behaviour
- Apply the core patterns: role, format, chain-of-thought, few-shot, delimiters, refusal
- Treat prompts as code: version, test, and cache them — because small changes move outputs

## 1. One-Line Definition

**Prompt engineering is the discipline of specifying a task to a next-token predictor (L135) — the context it should use, the constraints it must obey, the shape its output must take, and what to do when it doesn't know — through structured natural-language instructions.**

The one-sentence interview answer: *"A prompt is an interface contract with a stochastic pattern-matcher: it tells the model what to do, what to use, what to produce, and what to do when it can't. Done well, it's a versioned, tested specification — system prompt for rules, developer prompt for tool behaviour, user prompt for the actual input. Done badly, it's a vibe that changes with every rephrase."*

## 2. Mental Model

Think of a prompt as **a brief handed to a brilliant, literal, over-eager contractor** — brilliant at patterns, literal about wording, and eager to fill any gap with a plausible guess (L141's failure surface).

The contractor needs four things in the brief:

| The brief must specify | The prompt's version |
|---|---|
| *What to do* | the task, in one clear sentence |
| *What to use* | the context / sources it may draw on |
| *What to produce* | the output shape: format, length, tone |
| *What if it doesn't know* | the refusal behaviour — say "I don't know", don't invent |

Miss any of the four and the contractor fills the gap — fluently and confidently. **The prompt's job is to leave no gap to fill.**

## 3. Visual Flow — The Anatomy of a Good Prompt

```text
   ┌────────────────────────────────────────────────────┐
   │ SYSTEM   "You are a support agent. Answer only     │
   │          from the provided policy. If the answer   │
   │          isn't in the policy, say you don't know.  │
   │          Be concise. One paragraph max."           │
   │          ── the contract: role, rules, behaviour   │
   ├────────────────────────────────────────────────────┤
   │ DEVELOPER  "Use the tool get_policy() before       │
   │            answering. Never state a refund number  │
   │            you did not read from the tool output." │
   │          ── tool behaviour (a separate layer)      │
   ├────────────────────────────────────────────────────┤
   │ USER     "Customer asks: 'Can I refund a digital   │
   │           course after 30 days?'"                  │
   │          ── the actual input                       │
   └────────────────────────────────────────────────────┘
        │
        ▼
   the model: follows the contract, uses the policy,
   refuses when out of scope → "I don't have that in the policy."
```

The three roles are the anatomy. **System = who you are and how to behave. Developer = tool/behaviour rules. User = the input.** Mixing them is the most common prompt smell in production.

## 4. How It Works — Why Prompts Work (and Why They're Fragile)

A prompt works because the model is a **pattern-matcher over text** (L135): a well-structured prompt is a pattern the model has seen thousands of times — "role → rules → task → output format" is the shape of every instruction manual in its training data. When the prompt is structured that way, the model's continuation is likely to *match the pattern*: follow the rules, produce the format.

A prompt is fragile for the same reason: **the model predicts surface form** (L140). A wording change can shift the pattern the model latches onto — so:

- **Small changes can flip answers.** Rephrase "summarise" as "condense" and the output can change. That's not a bug; it's surface-form prediction.
- **Order matters** (positional encoding, L136). Rules at the top and a clear task at the bottom tend to anchor better than a jumbled brief.
- **The model fills gaps, so gaps are the risk.** Ambiguity is not "interpreted charitably" — it's *filled with the most probable guess*. The prompt must specify what the model may and may not do.

> [!NOTE]
> **The roles are load-bearing, not decorative.** Most providers (OpenAI, Anthropic, Gemini) ship system/user, and some add a developer layer. Using the system prompt for *tool behaviour* is a smell — tool rules belong to the developer/tool layer so the system prompt stays a stable cache key (L171). Get the separation right and caching, versioning, and evals all get easier.

## 5. Real Project Usage

- **Every production AI feature has a system prompt.** It's the permanent rent on the context window (L138): role, rules, refusal behaviour. It should be byte-stable (cache key, L171) and versioned.
- **Extraction and classification** — "classify as refund|billing|other, one word" — is a prompt as a *contract*: the output shape is specified, so the downstream parser never guesses (L143 makes this rigorous).
- **RAG answers** — "answer only from the context; cite the source" — is the grounding prompt (L191); the refusal line is what turns hallucination into "I don't know".
- **Agents** — "you have these tools; decide when to call them" — is a prompt that governs a loop (L200), which is why agent prompts are versioned and evaled like code.
- **Chat products** — the "be concise / be helpful / be honest" bundle is the system prompt; it is the product's personality, and it ships in every request.

The through-line: **the prompt is the cheapest model upgrade you can ship** — a better spec beats a bigger model on many tasks, and it's the layer you tune before you pay for one.

## 6. Interview Explanation

Say it in four moves:

1. **The frame.** "A prompt is an interface contract with a stochastic pattern-matcher — it specifies the task, the context, the output shape, and the refusal behaviour."
2. **The anatomy.** "System prompt sets the rules and role; developer prompt governs tool behaviour; user prompt is the input. Each has a job; mixing them is the classic smell."
3. **The mechanism.** "It works because structured instructions match the pattern of every manual in the training data — and it's fragile for the same reason: the model predicts surface form, so wording changes move outputs."
4. **The discipline.** "So I treat prompts as code: versioned, tested, cached, and evaled. A prompt that isn't pinned is a moving target."

## 7. Senior-Level Insights

- **The prompt is the *product spec* of the AI layer.** A well-written system prompt encodes the product's decisions — tone, scope, refusal — the way a PRD does. Two engineers with the same model and different prompts are shipping different products.
- **Prompt engineering is a *system* discipline, not a writing exercise.** It composes with caching (L171), structured outputs (L143), tool calling (L144), and evals (L343). The prompt is one layer of a stack, and the senior move is to place it correctly in that stack.
- **The cheapest wins are structural, not verbal.** Role separation, explicit refusal, output contracts, and stable cache keys move systems more than "please be accurate" does.
- **Prompt fragility is a *testing* problem, not a mystery.** Since rewording moves outputs, you test prompts the way you test code — prompt regression sets (L341), pinned in CI, so a "helpful" tweak that breaks extraction gets caught.

## 8. Common Mistakes

- **Mixing roles.** Tool rules in the system prompt, or product rules in the user prompt — breaks caching (L171), versioning, and evals.
- **A prompt with no refusal behaviour.** "What if the context doesn't contain the answer?" unanswered = the model invents one (L141).
- **Begging instead of specifying.** "Please be accurate" vs "answer only from the context; else say you don't know". The second is a contract; the first is a hope.
- **Changing prompts without testing.** A one-word tweak can flip extraction; every change is a candidate regression (L341).
- **Confusing prompt length with quality.** A bloated system prompt eats context (L138), slows requests, and dilutes attention. The best prompt is the shortest one that specifies the contract.

## 9. Best Practices

- **Write the four-part brief**: task, context/sources, output shape, refusal behaviour. If any part is missing, the model fills the gap.
- **Separate the roles.** System = rules, developer = tool behaviour, user = input. Keep the system prompt byte-stable (cache key, L171).
- **Give the model an output format, and use structured outputs (L143) when the format matters.**
- **Use few-shot examples for tricky outputs.** Three labelled examples often beat a paragraph of instructions (the pattern is in the examples).
- **Specify failure behaviour explicitly** — "if X, say Y" — because the model will otherwise produce the most probable X-adjacent guess.
- **Version and test every prompt.** A prompt is a deployable artifact; treat it like one.

## 10. Interview Questions

**Q: What makes a good prompt?**
> A: It's a spec, not a request. It specifies the task, the context/sources, the output shape, and the refusal behaviour — and it leaves no gap for the model to fill. A good prompt is short, structured, and testable.

**Q: Why are prompts fragile?**
> A: The model predicts surface form (L135, L140) — it latches onto the pattern of the wording, not the intent behind it. So a rephrase can shift which pattern it continues. That's why prompts are tested and pinned like code, not tweaked casually.

**Q: What's the difference between system, developer, and user prompts?**
> A: System sets the role and the rules — who the model is and how it behaves. Developer governs tool behaviour and model-level instructions. User carries the actual input. Separating them keeps the system prompt stable (which is also your cache key) and each layer independently versioned.

**Q: How do you stop a model from answering when it doesn't know?**
> A: You specify it: "answer only from the context; if the answer isn't there, say you don't have that information." Without that line, the model produces the most probable guess — which is the hallucination failure (L141) invited. With it, the refusal is a designed behaviour.

## 11. Follow-Up Questions

- How do you keep a system prompt stable when features change?
- What's the relationship between prompt engineering and structured outputs (L143)?
- When would you use few-shot examples instead of instructions?
- How do you test a prompt change without shipping a regression (L341)?
- Why does prompt caching (L171) care about prompt structure?

## 12. Comparison Table — Prompting Layers

| Layer | Job | Owns | Fragility |
|---|---|---|---|
| System prompt | role, rules, behaviour | the product's voice | must be cache-stable |
| Developer prompt | tool behaviour | tool-use rules | must not drift |
| User prompt | the actual input | the request | whatever the user types |
| Output contract | the shape of the answer | the parser | eliminated by structured outputs (L143) |

The senior read: **each layer has a job and a stability requirement.** The system prompt is a cache key; the user prompt is untrusted input; the output contract is a parser. Engineering the prompt stack means engineering those four constraints.

## 13. Code Example — A Prompt as a Contract

```js
// A prompt written as a spec: role, rules, format, refusal.
// Each layer is deliberate — and the system prompt stays cache-stable (L171).
async function classifyTicket(text) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: [
          'You classify support tickets.',
          'Categories: refund | billing | technical | other.',
          'Respond with exactly one category word, lowercase.',
          'If unsure, respond "other".',
        ].join('\n'),
      },
      { role: 'user', content: text },
    ],
    temperature: 0,        // classification → greedy (L139)
    max_tokens: 5,         // one word, not an essay (L135)
  });
  return res.choices[0].message.content.trim();
}

// The contract does the work: a parser never guesses, because the
// output shape was specified. (L143 makes the same shape *guaranteed*.)
```

```text
What the reader must SEE — the spec in the prompt:

  role    → "You classify support tickets."
  output  → "exactly one category word, lowercase"
  refusal → "if unsure, respond other"
  the parser can rely on it because the prompt pinned the shape
```

```narrate
5-9: The spec: role, allowed set, exact output shape, fallback. No gap for the model to fill.
11-13: The input arrives as the user message — untrusted, but constrained by the contract.
15-16: Greedy sampling and a tight token budget make the shape stick.
```

> [!TIP]
> Notice what the prompt *didn't* say: no "please", no hedging, no essay instructions. It's a spec. That's the difference between prompt-as-vibe and prompt-as-contract — and the contract version is what survives in production.

## 14. Performance Notes

- **Prompts are the cheapest latency/cost lever.** A shorter, tighter prompt reduces input tokens (L137), context (L138), and attention cost (L136) — and usually *improves* quality, because attention isn't diluted.
- **The system prompt is permanent rent.** It's in every request; a byte-stable, lean system prompt is a cost and cache win (L171, L150).
- **Few-shot examples are token-heavy but often quality-cheap.** Three good examples can beat a paragraph of instructions — but they add tokens per request; use them where the output shape is hard to specify verbally (L143 makes this more reliable).
- **Prompt changes are free to ship and expensive to test.** The change itself costs nothing; the regression risk is the cost. That's why evals (L341) exist and why prompt changes ship with a test run.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Output drifts from the format | The output shape wasn't specified tightly enough | Use structured outputs (L143) instead of hoping |
| Model answers when it shouldn't | No refusal behaviour in the prompt | Add "if not in context, say you don't know" |
| Extraction flips on a rephrase | Surface-form sensitivity (L140) | Pin the prompt; test the change (L341) |
| "It worked yesterday" | Prompt or model version drifted | Diff the system prompt; pin model + settings |
| Long prompt, mediocre output | Context bloat diluting attention (L138) | Cut to the shortest spec; move details to retrieval |

## 16. Quick Revision Notes

- A prompt is **an interface contract**, not a request — task, context, output shape, refusal.
- **System = rules/role, developer = tool behaviour, user = input.** Keep the system prompt stable.
- It works because **structured instructions match training patterns**; it's fragile because **the model predicts surface form**.
- The refusal line ("else say you don't know") is **the hallucination containment** (L141).
- **Treat prompts as code**: version, test, cache, eval. A prompt that isn't pinned is a moving target.

## 17. Cheat Sheet

```text
PROMPT = interface contract with a stochastic pattern-matcher

THE FOUR-PART BRIEF
  task      what to do (one clear sentence)
  context   what it may use (sources)
  output    the shape (format, length, tone)
  refusal   what to do when it can't

THE ROLES
  system      role + rules + behaviour   → cache-stable (L171)
  developer   tool behaviour             → versioned separately
  user        the actual input           → untrusted

PATTERNS THAT WORK
  few-shot    three labelled examples beat a paragraph
  delimiters  mark where the input ends
  format      name the output shape (→ L143 for guarantee)
  refusal     "if X, say Y" — never leave a gap

RULES
  shortest spec that covers the four parts
  every change is a candidate regression (L341)
  pin the prompt + model + settings together

INTERVIEW, 4 MOVES
  1 frame    "interface contract"
  2 anatomy  "system / developer / user"
  3 mechanism "pattern-matching → surface-form fragile"
  4 discipline "version, test, cache, eval"
```

## 18. Key Takeaways

> [!RECAP]
> - A prompt is an **interface contract** with a stochastic pattern-matcher: task, context, output shape, refusal — no gap left for the model to fill
> - The anatomy is **system (rules), developer (tool behaviour), user (input)** — and the system prompt should stay byte-stable because it's your cache key
> - It works because **structured instructions match training patterns**, and it's fragile for the same reason: **the model predicts surface form**
> - The refusal line is **your cheapest hallucination containment** (L141) — specify "if not in context, say you don't know"
> - **Prompts are code**: versioned, tested, cached, evaled — a prompt that isn't pinned is a moving target
> - Prompting is the **cheapest model upgrade you can ship** — a better spec beats a bigger model on many tasks

## Check your understanding

Answer these without looking back.

1. What are the four parts of a prompt-as-contract?
2. What does each message role own — and why does it matter for caching?
3. Why is a prompt fragile, mechanically?
4. What does the refusal line contain, and why is it the cheapest hallucination containment?
5. When would few-shot examples beat a paragraph of instructions?
6. Why is a bloated system prompt a *cost* problem, not just a style problem?
7. How do you ship a prompt change without risking a regression?
8. What does "prompt as product spec" mean?

## A Closing Note — The Cheapest Lever, Held Properly

Prompt engineering is where the mechanism (L135), the failure surface (L141), and the economics (L137–L138) finally meet in your hands: it is the layer that costs nothing, ships instantly, and changes everything — and the layer that, done as a vibe, quietly produces the failures you'll debug for weeks. Done as a spec — versioned, tested, cache-stable — it is the foundation every other AI pattern builds on.

The next two lessons turn the prompt from a contract into a *guarantee*: structured outputs (L143) make the output shape exact, and function calling (L144) makes the model able to act. Both are prompting — with the sharp edges machined on.
