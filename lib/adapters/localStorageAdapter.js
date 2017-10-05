'use strict';

const {
	_, Promise,
} = require( '_diaspora/dependencies' );
const DiasporaAdapter = require( '_diaspora/adapters/baseAdapter.js' );
const LocalStorageEntity = require( '_diaspora/dataStoreEntities/localStorageEntity.js' );

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
	/**
	 * @description Create a new instance of local storage adapter
	 * @constructs LocalStorageDiasporaAdapter
	 * @memberof Adapters
	 * @public
	 * @author gerkin
	 * @param {Object} config Configuration object
	 * @param {Boolean} [config.session = false] Set to true to use sessionStorage instead of localStorage
	 */
	constructor( config ) {
		super( LocalStorageEntity );
		_.defaults( config, {
			session: false,
		});
		this.state = 'ready';
		this.source = ( true === config.session ? global.sessionStorage : global.localStorage );
	}

	/**
	 * @method configureCollection
	 * @description Create the collection index and call {@link Adapters.DiasporaAdapter.configureCollection}
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param {String} tableName Name of the table (usually, model name)
	 * @param {Object} remaps    Associative hash that links entity field names with data source field names
	 * @returns {undefined}
	 */
	configureCollection( tableName, remaps ) {
		super.configureCollection( tableName, remaps );
		this.ensureCollectionExists( tableName );
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
		let d = new Date().getTime();
		if ( global.performance && 'function' === typeof global.performance.now ) {
			d += global.performance.now(); //use high-precision timer if available
		}
		const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, c => {
			const r = ( d + Math.random() * 16 ) % 16 | 0;
			d = Math.floor( d / 16 );
			return ( 'x' === c ? r : ( r & 0x3 | 0x8 )).toString( 16 );
		});
		return uuid;
	}

	/**
	 * @method ensureCollectionExists
	 * @description Create the table key if it does not exist
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table
	 * @returns {String[]} Index of the collection
	 */
	ensureCollectionExists( table ) {
		let index = this.source.getItem( table );
		if ( _.isNil( index )) {
			index = [];
			this.source.setItem( table, JSON.stringify( index ));
		} else {
			index = JSON.parse( index );
		}
		return index;
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
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for local storage or session storage interactions.
	 * @description Insert a single entity in the local storage.
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to insert data in
	 * @param   {Object} entity Hash representing the entity to insert
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link LocalStorageEntity}* `entity`)
	 */
	insertOne( table, entity ) {
		entity = _.cloneDeep( entity || {});
		entity.id = this.generateUUID();
		this.setIdHash( entity );
		try {
			const tableIndex = this.ensureCollectionExists( table );
			tableIndex.push( entity.id );
			this.source.setItem( table, JSON.stringify( tableIndex ));
			this.source.setItem( this.getItemName( table, entity.id ), JSON.stringify( entity ));
		} catch ( error ) {
			return Promise.reject( error );
		}
		return Promise.resolve( new this.classEntity( entity, this ));
	}

	/**
	 * @method insertMany
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertMany}, modified for local storage or session storage interactions.
	 * @description Insert several entities in the local storage.
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to insert data in
	 * @param   {Object[]} entities Array of hashes representing entities to insert
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link LocalStorageEntity[Ø]}* `entities`)
	 */
	insertMany( table, entities ) {
		entities = _.cloneDeep( entities );
		try {
			const tableIndex = this.ensureCollectionExists( table );
			entities = entities.map(( entity = {}) => {
				entity.id = this.generateUUID();
				this.setIdHash( entity );
				tableIndex.push( entity.id );
				this.source.setItem( this.getItemName( table, entity.id ), JSON.stringify( entity ));
				return new this.classEntity( entity, this );
			});
			this.source.setItem( table, JSON.stringify( tableIndex ));
		} catch ( error ) {
			return Promise.reject( error );
		}
		return Promise.resolve( entities );
	}

	// -----
	// ### Find

	/**
	 * @method findOneById
	 * @description Find a single local storage entity using its id
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table Name of the collection to search entity in
	 * @param   {String} id    Id of the entity to search
	 * @returns {DataStoreEntities.LocalStorageEntity|undefined} Found entity, or undefined if not found
	 */
	findOneById( table, id ) {
		const item = this.source.getItem( this.getItemName( table, id ));
		if ( !_.isNil( item )) {
			return Promise.resolve( new this.classEntity( JSON.parse( item ), this ));
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
	 * @param   {SelectQueryOrCondition} queryFind Hash representing the entity to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link InMemoryEntity}* `entity`)
	 */
	findOne( table, queryFind, options = {}) {
		_.defaults( options, {
			skip: 0,
		});
		if ( !_.isObject( queryFind )) {
			return this.findOneById( table, queryFind );
		} else if ( _.isEqual( _.keys( queryFind ), [ 'id' ]) && _.isEqual( _.keys( queryFind.id ), [ '$equal' ])) {
			return this.findOneById( table, queryFind.id.$equal );
		}
		const items = this.ensureCollectionExists( table );
		let returnedItem;
		let matched = 0;
		_.each( items, itemId => {
			const item = JSON.parse( this.source.getItem( this.getItemName( table, itemId )));
			if ( this.matchEntity( queryFind, item )) {
				matched++;
				// If we matched enough items
				if ( matched > options.skip ) {
					returnedItem = item;
					return false;
				}
			}
		});
		return Promise.resolve( !_.isNil( returnedItem ) ? new this.classEntity( returnedItem, this ) : undefined );
	}

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
	 * @param   {SelectQueryOrCondition} queryFind Hash representing the entity to find
	 * @param   {Object} update Object properties to set
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once update is done. Called with (*{@link LocalStorageEntity}* `entity`)
	 */
	updateOne( table, queryFind, update, options ) {
		_.defaults( options, {
			skip: 0,
		});
		return this.findOne( table, queryFind, options ).then( entity => {
			if ( _.isNil( entity )) {
				return Promise.resolve();
			}
			this.applyUpdateEntity( update, entity );
			try {
				this.source.setItem( this.getItemName( table, entity.id ), JSON.stringify( entity ));
				return Promise.resolve( entity );
			} catch ( error ) {
				return Promise.reject( error );
			}
		});
	}

	// -----
	// ### Delete

	/**
	 * @method deleteOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for local storage or session storage interactions.
	 * @description Delete a single entity from the local storage.
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to delete data from
	 * @param   {SelectQueryOrCondition} queryFind Hash representing the entity to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is deleted. Called with (*undefined*)
	 */
	deleteOne( table, queryFind, options = {}) {
		return this.findOne( table, queryFind, options ).then( entityToDelete => {
			try {
				const tableIndex = this.ensureCollectionExists( table );
				_.pull( tableIndex, entityToDelete.id );
				this.source.setItem( table, JSON.stringify( tableIndex ));
				this.source.removeItem( this.getItemName( table, entityToDelete.id ));
			} catch ( error ) {
				return Promise.reject( error );
			}
			return Promise.resolve();
		});
	}

	/**
	 * @method deleteMany
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteMany}, modified for local storage or session storage interactions.
	 * @description Delete several entities from the local storage.
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to delete data from
	 * @param   {SelectQueryOrCondition} queryFind Hash representing entities to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once items are deleted. Called with (*undefined*)
	 */
	deleteMany( table, queryFind, options = {}) {
		try {
			return this.findMany( table, queryFind, options ).then( entitiesToDelete => {
				const tableIndex = this.ensureCollectionExists( table );
				_.pullAll( tableIndex, _.map( entitiesToDelete, 'id' ));
				this.source.setItem( table, JSON.stringify( tableIndex ));
				_.forEach( entitiesToDelete, entityToDelete => {
					this.source.removeItem( this.getItemName( table, entityToDelete.id ));
				});
				return Promise.resolve();
			});
		} catch ( error ) {
			return Promise.reject( error );
		}
	}
}

module.exports = LocalStorageDiasporaAdapter;
