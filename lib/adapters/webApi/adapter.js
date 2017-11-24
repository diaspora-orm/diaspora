'use strict';

const {
	_, Promise,
} = require( '../../dependencies' );
const Utils = require( '../../utils' );

const Diaspora = require( '../../diaspora' );
const DiasporaAdapter = Diaspora.components.Adapters.Adapter;
const WebApiEntity = require( './entity.js' );

const request = require('request-promise');

const httpRequest = async (method, baseEndPoint, endPoint, data, queryObject) => {
	// browserify-ignore-start
	console.log({method, baseEndPoint, endPoint, data, queryObject});
	if(_.isNil(data)){
		data = true;
	}
	console.log(`> Querying ${baseEndPoint + endPoint} with method ${method} data ${JSON.stringify(data)} and query object ${JSON.stringify(queryObject)}`);
	const res = await request[method.toLowerCase()](baseEndPoint + endPoint, {json: data, qs: queryObject});
	console.log('> Res: ', require('util').inspect({res}, {colors: true}));
	return res;
	// browserify-ignore-start
	return new Promise((resolve, reject) => {
		const oReq = new XMLHttpRequest();
		oReq.addEventListener('load', () => {
			return resolve(oReq.responseJson);
		});
		oReq.open(method, `${this.baseEndPoint}${endPoint}`);
		oReq.send();
	});
}

const getQueryObject = (queryFind, options) => {
	if(options.skip === 0){
		delete options.skip;
	}

	return _.assign({}, _.omit(options, ['remapInput', 'remapOutput']), {where: queryFind});
}

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
	constructor(config) {
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
		_.defaults(config, {
			protocol: false,
			port: false,
			baseUrl: '',
			pluralApis: {},
		});
		if(!_.isString(config.host)){
			throw new Error(`"config.host" is not defined, or is not a string: had "${config.host}"`);
		}
		const protocolString = config.protocol ? `${config.protocol}:` : '';
		const portString = config.port ? `:${config.port}` : '';
		this.baseEndPoint = `${protocolString}//${config.host}${portString}${config.baseUrl}`;
		this.state = 'ready';
		this.pluralApis = config.pluralApis;
		console.log(this);
	}

	httpQuery(method, endPoint, data, queryObject){
		return httpRequest(method, this.baseEndPoint, endPoint, data, queryObject);
	}

	getPluralEndpoint(table){
		if(this.pluralApis[table]){
			return this.pluralApis[table];
		} else {
			return table + 's';
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
		entity = await this.httpQuery('PUT', `/${table}`, entity);
		if(!_.isNil(entity)){
			entity.idHash = {
				[this.name]: entity.id,
			};
		}
		return this.maybeCastEntity(entity);
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
		entities = await this.httpQuery('PUT', `/${this.getPluralEndpoint(table)}`, entities);
		if(!_.isEmpty(entities)){
			entities = _.map(entities, entity => {
				entity.idHash = {
					[this.name]: entity.id,
				};
				return entity;
			});
		}
		return this.maybeCastSet(entities);
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
		let entity = await this.httpQuery('GET', `/${table}`, null, getQueryObject(queryFind, options));
		if(!_.isNil(entity)){
			entity.idHash = {
				[this.name]: entity.id,
			};
		}
		return this.maybeCastEntity(entity);
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
		let entities = await this.httpQuery('GET', `/${this.getPluralEndpoint(table)}`, null, getQueryObject(queryFind, options));
		if(!_.isEmpty(entities)){
			entities = _.map(entities, entity => {
				entity.idHash = {
					[this.name]: entity.id,
				};
				return entity;
			});
		}
		return this.maybeCastSet(entities);
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
		let entity = await this.httpQuery('POST', `/${table}`, update, getQueryObject(queryFind, options));
		if(!_.isNil(entity)){
			entity.idHash = {
				[this.name]: entity.id,
			};
		}
		return this.maybeCastEntity(entity);
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
		let entities = await this.httpQuery('POST', `/${this.getPluralEndpoint(table)}`, update, getQueryObject(queryFind, options));
		if(!_.isEmpty(entities)){
			entities = _.map(entities, entity => {
				entity.idHash = {
					[this.name]: entity.id,
				};
				return entity;
			});
		}
		return this.maybeCastSet(entities);
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
		return await this.httpQuery('DELETE', `/${table}`, null, getQueryObject(queryFind, options));
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
		return await this.httpQuery('DELETE', `/${this.getPluralEndpoint(table)}`, null, getQueryObject(queryFind, options));
	}
}

module.exports = WebApiDiasporaAdapter;
