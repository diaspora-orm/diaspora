'use strict';

const {_} = require( 'diaspora/dependencies' );

/**
 * @namespace DataStoreEntities
 */

/**
 * @class DataStoreEntity
 * @classdesc DataStoreEntity is the sub-entity reflecting a single source content. Values may differ from the Entity itself
 * @memberof DataStoreEntities
 * @public
 * @author gerkin
 * @param {Object} source Hash containing properties to copy in this entity
 */
class DataStoreEntity {
	/**
	 * @description Construct a new data source entity with specified content & parent
	 * @constructs DataStoreEntity
	 * @memberof DataStoreEntities
	 * @public
	 * @author gerkin
	 * @param {Object} entity Object containing attributes to inject in this entity. The only **reserved key** is `dataSource``
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
	toObject() {
		return _.omit( this, [ 'dataSource', 'id' ]);
	}
}

module.exports = DataStoreEntity;
