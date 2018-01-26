(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    }
    else if (typeof exports !== "undefined") {
        factory();
    }
    else {
        var mod = {
            exports: {}
        };
        factory();
        global.adapter = mod.exports;
    }
})(this, function () {
    'use strict';
    function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }
    var _require = require('../../dependencies'), _ = _require._, Promise = _require.Promise;
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
    function (_DiasporaAdapter) {
        _inheritsLoose(WebStorageDiasporaAdapter, _DiasporaAdapter);
        /**
         * Create a new instance of local storage adapter.
         *
         * @author gerkin
         * @param {Object}  config                 - Configuration object.
         * @param {boolean} [config.session=false] - Set to true to use sessionStorage instead of localStorage.
         */
        function WebStorageDiasporaAdapter(config) {
            var _this;
            /**
             * Link to the WebStorageEntity.
             *
             * @name classEntity
             * @type {DataStoreEntities.WebStorageEntity}
             * @memberof Adapters.WebStorageDiasporaAdapter
             * @instance
             * @author Gerkin
             */
            _this = _DiasporaAdapter.call(this, WebStorageEntity) || this;
            _.defaults(config, {
                session: false
            });
            _this.state = 'ready';
            /**
             * {@link https://developer.mozilla.org/en-US/docs/Web/API/Storage Storage api} where to store data.
             *
             * @type {Storage}
             * @author Gerkin
             * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage localStorage} and {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage sessionStorage} on MDN web docs.
             * @see {@link Adapters.WebStorageDiasporaAdapter}:config.session parameter.
             */
            _this.source = true === config.session ? global.sessionStorage : global.localStorage;
            return _this;
        }
        /**
         * Create the collection index and call {@link Adapters.DiasporaAdapter#configureCollection}.
         *
         * @author gerkin
         * @param {string} tableName - Name of the table (usually, model name).
         * @param {Object} remaps    - Associative hash that links entity field names with data source field names.
         * @returns {undefined} This function does not return anything.
         */
        var _proto = WebStorageDiasporaAdapter.prototype;
        _proto.configureCollection = function configureCollection(tableName, remaps) {
            _DiasporaAdapter.prototype.configureCollection.call(this, tableName, remaps);
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
        _proto.ensureCollectionExists = function ensureCollectionExists(table) {
            var index = this.source.getItem(table);
            if (_.isNil(index)) {
                index = [];
                this.source.setItem(table, JSON.stringify(index));
            }
            else {
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
        _proto.getItemName = function getItemName(table, id) {
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
        _proto.insertOne = function insertOne(table, entity) {
            entity = _.cloneDeep(entity || {});
            entity.id = Utils.generateUUID();
            this.setIdHash(entity);
            try {
                var tableIndex = this.ensureCollectionExists(table);
                tableIndex.push(entity.id);
                this.source.setItem(table, JSON.stringify(tableIndex));
                this.source.setItem(this.getItemName(table, entity.id), JSON.stringify(entity));
            }
            catch (error) {
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
        _proto.insertMany = function insertMany(table, entities) {
            var _this2 = this;
            entities = _.cloneDeep(entities);
            try {
                var tableIndex = this.ensureCollectionExists(table);
                entities = entities.map(function (entity) {
                    if (entity === void 0) {
                        entity = {};
                    }
                    entity.id = Utils.generateUUID();
                    _this2.setIdHash(entity);
                    tableIndex.push(entity.id);
                    _this2.source.setItem(_this2.getItemName(table, entity.id), JSON.stringify(entity));
                    return new _this2.classEntity(entity, _this2);
                });
                this.source.setItem(table, JSON.stringify(tableIndex));
            }
            catch (error) {
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
        _proto.findOneById = function findOneById(table, id) {
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
        _proto.findOne = function findOne(table, queryFind, options) {
            var _this3 = this;
            if (options === void 0) {
                options = {};
            }
            _.defaults(options, {
                skip: 0
            });
            if (!_.isObject(queryFind)) {
                return this.findOneById(table, queryFind);
            }
            else if (_.isEqual(_.keys(queryFind), ['id']) && _.isEqual(_.keys(queryFind.id), ['$equal'])) {
                return this.findOneById(table, queryFind.id.$equal);
            }
            var items = this.ensureCollectionExists(table);
            var returnedItem;
            var matched = 0;
            _.each(items, function (itemId) {
                var item = JSON.parse(_this3.source.getItem(_this3.getItemName(table, itemId)));
                if (_this3.matchEntity(queryFind, item)) {
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
        _proto.updateOne = function updateOne(table, queryFind, update, options) {
            var _this4 = this;
            _.defaults(options, {
                skip: 0
            });
            return this.findOne(table, queryFind, options).then(function (entity) {
                if (_.isNil(entity)) {
                    return Promise.resolve();
                }
                Utils.applyUpdateEntity(update, entity);
                try {
                    _this4.source.setItem(_this4.getItemName(table, entity.id), JSON.stringify(entity));
                    return Promise.resolve(entity);
                }
                catch (error) {
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
        _proto.deleteOne = function deleteOne(table, queryFind, options) {
            var _this5 = this;
            if (options === void 0) {
                options = {};
            }
            return this.findOne(table, queryFind, options).then(function (entityToDelete) {
                try {
                    var tableIndex = _this5.ensureCollectionExists(table);
                    _.pull(tableIndex, entityToDelete.id);
                    _this5.source.setItem(table, JSON.stringify(tableIndex));
                    _this5.source.removeItem(_this5.getItemName(table, entityToDelete.id));
                }
                catch (error) {
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
        _proto.deleteMany = function deleteMany(table, queryFind, options) {
            var _this6 = this;
            if (options === void 0) {
                options = {};
            }
            try {
                return this.findMany(table, queryFind, options).then(function (entitiesToDelete) {
                    var tableIndex = _this6.ensureCollectionExists(table);
                    _.pullAll(tableIndex, _.map(entitiesToDelete, 'id'));
                    _this6.source.setItem(table, JSON.stringify(tableIndex));
                    _.forEach(entitiesToDelete, function (entityToDelete) {
                        _this6.source.removeItem(_this6.getItemName(table, entityToDelete.id));
                    });
                    return Promise.resolve();
                });
            }
            catch (error) {
                return Promise.reject(error);
            }
        };
        return WebStorageDiasporaAdapter;
    }(DiasporaAdapter);
    module.exports = WebStorageDiasporaAdapter;
});
//# sourceMappingURL=adapter.js.map
//# sourceMappingURL=adapter.js.map