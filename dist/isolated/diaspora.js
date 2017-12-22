/**
* @file diaspora
*
* Multi-Layer ORM for Javascript Client+Server
* Isolated build compiled on 2017-12-22 18:18:44
*
* @license GPL-3.0
* @version 0.2.0-rc.4
* @author Gerkin
*/
"use strict";

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.regexp.split");

require("regenerator-runtime/runtime");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.regexp.match");

require("core-js/modules/es6.string.ends-with");

require("core-js/modules/es6.array.find");

function _extendableBuiltin(cls) {
  function ExtendableBuiltin() {
    cls.apply(this, arguments);
  }

  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
    constructor: {
      value: cls,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ExtendableBuiltin, cls);
  } else {
    ExtendableBuiltin.__proto__ = cls;
  }

  return ExtendableBuiltin;
}

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

(function (f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;

    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }

    g.Diaspora = f();
  }
})(function () {
  var define, module, exports;
  return function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;
          if (!u && a) return a(o, !0);
          if (i) return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw f.code = "MODULE_NOT_FOUND", f;
        }

        var l = n[o] = {
          exports: {}
        };
        t[o][0].call(l.exports, function (e) {
          var n = t[o][1][e];
          return s(n ? n : e);
        }, l, l.exports, e, t, n, r);
      }

      return n[o].exports;
    }

    var i = typeof require == "function" && require;

    for (var o = 0; o < r.length; o++) {
      s(r[o]);
    }

    return s;
  }({
    1: [function (require, module, exports) {
      (function (process) {
        'use strict';

        if (!process.browser) {
          var _ = require('lodash');

          var cachedDiaspora = _.find(require.cache, function (module, path) {
            return path.endsWith(require('path').sep + "diaspora.js");
          });

          if (!_.isEmpty(_.get(cachedDiaspora, 'exports'))) {
            console.log('Retrieving loaded diaspora');
            return module.exports = cachedDiaspora.exports;
          }
        }

        var Diaspora = require('./lib/diaspora');

        module.exports = Diaspora;
      }).call(this, require('_process'));
    }, {
      "./lib/diaspora": 12,
      "_process": 24,
      "lodash": undefined,
      "path": 23
    }],
    2: [function (require, module, exports) {
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
    }, {
      "../../dependencies": 11
    }],
    3: [function (require, module, exports) {
      'use strict';

      var _require2 = require('../../dependencies'),
          _ = _require2._,
          Promise = _require2.Promise,
          SequentialEvent = _require2.SequentialEvent;
      /**
       * @namespace ConstrainedTypes
       * @description Namespace for types with constraints, like <code>[0, Infinity]</code>, <code>]0, Infinity[</code>, etc etc
       */

      /**
       * @typedef {Integer} AbsInt0
       * @memberof ConstrainedTypes
       * @description Integer equal or above 0
       */

      /**
       * @typedef {Integer} AbsInt
       * @memberof ConstrainedTypes
       * @description Integer above 0
       */

      /**
       * @typedef {Integer} AbsIntInf
       * @memberof ConstrainedTypes
       * @description Integer above 0, may be integer
       */

      /**
       * @typedef {Integer} AbsIntInf0
       * @memberof ConstrainedTypes
       * @description Integer equal or above 0, may be integer
       */

      /**
       * @namespace QueryLanguage
       */

      /**
       * @typedef {Object} QueryOptions
       * @description All properties are optional
       * @memberof QueryLanguage
       * @public
       * @instance
       * @author gerkin
       * @property {ConstrainedTypes.AbsInt0} skip=0 Number of items to skip
       * @property {ConstrainedTypes.AbsIntInf0} limit=Infinity Number of items to get
       * @property {ConstrainedTypes.AbsInt0} page To use with {@link QueryOptions.limit `limit`} and without {@link QueryOptions.skip `skip`}. Skips `page` pages of `limit` elements
       * @property {Boolean} remapInput=true Flag indicating if adapter input should be remapped or not. TODO Remapping doc
       * @property {Boolean} remapOutput=true Flag indicating if adapter output should be remapped or not. TODO Remapping doc
       */

      /**
       * @typedef {Object} SelectQuery
       * @memberof QueryLanguage
       * @public
       * @instance
       * @author gerkin
       * @property {Any|SelectQueryCondition} * Fields to search. If not providing an object, find items with a property value that equals this value
       */

      /**
       * By default, all conditions in a single SelectQueryCondition are combined with an `AND` operator.
       *
       * @typedef {Object} QueryLanguage.SelectQueryCondition
       * @author gerkin
       * @property {Any}                                      $equals       - Match if item value is equal to this. Objects and array are compared deeply. **Alias: `==`**
       * @property {Any}                                      $diff         - Match if item value is different to this. Objects and array are compared deeply. **Alias: `!=`**
       * @property {boolean}                                  $exists       - If `true`, match items where this prop is defined. If `false`, match when prop is null or not set. **Alias: `~`**
       * @property {integer}                                  $less         - Match if item value is less than this. **Alias: `<`**
       * @property {integer}                                  $lessEqual    - Match if item value is less than this or equals to this. **Alias: `<=`**
       * @property {integer}                                  $greater      - Match if item value is greater than this. **Alias: `>`**
       * @property {integer}                                  $greaterEqual - Match if item value is greater than this or equals to this. **Alias: `>=`**
       * @property {QueryLanguage#SelectQueryOrCondition[]}   $or           - Match if *one of* the conditions in the array is true. **Alias: `||`** **NOT IMPLEMENTED YET**
       * @property {QueryLanguage#SelectQueryOrCondition[]}   $and          - Match if *all* the conditions in the array are true. Optional, because several conditions in a single SelectQueryCondition are combined with an `AND` operator. **Alias: `&&`** **NOT IMPLEMENTED YET**
       * @property {QueryLanguage#SelectQueryOrCondition[]}   $xor          - Match if *a single* of the conditions in the array is true. **Alias: `^^`** **NOT IMPLEMENTED YET**
       * @property {QueryLanguage#SelectQueryOrCondition}     $not          - Invert the condition **Alias: `!`** **NOT IMPLEMENTED YET**
       * @property {string}                                   $contains     - On *string*, it will check if query is included in item using GLOB. **NOT IMPLEMENTED YET**
       * @property {QueryLanguage#SelectQueryOrCondition|Any} $contains     - On *array*, it will check if item contains the query. **NOT IMPLEMENTED YET**
       * @property {Any[]}                                    $in           - Check if item value is contained (using deep comparaison) in query. **NOT IMPLEMENTED YET**
       */

      /**
       * @typedef {QueryLanguage#SelectQuery|QueryLanguage#SelectQueryCondition} SelectQueryOrCondition
       * @memberof QueryLanguage
       * @public
       * @instance
       * @author gerkin
       */

      /**
       * @namespace Adapters
       */

      /**
       * @typedef {undefined|null} Nil
       * @memberof Adapters
       * @public
       * @instance
       * @author gerkin
       */

      /**
       * @typedef {Adapters.Nil|Object} NilOrObject
       * @memberof Adapters
       * @public
       * @instance
       * @author gerkin
       */


      var _require3 = require('./adapter-utils'),
          OPERATORS = _require3.OPERATORS,
          CANONICAL_OPERATORS = _require3.CANONICAL_OPERATORS,
          QUERY_OPTIONS_TRANSFORMS = _require3.QUERY_OPTIONS_TRANSFORMS,
          iterateLimit = _require3.iterateLimit,
          remapIO = _require3.remapIO;
      /**
       * DiasporaAdapter is the base class of adapters. Adapters are components that are in charge to interact with data sources (files, databases, etc etc) with standardized methods. You should not use this class directly: extend this class and re-implement some methods to build an adapter. See the (upcoming) tutorial section.
       * @extends SequentialEvent
       * @memberof Adapters
       * @author gerkin
       */


      var DiasporaAdapter =
      /*#__PURE__*/
      function (_SequentialEvent) {
        _inheritsLoose(DiasporaAdapter, _SequentialEvent);

        // -----
        // ### Initialization

        /**
         * Create a new instance of adapter. This base class should be used by all other adapters.
         *
         * @public
         * @author gerkin
         * @param {DataStoreEntities.DataStoreEntity} classEntity - Entity to spawn with this adapter.
         */
        function DiasporaAdapter(classEntity) {
          var _this2;

          _this2 = _SequentialEvent.call(this) || this;
          /**
           * Describe current adapter status.
           *
           * @type {string}
           * @author Gerkin
           */

          _this2.state = 'preparing';
          /**
           * Hash to transform entity fields to data store fields.
           *
           * @type {Object}
           * @property {string} * - Data store field associated with this entity field.
           * @author Gerkin
           */

          _this2.remaps = {};
          /**
           * Hash to transform data store fields to entity fields.
           *
           * @type {Object}
           * @property {string} * - Entity field associated with this data store field.
           * @author Gerkin
           */

          _this2.remapsInverted = {};
          /**
           * Hash of functions to cast data store values to JSON standard values in entity.
           *
           * @type {Object}
           * @property {Function} * - Filter to execute to get standard JSON value.
           * @author Gerkin
           */

          _this2.filters = {};
          /**
           * Link to the constructor of the class generated by this adapter.
           *
           * @type {DataStoreEntities.DataStoreEntity}
           * @author Gerkin
           */

          _this2.classEntity = classEntity;
          /**
           * Error triggered by adapter initialization.
           *
           * @type {Error}
           * @author Gerkin
           */

          _this2.error = undefined; // Bind events

          _this2.on('ready', function () {
            _this2.state = 'ready';
          }).on('error', function (err) {
            _this2.state = 'error';
            _this2.error = err;
          });

          return _this2;
        }
        /**
         * Saves the remapping table, the reversed remapping table and the filter table in the adapter. Those tables will be used later when manipulating models & entities.
         *
         * @author gerkin
         * @param   {string} tableName    - Name of the table (usually, model name).
         * @param   {Object} remaps       - Associative hash that links entity field names with data source field names.
         * @param   {Object} [filters={}] - Not used yet...
         * @returns {undefined} This function does not return anything.
         */


        var _proto = DiasporaAdapter.prototype;

        _proto.configureCollection = function configureCollection(tableName, remaps, filters) {
          if (filters === void 0) {
            filters = {};
          }

          this.remaps[tableName] = {
            normal: remaps,
            inverted: _.invert(remaps)
          };
          this.filters[tableName] = filters;
        }; // -----
        // ### Events

        /**
         * Fired when the adapter is ready to use. You should not try to use the adapter before this event is emitted.
         *
         * @event Adapters.DiasporaAdapter#ready
         * @type {undefined}
         * @see {@link Adapters.DiasporaAdapter#waitReady waitReady} Convinience method to wait for state change.
         */

        /**
         * Fired if the adapter failed to initialize or changed to `error` state. Called with the triggering `error`.
         *
         * @event Adapters.DiasporaAdapter#error
         * @type {Error}
         * @see {@link Adapters.DiasporaAdapter#waitReady waitReady} Convinience method to wait for state change.
         */
        // -----
        // ### Utils

        /**
         * Returns a promise resolved once adapter state is ready.
         *
         * @author gerkin
         * @listens Adapters.DiasporaAdapter#error
         * @listens Adapters.DiasporaAdapter#ready
         * @returns {Promise} Promise resolved when adapter is ready, and rejected if an error occured.
         */


        _proto.waitReady = function waitReady() {
          var _this3 = this;

          return new Promise(function (resolve, reject) {
            if ('ready' === _this3.state) {
              return resolve(_this3);
            } else if ('error' === _this3.state) {
              return reject(_this3.error);
            }

            _this3.on('ready', function () {
              return resolve(_this3);
            }).on('error', function (err) {
              return reject(err);
            });
          });
        };
        /**
         * Cast the provided data to an adapter entity if the data is not nil.
         * 
         * @param   {Adapters.NilOrObject} data - Data to cast to a datastore entity.
         * @returns {DataStoreEntities.DataStoreEntity} A class entity, or undefined.
         */


        _proto.maybeCastEntity = function maybeCastEntity(data) {
          return _.isNil(data) ? undefined : new this.classEntity(data, this);
        };
        /**
         * Cast the provided array of datas to adapter entities if the data is not nil. Note that {@link Adapters.Nil nil values} aren't filtered out from the resulting array.
         * 
         * @param   {Adapters.NilOrObject[]|Adapters.Nil} datas - Array of datas to cast to datastore entities.
         * @returns {DataStoreEntities.DataStoreEntity[]} An array of class entities, or undefined.
         */


        _proto.maybeCastSet = function maybeCastSet(datas) {
          return _.isNil(datas) ? [] : _.map(datas, this.maybeCastEntity.bind(this));
        };
        /**
         * TODO.
         *
         * @author gerkin
         * @see TODO remapping.
         * @see {@link Adapters.DiasporaAdapter#remapIO remapIO}
         * @param   {string} tableName - Name of the table for which we remap.
         * @param   {Object} query     - Hash representing the entity to remap.
         * @returns {Object} Remapped object.
         */


        _proto.remapInput = function remapInput(tableName, query) {
          return remapIO(this, tableName, query, true);
        };
        /**
         * TODO.
         *
         * @author gerkin
         * @see TODO remapping.
         * @see {@link Adapters.DiasporaAdapter#remapIO remapIO}
         * @param   {string} tableName - Name of the table for which we remap.
         * @param   {Object} query     - Hash representing the entity to remap.
         * @returns {Object} Remapped object.
         */


        _proto.remapOutput = function remapOutput(tableName, query) {
          return remapIO(this, tableName, query, false);
        };
        /**
         * Refresh the `idHash` with current adapter's `id` injected.
         *
         * @author gerkin
         * @param   {Object} entity          - Object containing attributes of the entity.
         * @param   {string} [propName='id'] - Name of the `id` field.
         * @returns {Object} Modified entity (for chaining).
         */


        _proto.setIdHash = function setIdHash(entity, propName) {
          var _$assign;

          if (propName === void 0) {
            propName = 'id';
          }

          entity.idHash = _.assign({}, entity.idHash, (_$assign = {}, _$assign[this.name] = entity[propName], _$assign));
          return entity;
        };
        /**
         * Check if provided `entity` is matched by the query. Query must be in its canonical form before using this function.
         *
         * @author gerkin
         * @param   {QueryLanguage#SelectQuery} query  - Query to match against.
         * @param   {Object}                    entity - Entity to test.
         * @returns {boolean} Returns `true` if query matches, `false` otherwise.
         */


        _proto.matchEntity = function matchEntity(query, entity) {
          var matchResult = _.every(_.toPairs(query), function (_ref) {
            var key = _ref[0],
                desc = _ref[1];

            if (_.isObject(desc)) {
              var entityVal = entity[key];
              return _.every(desc, function (val, operation) {
                if (OPERATORS.hasOwnProperty(operation)) {
                  return OPERATORS[operation](entityVal, val);
                } else {
                  return false;
                }
              });
            }

            return false;
          });

          return matchResult;
        };
        /**
         * Transform options to their canonical form. This function must be applied before calling adapters' methods.
         *
         * @author gerkin
         * @throws  {TypeError} Thrown if an option does not have an acceptable type.
         * @throws  {ReferenceError} Thrown if a required option is not present.
         * @throws  {Error} Thrown when there isn't more precise description of the error is available (eg. when conflicts occurs) .
         * @param   {Object} [opts={}] - Options to transform.
         * @returns {Object} Transformed options (also called `canonical options`).
         */


        _proto.normalizeOptions = function normalizeOptions(opts) {
          if (opts === void 0) {
            opts = {};
          }

          opts = _.cloneDeep(opts);

          _.forEach(QUERY_OPTIONS_TRANSFORMS, function (transform, optionName) {
            if (opts.hasOwnProperty(optionName)) {
              QUERY_OPTIONS_TRANSFORMS[optionName](opts);
            }
          });

          _.defaults(opts, {
            skip: 0,
            remapInput: true,
            remapOutput: true
          });

          return opts;
        };
        /**
         * Transform a search query to its canonical form, replacing aliases or shorthands by full query.
         *
         * @author gerkin
         * @param   {QueryLanguage#SelectQueryOrCondition} originalQuery - Query to cast to its canonical form.
         * @param   {QueryLanguage#Options}                options       - Options for this query.
         * @returns {QueryLanguage#SelectQueryOrCondition} Query in its canonical form.
         */


        _proto.normalizeQuery = function normalizeQuery(originalQuery, options) {
          if (_.isString(originalQuery)) {
            originalQuery = {
              id: originalQuery
            };
          }

          var normalizedQuery = true === options.remapInput ? _(_.cloneDeep(originalQuery)).mapValues(function (attrSearch) {
            if (_.isUndefined(attrSearch)) {
              return {
                $exists: false
              };
            } else if (!(attrSearch instanceof Object)) {
              return {
                $equal: attrSearch
              };
            } else {
              // Replace operations alias by canonical expressions
              attrSearch = _.mapKeys(attrSearch, function (val, operator, obj) {
                if (CANONICAL_OPERATORS.hasOwnProperty(operator)) {
                  // ... check for conflict with canonical operation name...
                  if (obj.hasOwnProperty(CANONICAL_OPERATORS[operator])) {
                    throw new Error("Search can't have both \"" + operator + "\" and \"" + CANONICAL_OPERATORS[operator] + "\" keys, as they are synonyms");
                  }

                  return CANONICAL_OPERATORS[operator];
                }

                return operator;
              }); // For arithmetic comparison, check if values are numeric (TODO later: support date)

              _.forEach(['$less', '$lessEqual', '$greater', '$greaterEqual'], function (operation) {
                if (attrSearch.hasOwnProperty(operation) && !(_.isNumber(attrSearch[operation]) || _.isDate(attrSearch[operation]))) {
                  throw new TypeError("Expect \"" + operation + "\" in " + JSON.stringify(attrSearch) + " to be a numeric value");
                }
              });

              return attrSearch;
            }
          }).value() : _.cloneDeep(originalQuery);
          return normalizedQuery;
        };
        /**
         * Returns a POJO representing the current adapter.
         * 
         * @returns {Object} JSON representation of the adapter.
         */


        _proto.toJSON = function toJSON() {
          return _.pick(this, ['state', 'remaps', 'remapsInverted', 'classEntity', 'error']);
        }; // -----
        // ### Insert

        /**
         * Insert a single entity in the data store. This function is a default polyfill if the inheriting adapter does not provide `insertOne` itself.
         *
         * @summary At least one of {@link insertOne} or {@link insertMany} must be reimplemented by adapter.
         * @author gerkin
         * @param   {string} table  - Name of the table to insert data in.
         * @param   {Object} entity - Hash representing the entity to insert.
         * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link DataStoreEntity}* entity).
         */


        _proto.insertOne = function insertOne(table, entity) {
          return this.insertMany(table, [entity]).then(function (entities) {
            return Promise.resolve(_.first(entities));
          });
        };
        /**
         * Insert several entities in the data store. This function is a default polyfill if the inheriting adapter does not provide `insertMany` itself.
         *
         * @summary At least one of {@link insertOne} or {@link insertMany} must be reimplemented by adapter.
         * @author gerkin
         * @param   {string}   table    - Name of the table to insert data in.
         * @param   {Object[]} entities - Array of hashs representing the entities to insert.
         * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link DataStoreEntity}[]* entities).
         */


        _proto.insertMany = function insertMany(table, entities) {
          var _this4 = this;

          return Promise.mapSeries(entities, function (entity) {
            return _this4.insertOne(table, entity || {});
          });
        }; // -----
        // ### Find

        /**
         * Retrieve a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `findOne` itself.
         *
         * @summary At least one of {@link findOne} or {@link findMany} must be reimplemented by adapter.
         * @author gerkin
         * @param   {string}                               table        - Name of the table to retrieve data from.
         * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
         * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
         * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}* `entity`).
         */


        _proto.findOne = function findOne(table, queryFind, options) {
          if (options === void 0) {
            options = {};
          }

          options.limit = 1;
          return this.findMany(table, queryFind, options).then(function (entities) {
            return Promise.resolve(_.first(entities));
          });
        };
        /**
         * Retrieve several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `findMany` itself.
         *
         * @summary At least one of {@link findOne} or {@link findMany} must be reimplemented by adapter.
         * @author gerkin
         * @param   {string}                               table        - Name of the table to retrieve data from.
         * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
         * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
         * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`).
         */


        _proto.findMany = function findMany(table, queryFind, options) {
          if (options === void 0) {
            options = {};
          }

          options = this.normalizeOptions(options);
          return iterateLimit(options, this.findOne.bind(this, table, queryFind))(true);
        }; // -----
        // ### Update

        /**
         * Update a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `updateOne` itself.
         *
         * @summary At least one of {@link updateOne} or {@link updateMany} must be reimplemented by adapter.
         * @author gerkin
         * @param   {string}                               table        - Name of the table to retrieve data from.
         * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
         * @param   {Object}                               update       - Object properties to set.
         * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
         * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}* `entity`).
         */


        _proto.updateOne = function updateOne(table, queryFind, update, options) {
          if (options === void 0) {
            options = {};
          }

          options = this.normalizeOptions(options);
          options.limit = 1;
          return this.updateMany(table, queryFind, update, options).then(function (entities) {
            return Promise.resolve(_.first(entities));
          });
        };
        /**
         * Update several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `updateMany` itself.
         *
         * @summary At least one of {@link updateOne} or {@link updateMany} must be reimplemented by adapter.
         * @author gerkin
         * @param   {string}                               table        - Name of the table to retrieve data from.
         * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
         * @param   {Object}                               update       - Object properties to set.
         * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
         * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`).
         */


        _proto.updateMany = function updateMany(table, queryFind, update, options) {
          if (options === void 0) {
            options = {};
          }

          options = this.normalizeOptions(options);
          return iterateLimit(options, this.updateOne.bind(this, table, queryFind, update))(true);
        }; // -----
        // ### Delete

        /**
         * Delete a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `deleteOne` itself.
         *
         * @summary At least one of {@link deleteOne} or {@link deleteMany} must be reimplemented by adapter.
         * @author gerkin
         * @param   {string}                               table        - Name of the table to delete data from.
         * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entities to find.
         * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
         * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}* `entity`).
         */


        _proto.deleteOne = function deleteOne(table, queryFind, options) {
          if (options === void 0) {
            options = {};
          }

          options.limit = 1;
          return this.deleteMany(table, queryFind, options);
        };
        /**
         * Delete several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `deleteMany` itself.
         *
         * @summary At least one of {@link deleteOne} or {@link deleteMany} must be reimplemented by adapter.
         * @author gerkin
         * @param   {string}                               table        - Name of the table to delete data from.
         * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entities to find.
         * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
         * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`).
         */


        _proto.deleteMany = function deleteMany(table, queryFind, options) {
          var _this5 = this;

          if (options === void 0) {
            options = {};
          }

          var count = 0; // We are going to loop until we find enough items

          var loopFind = function loopFind() {
            // First, search for the item.
            return _this5.findOne(table, queryFind, options).then(function (found) {
              // If the search returned nothing, then just finish the findMany
              if (_.isNil(found)) {
                return Promise.resolve(); // Else, if this is a value and not the initial `true`, add it to the list
              } // If we found enough items, return them


              if (count === options.limit) {
                return Promise.resolve();
              } // Increase our counter


              count++; // Do the deletion & loop

              return _this5.deleteOne(table, queryFind, options).then(loopFind);
            });
          };

          return loopFind(true);
        };

        return DiasporaAdapter;
      }(SequentialEvent);

      module.exports = DiasporaAdapter;
    }, {
      "../../dependencies": 11,
      "./adapter-utils": 2
    }],
    4: [function (require, module, exports) {
      'use strict';

      var _require4 = require('../../dependencies'),
          _ = _require4._;
      /**
       * @namespace DataStoreEntities
       */

      /**
       * DataStoreEntity is the sub-entity reflecting a single source content. Values may differ from the Entity itself.
       * @memberof DataStoreEntities
       */


      var DataStoreEntity =
      /*#__PURE__*/
      function () {
        /**
         * Construct a new data source entity with specified content & parent.
         * 
         * @author gerkin
         * @param {Object}                   entity     - Object containing attributes to inject in this entity. The only **reserved key** is `dataSource`.
         * @param {Adapters.DiasporaAdapter} dataSource - Adapter that spawn this entity.
         */
        function DataStoreEntity(entity, dataSource) {
          if (_.isNil(entity)) {
            return undefined;
          }

          if (_.isNil(dataSource)) {
            throw new TypeError("Expect 2nd argument to be the parent of this entity, have \"" + dataSource + "\"");
          }

          Object.defineProperties(this, {
            dataSource: {
              value: dataSource,
              enumerable: false,
              configurable: false
            }
          });

          _.assign(this, entity);
        }
        /**
         * Returns a plain object corresponding to this entity attributes.
         * 
         * @author gerkin
         * @returns {Object} Plain object representing this entity.
         */


        var _proto2 = DataStoreEntity.prototype;

        _proto2.toObject = function toObject() {
          return _.omit(this, ['dataSource', 'id']);
        };

        return DataStoreEntity;
      }();

      module.exports = DataStoreEntity;
    }, {
      "../../dependencies": 11
    }],
    5: [function (require, module, exports) {
      'use strict';

      var _require5 = require('../../dependencies'),
          _ = _require5._,
          Promise = _require5.Promise;

      var Utils = require('../../utils');

      var Diaspora = require('../../diaspora');

      var DiasporaAdapter = Diaspora.components.Adapters.Adapter;

      var InMemoryEntity = require('./entity.js');
      /**
       * This class is used to use the memory as a data store. Every data you insert are stored in an array contained by this class. This adapter can be used by both the browser & Node.JS.
       *
       * @extends Adapters.DiasporaAdapter
       * @memberof Adapters
       */


      var InMemoryDiasporaAdapter =
      /*#__PURE__*/
      function (_DiasporaAdapter) {
        _inheritsLoose(InMemoryDiasporaAdapter, _DiasporaAdapter);

        /**
         * Create a new instance of in memory adapter.
         *
         * @author gerkin
         */
        function InMemoryDiasporaAdapter() {
          var _this6;

          /**
           * Link to the InMemoryEntity.
           *
           * @name classEntity
           * @type {DataStoreEntities.InMemoryEntity}
           * @memberof Adapters.InMemoryDiasporaAdapter
           * @instance
           * @author Gerkin
           */
          _this6 = _DiasporaAdapter.call(this, InMemoryEntity) || this;
          _this6.state = 'ready';
          /**
           * Plain old javascript object used as data store.
           *
           * @author Gerkin
           */

          _this6.store = {};
          return _this6;
        }
        /**
         * Create the data store and call {@link Adapters.DiasporaAdapter#configureCollection}.
         *
         * @author gerkin
         * @param   {string} tableName - Name of the table (usually, model name).
         * @param   {Object} remaps    - Associative hash that links entity field names with data source field names.
         * @returns {undefined} This function does not return anything.
         */


        var _proto3 = InMemoryDiasporaAdapter.prototype;

        _proto3.configureCollection = function configureCollection(tableName, remaps) {
          _DiasporaAdapter.prototype.configureCollection.call(this, tableName, remaps);

          this.ensureCollectionExists(tableName);
        }; // -----
        // ### Utils

        /**
         * Get or create the store hash.
         *
         * @author gerkin
         * @param   {string} table - Name of the table.
         * @returns {DataStoreTable} In memory table to use.
         */


        _proto3.ensureCollectionExists = function ensureCollectionExists(table) {
          if (this.store.hasOwnProperty(table)) {
            return this.store[table];
          } else {
            return this.store[table] = {
              items: []
            };
          }
        }; // -----
        // ### Insert

        /**
         * Insert a single entity in the memory store.
         *
         * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for in-memory interactions.
         * @author gerkin
         * @param   {string} table  - Name of the table to insert data in.
         * @param   {Object} entity - Hash representing the entity to insert.
         * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link InMemoryEntity}* `entity`).
         */


        _proto3.insertOne = function insertOne(table, entity) {
          entity = _.cloneDeep(entity);
          var storeTable = this.ensureCollectionExists(table);
          entity.id = Utils.generateUUID();
          this.setIdHash(entity);
          storeTable.items.push(entity);
          return Promise.resolve(new this.classEntity(entity, this));
        }; // -----
        // ### Find

        /**
         * Retrieve a single entity from the memory.
         *
         * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for in-memory interactions.
         * @author gerkin
         * @param   {string}                               table        - Name of the table to retrieve data from.
         * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
         * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
         * @returns {Promise} Promise resolved once item is found. Called with (*{@link InMemoryEntity}* `entity`).
         */


        _proto3.findOne = function findOne(table, queryFind, options) {
          if (options === void 0) {
            options = {};
          }

          var storeTable = this.ensureCollectionExists(table);

          var matches = _.filter(storeTable.items, _.partial(this.matchEntity, queryFind));

          var reducedMatches = Utils.applyOptionsToSet(matches, options);
          return Promise.resolve(this.maybeCastEntity(_.first(reducedMatches)));
        };
        /**
         * Retrieve several entities from the memory.
         *
         * @summary This reimplements {@link Adapters.DiasporaAdapter#findMany}, modified for in-memory interactions.
         * @author gerkin
         * @param   {string}                               table        - Name of the table to retrieve data from.
         * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
         * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
         * @returns {Promise} Promise resolved once items are found. Called with (*{@link InMemoryEntity}[]* `entities`).
         */


        _proto3.findMany = function findMany(table, queryFind, options) {
          if (options === void 0) {
            options = {};
          }

          var storeTable = this.ensureCollectionExists(table);

          var matches = _.filter(storeTable.items, _.partial(this.matchEntity, queryFind));

          var reducedMatches = Utils.applyOptionsToSet(matches, options);
          return Promise.resolve(this.maybeCastSet(reducedMatches));
        }; // -----
        // ### Update

        /**
         * Update a single entity in the memory.
         *
         * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for in-memory interactions.
         * @author gerkin
         * @param   {string}                               table        - Name of the table to update data in.
         * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
         * @param   {Object}                               update       - Object properties to set.
         * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
         * @returns {Promise} Promise resolved once update is done. Called with (*{@link InMemoryEntity}* `entity`).
         */


        _proto3.updateOne = function updateOne(table, queryFind, update, options) {
          var _this7 = this;

          if (options === void 0) {
            options = {};
          }

          return this.findOne(table, queryFind, options).then(function (found) {
            if (!_.isNil(found)) {
              var storeTable = _this7.ensureCollectionExists(table);

              var match = _.find(storeTable.items, {
                id: found.id
              });

              Utils.applyUpdateEntity(update, match);
              return Promise.resolve(_this7.maybeCastEntity(match));
            } else {
              return Promise.resolve();
            }
          });
        };
        /**
         * Update several entities in the memory.
         *
         * @summary This reimplements {@link Adapters.DiasporaAdapter#updateMany}, modified for in-memory interactions.
         * @author gerkin
         * @param   {string}                               table        - Name of the table to update data in.
         * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
         * @param   {Object}                               update       - Object properties to set.
         * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
         * @returns {Promise} Promise resolved once update is done. Called with (*{@link InMemoryEntity}[]* `entities`).
         */


        _proto3.updateMany = function updateMany(table, queryFind, update, options) {
          var _this8 = this;

          if (options === void 0) {
            options = {};
          }

          return this.findMany(table, queryFind, options).then(function (found) {
            if (!_.isNil(found) && found.length > 0) {
              var storeTable = _this8.ensureCollectionExists(table);

              var foundIds = _.map(found, 'id');

              var matches = _.filter(storeTable.items, function (item) {
                return -1 !== foundIds.indexOf(item.id);
              });

              return Promise.resolve(_this8.maybeCastSet(_.map(matches, function (item) {
                Utils.applyUpdateEntity(update, item);
                return item;
              })));
            } else {
              return Promise.resolve([]);
            }
          });
        }; // -----
        // ### Delete

        /**
         * Delete a single entity from the memory.
         *
         * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for in-memory interactions.
         * @author gerkin
         * @param   {string}                               table        - Name of the table to delete data from.
         * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
         * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
         * @returns {Promise} Promise resolved once item is found. Called with (*undefined*).
         */


        _proto3.deleteOne = function deleteOne(table, queryFind, options) {
          var _this9 = this;

          if (options === void 0) {
            options = {};
          }

          var storeTable = this.ensureCollectionExists(table);
          return this.findOne(table, queryFind, options).then(function (entityToDelete) {
            if (!_.isNil(entityToDelete)) {
              storeTable.items = _.reject(storeTable.items, function (entity) {
                return entity.id === entityToDelete.idHash[_this9.name];
              });
            }

            return Promise.resolve();
          });
        };
        /**
         * Delete several entities from the memory.
         *
         * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteMany}, modified for in-memory interactions.
         * @author gerkin
         * @param   {string}                               table        - Name of the table to delete data from.
         * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
         * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
         * @returns {Promise} Promise resolved once items are deleted. Called with (*undefined*).
         */


        _proto3.deleteMany = function deleteMany(table, queryFind, options) {
          var _this10 = this;

          if (options === void 0) {
            options = {};
          }

          var storeTable = this.ensureCollectionExists(table);
          return this.findMany(table, queryFind, options).then(function (entitiesToDelete) {
            var entitiesIds = _.map(entitiesToDelete, function (entity) {
              return _.get(entity, "idHash." + _this10.name);
            });

            storeTable.items = _.reject(storeTable.items, function (entity) {
              return _.includes(entitiesIds, entity.id);
            });
            return Promise.resolve();
          });
        };

        return InMemoryDiasporaAdapter;
      }(DiasporaAdapter);

      module.exports = InMemoryDiasporaAdapter;
    }, {
      "../../dependencies": 11,
      "../../diaspora": 12,
      "../../utils": 21,
      "./entity.js": 6
    }],
    6: [function (require, module, exports) {
      'use strict';

      var DataStoreEntity = require('../base/entity.js');
      /**
       * Entity stored in {@link Adapters.InMemoryDiasporaAdapter the in-memory adapter}.
       * @extends DataStoreEntities.DataStoreEntity
       * @memberof DataStoreEntities
       */


      var InMemoryEntity =
      /*#__PURE__*/
      function (_DataStoreEntity) {
        _inheritsLoose(InMemoryEntity, _DataStoreEntity);

        /**
         * Construct a in memory entity with specified content & parent.
         * 
         * @author gerkin
         * @param {Object}                   entity     - Object containing attributes to inject in this entity. The only **reserved key** is `dataSource`.
         * @param {Adapters.DiasporaAdapter} dataSource - Adapter that spawn this entity.
         */
        function InMemoryEntity(entity, dataSource) {
          return _DataStoreEntity.call(this, entity, dataSource) || this;
        }

        return InMemoryEntity;
      }(DataStoreEntity);

      module.exports = InMemoryEntity;
    }, {
      "../base/entity.js": 4
    }],
    7: [function (require, module, exports) {
      (function (process) {
        'use strict';

        var _require6 = require('../../dependencies'),
            _ = _require6._,
            Promise = _require6.Promise;

        var Diaspora = require('../../diaspora');

        var DiasporaAdapter = Diaspora.components.Adapters.Adapter;

        var WebApiEntity = require('./entity.js');

        var queryObjectToString = function queryObjectToString(queryObject) {
          return _(queryObject).chain(_.cloneDeep).omitBy(function (val) {
            return _.isObject(val) && _.isEmpty(val);
          }) // { foo: 1, bar: { baz: 2 } }
          .mapValues(JSON.stringify) // { foo: '1', bar: '{"baz": "2"}' }
          .toPairs() // [ [ 'foo', '1' ], [ 'bar', '{"baz":2}' ] ]
          .map(_.partial(_.map, _, encodeURIComponent)) // [ [ 'foo', '1' ], [ 'bar', '%7B%22baz%22%3A2%7D' ] ]
          .map(function (arr) {
            return arr[0] + "=" + arr[1];
          }) // [ 'foo=1', 'bar=%7B%22baz%22%3A2%7D' ]
          .join('&').value();
        };

        var httpErrorFactories = {
          400: function _(xhr) {
            return new Error("Posted data through HTTP is invalid; message \"" + xhr.response.message + "\"");
          },
          _: function _(xhr) {
            return new Error("Unhandled HTTP error with status code " + xhr.status + " & message \"" + xhr.response.message + "\"");
          }
        };

        var defineXhrEvents = function defineXhrEvents(xhr, resolve, reject) {
          xhr.onload = function () {
            if (_.inRange(xhr.status, 200, 299)) {
              return resolve(xhr.response);
            } else {
              return reject(_.get(httpErrorFactories, xhr.status, httpErrorFactories._)(xhr));
            }
          };

          xhr.onerror = function () {
            return reject(httpErrorFactories._(xhr));
          };
        };

        var httpRequest =
        /*#__PURE__*/
        function () {
          var _ref2 = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee(method, endPoint, data, queryObject) {
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    if (process.browser) {
                      _context.next = 7;
                      break;
                    }

                    if (_.isNil(data)) {
                      data = true;
                    }

                    _context.next = 4;
                    return require('request-promise')[method.toLowerCase()](endPoint, {
                      json: data,
                      qs: _.mapValues(queryObject, JSON.stringify)
                    });

                  case 4:
                    return _context.abrupt("return", _context.sent);

                  case 7:
                    return _context.abrupt("return", new Promise(function (resolve, reject) {
                      /* globals XMLHttpRequest: false */
                      var xhr = new XMLHttpRequest();
                      defineXhrEvents(xhr, resolve, reject);
                      var queryString = queryObjectToString(queryObject);
                      xhr.responseType = 'json';
                      xhr.open(method, "" + endPoint + (queryString ? "?" + queryString : ''));
                      xhr.setRequestHeader('Content-Type', 'application/json');
                      xhr.send(_.isNil(data) ? undefined : JSON.stringify(data));
                    }));

                  case 8:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee, this);
          }));

          return function httpRequest(_x, _x2, _x3, _x4) {
            return _ref2.apply(this, arguments);
          };
        }();

        var getQueryObject = function getQueryObject(queryFind, options) {
          if (0 === options.skip) {
            delete options.skip;
          }

          return _.assign({}, _.omit(options, ['remapInput', 'remapOutput']), {
            where: queryFind
          });
        };

        var maybeAddIdHashToEntities = function maybeAddIdHashToEntities(entities, adapter) {
          if (!_.isEmpty(entities)) {
            entities = _.map(entities, _.unary(adapter.setIdHash.bind(adapter)));
          }

          return entities;
        };

        var checkWebApiAdapterConfig = function checkWebApiAdapterConfig(config) {
          if (!process.browser && !_.isString(config.host)) {
            throw new Error("\"config.host\" is not defined, or is not a string: had \"" + config.host + "\"");
          }

          if (!process.browser && !_.isString(config.scheme)) {
            throw new Error("\"config.scheme\" is not defined, or is not a string: had \"" + config.scheme + "\"");
          }
        };
        /**
         * Adapter for RESTful HTTP APIs.
         *
         * @see https://www.npmjs.com/package/diaspora-server Diaspora-Server: Package built on Diaspora & Express.js to easily configure HTTP APIs compatible with this adapter.
         * @extends Adapters.DiasporaAdapter
         * @memberof Adapters
         */


        var WebApiDiasporaAdapter =
        /*#__PURE__*/
        function (_DiasporaAdapter2) {
          _inheritsLoose(WebApiDiasporaAdapter, _DiasporaAdapter2);

          /**
           * Create a new instance of web api adapter.
           *
           * @param {Object}         [config]                 - Configuration of this adapter.
           * @param {string|false}   [config.scheme = false]  - Scheme to use. On server environment, this parameter is *required*. On browser environment, it defaults to a relative scheme (IE ``). Note that it will be suffixed with `//`.
           * @param {string|false}   [config.host = false]    - Hostname of the endpoint. On server environment, this parameter is *required*.
           * @param {number|false}   [config.port = false]    - Port of the endpoint.
           * @param {number|false}   [config.path = '']       - Path to the endpoint.
           * @param {Object<string>} [config.pluralApis = {}] - Hash with keys being the singular name of the endpoint, and values being the associated plural name of the same endpoint.
           * @author gerkin
           */
          function WebApiDiasporaAdapter(config) {
            var _this11;

            if (config === void 0) {
              config = {};
            }

            /**
             * Link to the WebApiEntity.
             *
             * @name classEntity
             * @type {DataStoreEntities.WebApiEntity}
             * @memberof Adapters.WebApiDiasporaAdapter
             * @instance
             * @author Gerkin
             */
            _this11 = _DiasporaAdapter2.call(this, WebApiEntity) || this;
            /**
             * Base URL to the REST API
             *
             * @name baseEndPoint
             * @type {string}
             * @author Gerkin
             */

            _.defaults(config, {
              scheme: false,
              host: false,
              port: false,
              path: '',
              pluralApis: {}
            });

            checkWebApiAdapterConfig(config);

            if (process.browser && false === config.host) {
              // Endpoint is an absolute url
              _this11.baseEndPoint = config.path;
            } else {
              var portString = config.port ? ":" + config.port : '';
              var schemeString = config.scheme ? config.scheme + ":" : '';
              _this11.baseEndPoint = schemeString + "//" + config.host + portString + config.path;
            }

            _this11.state = 'ready';
            /**
             * Hash mapping singular API names to plural API names
             *
             * @name pluralApis
             * @type {Object<string>}
             * @author Gerkin
             */

            _this11.pluralApis = config.pluralApis;
            return _this11;
          }
          /**
           * Send an http query to the targeted `endPoint` using `method` as verb.
           * 
           * @async
           * @param   {string} verb          - Valid HTTP verb. This adapter uses `GET`, `POST`, `PATCH` & `DELETE`.
           * @param   {string} endPoint      - Name of the endpoint to interact with. It will be prepended with {@link Adapters.WebApiDiasporaAdapter#baseEndPoint}.
           * @param   {Object} [data]        - Optionnal data to send within the body of the request.
           * @param   {Object} [queryObject] - Optionnal query object to send along with the request.
           * @returns {Promise<Object>} Promise resolved with the resulting data.
           */


          var _proto4 = WebApiDiasporaAdapter.prototype;

          _proto4.httpQuery = function httpQuery(verb, endPoint, data, queryObject) {
            return httpRequest(verb, this.baseEndPoint + "/" + endPoint.toLowerCase(), data, queryObject);
          };
          /**
           * Get the plural name of an endpoint.
           * 
           * @param   {string} endPoint - Name of the endpoint.
           * @returns {string} Plural version of the endpoint name.
           */


          _proto4.getPluralEndpoint = function getPluralEndpoint(endPoint) {
            if (this.pluralApis.hasOwnProperty(endPoint)) {
              return this.pluralApis[endPoint];
            } else {
              return endPoint + "s";
            }
          }; // -----
          // ### Insert

          /**
           * Insert a single entity through an HTTP API.
           *
           * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for use of web api.
           * @author gerkin
           * @param   {string} table  - Name of the table to insert data in.
           * @param   {Object} entity - Hash representing the entity to insert.
           * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link WebApiEntity}* `entity`).
           */


          _proto4.insertOne =
          /*#__PURE__*/
          function () {
            var _insertOne = _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee2(table, entity) {
              return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      _context2.next = 2;
                      return this.httpQuery('POST', table, entity);

                    case 2:
                      entity = _context2.sent;

                      if (!_.isNil(entity)) {
                        this.setIdHash(entity);
                      }

                      return _context2.abrupt("return", this.maybeCastEntity(entity));

                    case 5:
                    case "end":
                      return _context2.stop();
                  }
                }
              }, _callee2, this);
            }));

            return function insertOne(_x5, _x6) {
              return _insertOne.apply(this, arguments);
            };
          }();
          /**
           * Insert several entities through an HTTP API.
           *
           * @summary This reimplements {@link Adapters.DiasporaAdapter#insertMany}, modified for use of web api.
           * @author gerkin
           * @param   {string}   table    - Name of the table to insert data in.
           * @param   {Object[]} entities - Hash representing entities to insert.
           * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link WebApiEntity[]}* `entities`).
           */


          _proto4.insertMany =
          /*#__PURE__*/
          function () {
            var _insertMany = _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee3(table, entities) {
              return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      _context3.next = 2;
                      return this.httpQuery('POST', this.getPluralEndpoint(table), entities);

                    case 2:
                      entities = _context3.sent;
                      entities = maybeAddIdHashToEntities(entities, this);
                      return _context3.abrupt("return", this.maybeCastSet(entities));

                    case 5:
                    case "end":
                      return _context3.stop();
                  }
                }
              }, _callee3, this);
            }));

            return function insertMany(_x7, _x8) {
              return _insertMany.apply(this, arguments);
            };
          }(); // -----
          // ### Find

          /**
           * 
           *
           * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for use of web api.
           * @author gerkin
           * @param   {string}                               table        - Name of the table to retrieve data from.
           * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
           * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
           * @returns {Promise} Promise resolved once item is found. Called with (*{@link InMemoryEntity}* `entity`).
           */


          _proto4.findOne =
          /*#__PURE__*/
          function () {
            var _findOne = _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee4(table, queryFind, options) {
              var entity;
              return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      if (options === void 0) {
                        options = {};
                      }

                      _context4.next = 3;
                      return this.httpQuery('GET', table, null, getQueryObject(queryFind, options));

                    case 3:
                      entity = _context4.sent;

                      if (!_.isNil(entity)) {
                        this.setIdHash(entity);
                      }

                      return _context4.abrupt("return", this.maybeCastEntity(entity));

                    case 6:
                    case "end":
                      return _context4.stop();
                  }
                }
              }, _callee4, this);
            }));

            return function findOne(_x9, _x10, _x11) {
              return _findOne.apply(this, arguments);
            };
          }();
          /**
           * 
           *
           * @summary This reimplements {@link Adapters.DiasporaAdapter#findMany}, modified for use of web api.
           * @author gerkin
           * @param   {string}                               table        - Name of the table to retrieve data from.
           * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
           * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
           * @returns {Promise} Promise resolved once items are found. Called with (*{@link InMemoryEntity}[]* `entities`).
           */


          _proto4.findMany =
          /*#__PURE__*/
          function () {
            var _findMany = _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee5(table, queryFind, options) {
              var entities;
              return regeneratorRuntime.wrap(function _callee5$(_context5) {
                while (1) {
                  switch (_context5.prev = _context5.next) {
                    case 0:
                      if (options === void 0) {
                        options = {};
                      }

                      _context5.next = 3;
                      return this.httpQuery('GET', this.getPluralEndpoint(table), null, getQueryObject(queryFind, options));

                    case 3:
                      entities = _context5.sent;
                      entities = maybeAddIdHashToEntities(entities, this);
                      return _context5.abrupt("return", this.maybeCastSet(entities));

                    case 6:
                    case "end":
                      return _context5.stop();
                  }
                }
              }, _callee5, this);
            }));

            return function findMany(_x12, _x13, _x14) {
              return _findMany.apply(this, arguments);
            };
          }(); // -----
          // ### Update

          /**
           * 
           *
           * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for use of web api.
           * @author gerkin
           * @param   {string}                               table        - Name of the table to update data in.
           * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
           * @param   {Object}                               update       - Object properties to set.
           * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
           * @returns {Promise} Promise resolved once update is done. Called with (*{@link InMemoryEntity}* `entity`).
           */


          _proto4.updateOne =
          /*#__PURE__*/
          function () {
            var _updateOne = _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee6(table, queryFind, update, options) {
              var entity, _entity$idHash;

              return regeneratorRuntime.wrap(function _callee6$(_context6) {
                while (1) {
                  switch (_context6.prev = _context6.next) {
                    case 0:
                      if (options === void 0) {
                        options = {};
                      }

                      _context6.next = 3;
                      return this.httpQuery('PATCH', table, update, getQueryObject(queryFind, options));

                    case 3:
                      entity = _context6.sent;

                      if (!_.isNil(entity)) {
                        entity.idHash = (_entity$idHash = {}, _entity$idHash[this.name] = entity.id, _entity$idHash);
                      }

                      return _context6.abrupt("return", this.maybeCastEntity(entity));

                    case 6:
                    case "end":
                      return _context6.stop();
                  }
                }
              }, _callee6, this);
            }));

            return function updateOne(_x15, _x16, _x17, _x18) {
              return _updateOne.apply(this, arguments);
            };
          }();
          /**
           * 
           *
           * @summary This reimplements {@link Adapters.DiasporaAdapter#updateMany}, modified for use of web api.
           * @author gerkin
           * @param   {string}                               table        - Name of the table to update data in.
           * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
           * @param   {Object}                               update       - Object properties to set.
           * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
           * @returns {Promise} Promise resolved once update is done. Called with (*{@link InMemoryEntity}[]* `entities`).
           */


          _proto4.updateMany =
          /*#__PURE__*/
          function () {
            var _updateMany = _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee7(table, queryFind, update, options) {
              var entities;
              return regeneratorRuntime.wrap(function _callee7$(_context7) {
                while (1) {
                  switch (_context7.prev = _context7.next) {
                    case 0:
                      if (options === void 0) {
                        options = {};
                      }

                      _context7.next = 3;
                      return this.httpQuery('PATCH', this.getPluralEndpoint(table), update, getQueryObject(queryFind, options));

                    case 3:
                      entities = _context7.sent;
                      entities = maybeAddIdHashToEntities(entities, this);
                      return _context7.abrupt("return", this.maybeCastSet(entities));

                    case 6:
                    case "end":
                      return _context7.stop();
                  }
                }
              }, _callee7, this);
            }));

            return function updateMany(_x19, _x20, _x21, _x22) {
              return _updateMany.apply(this, arguments);
            };
          }(); // -----
          // ### Delete

          /**
           * 
           *
           * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for use of web api.
           * @author gerkin
           * @param   {string}                               table        - Name of the table to delete data from.
           * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
           * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
           * @returns {Promise} Promise resolved once item is found. Called with (*undefined*).
           */


          _proto4.deleteOne =
          /*#__PURE__*/
          function () {
            var _deleteOne = _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee8(table, queryFind, options) {
              return regeneratorRuntime.wrap(function _callee8$(_context8) {
                while (1) {
                  switch (_context8.prev = _context8.next) {
                    case 0:
                      if (options === void 0) {
                        options = {};
                      }

                      _context8.next = 3;
                      return this.httpQuery('DELETE', table, null, getQueryObject(queryFind, options));

                    case 3:
                      return _context8.abrupt("return", _context8.sent);

                    case 4:
                    case "end":
                      return _context8.stop();
                  }
                }
              }, _callee8, this);
            }));

            return function deleteOne(_x23, _x24, _x25) {
              return _deleteOne.apply(this, arguments);
            };
          }();
          /**
           * 
           *
           * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteMany}, modified for use of web api.
           * @author gerkin
           * @param   {string}                               table        - Name of the table to delete data from.
           * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
           * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
           * @returns {Promise} Promise resolved once items are deleted. Called with (*undefined*).
           */


          _proto4.deleteMany =
          /*#__PURE__*/
          function () {
            var _deleteMany = _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee9(table, queryFind, options) {
              return regeneratorRuntime.wrap(function _callee9$(_context9) {
                while (1) {
                  switch (_context9.prev = _context9.next) {
                    case 0:
                      if (options === void 0) {
                        options = {};
                      }

                      _context9.next = 3;
                      return this.httpQuery('DELETE', this.getPluralEndpoint(table), null, getQueryObject(queryFind, options));

                    case 3:
                      return _context9.abrupt("return", _context9.sent);

                    case 4:
                    case "end":
                      return _context9.stop();
                  }
                }
              }, _callee9, this);
            }));

            return function deleteMany(_x26, _x27, _x28) {
              return _deleteMany.apply(this, arguments);
            };
          }();

          return WebApiDiasporaAdapter;
        }(DiasporaAdapter);

        module.exports = WebApiDiasporaAdapter;
      }).call(this, require('_process'));
    }, {
      "../../dependencies": 11,
      "../../diaspora": 12,
      "./entity.js": 8,
      "_process": 24,
      "request-promise": undefined
    }],
    8: [function (require, module, exports) {
      'use strict';

      var DataStoreEntity = require('../base/entity.js');
      /**
       * Entity stored in {@link Adapters.WebApiDiasporaAdapter the web API adapter}.
       * @extends DataStoreEntities.DataStoreEntity
       * @memberof DataStoreEntities
       */


      var WebApiEntity =
      /*#__PURE__*/
      function (_DataStoreEntity2) {
        _inheritsLoose(WebApiEntity, _DataStoreEntity2);

        /**
         * Construct a web api entity with specified content & parent.
         * 
         * @author gerkin
         * @param {Object}                   entity     - Object containing attributes to inject in this entity. The only **reserved key** is `dataSource`.
         * @param {Adapters.DiasporaAdapter} dataSource - Adapter that spawn this entity.
         */
        function WebApiEntity(entity, dataSource) {
          return _DataStoreEntity2.call(this, entity, dataSource) || this;
        }

        return WebApiEntity;
      }(DataStoreEntity);

      module.exports = WebApiEntity;
    }, {
      "../base/entity.js": 4
    }],
    9: [function (require, module, exports) {
      (function (global) {
        'use strict';

        var _require7 = require('../../dependencies'),
            _ = _require7._,
            Promise = _require7.Promise;

        var Utils = require('../../utils');

        var Diaspora = require('../../diaspora');

        var DiasporaAdapter = Diaspora.components.Adapters.Adapter;

        var WebStorageEntity = require('./entity');
        /**
         * This class is used to use local storage or session storage as a data store. This adapter should be used only by the browser.
         *
         * @extends Adapters.DiasporaAdapter
         * @memberof Adapters
         */


        var WebStorageDiasporaAdapter =
        /*#__PURE__*/
        function (_DiasporaAdapter3) {
          _inheritsLoose(WebStorageDiasporaAdapter, _DiasporaAdapter3);

          /**
           * Create a new instance of local storage adapter.
           *
           * @author gerkin
           * @param {Object}  config                 - Configuration object.
           * @param {boolean} [config.session=false] - Set to true to use sessionStorage instead of localStorage.
           */
          function WebStorageDiasporaAdapter(config) {
            var _this12;

            /**
             * Link to the WebStorageEntity.
             *
             * @name classEntity
             * @type {DataStoreEntities.WebStorageEntity}
             * @memberof Adapters.WebStorageDiasporaAdapter
             * @instance
             * @author Gerkin
             */
            _this12 = _DiasporaAdapter3.call(this, WebStorageEntity) || this;

            _.defaults(config, {
              session: false
            });

            _this12.state = 'ready';
            /**
             * {@link https://developer.mozilla.org/en-US/docs/Web/API/Storage Storage api} where to store data.
             *
             * @type {Storage}
             * @author Gerkin
             * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage localStorage} and {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage sessionStorage} on MDN web docs.
             * @see {@link Adapters.WebStorageDiasporaAdapter}:config.session parameter.
             */

            _this12.source = true === config.session ? global.sessionStorage : global.localStorage;
            return _this12;
          }
          /**
           * Create the collection index and call {@link Adapters.DiasporaAdapter#configureCollection}.
           *
           * @author gerkin
           * @param {string} tableName - Name of the table (usually, model name).
           * @param {Object} remaps    - Associative hash that links entity field names with data source field names.
           * @returns {undefined} This function does not return anything.
           */


          var _proto5 = WebStorageDiasporaAdapter.prototype;

          _proto5.configureCollection = function configureCollection(tableName, remaps) {
            _DiasporaAdapter3.prototype.configureCollection.call(this, tableName, remaps);

            this.ensureCollectionExists(tableName);
          }; // -----
          // ### Utils

          /**
           * Create the table key if it does not exist.
           *
           * @author gerkin
           * @param   {string} table - Name of the table.
           * @returns {string[]} Index of the collection.
           */


          _proto5.ensureCollectionExists = function ensureCollectionExists(table) {
            var index = this.source.getItem(table);

            if (_.isNil(index)) {
              index = [];
              this.source.setItem(table, JSON.stringify(index));
            } else {
              index = JSON.parse(index);
            }

            return index;
          };
          /**
           * Deduce the item name from table name and item ID.
           *
           * @author gerkin
           * @param   {string} table - Name of the table to construct name for.
           * @param   {string} id    - Id of the item to find.
           * @returns {string} Name of the item.
           */


          _proto5.getItemName = function getItemName(table, id) {
            return table + ".id=" + id;
          }; // -----
          // ### Insert

          /**
           * Insert a single entity in the local storage.
           *
           * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for local storage or session storage interactions.
           * @author gerkin
           * @param   {string} table  - Name of the table to insert data in.
           * @param   {Object} entity - Hash representing the entity to insert.
           * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link DataStoreEntities.WebStorageEntity}* `entity`).
           */


          _proto5.insertOne = function insertOne(table, entity) {
            entity = _.cloneDeep(entity || {});
            entity.id = Utils.generateUUID();
            this.setIdHash(entity);

            try {
              var tableIndex = this.ensureCollectionExists(table);
              tableIndex.push(entity.id);
              this.source.setItem(table, JSON.stringify(tableIndex));
              this.source.setItem(this.getItemName(table, entity.id), JSON.stringify(entity));
            } catch (error) {
              return Promise.reject(error);
            }

            return Promise.resolve(this.maybeCastEntity(entity));
          };
          /**
           * Insert several entities in the local storage.
           *
           * @summary This reimplements {@link Adapters.DiasporaAdapter#insertMany}, modified for local storage or session storage interactions.
           * @author gerkin
           * @param   {string}   table    - Name of the table to insert data in.
           * @param   {Object[]} entities - Array of hashes representing entities to insert.
           * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link DataStoreEntities.WebStorageEntity}[]* `entities`).
           */


          _proto5.insertMany = function insertMany(table, entities) {
            var _this13 = this;

            entities = _.cloneDeep(entities);

            try {
              var tableIndex = this.ensureCollectionExists(table);
              entities = entities.map(function (entity) {
                if (entity === void 0) {
                  entity = {};
                }

                entity.id = Utils.generateUUID();

                _this13.setIdHash(entity);

                tableIndex.push(entity.id);

                _this13.source.setItem(_this13.getItemName(table, entity.id), JSON.stringify(entity));

                return new _this13.classEntity(entity, _this13);
              });
              this.source.setItem(table, JSON.stringify(tableIndex));
            } catch (error) {
              return Promise.reject(error);
            }

            return Promise.resolve(this.maybeCastSet(entities));
          }; // -----
          // ### Find

          /**
           * Find a single local storage entity using its id.
           *
           * @author gerkin
           * @param   {string} table - Name of the collection to search entity in.
           * @param   {string} id    - Id of the entity to search.
           * @returns {DataStoreEntities.WebStorageEntity|undefined} Found entity, or undefined if not found.
           */


          _proto5.findOneById = function findOneById(table, id) {
            var item = this.source.getItem(this.getItemName(table, id));

            if (!_.isNil(item)) {
              item = JSON.parse(item);
            }

            return Promise.resolve(this.maybeCastEntity(item));
          };
          /**
           * Retrieve a single entity from the local storage.
           *
           * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for local storage or session storage interactions.
           * @author gerkin
           * @param   {string}                               table        - Name of the model to retrieve data from.
           * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
           * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
           * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntities.WebStorageEntity}* `entity`).
           */


          _proto5.findOne = function findOne(table, queryFind, options) {
            var _this14 = this;

            if (options === void 0) {
              options = {};
            }

            _.defaults(options, {
              skip: 0
            });

            if (!_.isObject(queryFind)) {
              return this.findOneById(table, queryFind);
            } else if (_.isEqual(_.keys(queryFind), ['id']) && _.isEqual(_.keys(queryFind.id), ['$equal'])) {
              return this.findOneById(table, queryFind.id.$equal);
            }

            var items = this.ensureCollectionExists(table);
            var returnedItem;
            var matched = 0;

            _.each(items, function (itemId) {
              var item = JSON.parse(_this14.source.getItem(_this14.getItemName(table, itemId)));

              if (_this14.matchEntity(queryFind, item)) {
                matched++; // If we matched enough items

                if (matched > options.skip) {
                  returnedItem = item;
                  return false;
                }
              }
            });

            return Promise.resolve(this.maybeCastEntity(returnedItem));
          }; // -----
          // ### Update

          /**
           * Update a single entity in the memory.
           *
           * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for local storage or session storage interactions.
           * @author gerkin
           * @param   {string}                               table        - Name of the table to update data in.
           * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
           * @param   {Object}                               update       - Object properties to set.
           * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
           * @returns {Promise} Promise resolved once update is done. Called with (*{@link DataStoreEntities.WebStorageEntity}* `entity`).
           */


          _proto5.updateOne = function updateOne(table, queryFind, update, options) {
            var _this15 = this;

            _.defaults(options, {
              skip: 0
            });

            return this.findOne(table, queryFind, options).then(function (entity) {
              if (_.isNil(entity)) {
                return Promise.resolve();
              }

              Utils.applyUpdateEntity(update, entity);

              try {
                _this15.source.setItem(_this15.getItemName(table, entity.id), JSON.stringify(entity));

                return Promise.resolve(entity);
              } catch (error) {
                return Promise.reject(error);
              }
            });
          }; // -----
          // ### Delete

          /**
           * Delete a single entity from the local storage.
           *
           * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for local storage or session storage interactions.
           * @author gerkin
           * @param   {string}                               table        - Name of the table to delete data from.
           * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
           * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
           * @returns {Promise} Promise resolved once item is deleted. Called with (*undefined*).
           */


          _proto5.deleteOne = function deleteOne(table, queryFind, options) {
            var _this16 = this;

            if (options === void 0) {
              options = {};
            }

            return this.findOne(table, queryFind, options).then(function (entityToDelete) {
              try {
                var tableIndex = _this16.ensureCollectionExists(table);

                _.pull(tableIndex, entityToDelete.id);

                _this16.source.setItem(table, JSON.stringify(tableIndex));

                _this16.source.removeItem(_this16.getItemName(table, entityToDelete.id));
              } catch (error) {
                return Promise.reject(error);
              }

              return Promise.resolve();
            });
          };
          /**
           * Delete several entities from the local storage.
           *
           * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteMany}, modified for local storage or session storage interactions.
           * @author gerkin
           * @param   {string}                               table        - Name of the table to delete data from.
           * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
           * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
           * @returns {Promise} Promise resolved once items are deleted. Called with (*undefined*).
           */


          _proto5.deleteMany = function deleteMany(table, queryFind, options) {
            var _this17 = this;

            if (options === void 0) {
              options = {};
            }

            try {
              return this.findMany(table, queryFind, options).then(function (entitiesToDelete) {
                var tableIndex = _this17.ensureCollectionExists(table);

                _.pullAll(tableIndex, _.map(entitiesToDelete, 'id'));

                _this17.source.setItem(table, JSON.stringify(tableIndex));

                _.forEach(entitiesToDelete, function (entityToDelete) {
                  _this17.source.removeItem(_this17.getItemName(table, entityToDelete.id));
                });

                return Promise.resolve();
              });
            } catch (error) {
              return Promise.reject(error);
            }
          };

          return WebStorageDiasporaAdapter;
        }(DiasporaAdapter);

        module.exports = WebStorageDiasporaAdapter;
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
      "../../dependencies": 11,
      "../../diaspora": 12,
      "../../utils": 21,
      "./entity": 10
    }],
    10: [function (require, module, exports) {
      'use strict';

      var DataStoreEntity = require('../base/entity.js');
      /**
       * Entity stored in {@link Adapters.WebStorageDiasporaAdapter the local storage adapter}.
       * 
       * @extends DataStoreEntities.DataStoreEntity
       * @memberof DataStoreEntities
       */


      var WebStorageEntity =
      /*#__PURE__*/
      function (_DataStoreEntity3) {
        _inheritsLoose(WebStorageEntity, _DataStoreEntity3);

        /**
         * Construct a local storage entity with specified content & parent.
         * 
         * @author gerkin
         * @param {Object}                   entity     - Object containing attributes to inject in this entity. The only **reserved key** is `dataSource`.
         * @param {Adapters.DiasporaAdapter} dataSource - Adapter that spawn this entity.
         */
        function WebStorageEntity(entity, dataSource) {
          return _DataStoreEntity3.call(this, entity, dataSource) || this;
        }

        return WebStorageEntity;
      }(DataStoreEntity);

      module.exports = WebStorageEntity;
    }, {
      "../base/entity.js": 4
    }],
    11: [function (require, module, exports) {
      (function (global) {
        'use strict';

        module.exports = {
          _: function () {
            return global._ || require('lodash');
          }(),
          SequentialEvent: function () {
            return global.SequentialEvent || require('sequential-event');
          }(),
          Promise: function () {
            return global.Promise && global.Promise.version ? global.Promise : require('bluebird');
          }()
        };
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
      "bluebird": undefined,
      "lodash": undefined,
      "sequential-event": undefined
    }],
    12: [function (require, module, exports) {
      (function (process) {
        'use strict';

        var dependencies = require('./dependencies');

        var _ = dependencies._,
            Promise = dependencies.Promise;
        /**
         * Event emitter that can execute async handlers in sequence
         *
         * @typedef {Object} SequentialEvent
         * @author Gerkin
         * @see {@link https://gerkindev.github.io/SequentialEvent.js/SequentialEvent.html Sequential Event documentation}.
         */

        /**
         * @module Diaspora
         */

        var logger = function () {
          if (!process.browser) {
            var winston = require('winston');

            var log = winston.createLogger({
              level: 'silly',
              format: winston.format.json(),
              transports: [//
                // - Write to all logs with level `info` and below to `combined.log`
                // - Write all logs error (and below) to `error.log`.
                //
              ]
            }); //
            // If we're not in production then log to the `console` with the format:
            // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
            //

            if (process.env.NODE_ENV !== 'production') {
              log.add(new winston.transports.Console({
                format: winston.format.simple()
              }));
            }

            return log;
          } else {
            return console;
          }
        }();

        var adapters = {};
        var dataSources = {};
        var models = {};

        var ensureAllEntities = function ensureAllEntities(adapter, table) {
          // Filter our results
          var filterResults = function filterResults(entity) {
            // Remap fields
            entity = adapter.remapOutput(table, entity); // Force results to be class instances

            if (!(entity instanceof adapter.classEntity) && !_.isNil(entity)) {
              return new adapter.classEntity(entity, adapter);
            }

            return entity;
          };

          return function (results) {
            if (_.isNil(results)) {
              return Promise.resolve();
            } else if (_.isArrayLike(results)) {
              return Promise.resolve(_.map(results, filterResults));
            } else {
              return Promise.resolve(filterResults(results));
            }
          };
        };

        var remapArgs = function remapArgs(args, optIndex, update, queryType, remapFunction) {
          if (false !== optIndex) {
            // Remap input objects
            if (true === args[optIndex].remapInput) {
              args[0] = remapFunction(args[0]);

              if (true === update) {
                args[1] = remapFunction(args[1]);
              }
            }

            args[optIndex].remapInput = false;
          } else if ('insert' === queryType.query) {
            // If inserting, then, we'll need to know if we are inserting *several* entities or a *single* one.
            if ('many' === queryType.number) {
              // If inserting *several* entities, map the array to remap each entity objects...
              args[0] = _.map(args[0], function (insertion) {
                return remapFunction(insertion);
              });
            } else {
              // ... or we are inserting a *single* one. We still need to remap entity.
              args[0] = remapFunction(args[0]);
            }
          }
        };

        var getRemapFunction = function getRemapFunction(adapter, table) {
          return function (query) {
            return adapter.remapInput(table, query);
          };
        };

        var wrapDataSourceAction = function wrapDataSourceAction(callback, queryType, adapter) {
          return function (table) {
            // Transform arguments for find, update & delete
            var optIndex = false;
            var upd = false;

            if (['find', 'delete'].indexOf(queryType.query) >= 0) {
              // For find & delete, options are 3rd argument (so 2nd item in `args`)
              optIndex = 1;
            } else if ('update' === queryType.query) {
              // For update, options are 4th argument (so 3nd item in `args`), and `upd` flag is toggled on.
              optIndex = 2;
              upd = true;
            }

            for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
              args[_key - 1] = arguments[_key];
            }

            try {
              if (false !== optIndex) {
                // Options to canonical
                args[optIndex] = adapter.normalizeOptions(args[optIndex]); // Query search to cannonical

                args[0] = adapter.normalizeQuery(args[0], args[optIndex]);
              }

              remapArgs(args, optIndex, upd, queryType, getRemapFunction(adapter, table));
            } catch (err) {
              return Promise.reject(err);
            } // Hook after promise resolution


            return callback.call.apply(callback, [adapter, table].concat(args)).then(ensureAllEntities(adapter, table));
          };
        };

        var ERRORS = {
          NON_EMPTY_STR: _.template('<%= c %> <%= p %> must be a non empty string, had "<%= v %>"')
        };

        var requireName = function requireName(classname, value) {
          if (!_.isString(value) && value.length > 0) {
            throw new Error(ERRORS.NON_EMPTY_STR({
              c: classname,
              p: 'name',
              v: value
            }));
          }
        };

        var getDefault = function getDefault(identifier) {
          if (_.isString(identifier)) {
            var match = identifier.match(/^(.+?)(?:::(.+?))+$/);

            if (match) {
              var parts = identifier.split('::');

              var namedFunction = _.get(Diaspora.namedFunctions, parts);

              if (_.isFunction(namedFunction)) {
                return namedFunction();
              }
            }
          }

          return identifier;
        };
        /**
         * Diaspora main namespace
         * @namespace Diaspora
         * @public
         * @author gerkin
         */


        var Diaspora = {
          namedFunctions: {
            Diaspora: {
              'Date.now()': function DateNow() {
                return new Date();
              }
            }
          },

          /**
           * Set default values if required.
           *
           * @author gerkin
           * @param   {Object}         entity    - Entity to set defaults in.
           * @param   {ModelPrototype} modelDesc - Model description.
           * @returns {Object} Entity merged with default values.
           */
          default: function _default(entity, modelDesc) {
            var _this18 = this;

            // Apply method `defaultField` on each field described
            return _.defaults(entity, _.mapValues(modelDesc, function (fieldDesc, field) {
              return _this18.defaultField(entity[field], fieldDesc);
            }));
          },

          /**
           * Set the default on a single field according to its description.
           *
           * @author gerkin
           * @param   {Any}             value     - Value to default.
           * @param   {FieldDescriptor} fieldDesc - Description of the field to default.
           * @returns {Any} Defaulted value.
           */
          defaultField: function defaultField(value, fieldDesc) {
            var out;

            if (!_.isUndefined(value)) {
              out = value;
            } else {
              out = _.isFunction(fieldDesc.default) ? fieldDesc.default() : getDefault(fieldDesc.default);
            }

            if ('object' === fieldDesc.type && _.isObject(fieldDesc.attributes) && _.keys(fieldDesc.attributes).length > 0 && !_.isNil(out)) {
              return this.default(out, fieldDesc.attributes);
            } else {
              return out;
            }
          },

          /**
           * Create a data source (usually, a database connection) that may be used by models.
           *
           * @author gerkin
           * @throws  {Error} Thrown if provided `adapter` label does not correspond to any adapter registered.
           * @param   {string} adapterLabel - Label of the adapter used to create the data source.
           * @param   {Object} config       - Configuration hash. This configuration hash depends on the adapter we want to use.
           * @returns {Adapters.DiasporaAdapter} New adapter spawned.
           */
          createDataSource: function createDataSource(adapterLabel, config) {
            if (!adapters.hasOwnProperty(adapterLabel)) {
              try {
                require("diaspora-" + adapterLabel);
              } catch (e) {
                throw new Error("Unknown adapter \"" + adapterLabel + "\". Available currently are " + Object.keys(adapters).join(', ') + ". Additionnaly, an error was thrown: " + e);
              }
            }

            var baseAdapter = new adapters[adapterLabel](config);
            var newDataSource = new Proxy(baseAdapter, {
              get: function get(target, key) {
                // If this is an adapter action method, wrap it with filters. Our method keys are only string, not tags
                if (_.isString(key)) {
                  var method = key.match(/^(find|update|insert|delete)(Many|One)$/);

                  if (null !== method) {
                    method[2] = method[2].toLowerCase(); // Cast regex match to object like this: {full: 'findMany', query: 'find', number: 'many'}

                    method = _.mapKeys(method.slice(0, 3), function (val, key) {
                      return ['full', 'query', 'number'][key];
                    });
                    return wrapDataSourceAction(target[key], method, target);
                  }
                }

                return target[key];
              }
            });
            return newDataSource;
          },

          /**
           * Stores the data source with provided label.
           *
           * @author gerkin
           * @throws  {Error} Error is thrown if parameters are incorrect or the name is already used or `dataSource` is not an adapter.
           * @param   {string}          name       - Name associated with this datasource.
           * @param   {DiasporaAdapter} dataSource - Datasource itself.
           * @returns {undefined} This function does not return anything.
           */
          registerDataSource: function registerDataSource(name, dataSource) {
            var _$merge;

            requireName('DataSource', name);

            if (dataSources.hasOwnProperty(name)) {
              throw new Error("DataSource name already used, had \"" + name + "\"");
            }
            /*		if ( !( dataSource instanceof Diaspora.components.Adapters.Adapter )) {
            	throw new Error( 'DataSource must be an instance inheriting "DiasporaAdapter"' );
            }*/


            dataSource.name = name;

            _.merge(dataSources, (_$merge = {}, _$merge[name] = dataSource, _$merge));

            return dataSource;
          },

          /**
           * Create a data source (usually, a database connection) that may be used by models.
           *
           * @author gerkin
           * @throws  {Error} Thrown if provided `adapter` label does not correspond to any adapter registered.
           * @param   {string} sourceName   - Name associated with this datasource.
           * @param   {string} adapterLabel - Label of the adapter used to create the data source.
           * @param   {Object} configHash   - Configuration hash. This configuration hash depends on the adapter we want to use.
           * @returns {Adapters.DiasporaAdapter} New adapter spawned.
           */
          createNamedDataSource: function createNamedDataSource(sourceName, adapterLabel, configHash) {
            var dataSource = Diaspora.createDataSource(adapterLabel, configHash);
            return Diaspora.registerDataSource(sourceName, dataSource);
          },

          /**
           * Create a new Model with provided description.
           *
           * @author gerkin
           * @throws  {Error} Thrown if parameters are incorrect.
           * @param   {string} name      - Name associated with this datasource.
           * @param   {Object} modelDesc - Description of the model to define.
           * @returns {Model} Model created.
           */
          declareModel: function declareModel(name, modelDesc) {
            var _$assign2;

            if (!_.isString(name) && name.length > 0) {
              requireName('Model', name);
            }

            if (!_.isObject(modelDesc)) {
              throw new Error('"modelDesc" must be an object');
            }

            var model = new Diaspora.components.Model(name, modelDesc);

            _.assign(models, (_$assign2 = {}, _$assign2[name] = model, _$assign2));

            return model;
          },

          /**
           * Register a new adapter and make it available to use by models.
           *
           * @author gerkin
           * @throws  {Error} Thrown if an adapter already exists with same label.
           * @throws  {TypeError} Thrown if adapter does not extends {@link Adapters.DiasporaAdapter}.
           * @param   {string}                   label   - Label of the adapter to register.
           * @param   {Adapters.DiasporaAdapter} adapter - The adapter to register.
           * @returns {undefined} This function does not return anything.
           */
          registerAdapter: function registerAdapter(label, adapter) {
            if (adapters.hasOwnProperty(label)) {
              throw new Error("Adapter with label \"" + label + "\" already exists.");
            } // Check inheritance of adapter

            /*if ( !( adapter.prototype instanceof Diaspora.components.Adapters.Adapter )) {
            	throw new TypeError( `Trying to register an adapter with label "${ label }", but it does not extends DiasporaAdapter.` );
            }*/


            adapters[label] = adapter;
          },

          /**
           * Hash containing all available models.
           *
           * @type {Object}
           * @property {Model} * - Model associated with that name.
           * @memberof Diaspora
           * @public
           * @author gerkin
           * @see Use {@link Diaspora.declareModel} to add models.
           */
          models: models,

          /**
           * Hash containing all available data sources.
           *
           * @type {Object}
           * @property {Adapters.DiasporaAdapter} * - Instances of adapters declared.
           * @memberof Diaspora
           * @private
           * @author gerkin
           * @see Use {@link Diaspora.createNamedDataSource} or {@link Diaspora.registerDataSource} to make data sources available for models.
           */
          dataSources: dataSources,

          /**
           * Hash containing all available adapters. The only universal adapter is `inMemory`.
           *
           * @type {Object}
           * @property {Adapters.DiasporaAdapter}        *        - Adapter constructor. Those constructors must be subclasses of DiasporaAdapter.
           * @property {Adapters.InMemorDiasporaAdapter} inMemory - InMemoryDiasporaAdapter constructor.
           * @memberof Diaspora
           * @private
           * @author gerkin
           * @see Use {@link Diaspora.registerAdapter} to add adapters.
           */
          adapters: adapters,

          /**
           * Dependencies of Diaspora.
           *
           * @type {Object}
           * @property {Bluebird}        Promise          - Bluebird lib.
           * @property {Lodash}          _                - Lodash lib.
           * @property {SequentialEvent} sequential-event - SequentialEvent lib.
           * @memberof Diaspora
           * @private
           * @author gerkin
           */
          dependencies: dependencies,

          /**
           * Logger used by Diaspora and its adapters. You can use this property to configure winston. On brower environment, this is replaced by a reference to global {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/console Console}.
           *
           * @type {Winston|Console}
           * @memberof Diaspora
           * @public
           * @author gerkin
           */
          logger: logger
        };
        module.exports = Diaspora; // Load components after export, so requires of Diaspora returns a complete object

        /**
         * Hash of components exposed by Diaspora.
         *
         * @type {Object}
         * @memberof Diaspora
         * @private
         * @author gerkin
         */

        Diaspora.components = {
          Errors: {
            ExtendableError: require('./errors/extendableError'),
            ValidationError: require('./errors/validationError'),
            EntityValidationError: require('./errors/entityValidationError'),
            SetValidationError: require('./errors/setValidationError'),
            EntityStateError: require('./errors/entityStateError')
          }
        };

        _.assign(Diaspora.components, {
          Adapters: {
            Adapter: require('./adapters/base/adapter'),
            Entity: require('./adapters/base/entity')
          }
        });

        _.assign(Diaspora.components, {
          Model: require('./model'),
          EntityFactory: require('./entityFactory'),
          Entity: require('./entityFactory').Entity,
          Set: require('./set'),
          Validator: require('./validator'),
          Utils: require('./utils')
        }); // Register available built-in adapters


        Diaspora.registerAdapter('inMemory', require('./adapters/inMemory/adapter'));
        Diaspora.registerAdapter('webApi', require('./adapters/webApi/adapter')); // Register webStorage only if in browser

        if (process.browser) {
          Diaspora.registerAdapter('webStorage', require('./adapters/webStorage/adapter'));
        }
      }).call(this, require('_process'));
    }, {
      "./adapters/base/adapter": 3,
      "./adapters/base/entity": 4,
      "./adapters/inMemory/adapter": 5,
      "./adapters/webApi/adapter": 7,
      "./adapters/webStorage/adapter": 9,
      "./dependencies": 11,
      "./entityFactory": 13,
      "./errors/entityStateError": 14,
      "./errors/entityValidationError": 15,
      "./errors/extendableError": 16,
      "./errors/setValidationError": 17,
      "./errors/validationError": 18,
      "./model": 19,
      "./set": 20,
      "./utils": 21,
      "./validator": 22,
      "_process": 24,
      "winston": undefined
    }],
    13: [function (require, module, exports) {
      'use strict';

      var _require8 = require('./dependencies'),
          _ = _require8._,
          Promise = _require8.Promise,
          SequentialEvent = _require8.SequentialEvent;

      var Diaspora = require('./diaspora');

      var DataStoreEntity = Diaspora.components.Adapters.Entity;

      var EntityStateError = require('./errors/entityStateError');
      /**
       * @module EntityFactory
       */


      var DEFAULT_OPTIONS = {
        skipEvents: false
      };
      var PRIVATE = Symbol('PRIVATE');

      var maybeEmit = function maybeEmit(entity, options, eventsArgs, events) {
        events = _.castArray(events);

        if (options.skipEvents) {
          return Promise.resolve(entity);
        } else {
          return entity.emit.apply(entity, [events[0]].concat(eventsArgs)).then(function () {
            if (events.length > 1) {
              return maybeEmit(entity, options, eventsArgs, _.slice(events, 1));
            } else {
              return Promise.resolve(entity);
            }
          });
        }
      };

      var maybeThrowInvalidEntityState = function maybeThrowInvalidEntityState(entity, beforeState, dataSource, method) {
        return function () {
          // Depending on state, we are going to perform a different operation
          if ('orphan' === beforeState) {
            return Promise.reject(new EntityStateError('Can\'t fetch an orphan entity.'));
          } else {
            entity[PRIVATE].lastDataSource = dataSource.name;
            return dataSource[method](entity.table(dataSource.name), entity.uidQuery(dataSource));
          }
        };
      };

      var entityCtrSteps = {
        castTypes: function castTypes(source, modelDesc) {
          var attrs = modelDesc.attributes;

          _.forEach(source, function (currentVal, attrName) {
            var attrDesc = attrs[attrName];

            if (_.isObject(attrDesc)) {
              switch (attrDesc.type) {
                case 'date':
                  {
                    if (_.isString(currentVal) || _.isInteger(currentVal)) {
                      source[attrName] = new Date(currentVal);
                    }
                  }
                  break;
              }
            }
          });

          return source;
        },
        loadSource: function loadSource(entity, source) {
          // If we construct our Entity from a datastore entity (that can happen internally in Diaspora), set it to `sync` state
          if (source instanceof DataStoreEntity) {
            var _entity = entity[PRIVATE];

            _.assign(_entity, {
              state: 'sync',
              lastDataSource: source.dataSource.name
            });

            _entity.dataSources[_entity.lastDataSource] = source;
            source = entity.deserialize(_.omit(source.toObject(), ['id']));
          }

          return source;
        },
        bindLifecycleEvents: function bindLifecycleEvents(entity, modelDesc) {
          // Bind lifecycle events
          _.forEach(modelDesc.lifecycleEvents, function (eventFunctions, eventName) {
            // Iterate on each event functions. `_.castArray` will ensure we iterate on an array if a single function is provided.
            _.forEach(_.castArray(eventFunctions), function (eventFunction) {
              entity.on(eventName, eventFunction);
            });
          });
        }
      };
      /**
       * The entity is the class you use to manage a single document in all data sources managed by your model.
       * > Note that this class is proxied: you may try to access to undocumented class properties to get entity's data attributes
       *
       * @extends SequentialEvent
       */

      var Entity =
      /*#__PURE__*/
      function (_SequentialEvent2) {
        _inheritsLoose(Entity, _SequentialEvent2);

        /**
         * Create a new entity.
         *
         * @author gerkin
         * @param {string}                                   name        - Name of this model.
         * @param {ModelDescription}                         modelDesc   - Model configuration that generated the associated `model`.
         * @param {Model}                                    model       - Model that will spawn entities.
         * @param {Object|DataStoreEntities.DataStoreEntity} [source={}] - Hash with properties to copy on the new object.
         *        If provided object inherits DataStoreEntity, the constructed entity is built in `sync` state.
         */
        function Entity(name, modelDesc, model, source) {
          var _this19;

          if (source === void 0) {
            source = {};
          }

          var modelAttrsKeys = _.keys(modelDesc.attributes);

          _this19 = _SequentialEvent2.call(this) || this; // ### Init defaults

          var dataSources = Object.seal(_.mapValues(model.dataSources, function () {
            return undefined;
          }));
          var _this = {
            state: 'orphan',
            lastDataSource: null,
            dataSources: dataSources,
            name: name,
            modelDesc: modelDesc,
            model: model
          };
          _this19[PRIVATE] = _this; // ### Cast types if required

          source = entityCtrSteps.castTypes(source, modelDesc); // ### Load datas from source

          source = entityCtrSteps.loadSource(_assertThisInitialized(_this19), source); // ### Final validation
          // Check keys provided in source

          var sourceDModel = _.difference(source, modelAttrsKeys);

          if (0 !== sourceDModel.length) {
            // Later, add a criteria for schemaless models
            throw new Error("Source has unknown keys: " + JSON.stringify(sourceDModel) + " in " + JSON.stringify(source));
          } // ### Generate prototype & attributes
          // Now we know that the source is valid. Deep clone to detach object values from entity then Default model attributes with our model desc


          _this.attributes = Diaspora.default(_.cloneDeep(source), modelDesc.attributes);
          source = null; // ### Load events

          entityCtrSteps.bindLifecycleEvents(_assertThisInitialized(_this19), modelDesc);
          return _this19;
        }
        /**
         * Generate the query to get this unique entity in the desired data source.
         *
         * @author gerkin
         * @param   {Adapters.DiasporaAdapter} dataSource - Name of the data source to get query for.
         * @returns {Object} Query to find this entity.
         */


        var _proto6 = Entity.prototype;

        _proto6.uidQuery = function uidQuery(dataSource) {
          return {
            id: this[PRIVATE].attributes.idHash[dataSource.name]
          };
        };
        /**
         * Return the table of this entity in the specified data source.
         *
         * @author gerkin
         * @returns {string} Name of the table.
         */


        _proto6.table = function table()
        /*sourceName*/
        {
          // Will be used later
          return this[PRIVATE].name;
        };
        /**
         * Check if the entity matches model description.
         *
         * @author gerkin
         * @throws EntityValidationError Thrown if validation failed. This breaks event chain and prevent persistance.
         * @returns {undefined} This function does not return anything.
         * @see Validator.Validator#validate
         */


        _proto6.validate = function validate() {
          this.constructor.model.validator.validate(this[PRIVATE].attributes);
        };
        /**
         * Remove all editable properties & replace them with provided object.
         *
         * @author gerkin
         * @param   {Object} [newContent={}] - Replacement content.
         * @returns {module:EntityFactory~Entity} Returns `this`.
         */


        _proto6.replaceAttributes = function replaceAttributes(newContent) {
          if (newContent === void 0) {
            newContent = {};
          }

          newContent.idHash = this[PRIVATE].attributes.idHash;
          this[PRIVATE].attributes = newContent;
          return this;
        };
        /**
         * Generate a diff update query by checking deltas with last source interaction.
         *
         * @author gerkin
         * @param   {Adapters.DiasporaAdapter} dataSource - Data source to diff with.
         * @returns {Object} Diff query.
         */


        _proto6.getDiff = function getDiff(dataSource) {
          var _this20 = this;

          var dataStoreEntity = this[PRIVATE].dataSources[dataSource.name];
          var dataStoreObject = dataStoreEntity.toObject();

          var keys = _(this[PRIVATE].attributes).keys().concat(_.keys(dataStoreObject)).uniq().difference(['idHash']).value();

          var values = _.map(keys, function (key) {
            return _this20[PRIVATE].attributes[key];
          });

          var diff = _.omitBy(_.zipObject(keys, values), function (val, key) {
            return _.isEqual(_this20[PRIVATE].attributes[key], dataStoreObject[key]);
          });

          return diff;
        };
        /**
         * Returns a copy of this entity attributes.
         *
         * @author gerkin
         * @returns {Object} Attributes of this entity.
         */


        _proto6.toObject = function toObject() {
          return this[PRIVATE].attributes;
        };
        /**
         * Applied before persisting the entity, this function is in charge to convert entity convinient attributes to a raw entity.
         *
         * @author gerkin
         * @param   {Object} data - Data to convert to primitive types.
         * @returns {Object} Object with Primitives-only types.
         */


        _proto6.serialize = function serialize(data) {
          return _.cloneDeep(data);
        };
        /**
         * Applied after retrieving the entity, this function is in charge to convert entity raw attributes to convinient types.
         *
         * @author gerkin
         * @param   {Object} data - Data to convert from primitive types.
         * @returns {Object} Object with Primitives & non primitives types.
         */


        _proto6.deserialize = function deserialize(data) {
          return _.cloneDeep(data);
        };
        /**
         * Save this entity in specified data source.
         *
         * @fires EntityFactory.Entity#beforeUpdate
         * @fires EntityFactory.Entity#afterUpdate
         * @author gerkin
         * @param   {string}  sourceName                 - Name of the data source to persist entity in.
         * @param   {Object}  [options]                  - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
         * @param   {boolean} [options.skipEvents=false] - If true, won't trigger events `beforeUpdate` and `afterUpdate`.
         * @returns {Promise} Promise resolved once entity is saved. Resolved with `this`.
         */


        _proto6.persist = function persist(sourceName, options) {
          var _this21 = this;

          if (options === void 0) {
            options = {};
          }

          _.defaults(options, DEFAULT_OPTIONS); // Change the state of the entity


          var beforeState = this[PRIVATE].state;
          this[PRIVATE].state = 'syncing'; // Generate events args

          var dataSource = this.constructor.model.getDataSource(sourceName);
          var eventsArgs = [dataSource.name];

          var _maybeEmit = _.partial(maybeEmit, this, options, eventsArgs); // Get suffix. If entity was orphan, we are creating. Otherwise, we are updating


          var suffix = 'orphan' === beforeState ? 'Create' : 'Update';
          return _maybeEmit(['beforePersist', 'beforeValidate']).then(function () {
            return _this21.validate();
          }).then(function () {
            return _maybeEmit(['afterValidate', "beforePersist" + suffix]);
          }).then(function () {
            _this21[PRIVATE].lastDataSource = dataSource.name; // Depending on state, we are going to perform a different operation

            if ('orphan' === beforeState) {
              return dataSource.insertOne(_this21.table(sourceName), _this21.toObject());
            } else {
              return dataSource.updateOne(_this21.table(sourceName), _this21.uidQuery(dataSource), _this21.getDiff(dataSource));
            }
          }).then(function (dataStoreEntity) {
            entityCtrSteps.castTypes(dataStoreEntity, _this21[PRIVATE].modelDesc);
            _this21[PRIVATE].state = 'sync';
            _this21[PRIVATE].attributes = dataStoreEntity.toObject();
            _this21[PRIVATE].dataSources[dataSource.name] = dataStoreEntity;
            return _maybeEmit(["afterPersist" + suffix, 'afterPersist']);
          });
        };
        /**
         * Reload this entity from specified data source.
         *
         * @fires EntityFactory.Entity#beforeFind
         * @fires EntityFactory.Entity#afterFind
         * @author gerkin
         * @param   {string}  sourceName                 - Name of the data source to fetch entity from.
         * @param   {Object}  [options]                  - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
         * @param   {boolean} [options.skipEvents=false] - If true, won't trigger events `beforeFind` and `afterFind`.
         * @returns {Promise} Promise resolved once entity is reloaded. Resolved with `this`.
         */


        _proto6.fetch = function fetch(sourceName, options) {
          var _this22 = this;

          if (options === void 0) {
            options = {};
          }

          _.defaults(options, DEFAULT_OPTIONS); // Change the state of the entity


          var beforeState = this[PRIVATE].state;
          this[PRIVATE].state = 'syncing'; // Generate events args

          var dataSource = this.constructor.model.getDataSource(sourceName);
          var eventsArgs = [dataSource.name, this.serialize(this[PRIVATE].attributes)];

          var _maybeEmit = _.partial(maybeEmit, this, options, eventsArgs);

          return _maybeEmit('beforeFetch').then(maybeThrowInvalidEntityState(this, beforeState, dataSource, 'findOne')).then(function (dataStoreEntity) {
            entityCtrSteps.castTypes(dataStoreEntity, _this22[PRIVATE].modelDesc);
            _this22[PRIVATE].state = 'sync';
            _this22[PRIVATE].attributes = dataStoreEntity.toObject();
            _this22[PRIVATE].dataSources[dataSource.name] = dataStoreEntity;
            return _maybeEmit('afterFetch');
          });
        };
        /**
         * Delete this entity from the specified data source.
         *
         * @fires EntityFactory.Entity#beforeDelete
         * @fires EntityFactory.Entity#afterDelete
         * @author gerkin
         * @param   {string}  sourceName                 - Name of the data source to delete entity from.
         * @param   {Object}  [options]                  - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
         * @param   {boolean} [options.skipEvents=false] - If true, won't trigger events `beforeDelete` and `afterDelete`.
         * @returns {Promise} Promise resolved once entity is destroyed. Resolved with `this`.
         */


        _proto6.destroy = function destroy(sourceName, options) {
          var _this23 = this;

          if (options === void 0) {
            options = {};
          }

          _.defaults(options, DEFAULT_OPTIONS); // Change the state of the entity


          var beforeState = this[PRIVATE].state;
          this[PRIVATE].state = 'syncing'; // Generate events args

          var dataSource = this.constructor.model.getDataSource(sourceName);
          var eventsArgs = [dataSource.name];

          var _maybeEmit = _.partial(maybeEmit, this, options, eventsArgs);

          return _maybeEmit('beforeDestroy').then(maybeThrowInvalidEntityState(this, beforeState, dataSource, 'deleteOne')).then(function () {
            // If this was our only data source, then go back to orphan state
            if (0 === _.without(_this23[PRIVATE].model.dataSources, dataSource.name).length) {
              _this23[PRIVATE].state = 'orphan';
            } else {
              _this23[PRIVATE].state = 'sync';
              delete _this23[PRIVATE].attributes.idHash[dataSource.name];
            }

            _this23[PRIVATE].dataSources[dataSource.name] = undefined;
            return _maybeEmit('afterDestroy');
          });
        };
        /**
         * Get the ID for the given source name.
         * 
         * @param   {string} sourceName - Name of the source to get ID from.
         * @returns {string} Id of this entity in requested data source.
         */


        _proto6.getId = function getId(sourceName) {
          var dataSource = this.constructor.model.getDataSource(sourceName);
          return this[PRIVATE].dataSources[dataSource.name].id;
        };
        /**
         * Hash that links each data source with its name. This object is prepared with keys from model sources, and sealed.
         *
         * @type {Object}
         * @author gerkin
         */


        _createClass(Entity, [{
          key: "dataSources",
          get: function get() {
            return this[PRIVATE].dataSources;
          }
          /**
           * TODO.
           *
           * @type {TODO}
           * @author gerkin
           */

        }, {
          key: "attributes",
          get: function get() {
            return this[PRIVATE].attributes;
          }
          /**
           * Get entity's current state.
           *
           * @type {Entity.State}
           * @author gerkin
           */

        }, {
          key: "state",
          get: function get() {
            return this[PRIVATE].state;
          }
          /**
           * Get entity's last data source.
           *
           * @type {null|string}
           * @author gerkin
           */

        }, {
          key: "lastDataSource",
          get: function get() {
            return this[PRIVATE].lastDataSource;
          }
        }]);

        return Entity;
      }(SequentialEvent);
      /**
       * This factory function generate a new class constructor, prepared for a specific model.
       *
       * @method EntityFactory
       * @public
       * @static
       * @param   {string}           name       - Name of this model.
       * @param   {ModelDescription} modelDesc  - Model configuration that generated the associated `model`.
       * @param   {Model}            model      - Model that will spawn entities.
       * @returns {module:EntityFactory~Entity} Entity constructor to use with this model.
       * @property {module:EntityFactory~Entity} Entity Entity constructor
       */


      var EntityFactory = function EntityFactory(name, modelDesc, model) {
        /**
         * @ignore
         */
        var SubEntity =
        /*#__PURE__*/
        function (_Entity) {
          _inheritsLoose(SubEntity, _Entity);

          function SubEntity() {
            return _Entity.apply(this, arguments) || this;
          }

          _createClass(SubEntity, null, [{
            key: "name",

            /**
             * Name of the class.
             *
             * @type {string}
             * @author gerkin
             */
            get: function get() {
              return name + "Entity";
            }
            /**
             * Reference to this entity's model.
             *
             * @type {Model}
             * @author gerkin
             */

          }, {
            key: "model",
            get: function get() {
              return model;
            }
          }]);

          return SubEntity;
        }(Entity); // We use keys `methods` and not `functions` as explained in this [StackOverflow thread](https://stackoverflow.com/a/155655/4839162).
        // Extend prototype with methods in our model description


        _.forEach(modelDesc.methods, function (method, methodName) {
          SubEntity.prototype[methodName] = method;
        }); // Add static methods


        _.forEach(modelDesc.staticMethods, function (staticMethodName, staticMethod) {
          SubEntity[staticMethodName] = staticMethod;
        });

        return SubEntity.bind(SubEntity, name, modelDesc, model);
      };

      EntityFactory.Entity = Entity; // =====
      // ## Lifecycle Events
      // -----
      // ### Persist

      /**
       * @event EntityFactory.Entity#beforePersist
       * @type {String}
       */

      /**
       * @event EntityFactory.Entity#beforeValidate
       * @type {String}
       */

      /**
       * @event EntityFactory.Entity#afterValidate
       * @type {String}
       */

      /**
       * @event EntityFactory.Entity#beforePersistCreate
       * @type {String}
       */

      /**
       * @event EntityFactory.Entity#beforePersistUpdate
       * @type {String}
       */

      /**
       * @event EntityFactory.Entity#afterPersistCreate
       * @type {String}
       */

      /**
       * @event EntityFactory.Entity#afterPersistUpdate
       * @type {String}
       */

      /**
       * @event EntityFactory.Entity#afterPersist
       * @type {String}
       */
      // -----
      // ### Find

      /**
       * @event EntityFactory.Entity#beforeFind
       * @type {String}
       */

      /**
       * @event EntityFactory.Entity#afterFind
       * @type {String}
       */
      // -----
      // ### Destroy

      /**
       * @event EntityFactory.Entity#beforeDestroy
       * @type {String}
       */

      /**
       * @event EntityFactory.Entity#afterDestroy
       * @type {String}
       */

      module.exports = EntityFactory;
    }, {
      "./dependencies": 11,
      "./diaspora": 12,
      "./errors/entityStateError": 14
    }],
    14: [function (require, module, exports) {
      'use strict';

      var ExtendableError = require('./extendableError');
      /**
       * @module Errors/EntityStateError
       */

      /**
       * This class represents an error related to validation.
       * @extends module:Errors/ExtendableError~ExtendableError
       */


      var EntityStateError =
      /*#__PURE__*/
      function (_ExtendableError) {
        _inheritsLoose(EntityStateError, _ExtendableError);

        /**
         * Construct a new error related to an invalide state of the entity.
         * 
         * @author gerkin
         * @param {*}      errorArgs        - Arguments to transfer to parent Error.
         */
        function EntityStateError() {
          for (var _len2 = arguments.length, errorArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            errorArgs[_key2] = arguments[_key2];
          }

          return _ExtendableError.call.apply(_ExtendableError, [this].concat(errorArgs)) || this;
        }

        return EntityStateError;
      }(ExtendableError);

      module.exports = EntityStateError;
    }, {
      "./extendableError": 16
    }],
    15: [function (require, module, exports) {
      'use strict';

      var _require9 = require('../dependencies'),
          _ = _require9._;

      var ValidationError = require('./validationError');

      var stringifyValidationObject = function stringifyValidationObject(validationErrors) {
        return _(validationErrors).mapValues(function (error, key) {
          return key + " => " + JSON.stringify(error.value) + "\n* " + _(error).omit(['value']).values().map(_.identity).value();
        }).values().join('\n* ');
      };
      /**
       * @module Errors/EntityValidationError
       */

      /**
       * This class represents an error related to validation on an entity.
       *
       * @extends module:Errors/ValidationError~ValidationError
       */


      var EntityValidationError =
      /*#__PURE__*/
      function (_ValidationError) {
        _inheritsLoose(EntityValidationError, _ValidationError);

        /**
         * Construct a new validation error.
         *
         * @author gerkin
         * @param {Object} validationErrors - Object describing validation errors, usually returned by {@link Diaspora.Check}.
         * @param {string} message          - Message of this error.
         * @param {*}      errorArgs        - Arguments to transfer to parent Error.
         */
        function EntityValidationError(validationErrors, message) {
          var _this24;

          message += "\n" + stringifyValidationObject(validationErrors);

          for (var _len3 = arguments.length, errorArgs = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
            errorArgs[_key3 - 2] = arguments[_key3];
          }

          _this24 = _ValidationError.call.apply(_ValidationError, [this, message].concat(errorArgs)) || this;
          _this24.validationErrors = validationErrors;
          return _this24;
        }

        return EntityValidationError;
      }(ValidationError);

      module.exports = EntityValidationError;
    }, {
      "../dependencies": 11,
      "./validationError": 18
    }],
    16: [function (require, module, exports) {
      'use strict';
      /**
       * @module Errors/ExtendableError
       */

      /**
       * This class is the base class for custom Diaspora errors
       *
       * @extends Error
       */

      var ExtendableError =
      /*#__PURE__*/
      function (_extendableBuiltin2) {
        _inheritsLoose(ExtendableError, _extendableBuiltin2);

        /**
         * Construct a new extendable error.
         *
         * @author gerkin
         * @param {string} message          - Message of this error.
         * @param {*}      errorArgs        - Arguments to transfer to parent Error.
         */
        function ExtendableError(message) {
          var _this25;

          for (var _len4 = arguments.length, errorArgs = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
            errorArgs[_key4 - 1] = arguments[_key4];
          }

          _this25 = _extendableBuiltin2.call.apply(_extendableBuiltin2, [this, message].concat(errorArgs)) || this;
          _this25.name = _this25.constructor.name;
          _this25.message = message;

          if ('function' === typeof Error.captureStackTrace) {
            Error.captureStackTrace(_assertThisInitialized(_this25), _this25.constructor);
          } else {
            _this25.stack = new Error(message).stack;
          }

          return _this25;
        }

        return ExtendableError;
      }(_extendableBuiltin(Error));

      module.exports = ExtendableError;
    }, {}],
    17: [function (require, module, exports) {
      'use strict';

      var _require10 = require('../dependencies'),
          _ = _require10._;

      var ValidationError = require('./validationError');
      /**
       * @module Errors/SetValidationError
       */

      /**
       * This class represents an error related to validation on a set.
       *
       * @extends module:Errors/ValidationError~ValidationError
       */


      var SetValidationError =
      /*#__PURE__*/
      function (_ValidationError2) {
        _inheritsLoose(SetValidationError, _ValidationError2);

        /**
         * Construct a new validation error.
         *
         * @author gerkin
         * @see Diaspora.check
         * @param {string}                                                      message          - Message of this error.
         * @param {module:Errors/EntityValidationError~EntityValidationError[]} validationErrors - Array of validation errors.
         * @param {*}                                                           errorArgs        - Arguments to transfer to parent Error.
         */
        function SetValidationError(message, validationErrors) {
          var _this26;

          message += "[\n" + _(validationErrors).map(function (error, index) {
            if (_.isNil(error)) {
              return false;
            } else {
              return index + ": " + error.message.replace(/\n/g, '\n	');
            }
          }).filter(_.identity).join(',\n') + "\n]";

          for (var _len5 = arguments.length, errorArgs = new Array(_len5 > 2 ? _len5 - 2 : 0), _key5 = 2; _key5 < _len5; _key5++) {
            errorArgs[_key5 - 2] = arguments[_key5];
          }

          _this26 = _ValidationError2.call.apply(_ValidationError2, [this, message].concat(errorArgs)) || this;
          _this26.validationErrors = validationErrors;
          return _this26;
        }

        return SetValidationError;
      }(ValidationError);

      module.exports = SetValidationError;
    }, {
      "../dependencies": 11,
      "./validationError": 18
    }],
    18: [function (require, module, exports) {
      'use strict';

      var ExtendableError = require('./extendableError');
      /**
       * This class represents an error related to validation.
       *
       * @extends module:Errors/ExtendableError~ExtendableError
       */


      var ValidationError =
      /*#__PURE__*/
      function (_ExtendableError2) {
        _inheritsLoose(ValidationError, _ExtendableError2);

        function ValidationError() {
          return _ExtendableError2.apply(this, arguments) || this;
        }

        return ValidationError;
      }(ExtendableError);

      module.exports = ValidationError;
    }, {
      "./extendableError": 16
    }],
    19: [function (require, module, exports) {
      'use strict';

      var _require11 = require('./dependencies'),
          _ = _require11._,
          Promise = _require11.Promise;

      var EntityFactory = require('./entityFactory');

      var Diaspora = require('./diaspora');

      var Set = require('./set');

      var Validator = require('./validator');

      var entityPrototypeProperties = EntityFactory.entityPrototypeProperties;
      /**
       * @module Model
       */

      /**
       * Object describing a model.
       *
       * @typedef  {Object} ModelConfiguration.ModelDescription
       * @author gerkin
       * @property {ModelConfiguration.SourcesDescriptor}    sources         - List of sources to use with this model.
       * @property {ModelConfiguration.AttributesDescriptor} attributes      - Attributes of the model.
       * @property {Object<string, Function>}                methods         - Methods to add to entities prototype.
       * @property {Object<string, Function>}                staticMethods   - Static methods to add to entities.
       * @property {Object<string, Function|Function[]>}     lifecycleEvents - Events to bind on entities.
       */

      var findArgs = function findArgs(model, queryFind, options, dataSourceName) {
        if (queryFind === void 0) {
          queryFind = {};
        }

        if (options === void 0) {
          options = {};
        }

        var ret;

        if (_.isString(options) && _.isNil(dataSourceName)) {
          ret = {
            dataSourceName: options,
            options: {}
          };
        } else if (_.isString(queryFind) && _.isNil(options) && _.isNil(dataSourceName)) {
          ret = {
            dataSourceName: queryFind,
            queryFind: {},
            options: {}
          };
        } else {
          ret = {
            queryFind: queryFind,
            options: options,
            dataSourceName: dataSourceName
          };
        }

        ret.dataSource = model.getDataSource(ret.dataSourceName);
        return ret;
      };

      var makeSet = function makeSet(model) {
        return function (dataSourceEntities) {
          var newEntities = _.map(dataSourceEntities, function (dataSourceEntity) {
            return new model.entityFactory(dataSourceEntity);
          });

          var set = new Set(model, newEntities);
          return Promise.resolve(set);
        };
      };

      var makeEntity = function makeEntity(model) {
        return function (dataSourceEntity) {
          if (_.isNil(dataSourceEntity)) {
            return Promise.resolve();
          }

          var newEntity = new model.entityFactory(dataSourceEntity);
          return Promise.resolve(newEntity);
        };
      };

      var doDelete = function doDelete(methodName, model) {
        return function (queryFind, options, dataSourceName) {
          if (queryFind === void 0) {
            queryFind = {};
          }

          if (options === void 0) {
            options = {};
          }

          // Sort arguments
          var args = findArgs(model, queryFind, options, dataSourceName);
          return args.dataSource[methodName](model.name, args.queryFind, args.options);
        };
      };

      var doFindUpdate = function doFindUpdate(model, plural, queryFind, options, dataSourceName, update) {
        var _queryComponents$data;

        // Sort arguments
        var queryComponents = findArgs(model, queryFind, options, dataSourceName);

        var args = _([model.name, queryComponents.queryFind]).push(update).push(queryComponents.options).compact().value();

        return (_queryComponents$data = queryComponents.dataSource)[(update ? 'update' : 'find') + (plural ? 'Many' : 'One')].apply(_queryComponents$data, args).then((plural ? makeSet : makeEntity)(model));
      };

      var normalizeRemaps = function normalizeRemaps(modelDesc) {
        var sources = modelDesc.sources;

        if (_.isString(sources)) {
          var _sources;

          sources = (_sources = {}, _sources[modelDesc.sources] = true, _sources);
        } else if (_.isArrayLike(sources)) {
          sources = _.zipObject(sources, _.times(sources.length, _.constant({})));
        } else {
          sources = _.mapValues(sources, function (remap, dataSourceName) {
            if (true === remap) {
              return {};
            } else if (_.isObject(remap)) {
              return remap;
            } else {
              throw new TypeError("Datasource \"" + dataSourceName + "\" value is invalid: expect `true` or a remap hash, but have " + JSON.stringify(remap));
            }
          });
        }

        return sources;
      };
      /**
       * The model class is used to interact with the population of all data of the same type.
       */


      var Model =
      /*#__PURE__*/
      function () {
        /**
         * Create a new Model that is allowed to interact with all entities of data sources tables selected.
         *
         * @author gerkin
         * @param {string}                              name      - Name of the model.
         * @param {ModelConfiguration.ModelDescription} modelDesc - Hash representing the configuration of the model.
         */
        function Model(name, modelDesc) {
          // Check model configuration
          var reservedPropIntersect = _.intersection(entityPrototypeProperties, _.keys(modelDesc.attributes));

          if (0 !== reservedPropIntersect.length) {
            throw new Error(JSON.stringify(reservedPropIntersect) + " is/are reserved property names. To match those column names in data source, please use the data source mapper property");
          } else if (!modelDesc.hasOwnProperty('sources') || !(_.isArrayLike(modelDesc.sources) || _.isObject(modelDesc.sources) || _.isString(modelDesc.sources))) {
            throw new TypeError("Expect model sources to be either a string, an array or an object, had " + JSON.stringify(modelDesc.sources) + ".");
          } // Normalize our sources: normalized form is an object with keys corresponding to source name, and key corresponding to remaps


          var sourcesNormalized = normalizeRemaps(modelDesc); // List sources required by this model

          var sourceNames = _.keys(sourcesNormalized);

          var modelSources = _.pick(Diaspora.dataSources, sourceNames);

          var missingSources = _.difference(sourceNames, _.keys(modelSources));

          if (0 !== missingSources.length) {
            throw new Error("Missing data sources " + missingSources.map(function (v) {
              return "\"" + v + "\"";
            }).join(', '));
          }

          if (!_.isObject(modelDesc.attributes)) {
            throw new TypeError("Model attributes should be an object, have " + JSON.stringify(modelDesc.attributes));
          } // Now, we are sure that config is valid. We can configure our datasources with model options, and set `this` properties.


          _.forEach(sourcesNormalized, function (remap, sourceName) {
            return modelSources[sourceName].configureCollection(name, remap);
          });

          _.assign(this, {
            dataSources: modelSources,
            defaultDataSource: _(modelSources).keys().first(),
            name: name,
            entityFactory: EntityFactory(name, modelDesc, this),
            validator: new Validator(modelDesc.attributes)
          });
        }
        /**
         * Create a new Model that is allowed to interact with all entities of data sources tables selected.
         *
         * @author gerkin
         * @throws  {Error} Thrown if requested source name does not exists.
         * @param   {string} [sourceName=Model.defaultDataSource] - Name of the source to get. It corresponds to one of the sources you set in {@link Model#modelDesc}.Sources.
         * @returns {Adapters.DiasporaAdapter} Source adapter with requested name.
         */


        var _proto7 = Model.prototype;

        _proto7.getDataSource = function getDataSource(sourceName) {
          if (_.isNil(sourceName)) {
            sourceName = this.defaultDataSource;
          } else if (!this.dataSources.hasOwnProperty(sourceName)) {
            throw new Error("Unknown data source \"" + sourceName + "\" in model \"" + this.name + "\", available are " + _.keys(this.dataSources).map(function (v) {
              return "\"" + v + "\"";
            }).join(', '));
          }

          return this.dataSources[sourceName];
        };
        /**
         * Create a new *orphan* {@link Entity entity}.
         *
         * @author gerkin
         * @param   {Object} source - Object to copy attributes from.
         * @returns {Entity} New *orphan* entity.
         */


        _proto7.spawn = function spawn(source) {
          var newEntity = new this.entityFactory(source);
          return newEntity;
        };
        /**
         * Create multiple new *orphan* {@link Entity entities}.
         *
         * @author gerkin
         * @param   {Object[]} sources - Array of objects to copy attributes from.
         * @returns {Set} Set with new *orphan* entities.
         */


        _proto7.spawnMany = function spawnMany(sources) {
          var _this27 = this;

          return new Set(this, _.map(sources, function (source) {
            return _this27.spawn(source);
          }));
        };
        /**
         * Insert a raw source object in the data store.
         *
         * @author gerkin
         * @param   {Object} source                                   - Object to copy attributes from.
         * @param   {string} [dataSourceName=Model.defaultDataSource] - Name of the data source to insert in.
         * @returns {Promise} Promise resolved with new *sync* {@link Entity entity}.
         */


        _proto7.insert = function insert(source, dataSourceName) {
          var _this28 = this;

          var dataSource = this.getDataSource(dataSourceName);
          return dataSource.insertOne(this.name, source).then(function (entity) {
            return Promise.resolve(new _this28.entityFactory(entity));
          });
        };
        /**
         * Insert multiple raw source objects in the data store.
         *
         * @author gerkin
         * @param   {Object[]} sources                                  - Array of object to copy attributes from.
         * @param   {string}   [dataSourceName=Model.defaultDataSource] - Name of the data source to insert in.
         * @returns {Promise} Promise resolved with a {@link Set set} containing new *sync* entities.
         */


        _proto7.insertMany = function insertMany(sources, dataSourceName) {
          var dataSource = this.getDataSource(dataSourceName);
          return dataSource.insertMany(this.name, sources).then(makeSet(this));
        };
        /**
         * Retrieve a single entity from specified data source that matches provided `queryFind` and `options`.
         *
         * @author gerkin
         * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entity.
         * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
         * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entity from.
         * @returns {Promise} Promise resolved with the found {@link Entity entity} in *sync* state.
         */


        _proto7.find = function find(queryFind, options, dataSourceName) {
          return doFindUpdate(this, false, queryFind, options, dataSourceName);
        };
        /**
         * Retrieve multiple entities from specified data source that matches provided `queryFind` and `options`.
         *
         * @author gerkin
         * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entities.
         * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
         * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entities from.
         * @returns {Promise} Promise resolved with a {@link Set set} of found entities in *sync* state.
         */


        _proto7.findMany = function findMany(queryFind, options, dataSourceName) {
          return doFindUpdate(this, true, queryFind, options, dataSourceName);
        };
        /**
         * Update a single entity from specified data source that matches provided `queryFind` and `options`.
         *
         * @author gerkin
         * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entity.
         * @param   {Object}                               update                                   - Attributes to update on matched set.
         * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
         * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entity from.
         * @returns {Promise} Promise resolved with the updated {@link Entity entity} in *sync* state.
         */


        _proto7.update = function update(queryFind, _update, options, dataSourceName) {
          if (options === void 0) {
            options = {};
          }

          return doFindUpdate(this, false, queryFind, options, dataSourceName, _update);
        };
        /**
         * Update multiple entities from specified data source that matches provided `queryFind` and `options`.
         *
         * @author gerkin
         * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entities.
         * @param   {Object}                               update                                   - Attributes to update on matched set.
         * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
         * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entities from.
         * @returns {Promise} Promise resolved with the {@link Set set} of found entities in *sync* state.
         */


        _proto7.updateMany = function updateMany(queryFind, update, options, dataSourceName) {
          if (options === void 0) {
            options = {};
          }

          return doFindUpdate(this, true, queryFind, options, dataSourceName, update);
        };
        /**
         * Delete a single entity from specified data source that matches provided `queryFind` and `options`.
         *
         * @author gerkin
         * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind]                           - Query to get desired entity.
         * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
         * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entity from.
         * @returns {Promise} Promise resolved with `undefined`.
         */


        _proto7.delete = function _delete(queryFind, options, dataSourceName) {
          if (options === void 0) {
            options = {};
          }

          return doDelete('deleteOne', this)(queryFind, options, dataSourceName);
        };
        /**
         * Delete multiple entities from specified data source that matches provided `queryFind` and `options`.
         *
         * @author gerkin
         * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entities.
         * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
         * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entities from.
         * @returns {Promise} Promise resolved with `undefined`.
         */


        _proto7.deleteMany = function deleteMany(queryFind, options, dataSourceName) {
          if (queryFind === void 0) {
            queryFind = {};
          }

          if (options === void 0) {
            options = {};
          }

          return doDelete('deleteMany', this)(queryFind, options, dataSourceName);
        };

        return Model;
      }();

      module.exports = Model;
    }, {
      "./dependencies": 11,
      "./diaspora": 12,
      "./entityFactory": 13,
      "./set": 20,
      "./validator": 22
    }],
    20: [function (require, module, exports) {
      'use strict';

      var _require12 = require('./dependencies'),
          _ = _require12._,
          Promise = _require12.Promise;

      var Diaspora = require('./diaspora');

      var Utils = require('./utils');

      var SetValidationError = require('./errors/setValidationError');
      /**
       * @module Set
       */

      /**
       * Emit events on each entities.
       *
       * @author Gerkin
       * @inner
       * @param   {SequentialEvent[]} entities - Items to iterate over.
       * @param   {string|string[]}   verb     - Verb of the action to emit.
       * @param   {string}            prefix   - Prefix to prepend to the verb.
       * @returns {Promise} Promise resolved once all promises are done.
       */


      var allEmit = function allEmit(entities, verb, prefix) {
        return Promise.all(entities.map(function (entity, index) {
          return entity.emit("" + prefix + (_.isArray(verb) ? verb[index] : verb));
        }));
      };
      /**
       * Emit `before` & `after` events around the entity action. `this` must be bound to the calling {@link Set}.
       *
       * @author Gerkin
       * @inner
       * @this Set
       * @param   {string} sourceName    - Name of the data source to interact with.
       * @param   {string} action        - Name of the entity function to apply.
       * @param   {string|string[]} verb - String or array of strings to map for events suffix.
       * @returns {Promise} Promise resolved once events are finished.
       */


      function wrapEventsAction(_x29, _x30, _x31) {
        return _wrapEventsAction.apply(this, arguments);
      }

      function _wrapEventsAction() {
        _wrapEventsAction = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee13(sourceName, action, verb) {
          var _allEmit;

          return regeneratorRuntime.wrap(function _callee13$(_context13) {
            while (1) {
              switch (_context13.prev = _context13.next) {
                case 0:
                  _allEmit = _.partial(allEmit, this.entities, verb);
                  _context13.next = 3;
                  return _allEmit('before');

                case 3:
                  _context13.next = 5;
                  return Promise.all(this.entities.map(function (entity) {
                    return entity[action](sourceName, {
                      skipEvents: true
                    });
                  }));

                case 5:
                  _context13.next = 7;
                  return _allEmit('after');

                case 7:
                case "end":
                  return _context13.stop();
              }
            }
          }, _callee13, this);
        }));
        return _wrapEventsAction.apply(this, arguments);
      }

      var setProxyProps = {
        get: function get(target, prop) {
          if (prop in target) {
            return target[prop];
          } else if (prop in target.entities) {
            return target.entities[prop];
          } else if ('string' === typeof prop && prop.match(/^-?\d+$/) && target.entities.nth(parseInt(prop))) {
            return target.entities.nth(parseInt(prop));
          }
        },
        set: function set(target, prop, val) {
          if ('model' === prop) {
            return new Error('Can\'t assign to read-only property "model".');
          } else if ('entities' === prop) {
            Set.checkEntitiesFromModel(val, target.model);
            target.entities = _(val);
          }
        }
      };
      /**
       * Collections are used to manage multiple entities at the same time. You may try to use this class as an array.
       */

      var Set =
      /*#__PURE__*/
      function () {
        /**
         * Create a new set, managing provided `entities` that must be generated from provided `model`.
         *
         * @param {Model}           model    - Model describing entities managed by this set.
         * @param {Entity|Entity[]} entities - Entities to manage with this set. Arguments are flattened, so you can provide as many nested arrays as you want.
         */
        function Set(model) {
          for (var _len6 = arguments.length, entities = new Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
            entities[_key6 - 1] = arguments[_key6];
          }

          // Flatten arguments
          entities = _(entities).flatten(); // Check if each entity is from the expected model

          Set.checkEntitiesFromModel(entities.value(), model);
          var defined = Utils.defineEnumerableProperties(this, {
            /**
             * List entities of this set.
             *
             * @name entities
             * @readonly
             * @memberof Set
             * @instance
             * @type {LodashWrapper<Entity>}
             * @author Gerkin
             */
            entities: entities,

            /**
             * Model that generated this set.
             *
             * @name model
             * @readonly
             * @memberof Set
             * @instance
             * @type {Model}
             * @author Gerkin
             */
            model: model,

            /**
             * Number of entities in this set.
             *
             * @name length
             * @readonly
             * @memberof Set
             * @instance
             * @type {Integer}
             * @author Gerkin
             */
            length: {
              get: function get() {
                return this.entities.size();
              }
            }
          });
          return new Proxy(defined, setProxyProps);
        }
        /**
         * Check if all entities in the first argument are from the expected model.
         *
         * @author gerkin
         * @throws {TypeError} Thrown if one of the entity is not from provided `model`.
         * @param {Entity[]} entities - Array of entities to check.
         * @param {Model}    model    - Model expected to be the source of all entities.
         * @returns {undefined} This function does not return anything.
         */


        Set.checkEntitiesFromModel = function checkEntitiesFromModel(entities, model) {
          entities.forEach(function (entity, index) {
            if (entity.constructor.model !== model) {
              throw new TypeError("Provided entity n\xB0" + index + " " + entity + " is not from model " + model + " (" + model.modelName + ")");
            }
          });
        };
        /**
         * Persist all entities of this collection.
         *
         * @fires EntityFactory.Entity#beforeUpdate
         * @fires EntityFactory.Entity#afterUpdate
         * @author gerkin
         * @param {string} sourceName - Data source name to persist in.
         * @returns {Promise} Promise resolved once all items are persisted.
         * @see {@link EntityFactory.Entity#persist}
         */


        var _proto8 = Set.prototype;

        _proto8.persist =
        /*#__PURE__*/
        function () {
          var _persist = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee10(sourceName) {
            var suffixes, _allEmit, validationResults, errors;

            return regeneratorRuntime.wrap(function _callee10$(_context10) {
              while (1) {
                switch (_context10.prev = _context10.next) {
                  case 0:
                    suffixes = this.entities.map(function (entity) {
                      return 'orphan' === entity.state ? 'Create' : 'Update';
                    }).value();
                    _allEmit = _.partial(allEmit, this.entities);
                    _context10.next = 4;
                    return _allEmit('Persist', 'before');

                  case 4:
                    _context10.next = 6;
                    return _allEmit('Validate', 'before');

                  case 6:
                    validationResults = this.entities.map(function (entity) {
                      try {
                        entity.validate();
                      } catch (error) {
                        console.error(error);
                        Diaspora.logger.error('Validation failed:', {
                          entity: entity,
                          error: error
                        });
                        return error;
                      }
                    }).value();
                    errors = _.compact(validationResults).length;

                    if (!(errors > 0)) {
                      _context10.next = 10;
                      break;
                    }

                    throw new SetValidationError("Set validation failed for " + errors + " elements (on " + this.length + "): ", validationResults);

                  case 10:
                    _context10.next = 12;
                    return _allEmit('Validate', 'after');

                  case 12:
                    _context10.next = 14;
                    return wrapEventsAction.call(this, sourceName, 'persist', _.map(suffixes, function (suffix) {
                      return "Persist" + suffix;
                    }));

                  case 14:
                    _context10.next = 16;
                    return _allEmit('Persist', 'after');

                  case 16:
                    return _context10.abrupt("return", this);

                  case 17:
                  case "end":
                    return _context10.stop();
                }
              }
            }, _callee10, this);
          }));

          return function persist(_x32) {
            return _persist.apply(this, arguments);
          };
        }();
        /**
         * Reload all entities of this collection.
         *
         * @fires EntityFactory.Entity#beforeFind
         * @fires EntityFactory.Entity#afterFind
         * @author gerkin
         * @param {string} sourceName - Data source name to reload entities from.
         * @returns {Promise} Promise resolved once all items are reloaded.
         * @see {@link EntityFactory.Entity#fetch}
         */


        _proto8.fetch =
        /*#__PURE__*/
        function () {
          var _fetch = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee11(sourceName) {
            return regeneratorRuntime.wrap(function _callee11$(_context11) {
              while (1) {
                switch (_context11.prev = _context11.next) {
                  case 0:
                    _context11.next = 2;
                    return wrapEventsAction.call(this, sourceName, 'fetch', 'Fetch');

                  case 2:
                    return _context11.abrupt("return", this);

                  case 3:
                  case "end":
                    return _context11.stop();
                }
              }
            }, _callee11, this);
          }));

          return function fetch(_x33) {
            return _fetch.apply(this, arguments);
          };
        }();
        /**
         * Destroy all entities from this collection.
         *
         * @fires EntityFactory.Entity#beforeDelete
         * @fires EntityFactory.Entity#afterDelete
         * @author gerkin
         * @param {string} sourceName - Name of the data source to delete entities from.
         * @returns {Promise} Promise resolved once all items are destroyed.
         * @see {@link EntityFactory.Entity#destroy}
         */


        _proto8.destroy =
        /*#__PURE__*/
        function () {
          var _destroy = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee12(sourceName) {
            return regeneratorRuntime.wrap(function _callee12$(_context12) {
              while (1) {
                switch (_context12.prev = _context12.next) {
                  case 0:
                    _context12.next = 2;
                    return wrapEventsAction.call(this, sourceName, 'destroy', 'Destroy');

                  case 2:
                    return _context12.abrupt("return", this);

                  case 3:
                  case "end":
                    return _context12.stop();
                }
              }
            }, _callee12, this);
          }));

          return function destroy(_x34) {
            return _destroy.apply(this, arguments);
          };
        }();
        /**
         * Update all entities in the set with given object.
         *
         * @author gerkin
         * @param   {Object} newData - Attributes to change in each entity of the collection.
         * @returns {Collection} `this`.
         */


        _proto8.update = function update(newData) {
          this.entities.forEach(function (entity) {
            Utils.applyUpdateEntity(newData, entity);
          });
          return this;
        };
        /**
         * Returns a POJO representation of this set's data.
         *
         * @author gerkin
         * @returns {Object} POJO representation of set & children.
         */


        _proto8.toObject = function toObject() {
          return this.entities.map(function (entity) {
            return entity.toObject();
          }).value();
        };

        return Set;
      }();

      module.exports = Set;
    }, {
      "./dependencies": 11,
      "./diaspora": 12,
      "./errors/setValidationError": 17,
      "./utils": 21
    }],
    21: [function (require, module, exports) {
      (function (global) {
        'use strict';

        var _require13 = require('./dependencies'),
            _ = _require13._;
        /**
         * @module Utils
         */


        module.exports = {
          defineEnumerableProperties: function defineEnumerableProperties(subject, handlers) {
            var remappedHandlers = _.mapValues(handlers, function (handler) {
              if (_.isNil(handler) || 'object' !== typeof handler || Object.getPrototypeOf(handler) !== Object.prototype) {
                handler = {
                  value: handler
                };
              }

              var defaults = {
                enumerable: true
              };

              if (!handler.hasOwnProperty('get')) {
                defaults.writable = false;
              }

              _.defaults(handler, defaults);

              return handler;
            });

            return Object.defineProperties(subject, remappedHandlers);
          },

          /**
           * Merge update query with the entity. This operation allows to delete fields.
           *
           * @author gerkin
           * @param   {Object} update - Hash representing modified values. A field with an `undefined` value deletes this field from the entity.
           * @param   {Object} entity - Entity to update.
           * @returns {Object} Entity modified.
           */
          applyUpdateEntity: function applyUpdateEntity(update, entity) {
            _.forEach(update, function (val, key) {
              if (_.isUndefined(val)) {
                delete entity[key];
              } else {
                entity[key] = val;
              }
            });

            return entity;
          },

          /**
           * Create a new unique id for this store's entity.
           * 
           * @author gerkin
           * @returns {string} Generated unique id.
           */
          generateUUID: function generateUUID() {
            var d = new Date().getTime(); // Use high-precision timer if available

            if (global.performance && 'function' === typeof global.performance.now) {
              d += global.performance.now();
            }

            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
              var r = (d + Math.random() * 16) % 16 | 0;
              d = Math.floor(d / 16);
              return ('x' === c ? r : r & 0x3 | 0x8).toString(16);
            });
            return uuid;
          },

          /**
           * Reduce, offset or sort provided set.
           * 
           * @author gerkin
           * @param   {Object[]} set     - Objects retrieved from memory store.
           * @param   {Object}   options - Options to apply to the set.
           * @returns {Object[]} Set with options applied.
           */
          applyOptionsToSet: function applyOptionsToSet(set, options) {
            _.defaults(options, {
              limit: Infinity,
              skip: 0
            });

            set = set.slice(options.skip);

            if (set.length > options.limit) {
              set = set.slice(0, options.limit);
            }

            return set;
          }
        };
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
      "./dependencies": 11
    }],
    22: [function (require, module, exports) {
      'use strict';

      var dependencies = require('./dependencies');

      var Diaspora = require('./diaspora');

      var EntityValidationError = Diaspora.components.Errors.EntityValidationError;
      var _ = dependencies._;
      /**
       * @module Validator
       */

      /**
       * Execute the simple tester and return an error component if it returns falsey.
       *
       * @param   {Function} tester - The test function to invoke.
       * @returns {module:Validator~Checker} Function to execute to validate the type.
       */

      var validateWrongType = function validateWrongType(tester) {
        return function (keys, fieldDesc, value) {
          if (!tester(value)) {
            return {
              type: keys.toValidatePath() + " expected to be a \"" + fieldDesc.type + "\""
            };
          }
        };
      };
      /**
       * Prepare the check of each items in the array.
       *
       * @param   {module:Validator~Validator} validator - Validator instance that do this call.
       * @param   {Object}                     fieldDesc - Description of the field to check.
       * @param   {module:Validator~PathStack} keys      - Keys so far.
       * @returns {Function} Function to execute to validate array items.
       */


      var validateArrayItems = function validateArrayItems(validator, fieldDesc, keys) {
        return function (propVal, index) {
          if (fieldDesc.hasOwnProperty('of')) {
            var ofArray = _.castArray(fieldDesc.of);

            var subErrors = _(ofArray).map(function (desc, subIndex) {
              return validator.check(propVal, keys.clone().pushValidationProp('of', _.isArray(fieldDesc.of) ? subIndex : undefined).pushEntityProp(index), {
                getProps: false
              });
            });

            if (!_.isArray(fieldDesc.of)) {
              return subErrors.get(0);
            } else if (subErrors.compact().value().length === ofArray.length) {
              return subErrors.toPlainObject().omitBy(_.isNil).value();
            }
          }

          return {};
        };
      };
      /**
       * A checker is a function that can return an error component with provided standard args.
       *
       * @callback Checker
       * @param   {module:Validator~PathStack} keys      - Pathstack so far.
       * @param   {Object}                     fieldDesc - Description of the field.
       * @param   {Any}                        value     - Value to check.
       * @returns {Object} Error component.
       */

      /**
       * Store for validation functions.
       *
       * @type {object}
       * @property {object<string, module:Validator~Checker>} TYPE - Type checkers.
       * @property {module:Validator~Checker} TYPE.string - String type checker.
       * @property {module:Validator~Checker} TYPE.integer - Integer type checker.
       * @property {module:Validator~Checker} TYPE.float - Float type checker.
       * @property {module:Validator~Checker} TYPE.date - Date type checker.
       * @property {module:Validator~Checker} TYPE.object - Object type checker.
       * @property {module:Validator~Checker} TYPE.array - Array type checker.
       * @property {module:Validator~Checker} TYPE.any - Type checker for type 'any'.
       * @property {module:Validator~Checker} TYPE._ - Default function for unhandled type.
       */


      var VALIDATIONS = {
        TYPE: {
          string: validateWrongType(_.isString),
          integer: validateWrongType(_.isInteger),
          float: validateWrongType(_.isNumber),
          date: validateWrongType(_.isDate),
          boolean: validateWrongType(_.isBoolean),
          object: function object(keys, fieldDesc, value) {
            var _this29 = this;

            if (!_.isObject(value)) {
              return {
                type: keys.toValidatePath() + " expected to be a \"" + fieldDesc.type + "\""
              };
            } else {
              var deepTest = _.isObject(fieldDesc.attributes) ? _(_.assign({}, fieldDesc.attributes, value)).mapValues(function (pv, propName) {
                var propVal = value[propName];
                return _this29.check(propVal, keys.clone().pushValidationProp('attributes').pushProp(propName), {
                  getProps: false
                });
              }).omitBy(_.isEmpty).value() : {};

              if (!_.isEmpty(deepTest)) {
                return {
                  children: deepTest
                };
              }
            }
          },
          array: function array(keys, fieldDesc, value) {
            if (!_.isArray(value)) {
              return {
                type: keys.toValidatePath() + " expected to be a \"" + fieldDesc.type + "\""
              };
            } else {
              var deepTest = _.isObject(fieldDesc.of) ? _(value).map(validateArrayItems(this, fieldDesc, keys)).omitBy(_.isEmpty).value() : {};

              if (!_.isEmpty(deepTest)) {
                return {
                  children: deepTest
                };
              }
            }
          },
          any: function any(keys, fieldDesc, value) {
            if (!_.stubTrue(value)) {
              return {
                type: keys.toValidatePath() + " expected to be assigned with any type"
              };
            }
          },
          _: function _(keys, fieldDesc) {
            return {
              type: keys.toValidatePath() + " requires to be unhandled type \"" + fieldDesc.type + "\""
            };
          }
        }
      }; // Add aliases

      _.assign(VALIDATIONS.TYPE, {
        bool: VALIDATIONS.TYPE.boolean,
        int: VALIDATIONS.TYPE.integer,
        str: VALIDATIONS.TYPE.string,
        text: VALIDATIONS.TYPE.string
      });
      /**
       * Standard function that can be used to add steps to the validation process..
       *
       * @callback ValidationStep
       * @param   {module:Validator~ValidationStepsArgs} validationArgs - Object of arguments.
       * @returns {undefined} This function returns nothing.
       */

      /**
       * This object can be passed through each validation steps.
       *
       * @typedef  {Object} ValidationStepsArgs
       * @property {Object}                     error     - Error object to extend.
       * @property {Object}                     fieldDesc - Description of the field.
       * @property {module:Validator~PathStack} keys      - Pathstack representing keys so far.
       * @property {*}                          value     - Value to check.
       */


      var VALIDATION_STEPS = [
      /**
       * Apply the custom `validate` function or function array, if it exists.
       *
       * @function module:Validator~checkCustoms
       * @type {module:Validator~ValidationStep}
       * @param   {module:Validator~ValidationStepsArgs} validationArgs - Validation step argument.
       * @returns {undefined} This function returns nothing.
       */
      function checkCustoms(validationArgs) {
        var _this30 = this;

        var error = validationArgs.error,
            fieldDesc = validationArgs.fieldDesc,
            keys = validationArgs.keys,
            value = validationArgs.value; // It the field has a `validate` property, try to use it

        var validateFcts = _(fieldDesc.validate).castArray().compact();

        validateFcts.forEach(function (validateFct) {
          if (!validateFct.call(_this30, value, fieldDesc)) {
            error.validate = keys.toValidatePath() + " custom validation failed";
          }
        });
      },
      /**
       * Check if the type & the existence matches the `type` & `required` specifications.
       *
       * @function module:Validator~checkTypeRequired
       * @type {module:Validator~ValidationStep}
       * @param   {module:Validator~ValidationStepsArgs} validationArgs - Validation step argument.
       * @returns {undefined} This function returns nothing.
       */
      function checkTypeRequired(validationArgs) {
        var error = validationArgs.error,
            fieldDesc = validationArgs.fieldDesc,
            keys = validationArgs.keys,
            value = validationArgs.value; // Check the type and the required status

        if (!_.isNil(fieldDesc.type) && !_.isNil(fieldDesc.model)) {
          error.spec = keys.toValidatePath() + " spec can't have both a type and a model"; // Apply the `required` modifier
        } else if (true === fieldDesc.required && _.isNil(value)) {
          error.required = keys.toValidatePath() + " is a required property of type \"" + fieldDesc.type + "\"";
        } else if (!_.isNil(value)) {
          if (_.isString(fieldDesc.type)) {
            _.assign(error, // Get the validator. Default to unhandled type
            _.get(VALIDATIONS, ['TYPE', fieldDesc.type], VALIDATIONS.TYPE._).call(this, keys, fieldDesc, value));
          } else {
            error.spec = keys.toValidatePath() + " spec \"type\" must be a string";
          }
        }
      },
      /**
       * Verify if the value correspond to a value in the `enum` property.
       *
       * @function module:Validator~checkEnum
       * @type {module:Validator~ValidationStep}
       * @param   {module:Validator~ValidationStepsArgs} validationArgs - Validation step argument.
       * @returns {undefined} This function returns nothing.
       */
      function checkEnum(validationArgs) {
        var error = validationArgs.error,
            fieldDesc = validationArgs.fieldDesc,
            keys = validationArgs.keys,
            value = validationArgs.value; // Check enum values

        if (!_.isNil(value) && !_.isNil(fieldDesc.enum)) {
          var result = _.some(fieldDesc.enum, function (enumVal) {
            if (enumVal instanceof RegExp) {
              return null !== value.match(enumVal);
            } else {
              return value === enumVal;
            }
          });

          if (false === result) {
            error.enum = keys.toValidatePath() + " expected to have one of enumerated values \"" + JSON.stringify(fieldDesc.enum) + "\"";
          }
        }
      }];
      /**
       * Those validation steps are called one after one during the validation of a single field.
       *
       * @const VALIDATION_STEPS
       * @type {module:Validator~ValidationStep[]}
       * @property {module:Validator~checkCustoms}      '0' - Check for `validate` field.
       * @property {module:Validator~checkTypeRequired} '1' - Check for `type` & `required` fields.
       * @property {module:Validator~checkEnum}         '2' - Check for `enum` field.
       */

      var PRIVATE = Symbol('PRIVATE');
      /**
       * The PathStack class allows model validation to follow different paths in model description & entity.
       */

      var PathStack =
      /*#__PURE__*/
      function () {
        /**
         * Constructs a pathstack.
         *
         * @author gerkin
         * @param {string[]} [segmentsEntity=[]]     - Keys to follow in entity.
         * @param {string[]} [segmentsValidation=[]] - Keys to follow in model description.
         */
        function PathStack(segmentsEntity, segmentsValidation) {
          if (segmentsEntity === void 0) {
            segmentsEntity = [];
          }

          if (segmentsValidation === void 0) {
            segmentsValidation = [];
          }

          _.assign(this, {
            segmentsEntity: segmentsEntity,
            segmentsValidation: segmentsValidation
          });
        }
        /**
         * Add a path segment for entity navigation.
         *
         * @param   {...string} prop - Properties to add.
         * @returns {module:Validator~PathStack} Returns `this`.
         */


        var _proto9 = PathStack.prototype;

        _proto9.pushEntityProp = function pushEntityProp() {
          for (var _len7 = arguments.length, prop = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
            prop[_key7] = arguments[_key7];
          }

          this.segmentsEntity = _(this.segmentsEntity).concat(prop).filter(_.isNil).value();
          return this;
        };
        /**
         * Add a path segment for model description navigation.
         *
         * @param   {...string} prop - Properties to add.
         * @returns {module:Validator~PathStack} Returns `this`.
         */


        _proto9.pushValidationProp = function pushValidationProp() {
          for (var _len8 = arguments.length, prop = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
            prop[_key8] = arguments[_key8];
          }

          this.segmentsValidation = _(this.segmentsValidation).concat(prop).filter(function (val) {
            return !_.isNil(val);
          }).value();
          return this;
        };
        /**
         * Add a path segment for both entity & model description navigation.
         *
         * @param   {...string} prop - Properties to add.
         * @returns {module:Validator~PathStack} Returns `this`.
         */


        _proto9.pushProp = function pushProp() {
          var _pushEntityProp;

          return (_pushEntityProp = this.pushEntityProp.apply(this, arguments)).pushValidationProp.apply(_pushEntityProp, arguments);
        };
        /**
         * Get a string version of entity segments.
         *
         * @returns {string} String representation of path in entity.
         */


        _proto9.toValidatePath = function toValidatePath() {
          return this.segmentsEntity.join('.');
        };
        /**
         * Cast this PathStack to its representing arrays.
         *
         * @returns {Array<Array<string>>} Array of paths. The first path represents the entity segments, second represents model description segments.
         */


        _proto9.toArray = function toArray() {
          return [this.segmentsEntity.slice(), this.segmentsValidation.slice()];
        };
        /**
         * Duplicate this PathStack, detaching its state from the new.
         *
         * @returns {module:Validator~PathStack} Clone of caller PathStack.
         */


        _proto9.clone = function clone() {
          return new (Function.prototype.bind.apply(PathStack, [null].concat(this.toArray())))();
        };

        return PathStack;
      }();
      /**
       * The Validator class is used to check an entity or its fields against a model description.
       */


      var Validator =
      /*#__PURE__*/
      function () {
        /**
         * Construct a Validator configured for the provided model.
         *
         * @param {ModelConfiguration.AttributesDescriptor} modelDesc - Model description to validate.
         */
        function Validator(modelDesc) {
          var _this = {
            modelDesc: modelDesc
          };
          this[PRIVATE] = _this;
        }
        /**
         * Check if the value matches the field description provided, thus verify if it is valid.
         *
         * @author gerkin
         * @param   {Object} entity - Entity to check.
         * @returns {Error[]} Array of errors.
         */


        var _proto10 = Validator.prototype;

        _proto10.validate = function validate(entity) {
          var _this31 = this;

          // Apply method `checkField` on each field described
          var checkResults = _(this[PRIVATE].modelDesc).mapValues(function (fieldDesc, field) {
            return _this31.check(entity[field], new PathStack().pushProp(field), {
              getProps: false
            });
          }).omitBy(_.isEmpty).value();

          if (!_.isNil(checkResults) && !_.isEmpty(checkResults)) {
            throw new EntityValidationError(checkResults, 'Validation failed');
          }
        };
        /**
         * Check if the value matches the field description provided, thus verify if it is valid.
         *
         * @author gerkin
         * @param   {Any}                        value                  - Value to check.
         * @param   {module:Validator~PathStack} keys                   - Pathstack representing path to this validation.
         * @param   {Object}                     [options=(})]          - Hash of options.
         * @param   {boolean}                    options.getProps=false - If `false`, it will use the value directly. If `true`, will try to get the property from value, as if it was an entity.
         * @returns {Object} Hash describing errors.
         */


        _proto10.check = function check(value, keys, options) {
          var _this32 = this;

          if (options === void 0) {
            options = {};
          }

          _.defaults(options, {
            getProps: true
          });

          if (!(keys instanceof PathStack)) {
            keys = new PathStack(keys);
          }

          var val = options.getProps ? _.get(value, keys.segmentsEntity) : value;

          var fieldDesc = _.get(this[PRIVATE].modelDesc, keys.segmentsValidation);

          if (!_.isObject(fieldDesc)) {
            return;
          }

          _.defaults(fieldDesc, {
            required: false
          });

          var error = {};
          var stepsArgs = {
            error: error,
            fieldDesc: fieldDesc,
            keys: keys,
            value: val
          };

          _.forEach(VALIDATION_STEPS, function (validationStep) {
            return validationStep.call(_this32, stepsArgs);
          });

          if (!_.isEmpty(error)) {
            error.value = value;
            return error;
          } else {
            return null;
          }
        };
        /**
         * Get the model description provided in constructor.
         *
         * @readonly
         * @type {ModelConfiguration.AttributesDescriptor}
         */


        _createClass(Validator, [{
          key: "modelDesc",
          get: function get() {
            return _.cloneDeep(this[PRIVATE].modelDesc);
          }
          /**
           * Get the PathStack constructor.
           *
           * @readonly
           * @type {module:Validator~PathStack}
           */

        }], [{
          key: "PathStack",
          get: function get() {
            return PathStack;
          }
        }]);

        return Validator;
      }();

      module.exports = Validator;
    }, {
      "./dependencies": 11,
      "./diaspora": 12
    }],
    23: [function (require, module, exports) {
      (function (process) {
        // Copyright Joyent, Inc. and other Node contributors.
        //
        // Permission is hereby granted, free of charge, to any person obtaining a
        // copy of this software and associated documentation files (the
        // "Software"), to deal in the Software without restriction, including
        // without limitation the rights to use, copy, modify, merge, publish,
        // distribute, sublicense, and/or sell copies of the Software, and to permit
        // persons to whom the Software is furnished to do so, subject to the
        // following conditions:
        //
        // The above copyright notice and this permission notice shall be included
        // in all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
        // USE OR OTHER DEALINGS IN THE SOFTWARE.
        // resolves . and .. elements in a path array with directory names there
        // must be no slashes, empty elements, or device names (c:\) in the array
        // (so also no leading and trailing slashes - it does not distinguish
        // relative and absolute paths)
        function normalizeArray(parts, allowAboveRoot) {
          // if the path tries to go above the root, `up` ends up > 0
          var up = 0;

          for (var i = parts.length - 1; i >= 0; i--) {
            var last = parts[i];

            if (last === '.') {
              parts.splice(i, 1);
            } else if (last === '..') {
              parts.splice(i, 1);
              up++;
            } else if (up) {
              parts.splice(i, 1);
              up--;
            }
          } // if the path is allowed to go above the root, restore leading ..s


          if (allowAboveRoot) {
            for (; up--; up) {
              parts.unshift('..');
            }
          }

          return parts;
        } // Split a filename into [root, dir, basename, ext], unix version
        // 'root' is just a slash, or nothing.


        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;

        var splitPath = function splitPath(filename) {
          return splitPathRe.exec(filename).slice(1);
        }; // path.resolve([from ...], to)
        // posix version


        exports.resolve = function () {
          var resolvedPath = '',
              resolvedAbsolute = false;

          for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            var path = i >= 0 ? arguments[i] : process.cwd(); // Skip empty and invalid entries

            if (typeof path !== 'string') {
              throw new TypeError('Arguments to path.resolve must be strings');
            } else if (!path) {
              continue;
            }

            resolvedPath = path + '/' + resolvedPath;
            resolvedAbsolute = path.charAt(0) === '/';
          } // At this point the path should be resolved to a full absolute path, but
          // handle relative paths to be safe (might happen when process.cwd() fails)
          // Normalize the path


          resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function (p) {
            return !!p;
          }), !resolvedAbsolute).join('/');
          return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
        }; // path.normalize(path)
        // posix version


        exports.normalize = function (path) {
          var isAbsolute = exports.isAbsolute(path),
              trailingSlash = substr(path, -1) === '/'; // Normalize the path

          path = normalizeArray(filter(path.split('/'), function (p) {
            return !!p;
          }), !isAbsolute).join('/');

          if (!path && !isAbsolute) {
            path = '.';
          }

          if (path && trailingSlash) {
            path += '/';
          }

          return (isAbsolute ? '/' : '') + path;
        }; // posix version


        exports.isAbsolute = function (path) {
          return path.charAt(0) === '/';
        }; // posix version


        exports.join = function () {
          var paths = Array.prototype.slice.call(arguments, 0);
          return exports.normalize(filter(paths, function (p, index) {
            if (typeof p !== 'string') {
              throw new TypeError('Arguments to path.join must be strings');
            }

            return p;
          }).join('/'));
        }; // path.relative(from, to)
        // posix version


        exports.relative = function (from, to) {
          from = exports.resolve(from).substr(1);
          to = exports.resolve(to).substr(1);

          function trim(arr) {
            var start = 0;

            for (; start < arr.length; start++) {
              if (arr[start] !== '') break;
            }

            var end = arr.length - 1;

            for (; end >= 0; end--) {
              if (arr[end] !== '') break;
            }

            if (start > end) return [];
            return arr.slice(start, end - start + 1);
          }

          var fromParts = trim(from.split('/'));
          var toParts = trim(to.split('/'));
          var length = Math.min(fromParts.length, toParts.length);
          var samePartsLength = length;

          for (var i = 0; i < length; i++) {
            if (fromParts[i] !== toParts[i]) {
              samePartsLength = i;
              break;
            }
          }

          var outputParts = [];

          for (var i = samePartsLength; i < fromParts.length; i++) {
            outputParts.push('..');
          }

          outputParts = outputParts.concat(toParts.slice(samePartsLength));
          return outputParts.join('/');
        };

        exports.sep = '/';
        exports.delimiter = ':';

        exports.dirname = function (path) {
          var result = splitPath(path),
              root = result[0],
              dir = result[1];

          if (!root && !dir) {
            // No dirname whatsoever
            return '.';
          }

          if (dir) {
            // It has a dirname, strip trailing slash
            dir = dir.substr(0, dir.length - 1);
          }

          return root + dir;
        };

        exports.basename = function (path, ext) {
          var f = splitPath(path)[2]; // TODO: make this comparison case-insensitive on windows?

          if (ext && f.substr(-1 * ext.length) === ext) {
            f = f.substr(0, f.length - ext.length);
          }

          return f;
        };

        exports.extname = function (path) {
          return splitPath(path)[3];
        };

        function filter(xs, f) {
          if (xs.filter) return xs.filter(f);
          var res = [];

          for (var i = 0; i < xs.length; i++) {
            if (f(xs[i], i, xs)) res.push(xs[i]);
          }

          return res;
        } // String.prototype.substr - negative index don't work in IE8


        var substr = 'ab'.substr(-1) === 'b' ? function (str, start, len) {
          return str.substr(start, len);
        } : function (str, start, len) {
          if (start < 0) start = str.length + start;
          return str.substr(start, len);
        };
      }).call(this, require('_process'));
    }, {
      "_process": 24
    }],
    24: [function (require, module, exports) {
      // shim for using process in browser
      var process = module.exports = {}; // cached from whatever global is present so that test runners that stub it
      // don't break things.  But we need to wrap it in a try catch in case it is
      // wrapped in strict mode code which doesn't define any globals.  It's inside a
      // function because try/catches deoptimize in certain engines.

      var cachedSetTimeout;
      var cachedClearTimeout;

      function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
      }

      function defaultClearTimeout() {
        throw new Error('clearTimeout has not been defined');
      }

      (function () {
        try {
          if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
          } else {
            cachedSetTimeout = defaultSetTimout;
          }
        } catch (e) {
          cachedSetTimeout = defaultSetTimout;
        }

        try {
          if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
          } else {
            cachedClearTimeout = defaultClearTimeout;
          }
        } catch (e) {
          cachedClearTimeout = defaultClearTimeout;
        }
      })();

      function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
          //normal enviroments in sane situations
          return setTimeout(fun, 0);
        } // if setTimeout wasn't available but was latter defined


        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
        }

        try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedSetTimeout(fun, 0);
        } catch (e) {
          try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
          } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
          }
        }
      }

      function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
          //normal enviroments in sane situations
          return clearTimeout(marker);
        } // if clearTimeout wasn't available but was latter defined


        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
        }

        try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedClearTimeout(marker);
        } catch (e) {
          try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
          } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
          }
        }
      }

      var queue = [];
      var draining = false;
      var currentQueue;
      var queueIndex = -1;

      function cleanUpNextTick() {
        if (!draining || !currentQueue) {
          return;
        }

        draining = false;

        if (currentQueue.length) {
          queue = currentQueue.concat(queue);
        } else {
          queueIndex = -1;
        }

        if (queue.length) {
          drainQueue();
        }
      }

      function drainQueue() {
        if (draining) {
          return;
        }

        var timeout = runTimeout(cleanUpNextTick);
        draining = true;
        var len = queue.length;

        while (len) {
          currentQueue = queue;
          queue = [];

          while (++queueIndex < len) {
            if (currentQueue) {
              currentQueue[queueIndex].run();
            }
          }

          queueIndex = -1;
          len = queue.length;
        }

        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
      }

      process.nextTick = function (fun) {
        var args = new Array(arguments.length - 1);

        if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
          }
        }

        queue.push(new Item(fun, args));

        if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
        }
      }; // v8 likes predictible objects


      function Item(fun, array) {
        this.fun = fun;
        this.array = array;
      }

      Item.prototype.run = function () {
        this.fun.apply(null, this.array);
      };

      process.title = 'browser';
      process.browser = true;
      process.env = {};
      process.argv = [];
      process.version = ''; // empty string to avoid regexp issues

      process.versions = {};

      function noop() {}

      process.on = noop;
      process.addListener = noop;
      process.once = noop;
      process.off = noop;
      process.removeListener = noop;
      process.removeAllListeners = noop;
      process.emit = noop;
      process.prependListener = noop;
      process.prependOnceListener = noop;

      process.listeners = function (name) {
        return [];
      };

      process.binding = function (name) {
        throw new Error('process.binding is not supported');
      };

      process.cwd = function () {
        return '/';
      };

      process.chdir = function (dir) {
        throw new Error('process.chdir is not supported');
      };

      process.umask = function () {
        return 0;
      };
    }, {}]
  }, {}, [1])(1);
});
//# sourceMappingURL=diaspora.js.map
