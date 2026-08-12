'use strict';
// Lesson 126 — Notifications, Mail & Scheduling. Run with:  node exercises/06-laravel/126-notifications-mail.js
// Predict every output BEFORE running. Write your prediction in the comment.
//
// Models Laravel's scheduler in plain JS: a list of scheduled tasks,
// next-run calculation from a cron-ish expression, and the
// withoutOverlapping guard from Lesson 126.

// ── Task 1 ──────────────────────────────────────────────────────────
// Fill the gap so addTask() stores a task and nextRun() returns the
// timestamp of the next time it should fire, given `now` in ms.
function createScheduler() {
  const tasks = []; // { name, everyMs, nextRunAt }
  return {
    addTask(name, everyMs) {
      // your code here
    },
    nextRun(name) {
      // your code here
    },
  };
}

function task1() {
  const sched = createScheduler();
  const now = Date.parse('2026-03-04T10:00:00Z');
  sched.addTask('send-reminders', 60 * 60 * 1000); // ->hourly()
  sched.addTask('nightly-report', 24 * 60 * 60 * 1000); // ->daily()

  console.log(new Date(sched.nextRun('send-reminders')).toISOString());
  console.log(new Date(sched.nextRun('nightly-report')).toISOString());
}
// task1();
// Expected (relative to `now`): 11:00:00Z for the hourly task, 10:00:00Z NEXT
// DAY for the daily one. Each task computes its own next run from `now`.

// ── Task 2 ──────────────────────────────────────────────────────────
// Implement `due()` — return the names of the tasks whose next run has
// arrived at or before the given time. This is what `schedule:run` does
// every minute (Lesson 126).
function dueTasks(scheduler, atMs) {
  // your code here
}

function task2() {
  const sched = createScheduler();
  sched.addTask('reminders', 60 * 60 * 1000);
  sched.addTask('reports', 24 * 60 * 60 * 1000);

  const t0 = Date.parse('2026-03-04T10:00:00Z');
  console.log('at 10:00 →', dueTasks(sched, t0));
  console.log('at 10:59 →', dueTasks(sched, t0 + 59 * 60 * 1000));
  console.log('at 11:00 →', dueTasks(sched, t0 + 60 * 60 * 1000));
}
// task2();
// Expected: at 10:00 → ['reminders', 'reports'] (both were "due" at t0),
//           at 10:59 → [] (nothing new), at 11:00 → ['reminders'] again.
// The scheduler only fires what is due AT that moment — the cron heartbeat.

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// `withoutOverlapping()`: a long task must not start a second run while
// the first is still going. Predict the order of these log lines.
function task3() {
  const log = [];
  let running = false;

  function runLongTask(name) {
    if (running) {
      log.push(name + ': skipped (overlapping)');
      return;
    }
    running = true;
    log.push(name + ': started');
    setTimeout(() => {
      running = false;
      log.push(name + ': finished');
    }, 50);
  }

  runLongTask('report');   // 02:30 run
  runLongTask('report');   // 02:31 run — still running, must be skipped
  setTimeout(() => runLongTask('report'), 80); // 02:32 run — lock is free now
}
// task3();
// Expected:
// 'report: started', 'report: skipped (overlapping)', 'report: started'
// then (≈80ms later) 'report: finished', 'report: finished'.
// The lock prevents a second copy; once it frees, the next run proceeds.

// ── Task 4 ──────────────────────────────────────────────────────────
// A notification fan-out: `via()` returns the channels a message should
// travel through. Fill the gap so `notify` delivers to every channel in
// `via()` and returns what each channel received.
function createNotifier() {
  const channels = {
    mail: (msg) => 'mail:' + msg,
    database: (msg) => 'db:' + msg,
    slack: (msg) => 'slack:' + msg,
  };
  return {
    notify(msg, via) {
      // your code here
    },
  };
}

function task4() {
  const notifier = createNotifier();
  console.log(notifier.notify('order shipped', ['mail', 'database']));
  console.log(notifier.notify('order shipped', ['slack']));
}
// task4();
// Expected:
// [ 'mail:order shipped', 'db:order shipped' ]
// [ 'slack:order shipped' ]
// via() decides the channels — the message stays the same, the stamps change.

// ── Task 5 ──────────────────────────────────────────────────────────
// Mailable vs queued mailable: `send()` runs synchronously; `queue()` runs
// later. Predict which of these log lines appear in which order.
function task5() {
  const log = [];

  function sendSync() {
    log.push('mail: sent synchronously'); // Mail::send() blocks the request
  }
  function sendQueued() {
    setTimeout(() => log.push('mail: queued, sent by worker'), 0); // Mail::queue()
  }

  sendSync();
  sendQueued();
  log.push('request returned 201');
  setTimeout(() => console.log('final:', log), 10);
}
// task5();
// Expected: final: [ 'mail: sent synchronously', 'request returned 201',
//                   'mail: queued, sent by worker' ]
// The queued mail is a macrotask (Lesson 22) — it lands after the response.

module.exports = { createScheduler, dueTasks, createNotifier };
