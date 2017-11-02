'use strict';

const {
	_, Promise, SequentialEvent,
} = require( './dependencies' );
const Diaspora = require( './diaspora' );
const DataStoreEntity = require( './dataStoreEntities/baseEntity' );
const EntityValidationError = require( './errors/entityValidationError' );
const EntityStateError = require( './errors/entityStateError' );
const Utils = require( './utils' );

/**
 * @namespace EntityFactory
 */

const DEFAULT_OPTIONS = { skipEvents: false };
const PRIVATE = Symbol( 'PRIVATE' );

const maybeEmit = ( entity, options, eventsArgs, events ) => {
	events = _.castArray( events );
	if ( options.skipEvents ) {
		return Promise.resolve( entity );
	} else {
		return entity.emit( events[0], ...eventsArgs ).then(() => {
			if ( events.length > 1 ) {
				return maybeEmit( entity, options, eventsArgs, _.slice( events, 1 ));
			} else {
				return Promise.resolve( entity );
			}
		});
	}
};

class Entity extends SequentialEvent {
	/**
	 * Create a new entity.
	 *
	 * @author gerkin
	 * @param {Object|DataStoreEntities.DataStoreEntity} [source={}] - Hash with properties to copy on the new object.
	 *        If provided object inherits DataStoreEntity, the constructed entity is built in `sync` state.
	 */
	constructor( name, modelDesc, model, source = {}) {
		const modelAttrsKeys = _.keys( modelDesc.attributes );
		super();

		// ### Init defaults
		const _this = {
			state:          'orphan',
			lastDataSource: null,
			dataSources:    Object.seal( _.mapValues( model.dataSources, () => undefined )),
			name,
			modelDesc,
			model,
		};
		this[PRIVATE] = _this;
		// ### Load datas from source
		// If we construct our Entity from a datastore entity (that can happen internally in Diaspora), set it to `sync` state
		if ( source instanceof DataStoreEntity ) {
			_.assign( _this, {
				state:          'sync',
				lastDataSource: source.dataSource.name,
			});
			_this.dataSources[_this.lastDataSource] = source;
			source = _.omit( source.toObject(), [ 'id' ]);
		}
		// ### Final validation
		// Check keys provided in source
		const sourceDModel = _.difference( source, modelAttrsKeys );
		if ( 0 !== sourceDModel.length ) { // Later, add a criteria for schemaless models
			throw new Error( `Source has unknown keys: ${ JSON.stringify( sourceDModel ) } in ${ JSON.stringify( source ) }` );
		}
		// ### Generate prototype & attributes
		// Now we know that the source is valid. First, deeply clone to detach object values from entity
		_this.attributes = _.cloneDeep( source );
		source = null;
		// Default model attributes with our model desc
		Diaspora.default( _this.attributes, modelDesc.attributes );

		// ### Load events
		// Bind lifecycle events
		_.forEach( modelDesc.lifecycleEvents, ( eventFunctions, eventName ) => {
			// Iterate on each event functions. `_.castArray` will ensure we iterate on an array if a single function is provided.
			_.forEach( _.castArray( eventFunctions ), eventFunction => {
				this.on( eventName, eventFunction );
			});
		});
	}

	/**
	 * Generate the query to get this unique entity in the desired data source.
	 *
	 * @memberof EntityFactory.Entity
	 * @instance
	 * @author gerkin
	 * @param   {Adapters.DiasporaAdapter} dataSource - Name of the data source to get query for.
	 * @returns {Object} Query to find this entity.
	 */
	uidQuery( dataSource ) {
		return {
			id: this[PRIVATE].attributes.idHash[dataSource.name],
		};
	}

	/**
	 * Return the table of this entity in the specified data source.
	 *
	 * @memberof EntityFactory.Entity
	 * @instance
	 * @author gerkin
	 * @returns {string} Name of the table.
	 */
	table( /*sourceName*/ ) {
		// Will be used later
		return this[PRIVATE].name;
	}

	/**
	 * Check if the entity matches model description.
	 *
	 * @memberof EntityFactory.Entity
	 * @instance
	 * @author gerkin
	 * @throws EntityValidationError Thrown if validation failed. This breaks event chain and prevent persistance.
	 * @returns {undefined} This function does not return anything.
	 * @see Diaspora.check
	 */
	validate() {
		const validationErrors = Diaspora.check( this[PRIVATE].attributes, this[PRIVATE].modelDesc.attributes );
		if ( !_.isEmpty( validationErrors )) {
			throw new EntityValidationError( validationErrors, 'Validation failed' );
		}
	}

	/**
	 * Remove all editable properties & replace them with provided object.
	 *
	 * @memberof EntityFactory.Entity
	 * @instance
	 * @author gerkin
	 * @param   {Object} [newContent={}] - Replacement content.
	 * @returns {EntityFactory.Entity} Returns `this`.
	 */
	replaceAttributes( newContent = {}) {
		newContent.idHash = this[PRIVATE].attributes.idHash;
		this[PRIVATE].attributes = newContent;
		return this;
	}

	/**
	 * Generate a diff update query by checking deltas with last source interaction.
	 *
	 * @memberof EntityFactory.Entity
	 * @instance
	 * @author gerkin
	 * @param   {Adapters.DiasporaAdapter} dataSource - Data source to diff with.
	 * @returns {Object} Diff query.
	 */
	getDiff( dataSource ) {
		const dataStoreEntity = this[PRIVATE].dataSources[dataSource.name];
		const dataStoreObject = dataStoreEntity.toObject();

		const keys = _( this[PRIVATE].attributes ).keys().concat( _.keys( dataStoreObject )).uniq().difference([ 'idHash' ]).value();
		const values = _( keys ).filter( key => {
			return this[PRIVATE].attributes[key] !== dataStoreObject[key];
		}).map( key => {
			return this[PRIVATE].attributes[key];
		}).value();
		const diff = _.zipObject( keys, values );
		return diff;
	}

	/**
	 * Returns a copy of this entity attributes.
	 *
	 * @memberof EntityFactory.Entity
	 * @instance
	 * @author gerkin
	 * @returns {Object} Attributes of this entity.
	 */
	toObject() {
		return this[PRIVATE].attributes;
	}

	/**
	 * Save this entity in specified data source.
	 *
	 * @memberof EntityFactory.Entity
	 * @instance
	 * @fires EntityFactory.Entity#beforeUpdate
	 * @fires EntityFactory.Entity#afterUpdate
	 * @author gerkin
	 * @param   {string}  sourceName                 - Name of the data source to persist entity in.
	 * @param   {Object}  [options]                  - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
	 * @param   {boolean} [options.skipEvents=false] - If true, won't trigger events `beforeUpdate` and `afterUpdate`.
	 * @returns {Promise} Promise resolved once entity is saved. Resolved with `this`.
		 */
	persist( sourceName, options = {}) {
		_.defaults( options, DEFAULT_OPTIONS );
		// Change the state of the entity
		const beforeState = this[PRIVATE].state;
		this[PRIVATE].state = 'syncing';
		// Generate events args
		const dataSource = this.constructor.model.getDataSource( sourceName );
		const eventsArgs = [ dataSource.name ];
		const _maybeEmit = _.partial( maybeEmit, this, options, eventsArgs );

		// Get suffix. If entity was orphan, we are creating. Otherwise, we are updating
		const suffix = 'orphan' === beforeState ? 'Create' : 'Update';
		return _maybeEmit([ 'beforePersist', 'beforeValidate' ])
			.then(() => this.validate())
			.then(() => _maybeEmit([ 'afterValidate', `beforePersist${ suffix }` ]))
			.then(() => {
				this[PRIVATE].lastDataSource = dataSource.name;
				// Depending on state, we are going to perform a different operation
				if ( 'orphan' === beforeState ) {
					return dataSource.insertOne( this.table( sourceName ), this.toObject());
				} else {
					return dataSource.updateOne( this.table( sourceName ), this.uidQuery( dataSource ), this.getDiff( dataSource ));
				}
			})
			.then( dataStoreEntity => {
				this[PRIVATE].state = 'sync';
				this[PRIVATE].attributes = dataStoreEntity.toObject();
				this[PRIVATE].dataSources[dataSource.name] = dataStoreEntity;

				return _maybeEmit([ `afterPersist${ suffix }`, 'afterPersist' ]);
			});
	}

	/**
	 * Reload this entity from specified data source.
	 *
	 * @memberof EntityFactory.Entity
	 * @instance
	 * @fires EntityFactory.Entity#beforeFind
	 * @fires EntityFactory.Entity#afterFind
	 * @author gerkin
	 * @param   {string}  sourceName                 - Name of the data source to fetch entity from.
	 * @param   {Object}  [options]                  - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
	 * @param   {boolean} [options.skipEvents=false] - If true, won't trigger events `beforeFind` and `afterFind`.
	 * @returns {Promise} Promise resolved once entity is reloaded. Resolved with `this`.
	 */
	fetch( sourceName, options = {}) {
		_.defaults( options, DEFAULT_OPTIONS );
		// Change the state of the entity
		const beforeState = this[PRIVATE].state;
		this[PRIVATE].state = 'syncing';
		// Generate events args
		const dataSource = this.constructor.model.getDataSource( sourceName );
		const eventsArgs = [ dataSource.name ];
		const _maybeEmit = _.partial( maybeEmit, this, options, eventsArgs );
		return _maybeEmit( 'beforeFetch' )
			.then(() => {
			// Depending on state, we are going to perform a different operation
				if ( 'orphan' === beforeState ) {
					return Promise.reject( new EntityStateError( 'Can\'t fetch an orphan entity.' ));
				} else {
					this[PRIVATE].lastDataSource = dataSource.name;
					return dataSource.findOne( this.table( sourceName ), this.uidQuery( dataSource ));
				}
			})
			.then( dataStoreEntity => {
				this[PRIVATE].state = 'sync';
				this[PRIVATE].attributes = dataStoreEntity.toObject();
				this[PRIVATE].dataSources[dataSource.name] = dataStoreEntity;

				return _maybeEmit( 'afterFetch' );
			});
	}

	/**
	 * Delete this entity from the specified data source.
	 *
	 * @memberof EntityFactory.Entity
	 * @instance
	 * @fires EntityFactory.Entity#beforeDelete
	 * @fires EntityFactory.Entity#afterDelete
	 * @author gerkin
	 * @param   {string}  sourceName                 - Name of the data source to delete entity from.
	 * @param   {Object}  [options]                  - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
	 * @param   {boolean} [options.skipEvents=false] - If true, won't trigger events `beforeDelete` and `afterDelete`.
	 * @returns {Promise} Promise resolved once entity is destroyed. Resolved with `this`.
	 */
	destroy( sourceName, options = {}) {
		_.defaults( options, DEFAULT_OPTIONS );
		// Change the state of the entity
		const beforeState = this[PRIVATE].state;
		this[PRIVATE].state = 'syncing';
		// Generate events args
		const dataSource = this.constructor.model.getDataSource( sourceName );
		const eventsArgs = [ dataSource.name ];
		const _maybeEmit = _.partial( maybeEmit, this, options, eventsArgs );
		return _maybeEmit( 'beforeDestroy' )
			.then(() => {
				if ( 'orphan' === beforeState ) {
					return Promise.reject( new EntityStateError( 'Can\'t fetch an orphan entity.' ));
				} else {
					this[PRIVATE].lastDataSource = dataSource.name;
					return dataSource.deleteOne( this.table( sourceName ), this.uidQuery( dataSource ));
				}
			})
			.then(() => {
			// If this was our only data source, then go back to orphan state
				if ( 0 === _.without( this[PRIVATE].model.dataSources, dataSource.name ).length ) {
					this[PRIVATE].state = 'orphan';
				} else {
					this[PRIVATE].state = 'sync';
					delete this[PRIVATE].attributes.idHash[dataSource.name];
				}
				this[PRIVATE].dataSources[dataSource.name] = undefined;
				return _maybeEmit( 'afterDestroy' );
			});
	}

	/**
	 * Hash that links each data source with its name. This object is prepared with keys from model sources, and sealed.
	 *
	 * @name dataSources
	 * @readonly
	 * @type {Object}
	 * @memberof EntityFactory.Entity
	 * @instance
	 * @author gerkin
	 */
	get dataSources() {
		return this[PRIVATE].dataSources;
	}

	/**
	 * TODO.
	 *
	 * @name dataSources
	 * @readonly
	 * @type {TODO}
	 * @memberof EntityFactory.Entity
	 * @instance
	 * @author gerkin
	 */
	get attributes() {
		return this[PRIVATE].attributes;
	}

	/**
	 * Get entity's current state.
	 *
	 * @name dataSources
	 * @readonly
	 * @type {Entity.State}
	 * @memberof EntityFactory.Entity
	 * @instance
	 * @author gerkin
	 */
	get state() {
		return this[PRIVATE].state;
	}

	/**
	 * Get entity's last data source.
	 *
	 * @name lastDataSources
	 * @readonly
	 * @type {null|string}
	 * @memberof EntityFactory.Entity
	 * @instance
	 * @author gerkin
	 */
	get lastDataSource() {
		return this[PRIVATE].lastDataSource;
	}
}

class EntityFactory {
	constructor( name, modelDesc, model ) {
		class SubEntity extends Entity {
			/**
			 * Name of the class.
			 *
			 * @type {string}
			 * @readonly
			 * @memberof EntityFactory.Entity
			 * @static
			 * @author gerkin
			 */
			static get name() {
				return `${ name  }Entity`;
			}
			/**
			 * Reference to this entity's model.
			 *
			 * @type {Model}
			 * @readonly
			 * @memberof EntityFactory.Entity
			 * @static
			 * @author gerkin
			 */
			static get model() {
				return model;
			}
		}
		/*const EntityWrapped = Object.defineProperties( SubEntity, {
			name: {
				value:      `${ name  }Entity`,
				writable:   false,
				enumerable: true,
			},
			model: {
				value:      model,
				writable:   false,
				enumerable: true,
			},
		});*/
		// We use keys `methods` and not `functions` as explained in this [StackOverflow thread](https://stackoverflow.com/a/155655/4839162).
		// Extend prototype with methods in our model description
		_.forEach( modelDesc.methods, ( methodName, method ) => {
			SubEntity.__proto__[methodName] = method;
		});
		// Add static methods
		_.forEach( modelDesc.staticMethods, ( staticMethodName, staticMethod ) => {
			SubEntity[staticMethodName] = staticMethod;
		});
		return SubEntity.bind( Entity, name, modelDesc, model );
	}
}
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
