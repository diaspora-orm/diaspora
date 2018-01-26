'use strict';
const { _, Promise, SequentialEvent, } = require('./dependencies');
const { Diaspora } = require('./diaspora');
const DataStoreEntity = Diaspora.components.Adapters.Entity;
const EntityStateError = require('./errors/entityStateError');
/**
 * @module EntityFactory
 */
const DEFAULT_OPTIONS = { skipEvents: false };
const PRIVATE = Symbol('PRIVATE');
const maybeEmit = (entity, options, eventsArgs, events) => {
    events = _.castArray(events);
    if (options.skipEvents) {
        return Promise.resolve(entity);
    }
    else {
        return entity.emit(events[0], ...eventsArgs).then(() => {
            if (events.length > 1) {
                return maybeEmit(entity, options, eventsArgs, _.slice(events, 1));
            }
            else {
                return Promise.resolve(entity);
            }
        });
    }
};
const maybeThrowInvalidEntityState = (entity, beforeState, dataSource, method) => {
    return () => {
        // Depending on state, we are going to perform a different operation
        if ('orphan' === beforeState) {
            return Promise.reject(new EntityStateError('Can\'t fetch an orphan entity.'));
        }
        else {
            entity[PRIVATE].lastDataSource = dataSource.name;
            return dataSource[method](entity.table(dataSource.name), entity.uidQuery(dataSource));
        }
    };
};
const entityCtrSteps = {
    castTypes(source, modelDesc) {
        const attrs = modelDesc.attributes;
        _.forEach(source, (currentVal, attrName) => {
            const attrDesc = attrs[attrName];
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
    loadSource(entity, source) {
        // If we construct our Entity from a datastore entity (that can happen internally in Diaspora), set it to `sync` state
        if (source instanceof DataStoreEntity) {
            const _entity = entity[PRIVATE];
            _.assign(_entity, {
                state: 'sync',
                lastDataSource: source.dataSource.name,
            });
            _entity.dataSources[_entity.lastDataSource] = source;
            source = entity.deserialize(_.omit(source.toObject(), ['id']));
        }
        return source;
    },
    bindLifecycleEvents(entity, modelDesc) {
        // Bind lifecycle events
        _.forEach(modelDesc.lifecycleEvents, (eventFunctions, eventName) => {
            // Iterate on each event functions. `_.castArray` will ensure we iterate on an array if a single function is provided.
            _.forEach(_.castArray(eventFunctions), eventFunction => {
                entity.on(eventName, eventFunction);
            });
        });
    },
};
/**
 * The entity is the class you use to manage a single document in all data sources managed by your model.
 * > Note that this class is proxied: you may try to access to undocumented class properties to get entity's data attributes
 *
 * @extends SequentialEvent
 */
class Entity extends SequentialEvent {
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
    constructor(name, modelDesc, model, source = {}) {
        const modelAttrsKeys = _.keys(modelDesc.attributes);
        super();
        // ### Init defaults
        const dataSources = Object.seal(_.mapValues(model.dataSources, () => undefined));
        const _this = {
            state: 'orphan',
            lastDataSource: null,
            dataSources,
            name,
            modelDesc,
            model,
        };
        this[PRIVATE] = _this;
        // ### Cast types if required
        source = entityCtrSteps.castTypes(source, modelDesc);
        // ### Load datas from source
        source = entityCtrSteps.loadSource(this, source);
        // ### Final validation
        // Check keys provided in source
        const sourceDModel = _.difference(source, modelAttrsKeys);
        if (0 !== sourceDModel.length) {
            throw new Error(`Source has unknown keys: ${JSON.stringify(sourceDModel)} in ${JSON.stringify(source)}`);
        }
        // ### Generate prototype & attributes
        // Now we know that the source is valid. Deep clone to detach object values from entity then Default model attributes with our model desc
        _this.attributes = Diaspora.default(_.cloneDeep(source), modelDesc.attributes);
        source = null;
        // ### Load events
        entityCtrSteps.bindLifecycleEvents(this, modelDesc);
    }
    /**
     * Generate the query to get this unique entity in the desired data source.
     *
     * @author gerkin
     * @param   {Adapters.DiasporaAdapter} dataSource - Name of the data source to get query for.
     * @returns {Object} Query to find this entity.
     */
    uidQuery(dataSource) {
        return {
            id: this[PRIVATE].attributes.idHash[dataSource.name],
        };
    }
    /**
     * Return the table of this entity in the specified data source.
     *
     * @author gerkin
     * @returns {string} Name of the table.
     */
    table() {
        // Will be used later
        return this[PRIVATE].name;
    }
    /**
     * Check if the entity matches model description.
     *
     * @author gerkin
     * @throws EntityValidationError Thrown if validation failed. This breaks event chain and prevent persistance.
     * @returns {undefined} This function does not return anything.
     * @see Validator.Validator#validate
     */
    validate() {
        this.constructor.model.validator.validate(this[PRIVATE].attributes);
    }
    /**
     * Remove all editable properties & replace them with provided object.
     *
     * @author gerkin
     * @param   {Object} [newContent={}] - Replacement content.
     * @returns {module:EntityFactory~Entity} Returns `this`.
     */
    replaceAttributes(newContent = {}) {
        newContent.idHash = this[PRIVATE].attributes.idHash;
        this[PRIVATE].attributes = newContent;
        return this;
    }
    /**
     * Generate a diff update query by checking deltas with last source interaction.
     *
     * @author gerkin
     * @param   {Adapters.DiasporaAdapter} dataSource - Data source to diff with.
     * @returns {Object} Diff query.
     */
    getDiff(dataSource) {
        const dataStoreEntity = this[PRIVATE].dataSources[dataSource.name];
        const dataStoreObject = dataStoreEntity.toObject();
        const keys = _(this[PRIVATE].attributes).keys().concat(_.keys(dataStoreObject)).uniq().difference(['idHash']).value();
        const values = _.map(keys, key => this[PRIVATE].attributes[key]);
        const diff = _.omitBy(_.zipObject(keys, values), (val, key) => _.isEqual(this[PRIVATE].attributes[key], dataStoreObject[key]));
        return diff;
    }
    /**
     * Returns a copy of this entity attributes.
     *
     * @author gerkin
     * @returns {Object} Attributes of this entity.
     */
    toObject() {
        return this[PRIVATE].attributes;
    }
    /**
     * Applied before persisting the entity, this function is in charge to convert entity convinient attributes to a raw entity.
     *
     * @author gerkin
     * @param   {Object} data - Data to convert to primitive types.
     * @returns {Object} Object with Primitives-only types.
     */
    serialize(data) {
        return _.cloneDeep(data);
    }
    /**
     * Applied after retrieving the entity, this function is in charge to convert entity raw attributes to convinient types.
     *
     * @author gerkin
     * @param   {Object} data - Data to convert from primitive types.
     * @returns {Object} Object with Primitives & non primitives types.
     */
    deserialize(data) {
        return _.cloneDeep(data);
    }
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
    persist(sourceName, options = {}) {
        _.defaults(options, DEFAULT_OPTIONS);
        // Change the state of the entity
        const beforeState = this[PRIVATE].state;
        this[PRIVATE].state = 'syncing';
        // Generate events args
        const dataSource = this.constructor.model.getDataSource(sourceName);
        const eventsArgs = [dataSource.name];
        const _maybeEmit = _.partial(maybeEmit, this, options, eventsArgs);
        // Get suffix. If entity was orphan, we are creating. Otherwise, we are updating
        const suffix = 'orphan' === beforeState ? 'Create' : 'Update';
        return _maybeEmit(['beforePersist', 'beforeValidate'])
            .then(() => this.validate())
            .then(() => _maybeEmit(['afterValidate', `beforePersist${suffix}`]))
            .then(() => {
            this[PRIVATE].lastDataSource = dataSource.name;
            // Depending on state, we are going to perform a different operation
            if ('orphan' === beforeState) {
                return dataSource.insertOne(this.table(sourceName), this.toObject());
            }
            else {
                return dataSource.updateOne(this.table(sourceName), this.uidQuery(dataSource), this.getDiff(dataSource));
            }
        })
            .then(dataStoreEntity => {
            entityCtrSteps.castTypes(dataStoreEntity, this[PRIVATE].modelDesc);
            this[PRIVATE].state = 'sync';
            this[PRIVATE].attributes = dataStoreEntity.toObject();
            this[PRIVATE].dataSources[dataSource.name] = dataStoreEntity;
            return _maybeEmit([`afterPersist${suffix}`, 'afterPersist']);
        });
    }
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
    fetch(sourceName, options = {}) {
        _.defaults(options, DEFAULT_OPTIONS);
        // Change the state of the entity
        const beforeState = this[PRIVATE].state;
        this[PRIVATE].state = 'syncing';
        // Generate events args
        const dataSource = this.constructor.model.getDataSource(sourceName);
        const eventsArgs = [dataSource.name, this.serialize(this[PRIVATE].attributes)];
        const _maybeEmit = _.partial(maybeEmit, this, options, eventsArgs);
        return _maybeEmit('beforeFetch')
            .then(maybeThrowInvalidEntityState(this, beforeState, dataSource, 'findOne'))
            .then(dataStoreEntity => {
            entityCtrSteps.castTypes(dataStoreEntity, this[PRIVATE].modelDesc);
            this[PRIVATE].state = 'sync';
            this[PRIVATE].attributes = dataStoreEntity.toObject();
            this[PRIVATE].dataSources[dataSource.name] = dataStoreEntity;
            return _maybeEmit('afterFetch');
        });
    }
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
    destroy(sourceName, options = {}) {
        _.defaults(options, DEFAULT_OPTIONS);
        // Change the state of the entity
        const beforeState = this[PRIVATE].state;
        this[PRIVATE].state = 'syncing';
        // Generate events args
        const dataSource = this.constructor.model.getDataSource(sourceName);
        const eventsArgs = [dataSource.name];
        const _maybeEmit = _.partial(maybeEmit, this, options, eventsArgs);
        return _maybeEmit('beforeDestroy')
            .then(maybeThrowInvalidEntityState(this, beforeState, dataSource, 'deleteOne'))
            .then(() => {
            // If this was our only data source, then go back to orphan state
            if (0 === _.without(this[PRIVATE].model.dataSources, dataSource.name).length) {
                this[PRIVATE].state = 'orphan';
            }
            else {
                this[PRIVATE].state = 'sync';
                delete this[PRIVATE].attributes.idHash[dataSource.name];
            }
            this[PRIVATE].dataSources[dataSource.name] = undefined;
            return _maybeEmit('afterDestroy');
        });
    }
    /**
     * Get the ID for the given source name.
     *
     * @param   {string} sourceName - Name of the source to get ID from.
     * @returns {string} Id of this entity in requested data source.
     */
    getId(sourceName) {
        const dataSource = this.constructor.model.getDataSource(sourceName);
        return this[PRIVATE].dataSources[dataSource.name].id;
    }
    /**
     * Hash that links each data source with its name. This object is prepared with keys from model sources, and sealed.
     *
     * @type {Object}
     * @author gerkin
     */
    get dataSources() {
        return this[PRIVATE].dataSources;
    }
    /**
     * TODO.
     *
     * @type {TODO}
     * @author gerkin
     */
    get attributes() {
        return this[PRIVATE].attributes;
    }
    /**
     * Get entity's current state.
     *
     * @type {Entity.State}
     * @author gerkin
     */
    get state() {
        return this[PRIVATE].state;
    }
    /**
     * Get entity's last data source.
     *
     * @type {null|string}
     * @author gerkin
     */
    get lastDataSource() {
        return this[PRIVATE].lastDataSource;
    }
}
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
const EntityFactory = (name, modelDesc, model) => {
    /**
     * @ignore
     */
    class SubEntity extends Entity {
        /**
         * Name of the class.
         *
         * @type {string}
         * @author gerkin
         */
        static get name() {
            return `${name}Entity`;
        }
        /**
         * Reference to this entity's model.
         *
         * @type {Model}
         * @author gerkin
         */
        static get model() {
            return model;
        }
    }
    // We use keys `methods` and not `functions` as explained in this [StackOverflow thread](https://stackoverflow.com/a/155655/4839162).
    // Extend prototype with methods in our model description
    _.forEach(modelDesc.methods, (method, methodName) => {
        SubEntity.prototype[methodName] = method;
    });
    // Add static methods
    _.forEach(modelDesc.staticMethods, (staticMethodName, staticMethod) => {
        SubEntity[staticMethodName] = staticMethod;
    });
    return SubEntity.bind(SubEntity, name, modelDesc, model);
};
EntityFactory.Entity = Entity;
// =====
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
//# sourceMappingURL=entityFactory.js.map