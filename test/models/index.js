'use strict';

const styleFunction = 'undefined' === typeof window ? chalk.bold.red : l.identity;

importTest( styleFunction( 'Simple model (single source)' ), './simple.js' );
importTest( styleFunction( 'Simple model with remapping (single source)' ), './simple-remapping.js' );
importTest( styleFunction( 'Simple model with validations (single source)' ), './validations.js' );
