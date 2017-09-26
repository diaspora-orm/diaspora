'use strict';

const _ = require( 'lodash' );
const c = require( 'check-types' );
const Promise = require( 'bluebird' );
const DiasporaAdapter = require( './baseAdapter.js' );
const InMemoryEntity = require( '../dataStoreEntities/inMemoryEntity.js' );

/**
 * @class InMemoryDiasporaAdapter
 * @classdesc This class is used to use the memory as a data store. Every data you insert are stored in an array contained by this class. This adapter can be used by both the browser & Node.JS
 * @extends Adapters.DiasporaAdapter
 * @description Create a new In Memory data store
 * @memberof Adapters
 * @public
 * @author gerkin
 * @param {Object} [config] Options hash. Currently, this adapter does not have any options
 */
class InMemoryDiasporaAdapter extends DiasporaAdapter {
	constructor( config ) {
		super( InMemoryEntity );
		this.state = 'ready';
		this.store = {};
	}

	// -----
	// ### Utils

	/**
	 * @method generateUUID
	 * @description Create a new unique id for this store's entity
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @returns {String} Generated unique id
	 */
	generateUUID() {
		var d = new Date().getTime();
		// Use high-precision timer if available
		if ( 'undefined' !== typeof window && window.performance && 'function' === typeof window.performance.now ) {
			d += performance.now();
		}
		const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, c => {
			const r = ( d + Math.random() * 16 ) % 16 | 0;
			d = Math.floor( d / 16 );
			return ( 'x' === c ? r : ( r & 0x3 | 0x8 )).toString( 16 );
		});
		return uuid;
	}

	/**
	 * @method getSafeTableExists
	 * @description Get or create the store hash
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table
	 * @returns {DataStoreTable} In memory table to use
	 */
	getSafeTableExists( table ) {
		if ( this.store.hasOwnProperty( table )) {
			return this.store[table];
		} else {
			return this.store[table] = {
				items: [],
			};
		} 
	}

	/**
	 * @method applyOptionsToSet
	 * @description Reduce, offset or sort provided set
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {Object[]} set  Objects retrieved from memory store
	 * @param   {Object} options Options to apply to the set
	 * @returns {Object[]} Set with options applied
	 */
	static applyOptionsToSet( set, options ) {
		_.defaults( options, {
			limit: Infinity,
			skip:  0,
		});
		set = set.slice( options.skip );
		if ( set.length > options.limit ) {
			set = set.slice( 0, options.limit );
		}
		return set;
	}

	// -----
	// ### Insert

	/**
	 * @method insertOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for in-memory interactions.
	 * @description Insert a single entity in the memory store.
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to insert data in
	 * @param   {Object} entity Hash representing the entity to insert
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link InMemoryEntity}* `entity`)
	 */
	insertOne( table, entity ) {
		entity = _.cloneDeep( entity );
		const storeTable = this.getSafeTableExists( table );
		entity.id = this.generateUUID();
		this.setIdHash( entity );
		storeTable.items.push( entity );
		return Promise.resolve( new this.classEntity( entity, this ));
	}

	// -----
	// ### Find

	/**
	 * @method findOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for in-memory interactions.
	 * @description Retrieve a single entity from the memory.
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to retrieve data from
	 * @param   {SelectQueryOrCondition} queryFind Hash representing the entity to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link InMemoryEntity}* `entity`)
	 */
	findOne( table, queryFind, options = {}) {
		const storeTable = this.getSafeTableExists( table );
		const matches = _.filter( storeTable.items, _.partial( this.matchEntity, queryFind ));
		const reducedMatches = this.constructor.applyOptionsToSet( matches, options );
		return Promise.resolve( reducedMatches.length > 0 ? new this.classEntity( _.first( reducedMatches ), this ) : undefined);
	}

	/**
	 * @method findMany
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#findMany}, modified for in-memory interactions.
	 * @description Retrieve several entities from the memory.
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to retrieve data from
	 * @param   {SelectQueryOrCondition} queryFind Hash representing entities to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once items are found. Called with (*{@link InMemoryEntity}[]* `entities`)
	 */
	findMany( table, queryFind, options = {}) {
		const storeTable = this.getSafeTableExists( table );
		const matches = _.filter( storeTable.items, _.partial( this.matchEntity, queryFind ));
		const reducedMatches = this.constructor.applyOptionsToSet( matches, options );
		return Promise.resolve( _.map( reducedMatches, entity => new this.classEntity( entity, this )));
	}

	// -----
	// ### Update

	/**
	 * @method updateOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for in-memory interactions.
	 * @description Update a single entity in the memory.
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to update data in
	 * @param   {SelectQueryOrCondition} queryFind Hash representing the entity to find
	 * @param   {Object} update Object properties to set
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once update is done. Called with (*{@link InMemoryEntity}* `entity`)
	 */
	updateOne( table, queryFind, update, options = {}) {
		const storeTable = this.getSafeTableExists( table );
		const matches = _.filter( storeTable.items, _.partial( this.matchEntity, queryFind ));
		const firstMatch = _.first( matches );
		this.applyUpdateEntity( update, firstMatch );
		return Promise.resolve( new this.classEntity( firstMatch ));
	}

	/**
	 * @method updateMany
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateMany}, modified for in-memory interactions.
	 * @description Update several entities in the memory.
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to update data in
	 * @param   {SelectQueryOrCondition} queryFind Hash representing entities to find
	 * @param   {Object} update Object properties to set
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once update is done. Called with (*{@link InMemoryEntity}[]* `entities`)
	 */
	updateMany( table, queryFind, update, options = {}) {
		const storeTable = this.getSafeTableExists( table );
		const matches = _.filter( storeTable.items, _.partial( this.matchEntity, queryFind ));
		const reducedMatches = this.constructor.applyOptionsToSet( matches, options );
		_.forEach( reducedMatches, match => {
			this.applyUpdateEntity( update, match );
		});
		return Promise.resolve( _.map( reducedMatches, entity => new this.classEntity( entity, this )));
	}

	// -----
	// ### Delete

	/**
	 * @method deleteOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for in-memory interactions.
	 * @description Delete a single entity from the memory.
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to delete data from
	 * @param   {SelectQueryOrCondition} queryFind Hash representing the entity to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*undefined*)
	 */
	deleteOne( table, queryFind, options = {}) {
		const storeTable = this.getSafeTableExists( table );
		return this.findOne( table, queryFind, options ).then( entityToDelete => {
			storeTable.items = _.reject( storeTable.items, entity => entity.id === entityToDelete.idHash[this.name]);
			return Promise.resolve();
		});
	}

	/**
	 * @method deleteMany
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteMany}, modified for in-memory interactions.
	 * @description Delete several entities from the memory.
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to delete data from
	 * @param   {SelectQueryOrCondition} queryFind Hash representing entities to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once items are deleted. Called with (*undefined*)
	 */
	deleteMany( table, queryFind, options = {}) {
		const storeTable = this.getSafeTableExists( table );
		return this.findMany( table, queryFind, options ).then( entitiesToDelete => {
			const entitiesIds = _.map( entitiesToDelete, entity => _.get( entity, `idHash.${ this.name }` ));
			storeTable.items = _.reject( storeTable.items, entity => {
				return _.includes( entitiesIds, entity.id );
			});
			return Promise.resolve();
		});
	}
}

module.exports = InMemoryDiasporaAdapter;
