(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["core-js/modules/es6.promise", "core-js/modules/es6.regexp.match"], factory);
  } else if (typeof exports !== "undefined") {
    factory(require("core-js/modules/es6.promise"), require("core-js/modules/es6.regexp.match"));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.es6, global.es6Regexp);
    global.adapterUtils = mod.exports;
  }
})(this, function (_es, _es6Regexp) {
  'use strict';

  var _require = require('../../dependencies'),
      _ = _require._;

  var getNum = function getNum(fullMatch, sign, val) {
    if ('∞' === val) {
      if ('-' === sign) {
        return -Infinity;
      } else {
        return Infinity;
      }
    } else {
      return parseInt(fullMatch);
    }
  };

  var validations = {
    type: {
      int: function int(key, val) {
        if (_.isString(val)) {
          val = parseInt(val);
        }

        if (!_.isInteger(val) && isFinite(val)) {
          throw new TypeError("Expect \"" + key + "\" to be an integer");
        }

        return val;
      }
    },
    rng: function rng(key, val, range) {
      var rangeMatch = range.match(/^([[\]])((-)?(\d+|∞)),((-)?(\d+|∞))([[\]])$/);

      if (rangeMatch) {
        var lower = getNum.apply(void 0, rangeMatch.splice(2, 3));
        var upper = getNum.apply(void 0, rangeMatch.splice(2, 3));
        var isInRangeLower = '[' === rangeMatch[1] ? val >= lower : val > lower;
        var isInRangeUpper = ']' === rangeMatch[2] ? val <= upper : val < upper;

        if (!(isInRangeLower && isInRangeUpper)) {
          throw new RangeError("Expect \"" + key + "\" to be within " + range + ", have \"" + val + "\"");
        }
      }

      return val;
    }
  };

  var validateOption = function validateOption(key, val, config) {
    if (validations.type[config.type]) {
      val = validations.type[config.type](key, val);
    }

    if (config.rng) {
      val = validations.rng(key, val, config.rng);
    }

    return val;
  };

  var iterateLimit = function iterateLimit(options, query) {
    var foundEntities = [];
    var foundCount = 0;
    var origSkip = options.skip; // We are going to loop until we find enough items

    var loopFind = function loopFind(found) {
      // If the search returned nothing, then just finish the findMany
      if (_.isNil(found)) {
        return Promise.resolve(foundEntities); // Else, if this is a value and not the initial `true`, add it to the list
      } else if (found !== true) {
        foundEntities.push(found);
      } // If we found enough items, return them


      if (foundCount === options.limit) {
        return Promise.resolve(foundEntities);
      }

      options.skip = origSkip + foundCount; // Next time we'll skip 1 more item

      foundCount++; // Do the query & loop

      return query(options).then(loopFind);
    };

    return loopFind;
  };
  /**
   * TODO.
   *
   * @author gerkin
   * @see TODO remapping.
   * @param   {Adapters.DiasporaAdapter}  adapter   - Adapter doing the remap.
   * @param   {string}                    tableName - Name of the table for which we remap.
   * @param   {Object}                    query     - Hash representing the entity to remap.
   * @param   {boolean}                   input     - Set to `true` if handling input, `false`to output.
   * @returns {Object} Remapped object.
   */


  var remapIO = function remapIO(adapter, tableName, query, input) {
    if (_.isNil(query)) {
      return query;
    }

    var direction = true === input ? 'input' : 'output';

    var filtered = _.mapValues(query, function (value, key) {
      var filter = _.get(adapter, ['filters', tableName, direction, key], undefined);

      if (_.isFunction(filter)) {
        return filter(value);
      }

      return value;
    });

    var remapType = true === input ? 'normal' : 'inverted';

    var remaped = _.mapKeys(filtered, function (value, key) {
      return _.get(adapter, ['remaps', tableName, remapType, key], key);
    });

    return remaped;
  };

  module.exports = {
    OPERATORS: {
      $exists: function $exists(entityVal, targetVal) {
        return targetVal === !_.isUndefined(entityVal);
      },
      $equal: function $equal(entityVal, targetVal) {
        return !_.isUndefined(entityVal) && entityVal === targetVal;
      },
      $diff: function $diff(entityVal, targetVal) {
        return !_.isUndefined(entityVal) && entityVal !== targetVal;
      },
      $less: function $less(entityVal, targetVal) {
        return !_.isUndefined(entityVal) && entityVal < targetVal;
      },
      $lessEqual: function $lessEqual(entityVal, targetVal) {
        return !_.isUndefined(entityVal) && entityVal <= targetVal;
      },
      $greater: function $greater(entityVal, targetVal) {
        return !_.isUndefined(entityVal) && entityVal > targetVal;
      },
      $greaterEqual: function $greaterEqual(entityVal, targetVal) {
        return !_.isUndefined(entityVal) && entityVal >= targetVal;
      }
    },
    CANONICAL_OPERATORS: {
      '~': '$exists',
      '==': '$equal',
      '!=': '$diff',
      '<': '$less',
      '<=': '$lessEqual',
      '>': '$greater',
      '>=': '$greaterEqual'
    },
    QUERY_OPTIONS_TRANSFORMS: {
      limit: function limit(opts) {
        opts.limit = validateOption('limit', opts.limit, {
          type: 'int',
          rng: '[0,∞]'
        });
      },
      skip: function skip(opts) {
        opts.skip = validateOption('skip', opts.skip, {
          type: 'int',
          rng: '[0,∞['
        });
      },
      page: function page(opts) {
        if (!opts.hasOwnProperty('limit')) {
          throw new ReferenceError('Usage of "options.page" requires "options.limit" to be defined.');
        }

        if (!isFinite(opts.limit)) {
          throw new RangeError('Usage of "options.page" requires "options.limit" to not be infinite');
        }

        if (opts.hasOwnProperty('skip')) {
          throw new ReferenceError('Use either "options.page" or "options.skip"');
        }

        opts.skip = validateOption('page', opts.page, {
          type: 'int',
          rng: '[0,∞['
        }) * opts.limit;
        delete opts.page;
      }
    },
    iterateLimit: iterateLimit,
    remapIO: remapIO
  };
});
//# sourceMappingURL=adapter-utils.js.map
