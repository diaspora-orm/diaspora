'use strict';

const DataStoreEntity = require( './baseEntity.js' );

class InMemoryEntity extends DataStoreEntity {
	constructor( source ) {
		super( source );
	}
}

module.exports = InMemoryEntity;
