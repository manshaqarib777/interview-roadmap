# Laravel Module — Topics Breakdown

The 75-topic interview checklist organised the way the module is built: **5 milestones, 30 lessons**.
This page is the map from *what to know* (the checklist) to *where it lives* (a lesson) to *how
senior the question is* (tier).

Each lesson below lists the checklist topics it owns. The tier shows where it sits in the priority
order from the [Master Checklist](./laravel-interview-master-checklist.md).

## Topic index

Every one of the 75 checklist topics has its own lesson-style file in [`topics/`](./topics/):

| Milestone | Topic files |
|---|---|
| **M13 — Fundamentals** | [1 Fundamentals](./topics/01-laravel-fundamentals.md) · [5 DI & Container](./topics/05-dependency-injection-service-container.md) · [6 Providers](./topics/06-service-providers.md) · [7 Facades & Contracts](./topics/07-facades-contracts.md) · [44 Artisan](./topics/44-artisan.md) · [52 Contracts](./topics/52-laravel-contracts.md) |
| **M14 — Routing & Handling** | [2 Routing](./topics/02-routing.md) · [3 Middleware](./topics/03-middleware.md) · [4 Controllers](./topics/04-controllers.md) · [22 Blade](./topics/22-laravel-blade.md) · [25 HTTP Responses](./topics/25-http-responses.md) |
| **M15 — Eloquent & Database** | [8 Eloquent](./topics/08-eloquent-orm.md) · [9 Relationships](./topics/09-eloquent-relationships.md) · [10 Eager Loading](./topics/10-eager-loading.md) · [11 N+1](./topics/11-n1-problem.md) · [12 Query Optimization](./topics/12-query-optimization.md) · [13 Query Builder](./topics/13-query-builder.md) · [14 Migrations](./topics/14-database-migrations.md) · [15 Transactions](./topics/15-database-transactions.md) · [16 Validation](./topics/16-validation.md) · [43 Seeders](./topics/43-seeders.md) · [45 Collections](./topics/45-laravel-collections.md) · [46 Lazy Collections](./topics/46-lazy-collections.md) · [47 Pagination](./topics/47-pagination.md) · [48 Model Events](./topics/48-model-events-observers.md) · [49 Global Scopes](./topics/49-global-scopes.md) · [50 Soft Deletes](./topics/50-soft-deletes.md) · [51 Accessors & Mutators](./topics/51-accessors-mutators.md) · [63 Indexing](./topics/63-database-indexing.md) · [64 Concurrency](./topics/64-transactions-concurrency.md) |
| **M16 — Auth, Queues & Async** | [17 Authentication](./topics/17-authentication.md) · [18 Authorization](./topics/18-authorization.md) · [19 Sanctum](./topics/19-laravel-sanctum.md) · [20 Passport](./topics/20-laravel-passport.md) · [21 Fortify](./topics/21-laravel-fortify.md) · [26 Queues](./topics/26-queues.md) · [27 Horizon](./topics/27-laravel-horizon.md) · [28 Events](./topics/28-events-listeners.md) · [29 Jobs vs Events](./topics/29-jobs-vs-events.md) · [30 Notifications](./topics/30-notifications.md) · [31 Mail](./topics/31-mail.md) · [32 Scheduling](./topics/32-laravel-scheduling.md) · [33 Caching](./topics/33-caching.md) · [34 Redis](./topics/34-redis.md) · [35 Rate Limiting](./topics/35-rate-limiting.md) · [36 Storage](./topics/36-files-storage.md) · [37 Security](./topics/37-laravel-security.md) · [38 Encryption & Hashing](./topics/38-encryption-hashing.md) · [41 Testing](./topics/41-laravel-testing.md) · [42 Factories](./topics/42-laravel-factories.md) · [58 Events vs Observers](./topics/58-events-vs-observers.md) · [59 Broadcasting](./topics/59-broadcasting-websockets.md) · [60 Reverb](./topics/60-laravel-reverb.md) · [65 Queues & Distributed](./topics/65-queues-distributed-systems.md) |
| **M17 — Senior & Full-Stack** | [23 API Development](./topics/23-api-development.md) · [24 API Resources](./topics/24-api-resources.md) · [39 Logging](./topics/39-laravel-logging.md) · [40 Exceptions](./topics/40-exception-handling.md) · [53 Service Layer](./topics/53-service-layer.md) · [54 Repository](./topics/54-repository-pattern.md) · [55 SOLID](./topics/55-solid.md) · [56 Design Patterns](./topics/56-design-patterns.md) · [57 Macros](./topics/57-laravel-macros.md) · [61 Octane](./topics/61-laravel-octane.md) · [62 Performance](./topics/62-laravel-performance.md) · [66 Deployment](./topics/66-laravel-deployment.md) · [67 Production Optimization](./topics/67-production-optimization.md) · [68 CI/CD](./topics/68-cicd.md) · [69 Inertia](./topics/69-laravel-react-inertia.md) · [70 Next.js](./topics/70-laravel-nextjs.md) · [71 Stripe](./topics/71-laravel-stripe.md) · [72 Multi-Tenancy](./topics/72-multitenancy.md) · [73 AI](./topics/73-laravel-ai.md) · [74 System Design](./topics/74-system-design.md) · [75 Senior Scenarios](./topics/75-senior-scenarios.md) |

---

## Milestone M13 — Laravel Fundamentals (L105–L110)

*How the framework is put together.*

| Lesson | Checklist topics | Tier |
|---|---|---|
| [105 What is Laravel?](./105-what-is-laravel.md) | #1 What is Laravel, MVC architecture | 🔴 1 |
| [106 Request Lifecycle](./106-request-lifecycle.md) | #1 Request lifecycle, `public/index.php`, `bootstrap/app.php` | 🔴 1 |
| [107 Application Structure & Bootstrapping](./107-app-structure.md) | #1 App structure, config, env vars, helpers, Artisan; #44 Artisan commands | 🔴 1 |
| [108 Service Container & DI](./108-service-container.md) | #5 IoC, DI, bindings, singleton, contextual binding, automatic resolution | 🔴 1 |
| [109 Service Providers](./109-service-providers.md) | #6 `register()` vs `boot()`, provider lifecycle | 🟠 2 |
| [110 Facades & Contracts](./110-facades-contracts.md) | #7 Facades (real nature, facade root); #52 Contracts | 🟠 2 |

---

## Milestone M14 — Routing & Request Handling (L111–L114)

*The map from URL to response.*

| Lesson | Checklist topics | Tier |
|---|---|---|
| [111 Routing](./111-routing.md) | #2 Routes, params, model binding, groups, resource/API routes, caching | 🔴 1 |
| [112 Middleware](./112-middleware.md) | #3 Middleware purpose, groups, params, terminable, `$next($request)` | 🔴 1 |
| [113 Controllers, Requests & Responses](./113-controllers.md) | #4 Controllers, single-action, DI, form requests; #25 HTTP responses | 🔴 1 |
| [114 Blade](./114-blade.md) | #22 Components, layouts, slots, directives, escaping `{{ }}` vs raw | 🔴 1 |

---

## Milestone M15 — Eloquent & the Database (L115–L121)

*Where the data lives.*

| Lesson | Checklist topics | Tier |
|---|---|---|
| [115 Eloquent ORM](./115-eloquent.md) | #8 Models, `$fillable`/`$guarded`, `$casts`, accessors/mutators; #49 Global scopes; #50 Soft deletes; #51 Accessors & Mutators | 🔴 1 |
| [116 Eloquent Relationships](./116-eloquent-relationships.md) | #9 One-to-one, one-to-many, many-to-many, `hasManyThrough`, polymorphic, pivot | 🔴 1 |
| [117 Eager Loading & the N+1 Problem](./117-n1-problem.md) | #10 Eager loading (`with()`, `load()`, `loadMissing()`); #11 N+1 and how to detect it | 🔴 1 |
| [118 Query Optimization & the Query Builder](./118-query-optimization.md) | #12 Optimize; #13 Query Builder vs Eloquent; #45 Collections; #46 Lazy Collections; #47 Pagination | 🔴 1 |
| [119 Migrations, Schema & Seeders](./119-migrations.md) | #14 Migrations, schema, foreign keys, indexes, soft deletes; #43 Seeders | 🔴 1 |
| [120 Database Transactions & Concurrency](./120-transactions.md) | #15 Transactions, atomicity, deadlocks; #64 Concurrency, locking, overselling | 🔴 1 |
| [121 Validation & Form Requests](./121-validation.md) | #16 `validate()`, Form Requests, custom rules, `authorize()` | 🔴 1 |

---

## Milestone M16 — Auth, Queues & Async (L122–L129)

*Identity, work, and waiting.*

| Lesson | Checklist topics | Tier |
|---|---|---|
| [122 Authentication](./122-authentication.md) | #17 Guards, sessions, Sanctum/Passport/Fortify, hashing; #19 Sanctum; #20 Passport; #21 Fortify | 🔴 1 |
| [123 Authorization](./123-authorization.md) | #18 Gates, policies, roles, permissions | 🔴 1 |
| [124 Queues & Jobs](./124-queues.md) | #26 Queues; #27 Horizon; #59–60 Broadcasting/Reverb; #65 Distributed queues | 🔴 1 |
| [125 Events, Listeners & Observers](./125-events-observers.md) | #28 Events/listeners; #29 Jobs vs Events; #48 Model events & observers; #58 Events vs Observers | 🔴 1 |
| [126 Notifications, Mail & Scheduling](./126-notifications-mail.md) | #30 Notifications; #31 Mail; #32 Scheduling | 🔴 1 |
| [127 Caching & Redis](./127-caching-redis.md) | #33 Caching; #34 Redis | 🔴 1 |
| [128 Rate Limiting & Security](./128-security.md) | #35 Rate limiting; #36 Files & Storage; #37 Security; #38 Encryption & Hashing | 🔴 1 |
| [129 Testing, Factories & Mocking](./129-testing.md) | #41 Testing; #42 Factories; #43 Seeders in tests | 🔴 1 |

---

## Milestone M17 — Senior & Full-Stack (L130–L134)

*The round that decides the offer.*

| Lesson | Checklist topics | Tier |
|---|---|---|
| [130 Service Layer, Repositories & SOLID](./130-solid-patterns.md) | #53 Service layer; #54 Repository; #55 SOLID; #56 Design patterns; #57 Macros | 🟠 2 |
| [131 Laravel Performance & Deployment](./131-performance-deployment.md) | #39 Logging; #40 Exception handling; #61 Octane; #62 Performance; #66 Deployment; #67 Production optimization; #68 CI/CD | 🟠 2 |
| [132 Laravel + React / Inertia](./132-inertia.md) | #69 Inertia architecture, forms, validation, partial reloads | 🟢 3 |
| [133 Laravel API + Next.js & Payments](./133-api-nextjs-stripe.md) | #23 API development; #24 API Resources; #70 Next.js; #71 Stripe | 🟢 3 |
| [134 Multi-Tenancy & System Design](./134-multitenancy.md) | #72 Multi-tenant SaaS; #73 Laravel + AI; #74 System design; #75 Senior scenarios | 🟢 3 |

---

## The 10 Senior Scenarios — where each is answered

These are the questions that separate senior engineers from syntax specialists. Each has a home
lesson with the decision rule, not just the answer.

| Scenario | Where it's answered |
|---|---|
| 1. API takes 8 seconds | [131 Performance & Deployment](./131-performance-deployment.md) — the 10-rung ladder |
| 2. 50M users fetched efficiently | [131 Performance & Deployment](./131-performance-deployment.md) — chunk/cursor/pagination |
| 3. Two users buy the last item | [120 Transactions & Concurrency](./120-transactions.md) — pessimistic vs optimistic locking |
| 4. Queue processing 100k jobs | [124 Queues & Jobs](./124-queues.md) — workers, Horizon, scaling |
| 5. Stripe webhook arrives twice | [133 API + Next.js & Payments](./133-api-nextjs-stripe.md) — idempotency, verified webhook |
| 6. API gets 10x traffic | [131 Performance & Deployment](./131-performance-deployment.md) — the ladder + infra |
| 7. Deployment breaks production | [131 Performance & Deployment](./131-performance-deployment.md) — rollback |
| 8. Customer sees another tenant's data | [134 Multi-Tenancy & System Design](./134-multitenancy.md) — the leak-proof layers |
| 9. Redis goes down | [127 Caching & Redis](./127-caching-redis.md) — cache fallback, locks |
| 10. External API takes 20s | [124 Queues & Jobs](./124-queues.md) — queues, timeouts, retries |
