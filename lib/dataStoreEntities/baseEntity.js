'use strict';

const _ = require( 'lodash' );

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
	constructor( entity, dataSource ) {
		if ( !!_.isNil(entity)) {
			return undefined;
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
		return _.omit( this, 'dataSource' );
	}
}

module.exports = DataStoreEntity;
