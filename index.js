var _ = require('underscore');
var async = require('async');
var glob = require('glob');
var path = require('path');

var DEFAULTS = {
  base: '.',
  extensions: ['js']
};
var ADD_NAME = /(define\s*\(\s*)([^\s'"])/;
var CHANGE_NAME = /(define\s*\(\s*['"]).*?(['"])/;
var DEFINE =
  /define\s*\(\s*(?:['"](.*?)['"]\s*,\s*)?(?:\[\s*([\s\S]*?)\s*\])?(?!\s*\))/;
var DEFINED_IDS = ['require', 'exports', 'module'];

var getExt = function (filePath) {
  return path.extname(filePath).slice(1);
};

var getName = function (pathName, options) {
  var ext = getExt(pathName);
  pathName = pathName.slice(0, -ext.length - 1);
  return path.relative(options.base, pathName);
};

var getRequiredIds = function (define) {
  return define[2] ?
    _.difference(
      _.invoke(define[2].split(/\s*,\s*/), 'slice', 1, -1),
      DEFINED_IDS
    ) : [];
};

var getDependencies = function (ids, options, cb) {
  async.parallel({
    requires: function (cb) {
      async.map(ids, function (id, cb) {
        var pattern = path.join(options.base, id) + '*';
        async.waterfall([
          _.partial(glob, pattern, {nodir: true}),
          function (filePaths) {
            var match = _.find(filePaths, function (filePath) {
              return _.include(options.extensions, getExt(filePath)) &&
                getName(filePath, options) === id;
            });
            if (!match) return cb(new Error("Cannot find module '" + id + "'"));
            cb(null, path.relative('.', match));
          }
        ], cb);
      }, cb);
    }
  }, cb);
};

module.exports = function (file, options, cb) {
  var source = file.buffer.toString();
  var define = DEFINE.exec(source);

  // If this file lacks a `define` statement, there's nothing to do.
  if (!define) return cb(null, {});

  // If the source has a named module in it, rename it to what the user
  // expects it to be. This generally only happens with authors release
  // packages that don't follow the best practice of defining themselves
  // anonymously. If that's not the case, simply add the name to the `define`.
  options = _.extend({}, DEFAULTS, options);
  var name = getName(file.path, options);
  source =
    define[1] ?
    source.replace(CHANGE_NAME, '$1' + name + '$2') :
    source.replace(ADD_NAME, "$1'" + name + "', $2");

  async.waterfall([
    _.partial(getDependencies, getRequiredIds(define), options),
    function (hashes, cb) {
      var selfIndex = _.indexOf(file.requires, file.path);
      cb(null, {
        buffer: new Buffer(source),
        requires: file.requires.slice(0, selfIndex)
          .concat(hashes.requires)
          .concat(file.requires.slice(selfIndex))
      });
    }
  ], cb);
};
