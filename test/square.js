define('not-square', [
  'multiply',
  'divide'
], function (multiply) {
  return function (n) { return multiply(n, n); };
});
