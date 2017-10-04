'use strict';

const styleFunction = 'undefined' === typeof window ? chalk.bold.red : l.identity;

importTest( styleFunction( 'In Memory' ), './inMemory.js' );
importTest( styleFunction('Local Storage'), './localStorage.js');
