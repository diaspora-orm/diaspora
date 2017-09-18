'use strict';

const _ = require( 'lodash' );
const c = require( 'check-types' );
const Promise = require( 'bluebird' );
const EntityFactory = require( './entityFactory' );
const Diaspora = require( './diaspora' );

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
		if ( !modelDesc.hasOwnProperty( 'sources' ) || !( c.array( modelDesc.sources ) || c.object( modelDesc.sources ))) {
			throw new TypeError( `Expect model sources to be either an array or an object, had ${ JSON.stringify( modelDesc.sources ) }.` );
		}
		// List sources required by this model
		const sourceNames = c.object( modelDesc.sources ) ? _.keys( modelDesc.sources ) : modelDesc.sources;
		// Get sources. Later, implement scoping so that modules A requiring module B can access dataSources from module B
		const scopeAvailableSources = Diaspora.dataSources[namespace];
		const modelSources = _.pick( scopeAvailableSources, sourceNames );
		// console.log({scopeAvailableSources, modelSources});
		const missingSources = _.difference( sourceNames, _.keys( modelSources ));
		if ( 0 !== missingSources.length ) {
			throw new Error( `Missing data sources ${ missingSources.map( v => `"${ v }"` ).join( ', ' ) }` );
		}
		this.dataSources = modelSources;
		this.defaultDataSource = sourceNames[0];
		this.name = name;
		this.entityFactory = EntityFactory( name, modelDesc.attributes, this );
	}

	getDataSource( sourceName ) {
		if ( !c.assigned( sourceName )) {
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
		if ( c.string( options ) && !c.assigned( dataSourceName )) {
			dataSourceName = options;
			options = {};
		} else if ( c.string( queryFind ) && !c.assigned( options ) && !c.assigned( dataSourceName )) {
			dataSourceName = queryFind;
			queryFind = {};
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.findOne( this.name, queryFind, options ).then( dataSourceEntity => {
			if ( !c.assigned( dataSourceEntity )) {
				return Promise.resolve();
			}
			const newEntity = new this.entityFactory( dataSourceEntity.toObject());
			newEntity.dataSources[dataSource.name] = dataSourceEntity;
			return Promise.resolve( newEntity );
		});
	}

	findMany( queryFind = {}, options = {}, dataSourceName ) {
		if ( c.string( options ) && !c.assigned( dataSourceName )) {
			dataSourceName = options;
			options = {};
		} else if ( c.string( queryFind ) && !c.assigned( options ) && !c.assigned( dataSourceName )) {
			dataSourceName = queryFind;
			queryFind = {};
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.findMany( this.name, queryFind, options ).then( dataSourceEntities => {
			const entities = _.map( dataSourceEntities, dataSourceEntity => {
				const newEntity = new this.entityFactory( dataSourceEntity.toObject());
				newEntity.dataSources[dataSource.name] = dataSourceEntity;
				return newEntity;
			});
			return Promise.resolve( entities );
		});
	}

	update( queryFind, update, options = {}, dataSourceName ) {
		if ( c.string( options ) && !c.assigned( dataSourceName )) {
			dataSourceName = options;
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.updateOne( this.name, queryFind, update, options ).then( dataSourceEntity => {
			const newEntity = new this.entityFactory( dataSourceEntity.toObject());
			newEntity.dataSources[dataSource.name] = dataSourceEntity;
			return Promise.resolve( newEntity );
		});
	}

	updateMany( queryFind, update, options = {}, dataSourceName ) {
		if ( c.string( options ) && !c.assigned( dataSourceName )) {
			dataSourceName = options;
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.updateMany( this.name, queryFind, update, options ).then( dataSourceEntities => {
			const entities = _.map( dataSourceEntities, dataSourceEntity => {
				const newEntity = new this.entityFactory( dataSourceEntity.toObject());
				newEntity.dataSources[dataSource.name] = dataSourceEntity;
				return newEntity;
			});
			return Promise.resolve( entities );
		});
	}

	delete( queryFind = {}, options = {}, dataSourceName ) {
		if ( c.string( options ) && !c.assigned( dataSourceName )) {
			dataSourceName = options;
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.deleteOne( this.name, queryFind, options );
	}

	deleteMany( queryFind = {}, options = {}, dataSourceName ) {
		if ( c.string( options ) && !c.assigned( dataSourceName )) {
			dataSourceName = options;
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.deleteMany( this.name, queryFind, options );
	}
}

module.exports = Model;
