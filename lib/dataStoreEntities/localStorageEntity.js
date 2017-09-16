'use strict';

const DataStoreEntity = require( './baseEntity.js' );

class LocalStorageEntity extends DataStoreEntity {
	constructor( source ) {
		super( source );
	}
}

module.exports = LocalStorageEntity;
