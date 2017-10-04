'use strict';

/* globals l: false, c: false, it: false, describe: false, require: false, expect: false, Diaspora: false, chalk: false */

const describeApp = ( level, name, slug, adapter ) => {
	describe( `Level ${ level }: ${ name }`, () => {
		let data;
		try {
			data = require( `./${ slug }.json` );
		} catch ( err ) {
		}
		try {
			require( `./${ slug }` )( adapter, data, 'app1-matchmail' );
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
