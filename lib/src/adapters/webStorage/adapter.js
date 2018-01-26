'use strict';
const { _, Promise, } = require('../../dependencies');
const Utils = require('../../utils');
const { Diaspora } = require('../../diaspora');
const DiasporaAdapter = Diaspora.components.Adapters.Adapter;
const WebStorageEntity = require('./entity');
/**
 * This class is used to use local storage or session storage as a data store. This adapter should be used only by the browser.
 *
 * @extends Adapters.DiasporaAdapter
 * @memberof Adapters
 */
class WebStorageDiasporaAdapter extends DiasporaAdapter {
    /**
     * Create a new instance of local storage adapter.
     *
     * @author gerkin
     * @param {Object}  config                 - Configuration object.
     * @param {boolean} [config.session=false] - Set to true to use sessionStorage instead of localStorage.
     */
    constructor(config) {
        /**
         * Link to the WebStorageEntity.
         *
         * @name classEntity
         * @type {DataStoreEntities.WebStorageEntity}
         * @memberof Adapters.WebStorageDiasporaAdapter
         * @instance
         * @author Gerkin
         */
        super(WebStorageEntity);
        _.defaults(config, {
            session: false,
        });
        this.state = 'ready';
        /**
         * {@link https://developer.mozilla.org/en-US/docs/Web/API/Storage Storage api} where to store data.
         *
         * @type {Storage}
         * @author Gerkin
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage localStorage} and {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage sessionStorage} on MDN web docs.
         * @see {@link Adapters.WebStorageDiasporaAdapter}:config.session parameter.
         */
        this.source = (true === config.session ? global.sessionStorage : global.localStorage);
    }
    /**
     * Create the collection index and call {@link Adapters.DiasporaAdapter#configureCollection}.
     *
     * @author gerkin
     * @param {string} tableName - Name of the table (usually, model name).
     * @param {Object} remaps    - Associative hash that links entity field names with data source field names.
     * @returns {undefined} This function does not return anything.
     */
    configureCollection(tableName, remaps) {
        super.configureCollection(tableName, remaps);
        this.ensureCollectionExists(tableName);
    }
    // -----
    // ### Utils
    /**
     * Create the table key if it does not exist.
     *
     * @author gerkin
     * @param   {string} table - Name of the table.
     * @returns {string[]} Index of the collection.
     */
    ensureCollectionExists(table) {
        let index = this.source.getItem(table);
        if (_.isNil(index)) {
            index = [];
            this.source.setItem(table, JSON.stringify(index));
        }
        else {
            index = JSON.parse(index);
        }
        return index;
    }
    /**
     * Deduce the item name from table name and item ID.
     *
     * @author gerkin
     * @param   {string} table - Name of the table to construct name for.
     * @param   {string} id    - Id of the item to find.
     * @returns {string} Name of the item.
     */
    getItemName(table, id) {
        return `${table}.id=${id}`;
    }
    // -----
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
    insertOne(table, entity) {
        entity = _.cloneDeep(entity || {});
        entity.id = Utils.generateUUID();
        this.setIdHash(entity);
        try {
            const tableIndex = this.ensureCollectionExists(table);
            tableIndex.push(entity.id);
            this.source.setItem(table, JSON.stringify(tableIndex));
            this.source.setItem(this.getItemName(table, entity.id), JSON.stringify(entity));
        }
        catch (error) {
            return Promise.reject(error);
        }
        return Promise.resolve(this.maybeCastEntity(entity));
    }
    /**
     * Insert several entities in the local storage.
     *
     * @summary This reimplements {@link Adapters.DiasporaAdapter#insertMany}, modified for local storage or session storage interactions.
     * @author gerkin
     * @param   {string}   table    - Name of the table to insert data in.
     * @param   {Object[]} entities - Array of hashes representing entities to insert.
     * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link DataStoreEntities.WebStorageEntity}[]* `entities`).
     */
    insertMany(table, entities) {
        entities = _.cloneDeep(entities);
        try {
            const tableIndex = this.ensureCollectionExists(table);
            entities = entities.map((entity = {}) => {
                entity.id = Utils.generateUUID();
                this.setIdHash(entity);
                tableIndex.push(entity.id);
                this.source.setItem(this.getItemName(table, entity.id), JSON.stringify(entity));
                return new this.classEntity(entity, this);
            });
            this.source.setItem(table, JSON.stringify(tableIndex));
        }
        catch (error) {
            return Promise.reject(error);
        }
        return Promise.resolve(this.maybeCastSet(entities));
    }
    // -----
    // ### Find
    /**
     * Find a single local storage entity using its id.
     *
     * @author gerkin
     * @param   {string} table - Name of the collection to search entity in.
     * @param   {string} id    - Id of the entity to search.
     * @returns {DataStoreEntities.WebStorageEntity|undefined} Found entity, or undefined if not found.
     */
    findOneById(table, id) {
        let item = this.source.getItem(this.getItemName(table, id));
        if (!_.isNil(item)) {
            item = JSON.parse(item);
        }
        return Promise.resolve(this.maybeCastEntity(item));
    }
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
    findOne(table, queryFind, options = {}) {
        _.defaults(options, {
            skip: 0,
        });
        if (!_.isObject(queryFind)) {
            return this.findOneById(table, queryFind);
        }
        else if (_.isEqual(_.keys(queryFind), ['id']) && _.isEqual(_.keys(queryFind.id), ['$equal'])) {
            return this.findOneById(table, queryFind.id.$equal);
        }
        const items = this.ensureCollectionExists(table);
        let returnedItem;
        let matched = 0;
        _.each(items, itemId => {
            const item = JSON.parse(this.source.getItem(this.getItemName(table, itemId)));
            if (this.matchEntity(queryFind, item)) {
                matched++;
                // If we matched enough items
                if (matched > options.skip) {
                    returnedItem = item;
                    return false;
                }
            }
        });
        return Promise.resolve(this.maybeCastEntity(returnedItem));
    }
    // -----
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
    updateOne(table, queryFind, update, options) {
        _.defaults(options, {
            skip: 0,
        });
        return this.findOne(table, queryFind, options).then(entity => {
            if (_.isNil(entity)) {
                return Promise.resolve();
            }
            Utils.applyUpdateEntity(update, entity);
            try {
                this.source.setItem(this.getItemName(table, entity.id), JSON.stringify(entity));
                return Promise.resolve(entity);
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    // -----
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
    deleteOne(table, queryFind, options = {}) {
        return this.findOne(table, queryFind, options).then(entityToDelete => {
            try {
                const tableIndex = this.ensureCollectionExists(table);
                _.pull(tableIndex, entityToDelete.id);
                this.source.setItem(table, JSON.stringify(tableIndex));
                this.source.removeItem(this.getItemName(table, entityToDelete.id));
            }
            catch (error) {
                return Promise.reject(error);
            }
            return Promise.resolve();
        });
    }
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
    deleteMany(table, queryFind, options = {}) {
        try {
            return this.findMany(table, queryFind, options).then(entitiesToDelete => {
                const tableIndex = this.ensureCollectionExists(table);
                _.pullAll(tableIndex, _.map(entitiesToDelete, 'id'));
                this.source.setItem(table, JSON.stringify(tableIndex));
                _.forEach(entitiesToDelete, entityToDelete => {
                    this.source.removeItem(this.getItemName(table, entityToDelete.id));
                });
                return Promise.resolve();
            });
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
}
module.exports = WebStorageDiasporaAdapter;
//# sourceMappingURL=adapter.js.map