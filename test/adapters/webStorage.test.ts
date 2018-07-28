import {clone} from 'lodash';
import { getConfig } from '../utils';
import { LocalStorage } from 'node-localstorage';

( global as any ).localStorage = clone( new LocalStorage( './.localstorage' ) );
( global as any ).sessionStorage = clone( new LocalStorage( './.sessionstorage' ) );

const ADAPTER_LABEL = 'webStorage';

localStorage.clear();
sessionStorage.clear();

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
	it( 'Use local storage', async () => {
		delete ( Diaspora as any )._dataSources[ADAPTER_LABEL];
		const mockFn = jest.fn();
		const oldFn = ( global as any ).localStorage.setItem;
		( global as any ).localStorage.setItem = mockFn;
		const adapter = await Diaspora.createNamedDataSource( ADAPTER_LABEL, ADAPTER_LABEL, {
			session: false,
		} ).waitReady();
		await adapter.insertOne( 'TEST', {} );
		expect( mockFn ).toHaveBeenCalled();
		( global as any ).localStorage.setItem = oldFn;
	} );
	it( 'Use session storage', async () => {
		delete ( Diaspora as any )._dataSources[ADAPTER_LABEL];
		const mockFn = jest.fn();
		const oldFn = ( global as any ).sessionStorage.setItem;
		( global as any ).sessionStorage.setItem = mockFn;
		const adapter = await Diaspora.createNamedDataSource( ADAPTER_LABEL, ADAPTER_LABEL, {
			session: true,
		} ).waitReady();
		await adapter.insertOne( 'TEST', {} );
		expect( mockFn ).toHaveBeenCalled();
		( global as any ).sessionStorage.setItem = oldFn;
	} );
} );
describe( `${ADAPTER_LABEL} > Error recovery`, () => {
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
