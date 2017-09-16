'use strict';

const EntityFactory = require( './entityFactory' );
const Diaspora = require( './diaspora' );

const {
	entityPrototypeProperties,
} = EntityFactory;

class Model {
	constructor( moduleName, name, modelDesc ) {
		const reservedPropIntersect = l.intersection( entityPrototypeProperties, l.keys( modelDesc.attributes ));
		if ( 0 !== reservedPropIntersect.length ) {
			throw new Error( `${ JSON.stringify( reservedPropIntersect ) } is/are reserved property names. To match those column names in data source, please use the data source mapper property` );
		}
		if ( !modelDesc.hasOwnProperty( 'sources' ) || !( c.array( modelDesc.sources ) || c.object( modelDesc.sources ))) {
			throw new TypeError( `Expect model sources to be either an array or an object, had ${ JSON.stringify( modelDesc.sources ) }.` );
		}
		// List sources required by this model
		const sourceNames = c.object( modelDesc.sources ) ? l.keys( modelDesc.sources ) : modelDesc.sources;
		// Get sources. Later, implement scoping so that modules A requiring module B can access dataSources from module B
		const scopeAvailableSources = Diaspora.dataSources[moduleName];
		const modelSources = l.pick( scopeAvailableSources, sourceNames );
		// console.log({scopeAvailableSources, modelSources});
		const missingSources = l.difference( sourceNames, l.keys( modelSources ));
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
			throw new Error( `Unknown data source "${ sourceName }" in model "${ name }", available are ${ l.keys( this.dataSources ).map( v => `"${ v }"` ).join( ', ' ) }` );
		}
		return this.dataSources[sourceName];
	}

	spawn( source ) {
		const newEntity = new this.entityFactory( source );
		return newEntity;
	}

	spawnMulti( sources ) {
		return l.map( sources, source => this.spawn( source ));
	}

	insert( source, dataSourceName ) {
		const newItem = this.spawn( source );
		return newItem.persist( dataSourceName );
	}

	insertMany( sources, dataSourceName ) {
		const newItems = this.spawnMulti( sources );
		return Promise.map( newItems, item => item.persist( dataSourceName ));
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
			const entities = l.map( dataSourceEntities, dataSourceEntity => {
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
			const entities = l.map( dataSourceEntities, dataSourceEntity => {
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
