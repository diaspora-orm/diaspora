'use strict';

const SequentialEvent = require( 'sequential-event' );
const _ = require('lodash');
const c = require('check-types');
const Promise = require('bluebird');

/**
 * @typedef {Object} QueryOptions
 * @public
 * @instance
 * @author gerkin
 * @property {Integer} skip=0 Number of items to skip
 * @property {Integer} limit=Infinity Number of items to get
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
	constructor( classEntity ) {
		super();
		this.classEntity = classEntity;
	}

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
			}
			this.on( 'ready', () => {
				return resolve( this );
			}).on( 'error', err => {
				return reject( err );
			});
		});
	}

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
	insertOne(table, entity){
		console.log('Base Adapter insertOne');
		return this.insertMany(table, [entity]).then(entities => Promise.resolve(l.first(entities)));
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
	insertMany(table, entities){
		console.log('Base Adapter insertMany');
		return Promise.map(entities, entity => this.insertOne(table, entity));
	}

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
	findOne(table, queryFind, options = {}){
		console.log('Base Adapter findOne');
		options.limit = 1;
		return this.findMany(table, queryFind, options).then(entities => Promise.resolve(l.first(entities)));
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
	findMany(table, queryFind, options = {}){
		console.log('Base Adapter findMany');
		const foundEntities = [];
		let skip = 0;

		// We are going to loop until we find enough items
		const loopFind = found => {
			// If the search returned nothing, then just finish the findMany
			if(!c.assigned(found)){
				return Promise.resolve(foundEntities);
				// Else, if this is a value and not the initial `true`, add it to the list
			} else if(found !== true){
				foundEntities.push(found);
			}
			// If we found enough items, return them
			if(skip === options.limit){
				return promise.resolve(foundEntities);
			}
			options.skip = skip;
			// Next time we'll skip 1 more item
			skip++;
			// Do the query & loop
			return this.findOne(table, queryFind, options).then(loopFind);
		}
		return loopFind(true);
	}

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
	updateOne(table, queryFind, update, options = {}){
		console.log('Base Adapter updateOne');
		options.limit = 1;
		return this.updateMany(table, queryFind, update, options).then(entities => Promise.resolve(l.first(entities)));
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
	updateMany(table, queryFind, update, options = {}){
		console.log('Base Adapter updateMany');
		const foundEntities = [];
		let skip = 0;

		// We are going to loop until we find enough items
		const loopFind = found => {
			// If the search returned nothing, then just finish the findMany
			if(!c.assigned(found)){
				return Promise.resolve(foundEntities);
				// Else, if this is a value and not the initial `true`, add it to the list
			} else if(found !== true){
				foundEntities.push(found);
			}
			// If we found enough items, return them
			if(skip === options.limit){
				return promise.resolve(foundEntities);
			}
			options.skip = skip;
			// Next time we'll skip 1 more item
			skip++;
			// Do the query & loop
			return this.updateOne(table, queryFind, update, options).then(loopFind);
		}
		return loopFind(true);
	}

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
	deleteOne(table, queryFind, options = {}){
		console.log('Base Adapter deleteOne');
		options.limit = 1;
		return this.deleteMany(table, queryFind, options);
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
	deleteMany(table, queryFind, update, options = {}){
		console.log('Base Adapter deleteMany');
		let count = 0;

		// We are going to loop until we find enough items
		const loopFind = () => {
			// First, search for the item.
			return this.findOne(table, queryFind, options).then(found => {
				// If the search returned nothing, then just finish the findMany
				if(!c.assigned(found)){
					return Promise.resolve();
					// Else, if this is a value and not the initial `true`, add it to the list
				}
				// If we found enough items, return them
				if(count === options.limit){
					return promise.resolve();
				}
				// Increase our counter
				count++;
				// Do the deletion & loop
				return this.deleteOne(table, queryFind, update, options).then(loopFind);
			});
		}
		return loopFind(true);
	}
}

module.exports = DiasporaAdapter;
