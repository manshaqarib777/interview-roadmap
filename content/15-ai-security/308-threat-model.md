# Lesson 308 — AI Security Threat Model (OWASP LLM Top 10)

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you secure an LLM app?" — the answer is *the threat model*: the map of the attack surface before any countermeasure (L308).**

This is the first lesson of the AI Security module — and the map the module is drawn on. L307 shipped the pipeline; this lesson is **what can attack what it shipped**: the AI security threat model — the OWASP LLM Top 10 (L326): the map of the attack surface (L308) — the prompt injection (L309), the data leakage (L312), the excessive agency (L314), the poisoning (L316), the abuse (L317) — before any countermeasure (L308). This lesson is the map of the AI attack surface (L308).

The distinction this lesson is built on: a **demo** secures what it thinks of. A **solutions architect** threat-models first (L308): the assets (L308), the attackers (L308), and the paths (L308) — the OWASP LLM Top 10 (L326) as the map (L308).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the threat model: the map before the countermeasure (L308)
- Explain the assets: the data, the models, the tools (L308)
- Explain the attackers: the users, the prompt, the documents (L308)
- Explain the OWASP LLM Top 10: the attack map (L326)
- Explain the AI shape: the L172 baseline, attack-shaped (L308)

## 1. One-Line Definition

**The AI security threat model is the map of the attack surface before any countermeasure (L308) — the assets (the data L313, the models L278, the tools L315, the quota L317, L308), the attackers (the users, the prompt, the documents L316, L308), and the paths (the prompt injection L309, the data leakage L312, the excessive agency L314, L308) — the OWASP LLM Top 10 (L326) as the map (L308).**

The one-sentence interview answer: *"The threat model is the map before the countermeasures (L308). The assets (L308): the data — the prompts and the PII (L313); the models — the quota and the keys (L278); the tools — the actions the agent can take (L315). The attackers (L308): the direct user (L308) — the prompt injection (L309); the indirect source (L308) — the retrieved document (L316) and the tool output (L311); the abuser (L317) — the quota burner (L308). The paths (L308): the prompt injection (L309) — the model follows the attacker's instructions (L309); the data leakage (L312) — the data leaving through the prompts and the logs (L312); the excessive agency (L314) — the agent with too much power (L314). The map (L326): the OWASP LLM Top 10 (L326) — the ten risks the module closes one by one (L308). The AI shape (L308): the L172 baseline (L172) — the client never trusted (L172) — attack-shaped (L308): the inputs checked (L281), the outputs checked (L281), the tools scoped (L323), and the audit recorded (L322). The demo secures what it thinks of; the architect maps first (L308)."*

## 2. Mental Model

Think of the threat model as **the bank's floor plan with the break-in routes.** The floor plan (the threat model, L308) maps the bank (the AI app, L173): the vault (the data, L313), the tellers (the models, L278), and the safety deposit boxes (the tools, L315). The map also marks the routes (the attack paths, L308): the forged letters (the prompt injection, L309), the copied documents (the data leakage, L312), and the compromised keys (the excessive agency, L314). The security team (the architects, L308) studies the map before installing the alarms (the countermeasures, L308) — the alarms go where the routes are (L308). The bank works because the floor plan is drawn first, and the alarms cover the routes (L308).

```text
   the floor plan (the threat model, L308)
   ┌────────────────────────────────────────────────────────┐
   │ the vault (the data, L313) · the tellers (the models,  │
   │ L278) · the boxes (the tools, L315)                    │
   │ the routes (the paths, L308): the forged letters       │
   │ (L309), the copies (L312), the keys (L314)             │
   │ the alarms (the countermeasures, L308) — placed by     │
   │ the map (L308)                                         │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the floor plan**: the assets, the routes, and the alarms (L308).

## 3. Visual Flow — One Attack Through the Map

```text
   the attacker (L308)
        │
        ▼
   ┌────────────────────── THE ENTRY (L308) ────────────────────────────┐
   │  the prompt (L309) · the document (L316) · the tool output (L311) │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE ASSET (L308) ────────────────────────────┐
   │  the data (L313): the PII, the prompts (L312)                     │
   │  the model (L278): the quota, the keys (L321)                     │
   │  the tools (L315): the actions, the data they reach (L314)        │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE PATH (L308) ─────────────────────────────┐
   │  the injection (L309) · the leakage (L312) · the agency (L314)    │
   │  the poisoning (L316) · the abuse (L317) — the OWASP map (L326)   │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the model: **attacker → entry → asset → path** (L308).

## 4. How It Works — The Map, Part by Part

- **The assets (L308).** What the attack targets (L308): the data — the prompts and the PII (L313); the models — the quota and the keys (L321); the tools — the actions and the data they reach (L315).
- **The attackers (L308).** Who attacks (L308): the direct user (L308) — the prompt injection (L309); the indirect source (L308) — the retrieved document (L316) and the tool output (L311); the abuser (L317) — the quota burner (L308).
- **The paths (L308).** How the attack reaches the asset (L308): the prompt injection (L309), the data leakage (L312), the excessive agency (L314), the poisoning (L316), the abuse (L317) — the OWASP LLM Top 10 (L326).
- **The countermeasures (L308).** Placed by the map (L308): the inputs checked (L281), the outputs checked (L281), the tools scoped (L323), and the audit recorded (L322).

> [!NOTE]
> **The threat model is the L172 baseline, attack-shaped (L308).** The senior answer starts from the L172 baseline (L172) — the client never trusted (L172) — and maps it to the AI's surface (L308): the inputs (L172) are the prompts and the documents (L308); the outputs (L172) are the model's responses (L308); the secrets (L172) are the keys and the quota (L321); and the audit (L322) is the record (L308). The OWASP LLM Top 10 (L326) is the checklist (L308); the L172 baseline (L172) is the principle (L308).

## 5. Real Project Usage

- **A production AI SaaS (L357).** The threat model (L308) reviewed before the launch (L307): the assets, the attackers, and the paths (L308).
- **A RAG platform (L280).** The document's path (L316) threat-modeled (L308): the poisoning (L316) and the leakage (L312).
- **An agent product (L279).** The tools' agency (L314) threat-modeled (L308): the excessive agency (L314) and the unsafe tools (L315).
- **A regulated workload (L371).** The threat model (L308) as the compliance's evidence (L371): the risks mapped and the controls placed (L308).
- **Anything AI (L308).** The map first (L308) — the OWASP LLM Top 10 (L326) as the checklist (L308).

The through-line: **the map is the module's start** — the assets, the attackers, and the paths (L308).

## 6. Interview Explanation

Say it in four moves:

1. **The assets.** "The data (L313), the models (L278), the tools (L315)."
2. **The attackers.** "The user, the document, the abuser (L308)."
3. **The paths.** "The injection (L309), the leakage (L312), the agency (L314)."
4. **The map.** "The OWASP LLM Top 10 (L326) — the module's checklist (L308)."

## 7. Senior-Level Insights

- **The map before the alarms (L308).** The senior answer threat-models first (L308): the countermeasures (L308) placed by the map (L308), not the guess (L308).
- **The asset is the value (L308).** The data's sensitivity (L313) and the tools' power (L315) — the protection (L308) follows the value (L308).
- **The path is the surface (L308).** The prompt injection (L309), the poisoning (L316), and the agency (L314) — the surface (L308) is the sum of the paths (L308).
- **The OWASP map is the checklist (L326).** The ten risks (L326) — the module's (L308) map (L326) — the interview's (L308) vocabulary (L326).
- **The audit is the record (L322).** The threat model (L308) and the controls (L325) — the audit (L322) records who did what (L308).

## 8. Common Mistakes

- **The countermeasure before the map (L308).** The alarm where the attack isn't (L308) — the map (L308) first (L308).
- **The client trusted (L172).** The prompt treated as safe (L172) — the injection (L309) is the first risk (L308).
- **The assets unmapped (L308).** The PII (L313) and the tools (L315) unlisted (L308) — the protection (L308) misses them (L308).
- **The audit missing (L322).** The attack (L308) unreconstructed (L322) — the record (L322) is the recovery's (L308).
- **The OWASP ignored (L326).** The bespoke checklist (L308) — the OWASP LLM Top 10 (L326) is the shared map (L326).

## 9. Best Practices

- **Map the assets** (L308) — the data (L313), the models (L278), the tools (L315).
- **Map the paths** (L308) — the OWASP LLM Top 10 (L326).
- **Place the controls by the map** (L308) — the inputs (L281), the tools (L323), the audit (L322).
- **Review before the launch** (L308) — the L307 pipeline (L307) gated (L308).
- **Record the audit** (L322) — the who, the what, the when (L322).

## 10. Interview Questions

**Q: Walk me through the AI threat model.**
> A: The map before the countermeasures (L308). The assets — the data (L313), the models (L278), the tools (L315). The attackers — the user, the document, the abuser (L308). The paths — the injection (L309), the leakage (L312), the agency (L314). And the map — the OWASP LLM Top 10 (L326).

**Q: What are the assets in an AI system?**
> A: Three (L308): the data — the prompts and the PII (L313); the models — the quota and the keys (L321); and the tools — the actions the agent can take and the data they reach (L315). The protection (L308) follows the value (L308).

**Q: How is an AI attack different from a web attack?**
> A: The injection's target (L308). The web attack (L128) exploits the code (L128); the AI attack (L308) exploits the *instructions* (L308) — the model follows the attacker's (L309) — and the indirect sources (L308): the retrieved document (L316) and the tool output (L311) carry the attack (L308). The OWASP LLM Top 10 (L326) is the new map (L308).

**Q: Where do you start?**
> A: The map (L308): the assets (L308) — what's valuable; the attackers (L308) — who's coming; and the paths (L308) — how they get in. Then the controls (L325) by the map (L308) — the inputs (L281), the tools (L323), and the audit (L322). The demo secures what it thinks of; the architect maps first (L308).

## 11. Follow-Up Questions

- What are the assets (L308)?
- What are the attackers (L308)?
- What are the paths (L308)?
- How is the AI attack different (L308)?
- What's the OWASP map (L326)?

## 12. Comparison Table — The Web vs the AI Threat Model

| | The web threat model (L128) | The AI threat model (L308) |
|---|---|---|
| The target (L308) | the code (L128) | the instructions (L309) |
| The entry (L308) | the request (L128) | the prompt, the document (L316) |
| The assets (L308) | the DB, the session (L128) | the data (L313), the tools (L315) |
| The map (L308) | the OWASP Top 10 (L128) | the OWASP LLM Top 10 (L326) |

The senior read: **the target shifted from the code to the instructions** — the map shifted with it (L308).

## 13. Code Example — The Map, Drawn

```js
// The threat model (L308) — the map before the countermeasures (L308).
// 1 · THE ASSETS (L308) — what the attack targets (L308).
const assets = {
  data:  { prompts: true, pii: true },           // the PII (L313)
  model: { quota: true, keys: true },            // the keys (L321)
  tools: { actions: ['send_email', 'delete'], data: 'tenant' },  // L315
};

// 2 · THE ATTACKERS (L308) — who attacks (L308).
const attackers = {
  directUser:  'the prompt injection (L309)',
  indirect:    'the document (L316), the tool output (L311)',
  abuser:      'the quota burner (L317)',
};

// 3 · THE PATHS (L308) — how the attack reaches the asset (L308).
const paths = {
  injection:  { from: 'prompt',  to: 'model' },  // L309
  leakage:    { from: 'data',    to: 'logs' },   // L312
  agency:     { from: 'tools',   to: 'data' },   // L314
  poisoning:  { from: 'document', to: 'rag' },   // L316
};

// 4 · THE CONTROLS (L308) — placed by the map (L308).
const controls = {
  inputs:  'the guardrails (L281)',              // the inputs checked
  tools:   'the least privilege (L323)',          // the tools scoped
  audit:   'the record (L322)',                   // the audit logged
};
```

```text
What the reader must SEE — the map, drawn:

  assets: data, model, tools    → what's valuable (L308)
  attackers: user, doc, abuser  → who's coming (L308)
  paths: injection, leakage, agency → how they get in (L308)
  controls: inputs, tools, audit → placed by the map (L308)

  The map first, the alarms by the routes (L308).
```

```narrate
4-8: The assets — the data, the model, and the tools (L308, L313).
10-13: The attackers — the direct user, the indirect sources, the abuser (L308).
15-19: The paths — the injection, the leakage, the agency, and the poisoning (L308).
21-25: The controls — the guardrails, the least privilege, and the audit, placed by the map (L308).
```

> [!TIP]
> The pair that defines the threat model: **the asset** (what's valuable, L308) and **the path** (how it's reached, L308). **Map the assets, map the paths, place the controls by the map — the OWASP LLM Top 10 as the checklist (L308).**

## 14. Performance Notes

- **The map is the review's speed (L308).** The threat model (L308) — the review (L308) reads the map (L308), not the whole app (L308).
- **The controls are the latency's cost (L308).** The input checks (L281) and the tool scoping (L323) — the milliseconds (L308) for the safety (L308).
- **The audit is the storage's cost (L322).** The records (L322) — the retention (L322) is the bill's line (L308).
- **The map is the compliance's evidence (L371).** The risks mapped (L308) and the controls placed (L325) — the audit's (L322) record (L308).

## 15. Debugging Scenarios

| Symptom | First check (L308) | The lever |
|---|---|---|
| The model follows the attacker | The injection (L309) | The input checks (L281) |
| The data is in the logs | The leakage (L312) | The redaction (L329) |
| The agent did too much | The agency (L314) | The tool scoping (L323) |
| The RAG answers wrong | The poisoning (L316) | The document checks (L316) |
| The quota is burned | The abuse (L317) | The rate limits (L318) |

## 16. Quick Revision Notes

- The AI threat model = **the map before the countermeasures** (L308): the assets, the attackers, the paths.
- The assets: **the data (L313), the models (L278), the tools (L315)**.
- The attackers: **the user, the document, the abuser** (L308).
- The paths: **the injection (L309), the leakage (L312), the agency (L314), the poisoning (L316)**.
- The map: **the OWASP LLM Top 10 (L326)**.

## 17. Cheat Sheet

```text
AI SECURITY THREAT MODEL = the map before any countermeasure

THE ASSETS (L308)
  the data (L313) — the prompts, the PII
  the model (L278) — the quota, the keys (L321)
  the tools (L315) — the actions, the data they reach (L314)

THE ATTACKERS (L308)
  the direct user (L308) — the prompt injection (L309)
  the indirect (L308) — the document (L316), the tool output (L311)
  the abuser (L317) — the quota burner (L308)

THE PATHS (L308)
  the injection (L309) · the leakage (L312) · the agency (L314)
  the poisoning (L316) · the abuse (L317)
  the OWASP LLM Top 10 (L326) — the map (L326)

THE CONTROLS (L308)
  the inputs checked (L281) · the outputs checked (L281)
  the tools scoped (L323) · the audit recorded (L322)

THE PRINCIPLE (L308)
  the L172 baseline (L172) — the client never trusted (L172)
  attack-shaped (L308)

INTERVIEW, 4 MOVES
  1 assets   "the data, the models, the tools (L308)"
  2 attackers "the user, the document, the abuser (L308)"
  3 paths    "the injection, the leakage, the agency (L308)"
  4 map      "the OWASP LLM Top 10 (L326)"
```

## 18. Key Takeaways

> [!RECAP]
> - The AI security threat model is **the map of the attack surface before any countermeasure** (L308): the assets (L308), the attackers (L308), and the paths (L308)
> - **The assets** (L308): the data — the prompts and the PII (L313); the models — the quota and the keys (L321); the tools — the actions and the data they reach (L315)
> - **The attackers** (L308): the direct user (L308) — the prompt injection (L309); the indirect sources (L308) — the retrieved document (L316) and the tool output (L311); the abuser (L317) — the quota burner (L308)
> - **The paths** (L308): the prompt injection (L309), the data leakage (L312), the excessive agency (L314), the poisoning (L316), and the abuse (L317)
> - **The map** (L326): the OWASP LLM Top 10 (L326) — the ten risks the module closes one by one (L308)
> - The principle (L308): the L172 baseline (L172) — the client never trusted (L172) — attack-shaped (L308): the inputs checked (L281), the tools scoped (L323), and the audit recorded (L322)

## Check your understanding

Answer these without looking back.

1. What are the assets (L308)?
2. What are the attackers (L308)?
3. What are the paths (L308)?
4. How is the AI attack different (L308)?
5. What's the OWASP map (L326)?
6. What's the L172 principle (L172)?
7. Where do you start (L308)?
8. What is the map before the countermeasure (L308)?

## A Closing Note — The Map, Drawn

You now hold the threat model: **the assets, the attackers, and the paths — with the OWASP LLM Top 10 as the checklist.** The module has its map — and the alarms will go by the routes (L308).

Next: the first risk — Prompt Injection (L309).
