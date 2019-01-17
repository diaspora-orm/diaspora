import * as _ from 'lodash';
// tslint:disable-next-line:no-implicit-dependencies
import * as express from 'express';
// tslint:disable-next-line:no-implicit-dependencies
import {json, urlencoded} from 'body-parser';

import { Adapter as _AdapterEntity } from '../../../src/adapters/base';
import AAdapterEntity = _AdapterEntity.Base.AAdapterEntity;
import AAdapter = _AdapterEntity.Base.AAdapter;
import { Adapter as _InMemoryEntity } from '../../../src/adapters/inMemory';
import InMemoryEntity = _InMemoryEntity.InMemory.InMemoryEntity;
import { Adapter as _DataAccessLayer } from '../../../src/adapters/dataAccessLayer';
import DataAccessLayer = _DataAccessLayer.DataAccessLayer;

import { Diaspora } from '../../../src/diaspora';
import { QueryLanguage } from '../../../src/types/queryLanguage';

import { dataSources, getStyle } from '../utils';
import { IEntityProperties } from '../../../src/types/entity';
import { Entity } from '../../../src/entities';
import { product } from './dataMatrix';
import { inspect } from 'util';

const getDataSourceLabel = name => `${name}Adapter`;

const TABLE = 'test';

const filterEntity = ( entity: AAdapterEntity ) => {
	const sentProperties = _.assign( {}, entity.properties );
	delete sentProperties.idHash;
	return sentProperties;
};
export const initMockApi = ( adapter: DataAccessLayer<AAdapterEntity>, apiPort: number, endpoint: string, tableName: string ) => {
	const parseQs = ( queryString: any ) => {
		const parsed = _.mapValues( queryString, str => JSON.parse( str ) );
		if ( 'options' in parsed || 'where' in parsed ){
			return {where: parsed.where, options: parsed.options};
		} else {
			return {where: parsed};
		}
	};
	
	const app = express();
	app.use( urlencoded( {
		extended: true,
	} ) );
	
	app.use( json() );
	
	app.post( endpoint, ( req, res ) => {
		const body = req.body;
		adapter.insertOne( tableName, body ).then( entity => {
			if ( !_.isNil( entity ) ) {
				return res.json( filterEntity( entity ) );
			}
			return res.json();
		} );
	} );
	app.post( `${endpoint}s`, ( req, res ) => {
		const body = req.body;
		adapter.insertMany( tableName, body ).then( entities => {
			if ( !_.isEmpty( entities ) ) {
				return res.json( _.map( entities, filterEntity ) );
			}
			return res.json();
		} );
	} );
	
	app.get( endpoint, ( req, res ) => {
		const query = parseQs( req.query );
		adapter
		.findOne( tableName, query.where, query.options )
		.then( entity => {
			if ( !_.isNil( entity ) ) {
				return res.json( filterEntity( entity ) );
			}
			return res.json();
		} );
	} );
	app.get( `${endpoint}s`, ( req, res ) => {
		const query = parseQs( req.query );
		adapter
		.findMany( tableName, query.where, query.options )
		.then( entities => {
			if ( !_.isEmpty( entities ) ) {
				return res.json(
					_.map( entities, filterEntity )
				);
			}
			return res.json( );
		} );
	} );
	
	app.patch( endpoint, ( req, res ) => {
		const body = req.body;
		const query = parseQs( req.query );
		adapter
		.updateOne( tableName, query.where, body, query.options )
		.then( entity => {
			if ( !_.isNil( entity ) ) {
				return res.json( filterEntity( entity ) );
			}
			return res.json( entity );
		} );
	} );
	app.patch( `${endpoint}s`, ( req, res ) => {
		const body = req.body;
		const query = parseQs( req.query );
		adapter
		.updateMany( tableName, query.where, body, query.options )
		.then( entities => {
			if ( !_.isEmpty( entities ) ) {
				return res.json(
					_.map( entities, filterEntity )
				);
			}
			return res.json( );
		} );
	} );
	
	app.delete( endpoint, ( req, res ) => {
		const query = parseQs( req.query );
		adapter
		.deleteOne( tableName, query.where, query.options )
		.then( () =>
		res.json() );
	} );
	app.delete( `${endpoint}s`, ( req, res ) => {
		const query = parseQs( req.query );
		adapter
		.deleteMany( tableName, query.where, query.options )
		.then( () =>
		res.json() );
	} );
	app.get( '/api/:code', ( req, res ) =>
	res.status( req.params.code ).send( {message: 'This is an error message'} ) );
	app.get( '/api/nomsg/:code', ( req, res ) =>
	res.status( req.params.code ).send() );
	
	return new Promise( ( resolve, reject ) => {
		
		const server = app.listen( apiPort, () =>
		resolve( server ) );
	} );
};
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
		expect( dataAccessLayer.adapter ).toBeInstanceOf( AAdapter );
		if ( 'undefined' === typeof window ) {
			expect( dataAccessLayer.adapter.constructor.name ).toEqual( `${baseName}Adapter` );
			expect( dataAccessLayer.classEntity.name ).toEqual( `${baseName}Entity` );
		}
		_.forEach( ['insert', 'find', 'update', 'delete'], word => {
			expect( dataAccessLayer ).toImplementOneOfMethods( [`${word}One`, `${word}Many`] );
		} );
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
	describe( 'Collection configuration', () => {
		it( 'Configure collection', async () => {
			await adapter.configureCollection( 'test-config', {}, {} );
		} );
	} );
	
	describe( `${getStyle( 'taskCategory', `Check ${adapterLabel} query inputs filtering` )}`, () => {
		describe( 'Normalization', () => {
			describe( 'Options', () => {
				const no = adapter.normalizeOptions;
				it( 'Default options', () => {
					expect( no( {} ) ).toEqual( {
						skip: 0,
						remapInput: true,
						remapOutput: true,
						limit: Infinity,
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
						limit: Infinity,
					} );
					expect( no( { skip: '10' } as any ) ).toEqual( {
						skip: 10,
						remapInput: true,
						remapOutput: true,
						limit: Infinity,
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
					expect( () => no( {
						page: 1,
						skip: 1,
						limit: 5,
					} ) ).toThrowError( ReferenceError );
					expect( () => no( {
						page: 0.5,
						limit: 5,
					} ) ).toThrowError( TypeError );
					expect( () => no( {
						page: 1,
						limit: Infinity,
					} ) ).toThrowError( RangeError );
					expect( () => no( {
						page: Infinity,
						limit: 5,
					} ) ).toThrowError( RangeError );
					expect( () => no( {
						page: -1,
						limit: 5,
					} ) ).toThrowError( RangeError );
				} );
			} );
			describe( 'Query', () => {
				const nq = ( query: any ) => adapter.normalizeQuery(
					{ b: query },
					{ remapInput: true, remapOutput: false, skip: 0, limit: 0 }
				);
				it( 'Empty query', () => {
					expect(
						adapter.normalizeQuery(
							{},
							{ remapInput: true, remapOutput: false, skip: 0, limit: 0 }
						)
					).toEqual( {} );
				} );
				it( `${getStyle( 'bold', '~' )} ($exists)`, () => {
					expect( nq( undefined ) ).toEqual( { b: { $exists: false } } );
					expect( nq( { '~': true } ) ).toEqual( { b: { $exists: true } } );
					expect( nq( { $exists: true } ) ).toEqual( { b: { $exists: true } } );
					expect( nq( { '~': false } ) ).toEqual( { b: { $exists: false } } );
					expect( nq( { $exists: false } ) ).toEqual( { b: { $exists: false } } );
					expect( () => nq( { '~': 3, $exists: 3 } ) ).toThrowError();
				} );
				it( `${getStyle( 'bold', '==' )} ($equal)`, () => {
					expect( nq( 3 ) ).toEqual( { b: { $equal: 3 } } );
					expect( nq( { $equal: 3 } ) ).toEqual( { b: { $equal: 3 } } );
					expect( nq( { '==': 3 } ) ).toEqual( { b: { $equal: 3 } } );
					expect( () => nq( { '==': 3, $equal: 3 } ) ).toThrowError();
				} );
				it( `${getStyle( 'bold', '!=' )} ($diff)`, () => {
					expect( nq( { $diff: 3 } ) ).toEqual( { b: { $diff: 3 } } );
					expect( nq( { '!=': 3 } ) ).toEqual( { b: { $diff: 3 } } );
					expect( () => nq( { '!=': 3, $diff: 3 } ) ).toThrowError();
				} );
				it( `${getStyle( 'bold', '<' )} ($less)`, () => {
					expect( nq( { $less: 1 } ) ).toEqual( { b: { $less: 1 } } );
					expect( nq( { '<': 1 } ) ).toEqual( { b: { $less: 1 } } );
					expect( () => nq( { '<': 1, $less: 1 } ) ).toThrowError();
					expect( () => nq( { '<': 'aze' } ) ).toThrowError();
					expect( () => nq( { $less: 'aze' } ) ).toThrowError();
				} );
				it( `${getStyle( 'bold', '<=' )} ($lessEqual)`, () => {
					expect( nq( { $lessEqual: 1 } ) ).toEqual( { b: { $lessEqual: 1 } } );
					expect( nq( { '<=': 1 } ) ).toEqual( { b: { $lessEqual: 1 } } );
					expect( () => nq( { '<=': 1, $lessEqual: 1 } ) ).toThrowError();
					expect( () => nq( { '<=': 'aze' } ) ).toThrowError();
					expect( () => nq( { $lessEqual: 'aze' } ) ).toThrowError();
				} );
				it( `${getStyle( 'bold', '>' )} ($greater)`, () => {
					expect( nq( { $greater: 1 } ) ).toEqual( { b: { $greater: 1 } } );
					expect( nq( { '>': 1 } ) ).toEqual( { b: { $greater: 1 } } );
					expect( () => nq( { '>': 1, $greater: 1 } ) ).toThrowError();
					expect( () => nq( { '>': 'aze' } ) ).toThrowError();
					expect( () => nq( { $greater: 'aze' } ) ).toThrowError();
				} );
				it( `${getStyle( 'bold', '>=' )} ($greaterEqual)`, () => {
					expect( nq( { $greaterEqual: 1 } ) ).toEqual( { b: { $greaterEqual: 1 } } );
					expect( nq( { '>=': 1 } ) ).toEqual( { b: { $greaterEqual: 1 } } );
					expect( () => nq( { '>=': 1, $greaterEqual: 1 } ) ).toThrowError();
					expect( () => nq( { '>=': 'aze' } ) ).toThrowError();
					expect( () => nq( { $greaterEqual: 'aze' } ) ).toThrowError();
				} );
			} );
		} );
		if ( adapter.classEntity.matches !== AAdapterEntity.matches ){
			describe( `Check ${adapter.adapter.name} "matchEntity"`, () => {
				const me = ( query, obj ) => adapter.classEntity.matches( obj, query );
				it( 'Empty query', () => {
					expect( me( {}, { b: 3 } ) ).toBeTruthy();
				} );
				it( `${getStyle( 'bold', '~' )} ($exists)`, () => {
					expect( me( { b: { $exists: true } }, { b: 3 } ) ).toBeTruthy();
					expect( me( { b: { $exists: true } }, { b: undefined } ) ).toBeFalsy();
					expect( me( { b: { $exists: false } }, { b: 3 } ) ).toBeFalsy();
					expect( me( { b: { $exists: false } }, { b: undefined } ) ).toBeTruthy();
				} );
				it( `${getStyle( 'bold', '==' )} ($equal)`, () => {
					expect( me( { b: { $equal: 3 } }, { b: 3 } ) ).toBeTruthy();
					expect( me( { b: { $equal: 3 } }, { b: undefined } ) ).toBeFalsy();
					expect( me( { b: { $equal: 3 } }, { b: 'baz' } ) ).toBeFalsy();
				} );
				it( `${getStyle( 'bold', '!=' )} ($diff)`, () => {
					expect( me( { b: { $diff: 3 } }, { b: 3 } ) ).toBeFalsy();
					expect( me( { b: { $diff: 3 } }, { b: 'baz' } ) ).toBeTruthy();
					expect( me( { b: { $diff: 3 } }, { b: undefined } ) ).toBeFalsy();
					expect( me( { b: { $diff: 3 } }, { a: 4 } ) ).toBeFalsy();
				} );
				it( `${getStyle( 'bold', '<' )} ($less)`, () => {
					expect( me( { b: { $less: 2 } }, { b: undefined } ) ).toBeFalsy();
					expect( me( { b: { $less: 2 } }, { b: 1 } ) ).toBeTruthy();
					expect( me( { b: { $less: 2 } }, { b: 2 } ) ).toBeFalsy();
					expect( me( { b: { $less: 2 } }, { b: 3 } ) ).toBeFalsy();
				} );
				it( `${getStyle( 'bold', '<=' )} ($lessEqual)`, () => {
					expect( me( { b: { $lessEqual: 2 } }, { b: undefined } ) ).toBeFalsy();
					expect( me( { b: { $lessEqual: 2 } }, { b: 1 } ) ).toBeTruthy();
					expect( me( { b: { $lessEqual: 2 } }, { b: 2 } ) ).toBeTruthy();
					expect( me( { b: { $lessEqual: 2 } }, { b: 3 } ) ).toBeFalsy();
				} );
				it( `${getStyle( 'bold', '>' )} ($greater)`, () => {
					expect( me( { b: { $greater: 2 } }, { b: undefined } ) ).toBeFalsy();
					expect( me( { b: { $greater: 2 } }, { b: 1 } ) ).toBeFalsy();
					expect( me( { b: { $greater: 2 } }, { b: 2 } ) ).toBeFalsy();
					expect( me( { b: { $greater: 2 } }, { b: 3 } ) ).toBeTruthy();
				} );
				it( `${getStyle( 'bold', '>=' )} ($greaterEqual)`, () => {
					expect( me( { b: { $greaterEqual: 2 } }, { b: undefined } ) ).toBeFalsy();
					expect( me( { b: { $greaterEqual: 2 } }, { b: 1 } ) ).toBeFalsy();
					expect( me( { b: { $greaterEqual: 2 } }, { b: 2 } ) ).toBeTruthy();
					expect( me( { b: { $greaterEqual: 2 } }, { b: 3 } ) ).toBeTruthy();
				} );
				
				it( `${getStyle( 'bold', '$contains' )}`, () => {
					expect( me( { b: { $contains: 2 } }, { b: [] } ) ).toBeFalsy();
					expect( me( { b: { $contains: 2 } }, { b: [1] } ) ).toBeFalsy();
					expect( me( { b: { $contains: 2 } }, { b: [2] } ) ).toBeTruthy();
					expect( me( { b: { $contains: 2 } }, { b: [3, 2] } ) ).toBeTruthy();
				} );
			} );
		}
	} );
	describe( getStyle( 'taskCategory', `Test ${adapterLabel} adapter methods` ), () => {
		describe( getStyle( 'taskCategory', `Test ${adapterLabel} adapter options` ), () => {
			/*
			Generates every possible combinations of demo options, like:
			
			```
			{skip: undefined, limit: undefined, page: undefined} 
			{skip: undefined, limit: undefined, page: 0}
			...
			{skip: undefined, limit: 0, page: 2}
			...
			{skip: 0, limit: undefined, page: 0}
			```
			*/
			const allOptionsCombinations = product( {
				skip: [undefined, 0,2],
				limit: [undefined, 0,2],
				page: [undefined, 0,2],
			} ) as QueryLanguage.IQueryOptions[];
			const removedImpossibleCombinations = _.reject( allOptionsCombinations, combination => 
				// Conflicting options (page & skip)
				( !_.isNil( combination.page ) && !_.isNil( combination.skip ) ) || 
				// Dependent options (page requires limit)
				( !_.isNil( combination.page ) && _.isNil( combination.limit ) )
			);
			const groups = {
				'Limit only': ( options: QueryLanguage.IQueryOptions ) => !_.isNil( options.limit ) && _.isNil( options.page ) && _.isNil( options.skip ), 
				'Skip only': ( options: QueryLanguage.IQueryOptions ) => _.isNil( options.limit ) && _.isNil( options.page ) && !_.isNil( options.skip ), 
				'Other combinations': ( options: QueryLanguage.IQueryOptions ) => true,
			};
			const testsCombinations = _.mapValues( groups, () => [] ) as {[key: string]: QueryLanguage.IQueryOptions[]};
			_.forEach( removedImpossibleCombinations, ( combination, name ) => {
				_.forEach( groups, ( tester, name ) => {
					if ( tester( combination ) ){
						testsCombinations[name].push( combination );
						return true;
					}
				} );
			} );
			
			const tableContent = [
				{a: false},
				{a: true},
				{a: false},
				{a: true},
				{a: false},
				{a: true},
				{a: false},
				{a: true},
			];
			const matchSearch = {a: true};
			
			const getExpectedCount = ( totalItems: number, combination: QueryLanguage.IQueryOptions ) => {
				const expected = ( totalItems - ( combination.skip || 0 ) ) - ( ( combination.limit || 0 ) * ( combination.page || 0 ) );
				if ( _.isNil( combination.limit ) ){
					return expected;
				} else {
					return Math.min( expected, combination.limit );
				}
			};
			const getExpectedOffset = ( combination: QueryLanguage.IQueryOptions ) =>
				( ( ( combination.page || 0 ) * ( combination.limit || 0 ) ) + ( combination.skip || 0 ) ) || 0;

			
			beforeEach( async () => {
				await adapter.deleteMany( TABLE, {} );
				await adapter.insertMany( TABLE, tableContent );
			} );
			_.forEach( testsCombinations, ( combinations, testLabel ) => {
				it( testLabel, async () => {
					const allMatchingItems = await adapter.findMany( TABLE, matchSearch );
					expect( allMatchingItems ).toHaveLength( _.filter( tableContent, 'a' ).length );
					for ( let combination of combinations ){
						const optionsResultSet = await adapter.findMany( TABLE, matchSearch, combination );
						
						// Check if the query returned the right number of matches
						const expectedCount = getExpectedCount( allMatchingItems.length, combination );
						expect( optionsResultSet ).toHaveLength( expectedCount );
						
						// Check if the query returned the right matches
						const expectedOffset = getExpectedOffset( combination );
						const expectedSet = allMatchingItems.slice( expectedOffset, expectedOffset + expectedCount );
						_.forEach( optionsResultSet, ( result, index ) => {
							expect( result.properties.id ).toBe( expectedSet[index].properties.id );
						} );
					}
				} );
			} );
		} );
		const OFFSET_OBJECT = {e: 1};
		const TEST_SET = [OFFSET_OBJECT, {a: 1, b: 3, e: 1}, {a: 4, c: 5, e: 1}, {b: 3, e: 1}, {a: 4, d: 'foo', e: 1}, {a: 1, d: 'baz', e: 1}];
		describe( '✨ Insert methods', () => {
			beforeEach( async () => {
				await adapter.deleteMany( TABLE, {} );
			} );
			it( getTestLabel( 'insertOne' ), async () => {
				const object = {
					b: 3,
				};
				const entity = await adapter.insertOne( TABLE, object );
				expect( entity ).toBeAnAdapterEntity( adapter, object );
				expect( await adapter.findMany( TABLE, {} ) ).toHaveLength( 1 );
			} );
			it( getTestLabel( 'insertOne empty' ), async () => {
				const entity = await adapter.insertOne( TABLE, undefined );
				expect( entity ).toBeAnAdapterEntity( adapter, {} );
				expect( await adapter.findMany( TABLE, {} ) ).toHaveLength( 1 );
			} );
			it( getTestLabel( 'insertMany' ), async () => {
				const objects = [
					{
						a: 4,
					},
					{
						qux: 1,
					},
					{
						b: 3,
					},
				];
				const entities = await adapter.insertMany( TABLE, objects );
				expect( entities ).toHaveLength( objects.length );
				expect( entities ).toBeAnAdapterEntitySet( adapter, objects );
			} );
		} );
		describe( 'Specification level 1', () => {
			beforeEach( async () => {
				await adapter.deleteMany( TABLE, {} );
				await adapter.insertMany( TABLE,  TEST_SET );
			} );
			describe( '🔎 Find methods', () => {
				it( getTestLabel( 'findOne' ), async () => {
					const object = {
						a: 4,
					};
					const entity = await adapter.findOne( TABLE, object );
					expect( entity ).toBeAnAdapterEntity( adapter, object );
				} );
				it( getTestLabel( 'findOne not found' ), async () => {
					const object = {
						a: 42,
					};
					const entity = await adapter.findOne( TABLE, object );
					expect( entity ).toBeUndefined();
				} );
				it( getTestLabel( 'findOne by id' ), async () => {
					const object = {
						a: 4,
					};
					const entity = await adapter.findOne( TABLE, object );
					const reFound = await adapter.findOne( TABLE, entity.properties.id );
					expect( reFound ).toBeAnAdapterEntity( adapter, object );
					expect( reFound ).toStrictEqual( entity );
				} );
				it( getTestLabel( 'findOne by id not found' ), async () => {
					const found = await adapter.findOne( TABLE, 'this_should_really_not_exists' );
					expect( found ).toBeUndefined();
				} );
				it( getTestLabel( 'findMany' ), async () => {
					const objects = {
						b: 3,
					};
					const entities = await adapter.findMany( TABLE, objects );
					expect( entities ).toHaveLength( 2 );
					expect( entities ).toBeAnAdapterEntitySet( adapter, objects );
				} );
				it( getTestLabel( 'findMany not found' ), async () => {
					const objects = {
						b: 42,
					};
					const entities = await adapter.findMany( TABLE, objects );
					expect( entities ).toHaveLength( 0 );
					expect( entities ).toBeAnAdapterEntitySet( adapter, objects );
				} );
				it( 'Find all', async () => {
					const entities = await adapter.findMany( TABLE, {} );
					expect( entities ).toHaveLength( TEST_SET.length );
					expect( entities ).toBeAnAdapterEntitySet( adapter );
				} );
			} );
			describe( '🔃 Update methods', () => {
				it( getTestLabel( 'updateOne' ), async () => {
					const fromObj = { a: 4 };
					const targetObj = { b: 3 };
					const entity = await adapter.updateOne( TABLE, fromObj, targetObj );
					expect( entity ).toBeAnAdapterEntity( adapter, _.assign( {c: 5}, fromObj, targetObj ) );
				} );
				it( getTestLabel( 'updateOne not found' ), async () => {
					const fromObj = { a: 42 };
					const targetObj = { b: 3 };
					const entity = await adapter.updateOne( TABLE, fromObj, targetObj );
					expect( entity ).toBeUndefined();
				} );
				it( getTestLabel( 'updateOne by id' ), async () => {
					const fromObj = { a: 4 };
					const targetObj = { b: 3 };
					const entity = await adapter.updateOne( TABLE, fromObj, targetObj );
					const updatedEntity = await adapter.updateOne( TABLE, entity.properties.id, targetObj );
					expect( entity ).toBeAnAdapterEntity( adapter, _.assign( {}, fromObj, targetObj ) );
				} );
				it( getTestLabel( 'updateOne by id not found' ), async () => {
					const object = {
						a: 4,
					};
					const found = await adapter.updateOne( TABLE, 'this_should_really_not_exists', {foo:42} );
					expect( found ).toBeUndefined();
				} );
				it( getTestLabel( 'updateMany' ), async () => {
					const fromObj = { b: 3 };
					const targetObj = { a: 4 };
					const entities = await adapter.updateMany( TABLE, fromObj, targetObj );
					expect( entities ).toHaveLength( 2 );
					expect( entities ).toBeAnAdapterEntitySet(
						adapter,
						_.map( [{a: 1}, {}], item => _.assign( item, fromObj, targetObj ) )
					);
				} );
				it( getTestLabel( 'updateMany not found' ), async () => {
					const fromObj = { b: 42 };
					const targetObj = { a: 4 };
					const entities = await adapter.updateMany( TABLE, fromObj, targetObj );
					expect( entities ).toHaveLength( 0 );
					expect( entities ).toBeAnAdapterEntitySet( adapter );
				} );
				it( getTestLabel( 'updateOne not found' ), async () => {
					const fromObj = {
						qwe: 'rty',
					};
					const targetObj = {
						b: 3,
					};
					const entity = await adapter.updateOne( TABLE, fromObj, targetObj );
					expect( entity ).toBeUndefined();
				} );
				it( getTestLabel( 'updateMany not found' ), async () => {
					const fromObj = {
						qwe: 'rty',
					};
					const targetObj = {
						a: 4,
					};
					const entities = await adapter.updateMany( TABLE, fromObj, targetObj );
					expect( entities ).toHaveLength( 0 );
				} );
			} );
			describe( '❌ Delete methods', () => {
				it( getTestLabel( 'deleteOne' ), async () => {
					const obj = {
						a: 1,
					};
					const deleteReturn = await adapter.deleteOne( TABLE, obj );
					expect( deleteReturn ).toEqual( undefined );
					const entities = await adapter.findMany( TABLE, {} );
					expect( entities ).toHaveLength( TEST_SET.length - 1 );
				} );
				it( getTestLabel( 'deleteOne with skip' ), async () => {
					const obj = {
						a: 1,
					};
					const beforeDelete = await adapter.findOne( TABLE, obj );
					const deleteReturn = await adapter.deleteOne( TABLE, obj, {skip: 1} );
					expect( deleteReturn ).toEqual( undefined );
					const entities = await adapter.findMany( TABLE, {} );
					expect( entities ).toHaveLength( TEST_SET.length - 1 );
					expect( ( await adapter.findOne( TABLE, obj ) ).properties.id ).toEqual( beforeDelete.properties.id );
				} );
				it( getTestLabel( 'deleteOne not found' ), async () => {
					const obj = {
						a: 42,
					};
					const deleteReturn = await adapter.deleteOne( TABLE, obj );
					expect( deleteReturn ).toEqual( undefined );
					const entities = await adapter.findMany( TABLE, {} );
					expect( entities ).toHaveLength( TEST_SET.length );
				} );
				it( getTestLabel( 'deleteOne not found because of skip' ), async () => {
					const obj = {
						c: 5,
					};
					const beforeDelete = await adapter.findOne( TABLE, obj );
					const deleteReturn = await adapter.deleteOne( TABLE, obj, {skip: 1} );
					expect( deleteReturn ).toEqual( undefined );
					const entities = await adapter.findMany( TABLE, {} );
					expect( entities ).toHaveLength( TEST_SET.length );
					expect( ( await adapter.findOne( TABLE, obj ) ).properties.id ).toEqual( beforeDelete.properties.id );
				} );
				it( getTestLabel( 'deleteMany' ), async () => {
					const obj = {
						b: 3,
					};
					const deleteResults = await adapter.deleteMany( TABLE, obj );
					expect( deleteResults ).toBeUndefined();
					const entities = await adapter.findMany( TABLE, {} );
					expect( entities ).toHaveLength( TEST_SET.length - 2 );
				} );
				it( getTestLabel( 'deleteAll' ), async () => {
					const deleteResults = await adapter.deleteMany( TABLE, {} );
					expect( deleteResults ).toBeUndefined();
					const entities = await adapter.findMany( TABLE, {} );
					expect( entities ).toEqual( [] );
				} );
			} );
			describe( '🛠️ Utility methods', () => {
				describe( getTestLabel( 'contains' ), () => {
					it( 'Existing element', async () => {
						expect( await adapter.contains( TABLE, {a: 1}, {} ) ).toBe( true );
					} );
					it( 'Non existing element', async () => {
						expect( await adapter.contains( TABLE, {a: 42}, {} ) ).toBe( false );
					} );
					it( 'Existing element, too offseted', async () => {
						expect( await adapter.contains( TABLE, {a: 1}, {skip:2} ) ).toBe( false );
					} );
				} );
				describe( getTestLabel( 'count' ), () => {
					it( 'Existing element', async () => {
						expect( await adapter.count( TABLE, {a: 1}, {} ) ).toBe( 2 );
					} );
					it( 'Non existing element', async () => {
						expect( await adapter.count( TABLE, {a: 42}, {} ) ).toBe( 0 );
					} );
					it( 'Existing element, too offseted', async () => {
						expect( await adapter.count( TABLE, {a: 1}, {skip:2} ) ).toBe( 0 );
					} );
				} );
				describe( getTestLabel( 'every' ), () => {
					it( 'Truthy query', async () => {
						expect( await adapter.every( TABLE, {e: 1}, {} ) ).toBe( true );
					} );
					it( 'Falsey query', async () => {
						expect( await adapter.every( TABLE, {a: 42}, {} ) ).toBe( false );
						expect( await adapter.every( TABLE, {e: 2}, {} ) ).toBe( false );
					} );
				} );
			} );
		} );
		describe( 'Specification level 2', () => {
			beforeEach( async () => {
				await adapter.deleteMany( TABLE, {} );
				const objects = [
					// Tests for $exists
					{ b: 1 },
					{ b: undefined },
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
			it( `${getStyle( 'bold', '~' )} ($exists) operator`, () =>
			Promise.all( [
				adapter
				.findOne( TABLE, {
					b: {
						'~': true,
					},
				} )
				.then( output => {
					expect( output ).toBeAnAdapterEntity( adapter, {
						b: 1,
					} );
				} ),
				adapter
				.findOne( TABLE, {
					b: {
						'~': false,
					},
				} )
				.then( output => {
					expect( output ).toBeAnAdapterEntity( adapter, {
						b: undefined,
					} );
				} ),
			] ) );
			it( `${getStyle( 'bold', '==' )} ($equal) operator`, () =>
			adapter
			.findOne( TABLE, {
				b: {
					'==': 1,
				},
			} )
			.then( output => {
				expect( output ).toBeAnAdapterEntity( adapter, {
					b: 1,
				} );
			} ) );
			it( `${getStyle( 'bold', '!=' )} ($diff) operator`, () =>
			Promise.all( [
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
					b: {
						'!=': 1,
					},
				} )
				.then( output => {
					expect( output ).toBeUndefined();
				} ),
				adapter
				.findOne( TABLE, {
					b: {
						'!=': 2,
					},
				} )
				.then( output => {
					expect( output ).toBeAnAdapterEntity( adapter, {
						b: 1,
					} );
				} ),
			] ) );
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
