var helper = require('cogs-test-helper');

helper.run({
  'test/config.json': {
    'test/square.js': {
      path: 'test/square.js',
      buffer: helper.getFileBuffer('test/output.js'),
      hash: helper.getFileHash('test/output.js'),
      requires: [{
        path: 'test/multiply.js',
        hash: helper.getFileHash('test/multiply.js')
      }, {
        path: 'test/divide.js',
        hash: helper.getFileHash('test/divide.js')
      }, {
        path: 'test/square.js',
        hash: helper.getFileHash('test/square.js')
      }],
      links: [],
      globs: []
    },
    'test/error.js': Error
  }
});
