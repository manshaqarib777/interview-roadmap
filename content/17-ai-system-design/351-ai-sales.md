# Lesson 351 — AI Sales Assistant

**Interview importance:** ⭐⭐⭐⭐⭐ — "lead triage, CRM integration, and approval-gated outreach" — the answer is *the sales design*: the leads, the CRM, and the gated outreach (L351).**

L350 built the support and L347 the protocol; this lesson is **the protocol run on sales**: the AI sales assistant — the lead triage, the CRM integration, and the approval-gated outreach (L351): the design (the protocol L347 run, L351), the triage (the lead scoring, L351), the CRM (the integration L227, L351), and the outreach (the approval-gated L324, L351). The AI shape (L173): the sales (L351) — the leads (L351) and the CRM (L227). This lesson is the sales's design (L351).

The distinction this lesson is built on: a **junior** describes the email bot. A **solutions architect** designs the flow (L351): the triage (L351), the CRM (L351), and the gated outreach (L324) — the protocol (L347) run on the sales (L351).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the clarify: the sales' requirements (L351)
- Explain the triage: the lead scoring (L351)
- Explain the CRM: the integration (L227)
- Explain the outreach: the approval-gated (L324)
- Explain the AI shape: the sales's flow (L351)

## 1. One-Line Definition

**The AI sales assistant is the protocol run on a sales product (L351) — the clarify (the users L162, the leads L351, the outreach L351, L351), the triage (the lead scoring: the fit L351, the intent L351, the routing L351), the CRM (the integration L227: the reads and the writes to the CRM L227, L351), and the outreach (the approval-gated L324: the messages drafted L351, the sends approved L324, L351) — the leads (L351), the CRM (L227), and the gated outreach (L324), architected (L351).**

The one-sentence interview answer: *"The AI sales assistant is the protocol, run (L351). The clarify (L351): the users (L162) — the sales reps (L351); the leads (L351) — the volume (L351); the outreach (L351) — the channels (L351): the email (L224), the calls (L351). The triage (L351): the lead scoring (L351) — the fit (L351): the firmographic (L351); the intent (L351): the behavioral (L351); and the routing (L351): the hot (L351) to the rep (L351), the warm (L351) to the nurture (L351). The CRM (L227): the integration (L227) — the reads (L351): the lead's (L351) history (L351); the writes (L351): the notes (L351) and the stages (L351) — the L227 integration (L227), sales-shaped (L351). The outreach (L324): the drafted messages (L351) — the AI (L351) drafts (L351); the sends (L351) — the approval-gated (L324): the high-volume (L351) or the new (L351) sends approved by the human (L208). The AI shape (L173): the sales (L351) — the triage (L351), the CRM (L227), and the gated outreach (L324) — the leads (L351) and the approvals (L324), architected (L351)."*

## 2. Mental Model

Think of the sales system as **the agency's talent desk.** The desk (the sales assistant, L351) handles the applicants (the leads, L351). The scout (the triage, L351): the screening (L351) — the fit (L351), the interest (the intent, L351), and the routing (L351): the stars (the hot, L351) to the agent (the rep, L351), the promising (the warm, L351) to the nurture (L351). The agency's books (the CRM, L227): the applicants' (L351) files (L351) — read (L351) and updated (L351). The outreach (L324): the drafted offers (L351) — the AI (L351) drafts (L351); the sends (L351) — the manager's (L208) sign-off (L324) on the big (L351) ones (L324). The agency works because the scout sorts, the books are current, and the offers are signed (L351).

```text
   the talent desk (the sales, L351)
   ┌────────────────────────────────────────────────────────┐
   │ the scout (the triage, L351) — the fit, the intent,    │
   │ the routing (L351)                                     │
   │ the books (the CRM, L227) — the files (L351)           │
   │ the offers (the outreach, L324) — the manager's        │
   │ sign-off (L208)                                        │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the talent desk**: the scout, the books, and the offers (L351).

## 3. Visual Flow — One Lead's Journey

```text
   the lead (L351)
        │
        ▼
   ┌────────────────────── THE TRIAGE (L351) ───────────────────────────┐
   │  the fit (L351) · the intent (L351) · the score (L351)            │
   │  the hot → the rep (L351) · the warm → the nurture (L351)         │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE CRM (L227) ──────────────────────────────┐
   │  the reads (L351): the lead's history (L351)                      │
   │  the writes (L351): the notes (L351), the stages (L351)           │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE OUTREACH (L324) ─────────────────────────┐
   │  the AI drafts (L351) → the approval (L324) → the send (L351)     │
   │  the high-volume or the new sends → the human (L208)              │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the lead: **triage → CRM → outreach** (L351).

## 4. How It Works — The Design, Part by Part

- **The clarify (L351).** The users (L162), the leads (L351), the outreach (L351) — the channels (L351).
- **The triage (L351).** The lead scoring (L351): the fit (L351), the intent (L351), the routing (L351).
- **The CRM (L227).** The integration (L227): the reads (L351) and the writes (L351) — the lead's (L351) data (L351).
- **The outreach (L324).** The drafted messages (L351) and the approval-gated (L324) sends (L351).

> [!NOTE]
> **The outreach is the risk's gate (L351).** The senior answer gates the outreach (L351): the AI (L351) drafts (L351) — the messages (L351) personal and grounded (L337) in the CRM's (L227) data (L351); the sends (L351) — the approval-gated (L324): the high-volume (L351) and the new (L351) sends (L351) approved by the human (L208) — the L324 control (L324), sales-shaped (L351). The unsent draft (L351) is safer than the bad send (L351).

## 5. Real Project Usage

- **A sales SaaS (L357).** The triage (L351), the CRM (L227), the gated outreach (L324).
- **A CRM integration (L227).** The reads and the writes (L351) — the notes and the stages (L351).
- **An email campaign (L224).** The drafted emails (L351) — the approval-gated (L324) sends (L351).
- **A multi-tenant sales (L357).** The per-tenant (L320) CRMs (L227) and the leads (L351).
- **Anything sales (L351).** The flow (L351) — the triage, the CRM, the gated outreach (L351).

The through-line: **the flow is the sales's** — the triage, the CRM, and the gated outreach (L351).

## 6. Interview Explanation

Say it in four moves:

1. **The clarify.** "The reps, the leads, the channels (L351)."
2. **The triage.** "The fit, the intent, the routing (L351)."
3. **The CRM.** "The reads and the writes (L227)."
4. **The outreach.** "The drafts (L351) and the approvals (L324)."

## 7. Senior-Level Insights

- **The triage is the rep's time (L351).** The routing (L351) — the hot (L351) to the rep (L351) — the rep's (L351) time (L351) on the hot (L351).
- **The CRM is the context (L227).** The integration (L227) — the lead's (L351) history (L351) — the grounded (L337) outreach (L351).
- **The draft is the AI's (L351).** The message (L351) drafted (L351) — personal (L351) and grounded (L337) — the human (L208) approves (L324).
- **The approval is the brand's gate (L324).** The sends (L351) — the high-volume (L351) and the new (L351) — the L324 control (L324), sales-shaped (L351).
- **The eval is the sales's quality (L341).** The reply rate (L351) and the conversion (L351) — the L341 suite (L341) (L351).

## 8. Common Mistakes

- **The spam bot (L351).** The mass sends (L351) without the triage (L351) — the brand (L351) and the trust (L351) hurt (L351).
- **The un-grounded outreach (L337).** The drafts (L351) without the CRM's (L227) context (L351) — the wrong lead (L351) — the CRM (L227) read (L351).
- **The un-gated sends (L324).** The high-volume (L351) automatic (L324) — the L324 gate (L324) (L351).
- **The CRM desync (L227).** The writes (L351) missed (L351) — the rep (L351) and the AI (L351) out of sync (L351).
- **The eval-less sales (L341).** The reply rate (L351) un-measured (L341) — the suite (L341) (L351).

## 9. Best Practices

- **Score the leads** (L351) — the fit (L351), the intent (L351), the routing (L351).
- **Integrate the CRM** (L227) — the reads and the writes (L351).
- **Ground the drafts** (L337) — in the CRM's (L227) context (L351).
- **Gate the sends** (L324) — the high-volume and the new (L351).
- **Eval the sales** (L341) — the reply rate (L351), the conversion (L351).

## 10. Interview Questions

**Q: Walk me through the AI sales assistant.**
> A: The protocol, run (L351). The clarify — the reps, the leads, the channels (L351). The triage — the fit, the intent, the routing (L351). The CRM — the reads and the writes (L227). And the outreach — the drafts (L351) and the approvals (L324).

**Q: How do you score the leads?**
> A: Two axes (L351): the fit (L351) — the firmographic match (L351); and the intent (L351) — the behavioral signal (L351): the visits, the downloads (L351). The score (L351) routes (L351): the hot (L351) to the rep (L351), the warm (L351) to the nurture (L351) — the rep's (L351) time (L351) on the hot (L351).

**Q: How does the CRM integration work?**
> A: The reads and the writes (L227): the lead's (L351) history (L351) read (L351) — the context (L351) for the outreach (L351); the notes (L351) and the stages (L351) written (L351) — the CRM (L227) current (L351). The L227 integration (L227), sales-shaped (L351).

**Q: When does the human approve?**
> A: The risky sends (L351): the high-volume (L351) — the blast (L351); and the new (L351) — the un-tested templates (L351). The AI (L351) drafts (L351), the human (L208) approves (L324) — the L324 control (L324), sales-shaped (L351).

## 11. Follow-Up Questions

- What's the clarify (L351)?
- How do you score the leads (L351)?
- How does the CRM integration work (L227)?
- When does the human approve (L324)?
- What's the eval (L341)?

## 12. Comparison Table — The Sales's Flow

| | The AI (L351) | The human (L208) |
|---|---|---|
| The triage (L351) | the scoring (L351) | the judgment (L208) |
| The drafts (L351) | the grounded (L337) | the brand's voice (L351) |
| The sends (L351) | the gated (L324) | the approved (L324) |
| The CRM (L227) | the integration (L227) | the ownership (L351) |

The senior read: **the AI assists, the human approves** — the gated outreach (L351).

## 13. Code Example — The Flow, Applied

```js
// The sales assistant (L351) — the triage, the CRM, the outreach (L351).
// 1 · THE TRIAGE (L351) — the lead scoring (L351).
async function scoreLead(lead) {
  const fit = await firmographicFit(lead);       // the fit (L351)
  const intent = await behavioralIntent(lead);   // the intent (L351)
  const score = fit * 0.6 + intent * 0.4;        // the score (L351)

  if (score > 0.8) return { route: 'rep', score };     // the hot (L351)
  if (score > 0.5) return { route: 'nurture', score }; // the warm (L351)
  return { route: 'park', score };
}

// 2 · THE CRM (L227) — the reads and the writes (L351).
async function crmContext(lead) {
  const history = await crm.read(lead.id);       // the reads (L227)
  return { lead, history };
}

// 3 · THE OUTREACH (L324) — the draft and the approval (L351).
async function outreach(lead) {
  const { history } = await crmContext(lead);
  const draft = await model.invoke({
    system: 'Draft a personal sales email from the lead history.',
    context: history,                           // the grounded (L337)
  });

  // THE APPROVAL (L324): the high-volume or the new sends (L351).
  if (lead.segment === 'new' || blast) {
    return approvalGate(draft, lead);           // the human (L208, L324)
  }
  await crm.write(lead.id, { note: draft, stage: 'contacted' });  // L227
  return send(draft);
}
```

```text
What the reader must SEE — the flow, applied:

  fit × 0.6 + intent × 0.4    → the scoring (L351)
  route: rep vs nurture        → the routing (L351)
  crm.read + crm.write         → the integration (L227)
  the grounded draft           → the outreach (L337, L351)
  approvalGate on the new      → the L324 gate (L324)

  The triage sorts, the CRM feeds, the outreach gates (L351).
```

```narrate
4-11: The triage — the fit and the intent scored, the lead routed (L351).
13-16: The CRM — the lead's history read (L227, L351).
18-29: The outreach — the grounded draft, the approval on the new sends, and the CRM write (L337, L324, L227).
```

> [!TIP]
> The pair that defines the sales: **the scored lead** (the triage, L351) and **the approval-gated send** (the risk, L324). **Score the leads, read the CRM, ground the drafts, gate the sends — the sales, architected (L351).**

## 14. Performance Notes

- **The triage is the lead's latency (L351).** The scoring (L351) — the sub-second (L351) routing (L351).
- **The CRM is the integration's latency (L227).** The reads (L351) — the cached (L351) history (L351).
- **The draft is the model's cost (L334).** The tokens (L332) per draft (L351) — the L334 attribution (L334) (L351).
- **The approval is the send's latency (L324).** The human (L208) — the hours (L351) for the gated (L324).

## 15. Debugging Scenarios

| Symptom | First check (L351) | The lever |
|---|---|---|
| The rep's time is wasted | The triage (L351) | The scoring (L351) |
| The outreach is off-target | The CRM (L227) | The reads (L351) |
| The drafts are wrong | The grounding (L337) | The CRM's context (L351) |
| The bad sends ship | The approval (L324) | The L324 gate (L324) |
| The quality drifts | The evals (L341) | The reply rate (L351) |

## 16. Quick Revision Notes

- The AI sales assistant = **the sales's design** (L351): the clarify, the triage, the CRM, the outreach.
- The clarify: **the reps (L162), the leads (L351), the channels (L351)**.
- The triage: **the fit (L351), the intent (L351), the routing (L351)**.
- The CRM: **the integration (L227) — the reads and the writes (L351)**.
- The outreach: **the drafts (L351) and the approvals (L324)**.

## 17. Cheat Sheet

```text
AI SALES ASSISTANT = the leads, the CRM, the gated outreach

THE CLARIFY (L351)
  the users (L162) — the sales reps (L351)
  the leads (L351) — the volume (L351)
  the outreach (L351) — the channels (L351): the email (L224), the calls

THE TRIAGE (L351)
  the lead scoring (L351): the fit (L351) — the firmographic (L351)
  the intent (L351) — the behavioral (L351)
  the routing (L351): the hot → the rep (L351),
  the warm → the nurture (L351)

THE CRM (L227)
  the integration (L227): the reads (L351) — the history (L351)
  the writes (L351) — the notes, the stages (L351)

THE OUTREACH (L324)
  the drafted messages (L351) — the AI drafts (L351)
  the sends (L351) — the approval-gated (L324):
  the high-volume (L351) and the new (L351) → the human (L208)

INTERVIEW, 4 MOVES
  1 clarify  "the reps, the leads, the channels (L351)"
  2 triage   "the fit, the intent, the routing (L351)"
  3 CRM      "the reads and the writes (L227)"
  4 outreach "the drafts and the approvals (L324)"
```

## 18. Key Takeaways

> [!RECAP]
> - The AI sales assistant is **the protocol run on a sales product** (L351): the clarify (L351), the triage (L351), the CRM (L227), and the outreach (L324)
> - **The clarify** (L351): the users (L162) — the sales reps (L351); the leads (L351); and the outreach (L351) — the channels (L351)
> - **The triage** (L351): the lead scoring (L351) — the fit (L351), the intent (L351), and the routing (L351) — the hot (L351) to the rep (L351), the warm (L351) to the nurture (L351)
> - **The CRM** (L227): the integration (L227) — the reads (L351) — the lead's history (L351) — and the writes (L351) — the notes and the stages (L351)
> - **The outreach** (L324): the drafted messages (L351) — the AI (L351) drafts (L351); the sends (L351) — the approval-gated (L324): the high-volume (L351) and the new (L351) sends approved by the human (L208)
> - The AI shape (L351): the sales (L351) — the triage (L351), the CRM (L227), and the gated outreach (L324) — the leads (L351) and the approvals (L324), architected (L351)

## Check your understanding

Answer these without looking back.

1. What's the clarify (L351)?
2. How do you score the leads (L351)?
3. How does the CRM integration work (L227)?
4. When does the human approve (L324)?
5. What's the eval (L341)?
6. What's the fit (L351)?
7. What's the intent (L351)?
8. What is the sales's flow (L351)?

## A Closing Note — The Desk, Staffed

You now hold the design: **the triage, the CRM, and the gated outreach — with the stars routed and the offers signed.** The talent desk sorts the applicants — and the manager signs the big offers (L351).

Next: the resume ingestion, the matching, and the bias — AI Recruiting Platform (L352).
