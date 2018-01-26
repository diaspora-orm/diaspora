(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["core-js/modules/es6.function.name", "core-js/modules/es6.symbol"], factory);
    }
    else if (typeof exports !== "undefined") {
        factory(require("core-js/modules/es6.function.name"), require("core-js/modules/es6.symbol"));
    }
    else {
        var mod = {
            exports: {}
        };
        factory(global.es6Function, global.es6);
        global.entityFactory = mod.exports;
    }
})(this, function (_es6Function, _es) {
    'use strict';
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor)
            descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps)
        _defineProperties(Constructor.prototype, protoProps); if (staticProps)
        _defineProperties(Constructor, staticProps); return Constructor; }
    function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }
    function _assertThisInitialized(self) { if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    } return self; }
    var _require = require('./dependencies'), _ = _require._, Promise = _require.Promise, SequentialEvent = _require.SequentialEvent;
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
        }
        else {
            return entity.emit.apply(entity, [events[0]].concat(eventsArgs)).then(function () {
                if (events.length > 1) {
                    return maybeEmit(entity, options, eventsArgs, _.slice(events, 1));
                }
                else {
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
            }
            else {
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
    function (_SequentialEvent) {
        _inheritsLoose(Entity, _SequentialEvent);
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
            var _this2;
            if (source === void 0) {
                source = {};
            }
            var modelAttrsKeys = _.keys(modelDesc.attributes);
            _this2 = _SequentialEvent.call(this) || this; // ### Init defaults
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
            _this2[PRIVATE] = _this; // ### Cast types if required
            source = entityCtrSteps.castTypes(source, modelDesc); // ### Load datas from source
            source = entityCtrSteps.loadSource(_assertThisInitialized(_this2), source); // ### Final validation
            // Check keys provided in source
            var sourceDModel = _.difference(source, modelAttrsKeys);
            if (0 !== sourceDModel.length) {
                // Later, add a criteria for schemaless models
                throw new Error("Source has unknown keys: " + JSON.stringify(sourceDModel) + " in " + JSON.stringify(source));
            } // ### Generate prototype & attributes
            // Now we know that the source is valid. Deep clone to detach object values from entity then Default model attributes with our model desc
            _this.attributes = Diaspora.default(_.cloneDeep(source), modelDesc.attributes);
            source = null; // ### Load events
            entityCtrSteps.bindLifecycleEvents(_assertThisInitialized(_this2), modelDesc);
            return _this2;
        }
        /**
         * Generate the query to get this unique entity in the desired data source.
         *
         * @author gerkin
         * @param   {Adapters.DiasporaAdapter} dataSource - Name of the data source to get query for.
         * @returns {Object} Query to find this entity.
         */
        var _proto = Entity.prototype;
        _proto.uidQuery = function uidQuery(dataSource) {
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
        _proto.table = function table() {
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
        _proto.validate = function validate() {
            this.constructor.model.validator.validate(this[PRIVATE].attributes);
        };
        /**
         * Remove all editable properties & replace them with provided object.
         *
         * @author gerkin
         * @param   {Object} [newContent={}] - Replacement content.
         * @returns {module:EntityFactory~Entity} Returns `this`.
         */
        _proto.replaceAttributes = function replaceAttributes(newContent) {
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
        _proto.getDiff = function getDiff(dataSource) {
            var _this3 = this;
            var dataStoreEntity = this[PRIVATE].dataSources[dataSource.name];
            var dataStoreObject = dataStoreEntity.toObject();
            var keys = _(this[PRIVATE].attributes).keys().concat(_.keys(dataStoreObject)).uniq().difference(['idHash']).value();
            var values = _.map(keys, function (key) {
                return _this3[PRIVATE].attributes[key];
            });
            var diff = _.omitBy(_.zipObject(keys, values), function (val, key) {
                return _.isEqual(_this3[PRIVATE].attributes[key], dataStoreObject[key]);
            });
            return diff;
        };
        /**
         * Returns a copy of this entity attributes.
         *
         * @author gerkin
         * @returns {Object} Attributes of this entity.
         */
        _proto.toObject = function toObject() {
            return this[PRIVATE].attributes;
        };
        /**
         * Applied before persisting the entity, this function is in charge to convert entity convinient attributes to a raw entity.
         *
         * @author gerkin
         * @param   {Object} data - Data to convert to primitive types.
         * @returns {Object} Object with Primitives-only types.
         */
        _proto.serialize = function serialize(data) {
            return _.cloneDeep(data);
        };
        /**
         * Applied after retrieving the entity, this function is in charge to convert entity raw attributes to convinient types.
         *
         * @author gerkin
         * @param   {Object} data - Data to convert from primitive types.
         * @returns {Object} Object with Primitives & non primitives types.
         */
        _proto.deserialize = function deserialize(data) {
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
        _proto.persist = function persist(sourceName, options) {
            var _this4 = this;
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
                return _this4.validate();
            }).then(function () {
                return _maybeEmit(['afterValidate', "beforePersist" + suffix]);
            }).then(function () {
                _this4[PRIVATE].lastDataSource = dataSource.name; // Depending on state, we are going to perform a different operation
                if ('orphan' === beforeState) {
                    return dataSource.insertOne(_this4.table(sourceName), _this4.toObject());
                }
                else {
                    return dataSource.updateOne(_this4.table(sourceName), _this4.uidQuery(dataSource), _this4.getDiff(dataSource));
                }
            }).then(function (dataStoreEntity) {
                entityCtrSteps.castTypes(dataStoreEntity, _this4[PRIVATE].modelDesc);
                _this4[PRIVATE].state = 'sync';
                _this4[PRIVATE].attributes = dataStoreEntity.toObject();
                _this4[PRIVATE].dataSources[dataSource.name] = dataStoreEntity;
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
        _proto.fetch = function fetch(sourceName, options) {
            var _this5 = this;
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
                entityCtrSteps.castTypes(dataStoreEntity, _this5[PRIVATE].modelDesc);
                _this5[PRIVATE].state = 'sync';
                _this5[PRIVATE].attributes = dataStoreEntity.toObject();
                _this5[PRIVATE].dataSources[dataSource.name] = dataStoreEntity;
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
        _proto.destroy = function destroy(sourceName, options) {
            var _this6 = this;
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
                if (0 === _.without(_this6[PRIVATE].model.dataSources, dataSource.name).length) {
                    _this6[PRIVATE].state = 'orphan';
                }
                else {
                    _this6[PRIVATE].state = 'sync';
                    delete _this6[PRIVATE].attributes.idHash[dataSource.name];
                }
                _this6[PRIVATE].dataSources[dataSource.name] = undefined;
                return _maybeEmit('afterDestroy');
            });
        };
        /**
         * Get the ID for the given source name.
         *
         * @param   {string} sourceName - Name of the source to get ID from.
         * @returns {string} Id of this entity in requested data source.
         */
        _proto.getId = function getId(sourceName) {
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
});
//# sourceMappingURL=entityFactory.js.map
//# sourceMappingURL=entityFactory.js.map