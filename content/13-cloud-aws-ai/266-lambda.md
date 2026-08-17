# Lesson 266 — Lambda

**Interview importance:** ⭐⭐⭐⭐⭐ — "where do the AI request handlers run?" — the answer is *Lambda*: the serverless function — the event source, the handler, the execution role, and the limits (L266).**

L264 rented the compute; this lesson is **the serverless version of it**: Lambda — the function: the event source (what triggers it, L266), the handler (the code, L266), the execution role (the permissions, L262), and the limits (the timeout, the memory, the concurrency, L266). The AI platform's shape: the API request handler (L267), the S3 event handler (L265), the queue consumer (L270) — all Lambdas (L266). This lesson is the natural home of the AI request handlers (L266).

The distinction this lesson is built on: a **demo** runs a script. A **solutions architect** designs the functions (L266): the event source (L266), the handler's shape (L266), the role (L262), and the limits (L266) — because the L260 backend (L260) runs on Lambda where the work fits (L266).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the event source: what triggers the function (L266)
- Explain the handler: the code and its shape (L266)
- Explain the execution role: the permissions (L262)
- Explain the limits: the timeout, the memory, the concurrency (L266)
- Explain the AI shape: the request handlers and the consumers (L266)

## 1. One-Line Definition

**Lambda is the serverless compute — the natural home of the AI request handlers (L266) — the function with an event source (what triggers it: the API Gateway L267, the S3 event L265, the SQS message L270, L266), a handler (the code, L266), an execution role (the permissions, L262), and the limits (the timeout, the memory, the concurrency, L266) — the Lambda's cold start (L266) and the invocation model (L266) are the trade (L266).**

The one-sentence interview answer: *"Lambda is AWS's serverless function (L266). The model: you write the handler — the code that takes an event and returns a response (L266) — and AWS runs it: no servers, no patches, no scaling (L266). The trigger is the event source (L266): the API Gateway (L267) invokes it for a request, the S3 event (L265) invokes it for an object, the SQS message (L270) invokes it for a queue item (L266). The permissions come from the execution role (L262): the Lambda's role says what it may do (L262). The limits shape the design (L266): the timeout — up to 15 minutes (L266); the memory — up to 10 GB, and the CPU scales with it (L266); the concurrency — the per-function and per-account limits, with the reserved concurrency as the control (L266). The trade is the cold start (L266): a new environment takes a moment to spin up — the first invocation is slower (L266). The AI shape: the request handlers (L267), the S3 document handlers (L280), and the queue consumers (L270) are Lambdas (L266) — the serverless AI stack (L283) is Lambda-shaped (L266)."*

## 2. Mental Model

Think of Lambda as **the food-truck window.** You don't own the truck — you provide the recipe (the handler, L266), and the company runs the trucks (the compute, L266). A customer arrives (the event source, L266): the API request (L267), the new document (L265), the queue message (L270) — and the nearest truck cooks your recipe (L266). You get the badge for the ingredients (the execution role, L262): the truck may fetch from the pantry (the S3, L265) and nothing else (L262). The truck has limits (L266): the cooking time (the timeout, L266), the counter space (the memory, L266), and the number of trucks (the concurrency, L266). And the first customer at a new truck waits a moment while it fires up (the cold start, L266). The system works because the recipe is the unit, the triggers are the customers, and the badge is scoped (L266).

```text
   the food-truck window (Lambda, L266)
   ┌────────────────────────────────────────────────────────┐
   │ the recipe (the handler, L266)                         │
   │ the customers (the event sources, L266): the API (L267)│
   │ the document (L265) · the message (L270)               │
   │ the badge (the execution role, L262)                   │
   │ the limits (the timeout, the memory, the concurrency)  │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the window**: the recipe, the customers, the badge, and the limits (L266).

## 3. Visual Flow — One Invocation

```text
   the event source (L266)
        │
        ▼
   ┌────────────────────── THE INVOKE (L266) ─────────────────────────┐
   │  the API request (L267) · the S3 event (L265) · the SQS (L270)  │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE COLD START (L266) ─────────────────────┐
   │  the new environment spins up — the first invocation is slower  │
   │  (L266) · the warm invocations are fast (L266)                  │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE HANDLER (L266) ────────────────────────┐
   │  the code runs (L266) · the role's permissions (L262)           │
   │  the memory and the timeout bound it (L266)                     │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE RESULT (L266) ─────────────────────────┐
   │  the response returns · the log lands in CloudWatch (L274)      │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the invocation: **trigger → (cold start) → handler → result** (L266).

## 4. How It Works — The Function, Part by Part

- **The event source (L266).** What triggers the function (L266): the API Gateway (L267) for the request, the S3 event (L265) for the object, the SQS message (L270) for the queue item, the EventBridge rule (L276) for the schedule (L266). The source determines the handler's event shape (L266).
- **The handler (L266).** The code — the function that takes the event and returns the result (L266). The handler is the unit of deployment: one function, one job (L266).
- **The execution role (L262).** The Lambda's IAM role (L262) — what the function may do: invoke the model (L278), read the S3 (L265), write the logs (L274) (L262). The role is scoped (L262).
- **The limits (L266).** The timeout — up to 15 minutes; the memory — up to 10 GB, with the CPU scaling with it; the concurrency — the per-function and per-account limits (L266). The limits shape the design: the long work goes to the queue (L270) and the workers (L249) (L266).
- **The cold start (L266).** A new environment takes a moment to spin up (L266) — the first invocation is slower (L266). The warm invocations are fast (L266); the provisioned concurrency (L266) pre-warms for the latency-critical paths (L151).

> [!NOTE]
> **The Lambda is the request handler, not the workhorse (L266).** The senior shape puts the quick work in the Lambda (L266) and the long work in the queue (L270): the request handler validates, enqueues, and returns fast (L266); the worker Lambda (L249) processes the model call (L278) off the request path (L222). The timeout (L266) is the design's boundary: if the work doesn't fit in 15 minutes, it's a Step Function (L277) or a container (L271) — not a stretched Lambda (L266).

## 5. Real Project Usage

- **A serverless AI stack (L283).** The API Gateway (L267) invokes the Lambda (L266); the Lambda's role (L262) calls Bedrock (L278), reads the S3 (L265), and streams the response (L251).
- **A RAG ingestion (L280).** The S3 event (L265) invokes the ingestion Lambda (L266); it parses, chunks, and embeds (L280) — and the long jobs ride the queue (L270).
- **A queue consumer (L270).** The SQS message (L270) invokes the worker Lambda (L266); the model call (L278) and the result write (L265) happen in the consumer (L266).
- **A scheduled job (L276).** The EventBridge rule (L276) invokes the Lambda (L266) on the schedule (L221).
- **Anything serverless (L283).** The Lambda is the unit (L266) — the request handlers, the event handlers, the consumers (L266).

The through-line: **the function is the serverless unit** — triggered, scoped, bounded, and logged (L266).

## 6. Interview Explanation

Say it in four moves:

1. **The model.** "You write the handler; AWS runs it — no servers (L266)."
2. **The triggers.** "The API Gateway (L267), the S3 event (L265), the SQS message (L270)."
3. **The role.** "The execution role (L262) — what the function may do."
4. **The limits.** "The timeout, the memory, the concurrency — and the cold start (L266)."

## 7. Senior-Level Insights

- **The function's shape is the design's unit (L266).** The senior answer designs the functions around the events (L266): one function per job, triggered by the source (L266) — the single-responsibility, serverless-shaped (L266).
- **The role is the security boundary (L262).** The Lambda's role (L262) is the L262 least privilege (L262): the function may invoke the model (L278) and nothing else (L262).
- **The concurrency is the cost and the abuse control (L266).** The reserved concurrency (L266) caps the function's cost (L285) and the blast radius (L266) — the L318 abuse control, Lambda-shaped (L266).
- **The cold start is the latency trade (L151).** The latency-critical path (L151) gets the provisioned concurrency (L266) or a container (L271) — the TTFT (L145) is the user experience (L162).
- **The queue is the Lambda's engine room (L270).** The long work (L222) rides the queue (L270) and the worker Lambda (L266) — the request path stays fast (L151).

## 8. Common Mistakes

- **The long work in the Lambda (L266).** The 15-minute model call in the handler (L266) — the timeout (L266) and the user's wait (L151).
- **The widest role (L262).** `Action: "*"` on the execution role (L262) — the least privilege (L262) lost.
- **The cold start ignored (L266).** The latency-critical path (L151) without the provisioned concurrency (L266) — the TTFT (L145) spikes.
- **The function too big (L266).** The monolith function doing everything (L266) — the events (L266) and the scaling (L266) blur.
- **The concurrency uncapped (L266).** The unbound invocations (L266) — the cost (L285) and the abuse (L318) unmanaged.

## 9. Best Practices

- **Design around the events** (L266) — one function per job (L266).
- **Scope the execution role** (L262) — the least privilege (L262).
- **Keep the quick work in the Lambda** (L266) — the long work to the queue (L270) or the Step Functions (L277).
- **Cap the concurrency** (L266) — the cost (L285) and the abuse (L318) controlled.
- **Pre-warm the latency-critical path** (L266) — the provisioned concurrency (L266) or the container (L271).

## 10. Interview Questions

**Q: Walk me through Lambda.**
> A: The serverless function (L266). The handler — the code that takes an event and returns a result (L266). The triggers — the API Gateway (L267), the S3 event (L265), the SQS message (L270) (L266). The execution role (L262) — the permissions. And the limits — the timeout, the memory, the concurrency, with the cold start as the trade (L266).

**Q: How does the Lambda get invoked?**
> A: By its event source (L266): synchronously — the API Gateway (L267) waits for the result (L266); or asynchronously — the S3 event (L265) and the SQS (L270) fire and forget (L266). The source determines the handler's event shape and the invocation's semantics (L266).

**Q: What's the cold start?**
> A: The new environment's spin-up (L266). The first invocation on a fresh environment takes a moment longer (L266); the warm invocations are fast (L266). The mitigation: the provisioned concurrency (L266) for the latency-critical paths (L151) — or a container (L271) when the Lambda's limits don't fit (L266).

**Q: When is a Lambda the wrong choice?**
> A: When the work doesn't fit its shape (L266): the long-running jobs — beyond the 15-minute timeout (L266) — belong in the Step Functions (L277) or the containers (L271); the stateful services (L264) don't fit the stateless function (L266); and the latency-critical paths (L151) with the strict p99 (L333) may prefer the provisioned concurrency (L266) or the container (L271).

## 11. Follow-Up Questions

- What's the event source (L266)?
- What's the handler (L266)?
- What's the cold start (L266)?
- What are the limits (L266)?
- When is a Lambda the wrong choice (L266)?

## 12. Comparison Table — Lambda vs EC2 vs ECS

| | Lambda (L266) | EC2 (L264) | ECS (L271) |
|---|---|---|---|
| Unit (L266) | the function | the server | the container |
| Servers (L266) | none | you run them | none |
| Limits (L266) | timeout, memory, concurrency (L266) | the instance's (L264) | the task's (L271) |
| AI use (L266) | the request handlers (L267), the consumers (L270) | the training (L365), the legacy (L264) | the container services (L271) |
| Cost (L285) | per invocation (L266) | per running instance (L264) | per running task (L271) |

The senior read: **the function is the default for the request handlers** — the container when the shape outgrows it (L266).

## 13. Code Example — The Request Handler

```js
// The request handler — the serverless unit (L266).
// THE HANDLER (L266) — the code the event source invokes (L266).
export async function handler(event, context) {
  // 1 · THE EVENT (L266) — the API Gateway request (L267).
  const { session, body } = event;                     // the auth (L237)

  // 2 · THE ROLE (L262) — the permissions, scoped (L262).
  // The execution role (L262) may invoke the model (L278)
  // and read the docs (L265) — nothing else (L262).

  // 3 · THE QUICK WORK (L266) — the request path stays fast (L151).
  const result = await callModel(body);                // the model (L278)
  return { statusCode: 200, body: JSON.stringify(result) };

  // The long work (L222) doesn't belong here (L266) — it goes
  // to the queue (L270) and the worker Lambda (L249).
}

// THE EVENT SOURCES (L266)
//  · the API Gateway (L267) — the HTTP request (L266)
//  · the S3 event (L265) — the new document (L280)
//  · the SQS message (L270) — the queue item (L249)
//  · the EventBridge rule (L276) — the schedule (L221)
```

```text
What the reader must SEE — the function, shaped:

  event + context        → the invocation (L266)
  callModel(body)        → the model call, scoped by the role (L278, L262)
  statusCode 200         → the response (L266)
  the queue for the long work → the Lambda's boundary (L270)

  Triggered, scoped, bounded, and logged (L266, L274).
```

```narrate
3-4: The handler — the code the event source invokes (L266).
6-8: The event — the API Gateway request with the session (L266, L267).
10-13: The role — the scoped permissions for the model and the docs (L262).
15-17: The quick work — the model call and the response (L266, L278).
19-20: The boundary — the long work goes to the queue (L266, L270).
22-26: The event sources — the API, the S3, the SQS, the schedule (L266).
```

> [!TIP]
> The pair that defines Lambda: **the event source** (what triggers it, L266) and **the execution role** (what it may do, L262). **Triggered by the event, scoped by the role — the serverless unit (L266).**

## 14. Performance Notes

- **The cold start is the p99 (L266).** The first invocation's spin-up (L266) — the latency-critical path (L151) gets the provisioned concurrency (L266) or a container (L271).
- **The memory is the CPU (L266).** The memory scales the CPU (L266) — the memory-heavy functions (L266) get the compute they need (L266).
- **The concurrency is the throughput (L266).** The per-account and per-function limits (L266) — the scale is the concurrency's design (L266).
- **The invocation is the cost (L285).** The per-invocation pricing (L285) — the request path's cost is the invocation count (L266).

## 15. Debugging Scenarios

| Symptom | First check (L266) | The lever |
|---|---|---|
| The first call is slow | The cold start (L266) | The provisioned concurrency (L266) |
| The function times out | The timeout limit (L266) | The queue (L270) or the Step Functions (L277) |
| The access denied | The execution role (L262) | The role's policy (L262) |
| The cost spikes | The concurrency (L285) | The reserved concurrency (L266) |
| The invocation failed | The logs (L274) | The CloudWatch log group (L274) |

## 16. Quick Revision Notes

- Lambda = **the serverless function** (L266): the handler, the triggers, the role, the limits.
- The triggers: **the API Gateway (L267), the S3 (L265), the SQS (L270), the schedule (L276)**.
- The role: **the execution role (L262) — the scoped permissions**.
- The limits: **the timeout, the memory, the concurrency** (L266).
- The trade: **the cold start (L266)** — the provisioned concurrency (L266) for the hot paths (L151).

## 17. Cheat Sheet

```text
LAMBDA = the serverless compute — the request handler's home

THE MODEL (L266)
  the handler — the code: event in, result out
  no servers, no patches, no scaling — AWS runs it

THE TRIGGERS (L266)
  the API Gateway (L267) — the request
  the S3 event (L265) — the document
  the SQS message (L270) — the queue item
  the EventBridge rule (L276) — the schedule

THE ROLE (L262)
  the execution role — what the function may do
  the least privilege: the model (L278), the docs (L265), the logs (L274)

THE LIMITS (L266)
  the timeout — up to 15 minutes
  the memory — up to 10 GB, the CPU scales with it
  the concurrency — the reserved cap (L266)

THE TRADE (L266)
  the cold start — the new environment's spin-up
  the provisioned concurrency (L266) or the container (L271) for the hot paths

INTERVIEW, 4 MOVES
  1 model   "the handler; AWS runs it (L266)"
  2 triggers "API, S3, SQS, schedule (L266)"
  3 role    "the execution role — scoped (L262)"
  4 limits  "timeout, memory, concurrency; the cold start (L266)"
```

## 18. Key Takeaways

> [!RECAP]
> - Lambda is **the serverless compute — the natural home of the AI request handlers** (L266): the handler (L266), the event source (L266), the execution role (L262), and the limits (L266)
> - **The event source** (L266) is what triggers the function — the API Gateway (L267), the S3 event (L265), the SQS message (L270), the EventBridge schedule (L276)
> - **The execution role** (L262) is the Lambda's IAM role — the scoped permissions, the least privilege (L262)
> - **The limits** (L266) shape the design — the timeout (15 min), the memory (10 GB), and the concurrency (the reserved cap as the cost and abuse control, L285, L318)
> - **The cold start** (L266) is the trade — the first invocation's spin-up; the provisioned concurrency (L266) or a container (L271) for the latency-critical paths (L151)
> - The AI shape (L266): the request handlers (L267), the S3 document handlers (L280), and the queue consumers (L270) are Lambdas — the serverless AI stack (L283) is Lambda-shaped (L266)

## Check your understanding

Answer these without looking back.

1. What's the event source (L266)?
2. What's the handler (L266)?
3. What's the execution role (L262)?
4. What are the limits (L266)?
5. What's the cold start (L266)?
6. When is a Lambda the wrong choice (L266)?
7. How does the invocation work (L266)?
8. What is the serverless AI stack's unit (L283)?

## A Closing Note — The Window, Open

You now hold the function: **the handler, the triggers, the execution role, and the limits — with the cold start as the trade and the queue as the engine room.** The compute has a serverless unit — and the request handlers have a home (L266).

Next: the AWS front door — API Gateway (L267).
