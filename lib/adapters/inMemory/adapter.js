'use strict';

const {
	_, Promise,
} = require( '../../dependencies' );
const Utils = require( '../../utils' );

const Diaspora = require( '../../diaspora' );
const DiasporaAdapter = Diaspora.components.Adapters.Adapter;
const InMemoryEntity = require( './entity.js' );

/**
 * This class is used to use the memory as a data store. Every data you insert are stored in an array contained by this class. This adapter can be used by both the browser & Node.JS.
 *
 * @extends Adapters.DiasporaAdapter
 * @memberof Adapters
 */
class InMemoryDiasporaAdapter extends DiasporaAdapter {
	/**
	 * Create a new instance of in memory adapter.
	 *
	 * @author gerkin
	 */
	constructor() {
		/**
		 * Link to the InMemoryEntity.
		 *
		 * @name classEntity
		 * @type {DataStoreEntities.InMemoryEntity}
		 * @memberof Adapters.InMemoryDiasporaAdapter
		 * @instance
		 * @author Gerkin
		 */
		super( InMemoryEntity );
		this.state = 'ready';
		/**
		 * Plain old javascript object used as data store.
		 *
		 * @author Gerkin
		 */
		this.store = {};
	}

	/**
	 * Create the data store and call {@link Adapters.DiasporaAdapter#configureCollection}.
	 *
	 * @author gerkin
	 * @param   {string} tableName - Name of the table (usually, model name).
	 * @param   {Object} remaps    - Associative hash that links entity field names with data source field names.
	 * @returns {undefined} This function does not return anything.
	 */
	configureCollection( tableName, remaps ) {
		super.configureCollection( tableName, remaps );
		this.ensureCollectionExists( tableName );
	}

	// -----
	// ### Utils

	/**
	 * Get or create the store hash.
	 *
	 * @author gerkin
	 * @param   {string} table - Name of the table.
	 * @returns {DataStoreTable} In memory table to use.
	 */
	ensureCollectionExists( table ) {
		if ( this.store.hasOwnProperty( table )) {
			return this.store[table];
		} else {
			return this.store[table] = {
				items: [],
			};
		}
	}

	// -----
	// ### Insert

	/**
	 * Insert a single entity in the memory store.
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   {string} table  - Name of the table to insert data in.
	 * @param   {Object} entity - Hash representing the entity to insert.
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link InMemoryEntity}* `entity`).
	 */
	insertOne( table, entity ) {
		entity = _.cloneDeep( entity );
		const storeTable = this.ensureCollectionExists( table );
		entity.id = Utils.generateUUID();
		this.setIdHash( entity );
		storeTable.items.push( entity );
		return Promise.resolve( new this.classEntity( entity, this ));
	}

	// -----
	// ### Find

	/**
	 * Retrieve a single entity from the memory.
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to retrieve data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link InMemoryEntity}* `entity`).
	 */
	findOne( table, queryFind, options = {}) {
		const storeTable = this.ensureCollectionExists( table );
		const matches = _.filter( storeTable.items, _.partial( this.matchEntity, queryFind ));
		const reducedMatches = Utils.applyOptionsToSet( matches, options );
		return Promise.resolve( this.maybeCastEntity( _.first( reducedMatches )));
	}

	/**
	 * Retrieve several entities from the memory.
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#findMany}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to retrieve data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once items are found. Called with (*{@link InMemoryEntity}[]* `entities`).
	 */
	findMany( table, queryFind, options = {}) {
		const storeTable = this.ensureCollectionExists( table );
		const matches = _.filter( storeTable.items, _.partial( this.matchEntity, queryFind ));
		const reducedMatches = Utils.applyOptionsToSet( matches, options );
		return Promise.resolve( this.maybeCastSet( reducedMatches ));
	}

	// -----
	// ### Update

	/**
	 * Update a single entity in the memory.
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to update data in.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
	 * @param   {Object}                               update       - Object properties to set.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once update is done. Called with (*{@link InMemoryEntity}* `entity`).
	 */
	updateOne( table, queryFind, update, options = {}) {
		return this.findOne( table, queryFind, options ).then( found => {
			if ( !_.isNil( found )) {
				const storeTable = this.ensureCollectionExists( table );
				const match = _.find( storeTable.items, {
					id: found.id,
				});
				Utils.applyUpdateEntity( update, match );
				return Promise.resolve( this.maybeCastEntity( match ));
			} else {
				return Promise.resolve();
			}
		});
	}

	/**
	 * Update several entities in the memory.
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateMany}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to update data in.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
	 * @param   {Object}                               update       - Object properties to set.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once update is done. Called with (*{@link InMemoryEntity}[]* `entities`).
	 */
	updateMany( table, queryFind, update, options = {}) {
		return this.findMany( table, queryFind, options ).then( found => {
			if ( !_.isNil( found ) && found.length > 0 ) {
				const storeTable = this.ensureCollectionExists( table );
				const foundIds = _.map( found, 'id' );
				const matches = _.filter( storeTable.items, item => -1 !== foundIds.indexOf( item.id ));
				return Promise.resolve( this.maybeCastSet( _.map( matches, item => {
					Utils.applyUpdateEntity( update, item );
					return item;
				})));
			} else {
				return Promise.resolve([]);
			}
		});
	}

	// -----
	// ### Delete

	/**
	 * Delete a single entity from the memory.
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to delete data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*undefined*).
	 */
	deleteOne( table, queryFind, options = {}) {
		const storeTable = this.ensureCollectionExists( table );
		return this.findOne( table, queryFind, options ).then( entityToDelete => {
			if ( !_.isNil( entityToDelete )) {
				storeTable.items = _.reject( storeTable.items, entity => entity.id === entityToDelete.idHash[this.name]);
			}
			return Promise.resolve();
		});
	}

	/**
	 * Delete several entities from the memory.
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteMany}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to delete data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once items are deleted. Called with (*undefined*).
	 */
	deleteMany( table, queryFind, options = {}) {
		const storeTable = this.ensureCollectionExists( table );
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
