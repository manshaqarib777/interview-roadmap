# Lesson 376 — Legacy System Integration

**Interview importance:** ⭐⭐⭐⭐⭐ — "the COBOL-era database, the old CRM, and the bridge to AI" — the answer is *the legacy bridge*: the constraints, the patterns, and the strangler (L376).**

L375 integrated the modern systems; this lesson is **the old ones**: the legacy system integration — the COBOL-era database, the old CRM, and the bridge to the AI (L376): the constraints (the old systems, L376), the patterns (the adapters, the sync, the strangler, L376), and the bridge (the AI to the legacy, L376). The AI shape (L173): the enterprise (L380) — the legacy (L376) and the AI (L173) bridged (L376). This lesson is the legacy's bridge (L376).

The distinction this lesson is built on: a **junior** rewrites. A **solutions architect** bridges (L376): the constraints (L376), the patterns (L376), and the strangler (L376) — because the rewrite (L376) is the risk (L376) and the legacy (L376) stays (L376).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the constraints: the legacy's (L376)
- Explain the patterns: the adapter, the sync, the file (L376)
- Explain the strangler: the incremental replacement (L376)
- Explain the bridge: the AI to the legacy (L376)
- Explain the AI shape: the legacy's bridge (L376)

## 1. One-Line Definition

**The legacy system integration is the COBOL-era database, the old CRM, and the bridge to the AI (L376) — the constraints (the legacy's: the old APIs L376, the batch L282, the no-API L376, L376), the patterns (the adapter L375, the sync L376, the file L375, L376), and the strangler (the incremental replacement L376: the new around the old, L376) — the bridge (L376) to the AI (L173) — the enterprise's (L380) legacy (L376), bridged (L376).**

The one-sentence interview answer: *"The legacy integration is the bridge to the old systems (L376). The constraints (L376): the legacy's (L376) — the old APIs (L376): the SOAP (L376) and the mainframe (L376); the batch (L282): the nightly (L376) exports (L376); and the no-API (L376): the files (L375) and the screens (L376). The patterns (L376): the adapter (L375) — the legacy's (L376) API wrapped (L375); the sync (L376) — the data (L313) copied (L376) to the modern (L375); and the file (L375) — the batch (L282) exchange (L376). The strangler (L376): the incremental (L376) — the new (L376) system (L375) around the old (L376), the pieces (L376) replaced (L376) one by one (L376) — the rewrite (L376) avoided (L376). The bridge (L376): the AI (L173) to the legacy (L376) — the data (L313) synced (L376) for the grounding (L280), the actions (L315) via the adapter (L375). The AI shape (L173): the enterprise (L380) — the legacy (L376) and the AI (L173) bridged (L376): the constraints (L376), the patterns (L376), and the strangler (L376) — the bridge (L376), built (L376)."*

## 2. Mental Model

Think of the legacy integration as **the old town and the new district.** The old town (the legacy, L376): the cobbled streets (the old APIs, L376), the night market (the batch, L282), and the shuttered doors (the no-API, L376). The new district (the AI, L173): the modern grid (the cloud, L366). The bridge (the patterns, L376): the toll roads (the adapters, L375) — the old town's (L376) gates (L376); the ferries (the sync, L376) — the goods (the data, L313) carried (L376); and the freight (the files, L375). The expansion (the strangler, L376): the new buildings (L376) rising around the old (L376) — the old (L376) demolished (L376) piece by piece (L376). The city works because the bridge connects, and the expansion is incremental (L376).

```text
   the old town (the legacy, L376)
   ┌────────────────────────────────────────────────────────┐
   │ the old streets (the APIs, L376) · the night market     │
   │ (the batch, L282) · the shutters (the no-API, L376)     │
   │ the bridge (the patterns, L376) — the tolls (L375), the │
   │ ferries (L376)                                          │
   │ the expansion (the strangler, L376) — the incremental   │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the old town**: the streets, the bridge, and the expansion (L376).

## 3. Visual Flow — One Legacy Bridge

```text
   the AI (L173)
        │
        ▼
   ┌────────────────────── THE ADAPTER (L375) ──────────────────────────┐
   │  the legacy's (L376) API wrapped (L375) — the SOAP (L376)         │
   │  or the file (L375) — the contract (L254)                        │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE SYNC (L376) ─────────────────────────────┐
   │  the data (L313) copied (L376) — the nightly (L376) batch (L282)  │
   │  → the modern store (L268) for the grounding (L280)               │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE STRANGLER (L376) ────────────────────────┐
   │  the new (L376) around the old (L376) — the pieces (L376)         │
   │  replaced (L376) one by one (L376)                                │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the bridge: **adapter → sync → strangler** (L376).

## 4. How It Works — The Bridge, Part by Part

- **The constraints (L376).** The legacy's (L376): the old APIs (L376), the batch (L282), the no-API (L376).
- **The patterns (L376).** The adapter (L375), the sync (L376), the file (L375).
- **The strangler (L376).** The incremental replacement (L376): the new (L376) around the old (L376).
- **The bridge (L376).** The AI (L173) to the legacy (L376): the data (L313) synced (L376), the actions (L315) via the adapter (L375).

> [!NOTE]
> **The strangler is the legacy's path (L376).** The senior answer strangles (L376): the new (L376) system (L375) built around the old (L376) — the seam (L375) at the boundary (L376) — the pieces (L376) replaced (L376) one by one (L376) — the old (L376) retired (L376) at the end (L376). The rewrite (L376) — the big-bang (L376) — is the risk (L376): the strangler (L376) is the incremental (L376), the reversible (L304) (L376).

## 5. Real Project Usage

- **An enterprise engagement (L379).** The legacy CRM (L376) — the bridge (L376) to the AI (L173).
- **A mainframe (L376).** The COBOL (L376) — the batch (L282) exports (L376) — the file (L375).
- **An old CRM (L376).** The SOAP (L376) — the adapter (L375) — the sync (L376).
- **A data warehouse (L375).** The nightly (L376) sync (L376) — the grounding (L280).
- **Anything enterprise (L380).** The bridge (L376) — the constraints, the patterns, the strangler (L376).

The through-line: **the bridge is the legacy's** — the constraints, the patterns, and the strangler (L376).

## 6. Interview Explanation

Say it in four moves:

1. **The constraints.** "The old APIs (L376), the batch (L282), the no-API (L376)."
2. **The patterns.** "The adapter (L375), the sync (L376), the file (L375)."
3. **The strangler.** "The incremental — the new around the old (L376)."
4. **The bridge.** "The data (L313) synced, the actions (L315) via the adapter (L375)."

## 7. Senior-Level Insights

- **The adapter is the seam (L375).** The legacy's (L376) quirks (L376) wrapped (L375) — the contract (L254) — the AI (L173) sees the clean (L375) API (L375).
- **The sync is the grounding's (L376).** The data (L313) copied (L376) — the nightly (L376) batch (L282) — the RAG's (L349) grounding (L280) on the fresh (L335) data (L376).
- **The strangler is the risk's (L376).** The incremental (L376) — the reversible (L304) — the big-bang (L376) avoided (L376).
- **The file is the no-API's (L375).** The screens (L376) and the files (L375) — the batch (L282) exchange (L376).
- **The ownership is the legacy's (L375).** The old system's (L376) owner (L372) — the bridge's (L376) owner (L375).

## 8. Common Mistakes

- **The rewrite (L376).** The big-bang (L376) — the risk (L376) — the strangler (L376) is the path (L376).
- **The no-adapter (L375).** The AI (L173) calling the legacy (L376) directly (L376) — the coupling (L252) — the adapter (L375) is the seam (L375).
- **The sync-blind grounding (L280).** The RAG (L349) on the stale (L335) data (L376) — the nightly (L376) sync (L376) is the freshness (L335).
- **The no-API ignored (L376).** The screens (L376) — the file (L375) exchange (L376) — the batch (L282).
- **The ownership-less (L375).** The bridge (L376) un-owned (L375) — the changes (L376) unmade (L375).

## 9. Best Practices

- **Wrap the adapter** (L375) — the legacy's (L376) quirks (L376) contained (L375).
- **Sync for the grounding** (L376) — the nightly (L376) batch (L282) — the freshness (L335).
- **Strangle the legacy** (L376) — the incremental (L376), the reversible (L304).
- **File the no-API** (L375) — the batch (L282) exchange (L376).
- **Own the bridge** (L375) — the owner (L372) accountable (L375).

## 10. Interview Questions

**Q: Walk me through the legacy integration.**
> A: The bridge to the old systems (L376). The constraints — the old APIs (L376), the batch (L282), the no-API (L376). The patterns — the adapter (L375), the sync (L376), the file (L375). The strangler — the incremental (L376). And the bridge — the data (L313) and the actions (L315).

**Q: How do you bridge the AI to the legacy?**
> A: The adapter (L375): the legacy's (L376) SOAP (L376) or files (L375) wrapped (L375) — the clean (L375) contract (L254); and the sync (L376): the data (L313) copied (L376) nightly (L282) to the modern store (L268) — the RAG's (L349) grounding (L280) on the fresh (L335) data (L376).

**Q: What's the strangler?**
> A: The incremental replacement (L376): the new (L376) system (L375) built around the old (L376) — the seam (L375) at the boundary (L376) — the pieces (L376) replaced (L376) one by one (L376) — the old (L376) retired (L376). The big-bang (L376) rewrite (L376) is the risk (L376); the strangler (L376) is the reversible (L304) path (L376).

**Q: What if the legacy has no API?**
> A: The file (L375): the batch (L282) exchange (L376) — the legacy (L376) exports (L376) the file (L375), the new (L375) imports (L375) it (L376). The screens (L376) — the UI scraping (L376) — the last resort (L376); the file (L375) is the standard (L376).

## 11. Follow-Up Questions

- What are the constraints (L376)?
- How do you bridge the AI to the legacy (L376)?
- What's the strangler (L376)?
- What if the legacy has no API (L376)?
- What's the adapter (L375)?

## 12. Comparison Table — The Rewrite vs the Strangler

| | The rewrite (L376) | The strangler (L376) |
|---|---|---|
| The risk (L376) | the big-bang (L376) | the incremental (L376) |
| The reversibility (L304) | the low (L376) | the high (L304) |
| The business (L360) | the disruption (L376) | the continuous (L376) |
| The path (L376) | the years (L376) | the pieces (L376) |

The senior read: **the strangler is the path** — the incremental, the reversible (L376).

## 13. Code Example — The Bridge, Applied

```js
// The legacy bridge (L376) — the adapter, the sync, the strangler (L376).
// 1 · THE ADAPTER (L375) — the legacy's SOAP wrapped (L376).
class LegacyCrmAdapter {
  constructor(soapClient) { this.soap = soapClient; }   // L376

  // THE CONTRACT (L254) — the clean shape (L375).
  async getCustomer(id) {
    const raw = await this.soap.call('GetCustomer', { id });  // L376
    return { id: raw.CustomerID, name: raw.Name, tier: raw.Tier };  // L254
  }
}

// 2 · THE SYNC (L376) — the nightly batch (L282).
async function nightlySync() {
  const customers = await legacyAdapter.exportAll();    // the file (L375)
  await modernStore.upsert(customers);                  // the store (L268)
  // the RAG (L349) grounding (L280) on the fresh (L335) data (L376)
}

// 3 · THE STRANGLER (L376) — the incremental (L376).
//   phase 1: the adapter (L375) + the sync (L376) — the read path (L376)
//   phase 2: the new CRM (L375) for the writes (L376)
//   phase 3: the legacy (L376) retired (L376) — the reversible (L304)

// 4 · THE GATE (L324) — the legacy writes approved (L376).
if (action.target === 'legacy') await approvalGate(action);   // L324
```

```text
What the reader must SEE — the bridge, applied:

  LegacyCrmAdapter + clean contract → the seam (L375, L254)
  nightlySync → the store         → the freshness (L335, L376)
  phase 1/2/3                     → the strangler (L376)
  the approval on the legacy      → the gate (L324)

  The adapter, the sync, the strangler (L376).
```

```narrate
4-11: The adapter — the SOAP wrapped with the clean contract (L376, L375).
13-17: The sync — the nightly batch to the modern store (L282, L268).
19-22: The strangler — the phases of the incremental replacement (L376).
24-25: The gate — the legacy writes approved (L324).
```

> [!TIP]
> The pair that defines the bridge: **the wrapped adapter** (the seam, L375) and **the phased strangler** (the path, L376). **Wrap the legacy, sync the data, strangle the old, gate the writes — the legacy's bridge (L376).**

## 14. Performance Notes

- **The adapter is the integration's latency (L375).** The SOAP (L376) — the slow (L376) — the cached (L171) reads (L376).
- **The sync is the freshness (L335).** The nightly (L376) — the RAG (L349) on the day-old (L376) data (L313).
- **The strangler is the risk's (L376).** The pieces (L376) — the reversible (L304) — the business (L360) continuous (L376).
- **The file is the batch's (L282).** The export (L375) — the warehouse's (L375) load (L376).

## 15. Debugging Scenarios

| Symptom | First check (L376) | The lever |
|---|---|---|
| The integration breaks | The adapter (L375) | The contract (L254) |
| The grounding is stale | The sync (L376) | The nightly (L282) |
| The rewrite looms | The strangler (L376) | The phases (L376) |
| The legacy is slow | The adapter (L375) | The cache (L171) |
| The writes are un-gated | The gate (L324) | The approval (L324) |

## 16. Quick Revision Notes

- The legacy integration = **the legacy's bridge** (L376): the constraints, the patterns, the strangler.
- The constraints: **the old APIs (L376), the batch (L282), the no-API (L376)**.
- The patterns: **the adapter (L375), the sync (L376), the file (L375)**.
- The strangler: **the incremental — the new around the old (L376)**.
- The bridge: **the data (L313) synced, the actions (L315) via the adapter (L375)**.

## 17. Cheat Sheet

```text
LEGACY SYSTEM INTEGRATION = the bridge to the AI

THE CONSTRAINTS (L376)
  the old APIs (L376) — the SOAP (L376), the mainframe (L376)
  the batch (L282) — the nightly (L376) exports (L376)
  the no-API (L376) — the files (L375), the screens (L376)

THE PATTERNS (L376)
  the adapter (L375) — the legacy's (L376) API wrapped (L375)
  the sync (L376) — the data (L313) copied (L376) nightly (L282)
  the file (L375) — the batch (L282) exchange (L376)

THE STRANGLER (L376)
  the incremental (L376) — the new (L376) around the old (L376)
  the pieces (L376) replaced (L376) one by one (L376)
  the reversible (L304) — the rewrite (L376) avoided (L376)

THE BRIDGE (L376)
  the data (L313) synced (L376) — the grounding (L280)
  the actions (L315) via the adapter (L375) — gated (L324)

INTERVIEW, 4 MOVES
  1 constraints "the old APIs, the batch, the no-API (L376)"
  2 patterns    "the adapter, the sync, the file (L376)"
  3 strangler   "the incremental (L376)"
  4 bridge      "the data synced, the actions adapted (L376)"
```

## 18. Key Takeaways

> [!RECAP]
> - The legacy system integration is **the COBOL-era database, the old CRM, and the bridge to the AI** (L376): the constraints (L376), the patterns (L376), the strangler (L376), and the bridge (L376)
> - **The constraints** (L376): the old APIs (L376), the batch (L282), and the no-API (L376)
> - **The patterns** (L376): the adapter (L375), the sync (L376), and the file (L375)
> - **The strangler** (L376): the incremental replacement (L376) — the new (L376) around the old (L376), the pieces (L376) replaced (L376) one by one (L376)
> - **The bridge** (L376): the data (L313) synced (L376) for the grounding (L280), and the actions (L315) via the adapter (L375) — gated (L324)
> - The principle (L376): the rewrite (L376) is the risk (L376) — the strangler (L376) is the incremental (L376), the reversible (L304) path (L376)

## Check your understanding

Answer these without looking back.

1. What are the constraints (L376)?
2. How do you bridge the AI to the legacy (L376)?
3. What's the strangler (L376)?
4. What if the legacy has no API (L376)?
5. What's the adapter (L375)?
6. What's the sync (L376)?
7. What's the phase (L376)?
8. What is the legacy's bridge (L376)?

## A Closing Note — The Bridge, Built

You now hold the bridge: **the constraints, the patterns, and the strangler — with the old town connected and the expansion incremental.** The old town and the new district are linked — and the demolition is piece by piece (L376).

Next: the portability, the fallback, and when multi-cloud is the wrong answer — Multi-Cloud Concepts (L377).
