define('multiply', function () {
  return function (a, b) { return a * b; };
});
// Nothing here...
define('square', [
  'multiply',
  'divide'
], function (multiply) {
  return function (n) { return multiply(n, n); };
});
