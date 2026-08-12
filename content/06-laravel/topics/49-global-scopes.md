# Topic 49 — Global Scopes

**Checklist anchor:** global scopes · local scopes · removing global scopes · `booted()` + `addGlobalScope`

**Owning lesson:** [115 Eloquent ORM](../115-eloquent.md)

---

## The one-sentence answer

**A global scope is a constraint silently applied to every query for a model — the default filter you never type; a local scope is a named reusable fragment you invoke explicitly.**

## The mental model

A global scope is the **"always true" filter** for a model:

```php
class User extends Model
{
    protected static function booted(): void
    {
        static::addGlobalScope('active', fn ($query) => $query->where('is_active', true));
    }
}

User::all();                          // WHERE is_active = 1  — applied silently
User::where('role', 'admin')->get();  // still gets the scope added
```

Every query for that model gets the constraint **whether you ask for it or not**. The classic real-world use: multi-tenancy — every `Order` query silently filters `tenant_id` (Lesson 134), so a tenant can never see another tenant's data even if a developer forgets to filter.

A **local scope** is the opposite — opt-in, named, invoked explicitly:

```php
public function scopeActive($query) { return $query->where('is_active', true); }
public function scopeRecent($query) { return $query->orderBy('created_at', 'desc'); }

User::active()->recent()->get();   // you asked for these
```

## How it works

### Defining a global scope

```php
// via a closure (simple filters):
static::addGlobalScope('active', fn ($query) => $query->where('is_active', true));

// via a scope class (reusable, testable):
class ActiveScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $builder->where('is_active', true);
    }
}
// static::addGlobalScope(new ActiveScope);
```

### Removing a global scope

```php
User::withoutGlobalScope('active')->get();     // by name
User::withoutGlobalScope(ActiveScope::class)->get(); // by class
User::withoutGlobalScopes()->get();            // all of them
```

`withoutGlobalScopes()` is the escape hatch — admin views, exports, or maintenance that must see everything.

### Global vs local

| | Global scope | Local scope |
|---|---|---|
| Applied | **Silently, to every query** | Only when you call it |
| Declared | `addGlobalScope` in `booted()` | `scopeXxx()` method |
| Used | `User::all()` — no change needed | `User::active()` |
| Removed | `withoutGlobalScope()` | n/a — just don't call it |
| Risk | Hides behaviour (queries differ from what you read) | None — explicit |
| Use case | Multi-tenancy, soft-delete-style defaults | Reusable named filters |

## The plain-JS model (what the exercise does)

```js
function withGlobalScope(model, scope) {
  return { ...model, query: (args) => scope({ ...model.query(args) }) };
}
// every call goes through the scope — same as Laravel appending it silently
```

## Interview questions

**Q1. What is a global scope?**
> A constraint Laravel appends to *every* query for a model — declared with `addGlobalScope` in `booted()`. `User::all()` and `User::where(...)` both get it silently. The canonical use is multi-tenancy: every `Order` query filters `tenant_id` automatically, so cross-tenant reads are impossible by construction.

**Q2. Global vs local scope?**
> A global scope applies silently to every query — you can't forget it, which is its power and its risk. A local scope is a named, opt-in filter — `User::active()` — you invoke explicitly. Globals for must-always constraints; locals for reusable named filters.

**Q3. How do you remove a global scope?**
> `withoutGlobalScope('name')` removes one by name, `withoutGlobalScope(ScopeClass::class)` by class, `withoutGlobalScopes()` removes all. Use it for admin views, exports, or maintenance that needs the unfiltered set — deliberately, never by default.

**Q4. What are the risks of global scopes?**
> They hide behaviour — code reads `User::all()` but the SQL has a filter the reader can't see. That causes "why is this row missing?" debugging. They also break eager loading and relationship queries if the scope interacts badly with them. The senior rule: use them for invariants (tenancy), not convenience filters — and name them so `withoutGlobalScope('active')` reads clearly.

**Q5. When should you reach for a global scope?**
> When the constraint must be true for *every* query or a whole class of bugs disappears — multi-tenant isolation is the textbook case. For anything a developer might legitimately query without, prefer a local scope or an explicit `where` — explicit beats implicit when the exception is common.

**Senior follow-up: Why are global scopes the multi-tenant leak defence?**
> Because the leak happens when *one* query forgets the tenant filter. A global scope makes forgetting impossible — the constraint is in the model, applied to every query including relationships and eager loads. That's the first layer of the leak-proof stack in Lesson 134.

## Common mistakes

❌ Using a global scope where a local scope would do — invisible filters confuse every future reader.

❌ Forgetting `withoutGlobalScope` for admin/export paths — then "why is the export missing rows?"

❌ Scopes that break eager loading or relationship queries — test the scope against `with()`.

❌ Multiple global scopes interacting — a second scope can silently filter away what the first allowed.

## Quick revision notes

- **Global scope** = silent constraint on **every** query — `addGlobalScope` in `booted()`
- **Local scope** = named opt-in — `scopeActive()` → `User::active()`
- Remove: `withoutGlobalScope('name'|Class)` · `withoutGlobalScopes()` (all)
- Canonical use: **multi-tenancy** — isolation by construction
- Risk: **hidden behaviour** — use for invariants, not convenience

## Check your understanding

1. What exactly does `addGlobalScope` do to `User::all()`?
2. Global vs local scope — how do you decide which to write?
3. How do you see the unfiltered set for an admin export?
4. Why is a global scope the tenant-leak defence?
5. What debugging pain do global scopes cause, and how do you avoid it?
