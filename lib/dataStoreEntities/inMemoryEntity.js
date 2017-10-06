'use strict';

const DataStoreEntity = require( 'lib/dataStoreEntities/baseEntity.js' );

/**
 * @class InMemoryEntity
 * @classdesc Entity stored in {@link InMemoryDiasporaAdapter the in-memory adapter}.
 * @extends DataStoreEntity
 * @memberof DataStoreEntities
 * @public
 * @author gerkin
 * @param {Object} source Hash containing properties to copy in this entity
 */
class InMemoryEntity extends DataStoreEntity {
	constructor( entity, dataSource ) {
		super( entity, dataSource );
	}
}

module.exports = InMemoryEntity;
