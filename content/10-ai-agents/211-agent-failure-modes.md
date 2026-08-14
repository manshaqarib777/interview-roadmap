# Lesson 211 — Agent Failure Modes

**Interview importance:** ⭐⭐⭐⭐⭐ — "why did the agent go wrong?" — the answer is the *failure taxonomy*: loops, drift, tool explosions, and the excessive-agency failure (L212) — each traced to its boundary (L200) and fixed by its lever (L205, L209, L213).**

L205–209 built the loop's defenses; this lesson is **what they defend against**: agent failure modes — the taxonomy of how agents break in production. **Loop failures** (spinning, runaway budgets, L205), **drift** (the loop leaves the task, L211), **tool failures** (tool explosions, wrong tools, L201), **context failures** (overflow, lost goals, L149, L206), and **agency failures** (too much authority, L212). Each mode traces to a boundary of the L200 diagram (L200) and has a lever (L205, L209, L213).

The distinction this lesson is built on: a **demo** calls every failure "the model was wrong". A **solutions architect** diagnoses the mode: which boundary failed (L200), which trace pattern (L213), which lever fixes it (L205, L209) — and the observability (L213) that catches failures before they ship (L341).

## Learning Objectives

By the end of this lesson you should be able to:

- Name the failure modes: loops, drift, tool explosions, context, agency (L211)
- Trace each mode to its boundary: stop, authority, context, trace (L200)
- Diagnose a failure from the trace (L213)
- Apply the lever per mode: stop conditions, guardrails, budgets (L205, L209)
- Prevent the modes with observability and evals (L213, L343)

## 1. One-Line Definition

**Agent failure modes are the taxonomy of how agents break — loop failures (spinning, runaway budgets, L205), drift (leaving the task, L211), tool failures (explosions, wrong tools, L201), context failures (overflow, lost goals, L149, L206), and agency failures (too much authority, L212) — each tracing to a boundary of the L200 diagram (L200) and fixed by its lever (L205, L209, L213), with observability as the diagnostic (L213).**

The one-sentence interview answer: *"Agent failures are a taxonomy, not one bug (L211). Loop failures — spinning: the same tool call repeated, no progress (L205); runaway: the budget consumed by a pathologically long loop (L149). Drift — the loop leaves the task, pursuing a tangent (L211). Tool failures — tool explosions: one tool spawns many calls (L201); wrong tool: a vague schema picked the wrong one (L204). Context failures — overflow: the window fills (L149, L206); lost goal: curation dropped the task (L207). Agency failures — excessive authority: the loop did more than allowed (L212). Each traces to a boundary of the L200 diagram (L200): stop (L205), authority (L212), context (L206), trace (L213) — and each has a lever: stop conditions (L205), guardrails (L209), budgets (L149), observability (L213)."*

## 2. Mental Model

Think of the failure modes as **the ways a driver can crash — the car, the road, the destination.** Loop failures are the engine racing in place — the wheels spin, no progress (L205). Drift is the driver forgetting the destination — the car wanders toward a tangent (L211). Tool failures are the car's parts misfiring — the horn blares instead of the brake (L201). Context failures are the dashboard — the fuel gauge (the budget, L149) and the map (the goal, L206) ignored. Agency failures are the driver flooring it — the car doing more than the trip allows (L212). The mechanic (the observability, L213) reads the dashcam to see which failure it was — and the fix differs per crash (L205, L209).

```text
   LOOP (L205)      DRIFT (L211)      TOOL (L201)      CONTEXT (L206)      AGENCY (L212)
   ┌──────────┐    ┌──────────┐      ┌──────────┐     ┌──────────┐        ┌──────────┐
   │ spinning │    │ leaves   │      │ explosions│     │ overflow │        │ too much │
   │ runaway  │    │ the task │      │ wrong tool│     │ lost goal│        │ authority│
   └──────────┘    └──────────┘      └──────────┘     └──────────┘        └──────────┘
```

The mental model is **the crash taxonomy**: each failure has a name, a boundary (L200), and a fix — and the dashcam (L213) tells them apart.

## 3. Visual Flow — Diagnosing a Failure

```text
   an agent failure (L211)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · READ THE TRACE (L213)                                │
   │     the cycles, the tool calls, the budgets (L332)       │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · WHICH BOUNDARY FAILED? (L200)                        │
   │     repeated calls, budget exhausted → LOOP (L205)       │
   │     task abandoned → DRIFT (L211)                        │
   │     wrong/spawning tools → TOOL (L201, L204)             │
   │     window filled, goal dropped → CONTEXT (L206)         │
   │     disallowed actions → AGENCY (L212)                   │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · APPLY THE LEVER (L209)                               │
   │     stop conditions (L205) · rails (L209) · budgets      │
   │     (L149) · curation (L207) · authority (L315)          │
   └──────────────────────────────────────────────────────────┘
                      ▼
   the fix is measured on the golden set (L343, L341)
```

The flow is the diagnostic: **read the trace → name the boundary → apply the lever** — the mode determines the fix (L211).

## 4. How It Works — The Modes, Their Boundaries, Their Levers

- **Loop failures (L205).** Spinning — the same call repeated with no progress; runaway — the budget consumed (L149). The boundary: stop (L205). The lever: stop conditions (L205) — repetition detection (L213) and the hard ceilings (L200).
- **Drift (L211).** The loop leaves the task — pursuing a tangent, forgetting the goal (L206). The boundary: the goal's custody — context (L206). The lever: the goal kept in the curated window (L207) and the rails (L209) that check the loop is on-task (L343).
- **Tool failures (L201).** Tool explosions — one tool spawns a cascade (L201); wrong tools — the schema or selection failed (L204). The boundary: act (L201). The lever: the tool surface (L204), the validation (L315), and the explosion guards (L211).
- **Context failures (L149, L206).** Overflow — the window fills (L138); lost goal — curation dropped the task (L207). The boundary: context (L206). The lever: curation (L207) and the budget (L149).
- **Agency failures (L212).** Excessive authority — the loop did more than allowed (L212). The boundary: authority (L212, L315). The lever: the scoped surface (L204), the gates (L208), and the rails (L209).

> [!NOTE]
> **The trace is the diagnostic; the mode is the fix (L211, L213).** "The agent failed" is useless — "the agent spun on the same search for 12 cycles" names the mode (loop, L205), the boundary (stop, L200), and the lever (repetition detection, L213). The senior discipline is the dashcam: the trace (L213) records every cycle (L332), the failure is diagnosed from it (L211), and the fix is verified on the golden set (L343) — the same loop as RAG's failure modes (L196): name it, fix it, measure it (L341).

## 5. Real Project Usage

- **Research agents.** Spinning: repeated identical searches — repetition detection stops it (L211, L213). Drift: the synthesis leaves the question — the goal rail checks (L209).
- **Support agents.** Tool explosions: one refund attempt spawning a cascade — the tool rails bound it (L201, L315). Agency: an unapproved account change — the gate (L208).
- **Coding agents.** Wrong tool: the edit tool used for a search — the surface (L204). Context overflow: the file history fills the window — curation (L207).
- **Finance agents.** Agency: a transfer beyond the limit — the authority boundary (L212). Runaway: the loop re-attempting a failed transfer — the budget (L149).
- **Any agent (L216).** The taxonomy is the ops playbook — the modes, the boundaries, the levers (L211).

The through-line: **every agent failure is a known mode** — the taxonomy (L211) turns "the agent broke" into a specific boundary and a specific fix (L216).

## 6. Interview Explanation

Say it in four moves:

1. **The taxonomy.** "Five modes: loop, drift, tool, context, agency (L211)."
2. **The boundaries.** "Each traces to the L200 diagram: stop (L205), act (L201), context (L206), authority (L212)."
3. **The diagnostic.** "The trace (L213) tells them apart — repetition names the loop, a lost goal names drift, a disallowed call names agency (L211)."
4. **The levers.** "Stop conditions (L205), rails (L209), budgets (L149), curation (L207), scope (L315) — the mode names the fix (L216)."

## 7. Senior-Level Insights

- **The taxonomy is the ops playbook (L211).** The senior answer maps the modes to the L200 boundaries (L200) and the levers (L205, L209) — the demo blames the model (L141).
- **Spinning is the most common loop failure (L205).** Repetition detection (L213) — the same call with no progress — is the highest-value safety check (L211); the senior design includes it by default (L205).
- **Drift is a goal-custody failure (L206).** The goal is dropped by curation (L207) or buried in the window (L149) — the fix is the goal's custody in the curated window (L206), not a better prompt (L142).
- **Tool explosions are a surface design (L204).** A narrow surface (L204) and a bounded tool (L201) prevent the cascade — the explosion is the unbounded case (L211).
- **Agency failures are the security story (L212).** Excessive authority (L212) is prevented by scope (L315) and gates (L208) — the mode is the L212 lesson's motivation (L216).

## 8. Common Mistakes

- **"The model was wrong" (L211).** The blame without the mode — the fix can't aim (L216).
- **No repetition detection (L205).** The loop spins to the budget (L149) — the highest-value detector missing (L213).
- **No trace (L213).** The failure happens, the record doesn't — diagnosis impossible (L211).
- **Rails without budgets (L209).** The guardrails check content, not cost (L149) — the runaway still bills (L150).
- **The goal not in the window (L207).** Curation drops it — drift becomes inevitable (L211).
- **Fixes never measured (L343).** The lever added, the golden set not re-run (L341) — the mode's recurrence unverified (L211).

## 9. Best Practices

- **Learn the taxonomy** (L211) — the five modes and their boundaries (L200).
- **Detect spinning by default** (L205) — repetition on the trace (L213).
- **Keep the goal in the curated window** (L206, L207) — drift's custody fix (L211).
- **Narrow the tool surface** (L204) and bound the tools (L201) — the explosion prevention (L315).
- **Scope + gate the authority** (L212, L208) — the agency prevention (L315).
- **Diagnose from the trace, verify on the golden set** (L213, L343, L341).

## 10. Interview Questions

**Q: How do agents fail in production?**
> A: Five known modes (L211). Loop — spinning or runaway (L205). Drift — leaving the task (L211). Tool — explosions or wrong tools (L201). Context — overflow or a lost goal (L149, L206). Agency — exceeding authority (L212). Each traces to a boundary of the L200 diagram (L200) and has a lever (L205, L209, L315). The trace (L213) tells them apart.

**Q: What's the most common failure?**
> A: Loop spinning (L205) — the same tool call repeated with no progress, burning the budget (L149) until a ceiling fires (L211). The fix is repetition detection on the trace (L213): if the same call with the same inputs appears with no new information, stop or redirect (L205). It's the highest-value safety check, and it's cheap (L151).

**Q: How do you diagnose an agent failure?**
> A: From the trace (L213). The cycles, the tool calls, the budgets (L332) — the pattern names the mode (L211): repeated calls → loop (L205); the task abandoned → drift (L206); disallowed actions → agency (L212); the window filled → context (L149). The mode names the boundary (L200) and the lever (L209) — and the fix is verified on the golden set (L343, L341).

**Q: How do you prevent failures?**
> A: By design (L216): stop conditions for loops (L205), the goal's custody in the curated window for drift (L206, L207), a narrow tool surface for explosions (L204, L315), budgets for runaway cost (L149), and scope + gates for agency (L212, L208). Plus the rails (L209) and the trace (L213) — and the golden set (L343) that verifies each fix (L341). Prevention is the architecture; the taxonomy is the map (L211).

## 11. Follow-Up Questions

- How does repetition detection work (L213)?
- How do you keep the goal in the window (L207)?
- What bounds a tool explosion (L201)?
- How does agency failure relate to security (L212)?
- How do you measure the fixes (L343)?

## 12. Comparison Table — The Five Modes

| Mode | Symptom | Boundary (L200) | Lever |
|---|---|---|---|
| Loop (L205) | spinning, runaway | stop | stop conditions (L205), budgets (L149) |
| Drift (L211) | task abandoned | context (L206) | goal custody (L207), rails (L209) |
| Tool (L201) | explosions, wrong tools | act | surface (L204), validation (L315) |
| Context (L149) | overflow, lost goal | context | curation (L207), budget (L149) |
| Agency (L212) | exceeded authority | authority | scope (L315), gates (L208) |

The senior read: **the boundary column is the diagnosis; the lever column is the fix** — the taxonomy is the map (L211).

## 13. Code Example — The Detectors

```js
// Agent failure modes: the trace detectors (L211, L213).
// LOOP DETECTOR — spinning: the same call, no progress (L205).
function detectSpin(trace) {
  const recent = trace.slice(-5).map((t) => t.call?.id).filter(Boolean);
  return recent.length >= 5 && new Set(recent).size === 1;   // 5 identical calls (L213)
}

// DRIFT DETECTOR — the goal is no longer in the conversation (L206, L211).
function detectDrift(messages, goal) {
  const window = messages.slice(-10).join(' ');
  return !window.includes(goal.keywords[0]);                 // the goal dropped (L207)
}

// TOOL DETECTOR — explosion: one tool spawning unbounded calls (L201, L204).
function detectExplosion(trace, tool) {
  return trace.filter((t) => t.call?.id === tool).length > tool.limit;   // L315
}

// CONTEXT DETECTOR — overflow: the window past its budget (L149).
function detectOverflow(tokens, budget) { return tokens > budget; }       // L138

// The run checks each detector per cycle (L200, L209).
for (const step of loop) {
  if (detectSpin(trace)) return stop('spinning — no progress');           // L205
  if (detectDrift(messages, goal)) return redirect(goal);                 // L209
  if (detectExplosion(trace, tool)) return refuse(tool);                  // L315
  if (detectOverflow(tokens, budget)) return summarizeAndContinue();      // L207
}
```

```text
What the reader must SEE — the modes, detected on the trace:

  detectSpin()      → the loop mode (L205, L213)
  detectDrift()     → the drift mode (L206, L211)
  detectExplosion() → the tool mode (L201, L315)
  detectOverflow()  → the context mode (L149, L207)

  The trace is the dashcam; the detectors are the mechanic.
```

```narrate
3-5: The spin detector — five identical calls name the loop mode (L205, L213).
7-10: The drift detector — the goal missing from the recent window names drift (L206, L211).
12-15: The explosion detector — a tool past its limit names the tool mode (L201, L315).
17-19: The overflow detector — the window past the budget names the context mode (L149, L207).
21-26: The run checks the detectors each cycle — the modes are caught before they ship (L209, L341).
```

> [!TIP]
> The line that makes the failures catchable: **`new Set(recent).size === 1`** — the spin detector. **The trace's patterns name the mode; the mode's lever fixes it (L211, L213).**

## 14. Performance Notes

- **The detectors are cheap (L151).** Trace pattern checks (L213) are microseconds per cycle (L211) — the highest-value safety per token (L150).
- **The budgets are the cost control (L149).** The loop's ceilings (L205) are the bill's ceiling (L150) — the runaway mode is a cost failure (L211).
- **The trace is the diagnostic's data (L213).** Every cycle logged (L332) — the storage (L150) is the diagnosis's raw material (L211).
- **The golden set verifies the fixes (L343).** Each lever is measured (L341) — the mode's recurrence is the metric (L211).

## 15. Debugging Scenarios

| Symptom | Mode | First lever |
|---|---|---|
| The same call, forever | Loop (L205) | Repetition detection (L213) |
| The answer misses the question | Drift (L211) | Goal custody in the window (L207) |
| One tool spawning calls | Tool explosion (L201) | Bound the tool (L315) |
| The window overflows | Context (L149) | Curation + budget (L207) |
| Actions beyond the task | Agency (L212) | Scope + gates (L315, L208) |

## 16. Quick Revision Notes

- Five modes: **loop, drift, tool, context, agency** (L211).
- Each traces to a boundary: **stop, act, context, authority** (L200).
- The diagnostic: **the trace's patterns** (L213) name the mode (L211).
- The levers: **stop conditions (L205), rails (L209), budgets (L149), curation (L207), scope (L315)**.
- Spinning is **the most common** (L205) — detect it by default (L213).
- Fixes are **verified on the golden set** (L343, L341).

## 17. Cheat Sheet

```text
AGENT FAILURE MODES = the taxonomy of how agents break

THE FIVE MODES (L211)
  loop      spinning · runaway (L205)        → stop conditions (L205)
  drift     leaves the task (L211)           → goal custody (L207)
  tool      explosions · wrong tools (L201)  → surface + bounds (L204, L315)
  context   overflow · lost goal (L149)      → curation + budget (L207)
  agency    exceeded authority (L212)        → scope + gates (L315, L208)

THE DIAGNOSTIC (L213)
  the trace's patterns name the mode (L211)
  repetition → loop · goal gone → drift · disallowed → agency
  the dashcam, read by the mechanic

THE LEVERS (L216)
  the mode names the boundary (L200) and the fix (L209)
  every fix is verified on the golden set (L343, L341)

THE RULES
  spinning is the most common loop failure — detect by default (L205)
  "the model was wrong" is not a diagnosis (L141)
  prevention is the architecture; the taxonomy is the map (L211)

INTERVIEW, 4 MOVES
  1 taxonomy "loop, drift, tool, context, agency"
  2 boundaries "each traces to the L200 diagram"
  3 diagnostic "the trace names the mode (L213)"
  4 levers   "the mode names the fix (L205, L209, L315)"
```

## 18. Key Takeaways

> [!RECAP]
> - Agent failures are **a taxonomy, not one bug** (L211): loop, drift, tool, context, and agency modes
> - **Each mode traces to a boundary** of the L200 diagram (L200): loop → stop (L205), tool → act (L201), context (L206), agency → authority (L212)
> - **The trace is the diagnostic** (L213) — its patterns name the mode: repetition → loop (L205), a lost goal → drift (L207), a disallowed call → agency (L315)
> - **The levers follow the mode** (L216): stop conditions (L205), rails (L209), budgets (L149), curation (L207), scope + gates (L315, L208)
> - **Spinning is the most common loop failure** (L205) — repetition detection on the trace (L213) is the highest-value safety check
> - Every fix is **verified on the golden set** (L343, L341) — prevention is the architecture, and the taxonomy is its map (L211)

## Check your understanding

Answer these without looking back.

1. Name the five failure modes (L211).
2. Which boundary does each trace to (L200)?
3. How does the trace diagnose the mode (L213)?
4. What's the most common loop failure (L205)?
5. What's the drift fix (L207)?
6. How do you prevent tool explosions (L204)?
7. What's the agency fix (L315)?
8. Why is "the model was wrong" not a diagnosis?

## A Closing Note — The Dashcam That Names the Crash

You now hold the failure taxonomy: **loop, drift, tool, context, agency — each traced to its boundary, each named by the trace, each fixed by its lever.** "The agent broke" is now a diagnosis, not a shrug — and the fixes are verifiable.

Next: the security of the whole loop — agent security (L212), injection, excessive agency, and secrets.
