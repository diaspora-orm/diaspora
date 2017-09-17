'use strict';

const _ = require( 'lodash' );
const c = require( 'check-types' );
const Promise = require( 'bluebird' );
const DiasporaAdapter = require( './baseAdapter.js' );
const LocalStorageEntity = require( '../dataStoreEntities/localStorageEntity.js' );

/**
 * @class LocalStorageDiasporaAdapter
 * @classdesc This class is used to use local storage or session storage as a data store. This adapter should be used only by the browser
 * @extends Adapters.DiasporaAdapter
 * @description Create a new LocalStorage data store
 * @memberof Adapters
 * @public
 * @author gerkin
 * @param {Object} [config] Options hash.
 * @param {Boolean} config.session=false If `false`, data source will use local storage. If `true`, it will use session storage.
 */
class LocalStorageDiasporaAdapter extends DiasporaAdapter {
	constructor( config ) {
		super( LocalStorageEntity );
		_.defaults( config, {
			session: false,
		});
		this.state = 'ready';
		this.source = ( true === config.session ? sessionStorage : localStorage );
	}

	// -----
	// ### Utils

	/**
	 * @method generateUUID
	 * @description Create a new unique id for this store's entity
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @returns {String} Generated unique id
	 */
	generateUUID() {
		var d = new Date().getTime();
		if ( 'undefined' !== typeof window && window.performance && 'function' === typeof window.performance.now ) {
			d += performance.now(); //use high-precision timer if available
		}
		const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, c => {
			const r = ( d + Math.random() * 16 ) % 16 | 0;
			d = Math.floor( d / 16 );
			return ( 'x' === c ? r : ( r & 0x3 | 0x8 )).toString( 16 );
		});
		return uuid;
	}

	/**
	 * @method ensureTableExists
	 * @description Create the table key if it does not exist
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table
	 */
	ensureTableExists( table ) {
		if ( !c.assigned( this.source.getItem( table ))) {
			this.source.setItem( table, '[]' );
		}
	}

	/**
	 * @method applyOptionsToSet
	 * @description Reduce, offset or sort provided set
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {Object[]} set  Objects retrieved from memory store
	 * @param   {Object} options Options to apply to the set
	 * @returns {Object[]} Set with options applied
	 */
	static applyOptionsToSet( set, options ) {
		if ( options.hasOwnProperty( 'limit' )) {
			if ( c.integer( options.limit )) {
				set = set.slice( 0, options.limit );
			} else {
				ModelExtension.log.warn( `Trying to apply a non-integer limit "${ options.limit }".` );
			}
		}
		return set;
	}

	/**
	 * @method getItemName
	 * @description Deduce the item name from table name and item ID
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to construct name for
	 * @param   {String} id Id of the item to find
	 * @returns {String} Name of the item
	 */
	getItemName( table, id ) {
		return `${ table }.id=${ id }`;
	}

	// -----
	// ### Insert

	/**
	 * @method insertOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for local storage or session storage interactions<.
	 * @description Insert a single entity in the memory store.
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to insert data in
	 * @param   {Object} entity Hash representing the entity to insert
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link LocalStorageEntity}* `entity`)
	 */
	insertOne( table, entity ) {
		this.ensureTableExists( table );
		entity.id = this.generateUUID();
		entity.idHash = {
			[this.name]: entity.id,
		};
		try {
			const tableIndex = JSON.parse( this.source.getItem( table ));
			tableIndex.push( entity.id );
			this.source.setItem( table, JSON.stringify( tableIndex ));
			this.source.setItem( this.getItemName( table, entity.id ), JSON.stringify( entity ));
		} catch ( error ) {
			return Promise.reject( error );
		}
		return Promise.resolve( new this.classEntity( entity ));
	}

	// -----
	// ### Find

	findOneById( table, id ) {
		const item = this.source.getItem( this.getItemName( table, id ));
		if ( c.assigned( item )) {
			return Promise.resolve( new this.classEntity( JSON.parse( item )));
		}
		return Promise.resolve();
	}

	/**
	 * @method findOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for local storage or session storage interactions.
	 * @description Retrieve a single entity from the local storage.
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the model to retrieve data from
	 * @param   {Object} queryFind Hash representing the entity to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link InMemoryEntity}* `entity`)
	 */
	findOne( table, queryFind, options = {}) {
		_.defaults( options, {
			skip: 0,
		});
		this.ensureTableExists( table );
		if ( !c.object( queryFind )) {
			return this.findOneById( table, queryFind );
		} else if ( queryFind.hasOwnProperty( 'id' ) && 1 === _.keys( queryFind ).length ) {
			return this.findOneById( table, queryFind.id );
		}
		const items = JSON.parse( this.source.getItem( table ));
		let returnedItem;
		const matchFct = _.matches( queryFind );
		let matched = 0;
		_.each( items, itemId => {
			const item = JSON.parse( this.source.getItem( this.getItemName( table, itemId )));
			if ( matchFct( item )) {
				matched++;
				// If we matched enough items
				if ( matched > options.skip ) {
					returnedItem = item;
					return false;
				}
			}
		});
		return Promise.resolve( c.assigned( returnedItem ) ? new this.classEntity( returnedItem ) : undefined );
	}


	/*	findMany( table, queryFind, options = {}) {
		this.ensureTableExists( table );
		const matches = _.filter( storeTable.items, queryFind );
		const reducedMatches = this.constructor.applyOptionsToSet( matches, options );
		return Promise.resolve( _.map( reducedMatches, entity => new this.classEntity( entity )));
	}*/

	// -----
	// ### Update

	/**
	 * @method updateOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for local storage or session storage interactions.
	 * @description Update a single entity in the memory.
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to update data in
	 * @param   {Object} queryFind Hash representing the entity to find
	 * @param   {Object} update Object properties to set
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once update is done. Called with (*{@link LocalStorageEntity}* `entity`)
	 */
	updateOne( table, queryFind, update, options ) {
		_.defaults( options, {
			skip: 0,
		});
		this.ensureTableExists( table );
		return this.findOne( table, queryFind, options ).then( entity => {
			if ( !c.assigned( entity )) {
				return Promise.resolve();
			}
			_.assign( entity, update );
			try {
				this.source.setItem( this.getItemName( table, entity.id ), JSON.stringify( entity ));
				return Promise.resolve( entity );
			} catch ( error ) {
				return Promise.reject( error );
			}
		});
	}

	/* updateMany( table, queryFind, update, options ) {
		this.ensureTableExists( table );
		const matches = _.filter( storeTable.items, queryFind );
		const reducedMatches = this.constructor.applyOptionsToSet( matches, options );
		_.forEach( reducedMatches, match => {
			_.assign( match, update );
		});
		return Promise.resolve( _.map( reducedMatches, entity => new this.classEntity( entity )));
	}*/

	// -----
	// ### Delete

	/**
	 * @method deleteOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for local storage or session storage interactions.
	 * @description Delete a single entity in the memory.
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to delete data from
	 * @param   {Object} queryFind Hash representing the entity to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*undefined*)
	 */
	deleteOne( table, queryFind, options = {}) {
		this.ensureTableExists( table );
		return this.findOne( table, queryFind, options ).then( entityToDelete => {
			try {
				const tableIndex = JSON.parse( this.source.getItem( table ));
				_.pull( tableIndex, entityToDelete.id );
				this.source.setItem( table, JSON.stringify( tableIndex ));
				this.source.removeItem( this.getItemName( table, entityToDelete.id ));
			} catch ( error ) {
				return Promise.reject( error );
			}
			return Promise.resolve();
		});
	}

	/* deleteMany( table, queryFind, options = {}) {
		this.ensureTableExists( table );
		return this.findMany( table, queryFind, options ).then( entitiesToDelete => {
			const entitiesIds = _.map( entitiesToDelete, entity => _.get( entity, `idHash.${ this.name }` ));
			storeTable.items = _.reject( storeTable.items, entity => {
				return _.includes( entitiesIds, entity.id );
			});
			return Promise.resolve( undefined );
		});
	}*/
}

module.exports = LocalStorageDiasporaAdapter;
