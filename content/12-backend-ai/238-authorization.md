# Lesson 238 — Authorization

**Interview importance:** ⭐⭐⭐⭐⭐ — "what may a caller do with the model?" — the answer is *authorization*: scopes, quotas, and policy — what the authenticated identity is allowed to do (L237, L241).**

L237 identified the caller; this lesson is **what they may do**: authorization — the second half of access control: after auth proves *who* (L237), authorization decides *what* — the scopes (what operations, L238), the quotas (how much, L149), and the policy (the rules, L241). For the AI platform, the authorization is the model's access: which models a tenant may call (L148), the token quotas (L149), and the tool permissions (L315).

The distinction this lesson is built on: a **demo** authenticates and lets everyone do everything. A **solutions architect** authorizes at the same boundary (L236): the scopes checked (L238), the quotas enforced (L149), and the policy applied (L241) — after the auth's verdict, before the service (L236).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain authorization: what the authenticated identity may do (L238)
- Explain the scopes: the operations an identity may perform (L238)
- Explain the quotas: how much an identity may consume (L149)
- Explain the policy: the rules behind the checks (L241)
- Explain the boundary: auth → authorization → service (L236)

## 1. One-Line Definition

**Authorization is what the authenticated identity may do — the second half of access control (L238): after auth proves who's calling (L237), authorization decides the scopes (the operations allowed, L238), the quotas (how much may be consumed, L149), and the policy (the rules behind the checks, L241) — enforced at the gateway (L236), before the service acts (L233).**

The one-sentence interview answer: *"Authorization is the what, after auth's who (L238). Auth (L237) proves the identity; authorization decides what it may do. Three parts. Scopes — the operations the identity may perform (L238): which models a tenant may call (L148), which tools (L315), which endpoints (L233). Quotas — how much it may consume (L149): the token budgets (L149), the rate limits (L242) — the cost control (L150). And the policy — the rules behind the checks (L241): the roles (L241), the permissions (L241), the fine-grained rules (L241). The enforcement is at the gateway (L236): auth first (L237), then the scopes and the quotas (L238), then the service (L233). For the AI platform, the authorization is the model's access — the caller's identity decides which models, how many tokens, and which tools (L260)."*

## 2. Mental Model

Think of authorization as **the visitor's pass's fine print.** The front desk (the gateway, L236) checks the badge (auth, L237) — and the badge's fine print says what the visitor may do (authorization, L238): which offices (the scopes, L238), how long and how much (the quotas, L149), and under which rules (the policy, L241). The visitor with a "lobby only" pass can't reach the server room (the scope check, L238); the visitor with a "one hour" pass is escorted out at the hour (the quota, L149). The fine print is read at the front desk (L236), before the visitor proceeds (L233).

```text
   the badge's fine print (L238)
   ┌────────────────────────────────────────────────────────┐
   │ scopes  — which offices (L238): models, tools, routes  │
   │ quotas  — how much (L149): tokens, requests (L242)     │
   │ policy  — the rules (L241): roles, permissions         │
   └────────────────────────────────────────────────────────┘
       read at the front desk (L236), before the visitor proceeds (L233)
```

The mental model is **the pass's fine print**: the scopes, the quotas, and the policy — read at the door (L238).

## 3. Visual Flow — Auth → Authorization → Service

```text
   a request arrives (L238)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · AUTH (L237)                                          │
   │     who's calling? — the badge (L237)                    │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · AUTHORIZATION (L238)                                 │
   │     scopes — may this identity call this model? (L148)   │
   │     quotas — does it have the tokens left? (L149)        │
   │     policy — do the rules allow it? (L241)               │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE VERDICT (L234)                                   │
   │     allowed → the service acts (L233)                    │
   │     denied → 403 (L234) · over quota → 429 (L170)        │
   └──────────────────────────────────────────────────────────┘
```

The flow is the pair: **auth → authorization → service** — the who, then the what, then the act (L238).

## 4. How It Works — The Scopes, the Quotas, the Policy

- **The scopes (L238).** The operations an identity may perform (L238): which models a tenant may call (L148), which tools (L315), which endpoints (L233). The scope is the operation-level check (L238).
- **The quotas (L149).** How much an identity may consume (L149): the token budgets per user, per tenant, per day (L149) — the rate limits (L242) as the pace, the quotas as the volume (L238). The quota is the cost control (L150).
- **The policy (L241).** The rules behind the checks (L241): the roles (L241), the permissions (L241), and the fine-grained rules (L241) — the RBAC (L241) that decides the scopes (L238).
- **The boundary (L236).** The enforcement at the gateway (L236): auth first (L237), then the scopes and the quotas (L238), then the service (L233) — the same boundary as the auth (L236).

> [!NOTE]
> **The AI platform's authorization is the model's access (L260).** For the AI SaaS (L357), authorization isn't just "may you read this file" — it's the *model's* access: which models the tenant's tier allows (L148), how many tokens the plan covers (L149), which tools the agent may use (L315), and which data the retrieval may touch (L320). The L238 scopes, quotas, and policy are the pricing and the isolation in code (L150, L320) — the tenant's tier (L357) IS its authorization (L260).

## 5. Real Project Usage

- **The AI SaaS tiers (L357).** The tenant's tier (L357) decides its authorization (L260): the models (L148), the token quotas (L149), the tools (L315) — the pricing as policy (L150).
- **The partner API (L237).** The partner's key (L237) has scopes (L238): the endpoints it may call, the models it may use (L238).
- **The internal tools (L315).** The agent's tools (L315) scoped by the session's role (L241) — the least privilege (L315).
- **The admin vs user (L241).** The RBAC (L241): the admin's scopes (L238) vs the user's (L241).
- **Anything with access (L260).** The authorization (L238) is the what after the who (L237) — enforced at the gateway (L236).

The through-line: **authorization is the fine print of access** — the scopes, the quotas, and the policy, read at the door (L238).

## 6. Interview Explanation

Say it in four moves:

1. **The what.** "Auth proves who (L237); authorization decides what (L238)."
2. **The three parts.** "Scopes (L238), quotas (L149), policy (L241)."
3. **The boundary.** "Enforced at the gateway (L236), after the auth (L237), before the service (L233)."
4. **The AI shape.** "The model's access: the models (L148), the tokens (L149), the tools (L315)."

## 7. Senior-Level Insights

- **The three parts compose (L238).** The senior answer designs the scopes (L238), the quotas (L149), and the policy (L241) as one system (L260): the policy decides the scopes (L241), and the quotas bound the consumption (L149).
- **The quotas are the cost control (L150).** The token budgets (L149) are the pricing's enforcement (L150) — the tenant's tier (L357) IS its quota (L260).
- **The policy is the RBAC (L241).** The roles and the permissions (L241) decide the scopes (L238) — the L241 lesson is the policy's implementation (L241).
- **The isolation is the authorization (L320).** The tenant's data access (L320) is part of its authorization (L238) — the isolation enforced at the same boundary (L236).
- **The gateway is the enforcement point (L236).** Auth (L237) then authorization (L238) at the door (L236) — the services trust both (L236).

## 8. Common Mistakes

- **Auth without authorization (L238).** The identity proven, everything allowed (L238) — the scope check missing (L238).
- **No quotas (L149).** The tenant consumes without a bound (L150) — the token budget missing (L149).
- **The policy as code (L241).** The roles scattered through the services (L241) — the RBAC (L241) centralized (L238).
- **The over-broad scopes (L315).** The caller can reach everything (L315) — the least privilege (L315) ignored (L238).
- **The authorization after the act (L233).** The service acting before the check (L236) — the enforcement at the door (L238).
- **The tenant's data crossable (L320).** The isolation (L320) not part of the authorization (L238) — the leak (L312).

## 9. Best Practices

- **Authorize at the gateway** (L236) — after the auth (L237), before the service (L233).
- **Design the scopes per operation** (L238) — the models (L148), the tools (L315), the routes (L233).
- **Enforce the quotas** (L149) — the token budgets per user and tenant (L150).
- **Centralize the policy** (L241) — the RBAC (L241) deciding the scopes (L238).
- **Include the isolation** (L320) — the tenant's data in its authorization (L238).
- **Least privilege** (L315) — the narrowest scopes that work (L238).

## 10. Interview Questions

**Q: What's the difference between auth and authorization?**
> A: The who and the what (L238). Authentication (L237) proves the identity — who's calling (L237). Authorization decides what that identity may do (L238): the scopes (the operations, L238), the quotas (how much, L149), and the policy (the rules, L241). Auth first, then authorization, then the service (L233) — both at the gateway (L236).

**Q: What are the scopes for an AI platform?**
> A: The model's access (L260). The scopes (L238) decide which models a tenant may call (L148), which tools the agent may use (L315), which endpoints it may hit (L233), and which data it may retrieve (L320). The scope is the operation-level check (L238) — the tenant's tier (L357) IS its scopes (L260).

**Q: How do quotas fit in?**
> A: The quotas are how much (L149). The token budgets per user, per tenant, per day (L149) — the rate limits (L242) as the pace, the quotas as the volume (L238). For the AI SaaS, the quota is the cost control (L150): the tenant's plan covers N tokens (L149), and the authorization enforces it (L238).

**Q: Where is the authorization enforced?**
> A: At the gateway, with the auth (L236). The flow is auth (L237) → the scopes and the quotas (L238) → the service (L233). The gateway verifies the badge (L237) and reads the fine print (L238) before the request proceeds (L233). The services trust both checks (L236) — they never re-implement them (L238).

## 11. Follow-Up Questions

- What are the three parts of authorization (L238)?
- How do the quotas control the cost (L150)?
- How does the RBAC decide the scopes (L241)?
- How does the isolation fit the authorization (L320)?
- Where is the enforcement (L236)?

## 12. Comparison Table — Auth vs Authorization

| | Auth (L237) | Authorization (this lesson) |
|---|---|---|
| Asks | who? | what may they do? (L238) |
| Credential | session, token, key | scopes, quotas, policy (L241) |
| The check | the identity | the operations (L238) |
| The bound (L149) | — | the tokens, the volume |
| The denial (L234) | 401 | 403 (L234) · 429 (L170) |
| The boundary | the gateway (L236) | the same gateway (L236) |

The senior read: **the columns are the pair** — the who at the door, then the what, before the act (L238).

## 13. Code Example — The Authorization Check

```js
// Authorization: scopes → quotas → policy, at the gateway (L238, L236).
export async function authorize(session, req) {
  // 1 · THE POLICY (L241) — the roles decide the scopes (L238).
  const roles = await rolesOf(session.user);                 // the RBAC (L241)
  const scopes = scopesFor(roles);                           // the operations (L238)

  // 2 · THE SCOPE CHECK (L238) — may this identity do this?
  if (!scopes.includes(req.scope)) {                         // e.g. 'model:gpt-4o' (L148)
    return error(403, 'forbidden');                          // L234
  }

  // 3 · THE QUOTA CHECK (L149) — does it have the tokens left?
  const quota = await tokenQuota(session.tenant);            // the plan (L357)
  if (!quota.has(req.estimateTokens)) {
    return error(429, 'quota exceeded', { resetAt: quota.resetsAt });  // L170
  }
  await quota.decrement(req.estimateTokens);                 // the ledger (L332)

  return ok(session);                                        // the fine print passes (L238)
}

// THE FLOW (L236) — auth, then authorization, then the service (L233).
const session = await authenticate(req);                     // L237 — the who
if (!session) return error(401);
const verdict = await authorize(session, req);               // L238 — the what
if (!verdict.ok) return verdict;
return service.handle(session, req);                         // L233 — the act
```

```text
What the reader must SEE — the fine print, read at the door:

  scopesFor(roles)      → the policy decides the scopes (L241, L238)
  scopes.includes(req.scope) → the operation check (L238)
  tokenQuota(session.tenant) → the volume bound (L149, L357)
  403 / 429              → the denials (L234, L170)
  auth → authorize → service → the boundary (L236)

  The who, then the what, then the act.
```

```narrate
4-6: The policy — the roles (L241) decide the scopes (L238).
8-10: The scope check — may this identity call this model (L148, L238)?
12-17: The quota check — the token budget (L149), enforced as the cost control (L150).
20-25: The flow — auth (L237), then authorization (L238), then the service (L233): the boundary (L236).
```

> [!TIP]
> The pair that defines the fine print: **`scopes.includes(req.scope)`** (the operations, L238) and **`tokenQuota(session.tenant)`** (the volume, L149). **The scopes say what; the quotas say how much — read at the door, before the act (L238).**

## 14. Performance Notes

- **The checks are in Redis (L243).** The roles (L241) and the quotas (L149) cached (L243) — the authorization sub-millisecond (L236).
- **The quota is a counter (L149).** The token ledger (L332) in Redis (L243) — the decrement is a fast atomic (L149).
- **The gateway is the latency budget (L151).** The auth (L237) plus the authorization (L238) — kept fast (L236).
- **The policy is the configuration (L241).** The RBAC (L241) as data, not code (L241) — the checks read the config (L238).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Everything allowed | No scope check (L238) | The scopes at the gateway (L236) |
| The tenant overspends | No quota (L149) | The token budget (L150) |
| The wrong roles | The RBAC drift (L241) | The policy data (L241) |
| Cross-tenant access | The isolation not in auth (L320) | The tenant in the scope (L238) |
| The denials wrong | The scope too narrow (L315) | The least privilege's balance (L238) |

## 16. Quick Revision Notes

- Authorization = **the what after the who** (L238).
- The three parts: **scopes (L238), quotas (L149), policy (L241)**.
- The boundary: **auth (L237) → authorization (L238) → service (L233)** — at the gateway (L236).
- The denials: **403 (L234), 429 (L170)**.
- The AI shape: **the model's access** (L260) — models (L148), tokens (L149), tools (L315).
- The isolation: **the tenant's data in its authorization** (L320).

## 17. Cheat Sheet

```text
AUTHORIZATION = the fine print of access — the what after the who

THE THREE PARTS (L238)
  scopes  the operations — which models (L148), tools (L315),
          routes (L233), data (L320)
  quotas  how much — the token budgets (L149), the volume (L150)
  policy  the rules — the roles (L241), the permissions (L241)

THE BOUNDARY (L236)
  auth (L237) → authorization (L238) → the service (L233)
  the scopes and the quotas read at the gateway (L236)
  the denials: 403 (L234) · 429 for the quota (L170)

THE AI SHAPE (L260)
  the caller's identity decides the model's access (L260):
  the tier (L357) IS the scopes and the quotas (L150)
  the isolation (L320) is part of the authorization (L238)

THE RULES
  the policy (L241) decides the scopes (L238)
  the quotas (L149) bound the consumption (L150)
  least privilege (L315) — the narrowest scopes that work (L238)

INTERVIEW, 4 MOVES
  1 what    "auth proves who; authorization decides what (L238)"
  2 three   "scopes, quotas, policy (L238, L149, L241)"
  3 boundary "at the gateway, before the service (L236)"
  4 AI shape "the model's access — tier as policy (L260)"
```

## 18. Key Takeaways

> [!RECAP]
> - Authorization is **the what after the who** (L238): after auth proves the identity (L237), authorization decides what it may do (L238)
> - **The three parts** (L238): the scopes (the operations — models, L148, tools, L315, routes, L233), the quotas (how much — the token budgets, L149), and the policy (the rules — the RBAC, L241)
> - **The boundary is the gateway** (L236): auth (L237) → the scopes and the quotas (L238) → the service (L233)
> - **The quotas are the cost control** (L150) — the tenant's tier (L357) IS its token budget (L149)
> - **The isolation is part of the authorization** (L320) — the tenant's data access enforced at the same boundary (L238)
> - The AI platform's authorization is **the model's access** (L260) — which models (L148), how many tokens (L149), and which tools (L315) the caller's identity allows

## Check your understanding

Answer these without looking back.

1. What's the difference between auth and authorization (L238)?
2. What are the three parts (L238)?
3. How do the quotas control the cost (L150)?
4. What's the boundary (L236)?
5. What are the denials (L234)?
6. How does the RBAC decide the scopes (L241)?
7. How does the isolation fit (L320)?
8. What's the AI platform's authorization (L260)?

## A Closing Note — The Fine Print, Read at the Door

You now hold the second half of access control: **the scopes that say what, the quotas that bound how much, and the policy that decides both — read at the gateway, before the act.** The front door now knows both who's calling and what they may do (L238).

Next: the delegated standard — OAuth 2.0 & OIDC (L239), the auth your customers will ask for.
