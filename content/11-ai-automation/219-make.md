# Lesson 219 — Make

**Interview importance:** ⭐⭐⭐⭐ — "n8n or Make?" — the answer is the *visual alternative*: Make's scenario canvas, when it fits, and the managed-vs-self-hosted trade (L218, L288).**

L218 gave you n8n; this lesson is the **visual alternative**: Make — the cloud-hosted visual automation platform: scenarios (the workflow, L217), modules (the steps), and the AI/LLM modules (L163) — built for non-engineers and fast prototyping, at the price of being managed (L288) and less extensible than self-hosted n8n (L218). The senior view: Make and n8n are the same L217 unit with different trades — Make's managed visual canvas vs n8n's self-hosted extensibility (L230).

The distinction this lesson is built on: a **demo** picks a tool by which is more popular. A **solutions architect** picks by the trade: Make for the managed visual canvas (fast, non-engineer-friendly, L219), n8n for self-hosted extensibility (L218), a custom build for the platform's needs (L230) — the L217 unit is the same; the tool is a fit decision (L230).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain Make: scenarios, modules, and the AI modules (L219)
- Explain the managed trade: zero infra vs control (L288)
- Compare Make vs n8n: the visual canvas and the extensibility (L218)
- Explain the AI/LLM modules: models in the canvas (L163)
- Decide Make vs n8n vs custom by fit (L230)

## 1. One-Line Definition

**Make is the cloud-hosted visual automation platform — scenarios (the L217 workflow), modules (the steps), and AI/LLM modules (L163) on a managed canvas — the fastest path for non-engineers and prototyping (L219), trading n8n's self-hosted extensibility (L218) for zero infrastructure (L288), and bested by a custom build where the L230 platform's needs outgrow any canvas (L230).**

The one-sentence interview answer: *"Make is the managed visual alternative to n8n (L219). A scenario is the L217 workflow — a canvas of modules: trigger modules (L220), integration modules (L223–227), and the AI/LLM modules (L163) that call models with a prompt and a schema (L143). The trade vs n8n (L218): Make is cloud-hosted — zero infrastructure (L288), built for non-engineers, and very fast to prototype (L219); n8n is self-hosted (L288) and extensible with custom nodes (L218). My rule: the L217 unit is the same; the tool is a fit decision (L230) — Make for the managed visual canvas and the non-engineer team (L219), n8n for self-hosted control (L218), and the custom build when the L230 platform's needs — queues (L222), recovery (L232), scale — outgrow the canvas (L230)."*

## 2. Mental Model

Think of Make as **a managed LEGO board — the same assembly line as n8n, but assembled in a cloud workshop.** The pieces (modules) snap onto the board (the scenario canvas): a trigger brick (L220), an AI brick (L163), an integration brick (L223–227). The workshop (Make's cloud) provides the table, the tools, and the storage — you don't maintain any of it (L288). The trade: the workshop is someone else's — its rules, its limits, its uptime (L288) — while n8n's board is in *your* workshop (self-hosted, L218), and a custom build is *your own* machinery (L230). The board is the same L217 line; the workshop decides (L230).

```text
   MAKE (managed, L219)          N8N (self-hosted, L218)     CUSTOM (L230)
   ┌────────────────────┐        ┌────────────────────┐      ┌────────────────────┐
   │ cloud canvas       │        │ your canvas        │      │ your platform      │
   │ modules snap on    │        │ nodes + custom     │      │ queues (L222)      │
   │ zero infra (L288)  │        │ self-hosted (L288) │      │ recovery (L232)    │
   │ non-engineer fast  │        │ extensible (L218)  │      │ full control       │
   └────────────────────┘        └────────────────────┘      └────────────────────┘
```

The mental model is **the workshop**: the same line, three workshops — managed, self-hosted, or yours (L230).

## 3. Visual Flow — The Scenario Canvas

```text
   the scenario canvas (L219)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · TRIGGER MODULE (L220)                                │
   │     webhook · schedule · app event — starts the scenario │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · AI/LLM MODULES (L163)                                │
   │     the model calls — extract, classify, draft — with    │
   │     the prompt and the schema (L143)                     │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE ROUTER (L230)                                    │
   │     conditions route by the AI output                    │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · INTEGRATION MODULES (L223-227)                       │
   │     the CRM, the email, the database, the APIs           │
   └──────────────────────────────────────────────────────────┘
```

The flow is the canvas: **trigger → AI → route → integrate** — the L217 unit, managed (L219).

## 4. How It Works — The Canvas, the Managed Trade, the Comparison

- **The scenario (L219).** Make's workflow (L217): a canvas of modules — trigger (L220), AI/LLM (L163), logic (L230), and integrations (L223–227) — connected in the L199 skeleton (L217).
- **The AI/LLM modules (L163).** The model calls in the canvas: a prompt, a model, a schema (L143) — extract, classify, draft (L163). The same contract as any AI step (L217).
- **The managed trade (L288).** Make is cloud-hosted: zero infrastructure (L288), the platform's uptime and limits (L288), and the data flows through Make's cloud (L275, L312) — the control story is the price (L218).
- **Make vs n8n (L218).** Same L217 unit, different trades: Make's managed canvas is faster for non-engineers (L219); n8n's self-hosted extensibility (L218) keeps the data and the keys in your infrastructure (L275) and allows custom nodes (L230).
- **The custom build (L230).** When the platform's needs — queues (L222), recovery (L232), scale, complex state (L207) — outgrow the canvas, the custom build is the L230 platform (L230).

> [!NOTE]
> **The managed trade is a data-and-control decision (L288, L275).** Make's convenience — zero infrastructure (L288) — comes with a price: the scenarios and the data flow through Make's cloud (L275). For internal, non-sensitive workflows, that's fine (L219). For customer data, regulated data, or security-sensitive automation (L312), the self-hosted (L218) or custom (L230) path keeps the data and the keys in your infrastructure (L275). The tool choice is a data-governance decision (L373), not just a canvas preference (L230).

## 5. Real Project Usage

- **Non-engineer teams (L219).** Marketing and ops building their own automations — the managed canvas needs no code (L219).
- **Fast prototyping (L219).** A workflow proven in Make in a day, then moved to the platform (L230) if it scales (L218).
- **Internal dashboards (L223).** The CRM data piped to a weekly digest (L221) — the AI module summarizes (L163).
- **Sensitive workflows (L218).** Customer data → self-hosted n8n (L218) or the custom build (L230) — the data stays yours (L275).
- **Anything standard-shaped (L230).** The scenario canvas builds the standard line fast (L219) — the trade decides the tool (L230).

The through-line: **Make is the managed canvas for the same L217 line** — the trade (zero infra vs control, L288) and the team decide the tool (L230).

## 6. Interview Explanation

Say it in four moves:

1. **The platform.** "Make — the cloud-hosted visual canvas: scenarios (L217), modules (L163), integrations (L223–227)."
2. **The trade.** "Managed: zero infrastructure (L288), non-engineer-friendly — but the data flows through Make's cloud (L275)."
3. **The comparison.** "Same L217 unit as n8n (L218) — Make's canvas vs n8n's self-hosted extensibility (L288)."
4. **The rule.** "Managed + non-engineer team → Make (L219); control + extensibility → n8n (L218); platform needs → custom (L230)."

## 7. Senior-Level Insights

- **The L217 unit is the constant (L219).** The senior answer keeps the workflow design (L217) independent of the tool (L230) — the canvas is an implementation, not the architecture (L230).
- **The managed trade is a governance decision (L373).** The data path (L275) and the control story (L312) are the real price of zero infra (L288) — the senior answer names the governance, not just the canvas (L230).
- **The AI modules are the L163 contract (L163).** The prompt, the model, and the schema (L143) — the same discipline as any AI step (L217); the canvas doesn't change the contract (L230).
- **Prototype-in-Make, scale-out is the pattern (L230).** A workflow proven in the managed canvas (L219), then moved to the platform (L230) when the scale demands (L222) — the senior answer plans the migration (L218).
- **The tool is a fit decision (L362).** Team, data, and control (L288) decide Make vs n8n vs custom (L230) — never fashion (L362).

## 8. Common Mistakes

- **Make for everything (L230).** Sensitive data in the managed cloud (L275) — the governance price unexamined (L373).
- **The canvas as the platform (L230).** The queues (L222), recovery (L232), and scale forced into modules (L219) — the L230 platform's concerns (L230).
- **The AI modules for everything (L163).** Model calls where rules work (L199) — the cost (L150) and the failure surface (L211).
- **No exit plan (L230).** The workflow built in Make with no migration path (L218) — vendor-bound (L362) when it scales (L230).
- **The tool by fashion (L362).** Make vs n8n by popularity (L219) instead of by the trade (L230).
- **The non-engineer assumption (L219).** The managed canvas still needs the L217 discipline — checkpoints (L228), contracts (L163), recovery (L232).

## 9. Best Practices

- **Keep the L217 design tool-independent** (L230) — the canvas is an implementation (L219).
- **Weigh the data path** (L275) — sensitive data → self-hosted or custom (L288).
- **Use the AI modules with contracts** (L163, L143) — the L217 discipline in the canvas (L230).
- **Gate the consequential steps** (L228) — the human checkpoint in the scenario (L208).
- **Plan the exit** (L230) — prototype in Make (L219), migrate when it scales (L218).
- **Choose by team and control** (L362) — non-engineer + non-sensitive → Make (L230).

## 10. Interview Questions

**Q: What is Make?**
> A: The cloud-hosted visual automation platform (L219). A scenario is the L217 workflow — a canvas of modules: trigger (L220), AI/LLM (L163), logic (L230), and integrations (L223–227). It's managed — zero infrastructure (L288) — and built for non-engineers and fast prototyping (L219). The trade vs n8n (L218): Make's canvas vs n8n's self-hosted extensibility (L288).

**Q: Make vs n8n — how do you choose?**
> A: The trade (L230). Same L217 unit; different workshops (L219). Make: managed, zero infra (L288), non-engineer-friendly, very fast — but the data flows through Make's cloud (L275). n8n: self-hosted (L288), extensible with custom nodes (L218), data and keys stay yours (L275). The decision is the data path and the team (L362): non-sensitive + non-engineer → Make; control + extensibility → n8n (L230).

**Q: What do the AI modules do?**
> A: The model calls in the canvas (L163): a prompt, a model, and a schema (L143) — extract, classify, draft (L163). The same contract as any AI step in the L217 unit (L217) — the canvas doesn't change the discipline (L230): defined inputs and outputs, placed only where judgment pays (L163).

**Q: When does Make stop being the right tool?**
> A: When the platform's needs outgrow the canvas (L230): the scale that demands queues (L222), the recovery story (L232), complex state (L207), or the data path that can't flow through a managed cloud (L275). The pattern is prototype-in-Make, scale-out (L219): prove the workflow in the managed canvas, migrate to the platform (L230) — or self-hosted n8n (L218) — when it earns the move (L230).

## 11. Follow-Up Questions

- How does the data path decide the tool (L275)?
- What's the Make vs n8n trade (L218)?
- How do the AI modules fit the L163 contract (L219)?
- When does the custom build win (L230)?
- How do you plan the migration (L218)?

## 12. Comparison Table — Make vs n8n

| | Make (this lesson) | n8n (L218) |
|---|---|---|
| Hosting | managed cloud (L288) | self-hosted (L288) |
| Building | visual, non-engineer (L219) | visual + custom nodes (L218) |
| Data path (L275) | through Make's cloud | stays yours (L275) |
| Extensibility | module-limited | custom nodes (L218) |
| Speed (L151) | fastest to start (L219) | fast, more setup (L288) |
| The fit (L230) | managed + non-sensitive | control + extensibility |

The senior read: **the columns are the trade** — the managed canvas vs the self-hosted control — and the L217 unit is the constant (L230).

## 13. Code Example — The Scenario, as Data

```js
// The Make scenario as data — the L217 unit, managed (L219, L163).
const scenario = {
  modules: [
    // TRIGGER (L220)
    { id: 'trigger', type: 'webhook', params: { path: 'lead' } },
    // AI/LLM MODULE (L163) — the contract (L143)
    {
      id: 'enrich', type: 'ai.llm',
      params: {
        model: 'gpt-4o-mini',
        prompt: 'Extract the company details as JSON.',
        schema: { name: 'string', industry: 'string', size: 'number' },  // L143
      },
    },
    // THE GATE (L208, L228) — the human checkpoint
    { id: 'approve', type: 'wait', params: { resume: 'approval' } },
    // INTEGRATION (L223) — the CRM
    { id: 'crm', type: 'hubspot', params: { operation: 'upsert' } },     // L223
  ],
  routes: {
    trigger: ['enrich'],
    enrich: ['approve'],
    approve: ['crm'],                                   // the skeleton (L199, L217)
  },
};
```

```text
What the reader must SEE — the same line, a different workshop:

  webhook → trigger (L220) · ai.llm → the contract (L163, L143)
  wait → the human gate (L208, L228) · hubspot → the CRM (L223)
  routes → the skeleton (L199)

  The L217 unit, drawn in Make's managed canvas.
```

```narrate
3-4: The trigger — the webhook starts the scenario (L220).
6-13: The AI module — the model call with a prompt and a schema (L163, L143).
15-16: The gate — the human checkpoint in the canvas (L208, L228).
18-19: The integration — the CRM upsert (L223).
21-24: The routes — the skeleton's order (L199, L217).
```

> [!TIP]
> The module that shows the discipline carries over: **`{ type: 'wait', resume: 'approval' }`** — the human gate in the managed canvas. **The tool changes; the L217 discipline — contracts, checkpoints, recovery — does not (L230).**

## 14. Performance Notes

- **The managed canvas is the fastest start (L151).** Zero infra (L288) and the visual builder (L219) — the prototype in hours (L230).
- **The AI modules are the token cost (L150).** The model calls (L163) are the scenario's spend (L149) — placed where judgment pays (L230).
- **The wait modules are the latency (L151).** The human gates (L208) pause the scenario (L228) — the approval time is in the wall-clock (L219).
- **The migration is the scale path (L218).** The scenario proven in Make (L219), moved to the platform (L230) when the queues (L222) and the recovery (L232) demand (L230).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Sensitive data in the cloud | The managed path unexamined (L275) | Move to n8n/custom (L218, L230) |
| The scenario is slow | AI modules on the hot path (L150) | Cache (L171), smaller model (L157) |
| The gate never resumes | The wait miswired (L208) | Check the resume trigger (L228) |
| Scale problems | The platform's needs in modules (L222) | Migrate to the L230 platform (L230) |
| Vendor-bound | No exit plan (L218) | Design the migration path (L230) |

## 16. Quick Revision Notes

- Make = **the managed visual canvas** (L219): scenarios (L217), modules, AI/LLM (L163).
- The trade: **zero infra (L288) vs the data path (L275)**.
- vs n8n: **the same L217 unit, different workshops** (L218).
- The AI modules = **the L163 contract in the canvas** (L143).
- The rule: **managed + non-sensitive → Make; control → n8n; platform needs → custom** (L230).
- Prototype in Make, **scale out** (L230).

## 17. Cheat Sheet

```text
MAKE = the managed visual canvas — the L217 unit, hosted

THE CANVAS (L219)
  scenario  the workflow (L217) — modules, connected (L199)
  trigger   webhook · schedule (L220)
  AI/LLM    the model calls — prompt + model + schema (L163, L143)
  logic     routers and conditions (L230)
  integration  CRM (L223) · email (L224) · DB (L226) · APIs (L227)

THE TRADE (L288, L275)
  + zero infrastructure (L288) · non-engineer-friendly (L219)
  − the data flows through Make's cloud (L275) · module limits
  the governance decision (L373), not just a canvas preference

VS N8N (L218)
  same L217 unit — different workshops
  Make: managed canvas (L219) · n8n: self-hosted + custom nodes (L288)

THE RULE (L230)
  managed + non-sensitive + non-engineer → Make (L219)
  control + extensibility → n8n (L218)
  platform needs — queues (L222), recovery (L232) → custom (L230)
  prototype in Make, scale out (L230)

INTERVIEW, 4 MOVES
  1 canvas  "the managed scenario (L217, L219)"
  2 trade   "zero infra vs the data path (L288, L275)"
  3 compare "same unit, different workshops (L218)"
  4 rule    "managed → Make · control → n8n · platform → custom"
```

## 18. Key Takeaways

> [!RECAP]
> - Make is **the managed visual canvas** (L219): scenarios (the L217 workflow), modules, and AI/LLM modules (L163) — zero infrastructure (L288), built for non-engineers and fast prototyping
> - **The trade is the data path** (L275, L288): Make's convenience comes with the scenarios and data flowing through Make's cloud — a governance decision (L373), not just a canvas preference
> - **The AI modules are the L163 contract** (L163, L143) — the same discipline as any AI step in the L217 unit; the canvas doesn't change the contract (L230)
> - **Make vs n8n is the same unit, different workshops** (L218): the managed canvas vs self-hosted extensibility (L288)
> - **The tool is a fit decision** (L230): managed + non-sensitive → Make (L219), control + extensibility → n8n (L218), platform needs → the custom build (L230)
> - **Prototype in Make, scale out** (L219, L230) — the workflow proven in the managed canvas, migrated when the queues (L222) and the recovery (L232) demand (L230)

## Check your understanding

Answer these without looking back.

1. What's the Make scenario (L219)?
2. What do the AI/LLM modules do (L163)?
3. What's the managed trade (L288)?
4. Make vs n8n — the difference (L218)?
5. Why is the data path the governance decision (L275)?
6. When does the custom build win (L230)?
7. What's the prototype-and-scale pattern (L230)?
8. What carries over from L217 into the canvas (L230)?

## A Closing Note — The Same Line, a Different Workshop

You now hold the managed alternative: **the scenario canvas — zero infrastructure, non-engineer-friendly, the same L217 discipline inside — with the data path as its price and the scale-out as its plan.** The line is constant; the workshop is the choice (L230).

Next: what starts the line — webhooks & event-driven automation (L220), triggering AI from the events your systems already emit.
