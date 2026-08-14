# Lesson 199 — Agent vs Workflow

**Interview importance:** ⭐⭐⭐⭐ — "when do you use an agent vs a workflow?" — the answer is the *decision rule*: deterministic pipelines for known steps, model-driven loops for open-ended tasks (L198) — and the hybrid (L217).**

L198 defined the loop. This lesson is **when the loop is the right shape at all**: agent vs workflow. A **workflow** is a deterministic pipeline — fixed steps, known order, each step's output feeds the next (L217). An **agent** is a model-driven loop — the steps themselves are decided at runtime (L198). The rule: **known path → workflow; unknown path → agent** — and most production systems are the hybrid: a workflow with agentic decision points (L217, L230).

The distinction this lesson is built on: a **demo** calls everything an "agent" because it's exciting. A **solutions architect** chooses the shape by the task: is the path known and fixed (workflow — cheaper, faster, testable, L217) or open-ended and varying (agent — flexible, but needs the discipline of L205–213)? And the senior answer includes the hybrid (L230).

## Learning Objectives

By the end of this lesson you should be able to:

- Define workflow: a deterministic pipeline of fixed steps (L199)
- Define agent: a model-driven loop deciding the steps at runtime (L198)
- Apply the decision rule: known path → workflow, unknown path → agent
- Explain the costs: workflows are cheaper and testable; agents are flexible and risky (L199)
- Design the hybrid: a workflow with agentic decision points (L217, L230)

## 1. One-Line Definition

**Agent vs workflow is the architecture decision between two shapes — a workflow is a deterministic pipeline of fixed steps (cheaper, faster, testable, L217), and an agent is a model-driven loop that decides its steps at runtime (flexible, open-ended, but needing the L205–213 discipline) — chosen by the rule "known path → workflow, unknown path → agent," with most production systems being the hybrid (L217, L230).**

The one-sentence interview answer: *"The rule: known path → workflow, unknown path → agent (L199). A workflow is a deterministic pipeline — fixed steps, known order, each step's output feeds the next (L217). It's cheaper (L150), faster (L151), and testable — I can unit-test every step (L341). An agent is a model-driven loop — the model decides the steps at runtime (L198); it's flexible for open-ended tasks, but it costs more (L150), can drift (L211), and needs the discipline: stop conditions (L205), guardrails (L209), observability (L213). Most production systems are the hybrid: a workflow skeleton with agentic decision points — the workflow guarantees the path, the agent decides at the forks (L230)."*

## 2. Mental Model

Think of workflow vs agent as **a train schedule vs a taxi.** A workflow is the train: fixed stops, fixed order, on rails — you know exactly where it goes, when, and how much it costs. An agent is the taxi: you say "get me there," and the driver decides the route at runtime — flexible for any destination, but you don't know the exact route or cost in advance, and a bad driver can wander. The hybrid is the bus with a live driver: fixed route skeleton, but the driver decides at the forks — the bus stays on the network, the driver picks the branches.

```text
   WORKFLOW (L217)                  AGENT (L198)              HYBRID (L230)
   ┌───────────────┐                ┌───────────────┐         ┌───────────────────┐
   │ step 1 → 2 → 3│                │ decide → act  │         │ workflow skeleton │
   │ fixed, known  │                │ → decide…     │         │ with agentic      │
   │ predictable   │                │ open-ended    │         │ decision points   │
   │ cheap, tested │                │ flexible,     │         │ path + judgment   │
   │ (L341)        │                │ risky (L211)  │         │ (L217, L230)      │
   └───────────────┘                └───────────────┘         └───────────────────┘
```

The mental model is **train, taxi, or bus-with-driver**: the path is known (workflow), unknown (agent), or a known skeleton with live decisions (the hybrid).

## 3. Visual Flow — Choosing the Shape

```text
   a task arrives (L199)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · IS THE PATH KNOWN? (L199)                            │
   │     yes — fixed steps, known order                       │
   │       → WORKFLOW (L217): cheaper, testable, predictable  │
   │     no — steps depend on the content                     │
   │       → AGENT (L198): flexible, needs discipline (L205)  │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · MIXED? — the production case (L230)                  │
   │     a known skeleton with decision forks                 │
   │     → HYBRID: workflow guarantees the path,              │
   │       the agent decides at the forks                     │
   └──────────────────────────────────────────────────────────┘
                      ▼
   the shape matches the task's uncertainty
```

The flow is the decision rule: **known path → workflow; unknown path → agent; mixed → hybrid** — the shape follows the task's uncertainty (L199).

## 4. How It Works — The Two Shapes and the Rule

- **The workflow (L217).** Deterministic: step 1 → step 2 → step 3, fixed order, each output feeds the next. The steps may *use* the model (summarize, extract, L163) — but the *flow* is fixed. Cheaper (L150) — no loop overhead; faster (L151) — no repeated decisions; testable (L341) — every step is a unit; auditable — the path is written down.
- **The agent (L198).** Model-driven: the model decides step 2 after seeing step 1's result. Flexible — handles tasks whose path can't be predicted (open-ended research, novel troubleshooting). The costs: more model calls (L150), more latency (L151), and the failure surface (L211) — drift, spinning, agency — needing the L205–213 discipline.
- **The rule (L199).** Known path → workflow: the determinism is a feature. Unknown path → agent: the flexibility is the requirement. Choosing an agent for a known path pays loop costs (L150) for no flexibility; choosing a workflow for an unknown path breaks on the first surprise (L211).
- **The hybrid (L230).** The production default: a workflow skeleton with agentic decision points — the workflow guarantees the path and the failure containment; the agent supplies judgment at the forks (L217, L230).

> [!NOTE]
> **The decision is about uncertainty, not excitement (L199).** "Agent" is not a status symbol — it's a shape chosen when the task's path is genuinely unknown. A known path run as an agent pays the loop's costs (L150, L151) for nothing; an unknown path run as a workflow fails deterministically at the first unexpected input (L211). The senior answer names the uncertainty — "the steps depend on the content" — and lets it pick the shape (L199).

## 5. Real Project Usage

- **Invoice processing (workflow).** Extract → validate → post → notify — fixed steps, model at the extraction step (L163). A workflow (L217); an agent would add cost and risk for no flexibility.
- **Research assistant (agent).** Search → read → decide what to search next — the path depends on the findings (L198). An agent (L203).
- **Support triage (hybrid).** The workflow routes (fixed), and an agent handles the open-ended troubleshooting branch (L230).
- **Content generation pipeline (workflow).** Outline → draft → review → publish — fixed order, model at each step (L217).
- **Customer escalation (hybrid).** The workflow detects the escalation trigger (fixed); the agent investigates and drafts the response (open-ended) (L230).

The through-line: **the shape follows the task** — and the production default is the hybrid, using each shape where it wins (L199, L230).

## 6. Interview Explanation

Say it in four moves:

1. **The definitions.** "Workflow — deterministic pipeline, fixed steps (L217). Agent — model-driven loop, steps decided at runtime (L198)."
2. **The rule.** "Known path → workflow; unknown path → agent (L199)."
3. **The costs.** "Workflows are cheaper (L150), faster (L151), testable (L341). Agents are flexible but costly and risky (L211) — needing the discipline (L205–213)."
4. **The hybrid.** "Most production systems are the hybrid: a workflow skeleton with agentic decision points (L230) — the path is guaranteed, the judgment is live."

## 7. Senior-Level Insights

- **The uncertainty is the variable (L199).** The senior answer selects the shape by the task's uncertainty, not by fashion — "the path is known" vs "the steps depend on the content". The rule is the deliverable (L199).
- **Workflows are the economics (L150, L151).** Fixed steps mean no loop overhead — cheaper tokens (L150), lower latency (L151), and unit-testable stages (L341). The senior default is the workflow *until* the task demands the loop.
- **Agents are the flexibility purchase (L198).** The loop's cost (L150) buys open-ended capability — and the buyer must also accept the failure surface (L211) and the discipline (L205–213). The senior answer names the full price, not just the capability.
- **The hybrid is the architecture (L230).** A workflow skeleton with agentic forks gives determinism where it matters (the path, the containment) and judgment where it pays (the forks) — the L230 pattern that module 11 builds on (L217).
- **The choice is re-evaluated (L341).** As tasks get better understood, agent branches become workflow steps — the shape is a measured decision (L195-style), re-run as the domain firms up (L341).

## 8. Common Mistakes

- **Everything is an "agent" (L199).** A fixed pipeline labeled agentic — the loop's costs (L150) paid for no flexibility (L217).
- **Agents for known paths (L199).** The invoice pipeline as a loop — drift (L211) and cost (L150) where a workflow is deterministic (L217).
- **Workflows for unknown paths (L199).** A fixed pipeline meeting an open-ended task — it fails at the first surprise (L211).
- **The hybrid ignored (L230).** Choosing one shape for a mixed task — the production pattern missed (L230).
- **Agents without the discipline (L205).** The loop with no stop conditions (L205), no guardrails (L209), no trace (L213) — the failure surface wide open (L211).
- **Never re-evaluating (L341).** The shape set at design time, never revisited as the domain firms up (L199).

## 9. Best Practices

- **Ask the uncertainty question first** (L199) — is the path known?
- **Default to the workflow** (L217) — cheaper (L150), testable (L341) — until the task demands the loop.
- **Use the agent where the path is genuinely open** (L198) — and bring the discipline (L205–213).
- **Design the hybrid for mixed tasks** (L230) — skeleton + agentic forks (L217).
- **Re-evaluate the shape** (L341) — as the domain firms up, agent branches become steps (L199).

## 10. Interview Questions

**Q: Agent vs workflow — how do you choose?**
> A: By the path's certainty (L199). A workflow is a deterministic pipeline — fixed steps, known order (L217): cheaper (L150), faster (L151), unit-testable (L341). An agent is a model-driven loop — the steps decided at runtime (L198): flexible for open-ended tasks, but costlier and riskier (L211), needing stop conditions (L205) and guardrails (L209). The rule: known path → workflow, unknown path → agent, and most production systems are the hybrid (L230).

**Q: Why prefer a workflow when you can?**
> A: Economics and testability (L199). A workflow has no loop overhead — no repeated decisions, no drift surface (L211): cheaper tokens (L150), lower latency (L151). And every step is a unit — I can test the pipeline like any code (L341). An agent buys flexibility with cost (L150) and risk (L211) — I only pay when the task's path is genuinely unknown (L198).

**Q: What makes a task "agentic"?**
> A: The path's dependence on the content (L199). If the next step depends on the previous step's result — a research task, a novel troubleshooting case — the shape is a loop (L198). If the steps are fixed regardless of content — extract, validate, post — the shape is a workflow (L217). The content decides; the shape follows (L199).

**Q: What's the hybrid?**
> A: A workflow skeleton with agentic decision points (L230). The skeleton guarantees the path — the steps that are known stay fixed, the containment stays deterministic (L217). At the forks — where the next branch depends on the content — an agent decides (L198). It's the production default: determinism where it matters, judgment where it pays (L230).

## 11. Follow-Up Questions

- How does the hybrid look in code (L230)?
- When does an agent branch become a workflow step (L341)?
- How do you test each shape (L341)?
- How does cost differ between the shapes (L150)?
- How does module 11's automation build on the hybrid (L217)?

## 12. Comparison Table — Workflow vs Agent

| | Workflow (L217) | Agent (this lesson) |
|---|---|---|
| Path | fixed, known | decided at runtime (L198) |
| Cost (L150) | cheaper — no loop | loop overhead per step |
| Latency (L151) | faster | repeated decisions |
| Testability (L341) | every step a unit | the loop + the discipline |
| Failure surface (L211) | small | drift, spinning, agency |
| Best for | known paths | open-ended tasks |
| The rule (L199) | known path | unknown path |

The senior read: **the shape follows the uncertainty** — and the hybrid (L230) is where most production lands.

## 13. Code Example — The Decision in Code

```js
// Agent vs workflow — the shape follows the task's uncertainty (L199).
// WORKFLOW — deterministic pipeline: fixed steps, known order (L217).
async function invoiceWorkflow(doc) {
  const extracted = await extractFields(doc);      // model at the step (L163)
  const validated = validate(extracted);           // deterministic
  await postToLedger(validated);                   // deterministic
  return notify(validated);                        // deterministic
}

// AGENT — the loop: the next step depends on the last result (L198).
async function researchAgent(question) {
  const messages = [{ role: 'user', content: question }];
  for (let i = 0; i < 10; i++) {                   // the loop (L200)
    const r = await chat({ messages, tools: [search, read] });
    if (!r.toolCalls?.length) return r.content;    // done (L205)
    const result = await executeTool(r.toolCalls[0]);   // L201
    messages.push({ role: 'tool', content: result });   // L206
  }
  throw new Error('step budget exceeded');          // the stop condition (L205)
}

// HYBRID (L230) — workflow skeleton, agentic fork.
async function supportTriage(ticket) {
  const route = await classify(ticket);             // step 1 — fixed
  if (route === 'troubleshoot') {
    return researchAgent(ticket);                   // the agentic fork (L198)
  }
  return replyFromTemplate(ticket);                 // step 2 — fixed
}
```

```text
What the reader must SEE — the three shapes:

  invoiceWorkflow()  fixed order — deterministic (L217)
  researchAgent()    loop until done or budget — open (L198, L205)
  supportTriage()    skeleton + agentic fork — the hybrid (L230)

  Known path → workflow. Unknown path → agent. Mixed → hybrid.
```

```narrate
3-7: The workflow — fixed steps, model at the extraction step only; deterministic and unit-testable (L217, L341).
9-17: The agent — the loop decides the next step from the last result, with the step budget as the stop condition (L198, L200, L205).
19-25: The hybrid — the workflow skeleton classifies (fixed), and the open-ended branch is the agent (L230).
```

> [!TIP]
> The line that shows the rule: **`if (route === 'troubleshoot') return researchAgent(...)`** — the hybrid. **The skeleton guarantees the path; the agent decides at the fork (L230).**

## 14. Performance Notes

- **Workflows are the latency win (L151).** No loop overhead — the pipeline's latency is the sum of its steps (L145), not N decisions (L199).
- **Agents are the cost line (L150).** Every cycle is a model call (L145) — the step budget (L205) is the cost control (L150).
- **The hybrid bounds both (L230).** The skeleton's steps are cheap; the agentic fork's budget (L205) bounds the loop — the hybrid is the economics of both shapes (L217).
- **Both shapes are testable (L341).** Workflow steps are units; the agent's trace (L213) feeds the golden set (L343) — the shapes differ, the CI doesn't (L341).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Pipeline fails on novel input | Workflow for an unknown path (L199) | Make the fork agentic (L230) |
| Agent drifts from the task | Loop with no rails (L209) | Add guardrails + stop conditions (L205) |
| Cost climbing | Agent for a known path (L150) | Convert the fixed part to steps (L217) |
| Hard to test | The loop untested (L341) | Unit-test steps; eval the loop (L343) |
| Shape feels wrong | The hybrid ignored (L230) | Skeleton + agentic forks (L217) |

## 16. Quick Revision Notes

- Workflow = **deterministic pipeline, fixed steps** (L217).
- Agent = **model-driven loop, steps at runtime** (L198).
- The rule: **known path → workflow; unknown path → agent** (L199).
- Workflows: **cheaper (L150), faster (L151), testable (L341)**.
- Agents: **flexible, risky (L211)** — need the discipline (L205–213).
- Production: **the hybrid (L230)** — skeleton + agentic forks.

## 17. Cheat Sheet

```text
AGENT vs WORKFLOW = the shape follows the task's uncertainty

THE TWO SHAPES (L199)
  workflow  deterministic pipeline — fixed steps, known order (L217)
            cheaper (L150) · faster (L151) · testable (L341)
  agent     model-driven loop — steps decided at runtime (L198)
            flexible · costly (L150) · risky (L211)

THE RULE (L199)
  known path   → workflow  (the determinism is a feature)
  unknown path → agent     (the flexibility is the requirement)
  mixed        → the hybrid (L230)

THE HYBRID (L230)
  workflow skeleton + agentic decision points
  the path is guaranteed · the judgment is live
  determinism where it matters, flexibility where it pays

THE DISCIPLINE (L216)
  the agent needs: stop conditions (L205) · guardrails (L209)
  observability (L213) · evals (L343)

INTERVIEW, 4 MOVES
  1 define  "pipeline vs loop"
  2 rule    "known path → workflow, unknown → agent"
  3 costs   "cheap + testable vs flexible + risky"
  4 hybrid  "skeleton + agentic forks (L230)"
```

## 18. Key Takeaways

> [!RECAP]
> - The decision is **about uncertainty, not excitement** (L199): known path → workflow (L217), unknown path → agent (L198)
> - A **workflow** is a deterministic pipeline — cheaper (L150), faster (L151), and unit-testable (L341)
> - An **agent** is a model-driven loop — flexible for open-ended tasks, but costlier (L150) and riskier (L211), needing the L205–213 discipline
> - **Most production systems are the hybrid** (L230): a workflow skeleton with agentic decision points — the path guaranteed, the judgment live
> - The shape is **re-evaluated** (L341) — as the domain firms up, agent branches become workflow steps
> - Naming the task's uncertainty is the senior move — **"the steps depend on the content"** is what makes a task agentic (L199)

## Check your understanding

Answer these without looking back.

1. Define workflow and agent (L199).
2. What's the decision rule (L199)?
3. Why are workflows cheaper and more testable (L150, L341)?
4. What makes a task agentic (L198)?
5. What's the hybrid, and when is it right (L230)?
6. What discipline does an agent require (L205)?
7. When does an agent branch become a workflow step (L341)?
8. Why is the uncertainty the variable (L199)?

## A Closing Note — The Shape That Follows the Task

You now hold the decision rule: **known path → workflow, unknown path → agent, mixed → the hybrid.** The shape is chosen by the task's uncertainty, not by fashion — and the production default uses each shape where it wins.

Next: the loop's anatomy — agent architecture (L200), the diagram you'll draw in every interview.
