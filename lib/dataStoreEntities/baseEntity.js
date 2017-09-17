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
	constructor( source ) {
		if ( !c.assigned( source )) {
			return undefined;
		}
		_.assign( this, source );
	}
	toObject() {
		return _.cloneDeep( this );
	}
}

module.exports = DataStoreEntity;
