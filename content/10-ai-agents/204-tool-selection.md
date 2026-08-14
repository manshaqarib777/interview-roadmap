# Lesson 204 — Tool Selection & Routing

**Interview importance:** ⭐⭐⭐⭐ — "how do you decide which tools an agent sees?" — the answer is *selection*: a small, scoped tool list per task — and *routing*: a model or rules that pick the right tool for the step (L201).**

L201 built the tool layer; this lesson is **which tools the model sees**: tool selection & routing. Two decisions. **Selection** — the tool list exposed to the model per task: small (a bloated list degrades the model's choices, L144) and scoped (only the tools the task needs, L315). **Routing** — at each step, which tool: the model decides from the list (L202), or rules route common cases (L199). The discipline: the tool surface is a design — per task, per session, and kept small (L201).

The distinction this lesson is built on: a **demo** exposes every tool to every session. A **solutions architect** designs the tool surface: a small per-task list (the model chooses better from fewer, L144), scoped by session and authority (L315), with routing — model-driven for open steps (L202), rule-driven for known cases (L199) — and the list versioned and measured (L343).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain why the tool list should be small: decision quality and cost (L144, L149)
- Design per-task selection: the right tools for the task (L204)
- Explain routing: model-driven vs rule-driven tool choice (L202, L199)
- Scope the surface: session, authority, least privilege (L315)
- Measure tool selection on the golden set (L343)

## 1. One-Line Definition

**Tool selection & routing is the design of the tool surface — the list the model sees is small and scoped per task (L144, L315), and each step's tool is chosen by routing: the model deciding from the list (L202) or rules handling known cases (L199) — because a smaller, scoped list makes the model's choices better (L201) and keeps the attack surface narrow (L212).**

The one-sentence interview answer: *"Tool selection is the design of what the model sees (L204). Two rules. Small — the tool list per task is minimal: a bloated list degrades the model's choices (L144) and costs tokens (L149). Scoped — only the tools the task and the session allow (L315): a support agent sees read + draft tools, not the admin surface (L212). Then routing decides each step's tool: the model chooses from the list for open steps (L202), and rules route known cases — 'always get the account first' — saving a model call (L199). The surface is per task, per session, versioned, and measured on the golden set (L343): which tools, in which tasks, earn their tokens (L195)."*

## 2. Mental Model

Think of the tool list as **a waiter's menu — and the diner's needs.** A menu with 200 items makes the diner (the model) slower and worse at choosing; a menu with the right 10 items for the meal gets a good choice fast (L144). And the menu is per diner: the bar menu doesn't show the kitchen's tools (scope, L315). The routing is the waiter's judgment — for known orders, the waiter just knows ("the customer always starts with water" — a rule, L199); for new orders, the waiter asks (the model decides, L202).

```text
   SELECTION (L204)                  ROUTING (L202, L199)
   ┌──────────────────────┐          ┌──────────────────────────────┐
   │ the model's menu:    │          │ known case → the rule (L199)  │
   │ small, per task      │          │   "get the account first"    │
   │ the right 10 tools   │          │ open step → the model (L202)  │
   │ scoped by session    │          │   "which of these fits?"     │
   │ (L144, L315)         │          └──────────────────────────────┘
   └──────────────────────┘
```

The mental model is **the menu and the waiter**: selection is the right menu per table, routing is the judgment per order (L204).

## 3. Visual Flow — The Tool Surface

```text
   a task arrives (L204)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · SELECT (L144, L315)                                  │
   │     the per-task tool list: only what the task needs     │
   │     ∩ only what the session allows (L315)                │
   │     small — the model chooses better from fewer (L144)   │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · ROUTE — per step (L202, L199)                        │
   │     known case → a rule picks the tool (no call, L199)   │
   │     open step → the model picks from the list (L202)     │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · EXECUTE under the surface (L201, L212)               │
   │     the chosen tool runs — scoped, gated, vetted         │
   └──────────────────────────────────────────────────────────┘
                      ▼
   the result joins the context (L164) → the next step (L200)
```

The flow is the surface: **select the menu → route the order → execute under the surface** (L204).

## 4. How It Works — Selection, Routing, and the Surface Rules

- **Selection (L144, L204).** The model's tool list is per task: a support task exposes the support tools; a research task exposes the search tools (L315). **Small** — the model's choice quality degrades with list size (L144), and every tool description costs tokens (L149). **Scoped** — least privilege (L315): the session's authority (L212) is the ceiling of the list.
- **Routing (L202, L199).** Each step's tool: the **model** chooses from the list for open steps — where the right tool depends on the result (L202). **Rules** route known cases — "always retrieve the account first", "refunds always route to the refund tool" — saving the model call (L199). The split is the L199 decision applied to tools: known path → rule, unknown → model (L202).
- **The surface rules (L201, L212).** The list is per task, per session — versioned (L341) and measured (L343): which tools, in which tasks, earn their tokens (L150) and their attack surface (L212).
- **The cost (L149).** Every tool in the list is tokens in every cycle (L149) — a 10-tool list is cheaper than a 40-tool list (L150), and the model's decisions are better (L144).

> [!NOTE]
> **The tool list is a security surface, not just a menu (L212, L315).** Every tool the model sees is a tool it can propose (L201) — the attack surface (L212) is exactly the list (L315). The senior design narrows it twice: by task (only the tools the task needs) and by session (only what the authority allows, L315) — and the intersection is the list the model sees (L204). A narrow list is better decisions (L144), cheaper cycles (L149), and a smaller attack surface (L212) — the same move, three wins (L201).

## 5. Real Project Usage

- **Support agent.** Selection: get account, search KB, draft reply (L189). Scoped: no admin tools (L315). Routing: "get the account first" is a rule (L199); the KB search step is the model's (L202).
- **Research agent.** Selection: search, read, extract (L177). Routing: the next search query is always the model's (L203).
- **Coding agent.** Selection: read file, search, edit, run tests — per repo (L315). Routing: "run tests after edits" is a rule (L199).
- **Finance agent.** Selection: read balance, read transactions. Routing: transfers always route to the approval-gated tool (L208).
- **Automation (L217).** The workflow's agentic fork selects the branch's tools (L230) — per step, scoped (L204).

The through-line: **the tool surface is a per-task design** — small, scoped, routed — and the discipline pays in decisions (L144), tokens (L149), and security (L212) at once (L204).

## 6. Interview Explanation

Say it in four moves:

1. **The rule.** "The tool list is small and scoped per task (L204) — the model chooses better from fewer (L144)."
2. **The scope.** "Least privilege: the session's authority (L315) is the list's ceiling (L212)."
3. **The routing.** "Known cases → rules (L199); open steps → the model (L202)."
4. **The measure.** "Which tools earn their tokens and their surface — measured on the golden set (L343)."

## 7. Senior-Level Insights

- **Selection is a quality decision (L144).** The senior answer knows the model's tool-choice quality degrades with list size (L144) — the tool list is prompt engineering (L142), tuned like any prompt (L343).
- **The surface is the attack surface (L212, L315).** Every listed tool is a proposable tool (L201) — the senior design narrows by task and session (L315), and treats the list as a security control (L212).
- **Routing is the L199 decision per step (L199, L202).** Known steps are rules (cheaper, deterministic, L199); open steps are the model (flexible, L202) — the agent-vs-workflow rule (L199) applied inside the tool layer (L204).
- **The list is a cost line (L149, L150).** Tool descriptions are tokens in every cycle (L149) — the list's size is a budget decision (L150), and unused tools are pure cost (L204).
- **The selection is measured (L343).** Which tools, in which tasks — the golden set (L343) scores the surface: a tool that never gets called or degrades choices is removed (L341).

## 8. Common Mistakes

- **Everything exposed (L212).** The full tool surface in every session — worse decisions (L144), more tokens (L149), a wide attack surface (L315).
- **The list never pruned (L204).** Tools accumulate — the menu bloats (L144); the golden set (L343) should prune (L341).
- **No routing (L202).** The model re-decides known cases — a model call (L150) for what a rule does free (L199).
- **Routing everything (L199).** Rules for open steps — the flexibility lost (L202); the workflow trap (L199).
- **Scope ignored (L315).** The list ignores the session's authority (L212) — the excessive-agency failure (L212).
- **No measurement (L343).** The surface tuned by guesswork — the golden set (L341) decides which tools earn their place (L204).

## 9. Best Practices

- **Select per task** (L204) — the right tools for the task, nothing else (L144).
- **Scope by session** (L315) — the authority (L212) is the list's ceiling.
- **Route known cases with rules** (L199) — save the model call (L150).
- **Let the model choose open steps** (L202) — flexibility where it pays.
- **Prune with the golden set** (L343) — unused or harmful tools are removed (L341).
- **Version the surface** (L341) — tool list changes are measured like prompt changes (L343).

## 10. Interview Questions

**Q: How do you decide which tools an agent sees?**
> A: Selection — small and scoped per task (L204). The model chooses better from a small list (L144), and every tool costs tokens (L149). So the list is per task — a support task exposes support tools — and per session: the authority (L315) is the ceiling (L212). Then routing picks each step's tool: rules for known cases (L199), the model for open steps (L202).

**Q: Why keep the tool list small?**
> A: Three reasons (L204). Decisions — the model's tool-choice quality degrades as the list grows (L144). Tokens — every tool description is in every cycle's context (L149, L150). Security — every listed tool is a proposable tool, so the list *is* the attack surface (L212, L315). A small list improves all three at once (L201).

**Q: What's the difference between selection and routing?**
> A: Selection is the menu — which tools the model sees for the task (L204). Routing is the order — which tool is called at each step (L202). Routing splits by the L199 rule: known steps — "get the account first" — are rules (deterministic, free, L199); open steps — where the right tool depends on the result — are the model's choice (L202).

**Q: How do you know the tool list is right?**
> A: The golden set (L343). Which tools, in which tasks — I measure calls, success, and decision quality on the eval (L341). A tool that's never called, or that degrades the model's choices, is removed (L204). The surface is a prompt (L142) — versioned and measured like any prompt (L343).

## 11. Follow-Up Questions

- How does the list size affect decision quality (L144)?
- How do you scope the surface per session (L315)?
- When is a routing rule right (L199)?
- How do you prune the tool list (L343)?
- How does the surface compose with security (L212)?

## 12. Comparison Table — Demo vs Designed Surface

| | Demo (L212) | Designed (this lesson) |
|---|---|---|
| Selection (L144) | everything | small, per task (L204) |
| Scope (L315) | none | session authority (L212) |
| Routing (L202) | model always | rules for known, model for open (L199) |
| Cost (L149) | bloated context | minimal per cycle |
| Attack surface (L212) | wide | narrow (L315) |
| Measurement (L343) | none | golden set prunes (L341) |

The senior read: **the right column is the surface design** — better decisions, cheaper cycles, narrower attack (L204).

## 13. Code Example — The Tool Surface

```js
// Tool selection & routing: the surface per task, per session (L204).
const TOOL_CATALOG = {                         // the full catalog (L315)
  get_account: { … }, search_kb: { … }, draft_reply: { … },
  admin_delete: { … }, transfer_funds: { … }, search_web: { … },
};

// SELECT — per task, per session: the intersection (L204, L315).
const TASK_TOOLS = {
  support: ['get_account', 'search_kb', 'draft_reply'],
  research: ['search_web', 'read_url', 'extract_text'],
  finance: ['get_balance', 'get_transactions', 'transfer_funds'],
};

function selectTools(task, session) {
  return TASK_TOOLS[task].filter((t) => session.allowed.has(t));   // L315
  //  small — only what the task needs, only what the session allows (L144, L212)
}

// ROUTE — known steps are rules, open steps are the model (L199, L202).
const RULES = [
  { match: (ctx) => ctx.step === 0 && ctx.task === 'support', tool: 'get_account' },  // L199
];

async function routeStep(ctx, modelChoice) {
  const rule = RULES.find((r) => r.match(ctx));     // the rule wins (L199)
  return rule ? rule.tool : modelChoice;            // else the model's pick (L202)
}

// The loop uses the selected, routed surface (L200, L201).
const tools = selectTools(ctx.task, ctx.session);   // the menu (L204)
const tool = await routeStep(ctx, modelChoice);     // the order (L202)
const result = await executeTool(tool, ctx);        // under the surface (L201)
```

```text
What the reader must SEE — the menu and the order:

  TASK_TOOLS ∩ session.allowed → the small, scoped menu (L144, L315)
  RULES.find()                 → known cases, free (L199)
  routeStep(modelChoice)       → open steps, the model (L202)

  Select per task, scope per session, route per step.
```

```narrate
4-7: The catalog — the full surface exists, but the model never sees all of it (L315).
10-14: Selection — the per-task list, intersected with the session's authority (L144, L204, L315).
16-21: Routing rules — known cases are handled deterministically, saving the model call (L199).
23-25: The open steps fall to the model's choice from the small list (L202).
27-29: Execution runs under the selected surface — scoped and gated (L201, L212).
```

> [!TIP]
> The two lines that define the surface: **`TASK_TOOLS[task].filter((t) => session.allowed.has(t))`** (small + scoped, L204, L315) and **`rule ? rule.tool : modelChoice`** (the routing split, L199, L202). **The menu is per table; the order is per course.**

## 14. Performance Notes

- **The list is the per-cycle token cost (L149).** Every tool description is in every cycle's context (L150) — the list's size is a budget line (L204).
- **Rules are the latency win (L151).** A routing rule skips a model call (L199) — the known-case shortcut (L150).
- **The model's decision quality scales with the list (L144).** A small list gets better choices in fewer tokens (L149) — the selection is a quality-and-cost lever at once (L204).
- **The golden set measures the surface (L343).** Calls per tool, success, and decision quality — the pruning data (L341).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Wrong tool chosen | List too big (L144) | Narrow per task; re-measure (L343) |
| Calls rejected | Scope too tight (L315) | Widen per session, not globally (L212) |
| Model repeats a known step | No routing rule (L199) | Add the rule (L202) |
| Context bloated | Too many tool descriptions (L149) | Prune the list (L204) |
| Tool never used | Selection wrong (L343) | Remove it; check the golden set (L341) |

## 16. Quick Revision Notes

- Tool selection = **the surface design**: small, scoped, per task (L204).
- **Small** — better decisions (L144), fewer tokens (L149).
- **Scoped** — the session's authority is the ceiling (L315, L212).
- Routing: **rules for known (L199), the model for open (L202)**.
- The list **is the attack surface** (L212) — narrow it twice (L315).
- **Measure and prune** (L343) — the golden set keeps the menu right (L341).

## 17. Cheat Sheet

```text
TOOL SELECTION & ROUTING = the menu and the order

SELECTION (L204) — the menu
  small      the model chooses better from fewer (L144)
  scoped     the session's authority is the ceiling (L315, L212)
  per task   support tools for support, research for research (L204)
  per cycle  every description is tokens (L149, L150)

ROUTING (L202, L199) — the order
  known case  → a rule picks the tool — free, deterministic (L199)
  open step   → the model picks from the small list (L202)
  the split is the L199 rule applied inside the tool layer

THE SECURITY VIEW (L212)
  every listed tool is a proposable tool (L201)
  the list IS the attack surface — narrow it twice (L315)

THE MEASURE (L343)
  calls per tool · success · decision quality (L341)
  unused or harmful tools are pruned (L204)

INTERVIEW, 4 MOVES
  1 select  "small + scoped, per task (L204)"
  2 scope   "the authority is the ceiling (L315)"
  3 route   "rules for known, model for open (L199, L202)"
  4 measure "the golden set prunes the menu (L343)"
```

## 18. Key Takeaways

> [!RECAP]
> - Tool selection is **the surface design** (L204): the list the model sees is small and scoped per task (L144)
> - **Small** means better decisions (L144) and cheaper cycles (L149); **scoped** means the session's authority is the ceiling (L315, L212)
> - **Routing** splits by the L199 rule: known cases are rules (free, deterministic, L199), open steps are the model's choice (L202)
> - **The list is the attack surface** (L212) — every listed tool is proposable (L201), so the surface is narrowed by task *and* session (L315)
> - The surface is **measured and pruned** (L343) — the golden set shows which tools earn their tokens (L150) and their decisions (L341)
> - The same move — a narrow list — wins three ways: **decisions, tokens, and security** (L204)

## Check your understanding

Answer these without looking back.

1. Why keep the tool list small (L144)?
2. How do you scope the surface (L315)?
3. What's the routing split (L199, L202)?
4. Why is the list the attack surface (L212)?
5. What does every tool cost per cycle (L149)?
6. How do you prune the menu (L343)?
7. When is a routing rule right (L199)?
8. How is the surface versioned and measured (L341)?

## A Closing Note — The Menu, Kept Right

You now hold the surface design: **the small, scoped menu per task; the routing that sends known orders to rules and open ones to the model; and the golden set that keeps the menu right.** The model's hands are now the right hands — few, precise, and nothing more.

Next: when the loop must stop — agent loops & termination (L205), the stop boundary's design.
