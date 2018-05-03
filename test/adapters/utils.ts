import * as _ from 'lodash';

import { Adapter, AdapterEntity } from '../../src/adapters/base';
import Diaspora from '../../src/diaspora';

import { dataSources, getStyle } from '../utils';
import { InMemoryEntity } from '../../src/adapters/inMemory';
import { DataAccessLayer } from '../../src/adapters/dataAccessLayer';

const getDataSourceLabel = name => {
	return `${name}Adapter`;
};

const TABLE = 'test';

export const createDataSource = ( adapterLabel: string, ...config: any[] ) => {
	const dataSourceLabel = getDataSourceLabel( adapterLabel );
	const dataSource = Diaspora.createNamedDataSource(
		dataSourceLabel,
		adapterLabel,
		...config
	);
	dataSources[dataSourceLabel] = dataSource;
	return dataSource;
};
export const checkSpawnedAdapter = ( adapterLabel: string ) => {
	const baseName = adapterLabel[0].toUpperCase() + adapterLabel.substr( 1 );
	const dataSourceLabel = getDataSourceLabel( adapterLabel );
	it( getStyle( 'taskCategory', `Create ${adapterLabel} adapter` ), async () => {
		const dataAccessLayer = dataSources[dataSourceLabel];
		await dataAccessLayer.waitReady();
		expect( dataAccessLayer ).toBeInstanceOf( DataAccessLayer );
		expect( dataAccessLayer.adapter ).toBeInstanceOf( Adapter );
		if ( 'undefined' === typeof window ) {
			expect( dataAccessLayer.adapter.constructor.name ).toEqual( `${baseName}Adapter` );
			expect( dataAccessLayer.classEntity.name ).toEqual( `${baseName}Entity` );
		}
		_.forEach( ['insert', 'find', 'update', 'delete'], word => {
			expect( dataAccessLayer ).toImplementOneOfMethods( [`${word}One`, `${word}Many`] );
		} );
	} );
};
export const checkInputFiltering = ( dataAccessLayer: DataAccessLayer ) => {
	describe( `${getStyle( 'taskCategory', 'Check query inputs filtering' )} with ${
		dataAccessLayer.constructor.name
	}`, () => {
		describe( 'Check options normalization', () => {
			const no = dataAccessLayer.normalizeOptions;
			it( 'Default options', () => {
				expect( no( {} ) ).toEqual( {
					skip: 0,
					remapInput: true,
					remapOutput: true,
				} );
			} );
			it( '"limit" option', () => {
				expect( no( { limit: 10 } ) ).toEqual( {
					limit: 10,
					skip: 0,
					remapInput: true,
					remapOutput: true,
				} );
				expect( no( { limit: '10' } as any ) ).toEqual( {
					limit: 10,
					skip: 0,
					remapInput: true,
					remapOutput: true,
				} );
				expect( no( { limit: Infinity } ) ).toEqual( {
					limit: Infinity,
					skip: 0,
					remapInput: true,
					remapOutput: true,
				} );
				expect( () => no( { limit: 0.5 } ) ).toThrowError( TypeError );
				expect( () => no( { limit: -1 } ) ).toThrowError( RangeError );
				expect( () => no( { limit: -Infinity } ) ).toThrowError( RangeError );
			} );
			it( '"skip" option', () => {
				expect( no( { skip: 10 } ) ).toEqual( {
					skip: 10,
					remapInput: true,
					remapOutput: true,
				} );
				expect( no( { skip: '10' } as any ) ).toEqual( {
					skip: 10,
					remapInput: true,
					remapOutput: true,
				} );
				expect( () => no( { skip: 0.5 } ) ).toThrowError( TypeError );
				expect( () => no( { skip: -1 } ) ).toThrowError( RangeError );
				expect( () => no( { skip: Infinity } ) ).toThrowError( RangeError );
			} );
			it( '"page" option', () => {
				expect(
					no( {
						page: 5,
						limit: 10,
					} )
				).toEqual( {
					skip: 50,
					limit: 10,
					remapInput: true,
					remapOutput: true,
				} );
				expect(
					no( {
						page: '5',
						limit: '10',
					} as any )
				).toEqual( {
					skip: 50,
					limit: 10,
					remapInput: true,
					remapOutput: true,
				} );
				expect( () => no( { page: 1 } ) ).toThrowError( ReferenceError );
				expect( () =>
				no( {
					page: 1,
					skip: 1,
					limit: 5,
				} )
			).toThrowError( ReferenceError );
	   expect( () =>
			no( {
				page: 0.5,
				limit: 5,
			} )
		).toThrowError( TypeError );
	   expect( () =>
		no( {
			page: 1,
			limit: Infinity,
		} )
	).toThrowError( RangeError );
	   expect( () =>
	no( {
		page: Infinity,
		limit: 5,
	} )
).toThrowError( RangeError );
	   expect( () =>
no( {
	page: -1,
	limit: 5,
} )
).toThrowError( RangeError );
} );
} );
  describe( 'Check "normalizeQuery"', () => {
	const nq = ( query: any ) =>
	dataAccessLayer.normalizeQuery(
		{ foo: query },
		{ remapInput: true, remapOutput: false, skip: 0, limit: 0, page: 0 }
	);
	it( 'Empty query', () => {
		expect(
			dataAccessLayer.normalizeQuery(
				{},
				{ remapInput: true, remapOutput: false, skip: 0, limit: 0, page: 0 }
			)
		).toEqual( {} );
	} );
	it( `${getStyle( 'bold', '~' )} ($exists)`, () => {
		expect( nq( undefined ) ).toEqual( { foo: { $exists: false } } );
		expect( nq( { '~': true } ) ).toEqual( { foo: { $exists: true } } );
		expect( nq( { $exists: true } ) ).toEqual( { foo: { $exists: true } } );
		expect( nq( { '~': false } ) ).toEqual( { foo: { $exists: false } } );
		expect( nq( { $exists: false } ) ).toEqual( { foo: { $exists: false } } );
		expect( () => nq( { '~': 'bar', $exists: 'bar' } ) ).toThrowError();
	} );
	it( `${getStyle( 'bold', '==' )} ($equal)`, () => {
		expect( nq( 'bar' ) ).toEqual( { foo: { $equal: 'bar' } } );
		expect( nq( { $equal: 'bar' } ) ).toEqual( { foo: { $equal: 'bar' } } );
		expect( nq( { '==': 'bar' } ) ).toEqual( { foo: { $equal: 'bar' } } );
		expect( () => nq( { '==': 'bar', $equal: 'bar' } ) ).toThrowError();
	} );
	it( `${getStyle( 'bold', '!=' )} ($diff)`, () => {
		expect( nq( { $diff: 'bar' } ) ).toEqual( { foo: { $diff: 'bar' } } );
		expect( nq( { '!=': 'bar' } ) ).toEqual( { foo: { $diff: 'bar' } } );
		expect( () => nq( { '!=': 'bar', $diff: 'bar' } ) ).toThrowError();
	} );
	it( `${getStyle( 'bold', '<' )} ($less)`, () => {
		expect( nq( { $less: 1 } ) ).toEqual( { foo: { $less: 1 } } );
		expect( nq( { '<': 1 } ) ).toEqual( { foo: { $less: 1 } } );
		expect( () => nq( { '<': 1, $less: 1 } ) ).toThrowError();
		expect( () => nq( { '<': 'aze' } ) ).toThrowError();
		expect( () => nq( { $less: 'aze' } ) ).toThrowError();
	} );
	it( `${getStyle( 'bold', '<=' )} ($lessEqual)`, () => {
		expect( nq( { $lessEqual: 1 } ) ).toEqual( { foo: { $lessEqual: 1 } } );
		expect( nq( { '<=': 1 } ) ).toEqual( { foo: { $lessEqual: 1 } } );
		expect( () => nq( { '<=': 1, $lessEqual: 1 } ) ).toThrowError();
		expect( () => nq( { '<=': 'aze' } ) ).toThrowError();
		expect( () => nq( { $lessEqual: 'aze' } ) ).toThrowError();
	} );
	it( `${getStyle( 'bold', '>' )} ($greater)`, () => {
		expect( nq( { $greater: 1 } ) ).toEqual( { foo: { $greater: 1 } } );
		expect( nq( { '>': 1 } ) ).toEqual( { foo: { $greater: 1 } } );
		expect( () => nq( { '>': 1, $greater: 1 } ) ).toThrowError();
		expect( () => nq( { '>': 'aze' } ) ).toThrowError();
		expect( () => nq( { $greater: 'aze' } ) ).toThrowError();
	} );
	it( `${getStyle( 'bold', '>=' )} ($greaterEqual)`, () => {
		expect( nq( { $greaterEqual: 1 } ) ).toEqual( { foo: { $greaterEqual: 1 } } );
		expect( nq( { '>=': 1 } ) ).toEqual( { foo: { $greaterEqual: 1 } } );
		expect( () => nq( { '>=': 1, $greaterEqual: 1 } ) ).toThrowError();
		expect( () => nq( { '>=': 'aze' } ) ).toThrowError();
		expect( () => nq( { $greaterEqual: 'aze' } ) ).toThrowError();
	} );
} );
  if ( dataAccessLayer.adapter.classEntity.matches !== AdapterEntity.matches ){
	describe( 'Check "matchEntity"', () => {
		const me = ( query, obj ) => dataAccessLayer.adapter.classEntity.matches( obj, query );
		it( 'Empty query', () => {
			expect( me( {}, { foo: 'bar' } ) ).toBeTruthy();
		} );
		it( `${getStyle( 'bold', '~' )} ($exists)`, () => {
			expect( me( { foo: { $exists: true } }, { foo: 'bar' } ) ).toBeTruthy();
			expect( me( { foo: { $exists: true } }, { foo: undefined } ) ).toBeFalsy();
			expect( me( { foo: { $exists: false } }, { foo: 'bar' } ) ).toBeFalsy();
			expect( me( { foo: { $exists: false } }, { foo: undefined } ) ).toBeTruthy();
		} );
		it( `${getStyle( 'bold', '==' )} ($equal)`, () => {
			expect( me( { foo: { $equal: 'bar' } }, { foo: 'bar' } ) ).toBeTruthy();
			expect( me( { foo: { $equal: 'bar' } }, { foo: undefined } ) ).toBeFalsy();
			expect( me( { foo: { $equal: 'bar' } }, { foo: 'baz' } ) ).toBeFalsy();
		} );
		it( `${getStyle( 'bold', '!=' )} ($diff)`, () => {
			expect( me( { foo: { $diff: 'bar' } }, { foo: 'bar' } ) ).toBeFalsy();
			expect( me( { foo: { $diff: 'bar' } }, { foo: 'baz' } ) ).toBeTruthy();
			expect( me( { foo: { $diff: 'bar' } }, { foo: undefined } ) ).toBeFalsy();
			expect( me( { foo: { $diff: 'bar' } }, { bar: 'qux' } ) ).toBeFalsy();
		} );
		it( `${getStyle( 'bold', '<' )} ($less)`, () => {
			expect( me( { foo: { $less: 2 } }, { foo: undefined } ) ).toBeFalsy();
			expect( me( { foo: { $less: 2 } }, { foo: 1 } ) ).toBeTruthy();
			expect( me( { foo: { $less: 2 } }, { foo: 2 } ) ).toBeFalsy();
			expect( me( { foo: { $less: 2 } }, { foo: 3 } ) ).toBeFalsy();
		} );
		it( `${getStyle( 'bold', '<=' )} ($lessEqual)`, () => {
			expect( me( { foo: { $lessEqual: 2 } }, { foo: undefined } ) ).toBeFalsy();
			expect( me( { foo: { $lessEqual: 2 } }, { foo: 1 } ) ).toBeTruthy();
			expect( me( { foo: { $lessEqual: 2 } }, { foo: 2 } ) ).toBeTruthy();
			expect( me( { foo: { $lessEqual: 2 } }, { foo: 3 } ) ).toBeFalsy();
		} );
		it( `${getStyle( 'bold', '>' )} ($greater)`, () => {
			expect( me( { foo: { $greater: 2 } }, { foo: undefined } ) ).toBeFalsy();
			expect( me( { foo: { $greater: 2 } }, { foo: 1 } ) ).toBeFalsy();
			expect( me( { foo: { $greater: 2 } }, { foo: 2 } ) ).toBeFalsy();
			expect( me( { foo: { $greater: 2 } }, { foo: 3 } ) ).toBeTruthy();
		} );
		it( `${getStyle( 'bold', '>=' )} ($greaterEqual)`, () => {
			expect( me( { foo: { $greaterEqual: 2 } }, { foo: undefined } ) ).toBeFalsy();
			expect( me( { foo: { $greaterEqual: 2 } }, { foo: 1 } ) ).toBeFalsy();
			expect( me( { foo: { $greaterEqual: 2 } }, { foo: 2 } ) ).toBeTruthy();
			expect( me( { foo: { $greaterEqual: 2 } }, { foo: 3 } ) ).toBeTruthy();
		} );
		
		it( `${getStyle( 'bold', '$contains' )}`, () => {
			expect( me( { foo: { $contains: 2 } }, { foo: [] } ) ).toBeFalsy();
			expect( me( { foo: { $contains: 2 } }, { foo: [1] } ) ).toBeFalsy();
			expect( me( { foo: { $contains: 2 } }, { foo: [2] } ) ).toBeTruthy();
			expect( me( { foo: { $contains: 2 } }, { foo: [3, 2] } ) ).toBeTruthy();
		} );
	} );
}
} );
};
export const checkEachStandardMethods = adapterLabel => {
	const adapter = dataSources[getDataSourceLabel( adapterLabel )];
	const getTestLabel = fctName => {
		if ( ( adapter as any ).__proto__.hasOwnProperty( fctName ) ) {
			return fctName;
		} else {
			return `${fctName} (from BaseAdapter)`;
		}
	};
	
	checkInputFiltering( adapter );
	describe( getStyle( 'taskCategory', 'Test adapter methods' ), () => {
		let findManyOk = false;
		let findAllOk = false;
		describe( '✨ Insert methods', () => {
			it( getTestLabel( 'insertOne' ), async () => {
				const object = {
					foo: 'bar',
				};
				const entity = await adapter.insertOne( TABLE, object );
				expect( entity ).toBeAnAdapterEntity( adapter, object );
			} );
			it( getTestLabel( 'insertMany' ), async () => {
				const objects = [
					{
						baz: 'qux',
					},
					{
						qux: 'foo',
					},
					{
						foo: 'bar',
					},
				];
				const entities = await adapter.insertMany( TABLE, objects );
				expect( entities ).toHaveLength( objects.length );
				expect( entities ).toBeAnAdapterEntitySet( adapter, objects );
			} );
		} );
		describe( 'Specification level 1', () => {
			describe( '🔎 Find methods', () => {
				it( getTestLabel( 'findOne' ), () => {
					const object = {
						baz: 'qux',
					};
					return adapter.findOne( TABLE, object ).then( entity => {
						expect( entity ).toBeAnAdapterEntity( adapter, object );
					} );
				} );
				it( getTestLabel( 'findMany' ), async () => {
					const objects = {
						foo: 'bar',
					};
					const entities = await adapter.findMany( TABLE, objects );
					expect( entities ).toHaveLength( 2 );
					expect( entities ).toBeAnAdapterEntitySet( adapter, objects );
					findManyOk = true;
				} );
				it( 'Find all', async function skippable() {
					if ( findManyOk !== true ) {
						this.skip();
						return;
					}
					const entities = await adapter.findMany( TABLE, {} );
					expect( entities ).toHaveLength( 4 );
					expect( entities ).toBeAnAdapterEntitySet( adapter );
					findAllOk = true;
				} );
			} );
			describe( '🔃 Update methods', () => {
				it( getTestLabel( 'updateOne' ), () => {
					const fromObj = {
						baz: 'qux',
					};
					const targetObj = {
						foo: 'bar',
					};
					return adapter.updateOne( TABLE, fromObj, targetObj ).then( entity => {
						expect( entity ).toBeAnAdapterEntity(
							adapter,
							_.assign( {}, fromObj, targetObj )
						);
					} );
				} );
				it( getTestLabel( 'updateMany' ), async () => {
					const fromObj = {
						foo: 'bar',
					};
					const targetObj = {
						baz: 'qux',
					};
					const entities = await adapter.updateMany( TABLE, fromObj, targetObj );
					expect( entities ).toHaveLength( 3 );
					expect( entities ).toBeAnAdapterEntitySet(
						adapter,
						_.assign( {}, fromObj, targetObj )
					);
				} );
				it( getTestLabel( 'updateOne not found' ), () => {
					const fromObj = {
						qwe: 'rty',
					};
					const targetObj = {
						foo: 'bar',
					};
					return adapter.updateOne( TABLE, fromObj, targetObj ).then( entity => {
						expect( entity ).toBeUndefined();
					} );
				} );
				it( getTestLabel( 'updateMany not found' ), () => {
					const fromObj = {
						qwe: 'rty',
					};
					const targetObj = {
						baz: 'qux',
					};
					return adapter.updateMany( TABLE, fromObj, targetObj ).then( entities => {
						expect( entities ).toHaveLength( 0 );
					} );
				} );
			} );
			describe( '❌ Delete methods', () => {
				it( getTestLabel( 'deleteOne' ), () => {
					const obj = {
						qux: 'foo',
					};
					return adapter.deleteOne( TABLE, obj ).then( ( ...args ) => {
						expect( args ).toEqual( [undefined] );
						return Promise.resolve();
					} );
				} );
				it( getTestLabel( 'deleteMany' ), () => {
					const obj = {
						foo: 'bar',
					};
					return adapter.deleteMany( TABLE, obj ).then( ( ...args ) => {
						expect( args ).toEqual( [undefined] );
						return Promise.resolve();
					} );
				} );
				it( 'Check deletion: find all again', function skippable() {
					if ( findAllOk !== true ) {
						this.skip();
						return;
					}
					return adapter.findMany( TABLE, {} ).then( entities => {
						expect( entities ).toEqual( [] );
					} );
				} );
			} );
		} );
		describe( 'Specification level 2', () => {
			it( 'Initialize test data', async () => {
				const objects = [
					// Tests for $exists
					{ foo: 1 },
					{ foo: undefined },
					// Tests for comparison operators
					{ bar: 1 },
					{ bar: 2 },
					{ bar: 3 },
				];
				const entities = await adapter.insertMany( TABLE, objects );
				expect( entities ).toHaveLength( objects.length );
				expect( entities ).toBeAnAdapterEntitySet(
					adapter,
					_.map( objects, object => _.omitBy( object, _.isUndefined ) )
				);
			} );
			it( `${getStyle( 'bold', '~' )} ($exists) operator`, () => {
				return Promise.all( [
					adapter
					.findOne( TABLE, {
						foo: {
							'~': true,
						},
					} )
					.then( output => {
						expect( output ).toBeAnAdapterEntity( adapter, {
							foo: 1,
						} );
					} ),
					adapter
					.findOne( TABLE, {
						foo: {
							'~': false,
						},
					} )
					.then( output => {
						expect( output ).toBeAnAdapterEntity( adapter, {
							foo: undefined,
						} );
					} ),
				] );
			} );
			it( `${getStyle( 'bold', '==' )} ($equal) operator`, () => {
				return adapter
				.findOne( TABLE, {
					foo: {
						'==': 1,
					},
				} )
				.then( output => {
					expect( output ).toBeAnAdapterEntity( adapter, {
						foo: 1,
					} );
				} );
			} );
			it( `${getStyle( 'bold', '!=' )} ($diff) operator`, () => {
				return Promise.all( [
					adapter
					.findOne( TABLE, {
						bar: {
							'!=': 1,
						},
					} )
					.then( output => {
						expect( output ).toBeAnAdapterEntity( adapter, {
							bar: 2,
						} );
					} ),
					adapter
					.findOne( TABLE, {
						foo: {
							'!=': 1,
						},
					} )
					.then( output => {
						expect( output ).toBeUndefined();
					} ),
					adapter
					.findOne( TABLE, {
						foo: {
							'!=': 2,
						},
					} )
					.then( output => {
						expect( output ).toBeAnAdapterEntity( adapter, {
							foo: 1,
						} );
					} ),
				] );
			} );
			it( `${getStyle( 'bold', '<' )} ($less) operator`, async () => {
				const outputs = await adapter.findMany( TABLE, { bar: { '<': 2 } } );
				expect( outputs ).toHaveLength( 1 );
				expect( outputs ).toBeAnAdapterEntitySet( adapter, [{ bar: 1 }] );
			} );
			it( `${getStyle( 'bold', '<=' )} ($lessEqual) operator`, async () => {
				const outputs = await adapter.findMany( TABLE, {
					bar: {
						'<=': 2,
					},
				} );
				expect( outputs ).toHaveLength( 2 );
				expect( outputs ).toBeAnAdapterEntitySet( adapter, [
					{
						bar: 1,
					},
					{
						bar: 2,
					},
				] );
			} );
			it( `${getStyle( 'bold', '>' )} ($greater) operator`, async () => {
				const outputs = await adapter.findMany( TABLE, {
					bar: {
						'>': 2,
					},
				} );
				expect( outputs ).toHaveLength( 1 );
				expect( outputs ).toBeAnAdapterEntitySet( adapter, [
					{
						bar: 3,
					},
				] );
			} );
			it( `${getStyle( 'bold', '>=' )} ($greaterEqual) operator`, async () => {
				const outputs = await adapter.findMany( TABLE, {
					bar: {
						'>=': 2,
					},
				} );
				expect( outputs ).toHaveLength( 2 );
				expect( outputs ).toBeAnAdapterEntitySet( adapter, [
					{
						bar: 2,
					},
					{
						bar: 3,
					},
				] );
			} );
		} );
	} );
};
export const checkApplications = adapterLabel => {
	if ( 'undefined' !== typeof window ) {
		return;
	}
	const adapter = dataSources[getDataSourceLabel( adapterLabel )];
	require( '../testApps/adapters/index' )( adapter );
};
