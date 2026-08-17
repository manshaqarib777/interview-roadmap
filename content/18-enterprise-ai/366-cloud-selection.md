# Lesson 366 — Cloud Selection

**Interview importance:** ⭐⭐⭐⭐⭐ — "AWS vs Azure vs GCP for AI, and the exit-cost question" — the answer is *the cloud choice*: the services, the economics, and the exit (L366).**

L364 selected the vendors; this lesson is **the platform vendor**: the cloud selection — the AWS vs the Azure vs the GCP for the AI, and the exit-cost question (L366): the clouds (the AWS L261, the Azure L366, the GCP L366), the axes (the AI services, the economics, the exit, L366), and the decision (the ADR L361, L366). The AI shape (L173): the enterprise (L380) — the cloud (L366) hosting the stack (L287). This lesson is the cloud's choice (L366).

The distinction this lesson is built on: a **junior** picks the familiar. A **solutions architect** evaluates the axes (L366): the AI services (L366), the economics (L366), and the exit (L366) — because the cloud (L366) is the long-term (L366) home (L366).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the clouds: the AWS, the Azure, the GCP (L366)
- Explain the AI axes: the Bedrock, the OpenAI-on-Azure, the Vertex (L366)
- Explain the economics: the pricing and the commitment (L366)
- Explain the exit: the portability (L377)
- Explain the AI shape: the cloud's choice (L366)

## 1. One-Line Definition

**The cloud selection is the AWS vs the Azure vs the GCP for the AI, and the exit-cost question (L366) — the clouds (the AWS L261, the Azure L366, the GCP L366), the AI axes (the Bedrock L278, the Azure OpenAI L366, the Vertex L366, L366), the economics (the pricing L366, the commitment L285, the egress L285, L366), and the exit (the portability L377: the containers L288, the K8s L306, the OTel L346, L366) — the enterprise's (L380) home, chosen (L366).**

The one-sentence interview answer: *"The cloud selection is the platform's choice (L366). The clouds (L366): the AWS (L261), the Azure (L366), the GCP (L366) — each with the AI (L366): the AWS's Bedrock (L278), the Azure's OpenAI (L366), the GCP's Vertex (L366). The axes (L366): the AI services (L366) — the model access (L278) and the AI stack (L283); the economics (L366) — the pricing (L366), the commitment (L285) — the reserved (L285) — and the egress (L285) — the data out (L261); and the enterprise (L366) — the compliance (L371), the support (L366), the existing (L366) investments (L366). The exit (L377): the portability (L377) — the containers (L288), the K8s (L306), the OTel (L346) — the exit cost (L366) minimized (L377). The decision (L361): the scored table (L362) — the axes (L366) weighted (L362) — the ADR (L361). The AI shape (L173): the enterprise (L380) — the cloud (L366) hosting the L287 stack (L287) — the AI services (L366), the economics (L366), and the exit (L377), evaluated (L366)."*

## 2. Mental Model

Think of the cloud selection as **the city's location decision.** The company (the enterprise, L380) chooses the city (the cloud, L366): the AWS (L261), the Azure (L366), the GCP (L366). The city's offerings (the axes, L366): the power plants (the AI services, L366) — the Bedrock (L278), the Azure's OpenAI (L366), the Vertex (L366); the taxes (the economics, L366) — the rates (L366), the commitments (L285), the tolls (the egress, L285); and the moving costs (the exit, L377) — the portability (L377): the standard containers (L288), the standard rails (L346). The company (L366) visits (the PoC, L366), costs (L368), and signs the lease (the ADR, L361). The city works because the plants are strong, the taxes are known, and the moving is cheap (L366).

```text
   the city (the cloud, L366)
   ┌────────────────────────────────────────────────────────┐
   │ the cities (L366) — the AWS (L261), the Azure, the GCP │
   │ the plants (the AI services, L366) — the Bedrock       │
   │ (L278), the Vertex (L366)                              │
   │ the taxes (the economics, L366) · the moving (the      │
   │ exit, L377)                                            │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the city**: the cities, the plants, and the moving (L366).

## 3. Visual Flow — One Cloud Decision

```text
   the requirement (L359)
        │  the AI stack (L287) to host
        ▼
   ┌────────────────────── THE SHORTLIST (L366) ────────────────────────┐
   │  the AWS (L261) · the Azure (L366) · the GCP (L366)               │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE AXES (L366) ─────────────────────────────┐
   │  the AI services (L366): the Bedrock (L278), the Azure OpenAI,    │
   │  the Vertex — the fit (L362)                                      │
   │  the economics (L366): the pricing (L366), the commitment (L285), │
   │  the egress (L285)                                                │
   │  the exit (L377): the portability (L377) — the containers (L288)  │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE DECISION (L361) ─────────────────────────┐
   │  the scored table (L362) → the ADR (L361): the cloud (L366)       │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the decision: **shortlist → axes → decision** (L366).

## 4. How It Works — The Choice, Part by Part

- **The clouds (L366).** The AWS (L261), the Azure (L366), the GCP (L366) — each with the AI (L366).
- **The AI axes (L366).** The Bedrock (L278), the Azure OpenAI (L366), the Vertex (L366) — the model access (L148) and the AI stack (L283).
- **The economics (L366).** The pricing (L366), the commitment (L285), the egress (L285).
- **The exit (L377).** The portability (L377): the containers (L288), the K8s (L306), the OTel (L346).

> [!NOTE]
> **The exit cost is the cloud's long-term question (L366).** The senior answer asks the exit (L366): the cloud (L366) is the long-term (L366) home (L366) — the exit (L377) — the migration (L366) to the next (L366) — the cost (L366): the proprietary (L366) services (L366) — the Bedrock (L278), the DynamoDB (L366) — vs the portable (L377): the containers (L288), the K8s (L306), the OTel (L346). The portability (L377) — the standard (L346) — the exit cost (L366) minimized (L377).

## 5. Real Project Usage

- **An enterprise engagement (L379).** The cloud (L366) — the AWS (L261) vs the Azure (L366) — the scored table (L362).
- **A model access decision (L148).** The Bedrock (L278) vs the Azure OpenAI (L366) — the AI axis (L366).
- **A cost review (L368).** The commitment (L285) and the egress (L285) — the economics (L366).
- **A migration (L377).** The exit (L366) — the portability (L377) — the containers (L288).
- **Anything enterprise (L380).** The cloud's choice (L366) — the axes and the ADR (L366).

The through-line: **the choice is the cloud's** — the AI, the economics, and the exit (L366).

## 6. Interview Explanation

Say it in four moves:

1. **The clouds.** "The AWS (L261), the Azure (L366), the GCP (L366)."
2. **The AI axes.** "The Bedrock (L278), the Azure OpenAI, the Vertex (L366)."
3. **The economics.** "The pricing, the commitment (L285), the egress (L285)."
4. **The exit.** "The portability (L377) — the containers (L288), the OTel (L346)."

## 7. Senior-Level Insights

- **The AI services are the fit (L366).** The Bedrock (L278) and the Vertex (L366) — the model access (L148) — the L283 stack (L283) — the fit (L362) axis (L366).
- **The commitment is the cost's (L285).** The reserved (L285) — the steady load (L358) at the discount (L285) — the L285 lever (L285), cloud-shaped (L366).
- **The egress is the hidden cost (L285).** The data out (L261) — the L285 line (L285) — the multi-cloud (L377) traffic (L366).
- **The portability is the exit's (L377).** The containers (L288) and the OTel (L346) — the standard (L346) — the exit (L366) cheap (L377).
- **The ADR is the record (L361).** The scored table (L362) — the choice (L361) — the reviewable (L361) decision (L366).

## 8. Common Mistakes

- **The familiar picked (L366).** The known cloud (L366) without the axes (L366) — the AI services (L366) un-compared (L366).
- **The AI axis ignored (L366).** The infra (L366) compared (L366), the model access (L278) forgotten (L366) — the AI stack (L283) is the fit (L362).
- **The egress hidden (L285).** The compute (L366) compared (L366), the egress (L285) forgotten (L366) — the L285 line (L285) (L366).
- **The lock-in ignored (L377).** The proprietary (L366) services (L366) — the exit (L377) — the portability (L377) (L366).
- **The ADR-less (L361).** The choice (L366) un-recorded (L361) — the review (L361) impossible (L366).

## 9. Best Practices

- **Compare the AI services** (L366) — the Bedrock (L278), the Vertex (L366).
- **Cost the economics** (L368) — the pricing (L366), the commitment (L285), the egress (L285).
- **Plan the exit** (L377) — the portability (L377): the containers (L288), the OTel (L346).
- **Weight the axes** (L362) — the scored table (L362).
- **Record the ADR** (L361) — the choice (L366), reviewable (L361).

## 10. Interview Questions

**Q: Walk me through the cloud selection.**
> A: The platform's choice (L366). The clouds — the AWS (L261), the Azure (L366), the GCP (L366). The AI axes — the Bedrock (L278), the Azure OpenAI, the Vertex (L366). The economics — the pricing, the commitment (L285), the egress (L285). And the exit — the portability (L377).

**Q: How do you compare the AI services?**
> A: The fit (L362): the model access (L148) — the Bedrock (L278) vs the Azure OpenAI (L366) vs the Vertex (L366) — the model's (L148) choice (L148) and the routing (L155); and the AI stack (L283) — the serverless (L283), the RAG (L280), the observability (L346). The AI services (L366) are the cloud's (L366) AI fit (L362).

**Q: What's the exit cost?**
> A: The migration (L366): the proprietary (L366) services (L366) — the Bedrock (L278), the DynamoDB (L366) — vs the portable (L377): the containers (L288), the K8s (L306), the OTel (L346). The portability (L377) — the standard (L346) — the exit (L366) cheap (L377). The exit question (L366) is the long-term (L366) cost (L366).

**Q: How do you decide?**
> A: The axes (L366) weighted (L362): the AI services (L366), the economics (L366), the exit (L377) — the scored table (L362) — the ADR (L361) — the choice (L366) reviewable (L361). The PoC (L366) — the golden set (L342) on each (L366) — the evidence (L364).

## 11. Follow-Up Questions

- What are the clouds (L366)?
- How do you compare the AI services (L366)?
- What's the exit cost (L377)?
- How do you decide (L366)?
- What's the commitment (L285)?

## 12. Comparison Table — The Clouds' AI

| | The AWS (L261) | The Azure (L366) | The GCP (L366) |
|---|---|---|---|
| The AI (L366) | the Bedrock (L278) | the OpenAI (L366) | the Vertex (L366) |
| The model access (L148) | the many (L278) | the OpenAI (L152) | the Gemini (L154) |
| The enterprise (L366) | the AWS (L261) | the Microsoft (L366) | the Google (L366) |

The senior read: **the AI fit and the enterprise's existing stack** (L366).

## 13. Code Example — The Choice, Applied

```js
// The cloud selection (L366) — the axes and the ADR (L366).
// 1 · THE SHORTLIST (L366) — the clouds (L366).
const shortlist = [
  { id: 'aws',   ai: 'bedrock',  egress: '$0.09/GB', commitment: '1yr' },   // L261, L278
  { id: 'azure', ai: 'openai',   egress: '$0.087/GB', commitment: '1yr' },  // L366
  { id: 'gcp',   ai: 'vertex',   egress: '$0.085/GB', commitment: '1yr' },  // L366
];

// 2 · THE AXES (L366) — the weighted scores (L362).
const axes = {
  aiServices:  { weight: 0.4, score: (c) => aiFitScore(c.ai) },    // L366, L362
  economics:   { weight: 0.3, score: (c) => costScore(c) },        // L368
  exit:        { weight: 0.3, score: (c) => portabilityScore(c) }, // L377
};

// 3 · THE SCORE (L362) — the weighted sum (L362).
const ranked = shortlist
  .map((c) => ({ ...c, total: score(c, axes) }))
  .sort((a, b) => b.total - a.total);
// the aws wins — the Bedrock (L278) and the L287 stack (L287)

// 4 · THE ADR (L361) — the choice recorded (L361).
//   ADR-032: the AWS — the Bedrock (L278) fit, the commitment (L285),
//   the exit (L377) via the containers (L288) and the OTel (L346)
```

```text
What the reader must SEE — the choice, applied:

  the 3-cloud shortlist       → the candidates (L366)
  aiServices 0.4 + economics + exit → the axes (L362)
  the weighted total          → the score (L362)
  aws wins → the ADR          → the record (L361)

  The AI, the economics, and the exit — evaluated (L366).
```

```narrate
4-7: The shortlist — the clouds with their AI and their economics (L366).
9-12: The axes — the AI services, the economics, and the exit weighted (L362).
14-18: The score — the weighted ranking (L362).
20-22: The ADR — the choice recorded with the rationale (L361).
```

> [!TIP]
> The pair that defines the choice: **the AI-service fit** (the Bedrock vs the Vertex, L366) and **the portability score** (the exit, L377). **Compare the AI, cost the economics, plan the exit, record the ADR — the cloud's choice (L366).**

## 14. Performance Notes

- **The AI fit is the stack's (L366).** The Bedrock (L278) — the L283 stack (L283) — the fit (L362) axis (L366).
- **The commitment is the cost's (L285).** The reserved (L285) — the steady (L358) at the discount (L285).
- **The egress is the traffic's (L285).** The data out (L261) — the multi-cloud (L377) — the L285 line (L285) (L366).
- **The portability is the exit's (L377).** The containers (L288) — the migration (L366) cheap (L377).

## 15. Debugging Scenarios

| Symptom | First check (L366) | The lever |
|---|---|---|
| The AI stack doesn't fit | The AI services (L366) | The Bedrock (L278), the Vertex (L366) |
| The bill explodes | The economics (L366) | The commitment (L285), the egress (L285) |
| The migration is hard | The exit (L377) | The portability (L377) |
| The choice is disputed | The ADR (L361) | The scored table (L362) |
| The compliance fails | The cloud (L371) | The residency (L261) |

## 16. Quick Revision Notes

- The cloud selection = **the cloud's choice** (L366): the clouds, the AI axes, the economics, the exit.
- The clouds: **the AWS (L261), the Azure (L366), the GCP (L366)**.
- The AI axes: **the Bedrock (L278), the Azure OpenAI, the Vertex (L366)**.
- The economics: **the pricing (L366), the commitment (L285), the egress (L285)**.
- The exit: **the portability (L377) — the containers (L288), the OTel (L346)**.

## 17. Cheat Sheet

```text
CLOUD SELECTION = the AWS vs the Azure vs the GCP for AI

THE CLOUDS (L366)
  the AWS (L261) · the Azure (L366) · the GCP (L366)
  each with the AI (L366)

THE AI AXES (L366)
  the Bedrock (L278) — the many models (L278)
  the Azure OpenAI (L366) — the OpenAI (L152)
  the Vertex (L366) — the Gemini (L154)
  the fit (L362) — the AI stack (L283)

THE ECONOMICS (L366)
  the pricing (L366) · the commitment (L285) — the reserved (L285)
  the egress (L285) — the data out (L261)

THE EXIT (L377)
  the portability (L377): the containers (L288), the K8s (L306),
  the OTel (L346)
  the exit cost (L366) — minimized (L377)

THE DECISION (L361)
  the scored table (L362) — the weighted axes (L362)
  the ADR (L361) — the choice (L366)

INTERVIEW, 4 MOVES
  1 clouds  "the AWS, the Azure, the GCP (L366)"
  2 AI axes "the Bedrock, the Azure OpenAI, the Vertex (L366)"
  3 economics "the pricing, the commitment, the egress (L366)"
  4 exit    "the portability (L377)"
```

## 18. Key Takeaways

> [!RECAP]
> - The cloud selection is **the AWS vs the Azure vs the GCP for the AI, and the exit-cost question** (L366): the clouds (L366), the AI axes (L366), the economics (L366), and the exit (L377)
> - **The clouds** (L366): the AWS (L261), the Azure (L366), and the GCP (L366) — each with the AI (L366)
> - **The AI axes** (L366): the Bedrock (L278), the Azure OpenAI (L366), and the Vertex (L366) — the model access (L148) and the AI stack (L283)
> - **The economics** (L366): the pricing (L366), the commitment (L285), and the egress (L285)
> - **The exit** (L377): the portability (L377) — the containers (L288), the K8s (L306), the OTel (L346) — the exit cost (L366) minimized (L377)
> - The decision (L361): the scored table (L362) — the weighted axes (L362) — the ADR (L361) — the enterprise's (L380) home, chosen (L366)

## Check your understanding

Answer these without looking back.

1. What are the clouds (L366)?
2. How do you compare the AI services (L366)?
3. What's the exit cost (L377)?
4. How do you decide (L366)?
5. What's the commitment (L285)?
6. What's the egress (L285)?
7. What's the portability (L377)?
8. What is the cloud's choice (L366)?

## A Closing Note — The City, Chosen

You now hold the choice: **the clouds, the AI axes, the economics, and the exit — with the plants compared and the moving cheap.** The company signed the lease — and the city's address is in the logbook (L366).

Next: the named trade-off is the senior deliverable — Architecture Trade-offs (L367).
