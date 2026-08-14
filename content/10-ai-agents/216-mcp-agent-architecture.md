# Lesson 216 — MCP & Production Agent Architecture (Synthesis)

**Interview importance:** ⭐⭐⭐⭐⭐ — the capstone of AI Agents: the production loop plus the Model Context Protocol — and the milestone for M21 is building a guarded, observable agent with tools and human-in-the-loop.**

This is the last lesson of the AI Agents module — and the synthesis it was built toward. L198–L215 gave you the parts: the loop (L198–200), tools (L201, L204), planning and reasoning (L202–203), termination (L205), memory and state (L206–207), HITL (L208), guardrails (L209), multi-agent (L210), failures (L211), security (L212), observability (L213), and the frameworks (L214–215). This lesson **reassembles them into one production agent architecture** — the loop you'd actually ship — and adds the **Model Context Protocol (MCP)**: the standard that makes tools, resources, and prompts a *protocol* instead of an integration (L216).

The distinction this lesson is built on: a **specialist** knows the parts. A **solutions architect** assembles them into a whole — and explains why each part sits where it does, what happens when each fails (L211), and how the whole thing is tested (L341) and observed (L213). That assembly is M21's milestone: build a guarded, observable agent with tools and human-in-the-loop.

## Learning Objectives

By the end of this lesson you should be able to:

- Assemble L198–L215 into one production agent architecture
- Draw the full loop: entry → context → decide → tools → gates → verify → trace
- Explain MCP: tools, resources, and prompts as a standard protocol (L216)
- Explain each part's placement by its boundary — authority (L212), stop (L205), trace (L213)
- Describe the failure behavior of the whole — the L211 taxonomy, mapped to levers
- Defend the architecture in an interview: the parts, the boundaries, the trade-offs (L199)

## 1. One-Line Definition

**Production agent architecture is the module's synthesis — the L200 loop wrapped by the L209 rails and the L212 authority, with L205 termination, L206 memory, L207 state, L208 human gates, L213 observability, and L210–215's multi-agent and framework choices — plus the Model Context Protocol (MCP), the standard that makes tools, resources, and prompts a protocol rather than per-app integrations (L216).**

The one-sentence interview answer: *"Production agent architecture assembles the module (L216). The loop (L200) — perceive, decide, act, observe — wrapped by the discipline: the authority boundary where the model proposes and the system executes (L201, L212); the rails that vet inputs, scope tools, and verify outputs (L209); termination by design (L205); the memory hierarchy (L206) and persisted state (L207); human gates at the consequential nodes (L208); and the trace that serves debugging, evals, and audit (L213). MCP standardizes the tool layer: tools, resources, and prompts become a protocol — one server exposes its capabilities, any agent speaks it (L216). The milestone: build this loop — guarded, observable, with tools and human-in-the-loop — and defend it (L341, L343)."*

## 2. Mental Model

Think of the production agent as **the well-run office from L200, now fully staffed and standardized.** The loop (L200) is the workflow; the boundaries are the office's rules: the mandate (authority, L212), the budget (stop, L205), the desk (memory, L206), the logbook (trace, L213), and the manager's desk for approvals (HITL, L208). MCP is the office's **standard interoffice protocol** — the forms and courier service that any department can use: instead of every department having its own way to request work (per-app integrations, L201), the protocol standardizes it — a new department (tool server) plugs in by speaking the protocol (L216). The office works because the workflow is disciplined and the communication is standardized (L216).

```text
   THE OFFICE (the production agent, L216)
   ┌────────────────────────────────────────────────────────┐
   │ the LOOP (L200)     perceive → decide → act → observe  │
   │ the MANDATE (L212)  the authority boundary             │
   │ the BUDGET (L205)   termination by design              │
   │ the DESK (L206)     the memory hierarchy               │
   │ the MANAGER (L208)  the human gates                    │
   │ the LOGBOOK (L213)  the trace                          │
   │ the PROTOCOL (MCP)  tools/resources/prompts, standard  │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the office, standardized**: the loop is the workflow, the boundaries are the rules, and MCP is the interoffice protocol that makes the tool layer pluggable (L216).

## 3. Visual Flow — The Whole System, One Diagram

```text
   ┌──────────────────────────── THE ENTRY (L172, L209) ───────────────────────────┐
   │  auth (L172) → input rails (L143, L316) → the request is vetted              │
   └──────────────────────────────────┬────────────────────────────────────────────┘
                                      ▼
   ┌──────────────────────────── THE LOOP (L200, L215) ───────────────────────────┐
   │  perceive (L206) → decide (L202) → [human gate? L208] → act (L201, L315)     │
   │       → observe (L164) → checkpoint (L207) → … until done (L205)             │
   │  MCP: the tool calls speak the protocol (L216) — tools, resources, prompts   │
   └──────────────────────────────────┬────────────────────────────────────────────┘
                                      ▼
   ┌──────────────────────────── THE EXIT (L209, L343) ───────────────────────────┐
   │  output rails: grounded (L337) + complete (L343) → the answer + sources      │
   └──────────────────────────────────┬────────────────────────────────────────────┘
                                      ▼
   ┌──────────────────────────── THE RECORD (L213, L341) ─────────────────────────┐
   │  the trace: cycles, reasoning, calls, tokens (L332) — debugging (L211),      │
   │  evals (L343), audit (L322) — the golden set in CI (L341)                    │
   └──────────────────────────────────────────────────────────────────────────────┘
```

The flow is the module in one diagram: **entry → loop → exit → record** — and MCP is the loop's tool layer, standardized (L216).

## 4. How It Works — The Assembly, Part by Part

- **The entry (L172, L209).** Auth (L172), then the input rails (L143): the request is schema-validated and sanitized (L316) before the loop sees it (L209).
- **The loop (L200, L215).** Perceive (L206) → decide (L202) → act (L201, under the authority boundary, L315) → observe (L164) → checkpoint (L207) — until a stop condition fires (L205). The human gates (L208) sit on the consequential edges (L215).
- **The tool layer — MCP (L216).** The tools are exposed as a *protocol*: an MCP server declares its tools, resources, and prompts (L216); the agent speaks the protocol (L201). New tools plug in by speaking the standard — the tool layer is pluggable (L155).
- **The exit (L209, L343).** The output rails verify: groundedness (L337) and completion (L343) before the user sees the answer (L341).
- **The record (L213).** The trace records every cycle (L213) — serving debugging (L211), the golden set (L343), and the audit (L322) — and the golden set gates every change in CI (L341).

> [!NOTE]
> **The assembly rule: every part is placed by a boundary (L216).** The authority boundary (L212) sits between propose and execute (L201). The stop conditions (L205) bound the loop's length and cost (L149). The human gates (L208) sit at the consequential edges (L215). The trace (L213) wraps the whole run. And MCP standardizes the tool layer — so the tools are a protocol, not per-app integrations (L216). An architect who can name the boundary for each part can defend the whole assembly — and the failure taxonomy (L211) is the map of what the boundaries prevent.

## 5. Real Project Usage

- **A production copilot agent.** The full assembly: entry rails (L209), the loop (L200), MCP tool servers (L216), human gates for actions (L208), the trace (L213), and the golden set in CI (L341).
- **A finance agent.** MCP tools for balances and transfers (L216); the transfer is approval-gated (L208); the trace serves the audit (L322).
- **A coding agent.** MCP tools for files and tests (L216); the loop's plan (L202) and termination (L205); the trace feeds the evals (L343).
- **A multi-agent firm (L210).** Each specialist is an MCP server or a graph (L215); the coordinator speaks the protocol (L216).
- **Anything "production agent" (L216).** The pattern is the shape: entry, loop, exit, record — with MCP making the tool layer standard (L216).

The through-line: **the floor plan is the module's output** — every production agent is this assembly, and M21's milestone is building it with tools, gates, and observability (L216).

## 6. Interview Explanation

Say it in four moves:

1. **The assembly.** "Entry → loop → exit → record: the vetted input, the bounded loop (L200), the verified output (L343), and the trace (L213)."
2. **The boundaries.** "The authority boundary (L212), the stop conditions (L205), the human gates (L208) — each placed by what it controls (L216)."
3. **MCP.** "Tools, resources, and prompts as a protocol — the tool layer is pluggable (L216)."
4. **The milestone.** "Build this loop — guarded, observable, with tools and human-in-the-loop — and defend it (L341)."

## 7. Senior-Level Insights

- **The architecture is the sum of its boundaries (L216).** A senior review of an agent checks the boundaries first: where's the authority (L212), where's the stop (L205), where's the trace (L213), where's the gate (L208)? Naming each is the review (L216).
- **MCP is the integration standard (L216).** The tool layer as a protocol (L216) — one server exposes its capabilities, any agent speaks it (L201) — the L155 abstraction, standardized (L216).
- **The failure taxonomy is the ops playbook (L211).** The golden set (L343) reveals which mode regressed (L211), the mode names the lever (L205, L209), and the fix is targeted (L216).
- **The observability is the eval's and the audit's foundation (L213).** The trace (L213) serves all three — debugging (L211), the golden set (L343), the audit (L322) — one record, three masters (L216).
- **The economics are the loop's budgets (L149, L150).** Termination (L205) and the memory curation (L206) bound the bill (L150); the trace meters it (L332) — the cost model is built into the assembly (L216).

## 8. Common Mistakes

- **The loop without the wrap (L200).** The cycle with no authority (L212), stop (L205), or trace (L213) — the L211 taxonomy, unguarded (L216).
- **The tool layer as per-app code (L201).** Each integration written by hand (L155) — MCP's standard skipped, the pluggability lost (L216).
- **Gates bolted on (L208).** The human approval as an interruption (L200) instead of a node on the graph (L215).
- **Observability as an afterthought (L213).** The trace schema retrofitted (L341) — the evals (L343) and the audit (L322) starved (L216).
- **The framework as the architecture (L214).** The preset agent replacing the design (L200) — the discipline hidden (L205, L213).
- **The floor plan without the failure map (L211).** Can't name which mode a failure is — the misdiagnosis that wastes the team's time (L216).

## 9. Best Practices

- **Draw the floor plan first** (L216) — entry, loop, exit, record (L200).
- **Place every part by its boundary** (L216) — authority (L212), stop (L205), gate (L208), trace (L213).
- **Standardize the tool layer with MCP** (L216) — tools, resources, prompts as a protocol (L155).
- **Wire the golden set into CI** (L341) — the trace (L213) is the eval's input (L343).
- **Map the failure modes to levers** (L211) — the ops playbook, written down (L216).
- **Build the milestone** (L216) — a guarded, observable agent with tools and HITL (L208).

## 10. Interview Questions

**Q: Walk me through a production agent's architecture.**
> A: Four parts (L216). The entry — auth (L172) and the input rails (L209): the request is vetted (L143, L316). The loop (L200) — perceive (L206), decide (L202), act under the authority boundary (L201, L315), observe (L164), checkpoint (L207) — until a stop condition fires (L205), with human gates on the consequential edges (L208). The exit — the output rails: grounded (L337) and complete (L343). The record — the trace (L213) serving debugging (L211), the golden set (L343), and the audit (L322).

**Q: What is MCP?**
> A: The Model Context Protocol (L216) — the standard for the tool layer. An MCP server declares its tools, resources, and prompts as a protocol (L216); any agent speaks it (L201). Instead of per-app integrations — hand-written bindings for every provider and tool (L155) — the tool layer is pluggable: a new server plugs in by speaking the standard (L216). It's the L155 abstraction, standardized.

**Q: What makes this production and not a demo?**
> A: The boundaries and the loop (L216). The authority boundary (L212) — the model proposes, the system executes under least privilege (L315). The stop conditions (L205) and budgets (L149) — the loop ends by design. The human gates (L208) at the consequential nodes. And the record: the trace (L213) serves the golden set in CI (L341), so every change to the loop — tools (L201), memory (L206), rails (L209) — is measured (L343). A demo runs; this is tested and observed (L216).

**Q: How would you change it for a multi-agent system (L210)?**
> A: The floor plan stays; the coordination changes (L216). Each specialist is a loop with its own boundaries (L200) — and its own MCP tool surface (L216). The coordinator (L210) decomposes (L202), delegates (L204), and aggregates (L206); the traces join into one view (L213); the budgets compose per loop and total (L149). The entry, the rails, and the record are unchanged — the firm is the same office with departments (L216).

## 11. Follow-Up Questions

- Which boundary is the hardest to keep, and why (L212)?
- How does MCP change the tool layer (L216)?
- How does the golden set gate the loop (L341)?
- How do the failure modes map to the assembly (L211)?
- How does the floor plan scale to multi-agent (L210)?

## 12. Comparison Table — Demo vs the Production Assembly

| Station | Demo | Production (this lesson) |
|---|---|---|
| Entry (L209) | raw request | auth + input rails (L143, L316) |
| Loop (L200) | while-loop | the graph (L215), bounded (L205) |
| Tools (L201) | per-app code | MCP protocol (L216) |
| Authority (L212) | the model executes | propose/execute split (L315) |
| Gates (L208) | none | human nodes (L215) |
| State (L207) | in memory | checkpoints (L255) |
| Record (L213) | none | the trace — debug, eval, audit |
| Eval (L343) | none | the golden set in CI (L341) |

The senior read: **the table is the milestone** — M21's claim is building the right column, and defending it with the left column's failures in mind (L216).

## 13. Code Example — The Assembly in One Shape

```text
The production agent codebase (L216) — the floor plan as folders:

  entry/                   THE VETTED DOOR (L209)
    auth.ts                session + authority (L172, L315)
    input-rails.ts         schema + injection scan (L143, L309, L316)

  loop/                    THE BOUNDED LOOP (L200, L215)
    graph.ts               nodes: perceive → decide → act (L215)
    termination.ts         the stop conditions (L205)
    memory.ts              the hierarchy (L206) + curation (L207)
    state.ts               checkpoints, resume (L207, L255)

  tools/                   THE MCP LAYER (L216)
    server.ts              exposes tools + resources + prompts (L216)
    clients/               the agent speaks the protocol (L201)

  gates/                   THE HUMAN NODES (L208)
    approval.ts            the approval gate on the graph (L215)

  exit/                    THE VERIFIED EXIT (L209, L343)
    output-rails.ts        grounded (L337) + complete (L343)

  record/                  THE BLACK BOX (L213)
    trace.ts               the structured record (L213, L341)
    evals.ts               the golden set in CI (L343)

  The loop is bounded, the tools are a protocol, the record is kept.
```

```text
What the reader must SEE — the boundaries as folders:

  entry/   vetted in (L209) · loop/  bounded + gated (L205, L208)
  tools/   MCP protocol (L216) · exit/ verified (L343)
  record/  the trace — debug, eval, audit (L213, L322)

  Every folder is a boundary; every boundary is a lesson.
```

```narrate
3-6: The entry — the vetted door: auth (L172) and the input rails (L209, L316).
8-14: The loop — the graph (L215), the termination (L205), the memory (L206), and the checkpoints (L207).
16-19: The tools — the MCP layer: the server exposes capabilities, the agent speaks the protocol (L216).
21-24: The gates — the human approval nodes on the graph (L208, L215).
26-29: The exit — the verified output: grounded (L337) and complete (L343).
31-35: The record — the trace (L213) and the golden set (L343), wired into CI (L341).
```

> [!TIP]
> The folder shape *is* the architecture: **entry, loop, tools, gates, exit, record** — each a boundary, each a lesson. **If the authority boundary isn't a folder (L315) or the trace isn't wired to CI (L341), the assembly is missing its walls — that's M21's milestone in a directory tree (L216).**

## 14. Performance Notes

- **The loop is the cost center (L149, L150).** Termination (L205) and the memory curation (L206) bound the bill; the trace (L213) meters it (L332) — the economics are built into the assembly (L216).
- **The gates are the latency pauses (L151).** The human approvals (L208) are the loop's slowest nodes (L208) — placed where the risk justifies the wait (L212).
- **MCP adds a protocol hop (L151).** The standard (L216) is an indirection over direct calls (L155) — priced against the pluggability it buys (L216).
- **The record is the eval's and the audit's foundation (L213).** The trace's storage (L150) serves the golden set (L343) and the audit (L322) — the record is the observability's product (L216).

## 15. Debugging Scenarios

| Symptom | First check (L211) | The lever |
|---|---|---|
| The loop spins | Loop mode (L205) | Repetition detection (L213) |
| Wrong side effects | Agency mode (L212) | Scope + gates (L315, L208) |
| The loop steered by a result | Injection (L316) | Vet the inputs (L309) |
| Ungrounded answers | Generation (L337) | Output rails (L343) |
| Regression after a change | Metric dropped (L341) | Golden set in CI (L343) |

## 16. Quick Revision Notes

- Production agent = **entry → loop → exit → record** (L216).
- The boundaries: **authority (L212), stop (L205), gates (L208), trace (L213)**.
- MCP = **the tool layer as a protocol** (L216) — pluggable (L155).
- The failure map: **the L211 taxonomy → levers** (L216).
- The record serves **debug, eval, audit** (L213, L343, L322).
- The milestone: **build the guarded, observable loop** (L341).

## 17. Cheat Sheet

```text
PRODUCTION AGENT = the loop, the walls, the protocol, the record

THE ASSEMBLY (L216)
  entry   auth (L172) + input rails (L209, L316)
  loop    the graph (L215) — perceive, decide, act, observe (L200)
          bounded: termination (L205) · memory (L206) · state (L207)
  gates   the human nodes on the consequential edges (L208, L215)
  exit    output rails: grounded (L337) + complete (L343)
  record  the trace (L213) → debug (L211) · eval (L343) · audit (L322)

THE BOUNDARIES (L216)
  authority  the propose/execute split (L201, L315)
  stop       the loop ends by design (L205) — or it spins (L211)
  gate       the human at the consequential (L208)
  trace      every cycle recorded (L213) — schema first (L341)

THE PROTOCOL (L216)
  MCP — tools, resources, prompts as a standard
  the tool layer is pluggable (L155): speak it, plug in

THE MILESTONE (M21)
  build the guarded, observable loop — tools + HITL (L208)
  and defend it: boundaries, failures (L211), evals (L343)

INTERVIEW, 4 MOVES
  1 assembly "entry, loop, exit, record"
  2 boundaries "authority, stop, gates, trace"
  3 protocol "MCP — the tool layer, standardized (L216)"
  4 milestone "the guarded, observable loop — that's M21"
```

## 18. Key Takeaways

> [!RECAP]
> - Production agent architecture is **the module's synthesis** (L216): entry → loop → exit → record, wrapped by the authority boundary (L212), the stop conditions (L205), the human gates (L208), and the trace (L213)
> - **The loop is the graph** (L215) — perceive, decide, act, observe (L200), bounded and resumable (L205, L207), with the human gates as nodes (L208)
> - **MCP standardizes the tool layer** (L216): tools, resources, and prompts as a protocol — pluggable (L155), not per-app integrations (L201)
> - **The failure taxonomy is the ops playbook** (L211) — each mode maps to a boundary and a lever (L205, L209, L315)
> - **The record is the foundation** (L213) — the trace serves debugging (L211), the golden set (L343), and the audit (L322), with the schema designed first (L341)
> - **M21's milestone is this assembly**: build a guarded, observable agent with tools and human-in-the-loop — the folder shape in section 13 is the blueprint (L216)

## Check your understanding

Answer these without looking back.

1. What are the four parts of the assembly (L216)?
2. What boundary places each part where it is?
3. What is MCP, and what does it standardize (L216)?
4. What makes the assembly production rather than a demo (L341)?
5. How do the failure modes map to the assembly (L211)?
6. Who are the record's three consumers (L213)?
7. How does the floor plan scale to multi-agent (L210)?
8. What is M21's milestone, and how does this lesson meet it?

## A Closing Note — The Office, Fully Staffed and Standardized

That was the last lesson of the AI Agents module — and the one you'll *ship*. L198–L215 gave you the stations; this lesson gave you the floor plan: **the loop, the walls (authority, stop, gates, trace), the protocol (MCP), and the record that proves it all.** When you can draw it, build it, and defend it — naming the authority boundary (L212), the stop conditions (L205), the human gates (L208), and the trace's schema (L213) — you have claimed Milestone M21.

The next module turns the loop into *business*: AI Automation (L217–L232) — workflows, n8n and Make, webhooks, queues, and the approval gates (L228) that decide whether automation scales — the agent's power, wired into the enterprise (L230). You've built the loop; now you'll put it to work.
