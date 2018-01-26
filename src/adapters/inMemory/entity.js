'use strict';

const DataStoreEntity = require( '../base/entity.js' );

/**
 * Entity stored in {@link Adapters.InMemoryDiasporaAdapter the in-memory adapter}.
 * @extends DataStoreEntities.DataStoreEntity
 * @memberof DataStoreEntities
 */
class InMemoryEntity extends DataStoreEntity {
	/**
	 * Construct a in memory entity with specified content & parent.
	 * 
	 * @author gerkin
	 * @param {Object}                   entity     - Object containing attributes to inject in this entity. The only **reserved key** is `dataSource`.
	 * @param {Adapters.DiasporaAdapter} dataSource - Adapter that spawn this entity.
	 */
	constructor( entity, dataSource ) {
		super( entity, dataSource );
	}
}

module.exports = InMemoryEntity;
