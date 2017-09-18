'use strict';

const _ = require( 'lodash' );
const c = require( 'check-types' );
const Promise = require( 'bluebird' );
const Redis = require( 'redis' );

const DiasporaAdapter = require( './baseAdapter.js' );
const RedisEntity = require( '../dataStoreEntities/redisEntity.js' );

Promise.promisifyAll( Redis.RedisClient.prototype );
Promise.promisifyAll( Redis.Multi.prototype );
/**
 * @class RedisDiasporaAdapter
 * @classdesc This class is used to use the memory as a data store. Every data you insert are stored in an array contained by this class. This adapter can be used by both the browser & Node.JS
 * @extends Adapters.DiasporaAdapter
 * @description Create a new In Memory data store
 * @memberof Adapters
 * @public
 * @author gerkin
 * @param {Object} [config] Options hash. Currently, this adapter does not have any options
 */
class RedisDiasporaAdapter extends DiasporaAdapter {
	constructor( config ) {
		super( RedisEntity );
		const defaults = {
			host:     'localhost',
			port:     6379,
			path:     false,
			password: false,
		};
		const ORMKeys = _.concat( _.keys( defaults ), [ 'database' ]);
		const otherProps = _.omit( config, ORMKeys );
		_.defaults( config, defaults );

		// Configure other options
		if ( false === config.path ) {
			_.defaults( otherProps, _.pick( defaults, [ 'host', 'port' ]));
		} else {
			_.defaults( otherProps, _.pick( defaults, [ 'path' ]));
		}
		_.assign( otherProps, {
			db:             config.database,
			retry_strategy: function( options ) {
				if ( options.error && 'ECONNREFUSED' === options.error.code ) {
					// End reconnecting on a specific error and flush all commands with
					// a individual error
					return new Error( 'The server refused the connection' );
				}
				if ( options.total_retry_time > 1000 * 60 * 60 ) {
					// End reconnecting after a specific timeout and flush all commands
					// with a individual error
					return new Error( 'Retry time exhausted' );
				}
				if ( options.attempt > 10 ) {
					// End reconnecting with built in error
					return undefined;
				}
				// reconnect after
				return Math.min( options.attempt * 100, 3000 );
			},
			password: false !== config.password ? config.password : undefined,
		});

		this.config = config;
		this.client = Redis.createClient( otherProps );
		this.client.on( 'error', err => {
			this.emit( 'error', new Error( err ));
		}).on( 'ready', this.emit.bind( this, 'ready' ));
	}

	// -----
	// ### Utils

	/**
	 * @method applyOptionsToSet
	 * @description Reduce, offset or sort provided set
	 * @memberof Adapters.RedisDiasporaAdapter
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

	// -----
	// ### Insert

	/**
	 * @method insertOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for in-memory interactions.
	 * @description Insert a single entity in the memory store.
	 * @memberof Adapters.RedisDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to insert data in
	 * @param   {Object} entity Hash representing the entity to insert
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link RedisEntity}* `entity`)
	 */
	insertOne( table, entity ) {
		entity = _.cloneDeep( entity );
		entity = _.pickBy( entity, v => 'undefined' !== typeof v );
		entity.id = this.generateUUID();
		this.setIdHash( entity );
		return this.client.getAsync( `${ table }.id` ).then( tableIndex => {
			if ( !c.assigned( tableIndex )) {
				tableIndex = [];
			} else {
				try {
					tableIndex = JSON.parse( tableIndex );
				} catch ( e ) {
					return Promise.reject( e );
				}
			}
			tableIndex.push( entity.id );
			entity.idHash = JSON.stringify( entity.idHash );
			return Promise.props({
				updateIndex: this.client.setAsync( `${ table }.id`, JSON.stringify( tableIndex )),
				insertData:  this.client.hmsetAsync( `${ table }.id=${ entity.id }`, entity ),
			}).then( result => {
				return this.findOne( table, entity.id )
			});
		});
	}

	// -----
	// ### Find

	findOneById( table, id ) {
		return this.client.hgetallAsync( `${ table }.id=${ id }` ).then( item => {
			if ( c.assigned( item )) {
				try {
					item.idHash = JSON.parse( item.idHash );
				} catch ( err ) {
					return Promise.reject( err );
				}
				return Promise.resolve( new this.classEntity(item, this ));
			}
			return Promise.resolve();
		});
	}

	/**
	 * @method findOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for in-memory interactions.
	 * @description Retrieve a single entity from the memory.
	 * @memberof Adapters.RedisDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to retrieve data from
	 * @param   {Object} queryFind Hash representing the entity to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link RedisEntity}* `entity`)
	 */
	findOne( table, queryFind, options = {}) {
		_.defaults( options, {
			skip: 0,
		});
		if ( !c.object( queryFind )) {
			return this.findOneById( table, queryFind );
		} else if ( queryFind.hasOwnProperty( 'id' ) && 1 === _.keys( queryFind ).length ) {
			return this.findOneById( table, queryFind.id );
		}
		return this.client.getAsync( `${ table }.id` ).then( index => {
			try {
				index = JSON.parse( index );
				if(!c.assigned(index) || !c.nonEmptyArray(index)){
					return Promise.resolve();
				}
			} catch ( err ) {
				return Promise.reject( err );
			}

			return new Promise((resolve, reject) => {
				let loopIndex = 0;
				let matched = 0;
				// We are going to loop until we find enough items
				const loopFind = () => {
					if ( loopIndex < index.length ) {
						return this.client.hgetallAsync( `${ table }.id=${ index[loopIndex] }` ).then( item => {
							item.idHash = JSON.parse( item.idHash );
							loopIndex++;
							// If the search returned nothing, then just finish the findMany
							if ( c.assigned( item )) {
								if ( this.matchEntity( queryFind, item )) {
									matched++;
									if ( matched > options.skip ) {
										return resolve( new this.classEntity(item, this ) );
									}
								}
							} else {
								return resolve();
							}
							return loopFind();
						});
					} else {
						return resolve();
					}
				};
				return loopFind();
			})
		});
	}

	// -----
	// ### Update

	/**
	 * @method updateOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for in-memory interactions.
	 * @description Update a single entity in the memory.
	 * @memberof Adapters.RedisDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to update data in
	 * @param   {Object} queryFind Hash representing the entity to find
	 * @param   {Object} update Object properties to set
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once update is done. Called with (*{@link RedisEntity}* `entity`)
	 */
	updateOne( table, queryFind, update, options = {}) {
		return this.findOne( table, queryFind, options ).then( found => {
			if ( c.assigned( found )) {
				found = found.toObject();
				const unsets = [];
				_.each(update, (val, key) => {
					if('undefined' !== typeof val){
						found[key] = val;
					} else {
						unsets.push(key);
						delete found[key];
					}
				});
				found.idHash = JSON.stringify( found.idHash );
				return Promise.all([
					this.client.hmsetAsync( `${ table }.id=${ found.id }`, found ),
					c.emptyArray(unsets) ? Promise.resolve() : this.client.hdelAsync( `${ table }.id=${ found.id }`, unsets ),
				]).then(() => this.findOne( table, found.id ));
			} else {
				return Promise.resolve();
			}
		});
	}

	// -----
	// ### Delete

	/**
	 * @method deleteOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for in-memory interactions.
	 * @description Delete a single entity from the memory.
	 * @memberof Adapters.RedisDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to delete data from
	 * @param   {Object} queryFind Hash representing the entity to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*undefined*)
	 */
	deleteOne( table, queryFind, options = {}) {
		return Promise.props({
			item:  this.findOne( table, queryFind, options ),
			index: this.client.getAsync( `${ table }.id` ),
		}).then(({
			item, index,
		}) => {
			if ( !c.assigned( item )) {
				return Promise.resolve();
			}
			if ( !c.assigned( index )) {
				index = [];
			} else {
				try {
					index = JSON.parse( index );
				} catch ( e ) {
					return Promise.reject( e );
				}
			}
			_.pull( index, item.id );
			return Promise.props({
				updateIndex: this.client.setAsync( `${ table }.id`, JSON.stringify( index )),
				deleteItem:  this.client.delAsync( `${ table }.id=${ item.id }` ),
			});
		}).then(() => Promise.resolve());
	}
}

module.exports = RedisDiasporaAdapter;
