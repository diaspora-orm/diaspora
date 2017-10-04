'use strict';

/* globals l: false, c: false, it: false, describe: false, require: false, expect: false, Diaspora: false, chalk: false */

const styleFunction = 'undefined' === typeof window ? chalk.bold.red : l.identity;

importTest( styleFunction( 'In Memory' ), './inMemory.js' );
importTest( styleFunction( 'Local Storage' ), './localStorage.js' );
