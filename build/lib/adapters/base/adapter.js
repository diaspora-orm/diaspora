(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["core-js/modules/es6.function.name"], factory);
  } else if (typeof exports !== "undefined") {
    factory(require("core-js/modules/es6.function.name"));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.es6Function);
    global.adapter = mod.exports;
  }
})(this, function (_es6Function) {
  'use strict';

  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

  var _require = require('../../dependencies'),
      _ = _require._,
      Promise = _require.Promise,
      SequentialEvent = _require.SequentialEvent;
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


  var _require2 = require('./adapter-utils'),
      OPERATORS = _require2.OPERATORS,
      CANONICAL_OPERATORS = _require2.CANONICAL_OPERATORS,
      QUERY_OPTIONS_TRANSFORMS = _require2.QUERY_OPTIONS_TRANSFORMS,
      iterateLimit = _require2.iterateLimit,
      remapIO = _require2.remapIO;
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
      var _this;

      _this = _SequentialEvent.call(this) || this;
      /**
       * Describe current adapter status.
       *
       * @type {string}
       * @author Gerkin
       */

      _this.state = 'preparing';
      /**
       * Hash to transform entity fields to data store fields.
       *
       * @type {Object}
       * @property {string} * - Data store field associated with this entity field.
       * @author Gerkin
       */

      _this.remaps = {};
      /**
       * Hash to transform data store fields to entity fields.
       *
       * @type {Object}
       * @property {string} * - Entity field associated with this data store field.
       * @author Gerkin
       */

      _this.remapsInverted = {};
      /**
       * Hash of functions to cast data store values to JSON standard values in entity.
       *
       * @type {Object}
       * @property {Function} * - Filter to execute to get standard JSON value.
       * @author Gerkin
       */

      _this.filters = {};
      /**
       * Link to the constructor of the class generated by this adapter.
       *
       * @type {DataStoreEntities.DataStoreEntity}
       * @author Gerkin
       */

      _this.classEntity = classEntity;
      /**
       * Error triggered by adapter initialization.
       *
       * @type {Error}
       * @author Gerkin
       */

      _this.error = undefined; // Bind events

      _this.on('ready', function () {
        _this.state = 'ready';
      }).on('error', function (err) {
        _this.state = 'error';
        _this.error = err;
      });

      return _this;
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
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        if ('ready' === _this2.state) {
          return resolve(_this2);
        } else if ('error' === _this2.state) {
          return reject(_this2.error);
        }

        _this2.on('ready', function () {
          return resolve(_this2);
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
      var _this3 = this;

      return Promise.mapSeries(entities, function (entity) {
        return _this3.insertOne(table, entity || {});
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
      var _this4 = this;

      if (options === void 0) {
        options = {};
      }

      var count = 0; // We are going to loop until we find enough items

      var loopFind = function loopFind() {
        // First, search for the item.
        return _this4.findOne(table, queryFind, options).then(function (found) {
          // If the search returned nothing, then just finish the findMany
          if (_.isNil(found)) {
            return Promise.resolve(); // Else, if this is a value and not the initial `true`, add it to the list
          } // If we found enough items, return them


          if (count === options.limit) {
            return Promise.resolve();
          } // Increase our counter


          count++; // Do the deletion & loop

          return _this4.deleteOne(table, queryFind, options).then(loopFind);
        });
      };

      return loopFind(true);
    };

    return DiasporaAdapter;
  }(SequentialEvent);

  module.exports = DiasporaAdapter;
});
//# sourceMappingURL=adapter.js.map
