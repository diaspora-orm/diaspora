'use strict';

const DataStoreEntity = require( 'lib/dataStoreEntities/baseEntity.js' );

class BrowserStorageEntity extends DataStoreEntity {
	/**
	 * @class BrowserStorageEntity
	 * @classdesc Entity stored in {@link LocalStorageDiasporaAdapter the local storage adapter}.
	 * @extends DataStoreEntity
	 * @description Construct a local storage entity with specified content & parent
	 * @memberof DataStoreEntities
	 * @public
	 * @author gerkin
	 * @param {Object} entity Object containing attributes to inject in this entity. The only **reserved key** is `dataSource``
	 * @param {Adapters.DiasporaAdapter} dataSource Adapter that spawn this entity
	 */
	constructor( entity, dataSource ) {
		super( entity, dataSource );
	}
}

module.exports = BrowserStorageEntity;
