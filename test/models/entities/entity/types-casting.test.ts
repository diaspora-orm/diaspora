import { createMockModel } from '../../utils';
import { InMemoryAdapter } from '../../../../src/adapters/inMemory';
import { EFieldType } from '../../../../src';

const ADAPTER_TABLE = 'entity-types-casting';
const { model, MODEL_NAME, SOURCE, adapter, dal } = createMockModel( ADAPTER_TABLE, {
	foo: {
		type: EFieldType.DATETIME,
	},
} );
const store = ( ( adapter as any ).store as InMemoryAdapter.IDataStoreHash );

describe( 'DateTime', () => {
	beforeAll( async() => {
		model.insert( {foo:'123'} );
	} );
	
	it( 'From string', async () => {
		// Retrieve item
		const storeItems = store[ADAPTER_TABLE + '-test'].items;
		expect( storeItems ).toBeArrayOfSize( 1 );
		// Check the itegrity of the item
		const storeItem = storeItems[0];
		expect( storeItem ).toHaveProperty( 'foo' );
		expect( storeItem ).toHaveProperty( 'id' );
		expect( storeItem ).toHaveProperty( 'idHash' );

		// Modify its property
		const sampleDate = new Date();
		storeItem.foo = sampleDate.toISOString();
		// Retrieve it
		const retrievedEntity = await model.find( storeItem.id );
		expect( retrievedEntity.attributes.foo ).toBeInstanceOf( Date );
		expect( retrievedEntity.attributes.foo ).toEqual( sampleDate );
	} );
	
	it( 'From number', async () => {
		// Retrieve item
		const storeItems = store[ADAPTER_TABLE + '-test'].items;
		expect( storeItems ).toBeArrayOfSize( 1 );
		// Check the itegrity of the item
		const storeItem = storeItems[0];
		expect( storeItem ).toHaveProperty( 'foo' );
		expect( storeItem ).toHaveProperty( 'id' );
		expect( storeItem ).toHaveProperty( 'idHash' );

		// Modify its property
		const sampleDate = new Date();
		storeItem.foo = sampleDate.getTime();
		// Retrieve it
		const retrievedEntity = await model.find( storeItem.id );
		expect( retrievedEntity.attributes.foo ).toBeInstanceOf( Date );
		expect( retrievedEntity.attributes.foo ).toEqual( sampleDate );
	} );
	
	it( 'From date', async () => {
		// Retrieve item
		const storeItems = store[ADAPTER_TABLE + '-test'].items;
		expect( storeItems ).toBeArrayOfSize( 1 );
		// Check the itegrity of the item
		const storeItem = storeItems[0];
		expect( storeItem ).toHaveProperty( 'foo' );
		expect( storeItem ).toHaveProperty( 'id' );
		expect( storeItem ).toHaveProperty( 'idHash' );

		// Modify its property
		const sampleDate = new Date();
		storeItem.foo = sampleDate;
		// Retrieve it
		const retrievedEntity = await model.find( storeItem.id );
		expect( retrievedEntity.attributes.foo ).toBeInstanceOf( Date );
		expect( retrievedEntity.attributes.foo ).toEqual( sampleDate );
	} );
	
	it( 'Error', async () => {
		// Retrieve item
		const storeItems = store[ADAPTER_TABLE + '-test'].items;
		expect( storeItems ).toBeArrayOfSize( 1 );
		// Check the itegrity of the item
		const storeItem = storeItems[0];
		expect( storeItem ).toHaveProperty( 'foo' );
		expect( storeItem ).toHaveProperty( 'id' );
		expect( storeItem ).toHaveProperty( 'idHash' );

		// Modify its property
		const sampleDate = new Date();
		storeItem.foo = /foo/;
		// Retrieve it
		const retrievedEntity = await model.find( storeItem.id );
		expect( retrievedEntity.attributes.foo ).toBeUndefined();
	} );
} );
