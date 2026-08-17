# Lesson 375 — Enterprise Integration

**Interview importance:** ⭐⭐⭐⭐⭐ — "connecting AI to the systems the business already runs" — the answer is *the integration*: the systems, the patterns, and the seams (L375).**

L227 built the external APIs (L227) and L356 the automation (L356); this lesson is **the enterprise's connections**: the enterprise integration — connecting the AI to the systems the business already runs (L375): the systems (the CRM L351, the ERP L375, the data warehouse L375), the patterns (the APIs L227, the events L248, the files L375), and the seams (the integration's boundaries, L375). The AI shape (L173): the enterprise (L380) — the AI (L173) connected (L375). This lesson is the enterprise's integration (L375).

The distinction this lesson is built on: a **junior** calls the API. A **solutions architect** designs the seams (L375): the systems (L375), the patterns (L375), and the ownership (L375) — because the integration (L375) is the enterprise's (L380) reality (L375).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the systems: the CRM, the ERP, the warehouse (L375)
- Explain the patterns: the APIs, the events, the files (L375)
- Explain the seams: the integration's boundaries (L375)
- Explain the AI's: the data, the actions, the grounding (L375)
- Explain the AI shape: the enterprise's connections (L375)

## 1. One-Line Definition

**The enterprise integration connects the AI to the systems the business already runs (L375) — the systems (the CRM L351, the ERP L375, the data warehouse L375, L375), the patterns (the APIs L227: the synchronous L375; the events L248: the asynchronous L375; the files L375: the batch L282, L375), and the seams (the integration's boundaries: the adapter L375, the contract L254, the ownership L375) — the AI's (L173): the data (L313), the actions (L315), the grounding (L280) — the enterprise's (L380) connections (L375).**

The one-sentence interview answer: *"The enterprise integration connects the AI to the business's systems (L375). The systems (L375): the CRM (L351), the ERP (L375), the data warehouse (L375) — the systems (L375) the business (L360) already runs (L375). The patterns (L375): the APIs (L227) — the synchronous (L375): the request-response (L233); the events (L248) — the asynchronous (L375): the pub/sub (L247) and the queues (L270); and the files (L375) — the batch (L282): the exports (L375) and the imports (L375). The seams (L375): the integration's boundaries (L375) — the adapter (L375): the system's (L375) API wrapped (L375); the contract (L254): the versioned (L341) schema (L375); and the ownership (L375): the system's (L375) owner (L372). The AI's (L375): the data (L313) — the CRM's (L351) data (L375) for the grounding (L280); the actions (L315) — the CRM's (L351) writes (L375) — the gated (L324); and the grounding (L280) — the enterprise's (L375) knowledge (L349). The AI shape (L173): the enterprise (L380) — the AI (L173) connected (L375): the systems (L375), the patterns (L375), and the seams (L375) — the L375 reality (L375)."*

## 2. Mental Model

Think of the enterprise integration as **the city's transport hubs.** The city (the enterprise, L380) has the districts (the systems, L375): the commercial (the CRM, L351), the industrial (the ERP, L375), the archives (the warehouse, L375). The connections (the patterns, L375): the direct roads (the APIs, L227) — the quick trips (the sync, L375); the metro lines (the events, L248) — the broadcast (the pub/sub, L247); and the freight trains (the files, L375) — the bulk (the batch, L282). The hubs (the seams, L375): the stations (the adapters, L375) — each district's (L375) entrance (L375) — and the timetables (the contracts, L254). The AI (L173) rides the network (L375) — the data (L313) in, the actions (L315) out (L375). The city works because the districts are connected, the patterns match the trips, and the hubs are standard (L375).

```text
   the transport hubs (the integration, L375)
   ┌────────────────────────────────────────────────────────┐
   │ the districts (the systems, L375) — the CRM (L351),    │
   │ the ERP (L375), the warehouse (L375)                   │
   │ the connections (the patterns, L375) — the roads       │
   │ (L227), the metro (L248), the freight (L375)           │
   │ the hubs (the seams, L375) — the stations (L375)       │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the transport hubs**: the districts, the connections, and the stations (L375).

## 3. Visual Flow — One Integration

```text
   the AI (L173)
        │
        ▼
   ┌────────────────────── THE SEAM (L375) ─────────────────────────────┐
   │  the adapter (L375) · the contract (L254) · the ownership (L375)  │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE PATTERN (L375) ──────────────────────────┐
   │  the API (L227) — the sync: the grounding (L280) reads (L375)     │
   │  the event (L248) — the async: the actions (L315) write (L375)    │
   │  the file (L375) — the batch: the exports (L282)                  │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE SYSTEM (L375) ───────────────────────────┐
   │  the CRM (L351) · the ERP (L375) · the warehouse (L375)           │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the integration: **AI → seam → pattern → system** (L375).

## 4. How It Works — The Connections, Part by Part

- **The systems (L375).** The CRM (L351), the ERP (L375), the data warehouse (L375) — the business's (L360) systems (L375).
- **The patterns (L375).** The APIs (L227), the events (L248), the files (L375).
- **The seams (L375).** The adapter (L375), the contract (L254), the ownership (L375).
- **The AI's (L375).** The data (L313), the actions (L315), the grounding (L280).

> [!NOTE]
> **The seam is the integration's design (L375).** The senior answer designs the seam (L375): the adapter (L375) — the system's (L375) API wrapped (L375), the system's (L375) quirks (L375) contained (L375); the contract (L254) — the versioned (L341) schema (L375), the L254 contract (L254); and the ownership (L375) — the system's (L375) owner (L372), the integration's (L375) owner (L375). The seam (L375) makes the integration (L375) testable (L375) and replaceable (L375).

## 5. Real Project Usage

- **An enterprise engagement (L379).** The CRM (L351) and the ERP (L375) — the integrations (L375).
- **A support copilot (L350).** The CRM (L351) — the tickets (L350) — the API (L227).
- **A RAG platform (L349).** The warehouse (L375) — the data (L313) — the grounding (L280).
- **An automation platform (L356).** The events (L248) — the workflows (L217) — the connectors (L227).
- **Anything enterprise (L380).** The connections (L375) — the systems, the patterns, the seams (L375).

The through-line: **the connections are the enterprise's** — the systems, the patterns, and the seams (L375).

## 6. Interview Explanation

Say it in four moves:

1. **The systems.** "The CRM (L351), the ERP (L375), the warehouse (L375)."
2. **The patterns.** "The APIs (L227), the events (L248), the files (L375)."
3. **The seams.** "The adapter (L375), the contract (L254), the ownership (L375)."
4. **The AI's.** "The data (L313), the actions (L315), the grounding (L280)."

## 7. Senior-Level Insights

- **The pattern matches the trip (L375).** The API (L227) for the sync (L375), the event (L248) for the async (L375), the file (L375) for the batch (L282).
- **The contract is the version's (L254).** The versioned (L341) schema (L375) — the L254 contract (L254) — the systems (L375) evolve (L375).
- **The ownership is the accountability (L375).** The system's (L375) owner (L372) — the integration's (L375) owner (L375) — the changes (L375) decided (L375).
- **The data is the grounding's (L313).** The CRM's (L351) data (L375) — the RAG's (L349) grounding (L280) — the L349 platform (L349), integrated (L375).
- **The actions are the gated (L315).** The CRM's (L351) writes (L375) — the L324 approval (L324) — the L315 tools (L315), integrated (L375).

## 8. Common Mistakes

- **The point-to-point (L375).** The direct calls (L375) — the seam (L375) missing (L375) — the coupling (L252) (L375).
- **The pattern mismatch (L375).** The sync (L375) for the batch (L282) — the user waits (L151) — the pattern (L375) matches the trip (L375).
- **The contract-less (L254).** The un-versioned (L341) schema (L375) — the breakage (L375) — the contract (L254) (L375).
- **The ownership-less (L375).** The integration (L375) un-owned (L375) — the changes (L375) unmade (L375).
- **The un-gated actions (L315).** The CRM (L351) writes (L375) without the approval (L324) — the L324 gate (L324) (L375).

## 9. Best Practices

- **Design the seam** (L375) — the adapter (L375), the contract (L254), the ownership (L375).
- **Match the pattern** (L375) — the API (L227), the event (L248), the file (L375).
- **Version the contracts** (L341) — the L254 contract (L254).
- **Assign the ownership** (L375) — the system's (L375) and the integration's (L375).
- **Gate the actions** (L324) — the CRM (L351) writes (L375).

## 10. Interview Questions

**Q: Walk me through the enterprise integration.**
> A: The connections (L375). The systems — the CRM (L351), the ERP (L375), the warehouse (L375). The patterns — the APIs (L227), the events (L248), the files (L375). The seams — the adapter (L375), the contract (L254), the ownership (L375). And the AI's — the data (L313), the actions (L315), the grounding (L280).

**Q: How do you pick the pattern?**
> A: The trip (L375): the sync (L375) — the request-response (L233) — the API (L227); the async (L375) — the broadcast (L247) or the queue (L270) — the event (L248); and the bulk (L282) — the files (L375) — the batch (L282). The pattern (L375) matches the latency (L333) and the volume (L358).

**Q: What's the seam?**
> A: The integration's boundary (L375): the adapter (L375) — the system's (L375) API wrapped (L375); the contract (L254) — the versioned (L341) schema (L375); and the ownership (L375) — the accountable (L375) owner (L372). The seam (L375) makes the integration (L375) testable (L375) and replaceable (L375).

**Q: What's the AI's integration?**
> A: Three (L375): the data (L313) — the CRM's (L351) and the warehouse's (L375) data (L375) for the grounding (L280); the actions (L315) — the CRM's (L351) writes (L375) — gated (L324); and the grounding (L280) — the enterprise's (L375) knowledge (L349) in the RAG (L349).

## 11. Follow-Up Questions

- What are the systems (L375)?
- How do you pick the pattern (L375)?
- What's the seam (L375)?
- What's the AI's integration (L375)?
- What's the contract (L254)?

## 12. Comparison Table — The Integration Patterns

| Pattern (L375) | The trip (L375) | The AI's (L375) |
|---|---|---|
| The API (L227) | the sync (L375) | the grounding's (L280) reads (L375) |
| The event (L248) | the async (L375) | the actions' (L315) writes (L375) |
| The file (L375) | the batch (L282) | the exports (L375) to the warehouse (L375) |

The senior read: **the pattern matches the trip** (L375).

## 13. Code Example — The Integration, Applied

```js
// The enterprise integration (L375) — the seam, the pattern, the system (L375).
// 1 · THE SEAM (L375) — the adapter and the contract (L375).
class CrmAdapter {
  constructor(client) { this.client = client; }    // the adapter (L375)

  // THE CONTRACT (L254) — the versioned shape (L375).
  async getTicket(id) {
    const raw = await this.client.get(`/tickets/${id}`);  // L227
    return mapTicketV2(raw);                        // the contract (L254, L341)
  }
}

// 2 · THE PATTERN (L375) — the sync and the async (L375).
async function groundSupport(query) {
  // THE API (L227) — the sync read (L375): the tickets and the docs (L375).
  const tickets = await crmAdapter.getTickets(query);   // the grounding (L280)
  return rag.answer(query, { context: tickets });       // L349
}

// 3 · THE EVENT (L248) — the async write (L375).
async function onTicketResolved(ticket) {
  await eventBus.publish('ticket.resolved', ticket);    // the event (L248)
  // the subscribers (L375): the CRM (L351) updated, the billing (L332)
}

// 4 · THE FILE (L375) — the batch (L282).
async function nightlyExport() {
  const rows = await warehouse.export('tickets');       // the file (L375)
  await s3.put('exports/tickets.csv', rows);            // the batch (L265, L282)
}

// 5 · THE GATE (L324) — the actions approved (L375).
if (action.type === 'crm-write') await approvalGate(action);   // L324, L315
```

```text
What the reader must SEE — the integration, applied:

  CrmAdapter + mapTicketV2  → the seam (L375, L254)
  the sync read → the grounding (L280, L375)
  the event publish         → the async (L248, L375)
  the nightly export        → the batch (L282, L375)
  the approval on the write → the gate (L324)

  The seam, the pattern, the system — connected (L375).
```

```narrate
4-12: The seam — the CRM adapter with the versioned contract (L375, L254).
14-18: The sync pattern — the API read for the grounding (L280, L375).
20-23: The async pattern — the event for the write (L248, L375).
25-28: The batch pattern — the nightly file export (L282, L375).
30-31: The gate — the actions approved (L324, L375).
```

> [!TIP]
> The pair that defines the integration: **the versioned adapter** (the seam, L375) and **the event for the async** (the pattern, L248). **Design the seam, match the pattern, version the contract, gate the actions — the enterprise's connections (L375).**

## 14. Performance Notes

- **The pattern is the latency's (L375).** The API (L227) sync (L375) — the request's (L233) latency (L333); the event (L248) — the async (L222) (L375).
- **The batch is the throughput's (L282).** The files (L375) — the exports (L282) — the warehouse's (L375) load (L375).
- **The seam is the maintenance's (L375).** The adapter (L375) — the system's (L375) changes (L375) contained (L375).
- **The contract is the version's (L341).** The versioned (L341) — the systems (L375) evolve (L375).

## 15. Debugging Scenarios

| Symptom | First check (L375) | The lever |
|---|---|---|
| The integration breaks | The contract (L254) | The versioned (L341) |
| The user waits on the sync | The pattern (L375) | The event (L248) |
| The system's quirks leak | The adapter (L375) | The seam (L375) |
| The writes are un-gated | The actions (L315) | The approval (L324) |
| The changes are unmade | The ownership (L375) | The owner (L375) |

## 16. Quick Revision Notes

- The enterprise integration = **the enterprise's connections** (L375): the systems, the patterns, the seams.
- The systems: **the CRM (L351), the ERP (L375), the warehouse (L375)**.
- The patterns: **the APIs (L227), the events (L248), the files (L375)**.
- The seams: **the adapter (L375), the contract (L254), the ownership (L375)**.
- The AI's: **the data (L313), the actions (L315), the grounding (L280)**.

## 17. Cheat Sheet

```text
ENTERPRISE INTEGRATION = connecting the AI to the business's systems

THE SYSTEMS (L375)
  the CRM (L351) · the ERP (L375) · the data warehouse (L375)
  the systems (L375) the business (L360) already runs (L375)

THE PATTERNS (L375)
  the APIs (L227) — the synchronous (L375): the request-response (L233)
  the events (L248) — the asynchronous (L375): the pub/sub (L247),
    the queues (L270)
  the files (L375) — the batch (L282): the exports, the imports (L375)

THE SEAMS (L375)
  the adapter (L375) — the system's (L375) API wrapped (L375)
  the contract (L254) — the versioned (L341) schema (L375)
  the ownership (L375) — the system's (L375) owner (L372)

THE AI'S (L375)
  the data (L313) — the grounding (L280)
  the actions (L315) — the writes, gated (L324)
  the grounding (L280) — the enterprise's (L375) knowledge (L349)

INTERVIEW, 4 MOVES
  1 systems  "the CRM, the ERP, the warehouse (L375)"
  2 patterns "the APIs, the events, the files (L375)"
  3 seams    "the adapter, the contract, the ownership (L375)"
  4 the AI's "the data, the actions, the grounding (L375)"
```

## 18. Key Takeaways

> [!RECAP]
> - The enterprise integration **connects the AI to the systems the business already runs** (L375): the systems (L375), the patterns (L375), the seams (L375), and the AI's (L375)
> - **The systems** (L375): the CRM (L351), the ERP (L375), and the data warehouse (L375)
> - **The patterns** (L375): the APIs (L227) — the synchronous (L375); the events (L248) — the asynchronous (L375); and the files (L375) — the batch (L282)
> - **The seams** (L375): the adapter (L375), the contract (L254) — the versioned (L341) — and the ownership (L375)
> - **The AI's** (L375): the data (L313) — the grounding (L280); the actions (L315) — the gated (L324) writes; and the grounding (L280) — the enterprise's (L375) knowledge (L349)
> - The principle (L375): the seam (L375) makes the integration (L375) testable (L375) and replaceable (L375) — the adapter (L375), the contract (L254), and the ownership (L375)

## Check your understanding

Answer these without looking back.

1. What are the systems (L375)?
2. How do you pick the pattern (L375)?
3. What's the seam (L375)?
4. What's the AI's integration (L375)?
5. What's the contract (L254)?
6. What's the adapter (L375)?
7. What's the ownership (L375)?
8. What are the enterprise's connections (L375)?

## A Closing Note — The Hubs, Built

You now hold the integration: **the systems, the patterns, and the seams — with the districts connected and the stations standard.** The city's transport is wired — and the AI rides the network (L375).

Next: the COBOL-era database, the old CRM, and the bridge to AI — Legacy System Integration (L376).
