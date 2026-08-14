# Lesson 225 — AI + Slack / Messaging

**Interview importance:** ⭐⭐⭐⭐ — "how do AI bots work in Slack?" — the answer is *bots that act on channels* — and the permission boundary: what the bot may read, do, and say (L315, L228).**

L224's inbox continues into the channels: **AI + Slack / messaging** — bots that live where the team works: **answering** (the bot retrieves and answers, L189), **acting** (the bot runs the workflows, L217), and **notifying** (the bot posts the digests and alerts, L221). The discipline is the **permission boundary**: what the bot may read (the channels it sees, L315), what it may do (the workflows it may trigger, L212), and what it may say (the posts it may make, gated — L228).

The distinction this lesson is built on: a **demo** lets the bot into every channel with every permission. A **solutions architect** scopes the bot: the channel scope (L315), the action authority (L212), and the post gates (L228) — because a bot in the channel is a presence in the company's conversation (L225).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the three bot jobs: answering, acting, notifying (L225)
- Design the permission boundary: channels, actions, posts (L315, L212)
- Explain the answer path: the bot retrieves and answers (L189)
- Explain the action gate: the bot proposes, the human approves (L208, L228)
- Explain the notification path: the digests and alerts (L221)

## 1. One-Line Definition

**AI + Slack / messaging is the bot in the channel — answering (the bot retrieves and answers, L189), acting (the bot runs the workflows, L217), and notifying (the bot posts the digests and alerts, L221) — scoped by the permission boundary: the channels it sees (L315), the actions it may take (L212), and the posts it may make, gated (L228) — because a bot in the channel is a presence in the company's conversation (L225).**

The one-sentence interview answer: *"AI + Slack is the bot in the channel (L225). Three jobs. Answering — the bot retrieves and answers (L189): 'how do we refund?' the bot fetches the policy (L174) and replies with the source (L192). Acting — the bot runs the workflows (L217): a slash command starts a workflow (L220), and consequential actions are approval-gated (L208, L228). Notifying — the bot posts the digests (L221) and the alerts (L232) to the right channels (L225). The permission boundary is the design (L315): the channels the bot sees (L315), the actions it may take (L212), and the posts it may make — the notifications run free, the consequential posts wait for approval (L228). A bot in the channel is a presence in the company's conversation — scoped, gated, and traced (L225)."*

## 2. Mental Model

Think of the Slack bot as **a helpful colleague with a badge that limits what it can access.** The badge (the permission boundary, L315) says: this colleague may enter these rooms (the channels, L315), may use these tools (the workflows, L212), and may post in these channels — but the consequential posts need a manager's OK (L228). The colleague answers questions from the knowledge base (L189), runs the approved workflows (L217), and posts the daily digest (L221). The office works because the badge is scoped — the colleague is helpful without being omnipresent or omnipotent (L225).

```text
   the badge (L315)                     the colleague (the bot, L225)
   ┌────────────────────────┐           ┌──────────────────────────────┐
   │ rooms: #support, #ops  │           │ answers from the KB (L189)    │
   │ tools: refund workflow  │  ──────► │ runs the approved workflows   │
   │ posts: gated (L228)    │           │ (L217) · posts the digest (L221)│
   └────────────────────────┘           └──────────────────────────────┘
```

The mental model is **the badged colleague**: scoped to the rooms, the tools, and the posts it's allowed — helpful within the boundary (L225).

## 3. Visual Flow — The Bot's Paths

```text
   the three jobs (L225)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · ANSWER (L189)                                        │
   │     the mention → the bot retrieves (L189), answers      │
   │     from the knowledge base (L174), cites the source     │
   │     (L192) — read-only, no gate                          │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · ACT (L217, L228)                                     │
   │     the slash command → the workflow (L217)              │
   │     consequential actions → the human gate (L208, L228)  │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · NOTIFY (L221)                                        │
   │     the digest (L221) and the alerts (L232) → the right  │
   │     channels — the scheduled posts (L225)                │
   └──────────────────────────────────────────────────────────┘
```

The flow is the three paths: **answer (free), act (gated), notify (scheduled)** — each scoped by the badge (L225).

## 4. How It Works — The Three Jobs and the Boundary

- **Answering (L189).** The bot retrieves and answers: the mention (L220) triggers the retrieval (L189), the answer comes from the knowledge base (L174) with the source cited (L192). Read-only, no gate — the bot's most common job (L225).
- **Acting (L217, L228).** The bot runs the workflows: a slash command (L220) starts a workflow (L217). Consequential actions — the refund, the publish — are approval-gated (L208): the bot proposes, the human approves (L228).
- **Notifying (L221, L225).** The bot posts the scheduled work: the digest (L221), the alerts (L232) — to the right channels (L225). The notifications run free; the consequential posts wait (L228).
- **The permission boundary (L315, L212).** The bot's badge: the channels it sees (L315), the workflows it may trigger (L212), and the posts it may make — the boundary is the design (L225). The trace records the bot's actions (L213, L322).

> [!NOTE]
> **The bot's badge is the permission boundary — scoped like any agent's (L315, L212).** A bot in every channel with every permission is a data leak (L312) and an agency failure (L212) waiting: it reads conversations it shouldn't (L315), triggers workflows it shouldn't (L212), and posts without the gate (L228). The senior design scopes the badge (L315): the channels the bot joins, the actions its commands may trigger (L212), and the posts gated by consequence (L228) — the same least-privilege discipline (L315) as the L212 authority boundary, applied to the company's conversation (L225).

## 5. Real Project Usage

- **Support channels (L189).** The #support channel's bot answers from the KB (L174), cites the source (L192), and escalates the hard cases to the humans (L208).
- **Ops channels (L217).** A slash command starts the deploy workflow (L217) — the deploy is approval-gated (L228).
- **Digest channels (L221).** The scheduled digest (L221) posts the overnight summary (L224) to #daily (L225).
- **Alert channels (L232).** The failure alerts (L232) post to #alerts with the trace (L213).
- **Anything the team does (L230).** The bot is the L230 platform's presence in the channels (L225) — scoped, gated, traced (L230).

The through-line: **the bot is the platform's presence in the conversation** — answering free, acting gated, notifying scheduled, all within the badge (L225).

## 6. Interview Explanation

Say it in four moves:

1. **The three jobs.** "Answering (L189), acting (L217), notifying (L221)."
2. **The boundary.** "The badge: the channels (L315), the actions (L212), the posts (L228)."
3. **The gates.** "Answers run free (L189); consequential actions and posts wait for the human (L208)."
4. **The presence.** "A bot in the channel is a presence in the conversation — scoped, gated, traced (L225)."

## 7. Senior-Level Insights

- **The badge is the least-privilege discipline (L315).** The senior answer scopes the bot like any agent (L212): the channels (L315), the commands' authority (L212), the post gates (L228) — the L315 discipline applied to the conversation (L225).
- **The answers are a RAG presence (L189).** The bot's answers (L189) are the RAG spine (L174) in the channel — the retrieval (L189), the citations (L192), and the failure modes (L196) all apply (L225).
- **The action gates are the HITL threshold (L208).** The bot proposes (L201); the consequential actions wait for the human (L208, L228) — the same threshold as the CRM (L223) and the email (L224) (L225).
- **The notifications are the scheduled path (L221).** The digests (L221) and the alerts (L232) are the schedule's posts (L225) — the L221 trigger in the channel (L230).
- **The trace is the bot's record (L213).** Every answer, action, and post is traced (L213) — the audit (L322) of the bot's presence (L225).

## 8. Common Mistakes

- **The bot everywhere (L315).** Every channel, every permission (L212) — the data leak (L312) and the agency failure (L212).
- **The bot acting ungated (L228).** The slash command triggers the consequential workflow with no approval (L208) — the refund runs unattended (L212).
- **Answers without sources (L192).** The bot's replies uncited (L192) — the hallucination in the channel (L196).
- **No trace (L213).** The bot's actions invisible (L322) — the presence unaccountable (L225).
- **The bot as a chat (L230).** The whole channel piped into a prompt (L149) — the workflows (L217) and the boundary (L315) skipped (L225).
- **Notifications everywhere (L225).** Every digest to every channel (L221) — the noise (L225) that drowns the alerts (L232).

## 9. Best Practices

- **Scope the badge** (L315) — the channels (L315), the actions (L212), the posts (L228).
- **Answer from the KB with citations** (L189, L192) — the RAG spine (L174) in the channel.
- **Gate the consequential actions** (L228) — the bot proposes, the human approves (L208).
- **Route the notifications** (L225) — the digests (L221) and the alerts (L232) to the right channels.
- **Trace every action** (L213) — the bot's presence is auditable (L322).
- **Escalate the hard cases** (L208) — the bot knows when to hand off (L225).

## 10. Interview Questions

**Q: How do AI bots work in Slack?**
> A: Three jobs (L225). Answering — the bot retrieves and answers (L189): the mention (L220) triggers the retrieval, and the answer comes from the KB (L174) with the source cited (L192). Acting — the bot runs the workflows (L217): the slash command starts one (L220), and the consequential actions are approval-gated (L208, L228). Notifying — the bot posts the digests (L221) and the alerts (L232) to the right channels (L225).

**Q: What's the permission boundary?**
> A: The bot's badge (L315): the channels it may see (L315), the workflows its commands may trigger (L212), and the posts it may make — the consequential ones gated (L228). A bot in every channel with every permission is a data leak (L312) and an agency failure (L212). The boundary is the least-privilege discipline (L315) applied to the conversation (L225).

**Q: Which bot actions are gated?**
> A: The consequential ones (L228): a refund, a publish, a deploy — the actions with real effects (L212). The bot proposes (L201), the human approves in the channel (L208). The answers (L189) and the routine notifications (L221) run free; the consequential acts and posts wait (L228) — the same HITL threshold as the CRM (L223) and the email (L224).

**Q: How do you keep the bot's answers grounded?**
> A: The RAG spine in the channel (L174). The bot retrieves (L189), builds the context (L191), and answers with citations (L192) — the same retrieval quality levers (L190) and the same failure modes (L196) as any RAG system. An answer without a source is a hallucination in the channel (L196) — the citations are the bot's trust (L225).

## 11. Follow-Up Questions

- How do you scope the bot's channels (L315)?
- What's the action gate (L228)?
- How do the answers use RAG (L189)?
- How do the notifications route (L221)?
- What does the trace record (L213)?

## 12. Comparison Table — The Three Jobs

| | Answer (L189) | Act (L217, L228) | Notify (L221) |
|---|---|---|---|
| Trigger (L220) | the mention | the slash command | the schedule (L221) |
| The bot does | retrieves + answers (L174) | runs the workflow (L217) | posts the digest/alert (L225) |
| Gate (L228) | none | consequential gated (L208) | posts gated by consequence |
| Citations (L192) | required | the workflow's output | the alert's trace (L213) |
| Audit (L322) | the answer | the action | the post |

The senior read: **the gate column is the boundary** — the reads and the routine run free; the acts and the consequential posts wait (L228).

## 13. Code Example — The Badged Bot

```js
// The Slack bot: the badge, the three jobs (L225, L315, L228).
const BADGE = {                                // the permission boundary (L315)
  channels: ['#support', '#ops'],              // what it may see (L315)
  commands: ['refund', 'digest'],              // what it may trigger (L212)
  gatedCommands: ['refund'],                   // the consequential ones (L228)
};

// 1 · ANSWER (L189) — the mention, retrieved and cited (L174, L192).
async function onMention(event, ctx) {
  if (!BADGE.channels.includes(event.channel)) return;   // the badge (L315)
  const chunks = await retrieve(event.text);             // L189
  return reply(event, `${answerFrom(chunks)}\n— [source] (L192)`);
}

// 2 · ACT (L217, L228) — the command, gated if consequential (L208).
async function onCommand(event, ctx) {
  if (!BADGE.commands.includes(event.command)) return;   // the badge (L212)
  if (BADGE.gatedCommands.includes(event.command)) {
    const approved = await approveInChannel(event);      // THE GATE (L228)
    if (!approved.ok) return reply(event, 'denied');
  }
  const result = await runWorkflow(event.command);       // L217
  await trace.log({ action: event.command, at: Date.now() });   // L213
  return reply(event, result);
}

// 3 · NOTIFY (L221, L225) — the scheduled posts.
async function onSchedule(job) {                         // L221
  if (!BADGE.channels.includes(job.channel)) return;     // the badge (L315)
  await post(job.channel, job.content);                  // the digest / alert (L225)
}
```

```text
What the reader must SEE — the badge and the three jobs:

  BADGE.channels / commands → the permission boundary (L315, L212)
  onMention()               → the RAG answer with the citation (L189, L192)
  onCommand()               → the workflow, gated if consequential (L228)
  onSchedule()              → the digest and the alert (L221, L225)

  Scoped, gated, traced — the presence in the conversation.
```

```narrate
3-6: The badge — the permission boundary: the channels, the commands, and the gated ones (L315, L212, L228).
9-12: The answer — the mention is answered from the retrieval (L189) with the citation (L192), inside the badge's channels (L315).
14-21: The action — the command runs the workflow (L217), gated when consequential (L208, L228), and traced (L213).
23-26: The notification — the scheduled digest and alert post to the badge's channels (L221, L225).
```

> [!TIP]
> The pair that defines the bot's safety: **`BADGE.gatedCommands`** (the boundary, L315) and **`approveInChannel(event)`** (the gate, L228). **The bot is scoped by its badge and gated at the consequential — a presence, not a loose cannon (L225).**

## 14. Performance Notes

- **The answers are the retrieval cost (L189).** The bot's answers (L189) hit the RAG spine (L174) — the cache (L171) and the budget (L149) apply (L225).
- **The actions are the workflow cost (L217).** The commands run the workflows (L217) on the queue (L222) — never in the Slack handler (L222).
- **The gate is the human's latency (L151).** The consequential action waits for the approval (L208) — the in-channel decision (L228).
- **The trace is the audit (L213).** The bot's actions are logged (L213) — the presence's record (L322).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The bot reads everything | The badge too wide (L315) | Scope the channels (L212) |
| Unapproved actions | The gate missing (L228) | Gate the consequential commands (L208) |
| Hallucinated answers | No citations (L192) | The RAG spine + the sources (L189) |
| Alert noise | Notifications everywhere (L225) | Route by channel (L221) |
| No audit | Actions untraced (L322) | Log every action (L213) |

## 16. Quick Revision Notes

- AI + Slack = **the bot in the channel** (L225): answering, acting, notifying.
- The badge: **channels (L315), actions (L212), posts (L228)**.
- Answers: **retrieved and cited** (L189, L192) — the RAG spine (L174).
- Actions: **gated when consequential** (L208, L228).
- Notifications: **scheduled, routed** (L221, L225).
- The presence: **scoped, gated, traced** (L225, L322).

## 17. Cheat Sheet

```text
AI + SLACK = the bot in the channel — scoped, gated, traced

THE THREE JOBS (L225)
  answer   the mention → retrieve (L189) → answer with the
           citation (L192) — the RAG spine (L174) — free (no gate)
  act      the slash command → the workflow (L217)
           consequential → the human gate (L208, L228)
  notify   the digest (L221) and the alert (L232) → the right
           channels (L225) — scheduled (L221)

THE BADGE (L315, L212)
  the channels it sees (L315) · the actions it may take (L212)
  the posts it may make — consequential gated (L228)
  a bot everywhere is a leak (L312) and an agency failure (L212)

THE RULES
  answers and routine notifications run free (L189)
  the acts and the consequential posts wait for the human (L228)
  every action is traced (L213) — the audit (L322)

INTERVIEW, 4 MOVES
  1 jobs    "answer, act, notify (L225)"
  2 badge   "channels, actions, posts — scoped (L315)"
  3 gates   "the consequential waits for the human (L228)"
  4 record  "the presence is traced (L213, L322)"
```

## 18. Key Takeaways

> [!RECAP]
> - AI + Slack is **the bot in the channel** (L225): answering (L189), acting (L217), and notifying (L221) — the L230 platform's presence in the conversation
> - **The badge is the permission boundary** (L315): the channels the bot sees (L315), the workflows its commands trigger (L212), and the posts it may make — the least-privilege discipline (L315) applied to the company's conversation
> - **Answers are the RAG spine in the channel** (L189) — retrieved (L189), cited (L192), with the same failure modes (L196) as any RAG system
> - **Consequential actions and posts are gated** (L208, L228) — the bot proposes, the human approves in the channel
> - **Notifications are the scheduled path** (L221) — the digests (L221) and the alerts (L232) routed to the right channels (L225)
> - The bot's presence is **scoped, gated, and traced** (L225) — every action logged (L213) for the audit (L322)

## Check your understanding

Answer these without looking back.

1. What are the bot's three jobs (L225)?
2. What's in the badge (L315)?
3. How do the answers stay grounded (L189)?
4. Which actions are gated (L228)?
5. What routes the notifications (L221)?
6. Why is a bot everywhere a leak (L312)?
7. What does the trace record (L213)?
8. How does the bot know when to hand off (L208)?

## A Closing Note — The Badged Colleague in the Channel

You now hold the channel presence: **the bot that answers from the knowledge base, acts through gated workflows, and posts the scheduled digests — scoped by its badge, gated at the consequential, and traced for the audit.** The company's conversation now has a helpful colleague — with the right badge (L225).

Next: the source of truth — AI + databases (L226), text-to-SQL done safely.
