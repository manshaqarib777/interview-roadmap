# Lesson 283 — Serverless AI Architecture

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you build an AI app without the servers?" — the answer is *the serverless stack*: Lambda + API Gateway + Bedrock — the L282 chat, serverless-shaped (L283).**

L282 drew the patterns; this lesson is **the serverless implementation**: Serverless AI Architecture — the Lambda + API Gateway + Bedrock stack: the front door (the API Gateway, L267), the compute (the Lambda, L266), the models (the Bedrock, L278), and the data (the RDS L268, the S3 L265, the ElastiCache L269). The AI platform's shape: the L282 patterns (L282) run serverless (L283) — the chat, the RAG, and the batch on the Lambda (L266), the API Gateway (L267), and the Bedrock (L278) (L283). This lesson is the serverless AI stack (L283).

The distinction this lesson is built on: a **demo** runs on a laptop. A **solutions architect** assembles the serverless stack (L283): the front door (L267), the compute (L266), the models (L278), and the data (L268) — because the L260 backend (L260) runs serverless where the shape fits (L283).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the front door: the API Gateway (L267)
- Explain the compute: the Lambda (L266)
- Explain the models: the Bedrock (L278)
- Explain the data: the RDS, the S3, the ElastiCache (L268, L265, L269)
- Explain the stack: the L282 patterns, serverless-shaped (L283)

## 1. One-Line Definition

**The serverless AI architecture is Lambda + API Gateway + Bedrock — the serverless AI stack (L283) — the front door (the API Gateway L267: the routes, the auth, the throttling, the streaming), the compute (the Lambda L266: the request handlers and the workers), the models (the Bedrock L278: the one API, the streaming, the guardrails L281), and the data (the RDS L268, the S3 L265, the ElastiCache L269) — the L282 patterns (L282), serverless-shaped (L283).**

The one-sentence interview answer: *"The serverless AI stack is the Lambda + the API Gateway + the Bedrock (L283). The front door: the API Gateway (L267) — the routes (L267) to the actions (L233), the auth (L267), the throttling (L242), and the streaming (L251). The compute: the Lambda (L266) — the request handlers (L266) and the queue workers (L270), with the execution roles (L262) scoping the access (L283). The models: the Bedrock (L278) — the one API over the frontier models (L278), the streaming (L251), and the guardrails (L281). The data: the RDS (L268) with the pgvector (L183) for the relational and the vectors (L283); the S3 (L265) for the documents and the results (L283); the ElastiCache (L269) for the sessions (L237) and the response cache (L171). The stack's shape: the L282 patterns (L282) — the chat (L282), the RAG (L280), and the batch (L282) — run on this stack (L283): the API Gateway (L267) in front, the Lambdas (L266) in the middle, the Bedrock (L278) at the model, and the managed data (L268, L265, L269) underneath (L283). The serverless trade (L283): no servers (L266), the scale automatic (L266), the cold starts (L266) and the timeout (L266) as the limits (L283)."*

## 2. Mental Model

Think of the serverless stack as **the street-food market.** The market gate (the API Gateway, L267) is the single entrance: every customer checked in (the auth, L267), every stall's menu listed (the routes, L267). The stalls (the Lambdas, L266) are the small kitchens: each cooks one dish (the handler, L266), on demand (the scale, L266), with no permanent staff (the servers, L266). The central kitchen (the Bedrock, L278) supplies the premium dishes (the models, L278): the stall orders (L278), and the dish streams out as it's cooked (L251). The cold storage (the S3, L265), the pantry (the ElastiCache, L269), and the archives (the RDS, L268) hold the ingredients (L283). The market works because the gate is single, the stalls are on-demand, and the kitchen is shared (L283).

```text
   the market (the serverless stack, L283)
   ┌────────────────────────────────────────────────────────┐
   │ the gate (the API Gateway, L267) — the single entrance  │
   │ the stalls (the Lambdas, L266) — the on-demand kitchens │
   │ the kitchen (the Bedrock, L278) — the shared models     │
   │ the storage (the S3 L265, the RDS L268, the cache L269) │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the market**: the gate, the stalls, the kitchen, and the storage (L283).

## 3. Visual Flow — The Serverless Request

```text
   the client (L283)
        │
        ▼
   ┌────────────────────── THE GATE (L267) ────────────────────────────┐
   │  the route: POST /chat (L267) · the auth (L267) · the throttle   │
   │  (L242) · the stream (L251)                                      │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE STALL (L266) ───────────────────────────┐
   │  the chat Lambda (L266) — the session (L237), the cache (L171),  │
   │  the role (L262)                                                 │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE KITCHEN (L278) ─────────────────────────┐
   │  the Bedrock (L278) — the model (L148), the stream (L251), the   │
   │  guardrails (L281)                                               │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE DATA (L283) ────────────────────────────┐
   │  the RDS (L268) · the S3 (L265) · the ElastiCache (L269)         │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the stack: **gate → stall → kitchen → data** (L283).

## 4. How It Works — The Stack, Part by Part

- **The front door (L267).** The API Gateway (L267): the routes (L267) to the actions (L233), the auth (L267), the throttling (L242), and the streaming (L251). The gateway is the L236 front door (L236), AWS-shaped (L267).
- **The compute (L266).** The Lambda (L266): the request handlers (L266) and the queue workers (L270). The execution roles (L262) scope the access (L283); the concurrency (L266) is the scale (L283).
- **The models (L278).** The Bedrock (L278): the one API (L278), the streaming (L251), and the guardrails (L281). The model's choice (L148) is the API's parameter (L278).
- **The data (L283).** The RDS (L268) — the relational and the pgvector (L183); the S3 (L265) — the documents and the results (L283); the ElastiCache (L269) — the sessions (L237) and the cache (L171).
- **The trade (L283).** The serverless trade (L283): no servers (L266), the automatic scale (L266), the pay-per-invocation (L285) — with the cold starts (L266) and the timeout (L266) as the limits (L283).

> [!NOTE]
> **The stack is the L260 backend, serverless-shaped (L283).** The L260 shape (L260) — the front door (L236), the fast layer (L243), the services (L252), the engine room (L245) — maps to the stack (L283): the API Gateway (L267) is the door (L236); the ElastiCache (L269) is the fast layer (L243); the Lambdas (L266) are the services (L252); the SQS (L270) and the workers (L266) are the engine room (L245); and the Bedrock (L278) is the model (L148). The senior answer maps the L260 shape to the serverless components (L283) — and knows where the shape outgrows it (L284).

## 5. Real Project Usage

- **A streaming chat (L282).** The API Gateway (L267) → the chat Lambda (L266) → the Bedrock (L278) → the stream (L251) — the L282 chat, serverless (L283).
- **A RAG API (L280).** The query Lambda (L266) → the Knowledge Bases (L280) → the grounded answer (L280) — the L280 RAG, serverless (L283).
- **A batch processor (L282).** The SQS (L270) → the worker Lambda (L266) → the Bedrock (L278) → the results (L265) — the L282 batch, serverless (L283).
- **A multi-tenant SaaS (L357).** The per-tenant routes (L267) and the per-tenant limits (L242) — the L320 isolation (L320), serverless (L283).
- **Anything AI (L283).** The serverless stack (L283) — the L282 patterns (L282) on the Lambda + the API Gateway + the Bedrock (L283).

The through-line: **the stack is the patterns' serverless home** — the gate, the stalls, and the kitchen (L283).

## 6. Interview Explanation

Say it in four moves:

1. **The gate.** "The API Gateway (L267) — the routes, the auth, the throttle, the stream (L251)."
2. **The stalls.** "The Lambdas (L266) — the handlers and the workers (L270)."
3. **The kitchen.** "The Bedrock (L278) — the one API, the streaming (L251), the guardrails (L281)."
4. **The data.** "The RDS (L268), the S3 (L265), the ElastiCache (L269)."

## 7. Senior-Level Insights

- **The stack is the L260 shape, mapped (L283).** The senior answer maps the L260 components (L260) to the serverless (L283): the gateway (L267) for the door (L236), the ElastiCache (L269) for the fast layer (L243), the Lambdas (L266) for the services (L252), the SQS (L270) for the engine room (L245).
- **The Lambda's shape is the boundary (L266).** The request handlers (L266) and the short workers (L270) fit the Lambda (L266); the long and the heavy (L284) move to the containers (L271) — the L284 next step (L284) is the senior's (L283).
- **The cold start is the TTFT's risk (L266).** The latency-critical chat (L251) — the provisioned concurrency (L266) or the container (L271) — the L145 TTFT (L145) protected (L283).
- **The managed data is the ops' gift (L268).** The RDS (L268), the S3 (L265), and the ElastiCache (L269) — the L268 ops (L268) handled (L283).
- **The cost is the invocation's (L285).** The pay-per-invocation (L285) — the serverless bill (L285) is the traffic's (L283).

## 8. Common Mistakes

- **The monolith Lambda (L266).** The everything-function (L266) — the events (L266) and the scaling (L266) blur (L283).
- **The long work in the handler (L266).** The 15-minute call in the request path (L266) — the queue (L270) is the engine room (L283).
- **The cold start ignored (L266).** The chat's TTFT (L145) spiking (L266) — the provisioned concurrency (L266) or the container (L271) (L283).
- **The data unmanaged (L268).** The database on the EC2 (L264) — the managed RDS (L268) is the stack's (L283).
- **The key in the Lambda (L275).** The provider key in the code (L275) — the Bedrock (L278) and the IAM (L262) remove it (L283).

## 9. Best Practices

- **Compose the L260 shape** (L283) — the gateway (L267), the fast layer (L269), the services (L266), the engine room (L270).
- **Keep the handlers quick** (L266) — the long work to the queue (L270) and the Step Functions (L277).
- **Protect the TTFT** (L145) — the provisioned concurrency (L266) for the chat (L251).
- **Use the managed data** (L268, L265, L269) — the ops handled (L283).
- **Watch the invocation cost** (L285) — the concurrency (L266) and the cache (L171).

## 10. Interview Questions

**Q: Walk me through a serverless AI architecture.**
> A: The Lambda + the API Gateway + the Bedrock (L283). The API Gateway (L267) — the routes, the auth, the throttling (L242), the streaming (L251). The Lambdas (L266) — the request handlers and the queue workers (L270). The Bedrock (L278) — the one API (L278) with the guardrails (L281). And the managed data — the RDS (L268), the S3 (L265), the ElastiCache (L269).

**Q: How do you handle the cold start?**
> A: By the path's latency needs (L283): the latency-critical chat (L251) gets the provisioned concurrency (L266) or moves to a container (L271); the async workers (L270) tolerate the cold start (L266). The L145 TTFT (L145) is the decision's frame (L283).

**Q: When does the serverless stack stop fitting?**
> A: When the workload outgrows the Lambda's shape (L284): the long-lived connections (L250), the heavy processing beyond the memory and the timeout (L266), the GPU (L264). The request handlers (L266) stay serverless (L283); the outgrown services move to the ECS (L271) — the L284 next step (L284).

**Q: How does the L260 backend map to the stack?**
> A: Component by component (L283): the gateway (L236) → the API Gateway (L267); the fast layer (L243) → the ElastiCache (L269); the services (L252) → the Lambdas (L266); the engine room (L245) → the SQS (L270) and the workers (L266); the model (L148) → the Bedrock (L278). The L260 shape (L260), serverless-shaped (L283).

## 11. Follow-Up Questions

- What's the front door (L267)?
- What's the compute (L266)?
- What's the data (L283)?
- When does the stack stop fitting (L284)?
- How does the L260 backend map (L283)?

## 12. Comparison Table — The L260 Backend, Serverless-Mapped

| L260 component (L260) | The serverless stack (L283) |
|---|---|
| The front door (L236) | the API Gateway (L267) |
| The fast layer (L243) | the ElastiCache (L269) |
| The services (L252) | the Lambdas (L266) |
| The engine room (L245) | the SQS (L270) + the workers (L266) |
| The model (L148) | the Bedrock (L278) |
| The data (L268) | the RDS (L268), the S3 (L265) |

The senior read: **the table is the stack** — the L260 shape, component by component (L283).

## 13. Code Example — The Stack, Assembled

```js
// The serverless stack (L283) — the chat pattern, assembled (L282).
// THE GATE (L267) — the route to the chat Lambda (L266).
const chatRoute = {
  path: 'POST /chat',                       // the action (L233)
  integration: chatLambda,                  // the handler (L266)
  authorizer: 'cognito',                    // the auth (L267)
  throttling: { rate: 10 },                 // the limit (L242)
  stream: true,                             // the streaming (L251)
};

// THE STALL (L266) — the handler with the role (L262).
export async function chatHandler(event) {
  const session = await getSession(event);  // the session (L237) — the cache (L269)
  const cached = await cacheGet(event.body); // the L171 cache (L171)
  if (cached) return stream(cached);         // the hit (L171)

  // THE KITCHEN (L278) — the model call, streamed (L251).
  const stream = await bedrock.invoke({
    modelId: 'anthropic.claude-3-5-sonnet', // the model (L148)
    messages: event.body.messages,
    guardrails: 'default',                  // the boundary (L281)
  });
  return stream;                            // the response stream (L251)
}

// THE DATA (L283) — the RDS (L268), the S3 (L265), the ElastiCache (L269).
// The role (L262) scopes each access (L283).
```

```text
What the reader must SEE — the stack, assembled:

  POST /chat + cognito + rate 10 + stream → the gate (L267)
  getSession + cacheGet → the fast layer (L269, L171)
  bedrock.invoke + guardrails → the kitchen (L278, L281)
  RDS / S3 / ElastiCache → the data (L283)

  The L260 shape, serverless-shaped (L283).
```

```narrate
3-11: The gate — the route with the auth, the throttle, and the streaming (L267).
13-22: The stall — the handler with the session, the cache, and the model call (L266, L269, L171).
24-25: The kitchen — the Bedrock with the guardrails (L278, L281).
27-28: The data — the RDS, the S3, and the cache (L268, L265, L269).
```

> [!TIP]
> The pair that defines the stack: **the gateway route** (the front door, L267) and **the Bedrock invoke** (the model, L278). **Gate the requests, invoke the models, keep the handlers quick — the serverless AI stack (L283).**

## 14. Performance Notes

- **The cold start is the p99 (L266).** The latency-critical chat (L251) — the provisioned concurrency (L266) protects the TTFT (L145).
- **The cache is the model's relief (L171).** The response cache (L171) — the repeated prompts (L171) skip the model (L278) and the cost (L285).
- **The concurrency is the throughput (L266).** The per-account and per-function limits (L266) — the scale is the concurrency's design (L283).
- **The invocation is the cost (L285).** The pay-per-invocation (L285) — the serverless bill (L285) is the traffic's (L283).

## 15. Debugging Scenarios

| Symptom | First check (L283) | The lever |
|---|---|---|
| The chat's first token is slow | The cold start (L266) | The provisioned concurrency (L266) |
| The handler times out | The Lambda's limits (L266) | The queue (L270) or the Step Functions (L277) |
| The access denied | The role (L262) | The execution role's policy (L262) |
| The cost spikes | The invocations (L285) | The concurrency (L266), the cache (L171) |
| The stream stalls | The gateway (L267) | The streaming integration (L251) |

## 16. Quick Revision Notes

- The serverless AI stack = **the Lambda + the API Gateway + the Bedrock** (L283).
- The gate: **the API Gateway (L267) — the routes, the auth, the throttle, the stream (L251)**.
- The compute: **the Lambda (L266) — the handlers and the workers (L270)**.
- The models: **the Bedrock (L278) — the one API, the guardrails (L281)**.
- The data: **the RDS (L268), the S3 (L265), the ElastiCache (L269)**.

## 17. Cheat Sheet

```text
SERVERLESS AI ARCHITECTURE = Lambda + API Gateway + Bedrock

THE GATE (L267)
  the API Gateway — the routes (L267), the auth (L267)
  the throttling (L242) · the streaming (L251)

THE COMPUTE (L266)
  the Lambda — the request handlers (L266), the workers (L270)
  the execution roles (L262) · the concurrency = the scale (L266)

THE MODELS (L278)
  the Bedrock — the one API (L278) · the streaming (L251)
  the guardrails (L281) · the model's choice (L148)

THE DATA (L283)
  the RDS (L268) — the relational + the pgvector (L183)
  the S3 (L265) — the documents and the results (L283)
  the ElastiCache (L269) — the sessions (L237) + the cache (L171)

THE TRADE (L283)
  no servers (L266) · the scale automatic (L266)
  the pay-per-invocation (L285)
  the cold start (L266) + the timeout (L266) — the limits (L283)

THE MAP (L283)
  the L260 shape (L260): the door (L267), the fast layer (L269),
  the services (L266), the engine room (L270), the model (L278)

INTERVIEW, 4 MOVES
  1 gate    "the API Gateway (L267)"
  2 compute "the Lambdas (L266)"
  3 models  "the Bedrock (L278)"
  4 data    "the RDS, the S3, the cache (L283)"
```

## 18. Key Takeaways

> [!RECAP]
> - The serverless AI architecture is **the Lambda + the API Gateway + the Bedrock — the serverless AI stack** (L283): the front door (L267), the compute (L266), the models (L278), and the data (L268, L265, L269)
> - **The front door** (L267) is the API Gateway — the routes (L267), the auth (L267), the throttling (L242), and the streaming (L251)
> - **The compute** (L266) is the Lambda — the request handlers (L266) and the queue workers (L270), with the execution roles (L262) scoping the access
> - **The models** (L278) are the Bedrock — the one API (L278), the streaming (L251), and the guardrails (L281)
> - **The data** (L283): the RDS (L268) with the pgvector (L183), the S3 (L265) for the documents and the results, and the ElastiCache (L269) for the sessions (L237) and the cache (L171)
> - The stack is **the L260 backend, serverless-shaped** (L283): the door (L267), the fast layer (L269), the services (L266), the engine room (L270), and the model (L278) — with the trade (L283): no servers, the automatic scale, the cold start (L266) and the timeout (L266) as the limits (L283)

## Check your understanding

Answer these without looking back.

1. What's the front door (L267)?
2. What's the compute (L266)?
3. What's the data (L283)?
4. What's the serverless trade (L283)?
5. When does the stack stop fitting (L284)?
6. How does the L260 backend map (L283)?
7. How do you handle the cold start (L266)?
8. What is the serverless AI stack (L283)?

## A Closing Note — The Market, Open

You now hold the serverless stack: **the gate, the stalls, the kitchen, and the storage — with the L260 shape mapped component by component.** The patterns have their serverless home — and the market is open (L283).

Next: the containerized successor — Containerized AI Architecture (L284).
