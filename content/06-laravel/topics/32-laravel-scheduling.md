# Topic 32 — Laravel Scheduling

**Checklist anchor:** task scheduler · cron · scheduled commands · scheduled jobs · frequency · prevent overlapping · background execution

**Owning lesson:** [126 Notifications, Mail & Scheduling](../126-notifications-mail.md)

---

## The one-sentence answer

**Laravel's scheduler runs recurring tasks from PHP — one cron line calls `schedule:run` every minute, and your code decides what happens when, with frequencies, overlaps prevented, and background execution.**

## The mental model

The checklist's architecture:

```text
Cron (every minute)
   ↓
Laravel Scheduler (php artisan schedule:run)
   ↓
Command / Job (the actual work)
```

You write **one cron entry**, and Laravel becomes the task system:

```text
* * * * * cd /app && php artisan schedule:run >> /dev/null 2>&1
```

Every minute, cron pings the scheduler; the scheduler decides what's due — "it's midnight, run the daily purge" — and runs it. All the *when* logic lives in PHP, version-controlled with the app, instead of scattered cron syntax on servers.

## How it works

### Defining the schedule

```php
// routes/console.php
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send-daily-digest')->dailyAt('09:00');
Schedule::job(new PurgeOldRecords)->weeklyOn(1, '02:00');   // jobs too
Schedule::call(fn () => /* a closure */)->everyFifteenMinutes();
```

### Frequencies

```php
->everyMinute()  ->everyFiveMinutes()  ->everyFifteenMinutes()
->hourly()       ->daily()             ->dailyAt('09:00')
->weekly()       ->weeklyOn(1, '02:00')   // Monday 02:00
->monthly()      ->monthlyOn(1, '00:00')
->cron('*/5 * * * *')                 // anything crontab can say
```

### Prevent overlapping & run in background

```php
Schedule::command('reports:generate')
    ->everyFiveMinutes()
    ->withoutOverlapping();        // don't start a new run while one is active
//    ->withoutOverlapping(60)     // release the lock after 60 min (stuck runs)

Schedule::command('exports:run')
    ->everyMinute()
    ->runInBackground();           // don't block the scheduler process
```

- **`withoutOverlapping()`** uses a cache lock (Lesson 33) — a job that runs longer than its interval won't pile up concurrent copies.
- **`runInBackground()`** spawns the command as a separate process so a long command doesn't delay the scheduler's other due tasks.

### When it's due — the model

```php
Schedule::command('digest:send')->dailyAt('09:00');
// every minute cron calls schedule:run
// schedule:run checks: is 09:00 passed? due → run the command
```

## Interview questions

**Q1. How does Laravel's scheduler work?**
> One cron entry runs `php artisan schedule:run` every minute. The scheduler reads the definitions in `routes/console.php` and runs whatever is due — a command, job, or closure, at the frequency you defined. All the scheduling logic lives in PHP with the app instead of cron syntax scattered across servers.

**Q2. What can you schedule?**
> Commands (`Schedule::command`), queued jobs (`Schedule::job`), and closures (`Schedule::call`) — with frequencies from `everyMinute()` to `monthly()`, plus full `cron()` expressions. The "what runs when" is version-controlled code.

**Q3. What does `withoutOverlapping()` do?**
> It uses a cache lock so a task won't start while a previous run is still going — a long daily job that overlaps into the next day, or a slow job whose interval is shorter than its runtime, won't spawn concurrent duplicates. Optionally release the lock after N minutes so a stuck run doesn't block forever.

**Q4. What does `runInBackground()` do?**
> Runs the scheduled task as a separate process instead of inline. Without it, one long command blocks the scheduler, delaying every other task due at the same minute. With it, the scheduler fires the task and moves on.

**Q5. How do you deploy scheduled tasks?**
> The single cron line (or a scheduler service like Laravel Cloud / a worker container) plus `schedule:run`. The definitions ship with the code, so a deploy changes what runs when — no per-server cron edits. Rollback is a deploy, because the schedule is code.

**Senior follow-up: How do you make scheduled jobs reliable?**
> The same distributed-system rules as queues (Lesson 65): idempotency (a retried run must be safe), `withoutOverlapping()` for long jobs, `runInBackground()` for independent ones, and alerting when a task fails. A scheduled purge that silently dies for a week is an incident without an alarm — log it, and consider Horizon-like visibility for the job path.

## Common mistakes

❌ Writing cron syntax on servers instead of using the scheduler — the schedule scatters and drifts.

❌ Forgetting `withoutOverlapping()` on long jobs — concurrent duplicate runs.

❌ Long inline commands without `runInBackground()` — the scheduler stalls every other due task.

❌ Scheduling jobs that aren't idempotent — an overlapping retry doubles the work.

## Quick revision notes

- One cron line → `schedule:run` every minute → **PHP decides what's due**
- `Schedule::command` · `Schedule::job` · `Schedule::call`
- Frequencies: `everyMinute` → `dailyAt` → `weeklyOn` → `cron('...')`
- `withoutOverlapping()` = cache-lock, no concurrent copies
- `runInBackground()` = separate process, scheduler moves on
- Schedule is **code** — deploys change it, rollback is a deploy

## Check your understanding

1. What's the one cron line, and what does it trigger?
2. Name three things you can schedule and how.
3. What problem does `withoutOverlapping()` solve, and how?
4. When is `runInBackground()` necessary?
5. How do you keep a scheduled job reliable in production?
