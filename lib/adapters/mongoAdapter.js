'use strict';

const _ = require( 'lodash' );
const c = require( 'check-types' );
const Promise = require( 'bluebird' );
const MongoClient = require( 'mongodb' ).MongoClient;
const DiasporaAdapter = require( './baseAdapter.js' );
const MongoEntity = require( '../dataStoreEntities/mongoEntity.js' );

/**
 * @class MongoDiasporaAdapter
 * @classdesc This class is used to use local storage or session storage as a data store. This adapter should be used only by Node.JS
 * @extends Adapters.DiasporaAdapter
 * @description Create a new Mongo data store
 * @memberof Adapters
 * @public
 * @author gerkin
 * @param {Object} config Options hash.
 * @param {String} config.database Name of the database
 * @param {String} config.host='localhost' Host address of the target MongoDB instance
 * @param {Integer} config.port=27017 Port of the target MongoDB instance
 * @param {String} config.username=false Username used to connect.
 * @param {String|Boolean} config.password=false Password used to connect. Set to false to disable password authentication
 */
class MongoDiasporaAdapter extends DiasporaAdapter {
	constructor( config ) {
		super( MongoEntity, {
			id: '_id',
		}, {
			input: {
				id: val => new require( 'mongodb' ).ObjectID( val ),
			},
			output: {
				_id: val => val.toString(),
			},
		});
		if ( !config.hasOwnProperty( 'database' )) {
			throw new Error( 'Missing required string parameter "database".' );
		}
		// ### TODO
		// Support proxies ([see MongoDB Driver doc](http://mongodb.github.io/node-mongodb-native/2.2/reference/connecting/legacy-connection-settings/#mongos-proxy-connection))
		const defaults = {
			host:     'localhost',
			port:     27017,
			password: false,
			username: false,
		};
		const ORMKeys = _.concat( _.keys( defaults ), [ 'database' ]);
		const otherProps = _.omit( config, ORMKeys );
		_.defaults( config, defaults );
		this.config = config;

		const authPrefix = ( false !== config.username ? `${ config.username + ( false !== config.password ? `:${  config.password }` : '' )  }@` : '' );
		// Connection URL
		const url = `mongodb://${ authPrefix }${ config.host }:${ config.port }/${ config.database }`;

		// Use connect method to connect to the server
		MongoClient.connect( url, otherProps, ( err, db ) => {
			if ( c.assigned( err )) {
				this.emit( 'error', new Error( err ));
			}
			this.db = db;
			this.emit( 'ready' );
		});
	}

	// -----
	// ### Utils

	close() {
		this.db.close();
		this.state = 'disconnected';
	}

	// -----
	// ### Insert

	/**
	 * @method insertOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for MongoDB.
	 * @description Insert a single entity in the memory store.
	 * @memberof Adapters.MongoDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @see http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#insertOne
	 * @param   {String} table  Name of the collection to insert data in
	 * @param   {Object} entity Hash representing the entity to insert
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link MongoEntity}* `entity`)
	 */
	insertOne( table, entity ) {
		entity = _.pickBy( entity, v => 'undefined' !== typeof v );
		const collection = this.db.collection( table );
		entity = this.remapInput( table, entity );
		return collection.insertOne( entity ).then( res => {
			const newDoc = _.first( res.ops );
			return this.updateOne(
				table,
				{ _id: newDoc._id, },
				{
					'$set': {
						idHash: _.assign({}, newDoc.idHash, {
							[this.name]: newDoc._id.toString(),
						}),
					}
				},
				{ remapInput: false }
			);
		});
	}

	// -----
	// ### Find

	/**
	 * @method findOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for MongoDB.
	 * @description Retrieve a single entity from the local storage.
	 * @memberof Adapters.MongoDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @see http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#findOne
	 * @param   {String} table  Name of the model to retrieve data from
	 * @param   {Object} queryFind Hash representing the entity to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link InMemoryEntity}* `entity`)
	 */
	findOne( table, queryFind, options = {}) {
		_.defaults( options, {
			skip:        0,
			remapInput:  true,
			remapOutput: true,
		});
		if ( true === options.remapInput ) {
			queryFind = this.remapInput( table, queryFind );
		}
		// Create a new query object
		const redefinedQueryFind = {};
		_.forEach(queryFind, (val, key) => {
			if('undefined' === val){
				redefinedQueryFind[key] = {$exists: false};
			} else {
				redefinedQueryFind[key] = val;
			}
		});
		const collection = this.db.collection( table );
		let promise = collection.findOne( redefinedQueryFind, options ).then( foundItem => {
			return Promise.resolve( options.remapOutput ? this.remapOutput( table, foundItem ) : foundItem );
		});
	}


	/*	findMany( table, queryFind, options = {}) {
		this.ensureTableExists( table );
		const matches = _.filter( storeTable.items, queryFind );
		const reducedMatches = this.constructor.applyOptionsToSet( matches, options );
		return Promise.resolve( _.map( reducedMatches, entity => new this.classEntity(entity, this )));
	}*/

	// -----
	// ### Update

	filterUpdateUnset(updateQuery){
		const $set = {};
		const $unset = {};
		_.forEach(updateQuery, (val, key) => {
			if('undefined' === typeof val){
				$unset[key] = true;
			} else {
				$set[key] = val;
			}
		});
		const fullQuery = {};
		if(!c.emptyObject($unset)){
			_.assign(fullQuery, {$unset});
		}
		if(!c.emptyObject($set)){
			_.assign(fullQuery, {$set});
		}
		return fullQuery;
	}

	/**
	 * @method updateOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for MongoDB.
	 * @description Update a single entity.
	 * @memberof Adapters.MongoDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @see http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#updateOne
	 * @param   {String} table  Name of the collection to update data in
	 * @param   {Object} queryFind Hash representing the entity to find
	 * @param   {Object} update Object properties to set
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once update is done. Called with (*{@link MongoEntity}* `entity`)
	 */
	updateOne( table, queryFind, update, options = {}) {
		_.defaults( options, {
			skip:       0,
			remapInput: true,
		});
		if ( true === options.remapInput ) {
			queryFind = this.remapInput( table, queryFind );
			update = this.remapInput( table, update );
		}
		update = this.filterUpdateUnset(update);
		const collection = this.db.collection( table );
		const subOptions = _.assign( options, {
			remapInput:  false,
			remapOutput: false,
		});
		return this.findOne( table, queryFind, subOptions ).then( foundItem => {
			return collection.updateOne({
				_id: foundItem._id,
			}, update, subOptions ).then(() => Promise.resolve( foundItem._id ));
		}).then( updatedId => this.findOne( table, {
			_id: updatedId,
		}, _.assign( subOptions, {
			remapOutput: true,
		})));
	}

	/**
	 * @method updateMany
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateMany}, modified for MongoDB.
	 * @description Update several entities.
	 * @memberof Adapters.MongoDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @see http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#updateMany
	 * @param   {String} table  Name of the collection to update data in
	 * @param   {Object} queryFind Hash representing entities to find
	 * @param   {Object} update Object properties to set
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once update is done. Called with (*{@link MongoEntity}[]* `entities`)
	 */
	updateMany( table, queryFind, update, options = {}) {
		_.defaults( options, {
			skip:       0,
			remapInput: true,
			remapOutput: true,
		});
		if ( true === options.remapInput ) {
			queryFind = this.remapInput( table, queryFind );
			update = this.remapInput( table, update );
		}
		update = this.filterUpdateUnset(update);
		const collection = this.db.collection( table );
		const subOptions = _.assign( options, {
			remapInput:  false,
			remapOutput: false,
		});
		return this.findMany( table, queryFind, subOptions ).map( foundItem => {
			return collection.updateOne({
				_id: foundItem._id,
			}, update, subOptions ).then(() => Promise.resolve(foundItem._id));
		}).then( updatedIds => {
			return this.findMany( table, {
				_id: {
					$in: updatedIds,
				},
			}, _.assign( subOptions, {
				remapOutput: true,
			}));
		});
	}

	// -----
	// ### Delete

	/**
	 * @method deleteOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for MongoDB.
	 * @description Delete a single entity from the collection.
	 * @memberof Adapters.MongoDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @see http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#deleteOne
	 * @param   {String} table  Name of the collection to delete data from
	 * @param   {Object} queryFind Hash representing the entity to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is deleted. Called with (*undefined*)
	 */
	deleteOne( table, queryFind, options = {}) {
		_.defaults( options, {
			skip: 0,
			remapInput: true,
			remapOutput: true,
		});
		if ( true === options.remapInput ) {
			queryFind = this.remapInput( table, queryFind );
		}
		const collection = this.db.collection( table );
		return collection.deleteOne( queryFind, options ).then(results => Promise.resolve());
	}

	/**
	 * @method deleteMany
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteMany}, modified for MongoDB.
	 * @description Delete several entities from the collection.
	 * @memberof Adapters.MongoDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @see http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#deleteMany
	 * @param   {String} table  Name of the collection to delete data from
	 * @param   {Object} queryFind Hash representing the entity to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is deleted. Called with (*undefined*)
	 */
	deleteMany( table, queryFind, options = {}) {
		_.defaults( options, {
			skip: 0,
			remapInput: true,
			remapOutput: true,
		});
		if ( true === options.remapInput ) {
			queryFind = this.remapInput( table, queryFind );
		}
		const collection = this.db.collection( table );
		return collection.deleteMany( queryFind, options ).then(() => Promise.resolve());
	}
}

module.exports = MongoDiasporaAdapter;
