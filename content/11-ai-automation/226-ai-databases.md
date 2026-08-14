# Lesson 226 — AI + Databases

**Interview importance:** ⭐⭐⭐⭐⭐ — "can AI query your database?" — the answer is *text-to-SQL done safely*: read-only, audited, and verified (L163, L212, L322).**

L223–225 touched systems; this lesson is the **source of truth**: AI + databases — text-to-SQL (L226): the user asks in English, the model writes the SQL (L163), the system runs it safely. The discipline has three pillars: **read-only** (the generated SQL can't mutate — L212), **audited** (every query traced — L322), and **verified** (the SQL is validated before it runs — L143). The safety is the design: the model proposes the SQL, the system checks and runs it under the read-only role (L226).

The distinction this lesson is built on: a **demo** lets the model run whatever SQL it writes. A **solutions architect** designs the safe query path: the schema context (L226), the SQL generation (L163), the validation gates (L143, L212), the read-only execution role (L315), and the audit (L322) — because the database is the business's source of truth (L226).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain text-to-SQL: the question → the model writes SQL (L226)
- Explain the read-only rule: generated SQL can't mutate (L212, L315)
- Explain the verification: the SQL validated before it runs (L143)
- Explain the audit: every query traced (L322)
- Explain the schema context: what the model needs to write good SQL (L226)

## 1. One-Line Definition

**AI + databases is text-to-SQL done safely — the user asks in English, the model writes the SQL (L163) with the schema as context (L226), and the system verifies it (L143), runs it under a read-only role (L315), and audits it (L322) — because the database is the business's source of truth, and a generated query that mutates is a data disaster (L226).**

The one-sentence interview answer: *"AI + databases is text-to-SQL with a safety spine (L226). The user asks in English: 'how many refunds last month?' The model writes the SQL (L163), using the schema as context (L226). Then the system runs the safety spine. Verify — the SQL is checked: a SELECT-only grammar (L143), a query plan review (L226), and a timeout bound (L151). Execute read-only — the query runs under a read-only database role (L315), so a mutation is impossible by construction (L212). Audit — every query, its question, and its result size are traced (L322). The safety is the design: the model proposes the SQL, the system checks and runs it under the read-only role (L226). The database is the source of truth (L226) — the spine is what makes the English question safe (L226)."*

## 2. Mental Model

Think of the AI database access as **a librarian who writes your search request on your behalf — but the request goes through the reference desk's rules.** You ask in English ("how many refunds last month?"); the librarian (the model) writes the proper request form (the SQL, L163), using the catalog (the schema, L226). The reference desk (the system) checks the form (verify, L143), stamps it READ-ONLY (the role, L315), and runs it — you can't walk into the stacks and change the books (no mutation, L212). Every request is copied to the logbook (the audit, L322). The library works because the form is verified, the access is read-only, and the requests are logged (L226).

```text
   you (the user)                the reference desk (the system, L226)
   ┌──────────────────┐          ┌────────────────────────────────┐
   │ "how many        │          │ the model writes the SQL (L163)│
   │  refunds last    │ ───────► │ VERIFY the form (L143)         │
   │  month?"         │          │ READ-ONLY role (L315)          │
   └──────────────────┘          │ the logbook records it (L322)  │
                                 └────────────────────────────────┘
```

The mental model is **the librarian and the reference desk**: the AI writes the query, the system verifies it, runs it read-only, and logs it (L226).

## 3. Visual Flow — The Safe Query Path

```text
   a question arrives (L226)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE SCHEMA CONTEXT (L226)                            │
   │     the model sees the schema — tables, columns,          │
   │     relationships — the catalog (L226)                   │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE SQL (L163)                                       │
   │     the model writes the query (L163)                    │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · VERIFY (L143, L212)                                  │
   │     SELECT-only grammar · the plan review · the timeout  │
   │     bound (L151) — a mutation or a runaway is rejected   │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · EXECUTE + AUDIT (L315, L322)                         │
   │     the read-only role runs it (L315)                    │
   │     the question, the SQL, the result size → the log     │
   │     (L322)                                               │
   └──────────────────────────────────────────────────────────┘
```

The flow is the spine: **schema context → SQL → verify → execute read-only + audit** — the English question made safe (L226).

## 4. How It Works — The Generation, the Verification, the Execution

- **The schema context (L226).** The model writes good SQL when it sees the schema (L226): the tables, the columns, the relationships (L226) — the catalog in the prompt (L191), budgeted (L149). A model without the schema invents table names (L196).
- **The generation (L163).** The model writes the SQL (L163) — a defined output (L143), generated from the question and the schema (L226).
- **The verification (L143, L212).** The generated SQL is checked before it runs: a SELECT-only grammar (L212) — mutations rejected (L226); a query plan review (L226) — the full-table scan flagged (L151); and a timeout bound (L151) — the runaway query killed (L226). The verification is the safety's first line (L226).
- **The execution role (L315).** The query runs under a read-only database role (L315) — a mutation is *impossible* by construction (L212), not just checked (L226). The role is the safety's second line (L315).
- **The audit (L322).** Every query is traced: the question, the SQL, the result size, the user (L322) — the database's access is accountable (L226).

> [!NOTE]
> **The read-only role is the safety that verification can't provide alone (L315, L212).** Verification (L143) checks what the SQL *looks like* — a grammar rule can be bypassed, a subtle mutation missed (L226). The read-only role (L315) makes the mutation *impossible*: even a malicious or broken query can only read (L212). The senior design layers both — the check (L143) and the role (L315) — because the database is the source of truth, and defense in depth is the price of letting AI near it (L226).

## 5. Real Project Usage

- **Analytics questions (L163).** "How many refunds last month?" → the SQL (L163) → the read-only role runs it → the answer with the query shown (L226).
- **Support queries (L226).** "What's this customer's order history?" → the SQL with the WHERE on the customer ID (L226) → the scoped result (L180).
- **Dashboard generation (L226).** The scheduled job (L221) asks the questions, the SQL runs, the chart posts (L225).
- **Audit and compliance (L322).** Every generated query traced (L322) — the access to the source of truth is accountable (L226).
- **Anything data (L230).** The text-to-SQL path is the L230 platform's data access (L226) — safe by design (L230).

The through-line: **the database is the source of truth, and AI touches it through the safe spine** — schema context, verified SQL, the read-only role, and the audit (L226).

## 6. Interview Explanation

Say it in four moves:

1. **The generation.** "The model writes the SQL from the question and the schema (L163, L226)."
2. **The verification.** "SELECT-only grammar (L212), the plan review (L226), the timeout (L151)."
3. **The role.** "The read-only database role — a mutation is impossible by construction (L315)."
4. **The audit.** "Every query traced (L322) — the source of truth's access is accountable (L226)."

## 7. Senior-Level Insights

- **The schema context is the SQL's quality (L226).** The senior answer designs the schema prompt (L226): the tables, the columns, the relationships (L191), budgeted (L149) — a model without the catalog invents names (L196).
- **The verification is layered (L143, L212).** Grammar checks (L143), plan reviews (L226), and timeouts (L151) — the senior design layers the checks (L226), because any single check can be bypassed (L212).
- **The role is the defense in depth (L315).** The read-only role (L315) makes the mutation impossible (L212) — the verification's partner (L226).
- **The audit is the accountability (L322).** The question, the SQL, and the result (L322) — the trace (L213) of the data's access (L226).
- **The scoping is the data's privacy (L180).** The generated SQL is scoped: the WHERE on the customer ID (L226), the tenant filter (L320) — the same metadata discipline (L180) as the RAG module (L226).

## 8. Common Mistakes

- **The model runs its SQL (L226).** No verification, no role (L212) — the mutation and the runaway (L226).
- **No schema context (L226).** The model invents the tables (L196) — the SQL fails or is wrong (L226).
- **Grammar-only verification (L143).** The SELECT-only check bypassed (L212) — the role missing (L315).
- **No timeout (L151).** The runaway query locks the database (L226) — the bound absent (L151).
- **No audit (L322).** The queries untraced (L213) — the source of truth's access unaccountable (L226).
- **Full-table scans (L226).** The "all customers" query without the scope (L180) — the data exposure (L312).

## 9. Best Practices

- **Give the model the schema** (L226) — the catalog in the prompt (L191), budgeted (L149).
- **Verify before running** (L143) — SELECT-only (L212), the plan review (L226), the timeout (L151).
- **Execute under the read-only role** (L315) — mutation impossible (L212).
- **Scope the queries** (L180) — the WHERE on the user, the tenant filter (L320).
- **Audit every query** (L322) — the question, the SQL, the result (L213).
- **Show the SQL** (L226) — the answer's transparency (L226).

## 10. Interview Questions

**Q: How does AI query your database?**
> A: Text-to-SQL with a safety spine (L226). The user asks in English; the model writes the SQL (L163) using the schema as context (L226). Then the spine: verify — the SQL is checked (SELECT-only grammar, L143, the plan, L226, the timeout, L151); execute — under a read-only role (L315), so mutation is impossible (L212); audit — every query traced (L322). The model proposes; the system checks and runs it read-only (L226).

**Q: Why a read-only role, not just verification?**
> A: Defense in depth (L226). Verification (L143) checks what the SQL *looks like* — a grammar rule can be bypassed, a subtle mutation missed (L212). The read-only role (L315) makes the mutation *impossible*: even a broken or malicious query can only read (L212). The check and the role are layers (L226) — the database is the source of truth, and AI touches it behind both (L226).

**Q: What makes the model write good SQL?**
> A: The schema context (L226). The model sees the catalog — the tables, the columns, the relationships (L226) — in the prompt (L191), budgeted (L149). Without it, the model invents table names and columns (L196) — the SQL fails or answers wrong (L226). The schema is the model's map of the database (L226).

**Q: How do you audit the queries?**
> A: The trace (L322). Every query is logged: the question that generated it, the SQL, the result size, the user (L322). The audit is what makes the source of truth's access accountable (L226) — and it's the compliance story (L373) when the regulators ask who queried what (L226).

## 11. Follow-Up Questions

- What's in the schema context (L226)?
- How do you layer the verification (L143)?
- Why is the read-only role the second line (L315)?
- How do you scope the generated SQL (L180)?
- What does the audit record (L322)?

## 12. Comparison Table — Unsafe vs Safe Text-to-SQL

| | Unsafe (L226) | Safe (this lesson) |
|---|---|---|
| Schema (L226) | none — invented (L196) | the catalog in the prompt (L191) |
| Verification (L143) | none | grammar + plan + timeout (L212) |
| Execution (L315) | the app's role | the read-only role (L212) |
| Scope (L180) | none | the WHERE, the tenant filter (L320) |
| Audit (L322) | none | every query traced (L213) |
| Mutation (L212) | possible | impossible by construction (L315) |

The senior read: **the right column is the spine** — the English question made safe by layers (L226).

## 13. Code Example — The Safe Query Path

```js
// Text-to-SQL: schema context → SQL → verify → read-only + audit (L226).
// 1 · THE SCHEMA CONTEXT (L226) — the model's map (L191).
const SCHEMA = `tables: orders(id, customer_id, amount, status, created_at)
                customers(id, name, tier) …`;              // the catalog (L226)

// 2 · THE SQL (L163) — the model writes the query (L143).
async function textToSql(question, user) {
  const sql = await model.generate(question, { schema: SCHEMA, dialect: 'postgres' });  // L163

  // 3 · VERIFY (L143, L212, L226).
  assertSelectOnly(sql);                                    // the grammar (L212)
  const plan = await explain(sql);                          // the plan review (L226)
  if (plan.fullTableScan && !user.isAnalyst) reject('unscoped query');   // L180
  assertTimeout(sql, 5000);                                 // the bound (L151)

  // 4 · EXECUTE under the READ-ONLY role (L315) — mutation impossible (L212).
  const rows = await db.query(sql, { role: 'read_only' });  // L315

  // 5 · AUDIT (L322) — the trace of the access (L213).
  await audit.log({ user: user.id, question, sql, rows: rows.length, at: Date.now() });
  return { answer: rows, sql };                             // the transparency (L226)
}
```

```text
What the reader must SEE — the spine, end to end:

  SCHEMA in the prompt  → the map (L226, L191)
  assertSelectOnly()    → the grammar check (L143, L212)
  explain() + timeout   → the plan and the bound (L226, L151)
  role: 'read_only'     → mutation impossible (L315)
  audit.log()           → every query traced (L322)

  The model proposes; the system verifies, scopes, and runs read-only.
```

```narrate
4-6: The schema context — the model's map of the database, in the prompt (L226, L191).
8-10: The generation — the model writes the SQL against the schema (L163, L143).
12-15: The verification — the grammar (L212), the plan (L226), and the scope (L180).
16-17: The timeout — the runaway query is bounded (L151).
19-20: The execution — the read-only role makes mutation impossible (L315, L212).
22-24: The audit — the question, the SQL, and the result size are traced (L322, L213).
```

> [!TIP]
> The line that makes it safe by construction: **`db.query(sql, { role: 'read_only' })`** — the second line behind the grammar check (L143). **Verification checks the SQL; the read-only role makes the mutation impossible — the spine is the layers (L226).**

## 14. Performance Notes

- **The schema context is the token cost (L149).** The catalog in the prompt (L226) is the per-query spend (L150) — the schema is curated (L191), not dumped (L226).
- **The verification is cheap (L151).** The grammar (L143), the plan (L226), and the timeout (L151) are fast checks — the safety's cost is microseconds (L226).
- **The timeout is the runaway's bound (L151).** The 5-second cap (L151) protects the database from the pathological query (L226).
- **The audit is the storage cost (L150).** The query log (L322) is cheap and required — the compliance story (L373).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The model invents tables | No schema context (L226) | Add the catalog to the prompt (L191) |
| A mutation runs | No read-only role (L315) | The role, not just the grammar (L212) |
| The database locks | No timeout (L151) | Bound the query (L226) |
| Data exposure | Unscoped queries (L180) | The WHERE + the tenant filter (L320) |
| No accountability | Queries untraced (L322) | Log every access (L213) |

## 16. Quick Revision Notes

- AI + databases = **text-to-SQL with a safety spine** (L226).
- The schema context: **the catalog in the prompt** (L226, L191).
- The verification: **grammar (L212), plan (L226), timeout (L151)**.
- The role: **read-only — mutation impossible** (L315).
- The audit: **every query traced** (L322).
- The spine: **the model proposes; the system checks and runs read-only** (L226).

## 17. Cheat Sheet

```text
AI + DATABASES = text-to-SQL done safely

THE GENERATION (L226)
  the question → the model writes the SQL (L163)
  the schema as context (L226) — the catalog in the prompt (L191)
  without the schema, the model invents the names (L196)

THE SPINE (L226)
  verify    SELECT-only grammar (L143, L212)
            the plan review (L226) · the timeout bound (L151)
  execute   the READ-ONLY role (L315) — mutation impossible (L212)
  scope     the WHERE on the user (L180) · the tenant filter (L320)
  audit     every query traced (L322) — the question, the SQL,
            the result size (L213)

THE LAYERS (L226)
  verification checks what the SQL LOOKS like (L143)
  the role makes the mutation IMPOSSIBLE (L315)
  the source of truth gets both (L226)

THE RULE
  the model proposes the SQL — the system checks and runs it
  read-only (L226) · the answer shows the SQL (L226)

INTERVIEW, 4 MOVES
  1 generate "the model writes the SQL from the schema (L163, L226)"
  2 verify   "grammar + plan + timeout (L143, L151)"
  3 role     "read-only — impossible by construction (L315)"
  4 audit    "every query traced (L322)"
```

## 18. Key Takeaways

> [!RECAP]
> - AI + databases is **text-to-SQL with a safety spine** (L226): the model writes the SQL (L163) from the question and the schema context (L226)
> - **The schema context is the SQL's quality** (L226) — the catalog in the prompt (L191); without it, the model invents tables (L196)
> - **The verification is layered** (L143, L212): SELECT-only grammar (L212), the plan review (L226), and the timeout bound (L151)
> - **The read-only role is the second line** (L315) — a mutation is impossible by construction (L212), not just checked
> - **The queries are scoped** (L180) — the WHERE on the user, the tenant filter (L320) — the data's privacy (L312)
> - **Every query is audited** (L322) — the question, the SQL, and the result size traced (L213), because the database is the business's source of truth (L226)

## Check your understanding

Answer these without looking back.

1. What's the text-to-SQL path (L226)?
2. Why does the model need the schema (L226)?
3. What are the verification layers (L143)?
4. Why is the read-only role the second line (L315)?
5. How do you scope the queries (L180)?
6. What does the audit record (L322)?
7. Why is the timeout part of the spine (L151)?
8. What makes mutation impossible (L212)?

## A Closing Note — The Source of Truth, Guarded

You now hold the data access: **the English question, the schema-informed SQL, the layered verification, the read-only role, and the audit of every query.** The business's source of truth is now reachable by AI — through a spine that makes the access safe (L226).

Next: the world — AI + external APIs (L227), calling it with idempotency and retries.
