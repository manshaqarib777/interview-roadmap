# Lesson 383 — Project 3: AI Business Automation Platform

**Interview importance:** ⭐⭐⭐⭐⭐ — the third capstone: workflows, integrations, and approval gates as a shippable product (L383).**

This is the third capstone — the proof of the automation (L356) and the platform (L378) modules. L356 designed the automation and L378 the platform; this lesson is **the build**: Project 3 — the AI business automation platform — the workflows, the integrations, and the approval gates as a shippable product (L383): the scope (the product, L383), the architecture (the workflows L217 and the integrations L227), and the build (the gates L228 and the shipping L307). This lesson is the automation's proof (L383).

The distinction this lesson is built on: a **specialist** describes the zap. A **solutions architect** builds the product (L383): the workflows (L217), the integrations (L227), and the gates (L228) — the capstone (L383) that ships (L307).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the scope: the product (L383)
- Explain the architecture: the workflows and the integrations (L383)
- Explain the gates: the approvals (L228)
- Explain the build: the shippable (L307)
- Explain the AI shape: the automation's proof (L383)

## 1. One-Line Definition

**Project 3 — the AI business automation platform — is the workflows, the integrations, and the approval gates as a shippable product (L383) — the scope (the product L383: the builders L378, the workflows L217, the connectors L227, L383), the architecture (the workflows L356: the triggers L220, the AI steps L356, the actions L227; the integrations L375: the connectors L227 with the OAuth L239 and the scopes L262, L383), and the build (the gates L228: the high-risk L324 gated L208; and the shipping L307: the pipeline L296 with the evals L341, L383) — the automation's (L356) proof (L383).**

The one-sentence interview answer: *"Project 3 is the automation product, shipped (L383). The scope (L383): the product (L383) — the builders (L378): the teams (L378) creating the workflows (L217); the workflows (L217): the triggers (L220), the steps (L356); and the connectors (L227): the CRM (L351), the email (L224), the Slack (L225). The architecture (L383): the workflows (L356) — the triggers (L220): the webhook (L220) and the schedule (L221); the AI steps (L356): the classify (L353) and the generate (L356); and the integrations (L375) — the connectors (L227) with the OAuth (L239) and the scopes (L262). The build (L383): the gates (L228) — the high-risk (L324): the refund (L324) and the send (L324) — gated (L208); and the shipping (L307) — the pipeline (L296): the CI (L296) with the evals (L341) and the canary (L303). The AI shape (L173): the automation (L383) — the workflows (L217), the integrations (L227), and the gates (L228) — the L356 product (L356), shipped (L383), the automation's (L356) proof (L383)."*

## 2. Mental Model

Think of the automation platform as **the app store for the assembly lines.** The store (the platform, L383) sells the lines (the workflows, L217): the builders (L378) assemble them (L383) — the triggers (L220), the stations (the AI steps, L356), the connections (the integrations, L227); the store's shelves (the connectors, L227) — the standard (L375) parts (L227) with the scoped (L262) access; the inspection (the gates, L228) — the supervisor's (L208) sign-off (L324) on the risky (L324) lines; and the delivery (the shipping, L307) — the pipeline (L296) with the checks (L341). The store works because the lines are buildable, the parts are standard, and the risky lines are signed (L383).

```text
   the app store (the platform, L383)
   ┌────────────────────────────────────────────────────────┐
   │ the lines (the workflows, L217) · the shelves (the     │
   │ connectors, L227) · the inspection (the gates, L228)   │
   │ the delivery (the shipping, L307)                      │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the app store**: the lines, the shelves, and the inspection (L383).

## 3. Visual Flow — The Build

```text
   THE SCOPE (L383) → the product (L383)
        │
        ▼
   THE ARCHITECTURE (L383) → the workflows (L217) + the integrations (L227)
        │
        ▼
   THE GATES (L228) → the high-risk (L324) gated (L208)
        │
        ▼
   THE SHIPPING (L307) → the pipeline (L296) + the evals (L341)
```

The flow is the build: **scope → architecture → gates → shipping** (L383).

## 4. How It Works — The Build, Part by Part

- **The scope (L383).** The product (L383): the builders (L378), the workflows (L217), the connectors (L227).
- **The architecture (L383).** The workflows (L356) and the integrations (L375).
- **The gates (L228).** The high-risk (L324) gated (L208).
- **The build (L383).** The shipping (L307): the pipeline (L296) with the evals (L341).

> [!NOTE]
> **The capstone's arc: the product to the shipping (L383).** The senior answer builds the arc (L383): the product (L383) — the builder's (L378) experience (L383): the workflow (L217) builder (L383) with the golden path (L378); the architecture (L383) — the workflows (L217), the AI steps (L356), and the connectors (L227) with the OAuth (L239); and the shipping (L307) — the pipeline (L296): the CI (L296) with the evals (L341) and the canary (L303). The arc (L383) — the product (L383) to the shipping (L307) — is the L356 product (L356), shipped (L383).

## 5. Real Project Usage

- **The portfolio (L103).** Project 3 (L383) — the L356 proof (L383).
- **An interview (L383).** The walkthrough (L383) — the product to the shipping (L383).
- **An automation SaaS (L356).** The workflows (L217) and the connectors (L227).
- **A CRM automation (L351).** The lead (L351) → the classify (L353) → the outreach (L351).
- **Anything automation (L356).** The capstone (L383) — the L356 product (L356), shipped (L383).

The through-line: **the proof is the automation's** — the workflows, the integrations, and the gates, shipped (L383).

## 6. Interview Explanation

Say it in four moves:

1. **The scope.** "The product — the builders (L378), the workflows (L217), the connectors (L227)."
2. **The architecture.** "The workflows (L356) and the integrations (L375)."
3. **The gates.** "The high-risk (L324) gated (L208)."
4. **The shipping.** "The pipeline (L296) with the evals (L341)."

## 7. Senior-Level Insights

- **The builder is the product's (L378).** The workflow (L217) builder (L383) — the golden path (L378) — the L378 platform (L378), product-shaped (L383).
- **The connector is the scoped (L262).** The OAuth (L239) with the scopes (L262) — the L314 least privilege (L314), in the connectors (L383).
- **The gate is the L324 (L324).** The high-risk (L324) — the refund (L324) and the send (L324) — the L208 pause (L208), built (L383).
- **The eval is the AI step's (L341).** The classify (L353) and the generate (L356) — the L341 evals (L341) in the CI (L296) (L383).
- **The canary is the ship's (L303).** The L303 canary (L303) — the L304 rollback (L304) — the L307 shipping (L307), in the capstone (L383).

## 8. Common Mistakes

- **The zap-only (L383).** The trigger (L220) without the product (L383) — the builder (L378) and the gates (L228) missing (L383).
- **The wide connectors (L314).** The app's (L314) scope (L262) — the OAuth (L239) with the least privilege (L314) (L383).
- **The un-gated refund (L324).** The high-risk (L324) automatic (L228) — the L228 gate (L228) (L383).
- **The un-evaled AI (L341).** The classify (L353) without the evals (L341) — the quality (L341) unknown (L383).
- **The un-shipped (L307).** The product (L383) without the pipeline (L296) — the L307 shipping (L307) (L383).

## 9. Best Practices

- **Build the product** (L383) — the builder (L378) and the golden path (L378).
- **Scope the connectors** (L262) — the OAuth (L239), the least privilege (L314).
- **Gate the high-risk** (L324) — the L208 approval (L208).
- **Eval the AI steps** (L341) — in the CI (L296).
- **Ship the pipeline** (L307) — the CI (L296) and the canary (L303).

## 10. Interview Questions

**Q: Walk me through Project 3.**
> A: The automation product, shipped (L383). The scope — the builders (L378), the workflows (L217), the connectors (L227). The architecture — the workflows (L356) and the integrations (L375). The gates — the high-risk (L324) gated (L208). And the shipping — the pipeline (L296) with the evals (L341).

**Q: What's the product?**
> A: The builder's (L378) experience (L383): the workflow (L217) builder (L383) — the triggers (L220), the AI steps (L356), and the actions (L227) — assembled (L383) with the golden path (L378) — the L378 platform (L378), product-shaped (L383).

**Q: How do the integrations work?**
> A: The connectors (L227): the CRM (L351), the email (L224), the Slack (L225) — connected with the OAuth (L239) and the scoped (L262) credentials (L383) — the least privilege (L314) per connector (L383). The L375 seam (L375), built (L383).

**Q: How do you ship it?**
> A: The L307 pipeline (L307): the CI (L296) — the tests (L296) and the evals (L341): the AI steps' (L356) quality (L341); and the CD (L296) — the canary (L303) with the rollback (L304). The L307 shipping (L307), in the capstone (L383).

## 11. Follow-Up Questions

- What's the scope (L383)?
- What's the product (L383)?
- How do the integrations work (L227)?
- How do you ship it (L307)?
- What's the arc (L383)?

## 12. Comparison Table — The Zap vs the Platform

| | The zap (L383) | The platform (L383) |
|---|---|---|
| The workflows (L217) | the one (L383) | the builder (L378) |
| The connectors (L227) | the wide (L314) | the scoped (L262) |
| The gates (L228) | none (L383) | the high-risk (L324) |
| The shipping (L307) | none (L383) | the pipeline (L296) |

The senior read: **the right column is the capstone** — the product, shipped (L383).

## 13. Code Example — The Build, Started

```js
// Project 3 (L383) — the automation product (L383).
// 1 · THE WORKFLOW (L217) — the builder's output (L383).
const workflow = {
  trigger: { type: 'webhook', path: '/lead-created' },   // L220
  steps: [
    { type: 'ai', action: 'classify', input: 'lead', output: 'priority' },  // L353
    { type: 'action', connector: 'crm', call: 'create_lead' },   // L227
  ],
};

// 2 · THE CONNECTORS (L227) — the scoped (L262).
const connectors = {
  crm:   { oauth: true, scopes: ['leads:write'] },     // L239, L262
  email: { oauth: true, scopes: ['mail:send'] },       // L224, L262
};

// 3 · THE GATES (L228) — the high-risk (L324).
const gates = { 'lead.refund': { approval: 'human' } };    // L324, L208

// 4 · THE SHIPPING (L307) — the pipeline (L296).
const pipeline = {
  ci:  { tests: true, evals: true },                  // L296, L341
  cd:  { canary: '5%', rollback: true },              // L303, L304
};

// 5 · THE OBSERVABILITY (L346) — the executions (L383).
await otel.trace(workflow, { perTenantCost: true });  // L346, L334
```

```text
What the reader must SEE — the build, started:

  the webhook + the AI classify → the workflow (L217, L353)
  the OAuth + the scopes        → the connectors (L262, L239)
  the refund's approval         → the gate (L324, L208)
  the CI evals + the canary     → the shipping (L296, L303)
  the per-tenant trace          → the observability (L346)

  The product, the gates, the shipping (L383).
```

```narrate
4-10: The workflow — the trigger, the AI step, and the action (L217, L353).
12-16: The connectors — the OAuth and the scopes (L239, L262).
18-19: The gates — the refund's human approval (L324, L208).
21-24: The shipping — the evals and the canary (L296, L303).
26-27: The observability — the per-tenant trace (L346, L334).
```

> [!TIP]
> The pair that defines the capstone: **the scoped connector** (the trust, L262) and **the canary shipping** (the safety, L303). **Build the product, scope the connectors, gate the high-risk, ship the pipeline — the automation's proof (L383).**

## 14. Performance Notes

- **The workflow is the execution's (L217).** The workers (L266) and the queue (L270) — the scale (L358) (L383).
- **The AI step is the cost (L356).** The tokens (L332) per execution (L383) — the L334 attribution (L334) (L383).
- **The gate is the human's (L208).** The high-risk (L324) — the hours (L383) for the approval (L208).
- **The canary is the risk's (L303).** The 5% (L303) — the L304 rollback (L304) (L383).

## 15. Debugging Scenarios

| Symptom | First check (L383) | The lever |
|---|---|---|
| The workflow fails | The trace (L330) | The failing step (L383) |
| The connector overreaches | The scope (L262) | The least privilege (L314) |
| The refund slips | The gate (L228) | The approval (L324) |
| The AI misclassifies | The evals (L341) | The golden cases (L342) |
| The ship breaks | The canary (L303) | The rollback (L304) |

## 16. Quick Revision Notes

- Project 3 = **the automation's proof** (L383): the scope, the architecture, the gates, the build.
- The scope: **the product (L383) — the builders (L378), the workflows (L217), the connectors (L227)**.
- The architecture: **the workflows (L356) and the integrations (L375)**.
- The gates: **the high-risk (L324) gated (L208)**.
- The build: **the shipping (L307) — the pipeline (L296) with the evals (L341)**.

## 17. Cheat Sheet

```text
PROJECT 3: AI BUSINESS AUTOMATION PLATFORM = the shippable product

THE SCOPE (L383)
  the builders (L378) — the teams (L378) creating (L383)
  the workflows (L217) — the triggers (L220), the steps (L356)
  the connectors (L227) — the CRM (L351), the email (L224),
  the Slack (L225)

THE ARCHITECTURE (L383)
  the workflows (L356) — the AI steps (L353, L356)
  the integrations (L375) — the connectors (L227) with the
  OAuth (L239) and the scopes (L262)

THE GATES (L228)
  the high-risk (L324) — the refund (L324), the send (L324)
  gated (L208) by the human (L208)

THE BUILD (L383) — THE SHIPPING (L307)
  the pipeline (L296) — the tests (L296) and the evals (L341)
  the canary (L303) · the rollback (L304)

INTERVIEW, 4 MOVES
  1 scope   "the product (L383)"
  2 architecture "the workflows and the integrations (L383)"
  3 gates   "the high-risk gated (L324)"
  4 shipping "the pipeline with the evals (L296)"
```

## 18. Key Takeaways

> [!RECAP]
> - Project 3 — the AI business automation platform — is **the workflows, the integrations, and the approval gates as a shippable product** (L383): the scope (L383), the architecture (L383), the gates (L228), and the build (L383)
> - **The scope** (L383): the product (L383) — the builders (L378), the workflows (L217), and the connectors (L227)
> - **The architecture** (L383): the workflows (L356) — the triggers (L220) and the AI steps (L356); and the integrations (L375) — the connectors (L227) with the OAuth (L239) and the scopes (L262)
> - **The gates** (L228): the high-risk (L324) gated (L208) by the human (L208)
> - **The build** (L383): the shipping (L307) — the pipeline (L296) with the evals (L341) and the canary (L303)
> - The arc (L383): the product (L383) to the shipping (L307) — the L356 product (L356), shipped (L383), the automation's (L356) proof (L383), filling the portfolio (L103)

## Check your understanding

Answer these without looking back.

1. What's the scope (L383)?
2. What's the product (L383)?
3. How do the integrations work (L227)?
4. How do you ship it (L307)?
5. What's the arc (L383)?
6. What's the gate (L228)?
7. What's the canary (L303)?
8. What is the automation's proof (L383)?

## A Closing Note — The Store, Open

You now hold the third proof: **the workflows, the integrations, the gates, and the shipping — with the lines buildable and the delivery checked.** The app store is open — and the risky lines are signed (L383).

Next: the full SaaS with the tenants, the billing, the isolation, and the compliance — Project 4 (L384).
