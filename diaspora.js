'use strict';

if ( process.browser ) {
	require( 'regenerator-runtime/runtime' );
} else {
	const _ = require( 'lodash' );
	const cachedDiaspora = _.find( require.cache, ( module, path ) => {
		return path.endsWith( `${ require( 'path' ).sep }diaspora.js` );
	});
	if ( !_.isEmpty( _.get( cachedDiaspora, 'exports' ))) {
		console.log( 'Retrieving loaded diaspora' );
		module.exports = cachedDiaspora.exports;
	}
}
if(Object.keys(module.exports).length === 0){
	module.exports = require( './src/diaspora' );
}
