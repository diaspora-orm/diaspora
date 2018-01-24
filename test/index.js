'use strict';

/* globals l: false, it: false, require: false, expect: false, Diaspora: false, getStyle: false, importTest: false */

require( './defineGlobals' );

if ( 'no' === process.env.SAUCE || 'undefined' === typeof process.env.SAUCE ) {
	if ( 'undefined' === typeof window && 'object' === typeof exports && typeof exports.nodeName !== 'string' ) {
		const {Diaspora} = require( '../diaspora' );
		global.Diaspora = Diaspora;
	}
	global.dataSources = {};
	
	importTest( getStyle( 'category', 'Validation' ), `${ __dirname  }/validation.js` );
	it( '"default" feature', () => {
		expect( Diaspora.default({
			aze: 123,
		}, {
			foo: {
				type:    'text',
				default: 'bar',
			},
		})).to.deep.equal({
			aze: 123,
			foo: 'bar',
		});
		const now = l.now();
		expect( Diaspora.default({
			aze: 123,
		}, {
			foo: {
				type:    'datetime',
				default: () => now,
			},
		})).to.deep.equal({
			aze: 123,
			foo: now,
		});
		expect( Diaspora.default({
			aze: 'baz',
		}, {
			aze: {
				type:    'text',
				default: 'bar',
			},
		})).to.deep.equal({
			aze: 'baz',
		});
		expect( Diaspora.default({
			aze: 'baz',
		}, {
			aze: {
				type:    'datetime',
				default: () => 'bar',
			},
		})).to.deep.equal({
			aze: 'baz',
		});
	});

	importTest( getStyle( 'category', 'Adapters' ), `${ __dirname  }/adapters/index.js` );
	importTest( getStyle( 'category', 'Models' ), `${ __dirname  }/models/index.js` );
}

if ( 'yes' === process.env.SAUCE ) {
	importTest( getStyle( 'category', 'Browser tests' ), `${ __dirname  }/browser/selenium.js` );
}
