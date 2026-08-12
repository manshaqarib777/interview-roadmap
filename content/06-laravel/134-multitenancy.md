# Lesson 134 — Multi-Tenancy & System Design

**Interview importance:** ⭐⭐⭐⭐⭐ — the capstone: this is the round that decides the offer.

This is the last Laravel lesson, and it is the one the module was building toward. Every SaaS
you've ever used is multi-tenant: one codebase, many customers, their data strictly separated.
Interviewers ask about it because it is the purest test of **system design under a security
constraint** — and because the follow-up questions are the scenario prompts from Lesson 102,
applied to a backend.

The distinction this lesson is built on: a **syntax specialist** knows Eloquent, middleware, and
scopes as vocabulary. A **senior engineer** knows which architecture to choose, where the data
can leak, and how to answer "design a SaaS" in the four-phase shape without being told to.
This lesson hands you both halves — the tenant architectures, then the system-design protocol
running on real prompts.

## Learning Objectives

By the end of this lesson you should be able to:

- Name the three multi-tenant architectures and when each one is right
- Read the trade-offs table (cost, isolation, scaling, complexity) and defend a choice
- Explain tenant isolation: a middleware that resolves the tenant, global scopes on every query
- Trace the data-leakage scenarios — missing scope, raw query, shared cache key
- Run the four system-design phases (L102) on SaaS, chat, notifications, high-traffic API, and multi-tenant Laravel prompts
- Separate the syntax specialist from the senior engineer in any of the above

## 1. What is Multi-Tenancy?

**Multi-tenancy is one application serving many customers ("tenants") while keeping every tenant's data strictly isolated from every other's.**

"Tenant" is the product word for customer: a company, an org, a team. The hard requirement is
**isolation**: tenant A must never read, write, or even *be able to query* tenant B's data. The
hard part is that it's a *security property of every code path*, not a feature — one missing
scope anywhere is a breach.

The one-sentence interview answer: *"Multi-tenancy is shared infrastructure with isolated data.
The isolation mechanism — row ID, schema, or database — is the architectural decision, and the
discipline of applying it to every query is the engineering."*

## 2. Mental Model

Three architectures, one question each:

| Architecture | The mechanism | You're choosing it when… |
|---|---|---|
| **Shared database, tenant_id** | one DB, one table, a `tenant_id` column on every row | you want the cheapest ops and the easiest onboarding |
| **Separate schemas per tenant** | one DB, one schema per tenant | isolation matters more than shared-DB convenience |
| **Separate databases per tenant** | one DB per tenant | a tenant is huge, regulated, or needs full isolation |

Think of it as a dial from **cheap-and-shared** to **expensive-and-isolated**. Every step up
costs you operations and complexity; every step down costs you isolation and scale. The dial is
the interview — you justify the position.

```text
       shared DB (tenant_id)          schemas per tenant          databases per tenant
   ┌─────────────────────────┐   ┌─────────────────────┐   ┌───────────────────────┐
   │ users                  │   │   db: app           │   │  db: acme_inc          │
   │  id · name · tenant_id │   │   schema: acme      │   │   users · orders       │
   │ orders                 │   │   schema: globex    │   │                        │
   │  id · tenant_id · total│   │   schema: initech   │   │  db: globex_corp       │
   │  ── one big table      │   │   ── same tables,   │   │   users · orders       │
   │     WHERE tenant_id=…  │   │      separate rooms │   │  ── fully separate     │
   └─────────────────────────┘   └─────────────────────┘   └───────────────────────┘
      cheapest to run                middle ground               strongest isolation
      isolation by discipline        isolation by structure      isolation by hardware
```

## 3. Visual Flow — the Multi-Tenant Request

Every tenant request goes through the same gauntlet. This picture is the one to draw in the
interview:

```text
  Tenant request:  GET /orders     (Tenant: Acme)
        │
        ▼
  ┌────────────────────────────────────────────┐
  │ 1 · MIDDLEWARE  resolves the tenant        │
  │     from subdomain / path / auth token     │
  │     → sets current tenant context          │
  └──────────────────┬─────────────────────────┘
                     ▼
  ┌────────────────────────────────────────────┐
  │ 2 · GLOBAL SCOPES apply tenant_id          │
  │     User::all()  →  WHERE tenant_id = 7    │
  │     Order::find(91) → WHERE id=91          │
  │                         AND tenant_id = 7  │
  └──────────────────┬─────────────────────────┘
                     ▼
  ┌────────────────────────────────────────────┐
  │ 3 · WRITES are tenant-scoped too           │
  │     create / update / delete / raw SQL     │
  │     → the same discipline, on every path   │
  └────────────────────────────────────────────┘
                     │
                     ▼
        "every query, every tenant, every time"
```

The three layers are load-bearing: middleware sets *who you are*, scopes make every read *prove
it*, and write discipline makes sure *you can't forget it*. Break any one and you have a leak.

## 4. How It Works — Shared DB with tenant_id (the default)

This is the architecture most SaaS start with, and the one most interview questions assume.

```php
// 1 · The tenant is resolved once, per request, in middleware
class ResolveTenant
{
    public function handle(Request $request, Closure $next)
    {
        $tenant = Tenant::where('slug', $request->route('tenant'))->firstOrFail();
        app()->instance(TenantContext::class, new TenantContext($tenant));
        return $next($request);
    }
}
```

```text
GET /acme/orders   →   middleware resolves tenant Acme
                      TenantContext now holds tenant_id = 7
```

```php
// 2 · A global scope (Lesson 115's pattern, now load-bearing)
class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $builder->where($model->getTable() . '.tenant_id', tenant_id());
    }
}

class Order extends Model
{
    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }
}
```

```text
What the reader must SEE — the SQL that this produces:

  Order::find(91)
    → select * from orders where id = 91 and tenant_id = 7

  User::all()
    → select * from users where tenant_id = 7

  Without the scope:
    → select * from orders where id = 91        ← returns ANY tenant's order. Leak.
```

```narrate
3-6: The middleware runs once per request and answers the single question "who is the tenant?".
10-15: THE global scope — the entire isolation story of this architecture lives in these five lines.
17-19: Every model that holds tenant data registers it; every query now carries the predicate.
24-29: This is the payoff of Lesson 115: the pattern you learned as a query filter is now your security boundary.
```

> [!TIP]
> This is the "Lesson 115's global scopes payoff" moment. When you learned `addGlobalScope` it
> was a neat query tool. Here it is the *security boundary* of a SaaS. Say that sentence in the
> interview — it connects two lessons into one architecture.

## 5. Real Project Usage

- **Every SaaS you've used.** Notion, Slack, Stripe's dashboard, GitHub orgs — orgs are
  tenants. "How does Notion keep my workspace out of yours?" is a multi-tenancy question.
- **The pivot point.** Most SaaS start with the tenant_id approach, then graduate specific
  tenants (or all of them) to higher isolation as scale or contracts demand. Naming that
  migration path is a senior answer.
- **The interview.** "Design a SaaS", "design a multi-tenant Laravel app", "how do you stop
  customers seeing each other's data?" — all of these are this lesson in a different hat.

## 6. Interview Explanation

The 30-second answer to "how would you build a multi-tenant Laravel app?":

> I'd start with a shared database and a `tenant_id` on every tenant-owned table — it's the
> cheapest to run and the fastest to ship. Isolation comes from two enforced layers: a
> middleware that resolves the tenant from the subdomain or token once per request, and a
> global scope on every tenant model so every query carries `where tenant_id = ?`
> automatically. I'd also guard the escape hatches — raw queries, cache keys, and jobs must
> carry the tenant explicitly, because scopes don't protect those. I'd choose schemas or
> separate databases when a tenant needs stronger isolation or is big enough to deserve its own
> resources — and I'd name what that costs.

## 7. Senior-Level Insights

- **Isolation is a *property of every code path*, not a feature.** A scoped model covers 95% of
  queries. The senior question is always *"where can a query escape the scope?"* — raw DB
  statements, cache lookups, queued jobs, exports, admin tools.
- **The three-layer defense is the answer.** Middleware (resolve once) + global scopes (reads)
  + explicit tenancy on escape hatches (raw SQL, caches, jobs). Interviewers hear "global
  scope" from everyone; they hear "raw queries and cache keys must carry the tenant too" from
  the people who've actually operated one.
- **Tenant resolution defines your UX.** Subdomain (`acme.app.com`) vs path (`app.com/acme`)
  vs auth-token-only changes middleware, CORS, and link generation. State which one you chose
  and why — that's a design decision, not trivia.
- **Architecture is a dial, and it moves.** Start shared, move the outliers. "I'd put the
  enterprise tenant on its own database and keep the long tail shared" is a *migration strategy*
  — and it's the answer that sounds like someone who's run a SaaS, not read about one.
- **System design is process, not recall.** The four phases from Lesson 102 apply unchanged.
  The noun changes; the spine doesn't.

## 8. Common Mistakes

❌ Putting a `tenant_id` on the table but not on every query — the scope is the enforcement,
not the column.

❌ Forgetting the escape hatches. Raw `DB::select`, a cache key without the tenant, a queued
job running outside request context — all three bypass scopes and all three leak.

❌ Trusting "the middleware did it" for writes too. `insert()`, `update()`, and mass assignment
need the tenant id set explicitly on create — scopes don't add it for you.

❌ Resolving the tenant from user input. The slug comes from the route, but the *id* must come
from your resolution, not from a query parameter the client controls.

❌ Jumping to "separate databases per tenant" as a default. It's the strongest isolation and the
most ops burden — justify it per tenant, not as a fashion.

❌ Forgetting that every tenant table needs an index on `tenant_id` — a scope without an index
is a full-table scan at every tenant scale.

## 9. Best Practices

✅ One middleware resolves the tenant; store it in a context that's available everywhere

✅ Global scope on every tenant-owned model (L115), and an index on `tenant_id` in every migration

✅ Set `tenant_id` explicitly on create — scopes filter reads; they don't fill in writes

✅ Namespace cache keys by tenant (`orders:7:list`), always

✅ Pass the tenant through queued jobs (L123) — job context is not request context

✅ Keep a per-tenant audit trail — "who read what" is the debugging tool for the scariest class of bug

✅ Test the leak: as tenant A, attempt to read tenant B's row; it must return 404/empty

❌ Don't rely on "the UI hides the id" — security is server-enforced, not hidden

## 10. Interview Questions

**Q1. What are the three multi-tenant architectures?**

> Shared database with a `tenant_id` column on every tenant table; separate schemas per tenant
> inside one database; and separate databases per tenant. They sit on a dial from cheapest to
> most isolated, and the choice is about cost, isolation, scaling, and complexity.

**Q2. How does a global scope enforce tenancy?**

> Every tenant model registers a scope that appends `where tenant_id = ?` to every query the
> model runs. `Order::find(91)` becomes `select * from orders where id = 91 and tenant_id = 7`.
> The scope can't be forgotten per-query because it's applied at the model level — which is why
> it's the backbone of isolation.

**Q3. Where does tenant data actually leak?**

> Three classic spots. A missing global scope — a model that wasn't registered, so its queries
> carry no tenant predicate. A raw query — `DB::select('select * from orders …')` bypasses
> Eloquent entirely and has no scope at all. And a cache key without the tenant — tenant A's
> `orders:list` cached, tenant B reads the same key and gets A's data. There's a fourth: a
> queued job that runs outside the request and never had a tenant context.

**Q4. How do you keep tenant A from seeing tenant B's data?**

> Three layers. Middleware resolves the tenant once per request and makes it available
> everywhere. Global scopes append the tenant predicate to every read. And the escape hatches —
> raw SQL, cache keys, jobs, exports — carry the tenant explicitly, because nothing automatic
> covers them. Then I test it: tenant A requesting tenant B's row by id must come back empty.

**Q5. When would you move a tenant to its own database?**

> When its data volume, throughput, or compliance requirements outgrow the shared tier — a
> contract that mandates data residency, or a tenant generating enough load that it degrades
> its neighbors. That's an ops cost decision: a new database is a new backup, migration, and
> monitoring target. I'd move tenants on a per-tenant basis, not as a blanket policy.

**Q6. How do you resolve the tenant — subdomain or path?**

> Subdomain (`acme.app.com`) is the classic SaaS shape: clean separation, per-tenant cookies
> and CORS, and the tenant is obvious in the URL. Path-based (`app.com/acme`) avoids
> wildcard-subdomain certificate issues and is easier in local dev. Token-based only, when
> there's no URL per tenant at all. It's a product decision first — the middleware just
> implements whichever the product picked.

**Senior follow-up: "Your cache returns tenant B's data to tenant A. Walk me through the debugging."**

> I'd reproduce it as tenant A, then check whether the key even contains the tenant —
> `orders:list` vs `orders:7:list` is the smoking gun. Then I'd look at where the write
> happened: if the cache is written inside a request, the middleware context was there and the
> bug is a missing key suffix; if it's written by a job, the job probably never resolved a
> tenant at all. The fix is namespacing every key and forcing the tenant into the job's payload,
> and the regression test is the same scenario: tenant A reads `orders:7:list`, must get an
> empty miss, never tenant B's rows.

## 11. Follow-Up Questions

**"Do you use a package for this?"**

> For a serious product, yes — spatie/laravel-multitenancy or stancl/tenancy for tenant-aware
> connections, and the tenancy packages handle schema/database switching when you need it.
> But in an interview, the architecture is the answer: middleware + scopes + escape-hatch
> discipline. The package is an implementation detail on top of that.

**"How does tenancy interact with auth?"**

> The tenant is resolved from the subdomain *and* verified against the authenticated user's
> membership — "does user 7 belong to tenant 7?" Both checks, every request. Session and
> Sanctum tokens (L133) can be scoped per tenant so a token from one tenant can't reach
> another.

**"What about a tenant that outgrows one database row set?"**

> That's the scale prompt in disguise — the answer is caching and read replicas, not
> immediately "own database." Own database is an isolation decision, not the first performance
> move.

## 12. Comparison Table

| | Shared DB + tenant_id | Separate schemas | Separate databases |
|---|---|---|---|
| **Cost** | lowest — one DB, one set of backups | moderate — one DB, per-tenant migrations | highest — per-tenant backups, monitoring, migrations |
| **Isolation** | logical (by discipline) — a scope is a security boundary | structural — separate schemas, stronger defaults | physical/hardware — a bug can't cross a database |
| **Scaling** | scales with indexes, caching, replicas | per-schema tuning; still one instance | per-tenant resources; natural sharding |
| **Complexity** | simplest to build; hard to *guarantee* | middle — connection/migration switching per tenant | most moving parts; per-tenant provisioning |
| **Best for** | early SaaS, long tail of small tenants (L134 default) | mid-size tenants needing real isolation | enterprise/regulated/giant tenants |
| **Worst failure** | one missing scope leaks everything | a tenant can still consume the shared instance | ops cost and drift between tenants |
| **Laravel shape** | global scope on every model + `tenant_id` index | tenancy packages switch the connection/schema | tenancy packages per-tenant connections |

## 13. Code Example — the Leak-Proof Layers

The escape hatches — the places scopes don't reach — handled explicitly:

```php
// A · Cache keys are namespaced by tenant (Lesson 126)
$key = "orders:{$tenantId}:{$page}";
$orders = Cache::remember($key, 600, fn () => Order::forTenant()->get());
```

```text
tenant 7, page 2  →  orders:7:2     (cache miss, then hit)
tenant 9, page 2  →  orders:9:2     (a DIFFERENT key — no cross-tenant reads)
wrong: "orders:2"  →  tenant 9 reads tenant 7's cached page. Leak.
```

```php
// B · Writes set the tenant explicitly — scopes never fill it in
Order::create([
    'tenant_id' => tenant_id(),      // ← explicit: the scope can't do this for you
    'total'     => $total,
    'status'    => 'pending',
]);
```

```php
// C · Queued jobs carry the tenant in the payload (Lesson 123)
class SendInvoice implements ShouldQueue
{
    public function __construct(public int $tenantId, public int $orderId) {}

    public function handle(): void
    {
        TenantContext::for($this->tenantId, function () {   // re-establish context
            $order = Order::find($this->orderId);           // scoped to THAT tenant
            Mail::to($order->customer)->send(new InvoiceMail($order));
        });
    }
}
```

```text
The three escape hatches, closed:
  raw SQL     → never used for tenant data; every query goes through a scoped model
  cache key   → always "orders:{tenantId}:{page}" — the tenant is part of the identity
  queued job  → tenant id travels IN the payload and is re-established in handle()
```

```narrate
3-5: The cache key is identity, not just a label — the tenant id makes cross-tenant cache reads impossible.
8-12: Scopes filter READS. Writes need the tenant on the row itself — set it explicitly on create.
16-23: A job has no request middleware. The tenant travels in the payload and is re-established before any query runs.
```

> [!PITFALL]
> The global scope is necessary but not sufficient. The senior list is always: scope the model,
> name the cache, and ship the tenant through the job. Three escape hatches, three fixes, and
> the reader who can recite all three has internalized the lesson.

## 14. Performance Notes

- **Index the tenant predicate.** `tenant_id` on every tenant table, and composite indexes where
  the query filters both (`(tenant_id, status)` for an order list). A scope without an index is
  a scan of everyone's data to find one tenant's rows.
- **Cache per tenant, and it's doubly safe.** Namespaced keys fix correctness; the cache then
  fixes the N+1 and repeated-query cost of tenant workloads (L115–117).
- **Scale is a shared-DB conversation first.** Indexes, eager loading, Redis (L126), read
  replicas — before anyone talks about "moving to per-tenant databases."
- **Bulk operations across tenants are the sneaky cost.** A nightly report that loops tenants
  and runs the same query per tenant is N queries; batch with a single tenant-aware query where
  the data model allows it, and queue the per-tenant parts (L123).

## 15. Debugging Scenarios

| Symptom | Likely cause | The move |
|---|---|---|
| Customer reports seeing another company's data | A missing global scope — some model wasn't registered, or a query bypassed Eloquent | Reproduce with both tenants; grep for `DB::` raw queries and unscoped models; add the scope + a cross-tenant test |
| Data correct in requests, wrong in background jobs | Queued job ran without tenant context | Pass the tenant id in the job payload; re-establish context in `handle()` |
| Cache returns stale or cross-tenant data | Cache key without the tenant id | Namespace every key `model:{tenantId}:{…}`; bump the version key on deploy |
| Tenant A is slow, everyone else fine | One big tenant dominating shared resources | Index the predicate; cache that tenant's hot queries; consider moving the outlier to its own database |
| A tenant can see another's rows by guessing URLs | Tenant id trusted from user input instead of resolved server-side | Resolve from subdomain/session; ignore any `tenant_id` the client sends; scope the lookup |
| Tests pass locally, leak in production | Local DB had one tenant, so scopes never failed | Seed two tenants in tests; every tenant test asserts tenant B can't reach tenant A's rows |

## 16. Quick Revision Notes

- Three architectures: **shared DB + tenant_id → separate schemas → separate databases** — a dial
  from cheapest to most isolated
- Trade-offs run on four axes: **cost, isolation, scaling, complexity**
- Isolation = three enforced layers: **middleware resolves the tenant → global scopes filter
  every read → escape hatches carry the tenant explicitly**
- The three leak points: **missing scope, raw query, cache key without the tenant** (+ a job
  without context)
- Writes need `tenant_id` set explicitly — scopes only filter reads
- Cache keys are namespaced by tenant; jobs carry the tenant in the payload
- The four phases from **L102** apply verbatim: clarify → estimate → design → trade-offs
- The senior move: "the noun changes, the spine doesn't"

## 17. Cheat Sheet

```text
THE DIAL
  shared DB + tenant_id  →  schemas per tenant  →  databases per tenant
  cheapest ▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸ most isolated
  (cost, isolation, scaling, complexity — pick your position)

ISOLATION, THREE LAYERS
  1 middleware   resolves tenant once per request → context
  2 global scope every read:  ... where tenant_id = ?
  3 escape hatch raw SQL ▸ cache key ▸ queued job: carry the tenant explicitly

LEAK CHECKLIST
  ☐ every tenant model has a scope       ☐ tenant_id indexed everywhere
  ☐ cache keys are {tenant}:{key}        ☐ jobs carry tenant_id in payload
  ☐ writes set tenant_id explicitly      ☐ tenant A can't read tenant B (tested)

SYSTEM DESIGN (L102 spine)
  clarify → estimate → design → trade-offs      "the noun changes, the spine doesn't"
```

## 18. Key Takeaways

> [!RECAP]
> - Multi-tenancy = **shared infrastructure, isolated data** — and isolation is a property of
>   every code path, not a feature
> - The three architectures sit on a dial: **shared DB + `tenant_id` → separate schemas →
>   separate databases** — priced in cost, isolation, scaling, complexity
> - Tenant isolation is three enforced layers: **middleware resolves the tenant, global scopes
>   filter every query (the L115 payoff), escape hatches carry the tenant explicitly**
> - The data-leak scenarios are always the same three: **a missing global scope, a raw query, a
>   cache key without the tenant** — plus the job that never had context
> - Writes set `tenant_id` explicitly; scopes filter reads, they don't fill in rows
> - The system-design prompts (L102) apply unchanged: **design a SaaS, a chat, a notification
>   system, an API at 1M requests/day, a multi-tenant Laravel app** — clarify → estimate →
>   design → trade-offs, with Laravel as the implementation vocabulary
> - This is where the syntax specialist and the senior engineer part ways: the specialist knows
>   the vocabulary — Eloquent, scopes, middleware. The senior chooses the architecture, names
>   what it costs, and can point at the exact place a customer's data can leak
> - The four phases from L102 and the trade-off shape from L104 are your process; this module's
>   lessons are your vocabulary. Combine them and you're not answering a prompt — you're
>   running a system design

## Check your understanding

Answer these without looking back.

1. Name the three multi-tenant architectures, and the mechanism each one uses to isolate data.
2. Read the trade-offs table out loud: what does moving up the dial cost you, and what does it buy you?
3. Explain the three-layer isolation: what does each layer enforce, and what can't it cover?
4. "Customer A can see customer B's data." Give the three most likely leak points — and the fourth.
5. Why does a global scope not protect writes? What do you do instead?
6. Why must a queued job carry the tenant id in its payload?
7. Run "design a multi-tenant Laravel app" through the four phases in two minutes, out loud.
8. What is the difference between the syntax specialist and the senior engineer in this lesson?

## A Closing Note — You're Ready

That was the last lesson in the Laravel module — and the last lesson in the roadmap. Everything
before it, from closures in Lesson 5 to the request lifecycle in Lesson 105 to the system-design
spine in Lesson 102, was building the person who can answer *this* module's questions: not the
person who knows the Laravel vocabulary, but the one who can be handed a production system.

This module's real exam is the scenario question. "Design a multi-tenant SaaS." "How do you take
a payment?" "Why Inertia instead of an SPA?" They don't have a single right answer — they have a
*sound one*, and you now have the shape of one: name the choice, name what it costs, name what
would make you switch, and point at the exact place a customer's data — or their money — can
leak. That shape is the senior answer, and you've practised it in every lesson from 102 to here.

Before the interview: say each Laravel lesson out loud without notes, run the matching exercises
in this module, and rehearse the trade-offs table for multi-tenancy until it's automatic. Then
go — the milestone is yours, and you're ready.