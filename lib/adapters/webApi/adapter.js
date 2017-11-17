'use strict';

const {
	_, Promise,
} = require( '../../dependencies' );
const Utils = require( '../../utils' );

const Diaspora = require( '../../diaspora' );
const DiasporaAdapter = Diaspora.components.Adapters.Adapter;
const WebApiEntity = require( './entity.js' );

/**
 * 
 *
 * @extends Adapters.DiasporaAdapter
 * @memberof Adapters
 */
class WebApiDiasporaAdapter extends DiasporaAdapter {
	/**
	 * Create a new instance of web api adapter.
	 *
	 * @author gerkin
	 */
	constructor() {
		/**
		 * Link to the WebApiEntity.
		 *
		 * @name classEntity
		 * @type {DataStoreEntities.WebApiEntity}
		 * @memberof Adapters.WebApiDiasporaAdapter
		 * @instance
		 * @author Gerkin
		 */
		super( WebApiEntity );
		this.state = 'ready';
	}

	// -----
	// ### Insert

	/**
	 * Insert a single entity in the memory store.
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for use of web api.
	 * @author gerkin
	 * @param   {string} table  - Name of the table to insert data in.
	 * @param   {Object} entity - Hash representing the entity to insert.
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link InMemoryEntity}* `entity`).
	 */
	insertOne( table, entity ) {
	}

	// -----
	// ### Find

	/**
	 * 
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for use of web api.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to retrieve data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link InMemoryEntity}* `entity`).
	 */
	findOne( table, queryFind, options = {}) {
	}

	/**
	 * 
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#findMany}, modified for use of web api.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to retrieve data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once items are found. Called with (*{@link InMemoryEntity}[]* `entities`).
	 */
	findMany( table, queryFind, options = {}) {
	}

	// -----
	// ### Update

	/**
	 * 
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for use of web api.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to update data in.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
	 * @param   {Object}                               update       - Object properties to set.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once update is done. Called with (*{@link InMemoryEntity}* `entity`).
	 */
	updateOne( table, queryFind, update, options = {}) {
	}

	/**
	 * 
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateMany}, modified for use of web api.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to update data in.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
	 * @param   {Object}                               update       - Object properties to set.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once update is done. Called with (*{@link InMemoryEntity}[]* `entities`).
	 */
	updateMany( table, queryFind, update, options = {}) {
	}

	// -----
	// ### Delete

	/**
	 * 
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for use of web api.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to delete data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*undefined*).
	 */
	deleteOne( table, queryFind, options = {}) {
	}

	/**
	 * 
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteMany}, modified for use of web api.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to delete data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once items are deleted. Called with (*undefined*).
	 */
	deleteMany( table, queryFind, options = {}) {
	}
}

module.exports = WebApiDiasporaAdapter;
