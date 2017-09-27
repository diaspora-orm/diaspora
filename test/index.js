'use strict';

/* globals l: false, c: false */

require('./defineGlobals');

if(process.env.SAUCE_ONLY !== 'true'){
	global.Diaspora = require('../diaspora');
	global.dataSources = {};
	describe( '"check" feature', () => {
		it( 'Basic tests with types', () => {
			expect( Diaspora.check({
				test: 'string',
			}, {
				test: {
					type: 'any',
				},
			})).to.be.empty;
			expect( Diaspora.check({
				test: 1,
			}, {
				test: {
					type: 'any',
				},
			})).to.be.empty;
			expect( Diaspora.check({
				string: 'string',
				number: 1,
				float:  1.5,
			}, {
				string: {
					type: 'string',
				},
				number: {
					type: 'integer',
				},
				float: {
					type: 'float',
				},
			})).to.be.empty;
			expect( Diaspora.check({
				object: {
					string: 'string',
				},
				objectUndef: {
					aze: 'hello',
				},
				array: [
					1, 2, 3,
				],
				arrayUndef: [
					1, 'aze', false, {},
				],
				arrayMultiDef: [
					1, 'aze', 1.5,
				],
			}, {
				object: {
					type:       'object',
					attributes: {
						string: {
							type: 'string',
						},
					},
				},
				objectUndef: {
					type: 'object',
				},
				array: {
					type: 'array',
					of:   {
						type: 'integer',
					},
				},
				arrayUndef: {
					type: 'array',
				},
				arrayMultiDef: {
					type: 'array',
					of:   [
						{
							type: 'float',
						},
						{
							type: 'string',
						},
					],
				},
			})).to.be.empty;
			expect( Diaspora.check({
				object: {
					string: null,
				},
				objectUndef: {
					aze: null,
				},
				array: [
					null,
				],
				arrayUndef: [
					1, 'aze', false, null,
				],
				arrayMultiDef: [
					1, 'aze', 1.5, null,
				],
			}, {
				object: {
					type:       'object',
					attributes: {
						string: {
							type: 'string',
						},
					},
				},
				objectUndef: {
					type: 'object',
				},
				array: {
					type: 'array',
					of:   {
						type: 'integer',
					},
				},
				arrayUndef: {
					type: 'array',
				},
				arrayMultiDef: {
					type: 'array',
					of:   [
						{
							type: 'float',
						},
						{
							type: 'string',
						},
					],
				},
			})).to.be.empty;
		});
		it( '"required" property', () => {
			expect( Diaspora.check({
				test: 1,
			}, {
				test: {
					type:     'any',
					required: true,
				},
			})).to.be.empty;
			expect( Diaspora.check({
				test: 'string',
			}, {
				test: {
					type:     'any',
					required: true,
				},
			})).to.be.empty;
			expect( Diaspora.check({
				test: null,
			}, {
				test: {
					type:     'any',
					required: true,
				},
			})).to.be.not.empty;
			expect( Diaspora.check({
				test: 'a',
			}, {
				test: {
					type:     'any',
					required: true,
				},
			})).to.be.empty;
			expect( Diaspora.check({
				object: {
					string: null,
				},
			}, {
				object: {
					type:       'object',
					attributes: {
						string: {
							type:     'string',
							required: true,
						},
					},
				},
			})).to.be.not.empty;
			expect( Diaspora.check({
				object: null,
			}, {
				object: {
					type:       'object',
					required:   true,
					attributes: {
						string: {
							type: 'string',
						},
					},
				},
			})).to.be.not.empty;
			expect( Diaspora.check({
				object: null,
			}, {
				object: {
					type:       'object',
					attributes: {
						string: {
							type:     'string',
							required: true,
						},
					},
				},
			})).to.be.empty;
			expect( Diaspora.check({}, {
				rand: {
					type:     'number',
					required: true,
				},
			})).to.be.not.empty;
			expect( Diaspora.check({
				rand: null,
			}, {
				rand: {
					type:     'integer',
					required: true,
				},
			})).to.be.not.empty;
			expect( Diaspora.check({
				rand: l.random( 0, 100 ),
			}, {
				rand: {
					type:     'integer',
					required: true,
				},
			})).to.be.empty;
		});
		it( '"enum" property', () => {
			expect( Diaspora.check({
				test: 1,
			}, {
				test: {
					type: 'any',
					enum: [ 1, 2, 'aze' ],
				},
			})).to.be.empty;
			expect( Diaspora.check({
				test: 'string',
			}, {
				test: {
					type: 'string',
					enum: [ 'string', 'hello' ],
				},
			})).to.be.empty;
			expect( Diaspora.check({
				test: 'string',
			}, {
				test: {
					type: 'string',
					enum: [ 'hello', 'world' ],
				},
			})).to.be.not.empty;
			expect( Diaspora.check({
				test: 'string',
			}, {
				test: {
					type: 'string',
					enum: [ 'hello', /^str/ ],
				},
			})).to.be.empty;
			expect( Diaspora.check({
				test: 'string',
			}, {
				test: {
					type: 'string',
					enum: [ 'hello', /^wo/ ],
				},
			})).to.be.not.empty;
		});
	});
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

	importTest(chalk.bold.underline.blue('Adapters'), './adapters/index.js');
	//importTest(chalk.bold.underline.blue('Models'), './models/index.js');
}

if(process.env.NO_SAUCE !== 'true'){
	require('./browserTests/seleniumTest.js');
}