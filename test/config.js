path = require( 'path' );
l = require( 'lodash' );
c = require( 'check-types' );
CheckTypes = c;
projectPath = path.resolve( '../' );
chalk = require( 'chalk' );
assert = require( 'chai' ).assert;
expect = require( 'chai' ).expect;
util = require( 'util' );
SequentialEvent = require( 'sequential-event' );
Promise = require( 'bluebird' );
const stackTrace = require( 'stack-trace' );

importTest = function( name, modulePath ) {
	const stackItem = stackTrace.get()[1];
	const fullPath = `${ path.dirname( stackItem.getFileName()) }/${ modulePath }`;
	describe( name, () => {
		require( fullPath );
	});
};