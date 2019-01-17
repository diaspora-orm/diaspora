import { Adapter as _WebApiAdapter } from '../../../src/adapters/webApi/adapter';
import WebApiAdapter = _WebApiAdapter.WebApi.AWebApiAdapter;
import { Adapter as _NodeWebApiAdapter } from '../../../src/adapters/webApi/subAdapters/nodeAdapter';
import NodeWebApiAdapter = _NodeWebApiAdapter.WebApi.NodeWebApiAdapter;

import { Diaspora } from '../../../src/diaspora';
import { getConfig } from '../utils';
import { createDataSource, checkSpawnedAdapter, checkEachStandardMethods, initMockApi } from './utils';
import { ELoggingLevel } from '../../../src/logger/logger';
import { EHttpVerb } from '../../../src/adapters/webApi/types';

const ADAPTER_LABEL = 'webApiNode';
const adapterConfig = getConfig( ADAPTER_LABEL ) as WebApiAdapter.IWebApiAdapterConfig ;

let server;

const dal = createDataSource( ADAPTER_LABEL, adapterConfig );
const adapter = dal.adapter as NodeWebApiAdapter;

beforeAll( async () => {
	Diaspora.logger.level = ELoggingLevel.Silent;
	const INMEMORY_TABLE = 'test-expressstoreNode';
	const inMemoryAdapter = await Diaspora.createNamedDataSource(
		INMEMORY_TABLE,
		'inMemory',
		adapterConfig
	).waitReady();
	const ENDPOINT = '/api/test';
	server = await initMockApi( inMemoryAdapter, adapterConfig.port as any, ENDPOINT, INMEMORY_TABLE );
} );

checkSpawnedAdapter( ADAPTER_LABEL );
checkEachStandardMethods( ADAPTER_LABEL );
describe( 'Test error codes', async () => {
	it( '400', async () => {
		const errPromise = ( adapter as any ).apiQuery( EHttpVerb .GET, '400' );
		expect( errPromise ).rejects.toBeInstanceOf( Error );
		await errPromise.catch( error => {
			expect( error ).toHaveProperty( 'message' );
			expect( error.message ).toContain( 'Bad Request' );
			expect( error.message ).toContain( 'This is an error message' );
		} );
	} );
	it( '404', async () => {
		const errPromise = ( adapter as any ).apiQuery( EHttpVerb .GET, '404' );
		expect( errPromise ).rejects.toBeInstanceOf( Error );
		await errPromise.catch( error => {
			expect( error ).toHaveProperty( 'message' );
			expect( error.message ).toContain( 'Not Found' );
			expect( error.message ).toContain( 'This is an error message' );
		} );
	} );
	it( '418 (unhandled)', async () => {
		const errPromise = ( adapter as any ).apiQuery( EHttpVerb .GET, '418' );
		expect( errPromise ).rejects.toBeInstanceOf( Error );
		await errPromise.catch( error => {
			expect( error ).toHaveProperty( 'message' );
			expect( error.message ).toContain( '418' );
			expect( error.message ).toContain( 'This is an error message' );
		} );
	} );
	it( 'No message', async () => {
		const errPromise = ( adapter as any ).apiQuery( EHttpVerb .GET, 'nomsg/418' );
		expect( errPromise ).rejects.toBeInstanceOf( Error );
		await errPromise.catch( error => {
			expect( error ).toHaveProperty( 'message' );
			expect( error.message ).toContain( '418' );
			expect( error.message ).toContain( 'NULL' );
		} );
	} );
} );


afterAll( () => {
	if ( server ) {
		return new Promise( ( resolve, reject ) => {
			server.close( () => {
				Diaspora.logger.level = ELoggingLevel.Silly;
				return resolve();
			} );
		} );
	}
} );
