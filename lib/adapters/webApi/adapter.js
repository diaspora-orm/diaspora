'use strict';

const {
	_, Promise,
} = require( '../../dependencies' );

const Diaspora = require( '../../diaspora' );
const DiasporaAdapter = Diaspora.components.Adapters.Adapter;
const WebApiEntity = require( './entity.js' );

const queryObjectToString = queryObject => {
	return _( queryObject ).chain( _.cloneDeep ).omitBy( val => _.isObject( val ) && _.isEmpty( val ))
	// { foo: 1, bar: { baz: 2 } }
		.mapValues( JSON.stringify )
	// { foo: '1', bar: '{"baz": "2"}' }
		.toPairs()
	// [ [ 'foo', '1' ], [ 'bar', '{"baz":2}' ] ]
		.map( _.partial( _.map, _, encodeURIComponent ))
	// [ [ 'foo', '1' ], [ 'bar', '%7B%22baz%22%3A2%7D' ] ]
		.map( arr => `${ arr[0]  }=${  arr[1] }` )
	// [ 'foo=1', 'bar=%7B%22baz%22%3A2%7D' ]
		.join( '&' ).value();
};

const httpErrorFactories = {
	400: xhr => new Error( `Posted data through HTTP is invalid; message "${ xhr.response.message }"` ),
	_:   xhr => new Error( `Unhandled HTTP error with status code ${ xhr.status } & message "${ xhr.response.message }"` ),
};

const httpRequest = async( method, endPoint, data, queryObject ) => {
	if ( !process.browser ) {
		if ( _.isNil( data )) {
			data = true;
		}
		return await require( 'request-promise' )[method.toLowerCase()]( endPoint, {
			json: data,
			qs:   _.mapValues( queryObject, JSON.stringify ),
		});
	} else {
		return new Promise(( resolve, reject ) => {
			const xhr = new XMLHttpRequest();
			xhr.onload = () => {
				if ( _.inRange( xhr.status, 200, 299 )) {
					return resolve( xhr.response );
				} else {
					return reject( _.get( httpErrorFactories, xhr.status, httpErrorFactories._ )( xhr ));
				}
			};
			xhr.onerror = ( ...args ) => {
				return reject();
			};
			const queryString = queryObjectToString( queryObject );
			xhr.responseType = 'json';
			xhr.open( method, `${ endPoint }${ queryString ? `?${  queryString }` : '' }` );
			xhr.setRequestHeader( 'Content-Type', 'application/json' );
			xhr.send( _.isNil( data ) ? undefined : JSON.stringify( data ));
		});
	}
};

const getQueryObject = ( queryFind, options ) => {
	if ( 0 === options.skip ) {
		delete options.skip;
	}

	return _.assign({}, _.omit( options, [ 'remapInput', 'remapOutput' ]), {where: queryFind});
};

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
	 * @todo Use PATCH verb
	 * @author gerkin
	 */
	constructor( config = {}) {
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
		_.defaults( config, {
			protocol:   false,
			port:       false,
			baseUrl:    '',
			pluralApis: {},
		});
		if ( process.browser && !config.host ) {
			this.baseEndPoint = config.baseUrl;
		} else {
			if ( !_.isString( config.host )) {
				throw new Error( `"config.host" is not defined, or is not a string: had "${ config.host }"` );
			}
			const protocolString = config.protocol ? `${ config.protocol }:` : '';
			const portString = config.port ? `:${ config.port }` : '';
			this.baseEndPoint = `${ protocolString }//${ config.host }${ portString }${ config.baseUrl }`;
		}
		this.state = 'ready';
		this.pluralApis = config.pluralApis;
	}

	httpQuery( method, endPoint, data, queryObject ) {
		return httpRequest( method, `${ this.baseEndPoint }/${  endPoint.toLowerCase() }`, data, queryObject );
	}

	getPluralEndpoint( table ) {
		if ( this.pluralApis[table]) {
			return this.pluralApis[table];
		} else {
			return `${ table  }s`;
		}
	}

	// -----
	// ### Insert

	/**
	 * Insert a single entity through an HTTP API.
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for use of web api.
	 * @author gerkin
	 * @param   {string} table  - Name of the table to insert data in.
	 * @param   {Object} entity - Hash representing the entity to insert.
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link WebApiEntity}* `entity`).
	 */
	async insertOne( table, entity ) {
		entity = await this.httpQuery( 'POST', table, entity );
		if ( !_.isNil( entity )) {
			entity.idHash = {
				[this.name]: entity.id,
			};
		}
		return this.maybeCastEntity( entity );
	}

	/**
	 * Insert several entities through an HTTP API.
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertMany}, modified for use of web api.
	 * @author gerkin
	 * @param   {string} table  - Name of the table to insert data in.
	 * @param   {Object[]} entity - Hash representing entities to insert.
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link WebApiEntity[]}* `entities`).
	 */
	async insertMany( table, entities ) {
		entities = await this.httpQuery( 'POST', this.getPluralEndpoint( table ), entities );
		if ( !_.isEmpty( entities )) {
			entities = _.map( entities, entity => {
				entity.idHash = {
					[this.name]: entity.id,
				};
				return entity;
			});
		}
		return this.maybeCastSet( entities );
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
	async findOne( table, queryFind, options = {}) {
		let entity = await this.httpQuery( 'GET', table, null, getQueryObject( queryFind, options ));
		if ( !_.isNil( entity )) {
			entity.idHash = {
				[this.name]: entity.id,
			};
		}
		return this.maybeCastEntity( entity );
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
	async findMany( table, queryFind, options = {}) {
		let entities = await this.httpQuery( 'GET', this.getPluralEndpoint( table ), null, getQueryObject( queryFind, options ));
		if ( !_.isEmpty( entities )) {
			entities = _.map( entities, entity => {
				entity.idHash = {
					[this.name]: entity.id,
				};
				return entity;
			});
		}
		return this.maybeCastSet( entities );
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
	async updateOne( table, queryFind, update, options = {}) {
		let entity = await this.httpQuery( 'PATCH', table, update, getQueryObject( queryFind, options ));
		if ( !_.isNil( entity )) {
			entity.idHash = {
				[this.name]: entity.id,
			};
		}
		return this.maybeCastEntity( entity );
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
	async updateMany( table, queryFind, update, options = {}) {
		let entities = await this.httpQuery( 'PATCH', this.getPluralEndpoint( table ), update, getQueryObject( queryFind, options ));
		if ( !_.isEmpty( entities )) {
			entities = _.map( entities, entity => {
				entity.idHash = {
					[this.name]: entity.id,
				};
				return entity;
			});
		}
		return this.maybeCastSet( entities );
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
	async deleteOne( table, queryFind, options = {}) {
		return await this.httpQuery( 'DELETE', table, null, getQueryObject( queryFind, options ));
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
	async deleteMany( table, queryFind, options = {}) {
		return await this.httpQuery( 'DELETE', this.getPluralEndpoint( table ), null, getQueryObject( queryFind, options ));
	}
}

module.exports = WebApiDiasporaAdapter;
