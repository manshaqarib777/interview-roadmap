# Topic 72 — Multi-Tenant SaaS

**Checklist anchor:** shared DB (tenant_id) · separate schemas · separate databases · tenant isolation · authorization · data-leak prevention · global scopes · database design · scaling

**Owning lesson:** [134 Multi-Tenancy & System Design](../134-multitenancy.md)

---

## The one-sentence answer

**Multi-tenancy is one app serving many customers with hard data isolation — and the architecture choice (shared DB, schemas, or databases) trades cost against isolation, while the leak defence is making the tenant filter impossible to forget.**

## The mental model

The checklist's three architectures:

```text
1. SHARED DATABASE (one table, tenant_id column)
   tenants  │  orders
   A        │  tenant_id=1
   B        │  tenant_id=2

2. SEPARATE SCHEMAS (one DB, one schema per tenant)
   tenant_a.orders │ tenant_b.orders   (PostgreSQL)

3. SEPARATE DATABASES (one DB per tenant)
   db_a.orders │ db_b.orders
```

The spectrum is **isolation vs cost**: shared is cheapest and scales best but needs the strongest software guardrails; separate databases are the most isolated and the most expensive.

## The three architectures

| | Shared DB + tenant_id | Separate schemas | Separate databases |
|---|---|---|---|
| Cost | Cheapest — one of everything | One DB, N schemas | N databases |
| Isolation | **By discipline** — a missing filter leaks | Schema-level separation | Hard separation |
| Scale | Best — pool resources | Good | Worst — N of everything |
| Migration | One set of tables | One set per schema | N migrations |
| Leak risk | **Highest** — one forgotten `tenant_id` | Lower | Lowest |
| Best for | Small SaaS, fast to start | Mid-tier, Postgres shops | Enterprise, strict isolation |

**The default is shared + tenant_id** — the checklist calls it "the default" for a reason: it's where you start, and the senior work is making it *leak-proof by construction*.

## The leak-proof layers (the core skill)

A tenant leak happens when **one query forgets the filter** — a customer sees another tenant's data. The defence is layering so forgetting is impossible:

```text
Layer 1 — Global scope (the tenant filter, automatic)
   every Order query gets WHERE tenant_id = ? — no one can forget it
   (Lesson 49's addGlobalScope — this is the canonical use)

Layer 2 — The tenant resolved from the request, once
   the scope's tenant comes from the authenticated tenant's context,
   never from a client-supplied value

Layer 3 — Authorization on top (defence in depth)
   policies still check ownership (Lesson 18) — a belt over the suspenders

Layer 4 — Route/model scoping
   routes resolve tenant-scoped models — {order} 404s if it isn't yours
```

```php
// the canonical leak-proof shape:
class Order extends Model
{
    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function ($query) {
            $query->where('tenant_id', tenant()->id);   // from context, not input
        });
    }
}

// a cross-tenant read 404s — the model can't even see the other tenant's row:
$order = Order::find($id);   // tenant scope applied automatically
// manual escape hatch, deliberate and rare:
Order::withoutGlobalScope('tenant')->...   // admin/export paths only (Lesson 49)
```

## Tenant context — where does the tenant come from?

```php
// the tenant is resolved ONCE, from a trusted source:
//   - the subdomain: tenant-a.app.com → tenant A
//   - the authenticated user's tenant relationship
//   - an auth token claim

// the middleware sets it for the request:
public function handle($request, Closure $next)
{
    $tenant = Tenant::where('subdomain', $request->route('tenant'))->firstOrFail();
    app()->instance(TenantContext::class, new TenantContext($tenant));
    return $next($request);
}
// the global scope reads it from the context — never from user input
```

The rule: **the tenant is derived from the request's identity (subdomain, user), never from a client-supplied `tenant_id` parameter.** A client that can choose its tenant filter has already leaked.

## Database design & scaling

```php
// shared DB: the tenant_id column + the composite index (Lesson 63):
$table->foreignId('tenant_id')->constrained();
$table->index(['tenant_id', 'created_at']);   // every query filters by tenant first

// unique constraints become per-tenant:
$table->unique(['tenant_id', 'slug']);        // slugs unique per tenant, not globally
```

- Every tenant-scoped table gets `tenant_id` **and the index leading with it** — the query pattern is always `WHERE tenant_id = ? AND ...`.
- Unique keys become **composite with tenant_id** — two tenants may both have `order-1`.
- Scaling the shared model: the hot path is "queries filtered by tenant," so the index order and the global scope do the heavy lifting; read replicas and caching (Lessons 33–34) come after.

## Interview questions

**Q1. What are the three multi-tenant architectures?**
> Shared database with a `tenant_id` column — one set of tables, cheapest, highest leak risk if a filter is forgotten. Separate schemas — one DB, one schema per tenant, Postgres-native. Separate databases — one DB per tenant, strongest isolation, most expensive. The choice trades cost and scale against isolation; the default is shared + tenant_id, made leak-proof by construction.

**Q2. How do you prevent a customer seeing another tenant's data?**
> Layered defences: a global scope appends `WHERE tenant_id = ?` to every query so it can't be forgotten (Lesson 49); the tenant comes from request context (subdomain/user), never client input; policies add authorization on top; and routes resolve tenant-scoped models so a foreign row 404s. The senior answer is *layers* — no single guard is enough.

**Q3. Why are global scopes the right tool?**
> Because a leak happens when one query forgets the filter, and a global scope makes forgetting impossible — the constraint lives on the model and applies to every query, including relationships and eager loads. The escape hatch (`withoutGlobalScope`) is deliberate and rare — admin and export paths only.

**Q4. How does the database design differ?**
> Every tenant-scoped table gets `tenant_id` plus an index leading with it (the query pattern is always tenant-first); unique constraints become composite (`['tenant_id', 'slug']`); and per-tenant counts and aggregates query by tenant. The schema mirrors the isolation: the tenant dimension is in the table, the index, and the constraints.

**Q5. When do you move beyond the shared database?**
> When isolation requirements demand it — regulated data, enterprise contracts, or a tenant whose usage threatens others (the noisy-neighbour problem). Moving to schemas or databases buys hard isolation and costs operations (N migrations, N of everything). The senior move: start shared, design the leak-proofing from day one, and let a *real* requirement drive the migration — not scale anxiety.

**Senior follow-up: What's the noisy-neighbour problem?**
> One tenant's heavy usage degrades everyone on shared resources. The fixes: per-tenant rate limiting (Lesson 35), query budgets, read replicas, and eventually isolation tiers — big tenants to their own database. The architecture question is "how do I isolate *performance* too," not just data — that's what separates a multi-tenant app from a multi-tenant *platform*.

## Common mistakes

❌ The missing `tenant_id` filter — the leak itself; the global scope exists to make it impossible.

❌ Tenant from client input — `$request->tenant_id` is a leak; derive from subdomain/user.

❌ Global unique constraints — `unique('slug')` collides across tenants; make it composite.

❌ No index leading with tenant_id — every query filters tenant-first; the index must too.

## Quick revision notes

- Three architectures: **shared DB (tenant_id)** · **schemas** · **databases** — isolation vs cost
- **Shared + tenant_id is the default**; leak-proofing is the senior work
- The leak defence is **layered**: global scope (can't forget) → context-derived tenant → policies → scoped routes
- Tenant comes from **request identity, never client input**
- Schema: `tenant_id` + **composite index** + **composite uniques**
- Noisy neighbour: per-tenant limits, replicas, isolation tiers

## Check your understanding

1. Rank the three architectures by isolation and by cost.
2. Why is a global scope the core leak defence?
3. Where must the tenant NEVER come from, and where must it?
4. What happens to unique constraints in a shared-tenant DB?
5. What's the noisy-neighbour problem, and how do you answer it?
