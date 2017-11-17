'use strict';

/* globals getStyle: false, importTest: false */

importTest( getStyle( 'model', 'Test entities & sets' ), `${ __dirname  }/components.js` );
importTest( getStyle( 'model', 'Simple model (single source)' ), `${ __dirname  }/simple.js` );
importTest( getStyle( 'model', 'Simple model with remapping (single source)' ), `${ __dirname  }/simple-remapping.js` );
importTest( getStyle( 'model', 'Simple model with validations (single source)' ), `${ __dirname  }/validations.js` );
importTest( getStyle( 'model', 'Relations (single source)' ), `${ __dirname  }/relations.js` );
