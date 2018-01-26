(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["core-js/modules/es7.array.includes", "core-js/modules/es6.string.includes", "core-js/modules/es6.function.name", "core-js/modules/es6.array.find"], factory);
  } else if (typeof exports !== "undefined") {
    factory(require("core-js/modules/es7.array.includes"), require("core-js/modules/es6.string.includes"), require("core-js/modules/es6.function.name"), require("core-js/modules/es6.array.find"));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.es7Array, global.es6String, global.es6Function, global.es6Array);
    global.adapter = mod.exports;
  }
})(this, function (_es7Array, _es6String, _es6Function, _es6Array) {
  'use strict';

  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

  var _require = require('../../dependencies'),
      _ = _require._,
      Promise = _require.Promise;

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
      var _this;

      /**
       * Link to the InMemoryEntity.
       *
       * @name classEntity
       * @type {DataStoreEntities.InMemoryEntity}
       * @memberof Adapters.InMemoryDiasporaAdapter
       * @instance
       * @author Gerkin
       */
      _this = _DiasporaAdapter.call(this, InMemoryEntity) || this;
      _this.state = 'ready';
      /**
       * Plain old javascript object used as data store.
       *
       * @author Gerkin
       */

      _this.store = {};
      return _this;
    }
    /**
     * Create the data store and call {@link Adapters.DiasporaAdapter#configureCollection}.
     *
     * @author gerkin
     * @param   {string} tableName - Name of the table (usually, model name).
     * @param   {Object} remaps    - Associative hash that links entity field names with data source field names.
     * @returns {undefined} This function does not return anything.
     */


    var _proto = InMemoryDiasporaAdapter.prototype;

    _proto.configureCollection = function configureCollection(tableName, remaps) {
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


    _proto.ensureCollectionExists = function ensureCollectionExists(table) {
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


    _proto.insertOne = function insertOne(table, entity) {
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


    _proto.findOne = function findOne(table, queryFind, options) {
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


    _proto.findMany = function findMany(table, queryFind, options) {
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


    _proto.updateOne = function updateOne(table, queryFind, update, options) {
      var _this2 = this;

      if (options === void 0) {
        options = {};
      }

      return this.findOne(table, queryFind, options).then(function (found) {
        if (!_.isNil(found)) {
          var storeTable = _this2.ensureCollectionExists(table);

          var match = _.find(storeTable.items, {
            id: found.id
          });

          Utils.applyUpdateEntity(update, match);
          return Promise.resolve(_this2.maybeCastEntity(match));
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


    _proto.updateMany = function updateMany(table, queryFind, update, options) {
      var _this3 = this;

      if (options === void 0) {
        options = {};
      }

      return this.findMany(table, queryFind, options).then(function (found) {
        if (!_.isNil(found) && found.length > 0) {
          var storeTable = _this3.ensureCollectionExists(table);

          var foundIds = _.map(found, 'id');

          var matches = _.filter(storeTable.items, function (item) {
            return -1 !== foundIds.indexOf(item.id);
          });

          return Promise.resolve(_this3.maybeCastSet(_.map(matches, function (item) {
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


    _proto.deleteOne = function deleteOne(table, queryFind, options) {
      var _this4 = this;

      if (options === void 0) {
        options = {};
      }

      var storeTable = this.ensureCollectionExists(table);
      return this.findOne(table, queryFind, options).then(function (entityToDelete) {
        if (!_.isNil(entityToDelete)) {
          storeTable.items = _.reject(storeTable.items, function (entity) {
            return entity.id === entityToDelete.idHash[_this4.name];
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


    _proto.deleteMany = function deleteMany(table, queryFind, options) {
      var _this5 = this;

      if (options === void 0) {
        options = {};
      }

      var storeTable = this.ensureCollectionExists(table);
      return this.findMany(table, queryFind, options).then(function (entitiesToDelete) {
        var entitiesIds = _.map(entitiesToDelete, function (entity) {
          return _.get(entity, "idHash." + _this5.name);
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
});
//# sourceMappingURL=adapter.js.map
