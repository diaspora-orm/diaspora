'use strict';

const _ = require( 'lodash' );
const c = require( 'check-types' );

/**
 * @class DataStoreEntity
 * @classdesc DataStoreEntity is the sub-entity reflecting a single source content. Values may differ from the Entity itself
 * @public
 * @author gerkin
 * @param {Object} source Hash containing properties to copy in this entity
 */
class DataStoreEntity {
	constructor( entity, dataSource ) {
		if ( !c.assigned( entity )) {
			return undefined;
		}
		this.dataSource = dataSource;
		_.assign( this, entity );
	}
	toObject() {
		return _.omit( this, 'dataSource' );
	}
}

module.exports = DataStoreEntity;
