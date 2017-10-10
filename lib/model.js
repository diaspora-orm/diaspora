'use strict';

const {
	_, Promise,
} = require( 'lib/dependencies' );
const EntityFactory = require( 'lib/entityFactory' );
const Diaspora = require( 'lib/diaspora' );
const Set = require( 'lib/set' );

const {
	entityPrototypeProperties,
} = EntityFactory;

/**
 * @classdesc The model class is used to interact with the population of all data of the same type.
 */
class Model {
	/**
	 * @description Create a new Model that is allowed to interact with all entities of data sources tables selected
	 * @public
	 * @author gerkin
	 * @param {String}           name      Name of the model
	 * @param {ModelDescription} modelDesc Hash representing the configuration of the model
	 */
	constructor( name, modelDesc ) {
		const reservedPropIntersect = _.intersection( entityPrototypeProperties, _.keys( modelDesc.attributes ));
		if ( 0 !== reservedPropIntersect.length ) {
			throw new Error( `${ JSON.stringify( reservedPropIntersect ) } is/are reserved property names. To match those column names in data source, please use the data source mapper property` );
		}
		if ( !modelDesc.hasOwnProperty( 'sources' ) || !( _.isArrayLike( modelDesc.sources ) || _.isObject( modelDesc.sources ))) {
			throw new TypeError( `Expect model sources to be either an array or an object, had ${ JSON.stringify( modelDesc.sources ) }.` );
		}
		// Normalize our sources: normalized form is an object with keys corresponding to source name, and key corresponding to remaps
		const sourcesNormalized = _.isArrayLike( modelDesc.sources ) ? _.zipObject( modelDesc.sources, _.times( modelDesc.sources.length, _.constant({}))) : _.mapValues( modelDesc.sources, ( remap, dataSourceName ) => {
			if ( true === remap ) {
				return {};
			} else if ( _.isObject( remap )) {
				return remap;
			} else {
				throw new TypeError( `Datasource "${ dataSourceName }" value is invalid: expect \`true\` or a remap hash, but have ${ JSON.stringify( remap ) }` );
			}
		});
		// List sources required by this model
		const sourceNames = _.keys( sourcesNormalized );
		const scopeAvailableSources = Diaspora.dataSources;
		const modelSources = _.pick( scopeAvailableSources, sourceNames );
		const missingSources = _.difference( sourceNames, _.keys( modelSources ));
		if ( 0 !== missingSources.length ) {
			throw new Error( `Missing data sources ${ missingSources.map( v => `"${ v }"` ).join( ', ' ) }` );
		}

		// Now, we are sure that config is valid. We can configure our datasources with model options, and set `this` properties.
		_.forEach( sourcesNormalized, ( remap, sourceName ) => {
			const sourceConfiguring = modelSources[sourceName];
			sourceConfiguring.configureCollection( name, remap );
		});
		this.dataSources = modelSources;
		this.defaultDataSource = sourceNames[0];
		this.name = name;
		this.entityFactory = EntityFactory( name, modelDesc.attributes, this );
	}

	/**
	 * @method getDataSource
	 * @description Create a new Model that is allowed to interact with all entities of data sources tables selected
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @throws {Error} Thrown if requested source name does not exists
	 * @param   {String} [sourceName=Model.defaultDataSource] Name of the source to get. It corresponds to one of the sources you set in Model#modelDesc.sources
	 * @returns {Adapters.DiasporaAdapter} Source adapter with requested name
	 */
	getDataSource( sourceName ) {
		if ( _.isNil( sourceName )) {
			sourceName = this.defaultDataSource;
		} else if ( !this.dataSources.hasOwnProperty( sourceName )) {
			throw new Error( `Unknown data source "${ sourceName }" in model "${ this.name }", available are ${ _.keys( this.dataSources ).map( v => `"${ v }"` ).join( ', ' ) }` );
		}
		return this.dataSources[sourceName];
	}

	/**
	 * @method spawn
	 * @description Create a new *orphan* {@link Entity entity}
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {Object} source Object to copy attributes from
	 * @returns {Entity} New *orphan* entity
	 */
	spawn( source ) {
		const newEntity = new this.entityFactory( source );
		return newEntity;
	}

	/**
	 * @method spawnMulti
	 * @description Create multiple new *orphan* {@link Entity entities}
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {Object[]} sources Array of objects to copy attributes from
	 * @returns {Set} Set with new *orphan* entities
	 */
	spawnMulti( sources ) {
		return new Set( this, _.map( sources, source => this.spawn( source )));
	}

	/**
	 * @method insert
	 * @description Insert a raw source object in the data store
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {Object} source Object to copy attributes from
	 * @param   {String} [dataSourceName=Model.defaultDataSource] Name of the data source to insert in
	 * @returns {Promise} Promise resolved with new *sync* {@link Entity entity}
	 */
	insert( source, dataSourceName ) {
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.insertOne( this.name, source ).then( entity => {
			return Promise.resolve( new this.entityFactory( entity ));
		});
	}

	/**
	 * @method insertMany
	 * @description Insert multiple raw source objects in the data store
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {Object[]} sources Array of object to copy attributes from
	 * @param   {String} [dataSourceName=Model.defaultDataSource] Name of the data source to insert in
	 * @returns {Promise} Promise resolved with a {@link Set set} containing new *sync* entities
	 */
	insertMany( sources, dataSourceName ) {
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.insertMany( this.name, sources ).then( entities => {
			const newEntities = _.map( entities, entity => new this.entityFactory( entity ));
			const collection = new Set( this, newEntities );
			return Promise.resolve( collection );
		});
	}

	/**
	 * @method find
	 * @description Retrieve a single entity from specified data source that matches provided `queryFind` and `options`
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]      Query to get desired entity
	 * @param   {QueryLanguage#QueryOptions} [options={}]        Options for this query
	 * @param   {String} [dataSourceName=Model.defaultDataSource] Name of the data source to get entity from
	 * @returns {Promise} Promise resolved with the found {@link Entity entity} in *sync* state
	 */
	find( queryFind = {}, options = {}, dataSourceName ) {
		if ( _.isString( options ) && !!_.isNil( dataSourceName )) {
			dataSourceName = options;
			options = {};
		} else if ( _.isString( queryFind ) && !!_.isNil( options ) && !!_.isNil( dataSourceName )) {
			dataSourceName = queryFind;
			queryFind = {};
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.findOne( this.name, queryFind, options ).then( dataSourceEntity => {
			if ( _.isNil( dataSourceEntity )) {
				return Promise.resolve();
			}
			const newEntity = new this.entityFactory( dataSourceEntity );
			newEntity.dataSources[dataSource.name] = dataSourceEntity;
			return Promise.resolve( newEntity );
		});
	}

	/**
	 * @method findMany
	 * @description Retrieve multiple entities from specified data source that matches provided `queryFind` and `options`
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]      Query to get desired entities
	 * @param   {QueryLanguage#QueryOptions} [options={}]        Options for this query
	 * @param   {String} [dataSourceName=Model.defaultDataSource] Name of the data source to get entities from
	 * @returns {Promise} Promise resolved with a {@link Set set} of found entities in *sync* state
	 */
	findMany( queryFind = {}, options = {}, dataSourceName ) {
		if ( _.isString( options ) && !!_.isNil( dataSourceName )) {
			dataSourceName = options;
			options = {};
		} else if ( _.isString( queryFind ) && !!_.isNil( options ) && !!_.isNil( dataSourceName )) {
			dataSourceName = queryFind;
			queryFind = {};
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.findMany( this.name, queryFind, options ).then( entities => {
			const newEntities = _.map( entities, entity => new this.entityFactory( entity ));
			const collection = new Set( this, newEntities );
			return Promise.resolve( collection );
		});
	}

	/**
	 * @method update
	 * @description Update a single entity from specified data source that matches provided `queryFind` and `options`
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind      Query to get desired entity
	 * @param   {Object} update Attributes to update on matched set
	 * @param   {QueryLanguage#QueryOptions} [options={}]        Options for this query
	 * @param   {String} [dataSourceName=Model.defaultDataSource] Name of the data source to get entity from
	 * @returns {Promise} Promise resolved with the updated {@link Entity entity} in *sync* state
	 */
	update( queryFind, update, options = {}, dataSourceName ) {
		if ( _.isString( options ) && !!_.isNil( dataSourceName )) {
			dataSourceName = options;
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.updateOne( this.name, queryFind, update, options ).then( dataSourceEntity => {
			if ( _.isNil( dataSourceEntity )) {
				return Promise.resolve();
			}
			const newEntity = new this.entityFactory( dataSourceEntity );
			return Promise.resolve( newEntity );
		});
	}

	/**
	 * @method updateMany
	 * @description Update multiple entities from specified data source that matches provided `queryFind` and `options`
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]      Query to get desired entities
	 * @param   {Object} update Attributes to update on matched set
	 * @param   {QueryLanguage#QueryOptions} [options={}]        Options for this query
	 * @param   {String} [dataSourceName=Model.defaultDataSource] Name of the data source to get entities from
	 * @returns {Promise} Promise resolved with the {@link Set set} of found entities in *sync* state
	 */
	updateMany( queryFind, update, options = {}, dataSourceName ) {
		if ( _.isString( options ) && !!_.isNil( dataSourceName )) {
			dataSourceName = options;
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.updateMany( this.name, queryFind, update, options ).then( entities => {
			const newEntities = _.map( entities, entity => new this.entityFactory( entity ));
			const collection = new Set( this, newEntities );
			return Promise.resolve( collection );
		});
	}

	/**
	 * @method delete
	 * @description Delete a single entity from specified data source that matches provided `queryFind` and `options`
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]      Query to get desired entity
	 * @param   {QueryLanguage#QueryOptions} [options={}]        Options for this query
	 * @param   {String} [dataSourceName=Model.defaultDataSource] Name of the data source to get entity from
	 * @returns {Promise} Promise resolved with `undefined`
	 */
	delete( queryFind = {}, options = {}, dataSourceName ) {
		if ( _.isString( options ) && !!_.isNil( dataSourceName )) {
			dataSourceName = options;
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.deleteOne( this.name, queryFind, options );
	}

	/**
	 * @method deleteMany
	 * @description Delete multiple entities from specified data source that matches provided `queryFind` and `options`
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]      Query to get desired entities
	 * @param   {QueryLanguage#QueryOptions} [options={}]        Options for this query
	 * @param   {String} [dataSourceName=Model.defaultDataSource] Name of the data source to get entities from
	 * @returns {Promise} Promise resolved with `undefined`
	 */
	deleteMany( queryFind = {}, options = {}, dataSourceName ) {
		if ( _.isString( options ) && !!_.isNil( dataSourceName )) {
			dataSourceName = options;
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.deleteMany( this.name, queryFind, options );
	}
}

module.exports = Model;
