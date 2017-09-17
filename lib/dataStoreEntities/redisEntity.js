'use strict';

const DataStoreEntity = require( './baseEntity.js' );

/**
 * @class RedisEntity
 * @classdesc Entity representing data from {@link RedisDiasporaAdapter the redis adapter}.
 * @extends DataStoreEntity
 * @public
 * @author gerkin
 * @param {Object} source Hash containing properties to copy in this entity
 */
class RedisEntity extends DataStoreEntity {
	constructor( source ) {
		super( source );
	}
}

module.exports = RedisEntity;
