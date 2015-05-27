define('multiply', function () {
  return function (a, b) { return a * b; };
});
define('square', [
  'multiply'
], function (multiply) {
  return function (n) { return multiply(n, n); };
});
