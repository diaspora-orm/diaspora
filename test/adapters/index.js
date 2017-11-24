'use strict';

/* globals importTest: false, getStyle: false */

importTest( getStyle( 'adapter', 'Base adapter' ), `${ __dirname  }/baseAdapter.js` );
importTest( getStyle( 'adapter', 'In Memory' ), `${ __dirname  }/inMemory.js` );
importTest( getStyle( 'adapter', 'Web API' ), `${ __dirname  }/webApi.js` );
if ( 'undefined' !== typeof window ) {
	importTest( getStyle( 'adapter', 'Browser Storage' ), `${ __dirname  }/webStorage.js` );
}
