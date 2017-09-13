'use strict';

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