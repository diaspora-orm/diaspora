'use strict';

const SequentialEvent = require( 'sequential-event' );
const _ = require('lodash');
const c = require('check-types');
const Promise = require('bluebird');

/**
 * @class DiasporaAdapter
 * @classdesc DiasporaAdapter is the base class of adapters. Adapters are components that are in charge to interact with data sources (files, databases, etc etc) with standardized methods. You should not use this class directly: extend this class and re-implement some methods to build an adapter. See the (upcoming) tutorial section.
 * @memberof module:Diaspora
 */
class DiasporaAdapter extends SequentialEvent {
	constructor( classEntity ) {
		super();
		this.classEntity = classEntity;
	}

	/**
	 * @method waitReady
	 * @description Returns a promise resolved once adapter state is ready
	 * @memberof module:Diaspora.DiasporaAdapter
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
	 * @memberof module:Diaspora.DiasporaAdapter
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
	 * @memberof module:Diaspora.DiasporaAdapter
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
}

module.exports = DiasporaAdapter;
