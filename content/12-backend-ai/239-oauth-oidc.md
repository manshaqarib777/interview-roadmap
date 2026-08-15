# Lesson 239 — OAuth 2.0 & OIDC

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do your customers delegate access?" — the answer is *OAuth 2.0 & OIDC*: the delegated-auth standard — authorization codes, tokens, and scopes (L237, L240).**

L237–238 built auth; this lesson is the **standard your customers will ask for**: OAuth 2.0 & OIDC — the delegated authorization protocol: the user grants your app access to their account without sharing the password (L239). The flows: the **authorization code** (the web flow, L239), the **token exchange** (L240), and **OIDC** (the identity layer — the ID token, L239). The AI platform's shape: your customers' users sign in with their provider (Google, GitHub) and your app gets a scoped token (L240).

The distinction this lesson is built on: a **demo** asks for the password. A **solutions architect** implements the standard: the authorization code flow (L239), the token exchange (L240), the scopes (L238), and OIDC's ID token (L239) — because delegation is the customer expectation (L239).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain OAuth 2.0: delegated authorization without the password (L239)
- Explain the authorization code flow: the user, the provider, the app (L239)
- Explain the token exchange: the code → the access token (L240)
- Explain the scopes: what the token may do (L238)
- Explain OIDC: the identity layer and the ID token (L239)

## 1. One-Line Definition

**OAuth 2.0 is the delegated-authorization standard — the user grants your app access to their account without sharing the password (L239): the authorization code flow exchanges a code for an access token (L240) with scopes (L238), and OIDC adds the identity layer — the ID token that proves who the user is (L239) — the auth your customers will ask for (L239).**

The one-sentence interview answer: *"OAuth 2.0 is delegated authorization (L239). The user doesn't give your app their password — they authorize your app with their provider (Google, GitHub), and the provider gives your app a scoped token (L240). The flow: the authorization code — the user signs in at the provider, the provider redirects back to your app with a one-time code (L239); the token exchange — your app trades the code for an access token (L240), a credential with scopes (L238) and an expiry (L240); the access — your app calls the provider's API with the token (L240). OIDC adds the identity layer: an ID token (L239) that proves who the user is — so your app knows the user without asking (L239). The scopes (L238) are the fine print: the token can do only what the user granted (L239)."*

## 2. Mental Model

Think of OAuth as **the valet key.** The car owner (the user) doesn't hand you (your app) the full key (the password) — they give the valet key (the scoped token, L240): it starts the car (basic access) but doesn't open the trunk (the limited scopes, L238). The dealership (the provider, L239) issues the valet key: the owner signs in there (the authorization, L239), the dealership confirms to you (the code, L239), and you trade the confirmation for the valet key (the token exchange, L240). The valet key expires (L240) and does only what the owner granted (L238). The system works because the password never changes hands (L239).

```text
   the owner (the user)          the dealership (the provider, L239)
   ┌──────────────────────┐      ┌──────────────────────────────┐
   │ signs in at the      │      │ issues the valet key (the    │
   │ dealership (L239)    │ ───► │ token, L240) with scopes     │
   │ never hands the      │      │ (L238) and an expiry (L240)  │
   │ password to you      │      └──────────────────────────────┘
   └──────────────────────┘
```

The mental model is **the valet key**: the password stays with the owner, and your app gets a scoped, expiring token (L239).

## 3. Visual Flow — The Authorization Code Flow

```text
   the user wants to sign in with the provider (L239)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE AUTHORIZATION REQUEST (L239)                     │
   │     your app redirects to the provider with the scopes   │
   │     (L238) and the client ID (L239)                      │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE USER CONSENTS (L239)                             │
   │     the user signs in and grants the scopes (L238)       │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE CODE (L239)                                      │
   │     the provider redirects back with a one-time code     │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · THE EXCHANGE (L240)                                  │
   │     your app trades the code for the access token (L240) │
   │     — with the scopes (L238) and the expiry (L240)       │
   └──────────────────────────────────────────────────────────┘
```

The flow is the standard: **authorize → consent → code → exchange** — the password never changes hands (L239).

## 4. How It Works — The Code, the Token, the Scopes, the Identity

- **The authorization code (L239).** The one-time code: the user authorizes at the provider (L239), and the provider redirects back to your app with the code (L239). The code is short-lived and single-use (L239).
- **The token exchange (L240).** Your app trades the code for the access token (L240): a credential with the scopes (L238), the expiry (L240), and the audience (L239). The exchange happens server-to-server, with your client secret (L275).
- **The scopes (L238).** The fine print of the token (L238): what the token may do — read the profile, read the email, write the calendar (L238). The user granted exactly these (L239).
- **The refresh (L240).** The access token expires (L240); the refresh token (L240) obtains the new one without re-consent (L239).
- **OIDC (L239).** The identity layer: an ID token (L239) — a signed claim (L240) proving who the user is (L239) — so your app knows the user's identity (L239).

> [!NOTE]
> **The standard's value is the password never changing hands (L239).** The user's credential stays with the provider (L239); your app gets a scoped, expiring token (L240) — and the token can be revoked (L239) without the user changing their password (L239). The scopes (L238) are the token's fine print: the app can do only what the user granted (L239). The senior design implements the standard (L239) rather than rolling its own (L237) — delegation is the customer expectation, and the standard is the trust (L239).

## 5. Real Project Usage

- **Sign in with Google / GitHub (L239).** The user's sign-in → the authorization code flow (L239) → the ID token (L239) → your app knows the user (L239).
- **The AI SaaS's integrations (L239).** The customer connects their CRM (L223) or calendar — the OAuth flow (L239) gives your app the scoped token (L240) to their account (L239).
- **The partner API (L237).** The partners' service-to-service auth (L237) — the client credentials flow (L239).
- **The mobile app (L240).** The token (L240) with the refresh (L240) — the mobile session (L239).
- **Anything delegated (L260).** The L239 standard is the delegated auth (L239) — the auth your customers will ask for (L260).

The through-line: **delegation is the customer expectation** — the standard lets your app act on the user's behalf, scoped and revocable (L239).

## 6. Interview Explanation

Say it in four moves:

1. **The standard.** "OAuth 2.0 — delegated authorization without the password (L239)."
2. **The flow.** "Authorize → consent → code → exchange (L239, L240)."
3. **The token.** "A scoped (L238), expiring (L240), refreshable (L240) credential."
4. **The identity.** "OIDC's ID token — who the user is (L239)."

## 7. Senior-Level Insights

- **The standard is the trust (L239).** The senior answer implements OAuth 2.0 (L239) rather than rolling its own (L237) — the standard is what the customers trust (L239).
- **The scopes are the token's fine print (L238).** The least-privilege scopes (L238) — the token can do only what the user granted (L239) — the L238 discipline inside the standard (L239).
- **The client secret is server-side (L275).** The exchange (L240) uses the client secret (L275) — server-side, never in the client (L172).
- **The refresh is the session's life (L240).** The refresh token (L240) extends the session without re-consent (L239) — with the revocation story (L239).
- **The ID token is the identity (L239).** OIDC's ID token (L239) — signed (L240) — proves who the user is (L239) — the identity without the extra API call (L239).

## 8. Common Mistakes

- **Asking for the password (L239).** The delegation skipped (L239) — the credential mishandled (L172).
- **The secret in the client (L275).** The client secret exposed (L172) — the exchange's credential (L275) misplaced.
- **Over-broad scopes (L238).** The token granted more than needed (L238) — the least privilege (L238) ignored (L239).
- **The code mishandled (L239).** The one-time code reused (L239) — the exchange's single-use rule broken (L239).
- **No refresh story (L240).** The user re-consents every expiry (L240) — the refresh token (L240) missing (L239).
- **Rolling its own (L237).** The custom auth instead of the standard (L239) — the trust and the review burden (L239).

## 9. Best Practices

- **Implement the standard** (L239) — OAuth 2.0 (L239) and OIDC (L239).
- **Request the least-privilege scopes** (L238) — only what the app needs (L239).
- **Keep the client secret server-side** (L275) — never in the client (L172).
- **Design the refresh and the revocation** (L240, L239) — the session's life and the kill switch (L239).
- **Validate the ID token's signature** (L240) — the identity's proof (L239).
- **Use the standard's libraries** (L239) — the reviewed implementation (L239).

## 10. Interview Questions

**Q: What is OAuth 2.0?**
> A: The delegated-authorization standard (L239). The user authorizes your app with their provider — without giving your app the password (L239). The flow: the user consents at the provider (L239), the provider returns a code (L239), your app exchanges the code for an access token (L240) with scopes (L238) and an expiry (L240). OIDC adds the identity layer — the ID token proving who the user is (L239).

**Q: Why not just ask for the password?**
> A: Because delegation is the standard (L239). The user's credential stays with the provider (L239) — your app gets a scoped (L238), expiring (L240), revocable (L239) token instead. The user can revoke the app's access without changing their password (L239). Asking for the password is a credential mishandling (L172) — the standard is the trust (L239).

**Q: How do the scopes work?**
> A: The token's fine print (L238). The authorization request asks for the scopes (L238) — read the profile, read the email — and the user consents to exactly those (L239). The access token (L240) can do only what the scopes allow (L238). The senior design requests the least-privilege scopes (L238) — only what the app needs (L239).

**Q: What does OIDC add?**
> A: The identity layer (L239). OAuth 2.0 is about *access* — the token that calls the API (L240). OIDC adds the *identity* — an ID token (L239), a signed claim (L240) that proves who the user is (L239). Your app knows the user's identity from the ID token's claims (L239) — without a separate identity API call (L239).

## 11. Follow-Up Questions

- What's the authorization code flow (L239)?
- How does the token exchange work (L240)?
- What are the scopes (L238)?
- What does the refresh token do (L240)?
- What does OIDC add (L239)?

## 12. Comparison Table — The Flows

| | Auth code (L239) | Client credentials (L239) | OIDC (L239) |
|---|---|---|---|
| Caller | the user | the machine (L237) | the user |
| The grant | the user consents (L239) | the app itself (L237) | the user's identity |
| The token | the access token (L240) | the service token (L240) | the ID token (L239) |
| Scopes (L238) | the user's grant | the app's scopes (L238) | the identity's claims |
| The fit (L239) | sign-in, integrations | service-to-service | knowing who the user is |

The senior read: **the caller column is the choice** — the flow fits the caller and the need (L239).

## 13. Code Example — The Exchange

```js
// OAuth 2.0: the authorization code flow (L239, L240).
// 1 · THE AUTHORIZATION REQUEST (L239) — the redirect to the provider.
const authUrl = provider.authorizeUrl({
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  scope: 'openid profile email',               // the least-privilege scopes (L238)
  response_type: 'code',
});

// 2 · THE CALLBACK (L239) — the provider redirects back with the code.
export async function oauthCallback(req) {
  const { code, state } = req.query;
  if (state !== session.state) return error(400, 'state mismatch');   // CSRF (L239)

  // 3 · THE EXCHANGE (L240) — the code → the token, server-to-server (L275).
  const { access_token, id_token, refresh_token } = await provider.exchange(code, {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,              // server-side, never the client (L275)
    redirect_uri: REDIRECT_URI,
  });

  // 4 · THE IDENTITY (L239) — OIDC's ID token proves who the user is (L240).
  const claims = verifyJwt(id_token);          // the signature (L240)
  return signIn({ sub: claims.sub, email: claims.email, scopes: claims.scope });
}
```

```text
What the reader must SEE — the valet key, end to end:

  authorizeUrl + scopes → the consent request (L239, L238)
  state check           → the CSRF guard (L239)
  provider.exchange     → the code → the token (L240)
  client_secret         → server-side (L275)
  verifyJwt(id_token)   → the identity (L239, L240)

  The password never changes hands — the token is scoped and signed.
```

```narrate
4-8: The authorization request — the redirect with the least-privilege scopes (L239, L238).
10-12: The callback — the code arrives, with the state check against CSRF (L239).
14-19: The exchange — the code is traded for the tokens, server-to-server with the secret (L240, L275).
21-23: The identity — the ID token's signature proves who the user is (L239, L240).
```

> [!TIP]
> The pair that defines the standard: **`scope: 'openid profile email'`** (the fine print, L238) and **`verifyJwt(id_token)`** (the identity, L239). **The scoped valet key, with the identity proven — the password never changes hands (L239).**

## 14. Performance Notes

- **The exchange is the one-time cost (L151).** The code exchange (L240) happens once per session — the tokens (L240) then serve the requests (L239).
- **The token verification is stateless (L240).** The access token's signature (L240) — no lookup, the fast path (L240).
- **The refresh is the session's life (L240).** The refresh token (L240) obtains the new access tokens (L240) — without re-consent (L239).
- **The provider call is the third party (L151).** The exchange (L240) is a provider round trip — the one-time cost, cached by the tokens (L240).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The flow fails at the callback | The redirect URI mismatch (L239) | The registered redirect (L239) |
| The CSRF attack | The state unverified (L239) | The state check (L239) |
| The scopes too wide | The request over-asks (L238) | The least-privilege scopes (L238) |
| The token rejected | The expiry or audience (L240) | The token's claims (L240) |
| The secret leaked | In the client (L275) | Server-side (L172) |

## 16. Quick Revision Notes

- OAuth 2.0 = **delegated authorization** (L239) — no password sharing.
- The flow: **authorize → consent → code → exchange** (L239, L240).
- The token: **scoped (L238), expiring (L240), refreshable (L240)**.
- The secret: **server-side (L275), never the client (L172)**.
- OIDC: **the ID token — who the user is** (L239).
- The standard: **the trust** (L239) — implement it, don't roll your own (L237).

## 17. Cheat Sheet

```text
OAUTH 2.0 & OIDC = the delegated-auth standard

THE IDEA (L239)
  the user authorizes your app with their provider
  the password NEVER changes hands (L239)
  your app gets a scoped (L238), expiring (L240), revocable (L239) token

THE FLOW (L239, L240)
  authorize  the redirect with the scopes (L238) + the client ID (L239)
  consent    the user signs in and grants (L239)
  code       the provider returns a one-time code (L239)
  exchange   the code → the access token (L240) — server-to-server (L275)
  refresh    the refresh token (L240) renews without re-consent (L239)

THE FINE PRINT (L238)
  the scopes are what the user granted (L239)
  request the least-privilege scopes (L238)

THE IDENTITY (L239)
  OIDC's ID token — a signed claim (L240) of who the user is (L239)
  verify the signature (L240) — no separate identity call (L239)

THE RULES
  the client secret is server-side (L275), never the client (L172)
  the state check against CSRF (L239)
  implement the standard (L239), don't roll your own (L237)

INTERVIEW, 4 MOVES
  1 standard "delegated auth — no password sharing (L239)"
  2 flow     "authorize, consent, code, exchange (L239, L240)"
  3 token    "scoped (L238), expiring (L240), refreshable (L240)"
  4 identity "OIDC's ID token — who the user is (L239)"
```

## 18. Key Takeaways

> [!RECAP]
> - OAuth 2.0 is **delegated authorization** (L239): the user authorizes your app with their provider — the password never changes hands (L239)
> - **The flow** (L239, L240): the authorization request with the scopes (L238), the user's consent (L239), the one-time code (L239), and the exchange for the access token (L240) — server-to-server with the client secret (L275)
> - **The token is the valet key** (L240): scoped (L238), expiring (L240), refreshable (L240), and revocable (L239)
> - **The scopes are the fine print** (L238) — the token can do only what the user granted (L239); request the least-privilege scopes (L238)
> - **OIDC adds the identity layer** (L239): the ID token — a signed claim (L240) proving who the user is (L239)
> - **Implement the standard** (L239) rather than rolling your own (L237) — delegation is the customer expectation, and the standard is the trust (L260)

## Check your understanding

Answer these without looking back.

1. What's the value of OAuth (L239)?
2. What's the authorization code flow (L239)?
3. How does the exchange work (L240)?
4. What are the scopes (L238)?
5. What does the refresh token do (L240)?
6. What does OIDC add (L239)?
7. Where does the client secret live (L275)?
8. Why implement the standard (L239)?

## A Closing Note — The Valet Key

You now hold the delegated standard: **the scoped, expiring, revocable token; the code exchange; and the ID token that proves who the user is.** Your app now acts on the user's behalf — without ever holding their password (L239).

Next: the token itself — JWT (L240), signed claims, expiry, and the verification path.
