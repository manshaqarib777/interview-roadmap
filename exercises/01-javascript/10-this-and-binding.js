'use strict';
// Lesson 10 — `this` and Binding. Run with:  node exercises/01-javascript/10-this-and-binding.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  const user = {
    name: 'Ada',
    greet: function () {
      return this.name; // implicit binding: the object to the left of the dot
    },
  };
  const grab = user.greet; // the reference alone loses the receiver
  console.log(user.greet());
  try {
    console.log(grab()); // undefined receiver in strict mode
  } catch (e) {
    console.log(e.constructor.name);
  }
}
// task1();

function identify() {
  return this.id;
}

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task2() {
  const a = { id: 'A' };
  const b = { id: 'B' };
  console.log(identify.call(a)); // explicit binding
  console.log(identify.apply(b));
  const bound = identify.bind(a); // bind returns a permanently bound copy
  console.log(bound.call(b)); // .call cannot override a bound this
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task3() {
  const label = {
    text: 'outer',
    method() {
      const arrow = () => this.text; // arrows capture this lexically
      return arrow.call({ text: 'trap' }); // .call is ignored by arrows
    },
  };
  const detached = label.method;
  console.log(label.method()); // implicit binding: this = label
  console.log(detached.call({ text: 'explicit' })); // call rebinds the method
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task4() {
  function Person(name) {
    this.name = name; // new binding wins
  }
  Person.prototype.greet = function () {
    return 'Hi, ' + this.name;
  };
  const p = new Person('Ada');
  const bound = Person.prototype.greet.bind(p);
  console.log(p.greet());
  console.log(bound());
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Fill the gap so the callback keeps `this` = counter and stops after
// 3 ticks. Do NOT use bind, call, apply, or an arrow function.
function task5() {
  const counter = {
    count: 0,
    start() {
      const that = this;
      const timer = setInterval(function () {
        // your code here
      }, 10);
      return timer;
    },
  };
  clearInterval(counter.start()); // start returns the timer to cancel
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task6() {
  const timer = {
    label: 't',
    log() {
      setTimeout(function () {
        console.log(this); // plain function callback: who is this?
      }, 0);
    },
  };
  timer.log();
}
// task6();

module.exports = { identify };
