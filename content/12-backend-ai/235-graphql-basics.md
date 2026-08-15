# Lesson 235 — GraphQL Basics

**Interview importance:** ⭐⭐⭐⭐ — "when does an AI product want GraphQL?" — the answer is *the schema*: queries, mutations, and the typed contract — when the client needs exactly the data it asks for (L163).**

L234 gave you REST; this lesson is the **alternative**: GraphQL basics — the query language that lets the client ask for exactly the data it needs: queries (reads), mutations (writes), and the schema (the typed contract, L163). The fit for an AI product: the AI features often want a *typed contract* — the client asks for the exact fields of a generation, a tool result, or a chat (L233). The trade: GraphQL's flexibility and schema (L235) vs REST's simplicity and caching (L234).

The distinction this lesson is built on: a **demo** picks REST or GraphQL by fashion. A **solutions architect** knows the fit: GraphQL when the client needs exact, typed data (L235) and the schema (L163) is the product's contract (L143); REST when the resources are simple and the caching matters (L234). The AI API (L233) often mixes both (L235).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain GraphQL: queries, mutations, and the schema (L235)
- Explain the schema as the typed contract (L163, L143)
- Explain the fit: when the client needs exact data (L235)
- Explain the trade: flexibility vs caching and simplicity (L234)
- Decide REST vs GraphQL for an AI product (L233)

## 1. One-Line Definition

**GraphQL is the schema-first API — the client asks for exactly the data it needs with queries (reads) and mutations (writes), against a typed schema (L163, L143) — the fit when the client's data needs are exact and the schema is the product's contract (L235), at the cost of caching and simplicity compared to REST (L234), with the AI API (L233) often mixing both (L235).**

The one-sentence interview answer: *"GraphQL is the schema-first API (L235). The client sends a query — 'give me the message's id, role, and content' — and gets exactly those fields (L235). The schema is the typed contract (L163): every type, every field, every mutation defined (L143) — the client's IDE autocompletes from it, and the server validates against it (L235). The fit: when the client's data needs are exact and varied — a dashboard, a mobile app, an AI product's UI (L233) — GraphQL's precision beats REST's fixed shapes (L235). The trade: REST's caching (L234) and simplicity vs GraphQL's flexibility (L235). For an AI product, the AI endpoints often stay REST (L233) — the streaming (L251) and the actions (L173) — while the surrounding data — chats, histories, tool results — can be GraphQL (L235). Both, by fit (L233)."*

## 2. Mental Model

Think of the two APIs as **a buffet vs a made-to-order kitchen.** REST is the buffet: the platters are pre-made (the fixed resource shapes, L234) — you take what's on them, including what you don't want. GraphQL is the made-to-order kitchen: you order exactly what you want — "the message's id, role, and content, no timestamps" — and the kitchen (the server, L235) prepares exactly that (the query, L235). The menu (the schema, L163) lists everything the kitchen can make, typed (L143). The made-to-order kitchen is great when your needs are specific (L235) — and the buffet is better when the platters are fine as they are (L234).

```text
   REST — the buffet (L234)          GraphQL — made-to-order (L235)
   ┌──────────────────────┐          ┌──────────────────────────────┐
   │ fixed resource shapes│          │ the query: "give me exactly  │
   │ take what's on them  │          │ id, role, content" (L235)    │
   │ simple, cacheable    │          │ the schema: the typed menu   │
   │ (L234)               │          │ (L163, L143)                 │
   └──────────────────────┘          └──────────────────────────────┘
```

The mental model is **buffet vs made-to-order**: fixed platters vs exact orders — with the typed menu (the schema) as GraphQL's signature (L235).

## 3. Visual Flow — A GraphQL Exchange

```text
   the client's query (L235)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE QUERY (L235)                                     │
   │     the client asks for exactly the fields it needs      │
   │     { chat(id) { id, title, messages { role, content }}} │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE SCHEMA (L163, L143)                              │
   │     the server validates the query against the types     │
   │     (L235) — the typed contract (L143)                   │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE RESOLVERS (L235)                                 │
   │     each field's resolver fetches its data (L235)        │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · THE RESPONSE (L235)                                  │
   │     exactly the requested shape — no more, no less       │
   └──────────────────────────────────────────────────────────┘
```

The flow is the exchange: **query → schema → resolvers → exact response** — the made-to-order kitchen (L235).

## 4. How It Works — The Schema, the Queries, the Mutations

- **The schema (L163, L143).** The typed contract: every type, field, and mutation defined (L235) — the client's autocomplete (L235) and the server's validation (L143) both read it (L235).
- **The queries (L235).** The reads: the client asks for exactly the fields it needs — nested, precise (L235) — and the response is exactly that shape (L235).
- **The mutations (L235).** The writes: the client's actions — create, update, delete (L235) — with the schema's validation (L143).
- **The resolvers (L235).** Each field's data is fetched by its resolver (L235) — the server's implementation behind the schema (L235).

> [!NOTE]
> **The fit is the client's data needs (L235).** GraphQL shines when the client's needs are exact and varied: a dashboard that needs different fields per view, a mobile app that wants the minimal payload (L235). REST shines when the resources are simple and the caching matters (L234). The senior answer doesn't pick by fashion — it maps the product's data needs (L233): the AI actions and the streaming (L251) stay REST (L233); the surrounding data — chats, histories, tool results — can be GraphQL when the client needs the precision (L235). Both, by fit (L233).

## 5. Real Project Usage

- **The chat UI (L235).** The history view asks for exactly the messages' fields (L235) — the minimal payload (L235).
- **The dashboard (L235).** Each view's exact metrics (L235) — the typed query (L163).
- **The mobile app (L235).** The minimal payload over the slow network (L235) — the exact fields (L235).
- **The AI product's data (L233).** The chats, histories, and tool results as GraphQL (L235); the streaming generation (L251) as REST (L233).
- **Anything typed (L235).** The schema as the contract (L163) — the client and the server agree on the types (L143).

The through-line: **GraphQL is the made-to-order API** — exact queries against a typed schema, chosen by the client's data needs (L235).

## 6. Interview Explanation

Say it in four moves:

1. **The shape.** "Queries, mutations, and the schema (L235) — the client asks for exactly what it needs (L235)."
2. **The schema.** "The typed contract (L163): every type and field defined (L143)."
3. **The fit.** "Exact, varied client needs → GraphQL (L235); simple resources and caching → REST (L234)."
4. **The AI mix.** "The streaming and actions stay REST (L233); the surrounding data can be GraphQL (L235)."

## 7. Senior-Level Insights

- **The schema is the contract's center (L163).** The senior answer treats the GraphQL schema (L235) as the product's typed contract (L163) — versioned (L341) like any API (L234).
- **The precision is the mobile win (L235).** The exact-field query (L235) is the minimal payload (L235) — the mobile app's network cost controlled (L235).
- **The N+1 is the resolver's trap (L235).** Each field's resolver can query per item (L235) — the senior design uses the data loaders (L235) to batch the fetches (L235).
- **The caching is the trade (L234).** REST's HTTP caching (L234) vs GraphQL's single endpoint (L235) — the senior answer names the cost (L234).
- **The AI mix is by fit (L233).** The actions and the streaming (L251) as REST (L233), the surrounding data as GraphQL (L235) — the senior answer designs the mix (L233).

## 8. Common Mistakes

- **GraphQL by fashion (L235).** The simple CRUD forced into the schema (L234) — the caching lost (L234), the complexity gained (L235).
- **The schema untyped (L143).** The types loose or missing (L235) — the contract (L163) gone.
- **The N+1 queries (L235).** The resolvers querying per item (L235) — the loaders (L235) missing.
- **The AI actions in GraphQL (L233).** The streaming generation (L251) forced into the schema (L233) — the action shape (L173) and the streaming lost (L234).
- **No versioning (L341).** The schema's breaking changes unversioned (L341) — the clients break (L234).
- **One API for everything (L233).** REST or GraphQL exclusively (L233) — the mix by fit (L235) skipped.

## 9. Best Practices

- **Design the schema as the contract** (L163, L143) — typed, versioned (L341).
- **Use the data loaders** (L235) — the N+1 avoided (L235).
- **Keep the AI actions and streaming REST** (L233) — the action endpoints (L173) and the streaming transport (L251).
- **Use GraphQL for the exact-data surfaces** (L235) — the dashboards, the mobile app (L235).
- **Name the caching trade** (L234) — GraphQL's single endpoint vs REST's HTTP cache (L234).
- **Mix by fit** (L233) — both, where each wins (L235).

## 10. Interview Questions

**Q: When does an AI product want GraphQL?**
> A: When the client's data needs are exact and varied (L235). The chat history view, the dashboard, the mobile app — each asks for exactly the fields it needs (L235), against the typed schema (L163). When the resources are simple and the caching matters, REST (L234) wins. The AI product often mixes: the streaming generation (L251) stays REST (L233), and the surrounding data — chats, histories, tool results — can be GraphQL (L235).

**Q: What's the schema's role?**
> A: The typed contract (L163). Every type, field, and mutation is defined (L235) — the client's IDE autocompletes from it, and the server validates against it (L143). The schema is the client and the server's shared agreement (L235) — versioned like any API's contract (L341).

**Q: What's the trade vs REST?**
> A: Flexibility and precision vs caching and simplicity (L235). GraphQL gives the client exact fields (L235) — but its single endpoint doesn't use HTTP caching (L234), and the resolvers can N+1 (L235). REST's fixed shapes are simpler and cacheable (L234). The senior answer names the trade and designs the mix (L233): the caching-sensitive and the simple stay REST; the exact-data surfaces go GraphQL (L235).

**Q: Why do the AI actions stay REST?**
> A: Because the actions are action-shaped (L173), not data-shaped (L233). The chat and generation endpoints stream (L251), carry prompts and schemas (L143), and follow the REST conventions (L234) — the streaming response is a 200 with a stream (L234). Forcing the actions into GraphQL loses the action shape (L173) and the streaming transport (L251). The data around the actions — the histories, the tool results — is where GraphQL fits (L235).

## 11. Follow-Up Questions

- What's the schema's role (L163)?
- When does GraphQL fit (L235)?
- What's the caching trade (L234)?
- What's the N+1 trap (L235)?
- How do you mix REST and GraphQL (L233)?

## 12. Comparison Table — REST vs GraphQL

| | REST (L234) | GraphQL (this lesson) |
|---|---|---|
| Shape | resources | the schema (L163) |
| Data | fixed representations | exact fields (L235) |
| Caching (L234) | HTTP caching | single endpoint |
| Simplicity | high | more machinery (L235) |
| The fit (L233) | simple, cacheable | exact, varied needs |
| The AI layer | actions + streaming (L251) | the surrounding data |

The senior read: **the columns are the fits** — the mix by the product's needs (L233).

## 13. Code Example — The Schema and a Query

```js
// GraphQL: the schema as the contract (L163, L235).
// THE SCHEMA (L235) — the typed contract (L143).
const typeDefs = `
  type Message {
    id: ID!
    role: String!
    content: String!
  }
  type Chat {
    id: ID!
    title: String!
    messages: [Message!]!
  }
  type Query {
    chat(id: ID!): Chat
  }
  type Mutation {
    sendMessage(chatId: ID!, content: String!): Message
  }
`;

// THE RESOLVERS (L235) — with the data loaders (L235) for the N+1.
const resolvers = {
  Query: {
    chat: (_, { id }) => chats.load(id),           // the loader batches (L235)
  },
  Mutation: {
    sendMessage: (_, args) => sendMessage(args),   // the AI endpoint behind it (L233)
  },
};

// THE CLIENT'S QUERY (L235) — exactly the fields it needs.
const QUERY = `
  { chat(id: "c_1") {
      id
      title
      messages { role content }        // no timestamps — the exact shape (L235)
  } }
`;
```

```text
What the reader must SEE — the made-to-order kitchen:

  typeDefs → the typed schema (L163, L143)
  resolvers + loaders → the implementation, N+1 avoided (L235)
  the client query → exactly the fields it needs (L235)

  The menu is typed; the orders are exact.
```

```narrate
3-15: The schema — the typed contract: the types, the query, the mutation (L163, L143, L235).
17-24: The resolvers — the implementation behind the schema, with the data loader for the N+1 (L235).
26-31: The client's query — exactly the fields it needs, no more (L235).
```

> [!TIP]
> The line that shows the fit: **`messages { role content }`** — the client asking for exactly two fields (L235). **The made-to-order kitchen: the typed menu, the exact order — chosen when the client's needs are precise (L235).**

## 14. Performance Notes

- **The exact query is the payload control (L151).** The client asks for only what it needs (L235) — the minimal payload (L235) over the mobile network (L235).
- **The N+1 is the latency trap (L151).** The per-item resolvers (L235) — the data loaders (L235) batch the fetches (L235).
- **The schema is the validation cost (L151).** The typed validation (L143) is fast — the contract's check per request (L235).
- **The caching is the trade (L234).** The single endpoint (L235) vs REST's HTTP cache (L234) — the senior design knows the cost (L234).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The N+1 storms | Per-item resolvers (L235) | The data loaders (L235) |
| The schema drift | Unversioned changes (L341) | The version (L341) |
| Slow queries | The resolvers' fetches (L235) | The batching (L235) |
| The AI actions broken | GraphQL for the streaming (L233) | REST for the actions (L251) |
| The contract unclear | The loose types (L143) | The typed schema (L163) |

## 16. Quick Revision Notes

- GraphQL = **the schema-first API** (L235): queries, mutations, the schema (L163).
- The schema: **the typed contract** (L143) — versioned (L341).
- The fit: **exact, varied client needs** (L235).
- The trade: **the caching and simplicity** (L234) vs the flexibility (L235).
- The N+1: **the data loaders** (L235).
- The AI mix: **the actions and streaming stay REST** (L233); the data can be GraphQL (L235).

## 17. Cheat Sheet

```text
GRAPHQL = the schema-first API — the made-to-order kitchen

THE SHAPE (L235)
  queries    the reads — exactly the fields the client needs (L235)
  mutations  the writes — the client's actions (L235)
  schema     the typed contract (L163, L143) — versioned (L341)
  resolvers  the implementation behind the schema (L235)

THE FIT (L235)
  exact, varied client needs → GraphQL (L235)
  dashboards · mobile apps · the minimal payload (L235)
  simple resources + caching → REST (L234)

THE TRADE (L234)
  flexibility and precision vs caching and simplicity (L235)
  the single endpoint doesn't HTTP-cache (L234)
  the N+1 — the data loaders batch the resolvers (L235)

THE AI MIX (L233)
  the actions and the streaming (L251) stay REST (L233)
  the surrounding data — chats, histories, tool results —
  can be GraphQL (L235) — both, by fit (L233)

INTERVIEW, 4 MOVES
  1 shape   "queries, mutations, the schema (L235)"
  2 schema  "the typed contract (L163, L143)"
  3 fit     "exact needs → GraphQL · simple → REST (L235)"
  4 AI mix  "the actions REST (L233), the data GraphQL (L235)"
```

## 18. Key Takeaways

> [!RECAP]
> - GraphQL is **the schema-first API** (L235): the client asks for exactly the data it needs with queries (L235) and mutations (L235), against a typed schema (L163, L143)
> - **The schema is the typed contract** (L163) — every type and field defined (L143), versioned like any API (L341)
> - **The fit is the client's exact, varied data needs** (L235) — the dashboards, the mobile apps, the minimal payload (L235)
> - **The trade is the caching and simplicity** (L234) — REST's HTTP caching (L234) vs GraphQL's single endpoint and the N+1 trap (L235), solved with the data loaders (L235)
> - **The AI product mixes by fit** (L233): the actions and the streaming (L251) stay REST (L233), and the surrounding data — chats, histories, tool results — can be GraphQL (L235)
> - The choice is **by the product's data needs** (L233), never by fashion (L235)

## Check your understanding

Answer these without looking back.

1. What are the three parts of GraphQL (L235)?
2. Why is the schema the contract (L163)?
3. When does GraphQL fit (L235)?
4. What's the caching trade (L234)?
5. What's the N+1 trap, and its fix (L235)?
6. Why do the AI actions stay REST (L233)?
7. How do you mix the two (L233)?
8. What's the versioning story (L341)?

## A Closing Note — The Made-to-Order Kitchen

You now hold the alternative: **the typed schema as the contract, the exact queries, and the fit — with the AI actions staying REST and the data going GraphQL where the client needs the precision.** The API now has both shapes, chosen by fit (L235).

Next: the front door of it all — API gateways (L236), auth, rate limiting, routing, caching.
