# Lesson 354 — AI Coding Assistant

**Interview importance:** ⭐⭐⭐⭐⭐ — "context, autocomplete, and edit orchestration — the hardest latency budget" — the answer is *the assistant design*: the context, the autocomplete, and the edits (L354).**

L151 built the latency budget (L151) and L347 the protocol; this lesson is **the protocol run on the hardest latency budget**: the AI coding assistant — the context, the autocomplete, and the edit orchestration (L354): the design (the protocol L347 run, L354), the context (the codebase, L354), the autocomplete (the inline, L354), and the edits (the multi-file, L354). The AI shape (L173): the IDE (L354) — the assistant (L354) with the hardest latency (L354). This lesson is the assistant's design (L354).

The distinction this lesson is built on: a **junior** describes the autocomplete. A **solutions architect** designs the latency (L354): the context (L354), the autocomplete (L354), and the edits (L354) — the protocol (L347) run on the coding (L354).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the clarify: the assistant's requirements (L354)
- Explain the context: the codebase (L354)
- Explain the autocomplete: the inline latency (L354)
- Explain the edits: the multi-file orchestration (L354)
- Explain the AI shape: the hardest latency budget (L354)

## 1. One-Line Definition

**The AI coding assistant is the protocol run on the hardest latency budget (L354) — the clarify (the users L162, the IDE L354, the latency L354: the autocomplete under 200ms L354, the chat under 2s L151, L354), the context (the codebase: the open files L354, the repo L354, the retrieval L189, L354), the autocomplete (the inline L354: the streaming L251, the cache L171, L354), and the edits (the multi-file L354: the plan L354, the apply L354, the tests L296, L354) — the IDE (L354), assisted (L354).**

The one-sentence interview answer: *"The coding assistant is the protocol, run on the hardest latency budget (L354). The clarify (L354): the users (L162) — the developers (L354); the IDE (L354) — the editor (L354); the latency (L354) — the autocomplete (L354) under 200ms (L354), the chat (L348) under 2s (L151). The context (L354): the codebase (L354) — the open files (L354), the repo's structure (L354), the retrieval (L189) over the code (L354) — the context (L354) for the suggestion (L354). The autocomplete (L354): the inline (L354) — the streaming (L251) with the small model (L148) and the cache (L171) — the 200ms (L354) budget (L151). The edits (L354): the multi-file (L354) — the plan (L354): the LLM (L278) proposes the changes (L354); the apply (L354): the diff (L354) applied (L354); and the tests (L296): the verification (L354). The AI shape (L173): the IDE (L354) — the autocomplete (L354) and the chat (L348) — the hardest latency (L354), budgeted (L151)."*

## 2. Mental Model

Think of the coding assistant as **the pair programmer with the instant recall.** The partner (the assistant, L354) sits beside the developer (L162): the partner's memory (the context, L354) — the open files (L354) and the repo (L354); the partner's quick comments (the autocomplete, L354) — the instant (L354) suggestions (L354) as the developer types (L354); and the partner's refactors (the edits, L354) — the planned (L354) changes (L354) across the files (L354), tested (L296). The partner (L354) must be instant (L354) — the developer's flow (L354) depends on it (L354). The pair works because the memory is fresh, the comments are instant, and the refactors are tested (L354).

```text
   the pair programmer (the assistant, L354)
   ┌────────────────────────────────────────────────────────┐
   │ the memory (the context, L354) — the files (L354), the │
   │ repo (L354)                                            │
   │ the quick comments (the autocomplete, L354) — the      │
   │ instant (L354)                                         │
   │ the refactors (the edits, L354) — the planned (L354),  │
   │ the tested (L296)                                      │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the pair programmer**: the memory, the comments, and the refactors (L354).

## 3. Visual Flow — One Suggestion and One Edit

```text
   THE AUTOCOMPLETE (L354)
   the cursor (L354) → the context (L354): the open files
   → the small model (L148) → the streamed suggestion (L251)
   → the 200ms (L354) — the cache (L171) on the repeats (L354)

   THE EDIT (L354)
   the request (L354) → the plan (L354): the multi-file diff
   → the retrieval (L189) over the repo (L354)
   → the apply (L354) → the tests (L296) → the review (L208)
```

The flow is the assistant: **the instant suggestion and the planned edit** (L354).

## 4. How It Works — The Design, Part by Part

- **The clarify (L354).** The users (L162), the IDE (L354), the latency (L354) — the autocomplete (L354) under 200ms, the chat (L348) under 2s.
- **The context (L354).** The codebase (L354): the open files (L354), the repo (L354), the retrieval (L189) over the code (L354).
- **The autocomplete (L354).** The inline (L354): the streaming (L251), the small model (L148), the cache (L171).
- **The edits (L354).** The multi-file (L354): the plan (L354), the apply (L354), the tests (L296).

> [!NOTE]
> **The autocomplete's 200ms is the hardest budget (L354).** The senior answer names the budget (L354): the autocomplete (L354) interrupts the typing (L354) — the 200ms (L354) budget (L151) — the small model (L148) and the cache (L171) and the streaming (L251) within it (L354); the chat (L348) has the 2s (L151) with the streaming (L251). The latency (L354) is the design's (L354) first constraint (L354).

## 5. Real Project Usage

- **An IDE plugin (L354).** The autocomplete (L354), the chat (L348), the edits (L354).
- **A code search (L189).** The retrieval (L189) over the repo (L354) — the context (L354).
- **A multi-file refactor (L354).** The plan (L354), the apply (L354), the tests (L296).
- **A terminal assistant (L354).** The chat (L348) with the shell (L354) — the sandbox (L315).
- **Anything coding (L354).** The assistant (L354) — the context, the autocomplete, the edits (L354).

The through-line: **the design is the latency's** — the context, the autocomplete, and the edits (L354).

## 6. Interview Explanation

Say it in four moves:

1. **The clarify.** "The developers, the IDE, the latency — the autocomplete under 200ms (L354)."
2. **The context.** "The open files, the repo, the retrieval (L354)."
3. **The autocomplete.** "The streaming (L251), the small model (L148), the cache (L171)."
4. **The edits.** "The plan (L354), the apply (L354), the tests (L296)."

## 7. Senior-Level Insights

- **The 200ms is the design's constraint (L354).** The autocomplete (L354) — the small model (L148) and the cache (L171) within it (L354) — the latency budget (L151) first (L354).
- **The context is the suggestion's quality (L354).** The open files (L354) and the repo (L354) — the retrieval (L189) — the relevant (L354) context (L354).
- **The small model is the speed (L148).** The autocomplete's (L354) model (L148) — the small (L157) — the chat's (L348) the frontier (L148) — the routing (L155) (L354).
- **The edits are the plan-then-apply (L354).** The multi-file diff (L354) — the plan (L354) reviewed (L208) — the tests (L296) verifying (L354).
- **The eval is the assistant's quality (L341).** The completion's acceptance (L354) — the golden cases (L342) — the L341 suite (L341) (L354).

## 8. Common Mistakes

- **The frontier model for the autocomplete (L354).** The slow (L354) — the 200ms (L354) blown (L354) — the small model (L148) is the speed (L354).
- **The context-less suggestion (L354).** The cursor (L354) without the files (L354) — the generic (L354) suggestion (L354).
- **The un-tested edit (L354).** The multi-file apply (L354) without the tests (L296) — the breakage (L354) — the tests (L296) verify (L354).
- **The un-sandboxed execution (L315).** The terminal (L354) without the sandbox (L315) — the L315 containment (L315) (L354).
- **The eval-less assistant (L341).** The acceptance (L354) un-measured (L341) — the suite (L341) (L354).

## 9. Best Practices

- **Budget the latency** (L151) — the 200ms (L354), the 2s (L151).
- **Feed the context** (L354) — the files (L354), the repo (L354), the retrieval (L189).
- **Route the models** (L155) — the small (L148) for the autocomplete (L354), the frontier (L148) for the chat (L348).
- **Plan-then-apply the edits** (L354) — with the tests (L296).
- **Sandbox the execution** (L315) — the terminal (L354).

## 10. Interview Questions

**Q: Walk me through the coding assistant.**
> A: The protocol, run on the hardest latency budget (L354). The clarify — the developers, the IDE, the latency (L354). The context — the open files, the repo, the retrieval (L354). The autocomplete — the streaming (L251), the small model (L148). And the edits — the plan, the apply, the tests (L354).

**Q: Why the 200ms budget?**
> A: The interruption (L354): the autocomplete (L354) appears as the developer types (L354) — the 200ms (L354) is the perceived-instant (L354) threshold (L151). The design (L354) within it (L354): the small model (L148), the cache (L171), the streaming (L251) — the budget (L151) is the constraint (L354).

**Q: How do you build the context?**
> A: The codebase (L354): the open files (L354) — the immediate (L354) context; the repo (L354) — the retrieval (L189) over the code (L354) — the relevant (L354) symbols and the usages (L354); and the conversation (L348) — the prior requests (L354). The context (L354) is bounded (L149) and fresh (L354).

**Q: How do you orchestrate the edits?**
> A: The plan-then-apply (L354): the request (L354) → the plan (L354) — the LLM (L278) proposes the multi-file diff (L354); the retrieval (L189) locates the files (L354); the apply (L354) — the diff (L354) applied; and the tests (L296) — the verification (L354). The review (L208) gates the high-risk (L354).

## 11. Follow-Up Questions

- What's the clarify (L354)?
- Why the 200ms budget (L354)?
- How do you build the context (L354)?
- How do you orchestrate the edits (L354)?
- What's the eval (L341)?

## 12. Comparison Table — The Autocomplete vs the Chat

| | The autocomplete (L354) | The chat (L348) |
|---|---|---|
| The latency (L354) | the 200ms (L354) | the 2s (L151) |
| The model (L354) | the small (L148) | the frontier (L148) |
| The transport (L354) | the streaming (L251) | the streaming (L251) |
| The use (L354) | the inline (L354) | the conversation (L348) |

The senior read: **the routing (L155) by the latency** — the small for the instant, the frontier for the chat (L354).

## 13. Code Example — The Design, Applied

```js
// The coding assistant (L354) — the latency, the context, the edits (L354).
// 1 · THE AUTOCOMPLETE (L354) — the 200ms path (L354).
async function autocomplete(cursor) {
  // THE CACHE (L171) — the repeated prefix (L354).
  const key = `ac:${hash(cursor.prefix)}`;
  const cached = await redis.get(key);           // L171
  if (cached) return { suggestion: cached, ms: 5 };

  // THE SMALL MODEL (L148) — the fast route (L354).
  const started = performance.now();
  const context = await openFilesContext(cursor);   // L354
  const stream = await smallModel.stream({          // L148
    prefix: cursor.prefix,
    context,                                        // the open files (L354)
  });
  await redis.set(key, stream, 'EX', 3600);         // the cache (L171)
  return { stream, ms: performance.now() - started };  // the 200ms (L354)
}

// 2 · THE EDIT (L354) — the plan-then-apply (L354).
async function edit(request) {
  const plan = await frontierModel.plan(request);    // the plan (L354, L148)
  const files = await retrieve(plan.paths);          // the retrieval (L189)
  const diff = await applyDiff(plan, files);         // the apply (L354)
  await runTests(diff);                              // the tests (L296)
  return { diff, tests: 'pass' };
}
```

```text
What the reader must SEE — the design, applied:

  redis ac:{prefix}          → the cache (L171, L354)
  smallModel.stream          → the fast route (L148, L354)
  openFilesContext           → the context (L354)
  frontierModel.plan         → the plan (L354, L148)
  applyDiff + runTests       → the verified edit (L296)

  The 200ms autocomplete, the planned and tested edit (L354).
```

```narrate
4-9: The cache — the repeated prefix served instantly (L171, L354).
11-17: The autocomplete — the small model streaming with the open files' context (L148, L354).
19-25: The edit — the plan, the retrieval, the apply, and the tests (L354, L296).
```

> [!TIP]
> The pair that defines the design: **the cached small-model stream** (the 200ms, L171) and **the planned multi-file diff** (the tested edit, L354). **Budget the latency, feed the context, route the models, test the edits — the assistant, designed (L354).**

## 14. Performance Notes

- **The 200ms is the UX (L354).** The autocomplete (L354) — the small model (L148), the cache (L171), the streaming (L251) (L354).
- **The context is the tokens (L332).** The open files (L354) — the budget (L149) bounded (L354).
- **The plan is the frontier's cost (L334).** The multi-file plan (L354) — the tokens (L332) — the L334 attribution (L334) (L354).
- **The tests are the edit's time (L296).** The verification (L296) — the CI (L296) and the local (L354).

## 15. Debugging Scenarios

| Symptom | First check (L354) | The lever |
|---|---|---|
| The autocomplete lags | The latency (L354) | The small model (L148), the cache (L171) |
| The suggestions are generic | The context (L354) | The files (L354), the retrieval (L189) |
| The edit breaks the build | The tests (L296) | The verify (L296) |
| The terminal is risky | The sandbox (L315) | The L315 containment (L315) |
| The acceptance drifts | The evals (L341) | The golden cases (L342) |

## 16. Quick Revision Notes

- The AI coding assistant = **the hardest latency budget** (L354): the clarify, the context, the autocomplete, the edits.
- The clarify: **the developers (L162), the IDE (L354), the latency (L354)**.
- The context: **the open files (L354), the repo (L354), the retrieval (L189)**.
- The autocomplete: **the streaming (L251), the small model (L148), the cache (L171)**.
- The edits: **the plan (L354), the apply (L354), the tests (L296)**.

## 17. Cheat Sheet

```text
AI CODING ASSISTANT = the hardest latency budget

THE CLARIFY (L354)
  the users (L162) — the developers (L354)
  the IDE (L354) · the latency (L354):
  the autocomplete (L354) under 200ms (L354)
  the chat (L348) under 2s (L151)

THE CONTEXT (L354)
  the open files (L354) · the repo (L354)
  the retrieval (L189) over the code (L354)
  the conversation (L348) — bounded (L149) and fresh (L354)

THE AUTOCOMPLETE (L354)
  the inline (L354) · the streaming (L251)
  the small model (L148) · the cache (L171)
  the 200ms (L354) budget (L151)

THE EDITS (L354)
  the plan (L354) — the multi-file diff (L354)
  the apply (L354) · the tests (L296) verifying (L354)
  the review (L208) gating the high-risk (L354)

INTERVIEW, 4 MOVES
  1 clarify   "the developers, the IDE, the latency (L354)"
  2 context   "the files, the repo, the retrieval (L354)"
  3 autocomplete "the streaming, the small model, the cache (L354)"
  4 edits     "the plan, the apply, the tests (L354)"
```

## 18. Key Takeaways

> [!RECAP]
> - The AI coding assistant is **the protocol run on the hardest latency budget** (L354): the clarify (L354), the context (L354), the autocomplete (L354), and the edits (L354)
> - **The clarify** (L354): the users (L162), the IDE (L354), and the latency (L354) — the autocomplete (L354) under 200ms, the chat (L348) under 2s (L151)
> - **The context** (L354): the codebase (L354) — the open files (L354), the repo (L354), and the retrieval (L189) over the code (L354)
> - **The autocomplete** (L354): the inline (L354) — the streaming (L251), the small model (L148), and the cache (L171) — within the 200ms (L354)
> - **The edits** (L354): the multi-file (L354) — the plan (L354), the apply (L354), and the tests (L296)
> - The AI shape (L354): the IDE (L354) — the autocomplete (L354) and the chat (L348) — the hardest latency (L354), budgeted (L151)

## Check your understanding

Answer these without looking back.

1. What's the clarify (L354)?
2. Why the 200ms budget (L354)?
3. How do you build the context (L354)?
4. How do you orchestrate the edits (L354)?
5. What's the eval (L341)?
6. What's the small model (L148)?
7. What's the sandbox (L315)?
8. What is the hardest latency budget (L354)?

## A Closing Note — The Partner, Instant

You now hold the design: **the context, the autocomplete, and the edits — with the 200ms budget and the tested refactors.** The pair programmer is instant — and the refactors are verified (L354).

Next: the catalog grounding, the recommendations, and the purchase-safe tool calls — AI E-commerce Assistant (L355).
