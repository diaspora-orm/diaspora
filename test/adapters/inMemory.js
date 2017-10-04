'use strict';

/* globals l: false, c: false, it: false, describe: false, require: false, expect: false, Diaspora: false, chalk: false */

(() => {
	const AdapterTestUtils = require( './utils' );
	const ADAPTER_LABEL = 'in-memory';

	AdapterTestUtils.createDataSource( ADAPTER_LABEL, {});
	AdapterTestUtils.checkSpawnedAdapter( ADAPTER_LABEL, 'InMemory' );
	AdapterTestUtils.checkEachStandardMethods( ADAPTER_LABEL );
	AdapterTestUtils.checkApplications( ADAPTER_LABEL );
	AdapterTestUtils.checkRegisterAdapter( ADAPTER_LABEL, 'inMemory' );
})();
