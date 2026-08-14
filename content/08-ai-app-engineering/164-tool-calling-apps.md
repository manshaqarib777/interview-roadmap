# Lesson 164 — Tool Calling in Applications

**Interview importance:** ⭐⭐⭐⭐⭐ — "how does your app let the model act?" is the mechanism question of the application phase; the answer is the tool loop in the UI: pending → executed → back in context.

Lesson 144 gave you the primitive (the declare → execute → return loop). This lesson is the **application pattern**: the tool loop living inside the app — how the model's declaration reaches your server, how your server executes with least privilege (L315), and how the UI renders the whole thing (L161's parts, L162's states). It's the difference between a tool call that works in a script and a tool loop that works in a product.

The distinction this lesson is built on: a **script** calls a function. A **solutions architect** runs the *loop* — the model declares (L144), the server executes with the user's permissions (L315), the result returns to context, and the UI shows pending → executed as part of the conversation (L161, L162) — with validation, idempotency, and observability around every call.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the tool loop in an app: declare → execute (server) → return → continue (L144)
- Place the loop in the L158 architecture: server-side execution, least privilege (L315)
- Render the loop in the UI: pending → executed parts (L161, L162)
- Design tools for apps: narrow scope, validation, idempotency (L315, L255)
- Handle tool failures in the loop: errors back in context, retries, human gates (L168, L208)

## 1. One-Line Definition

**Tool calling in applications is the full loop of model-declared actions inside a product — the model declares a call (L144), the server executes it with least privilege (L315), the result returns to context, and the UI renders each step — with validation, idempotency, and observability around every call.**

The one-sentence interview answer: *"In an app, the tool loop is: the model emits a tool-call part (L161); my server — never the client — validates and executes it with the user's least privilege (L315); the result returns as a tool-result part, back in context; and the UI shows pending → executed as part of the conversation (L162). Every call is validated, idempotent where it writes (L255), and logged (L213). The model declares; the app owns the action."*

## 2. Mental Model

Think of the app's tool system as a **delegation desk in a bank** — the model is the customer asking for actions, the server is the teller who can actually do them, and the UI is the window that shows what's happening.

```text
   the model (customer)      the server (teller)          the UI (window)
   ┌────────────────┐        ┌──────────────────┐         ┌──────────────────┐
   │ "check the     │        │ validates (L315) │         │ "using          │
   │  balance"      │  ───▶  │ runs the query   │  ───▶  │  get_balance…"  │
   │                │        │ with the user's  │         │  ✓ $2,140.00    │
   └────────────────┘        │ permissions      │         └──────────────────┘
        declares             └──────────────────┘              renders
        (L144)               executes (L315)                   (L162)
```

The mental model is **three roles with a strict boundary**: the model *asks*, the server *does* (with the user's permissions, never the model's), and the UI *shows* — so the user always sees what the app is doing on their behalf.

## 3. Visual Flow — The Tool Loop, Full Circle

```text
   user: "what's my balance and can I pay the invoice?"
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │ 1 · MODEL declares (L144)                    │
   │     tool-call: get_balance(user)             │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ 2 · SERVER executes (L315)                   │
   │     validate args → authorise (L238)         │
   │     run with the USER's least privilege      │
   │     log the call (L213)                      │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ 3 · RESULT returns to context (L144)         │
   │     tool-result: $2,140.00                   │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ 4 · MODEL continues — "you can afford it.    │
   │     want me to pay it?"                      │
   │     → next tool-call: pay_invoice(…)         │
   │       → HUMAN GATE (L208, L324) before write │
   └──────────────────────────────────────────────┘
```

The loop is the whole lesson: **declare → validate → execute → return → continue**, with the human gate (L208) appearing at the write boundary. Every AI product that acts is this loop.

## 4. How It Works — The Loop's Parts in an App

- **The declaration (L144).** The model emits a tool-call part (L161) with a name and schema-valid args (L143). It's *intent*, never action.
- **The server's validation (L315).** The args are validated against the tool's schema — never passed raw into a shell or query (injection, L309, L311). The call is authorised for this user (L238), scoped to their tenant (L320).
- **The execution (L315).** The server runs the tool with the *user's* least privilege — the model gets none. Reads are default; writes need idempotency (L255) and, for consequential actions, a human gate (L208, L324).
- **The return (L144).** The result goes back as a tool-result part, tied to the call id, into the context (L138) — the model continues with the real data.
- **The UI (L161, L162).** Pending → executed, rendered as conversation. The user sees what happened and can stop it (L145).
- **The log (L213).** Every call — what, when, for whom, and the result — is the observability and audit trail (L322).

> [!NOTE]
> **The rule that makes it an app, not a script: the model's tool call is a *request*, and your app is the *authority*.** A script trusts the model; an app validates, authorises, scopes, logs, and gates. The difference is every lesson in the security module (L308+) — and the line between a demo tool and a production one.

## 5. Real Project Usage

- **"Chat with your data" (L174-adjacent).** The model calls `query_orders(user, filters)`; the server runs the query with the user's scope (L320); the answer is grounded in real data (L141's containment, by execution).
- **Action-taking assistants.** "Book it", "send it", "pay it" — reads execute immediately; writes go through the human gate (L208, L324) and idempotency keys (L255).
- **Agents (L200).** The loop runs with a goal: plan → tool → observe → plan. This lesson is the single loop; L200 is the loop with a policy.
- **Copilots.** The model declares "run `npm test`"; the *environment* executes with the repo's permissions and returns the output (L354).
- **RAG with action.** Beyond retrieval (L174): "which orders are late?" needs a *query tool*, not just a vector lookup — the loop is how the model reaches the database.

The through-line: **the tool loop is how an AI app stops being a textbox** — the model reasons, the app acts with authority, and the user watches it happen.

## 6. Interview Explanation

Say it in four moves:

1. **The loop.** "The model emits a tool-call part (L161); my server validates, authorises, and executes with the user's least privilege (L315); the result returns to context; and the UI shows pending → executed (L162)."
2. **The boundary.** "The model declares; the app is the authority. Args are validated (never raw into a shell, L315), calls are scoped to the user and tenant (L238, L320), writes are idempotent (L255) and gated (L208)."
3. **The visibility.** "The UI renders the loop as conversation — 'checking balance… ✓ $2,140' — so the user sees and can stop what's happening on their behalf (L145, L162)."
4. **The audit.** "Every call is logged (L213) — what, when, for whom, and the result. The tool log is the product's memory and its audit trail (L322)."

## 7. Senior-Level Insights

- **The tool surface is the security surface (L308, L315).** Every tool you expose is a capability a prompt injection (L309, L311) can request. The senior design is *least privilege by default*: narrow tools, read-only unless written, per-user scope, human gates on the irreversible (L324).
- **Idempotency is the write-tool rule (L255).** Retries (L169), double-submits, and agent loops (L200) call tools repeatedly. "Send email" must be idempotent (an idempotency key, L255) or gated — "get balance" always is. The senior answer names idempotency before the retry lesson (L169) does.
- **The human gate is the write boundary (L208, L324).** Reads auto-execute; consequential writes pause for approval. That gate is a *security control* (L324), not a UX nicety — and it's what makes an agent safe to deploy.
- **Tool observability is agent observability (L213).** The tool log — call, args, result, latency, errors — is the seed of tracing the whole loop (L329, L330). A tool call log is the agent's audit trail (L322).
- **Tools are where grounding becomes *execution* (L141, L144).** A tool result is true because your server ran it — stronger than RAG's retrieved text. The loop is the strongest form of L141's containment.

## 8. Common Mistakes

- **Executing in the client.** The tool runs in the browser (L172, L315) — the key and privileges leak. Execution is server-side, always.
- **Trusting the model's args.** Raw args into a query or shell (L309, L315) — the injection hole. Validate against the schema, always.
- **No user scope.** The tool runs with the app's privileges, not the user's (L238, L320) — tenant A reads tenant B's data. Scope every call.
- **No idempotency on writes (L255).** A retry (L169) double-sends the email. Writes get idempotency keys or gates.
- **Invisible tools.** No pending → executed UI (L161, L162) — the model feels random, the user feels anxious.
- **No tool log (L213).** What did the agent do? — unanswerable. The audit trail is the product's memory (L322).

## 9. Best Practices

- **Execute server-side, always** (L315) — never in the client.
- **Validate args against the schema before executing** (L143, L315).
- **Scope every call to the user and tenant** (L238, L320) — least privilege by default.
- **Make writes idempotent or gated** (L255, L208) — reads auto, writes approve.
- **Render the loop** — pending → executed as conversation (L161, L162).
- **Log every call** (L213, L322) — what, when, for whom, result.

## 10. Interview Questions

**Q: How does tool calling work inside an app?**
> A: The loop (L144): the model emits a tool-call part (L161); my server validates the args, authorises and scopes the call to the user (L238, L320), and executes with least privilege (L315); the result returns as a tool-result part into context; and the UI shows pending → executed (L162). Declare → validate → execute → return → continue.

**Q: Why does the server execute, not the client?**
> A: Two reasons (L315). The provider key and privileges must never reach the client (L172). And execution is an authority decision — the model declares intent, but the app decides what actually runs, with the user's scope, validation, and logging. Client-side execution would leak both the key and the authority.

**Q: How do you make tool use safe?**
> A: Least privilege by default (L315): narrow tools, args validated against the schema (never raw into a shell, L309), every call scoped to the user and tenant (L320), reads auto-executed, writes idempotent (L255) and behind a human gate (L208, L324). And every call logged (L213) — the tool log is the audit trail (L322).

**Q: How does this become an agent (L200)?**
> A: This lesson is the single loop — declare, execute, return, continue. An agent is that loop running with a goal and a policy: plan which tools to call (L202), decide when to stop (L205), keep state across steps (L207). The loop is the heartbeat; L200 is the brain.

## 11. Follow-Up Questions

- What's the difference between the loop here and in a script (L144)?
- How do you validate tool args without an injection hole (L315)?
- When does a tool call need a human gate (L208, L324)?
- How do you make a write tool idempotent (L255)?
- How does the tool log feed observability (L213)?

## 12. Comparison Table — Script Tool Call vs App Tool Loop

| | Script | App tool loop (this lesson) |
|---|---|---|
| Execution | wherever the script runs | server-side, least privilege (L315) |
| Args | trusted | validated against the schema (L143) |
| Scope | none | user + tenant (L238, L320) |
| Writes | naive | idempotent (L255) + gated (L208) |
| Visibility | console | pending → executed UI (L162) |
| Audit | none | logged (L213, L322) |

The senior read: **the table is the production checklist** — every column on the right is what turns a script's tool call into a product's tool loop.

## 13. Code Example — The Loop, Validated and Visible

```js
// The app tool loop: declare → validate → execute → return (L144, L315).
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req) {
  const { messages, user } = await req.json();
  await auth(req);                                  // L172

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages,
    tools: {
      // READ tool — auto-executes, scoped to the user (L238, L320).
      get_balance: tool({
        description: 'Get the user\'s account balance.',
        parameters: z.object({ userId: z.string() }),
        execute: async ({ userId }) => {
          assertUserMatches(user, userId);          // ← scope, never trust
          return db.balance.findUnique({ where: { userId } });
        },
      }),

      // WRITE tool — idempotent key + human gate (L255, L208, L324).
      pay_invoice: tool({
        description: 'Pay an invoice. Requires approval.',
        parameters: z.object({ invoiceId: z.string(), idempotencyKey: z.string() }),
        execute: async ({ invoiceId, idempotencyKey }) => {
          await requireApproval(user, { type: 'pay', invoiceId });  // L208, L324
          return db.invoices.update({ where: { id: invoiceId }, data: { status: 'paid' } });
        },
      }),
    },
    onStepFinish: ({ toolCalls }) => logToolCalls(user, toolCalls),  // L213
  });

  return result.toDataStreamResponse();             // parts → UI (L161, L162)
}
```

```text
What the reader must SEE — the app's authority, in code:

  get_balance  → validated args, scoped to the user, auto (L315, L238)
  pay_invoice  → idempotency key + approval gate before the write (L255, L208)
  onStepFinish → every call logged (L213)

  The model declares; the app is the authority.
```

```narrate
8-9: Auth first — the gateway is before the loop (L172).
12-19: A read tool: args validated by Zod, scoped to the user — never trusted (L315, L238).
20-27: A write tool: idempotency key (L255) and an approval gate (L208, L324) before the write.
29-31: Every step logged — the audit trail (L213, L322).
```

> [!TIP]
> The two lines that make this production-grade are `assertUserMatches` and `requireApproval` — **scope and gate.** A read is scoped, a write is gated; both are the app's authority, never the model's. That's the difference between a tool call and a safe tool call.

## 14. Performance Notes

- **Each tool call adds a round trip (L151)** — one extra declare → return exchange. The pending state (L162) covers it with visible progress; keep tools fast (L151).
- **Tool results eat context (L138, L149)** — return answer-shaped results, not the whole dataset; summarise server-side first.
- **Parallel tool calls exist (L161)** — independent tools can execute concurrently, cutting the loop's wall time (L151).
- **Idempotency and gates add latency to writes (L255, L208)** — a deliberate cost at the write boundary; reads stay fast.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Tool executes in the browser | Client-side execution (L315) | Move to the server route |
| Injection / wrong data | Args trusted raw (L309) | Validate against the schema (L143) |
| Tenant A sees tenant B | No user scope on the call (L320) | Scope every tool to the user |
| Email sent twice | Non-idempotent write, retried (L255) | Add an idempotency key |
| Unapproved write happened | Missing human gate (L324) | Gate the write tools |
| "What did the agent do?" | No tool log (L213) | Log every call |

## 16. Quick Revision Notes

- The app tool loop: **declare → validate → execute → return → continue** (L144).
- **Server executes, never the client** (L315); args validated (L143), calls scoped (L238, L320).
- **Reads auto, writes idempotent (L255) + gated (L208, L324).**
- The UI renders **pending → executed** (L161, L162); the user can stop (L145).
- Every call is **logged** (L213, L322) — the audit trail.
- The loop with a goal is **the agent (L200)**.

## 17. Cheat Sheet

```text
TOOL CALLING IN APPS = the loop, with the app as authority

LOOP
  declare   tool-call part (L161, L144)
  validate  args vs schema — never raw (L143, L315)
  authorise user + tenant scope (L238, L320)
  execute   server-side, least privilege (L315)
  return    tool-result part, back in context (L144)
  continue  the model reasons with the real data

WRITE RULES
  idempotent (L255) — a retry must not double-send
  gated (L208, L324) — a human approves the irreversible
  reads auto · writes approve

VISIBILITY & AUDIT
  UI: pending → executed (L161, L162)
  log: every call — what, when, for whom, result (L213, L322)

RULES
  never execute in the client (L172, L315)
  never trust the args (L309, L315)
  scope to the user, always (L320)
  the tool log is the agent's audit trail (L322)

INTERVIEW, 4 MOVES
  1 loop    "declare → validate → execute → return → continue"
  2 authority "the app executes with the user's least privilege (L315)"
  3 safety  "scoped, idempotent, gated, logged"
  4 agent   "this loop with a goal is L200"
```

## 18. Key Takeaways

> [!RECAP]
> - Tool calling in applications is **the full loop with the app as the authority**: declare (L144) → validate (L143) → authorise + scope (L238, L320) → execute server-side with least privilege (L315) → return → continue
> - **The server executes, never the client** (L172, L315) — execution is an authority decision, and the model's declaration is a *request*, not an action
> - **Reads auto-execute; writes are idempotent (L255) and human-gated (L208, L324)** — the write boundary is where the app takes control
> - The UI renders the loop as **pending → executed** (L161, L162), and the user can stop it (L145)
> - **Every call is logged** (L213) — the tool log is the audit trail (L322) and the seed of agent observability
> - This loop with a goal and a policy **is the agent (L200)** — the heartbeat of every AI product that acts

## Check your understanding

Answer these without looking back.

1. Walk the full app tool loop, from declaration to continue.
2. Why does the server execute, never the client (L315)?
3. What's the difference between read and write tool rules (L255, L208)?
4. How do you validate args without an injection hole (L143, L309)?
5. How does the UI render the loop (L161, L162)?
6. Why must every call be scoped to the user (L320)?
7. What's in the tool log, and why is it an audit trail (L213, L322)?
8. How does this loop become an agent (L200)?

## A Closing Note — The App That Acts

You now hold the loop that makes AI apps *act*: **declare → validate → execute → return → continue**, with the app as the authority — scoped, idempotent, gated, and logged. It's the same loop L144 gave you as a primitive, now wearing the app's authority: validation, least privilege, human gates, and the audit trail.

Next: what holds the loop together across requests — AI application state (L165): which state is local, which is server, and which belongs to the model.
