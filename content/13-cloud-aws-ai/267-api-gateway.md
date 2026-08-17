# Lesson 267 — API Gateway

**Interview importance:** ⭐⭐⭐⭐⭐ — "what's the AWS front door?" — the answer is *API Gateway*: routes, auth, throttling, and streaming — the L236 gateway, AWS-shaped (L267).**

L236 designed the front door; this lesson is **its AWS implementation**: API Gateway — the managed front door: the routes (the paths and the methods, L267), the auth (the authorizers, L267), the throttling (the rate limits, L242), and the streaming (the response streaming, L251). The AI backend (L260) exposes its API through the gateway (L267): the chat and the generation endpoints (L233) routed to the Lambdas (L266), guarded by the authorizer (L267), throttled (L242), and streamed (L251). This lesson is the AWS front door (L267).

The distinction this lesson is built on: a **demo** exposes the Lambda directly. A **solutions architect** puts the front door in front (L267): the routes (L267), the auth (L267), the throttling (L242), and the streaming (L251) — the L236 gateway, AWS-shaped (L267).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the routes: the paths and the methods (L267)
- Explain the auth: the authorizers (L267)
- Explain the throttling: the rate limits (L242)
- Explain the streaming: the response streaming (L251)
- Explain the AI shape: the front door of the L260 backend (L267)

## 1. One-Line Definition

**API Gateway is the AWS front door (L267) — the managed gateway: the routes (the paths and the methods to the Lambdas L266 and the containers L271, L267), the auth (the authorizers: the IAM, the Cognito, the Lambda authorizer, L267), the throttling (the rate limits, L242), and the streaming (the response streaming for the AI responses, L251) — the L236 gateway, AWS-shaped (L267).**

The one-sentence interview answer: *"API Gateway is AWS's managed front door (L267). The shape: the routes — the paths and the methods that map to the backends, the Lambda (L266) or the containers (L271) (L267). The auth: the authorizers (L267) — the IAM auth for the machine-to-machine, the Cognito for the users, the Lambda authorizer for the custom logic (L267). The throttling: the rate limits (L242) — the account-level and the route-level limits that protect the backend (L267). The streaming: the response streaming (L251) — the AI responses stream through the gateway to the client (L267). The AI shape: the chat and the generation endpoints (L233) are routed to the Lambdas (L266), guarded by the authorizer (L267), throttled (L242), and streamed (L251) — the L236 front door, AWS-shaped (L267)."*

## 2. Mental Model

Think of API Gateway as **the hotel's front desk.** Every guest (the request, L267) checks in at the desk (L267): the room they want (the route, L267) is on the board (L267), the ID is checked (the auth, L267), and the pace is measured (the throttling, L242). The desk routes the guest to the right floor (the Lambda, L266) and, when the answer takes time (the AI response, L145), the desk passes the messages through as they arrive (the streaming, L251). The hotel works because the desk is the single entrance — every guest checked, every route known, every pace measured (L267).

```text
   the front desk (API Gateway, L267)
   ┌────────────────────────────────────────────────────────┐
   │ the board (the routes, L267) — the paths + the methods │
   │ the ID check (the auth, L267) — the authorizers        │
   │ the pace (the throttling, L242) — the rate limits      │
   │ the messages (the streaming, L251) — as they arrive    │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the front desk**: the board, the ID check, the pace, and the messages (L267).

## 3. Visual Flow — One Request Through the Front Door

```text
   the client (L267)
        │
        ▼
   ┌────────────────────── THE FRONT DOOR (L267) ──────────────────────┐
   │  the route: POST /chat → the chat Lambda (L266, L233)            │
   │  the auth: the authorizer (L267) — the IAM / Cognito / Lambda    │
   │  the throttling: the rate limit (L242)                           │
   │  the streaming: the response streams back (L251)                 │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE BACKEND (L266) ─────────────────────────┐
   │  the Lambda (L266) — the chat handler (L233)                     │
   │  the model call (L278) · the data (L268) · the queues (L270)     │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE STREAM (L251) ──────────────────────────┐
   │  the tokens arrive as they're generated (L145)                   │
   │  the gateway passes them through to the client (L267)            │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the front door: **route → auth → throttle → backend → stream** (L267).

## 4. How It Works — The Front Door, Part by Part

- **The routes (L267).** The paths and the methods that map to the backends (L267): `POST /chat` → the chat Lambda (L266), `GET /docs/{id}` → the documents Lambda (L266). The route is the API surface's map (L267).
- **The auth (L267).** The authorizers (L267): the IAM auth — the signature-based, for the machine-to-machine (L267); the Cognito — the user pool, for the user auth (L237); the Lambda authorizer — the custom logic (L267). The authorizer runs before the backend (L267).
- **The throttling (L242).** The rate limits (L242): the account-level and the route-level limits (L267). The throttle protects the backend (L267) — the L242 discipline, AWS-shaped (L267).
- **The streaming (L251).** The response streaming (L251): the AI responses (L145) stream through the gateway to the client (L267) — the TTFT (L145) is preserved (L267).
- **The integration (L267).** The backend the route targets (L267): the Lambda (L266), the container (L271), or the HTTP endpoint (L267).

> [!NOTE]
> **The gateway is the L236 front door, operational (L267).** Everything L236 placed at the door (L236) is here: the auth (L237) as the authorizers (L267), the rate limits (L242) as the throttling (L267), the routing (L233) as the routes (L267), and the streaming (L251) as the response streaming (L267). The L172 baseline (L172) runs at the door (L267): the client never reaches the Lambda directly (L267).

## 5. Real Project Usage

- **A serverless AI stack (L283).** The chat and the generation routes (L233) to the Lambdas (L266), the authorizer (L267) guarding, the streaming (L251) delivering.
- **A RAG API (L280).** The query route (L267) to the retrieval Lambda (L266), the ingestion route (L267) to the pipeline (L280).
- **A multi-tenant SaaS (L357).** The per-tenant routes and the per-tenant throttling (L267) — the L320 isolation at the door (L267).
- **A public model endpoint (L278).** The model access (L278) exposed through the gateway (L267) with the IAM auth (L267).
- **Anything AI (L267).** The front door is the gateway (L267) — the L236 shape, AWS-deployed (L267).

The through-line: **the front door is the gateway** — routed, guarded, throttled, and streamed (L267).

## 6. Interview Explanation

Say it in four moves:

1. **The routes.** "The paths and the methods to the Lambdas (L266) and the containers (L271)."
2. **The auth.** "The authorizers — the IAM, the Cognito, the Lambda authorizer (L267)."
3. **The throttling.** "The rate limits (L242) — the account and the route levels (L267)."
4. **The streaming.** "The response streaming (L251) — the AI responses pass through (L267)."

## 7. Senior-Level Insights

- **The gateway is the L172 baseline, operational (L267).** The authorizer (L267) and the throttling (L242) at the door (L267) — the L172 discipline (L172) AWS-shaped (L267): the client never reaches the Lambda directly (L267).
- **The authorizer is the auth strategy (L267).** The senior answer picks the authorizer by the client (L267): the IAM for the machine-to-machine (L267), the Cognito for the users (L237), the Lambda authorizer for the custom logic (L267).
- **The throttle is the abuse control (L242).** The route-level limits (L267) — the L318 abuse control (L318) at the door (L267): the model's cost (L285) bounded (L267).
- **The streaming is the UX (L251).** The response streaming (L267) preserves the TTFT (L145) — the AI UX (L162) through the gateway (L267).
- **The integration is the seam (L267).** The Lambda (L266) or the container (L271) behind the route (L267) — the gateway's integration is the backend's seam (L267).

## 8. Common Mistakes

- **The Lambda exposed directly (L267).** The function URL without the gateway (L267) — the front door (L236) bypassed (L267).
- **No authorizer (L267).** The public route to the model endpoint (L278) — the L172 baseline (L172) lost.
- **No throttling (L242).** The unthrottled route (L267) — the abuse (L318) and the cost (L285) unmanaged.
- **The non-streaming response (L251).** The full response buffered (L267) — the TTFT (L145) and the UX (L162) die.
- **The monolith route (L267).** One route to one everything-Lambda (L266) — the events (L266) and the scaling (L266) blur.

## 9. Best Practices

- **Put the front door in front** (L267) — the gateway before the Lambda (L266).
- **Authorize at the door** (L267) — the IAM, the Cognito, the Lambda authorizer (L267).
- **Throttle every route** (L242) — the rate limits (L267).
- **Stream the AI responses** (L251) — the TTFT (L145) preserved.
- **Route by the actions** (L233) — the chat, the generate, the tools (L267).

## 10. Interview Questions

**Q: Walk me through API Gateway.**
> A: The managed front door (L267). The routes — the paths and the methods to the Lambdas (L266) and the containers (L271) (L267). The auth — the authorizers: the IAM, the Cognito, the Lambda authorizer (L267). The throttling — the rate limits (L242). And the streaming — the response streaming (L251).

**Q: Why not expose the Lambda directly?**
> A: Because the front door is where the cross-cutting concerns live (L236). The authorizer (L267), the throttling (L242), the routing (L267), and the streaming (L251) are enforced once, at the door (L267) — the L172 baseline (L172), AWS-shaped (L267). Exposing the Lambda directly bypasses all of it (L267).

**Q: How do you authenticate an AI API?**
> A: By the client (L267). The machine-to-machine — the IAM auth, the signed requests (L267). The users — the Cognito user pool (L237). The custom logic — the Lambda authorizer (L267). The authorizer runs before the backend (L267) — the auth is at the door (L236).

**Q: How does streaming work through the gateway?**
> A: The route's integration streams (L267): the Lambda (L266) returns a streaming response (L251), and the gateway passes the chunks through to the client as they arrive (L267). The TTFT (L145) is preserved — the user sees the tokens as they're generated (L162).

## 11. Follow-Up Questions

- What are the routes (L267)?
- What are the authorizers (L267)?
- What's the throttling (L242)?
- How does the streaming work (L251)?
- Why not expose the Lambda directly (L267)?

## 12. Comparison Table — The L236 Gateway, AWS-Shaped

| L236 concern (L236) | API Gateway (L267) |
|---|---|
| Routing (L233) | the routes: the paths and the methods (L267) |
| Auth (L237) | the authorizers: IAM, Cognito, Lambda (L267) |
| Rate limits (L242) | the throttling: the account and route levels (L267) |
| Streaming (L251) | the response streaming (L267) |
| The L172 baseline (L172) | the front door, operational (L267) |

The senior read: **the table is the gateway** — every L236 concern, AWS-shaped (L267).

## 13. Code Example — The Front Door, Declared

```js
// The front door (L267) — the L236 gateway, AWS-shaped (L267).
// THE ROUTES (L267) — the actions (L233) to the Lambdas (L266).
const routes = {
  'POST /chat':    { integration: chatLambda, stream: true },   // the streaming (L251)
  'POST /generate': { integration: genLambda,  stream: true },  // the streaming (L251)
  'POST /tools':   { integration: toolLambda, stream: true },   // the tools (L164)
};

// THE AUTH (L267) — the authorizer at the door (L236).
const auth = {
  'POST /chat':     { authorizer: 'cognito-user-pool' },   // the users (L237)
  'POST /generate': { authorizer: 'iam' },                 // the machines (L262)
  'POST /tools':    { authorizer: 'lambda-custom' },       // the custom logic (L267)
};

// THE THROTTLING (L242) — the route-level limits (L267).
const throttle = {
  'POST /chat':     { rate: 10, burst: 20 },   // per key (L242)
  'POST /generate': { rate: 5,  burst: 10 },   // the expensive route (L285)
};

// The result: the front door routes, authorizes, throttles, and
// streams — the L172 baseline (L172), operational (L267).
```

```text
What the reader must SEE — the front door, declared:

  POST /chat → chatLambda, stream → the route + the streaming (L251)
  authorizer: cognito / iam / lambda → the auth at the door (L267)
  rate 10, burst 20 → the throttle (L242)
  the Lambda never exposed → the L172 baseline (L172, L267)

  Routed, guarded, throttled, and streamed (L267).
```

```narrate
3-7: The routes — the actions (L233) mapped to the Lambdas (L266), with the streaming on (L251).
9-14: The auth — the authorizers: the Cognito for the users, the IAM for the machines, the Lambda for the custom logic (L267).
16-20: The throttling — the route-level rate limits (L242).
22-23: The result — the front door enforces the L172 baseline (L172, L267).
```

> [!TIP]
> The pair that defines API Gateway: **the route** (the action to the Lambda, L267) and **the authorizer** (the auth at the door, L267). **Route the actions, authorize at the door — the L236 gateway, AWS-shaped (L267).**

## 14. Performance Notes

- **The gateway is the latency budget's start (L151).** The route and the auth (L267) add a small fixed cost (L267) — the TTFT (L145) includes it (L267).
- **The streaming is the UX (L251).** The response streaming (L267) — the tokens arrive as they're generated (L145), the perceived latency (L162) is the TTFT (L267).
- **The throttle is the cost's bound (L242).** The route-level limits (L267) — the expensive model routes (L285) bounded (L267).
- **The integration is the backend's scale (L267).** The Lambda (L266) and the container (L271) behind the route (L267) — the gateway scales with the backend (L267).

## 15. Debugging Scenarios

| Symptom | First check (L267) | The lever |
|---|---|---|
| The 401s | The authorizer (L267) | The auth at the door (L237) |
| The 429s | The throttle (L242) | The route-level limits (L267) |
| The route 404s | The routes (L267) | The path and the method (L267) |
| The stream stalls | The integration (L267) | The streaming response (L251) |
| The backend is exposed | The direct Lambda URL (L267) | The gateway in front (L267) |

## 16. Quick Revision Notes

- API Gateway = **the AWS front door** (L267): the routes, the auth, the throttling, the streaming.
- The routes: **the actions (L233) to the Lambdas (L266)**.
- The auth: **the authorizers — IAM, Cognito, Lambda (L267)**.
- The throttling: **the rate limits (L242)**.
- The streaming: **the response streaming (L251) — the TTFT preserved (L145)**.

## 17. Cheat Sheet

```text
API GATEWAY = the AWS front door — the L236 gateway, AWS-shaped

THE ROUTES (L267)
  the paths + the methods → the Lambdas (L266), the containers (L271)
  the actions (L233): chat · generate · tools

THE AUTH (L267)
  the authorizers — run before the backend (L267)
  IAM — the machines (L262) · Cognito — the users (L237)
  Lambda authorizer — the custom logic (L267)

THE THROTTLING (L242)
  the account-level + the route-level rate limits (L267)
  the expensive model routes bounded (L285)

THE STREAMING (L251)
  the response streaming (L267) — the tokens as they're generated (L145)
  the TTFT (L145) preserved through the door (L267)

THE BASELINE (L172)
  the client never reaches the Lambda directly (L267)
  the L172 discipline, operational at the door (L267)

INTERVIEW, 4 MOVES
  1 routes    "the actions to the Lambdas (L267)"
  2 auth      "the authorizers — IAM, Cognito, Lambda (L267)"
  3 throttle  "the rate limits (L242)"
  4 streaming "the response streaming — the TTFT preserved (L251)"
```

## 18. Key Takeaways

> [!RECAP]
> - API Gateway is **the AWS front door** (L267): the routes (L267), the auth (L267), the throttling (L242), and the streaming (L251)
> - **The routes** (L267) map the actions (L233) to the Lambdas (L266) and the containers (L271)
> - **The auth** (L267) is the authorizers — the IAM for the machines (L262), the Cognito for the users (L237), the Lambda authorizer for the custom logic (L267) — running before the backend (L267)
> - **The throttling** (L242) is the rate limits — the account and the route levels (L267) — the L242 discipline, AWS-shaped (L267)
> - **The streaming** (L251) is the response streaming — the AI responses (L145) pass through the gateway, the TTFT preserved (L267)
> - The gateway is **the L236 front door, operational** (L267): the client never reaches the Lambda directly — the L172 baseline (L172), AWS-shaped (L267)

## Check your understanding

Answer these without looking back.

1. What are the routes (L267)?
2. What are the authorizers (L267)?
3. What's the throttling (L242)?
4. How does the streaming work (L251)?
5. Why not expose the Lambda directly (L267)?
6. What's the L236 gateway, AWS-shaped (L267)?
7. How do you authenticate an AI API (L267)?
8. What is the front door's baseline (L172)?

## A Closing Note — The Front Desk, Manned

You now hold the front door: **the routes, the authorizers, the throttling, and the streaming — with the L172 baseline enforced at the door.** The L260 backend has a gateway — and it's the L236 shape, AWS-shaped (L267).

Next: the managed Postgres — RDS & PostgreSQL on AWS (L268).
