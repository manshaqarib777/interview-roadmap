# Laravel Interview Master Checklist

The complete interview checklist for **Senior Full-Stack / Laravel roles** — Laravel fundamentals +
internals + architecture + security + performance + production + system design. Each topic maps to a
lesson in this module.

> Every numbered topic below is covered in this module. The **→ links** point at the lesson (or
> lesson section) that owns it. Use this page as the master map; the lessons are the detail.

---

## 1. Laravel Fundamentals

Know these extremely well:

- What is Laravel?
- MVC architecture
- Request lifecycle
- Laravel application structure
- `public/index.php`
- `bootstrap/app.php`
- Service providers
- Facades
- Contracts
- Helpers
- Configuration
- Environment variables
- Artisan
- Middleware
- Routing
- Controllers
- Requests
- Responses
- Views / Blade
- Sessions
- Cookies
- CSRF protection
- Encryption
- Logging

**Common questions**

- Explain Laravel's request lifecycle.
- What happens when a request reaches `public/index.php`?
- What is the IoC container?
- What are service providers?
- What are facades?
- Facade vs dependency injection?
- What are Laravel contracts?
- Why shouldn't you put business logic inside controllers?

**→ Lessons:** [105 What is Laravel](./105-what-is-laravel.md) · [106 Request Lifecycle](./106-request-lifecycle.md) · [107 Application Structure & Bootstrapping](./107-app-structure.md) · [108 Service Container & DI](./108-service-container.md) · [109 Service Providers](./109-service-providers.md) · [110 Facades & Contracts](./110-facades-contracts.md)

---

## 2. Routing

Know:

- Basic routes
- Route parameters
- Optional parameters
- Named routes
- Route groups
- Prefixes
- Middleware groups
- Route model binding
- Custom route model binding
- Resource routes
- API routes
- Fallback routes
- Route caching
- Route constraints

Example concepts:

```php
Route::get('/users/{user}', ...);
```

Understand why Laravel can automatically resolve `{user}` into a `User` model.

**Interview questions**

- What is implicit route model binding?
- Explicit vs implicit binding?
- How does route caching work?
- `web.php` vs `api.php`?
- How do route groups work?

**→ Lesson:** [111 Routing](./111-routing.md)

---

## 3. Middleware

Understand:

- Middleware purpose
- Global middleware
- Route middleware
- Middleware groups
- Middleware parameters
- Terminable middleware
- Middleware priority

Typical examples:

- Authentication
- Authorization
- CORS
- Rate limiting
- Logging
- Request modification

**Questions**

- What happens when middleware calls `$next($request)`?
- How would you create middleware to restrict access to admins?
- Middleware vs authorization policy?

**→ Lesson:** [112 Middleware](./112-middleware.md)

---

## 4. Controllers

Know:

- Resource controllers
- Single-action controllers
- Dependency injection
- Controller middleware
- Form requests
- Invokable controllers

Avoid:

```text
Controller
 ↓
50 lines business logic
 ↓
Database
 ↓
Email
 ↓
Payment
```

Understand separation of concerns.

**→ Lesson:** [113 Controllers, Requests & Responses](./113-controllers.md)

---

## 5. Dependency Injection & Service Container

This is **very important for senior interviews**.

Learn:

- IoC
- Dependency Injection
- Service Container
- Binding
- Singleton
- Scoped bindings
- Contextual binding
- Interface → implementation
- Automatic resolution

Example:

```php
$this->app->bind(
    PaymentGateway::class,
    StripePaymentGateway::class
);
```

Understand:

> Why dependency injection is better than directly instantiating dependencies.

**→ Lesson:** [108 Service Container & DI](./108-service-container.md)

---

## 6. Service Providers

Know:

- `register()`
- `boot()`
- Provider lifecycle
- Custom service providers
- Binding services
- Loading configuration
- Registering macros

Question:

> What's the difference between `register()` and `boot()`?

**→ Lesson:** [109 Service Providers](./109-service-providers.md)

---

## 7. Facades

Know:

```php
Cache::get()
DB::table()
Log::info()
Storage::put()
```

Understand:

- What facades actually are
- Static-looking syntax
- Facade root
- Dependency resolution
- Testing facades
- Facades vs dependency injection

Senior-level question:

> Are Laravel facades actually static?

**→ Lesson:** [110 Facades & Contracts](./110-facades-contracts.md)

---

## 8. Eloquent ORM

This is probably the **largest Laravel interview topic**.

Master:

- Models
- `$fillable`
- `$guarded`
- `$casts`
- Accessors
- Mutators
- Attribute objects
- Relationships
- Scopes
- Events
- Observers
- Collections
- Query builder
- Model events
- Serialization

**→ Lesson:** [115 Eloquent ORM](./115-eloquent.md)

---

## 9. Eloquent Relationships

You must know:

### One-to-one

```php
hasOne()
belongsTo()
```

### One-to-many

```php
hasMany()
belongsTo()
```

### Many-to-many

```php
belongsToMany()
```

### Has-many-through

```php
hasManyThrough()
```

### Polymorphic

```php
morphOne()
morphMany()
morphTo()
morphToMany()
```

**Questions**

- `hasOne()` vs `belongsTo()`?
- How does many-to-many work?
- What is a pivot table?
- What is a polymorphic relationship?
- When would you use `hasManyThrough()`?

**→ Lesson:** [116 Eloquent Relationships](./116-eloquent-relationships.md)

---

## 10. Eager Loading

Very important.

Understand:

```php
User::with('posts')->get();
```

vs:

```php
User::all();
```

Learn:

- Lazy loading
- Eager loading
- Lazy eager loading
- `with()`
- `load()`
- `loadMissing()`
- Nested eager loading
- Conditional eager loading

**→ Lesson:** [117 Eager Loading & the N+1 Problem](./117-n1-problem.md)

---

## 11. N+1 Problem

**Absolutely prepare this.**

Example:

```php
$users = User::all();

foreach ($users as $user) {
    echo $user->posts;
}
```

Why is it inefficient?

How does:

```php
User::with('posts')->get();
```

solve it?

Also know how to detect N+1 problems.

**→ Lesson:** [117 Eager Loading & the N+1 Problem](./117-n1-problem.md)

---

## 12. Eloquent Query Optimization

Know:

- `select()`
- `where()`
- `whereHas()`
- `with()`
- `withCount()`
- `exists()`
- `chunk()`
- `chunkById()`
- `cursor()`
- `lazy()`
- Pagination
- Indexes
- Query logging
- `EXPLAIN`

Question:

> How would you optimize a Laravel endpoint returning 1 million records?

**→ Lesson:** [118 Query Optimization & the Query Builder](./118-query-optimization.md)

---

## 13. Query Builder

Know:

```php
DB::table()
```

Understand:

- joins
- subqueries
- grouping
- aggregates
- transactions
- raw expressions
- unions
- pagination

And:

> Query Builder vs Eloquent?

**→ Lesson:** [118 Query Optimization & the Query Builder](./118-query-optimization.md)

---

## 14. Database & Migrations

Master:

- Migrations
- Schema builder
- Foreign keys
- Indexes
- Unique indexes
- Composite indexes
- Soft deletes
- Timestamps
- Database transactions
- Seeders
- Factories

Know:

```bash
php artisan migrate
php artisan migrate:fresh
php artisan migrate:refresh
php artisan migrate:rollback
```

**→ Lesson:** [119 Migrations, Schema & Seeders](./119-migrations.md)

---

## 15. Database Transactions

Very important for senior roles.

Understand:

```php
DB::transaction(function () {
    // operations
});
```

Know:

- Atomicity
- Rollback
- Deadlocks
- Nested transactions
- When transactions are necessary

Example:

```text
Create order
 ↓
Create payment
 ↓
Reduce inventory
 ↓
Send confirmation
```

What happens if inventory update fails?

**→ Lesson:** [120 Database Transactions & Concurrency](./120-transactions.md)

---

## 16. Validation

Master:

- `$request->validate()`
- Form Requests
- Custom validation rules
- Conditional validation
- Nested validation
- Custom messages
- Authorization inside Form Requests

Know:

```php
public function authorize()
```

and:

```php
public function rules()
```

**→ Lesson:** [121 Validation & Form Requests](./121-validation.md)

---

## 17. Authentication

Understand:

- Authentication vs authorization
- Guards
- Providers
- Sessions
- API authentication
- Sanctum
- Passport
- Fortify
- Password hashing
- Remember me
- Email verification
- Password reset

Very common:

> Sanctum vs Passport?

**→ Lesson:** [122 Authentication](./122-authentication.md)

---

## 18. Authorization

Know:

- Gates
- Policies
- `authorize()`
- Middleware
- Roles
- Permissions

Understand:

> Authentication = Who are you?

> Authorization = What are you allowed to do?

**→ Lesson:** [123 Authorization](./123-authorization.md)

---

## 19. Laravel Sanctum

Prepare:

- SPA authentication
- API tokens
- Personal access tokens
- CSRF
- Cookie-based authentication
- Token abilities

Question:

> When would you use Sanctum instead of Passport?

**→ Lessons:** [122 Authentication](./122-authentication.md) · [133 Laravel API + Next.js & Payments](./133-api-nextjs-stripe.md)

---

## 20. Laravel Passport

Know conceptually:

- OAuth2
- Access tokens
- Refresh tokens
- Clients
- Scopes
- OAuth flows

You don't necessarily need to memorize every implementation detail unless the job specifically uses Passport.

**→ Lesson:** [122 Authentication](./122-authentication.md)

---

## 21. Laravel Fortify

Since you've worked with Fortify, know:

- Authentication backend
- Login
- Registration
- Password reset
- Email verification
- 2FA
- Authentication pipelines
- Custom authentication flows

Potential question:

> Fortify vs Breeze vs Jetstream?

**→ Lesson:** [122 Authentication](./122-authentication.md)

---

## 22. Laravel Blade

Know:

- Components
- Layouts
- Slots
- Directives
- Loops
- Conditionals
- Includes
- Sections
- Stacks
- Blade components
- Blade escaping

Security:

```blade
{{ $value }}
```

vs raw output.

**→ Lesson:** [114 Blade](./114-blade.md)

---

## 23. API Development

Very important for your profile.

Know:

- REST
- HTTP methods
- Status codes
- API Resources
- API versioning
- Pagination
- Filtering
- Sorting
- Searching
- Rate limiting
- Authentication
- Authorization
- Error handling

**→ Lessons:** [133 Laravel API + Next.js & Payments](./133-api-nextjs-stripe.md) · [128 Rate Limiting & Security](./128-security.md)

---

## 24. API Resources

Understand:

```php
UserResource::make($user);
```

and:

```php
UserResource::collection($users);
```

Questions:

- Why use API Resources?
- Resource vs model?
- How do you conditionally include relationships?
- How do you standardize API responses?

**→ Lesson:** [133 Laravel API + Next.js & Payments](./133-api-nextjs-stripe.md)

---

## 25. HTTP Responses

Know:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
```

Especially:

**401 vs 403**

**→ Lessons:** [113 Controllers, Requests & Responses](./113-controllers.md) · [128 Rate Limiting & Security](./128-security.md)

---

## 26. Queues

🔥 **Extremely important for senior Laravel interviews.**

Learn:

- Jobs
- Queue workers
- Queue connections
- Redis queues
- Database queues
- Failed jobs
- Retries
- Backoff
- Timeouts
- Delayed jobs
- Job batching
- Job chains
- Horizon

Example:

```text
HTTP Request
     ↓
Create Order
     ↓
Dispatch Job
     ↓
Queue
     ↓
Worker
     ↓
Send Email
```

Question:

> Why shouldn't you send emails synchronously inside a request?

**→ Lesson:** [124 Queues & Jobs](./124-queues.md)

---

## 27. Laravel Horizon

Know:

- Queue monitoring
- Workers
- Supervisors
- Metrics
- Redis
- Failed jobs
- Balancing

**→ Lesson:** [124 Queues & Jobs](./124-queues.md)

---

## 28. Events & Listeners

Understand:

```text
OrderCreated
      ↓
Listeners
 ├── SendEmail
 ├── UpdateAnalytics
 └── NotifyAdmin
```

Know:

- Events
- Listeners
- Queued listeners
- Event discovery
- Event subscribers

**→ Lesson:** [125 Events, Listeners & Observers](./125-events-observers.md)

---

## 29. Jobs vs Events

This is a good interview question.

Understand the difference.

**Job**

> Execute a specific piece of work.

**Event**

> Something happened in the system.

**→ Lesson:** [125 Events, Listeners & Observers](./125-events-observers.md)

---

## 30. Notifications

Know:

- Mail
- Database
- Slack
- Broadcast
- Custom channels
- Notification queues

**→ Lesson:** [126 Notifications, Mail & Scheduling](./126-notifications-mail.md)

---

## 31. Mail

Understand:

- Mailables
- Markdown mail
- Queued mail
- Attachments
- Templates
- Mail drivers
- Mail configuration

**→ Lesson:** [126 Notifications, Mail & Scheduling](./126-notifications-mail.md)

---

## 32. Laravel Scheduling

Know:

- Task scheduler
- Cron
- Scheduled commands
- Scheduled jobs
- Frequency
- Prevent overlapping
- Background execution

Architecture:

```text
Cron
 ↓
Laravel Scheduler
 ↓
Command / Job
```

**→ Lesson:** [126 Notifications, Mail & Scheduling](./126-notifications-mail.md)

---

## 33. Caching

🔥 Important.

Know:

- Cache drivers
- Redis
- File cache
- Database cache
- Cache keys
- TTL
- Cache tags
- Cache invalidation
- `remember()`
- `rememberForever()`
- Cache locking

Example:

```php
Cache::remember(
    'users',
    3600,
    fn () => User::all()
);
```

Senior question:

> What happens when cached data becomes stale?

**→ Lesson:** [127 Caching & Redis](./127-caching-redis.md)

---

## 34. Redis

Understand:

- Cache
- Queues
- Locks
- Pub/Sub concepts
- Rate limiting
- Sessions

And why Redis is generally faster than querying a relational database for frequently accessed ephemeral data.

**→ Lessons:** [127 Caching & Redis](./127-caching-redis.md) · [124 Queues & Jobs](./124-queues.md)

---

## 35. Rate Limiting

Know:

- Laravel RateLimiter
- API throttling
- User-based limits
- IP-based limits
- Redis-backed rate limiting

Example:

```text
100 requests/minute/user
```

**→ Lesson:** [128 Rate Limiting & Security](./128-security.md)

---

## 36. Files & Storage

Know:

- Storage facade
- Local disk
- S3
- Public/private files
- Signed URLs
- Temporary URLs
- File uploads
- File validation
- Storage disks

**→ Lesson:** [128 Rate Limiting & Security](./128-security.md)

---

## 37. Laravel Security

🔥🔥 Very important.

Prepare:

### SQL Injection

Understand why Eloquent/query builder parameter binding helps.

### XSS

Blade escaping.

### CSRF

Understand how Laravel protects state-changing browser requests.

### Mass Assignment

```php
$fillable
$guarded
```

### Authentication

Secure password hashing.

### Authorization

Policies/Gates.

### File Upload Security

- MIME validation
- Size validation
- Extension concerns
- Storage outside public directory

### Secrets

Don't commit `.env`.

**→ Lesson:** [128 Rate Limiting & Security](./128-security.md)

---

## 38. Encryption & Hashing

Know the difference.

**Hashing**

One-way:

```text
password → hash
```

**Encryption**

Reversible with a key:

```text
data → encrypted data → original data
```

Laravel:

```php
Hash::make()
Crypt::encryptString()
```

**→ Lesson:** [128 Rate Limiting & Security](./128-security.md)

---

## 39. Laravel Logging

Know:

- Log channels
- Stacks
- Daily logs
- Syslog
- Slack
- Context
- Log levels

Example:

```php
Log::error('Payment failed', [
    'order_id' => $order->id,
]);
```

**→ Lesson:** [131 Laravel Performance & Deployment](./131-performance-deployment.md)

---

## 40. Exception Handling

Understand:

- Exceptions
- Global exception handling
- Custom exceptions
- HTTP exceptions
- Rendering
- Reporting
- Logging
- API error responses

**→ Lessons:** [131 Laravel Performance & Deployment](./131-performance-deployment.md) · [133 Laravel API + Next.js & Payments](./133-api-nextjs-stripe.md)

---

## 41. Laravel Testing

🔥 Senior interviews frequently ask this.

Know:

### Unit tests

Test individual components.

### Feature tests

Test application behavior.

### HTTP tests

Test endpoints.

### Database testing

- RefreshDatabase
- Factories
- Seeders

### Mocking

- Mockery
- Laravel mocking helpers

**→ Lesson:** [129 Testing, Factories & Mocking](./129-testing.md)

---

## 42. Laravel Factories

Know:

```php
User::factory()->count(10)->create();
```

Understand:

- States
- Relationships
- Faker
- Factory callbacks

**→ Lesson:** [129 Testing, Factories & Mocking](./129-testing.md)

---

## 43. Seeders

Know:

```bash
php artisan db:seed
```

Understand:

- Development data
- Test data
- Production considerations

**→ Lesson:** [129 Testing, Factories & Mocking](./129-testing.md) · [119 Migrations, Schema & Seeders](./119-migrations.md)

---

## 44. Artisan

Master common commands.

```bash
php artisan make:model
php artisan make:controller
php artisan make:migration
php artisan make:request
php artisan make:resource
php artisan make:job
php artisan make:event
php artisan make:listener
php artisan make:policy
php artisan make:test
```

Also:

```bash
php artisan route:list
php artisan migrate
php artisan queue:work
php artisan optimize
php artisan config:cache
php artisan route:cache
```

**→ Lessons:** [107 Application Structure & Bootstrapping](./107-app-structure.md) · [119 Migrations, Schema & Seeders](./119-migrations.md)

---

## 45. Laravel Collections

Very common.

Know:

```php
map()
filter()
reduce()
each()
pluck()
groupBy()
keyBy()
sortBy()
unique()
flatten()
flatMap()
first()
contains()
where()
```

And understand:

> Collection vs Query Builder

**→ Lesson:** [118 Query Optimization & the Query Builder](./118-query-optimization.md)

---

## 46. Lazy Collections

Important for large datasets.

Know:

```php
LazyCollection
cursor()
lazy()
```

Why?

You don't want:

```text
1,000,000 records
↓
Load everything into RAM
```

**→ Lesson:** [118 Query Optimization & the Query Builder](./118-query-optimization.md)

---

## 47. Pagination

Know:

```php
paginate()
simplePaginate()
cursorPaginate()
```

Understand the difference.

Especially:

> Why can cursor pagination perform better for very large datasets?

**→ Lesson:** [118 Query Optimization & the Query Builder](./118-query-optimization.md)

---

## 48. Model Events & Observers

Know:

```text
creating
created
updating
updated
saving
saved
deleting
deleted
restoring
restored
```

Understand observers.

**→ Lesson:** [125 Events, Listeners & Observers](./125-events-observers.md)

---

## 49. Global Scopes

Example:

```php
protected static function booted()
{
    static::addGlobalScope(...);
}
```

Know:

- Global scopes
- Local scopes
- Removing global scopes

**→ Lesson:** [115 Eloquent ORM](./115-eloquent.md)

---

## 50. Soft Deletes

Know:

```php
use SoftDeletes;
```

and:

```php
withTrashed()
onlyTrashed()
withoutTrashed()
restore()
forceDelete()
```

**→ Lessons:** [115 Eloquent ORM](./115-eloquent.md) · [119 Migrations, Schema & Seeders](./119-migrations.md)

---

## 51. Accessors & Mutators

Know modern Laravel syntax.

Understand:

- Transforming attributes
- `$casts`
- Attribute objects
- Serialization

**→ Lesson:** [115 Eloquent ORM](./115-eloquent.md)

---

## 52. Laravel Contracts

Know interfaces such as:

- Cache contracts
- Queue contracts
- Mail contracts
- Filesystem contracts

Understand why contracts make implementations replaceable/testable.

**→ Lesson:** [110 Facades & Contracts](./110-facades-contracts.md)

---

## 53. Service Layer

Know when to extract business logic into:

```text
Controller
   ↓
Service
   ↓
Repository / Query
   ↓
Model
```

But also understand that **you don't automatically need a repository for every model**.

A senior interviewer may ask:

> "Why did you introduce a service layer here?"

You should have a concrete answer.

**→ Lesson:** [130 Service Layer, Repositories & SOLID](./130-solid-patterns.md)

---

## 54. Repository Pattern

Understand:

- Repository abstraction
- Interface
- Implementation
- Dependency injection
- Testing

And importantly:

> When does Repository Pattern become unnecessary abstraction?

**→ Lesson:** [130 Service Layer, Repositories & SOLID](./130-solid-patterns.md)

---

## 55. SOLID

You absolutely need this for senior Laravel interviews.

### S

Single Responsibility

### O

Open/Closed

### L

Liskov Substitution

### I

Interface Segregation

### D

Dependency Inversion

Be able to give **Laravel examples**.

**→ Lesson:** [130 Service Layer, Repositories & SOLID](./130-solid-patterns.md)

---

## 56. Design Patterns

Know at least:

- Factory
- Strategy
- Repository
- Adapter
- Observer
- Singleton
- Dependency Injection
- Decorator
- Builder
- Command

Laravel itself uses many patterns.

**→ Lesson:** [130 Service Layer, Repositories & SOLID](./130-solid-patterns.md)

---

## 57. Laravel Macros

Understand:

- Collection macros
- Response macros
- Custom macros

Know when they are useful and when they can become confusing.

**→ Lesson:** [130 Service Layer, Repositories & SOLID](./130-solid-patterns.md)

---

## 58. Laravel Events vs Observers

Understand the difference.

**Event**

Application-level event.

**Observer**

Model lifecycle events.

**→ Lesson:** [125 Events, Listeners & Observers](./125-events-observers.md)

---

## 59. Broadcasting & WebSockets

For senior roles, understand:

- Broadcasting
- Events
- Channels
- Private channels
- Presence channels
- WebSockets
- Laravel Echo

Use cases:

- Chat
- Notifications
- Live dashboards
- Real-time status

**→ Lessons:** [124 Queues & Jobs](./124-queues.md) · [125 Events, Listeners & Observers](./125-events-observers.md)

---

## 60. Laravel Reverb

If the role uses modern Laravel, understand Laravel's first-party WebSocket server:

```text
Laravel
 ↓
Broadcast Event
 ↓
Reverb
 ↓
WebSocket
 ↓
Browser
```

**→ Lesson:** [124 Queues & Jobs](./124-queues.md)

---

## 61. Laravel Octane

🔥 Advanced topic.

Know why Octane can improve performance.

Understand:

- Long-lived workers
- Swoole
- RoadRunner
- Worker memory
- Application state
- Memory leaks
- Request lifecycle differences

**→ Lesson:** [131 Laravel Performance & Deployment](./131-performance-deployment.md)

---

## 62. Laravel Performance

Be ready for:

> "Your Laravel API is slow. What do you do?"

Your answer should cover:

```text
1. Measure
2. Database queries
3. N+1
4. Indexes
5. Eager loading
6. Pagination
7. Caching
8. Redis
9. Queues
10. PHP/opcache
11. API payload size
12. Infrastructure
13. Monitoring
```

**→ Lesson:** [131 Laravel Performance & Deployment](./131-performance-deployment.md)

---

## 63. Database Indexing

This goes beyond Laravel.

Know:

- Primary indexes
- Unique indexes
- Composite indexes
- Covering indexes
- Selectivity
- Query plans
- `EXPLAIN`

Example:

```text
WHERE user_id = ?
AND status = ?
```

Potential composite index:

```text
(user_id, status)
```

**→ Lessons:** [119 Migrations, Schema & Seeders](./119-migrations.md) · [118 Query Optimization & the Query Builder](./118-query-optimization.md)

---

## 64. Transactions & Concurrency

Advanced interview topic.

Know:

- Race conditions
- Database locks
- `lockForUpdate()`
- Deadlocks
- Optimistic locking concept
- Pessimistic locking
- Idempotency

Example:

Two users purchase the last item simultaneously.

How do you prevent overselling?

**→ Lesson:** [120 Database Transactions & Concurrency](./120-transactions.md)

---

## 65. Queues & Distributed Systems

For senior positions:

Understand:

```text
API
 ↓
Job
 ↓
Redis
 ↓
Worker
 ↓
External service
```

What if:

- worker crashes?
- job executes twice?
- external API times out?
- job takes 30 minutes?
- Redis goes down?

Know:

- Retry
- Backoff
- Timeout
- Idempotency
- Dead-letter/failed-job concepts

**→ Lesson:** [124 Queues & Jobs](./124-queues.md)

---

## 66. Laravel Deployment

Know how to deploy Laravel.

Typical:

```text
Nginx
 ↓
PHP-FPM
 ↓
Laravel
 ↓
MySQL/PostgreSQL
 ↓
Redis
```

Understand:

- Environment variables
- `.env`
- PHP extensions
- Composer
- migrations
- storage permissions
- queues
- workers
- scheduler
- cache
- OPcache

**→ Lesson:** [131 Laravel Performance & Deployment](./131-performance-deployment.md)

---

## 67. Production Optimization

Know:

```bash
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

And understand why you shouldn't blindly cache everything during development.

**→ Lesson:** [131 Laravel Performance & Deployment](./131-performance-deployment.md)

---

## 68. CI/CD

Since you have GitHub Actions experience, prepare:

```text
Git push
 ↓
CI
 ↓
Tests
 ↓
Lint
 ↓
Build
 ↓
Deploy
 ↓
Migration
 ↓
Restart workers
```

Know deployment rollback strategies.

**→ Lesson:** [131 Laravel Performance & Deployment](./131-performance-deployment.md)

---

## 69. Laravel + React / Inertia

Since you've worked with this stack, this is **particularly important for you**.

Know:

- Inertia architecture
- Server-side routing
- React pages
- Props
- Forms
- Validation errors
- Shared data
- Middleware
- Authentication
- Partial reloads
- Lazy props
- SPA navigation

Be ready to explain:

> Why use Inertia instead of a separate React frontend + REST API?

**→ Lesson:** [132 Laravel + React / Inertia](./132-inertia.md)

---

## 70. Laravel + Next.js

If you're interviewing as a full-stack engineer:

Know architectural options:

```text
Next.js
   ↓
Laravel API
   ↓
PostgreSQL
```

Understand:

- JWT
- Sanctum
- CORS
- CSRF
- API Resources
- SSR considerations
- Authentication
- Token handling

**→ Lesson:** [133 Laravel API + Next.js & Payments](./133-api-nextjs-stripe.md)

---

## 71. Laravel + Stripe

Given your experience, prepare:

- Stripe Checkout
- Payment intents
- Webhooks
- Subscription lifecycle
- Idempotency
- Failed payments
- Refunds
- Subscription cancellation
- Webhook verification

Most important:

> **Never rely solely on the frontend saying payment succeeded.**

Use the verified Stripe webhook.

**→ Lesson:** [133 Laravel API + Next.js & Payments](./133-api-nextjs-stripe.md)

---

## 72. Multi-Tenant SaaS

🔥🔥 Very important for senior SaaS roles.

Know architectures:

### Shared database

```text
tenant_id
```

### Separate schemas

```text
Tenant A → schema A
Tenant B → schema B
```

### Separate databases

```text
Tenant A → DB A
Tenant B → DB B
```

Understand:

- Tenant isolation
- Authorization
- Data leakage prevention
- Global scopes
- Database design
- Scaling

**→ Lesson:** [134 Multi-Tenancy & System Design](./134-multitenancy.md)

---

## 73. Laravel + AI

For the market you're targeting, I'd add this.

Know how Laravel can integrate with:

- OpenAI
- Anthropic
- Gemini
- embeddings
- vector databases
- pgvector
- RAG
- streaming
- background AI jobs

Architecture:

```text
React / Next.js
       ↓
Laravel API
       ↓
AI Service
       ↓
LLM
       ↓
PostgreSQL / Vector DB
```

And know when AI calls should be synchronous vs queued.

**→ Lesson:** [134 Multi-Tenancy & System Design](./134-multitenancy.md)

---

## 74. System Design Questions

At your experience level, expect questions like:

### Design a SaaS application.

### Design a chat application.

### Design an e-commerce backend.

### Design a notification system.

### Design a payment system.

### Design an API handling 1M requests/day.

### Design a multi-tenant Laravel application.

### Design an AI customer-support platform.

### Design a file-processing system.

### Design a job queue system.

**→ Lesson:** [134 Multi-Tenancy & System Design](./134-multitenancy.md)

---

## 75. Senior Laravel Scenario Questions

These are more important than memorizing commands.

### Scenario 1

> API response takes 8 seconds. How do you debug it?

### Scenario 2

> Your database has 50 million users. How do you fetch them efficiently?

### Scenario 3

> Two users purchase the same last product. What happens?

### Scenario 4

> Your queue is processing 100,000 jobs. How do you scale it?

### Scenario 5

> A Stripe webhook arrives twice. What do you do?

### Scenario 6

> Your API suddenly receives 10x traffic.

### Scenario 7

> A Laravel deployment breaks production.

### Scenario 8

> A customer can see another tenant's data.

### Scenario 9

> Your Redis server goes down.

### Scenario 10

> An external API takes 20 seconds to respond.

These separate **senior engineers from Laravel syntax specialists**.

**→ Lessons:** [120 Database Transactions & Concurrency](./120-transactions.md) · [131 Laravel Performance & Deployment](./131-performance-deployment.md) · [134 Multi-Tenancy & System Design](./134-multitenancy.md)

---

# Your Priority Order

Don't study these 75 topics equally.

For **your experience level**, I'd prioritize:

### 🔴 Tier 1 — Must know

1. Request lifecycle
2. Service container
3. Dependency injection
4. Middleware
5. Eloquent
6. Relationships
7. N+1
8. Query optimization
9. Transactions
10. Authentication
11. Authorization
12. APIs
13. Validation
14. Queues
15. Events
16. Caching
17. Redis
18. Security
19. Testing
20. Database indexing

**→ Milestone M13 + M14 + M15 + M16** — lessons [105–129]

### 🟠 Tier 2 — Senior-level

21. Service providers
22. Contracts
23. Repository/service patterns
24. SOLID
25. Design patterns
26. Horizon
27. Scheduling
28. Observers
29. Broadcasting
30. WebSockets
31. Octane
32. Concurrency
33. Idempotency
34. Multi-tenancy
35. Production deployment
36. CI/CD
37. Performance optimization

**→ Milestones M16 + M17** — lessons [124–134]

### 🟢 Tier 3 — Your competitive advantage

38. Laravel + React
39. Laravel + Inertia
40. Laravel + Next.js
41. Laravel + Stripe
42. Laravel + AI
43. RAG
44. AI queues/workflows
45. SaaS architecture
46. Distributed systems
47. System design

**→ Milestone M17** — lessons [132–134]
