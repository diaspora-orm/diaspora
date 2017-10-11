'use strict';

const {
	_, Promise, SequentialEvent,
} = require( 'lib/dependencies' );
const Diaspora = require( './diaspora' );
const DataStoreEntity = require( 'lib/dataStoreEntities/baseEntity' );
const ValidationError = require( 'lib/validationError' );
const Utils = require( 'lib/utils' );

function EntityFactory( name, modelAttrs, model ) {
	const modelAttrsKeys = _.keys( modelAttrs );

	/**
	 * The entity is the class you use to manage a single document in all data sources managed by your model. 
	 * > Note that this class is proxied: you may try to access to undocumented class properties to get entity's data attributes
	 * @summary An entity is a document in the population of all your datas of the same type
	 * @extends SequentialEvent
	 */
	class Entity extends SequentialEvent {
		/**
		 * Create a new entity
		 * @author gerkin
		 * @param {Object|DataStoreEntities.DataStoreEntity} [source = {}] Hash with properties to copy on the new object.  
		 * If provided object inherits DataStoreEntity, the constructed entity is built in `sync` state
		 */
		constructor( source = {}) {
			super();

			// Stores the object state
			let state = 'orphan';
			let lastDataSource = null;
			const dataSources = Object.seal( _.mapValues( model.dataSources, () => undefined ));

			const entityPrototype = {
				/**
				 * Hash that links each data source with its name. This object is prepared with keys from model sources, and sealed.
				 * @name dataSources
				 * @readonly
				 * @type {Object}
				 * @memberof Entity
				 * @instance
				 * @author gerkin
				 */
				dataSources: {
					value: dataSources,
				},
				/**
				 * Returns a copy of this entity attributes
				 * @method toObject
				 * @memberof Entity
				 * @instance
				 * @author gerkin
				 * @returns {Object} Attributes of this entity
				 */
				toObject: () => {
					return _.omit( attributes, entityPrototypeProperties ); 
				}, 
				/**
				 * Save this entity in specified data source
				 * @method persist
				 * @memberof Entity
				 * @instance
				 * @fires Entity#beforeUpdate
				 * @fires Entity#afterUpdate
				 * @author gerkin
				 * @param {String} sourceName Name of the data source to persist entity in
				 * @param {Object} [options] Hash of options for this query
				 * @param {Boolean} [options.skipEvents=false] If true, won't trigger events `beforeUpdate` and `afterUpdate`
				 * @returns {Promise} Promise resolved once entity is saved. Resolved with `this`
				 */
				persist: ( sourceName, options = {}) => {
					_.defaults( options, {
						skipEvents: false,
					});
					const dataSource = this.constructor.model.getDataSource( sourceName );
					const beforeState = state;
					state = 'syncing';
					let promise;
					if ( options.skipEvents ) {
						promise = Promise.resolve();
					} else {
						promise = this.emit( 'beforeUpdate', sourceName );
					}
					return promise.then(() => {
						let promise;
						// Depending on state, we are going to perform a different operation
						if ( 'orphan' === beforeState ) {
							promise = dataSource.insertOne( this.table( sourceName ), this.toObject());
						} else {
							promise = dataSource.updateOne( this.table( sourceName ), this.uidQuery( dataSource ), this.toObject());
						}
						lastDataSource = dataSource.name;
						return promise;
					}).then( dataStoreEntity => {
						state = 'sync';
						entityDefined.dataSources[dataSource.name] = dataStoreEntity;
						attributes = dataStoreEntity.toObject();
						if ( options.skipEvents ) {
							return  Promise.resolve( entityProxied );
						} else {
							return this.emit( 'afterUpdate', sourceName ).then(() => Promise.resolve( entityProxied ));
						}
					});
				},
				/**
				 * Reload this entity from specified data source
				 * @method fetch
				 * @memberof Entity
				 * @instance
				 * @fires Entity#beforeFind
				 * @fires Entity#afterFind
				 * @author gerkin
				 * @param {String} sourceName Name of the data source to fetch entity from
				 * @param {Object} [options] Hash of options for this query
				 * @param {Boolean} [options.skipEvents=false] If true, won't trigger events `beforeUpdate` and `afterUpdate`
				 * @returns {Promise} Promise resolved once entity is reloaded. Resolved with `this`
				 */
				fetch: ( sourceName, options = {}) => {
					_.defaults( options, {
						skipEvents: false,
					});
					const dataSource = this.constructor.model.getDataSource( sourceName );
					const beforeState = state;
					state = 'syncing';
					let promise;
					if ( options.skipEvents ) {
						promise = Promise.resolve();
					} else {
						promise = this.emit( 'beforeFind', sourceName );
					}
					return promise.then(() => {
						let promise;
						// Depending on state, we are going to perform a different operation
						if ( 'orphan' === beforeState ) {
							promise = Promise.reject( 'Can\'t fetch an orphan entity' );
						} else {
							promise = dataSource.findOne( this.table( sourceName ), this.uidQuery( dataSource ));
						}
						lastDataSource = dataSource.name;
						return promise;
					}).then( dataStoreEntity => {
						state = 'sync';
						entityDefined.dataSources[dataSource.name] = dataStoreEntity;
						attributes = dataStoreEntity.toObject();
						if ( options.skipEvents ) {
							return  Promise.resolve( entityProxied );
						} else {
							return this.emit( 'afterFind', sourceName ).then(() => Promise.resolve( entityProxied ));
						}
					});
				},
				/**
				 * Delete this entity from the specified data source
				 * @method destroy
				 * @memberof Entity
				 * @instance
				 * @fires Entity#beforeDelete
				 * @fires Entity#afterDelete
				 * @author gerkin
				 * @param {String} sourceName Name of the data source to delete entity from
				 * @param {Object} [options] Hash of options for this query
				 * @param {Boolean} [options.skipEvents=false] If true, won't trigger events `beforeUpdate` and `afterUpdate`
				 * @returns {Promise} Promise resolved once entity is destroyed. Resolved with `this`
				 */
				destroy: ( sourceName, options = {}) => {
					_.defaults( options, {
						skipEvents: false,
					});
					const dataSource = this.constructor.model.getDataSource( sourceName );
					const beforeState = state;
					state = 'syncing';
					let promise;
					if ( options.skipEvents ) {
						promise = Promise.resolve();
					} else {
						promise = this.emit( 'beforeDelete', sourceName );
					}
					return promise.then(() => {
						let promise;
						if ( 'orphan' === beforeState ) {
							promise = Promise.reject( new Error( 'Can\'t destroy an orphan entity' ));
						} else {
							promise = dataSource.deleteOne( this.table( sourceName ), this.uidQuery( dataSource ));
						}
						lastDataSource = dataSource.name;
						return promise;
					}).then( dataStoreEntity => {
						// If this was our only data source, then go back to orphan state
						if ( 0 === _.without( model.dataSources, dataSource.name ).length ) {
							state = 'orphan';
						} else {
							state = 'sync';
							delete attributes.idHash[dataSource.name];
						}
						entityDefined.dataSources[dataSource.name] = undefined;
						dataStoreEntity = null;
						if ( options.skipEvents ) {
							return  Promise.resolve( entityProxied );
						} else {
							return this.emit( 'afterDelete', sourceName ).then(() => Promise.resolve( entityProxied ));
						}
					});
				},
				/**
				 * Get entity's current state
				 * @name dataSources
				 * @readonly
				 * @type {Entity.State}
				 * @memberof Entity
				 * @instance
				 * @author gerkin
				 */
				state: {
					get() {
						return state; 
					},
				},
				/**
				 * Get entity's last data source
				 * @name dataSources
				 * @readonly
				 * @type {null|String}
				 * @memberof Entity
				 * @instance
				 * @author gerkin
				 */
				lastDataSource: {
					get() {
						return lastDataSource; 
					},
				},
				/**
				 * Generate the query to get this unique entity in the desired data source
				 * @method uidQuery
				 * @memberof Entity
				 * @instance
				 * @author gerkin
				 * @param {Adapters.DiasporaAdapter} dataSource 
				 * @returns {Object} Query to find this entity
				 */
				uidQuery( dataSource ) {
					return {
						id: attributes.idHash[dataSource.name],
					};
				},
				/**
				 * Return the table of this entity in the specified data source
				 * @method table
				 * @memberof Entity
				 * @instance
				 * @author gerkin
				 * @param {String} sourceName Name of the data source to persist entity in
				 * @returns {String} Name of the table
				 */
				table( sourceName ) {
					return name;
				},
			};
			const entityPrototypeProperties = _.keys( entityPrototype );

			// If we construct our Entity from a datastore entity (that can happen internally in Diaspora), set it to `sync` state
			if ( source instanceof DataStoreEntity ) {
				state = 'sync';
				lastDataSource = source.dataSource.name;
				dataSources[lastDataSource] = source;
				source = _.omit( source.toObject(), [ 'id' ]);
			}
			// Check keys provided in source
			const sourceKeys = _.keys( source );
			// Check if there is an intersection with reserved, and have differences with model attributes
			const sourceUReserved = _.intersection( source, entityPrototypeProperties );
			if ( 0 !== sourceUReserved.length ) {
				throw new Error( `Source has reserved keys: ${ JSON.stringify( sourceUReserved ) } in ${ JSON.stringify( source ) }` );
			}
			const sourceDModel = _.difference( source, modelAttrsKeys );
			if ( 0 !== sourceDModel.length ) { // Later, add a criteria for schemaless models
				throw new Error( `Source has unknown keys: ${ JSON.stringify( sourceDModel ) } in ${ JSON.stringify( source ) }` );
			}
			// Now we know that the source is valid. First, deeply clone to detach object values from entity
			let attributes = _.cloneDeep( source );
			// Free the source
			source = null;
			// Default model attributes with our model desc
			Diaspora.default( attributes, modelAttrs );

			/**
			 * Check if the entity matches model description
			 * @method beforeUpdateValidate
			 * @memberof Entity
			 * @inner
			 * @listens Entity#beforeUpdate
			 * @author gerkin
			 * @throws ValidationError Thrown if validation failed. This breaks event chain and prevent persistance.
			 * @returns {undefined}
			 * @see Diaspora.check
			 */
			this.on( 'beforeUpdate', () => {
				const validationErrors = Diaspora.check( attributes, modelAttrs );
				if ( !_.isEmpty( validationErrors )) {
					throw new ValidationError( validationErrors, 'Validation failed' );
				}
			});

			// Define getters & setters
			const entityDefined = Utils.defineEnumerableProperties( this, entityPrototype );
			const entityProxied = new Proxy( entityDefined, {
				get: ( obj, key ) => {
					if ( 'constructor' === key ) {
						return entityDefined[key];
					}
					if ( key in entityDefined ) {
						return entityDefined[key];
					}
					return attributes[key];
				},
				set: ( obj, key, value ) => {
					if ( key in entityDefined && !super.hasOwnProperty( key )) {
						console.warn( `Trying to define read-only key ${ key }.` );
						return value;
					}
					return attributes[key] = value;
				},
				enumerate: obj => {
					return _.keys( attributes );
				},
				ownKeys: obj => {
					return _( attributes ).keys().concat( entityPrototypeProperties ).value();
				},
				has: ( obj, key ) => {
					return attributes.hasOwnProperty( key );
				},
			});

			return entityProxied;
		}
	}
	const EntityWrapped = Object.defineProperties( Entity, {
		/**
		 * Name of the class
		 * @type {String}
		 * @readonly
		 * @memberof Entity
		 * @static
		 * @author gerkin
		 */
		name: {
			value:      `${ name  }Entity`,
			writable:   false,
			enumerable: true, 
		},
		/**
		 * Reference to this entity's model
		 * @type {Model}
		 * @readonly
		 * @memberof Entity
		 * @static
		 * @author gerkin
		 */
		model: {
			value:      model,
			writable:   false,
			enumerable: true, 
		},
	});
	return EntityWrapped;
}

// -----
// ### Events

/**
 * Fired before updating this entity in the data source. Argument is the data source name to update
 * @event Entity#beforeUpdate
 * @type {String}
 */

/**
 * Fired after updating this entity in the data source. Argument is the data source name updated
 * @event Entity#afterUpdate
 * @type {String}
 */

/**
 * Fired before reloading this entity from the data source. Argument is the data source name to search in
 * @event Entity#beforeFind
 * @type {String}
 */

/**
 * Fired after reloading this entity from the data source. Argument is the data source name searched in
 * @event Entity#afterFind
 * @type {String}
 */

/**
 * Fired before deleting this entity from the data source. Argument is the data source name to delete from
 * @event Entity#beforeDelete
 * @type {String}
 */

/**
 * Fired after deleting this entity from the data source. Argument is the data source name deleted from
 * @event Entity#afterDelete
 * @type {String}
 */

module.exports = EntityFactory;
