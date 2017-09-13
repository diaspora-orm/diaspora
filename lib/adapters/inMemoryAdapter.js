'use strict';

const DiasporaAdapter = require('./baseAdapter.js');
const InMemoryEntity = require('../dataStoreEntities/inMemoryEntity.js');

class InMemoryDiasporaAdapter extends DiasporaAdapter {
	constructor( config ) {
		super( InMemoryEntity );
		this.state = 'ready';
		this.store = {};
	}

	generateUUID(){
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
		const match = l.filter( storeTable.items, queryFind );
		return Promise.resolve( new this.classEntity( match[0]));
	}

	findMany( table, queryFind, options = {}) {
		const storeTable = this.getSafeTableExists( table );
		const matches = l.filter( storeTable.items, queryFind );
		const reducedMatches = this.constructor.applyOptionsToSet( matches, options );
		return Promise.resolve( l.map( reducedMatches, entity => new this.classEntity( entity )));
	}

	updateOne( table, queryFind, update, options ) {
		const storeTable = this.getSafeTableExists( table );
		const match = l.filter( storeTable.items, queryFind );
		l.assign( l.first( match ), update );
		return Promise.resolve( new this.classEntity( l.first( match )));
	}

	updateMany( table, queryFind, update, options ) {
		const storeTable = this.getSafeTableExists( table );
		const matches = l.filter( storeTable.items, queryFind );
		const reducedMatches = this.constructor.applyOptionsToSet( matches, options );
		l.forEach( reducedMatches, match => {
			l.assign( match, update );
		});
		return Promise.resolve( l.map( reducedMatches, entity => new this.classEntity( entity )));
	}

	deleteOne( table, queryFind ) {
		const storeTable = this.getSafeTableExists( table );
		storeTable.items = l.reject( storeTable.items, queryFind );
		return Promise.resolve( undefined );
	}
}

module.exports = InMemoryDiasporaAdapter;