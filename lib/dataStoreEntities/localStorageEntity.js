'use strict';

const DataStoreEntity = require( './baseEntity.js' );

/**
 * @class LocalStorageEntity
 * @classdesc Entity stored in {@link LocalStorageDiasporaAdapter the local storage adapter}.
 * @extends DataStoreEntity
 * @public
 * @author gerkin
 * @param {Object} source Hash containing properties to copy in this entity
 */
class LocalStorageEntity extends DataStoreEntity {
	constructor( entity, dataSource ) {
		super( entity, dataSource );
	}
}

module.exports = LocalStorageEntity;
