'use strict';

/**
 * @class DataStoreEntity
 * @classdesc DataStoreEntity is the sub-entity reflecting a single source content. Values may differ from the Entity itself
 * @memberof module:Diaspora
 */
class DataStoreEntity {
	constructor( source ) {
		if ( !c.assigned( source )) {
			return undefined;
		}
		l.assign( this, source );
	}
	toObject() {
		return l.cloneDeep( this );
	}
}

module.exports = DataStoreEntity;
