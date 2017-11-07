'use strict';

/* globals it: false, describe: false, require: false, expect: false, Diaspora: false, dataSources: false, define: false, getStyle: false */

const Promise = require( 'bluebird' );
const l = require( 'lodash' );

const getDataSourceLabel = ( name, addName = '' ) => {
	return `${ name }Adapter${ addName ? `.${ addName }` : '' }`;
};

const TABLE = 'test';

var AdapterTestUtils = {
	createDataSource: ( adapterLabel, config, addName = '' ) => {
		const dataSourceLabel = getDataSourceLabel( adapterLabel, addName );
		const dataSource = Diaspora.createDataSource( adapterLabel, config );
		dataSources[dataSourceLabel] = dataSource;
		return dataSource;
	},
	checkSpawnedAdapter: ( adapterLabel, baseName, addName = '' ) => {
		it( getStyle( 'taskCategory', `Create ${ adapterLabel } adapter` ), done => {
			const dataSourceLabel = getDataSourceLabel( adapterLabel, addName );
			dataSources[dataSourceLabel].waitReady().then( adapter => {
				adapter.baseName = baseName;
				expect( adapter ).to.be.an( 'object' );
				if ( 'undefined' === typeof window ) {
					expect( adapter.constructor.name, 'Adapter name does not comply to naming convention' ).to.equal( `${ baseName }DiasporaAdapter` );
					expect( adapter.classEntity.name, 'Class entity name does not comply to naming convention' ).to.equal( `${ baseName }Entity` );
				}
				l.forEach([ 'insert', 'find', 'update', 'delete' ], word => {
					expect( adapter ).to.satisfy( o => ( o.__proto__.hasOwnProperty( `${ word }One` ) || o.__proto__.hasOwnProperty( `${ word }Many` )), `should have at least one "${ word }" method` );
				});
				return done();
			}).catch( done );
		});
	},
	checkInputFiltering(adapter){
		describe( `${ getStyle( 'taskCategory', 'Check query inputs filtering' )  } with ${  adapter.name }`, () => {
			describe('Check options normalization', () => {
				const no = adapter.normalizeOptions;
				it('Default options', () => {
					expect(no({})).to.eql({skip: 0, remapInput: true, remapOutput: true});
				});
				it('"limit" option', () => {
					expect(no({limit:10})).to.eql({limit: 10, skip: 0, remapInput: true, remapOutput: true});
					expect(no({limit:"10"})).to.eql({limit: 10, skip: 0, remapInput: true, remapOutput: true});
					expect(no({limit:Infinity})).to.eql({limit: Infinity, skip: 0, remapInput: true, remapOutput: true});
					expect(() => no({limit:0.5})).to.throw(TypeError);
					expect(() => no({limit:-1})).to.throw(RangeError);
					expect(() => no({limit:-Infinity})).to.throw(RangeError);
				});
				it('"skip" option', () => {
					expect(no({skip:10})).to.eql({skip: 10, remapInput: true, remapOutput: true});
					expect(no({skip:"10"})).to.eql({skip: 10, remapInput: true, remapOutput: true});
					expect(() => no({skip:0.5})).to.throw(TypeError);
					expect(() => no({skip:-1})).to.throw(RangeError);
					expect(() => no({skip:Infinity})).to.throw(RangeError);
				});
				it('"page" option', () => {
					expect(no({page:5, limit: 10})).to.eql({skip: 50, limit: 10, remapInput: true, remapOutput: true});
					expect(no({page:"5", limit: "10"})).to.eql({skip: 50, limit: 10, remapInput: true, remapOutput: true});
					expect(() => no({page:1})).to.throw(ReferenceError);
					expect(() => no({page:1, skip: 1, limit: 5})).to.throw(ReferenceError);
					expect(() => no({page:0.5, limit: 5})).to.throw(TypeError);
					expect(() => no({page:1, limit: Infinity})).to.throw(RangeError);
					expect(() => no({page:Infinity, limit: 5})).to.throw(RangeError);
					expect(() => no({page:-1, limit: 5})).to.throw(RangeError);
				});
			});
			describe( 'Check "normalizeQuery"', () => {
				const nq = l.partialRight( adapter.normalizeQuery, {
					remapInput: true,
				});
				it( 'Empty query', () => {
					expect( nq({})).to.deep.eql({});
				});
				it( `${ getStyle( 'bold',  '~' ) } ($exists)`, () => {
					expect( nq({
						foo: undefined,
					})).to.deep.eql({
						foo: {
							$exists: false,
						},
					});
					expect( nq({
						foo: {
							'~': true,
						},
					})).to.deep.eql({
						foo: {
							$exists: true,
						},
					});
					expect( nq({
						foo: {
							$exists: true,
						},
					})).to.deep.eql({
						foo: {
							$exists: true,
						},
					});
					expect( nq({
						foo: {
							'~': false,
						},
					})).to.deep.eql({
						foo: {
							$exists: false,
						},
					});
					expect( nq({
						foo: {
							$exists: false,
						},
					})).to.deep.eql({
						foo: {
							$exists: false,
						},
					});
					expect( nq.bind( adapter, {
						foo: {
							'~':     'bar',
							$exists: 'bar',
						},
					})).to.throw();
				});
				it( `${ getStyle( 'bold',  '==' ) } ($equal)`, () => {
					expect( nq({
						foo: 'bar',
					})).to.deep.eql({
						foo: {
							$equal: 'bar',
						},
					});
					expect( nq({
						foo: {
							$equal: 'bar',
						},
					})).to.deep.eql({
						foo: {
							$equal: 'bar',
						},
					});
					expect( nq({
						foo: {
							'==': 'bar',
						},
					})).to.deep.eql({
						foo: {
							$equal: 'bar',
						},
					});
					expect( nq.bind( adapter, {
						foo: {
							'==':   'bar',
							$equal: 'bar',
						},
					})).to.throw();
				});
				it( `${ getStyle( 'bold',  '!=' ) } ($diff)`, () => {
					expect( nq({
						foo: {
							$diff: 'bar',
						},
					})).to.deep.eql({
						foo: {
							$diff: 'bar',
						},
					});
					expect( nq({
						foo: {
							'!=': 'bar',
						},
					})).to.deep.eql({
						foo: {
							$diff: 'bar',
						},
					});
					expect( nq.bind( adapter, {
						foo: {
							'!=':  'bar',
							$diff: 'bar',
						},
					})).to.throw();
				});
				it( `${ getStyle( 'bold',  '<' ) } ($less)`, () => {
					expect( nq({
						foo: {
							$less: 1,
						},
					})).to.deep.eql({
						foo: {
							$less: 1,
						},
					});
					expect( nq({
						foo: {
							'<': 1,
						},
					})).to.deep.eql({
						foo: {
							$less: 1,
						},
					});
					expect( nq.bind( adapter, {
						foo: {
							'<':   1,
							$less: 1,
						},
					})).to.throw();
					expect( nq.bind( adapter, {
						foo: {
							'<': 'aze',
						},
					})).to.throw();
					expect( nq.bind( adapter, {
						foo: {
							$less: 'aze',
						},
					})).to.throw();
				});
				it( `${ getStyle( 'bold',  '<=' ) } ($lessEqual)`, () => {
					expect( nq({
						foo: {
							$lessEqual: 1,
						},
					})).to.deep.eql({
						foo: {
							$lessEqual: 1,
						},
					});
					expect( nq({
						foo: {
							'<=': 1,
						},
					})).to.deep.eql({
						foo: {
							$lessEqual: 1,
						},
					});
					expect( nq.bind( adapter, {
						foo: {
							'<=':       1,
							$lessEqual: 1,
						},
					})).to.throw();
					expect( nq.bind( adapter, {
						foo: {
							'<=': 'aze',
						},
					})).to.throw();
					expect( nq.bind( adapter, {
						foo: {
							$lessEqual: 'aze',
						},
					})).to.throw();
				});
				it( `${ getStyle( 'bold',  '>' ) } ($greater)`, () => {
					expect( nq({
						foo: {
							$greater: 1,
						},
					})).to.deep.eql({
						foo: {
							$greater: 1,
						},
					});
					expect( nq({
						foo: {
							'>': 1,
						},
					})).to.deep.eql({
						foo: {
							$greater: 1,
						},
					});
					expect( nq.bind( adapter, {
						foo: {
							'>':      1,
							$greater: 1,
						},
					})).to.throw();
					expect( nq.bind( adapter, {
						foo: {
							'>': 'aze',
						},
					})).to.throw();
					expect( nq.bind( adapter, {
						foo: {
							$greater: 'aze',
						},
					})).to.throw();
				});
				it( `${ getStyle( 'bold',  '>=' ) } ($greaterEqual)`, () => {
					expect( nq({
						foo: {
							$greaterEqual: 1,
						},
					})).to.deep.eql({
						foo: {
							$greaterEqual: 1,
						},
					});
					expect( nq({
						foo: {
							'>=': 1,
						},
					})).to.deep.eql({
						foo: {
							$greaterEqual: 1,
						},
					});
					expect( nq.bind( adapter, {
						foo: {
							'>=':          1,
							$greaterEqual: 1,
						},
					})).to.throw();
					expect( nq.bind( adapter, {
						foo: {
							'>=': 'aze',
						},
					})).to.throw();
					expect( nq.bind( adapter, {
						foo: {
							$greaterEqual: 'aze',
						},
					})).to.throw();
				});
			});
			describe( 'Check "matchEntity"', () => {
				const me = adapter.matchEntity;
				it( 'Empty query', () => {
					expect( me({}, {
						foo: 'bar',
					})).to.be.true;
				});
				it( `${ getStyle( 'bold',  '~' ) } ($exists)`, () => {
					expect( me({
						foo: {
							$exists: true,
						},
					}, {
						foo: 'bar',
					})).to.be.true;
					expect( me({
						foo: {
							$exists: true,
						},
					}, {
						foo: undefined,
					})).to.be.false;
					expect( me({
						foo: {
							$exists: false,
						},
					}, {
						foo: 'bar',
					})).to.be.false;
					expect( me({
						foo: {
							$exists: false,
						},
					}, {
						foo: undefined,
					})).to.be.true;
				});
				it( `${ getStyle( 'bold',  '==' ) } ($equal)`, () => {
					expect( me({
						foo: {
							$equal: 'bar',
						},
					}, {
						foo: 'bar',
					})).to.be.true;
					expect( me({
						foo: {
							$equal: 'bar',
						},
					}, {
						foo: undefined,
					})).to.be.false;
					expect( me({
						foo: {
							$equal: 'bar',
						},
					}, {
						foo: 'baz',
					})).to.be.false;
				});
				it( `${ getStyle( 'bold',  '!=' ) } ($diff)`, () => {
					expect( me({
						foo: {
							$diff: 'bar',
						},
					}, {
						foo: 'bar',
					})).to.be.false;
					expect( me({
						foo: {
							$diff: 'bar',
						},
					}, {
						foo: 'baz',
					})).to.be.true;
					expect( me({
						foo: {
							$diff: 'bar',
						},
					}, {
						foo: undefined,
					})).to.be.false;
					expect( me({
						foo: {
							$diff: 'bar',
						},
					}, {
						bar: 'qux',
					})).to.be.false;
				});
				it( `${ getStyle( 'bold',  '<' ) } ($less)`, () => {
					expect( me({
						foo: {
							$less: 2,
						},
					}, {
						foo: undefined,
					})).to.be.false;
					expect( me({
						foo: {
							$less: 2,
						},
					}, {
						foo: 1,
					})).to.be.true;
					expect( me({
						foo: {
							$less: 2,
						},
					}, {
						foo: 2,
					})).to.be.false;
					expect( me({
						foo: {
							$less: 2,
						},
					}, {
						foo: 3,
					})).to.be.false;
				});
				it( `${ getStyle( 'bold',  '<=' ) } ($lessEqual)`, () => {
					expect( me({
						foo: {
							$lessEqual: 2,
						},
					}, {
						foo: undefined,
					})).to.be.false;
					expect( me({
						foo: {
							$lessEqual: 2,
						},
					}, {
						foo: 1,
					})).to.be.true;
					expect( me({
						foo: {
							$lessEqual: 2,
						},
					}, {
						foo: 2,
					})).to.be.true;
					expect( me({
						foo: {
							$lessEqual: 2,
						},
					}, {
						foo: 3,
					})).to.be.false;
				});
				it( `${ getStyle( 'bold',  '>' ) } ($greater)`, () => {
					expect( me({
						foo: {
							$greater: 2,
						},
					}, {
						foo: undefined,
					})).to.be.false;
					expect( me({
						foo: {
							$greater: 2,
						},
					}, {
						foo: 1,
					})).to.be.false;
					expect( me({
						foo: {
							$greater: 2,
						},
					}, {
						foo: 2,
					})).to.be.false;
					expect( me({
						foo: {
							$greater: 2,
						},
					}, {
						foo: 3,
					})).to.be.true;
				});
				it( `${ getStyle( 'bold',  '>=' ) } ($greaterEqual)`, () => {
					expect( me({
						foo: {
							$greaterEqual: 2,
						},
					}, {
						foo: undefined,
					})).to.be.false;
					expect( me({
						foo: {
							$greaterEqual: 2,
						},
					}, {
						foo: 1,
					})).to.be.false;
					expect( me({
						foo: {
							$greaterEqual: 2,
						},
					}, {
						foo: 2,
					})).to.be.true;
					expect( me({
						foo: {
							$greaterEqual: 2,
						},
					}, {
						foo: 3,
					})).to.be.true;
				});
			});
		});
	},
	checkEachStandardMethods: ( adapterLabel, addName = '' ) => {
		const adapter = dataSources[getDataSourceLabel( adapterLabel, addName )];
		const getTestLabel = fctName => {
			if ( adapter.__proto__.hasOwnProperty( fctName )) {
				return fctName;
			} else {
				return `${ fctName } (from BaseAdapter)`;
			}
		};

		AdapterTestUtils.checkInputFiltering(adapter);
		describe( getStyle( 'taskCategory', 'Test adapter methods' ), () => {
			let findManyOk = false;
			let findAllOk = false;
			describe( '✨ Insert methods', () => {
				it( getTestLabel( 'insertOne' ), () => {
					expect( adapter ).to.respondTo( 'insertOne' );
					const object = {
						foo: 'bar',
					};
					return adapter.insertOne( TABLE, object ).then( entity => {
						expect( entity ).to.be.a.dataStoreEntity( adapter, object );
					});
				});
				it( getTestLabel( 'insertMany' ), () => {
					expect( adapter ).to.respondTo( 'insertMany' );
					const objects = [{
						baz: 'qux',
					}, {
						qux: 'foo',
					}, {
						foo: 'bar',
					}];
					return adapter.insertMany( TABLE, objects ).then( entities => {
						expect( entities ).to.be.a.set.of.dataStoreEntity( adapter, objects ).that.have.lengthOf( objects.length );
					});
				});
			});
			describe( 'Specification level 1', () => {
				describe( '🔎 Find methods', () => {
					it( getTestLabel( 'findOne' ), () => {
						expect( adapter ).to.respondTo( 'findOne' );
						const object = {
							baz: 'qux',
						};
						return adapter.findOne( TABLE, object ).then( entity => {
							return Promise.try(() => {
								expect( entity ).to.be.a.dataStoreEntity( adapter, object );
								return Promise.resolve();
							});
						});
					});
					it( getTestLabel( 'findMany' ), () => {
						expect( adapter ).to.respondTo( 'findMany' );
						const objects = {
							foo: 'bar',
						};
						return adapter.findMany( TABLE, objects ).then( entities => {
							return Promise.try(() => {
								expect( entities ).to.be.a.set.of.dataStoreEntity( adapter, objects ).that.have.lengthOf( 2 );
								findManyOk = true;
								return Promise.resolve();
							});
						});
					});
					it( 'Find all', function skippable() {
						if ( findManyOk !== true ) {
							this.skip();
							return;
						}
						expect( adapter ).to.respondTo( 'findMany' );
						return adapter.findMany( TABLE, {}).then( entities => {
							return Promise.try(() => {
								expect( entities ).to.be.a.set.of.dataStoreEntity( adapter ).that.have.lengthOf( 4 );
								findAllOk = true;
								return Promise.resolve();
							});
						});
					});
				});
				describe( '🔃 Update methods', () => {
					it( getTestLabel( 'updateOne' ), () => {
						expect( adapter ).to.respondTo( 'updateOne' );
						const fromObj = {
							baz: 'qux',
						};
						const targetObj = {
							foo: 'bar',
						};
						return adapter.updateOne( TABLE, fromObj, targetObj ).then( entity => {
							expect( entity ).to.be.a.dataStoreEntity( adapter, l.assign({}, fromObj, targetObj ));
						});
					});
					it( getTestLabel( 'updateMany' ), () => {
						expect( adapter ).to.respondTo( 'updateMany' );
						const fromObj = {
							foo: 'bar',
						};
						const targetObj = {
							baz: 'qux',
						};
						return adapter.updateMany( TABLE, fromObj, targetObj ).then( entities => {
							expect( entities ).to.be.a.set.of.dataStoreEntity( adapter, l.assign({}, fromObj, targetObj )).that.have.lengthOf( 3 );
						});
					});
					it( getTestLabel( 'updateOne not found' ), () => {
						expect( adapter ).to.respondTo( 'updateOne' );
						const fromObj = {
							qwe: 'rty',
						};
						const targetObj = {
							foo: 'bar',
						};
						return adapter.updateOne( TABLE, fromObj, targetObj ).then( entity => {
							expect( entity ).to.be.undefined;
						});
					});
					it( getTestLabel( 'updateMany not found' ), () => {
						expect( adapter ).to.respondTo( 'updateMany' );
						const fromObj = {
							qwe: 'rty',
						};
						const targetObj = {
							baz: 'qux',
						};
						return adapter.updateMany( TABLE, fromObj, targetObj ).then( entities => {
							expect( entities ).to.have.lengthOf( 0 );
						});
					});
				});
				describe( '❌ Delete methods', () => {
					it( getTestLabel( 'deleteOne' ), () => {
						expect( adapter ).to.respondTo( 'deleteOne' );
						const obj = {
							qux: 'foo',
						};
						return adapter.deleteOne( TABLE, obj ).then(( ...args ) => {
							expect( args ).to.be.an( 'array' ).that.eql([ undefined ]);
							return Promise.resolve();
						});
					});
					it( getTestLabel( 'deleteMany' ), () => {
						expect( adapter ).to.respondTo( 'deleteMany' );
						const obj = {
							foo: 'bar',
						};
						return adapter.deleteMany( TABLE, obj ).then(( ...args ) => {
							expect( args ).to.be.an( 'array' ).that.eql([ undefined ]);
							return Promise.resolve();
						});
					});
					it( 'Check deletion: find all again', function skippable() {
						if ( findAllOk !== true ) {
							this.skip();
							return;
						}
						return adapter.findMany( TABLE, {}).then( entities => {
							return Promise.try(() => {
								expect( entities ).to.be.an( 'array' ).that.have.lengthOf( 0 );
								return Promise.resolve();
							});
						});
					});
				});
			});
			describe( 'Specification level 2', () => {
				it( 'Initialize test data', () => {
					const objects = [
						// Tests for $exists
						{
							foo: 1,
						},
						{
							foo: undefined,
						},
						// Tests for comparison operators
						{
							bar: 1,
						},
						{
							bar: 2,
						},
						{
							bar: 3,
						},
					];
					return adapter.insertMany( TABLE, objects ).then( entities => {
						expect( entities ).to.be.a.set.of.dataStoreEntity( adapter, objects ).that.have.lengthOf( objects.length );
					});
				});
				it( `${ getStyle( 'bold',  '~' ) } ($exists) operator`, () => {
					return Promise.all([
						adapter.findOne( TABLE, {
							foo: {
								'~': true,
							},
						}).then( output => {
							expect( output ).to.be.a.dataStoreEntity( adapter, {
								foo: 1,
							});
						}),
						adapter.findOne( TABLE, {
							foo: {
								'~': false,
							},
						}).then( output => {
							expect( output ).to.be.a.dataStoreEntity( adapter, {
								foo: undefined,
							});
						}),
					]);
				});
				it( `${ getStyle( 'bold',  '==' ) } ($equal) operator`, () => {
					return adapter.findOne( TABLE, {
						foo: {
							'==': 1,
						},
					}).then( output => {
						expect( output ).to.be.a.dataStoreEntity( adapter, {
							foo: 1,
						});
					});
				});
				it( `${ getStyle( 'bold',  '!=' ) } ($diff) operator`, () => {
					return Promise.all([
						adapter.findOne( TABLE, {
							bar: {
								'!=': 1,
							},
						}).then( output => {
							expect( output ).to.be.a.dataStoreEntity( adapter, {
								bar: 2,
							});
						}),
						adapter.findOne( TABLE, {
							foo: {
								'!=': 1,
							},
						}).then( output => {
							expect( output ).to.be.undefined;
						}),
						adapter.findOne( TABLE, {
							foo: {
								'!=': 2,
							},
						}).then( output => {
							expect( output ).to.be.a.dataStoreEntity( adapter, {
								foo: 1,
							});
						}),
					]);
				});
				it( `${ getStyle( 'bold',  '<' ) } ($less) operator`, () => {
					return adapter.findMany( TABLE, {
						bar: {
							'<': 2,
						},
					}).then( outputs => {
						expect( outputs ).to.be.a.set.of.dataStoreEntity( adapter, [{
							bar: 1,
						}]).that.have.lengthOf( 1 );
					});
				});
				it( `${ getStyle( 'bold',  '<=' ) } ($lessEqual) operator`, () => {
					return adapter.findMany( TABLE, {
						bar: {
							'<=': 2,
						},
					}).then( outputs => {
						expect( outputs ).to.be.a.set.of.dataStoreEntity( adapter, [{
							bar: 1,
						}, {
							bar: 2,
						}]).that.have.lengthOf( 2 );
					});
				});
				it( `${ getStyle( 'bold',  '>' ) } ($greater) operator`, () => {
					return adapter.findMany( TABLE, {
						bar: {
							'>': 2,
						},
					}).then( outputs => {
						expect( outputs ).to.be.a.set.of.dataStoreEntity( adapter, [{
							bar: 3,
						}]).that.have.lengthOf( 1 );
					});
				});
				it( `${ getStyle( 'bold',  '>=' ) } ($greaterEqual) operator`, () => {
					return adapter.findMany( TABLE, {
						bar: {
							'>=': 2,
						},
					}).then( outputs => {
						expect( outputs ).to.be.a.set.of.dataStoreEntity( adapter, [{
							bar: 2,
						}, {
							bar: 3,
						}]).that.have.lengthOf( 2 );
					});
				});
			});
		});
	},
	checkApplications: ( adapterLabel, addName = '' ) => {
		if ( 'undefined' !== typeof window ) {
			return;
		}
		const adapter = dataSources[getDataSourceLabel( adapterLabel, addName )];
		require( '../testApps/adapters/index' )( adapter );
	},
	checkRegisterAdapter: ( adapterLabel, dataSourceName, addName = '' ) => {
		it( getStyle( 'taskCategory', `Register named ${ adapterLabel } dataSource` ), () => {
			Diaspora.registerDataSource( dataSourceName, dataSources[getDataSourceLabel( adapterLabel, addName )]);
			//console.log(Diaspora.dataSources);
			expect( Diaspora.dataSources[dataSourceName]).to.eql( dataSources[getDataSourceLabel( adapterLabel, addName )]);
		});
	},
};

if ( 'undefined' !== typeof define ) {
	define( AdapterTestUtils );
} else {
	module.exports = AdapterTestUtils;
}
