# Topic 20 — Laravel Passport

**Checklist anchor:** OAuth2 · access tokens · refresh tokens · clients · scopes · OAuth flows

**Owning lesson:** [122 Authentication](../122-authentication.md)

---

## The one-sentence answer

**Passport is Laravel's full OAuth2 server — clients, access/refresh tokens, and scopes — for when third-party applications must authenticate against your API.**

## The mental model

Passport is for the **public API with external clients**. The difference from Sanctum:

```text
Sanctum    →  my own apps (SPA, my mobile)  →  simple tokens, my rules
Passport   →  third-party apps              →  OAuth2: they get credentials from ME
```

OAuth2 is a *protocol* with a cast of players:

- **Resource owner** — the user whose data is being accessed.
- **Client** — the third-party app asking for access (registers with your server, gets a client id + secret).
- **Authorization server** — your Laravel app (Passport).
- **Scopes** — what the client may do (like Sanctum's abilities, but granted to the *client*).

## How it works — the core pieces

### Clients

```php
// a third-party app registers → gets credentials:
php artisan passport:client --name="My iOS App"
// Client ID + Client Secret — the app sends these to authenticate itself
```

### Access & refresh tokens

- **Access token** — short-lived (hours), sent as `Authorization: Bearer`, proves the grant.
- **Refresh token** — long-lived, exchanged for a *new* access token when the old one expires, without re-authenticating the user.

```text
client ──(grant: credentials/authorization code)──► Laravel (Passport)
   ◄── access token + refresh token ──
client ──(Bearer access token)──► /api/orders        ✅
   ... access token expires ...
client ──(refresh token)──► /oauth/token ──► NEW access token
```

### OAuth flows (grants)

| Grant | Who it's for | Flow |
|---|---|---|
| **Authorization code** | Third-party web apps | Redirect to login → consent → code → exchange for tokens |
| **Password grant** | Trusted first-party clients | Directly exchange username/password for tokens |
| **Client credentials** | Server-to-server | The client's own credentials → token, no user |
| **Refresh token** | All of the above | Swap a refresh token for a new access token |

### Scopes

```php
// define scopes in a provider:
Passport::tokensCan([
    'read-orders' => 'Read your orders',
    'write-orders' => 'Create orders',
]);

// client asks for scopes during the grant; middleware enforces:
Route::get('/orders', ...)->middleware('scope:read-orders');
```

## When you actually need Passport (vs Sanctum)

The checklist's guidance is deliberate: **"You don't necessarily need to memorize every implementation detail unless the job specifically uses Passport."** The interview bar is *conceptual*:

- Know what OAuth2 is and when it applies.
- Know the players: resource owner, client, authorization server, scopes.
- Know access vs refresh tokens.
- Know **when to pick Passport over Sanctum** — that's the question that actually gets asked.

**The answer:** Sanctum for your own first-party apps (SPA, mobile). Passport when *third parties* need OAuth2 — a public API that external clients register against with their own credentials. If the job is a B2B platform or public API, Passport is in play; for a first-party SaaS, it's usually overkill.

## Interview questions

**Q1. What is Passport?**
> Laravel's OAuth2 server. It lets external applications register as clients, authenticate users through OAuth2 grants, and receive access and refresh tokens with scoped permissions. It's the "open your API to third parties" solution, as opposed to Sanctum's first-party tokens.

**Q2. Access token vs refresh token?**
> An access token is short-lived (hours) and is what actually authorizes API requests — `Authorization: Bearer`. A refresh token is long-lived and is exchanged for a new access token when the old one expires — so the client keeps working without making the user log in again. The short access-token life limits the damage if one leaks; the refresh token is stored securely client-side.

**Q3. What are OAuth2 clients and scopes?**
> A client is a third-party application registered with your server — it gets an id and secret used in the OAuth flow. Scopes are permission bundles the client may request — `read-orders`, `write-orders` — enforced on routes with middleware. Clients are "who's asking"; scopes are "what they may do."

**Q4. What are the main OAuth flows?**
> Authorization code — third-party web apps: redirect, user consents, exchange the code for tokens. Password grant — trusted clients: credentials directly for tokens. Client credentials — server-to-server: the client's own credentials, no user. Plus the refresh-token grant to renew access tokens. The flows differ in *who* proves what.

**Q5. Passport vs Sanctum?**
> Sanctum for my own apps — simple personal tokens and SPA sessions, no OAuth2. Passport when third-party apps must authenticate — OAuth2 clients, grants, scopes. The trigger is external clients: if other companies' apps will log into my API, Passport; if it's just my SPA and mobile app, Sanctum.

**Senior follow-up: What are the security considerations with OAuth2?**
> Short access-token lifetimes, secure storage of refresh tokens and client secrets, `state`/PKCE on the authorization code flow (code injection defence), HTTPS-only, and scopes granted at the minimum the client needs. OAuth2's complexity is mostly *security surface* — which is why the first-party case prefers Sanctum.

## Common mistakes

❌ Using Passport for a first-party SPA — OAuth2 complexity, Sanctum is the fit.

❌ Long-lived access tokens — the whole point of refresh tokens is short access tokens.

❌ Ignoring scopes — a client with full permissions is a liability.

❌ Memorizing every OAuth2 detail — the interview bar is conceptual: players, tokens, when-to-use.

## Quick revision notes

- Passport = **full OAuth2 server** for third-party clients
- Players: **resource owner** (user) · **client** (external app) · **authorization server** (you) · **scopes** (permissions)
- **Access token** (short, `Bearer`) · **refresh token** (long, renews)
- Flows: **authorization code** · **password grant** · **client credentials** · **refresh**
- Sanctum for **first-party**; Passport for **third-party**
- Interview bar: **conceptual**, not every detail — unless the role uses Passport

## Check your understanding

1. What is a client, and what credentials does it hold?
2. Why do access tokens expire while refresh tokens don't?
3. Which OAuth flow fits a third-party web app?
4. What do scopes add, and where are they enforced?
5. When is Passport the right call over Sanctum?
