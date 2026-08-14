# Lesson 217 — AI Workflows

**Interview importance:** ⭐⭐⭐⭐⭐ — "what's an AI workflow?" — the answer is *the automation unit*: a pipeline of AI steps with human checkpoints — the L199 hybrid, made concrete (L230).**

L199 gave you the workflow-vs-agent decision; this lesson is **the workflow itself**: AI workflows — the automation unit: a pipeline of steps, some AI (summarize, extract, draft, L163), some deterministic (validate, post, notify), with human checkpoints at the consequential points (L208, L228). The workflow is the L199 hybrid in production: the skeleton is fixed, the AI steps supply judgment, and the checkpoints keep a human at the decisions that matter (L230).

The distinction this lesson is built on: a **demo** has a script that calls the model once. A **solutions architect** designs the workflow: the steps and their order (the skeleton, L199), the AI steps' inputs and outputs (L163), the human checkpoints (L208), the error handling (L211), and the observability (L213) — the unit that L218–232 build on (L230).

## Learning Objectives

By the end of this lesson you should be able to:

- Define the workflow: a pipeline of AI and deterministic steps (L217)
- Design the skeleton: steps, order, and the data flow between them (L199)
- Place the AI steps: where the model's judgment earns its place (L163)
- Design the human checkpoints (L208, L228)
- Explain the failure behavior and the observability (L211, L213)

## 1. One-Line Definition

**An AI workflow is the automation unit — a pipeline of steps, some AI (extract, summarize, draft, L163) and some deterministic (validate, post, notify), ordered by a fixed skeleton (L199) with human checkpoints at the consequential points (L208, L228) — the L199 hybrid made concrete, and the shape every automation tool (L218–219) and integration (L223–227) builds on (L230).**

The one-sentence interview answer: *"An AI workflow is the automation unit (L217). A pipeline of steps with a fixed skeleton (L199): the trigger (L220), the AI steps — extract (L163), classify, draft — the deterministic steps — validate, post, notify — and the human checkpoints at the consequential points (L208, L228). It's the L199 hybrid made concrete: the skeleton guarantees the path and the containment; the AI steps supply the judgment; the checkpoints keep a human at the decisions that matter (L230). The design is the skeleton's order (L199), each step's contract — input and output (L163) — and the error handling per step (L211). The workflow is the unit; L218–232 are the tools, triggers, and disciplines around it (L230)."*

## 2. Mental Model

Think of an AI workflow as **an assembly line with two kinds of stations and two kinds of workers.** The stations: the AI stations (a model reads, extracts, or drafts — L163) and the deterministic stations (a rule validates, posts, or notifies). The workers: the line's automation (the steps run by themselves) and the human inspectors at the checkpoints (L208) — the consequential stations have an inspector who approves before the work passes (L228). The line's value is the *order* — the skeleton (L199): each station's output is the next station's input, and the inspectors are placed where the risk is (L212).

```text
   the assembly line (L217)
   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   │ trigger      │ → │ AI: extract  │ → │ HUMAN CHECK  │ → │ AI: draft    │
   │ (L220)       │   │ (L163)       │   │ (L208, L228) │   │ (L163)       │
   └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
        │
        ▼
   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   │ notify       │ ← │ post         │ ← │ validate     │
   │ (deterministic)│   │ (deterministic)│   │ (deterministic)│
   └──────────────┘   └──────────────┘   └──────────────┘
```

The mental model is **the assembly line**: the fixed skeleton, the AI and deterministic stations, and the human inspectors at the consequential points (L217).

## 3. Visual Flow — One Workflow, Step by Step

```text
   an event arrives (L220)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · TRIGGER (L220) — the event or schedule starts it      │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE AI STEPS (L163) — the judgment                    │
   │     extract the fields, classify the case, draft the     │
   │     reply — each with a defined input and output (L163)  │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE CHECKPOINT (L208, L228)                          │
   │     the consequential step waits: the human approves,    │
   │     edits, or rejects (L208)                             │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · THE DETERMINISTIC STEPS (L217)                       │
   │     validate, post, notify — the rules (L199)            │
   └──────────────────────────────────────────────────────────┘
                      ▼
   the workflow completes — recorded (L213), recoverable (L232)
```

The flow is the unit: **trigger → AI steps → checkpoint → deterministic steps** — the skeleton fixed, the judgment supplied, the human at the consequential point (L217).

## 4. How It Works — The Skeleton, the Contracts, the Checkpoints

- **The skeleton (L199, L217).** The steps and their order — fixed, known, testable (L341). The skeleton is the L199 workflow: deterministic by design, with the AI steps as the judgment points (L230).
- **The step contracts (L163).** Each step has a defined input and output (L163): the extract step's schema (L143), the draft step's format (L163), the validate step's rules. The contracts are what make the steps testable (L341) and swappable (L218).
- **The AI steps (L163).** Where the model's judgment earns its place: extraction (L163), classification, summarization (L206), drafting — each a defined task with a schema (L143). The model is a station on the line, not the line itself (L217).
- **The checkpoints (L208, L228).** The human gates at the consequential steps: a refund, a publish, an external send (L212). The checkpoint is a station — the workflow pauses, the human decides, the line resumes (L208).
- **The failure behavior (L211, L232).** Each step can fail: the AI step's output is invalid (L143), the API is down (L227), the approval times out (L208). The workflow's error handling (L232) — retry (L169), dead-letter, rerun — is part of the design (L217).

> [!NOTE]
> **The workflow is the L199 hybrid, made concrete (L217, L230).** L199 said: known path → workflow, unknown path → agent. The AI workflow is the reconciliation: the *skeleton* is the known path (L199) — the steps and the order are fixed — and the *AI steps* are the agentic forks (L230): where the content decides, the model supplies the judgment (L163). The human checkpoints (L208) are the third layer: where the consequence decides, the human approves (L228). The workflow is deterministic where it can be, AI where it must be, and human where it should be (L217).

## 5. Real Project Usage

- **Invoice processing.** Trigger: the invoice arrives (L220). AI: extract the fields (L163). Validate: the totals match (deterministic). Post: to the ledger. Notify: the accountant (L217).
- **Support triage.** Trigger: the ticket. AI: classify the case, draft the reply (L163). Checkpoint: the reply is approved for consequential replies (L228). Send: via the API (L227).
- **Lead enrichment.** Trigger: a new CRM lead (L223). AI: enrich the company data (L223). Validate: the fields. Post: back to the CRM (L223).
- **Content pipeline.** Trigger: the draft. AI: outline, draft, summarize (L206). Checkpoint: the human approves the copy (L208). Publish: the CMS (L227).
- **Anything repeatable (L230).** The workflow is the unit — L218–232 are the tools and disciplines around it (L217).

The through-line: **the workflow is the automation unit** — the skeleton, the AI judgment, the human checkpoints — and every tool (L218) and integration (L223) plugs into this shape (L230).

## 6. Interview Explanation

Say it in four moves:

1. **The unit.** "A pipeline of AI and deterministic steps with human checkpoints (L217)."
2. **The skeleton.** "The steps and the order are fixed (L199) — testable, observable (L341)."
3. **The judgment.** "The AI steps — extract, classify, draft (L163) — have defined contracts (L143)."
4. **The checkpoints.** "The human gates at the consequential steps (L208, L228) — deterministic where possible, AI where needed, human where it matters (L217)."

## 7. Senior-Level Insights

- **The contracts make it a system (L163).** The senior design defines every step's input and output (L163) — the contracts are what make the steps testable (L341), swappable (L218), and composable (L230).
- **The skeleton is the containment (L199).** The fixed order (L199) is the failure containment (L211): a bad step fails in place (L232), not the whole business process (L229).
- **The checkpoints are the trust (L208, L228).** The human at the consequential points (L228) is what makes the automation *allowed* to run (L324) — the checkpoint's placement is the risk design (L212).
- **The observability is the unit's record (L213).** The workflow's execution trace (L213) serves the debugging (L211), the audit (L322), and the recovery (L232).
- **The workflow composes with the platform (L230).** The L230 architecture is the workflow plus the events (L220), queues (L222), and approvals (L228) — this lesson is the unit; L230 is the platform (L230).

## 8. Common Mistakes

- **A script called a workflow (L217).** One model call, no skeleton, no checkpoints (L199) — the unit missing.
- **The AI doing everything (L230).** Every step a model call (L150) — the deterministic steps (L199) skipped, the cost and the failure surface (L211) balloon.
- **No checkpoints (L208).** Consequential steps run unattended (L228) — the trust (L324) gone.
- **No contracts (L163).** The steps' inputs and outputs undefined (L143) — untestable (L341), uncomposable (L230).
- **No failure handling (L232).** A step fails, the process dies (L211) — the retry and dead-letter story (L232) missing.
- **The workflow as a black box (L213).** No execution record (L213) — the audit (L322) and the recovery (L232) starved.

## 9. Best Practices

- **Design the skeleton first** (L199) — the steps and their order (L217).
- **Define every step's contract** (L163) — input, output, schema (L143).
- **Place the AI where judgment pays** (L163) — extract, classify, draft (L230).
- **Gate the consequential steps** (L208, L228) — the human at the risk (L212).
- **Design the failure story** (L232) — retry (L169), dead-letter, rerun (L222).
- **Record the execution** (L213) — the trace serves debug, audit, and recovery (L341).

## 10. Interview Questions

**Q: What is an AI workflow?**
> A: The automation unit (L217): a pipeline of steps — AI steps (extract, classify, draft, L163) and deterministic steps (validate, post, notify) — ordered by a fixed skeleton (L199), with human checkpoints at the consequential points (L208, L228). The skeleton guarantees the path and the containment; the AI steps supply the judgment; the checkpoints keep a human at the decisions that matter (L230).

**Q: Why is the skeleton fixed?**
> A: Because it's the L199 workflow (L199): a known path is cheaper (L150), testable (L341), and containable (L211) than a loop. The AI steps are the agentic forks (L230) — where the content decides, the model supplies judgment (L163). The skeleton is the deterministic part; the model is a station on the line, not the line itself (L217).

**Q: Where do the human checkpoints go?**
> A: At the consequential steps (L228): a refund, a publish, an external send (L212). The checkpoint is a station — the workflow pauses, the human approves, edits, or rejects (L208), and the line resumes (L217). The placement is the risk design (L212) — and it's what makes the automation *allowed* to run (L324).

**Q: How do you design the steps?**
> A: By contract (L163). Every step has a defined input and output — the extract step's schema (L143), the draft step's format (L163), the validate step's rules. The contracts are what make the steps testable (L341), swappable (L218), and composable (L230) — the workflow is a pipeline of defined stations, not a script (L217).

## 11. Follow-Up Questions

- How does the workflow relate to the L199 hybrid (L230)?
- What's in a step's contract (L163)?
- How do you place the checkpoints (L228)?
- How does the failure story work (L232)?
- How does the workflow become a platform (L230)?

## 12. Comparison Table — Script vs Workflow

| | Script (L199) | Workflow (this lesson) |
|---|---|---|
| Skeleton (L199) | implicit | fixed steps + order (L217) |
| AI steps (L163) | the whole script | defined stations with contracts (L143) |
| Checkpoints (L208) | none | human gates (L228) |
| Failure (L232) | dies | retry + dead-letter (L222) |
| Observability (L213) | logs | the execution trace (L341) |
| Testability (L341) | hard | per-step (L163) |

The senior read: **the right column is the unit** — the workflow is the shape L218–232 build on (L230).

## 13. Code Example — The Workflow

```js
// The AI workflow: skeleton, contracts, checkpoints (L217, L230).
const workflow = {
  // THE SKELETON — the fixed order (L199, L217).
  steps: [
    { id: 'extract', kind: 'ai',   run: extractFields },      // AI (L163)
    { id: 'validate', kind: 'rule', run: validateTotals },    // deterministic (L199)
    { id: 'approve', kind: 'gate', run: approvalGate },       // HUMAN (L208, L228)
    { id: 'post',    kind: 'rule', run: postToLedger },       // deterministic
    { id: 'notify',  kind: 'rule', run: notifyAccountant },   // deterministic
  ],
};

// THE STEP CONTRACT (L163, L143) — every step: input, output, schema.
const extractSchema = { vendor: 'string', amount: 'number', date: 'date' };
async function extractFields(trigger) {
  return validate(model.extract(trigger, { schema: extractSchema }));  // L143
}

// THE RUNNER — step by step, with the failure story (L232).
async function runWorkflow(trigger, ctx) {
  let data = trigger;
  for (const step of workflow.steps) {
    data = await withRetry(step.run, { maxRetries: 2 });      // L169, L222
    ctx.trace.push({ step: step.id, data });                  // L213
  }
  return { data, trace: ctx.trace };                          // the record (L341)
}

// THE CHECKPOINT (L208, L228) — a station, not an interruption.
async function approvalGate(draft) {
  return humanDecide({ proposal: draft, reasoning: 'draft reply for approval' });
}
```

```text
What the reader must SEE — the unit's three layers:

  steps: ai | rule | gate     → skeleton, judgment, human (L217)
  extractSchema               → the step contract (L143, L163)
  withRetry + trace           → the failure and the record (L232, L213)

  The line: fixed skeleton, AI stations, human inspectors.
```

```narrate
2-11: The skeleton — the fixed order of AI, rule, and gate steps (L199, L217, L208).
14-16: The step contract — every AI step has a defined schema (L143, L163).
18-24: The runner — each step executes with retries (L169), and the trace records it (L213).
26-29: The checkpoint — the human gate is a station on the line (L208, L228).
```

> [!TIP]
> The line that defines the unit: **`{ id: 'approve', kind: 'gate' }`** — the human checkpoint as a first-class step. **Deterministic where possible, AI where needed, human where it matters — that's the workflow (L217).**

## 14. Performance Notes

- **The deterministic steps are the cost control (L199, L150).** Rules and validations are near-free (L217); the AI steps (L163) are the token spend (L150) — placed only where judgment pays (L230).
- **The checkpoints are the latency pauses (L151).** A human gate waits (L208) — the workflow's wall-clock includes the approval time (L228).
- **The AI steps are batched and queued (L222).** Model calls in a workflow are background work (L222) — queued (L222), retried (L169), and cached (L171).
- **The trace is the record (L213).** The execution log (L213) serves the audit (L322) and the recovery (L232) — the record is part of the unit (L217).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The workflow dies on a bad step | No failure story (L232) | Add retry + dead-letter (L222) |
| Cost explodes | AI steps everywhere (L150) | Replace with rules (L199) |
| Consequential steps unattended | No checkpoints (L208) | Add the gates (L228) |
| Steps don't compose | No contracts (L163) | Define inputs/outputs (L143) |
| No audit trail | No execution record (L213) | Trace every step (L341) |

## 16. Quick Revision Notes

- AI workflow = **the automation unit** (L217): a pipeline of AI + rule steps with human checkpoints.
- The skeleton is **fixed** (L199) — the L199 workflow, with the AI as agentic forks (L230).
- The step contracts: **input, output, schema** (L163, L143).
- The checkpoints: **human gates at the consequential steps** (L208, L228).
- The failure story: **retry (L169), dead-letter (L222), rerun (L232)**.
- The record: **the execution trace** (L213) — debug, audit, recovery (L341).

## 17. Cheat Sheet

```text
AI WORKFLOWS = the automation unit

THE SHAPE (L217)
  trigger (L220) → AI steps (L163) → checkpoints (L208)
  → deterministic steps → done
  the skeleton is fixed (L199) — the L199 hybrid, concrete (L230)

THE THREE KINDS OF STEP
  ai      extract, classify, draft — the judgment (L163)
  rule    validate, post, notify — the determinism (L199)
  gate    the human checkpoint (L208, L228)

THE CONTRACTS (L163, L143)
  every step: input, output, schema
  contracts make steps testable (L341), swappable (L218), composable (L230)

THE DISCIPLINE
  deterministic where possible · AI where needed · human where it matters
  failure story: retry (L169), dead-letter (L222), rerun (L232)
  the trace records the execution (L213) — debug, audit, recovery (L341)

INTERVIEW, 4 MOVES
  1 unit    "a pipeline of AI + rule steps with human checkpoints"
  2 skeleton "fixed order (L199) — the containment"
  3 contracts "input/output/schema per step (L163)"
  4 checkpoints "the human at the consequential (L208, L228)"
```

## 18. Key Takeaways

> [!RECAP]
> - An AI workflow is **the automation unit** (L217): a pipeline of AI steps (L163) and deterministic steps (L199) with human checkpoints (L208, L228)
> - **The skeleton is fixed** (L199) — the L199 hybrid made concrete: the known path is the skeleton, and the AI steps are the agentic forks (L230)
> - **Every step has a contract** (L163, L143) — input, output, and schema — which is what makes steps testable (L341), swappable (L218), and composable (L230)
> - **The checkpoints are stations** (L208, L228) — the human gates at the consequential steps, placed by the risk (L212)
> - **The failure story is part of the design** (L232) — retry (L169), dead-letter (L222), and rerun (L232)
> - The workflow is the **shape every tool and integration builds on** (L230) — the record of its execution (L213) serves debug, audit, and recovery (L341)

## Check your understanding

Answer these without looking back.

1. What are the three kinds of step in a workflow (L217)?
2. Why is the skeleton fixed (L199)?
3. What's in a step's contract (L163)?
4. Where do the checkpoints go (L228)?
5. What's the failure story (L232)?
6. How does the workflow relate to the L199 hybrid (L230)?
7. Why is the trace part of the unit (L213)?
8. What makes steps swappable (L218)?

## A Closing Note — The Line That Runs the Business

You now hold the automation unit: **the fixed skeleton, the AI judgment at the stations that need it, the human inspectors at the consequential points, and the record of every run.** It's the shape that turns the agent's power into business value — and the shape every tool ahead plugs into (L230).

Next: the open-source tool where this is built — n8n (L218), wiring AI into everything.
