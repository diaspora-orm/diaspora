class LocalStorageMock{
	private store = {};
	public setItem( key, val ){
		this.store[key] = val;
	}
	public getItem( key ){
		return this.store[key];
	}
	public removeItem( key ){ 
		delete this.store[key];
	}
	public clear(){
		this.store = {};
	}
  }

Object.defineProperty( global, 'localStorage', {
	value: new LocalStorageMock(),
} );
Object.defineProperty( global, 'sessionStorage', {
	value: new LocalStorageMock(),
} );

const ADAPTER_LABEL = 'webStorage';

import {
	createDataSource,
	checkSpawnedAdapter,
	checkEachStandardMethods,
	checkApplications,
} from './utils';
import { Diaspora } from '../../src';
import { WebStorageAdapter } from '../../src/adapters/webStorage';

createDataSource( ADAPTER_LABEL, {} );
checkSpawnedAdapter( ADAPTER_LABEL );
checkEachStandardMethods( ADAPTER_LABEL );
checkApplications( ADAPTER_LABEL );
describe( `${ADAPTER_LABEL} > Configuration`, () => {
	beforeEach( () => {
		delete ( Diaspora as any )._dataSources[ADAPTER_LABEL];
	} );
	it( 'Use local storage', async () => {
		const mockFn = jest.fn( localStorage.setItem );
		( global as any ).localStorage.setItem = mockFn;
		const adapter = await Diaspora.createNamedDataSource( ADAPTER_LABEL, ADAPTER_LABEL, {
			session: false,
		} ).waitReady();
		await adapter.insertOne( 'TEST', {} );
		expect( mockFn ).toHaveBeenCalled();
	} );
	it( 'Use session storage', async () => {
		const mockFn = jest.fn( sessionStorage.setItem );
		( global as any ).sessionStorage.setItem = mockFn;
		const adapter = await Diaspora.createNamedDataSource( ADAPTER_LABEL, ADAPTER_LABEL, {
			session: true,
		} ).waitReady();
		await adapter.insertOne( 'TEST', {} );
		expect( mockFn ).toHaveBeenCalled();
	} );
} );
describe( `${ADAPTER_LABEL} > Error recovery`, () => {
	beforeEach( () => { 
		localStorage.clear();
	} );
	it( 'Missing indexed items', async () => {
		delete ( Diaspora as any )._dataSources[ADAPTER_LABEL];
		
		const adapter = await Diaspora.createNamedDataSource( ADAPTER_LABEL, ADAPTER_LABEL ).waitReady();
		await adapter.insertMany( 'TEST', [{data: 42}, {data: 21}] );
		const indexTable = localStorage.getItem( 'TEST' );
		expect( typeof indexTable ).toBe( 'string' );
		const index = JSON.parse( indexTable ) as [string, string];
		expect( index ).toBeInstanceOf( Array );
		expect( index ).toHaveLength( 2 );
		localStorage.removeItem( ( WebStorageAdapter as any ).getItemName( 'TEST', index[0] ) );
		expect( await adapter.findOne( 'TEST', {data:{$equal: 42}} ) ).toBeUndefined();
	} );
} );
