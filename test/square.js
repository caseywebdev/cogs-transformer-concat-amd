define('not-square', ['multiply'], function (multiply) {
  return function (n) { return multiply(n, n); };
});
