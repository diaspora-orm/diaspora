import * as _ from 'lodash';
// tslint:disable-next-line:no-implicit-dependencies
import { XMLHttpRequest } from 'xmlhttprequest';

import { Adapter as _WebApiAdapter } from '../../../src/adapters/webApi/adapter';
import WebApiAdapter = _WebApiAdapter.WebApi.AWebApiAdapter;
import { Adapter as _BrowserWebApiAdapter } from '../../../src/adapters/webApi/subAdapters/browserAdapter';
import BrowserWebApiAdapter = _BrowserWebApiAdapter.WebApi.BrowserWebApiAdapter;

import { Diaspora } from '../../../src/diaspora';
import { getConfig } from '../utils';
import { createDataSource, checkSpawnedAdapter, checkEachStandardMethods, initMockApi } from './utils';
import { ELoggingLevel } from '../../../src/logger/logger';

const ADAPTER_LABEL = 'webApiBrowser';
const adapterConfig = getConfig( ADAPTER_LABEL ) as WebApiAdapter.IWebApiAdapterConfig ;

( global as any ).XMLHttpRequest = XMLHttpRequest;
let server;

const dal = createDataSource( ADAPTER_LABEL, adapterConfig );
const adapter = dal.adapter as BrowserWebApiAdapter;

beforeAll( async () => {
	Diaspora.logger.level = ELoggingLevel.Silent;
	const INMEMORY_TABLE = 'test-expressstoreLocal';
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
		const errPromise = ( adapter as any ).apiQuery( WebApiAdapter.EHttpVerb .GET, '400' );
		expect( errPromise ).rejects.toBeInstanceOf( Error );
		await errPromise.catch( error => {
			expect( error ).toHaveProperty( 'message' );
			expect( error.message ).toContain( 'Bad Request' );
			expect( error.message ).toContain( 'This is an error message' );
		} );
	} );
	it( '404', async () => {
		const errPromise = ( adapter as any ).apiQuery( WebApiAdapter.EHttpVerb .GET, '404' );
		expect( errPromise ).rejects.toBeInstanceOf( Error );
		await errPromise.catch( error => {
			expect( error ).toHaveProperty( 'message' );
			expect( error.message ).toContain( 'Not Found' );
			expect( error.message ).toContain( 'This is an error message' );
		} );
	} );
	it( '418 (unhandled)', async () => {
		const errPromise = ( adapter as any ).apiQuery( WebApiAdapter.EHttpVerb .GET, '418' );
		expect( errPromise ).rejects.toBeInstanceOf( Error );
		await errPromise.catch( error => {
			expect( error ).toHaveProperty( 'message' );
			expect( error.message ).toContain( '418' );
			expect( error.message ).toContain( 'This is an error message' );
		} );
	} );
	it( 'No message', async () => {
		const errPromise = ( adapter as any ).apiQuery( WebApiAdapter.EHttpVerb .GET, 'nomsg/418' );
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
