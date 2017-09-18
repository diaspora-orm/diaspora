'use strict';

const SequentialEvent = require( 'sequential-event' );
const _ = require( 'lodash' );
const c = require( 'check-types' );
const Promise = require( 'bluebird' );

/**
 * @typedef {Object} QueryOptions
 * @public
 * @instance
 * @author gerkin
 * @property {Integer} skip=0 Number of items to skip
 * @property {Integer} limit=Infinity Number of items to get
 * @property {Boolean} remapInput=true Flag indicating if adapter input should be remapped or not. TODO Remapping doc
 * @property {Boolean} remapOutput=true Flag indicating if adapter output should be remapped or not. TODO Remapping doc
 */

/**
 * @typedef {Object} SelectQuery
 * @public
 * @instance
 * @author gerkin
 * @property {Any|SelectQueryCondition} * Fields to search. If not providing an object, find items with a property value that equals this value
 */
/**
 * @typedef {Object} SelectQueryCondition
 * @description By default, all conditions in a single SelectQueryCondition are combined with an `AND` operator
 * @public
 * @instance
 * @author gerkin
 * @property {Any} $equals Match if item value is equal to this. Objects and array are compared deeply. **Alias: `==`**
 * @property {Any} $diff Match if item value is different to this. Objects and array are compared deeply. **Alias: `!=`** **NOT IMPLEMENTED YET**
 * @property {Integer} $less Match if item value is less than this. **Alias: `<`** **NOT IMPLEMENTED YET**
 * @property {Integer} $lessEqual Match if item value is less than this or equals to this. **Alias: `<=`** **NOT IMPLEMENTED YET**
 * @property {Integer} $greater Match if item value is greater than this. **Alias: `>`** **NOT IMPLEMENTED YET**
 * @property {Integer} $greaterEqual Match if item value is greater than this or equals to this. **Alias: `>=`** **NOT IMPLEMENTED 
 * @property {SelectQueryCondition[]} $or Match if *one of* the conditions in the array is true. **Alias: `||`** **NOT IMPLEMENTED YET**
 * @property {SelectQueryCondition[]} $and Match if *all* the conditions in the array are true. Optional, because several conditions in a single SelectQueryCondition are combined with an `AND` operator. **Alias: `&&`** **NOT IMPLEMENTED YET**
 * @property {SelectQueryCondition} $not Invert the condition **Alias: `!`** **NOT IMPLEMENTED YET**
 * @property {String} $contains On string, it will check if query is included in item using GLOB. **NOT IMPLEMENTED YET**
 * @property {SelectQueryCondition|Any} $contains On array, it will check if item contains the query. **NOT IMPLEMENTED YET**
 */

/**
 * @namespace Adapters
 */

/**
 * @class DiasporaAdapter
 * @classdesc DiasporaAdapter is the base class of adapters. Adapters are components that are in charge to interact with data sources (files, databases, etc etc) with standardized methods. You should not use this class directly: extend this class and re-implement some methods to build an adapter. See the (upcoming) tutorial section.
 * @memberof Adapters
 * @public
 * @author gerkin
 * @param {DataStoreEntity} classEntity Class used to spawn source entities
 */
class DiasporaAdapter extends SequentialEvent {
	constructor( classEntity, remaps = {}, filters = {}) {
		super();
		this.remaps = remaps;
		this.remapsInverted = _.invert( remaps );
		this.classEntity = classEntity;
		this.filters = filters;
		this.on( 'ready', () => {
			this.state = 'ready';
		}).on( 'error', err => {
			this.state = 'error';
			this.error = err;
		});
	}
	
	// -----
	// ### Utils

	/**
	 * @method waitReady
	 * @description Returns a promise resolved once adapter state is ready
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @returns {Promise} Promise resolved when adapter is ready, and rejected if an error occured
	 */
	waitReady() {
		return new Promise(( resolve, reject ) => {
			if ( 'ready' === this.state ) {
				return resolve( this );
			} else if ( 'error' === this.state ) {
				return reject( this.error );
			}
			this.on( 'ready', () => {
				return resolve( this );
			}).on( 'error', err => {
				return reject( err );
			});
		});
	}
	
	/**
	 * @method remapInput
	 * @description TODO
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @see TODO remapping
	 * @param   {String} table  Name of the table for which we remap
	 * @param   {Object} query Hash representing the entity to remap
	 * @returns {Object} Remapped object
	 */
	remapInput( table, query ) {
		if ( !c.assigned( query )) {
			return query;
		}
		const filtered = _.mapValues( query, ( value, key ) => {
			if ( this.filters.input.hasOwnProperty( key )) {
				return this.filters.input[key]( value );
			}
			return value;
		});
		const remaped = _.mapKeys( filtered, ( value, key ) => {
			if ( this.remaps.hasOwnProperty( key )) {
				return this.remaps[key];
			}
			return key;
		});
		return remaped;
	}
	
	/**
	 * @method remapOutput
	 * @description TODO
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @see TODO remapping
	 * @param   {String} table  Name of the table for which we remap
	 * @param   {Object} query Hash representing the entity to remap
	 * @returns {Object} Remapped object
	 */
	remapOutput( table, query ) {
		if ( !c.assigned( query )) {
			return query;
		}
		const filtered = _.mapValues( query, ( value, key ) => {
			if ( this.filters.output.hasOwnProperty( key )) {
				return this.filters.output[key]( value );
			}
			return value;
		});
		const remaped = _.mapKeys( filtered, ( value, key ) => {
			if ( this.remapsInverted.hasOwnProperty( key )) {
				return this.remapsInverted[key];
			}
			return key;
		});
		return remaped;
	}
	
	setIdHash( entity, propName = 'id' ) {
		entity.idHash = _.assign({}, entity.idHash, {
			[this.name]: entity[propName],
		});
		return entity;
	}
	
	matchEntity(query, entity){
		const matchResult = _.every(_.toPairs(query), ([key, val]) => {
			if('undefined' === typeof val){
				if('undefined' === typeof entity[key]){
					return true;
				}
			} else {
				if(val === entity[key]){
					return true;
				}
			}
			return false;
		});
		return matchResult;
	}
	
	applyUpdateEntity(update, entity){
		_.forEach(update, (val, key) => {
			if(c.undefined(val)){
				delete entity[key];
			} else {
				entity[key] = val;
			}
		})
	}
	
	// -----
	// ### Insert

	/**
	 * @method insertOne
	 * @summary At least one of {@link insertOne} or {@link insertMany} must be reimplemented by adapter
	 * @description Insert a single entity in the data store. This function is a default polyfill if the inheriting adapter does not provide `insertOne` itself
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to insert data in
	 * @param   {Object} entity Hash representing the entity to insert
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link DataStoreEntity}* entity)
	 */
	insertOne( table, entity ) {
		return this.insertMany( table, [ entity ]).then( entities => Promise.resolve( _.first( entities )));
	}

	/**
	 * @method insertMany
	 * @summary At least one of {@link insertOne} or {@link insertMany} must be reimplemented by adapter
	 * @description Insert several entities in the data store. This function is a default polyfill if the inheriting adapter does not provide `insertMany` itself
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to insert data in
	 * @param   {Object[]} entities Array of hashs representing the entities to insert
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link DataStoreEntity}[]* entities)
	 */
	insertMany( table, entities ) {
		return Promise.mapSeries( entities, entity => this.insertOne( table, entity || {} ));
	}
	
	// -----
	// ### Find

	/**
	 * @method findOne
	 * @summary At least one of {@link findOne} or {@link findMany} must be reimplemented by adapter
	 * @description Retrieve a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `findOne` itself
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to retrieve data from
	 * @param   {Object} queryFind Hash representing the entity to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}* `entity`)
	 */
	findOne( table, queryFind, options = {}) {
		options.limit = 1;
		return this.findMany( table, queryFind, options ).then( entities => Promise.resolve( _.first( entities )));
	}

	/**
	 * @method findMany
	 * @summary At least one of {@link findOne} or {@link findMany} must be reimplemented by adapter
	 * @description Retrieve several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `findMany` itself
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to retrieve data from
	 * @param   {Object} queryFind Hash representing entities to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`)
	 */
	findMany( table, queryFind, options = {}) {
		const foundEntities = [];
		let skip = 0;

		// We are going to loop until we find enough items
		const loopFind = found => {
			// If the search returned nothing, then just finish the findMany
			if ( !c.assigned( found )) {
				return Promise.resolve( foundEntities );
				// Else, if this is a value and not the initial `true`, add it to the list
			} else if ( found !== true ) {
				foundEntities.push( found );
			}
			// If we found enough items, return them
			if ( skip === options.limit ) {
				return Promise.resolve( foundEntities );
			}
			options.skip = skip;
			// Next time we'll skip 1 more item
			skip++;
			// Do the query & loop
			return this.findOne( table, queryFind, options ).then( loopFind );
		};
		return loopFind( true );
	}
	
	// -----
	// ### Update

	/**
	 * @method updateOne
	 * @summary At least one of {@link updateOne} or {@link updateMany} must be reimplemented by adapter
	 * @description Update a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `updateOne` itself
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to retrieve data from
	 * @param   {Object} queryFind Hash representing the entity to find
	 * @param   {Object} update Object properties to set
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}* `entity`)
	 */
	updateOne( table, queryFind, update, options = {}) {
		options.limit = 1;
		return this.updateMany( table, queryFind, update, options ).then( entities => Promise.resolve( _.first( entities )));
	}

	/**
	 * @method updateMany
	 * @summary At least one of {@link updateOne} or {@link updateMany} must be reimplemented by adapter
	 * @description Update several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `updateMany` itself
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to retrieve data from
	 * @param   {Object} queryFind Hash representing entities to find
	 * @param   {Object} update Object properties to set
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`)
	 */
	updateMany( table, queryFind, update, options = {}) {
		const foundEntities = [];
		let skip = 0;

		// We are going to loop until we find enough items
		const loopFind = found => {
			// If the search returned nothing, then just finish the findMany
			if ( !c.assigned( found )) {
				return Promise.resolve( foundEntities );
				// Else, if this is a value and not the initial `true`, add it to the list
			} else if ( found !== true ) {
				foundEntities.push( found );
			}
			// If we found enough items, return them
			if ( skip === options.limit ) {
				return Promise.resolve( foundEntities );
			}
			options.skip = skip;
			// Next time we'll skip 1 more item
			skip++;
			// Do the query & loop
			return this.updateOne( table, queryFind, update, options ).then( loopFind );
		};
		return loopFind( true );
	}
	
	// -----
	// ### Delete

	/**
	 * @method deleteOne
	 * @summary At least one of {@link deleteOne} or {@link deleteMany} must be reimplemented by adapter
	 * @description Update a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `deleteOne` itself
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to delete data from
	 * @param   {Object} queryFind Hash representing the entities to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}* `entity`)
	 */
	deleteOne( table, queryFind, options = {}) {
		options.limit = 1;
		return this.deleteMany( table, queryFind, options );
	}

	/**
	 * @method deleteMany
	 * @summary At least one of {@link deleteOne} or {@link deleteMany} must be reimplemented by adapter
	 * @description Update several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `deleteMany` itself
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to delete data from
	 * @param   {Object} queryFind Hash representing the entities to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`)
	 */
	deleteMany( table, queryFind, options = {}) {
		let count = 0;

		// We are going to loop until we find enough items
		const loopFind = () => {
			// First, search for the item.
			return this.findOne( table, queryFind, options ).then( found => {
				// If the search returned nothing, then just finish the findMany
				if ( !c.assigned( found )) {
					return Promise.resolve();
					// Else, if this is a value and not the initial `true`, add it to the list
				}
				// If we found enough items, return them
				if ( count === options.limit ) {
					return Promise.resolve();
				}
				// Increase our counter
				count++;
				// Do the deletion & loop
				return this.deleteOne( table, queryFind, options ).then( loopFind );
			});
		};
		return loopFind( true );
	}
}

module.exports = DiasporaAdapter;
