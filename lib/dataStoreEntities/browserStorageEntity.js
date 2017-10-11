'use strict';

const DataStoreEntity = require( './baseEntity.js' );

/**
 * Entity stored in {@link Adapters.BrowserStorageDiasporaAdapter the local storage adapter}.
 * 
 * @extends DataStoreEntities.DataStoreEntity
 * @memberof DataStoreEntities
 */
class BrowserStorageEntity extends DataStoreEntity {
	/**
	 * Construct a local storage entity with specified content & parent.
	 * 
	 * @author gerkin
	 * @param {Object}                   entity     - Object containing attributes to inject in this entity. The only **reserved key** is `dataSource`.
	 * @param {Adapters.DiasporaAdapter} dataSource - Adapter that spawn this entity.
	 */
	constructor( entity, dataSource ) {
		super( entity, dataSource );
	}
}

module.exports = BrowserStorageEntity;
