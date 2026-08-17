# Lesson 277 — Step Functions

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you run a long AI workflow on AWS?" — the answer is *Step Functions*: the state machine — the steps, the waits, the retries, and the human approval (L277).**

L222 built the background workflows (L222) and L208 the human approval (L208); this lesson is **their AWS implementation**: Step Functions — the state machine: the steps (the states: the tasks, the choices, the waits, L277), the workflow (the orchestration, L277), the retries (the built-in backoff, L256), and the human approval (the wait-for-callback, L208). The AI platform's shape: the multi-step workflows (L217) — the ingestion (L280), the retraining (L365), the approval-gated actions (L208) — run as state machines (L277). This lesson is the L222 workflow engine, AWS-shaped (L277).

The distinction this lesson is built on: a **demo** chains the calls in code. A **solutions architect** orchestrates them as a state machine (L277): the steps, the waits, the retries, and the human-in-the-loop (L208) — because the long AI workflows (L217) need the state (L277).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the state machine: the steps and the transitions (L277)
- Explain the states: the task, the choice, the wait (L277)
- Explain the retries: the built-in backoff (L256)
- Explain the human approval: the wait-for-callback (L208)
- Explain the AI shape: the long AI workflows as state machines (L277)

## 1. One-Line Definition

**Step Functions is the AWS state machine for the long AI workflows (L277) — the steps (the states: the task — the Lambda L266 or the ECS L271; the choice — the branching; the wait — the delay, L277), the orchestration (the workflow's shape: the sequential, the parallel, the conditional, L277), the retries (the built-in backoff with the jitter, L256), and the human approval (the wait-for-callback: the workflow pauses until the human responds, L208) — the L222 workflow engine, AWS-shaped (L277).**

The one-sentence interview answer: *"Step Functions is AWS's workflow orchestration (L277). The model: the state machine — a JSON definition of the steps (L277): the task states call the Lambda (L266) or the ECS (L271); the choice states branch on the conditions (L277); the wait states delay (L277); and the parallel states fan out (L277). The workflow runs with the state (L277): the execution (L277) tracks where it is, what it has, and what failed (L277) — the resume (L277) and the retries (L256) are built in (L277). The retries: the per-state backoff with the jitter and the max attempts (L256) — the transient failures (L168) absorbed (L277). The human approval: the wait-for-callback (L208) — the workflow pauses, publishes the approval task, and waits for the callback (L277) — the L208 human-in-the-loop (L208), AWS-shaped (L277). The AI shape: the RAG ingestion (L280) — the parse, the chunk, the embed, the index — as a state machine (L277); the retraining (L365) — the data prep, the training, the eval, the deploy (L307) — as a state machine (L277); and the approval-gated actions (L208) — the workflow pauses for the human (L277). The L222 workflow engine, AWS-shaped (L277)."*

## 2. Mental Model

Think of Step Functions as **the assembly line with the foreman.** The line (the workflow, L277) has the stations (the states, L277): the task stations (the Lambda, L266), the sorting stations (the choices, L277), the waiting bays (the waits, L277), and the parallel tracks (L277). The foreman (the execution, L277) knows exactly where each item is (the state, L277) — the line never loses an item (L277). When a station jams (the failure, L168), the foreman retries it with the backoff (L256) and, if it keeps jamming, diverts it (the catch, L277). And the special station (the human approval, L208): the item waits on the shelf until the supervisor signs off (the callback, L277) — then the line continues (L208). The line works because the foreman tracks everything, the stations are defined, and the supervisor's pause is built in (L277).

```text
   the assembly line (Step Functions, L277)
   ┌────────────────────────────────────────────────────────┐
   │ the stations (the states, L277) — the task (L266), the │
   │ choice, the wait, the parallel (L277)                  │
   │ the foreman (the execution, L277) — the state, the     │
   │ retries (L256), the resume (L277)                      │
   │ the supervisor (the approval, L208) — the pause, the   │
   │ callback (L277)                                        │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the line**: the stations, the foreman, and the supervisor (L277).

## 3. Visual Flow — The Ingestion Workflow

```text
   the new document (L265)
        │  the S3 event (L276)
        ▼
   ┌────────────────────── THE STATE MACHINE (L277) ───────────────────┐
   │  1 · the task: parse the document (L266, L177)                   │
   │  2 · the choice: the document valid? (L277)                      │
   │      │ yes                                                       │
   │      ▼                                                           │
   │  3 · the parallel: chunk + embed (L277, L179, L181)              │
   │  4 · the task: index the vectors (L183)                          │
   │  5 · the task: notify the completion (L248)                      │
   │  the retries (L256): each task, the backoff (L277)               │
   │  the approval (L208): the publish step waits for the human (L277)│
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the workflow's shape: **task → choice → parallel → task → notify**, with the retries and the approval (L277).

## 4. How It Works — The Machine, Part by Part

- **The states (L277).** The steps (L277): the task — calls the Lambda (L266) or the ECS (L271); the choice — branches on the conditions (L277); the wait — delays (L277); the parallel — fans out (L277); the pass — transforms the data (L277). The definition is the workflow's JSON (L277).
- **The execution (L277).** The running instance (L277): the state (L277) — where it is, what it has — is tracked (L277); the execution (L277) can be inspected (L274), stopped, and resumed (L277).
- **The retries (L256).** The per-state error handling (L256): the retry — the backoff with the jitter and the max attempts (L256); the catch — the fallback state (L277). The transient failures (L168) are absorbed (L277).
- **The human approval (L208).** The wait-for-callback (L277): the workflow publishes the approval task (L228) and pauses (L277); the human responds (L208), and the callback (L277) resumes the workflow (L277).
- **The integration (L277).** The direct service integrations (L277): the DynamoDB, the SQS (L270), the SNS (L270), the Bedrock (L278) — the states call the services without the Lambda (L277).

> [!NOTE]
> **The state machine is the workflow's state (L277).** The senior answer contrasts the Lambda chain (L266) with the state machine (L277): the chain's state lives in the caller's memory — a failure loses it (L266); the state machine's state lives in the execution (L277) — a failure retries (L256) and resumes (L277) from where it stopped (L277). The long AI workflows (L217) get the state (L277): the ingestion (L280), the retraining (L365), and the approvals (L208) run as executions (L277).

## 5. Real Project Usage

- **A RAG ingestion (L280).** The document → the parse, the chunk, the embed, the index (L277) — the state machine (L277) tracks each document (L280).
- **A retraining pipeline (L365).** The data prep, the training (L264), the eval (L341), the deploy (L307) — as a state machine (L277) with the approval gate (L208).
- **An approval-gated action (L208).** The publish step (L277) waits for the human's callback (L208) — the L228 approval workflow (L228), AWS-shaped (L277).
- **A multi-step generation (L217).** The outline → the draft → the review → the publish (L277) — the L217 workflow (L217) as a machine (L277).
- **Anything long-running (L222).** The L222 background workflows (L222) — the state machine (L277) is the stateful shape (L277).

The through-line: **the state machine is the workflow's home** — the steps tracked, the failures retried, the approvals built in (L277).

## 6. Interview Explanation

Say it in four moves:

1. **The machine.** "The JSON definition of the steps — the task, the choice, the wait, the parallel (L277)."
2. **The execution.** "The running instance with the state — inspectable, resumable (L277)."
3. **The retries.** "The per-state backoff with the jitter (L256) — the transient failures absorbed (L168)."
4. **The approval.** "The wait-for-callback (L208) — the workflow pauses for the human (L277)."

## 7. Senior-Level Insights

- **The state machine is the workflow's state (L277).** The senior answer gives the long workflows the state (L277): the execution (L277) tracks the progress — the failure retries (L256) and resumes (L277) from where it stopped (L277).
- **The retries are per-state (L256).** The backoff with the jitter and the max attempts (L256) on each task (L277) — the L256 discipline (L256), workflow-shaped (L277).
- **The approval is the L208 control (L208).** The wait-for-callback (L277) — the L208 human-in-the-loop (L208) and the L324 security control (L324), AWS-shaped (L277).
- **The direct integrations remove the glue (L277).** The states call the Bedrock (L278) and the SQS (L270) directly (L277) — fewer Lambdas (L266), less glue (L277).
- **The execution is the audit's record (L322).** The executions (L277) — the history (L277) of each workflow (L322) — the L322 audit (L322), workflow-shaped (L277).

## 8. Common Mistakes

- **The chain in the Lambda (L266).** The multi-step workflow in one function (L266) — the state (L277) lost on the failure (L266).
- **The retries missing (L256).** The task without the retry (L277) — the transient failure (L168) fails the workflow (L277).
- **The approval skipped (L208).** The high-risk action (L324) without the human (L208) — the L324 control (L324) lost.
- **The step too big (L277).** The whole workflow in one task (L277) — the granularity (L277) and the retries (L256) lost.
- **The execution's history unbounded (L285).** The long history (L277) — the retention (L277) is the cost (L285).

## 9. Best Practices

- **Model the workflow as the machine** (L277) — the states, the transitions (L277).
- **Retry per state** (L256) — the backoff with the jitter (L277).
- **Gate the high-risk steps** (L208) — the wait-for-callback (L277), the L324 control (L324).
- **Use the direct integrations** (L277) — the Bedrock (L278), the SQS (L270) without the glue (L277).
- **Keep the steps small** (L277) — the granularity (L277) is the retries' (L256).

## 10. Interview Questions

**Q: Walk me through Step Functions.**
> A: The state machine (L277). The states — the task, the choice, the wait, the parallel (L277). The execution — the running instance with the tracked state (L277). The retries — the per-state backoff with the jitter (L256). And the human approval — the wait-for-callback (L208).

**Q: How do you run a long AI workflow?**
> A: As a state machine (L277): the ingestion (L280) — the parse, the chunk, the embed, the index — as the states (L277); the retraining (L365) — the prep, the training, the eval, the deploy (L307) — as the states (L277). The execution (L277) tracks the progress, the retries (L256) absorb the transient failures, and the approvals (L208) gate the high-risk steps (L277).

**Q: What's the wait-for-callback?**
> A: The human approval (L208): the workflow pauses at the approval state (L277), publishes the task (L228), and waits for the callback (L277) — the human reviews (L208), the callback (L277) resumes the workflow (L277). The L208 human-in-the-loop, AWS-shaped (L277).

**Q: Why a state machine and not a Lambda chain?**
> A: The state (L277). The chain's state lives in the caller's memory — the failure loses it (L266). The state machine's state lives in the execution (L277) — the failure retries (L256) and resumes from where it stopped (L277). The long workflows (L217) get the state (L277).

## 11. Follow-Up Questions

- What are the states (L277)?
- What's the execution (L277)?
- What's the retry (L256)?
- What's the wait-for-callback (L208)?
- Why a state machine and not a Lambda chain (L277)?

## 12. Comparison Table — The Chain vs the Machine

| | The Lambda chain (L266) | The state machine (L277) |
|---|---|---|
| State (L277) | the caller's memory (L266) | the execution (L277) |
| Failure (L277) | the workflow lost (L266) | the retry (L256) + the resume (L277) |
| Approval (L208) | hand-rolled (L208) | the wait-for-callback (L277) |
| Observability (L274) | the logs (L274) | the execution's history (L277) |
| Use (L277) | the request handlers (L266) | the long workflows (L217) |

The senior read: **the chain for the requests, the machine for the workflows** (L277).

## 13. Code Example — The Ingestion Machine

```js
// The ingestion workflow (L277) — the state machine, defined (L277).
const ingestion = {
  StartAt: 'ParseDocument',
  States: {
    // 1 · THE TASK (L277) — the Lambda call (L266).
    ParseDocument: {
      Type: 'Task',
      Resource: parseLambda,                    // the parse (L177)
      Next: 'IsValid',
      Retry: [{                                 // the backoff (L256)
        ErrorEquals: ['States.TaskFailed'],
        IntervalSeconds: 2,                     // the wait (L256)
        BackoffRate: 2,                         // the backoff (L256)
        MaxAttempts: 3,                         // the bound (L256)
      }],
    },

    // 2 · THE CHOICE (L277) — the branching (L277).
    IsValid: {
      Type: 'Choice',
      Choices: [{ Variable: '$.valid', BooleanEquals: true, Next: 'ChunkAndEmbed' }],
      Default: 'NotifyFailure',
    },

    // 3 · THE PARALLEL (L277) — the chunk and the embed (L179, L181).
    ChunkAndEmbed: {
      Type: 'Parallel',
      Branches: [{ StartAt: 'Chunk', States: { /* ... */ } },
                 { StartAt: 'Embed', States: { /* ... */ } }],
      Next: 'IndexVectors',
    },

    // 4 · THE APPROVAL (L208) — the human gate (L277).
    Publish: {
      Type: 'Task',
      Resource: publishApprovalTask,            // the task (L228)
      TimeoutSeconds: 86400,                    // the wait for the callback (L208)
      Next: 'NotifyCompletion',
    },
  },
};
```

```text
What the reader must SEE — the machine, defined:

  Task: ParseDocument     → the parse Lambda (L177, L266)
  Retry: 2s × 2, 3 tries  → the backoff (L256)
  Choice: valid?          → the branching (L277)
  Parallel: chunk + embed → the fan-out (L179, L181)
  Publish + 86400s        → the human approval, the wait-for-callback (L208)

  The steps tracked, the failures retried, the approvals built in (L277).
```

```narrate
5-18: The task — the parse Lambda with the retry: the backoff, the backoff rate, and the max attempts (L266, L256).
20-23: The choice — the branching on the document's validity (L277).
25-29: The parallel — the chunk and the embed branches (L179, L181).
31-37: The approval — the publish task waits for the human's callback (L208, L277).
```

> [!TIP]
> The pair that defines Step Functions: **the per-state retry** (the backoff, L256) and **the wait-for-callback approval** (the human gate, L208). **Retry the tasks, gate the approvals, track the state — the L222 engine, AWS-shaped (L277).**

## 14. Performance Notes

- **The execution is the workflow's latency (L277).** The long workflows (L217) run as the executions (L277) — the request path (L151) untouched (L222).
- **The retries are the failure's cost (L256).** The backoff (L256) — the transient failures (L168) absorbed without the manual restart (L277).
- **The parallel is the workflow's speed (L277).** The parallel states (L277) — the chunk and the embed (L179, L181) in parallel (L277).
- **The history is the storage's cost (L285).** The executions' history (L277) — the retention (L277) is the bill's line (L285).

## 15. Debugging Scenarios

| Symptom | First check (L277) | The lever |
|---|---|---|
| The workflow fails mid-way | The execution's history (L277) | The failing state (L277) |
| The transient failure kills the run | The retry (L256) | The per-state backoff (L277) |
| The approval never resumes | The callback (L208) | The wait-for-callback (L277) |
| The workflow is slow | The steps (L277) | The parallel branches (L277) |
| The cost is high | The history (L285) | The retention (L277) |

## 16. Quick Revision Notes

- Step Functions = **the AWS state machine** (L277): the states, the execution, the retries, the approval.
- The states: **the task, the choice, the wait, the parallel** (L277).
- The execution: **the running instance with the tracked state** (L277).
- The retries: **the per-state backoff with the jitter (L256)**.
- The approval: **the wait-for-callback (L208) — the human in the loop**.

## 17. Cheat Sheet

```text
STEP FUNCTIONS = the AWS state machine for the long AI workflows

THE STATES (L277)
  the task — the Lambda (L266) / the ECS (L271)
  the choice — the branching · the wait — the delay
  the parallel — the fan-out · the pass — the transform

THE EXECUTION (L277)
  the running instance — the state tracked (L277)
  inspectable (L274) · resumable (L277) · the history (L322)

THE RETRIES (L256)
  the per-state backoff with the jitter (L256)
  the max attempts (L256) · the catch — the fallback (L277)

THE APPROVAL (L208)
  the wait-for-callback (L277) — the workflow pauses (L208)
  the human reviews (L208) · the callback resumes (L277)

THE AI SHAPE (L277)
  the RAG ingestion (L280) — parse, chunk, embed, index
  the retraining (L365) — prep, train, eval, deploy (L307)
  the approval-gated actions (L208) — the L324 control (L324)

INTERVIEW, 4 MOVES
  1 machine  "the JSON definition of the steps (L277)"
  2 execution "the state tracked, resumable (L277)"
  3 retries  "the per-state backoff (L256)"
  4 approval "the wait-for-callback (L208)"
```

## 18. Key Takeaways

> [!RECAP]
> - Step Functions is **the AWS state machine for the long AI workflows** (L277): the states (L277), the execution (L277), the retries (L256), and the human approval (L208)
> - **The states** (L277) are the steps — the task (the Lambda L266 or the ECS L271), the choice, the wait, and the parallel (L277)
> - **The execution** (L277) is the running instance with the tracked state — inspectable (L274) and resumable (L277)
> - **The retries** (L256) are per-state — the backoff with the jitter and the max attempts (L256), with the catch for the fallback (L277)
> - **The human approval** (L208) is the wait-for-callback (L277) — the workflow pauses, the human reviews (L208), and the callback resumes (L277) — the L324 control (L324), AWS-shaped (L277)
> - The AI shape (L277): the RAG ingestion (L280), the retraining pipeline (L365), and the approval-gated actions (L208) run as state machines (L277) — the L222 workflow engine, AWS-shaped (L277)

## Check your understanding

Answer these without looking back.

1. What are the states (L277)?
2. What's the execution (L277)?
3. What's the retry (L256)?
4. What's the wait-for-callback (L208)?
5. Why a state machine and not a Lambda chain (L277)?
6. What are the direct integrations (L277)?
7. What's the L324 control, AWS-shaped (L324)?
8. What is the L222 engine, AWS-shaped (L277)?

## A Closing Note — The Line, Running

You now hold the state machine: **the states, the execution, the retries, and the approval — with the state tracked and the human in the loop.** The L260 backend has its workflows — and they run with the state (L277).

Next: the AWS-native LLM access — Amazon Bedrock (L278).
