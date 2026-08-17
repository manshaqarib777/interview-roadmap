# Lesson 321 — Secret Management

**Interview importance:** ⭐⭐⭐⭐⭐ — "where the model keys live, and how they never reach the client" — the answer is *the secret discipline*: the vault, the injection, and the client boundary (L321).**

L275 built the secret store (L275) and L301 the pipeline's rule (L301); this lesson is **the AI's secret discipline**: the secret management — where the model keys live, and how they never reach the client (L321): the secrets (the model keys L278, the DB passwords L268, the third-party keys L227), the storage (the vault L275), and the boundary (the keys never in the client L321). The AI shape (L173): the model calls (L278) — the keys (L321) from the vault (L275), never the client (L321). This lesson is the key's boundary (L321).

The distinction this lesson is built on: a **demo** bakes the key. A **solutions architect** vaults the key (L321): the storage (L275), the injection (L321), and the client boundary (L321) — because the key in the client (L321) is the account's (L275).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the secrets: the model keys, the DB passwords (L321)
- Explain the storage: the vault (L275)
- Explain the injection: the server-side fetch (L321)
- Explain the boundary: the keys never reach the client (L321)
- Explain the AI shape: the key's boundary (L321)

## 1. One-Line Definition

**The secret management is where the model keys live, and how they never reach the client (L321) — the secrets (the model keys L278, the DB passwords L268, the third-party keys L227, L321), the storage (the vault: the Secrets Manager L275, the hashed and the rotated L275), and the injection (the server-side fetch: the backend L266 reads the key at the runtime L301, L321) — the boundary (L321): the keys never in the client (L96) — the L321 rule (L321).**

The one-sentence interview answer: *"The secret management is the key's discipline (L321). The secrets (L321): the model keys (L278) — the Bedrock (L278) and the OpenAI (L152); the DB passwords (L268); the third-party keys (L227). The storage (L321): the vault (L275) — the Secrets Manager (L275) — the keys hashed (L275) and rotated (L275). The injection (L321): the server-side fetch (L321) — the backend (L266) reads the key (L275) at the runtime (L301) — the key in the environment (L300) or the vault's reference (L275), never in the code (L301). The boundary (L321): the keys never reach the client (L321) — no `NEXT_PUBLIC_` key (L96), no key in the bundle (L321), no key in the image (L293) — the L321 rule (L321): the client (L96) calls the backend (L267), the backend (L266) holds the key (L321). The AI shape (L173): the model calls (L278) — the key (L321) from the vault (L275) at the server (L321), the client (L96) never sees it (L321). The demo bakes the key; the architect vaults it (L321)."*

## 2. Mental Model

Think of the secret management as **the bank's master key.** The master key (the model key, L278) opens the vault (the model account, L321). The bank's rule (L321): the master key never leaves the bank's strongroom (the vault, L275) — never handed to the customers (the client, L96) — the tellers (the backend, L266) fetch it from the strongroom (L275) when they need it (L321). The key's copies (the hashes, L275) are in the ledger (L275), and the key is re-cut (the rotation, L275) on the schedule (L321). The customers (the client, L96) see the tellers (the backend, L267) — never the master key (L321). The bank works because the key stays in the strongroom, the tellers fetch it, and the customers never hold it (L321).

```text
   the master key (the model key, L278)
   ┌────────────────────────────────────────────────────────┐
   │ the strongroom (the vault, L275) — the key's home      │
   │ the tellers (the backend, L266) — fetch on demand      │
   │ (L321)                                                 │
   │ the customers (the client, L96) — never hold it (L321) │
   │ the ledger (the hashes, L275) · the re-cut (the        │
   │ rotation, L275)                                        │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the master key**: the strongroom, the tellers, and the customers (L321).

## 3. Visual Flow — One Key's Life

```text
   the key is created (L321)
        │
        ▼
   ┌────────────────────── THE VAULT (L275) ────────────────────────────┐
   │  the Secrets Manager (L275) — the hashed (L275), the rotated      │
   │  (L275)                                                           │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE INJECTION (L321) ────────────────────────┐
   │  the backend (L266) fetches at the runtime (L301)                 │
   │  the env (L300) or the vault's reference (L275)                   │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE BOUNDARY (L321) ─────────────────────────┐
   │  the model call (L278) — the server-side (L321)                   │
   │  the client (L96) — never the key (L321)                          │
   │  no NEXT_PUBLIC_ key (L96) · no key in the bundle (L321)          │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the key's life: **vault → inject → boundary** (L321).

## 4. How It Works — The Discipline, Part by Part

- **The secrets (L321).** The keys (L321): the model keys (L278), the DB passwords (L268), the third-party keys (L227).
- **The storage (L321).** The vault (L275): the Secrets Manager (L275) — the keys hashed (L275) and rotated (L275).
- **The injection (L321).** The server-side fetch (L321): the backend (L266) reads the key (L275) at the runtime (L301) — the env (L300) or the vault's reference (L275).
- **The boundary (L321).** The keys never reach the client (L321): no `NEXT_PUBLIC_` key (L96), no key in the bundle (L321), no key in the image (L293).

> [!NOTE]
> **The key in the client is the account's exposure (L321).** The senior answer is absolute (L321): anything with `NEXT_PUBLIC_` (L96) ships to the browser (L96) — the key (L321) is in every visitor's devtools (L321). The L321 rule (L321): the client (L96) calls the backend (L267), the backend (L266) holds the key (L321), and the key (L321) never crosses the network boundary (L321) to the browser (L96).

## 5. Real Project Usage

- **A production AI SaaS (L357).** The model keys (L278) in the vault (L275) — the backend (L266) fetches at the runtime (L301).
- **A Next.js app (L96).** The server-side fetch (L321) — the API route (L267) holds the key (L321), the client (L96) never (L321).
- **A CI/CD pipeline (L301).** The OIDC (L297) — the keyless AWS (L297) — and the vault (L275) for the runtime (L321).
- **A regulated workload (L371).** The keys (L275) in the vault (L275) — the access (L262) logged (L322) — the compliance (L371).
- **Anything with a model (L278).** The key's boundary (L321) — the vault (L275) and the server (L321).

The through-line: **the boundary is the key's** — the vault, the server, never the client (L321).

## 6. Interview Explanation

Say it in four moves:

1. **The secrets.** "The model keys (L278), the DB passwords (L268), the third-party (L227)."
2. **The storage.** "The vault — the Secrets Manager (L275), the hashed, the rotated (L275)."
3. **The injection.** "The backend fetches at the runtime (L301)."
4. **The boundary.** "The keys never reach the client (L321)."

## 7. Senior-Level Insights

- **The vault is the keys' home (L275).** The Secrets Manager (L275) — the hashed (L275), the rotated (L275), the scoped access (L262).
- **The server is the keys' holder (L321).** The backend (L266) fetches (L321) — the client (L96) never holds (L321).
- **The runtime injection is the flow (L301).** The vault's reference (L275) in the task (L295) — the container (L288) fetches at the start (L301).
- **The OIDC is the CI's keyless path (L297).** The workflow (L297) assumes the role (L262) — no keys (L275) in the pipeline (L301).
- **The rotation is the containment (L275).** The rotated keys (L275) — the leak (L275) bounded (L321).

## 8. Common Mistakes

- **The `NEXT_PUBLIC_` key (L96).** The model key (L278) with the public prefix (L96) — in every visitor's devtools (L321) — the L321 rule (L321) broken (L321).
- **The key in the bundle (L321).** The env (L300) baked into the client bundle (L96) — the key (L321) shipped (L321).
- **The key in the image (L293).** The key in the Dockerfile's env (L293) — the layers (L289) hold it (L293) — the runtime's vault (L275) is the home (L321).
- **The key in the repo (L301).** The committed key (L301) — the L301 rule (L301) — the vault (L275) is the home (L321).
- **The un-rotated key (L275).** The leaked key (L275) alive (L275) — the rotation (L275) is the containment (L321).

## 9. Best Practices

- **Vault every key** (L275) — the Secrets Manager (L275).
- **Fetch on the server** (L321) — the backend (L266) at the runtime (L301).
- **Keep the client clean** (L321) — no `NEXT_PUBLIC_` key (L96), no bundle key (L321).
- **Use the OIDC** (L297) — the pipeline's keyless path (L301).
- **Rotate the keys** (L275) — the leak's containment (L321).

## 10. Interview Questions

**Q: Walk me through the secret management.**
> A: The key's discipline (L321). The secrets — the model keys (L278), the DB passwords (L268), the third-party (L227). The storage — the vault (L275), the hashed and the rotated (L275). The injection — the server-side fetch (L321). And the boundary — the keys never reach the client (L321).

**Q: Why can't the key be in the client?**
> A: The exposure (L321): anything in the client (L96) ships to the browser (L96) — the key (L321) is in every visitor's devtools (L321), and the account (L321) is theirs (L321). The L321 rule (L321): the client (L96) calls the backend (L267), and the backend (L266) holds the key (L321).

**Q: How does the backend get the key?**
> A: The vault (L275): the task (L295) references the secret (L275), and the backend (L266) fetches it at the runtime (L301) — the key in the env (L300) or the vault's reference (L275), never in the code (L301) and never in the image (L293).

**Q: What about the pipeline's keys?**
> A: The OIDC (L297): the workflow (L297) assumes the IAM role (L262) directly (L297) — no AWS keys (L275) in the GitHub secrets (L301) to leak (L301). The L301 rule (L301) and the L321 rule (L321) — the keys never in the repo, never in the client (L321).

## 11. Follow-Up Questions

- What are the secrets (L321)?
- What's the storage (L275)?
- What's the injection (L321)?
- Why can't the key be in the client (L321)?
- What about the pipeline (L301)?

## 12. Comparison Table — The Key's Homes

| | The vault (L275) | The server (L321) | The client (L321) |
|---|---|---|---|
| The rule (L321) | the home (L275) | the holder (L321) | never (L321) |
| The visibility (L321) | the scoped (L262) | the runtime (L301) | the devtools (L321) |
| The risk (L321) | the scoped access (L262) | the leak (L275) | the account's (L321) |

The senior read: **the vault holds, the server fetches, the client never sees** (L321).

## 13. Code Example — The Boundary, Applied

```js
// The secret discipline (L321) — the server holds, the client never (L321).
// 1 · THE VAULT (L275) — the key stored (L275).
//   aws secretsmanager put-secret-value \
//     --secret-id ai/model-key --secret-string "sk-..."     (L275)

// 2 · THE SERVER-SIDE FETCH (L321) — the backend reads (L301).
import { getSecret } from './vault.js';           // L275

export async function POST(req) {                 // the API route (L267)
  // the model key — fetched on the server (L321):
  const modelKey = await getSecret('ai/model-key');   // L275, L301
  const response = await model.invoke({ modelKey, body: await req.json() });
  return Response.json(response);
}

// 3 · THE CLIENT (L96) — never the key (L321).
//   ❌ process.env.NEXT_PUBLIC_MODEL_KEY      — the devtools leak (L96)
//   ✅ fetch('/api/chat', { body })           — the backend holds (L321)

// 4 · THE ROTATION (L275) — the schedule (L275).
//   the rotated key (L275) — the leak's containment (L321)
```

```text
What the reader must SEE — the boundary, applied:

  put-secret-value           → the vault (L275)
  getSecret on the server    → the injection (L321)
  fetch('/api/chat')         → the client's path (L96)
  NEXT_PUBLIC_ ✗             → the forbidden (L96, L321)
  the rotation               → the containment (L275)

  The vault holds, the server fetches, the client never sees (L321).
```

```narrate
4-6: The vault — the key stored in the Secrets Manager (L275).
8-15: The server — the API route fetches the key and calls the model (L267, L321).
17-19: The client — the fetch to the backend, never the key (L96, L321).
21-22: The rotation — the scheduled replacement (L275, L321).
```

> [!TIP]
> The pair that defines the discipline: **the vault's secret** (the storage, L275) and **the server-side fetch** (the boundary, L321). **Vault the keys, fetch on the server, keep the client clean — the key's boundary (L321).**

## 14. Performance Notes

- **The fetch is the runtime's cost (L321).** The vault read (L275) at the start (L301) — the seconds (L321) once (L321), the cache (L275) after (L321).
- **The vault is the ops' cost (L275).** The secrets (L275) — the rotation (L275) and the access (L262) — the small cost (L275) for the safety (L321).
- **The client boundary is the zero-cost rule (L321).** The server-side fetch (L321) — no cost (L321), the account safe (L321).
- **The rotation is the containment's cost (L275).** The rotated keys (L275) — the leak's blast radius (L314) bounded (L321).

## 15. Debugging Scenarios

| Symptom | First check (L321) | The lever |
|---|---|---|
| The key is in the devtools | The client (L96) | The server-side fetch (L321) |
| The key is in the bundle | The env (L96) | The `NEXT_PUBLIC_` removed (L96) |
| The task fails at the start | The vault (L275) | The secret's reference (L275) |
| The leaked key lives | The rotation (L275) | The rotation (L275) |
| The pipeline's key leaks | The OIDC (L297) | The keyless role (L297) |

## 16. Quick Revision Notes

- The secret management = **the key's boundary** (L321): the secrets, the storage, the injection, the boundary.
- The secrets: **the model keys (L278), the DB passwords (L268), the third-party (L227)**.
- The storage: **the vault (L275) — the hashed, the rotated (L275)**.
- The injection: **the server-side fetch (L321) — at the runtime (L301)**.
- The boundary: **the keys never reach the client (L321)**.

## 17. Cheat Sheet

```text
SECRET MANAGEMENT = where the model keys live, and never the client

THE SECRETS (L321)
  the model keys (L278) — the Bedrock (L278), the OpenAI (L152)
  the DB passwords (L268) · the third-party keys (L227)

THE STORAGE (L321)
  the vault (L275) — the Secrets Manager (L275)
  the hashed (L275) · the rotated (L275) · the scoped access (L262)

THE INJECTION (L321)
  the server-side fetch (L321) — the backend (L266)
  at the runtime (L301) — the env (L300) or the reference (L275)
  never in the code (L301) · never in the image (L293)

THE BOUNDARY (L321)
  the keys never reach the client (L321)
  no NEXT_PUBLIC_ key (L96) · no key in the bundle (L321)
  the client (L96) calls the backend (L267) — the backend holds (L321)

INTERVIEW, 4 MOVES
  1 secrets  "the model keys, the DB passwords (L321)"
  2 storage  "the vault — the hashed, the rotated (L275)"
  3 injection "the server-side fetch (L321)"
  4 boundary "the keys never reach the client (L321)"
```

## 18. Key Takeaways

> [!RECAP]
> - The secret management is **where the model keys live, and how they never reach the client** (L321): the secrets (L321), the storage (L321), the injection (L321), and the boundary (L321)
> - **The secrets** (L321): the model keys (L278), the DB passwords (L268), and the third-party keys (L227)
> - **The storage** (L321): the vault (L275) — the Secrets Manager (L275) — the keys hashed (L275) and rotated (L275)
> - **The injection** (L321): the server-side fetch (L321) — the backend (L266) reads the key (L275) at the runtime (L301), never in the code (L301) and never in the image (L293)
> - **The boundary** (L321): the keys never reach the client (L321) — no `NEXT_PUBLIC_` key (L96), no key in the bundle (L321)
> - The AI shape (L321): the model calls (L278) — the key (L321) from the vault (L275) at the server (L321), the client (L96) never sees it (L321) — the L321 rule (L321): the client calls the backend (L267), the backend holds the key (L321)

## Check your understanding

Answer these without looking back.

1. What are the secrets (L321)?
2. What's the storage (L275)?
3. What's the injection (L321)?
4. Why can't the key be in the client (L321)?
5. What about the pipeline (L301)?
6. What's the rotation (L275)?
7. What's the NEXT_PUBLIC_ rule (L96)?
8. What is the key's boundary (L321)?

## A Closing Note — The Master Key, Kept

You now hold the discipline: **the secrets, the storage, the injection, and the boundary — with the vault holding and the client clean.** The master key stays in the strongroom — and the tellers fetch it (L321).

Next: who prompted what, with which tools, at what cost — Audit Logs & Governance Records (L322).
