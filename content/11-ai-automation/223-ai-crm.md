# Lesson 223 — AI + CRM

**Interview importance:** ⭐⭐⭐⭐ — "what's the highest-ROI AI automation?" — the answer is the CRM: lead scoring, enrichment, and follow-up — the integration where AI earns its keep (L217, L230).**

L217's integrations start here: **AI + CRM** — the highest-ROI automation (L223). Three patterns: **lead scoring** (the model ranks the leads — L163), **enrichment** (the model fills the company and contact data — L163), and **follow-up** (the model drafts the outreach — L224). The discipline is the same as every workflow (L217): the triggers (L220), the AI steps (L163), the approval gates (L228), and the audit (L322).

The distinction this lesson is built on: a **demo** pipes the CRM into a chat. A **solutions architect** designs the CRM workflows: the event triggers (L220), the scoring and enrichment contracts (L163), the follow-up's human gate (L228), and the data hygiene (L180) — because the CRM is the business's memory (L223).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the CRM's three AI patterns: scoring, enrichment, follow-up (L223)
- Design the scoring workflow: the contract, the model, the output (L163)
- Design the enrichment workflow: the data contract (L163, L180)
- Design the follow-up gate: human approval before send (L228)
- Explain the CRM's place: the business's memory (L223, L230)

## 1. One-Line Definition

**AI + CRM is the highest-ROI automation — lead scoring (the model ranks the leads, L163), enrichment (the model fills the data, L163), and follow-up (the model drafts the outreach, L224) — each a workflow (L217) with event triggers (L220), defined contracts (L163), human gates before the send (L228), and the audit trail (L322), because the CRM is the business's memory (L230).**

The one-sentence interview answer: *"AI + CRM is the highest-ROI automation (L223). Three patterns. Lead scoring — the model ranks the new leads by fit: a workflow (L217) triggered by the lead event (L220), scoring against the contract (L163) — the score feeds the routing (L230). Enrichment — the model fills the company and contact data (L163) from the web (L227), validated against the schema (L143). Follow-up — the model drafts the outreach (L224), and the human approves before the send (L228) — the draft is gated, the send is the human's (L208). The discipline is every workflow's (L217): the triggers (L220), the contracts (L163), the gates (L228), and the audit (L322) — the CRM's changes are traced (L213), because the CRM is the business's memory (L230)."*

## 2. Mental Model

Think of the CRM as **the business's address book — and the AI as its clerk.** The clerk (the workflows, L217) does three jobs. Scoring: a new name is added (the lead event, L220), and the clerk ranks it — hot, warm, cold — against the profile the business cares about (L163). Enrichment: the clerk looks up the company, the industry, the size (L227) and fills in the card (L163). Follow-up: the clerk drafts the note (L224) — but the manager (the human, L228) signs the letter before it's mailed (L208). The address book stays clean (L180), and every change is in the ledger (L322).

```text
   the clerk (the workflows, L217)          the manager (the human, L228)
   ┌──────────────────────────────┐         ┌──────────────────────────────┐
   │ score the leads (L163)       │         │ approves the follow-up       │
   │ enrich the contacts (L163)   │  ────►  │ before the send (L208, L228) │
   │ draft the outreach (L224)    │         │ the ledger records it (L322) │
   └──────────────────────────────┘         └──────────────────────────────┘
```

The mental model is **the clerk and the manager**: the AI does the scoring, enrichment, and drafting; the human signs the sends (L223).

## 3. Visual Flow — The Three CRM Workflows

```text
   the lead event arrives (L220)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · SCORE (L163)                                         │
   │     the model ranks the lead — hot / warm / cold (L163)  │
   │     the score routes: hot → follow-up, cold → nurture     │
   │     (L230)                                               │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · ENRICH (L163)                                        │
   │     the model fills the company and contact data (L227)  │
   │     validated against the schema (L143)                  │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · DRAFT + GATE (L224, L228)                            │
   │     the model drafts the follow-up (L224)                │
   │     the HUMAN approves before the send (L208, L228)      │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   the send + the audit record (L322) — the CRM updated (L180)
```

The flow is the three patterns: **score → enrich → draft + gate** — the clerk's jobs, with the manager at the send (L223).

## 4. How It Works — The Three Patterns

- **Lead scoring (L163).** The model ranks the new leads by fit: the workflow (L217) triggers on the lead event (L220), the scoring step (L163) evaluates the lead against the scoring contract (L163) — firmographic fit, intent signals, engagement — and outputs a score and a reason (L143). The score routes the lead (L230): hot leads to follow-up, cold leads to nurture (L223).
- **Enrichment (L163).** The model fills the gaps: company data (L227), contact details, the industry — validated against the schema (L143) and merged without duplication (L180). The enriched CRM is the memory the other workflows read (L223).
- **Follow-up (L224, L228).** The model drafts the outreach (L224) — personalized from the enriched data (L163) — and the human approves before the send (L228). The draft is the AI's; the send is the human's (L208).
- **The discipline (L217, L322).** Every pattern is a workflow (L217): the trigger (L220), the AI step's contract (L163), the gate (L228), and the audit — the CRM's changes are traced (L322), because the CRM is the business's memory (L230).

> [!NOTE]
> **The follow-up gate is the CRM's trust rule (L228).** An AI that *writes* to prospects is sending on the business's behalf (L324) — a wrong send is a burned relationship and a compliance issue (L312). The senior design gates the send: the model drafts (L224), the human approves or edits (L208), and only then does the email go (L228). Scoring and enrichment run free (L163); the *outreach* waits for the human (L228) — the same HITL threshold (L208) applied to the CRM's voice (L223).

## 5. Real Project Usage

- **Lead scoring (L163).** A new lead → the webhook (L220) → the scoring workflow (L217) → the hot lead routes to sales (L230).
- **Enrichment (L163).** The nightly job (L221) enriches the new contacts (L227) → the CRM stays complete (L180).
- **Follow-up (L224, L228).** The hot lead's outreach is drafted (L224) → the rep approves (L228) → the send (L227).
- **Renewal risk.** The model flags the at-risk accounts (L163) → the retention workflow (L217) drafts the outreach → the gate (L228).
- **Anything sales (L230).** The CRM is the memory (L230) — the scoring, enrichment, and follow-up are its AI clerk (L223).

The through-line: **the CRM is the business's memory, and the AI is its clerk** — scoring, enriching, and drafting with the human at the sends (L223).

## 6. Interview Explanation

Say it in four moves:

1. **The three patterns.** "Scoring (L163), enrichment (L163), follow-up (L224)."
2. **The workflows.** "Each is a workflow (L217): the trigger (L220), the AI step's contract (L163), the gate (L228)."
3. **The gate.** "The draft is the AI's; the send is the human's (L208, L228)."
4. **The memory.** "The CRM is the business's memory (L230) — clean (L180), traced (L322)."

## 7. Senior-Level Insights

- **The CRM is the business's memory (L230).** The senior answer treats the CRM as the system of record (L223) — the workflows read it (L163), write it (L180), and the data's quality is the automation's quality (L195).
- **The scoring contract is the business's definition of a lead (L163).** The scoring step (L163) encodes *what a good lead is* (L143) — the senior design writes the contract with the sales team (L229), not in a vacuum (L223).
- **Enrichment is a data-quality workflow (L180).** The enrichment's schema (L143), dedup (L255), and validation (L180) are the CRM's hygiene (L223) — garbage in, bad scoring out (L196).
- **The gate is the trust threshold (L228).** The AI writes on the business's behalf (L324) — the senior design gates the sends (L208), because a burned prospect is a burned relationship (L228).
- **The audit is the compliance story (L322).** The CRM's changes (L322) and the sends (L228) are traced (L213) — the governance (L373) of the sales process (L223).

## 8. Common Mistakes

- **AI sending unprompted (L228).** The draft goes without the gate (L208) — the burned relationship and the compliance issue (L312).
- **No scoring contract (L163).** The model ranks without a defined "good lead" (L143) — the score is vibes (L196).
- **Enrichment without validation (L180).** The model's data merged raw (L143) — the CRM's quality degrades (L196).
- **Duplicates (L255).** The same contact enriched twice (L255) — the dedup missing (L180).
- **No audit (L322).** The CRM's changes and sends untraced (L213) — the compliance story gone (L373).
- **The CRM as a chat target (L230).** Piping the whole CRM into a prompt (L149) — the workflows (L217) and their contracts (L163) skipped (L223).

## 9. Best Practices

- **Define the scoring contract with sales** (L163, L229) — what a good lead is (L143).
- **Enrich against a schema** (L143) — validated, deduplicated (L255), merged cleanly (L180).
- **Gate every send** (L228) — the draft is the AI's, the send is the human's (L208).
- **Trace the changes** (L322) — the CRM's memory is auditable (L213).
- **Route by the score** (L230) — hot to follow-up, cold to nurture (L223).
- **Keep the workflows contract-first** (L163, L217) — the L217 discipline (L230).

## 10. Interview Questions

**Q: What's the highest-ROI AI automation?**
> A: The CRM (L223). Three patterns: lead scoring — the model ranks the leads (L163); enrichment — the model fills the data (L163); follow-up — the model drafts the outreach (L224), gated by the human (L228). Each is a workflow (L217): the event trigger (L220), the AI step's contract (L163), and the audit (L322). The CRM is the business's memory — the AI is its clerk (L230).

**Q: How does AI lead scoring work?**
> A: A workflow (L217) triggered by the lead event (L220). The scoring step (L163) evaluates the lead against the scoring contract (L143) — the firmographic fit, the intent signals, the engagement — and outputs a score with a reason (L163). The score routes the lead (L230): hot to follow-up, cold to nurture (L223). The contract is written with the sales team (L229) — it encodes what a good lead *is* (L223).

**Q: Why gate the AI's follow-up?**
> A: Because the AI is writing on the business's behalf (L324). A wrong send is a burned relationship and a compliance issue (L312). So the send is gated (L228): the model drafts (L224), the human approves or edits (L208), and only then does the email go (L228). Scoring and enrichment run free (L163); the *outreach* waits for the human (L208) — the HITL threshold applied to the CRM's voice (L223).

**Q: How do you keep the CRM clean?**
> A: The enrichment workflows (L223): the model fills the data against a schema (L143), validated (L143) and deduplicated by the contact ID (L255) before the merge (L180). The CRM's quality is the automation's quality (L195) — garbage in, bad scoring out (L196). And every change is traced (L322) — the memory is auditable (L213).

## 11. Follow-Up Questions

- How do you write the scoring contract (L163)?
- How does enrichment validate its data (L143)?
- Why is the send gated (L228)?
- How do you dedupe the contacts (L255)?
- What does the audit record (L322)?

## 12. Comparison Table — The Three Patterns

| | Scoring (L163) | Enrichment (L163) | Follow-up (L224, L228) |
|---|---|---|---|
| Trigger (L220) | lead event | nightly (L221) | hot lead |
| The AI step | rank the fit (L143) | fill the data (L143) | draft the note (L224) |
| Gate (L228) | none | none | human approves (L208) |
| Output | score + reason | the cleaned record (L180) | the approved send |
| Audit (L322) | the score | the merge | the send |

The senior read: **the gate column is the trust threshold** — the internal patterns run free, the external send waits (L228).

## 13. Code Example — The CRM Workflow

```js
// AI + CRM: scoring, enrichment, and the gated follow-up (L223, L228).
const SCORE_SCHEMA = { fit: 'number', intent: 'number', score: 'number', reason: 'string' };  // L143

// SCORING (L163) — the lead event triggers the workflow (L220, L217).
async function scoreLead(lead) {
  const scored = validate(model.rank(lead, { schema: SCORE_SCHEMA }), SCORE_SCHEMA);  // L163
  await crm.update(lead.id, { score: scored.score });        // the memory (L180)
  if (scored.score >= HOT) await enqueue('follow-up', lead); // route (L230)
}

// ENRICHMENT (L163, L227) — the data filled against the schema (L143).
async function enrichContact(contact) {
  const data = await webLookup(contact.company);             // the web (L227)
  const clean = validate(data, CONTACT_SCHEMA);              // L143
  await crm.merge(contact.id, clean, { dedupeBy: 'company' });  // L180, L255
}

// FOLLOW-UP (L224, L228) — the gate before the send (L208).
async function followUp(lead) {
  const draft = await model.draft(`Follow up with ${lead.name}`, { tone: 'sales' });  // L224
  const approved = await humanApprove({                      // THE GATE (L228)
    proposal: draft, reasoning: 'outreach to a hot lead',    // L208
  });
  if (approved.kind === 'approve') {
    await email.send(approved.content);                      // the human's send (L208)
    await audit.log({ action: 'send', lead: lead.id, at: Date.now() });  // L322
  }
}
```

```text
What the reader must SEE — the clerk and the manager:

  scoreLead()    → the ranking contract (L163, L143), the route (L230)
  enrichContact()→ the schema + dedup (L143, L255), the memory (L180)
  followUp()     → draft (L224), GATE (L228), send, audit (L322)

  The AI scores and drafts; the human signs the sends.
```

```narrate
4-8: Scoring — the lead event triggers the workflow (L220, L217); the model ranks against the contract (L163, L143), and the score routes (L230).
10-13: Enrichment — the web lookup (L227), validated (L143), merged without duplication (L180, L255).
15-24: Follow-up — the draft (L224), the human gate (L208, L228), the send, and the audit (L322).
```

> [!TIP]
> The line that makes the CRM trustworthy: **`await humanApprove({...})`** before `email.send(...)`. **The AI drafts; the human signs — the CRM's voice is gated (L228).**

## 14. Performance Notes

- **The scoring is a per-lead model call (L150).** The ranking (L163) is the token cost (L149) — batched (L222) and cached by the lead hash (L171) where possible (L223).
- **The enrichment is a batch workload (L222).** The web lookups (L227) and the model fills (L163) run on the queue (L222) — the nightly job (L221).
- **The gate is the human's latency (L151).** The follow-up waits for the approval (L208) — the send's wall-clock includes the human's time (L228).
- **The audit is storage (L150).** The CRM's trace (L322) is cheap and required — the governance (L373) of the sales process (L223).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Bad lead routing | The scoring contract wrong (L163) | Re-write the contract with sales (L229) |
| Duplicate contacts | No dedup (L255) | Merge by the contact ID (L180) |
| Unsanctioned sends | The gate missing (L228) | Add the approval (L208) |
| The CRM degrades | Enrichment unvalidated (L143) | Schema + validation (L180) |
| No audit trail | The changes untraced (L322) | Log the writes and sends (L213) |

## 16. Quick Revision Notes

- AI + CRM = **the highest-ROI automation** (L223): scoring, enrichment, follow-up.
- Scoring: **the model ranks against the contract** (L163, L143), routes (L230).
- Enrichment: **the schema + dedup** (L143, L255), the clean memory (L180).
- Follow-up: **the draft gated by the human** (L224, L228).
- The gate: **the AI drafts; the human signs** (L208).
- The memory: **clean (L180), traced (L322)** — the business's record (L230).

## 17. Cheat Sheet

```text
AI + CRM = the highest-ROI automation — the business's memory, clerked

THE THREE PATTERNS (L223)
  scoring     the model ranks the leads (L163) — the contract (L143)
              the score routes: hot → follow-up, cold → nurture (L230)
  enrichment  the model fills the data (L163) — from the web (L227)
              validated (L143) · deduplicated (L255) · merged (L180)
  follow-up   the model drafts the outreach (L224)
              the HUMAN approves before the send (L208, L228)

THE WORKFLOW SHAPE (L217, L230)
  every pattern: trigger (L220) → AI step (L163) → [gate (L228)]
  → the write to the CRM (L180) → the audit (L322)

THE TRUST RULE (L228)
  scoring and enrichment run free (L163)
  the OUTREACH waits for the human (L208)
  a wrong send is a burned relationship (L324)

THE MEMORY (L223)
  the CRM is the system of record (L230)
  its quality is the automation's quality (L195)
  its changes are traced (L322) — the compliance story (L373)

INTERVIEW, 4 MOVES
  1 patterns "scoring, enrichment, follow-up (L223)"
  2 contracts "the score's definition (L163, L143), the data's schema"
  3 gate     "the AI drafts, the human signs (L228)"
  4 memory   "clean (L180), traced (L322) — the business's record"
```

## 18. Key Takeaways

> [!RECAP]
> - AI + CRM is **the highest-ROI automation** (L223): lead scoring (L163), enrichment (L163), and follow-up (L224) — each a workflow (L217)
> - **Scoring ranks against a contract** (L143) written with sales (L229) — the score routes the lead (L230)
> - **Enrichment fills the data against a schema** (L143) — validated, deduplicated (L255), merged cleanly into the memory (L180)
> - **The follow-up is gated** (L228) — the AI drafts (L224), the human approves before the send (L208), because a wrong send is a burned relationship (L324)
> - **The CRM is the business's memory** (L230) — its quality is the automation's quality (L195), and its changes are traced (L322)
> - Every pattern follows the **L217 workflow discipline** (L230): trigger (L220), contract (L163), gate (L228), and audit (L322)

## Check your understanding

Answer these without looking back.

1. What are the three CRM patterns (L223)?
2. What's in the scoring contract (L143)?
3. Why is enrichment validated (L143)?
4. Why is the follow-up gated (L228)?
5. How do you dedupe the contacts (L255)?
6. What does the audit record (L322)?
7. Why is the CRM the business's memory (L230)?
8. What's the trust rule (L208)?

## A Closing Note — The Clerk and the Manager

You now hold the highest-ROI integration: **the scoring that ranks, the enrichment that fills, and the follow-up that the human signs — the CRM kept clean and traced.** The business's memory now has a clerk — with the manager at every send (L223).

Next: the inbox — AI + email (L224), drafting, triage, and replies with the human-approval rule.
