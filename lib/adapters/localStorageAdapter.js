'use strict';

const DiasporaAdapter = require( './baseAdapter.js' );
const LocalStorageEntity = require( '../dataStoreEntities/localStorageEntity.js' );
const _ = require('lodash');
const c = require('check-types');
const Promise = require('bluebird');

class LocalStorageDiasporaAdapter extends DiasporaAdapter {
	constructor( config ) {
		super( LocalStorageEntity );
		_.defaults(config, {
			session: false,
		});
		this.state = 'ready';
		this.source = (true === config.session ? sessionStorage : localStorage);
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

	ensureTableExists( table ) {
		if ( !c.assigned(this.source.getItem( table ))) {
			this.source.setItem( table, '[]' );
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
	
	getItemName(table, id){
		return `${table}.id=${id}`;
	}

	insertOne( table, entity ) {
		this.ensureTableExists( table );
		entity.id = this.generateUUID();
		entity.idHash = {
			[this.name]: entity.id,
		};
		const tableIndex = JSON.parse(this.source.getItem(table));
		tableIndex.push(entity.id);
		try{
		this.source.setItem(table, JSON.stringify(tableIndex));
		this.source.setItem(this.getItemName(table, entity.id), JSON.stringify(entity));
		} catch(error){
			return Promise.reject(error);
		}
		return Promise.resolve( new this.classEntity( entity ));
	}

	findOneById(table, id){
		const item = this.source.getItem(this.getItemName(table, id));
		if(c.assigned(item)){
			return Promise.resolve( new this.classEntity( JSON.parse(item)));
		}
		return Promise.resolve();
	}
	
	findOne( table, queryFind, options = {}) {
		this.ensureTableExists( table );
		if(!c.object(queryFind)){
			return this.findOneById(table, queryFind);
		} else if(queryFind.hasOwnProperty('id') && 1 === _.keys(queryFind).length){
			return this.findOneById(table, queryFind.id);
		}
		const items = JSON.parse(this.source.getItem(table));
		let returnedItem;
		const matchFct = _.matches(queryFind);
		_.each(items, itemId => {
			const item = JSON.parse(this.source.getItem(this.getItemName(table, itemId)));
			if(matchFct(item)){
				returnedItem = item;
				return false;
			}
		});
		return Promise.resolve( c.assigned(returnedItem) ? new this.classEntity( returnedItem) : undefined);
	}


	/*	findMany( table, queryFind, options = {}) {
		this.ensureTableExists( table );
		const matches = _.filter( storeTable.items, queryFind );
		const reducedMatches = this.constructor.applyOptionsToSet( matches, options );
		return Promise.resolve( _.map( reducedMatches, entity => new this.classEntity( entity )));
	}

	updateOne( table, queryFind, update, options ) {
		this.ensureTableExists( table );
		const match = _.filter( storeTable.items, queryFind );
		_.assign( _.first( match ), update );
		return Promise.resolve( new this.classEntity( _.first( match )));
	}

	updateMany( table, queryFind, update, options ) {
		this.ensureTableExists( table );
		const matches = _.filter( storeTable.items, queryFind );
		const reducedMatches = this.constructor.applyOptionsToSet( matches, options );
		_.forEach( reducedMatches, match => {
			_.assign( match, update );
		});
		return Promise.resolve( _.map( reducedMatches, entity => new this.classEntity( entity )));
	}

	deleteOne( table, queryFind, options = {}) {
		this.ensureTableExists( table );
		return this.findOne( table, queryFind, options ).then( entityToDelete => {
			storeTable.items = _.reject( storeTable.items, entity => entity.id === entityToDelete.idHash[this.name]);
			return Promise.resolve( undefined );
		});
	}

	deleteMany( table, queryFind, options = {}) {
		this.ensureTableExists( table );
		return this.findMany( table, queryFind, options ).then( entitiesToDelete => {
			const entitiesIds = _.map( entitiesToDelete, entity => _.get( entity, `idHash.${ this.name }` ));
			storeTable.items = _.reject( storeTable.items, entity => {
				return _.includes( entitiesIds, entity.id );
			});
			return Promise.resolve( undefined );
		});
	}*/
}

module.exports = LocalStorageDiasporaAdapter;
