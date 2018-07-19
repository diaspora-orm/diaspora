import * as _ from 'lodash';
import express from 'express';
import {json, urlencoded} from 'body-parser';

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
import { NodeWebApiAdapter } from '../../src/adapters/webApi/subAdapters/nodeAdapter';
import { ELoggingLevel } from '../../src/logger/logger';

const ADAPTER_LABEL = 'webApiNode';
const adapterConfig = getConfig( ADAPTER_LABEL ) as IWebApiAdapterConfig;

let server;

Diaspora.registerAdapter( ADAPTER_LABEL, NodeWebApiAdapter );
createDataSource( ADAPTER_LABEL, adapterConfig );

beforeAll( async () => {
	Diaspora.logger.level = ELoggingLevel.Silent;
	const INMEMORY_TABLE = 'test-expressstoreNode';
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
