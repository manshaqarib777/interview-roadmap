# Lesson 172 — AI API Security Fundamentals

**Interview importance:** ⭐⭐⭐⭐ — "how do you secure an AI app's API?" the baseline answer is *keys, proxying, and secrets* — the gateway discipline that every deeper security lesson (L308+) builds on.

Lessons 158–171 built the app and made it fast. This lesson is the **security baseline**: where the provider key lives, why the client never sees it, how the gateway proxies and guards (L158, L170), and how secrets are managed (L275). It's the foundation of the security module (L308+) — and the most common AI-app breach is a leaked key, which this lesson prevents.

The distinction this lesson is built on: a **demo** puts the key in an env file and calls the provider from the client. A **solutions architect** treats the key as a server-side secret (L275), proxies every call through the gateway (L158), enforces auth and budgets there (L170), and treats the client as untrusted — the baseline of L308's threat model.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain why the provider key never reaches the client — and what a leaked key costs (L150)
- Design the gateway: proxy, auth, budgets, rate limits (L158, L170)
- Manage secrets: environment, secrets manager, rotation (L275)
- Treat the client as untrusted: validate input, never trust the prompt or the args (L315)
- Place this as the baseline of the AI security module (L308)

## 1. One-Line Definition

**AI API security fundamentals is the baseline discipline of an AI app's API — the provider key stays server-side (L275), every call is proxied through the gateway (L158) with auth, budgets, and rate limits (L170), and the client is treated as untrusted — the foundation the full threat model (L308) builds on.**

The one-sentence interview answer: *"The baseline is three rules. The key never reaches the client — it's a server-side secret, managed and rotated (L275). Every call goes through the gateway (L158) — auth, token budgets (L149), rate limits (L170), and logging (L213). And the client is untrusted — input validated, tool args never trusted raw (L315), the prompt treated as data. Get those three right and the deeper AI security module (L308) builds on a sound foundation."*

## 2. Mental Model

Think of the provider key as **the master key to the building, and the gateway as the only door.** The key never leaves the server's safe (secrets manager, L275); every request passes through the one guarded door (the gateway, L158) where the guard checks who you are (auth), how much you can spend (budget, L149), and how fast you can come (rate limit, L170) — and logs who came through (L213).

```text
   the client (untrusted)     the one guarded door         the safe (L275)
   ┌──────────────────┐       ┌──────────────────┐        ┌──────────────────┐
   │ browser / app    │       │ GATEWAY (L158)   │        │ the key lives    │
   │ never holds key  │  ───▶ │ auth · budget    │  ───▶  │ HERE, server-side │
   │ input validated  │       │ rate limit · log │        │ rotated (L275)   │
   └──────────────────┘       └──────────────────┘        └──────────────────┘
        untrusted                   the only door           the secret
```

The mental model is **one door, one safe**: the client is untrusted, the gateway is the only path, and the key lives in the server's safe — never in the client's pocket.

## 3. Visual Flow — A Secured Request

```text
   a client request arrives
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │ 1 · AUTH — who are you? (L172)               │
   │     session / API key / OAuth (L239)         │
   │     reject unauthenticated                   │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ 2 · VALIDATE — what are you sending? (L315)  │
   │     input shape checked · never trusted raw  │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ 3 · GUARD — budget (L149) + rate limit (L170)│
   │     over → clean rejection (L162)            │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ 4 · PROXY — the server calls the provider    │
   │     with the server's key (L275)             │
   │     the key never left the server            │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ 5 · LOG — who, what, when, cost (L213, L322) │
   └──────────────────────────────────────────────┘
```

The flow is the baseline: **auth → validate → guard → proxy → log** — five steps at the one door, and the key never crosses it.

## 4. How It Works — The Baseline's Three Rules

- **The key stays server-side (L275).** The provider key is a server secret — environment variable at minimum, secrets manager (L275) at production. It never ships to the client: a key in the bundle is a leaked key, and a leaked key is a bill (L150) and a breach. Rotation is the recovery (L275).
- **The gateway is the only door (L158).** Every call is proxied through the server: auth (who), budget (L149, how much), rate limit (L170, how fast), logging (L213, what happened). The client never calls the provider directly — the door is what makes the other controls possible.
- **The client is untrusted (L315).** Input is validated, tool args are never trusted raw (injection, L309, L311), and the prompt is treated as data. "The user said it" is not permission; "the server validated it" is.

> [!NOTE]
> **The leak that defines the baseline: the client-side key (L150, L275).** It's the most common AI-app incident: a key in an env file, a hardcoded string, a client bundle. The cost is immediate (a stolen key bills at your rates, L150) and the fix is painful (rotation, L275, and every consumer of the old key). The baseline exists to make the leak *impossible* — the key has no path to the client.

## 5. Real Project Usage

- **Every AI app with a UI.** The chat client calls your `/api/chat`, never the provider — the key is server-side, the budget (L149) and rate limit (L170) apply, and the user's session is the auth (L172).
- **Public AI APIs (L237, L239).** Your API serves consumers with *their* keys (API keys or OAuth, L239) — the gateway authenticates them, budgets them (L149), and your provider key stays internal.
- **Serverless (L266).** The key lives in Secrets Manager (L275), the gateway is API Gateway + Lambda (L267), and the proxy is the function — the same baseline, serverless-shaped.
- **Agents (L200).** The agent's tool calls (L164) run through the same gateway — auth, budget, and scope (L320) apply per call, and the tool log (L213) is the audit.
- **Multi-tenant SaaS (L357).** Per-tenant auth and budgets (L149, L318) at the gateway — the baseline's door is where tenant isolation (L320) is enforced.

The through-line: **the baseline is the door every AI app stands behind** — and the security module (L308+) is what the door looks like when the threats get specific.

## 6. Interview Explanation

Say it in four moves:

1. **The rules.** "Three rules: the key never reaches the client (L275); every call goes through the gateway (L158) with auth, budget (L149), and rate limits (L170); and the client is untrusted (L315)."
2. **The door.** "The gateway is the only path — auth, validate, guard, proxy, log. The key crosses it never."
3. **The leak.** "The baseline exists for the client-side key: a key in the bundle is a leaked key, a bill (L150), and a breach — rotation (L275) is the recovery."
4. **The foundation.** "This is the baseline of the threat model (L308): get the key, the door, and the trust boundary right, and prompt injection, tool abuse, and tenant leaks (L309, L315, L320) have a foundation to defend from."

## 7. Senior-Level Insights

- **The trust boundary is the architecture (L158, L315).** The senior design names *where trust ends* — the client is untrusted, the gateway is the boundary, the server is trusted, the provider is a third party with its own limits (L168). Every security decision in L308+ hangs off that map.
- **The key is a *cost* secret, not just an access secret (L150, L275).** A stolen key bills at your rates until rotated. The baseline's security is also its cost control — the key's protection is the bill's protection.
- **Secrets management is a lifecycle (L275).** Not "where is the key stored" but "how is it issued, rotated, revoked, and audited" (L322). The senior answer names the lifecycle, not just the store.
- **Least privilege applies to the proxy (L315).** The server doesn't just hold the key — it holds the *scoped* key: per-tenant keys (L320), read-only where possible, and the tool surface (L164) exposed narrowly. The gateway is the enforcement of least privilege.
- **The baseline is the eval's trust root (L343).** Eval data, tool logs (L213), and audit trails (L322) are only trustworthy if the API that recorded them is secured — the security baseline is what makes the observability honest.

## 8. Common Mistakes

- **The key in the client.** In the bundle, the env file, the repo (L275) — the incident the baseline exists to prevent.
- **Client → provider direct.** No gateway (L158) — no auth, no budget (L149), no rate limit (L170), no log (L213).
- **Trusting client input.** Tool args raw into a query (L315) — the injection hole.
- **No rotation.** A key used for years (L275) — the longer it lives, the more it leaks.
- **Logging the key or the full prompt.** Secrets or PII in the logs (L312, L313) — the audit trail becomes the breach.
- **Treating the key as the only secret.** The tool credentials, the DB, the eval data (L275) — the provider key is one secret in a system of secrets.

## 9. Best Practices

- **Keep the key server-side, always** (L275) — env at minimum, secrets manager at production, rotation on the calendar.
- **Proxy every call through the gateway** (L158) — auth, budget (L149), rate limit (L170), log (L213).
- **Validate all input** (L315) — the prompt is data, the args are untrusted, schemas are enforced (L143).
- **Scope the key and the tools** (L315, L320) — least privilege, per tenant.
- **Never log secrets or raw prompts** (L312, L313) — redact; the log is the audit, not the breach.
- **Treat the client as untrusted, always** (L315) — trust is earned by validation, never assumed.

## 10. Interview Questions

**Q: How do you secure an AI app's API?**
> A: Three rules. The provider key stays server-side — a managed, rotated secret (L275). Every call goes through the gateway (L158) — auth, token budget (L149), rate limit (L170), and logging (L213). And the client is untrusted — input validated, tool args never trusted raw (L315). That baseline is what the deeper threat model (L308) builds on.

**Q: Why must the key never reach the client?**
> A: Because a key in the client is a leaked key — anyone can extract it from the bundle and bill at your rates (L150) until you rotate (L275). The client never needs it: the server proxies every call. The baseline makes the leak structurally impossible — the key has no path to the client.

**Q: What does the gateway enforce?**
> A: The five steps: auth (who), validate (what), budget (how much, L149), rate limit (how fast, L170), and log (what happened, L213). It's the one door between the untrusted client and the provider — and the key crosses it never.

**Q: How does this relate to the security module (L308)?**
> A: It's the foundation. Prompt injection (L309) and tool abuse (L315) matter because the client is untrusted; tenant isolation (L320) is enforced at the gateway; secrets (L275) and audit (L322) are the baseline's lifecycle. Get the key, the door, and the trust boundary right, and the threat model has a foundation to defend from.

## 11. Follow-Up Questions

- How do you rotate a provider key without downtime (L275)?
- How does auth work for your own AI API (L237, L239)?
- How is tenant isolation enforced at the gateway (L320)?
- What should and shouldn't go in the logs (L312, L322)?
- How does the baseline apply to serverless (L266, L275)?

## 12. Comparison Table — Insecure vs Baseline-Secured

| | Insecure demo | Baseline (this lesson) |
|---|---|---|
| Key | in the client / repo | server-side, rotated (L275) |
| Path | client → provider direct | gateway proxy (L158) |
| Auth | none | session / API key (L239) |
| Budget (L149) | none | enforced at the gateway |
| Rate limit (L170) | none | enforced at the gateway |
| Input | trusted | validated (L315) |
| Log (L213) | none | who, what, when, cost |

The senior read: **the table is the baseline's definition** — the right column is the door; the left column is the incident.

## 13. Code Example — The Baseline in a Route

```js
// The baseline: auth → validate → guard → proxy → log (L158, L172, L275).
export async function POST(req) {
  // 1 · AUTH — who are you? (L239)
  const session = await authenticate(req);              // session / API key / OAuth
  if (!session) return error(401, 'unauthenticated');

  // 2 · VALIDATE — what are you sending? Never trusted raw (L315).
  const body = ChatRequestSchema.parse(await req.json());  // Zod — the shape is enforced

  // 3 · GUARD — budget (L149) and rate limit (L170).
  const budget = await checkBudget(session.user, body);
  if (!budget.ok) return error(429, 'over budget');
  if (!(await rateLimit(session.user)).ok) return error(429, 'rate limited');

  // 4 · PROXY — the server calls the provider with the SERVER's key (L275).
  const stream = await streamText({
    model: openai('gpt-4o-mini'),                      // the key is server-side, always
    system: FROZEN_SYSTEM,
    messages: body.messages,
  });

  // 5 · LOG — who, what, cost — redacted, never the raw prompt (L213, L312).
  log({ userId: session.user.id, cost: budget.cost, model, at: Date.now() });

  return stream.toDataStreamResponse();
}
```

```text
What the reader must SEE — the door, in code:

  authenticate → 401 if unknown (L239)
  schema.parse → input shape enforced (L315)
  checkBudget + rateLimit → the guards (L149, L170)
  streamText with the SERVER's key → the proxy (L275)
  log(redacted) → the audit, never secrets (L213, L312)

  The key never crossed the door. The client was never trusted.
```

```narrate
6-7: Auth first — the door checks who you are before anything else (L239).
9-10: Input is schema-validated — the prompt and args are data, never trusted raw (L315).
12-14: The guards — token budget (L149) and rate limit (L170) reject cleanly before the provider.
16-20: The proxy uses the server's key — the client never touched it (L275).
22-24: The log records who and cost, redacted — the audit, not the breach (L213, L312).
```

> [!TIP]
> The file is the whole baseline: **one door, five steps, and the key on the server's side of it.** The security module (L308+) is what happens when the threats on the other side of the door get specific.

## 14. Performance Notes

- **The gateway gates TTFT (L151)** — auth, validation, and the guards must be fast (Redis counters, L243) or they eat the latency budget (L145).
- **Auth is a per-request cost (L151)** — session lookup, token check — keep it cacheable (L171) and off the slow path.
- **The proxy is the streaming path (L145)** — pipe, never buffer; the security steps add microseconds, not milliseconds.
- **Secrets management is not a hot-path concern (L275)** — read once at startup, cache in memory; the rotation is an ops event, not a per-request lookup.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Key in the bundle | Key shipped to the client (L275) | Move server-side; rotate the key |
| Unauthenticated calls succeed | No auth at the gateway (L239) | Add the auth step |
| Injection via tool args | Args trusted raw (L315) | Validate against the schema (L143) |
| Bills with no usage | Stolen key (L150) | Rotate (L275); check the logs |
| Secrets in the logs | Unredacted logging (L312) | Redact; fix the log sink |

## 16. Quick Revision Notes

- The baseline: **the key server-side (L275), the gateway as the only door (L158), the client untrusted (L315).**
- The door's five steps: **auth → validate → guard (budget L149 + rate limit L170) → proxy → log (L213).**
- A client-side key is **a leaked key, a bill (L150), and a breach** — rotation (L275) is the recovery.
- **The prompt is data; the args are untrusted** (L315) — validation is the trust.
- This is the **foundation of the threat model (L308)** — L309, L315, L320 build on it.

## 17. Cheat Sheet

```text
AI API SECURITY BASELINE = the door, the safe, the trust boundary

THE THREE RULES
  1 the key never reaches the client (L275)
    server-side · managed · rotated
  2 every call goes through the gateway (L158)
    auth · budget (L149) · rate limit (L170) · log (L213)
  3 the client is untrusted (L315)
    input validated · args never raw · prompt as data

THE DOOR'S FIVE STEPS
  auth      who are you? (L239)
  validate  what are you sending? (L315)
  guard     how much (L149) · how fast (L170)
  proxy     the server's key calls the provider (L275)
  log       who, what, cost — redacted (L213, L312)

THE LEAK THAT DEFINES IT
  client-side key = leaked key = bill (L150) + breach
  rotation (L275) is the recovery — the baseline makes it impossible

FOUNDATION FOR (L308)
  prompt injection (L309) · tool abuse (L315) · tenant leaks (L320)

INTERVIEW, 4 MOVES
  1 rules    "key server-side, one door, client untrusted"
  2 door     "auth → validate → guard → proxy → log"
  3 leak     "client-side key = bill + breach (L150)"
  4 foundation "the baseline the threat model builds on (L308)"
```

## 18. Key Takeaways

> [!RECAP]
> - The baseline is **three rules**: the key stays server-side (L275), every call goes through the gateway (L158), and the client is untrusted (L315)
> - The gateway's door has **five steps**: auth (L239) → validate (L315) → guard (budget L149 + rate limit L170) → proxy (L275) → log (L213)
> - **A client-side key is a leaked key** — a bill (L150) and a breach, with rotation (L275) as the recovery; the baseline makes the leak structurally impossible
> - **The prompt is data and the args are untrusted** (L315) — validation is the trust, and schemas (L143) are the enforcement
> - The log records **who, what, and cost — redacted** (L213, L312); the audit trail is the memory, never the breach
> - This is the **foundation of the threat model (L308)** — prompt injection (L309), tool abuse (L315), and tenant isolation (L320) all build on the key, the door, and the trust boundary

## Check your understanding

Answer these without looking back.

1. What are the baseline's three rules?
2. Walk the gateway's five steps.
3. Why is a client-side key the defining incident (L150, L275)?
4. What does "the client is untrusted" mean in practice (L315)?
5. What should the logs contain — and never contain (L213, L312)?
6. How does secrets management become a lifecycle (L275)?
7. How is tenant isolation enforced at the gateway (L320)?
8. How does this baseline ground the security module (L308)?

## A Closing Note — The Door the Threat Model Defends

You now hold the baseline every AI app stands behind: **the key in the safe (L275), the gateway as the one door (L158), and the client never trusted (L315)** — with the door's five steps as the pattern. It's the foundation the security module (L308) builds on: prompt injection (L309), tool abuse (L315), and tenant leaks (L320) are all threats to *this* door.

Next: the module's capstone — production AI patterns (L173), the synthesis that reassembles everything from L158 to this lesson into one architecture.
