'use strict';

const {
	_,
} = require( '../dependencies' );

/**
 * @module Adapters/Base/Entity
 */

/**
 * DataStoreEntity is the sub-entity reflecting a single source content. Values may differ from the Entity itself.
 */
class DataStoreEntity {
	/**
	 * Construct a new data source entity with specified content & parent.
	 * 
	 * @author gerkin
	 * @param {Object}                   entity     - Object containing attributes to inject in this entity. The only **reserved key** is `dataSource`.
	 * @param {Adapters.DiasporaAdapter} dataSource - Adapter that spawn this entity.
	 */
	constructor( entity, dataSource ) {
		if ( _.isNil( entity )) {
			return undefined;
		}
		if ( _.isNil( dataSource )) {
			throw new TypeError( `Expect 2nd argument to be the parent of this entity, have "${ dataSource }"` );
		}
		Object.defineProperties( this, {
			dataSource: {
				value:        dataSource,
				enumerable:   false,
				configurable: false,
			},
		});
		_.assign( this, entity );
	}
	
	/**
	 * Returns a plain object corresponding to this entity attributes.
	 * 
	 * @author gerkin
	 * @returns {Object} Plain object representing this entity.
	 */
	toObject() {
		return _.omit( this, [ 'dataSource', 'id' ]);
	}
}

module.exports = DataStoreEntity;
