# Lesson 237 — Authentication

**Interview importance:** ⭐⭐⭐⭐⭐ — "who's calling your AI API?" — the answer is *authentication*: sessions, tokens, and keys — the badge check at the gateway (L236).**

L236's badge check is this lesson: **authentication** — who's calling the API: sessions (the user's logged-in state, L122), tokens (the bearer credential, L240), and keys (the machine credential, L237). The gateway (L236) authenticates (L237); the services trust it (L236). The AI platform's auth has three audiences: the end users (sessions, L237), the app's own service calls (tokens, L240), and the partners' integrations (API keys, L237).

The distinction this lesson is built on: a **demo** trusts the client. A **solutions architect** authenticates at the boundary: the gateway (L236) verifies the credential — the session, the token (L240), or the key (L237) — before the request reaches the services, and the services never re-implement auth (L236).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain authentication: proving who's calling (L237)
- Explain the three credentials: sessions, tokens, keys (L237)
- Explain the token: the bearer credential (L240)
- Explain the key: the machine credential (L237)
- Explain the boundary: auth at the gateway, trusted by the services (L236)

## 1. One-Line Definition

**Authentication is proving who's calling — the badge check at the gateway (L236): sessions (the user's logged-in state, L122), tokens (the bearer credential, L240), and API keys (the machine credential, L237) — verified once at the boundary (L236), with the services trusting the gateway's verdict, and the L172 rule holding: the client is never trusted (L172).**

The one-sentence interview answer: *"Authentication is the badge check — proving who's calling (L237). Three credentials. Sessions — the user's logged-in state (L122): the cookie or the session token, for the human users of the app (L237). Tokens — the bearer credential (L240): a signed token (L240) that says 'this request is from user X, until this time' — for the app's own service calls (L240). API keys — the machine credential (L237): a long-lived secret for the partners' integrations (L237) — the server-to-server identity (L237). The check happens at the gateway (L236): the gateway verifies the credential once, and the services trust it (L236). And the L172 rule holds: the client is never trusted — the badge is verified at the door, not assumed (L237)."*

## 2. Mental Model

Think of authentication as **the three kinds of badges at the front desk.** The sessions are the visitor's day pass (the user's logged-in state, L122): it's issued when they sign in and expires when they leave (the session's lifetime, L237). The tokens are the staff ID (the bearer credential, L240): it says who the bearer is and when it expires (L240) — anyone holding it is that person (L240). The API keys are the service badges (the machine credential, L237): long-lived, for the machines that call each other (L237). The front desk (the gateway, L236) checks whichever badge the visitor presents (L237) — and the offices (the services) trust the front desk's check (L236).

```text
   the three badges (L237)
   ┌────────────────────────────────────────────────────────┐
   │ session  — the day pass (L122) — the user's login      │
   │ token    — the staff ID (L240) — who holds it is who   │
   │ key      — the service badge (L237) — the machine      │
   └────────────────────────────────────────────────────────┘
       checked at the front desk (L236), trusted by the offices (L236)
```

The mental model is **the three badges**: the session, the token, and the key — each checked at the front desk (L237).

## 3. Visual Flow — The Auth Check

```text
   a request arrives (L237)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · PRESENT THE CREDENTIAL (L237)                        │
   │     the session cookie · the bearer token (L240) ·       │
   │     the API key (L237)                                   │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · VERIFY (L237)                                        │
   │     the session: valid? not expired? (L122)              │
   │     the token: signature? expiry? (L240)                 │
   │     the key: known? scoped? (L237)                       │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE VERDICT (L236)                                   │
   │     valid → the session is set (L237)                    │
   │     invalid → 401 (L234)                                 │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   the services trust the verdict (L236) — the request proceeds (L233)
```

The flow is the badge check: **present → verify → verdict → trusted** (L237).

## 4. How It Works — The Three Credentials

- **Sessions (L122).** The user's logged-in state (L122): the login issues a session (L237), the session travels with the requests (the cookie, L237), and the server looks it up (L237). The session is the human user's badge (L237).
- **Tokens (L240).** The bearer credential (L240): a signed token (L240) carrying the user's identity and the expiry (L240). The bearer — whoever holds it — is that identity (L240). The token is verified by its signature (L240).
- **API keys (L237).** The machine credential (L237): a long-lived secret for the partners and the integrations (L237) — the server-to-server identity (L237). The key is hashed at rest (L275) and scoped (L315).
- **The boundary (L236).** The verification happens at the gateway (L236): the credential is checked once (L237), and the services trust the gateway's verdict (L236) — the services never re-implement auth (L236).

> [!NOTE]
> **The credential's kind matches the caller (L237).** The session for the human users (L122), the token for the app's service calls (L240), and the API key for the machine integrations (L237). The senior design matches the credential to the audience (L237): the human's session has a lifetime and can be revoked (L122); the token carries the service identity with the expiry (L240); the key is long-lived and scoped (L315) — and all three are verified at the gateway (L236), with the client never trusted (L172).

## 5. Real Project Usage

- **The web app (L122).** The users sign in → the session (L122) → the chat requests authenticated at the gateway (L236).
- **The mobile app (L240).** The users sign in → the token (L240) → the bearer credential on the requests (L240).
- **The partner API (L237).** The partners' integrations → the API keys (L237) → scoped per partner (L315).
- **The service-to-service calls (L240).** The app's own services → the service tokens (L240) with the short expiry (L240).
- **The AI SaaS (L260).** The three audiences (L237) authenticated at the gateway (L236) — the users, the services, the partners (L260).

The through-line: **the credential matches the caller** — the session for the humans, the token for the services, the key for the machines — verified at the door (L237).

## 6. Interview Explanation

Say it in four moves:

1. **The three credentials.** "Sessions (L122), tokens (L240), keys (L237)."
2. **The match.** "The session for the users, the token for the services, the key for the machines (L237)."
3. **The boundary.** "Verified at the gateway (L236) — the services trust it (L236)."
4. **The rule.** "The client is never trusted — the badge is checked at the door (L172)."

## 7. Senior-Level Insights

- **The credential matches the audience (L237).** The senior answer designs the auth per caller (L237): the users' sessions (L122), the services' tokens (L240), the partners' keys (L237) — each with its own lifetime and revocation (L237).
- **The token is verified by its signature (L240).** The bearer credential (L240) — the signature (L240) and the expiry (L240) verified, not the database (L240).
- **The keys are hashed and scoped (L275, L315).** The API keys hashed at rest (L275) and scoped per partner (L315) — the machine credential's hygiene (L237).
- **The boundary is the gateway (L236).** Auth verified once at the door (L236) — the services never re-implement it (L237).
- **The revocation is the lifecycle (L237).** The sessions revocable (L122), the tokens short-lived (L240), the keys rotatable (L275) — the credential's lifecycle is the auth's design (L237).

## 8. Common Mistakes

- **Trusting the client (L172).** The app's identity assumed (L172) — the badge not checked (L237).
- **The wrong credential (L237).** The API key for the human users (L237) — the session (L122) or the token (L240) is the fit (L237).
- **The token unverified (L240).** The bearer accepted without the signature (L240) — the forgery (L240).
- **The keys in the client (L275).** The machine credential exposed (L172) — the server-side rule (L275) broken.
- **Auth per service (L236).** Each service re-implementing the check (L236) — the scattered drift (L172).
- **No revocation (L237).** The long-lived credentials never rotatable (L275) — the leaked badge lives forever (L237).

## 9. Best Practices

- **Match the credential to the caller** (L237) — the session (L122), the token (L240), the key (L237).
- **Verify at the gateway** (L236) — the services trust the verdict (L237).
- **Verify the token's signature** (L240) — and the expiry (L240).
- **Hash and scope the keys** (L275, L315) — the machine credential's hygiene (L237).
- **Design the revocation** (L237) — the sessions revocable (L122), the keys rotatable (L275).
- **Never trust the client** (L172) — the badge checked at the door (L236).

## 10. Interview Questions

**Q: How do you authenticate an AI API?**
> A: The badge check at the gateway (L236). Three credentials, matched to the caller (L237): the session (L122) for the human users — the logged-in state; the token (L240) for the app's service calls — the bearer credential; and the API key (L237) for the partners' integrations — the machine credential. The gateway (L236) verifies once, and the services trust it (L236).

**Q: What's the difference between a session and a token?**
> A: The state and the verification (L237). The session (L122) is the server-held state: the login issues it, the request carries the cookie, and the server looks it up (L237). The token (L240) is the self-contained bearer credential: it carries the identity and the expiry (L240), verified by its signature (L240) — no server lookup. The session for the interactive users (L122), the token for the service calls (L240).

**Q: When do you use API keys?**
> A: For the machines (L237). The partners' integrations, the server-to-server calls (L237) — a long-lived secret that identifies the caller (L237). The key is hashed at rest (L275), scoped per partner (L315), and rotatable (L275). For the human users, the session (L122) or the token (L240) is the fit — the key is the machine's badge (L237).

**Q: Why authenticate at the gateway?**
> A: Because the gateway is the boundary (L236). Every request passes through it (L233), so the badge is checked once (L236) — and the services trust the verdict (L236). Scattered auth drifts and gets skipped (L172). The gateway is where the L172 discipline — never trust the client — is enforced (L236).

## 11. Follow-Up Questions

- What are the three credentials (L237)?
- Session vs token (L237)?
- When are API keys right (L237)?
- Why verify at the gateway (L236)?
- What's the revocation story (L237)?

## 12. Comparison Table — The Three Credentials

| | Session (L122) | Token (L240) | API key (L237) |
|---|---|---|---|
| Caller | the human user | the app's services | the machines |
| State | server-held (L237) | self-contained (L240) | a lookup |
| Verification | the session lookup | the signature (L240) | the key hash (L275) |
| Lifetime | the login (L122) | the expiry (L240) | long-lived, rotatable (L275) |
| The fit (L237) | interactive users | service calls | integrations |

The senior read: **the caller column is the choice** — the credential matches the audience (L237).

## 13. Code Example — The Auth Check

```js
// Authentication at the gateway: the three credentials (L237, L236).
export async function authenticate(req) {
  const auth = req.headers.authorization;

  // 1 · THE SESSION (L122) — the human user's day pass.
  if (req.cookies?.session) {
    const session = await sessionStore.get(req.cookies.session);   // the lookup (L237)
    if (session && !session.expired) return { kind: 'session', user: session.user };
  }

  // 2 · THE TOKEN (L240) — the staff ID, verified by the signature (L240).
  if (auth?.startsWith('Bearer ')) {
    const payload = verifyJwt(auth.slice(7));          // the signature + expiry (L240)
    if (payload) return { kind: 'token', user: payload.sub, scopes: payload.scopes };
  }

  // 3 · THE API KEY (L237) — the service badge, hashed and scoped (L275, L315).
  if (auth?.startsWith('Key ')) {
    const key = await keyStore.find(hash(auth.slice(4)));   // the hash lookup (L275)
    if (key && !key.revoked) return { kind: 'key', tenant: key.tenant, scopes: key.scopes };
  }

  return null;                                         // 401 — no badge (L234)
}

// THE GATEWAY (L236) — the verdict, trusted by the services (L236).
const session = await authenticate(req);
if (!session) return error(401, 'unauthenticated');    // the badge check (L237)
```

```text
What the reader must SEE — the three badges, one door:

  sessionStore.get()  → the day pass (L122, L237)
  verifyJwt()         → the staff ID's signature (L240)
  keyStore.find(hash) → the service badge, hashed (L275, L315)
  return null → 401   → the badge check (L234)

  The credential matches the caller — verified at the door (L237).
```

```narrate
4-6: The session — the human user's day pass, looked up in the store (L122, L237).
9-11: The token — the bearer credential, verified by its signature and expiry (L240).
14-16: The API key — the machine badge, found by its hash (L275) and checked for revocation (L237).
18: No badge → 401 — the client is never trusted (L172, L234).
21-22: The gateway's verdict — trusted by the services (L236).
```

> [!TIP]
> The trio that shows the match: **`req.cookies?.session`** (L122), **`auth?.startsWith('Bearer ')`** (L240), and **`auth?.startsWith('Key ')`** (L237). **The credential matches the caller — session, token, or key — and the badge is checked at the door (L237).**

## 14. Performance Notes

- **The session lookup is the fast path (L151).** The session store in Redis (L243) — the lookup sub-millisecond (L237).
- **The token verification is stateless (L151).** The signature (L240) — no lookup, the fastest path (L240).
- **The key hash is the lookup cost (L151).** The hashed key (L275) in Redis (L243) — the machine credential's check (L237).
- **The gateway is the latency budget (L151).** The auth (L237) is the first check — kept fast (L236).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The users can't log in | The session broken (L122) | The session store (L237) |
| Forged requests accepted | The token unverified (L240) | The signature check (L240) |
| The partners rejected | The keys mis-hashed (L275) | The key store (L237) |
| Auth drift | Per-service checks (L236) | The gateway's single check (L237) |
| Leaked badges live | No revocation (L275) | The rotation story (L237) |

## 16. Quick Revision Notes

- Authentication = **the badge check** (L237) — proving who's calling.
- The three credentials: **session (L122), token (L240), key (L237)**.
- The match: **the user → session, the service → token, the machine → key** (L237).
- The boundary: **verified at the gateway (L236), trusted by the services**.
- The rule: **the client is never trusted** (L172).
- The lifecycle: **revocable sessions (L122), expiring tokens (L240), rotatable keys (L275)**.

## 17. Cheat Sheet

```text
AUTHENTICATION = the badge check at the gateway

THE THREE CREDENTIALS (L237)
  session  the human user's day pass (L122) — the logged-in state
           the server-held lookup (L237) · revocable (L122)
  token    the staff ID (L240) — the bearer credential
           self-contained: the identity + the expiry (L240)
           verified by the signature (L240)
  key      the service badge (L237) — the machine credential
           hashed at rest (L275) · scoped (L315) · rotatable (L275)

THE MATCH (L237)
  the user → the session (L122) · the service → the token (L240)
  the machine → the key (L237) — the credential fits the caller

THE BOUNDARY (L236)
  verified once at the gateway (L236) — the services trust it (L236)
  the client is never trusted (L172) — the badge checked at the door

THE LIFECYCLE (L237)
  sessions revocable (L122) · tokens expiring (L240)
  keys rotatable (L275) — the credential's life is the design

INTERVIEW, 4 MOVES
  1 three   "session, token, key (L237)"
  2 match   "the caller picks the credential (L237)"
  3 boundary "verified at the gateway (L236), trusted by the services"
  4 rule    "the client is never trusted (L172)"
```

## 18. Key Takeaways

> [!RECAP]
> - Authentication is **the badge check** (L237) — proving who's calling the API, verified at the gateway (L236)
> - **The three credentials** (L237): the session (L122) for the human users, the token (L240) for the app's service calls, and the API key (L237) for the machines — the credential matches the caller (L237)
> - **The token is the self-contained bearer** (L240) — verified by its signature and expiry (L240), no server lookup
> - **The keys are hashed and scoped** (L275, L315) — the machine credential's hygiene, rotatable (L275)
> - **The boundary is the gateway** (L236) — the badge verified once, the services trusting the verdict (L236)
> - **The client is never trusted** (L172) — the L172 discipline, enforced at the door (L237)

## Check your understanding

Answer these without looking back.

1. What are the three credentials (L237)?
2. Which credential fits which caller (L237)?
3. Session vs token — the difference (L237)?
4. How is the token verified (L240)?
5. How are the keys stored (L275)?
6. Why verify at the gateway (L236)?
7. What's the revocation story (L237)?
8. What's the L172 rule (L172)?

## A Closing Note — The Three Badges, One Door

You now hold the badge check: **the session for the users, the token for the services, the key for the machines — each verified at the gateway, each with its lifecycle.** The front door now knows who's calling (L237).

Next: what they're allowed to do — authorization (L238), scopes, quotas, and policy.
