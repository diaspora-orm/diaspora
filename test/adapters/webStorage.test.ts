import { getConfig } from '../utils';
import { LocalStorage } from 'node-localstorage';
import Diaspora from '../../src/diaspora';
import { WebStorageAdapter } from '../../src/adapters/webStorage';

( global as any ).localStorage = new LocalStorage( './.localstorage' );
Diaspora.registerAdapter( 'webStorage', WebStorageAdapter );

const ADAPTER_LABEL = 'webStorage';
const adapterConfig = getConfig( ADAPTER_LABEL );

localStorage.clear();

import {
	createDataSource,
	checkSpawnedAdapter,
	checkEachStandardMethods,
	checkApplications,
} from './utils';

createDataSource( ADAPTER_LABEL, {} );
checkSpawnedAdapter( ADAPTER_LABEL );
checkEachStandardMethods( ADAPTER_LABEL );
checkApplications( ADAPTER_LABEL );
