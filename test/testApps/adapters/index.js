'use strict';

/* globals describe: false, require: false, chalk: false */

const describeApp = ( level, name, slug, adapter ) => {
	describe( `Level ${ level }: ${ name }`, () => {
		let data;
		try {
			data = require( `./${ slug }.json` );
		} catch ( err ) {
			console.error( err );
		}
		try {
			require( `./${ slug }` )( adapter, data, slug );
		} catch ( err ) {
			console.log( 'Could not prepare app:', err );
		}
	});
};

module.exports = adapter => {
	describe( chalk.underline.white( 'Testing adapter with apps' ), () => {
		describeApp( 1, 'MatchMail Simple', 'app1-matchmail-simple', adapter );
	});
};

// Symbols: ✨ 🔎 🔃 ❌
