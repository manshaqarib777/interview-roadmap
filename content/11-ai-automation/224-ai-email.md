# Lesson 224 — AI + Email

**Interview importance:** ⭐⭐⭐⭐ — "how do you automate email with AI?" — the answer is *drafting, triage, and replies* — with the human-approval rule for anything sent (L228, L208).**

L223's follow-up pattern continues here: **AI + email** — the inbox automation: **drafting** (the model writes the email, L163), **triage** (the model classifies and routes the inbox, L163), and **replies** (the model drafts the response, gated — L228). The discipline: the trigger is the email event (L220), the drafts are the AI's (L224), and the *sends* are the human's (L208) — the same HITL threshold (L208) applied to the business's voice (L228).

The distinction this lesson is built on: a **demo** has an auto-reply bot. A **solutions architect** designs the email workflows: the event trigger (L220), the triage contract (L163), the draft contract (L224), the approval gate (L228), and the compliance story (L312, L322).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the three patterns: drafting, triage, replies (L224)
- Design the triage workflow: classify and route (L163, L230)
- Design the reply gate: the draft is the AI's, the send is the human's (L228)
- Explain the compliance: the sent email is the business's voice (L312)
- Explain the audit: the sends are traced (L322)

## 1. One-Line Definition

**AI + email is the inbox automation — drafting (the model writes, L163), triage (the model classifies and routes, L163), and replies (the model drafts, gated by the human, L228) — triggered by the email event (L220), with the sent email treated as the business's voice (L312): the draft is the AI's, the send is the human's (L208), and every send is traced (L322).**

The one-sentence interview answer: *"AI + email is the inbox automation (L224). Three patterns. Drafting — the model writes the email (L163): a reply, a follow-up, a digest — with the tone and the contract (L143). Triage — the model classifies the inbox (L163): urgent, question, spam, newsletter — and routes (L230): urgent to the human, questions to the draft queue, spam to the trash (L224). Replies — the model drafts the response (L224), and the human approves before the send (L228). The rule: the draft is the AI's, the send is the human's (L208) — because a sent email is the business's voice (L312), and an unsanctioned send is a compliance issue (L312). The trigger is the email event (L220), and every send is traced (L322)."*

## 2. Mental Model

Think of the email AI as **the assistant at the mail desk.** The mail arrives (the email event, L220); the assistant sorts it (triage, L163): the urgent letter goes straight to the manager, the question goes to the draft pile, the junk goes to the bin (L230). For the questions, the assistant drafts the reply (L224) — but the manager *signs* every letter before it's mailed (L228): the assistant never mails on its own (L208). The signed letters are copied into the ledger (L322). The desk works because the assistant sorts and drafts, and the manager signs (L224).

```text
   the mail desk (the workflows, L217)     the manager (the human, L228)
   ┌──────────────────────────────┐        ┌──────────────────────────────┐
   │ triage: sort the inbox (L163) │        │ signs every send (L208, L228)│
   │ draft: write the replies (L224)│ ────► │ the ledger records it (L322) │
   └──────────────────────────────┘        └──────────────────────────────┘
```

The mental model is **the mail desk**: the AI sorts and drafts; the human signs the sends (L224).

## 3. Visual Flow — The Email Path

```text
   an email arrives (L220)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · TRIAGE (L163)                                        │
   │     classify: urgent · question · spam · newsletter      │
   │     route (L230): urgent → the human now, question →     │
   │     the draft queue, spam → the bin (L224)               │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · DRAFT (L163)                                         │
   │     the model writes the reply (L224) — the tone, the    │
   │     contract (L143) — from the context (L189)            │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE GATE (L228)                                      │
   │     the human approves, edits, or rejects (L208)         │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   the send + the audit (L322) — the sent email is the voice (L312)
```

The flow is the path: **triage → draft → gate → send** — the assistant's work with the manager's signature (L224).

## 4. How It Works — The Three Patterns

- **Drafting (L163).** The model writes the email: a reply (L224), a follow-up (L223), a digest (L221) — with a defined tone and contract (L143). The draft is a workflow step (L217) with a contract (L163).
- **Triage (L163, L230).** The model classifies the inbox: urgent, question, spam, newsletter (L163) — and routes (L230): urgent to the human's attention, questions to the draft queue, spam to the bin (L224). The triage is the inbox's sorting (L224).
- **Replies (L224, L228).** The model drafts the response (L224), and the human approves before the send (L228). The draft is the AI's; the send is the human's (L208).
- **The compliance (L312, L322).** The sent email is the business's voice (L312) — an unsanctioned send is a compliance issue (L312). The gate (L228) and the audit (L322) are the compliance story (L373).

> [!NOTE]
> **The sent email is the business's voice — the gate is the trust rule (L312, L228).** An AI that sends email is speaking *as the business* (L312): a wrong reply is a burned customer and a compliance issue (L312). The senior design gates every send (L228): the model drafts (L224), the human approves or edits (L208), and the send is recorded (L322). The drafts and the triage run free (L163); the *sends* wait for the human (L208) — the same HITL threshold (L208) as the CRM's follow-up (L223).

## 5. Real Project Usage

- **Support email triage (L163).** The inbox event (L220) → the triage workflow (L217): urgent to the queue, questions to the drafts (L230).
- **Reply drafting (L224).** The question email → the draft workflow (L224) → the human approves (L228) → the send (L227).
- **Daily digests (L221).** The scheduled job (L221) collects the overnight mail (L224), the model summarizes (L163), the digest is sent (L224).
- **Newsletter classification (L224).** The model bins the newsletters and the spam (L163) — the inbox's noise reduced (L230).
- **Anything the inbox does (L230).** The email workflows are the L230 platform's inbox integration (L224).

The through-line: **the inbox is sorted and drafted by the AI, and signed by the human** — the email path with the gate at every send (L224).

## 6. Interview Explanation

Say it in four moves:

1. **The three patterns.** "Drafting (L163), triage (L163), replies (L224)."
2. **The path.** "The email event (L220) → triage → draft → gate (L228)."
3. **The rule.** "The draft is the AI's; the send is the human's (L208)."
4. **The compliance.** "The sent email is the business's voice (L312) — gated (L228), traced (L322)."

## 7. Senior-Level Insights

- **The triage contract is the inbox's definition of urgency (L163).** The classification (L163) encodes what's urgent, what's a question, what's spam (L143) — written with the team (L229), tuned on the golden set (L343).
- **The draft's context is the reply's quality (L189).** The reply drafts (L224) from the context — the prior conversation, the account, the knowledge base (L189) — the RAG spine (L174) inside the email workflow (L224).
- **The gate is the voice's protection (L312).** The sent email is the business speaking (L312) — the gate (L228) and the edit path (L208) are what make the AI's drafts *usable* (L224).
- **The compliance is the audit's job (L322).** Every send traced (L322) — the sent email's record (L213) is the compliance story (L373).
- **The patterns compose with the platform (L230).** The email workflows (L224) are the L230 platform's integration (L230) — trigger (L220), queue (L222), gate (L228).

## 8. Common Mistakes

- **The auto-reply bot (L228).** The AI sending without the gate (L208) — the unsanctioned voice (L312).
- **No triage contract (L163).** The classification with no defined categories (L143) — the routing is vibes (L196).
- **Drafts without context (L189).** The reply written from nothing (L224) — the RAG spine (L174) skipped, the draft is generic (L196).
- **No audit (L322).** The sends untraced (L213) — the compliance story gone (L373).
- **The gate for everything (L151).** Even the digest gated (L228) — the threshold (L208) too wide, the human is the bottleneck (L151).
- **Spam in the workflows (L230).** The junk processed like a question (L163) — the triage's first job missed (L224).

## 9. Best Practices

- **Define the triage categories** (L163, L143) — urgent, question, spam, newsletter (L230).
- **Draft from the context** (L189) — the prior mail, the account, the KB (L174).
- **Gate the sends** (L228) — the draft is the AI's, the send is the human's (L208).
- **Trace the sends** (L322) — the business's voice is auditable (L312).
- **Tune the threshold** (L208) — internal drafts free, external sends gated (L228).
- **Bin the spam first** (L224) — the triage's first job (L163).

## 10. Interview Questions

**Q: How do you automate email with AI?**
> A: Three patterns (L224). Triage — the model classifies the inbox (L163): urgent, question, spam — and routes (L230). Drafting — the model writes the emails (L163): replies, digests, follow-ups — with a tone and a contract (L143). Replies — the model drafts the response (L224), and the human approves before the send (L228). The trigger is the email event (L220), and every send is traced (L322).

**Q: Why gate the AI's replies?**
> A: Because a sent email is the business's voice (L312). An unsanctioned send — a wrong reply, a wrong tone — is a burned customer and a compliance issue (L312). So the send is gated (L228): the model drafts (L224), the human approves or edits (L208), and only then does it go (L228). The drafts and the triage run free (L163); the sends wait for the human (L208).

**Q: How do you triage the inbox?**
> A: A classification workflow (L163): the email event (L220) triggers it, and the model sorts into the defined categories (L143) — urgent, question, spam, newsletter (L224). The routing (L230) follows the category: urgent to the human's queue, questions to the draft queue, spam to the bin (L224). The categories are the contract (L143) — written with the team, tuned on the golden set (L343).

**Q: How do you draft a good reply?**
> A: From the context (L189). The reply's quality is the context's quality: the prior conversation, the account's history, the knowledge base (L174). The draft workflow (L224) retrieves the context (L189), builds it into the prompt (L191), and the model drafts against the contract (L143). The RAG spine (L174) inside the email workflow (L224) — a draft without context is a generic draft (L196).

## 11. Follow-Up Questions

- What are the triage categories (L143)?
- How does the reply draft use RAG (L189)?
- What's the gate's threshold (L228)?
- How do you trace the sends (L322)?
- How do the email patterns compose with the platform (L230)?

## 12. Comparison Table — The Three Patterns

| | Triage (L163) | Drafting (L163) | Replies (L224, L228) |
|---|---|---|---|
| Trigger (L220) | email event | task / schedule (L221) | triaged question |
| The AI step | classify + route (L230) | write (L143) | draft (L224) |
| Gate (L228) | none | none | human approves (L208) |
| Context (L189) | the mail | the task | the conversation (L174) |
| Audit (L322) | the classification | the draft | the send |

The senior read: **the gate column is the voice's protection** — the internal work runs free, the external send waits (L228).

## 13. Code Example — The Email Workflow

```js
// AI + email: triage → draft → gate → send (L224, L228).
const TRIAGE_SCHEMA = { category: 'urgent | question | spam | newsletter', confidence: 'number' };  // L143

// TRIAGE (L163, L230) — the email event (L220) triggers the sort.
async function triageEmail(email) {
  const t = validate(model.classify(email, { schema: TRIAGE_SCHEMA }), TRIAGE_SCHEMA);  // L163
  if (t.category === 'spam') return bin(email);                    // the bin (L224)
  if (t.category === 'urgent') return enqueue('human-queue', email);   // the manager now (L230)
  return enqueue('draft-queue', email);                            // the draft pile (L224)
}

// DRAFT (L224, L189) — from the context, against the contract.
async function draftReply(email) {
  const context = await retrieve(`the conversation for ${email.threadId}`);  // L189
  const draft = model.write(email, { context, tone: 'support', schema: REPLY_SCHEMA });  // L163, L143
  return { email, draft };
}

// THE GATE (L228, L208) — the human signs the send.
async function sendReply({ email, draft }) {
  const decision = await humanApprove({ proposal: draft, context: email.subject });  // L228
  if (decision.kind === 'approve') {
    await emailApi.send(decision.content);                         // the human's send (L208)
    await audit.log({ action: 'send', thread: email.threadId, at: Date.now() });  // L322
  }
  if (decision.kind === 'edit') await sendReply({ email, draft: decision.changes });  // L208
}
```

```text
What the reader must SEE — the mail desk's path:

  triageEmail() → the categories + the routes (L163, L230)
  draftReply()  → the context (L189) + the contract (L143)
  sendReply()   → the GATE (L228) + the audit (L322)

  The AI sorts and drafts; the human signs the sends.
```

```narrate
4-10: Triage — the email event (L220) triggers the classification (L163); the category routes (L230): spam to the bin, urgent to the human, questions to the drafts (L224).
12-16: Draft — the reply is written from the retrieved context (L189) against the contract (L143, L163).
18-25: The gate — the human approves or edits (L208, L228); the send is recorded (L322).
```

> [!TIP]
> The line that protects the voice: **`if (decision.kind === 'approve') await emailApi.send(...)`** — the send only on the human's approval. **The draft is the AI's; the send is the human's — the business's voice is gated (L228).**

## 14. Performance Notes

- **The triage is a per-email model call (L150).** The classification (L163) is the token cost (L149) — batched (L222) and cached by the email hash (L171).
- **The draft's context is a retrieval cost (L189).** The RAG fetch (L189) per draft (L224) — the cache (L171) and the budget (L149) apply (L174).
- **The gate is the human's latency (L151).** The reply waits for the approval (L208) — the send's wall-clock includes the human's time (L228).
- **The audit is storage (L150).** The sends' trace (L322) is cheap and required (L373).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Unsanctioned sends | The gate missing (L228) | Add the approval (L208) |
| Bad routing | The triage contract vague (L163) | Define the categories (L143) |
| Generic replies | Drafts without context (L189) | Add the retrieval (L174) |
| No compliance trail | The sends untraced (L322) | Log every send (L213) |
| The human drowned | The threshold too wide (L208) | Free the internal work (L228) |

## 16. Quick Revision Notes

- AI + email = **drafting, triage, replies** (L224).
- Triage: **classify + route** (L163, L230).
- Drafting: **from the context** (L189), against the contract (L143).
- Replies: **the draft gated by the human** (L228, L208).
- The rule: **the sent email is the business's voice** (L312).
- The audit: **every send traced** (L322).

## 17. Cheat Sheet

```text
AI + EMAIL = the inbox automation — sorted, drafted, signed

THE THREE PATTERNS (L224)
  triage   classify the inbox (L163): urgent · question · spam
           route (L230): urgent → human · question → draft · spam → bin
  drafting the model writes (L163) — tone + contract (L143)
           from the context (L189) — the RAG spine (L174)
  replies  the model drafts (L224) — the HUMAN approves (L208, L228)

THE TRUST RULE (L312)
  a sent email is the business's voice (L312)
  the draft is the AI's · the send is the human's (L208)
  an unsanctioned send is a compliance issue (L312)

THE WORKFLOW SHAPE (L217, L230)
  email event (L220) → triage (L163) → draft (L224)
  → gate (L228) → send → audit (L322)

THE AUDIT (L322, L373)
  every send traced (L213) — the voice is auditable (L312)

INTERVIEW, 4 MOVES
  1 patterns "triage, drafting, replies (L224)"
  2 context  "the draft's quality is the context's (L189)"
  3 gate     "the human signs every send (L228)"
  4 compliance "the voice is traced (L322)"
```

## 18. Key Takeaways

> [!RECAP]
> - AI + email is **the inbox automation** (L224): triage (L163), drafting (L163), and replies (L224) — each a workflow (L217)
> - **Triage classifies and routes** (L163, L230): the defined categories (L143) send urgent to the human, questions to the drafts, spam to the bin (L224)
> - **Drafts are written from the context** (L189) — the RAG spine (L174) inside the email workflow, against the contract (L143)
> - **The reply is gated** (L228): the draft is the AI's, the send is the human's (L208)
> - **The sent email is the business's voice** (L312) — an unsanctioned send is a compliance issue (L312), so the gate (L228) and the audit (L322) are the compliance story (L373)
> - The email patterns are **the L230 platform's inbox integration** (L224, L230) — trigger (L220), queue (L222), gate (L228)

## Check your understanding

Answer these without looking back.

1. What are the three email patterns (L224)?
2. What are the triage categories (L143)?
3. Why draft from the context (L189)?
4. Why is the reply gated (L228)?
5. What's the trust rule (L312)?
6. What does the audit record (L322)?
7. How does the RAG spine fit the draft (L174)?
8. What's the workflow shape (L217)?

## A Closing Note — The Mail Desk, Signed at Every Send

You now hold the inbox automation: **the triage that sorts, the drafts that come from context, and the human's signature on every send — with the voice protected and traced.** The business's email now has an assistant — and the manager signs the mail (L224).

Next: the channels — AI + Slack / messaging (L225), bots that act, and the permission boundary.
