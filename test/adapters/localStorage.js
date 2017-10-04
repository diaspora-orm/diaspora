'use strict';

/* globals l: false, c: false, it: false, describe: false, require: false, expect: false, Diaspora: false, chalk: false */

(() => {
	const ADAPTER_LABEL = 'localstorage';
	const adapterConfig = getConfig( ADAPTER_LABEL );

	if ( 'undefined' === typeof window ) {
		if ( !adapterConfig.data_dir ) {
			it( 'LocalStorage adapter unconfigured', function() {
				this.skip();
			});
		}

		const LocalStorage = require( 'node-localstorage' ).LocalStorage;
		const fs = require( 'fs' );
		const localStorageDir = adapterConfig.data_dir;
		global.localStorage = new LocalStorage( localStorageDir );
		localStorage.clear();
	} else {
		localStorage.clear();
		sessionStorage.clear();
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
})();
