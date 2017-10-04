'use strict';

(function () {
	var ADAPTER_LABEL = 'localstorage';
	var adapterConfig = getConfig(ADAPTER_LABEL);

	if ('undefined' === typeof window) {
		if (!adapterConfig.data_dir) {
			it('LocalStorage adapter unconfigured', function () {
				this.skip();
			});
		}

		var LocalStorage = require('node-localstorage').LocalStorage;
		var fs = require('fs');
		var localStorageDir = adapterConfig.data_dir;
		global.localStorage = new LocalStorage(localStorageDir);
		localStorage.clear();
	} else {
		localStorage.clear();
		sessionStorage.clear();
	}

	var AdapterTestUtils = require('./utils');

	AdapterTestUtils.createDataSource(ADAPTER_LABEL, {}, 'localStorage');
	AdapterTestUtils.checkSpawnedAdapter(ADAPTER_LABEL, 'LocalStorage', 'localStorage');
	AdapterTestUtils.checkEachStandardMethods(ADAPTER_LABEL, 'localStorage');
	AdapterTestUtils.checkApplications(ADAPTER_LABEL, 'localStorage');
	AdapterTestUtils.checkRegisterAdapter(ADAPTER_LABEL, 'localStorage', 'localStorage');
	if ('undefined' !== typeof window) {
		AdapterTestUtils.createDataSource(ADAPTER_LABEL, {
			session: true
		}, 'sessionStorage');
		AdapterTestUtils.checkSpawnedAdapter(ADAPTER_LABEL, 'SessionStorage', 'sessionStorage');
		AdapterTestUtils.checkEachStandardMethods(ADAPTER_LABEL, 'sessionStorage');
		AdapterTestUtils.checkApplications(ADAPTER_LABEL, 'sessionStorage');
		AdapterTestUtils.checkRegisterAdapter(ADAPTER_LABEL, 'sessionStorage', 'sessionStorage');
	}
})();
