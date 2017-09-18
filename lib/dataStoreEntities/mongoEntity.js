'use strict';

const DataStoreEntity = require( './baseEntity.js' );

/**
 * @class MongoEntity
 * @classdesc Entity stored in {@link MongoDiasporaAdapter the local storage adapter}.
 * @extends DataStoreEntity
 * @public
 * @author gerkin
 * @param {Object} source Hash containing properties to copy in this entity
 */
class MongoEntity extends DataStoreEntity {
	constructor( entity, dataSource ) {
		super( entity, dataSource );
	}
}

module.exports = MongoEntity;
