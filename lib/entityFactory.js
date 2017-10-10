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
	 * @classdesc An entity is a document in the population of all your datas of the same type
	 * @public
	 * @author gerkin
	 */
	class Entity extends SequentialEvent {
		/**
		 * @constructs Entity
		 * @description Create a new entity
		 * @public
		 * @author gerkin
		 * @param {Object} [source = {}] Hash with properties to copy on the new object
		 */
		constructor( source = {}) {
			super();

			// Stores the object state
			let state = 'orphan';
			let lastDataSource = null;
			const dataSources = Object.seal( _.mapValues( model.dataSources, () => undefined ));

			const entityPrototype = {
				/**
				 * @property {Object} dataSources Hash that links each data source with its name
				 * @memberof Entity
				 * @instance
				 * @public
				 * @author gerkin
				 */
				dataSources: {
					value: dataSources,
				},
				/**
				 * @method toObject
				 * @description Returns a copy of this entity attributes
				 * @memberof Entity
				 * @public
				 * @instance
				 * @author gerkin
				 * @returns {Object} Attributes of this entity
				 */
				toObject: () => {
					return _.omit( attributes, entityPrototypeProperties ); 
				}, 
				/**
				 * @method persist
				 * @description Save this entity in specified data source
				 * @memberof Entity
				 * @public
				 * @instance
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
						promise = this.emit( 'beforeUpdate' );
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
							return this.emit( 'afterUpdate' ).then(() => Promise.resolve( entityProxied ));
						}
					});
				},
				/**
				 * @method fetch
				 * @description Reload this entity from specified data source
				 * @memberof Entity
				 * @public
				 * @instance
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
						promise = this.emit( 'beforeFind' );
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
							return this.emit( 'afterFind' ).then(() => Promise.resolve( entityProxied ));
						}
					});
				},
				/**
				 * @method destroy
				 * @description Delete this entity from the specified data source
				 * @memberof Entity
				 * @public
				 * @instance
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
						promise = this.emit( 'beforeDelete' );
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
							return this.emit( 'afterDelete' ).then(() => Promise.resolve( entityProxied ));
						}
					});
				}, 
				/**
				 * @method getState
				 * @description Return entity's current state.
				 * @memberof Entity
				 * @public
				 * @instance
				 * @author gerkin
				 * @returns {Entity.State} State of this entity
				 */
				state: {
					get() {
						return state; 
					},
				},
				/**
				 * @method getLastDataSource
				 * @description Return entity's last data source
				 * @memberof Entity
				 * @public
				 * @instance
				 * @author gerkin
				 * @returns {String} Name of the last data source used
				 */
				lastDataSource: {
					get() {
						return lastDataSource; 
					},
				},
				/**
				 * @method getUidQuery
				 * @description Generate the query to get this unique entity in the desired data source
				 * @memberof Entity
				 * @public
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
				 * @method getTable
				 * @description Return the table of this entity in the specified data source
				 * @memberof Entity
				 * @public
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
		 * @property {String} name Name of the class
		 * @memberof Entity
		 * @static
		 * @public
		 * @author gerkin
		 */
		name: {
			value:      `${ name  }Entity`,
			writable:   false,
			enumerable: true, 
		},
		/**
		 * @property {Model} model Reference to this entity's model
		 * @memberof Entity
		 * @static
		 * @public
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

module.exports = EntityFactory;
