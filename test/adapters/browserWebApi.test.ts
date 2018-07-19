import * as _ from 'lodash';
import { XMLHttpRequest } from 'xmlhttprequest';

import { Diaspora } from '../../src/diaspora';
import { IWebApiAdapterConfig } from '../../src/adapters/webApi/adapter';
import { getConfig } from '../utils';
import {
	createDataSource,
	checkSpawnedAdapter,
	checkEachStandardMethods,
	initMockApi,
} from './utils';
import { AdapterEntity, Adapter } from '../../src/adapters/base';
import { QueryLanguage } from '../../src/types/queryLanguage';
import { BrowserWebApiAdapter } from '../../src/adapters/webApi/subAdapters/browserAdapter';
import { ELoggingLevel } from '../../src/logger/logger';

const ADAPTER_LABEL = 'webApiBrowser';
const adapterConfig = getConfig( ADAPTER_LABEL ) as IWebApiAdapterConfig;

( global as any ).XMLHttpRequest = XMLHttpRequest;
let server;

Diaspora.registerAdapter( ADAPTER_LABEL, BrowserWebApiAdapter );
createDataSource( ADAPTER_LABEL, adapterConfig );

beforeAll( async () => {
	Diaspora.logger.level = ELoggingLevel.Silent;
	const INMEMORY_TABLE = 'test-expressstoreLocal';
	const inMemoryAdapter = await Diaspora.createDataSource(
		'inMemory',
		INMEMORY_TABLE,
		adapterConfig
	).waitReady();
	const ENDPOINT = '/api/test';
	server = await initMockApi( inMemoryAdapter, adapterConfig.port as any, ENDPOINT, INMEMORY_TABLE );
} );

checkSpawnedAdapter( ADAPTER_LABEL );
checkEachStandardMethods( ADAPTER_LABEL );

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
