# Lesson 253 — Modular Monoliths

**Interview importance:** ⭐⭐⭐⭐⭐ — "what's the sane default?" — the answer is the *modular monolith*: the domain seams in one deployment — the middle between the monolith and the microservices (L252).**

L252's default is this lesson: **modular monoliths** — the sane middle between the monolith and the microservices (L253): one deployment (L253), but with the domain seams as modules (L253) — the boundaries that the microservices would split (L252), kept in-process (L253). The value: the monolith's simplicity (L253) with the microservices' discipline (L253): the modules, the contracts (L254), and the state ownership (L207) — without the network (L254).

The distinction this lesson is built on: a **demo** has one big folder. A **solutions architect** designs the modules: the domain boundaries (L253), the module contracts (L254), and the state ownership (L207) — the seams that make the eventual split (L252) possible (L253).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the modular monolith: the domain seams, one deployment (L253)
- Explain the modules: the boundaries and the contracts (L253)
- Explain the state ownership: the modules' own data (L207)
- Explain the value: the monolith's simplicity with the microservices' discipline (L253)
- Explain the upgrade path: the split when it pays (L252)

## 1. One-Line Definition

**The modular monolith is the sane default — one deployment (L253) with the domain seams as modules (L253): the boundaries that the microservices would split (L252), kept in-process (L253), with the module contracts (L254) and the state ownership (L207) — the monolith's simplicity with the microservices' discipline (L253), and the upgrade path to the split when the scale or the team pays (L252).**

The one-sentence interview answer: *"The modular monolith is the sane default (L253). One deployment (L253) — the monolith's simplicity — but with the domain seams as modules (L253): the chat module, the generation module, the data module (L233) — the boundaries that the microservices would split (L252), kept in-process (L253). The discipline of the microservices without the network: the module contracts (L254) — each module's API, versioned (L341); the state ownership (L207) — each module owns its data (L207), no reaching into another module's tables (L253); and the seams (L253) — the boundaries that make the eventual split (L252) possible (L253). The value: the microservices' upgrade path (L252) at the monolith's cost (L253) — one deployment, one trace (L213), no network (L254). When the scale or the team demands, the module becomes a service (L252) — the split is a move, not a rewrite (L253)."*

## 2. Mental Model

Think of the modular monolith as **one building with strong internal walls.** The building (the monolith, L253) has departments (the modules, L253): the chat department (L233), the generation department (L145), the data department (L189). The walls are real (the module boundaries, L253): each department has its own entrance (the module contract, L254) and its own storeroom (the state ownership, L207) — the chat department doesn't walk into the data department's storeroom (L207). The building is one (one deployment, L253) — no roads between buildings (no network, L254) — but the departments are ready to become separate buildings (the split, L252): the walls are already in place (L253). The building works because the departments are separate inside one structure (L253).

```text
   one building, strong walls (L253)
   ┌────────────────────────────────────────────────────────┐
   │ the chat dept (L233) · the generation dept (L145)      │
   │ the data dept (L189)                                   │
   │ each with its own entrance (the contract, L254)        │
   │ each with its own storeroom (the state, L207)          │
   │ one building — ready to become separate (L252)         │
   └────────────────────────────────────────────────────────┘
```

The mental model is **one building with strong walls**: the departments separate inside one structure (L253).

## 3. Visual Flow — The Module Boundary

```text
   the chat module needs the data (L253)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE MODULE CONTRACT (L254)                           │
   │     the chat module calls the data module's PUBLIC API   │
   │     (L254) — never its internals (L253)                  │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE STATE OWNERSHIP (L207)                           │
   │     the data module owns its tables (L207) — the chat    │
   │     module's requests go through the API (L253)          │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE SEAM (L253)                                      │
   │     the boundary in the code (L253) — ready for the      │
   │     split (L252): the module becomes a service (L252)    │
   └──────────────────────────────────────────────────────────┘
```

The flow is the wall: **contract → state ownership → seam** — the departments separate inside one building (L253).

## 4. How It Works — The Modules, the Contracts, the Ownership

- **The modules (L253).** The domain seams as modules (L253): the chat module (L233), the generation module (L145), the data module (L189) — the boundaries that the microservices would split (L252), kept in-process (L253).
- **The contracts (L254).** Each module's public API (L254): the versioned interface (L341) that the other modules call (L254) — never the internals (L253). The contract is the module's wall (L254).
- **The state ownership (L207).** Each module owns its data (L207): the data module's tables (L207), the chat module's conversations (L166) — the requests go through the contracts (L253), not the shared database (L207).
- **The value (L253).** The monolith's simplicity (L253) — one deployment (L253), one trace (L213), no network (L254) — with the microservices' discipline (L253): the contracts (L254) and the ownership (L207).
- **The upgrade path (L252).** The seam (L253) makes the split a move (L252): when the scale or the team demands, the module becomes a service (L252) — the contract becomes the API (L254), the in-process call becomes the network call (L254).

> [!NOTE]
> **The wall is what makes the split a move, not a rewrite (L253).** The modular monolith's value is the *seams* (L253): the modules with the contracts (L254) and the state ownership (L207) — the exact boundaries the microservices would split (L252). When the scale or the team demands the split (L252), the module is lifted out: the contract becomes the service API (L254), the call becomes the network call (L254), and the state moves with the module (L207). A monolith without the walls (L253) — the big ball of mud (L253) — requires the rewrite; the modular monolith requires the move (L253).

## 5. Real Project Usage

- **The AI platform's start (L253).** The chat module (L233), the generation module (L145), and the data module (L189) — one deployment (L253), the seams in the code (L253).
- **The team's modules (L252).** The chat team's module (L252) and the data team's module (L252) — the ownership per module (L253).
- **The split-ready (L252).** The generation module (L145) — the bursty one (L252) — split out when the scale demands (L252).
- **The upgrade path (L252).** The module → the service (L252) — the contract → the API (L254).
- **Anything starting (L260).** The modular monolith (L253) is the L260 platform's sane start (L253) — the seams, one deployment (L253).

The through-line: **one building, strong walls** — the domain seams with the contracts and the ownership, ready to split (L253).

## 6. Interview Explanation

Say it in four moves:

1. **The shape.** "One deployment (L253) with the domain seams as modules (L253)."
2. **The discipline.** "The module contracts (L254) and the state ownership (L207)."
3. **The value.** "The monolith's simplicity (L253) with the microservices' discipline (L253)."
4. **The path.** "The seam makes the split a move, not a rewrite (L252, L253)."

## 7. Senior-Level Insights

- **The seams are the value (L253).** The senior answer designs the modules' boundaries (L253) — the split's readiness (L252) is the monolith's point (L253).
- **The contracts are the walls (L254).** Each module's public API (L254), versioned (L341) — the other modules call the contract, never the internals (L253).
- **The state ownership is the discipline (L207).** Each module owns its data (L207) — the shared database is the big ball of mud's invitation (L253).
- **The split is a move (L252).** The module → the service (L252): the contract → the API (L254), the call → the network (L254) — the wall already in place (L253).
- **The one deployment is the simplicity (L253).** One trace (L213), no network (L254), one deploy (L253) — the monolith's cost (L253).

## 8. Common Mistakes

- **The big ball of mud (L253).** One folder, no modules (L253) — the seams (L253) missing, the split (L252) a rewrite (L253).
- **The internals shared (L253).** The modules reaching into each other's code (L253) — the contracts (L254) missing (L253).
- **The shared database (L207).** The modules sharing the tables (L207) — the state ownership (L207) missing, the split (L252) impossible (L253).
- **The contracts unversioned (L341).** The module APIs breaking (L341) — the versioning (L341) missing (L253).
- **The microservices from day one (L252).** The split before the scale (L252) — the network (L254) and the state (L207) costs paid early (L253).
- **The walls ignored (L253).** The seams drawn but not enforced (L253) — the discipline (L254) in the name only (L253).

## 9. Best Practices

- **Design the modules by the domain** (L253) — the chat (L233), the generation (L145), the data (L189).
- **Enforce the contracts** (L254) — the public APIs (L254), versioned (L341).
- **Own the state per module** (L207) — no shared tables (L253).
- **Keep the one deployment** (L253) — until the scale or the team pays (L252).
- **Make the seams real** (L253) — enforced, ready for the split (L252).
- **Split as a move** (L252) — the module → the service, when it pays (L252).

## 10. Interview Questions

**Q: What's a modular monolith?**
> A: The sane default (L253): one deployment (L253) with the domain seams as modules (L253) — the chat module (L233), the generation module (L145), the data module (L189). The discipline of the microservices without the network (L254): the module contracts (L254) and the state ownership (L207). The walls are in place, ready for the split (L252).

**Q: How is it different from a big monolith?**
> A: The walls (L253). A big monolith has no modules — one folder, shared internals, a shared database (L253). The modular monolith has the domain seams (L253): each module's public contract (L254), each module owning its data (L207). The difference is the discipline (L253) — and the split becomes a move, not a rewrite (L252).

**Q: What's the module contract?**
> A: The module's public API (L254). The other modules call the contract (L254) — never the internals (L253). The contract is versioned (L341) like any API (L341). The wall between the modules (L254) — and the seam that becomes the service API when the module splits out (L252).

**Q: When do you split a module out?**
> A: When the scale or the team pays (L252). The bursty generation module (L145) — when its scaling needs its own capacity (L252); the team — when the deployment independence is the bottleneck (L252). The split is a move (L252): the contract becomes the API (L254), the in-process call becomes the network call (L254), and the state moves with the module (L207) — the wall was already there (L253).

## 11. Follow-Up Questions

- What are the modules (L253)?
- What's the module contract (L254)?
- Why the state ownership (L207)?
- When do you split (L252)?
- How is the split a move (L252)?

## 12. Comparison Table — Big Ball vs Modular vs Micro

| | Big ball (L253) | Modular monolith (this lesson) | Microservices (L252) |
|---|---|---|---|
| The seams (L253) | none | modules (L253) | services (L252) |
| The deployment | one | one (L253) | independent (L252) |
| The contracts (L254) | none | module APIs (L254) | service APIs (L254) |
| The state (L207) | shared | owned per module (L207) | owned per service (L207) |
| The split (L252) | a rewrite | a move (L253) | — |

The senior read: **the middle column is the default** — the seams and the discipline, one deployment (L253).

## 13. Code Example — The Modules

```js
// The modular monolith: the seams, the contracts, the ownership (L253).
// THE MODULES (L253) — the domain seams in one deployment.
//   modules/chat/        → the chat module (L233)
//   modules/generation/  → the generation module (L145)
//   modules/data/        → the data module (L189)

// THE CONTRACTS (L254) — each module's public API (L254).
// modules/chat/index.ts  — the public surface (L254):
export const chatApi = {
  sendMessage(input) { … },          // the contract (L254)
  getHistory(chatId) { … },
};
//   the internals stay inside the module (L253).

// THE STATE OWNERSHIP (L207) — each module owns its data (L207).
//   modules/chat/db.ts      → conversations (L166) — the chat's tables
//   modules/generation/db.ts → the jobs' state (L249)
//   modules/data/db.ts      → the vector index (L182)
//   NO cross-module tables (L253) — the requests go through the APIs (L254).

// THE SPLIT PATH (L252) — the seam, ready (L253).
//   the generation module (L145) → the generation service (L252):
//   the contract → the HTTP API (L254) · the call → the network (L254)
```

```text
What the reader must SEE — the building's walls:

  the modules          → the domain seams (L253)
  the contracts        → the public APIs (L254), versioned (L341)
  the ownership        → each module's own tables (L207)
  the split path       → the seam ready (L252)

  One building, strong walls — the split is a move, not a rewrite.
```

```narrate
4-6: The modules — the domain seams in one deployment (L253).
8-11: The contracts — each module's public API; the internals stay inside (L254, L253).
13-17: The ownership — each module's own tables; no cross-module data (L207, L253).
19-22: The split path — the seam becomes the service boundary when the scale pays (L252).
```

> [!TIP]
> The line that shows the discipline: **`NO cross-module tables`** — the state owned per module (L207). **The walls are real — the contracts and the ownership make the split a move, not a rewrite (L253).**

## 14. Performance Notes

- **The in-process calls are free (L151).** No network (L254) — the module calls are function calls (L253), the monolith's latency win (L253).
- **The one deployment is the ops simplicity (L253).** One deploy, one trace (L213) — the monolith's operational cost (L253).
- **The shared process is the scaling ceiling (L253).** The modules scale together (L253) — the split's trigger (L252).
- **The state is in-process (L207).** The modules' data (L207) — no distributed consistency (L259) until the split (L252).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The modules coupled | The internals shared (L253) | The contracts (L254) |
| The split is hard | The shared database (L207) | The state ownership (L253) |
| The APIs break | The contracts unversioned (L341) | The versioning (L341) |
| The ball of mud | No modules (L253) | The seams (L253) |
| The scale ceiling | The monolith's process (L253) | The split's trigger (L252) |

## 16. Quick Revision Notes

- The modular monolith = **the sane default** (L253): one deployment, the domain seams (L253).
- The modules: **the boundaries (L253), the contracts (L254)**.
- The ownership: **each module's data (L207), no shared tables (L253)**.
- The value: **the monolith's simplicity with the microservices' discipline** (L253).
- The path: **the split is a move, not a rewrite** (L252).
- The trigger: **the scale or the team pays** (L252).

## 17. Cheat Sheet

```text
MODULAR MONOLITHS = one building, strong walls

THE SHAPE (L253)
  one deployment (L253) · the domain seams as modules (L253)
  the chat (L233) · the generation (L145) · the data (L189)

THE DISCIPLINE (L254, L207)
  the contracts  each module's public API (L254), versioned (L341)
                 the other modules call the contract, never the internals (L253)
  the ownership  each module owns its data (L207)
                 NO cross-module tables (L253)

THE VALUE (L253)
  the monolith's simplicity — one deploy (L253), one trace (L213),
  no network (L254) — with the microservices' discipline (L253)

THE PATH (L252)
  the seam is ready — the module becomes a service (L252):
  the contract → the API (L254) · the call → the network (L254)
  the split is a move, not a rewrite (L253)
  triggered when the scale or the team pays (L252)

INTERVIEW, 4 MOVES
  1 shape    "one deployment, the domain seams (L253)"
  2 discipline "the contracts (L254), the ownership (L207)"
  3 value    "the simplicity with the discipline (L253)"
  4 path     "the split is a move, not a rewrite (L252)"
```

## 18. Key Takeaways

> [!RECAP]
> - The modular monolith is **the sane default** (L253): one deployment (L253) with the domain seams as modules (L253) — the chat (L233), the generation (L145), the data (L189)
> - **The contracts are the walls** (L254): each module's public API (L254), versioned (L341) — the other modules call the contract, never the internals (L253)
> - **The state ownership is the discipline** (L207): each module owns its data (L207), and no shared database couples the modules (L253)
> - **The value is the monolith's simplicity with the microservices' discipline** (L253): one deploy (L253), one trace (L213), no network (L254)
> - **The split is a move, not a rewrite** (L252): the seam (L253) means the module becomes a service (L252) — the contract becomes the API (L254) — when the scale or the team pays (L252)
> - The modular monolith is **the L260 platform's sane start** (L253) — the walls in place, the split ready (L252)

## Check your understanding

Answer these without looking back.

1. What's the modular monolith (L253)?
2. What are the modules (L253)?
3. What's the module contract (L254)?
4. Why the state ownership (L207)?
5. What's the value (L253)?
6. When do you split (L252)?
7. Why is the split a move (L253)?
8. What's the big ball of mud (L253)?

## A Closing Note — One Building, Strong Walls

You now hold the sane default: **the domain seams as modules, the contracts as the walls, the state owned per department, and the split ready as a move.** The AI platform starts as one building — with the walls that make the future split a move, not a rewrite (L253).

Next: how the parts talk — service-to-service communication (L254), sync calls, async events, and the contracts.
