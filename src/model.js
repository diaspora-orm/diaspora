'use strict';

const {
	_, Promise,
} = require( './dependencies' );
const EntityFactory = require( './entityFactory' );
const {Diaspora} = require( './diaspora' );
const Set = require( './set' );
const Validator = require( './validator' );

const {
	entityPrototypeProperties,
} = EntityFactory;

/**
 * @module Model
 */

/**
 * Object describing a model.
 *
 * @typedef  {Object} ModelDescription
 * @author gerkin
 * @property {module:Model~SourcesDescriptor}                    sources         - List of sources to use with this model.
 * @property {Object<string, module:Model~AttributesDescriptor>} attributes      - Attributes of the model.
 * @property {Object<string, Function>}                                methods         - Methods to add to entities prototype.
 * @property {Object<string, Function>}                                staticMethods   - Static methods to add to entities.
 * @property {Object<string, Function|Function[]>}                     lifecycleEvents - Events to bind on entities.
 */

/**
 * Object describing the attributes of a {@link Model~Model}.
 *
 * @typedef  {Object} AttributesDescriptor
 * @author gerkin
 * @property {string} [type]           - Expected type of the value. Either `type` or `model` should be defined, or none.
 * @property {string} [model]          - Expected model of the value. Either `type` or `model` should be defined, or none.
 * @property {module:Model~AttributesDescriptor|module:Model~AttributesDescriptor[]} [of] - Description (or array of descriptions) of possible values for this field
 * @property {boolean} [required=false] - Set to `true` to require a value. Even when `true`, empty arrays are allowed. To require at least one element in an array, use the `minLength` property
 * @property {module:Model~CustomValidator} [validate] - Custom validation callback.
 */

const findArgs = ( model, queryFind = {}, options = {}, dataSourceName ) => {
	let ret;
	if ( _.isString( options ) && _.isNil( dataSourceName )) {
		ret = {
			dataSourceName: options,
			options:        {},
		};
	} else if ( _.isString( queryFind ) && _.isNil( options ) && _.isNil( dataSourceName )) {
		ret = {
			dataSourceName: queryFind,
			queryFind:      {},
			options:        {},
		};
	} else {
		ret = {
			queryFind,
			options,
			dataSourceName,
		};
	}
	ret.dataSource = model.getDataSource( ret.dataSourceName );
	return ret;
};

const makeSet = model => {
	return dataSourceEntities => {
		const newEntities = _.map( dataSourceEntities, dataSourceEntity => new model.entityFactory( dataSourceEntity ));
		const set = new Set( model, newEntities );
		return Promise.resolve( set );
	};
};
const makeEntity = model => {
	return dataSourceEntity => {
		if ( _.isNil( dataSourceEntity )) {
			return Promise.resolve();
		}
		const newEntity = new model.entityFactory( dataSourceEntity );
		return Promise.resolve( newEntity );
	};
};

const doDelete = ( methodName, model ) => {
	return ( queryFind = {}, options = {}, dataSourceName ) => {
		// Sort arguments
		const args = findArgs( model, queryFind, options, dataSourceName );
		return args.dataSource[methodName]( model.name, args.queryFind, args.options );
	};
};

const doFindUpdate = ( model, plural, queryFind, options, dataSourceName, update ) => {
	// Sort arguments
	const queryComponents = findArgs( model, queryFind, options, dataSourceName );
	const args = _([ model.name, queryComponents.queryFind ]).push( update ).push( queryComponents.options ).compact().value();
	return queryComponents.dataSource[( update ? 'update' : 'find' ) + ( plural ? 'Many' : 'One' )]( ...args )
		.then(( plural ? makeSet : makeEntity )( model ));
};

const normalizeRemaps = modelDesc => {
	let sources = modelDesc.sources;
	if ( _.isString( sources )) {
		sources = {[modelDesc.sources]: true};
	} else if ( _.isArrayLike( sources )) {
		sources = _.zipObject( sources, _.times( sources.length, _.constant({})));
	} else {
		sources = _.mapValues( sources, ( remap, dataSourceName ) => {
			if ( true === remap ) {
				return {};
			} else if ( _.isObject( remap )) {
				return remap;
			} else {
				throw new TypeError( `Datasource "${ dataSourceName }" value is invalid: expect \`true\` or a remap hash, but have ${ JSON.stringify( remap ) }` );
			}
		});
	}
	return sources;
};

/**
 * The model class is used to interact with the population of all data of the same type.
 */
class Model {
	/**
	 * Create a new Model that is allowed to interact with all entities of data sources tables selected.
	 *
	 * @author gerkin
	 * @param {string}                              name      - Name of the model.
	 * @param {ModelConfiguration.ModelDescription} modelDesc - Hash representing the configuration of the model.
	 */
	constructor( name, modelDesc ) {
		// Check model configuration
		const reservedPropIntersect = _.intersection( entityPrototypeProperties, _.keys( modelDesc.attributes ));
		if ( 0 !== reservedPropIntersect.length ) {
			throw new Error( `${ JSON.stringify( reservedPropIntersect ) } is/are reserved property names. To match those column names in data source, please use the data source mapper property` );
		} else if ( !modelDesc.hasOwnProperty( 'sources' ) || !( _.isArrayLike( modelDesc.sources ) || _.isObject( modelDesc.sources ) || _.isString( modelDesc.sources ))) {
			throw new TypeError( `Expect model sources to be either a string, an array or an object, had ${ JSON.stringify( modelDesc.sources ) }.` );
		}
		// Normalize our sources: normalized form is an object with keys corresponding to source name, and key corresponding to remaps
		const sourcesNormalized = normalizeRemaps( modelDesc );
		// List sources required by this model
		const sourceNames = _.keys( sourcesNormalized );
		const modelSources = _.pick( Diaspora.dataSources, sourceNames );
		const missingSources = _.difference( sourceNames, _.keys( modelSources ));
		if ( 0 !== missingSources.length ) {
			throw new Error( `Missing data sources ${ missingSources.map( v => `"${ v }"` ).join( ', ' ) }` );
		}

		if ( !_.isObject( modelDesc.attributes )) {
			throw new TypeError( `Model attributes should be an object, have ${ JSON.stringify( modelDesc.attributes ) }` );
		}
		// Now, we are sure that config is valid. We can configure our datasources with model options, and set `this` properties.
		_.forEach( sourcesNormalized, ( remap, sourceName ) => modelSources[sourceName].configureCollection( name, remap ));
		_.assign( this, {
			dataSources:       modelSources,
			defaultDataSource: _( modelSources ).keys().first(),
			name,
			entityFactory:     EntityFactory( name, modelDesc, this ),
			validator:         new Validator( modelDesc.attributes ),
		});
	}

	/**
	 * Create a new Model that is allowed to interact with all entities of data sources tables selected.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if requested source name does not exists.
	 * @param   {string} [sourceName=Model.defaultDataSource] - Name of the source to get. It corresponds to one of the sources you set in {@link Model#modelDesc}.Sources.
	 * @returns {Adapters.DiasporaAdapter} Source adapter with requested name.
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
	 * Create a new *orphan* {@link Entity entity}.
	 *
	 * @author gerkin
	 * @param   {Object} source - Object to copy attributes from.
	 * @returns {Entity} New *orphan* entity.
	 */
	spawn( source ) {
		const newEntity = new this.entityFactory( source );
		return newEntity;
	}

	/**
	 * Create multiple new *orphan* {@link Entity entities}.
	 *
	 * @author gerkin
	 * @param   {Object[]} sources - Array of objects to copy attributes from.
	 * @returns {Set} Set with new *orphan* entities.
	 */
	spawnMany( sources ) {
		return new Set( this, _.map( sources, source => this.spawn( source )));
	}

	/**
	 * Insert a raw source object in the data store.
	 *
	 * @author gerkin
	 * @param   {Object} source                                   - Object to copy attributes from.
	 * @param   {string} [dataSourceName=Model.defaultDataSource] - Name of the data source to insert in.
	 * @returns {Promise} Promise resolved with new *sync* {@link Entity entity}.
	 */
	insert( source, dataSourceName ) {
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.insertOne( this.name, source ).then( entity => {
			return Promise.resolve( new this.entityFactory( entity ));
		});
	}

	/**
	 * Insert multiple raw source objects in the data store.
	 *
	 * @author gerkin
	 * @param   {Object[]} sources                                  - Array of object to copy attributes from.
	 * @param   {string}   [dataSourceName=Model.defaultDataSource] - Name of the data source to insert in.
	 * @returns {Promise} Promise resolved with a {@link Set set} containing new *sync* entities.
	 */
	insertMany( sources, dataSourceName ) {
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.insertMany( this.name, sources ).then( makeSet( this ));
	}

	/**
	 * Retrieve a single entity from specified data source that matches provided `queryFind` and `options`.
	 *
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entity.
	 * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
	 * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entity from.
	 * @returns {Promise} Promise resolved with the found {@link Entity entity} in *sync* state.
	 */
	find( queryFind, options, dataSourceName ) {
		return doFindUpdate( this, false, queryFind, options, dataSourceName );
	}

	/**
	 * Retrieve multiple entities from specified data source that matches provided `queryFind` and `options`.
	 *
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entities.
	 * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
	 * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entities from.
	 * @returns {Promise} Promise resolved with a {@link Set set} of found entities in *sync* state.
	 */
	findMany( queryFind, options, dataSourceName ) {
		return doFindUpdate( this, true, queryFind, options, dataSourceName );
	}

	/**
	 * Update a single entity from specified data source that matches provided `queryFind` and `options`.
	 *
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entity.
	 * @param   {Object}                               update                                   - Attributes to update on matched set.
	 * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
	 * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entity from.
	 * @returns {Promise} Promise resolved with the updated {@link Entity entity} in *sync* state.
	 */
	update( queryFind, update, options = {}, dataSourceName ) {
		return doFindUpdate( this, false, queryFind, options, dataSourceName, update );
	}

	/**
	 * Update multiple entities from specified data source that matches provided `queryFind` and `options`.
	 *
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entities.
	 * @param   {Object}                               update                                   - Attributes to update on matched set.
	 * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
	 * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entities from.
	 * @returns {Promise} Promise resolved with the {@link Set set} of found entities in *sync* state.
	 */
	updateMany( queryFind, update, options = {}, dataSourceName ) {
		return doFindUpdate( this, true, queryFind, options, dataSourceName, update );
	}

	/**
	 * Delete a single entity from specified data source that matches provided `queryFind` and `options`.
	 *
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind]                           - Query to get desired entity.
	 * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
	 * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entity from.
	 * @returns {Promise} Promise resolved with `undefined`.
	 */
	delete( queryFind, options = {}, dataSourceName ) {
		return doDelete( 'deleteOne', this )( queryFind, options, dataSourceName );
	}

	/**
	 * Delete multiple entities from specified data source that matches provided `queryFind` and `options`.
	 *
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entities.
	 * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
	 * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entities from.
	 * @returns {Promise} Promise resolved with `undefined`.
	 */
	deleteMany( queryFind = {}, options = {}, dataSourceName ) {
		return doDelete( 'deleteMany', this )( queryFind, options, dataSourceName );
	}
}

module.exports = Model;