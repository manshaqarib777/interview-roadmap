# Lesson 350 — AI Customer Support

**Interview importance:** ⭐⭐⭐⭐⭐ — "tickets, escalation, and the human handoff as an architecture" — the answer is *the support design*: the triage, the resolution, and the handoff (L350).**

L349 built the RAG and L347 the protocol; this lesson is **the protocol run on support**: the AI customer support — the tickets, the escalation, and the human handoff as an architecture (L350): the design (the protocol L347 run, L350), the triage (the ticket's classification, L350), the resolution (the grounded answers L337, L350), and the handoff (the human L208, L350). The AI shape (L173): the support (L350) — the RAG (L349) answers, the human (L208) handles (L350). This lesson is the support's design (L350).

The distinction this lesson is built on: a **junior** describes the chatbot. A **solutions architect** designs the flow (L350): the triage (L350), the resolution (L350), and the handoff (L208) — the protocol (L347) run on the support (L350).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the clarify: the support's requirements (L350)
- Explain the triage: the ticket's classification (L350)
- Explain the resolution: the grounded answers (L337)
- Explain the handoff: the human (L208)
- Explain the AI shape: the support's flow (L350)

## 1. One-Line Definition

**The AI customer support is the protocol run on a support product (L350) — the clarify (the users L162, the tickets L350, the SLAs L350, L350), the triage (the ticket's classification: the category L350, the priority L350, the routing L350), the resolution (the grounded answers L337: the RAG L349 with the citations L192, L350), and the handoff (the human L208: the escalation L350 and the approval L324, L350) — the tickets (L350), the escalation (L350), and the handoff (L208), architected (L350).**

The one-sentence interview answer: *"The AI support is the protocol, run (L350). The clarify (L350): the users (L162) — the customers (L350); the tickets (L350) — the volume (L350) and the types (L350); the SLAs (L350) — the response times (L350). The triage (L350): the ticket's (L350) classification (L350) — the category (L350): the billing, the technical, the refund (L350); the priority (L350): the urgent, the normal (L350); and the routing (L350): the AI (L350) or the human (L208). The resolution (L350): the grounded answers (L337) — the RAG (L349) over the help center (L265) with the citations (L192) — the known issues (L350) resolved automatically (L350). The handoff (L208): the escalation (L350) — the AI's confidence (L139) low (L350) or the ticket (L350) high-priority (L350) → the human (L208); and the approval (L324) — the refund (L324) gated (L324). The AI shape (L173): the support (L350) — the triage (L350), the resolution (L350), and the handoff (L208) — the tickets (L350) and the human (L208), architected (L350)."*

## 2. Mental Model

Think of the support system as **the hospital's emergency room.** The ER (the support, L350) receives the patients (the tickets, L350). The intake nurse (the triage, L350): the classification (L350) — the symptoms (the category, L350), the severity (the priority, L350), the routing (L350) — the minor (L350) to the clinic (the AI, L350), the severe (L350) to the specialist (the human, L208). The clinic (the resolution, L350): the reference books (the RAG, L349) — the treatments (the grounded answers, L337) with the citations (L192). The specialist (the handoff, L208): the complex cases (L350) and the approvals (L324) — the refunds (L324). The ER works because the triage sorts, the clinic treats the minor, and the specialist takes the severe (L350).

```text
   the ER (the support, L350)
   ┌────────────────────────────────────────────────────────┐
   │ the intake (the triage, L350) — the sort and the       │
   │ routing (L350)                                         │
   │ the clinic (the resolution, L350) — the RAG (L349),    │
   │ the citations (L192)                                   │
   │ the specialist (the handoff, L208) — the escalation    │
   │ (L350), the approval (L324)                            │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the ER**: the intake, the clinic, and the specialist (L350).

## 3. Visual Flow — One Ticket's Journey

```text
   the ticket (L350)
        │
        ▼
   ┌────────────────────── THE TRIAGE (L350) ───────────────────────────┐
   │  the category (L350) · the priority (L350) · the routing (L350)   │
   │  the known → the AI (L350) · the complex → the human (L208)       │
   └──────────────┬──────────────────────────────────┬────────────────┘
                  ▼                                  ▼
   ┌──────────────────────────┐   ┌──────────────────────────────────┐
   │ THE RESOLUTION (L350)    │   │ THE HANDOFF (L208)               │
   │ the RAG (L349) over the  │   │ the human (L208) reviews (L350)  │
   │ help center (L265)       │   │ the approval (L324): the refund  │
   │ the grounded answer (L337)│  │ (L324) gated (L324)              │
   │ with the citations (L192)│   └──────────────────────────────────┘
   └──────────────────────────┘
```

The flow is the ticket: **triage → resolve or handoff** (L350).

## 4. How It Works — The Design, Part by Part

- **The clarify (L350).** The users (L162), the tickets (L350), the SLAs (L350) — the volume and the types (L350).
- **The triage (L350).** The ticket's classification (L350): the category (L350), the priority (L350), the routing (L350).
- **The resolution (L350).** The grounded answers (L337): the RAG (L349) over the help center (L265) with the citations (L192).
- **The handoff (L208).** The escalation (L350) — the low confidence (L139) or the high priority (L350) → the human (L208); the approval (L324) — the high-risk (L324).

> [!NOTE]
> **The handoff is the support's trust (L350).** The senior answer designs the handoff (L350): the AI (L350) resolves the known (L350) — the grounded (L337) and the confident (L139); the human (L208) takes the rest (L350) — the low confidence (L139), the high priority (L350), the approval (L324). The handoff (L208) — the escalation (L350) with the full context (L350): the ticket (L350), the AI's attempt (L350), the citations (L192) — the human (L208) picks up where the AI (L350) left (L350).

## 5. Real Project Usage

- **A support SaaS (L357).** The triage (L350), the resolution (L350), the handoff (L208).
- **A help center copilot (L349).** The RAG (L349) over the help center (L265) — the grounded answers (L337).
- **A refund flow (L324).** The approval (L324) — the human gate (L324) on the refund (L350).
- **A multi-tenant support (L357).** The per-tenant (L320) help centers (L265) and the tickets (L350).
- **Anything support (L350).** The flow (L350) — the triage, the resolution, the handoff (L350).

The through-line: **the flow is the support's** — the triage, the resolution, and the handoff (L350).

## 6. Interview Explanation

Say it in four moves:

1. **The clarify.** "The customers, the tickets, the SLAs (L350)."
2. **The triage.** "The category, the priority, the routing (L350)."
3. **The resolution.** "The grounded answers (L337) with the citations (L192)."
4. **The handoff.** "The escalation (L350) and the human (L208)."

## 7. Senior-Level Insights

- **The triage is the cost's lever (L350).** The routing (L350) — the known (L350) to the AI (L350), the complex (L350) to the human (L208) — the human's (L208) time (L350) saved (L350).
- **The grounded answer is the trust (L337).** The RAG (L349) with the citations (L192) — the customer (L162) verifies (L192) — the L337 grounding (L337), support-shaped (L350).
- **The confidence is the handoff's signal (L139).** The low confidence (L139) → the human (L208) — the L139 signal (L139), operational (L350).
- **The approval is the risk's gate (L324).** The refund (L324) and the high-risk (L324) — the L324 control (L324), support-shaped (L350).
- **The eval is the support's quality (L341).** The resolution rate (L350) and the groundedness (L337) — the L341 suite (L341) (L350).

## 8. Common Mistakes

- **The chatbot-only (L350).** The AI (L350) without the handoff (L208) — the complex (L350) stuck (L350).
- **The un-grounded answers (L337).** The free-form (L336) — the hallucinations (L336) — the RAG (L349) and the citations (L192) (L350).
- **The triage-less routing (L350).** The everything-to-the-human (L208) — the cost (L334) — the triage (L350) sorts (L350).
- **The un-approved refund (L324).** The refund (L324) automatic (L324) — the L324 gate (L324) (L350).
- **The eval-less support (L341).** The resolution rate (L350) un-measured (L341) — the suite (L341) (L350).

## 9. Best Practices

- **Triage the tickets** (L350) — the category, the priority, the routing (L350).
- **Ground the answers** (L337) — the RAG (L349) with the citations (L192).
- **Design the handoff** (L208) — the confidence (L139) and the priority (L350).
- **Gate the approvals** (L324) — the refund (L324) and the high-risk (L324).
- **Eval the support** (L341) — the resolution rate (L350), the groundedness (L337).

## 10. Interview Questions

**Q: Walk me through the AI customer support.**
> A: The protocol, run (L350). The clarify — the customers, the tickets, the SLAs (L350). The triage — the category, the priority, the routing (L350). The resolution — the grounded answers (L337) with the citations (L192). And the handoff — the escalation (L350) and the human (L208).

**Q: How do you design the triage?**
> A: The classification (L350): the category (L350) — the billing, the technical, the refund (L350); the priority (L350) — the urgent, the normal (L350); and the routing (L350) — the known and the confident (L139) to the AI (L350), the complex and the high-priority (L350) to the human (L208). The triage (L350) is the cost's (L334) lever (L350).

**Q: How do you keep the answers grounded?**
> A: The RAG (L349): the help center (L265) documents (L176) ingested (L349) — the answers (L350) grounded (L337) in the retrieval (L189) with the citations (L192) — the customer (L162) verifies (L192). The low-groundedness (L337) → the handoff (L208) (L350).

**Q: When does the human take over?**
> A: Three signals (L350): the confidence (L139) — the AI's (L139) low (L350); the priority (L350) — the urgent (L350); and the action (L324) — the refund (L324) and the high-risk (L324) gated (L324). The handoff (L208) carries the full context (L350): the ticket (L350), the AI's attempt (L350), the citations (L192).

## 11. Follow-Up Questions

- What's the clarify (L350)?
- How do you design the triage (L350)?
- How do you keep the answers grounded (L337)?
- When does the human take over (L208)?
- What's the approval (L324)?

## 12. Comparison Table — The AI vs the Human

| | The AI (L350) | The human (L208) |
|---|---|---|
| The tickets (L350) | the known (L350) | the complex (L350) |
| The speed (L350) | the instant (L350) | the SLA's (L350) |
| The cost (L334) | the tokens (L332) | the hours (L350) |
| The trust (L350) | the grounded (L337) | the judgment (L208) |

The senior read: **the AI for the known, the human for the rest** — the handoff (L208) between (L350).

## 13. Code Example — The Flow, Applied

```js
// The support flow (L350) — the triage, the resolution, the handoff (L350).
// 1 · THE TRIAGE (L350) — the classification (L350).
async function triage(ticket) {
  const cls = await classify(ticket);           // the category + the priority (L350)
  const confidence = await intentConfidence(ticket);   // the confidence (L139)

  // THE ROUTING (L350): the known and the confident → the AI (L350).
  if (cls.known && confidence > 0.8) return { route: 'ai', cls };
  return { route: 'human', cls };               // the handoff (L208)
}

// 2 · THE RESOLUTION (L350) — the grounded answer (L337).
async function resolve(ticket) {
  const chunks = await retrieve(ticket.tenantId, ticket.text);  // L189
  const answer = await model.invoke({
    ticket: ticket.text,
    context: chunks,                            // the RAG (L349)
  });
  return {
    answer,
    citations: chunks.map((c) => c.source),     // the citations (L192)
    groundedness: await scoreGroundedness(answer, chunks),  // L337
  };
}

// 3 · THE HANDOFF (L208) — the escalation (L350).
async function handle(ticket) {
  const { route } = await triage(ticket);
  if (route === 'human') return escalate(ticket, 'complex');   // L350, L208

  const resolved = await resolve(ticket);
  if (resolved.groundedness < 0.85) return escalate(ticket, 'low-confidence');  // L350

  // THE APPROVAL (L324) — the refund gated (L324).
  if (ticket.type === 'refund') return approvalGate(ticket, resolved);  // L324

  return resolved.answer;
}
```

```text
What the reader must SEE — the flow, applied:

  classify + confidence      → the triage (L350, L139)
  route: ai vs human         → the routing (L350)
  retrieve + groundedness    → the resolution (L337, L189)
  escalate on the low        → the handoff (L208, L350)
  approvalGate on the refund → the L324 gate (L324)

  The triage sorts, the AI resolves, the human takes the rest (L350).
```

```narrate
4-10: The triage — the classification and the confidence, routed (L350, L139).
12-22: The resolution — the RAG-grounded answer with the citations (L349, L192, L337).
24-32: The handoff — the escalation on the low confidence and the approval on the refund (L208, L324).
```

> [!TIP]
> The pair that defines the support: **the confidence-routed triage** (the sorting, L139) and **the grounded resolution** (the trust, L337). **Triage the tickets, ground the answers, escalate the low, gate the refunds — the support, architected (L350).**

## 14. Performance Notes

- **The triage is the ticket's latency (L350).** The classification (L350) — the sub-second (L350) routing (L350).
- **The resolution is the RAG's (L349).** The retrieval (L189) and the model (L278) — the TTFT (L145) — the cached (L171) answers (L350).
- **The handoff is the human's SLA (L350).** The escalation (L350) — the L208 workflow (L208) — the SLA (L350) tracked (L350).
- **The eval is the support's cost (L341).** The resolution rate (L350) — the tokens (L332) per ticket (L350).

## 15. Debugging Scenarios

| Symptom | First check (L350) | The lever |
|---|---|---|
| The answers hallucinate | The grounding (L337) | The RAG (L349), the citations (L192) |
| The complex tickets stuck | The handoff (L208) | The escalation (L350) |
| The humans overwhelmed | The triage (L350) | The routing (L350) |
| The refunds leak | The approval (L324) | The L324 gate (L324) |
| The quality drifts | The evals (L341) | The resolution rate (L350) |

## 16. Quick Revision Notes

- The AI customer support = **the support's design** (L350): the clarify, the triage, the resolution, the handoff.
- The clarify: **the customers (L162), the tickets (L350), the SLAs (L350)**.
- The triage: **the category, the priority, the routing (L350)**.
- The resolution: **the grounded answers (L337) with the citations (L192)**.
- The handoff: **the escalation (L350) and the human (L208)**.

## 17. Cheat Sheet

```text
AI CUSTOMER SUPPORT = the tickets, the escalation, the handoff

THE CLARIFY (L350)
  the users (L162) — the customers (L350)
  the tickets (L350) — the volume, the types (L350)
  the SLAs (L350) — the response times (L350)

THE TRIAGE (L350)
  the category (L350) — the billing, the technical, the refund (L350)
  the priority (L350) — the urgent, the normal (L350)
  the routing (L350) — the known → the AI (L350),
  the complex → the human (L208)

THE RESOLUTION (L350)
  the grounded answers (L337) — the RAG (L349)
  over the help center (L265) with the citations (L192)
  the known issues (L350) resolved automatically (L350)

THE HANDOFF (L208)
  the escalation (L350) — the low confidence (L139),
  the high priority (L350) → the human (L208)
  the approval (L324) — the refund (L324) gated (L324)

INTERVIEW, 4 MOVES
  1 clarify   "the customers, the tickets, the SLAs (L350)"
  2 triage    "the category, the priority, the routing (L350)"
  3 resolution "the grounded answers with the citations (L337)"
  4 handoff   "the escalation and the human (L208)"
```

## 18. Key Takeaways

> [!RECAP]
> - The AI customer support is **the protocol run on a support product** (L350): the clarify (L350), the triage (L350), the resolution (L350), and the handoff (L208)
> - **The clarify** (L350): the users (L162), the tickets (L350), and the SLAs (L350)
> - **The triage** (L350): the ticket's classification (L350) — the category (L350), the priority (L350), and the routing (L350) — the known (L350) to the AI (L350), the complex (L350) to the human (L208)
> - **The resolution** (L350): the grounded answers (L337) — the RAG (L349) over the help center (L265) with the citations (L192)
> - **The handoff** (L208): the escalation (L350) — the low confidence (L139) or the high priority (L350) → the human (L208); and the approval (L324) — the refund (L324) gated (L324)
> - The AI shape (L350): the support (L350) — the triage (L350), the resolution (L350), and the handoff (L208) — the tickets (L350) and the human (L208), architected (L350)

## Check your understanding

Answer these without looking back.

1. What's the clarify (L350)?
2. How do you design the triage (L350)?
3. How do you keep the answers grounded (L337)?
4. When does the human take over (L208)?
5. What's the approval (L324)?
6. What's the confidence (L139)?
7. What's the escalation (L350)?
8. What is the support's flow (L350)?

## A Closing Note — The ER, Flowing

You now hold the design: **the triage, the resolution, and the handoff — with the minor treated and the severe escalated.** The emergency room sorts — and the specialist takes the complex (L350).

Next: the lead triage, the CRM integration, and the approval-gated outreach — AI Sales Assistant (L351).
