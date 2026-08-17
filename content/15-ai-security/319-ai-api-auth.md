# Lesson 319 — Auth for AI APIs

**Interview importance:** ⭐⭐⭐⭐⭐ — "keys, scopes, and quotas for the model endpoint" — the answer is *the API auth*: the identity at the door, the scopes, and the quotas (L319).**

L237 built the auth fundamentals (L237); this lesson is **their API shape**: the auth for AI APIs — the keys, the scopes, and the quotas for the model endpoint (L319): the keys (the API keys, L319), the scopes (the permissions, L319), and the quotas (the budgets, L149) — with the OAuth (L239) and the mTLS for the machine-to-machine (L319). The AI shape (L173): the model endpoint (L278) — the customer's identity (L319) at the door (L267). This lesson is the model endpoint's auth (L319).

The distinction this lesson is built on: a **demo** shares the key. A **solutions architect** designs the identity (L319): the keys (L319), the scopes (L319), and the quotas (L149) — because the abuse (L317) stops at the identity (L319).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the keys: the API keys (L319)
- Explain the scopes: the permissions (L319)
- Explain the quotas: the budgets (L149)
- Explain the machine auth: the OAuth and the mTLS (L319)
- Explain the AI shape: the model endpoint's identity (L319)

## 1. One-Line Definition

**The auth for AI APIs is the identity at the model endpoint's door (L319) — the keys (the API keys: the per-customer secrets L275 sent in the header, L319), the scopes (the permissions: the read-only, the model access, the admin, L319), and the quotas (the budgets: the tokens L332 and the cost L334 per key, L149) — with the OAuth (L239) and the mTLS (L319) for the machine-to-machine (L319).**

The one-sentence interview answer: *"The AI API's auth is the identity at the door (L319). The keys (L319): the API keys (L319) — the per-customer secrets (L275) sent in the `Authorization` header (L319) — the identity (L319) of the caller (L319). The scopes (L319): the permissions (L319) bound to the key (L319) — the read-only (L319), the model access (L319), the admin (L319) — the key's power (L319) limited (L314). The quotas (L149): the budgets (L149) per key (L319) — the tokens per day (L332) and the cost per month (L334) — the abuse (L317) attributed (L334) and bounded (L318). The machine auth (L319): the OAuth (L239) — the client-credentials flow (L239) for the service-to-service (L319); the mTLS (L319) — the mutual certificates (L319) for the high-trust (L319). The AI shape (L173): the model endpoint (L278) — the customer's key (L319) verified at the gateway (L267), the scopes (L319) checked, and the quota (L149) enforced — the L237 auth (L237), API-shaped (L319)."*

## 2. Mental Model

Think of the API auth as **the club's membership cards.** The cards (the API keys, L319) identify the members (the customers, L320): the card number (the key, L319) checked at the door (the gateway, L267). The cards have the tiers (the scopes, L319): the lounge access (the read-only, L319), the concert access (the model access, L319), the manager's card (the admin, L319). And the cards have the limits (the quotas, L149): the drinks per night (the tokens, L332) and the tab per month (the cost, L334) — the member's usage (L319) tracked (L332). The backstage passes (the OAuth, L239) and the staff IDs (the mTLS, L319) are the machines' cards (L319). The club works because the cards are checked, the tiers are scoped, and the tabs are tracked (L319).

```text
   the cards (the API keys, L319)
   ┌────────────────────────────────────────────────────────┐
   │ the check (the gateway, L267) — the key verified (L319)│
   │ the tiers (the scopes, L319) — the read, the model,    │
   │ the admin (L319)                                       │
   │ the tabs (the quotas, L149) — the tokens, the cost     │
   │ the machines (the OAuth, L239; the mTLS, L319)         │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the cards**: the check, the tiers, the tabs, and the machines (L319).

## 3. Visual Flow — One Authenticated Call

```text
   the caller (L319)
        │  Authorization: Bearer sk-... (L319)
        ▼
   ┌────────────────────── THE GATEWAY (L267) ───────────────────────────┐
   │  the key verified (L319) — the hash (L275) looked up (L319)        │
   │  the key revoked (L319)? → the 401 (L319)                         │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE SCOPES (L319) ───────────────────────────┐
   │  the endpoint's scope (L319) — the read-only key → the write      │
   │  denied (L319)                                                     │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE QUOTA (L149) ────────────────────────────┐
   │  the key's usage (L332) vs the quota (L149)                       │
   │  the exhausted quota (L149) → the 429 (L318)                      │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the auth: **key → scope → quota** (L319).

## 4. How It Works — The Auth, Part by Part

- **The keys (L319).** The API keys (L319): the per-customer secrets (L275) sent in the `Authorization` header (L319) — the identity (L319) of the caller (L319). The key's hash (L275) stored (L275), the plaintext never (L275).
- **The scopes (L319).** The permissions bound to the key (L319): the read-only (L319), the model access (L319), the admin (L319) — the key's power (L319) limited (L314).
- **The quotas (L149).** The budgets per key (L319): the tokens per day (L332) and the cost per month (L334) — the abuse (L317) attributed (L334) and bounded (L318).
- **The machine auth (L319).** The OAuth (L239) — the client-credentials flow (L239) for the service-to-service (L319); the mTLS (L319) — the mutual certificates (L319) for the high-trust (L319).

> [!NOTE]
> **The key is the identity; the scope is the power; the quota is the budget (L319).** The senior answer separates the three (L319): the key (L319) identifies the caller (L319); the scope (L319) bounds what the key can do (L314); and the quota (L149) bounds what the key can spend (L334). The AI API (L319) — the per-customer keys (L320) with the scopes (L319) and the quotas (L149) — is the L237 auth (L237), API-shaped (L319).

## 5. Real Project Usage

- **A production AI SaaS (L357).** The per-customer keys (L320) — the scopes (L319) and the quotas (L149) at the gateway (L267).
- **A model API (L278).** The API keys (L319) — the read and the write scopes (L319), the monthly quota (L149).
- **A machine-to-machine flow (L319).** The OAuth client-credentials (L239) — the service's identity (L319).
- **A high-trust integration (L319).** The mTLS (L319) — the mutual certificates (L319).
- **Anything with a model (L317).** The identity at the door (L319) — the abuse (L317) attributed (L334).

The through-line: **the identity is the door's** — the key, the scope, and the quota (L319).

## 6. Interview Explanation

Say it in four moves:

1. **The keys.** "The per-customer secrets in the header (L319)."
2. **The scopes.** "The permissions — the read, the model, the admin (L319)."
3. **The quotas.** "The tokens and the cost per key (L149)."
4. **The machines.** "The OAuth (L239) and the mTLS (L319)."

## 7. Senior-Level Insights

- **The per-customer key is the attribution (L320).** The keys (L319) per customer (L320) — the usage (L332) attributed (L334) and the abuse (L317) traced (L319).
- **The scope is the least privilege (L314).** The key's scopes (L319) — the L314 least privilege (L314), key-shaped (L319).
- **The quota is the budget (L149).** The tokens (L332) and the cost (L334) per key (L319) — the burning (L317) bounded (L318).
- **The OAuth is the service's identity (L239).** The client-credentials (L239) — the machine-to-machine (L319) without the shared keys (L319).
- **The rotation is the key's lifecycle (L275).** The rotated keys (L275) — the leak (L275) contained (L319).

## 8. Common Mistakes

- **The shared key (L319).** The one key for everyone (L319) — the abuse (L317) un-attributable (L334); the per-customer (L320) is the fix (L319).
- **The key in the code (L275).** The plaintext key (L275) in the repo (L301) — the L301 rule (L301) — the secrets manager (L275) is the home (L319).
- **The unscoped key (L314).** The admin key for the read (L314) — the scopes (L319) are the least privilege (L314).
- **The quota missing (L149).** The key without the budget (L149) — the burning (L317) unbounded (L318).
- **The no rotation (L275).** The leaked key (L275) alive (L275) — the rotation (L275) is the containment (L319).

## 9. Best Practices

- **Issue per-customer keys** (L320) — the attribution (L334).
- **Scope the keys** (L319) — the least privilege (L314).
- **Quota the keys** (L149) — the tokens (L332) and the cost (L334).
- **Store the hashes** (L275) — the secrets manager (L275), never the plaintext (L275).
- **Rotate the keys** (L275) — the leak's containment (L319).

## 10. Interview Questions

**Q: Walk me through the AI API's auth.**
> A: The identity at the door (L319). The keys — the per-customer secrets in the header (L319). The scopes — the permissions bound to the key (L319). The quotas — the tokens and the cost per key (L149). And the machines — the OAuth (L239) and the mTLS (L319).

**Q: Why the per-customer keys?**
> A: The attribution (L320): the per-customer keys (L320) — the usage (L332) attributed (L334) to the customer (L320) — the quota (L149) and the rate limits (L318) per key (L319), and the abuse (L317) traced (L319). The shared key (L319) makes the attribution (L334) impossible (L319).

**Q: What are the scopes for?**
> A: The least privilege (L314): the key's permissions (L319) — the read-only (L319), the model access (L319), the admin (L319) — the key's power (L319) limited (L314). The read-only key (L319) can't write (L319); the admin (L319) is the few (L319).

**Q: How do the machines authenticate?**
> A: The OAuth (L239) — the client-credentials flow (L239): the service (L319) exchanges its credentials (L239) for the token (L239) — no shared keys (L319). Or the mTLS (L319) — the mutual certificates (L319) — for the high-trust integrations (L319).

## 11. Follow-Up Questions

- What are the keys (L319)?
- What are the scopes (L319)?
- What are the quotas (L149)?
- How do the machines authenticate (L239)?
- What's the rotation (L275)?

## 12. Comparison Table — The Auth Options

| | The API key (L319) | The OAuth (L239) | The mTLS (L319) |
|---|---|---|---|
| The identity (L319) | the key (L319) | the token (L239) | the certificate (L319) |
| The use (L319) | the customers (L320) | the services (L319) | the high-trust (L319) |
| The rotation (L275) | the key rotation (L275) | the token expiry (L239) | the cert renewal (L319) |

The senior read: **the key for the customers, the OAuth for the services, the mTLS for the high-trust** (L319).

## 13. Code Example — The Auth, Applied

```js
// The API auth (L319) — the key, the scope, the quota (L319).
// 1 · THE KEY VERIFICATION (L319) — the hash looked up (L275).
async function verifyKey(authHeader) {
  const key = authHeader.replace('Bearer ', '');
  const hash = sha256(key);                         // the hash (L275)
  const record = await secrets.getKey(hash);        // the store (L275)
  if (!record || record.revoked) return null;       // the 401 (L319)
  return record;                                    // { id, customerId, scopes }
}

// 2 · THE SCOPE CHECK (L319) — the least privilege (L314).
function checkScope(record, required) {
  if (!record.scopes.includes(required)) return false;   // L319
  return true;
}

// 3 · THE QUOTA (L149) — the budget per key (L319).
async function checkQuota(record) {
  const usage = await metering.usage(record.customerId, 'month');  // L332
  return usage < QUOTA_MONTHLY;                     // L149
}

// 4 · THE GATEWAY (L267) — the auth before the model (L278).
async function gateway(req) {
  const key = await verifyKey(req.headers.authorization);
  if (!key) return error(401);
  if (!checkScope(key, 'model:invoke')) return error(403);  // L319
  if (!(await checkQuota(key))) return error(429);          // L149
  return invokeModel(req);                          // L278
}
```

```text
What the reader must SEE — the auth, applied:

  sha256(key) + the store  → the hash, never the plaintext (L275)
  scopes check             → the least privilege (L314)
  usage vs the quota       → the budget (L149, L332)
  401 / 403 / 429          → the doors (L319)

  The key identifies, the scope bounds, the quota budgets (L319).
```

```narrate
4-10: The key — the hash looked up in the store, the revoked denied (L275, L319).
12-15: The scope — the required permission checked (L319, L314).
17-20: The quota — the customer's usage against the monthly budget (L149, L332).
22-28: The gateway — the auth before the model (L267, L278).
```

> [!TIP]
> The pair that defines the auth: **the hashed key** (the identity, L275) and **the scope check** (the least privilege, L314). **Issue the per-customer keys, scope the power, quota the budget — the model endpoint's identity (L319).**

## 14. Performance Notes

- **The verification is the latency's cost (L319).** The hash lookup (L275) — the sub-millisecond (L319) at the door (L267).
- **The scope is the zero-cost check (L319).** The in-memory scopes (L319) — no cost (L319).
- **The quota is the metering's cost (L332).** The usage (L332) per customer (L320) — the L332 metering (L332) feeds the quota (L319).
- **The rotation is the ops' cost (L275).** The key rotation (L275) — the small cost (L275) for the containment (L319).

## 15. Debugging Scenarios

| Symptom | First check (L319) | The lever |
|---|---|---|
| The 401s | The key (L319) | The hash (L275), the revocation (L319) |
| The 403s | The scope (L319) | The key's scopes (L319) |
| The 429s | The quota (L149) | The customer's budget (L149) |
| The abuse is untraced | The key (L319) | The per-customer keys (L320) |
| The leaked key lives | The rotation (L275) | The rotation (L275) |

## 16. Quick Revision Notes

- The AI API auth = **the identity at the door** (L319): the keys, the scopes, the quotas, the machines.
- The keys: **the per-customer secrets (L275) — the hash stored (L275)**.
- The scopes: **the permissions — the least privilege (L314)**.
- The quotas: **the tokens (L332) and the cost (L334) per key (L149)**.
- The machines: **the OAuth (L239) and the mTLS (L319)**.

## 17. Cheat Sheet

```text
AUTH FOR AI APIS = the identity at the model endpoint's door

THE KEYS (L319)
  the per-customer API keys (L320) — the Authorization header (L319)
  the hash stored (L275) — the plaintext never (L275)
  the rotation (L275) — the leak's containment (L319)

THE SCOPES (L319)
  the permissions bound to the key (L319)
  the read-only (L319) · the model access (L319) · the admin (L319)
  the least privilege (L314)

THE QUOTAS (L149)
  the tokens per day (L332) · the cost per month (L334)
  the abuse (L317) attributed (L334) and bounded (L318)

THE MACHINES (L319)
  the OAuth (L239) — the client-credentials (L239)
  the mTLS (L319) — the mutual certificates (L319)

INTERVIEW, 4 MOVES
  1 keys    "the per-customer secrets, hashed (L319)"
  2 scopes  "the permissions — the least privilege (L314)"
  3 quotas  "the tokens and the cost per key (L149)"
  4 machines "the OAuth and the mTLS (L319)"
```

## 18. Key Takeaways

> [!RECAP]
> - The auth for AI APIs is **the identity at the model endpoint's door** (L319): the keys (L319), the scopes (L319), the quotas (L149), and the machine auth (L319)
> - **The keys** (L319): the per-customer API keys (L320) — the secrets (L275) sent in the `Authorization` header (L319), the hashes stored (L275), the plaintext never (L275)
> - **The scopes** (L319): the permissions bound to the key (L319) — the read-only (L319), the model access (L319), the admin (L319) — the least privilege (L314)
> - **The quotas** (L149): the budgets per key (L319) — the tokens per day (L332) and the cost per month (L334) — the abuse (L317) attributed (L334) and bounded (L318)
> - **The machine auth** (L319): the OAuth (L239) — the client-credentials flow (L239) for the service-to-service (L319); the mTLS (L319) for the high-trust (L319)
> - The AI shape (L319): the model endpoint (L278) — the customer's key (L319) verified at the gateway (L267), the scopes (L319) checked, and the quota (L149) enforced — the L237 auth (L237), API-shaped (L319)

## Check your understanding

Answer these without looking back.

1. What are the keys (L319)?
2. What are the scopes (L319)?
3. What are the quotas (L149)?
4. How do the machines authenticate (L239)?
5. Why the per-customer keys (L320)?
6. What's the rotation (L275)?
7. What's the 401 vs the 403 (L319)?
8. What is the model endpoint's identity (L319)?

## A Closing Note — The Cards, Checked

You now hold the auth: **the keys, the scopes, the quotas, and the machines — with the hash stored and the tiers scoped.** The membership cards are checked — and the tabs are tracked (L319).

Next: the L134 discipline, applied to prompts, caches, and vector stores — Tenant Isolation for AI (L320).
