# Lesson 141 — Model Limitations

**Interview importance:** ⭐⭐⭐⭐ — every AI interview probes the failure surface: "what goes wrong with LLMs, and how do you design around it?" This lesson is that surface, mechanism-first.

Lesson 140 mapped capability: dense regions where the model is strong, deserts where it isn't. This lesson is the other side of the same map — **the failure surface**: what goes wrong, *why* it goes wrong, and how a solutions architect designs so the failures don't reach the user. Hallucination is the headline, but it is one of a family, and the family has a single root cause.

The distinction this lesson is built on: a **user** knows "AI makes things up". A **solutions architect** can name the failure *mechanism* (generation without grounding), the *family* (hallucination, recency, miscalibration, drift, bias, fragility), and the *design response* (grounding, verification, evals, and never trusting confidence). That triad — mechanism, family, response — is the interview.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain hallucination as a *generation* failure, not a lookup error: the model continues the most probable pattern, and the pattern can be confidently wrong
- Name the failure family: hallucination, recency, miscalibration, drift, bias, prompt fragility
- Explain why confidence is not a reliable signal in an LLM
- Design for the failure surface: grounding, verification, evals, human gates, and routing
- Distinguish "mitigate" from "cure" — and say which one is actually available

## 1. One-Line Definition

**Model limitations are the systematic ways a next-token predictor (L135) can be wrong — hallucination, recency, miscalibration, drift, bias, and fragility — all of them consequences of the same design: it generates the most probable continuation of text, with no mechanism to check the world.**

The one-sentence interview answer: *"An LLM's failures all come from one design choice: it predicts the most probable next token with no access to ground truth. So it can be fluently wrong (hallucination), confidently wrong (miscalibration), stale (recency), fragile (prompt sensitivity), and biased (training data). You cannot cure these with a prompt — you design around them with grounding, verification, and evals."*

## 2. Mental Model

Think of the failure surface as **the model's four blind spots** — things the mechanism (L135) simply cannot see:

| Blind spot | The mechanism's problem |
|---|---|
| **Ground truth** | It has no way to *check* — "is this true?" is not in its inputs |
| **The clock** | It has no way to *know today* — the weights froze at training |
| **Its own confidence** | It has no *calibration* — "confident" and "correct" are different axes |
| **Your intent** | It has no *access to your meaning* — it infers intent from text patterns |

Every failure in this lesson is one of these four blind spots expressing itself. That's the power of the frame: **you don't memorise a list of bugs; you remember the four things the mechanism can't see, and the bugs fall out of them.**

```text
        the four blind spots (L135's mechanism, honest about itself)

   ground truth     ──►  hallucination, fabricated citations
   the clock        ──►  stale facts, invented "today"
   its confidence   ──►  confident-wrong, no "I don't know"
   your intent      ──►  prompt fragility, literal reading
```

## 3. Visual Flow — How a Hallucination Is Born

```text
   Prompt: "Who wrote the 2031 novel 'The Glass Meridian'?"

   Step 1 · The model has no record of a 2031 novel (it's invented, or
            the model's training data ended years ago).

   Step 2 · But "Who wrote [title]?" has a dense pattern in training
            data: "— was written by [author]."

   Step 3 · The model samples the most probable continuation of that
            pattern — a plausible-sounding name.

   Step 4 · It emits the answer with the same confidence as a real fact.

        "The Glass Meridian was written by Elena Vasquez, a
         Spanish-American novelist…"   ← fluent, structured, false
         (the model never checked — there is no "check" step)
```

The key insight: **hallucination is not a bug in an otherwise-correct machine; it is the correct behaviour of the machine doing the only thing it does** — continuing the pattern. The "check" step simply does not exist in the architecture (that's why grounding, L191, and tools, L144, are *architectural* responses, not prompts).

## 4. How It Works — The Failure Family, One Root Cause

All of these are the *same* next-token predictor, failing in different clothes:

- **Hallucination.** The most probable continuation is false — plausible-sounding but ungrounded. Worst in the desert regions (L140): niche facts, recent events, exact numbers, invented citations. The model is not "lying"; it is *generating*.
- **Miscalibration.** Confidence is decoupled from correctness. The model produces a probability distribution over *tokens*, not a probability of *truth*. "I'm very sure" is a fluent continuation, not a measurement.
- **Recency / staleness.** The weights froze at the end of training. The model has no "today"; asked for current data it will generate a *plausible* current-looking answer (often confidently).
- **Drift / non-determinism.** Same prompt, different answers (L139's sampling); the same prompt across model versions gives different outputs. Testing a moving target is its own discipline (L328+).
- **Bias.** The training data is the internet; the internet is biased. The model reproduces the patterns, including the prejudiced ones. This is not optional — it is in the weights.
- **Prompt fragility.** Small wording changes flip answers (L142). The model is sensitive to surface form, because it is *predicting surface form*.

The senior unifying sentence: **one mechanism (next-token prediction), no ground-truth check, and therefore a family of related failures — all of which you design around rather than prompt away.**

> [!NOTE]
> **What you can and cannot do.** You cannot *cure* hallucination — there is no prompt that gives the model a check step. You can *mitigate*: ground it (L191), give it tools (L144), verify outputs (L343), and gate consequential actions behind humans (L208). The interview rewards saying this distinction out loud — "we don't fix hallucination, we design so it can't reach the user."

## 5. Real Project Usage

- **Chatbots that invent company policy.** A support bot with no grounding will generate a confident-but-wrong policy answer. Fix: retrieve the actual policy (L191) and have the model answer from it — and refuse when the answer isn't in the context.
- **Code assistants that hallucinate APIs.** The model invents a method that doesn't exist or misremembers a signature. Fix: let it run the code (L144 tools), read the error, iterate — the *tool* checks the world.
- **Summarisation that fabricates.** A summary of a meeting that inserts an action item nobody said. Fix: citations and source-attribution (L192), and eval for faithfulness (L337).
- **Recency in product docs.** "What's the latest pricing?" with no tooling → invented pricing. Fix: the pricing lives in a tool/retrieval, never in the model's weights.
- **The compliance nightmare.** A regulated app (L371) cannot let an ungrounded model make a consequential statement. The failure surface *is* the design constraint.

The through-line: **every production AI feature is a bet that the failure surface can be contained — by grounding, tools, evals, and gates. The lesson is to make that containment explicit.**

## 6. Interview Explanation

Say it in four moves:

1. **The root cause.** "The model predicts the most probable continuation of text, with no mechanism to check the world. Every failure is downstream of that."
2. **The family.** "Hallucination (ungrounded but fluent), miscalibration (confident but wrong), recency (no clock), fragility (surface-form sensitivity), and bias (in the weights from the training data)."
3. **The response.** "You don't cure them with a prompt — you design around them: ground facts (L191), add tools that check (L144), verify with evals (L343), and gate consequential actions behind humans."
4. **The discipline.** "And you never trust confidence as a signal — the model's 'I'm sure' is a fluent continuation, not a measurement."

## 7. Senior-Level Insights

- **Hallucination is a *feature* of the design, not a fixable defect.** The same "generate freely" that produces creativity is what produces fabrication. The senior move is to treat it as a permanent property and architect containment.
- **The risk is asymmetric by task.** A wrong product name in a suggestion is cosmetic; a wrong dosage, a wrong legal cite, or a wrong refund amount is not. The severity of the failure surface *sets the architecture*: higher stakes → grounding + tools + human gates (L208, L324).
- **Evals are the mitigation for "we can't tell when it's wrong".** Since the model can't self-report error, you measure it — a labelled eval set, faithfulness checks (L337), and regression gates in CI (L341).
- **The failure surface is *cheaper* to design for up front than to discover in production.** "Where can this system be confidently wrong?" is a design question — answer it in the architecture review, not the incident postmortem.

## 8. Common Mistakes

- **Trying to prompt away hallucination.** "Tell the model to be honest" doesn't add a check step. Grounding and tools do.
- **Trusting the model's "I'm not sure" or "I'm confident".** Both are continuations, not measurements. Calibration is the blind spot (L140).
- **Treating "it worked in the demo" as evidence.** A fluent correct answer is the *same output* as a fluent wrong one — only the world can tell them apart. That's why evals exist.
- **Asking for recent facts with no tool.** "What's the latest X?" with the weights frozen is an invitation to a confident fabrication.
- **Ignoring drift.** "It passed last month" doesn't mean it passes today; sampling and model versions move the target (L328+).

## 9. Best Practices

- **Map the failure surface per feature.** For each task: what can go wrong, how bad is it, what contains it? Write it down — it's the design doc, not a formality.
- **Ground everything consequential.** Facts come from retrieval (L191), not the weights. If the answer isn't in the context, the model should say so.
- **Add tools that check the world.** Run the code, call the API, compute the number (L144). The model delegates the "check" to something that can actually do it.
- **Verify with evals, not vibes.** Faithfulness, groundedness, and regression sets (L337, L341) turn "it looks right" into "it is right on the test set".
- **Gate the irreversible.** Anything consequential (L208, L324) gets a human decision point — the failure surface is contained, not removed.

## 10. Interview Questions

**Q: Why do LLMs hallucinate?**
> A: Because they generate the most probable continuation of text with no mechanism to check the world. The architecture has no "verify" step — the model continues a pattern, and the pattern can be fluently wrong. It's not a bug in a correct machine; it's what the machine does when the pattern and reality disagree.

**Q: Can you fix hallucination?**
> A: Not by prompting — there's no prompt that adds a check step. You mitigate: ground answers in retrieved context (L191), give the model tools that can verify (L144), evaluate for faithfulness (L337), and gate consequential outputs behind humans. The design goal is that hallucination can't *reach* the user, not that the model never hallucinates.

**Q: Why can't I trust the model's confidence?**
> A: Confidence is a fluent continuation, not a measurement. The model outputs a probability over *tokens*; it has no probability over *truth*. So "I'm very sure" tells you about the pattern, not about reality — which is why we verify with evals instead of asking the model how sure it is.

**Q: How do you design a system that uses LLMs despite these limitations?**
> A: By making the failure surface explicit. Facts get grounded, numbers get computed by tools, code gets run, consequential actions get a human gate, and everything gets measured by evals. The model does what it's good at — language — and the architecture supplies the truth-checking it can't do.

## 11. Follow-Up Questions

- Where does recency come from mechanically, and how do you route around it?
- What's the difference between mitigating and curing hallucination?
- How would you evaluate whether your system is hallucinating in production (L328+)?
- Why is the model's output "plausible" the dangerous part, not just "wrong"?
- When is the failure surface severe enough to require a human gate?

## 12. Comparison Table — The Failure Family

| Failure | Mechanism | Feels like | Containment |
|---|---|---|---|
| Hallucination | most-probable continuation, ungrounded | fluent, confident, false | grounding (L191), tools (L144) |
| Miscalibration | no probability over truth | "I'm sure" — wrong | evals (L343), never trust confidence |
| Recency / staleness | weights froze at training | plausible "today" | tools / retrieval for current state |
| Drift | sampling + model versions | "it changed" | pinned settings, regression evals (L341) |
| Bias | training data patterns | unfair, stereotyped | data curation, red-teaming (L308+) |
| Prompt fragility | predicts surface form | rewording flips answer | prompt testing, structured outputs (L143) |

The senior read: **every row shares one root — generation without a ground-truth check — and every row's containment is the same shape: give the system a way to check, or measure, or gate.**

## 13. Code Example — Containment in Practice

```js
// The failure surface, contained: ground the facts, never trust the answer.
async function groundedAnswer(question, context) {
  // 1 · NO grounding? Refuse — the model must not guess.
  if (!context || context.length < 20) {
    return { answer: null, reason: 'no-context' };   // ← the refusal is a feature
  }

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Answer ONLY from the context. If the context does not contain ' +
          'the answer, say "I don\'t have that information." Never invent facts.',
      },
      { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` },
    ],
    temperature: 0,          // greedy — a fact question has one right answer
  });

  const answer = res.choices[0].message.content;
  return { answer, reason: 'grounded' };
}

// 2 · No "check" in the model? Add one outside it.
function isRefusal(answer) {
  // Cheap, deterministic gate: did the model say it doesn't know?
  return /don't have|no information|not in the context/i.test(answer ?? '');
}

const { answer, reason } = await groundedAnswer('What is our refund policy?', '');
console.log(reason);        // → 'no-context' — the refusal, not a guess
```

```text
What the reader must SEE — the containment is the architecture:

  no context  →  refuse (never let the model guess)
  has context →  answer from it, greedily
  "I don't know" →  detected deterministically, not trusted
```

```narrate
3-7: The refusal is the design — an ungrounded model must not answer.
11-14: The system prompt forces grounded answers; the model is not asked to know.
24-28: Refusals are detected with a cheap rule — the "check" the model can't do itself.
```

> [!TIP]
> The pattern here — *refuse when ungrounded, verify what's returned* — is the same shape in every serious AI product, from support bots to medical summarisation. The model generates; the architecture checks.

## 14. Performance Notes

- **Grounding is cheaper than retrying.** One retrieval call (L191) is far cheaper than a loop of hallucinated answers; the failure surface is a *cost* argument, not just a quality one.
- **Refusals are cheap and safe.** A "I don't have that information" costs a few tokens and preserves trust; a hallucination costs a support ticket. Design for the refusal path.
- **Evals are the only reliable regression gate.** Because the failure surface can't be felt in a demo, CI evals (L341) are what catch a model upgrade that hallucinates more. Pin settings, measure drift.
- **Human gates are the expensive containment** — reserve them for high-stakes paths (L208, L324), and make everything else grounded + verified instead.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Confident wrong fact | Ungrounded generation — the model had no context | Add retrieval (L191); never re-prompt the same way |
| "I don't know" is rare | The refusal wasn't instructed or the context is too broad | Tighten the system prompt; make "not in context" explicit |
| Stale answer ("latest pricing") | The model was asked to know the present | Route current state to a tool/API (L144) |
| Wrong but fluent summary | Faithfulness failure in synthesis | Eval for faithfulness (L337); add citations (L192) |
| Passes today, fails next week | Drift — sampling or model version moved | Pin settings; run regression evals in CI (L341) |

## 16. Quick Revision Notes

- One root cause: **generation with no ground-truth check** — every failure is downstream of it.
- **Hallucination** = fluent, ungrounded continuation. Not a bug — the design.
- **Miscalibration** = no probability over truth. Confidence is a continuation, not a measurement.
- **Recency** = no clock. Route current state to tools, never the weights.
- **Fragility, bias, drift** = surface-form prediction, training-data patterns, sampling/version movement.
- Containment, not cure: **ground, tool, verify, gate** — and measure with evals.

## 17. Cheat Sheet

```text
THE ROOT CAUSE (L135, said honestly)
  the model predicts the most probable next token
  there is no "check the world" step in the architecture

THE FAILURE FAMILY
  hallucination   fluent, ungrounded, confident
  miscalibration  "I'm sure" ≠ correct
  recency         weights froze; no clock
  fragility       rewording flips the answer
  bias            the training data's patterns, reproduced
  drift           sampling + model versions move the target

CONTAINMENT (never "cure")
  ground    facts from retrieval (L191)
  tool      numbers/code/state checked outside (L144)
  verify    evals + faithfulness (L337, L343)
  gate      humans for the consequential (L208)

RULES
  never trust confidence          → evals, not vibes
  refuse when ungrounded          → the refusal is a feature
  map the surface per feature     → severity sets the architecture
  "it worked in the demo" ≠ proof → the world is the test

INTERVIEW, 4 MOVES
  1 root    "no ground-truth check"
  2 family  "hallucination, miscalibration, recency, fragility"
  3 response "ground, tool, verify, gate"
  4 discipline "evals, never trust confidence"
```

## 18. Key Takeaways

> [!RECAP]
> - Every LLM failure comes from **one root cause**: the model generates the most probable continuation with **no mechanism to check the world**
> - The family is **hallucination, miscalibration, recency, fragility, bias, drift** — all of them the same mechanism, failing in different clothes
> - **Confidence is not a signal** — "I'm sure" is a fluent continuation, not a probability of truth
> - You **cannot cure** hallucination with a prompt; you **contain** it — ground facts, add checking tools, verify with evals, gate the consequential
> - The severity of the failure surface **sets the architecture**: higher stakes → grounding + tools + human gates
> - The senior design question is not "will it be wrong?" but **"where can it be confidently wrong — and what contains it?"**

## Check your understanding

Answer these without looking back.

1. State the root cause of the failure family in one sentence.
2. Name the six failures, and the mechanism behind each.
3. Why can't you trust the model's confidence — mechanically?
4. What's the difference between mitigating and curing hallucination?
5. Give one containment strategy for each of: facts, numbers, code, consequential actions.
6. Why is the refusal ("I don't have that information") a feature, not a bug?
7. How would you catch a model upgrade that hallucinates more?
8. What does "the severity of the failure surface sets the architecture" mean?

## A Closing Note — The Surface You Design For

The failure surface is not a list of bugs to tolerate; it is the *specification* of your architecture. Every reliable AI product is a design that answers one question well: **where can this system be confidently wrong, and what contains it?** Grounding (L191), tools (L144), evals (L343), and human gates (L208) are the containment toolkit — and every lesson from here to the capstones is a variation on them.

When you can say "the model will be fluently wrong sometimes — so my design never lets that reach the user" you have stopped describing AI and started *engineering with it*. Next: the cheapest containment of all — prompt engineering, and how instructions steer the model.
