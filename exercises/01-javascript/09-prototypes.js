'use strict';
// Lesson 9 — Prototypes & Inheritance. Run with:  node exercises/01-javascript/09-prototypes.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  const dog = { bark: () => 'woof' };
  const puppy = Object.create(dog); // puppy inherits from dog
  console.log(puppy.bark()); // found on the prototype chain
  console.log(puppy.hasOwnProperty('bark'));
  console.log(Object.getPrototypeOf(puppy) === dog);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task2() {
  const animal = { eats: true };
  const rabbit = Object.create(animal);
  rabbit.jumps = true; // own property shadows nothing — it is new
  console.log(rabbit.jumps, rabbit.eats);
  console.log(animal.eats);
  console.log(rabbit.hasOwnProperty('eats')); // inherited, not own
  console.log('eats' in rabbit); // in walks the whole chain
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task3() {
  function Animal() {}
  Animal.prototype.speak = function () {
    return '...';
  };
  const cat = new Animal();
  console.log(cat.speak());
  console.log(Object.getPrototypeOf(cat) === Animal.prototype);
  console.log(cat.hasOwnProperty('speak')); // shared on the prototype, not the instance
  console.log(cat.constructor === Animal);
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task4() {
  const base = { who: 'base' };
  const child = Object.create(base);
  child.who = 'child'; // shadowing: an own property wins
  console.log(child.who);
  console.log(base.who);
  console.log(child.hasOwnProperty('who'));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Implement `createUser` so every user object inherits a greet method
// from a shared prototype. All instances must share ONE greet.
const userPrototype = {
  greet: function () {
    return 'Hi, I am ' + this.name;
  },
};

function createUser(name) {
  // your code here
}

function task5() {
  const a = createUser('Ada');
  const b = createUser('Grace');
  console.log(a.greet()); // must be: Hi, I am Ada
  console.log(b.greet()); // must be: Hi, I am Grace
  console.log(Object.getPrototypeOf(a) === userPrototype); // must be true
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task6() {
  const proto = { kind: 'proto' };
  const obj = Object.create(proto);
  console.log('kind' in obj);
  console.log(obj.hasOwnProperty('kind'));
  console.log(obj.kind);
  delete obj.kind; // deleting a non-existent own key — what happens?
  console.log(obj.kind);
}
// task6();

module.exports = { createUser };
