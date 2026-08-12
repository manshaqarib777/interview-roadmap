'use strict';
// Lesson 11 — Functions: Declarations vs Expressions. Run with:  node exercises/01-javascript/11-functions.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  console.log(declared()); // function declaration, hoisted in full

  function declared() {
    return 'declared';
  }

  console.log(typeof expressionGreeting); // var expression: hoisted as undefined
  var expressionGreeting = function () {
    return 'expression';
  };
  console.log(expressionGreeting());
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Call each form before its line. Which throws a ReferenceError, which a TypeError?
function task2() {
  try {
    early(); // let/const expression → TDZ
  } catch (e) {
    console.log(e.constructor.name);
  }
  const early = function () {
    return 'early';
  };

  try {
    alsoEarly(); // var expression → hoisted as undefined
  } catch (e) {
    console.log(e.constructor.name);
  }
  var alsoEarly = function () {
    return 'alsoEarly';
  };

  console.log(early(), alsoEarly());
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Give the named function expression self-reference so it works recursively,
// and check what `fact` is outside its body.
const factorial = function fact(n) {
  // your code here
  return n;
};

function task3() {
  console.log(factorial(5)); // must be 120
  try {
    console.log(fact); // inner name scoped to the body?
  } catch (e) {
    console.log('fact outside:', e.constructor.name);
  }
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task4() {
  if (true) {
    function inBlock() {
      return 'block';
    }
  }
  console.log(typeof inBlock); // declaration inside a block — hoisted where?

  function topLevel() {
    return 'top';
  }
  var topLevel; // redeclaring a declaration with var — error or ignored?
  console.log(topLevel());
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task5() {
  console.log(typeof f);
  var f = function g() {
    return 'named';
  };
  console.log(typeof g); // does g exist outside the body?
  console.log(f.name);
  console.log(f());
}
// task5();

module.exports = { factorial };
