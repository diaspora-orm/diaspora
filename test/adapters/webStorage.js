'use strict';

/* globals it: false, require: false, getConfig: false */

const ADAPTER_LABEL = 'webStorage';
const adapterConfig = getConfig( ADAPTER_LABEL );

if ( 'undefined' === typeof window ) {
	if ( !adapterConfig.data_dir ) {
		it( 'LocalStorage adapter unconfigured', function unconfiguredAdapter() {
			this.skip();
		});
	}

	const LocalStorage = require( 'node-localstorage' ).LocalStorage;
	const localStorageDir = adapterConfig.data_dir;
	global.localStorage = new LocalStorage( localStorageDir );
	global.localStorage.clear();
} else {
	global.localStorage.clear();
	global.sessionStorage.clear();
}

var AdapterTestUtils = require( './utils' );

AdapterTestUtils.createDataSource( ADAPTER_LABEL, {}, 'localStorage' );
AdapterTestUtils.checkSpawnedAdapter( ADAPTER_LABEL, 'LocalStorage', 'localStorage' );
AdapterTestUtils.checkEachStandardMethods( ADAPTER_LABEL, 'localStorage' );
AdapterTestUtils.checkApplications( ADAPTER_LABEL, 'localStorage' );
AdapterTestUtils.checkRegisterAdapter( ADAPTER_LABEL, 'localStorage', 'localStorage' );
if ( 'undefined' !== typeof window ) {
	AdapterTestUtils.createDataSource( ADAPTER_LABEL, {
		session: true,
	}, 'sessionStorage' );
	AdapterTestUtils.checkSpawnedAdapter( ADAPTER_LABEL, 'SessionStorage', 'sessionStorage' );
	AdapterTestUtils.checkEachStandardMethods( ADAPTER_LABEL, 'sessionStorage' );
	AdapterTestUtils.checkApplications( ADAPTER_LABEL, 'sessionStorage' );
	AdapterTestUtils.checkRegisterAdapter( ADAPTER_LABEL, 'sessionStorage', 'sessionStorage' );
}
