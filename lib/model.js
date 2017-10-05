'use strict';

const _ = require( 'lodash' );
const Promise = require( 'bluebird' );
const EntityFactory = require( 'diaspora/entityFactory' );
const Diaspora = require( 'diaspora/diaspora' );

const {
	entityPrototypeProperties,
} = EntityFactory;

/**
 * @class Model
 * @classdesc The model class is used to interact with the population of all data of the same type.
 * @description Construct a new model.
 * @public
 * @author gerkin
 * @param {String} namespace Namespace of the model. This may be used for scope or inheriting mechanisms
 * @param {String} namespace Name of the model
 * @param {ModelDescription} modelDesc Hash representing the configuration of the model
 */
class Model {
	constructor( namespace, name, modelDesc ) {
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
		// Get sources. Later, implement scoping so that modules A requiring module B can access dataSources from module B
		const scopeAvailableSources = Diaspora.dataSources[namespace];
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

	getDataSource( sourceName ) {
		if ( _.isNil( sourceName )) {
			sourceName = this.defaultDataSource;
		} else if ( !this.dataSources.hasOwnProperty( sourceName )) {
			throw new Error( `Unknown data source "${ sourceName }" in model "${ this.name }", available are ${ _.keys( this.dataSources ).map( v => `"${ v }"` ).join( ', ' ) }` );
		}
		return this.dataSources[sourceName];
	}

	spawn( source ) {
		const newEntity = new this.entityFactory( source );
		return newEntity;
	}

	spawnMulti( sources ) {
		return _.map( sources, source => this.spawn( source ));
	}

	insert( source, dataSourceName ) {
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.insertOne( this.name, source ).then( entity => {
			return Promise.resolve( new this.entityFactory( entity ));
		});
	}

	insertMany( sources, dataSourceName ) {
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.insertMany( this.name, sources ).then( entities => {
			return Promise.resolve( _.map( entities, entity => new this.entityFactory( entity )));
		});
	}

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
		return dataSource.findMany( this.name, queryFind, options ).then( dataSourceEntities => {
			const entities = _.map( dataSourceEntities, dataSourceEntity => {
				const newEntity = new this.entityFactory( dataSourceEntity );
				newEntity.dataSources[dataSource.name] = dataSourceEntity;
				return newEntity;
			});
			return Promise.resolve( entities );
		});
	}

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

	updateMany( queryFind, update, options = {}, dataSourceName ) {
		if ( _.isString( options ) && !!_.isNil( dataSourceName )) {
			dataSourceName = options;
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.updateMany( this.name, queryFind, update, options ).then( dataSourceEntities => {
			const entities = _.map( dataSourceEntities, dataSourceEntity => {
				const newEntity = new this.entityFactory( dataSourceEntity );
				return newEntity;
			});
			return Promise.resolve( entities );
		});
	}

	delete( queryFind = {}, options = {}, dataSourceName ) {
		if ( _.isString( options ) && !!_.isNil( dataSourceName )) {
			dataSourceName = options;
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.deleteOne( this.name, queryFind, options );
	}

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
