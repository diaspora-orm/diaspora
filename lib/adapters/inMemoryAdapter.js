'use strict';

const DiasporaAdapter = require( './baseAdapter.js' );
const InMemoryEntity = require( '../dataStoreEntities/inMemoryEntity.js' );
const _ = require('lodash');
const c = require('check-types');
const Promise = require('bluebird');

class InMemoryDiasporaAdapter extends DiasporaAdapter {
	constructor( config ) {
		super( InMemoryEntity );
		this.state = 'ready';
		this.store = {};
	}

	generateUUID() {
		var d = new Date().getTime();
		if ( 'undefined' !== typeof window && window.performance && 'function' === typeof window.performance.now ) {
			d += performance.now(); //use high-precision timer if available
		}
		const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, c => {
			const r = ( d + Math.random() * 16 ) % 16 | 0;
			d = Math.floor( d / 16 );
			return ( 'x' === c ? r : ( r & 0x3 | 0x8 )).toString( 16 );
		});
		return uuid;
	}

	getSafeTableExists( table ) {
		if ( this.store.hasOwnProperty( table )) {
			return this.store[table];
		} else {
			return this.store[table] = {
				items: [],
			};
		} 
	}

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

	insertOne( table, entity ) {
		const storeTable = this.getSafeTableExists( table );
		entity.id = this.generateUUID();
		entity.idHash = {
			[this.name]: entity.id,
		};
		storeTable.items.push( entity );
		return Promise.resolve( new this.classEntity( entity ));
	}

	findOne( table, queryFind, options = {}) {
		const storeTable = this.getSafeTableExists( table );
		const match = _.filter( storeTable.items, queryFind );
		return Promise.resolve( new this.classEntity( match[0]));
	}

	findMany( table, queryFind, options = {}) {
		const storeTable = this.getSafeTableExists( table );
		const matches = _.filter( storeTable.items, queryFind );
		const reducedMatches = this.constructor.applyOptionsToSet( matches, options );
		return Promise.resolve( _.map( reducedMatches, entity => new this.classEntity( entity )));
	}

	updateOne( table, queryFind, update, options ) {
		const storeTable = this.getSafeTableExists( table );
		const match = _.filter( storeTable.items, queryFind );
		_.assign( _.first( match ), update );
		return Promise.resolve( new this.classEntity( _.first( match )));
	}

	updateMany( table, queryFind, update, options ) {
		const storeTable = this.getSafeTableExists( table );
		const matches = _.filter( storeTable.items, queryFind );
		const reducedMatches = this.constructor.applyOptionsToSet( matches, options );
		_.forEach( reducedMatches, match => {
			_.assign( match, update );
		});
		return Promise.resolve( _.map( reducedMatches, entity => new this.classEntity( entity )));
	}

	deleteOne( table, queryFind, options = {}) {
		const storeTable = this.getSafeTableExists( table );
		return this.findOne( table, queryFind, options ).then( entityToDelete => {
			storeTable.items = _.reject( storeTable.items, entity => entity.id === entityToDelete.idHash[this.name]);
			return Promise.resolve( undefined );
		});
	}

	deleteMany( table, queryFind, options = {}) {
		const storeTable = this.getSafeTableExists( table );
		return this.findMany( table, queryFind, options ).then( entitiesToDelete => {
			const entitiesIds = _.map( entitiesToDelete, entity => _.get( entity, `idHash.${ this.name }` ));
			storeTable.items = _.reject( storeTable.items, entity => {
				return _.includes( entitiesIds, entity.id );
			});
			return Promise.resolve( undefined );
		});
	}
}

module.exports = InMemoryDiasporaAdapter;
