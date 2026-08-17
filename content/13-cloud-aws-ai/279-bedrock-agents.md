# Lesson 279 — Bedrock Agents

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do the agents run on AWS?" — the answer is *Bedrock Agents*: the managed agents — the tools, the action groups, and the orchestration (L279).**

L200 built the agent loop (L200) and L201 the tool calling (L201); this lesson is **their AWS implementation**: Bedrock Agents — the managed agents: the agent (the loop, L200), the action groups (the tools, L201), the knowledge bases (the retrieval, L280), and the guardrails (the boundaries, L281). The AI platform's shape: the tool-calling agents (L200) run on Bedrock Agents (L279) — the loop, the tools, and the governance managed (L279). This lesson is the L200 agent loop, AWS-shaped (L279).

The distinction this lesson is built on: a **demo** hand-rolls the loop. A **solutions architect** uses the managed agent (L279): the action groups (L201), the orchestration (L279), and the guardrails (L281) — because the production agents (L216) need the managed loop (L279).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the agent: the managed loop (L200)
- Explain the action groups: the tools (L201)
- Explain the knowledge bases: the retrieval (L280)
- Explain the guardrails: the boundaries (L281)
- Explain the AI shape: the production agent loop (L279)

## 1. One-Line Definition

**Bedrock Agents is the managed agents — the tools, the action groups, and the orchestration (L279) — the agent (the managed loop: the plan, the call, the observe, the iterate, L200), the action groups (the tools: the Lambda-backed actions L266 with the schemas L201), the knowledge bases (the managed retrieval, L280), and the guardrails (the content filters and the PII redaction, L281) — the L200 agent loop, AWS-shaped (L279).**

The one-sentence interview answer: *"Bedrock Agents is AWS's managed agent service (L279). The shape: the agent (L279) — the managed loop (L200): the model plans, calls a tool, observes the result, and iterates (L200) — the orchestration (L279) handled by the service (L279). The tools: the action groups (L279) — the Lambda-backed actions (L266) with the OpenAPI schemas (L201): the agent calls `get_document` (L279), the Lambda (L266) runs it, the result returns to the loop (L279). The knowledge: the knowledge bases (L280) attached — the retrieval (L280) grounds the agent (L279). The governance: the guardrails (L281) — the content filters and the PII redaction (L313) applied to the agent's inputs and outputs (L281). The AI shape: the production agent (L216) — the tool loop (L201) with the retrieval (L280), the guardrails (L281), and the IAM (L262) — runs on Bedrock Agents (L279): the loop, the tools, and the governance managed (L279), with the observability (L274) through the service (L279). The L200 agent loop, AWS-shaped (L279)."*

## 2. Mental Model

Think of Bedrock Agents as **the managed concierge desk.** The concierge (the agent, L279) takes the request (L279): it plans (L200), calls the services (the tools, L201), checks the results, and iterates (L200) — until the request is done (L279). The services it can call (the action groups, L279) are listed on the desk's board (the schemas, L201): the document service (L266), the calendar service (L266) — each with its number (L279). The desk has its own reference library (the knowledge bases, L280) for the questions it answers from the documents (L280). And the desk's policies (the guardrails, L281): the sensitive details (the PII, L313) redacted, the off-limit topics (L281) refused. The desk works because the concierge is trained (the loop, L200), the board is clear (the tools, L201), and the policies are enforced (L281).

```text
   the concierge (Bedrock Agents, L279)
   ┌────────────────────────────────────────────────────────┐
   │ the concierge (the agent, L279) — the managed loop     │
   │ (L200)                                                 │
   │ the board (the action groups, L279) — the tools, the   │
   │ schemas (L201)                                         │
   │ the library (the knowledge bases, L280) · the policies │
   │ (the guardrails, L281)                                 │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the concierge**: the loop, the board, the library, and the policies (L279).

## 3. Visual Flow — One Agent Run

```text
   the user's request (L279)
        │
        ▼
   ┌────────────────────── THE LOOP (L200, L279) ──────────────────────┐
   │  1 · the model plans (L202)                                      │
   │  2 · the tool call: get_document (L201, L279)                    │
   │     → the Lambda (L266) runs it (L279)                           │
   │  3 · the observation: the document's content (L200)              │
   │  4 · the iterate: the answer formed (L279)                       │
   └──────────────┬──────────────────────────────────┬────────────────┘
                  ▼                                  ▼
   ┌──────────────────────────┐   ┌──────────────────────────────────┐
   │ the knowledge (L280)     │   │ the guardrails (L281)            │
   │ the retrieval grounds    │   │ the filters + the PII redaction  │
   │ the agent (L279)         │   │ (L313) on the in and the out     │
   └──────────────────────────┘   └──────────────────────────────────┘
```

The flow is the agent run: **plan → tool → observe → iterate**, grounded and guarded (L279).

## 4. How It Works — The Agent, Part by Part

- **The agent (L279).** The managed loop (L200): the model plans (L202), calls a tool, observes the result, and iterates (L200) — the orchestration (L279) handled by the service (L279), the termination (L205) bounded (L279).
- **The action groups (L279).** The tools (L201): the Lambda-backed actions (L266) with the OpenAPI schemas (L201) — the agent calls the action (L279), the Lambda (L266) runs it with the IAM role (L262), and the result returns (L279).
- **The knowledge bases (L280).** The managed retrieval (L280): the agent queries the knowledge base (L280) when the answer needs the documents (L279) — the grounding (L280) with the citations (L192).
- **The guardrails (L281).** The boundaries (L281): the content filters (L281) and the PII redaction (L313) applied to the agent's inputs and outputs (L281) — the L209 guardrails (L209), AWS-shaped (L281).
- **The governance (L279).** The IAM (L262) for the actions (L279), the trace (L274) of the run (L279), and the quota (L149) — the agent's governance (L279).

> [!NOTE]
> **The managed loop removes the loop's plumbing (L279).** The hand-rolled agent (L200) owns the loop (L200): the state (L207), the retries (L256), the termination (L205), the observability (L213) — all yours (L279). The Bedrock agent (L279) owns them: the orchestration (L279), the tool calls (L201), and the trace (L274) handled (L279) — you configure the actions (L279), the knowledge (L280), and the guardrails (L281) (L279). The production agent (L216) gets the managed loop (L279).

## 5. Real Project Usage

- **A document assistant (L279).** The agent (L279) with the knowledge base (L280) and the document actions (L266) — the answers grounded (L280), cited (L192).
- **A customer support agent (L350).** The agent (L279) with the ticket actions (L266), the knowledge base (L280), and the escalation (L350).
- **An operations agent (L279).** The agent (L279) with the database actions (L268) and the approval gate (L208) — the L324 control (L324).
- **A multi-tenant product (L357).** The per-tenant agents (L320) — the per-tenant knowledge (L280) and the per-tenant quotas (L149).
- **Anything agentic (L216).** The production agent (L216) — the loop, the tools, and the governance — runs on Bedrock Agents (L279).

The through-line: **the managed agent is the production loop** — the tools, the knowledge, and the guardrails managed (L279).

## 6. Interview Explanation

Say it in four moves:

1. **The agent.** "The managed loop (L200) — the plan, the call, the observe, the iterate (L279)."
2. **The actions.** "The action groups (L279) — the Lambda-backed tools (L266) with the schemas (L201)."
3. **The knowledge.** "The knowledge bases (L280) — the retrieval grounds the agent (L279)."
4. **The guardrails.** "The filters and the PII redaction (L281, L313) on the in and the out (L281)."

## 7. Senior-Level Insights

- **The managed loop is the production difference (L279).** The hand-rolled loop (L200) owns the state (L207), the retries (L256), and the termination (L205) (L279); the Bedrock agent (L279) owns them (L279) — the team builds the actions (L279), not the loop (L279).
- **The action group is the blast-radius control (L314).** The tools (L201) with the Lambda's IAM role (L262) — the least privilege (L262) bounds the agent's reach (L314) — the L314 excessive agency (L314), action-shaped (L279).
- **The knowledge base is the grounding (L280).** The retrieval (L280) with the citations (L192) — the agent's answers (L280) grounded (L279).
- **The guardrails are the L209 boundary (L209).** The filters and the redaction (L281) — the L209 guardrails (L209), AWS-shaped (L281).
- **The trace is the audit's record (L322).** The agent's runs (L279) traced (L274) — the L322 audit (L322), agent-shaped (L279).

## 8. Common Mistakes

- **The hand-rolled loop (L200).** The bespoke orchestration (L279) — the state (L207) and the retries (L256) reinvented (L279).
- **The action too broad (L314).** The tool with the wide IAM (L262) — the L314 excessive agency (L314) uncontained (L279).
- **The knowledge base skipped (L280).** The agent answering from the training (L279) — the grounding (L280) lost, the hallucinations (L336) up (L279).
- **The guardrails missing (L281).** The unfiltered agent output (L281) — the PII (L313) and the harmful content (L309) ungoverned (L279).
- **The termination unbounded (L205).** The loop without the max iterations (L205) — the runaway cost (L285) (L279).

## 9. Best Practices

- **Use the managed loop** (L279) — the orchestration (L279) handled (L279).
- **Scope the actions** (L262) — the Lambda's role (L262), the least privilege (L314).
- **Attach the knowledge bases** (L280) — the grounding (L280) and the citations (L192).
- **Apply the guardrails** (L281) — the filters and the redaction (L313).
- **Bound the loop** (L205) — the max iterations (L205), the quotas (L149).

## 10. Interview Questions

**Q: Walk me through Bedrock Agents.**
> A: The managed agents (L279). The agent — the managed loop (L200): the plan, the call, the observe, the iterate (L279). The action groups — the Lambda-backed tools (L266) with the schemas (L201). The knowledge bases — the retrieval (L280). And the guardrails — the filters and the PII redaction (L281).

**Q: How does the agent call a tool?**
> A: Through the action groups (L279): the action is defined with an OpenAPI schema (L201), backed by a Lambda (L266) with an IAM role (L262). The agent calls the action (L279), the Lambda (L266) runs it, and the result returns to the loop (L200) — the observation (L279).

**Q: How do you ground the agent?**
> A: With the knowledge bases (L280): the agent (L279) queries the knowledge base (L280) when the answer needs the documents — the retrieval (L280) with the citations (L192). The answers are grounded (L280), not generated from the training (L279).

**Q: How do you keep the agent safe?**
> A: Three layers (L279): the guardrails (L281) — the content filters and the PII redaction (L313) on the inputs and the outputs (L281); the scoped actions (L262) — the Lambda's IAM role (L262) bounds the agent's reach (L314); and the bounded loop (L205) — the max iterations (L205) and the quotas (L149) cap the cost (L285).

## 11. Follow-Up Questions

- What's the agent (L279)?
- What are the action groups (L279)?
- What's the knowledge base for (L280)?
- What are the guardrails (L281)?
- How do you keep the agent safe (L279)?

## 12. Comparison Table — The Hand-Rolled vs the Managed Agent

| | The hand-rolled agent (L200) | The Bedrock agent (L279) |
|---|---|---|
| Loop (L279) | yours — the state (L207), the retries (L256) | the managed orchestration (L279) |
| Tools (L201) | your tool router (L204) | the action groups (L279) |
| Grounding (L280) | your retrieval (L189) | the knowledge bases (L280) |
| Guardrails (L209) | your filters (L209) | the managed guardrails (L281) |
| Observability (L213) | your traces (L213) | the service's traces (L274) |

The senior read: **the managed agent removes the loop's plumbing** — the team configures, the service runs (L279).

## 13. Code Example — The Agent, Configured

```js
// The managed agent (L279) — the loop, the tools, the knowledge (L279).
const agent = {
  name: 'document-assistant',
  foundationModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',  // the model (L148)

  // THE ACTION GROUPS (L279) — the tools (L201).
  actionGroups: [{
    name: 'document-actions',
    actions: [{
      name: 'get_document',                       // the tool (L201)
      schema: { /* the OpenAPI schema (L201) */ },
      lambda: getDocumentLambda,                  // the backing Lambda (L266)
      // the IAM role (L262): the least privilege (L314)
    }],
  }],

  // THE KNOWLEDGE BASE (L280) — the grounding (L280).
  knowledgeBases: [{ kbId: 'company-docs', retrieval: { topK: 5 } }],

  // THE GUARDRAILS (L281) — the filters and the redaction (L313).
  guardrails: { contentFilter: 'strict', piiRedaction: true },

  // THE BOUNDS (L205) — the loop's ceiling (L205).
  maxIterations: 10,                              // the termination (L205)
};
```

```text
What the reader must SEE — the agent, configured:

  foundationModel        → the model's choice (L148)
  actionGroups: get_document → the Lambda-backed tool (L201, L266)
  knowledgeBases         → the grounding (L280)
  guardrails: strict     → the boundaries (L281)
  maxIterations: 10      → the bounded loop (L205)

  The loop managed, the tools scoped, the answers grounded (L279).
```

```narrate
4-5: The agent — the model's choice for the managed loop (L148, L279).
7-17: The action groups — the get_document tool, the schema, and the Lambda with the scoped role (L201, L266, L262).
19-21: The knowledge base — the retrieval grounds the agent (L280).
23-25: The guardrails — the content filter and the PII redaction (L281, L313).
27-28: The bounds — the max iterations cap the loop (L205).
```

> [!TIP]
> The pair that defines Bedrock Agents: **the action group** (the scoped tool, L279) and **the knowledge base** (the grounding, L280). **Scope the tools, ground the answers, guard the loop — the L200 loop, AWS-shaped (L279).**

## 14. Performance Notes

- **The managed loop is the latency's frame (L279).** The iterations (L200) — each tool call (L201) adds the round-trip (L279); the loop's length (L205) is the latency's (L279).
- **The retrieval is the grounding's speed (L280).** The knowledge base's retrieval (L280) — the top-k (L189) bounded (L280).
- **The stream is the UX (L251).** The agent's responses (L279) stream (L251) — the TTFT (L145) preserved (L279).
- **The iterations are the cost (L285).** The loop's calls (L200) — each iteration (L279) is the tokens (L332) and the cost (L285); the bound (L205) is the bill's (L279).

## 15. Debugging Scenarios

| Symptom | First check (L279) | The lever |
|---|---|---|
| The tool call fails | The action group (L279) | The Lambda (L266), the IAM role (L262) |
| The answers are ungrounded | The knowledge base (L280) | The retrieval (L280), the top-k (L189) |
| The PII leaks | The guardrails (L281) | The PII redaction (L313) |
| The loop runs away | The bounds (L205) | The max iterations (L205), the quotas (L149) |
| The cost spikes | The iterations (L285) | The loop's bound (L205), the model's choice (L148) |

## 16. Quick Revision Notes

- Bedrock Agents = **the managed agents** (L279): the loop, the action groups, the knowledge, the guardrails.
- The agent: **the managed loop (L200) — the plan, the call, the observe, the iterate**.
- The actions: **the action groups (L279) — the Lambda-backed tools (L266) with the schemas (L201)**.
- The knowledge: **the knowledge bases (L280) — the grounding (L280)**.
- The guardrails: **the filters and the PII redaction (L281, L313)**.

## 17. Cheat Sheet

```text
BEDROCK AGENTS = the managed agents — the tools, the action groups,
the orchestration

THE AGENT (L279)
  the managed loop (L200) — plan, call, observe, iterate
  the termination (L205) bounded · the orchestration managed (L279)

THE ACTION GROUPS (L279)
  the tools (L201) — the Lambda-backed actions (L266)
  the OpenAPI schemas (L201) · the IAM role (L262)
  the least privilege (L314) — the blast radius (L314)

THE KNOWLEDGE BASES (L280)
  the managed retrieval (L280) — the top-k (L189)
  the grounding (L280) with the citations (L192)

THE GUARDRAILS (L281)
  the content filters (L281) · the PII redaction (L313)
  applied to the inputs and the outputs (L281)

THE AI SHAPE (L279)
  the production agent (L216) — the loop, the tools, and the
  governance — managed (L279), traced (L274)

INTERVIEW, 4 MOVES
  1 agent    "the managed loop (L200)"
  2 actions  "the action groups — the Lambda tools (L201, L266)"
  3 knowledge "the knowledge bases — the grounding (L280)"
  4 guardrails "the filters + the redaction (L281, L313)"
```

## 18. Key Takeaways

> [!RECAP]
> - Bedrock Agents is **the managed agents — the tools, the action groups, and the orchestration** (L279): the agent (L279), the action groups (L279), the knowledge bases (L280), and the guardrails (L281)
> - **The agent** (L279) is the managed loop (L200) — the plan, the call, the observe, and the iterate, with the orchestration and the termination (L205) handled by the service (L279)
> - **The action groups** (L279) are the tools (L201) — the Lambda-backed actions (L266) with the OpenAPI schemas (L201) and the scoped IAM role (L262), bounding the agent's reach (L314)
> - **The knowledge bases** (L280) ground the agent (L279) — the retrieval (L280) with the citations (L192)
> - **The guardrails** (L281) are the boundaries — the content filters and the PII redaction (L313) on the inputs and the outputs (L281)
> - The AI shape (L279): the production agent (L216) runs on Bedrock Agents (L279) — the loop, the tools, and the governance managed, traced (L274), and bounded (L205) — the L200 agent loop, AWS-shaped (L279)

## Check your understanding

Answer these without looking back.

1. What's the agent (L279)?
2. What are the action groups (L279)?
3. What's the knowledge base for (L280)?
4. What are the guardrails (L281)?
5. How do you keep the agent safe (L279)?
6. What's the L314 control (L314)?
7. How do you ground the agent (L280)?
8. What is the L200 loop, AWS-shaped (L279)?

## A Closing Note — The Concierge, Trained

You now hold the managed agents: **the loop, the action groups, the knowledge, and the guardrails — with the orchestration managed and the tools scoped.** The AWS stack has its agents — and the loop runs itself (L279).

Next: the managed RAG — Bedrock Knowledge Bases (L280).
