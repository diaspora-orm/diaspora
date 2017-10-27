'use strict';

/* globals importTest: false, getStyle: false */

importTest( getStyle( 'adapter', 'In Memory' ), `${ __dirname  }/inMemory.js` );
if ( 'undefined' !== typeof window ) {
	importTest( getStyle( 'adapter', 'Browser Storage' ), `${ __dirname  }/webStorage.js` );
}
