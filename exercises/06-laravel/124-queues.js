'use strict';
// Lesson 124 — Queues & Jobs. Run with:  node exercises/06-laravel/124-queues.js
// Predict every output BEFORE running. Write your prediction in the comment.
//
// This file models Laravel's queue with plain JS: a jobs list, a worker loop,
// retries with backoff, a failed_jobs list, and a duplicate-run guard that
// shows why handlers must be idempotent (at-least-once delivery).

// ── Task 1 ──────────────────────────────────────────────────────────
// Fill the gap so each dispatch() call pushes one job onto the queue and
// returns the new queue length — the "jobs table insert" from Lesson 124.
function createQueue() {
  const jobs = [];
  return {
    dispatch(job) {
      // your code here
    },
    length: () => jobs.length,
  };
}

function task1() {
  const queue = createQueue();
  console.log(queue.dispatch('SendOrderEmail'));
  console.log(queue.dispatch('UpdateAnalytics'));
  console.log(queue.dispatch('NotifyAdmin'));
}
// task1();
// Expected: 1, 2, 3 — the request dispatches and returns; the worker runs later.

// ── Task 2 ──────────────────────────────────────────────────────────
// The worker loop from Lesson 124: pop the NEXT job, run it, and on
// failure retry with backoff up to maxAttempts, else move it to failed.
function makeWorker(queue, handler, opts) {
  const maxAttempts = opts.maxAttempts;
  const backoff = opts.backoff; // array of seconds between attempts
  const failed = [];

  return {
    processOne() {
      // your code here
      // - shift the next job off the queue (nothing to do → return null)
      // - run handler(job); on success return 'ok'
      // - on failure: if attempts so far < maxAttempts, wait `backoff[attempt-1]` seconds
      //   by pushing the job back to the END of the queue (Laravel: release+backoff),
      //   return 'retrying'; else record the job in `failed` and return 'failed'
      // - this is a SIMULATION — you may use a small fake wait (see task3)
    },
    failedJobs: () => failed.slice(),
    attempts: {},
  };
}

function task2() {
  const queue = createQueue();
  queue.dispatch('ChargeCard');
  const worker = makeWorker(queue, (job) => {
    if (job === 'ChargeCard') throw new Error('card declined');
    return true;
  }, { maxAttempts: 3, backoff: [1, 5, 10] });

  console.log(worker.processOne()); // retry after 1s
  console.log(worker.processOne()); // retry after 5s
  console.log(worker.processOne()); // retry after 10s
  console.log('failed:', worker.failedJobs());
}
// task2();
// Expected: 'retrying' x3, then 'failed: [ChargeCard]' — the card was
// declined all three times, so it lands in the failed_jobs list.

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement the exponential backoff schedule without timers: return the
// seconds to wait for a given attempt, clamped to a max.
function backoffDelay(attempt, baseSeconds, maxSeconds) {
  // your code here
}

function task3() {
  console.log(backoffDelay(1, 2, 64)); // first retry
  console.log(backoffDelay(2, 2, 64));
  console.log(backoffDelay(3, 2, 64));
  console.log(backoffDelay(10, 2, 64)); // clamped
}
// task3();
// Expected: 2, 4, 8, 64. Backoff doubles each attempt and caps at max.

// ── Task 4 ──────────────────────────────────────────────────────────
// Idempotency guard: a duplicate run must be a no-op. Complete `sendEmail`
// so calling it twice sends the email only once (the at-least-once story).
function createIdempotentSender() {
  const sent = new Set();
  return {
    sendEmail(orderId) {
      // your code here
    },
    sentCount: () => sent.size,
  };
}

function task4() {
  const sender = createIdempotentSender();
  sender.sendEmail(42);
  sender.sendEmail(42); // worker crashed after sending, re-runs the job
  console.log('sent:', sender.sentCount());
}
// task4();
// Expected: 'sent: 1'. The second run sees order 42 already sent and does nothing.

// ── Task 5 ──────────────────────────────────────────────────────────
// A batch: process N jobs, return how many SUCCEEDED (jobs that still throw
// after maxAttempts count as failures, per Lesson 124).
function runBatch(queue, handler, opts) {
  // your code here
}

function task5() {
  const queue = createQueue();
  queue.dispatch('A'); // always succeeds
  queue.dispatch('B'); // always fails
  queue.dispatch('C'); // always succeeds
  const ok = runBatch(queue, (job) => {
    if (job === 'B') throw new Error('B exploded');
    return true;
  }, { maxAttempts: 2, backoff: [1, 1] });
  console.log('succeeded:', ok);
}
// task5();
// Expected: 'succeeded: 2' — A and C succeed after retries exhaust B to failed_jobs.

module.exports = { createQueue, makeWorker, backoffDelay, createIdempotentSender, runBatch };
