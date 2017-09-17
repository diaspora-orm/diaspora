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
let config;
try{
	config = require('./config.js');
} catch(err){
	if('MODULE_NOT_FOUND' === err.code){
		console.error('Missing required file "config.js", please copy "config-sample.js" and edit it.');
	} else {
		console.error(err);
	}
	process.exit();
}

importTest = ( name, modulePath ) => {
	const stackItem = stackTrace.get()[1];
	const fullPath = `${ path.dirname( stackItem.getFileName()) }/${ modulePath }`;
	describe( name, () => {
		require( fullPath );
	});
};
getConfig = adapterName => {
	return config[adapterName] || {};
};