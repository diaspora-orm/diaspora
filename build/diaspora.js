(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["core-js/modules/es6.string.ends-with", "core-js/modules/es6.array.find"], factory);
  } else if (typeof exports !== "undefined") {
    factory(require("core-js/modules/es6.string.ends-with"), require("core-js/modules/es6.array.find"));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.es6String, global.es6Array);
    global.diaspora = mod.exports;
  }
})(this, function (_es6String, _es6Array) {
  'use strict';

  if (process.browser) {
    require('regenerator-runtime/runtime');
  } else {
    var _ = require('lodash');

    var cachedDiaspora = _.find(require.cache, function (module, path) {
      return path.endsWith(require('path').sep + "diaspora.js");
    });

    if (!_.isEmpty(_.get(cachedDiaspora, 'exports'))) {
      console.log('Retrieving loaded diaspora');
      module.exports = cachedDiaspora.exports;
    }
  }

  if (!module.exports) {
    module.exports = require('./lib/diaspora');
  }
});
//# sourceMappingURL=diaspora.js.map
