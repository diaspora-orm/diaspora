'use strict';

const {
	_,
} = require( 'lib/dependencies' );

/**
 * @namespace DataStoreEntities
 */

class DataStoreEntity {
	/**
	 * @class DataStoreEntity
	 * @classdesc DataStoreEntity is the sub-entity reflecting a single source content. Values may differ from the Entity itself
	 * @memberof DataStoreEntities
	 * @description Construct a new data source entity with specified content & parent
	 * @public
	 * @author gerkin
	 * @param {Object}                   entity     Object containing attributes to inject in this entity. The only **reserved key** is `dataSource``
	 * @param {Adapters.DiasporaAdapter} dataSource Adapter that spawn this entity
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
	 * @method toObject
	 * @description Returns a plain object corresponding to this entity attributes
	 * @memberof DataStoreEntities.DataStoreEntity
	 * @public
	 * @author gerkin
	 * @returns {Object} Plain object representing this entity
	 */
	toObject() {
		return _.omit( this, [ 'dataSource', 'id' ]);
	}
}

module.exports = DataStoreEntity;
