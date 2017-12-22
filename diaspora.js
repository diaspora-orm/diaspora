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
		return module.exports = cachedDiaspora.exports;
	}
}

const Diaspora = require( './lib/diaspora' );

module.exports = Diaspora;
