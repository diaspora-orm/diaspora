import * as _ from 'lodash';

import { Diaspora } from '../../src/diaspora';
import { Model } from '../../src/model';
import { Entity } from '../../src/entities';
import { InMemoryAdapter, InMemoryEntity } from '../../src/adapters/inMemory';
import { Adapter } from '../../src/adapters/base';

import '../utils';
import { DataAccessLayer } from '../../src/adapters/dataAccessLayer';
import { EFieldType } from '../../src';

let testModel: Model;
const MODEL_NAME = 'model-test';
const SOURCE = 'inMemory-model-test';
let dataAccessLayer: DataAccessLayer;
let store: { items: any[] };

beforeAll( () => {
	dataAccessLayer = Diaspora.createNamedDataSource( SOURCE, 'inMemory' );
	testModel = Diaspora.declareModel( MODEL_NAME, {
		sources: [SOURCE],
		attributes: {
			foo: {
				type: EFieldType.STRING,
			},
			baz: {
				type: EFieldType.STRING,
			},
		},
	} );
	store = ( dataAccessLayer.adapter as any ).store[MODEL_NAME];
} );
beforeEach( () => {
	store.items = [];
	_.forEach( [{ foo: 'bar' }, { foo: 'bar' }, { foo: 'baz' }, {}], entity => {
		store.items.push( InMemoryEntity.setId( entity, dataAccessLayer.adapter ) );
	} );
} );
describe( 'Model', () => {
	it( 'Construct', () => {
		expect( testModel ).toBeInstanceOf( Model );
		if ( 'undefined' === typeof window ) {
			expect( testModel.ctor.name ).toEqual( 'Model' );
		}
	} );
	describe( '- Spawn instances', () => {
		it( 'Spawn a single instance', () => {
			const entity1 = testModel.spawn( {} );
			expect( entity1 ).toBeAnEntity( testModel, {}, true );

			const entity2 = testModel.spawn( { foo: 'bar' } );
			expect( entity2 ).toBeAnEntity( testModel, { foo: 'bar' }, true );
		} );
		it( 'Spawn multiple instances', () => {
			const objects = [{ foo: 'bar' }, undefined];
			const entities = testModel.spawnMany( objects );
			expect( entities ).toBeAnEntitySet( testModel, objects, true );
			expect( entities ).toHaveLength( 2 );
		} );
	} );
	describe( '- Create instances', () => {
		it( 'Create a single instance', async () => {
			expect( testModel ).toImplementMethod( 'insert' );
			const object = {
				foo: 'qux',
			};
			const newEntity = await testModel.insert( object );
			expect( newEntity ).toBeAnEntity( testModel, object, SOURCE );
			expect( store.items ).toHaveLength( 5 );
		} );
		it( 'Create multiple instances', async () => {
			expect( testModel ).toImplementMethod( 'insertMany' );
			const objects = [
				{
					foo: 'qux',
				},
				undefined,
				{
					foo: undefined,
				},
				{
					foo: 'fum',
				},
			];
			const newEntities = await testModel.insertMany( objects );
			expect( newEntities ).toBeAnEntitySet( testModel, objects, SOURCE );
			expect( newEntities ).toHaveLength( 4 );
			expect( store.items ).toHaveLength( 8 );
		} );
	} );
	describe( '- Find instances', () => {
		describe( 'Find a single instance', () => {
			it( 'Model should implement "find"', () => {
				expect( testModel ).toImplementMethod( 'find' );
			} );
			it( 'Find found with value', async () => {
				const found = await testModel.find( { foo: 'bar' } );
				expect( found ).toBeAnEntity( testModel, { foo: 'bar' }, SOURCE );
			} );
			it( 'Find found with undefined', async () => {
				const found = await testModel.find( { foo: undefined } );
				expect( found ).toBeAnEntity( testModel, { foo: undefined }, SOURCE );
			} );
			it( 'Find not found', async () => {
				const found = await testModel.find( { foo: 'fum' } );
				expect( found ).toBeNull();
			} );
		} );
		describe( 'Find multiple instances', () => {
			it( 'Model should implement "findMany"', () => {
				expect( testModel ).toImplementMethod( 'findMany' );
			} );
			it( 'Find found with value', async () => {
				const found = await testModel.findMany( { foo: 'bar' } );
				expect( found ).toBeAnEntitySet( testModel, { foo: 'bar' }, SOURCE );
				expect( found ).toHaveLength( 2 );
			} );
			it( 'Find found with undefined', async () => {
				const found = await testModel.findMany( { foo: undefined } );
				expect( found ).toBeAnEntitySet( testModel, { foo: undefined }, SOURCE );
				expect( found ).toHaveLength( 1 );
			} );
			it( 'Find not found', async () => {
				const found = await testModel.findMany( { foo: 'fum' } );
				expect( found ).toBeAnEntitySet( testModel, {} );
				expect( found ).toHaveLength( 0 );
			} );
			it( 'Find all', async () => {
				const found = await testModel.findMany( {} );
				expect( found ).toBeAnEntitySet( testModel, {} );
				expect( found ).toHaveLength( 4 );
			} );
		} );
	} );
	describe( '- Update instances', () => {
		describe( 'Update a single instance', async () => {
			it( 'Model should implement "update"', () => {
				expect( testModel ).toImplementMethod( 'update' );
			} );
			it( 'Update found with value', async () => {
				const updated = await testModel.update( { foo: 'bar' }, { baz: 'qux' } );
				expect( updated ).toBeAnEntity( testModel, { foo: 'bar', baz: 'qux' }, SOURCE );
			} );
			it( 'Update found with undefined', async () => {
				const updated = await testModel.update( { foo: undefined }, { baz: 'qux' } );
				expect( updated ).toBeAnEntity(
					testModel,
					{ foo: undefined, baz: 'qux' },
					SOURCE
				);
			} );
			it( 'Update not found', async () => {
				const updated = await testModel.update( { foo: 'fum' }, { baz: 'qux' } );
				expect( updated ).toBeNull();
			} );
		} );
		describe( 'Update multiple instances', async () => {
			it( 'Model should implement "updateMany"', () => {
				expect( testModel ).toImplementMethod( 'updateMany' );
			} );
			it( 'Update found with value', async () => {
				const updated = await testModel.updateMany( { foo: 'bar' }, { baz: 'qux' } );
				expect( updated ).toBeAnEntitySet(
					testModel,
					{ foo: 'bar', baz: 'qux' },
					SOURCE
				);
				expect( updated ).toHaveLength( 2 );
			} );
			it( 'Update found with undefined', async () => {
				const updated = await testModel.updateMany(
					{ foo: undefined },
					{ baz: 'qux' }
				);
				expect( updated ).toBeAnEntitySet(
					testModel,
					{ foo: undefined, baz: 'qux' },
					SOURCE
				);
				expect( updated ).toHaveLength( 1 );
			} );
			it( 'Update not found', async () => {
				const updated = await testModel.updateMany( { foo: 'fum' }, { baz: 'qux' } );
				expect( updated ).toBeAnEntitySet( testModel, {} );
				expect( updated ).toHaveLength( 0 );
			} );
			it( 'Update all', async () => {
				const updated = await testModel.updateMany( {}, { baz: 'qux' } );
				expect( updated ).toBeAnEntitySet( testModel, {} );
				expect( updated ).toHaveLength( 4 );
			} );
		} );
	} );
	describe( '- Delete instances', () => {
		describe( 'Delete a single instance', () => {
			it( 'Model should implement "delete"', () => {
				expect( testModel ).toImplementMethod( 'delete' );
			} );
			it( 'Delete found with value', async () => {
				const found = await testModel.delete( { foo: 'bar' } );
				expect( found ).toBeUndefined();
				expect( store.items ).toHaveLength( 3 );
			} );
			it( 'Delete found with undefined', async () => {
				const found = await testModel.delete( { foo: undefined } );
				expect( found ).toBeUndefined();
				expect( store.items ).toHaveLength( 3 );
			} );
			it( 'Delete not found', async () => {
				const found = await testModel.delete( { foo: 'fum' } );
				expect( found ).toBeUndefined();
				expect( store.items ).toHaveLength( 4 );
			} );
		} );
		describe( 'Delete multiple instances', () => {
			it( 'Model should implement "deleteMany"', () => {
				expect( testModel ).toImplementMethod( 'deleteMany' );
			} );
			it( 'Delete found with value', async () => {
				const found = await testModel.deleteMany( { foo: 'bar' } );
				expect( found ).toBeUndefined();
				expect( store.items ).toHaveLength( 2 );
			} );
			it( 'Delete found with undefined', async () => {
				const found = await testModel.deleteMany( { foo: undefined } );
				expect( found ).toBeUndefined();
				expect( store.items ).toHaveLength( 3 );
			} );
			it( 'Delete not found', async () => {
				const found = await testModel.deleteMany( { foo: 'fum' } );
				expect( found ).toBeUndefined();
				expect( store.items ).toHaveLength( 4 );
			} );
			it( 'Delete all', async () => {
				const found = await testModel.deleteMany( {} );
				expect( found ).toBeUndefined();
				expect( store.items ).toHaveLength( 0 );
			} );
		} );
	} );
} );
