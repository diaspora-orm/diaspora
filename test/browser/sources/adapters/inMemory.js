'use strict';

(function () {
	var AdapterTestUtils = require('./utils');
	var ADAPTER_LABEL = 'in-memory';

	AdapterTestUtils.createDataSource(ADAPTER_LABEL, {});
	AdapterTestUtils.checkSpawnedAdapter(ADAPTER_LABEL, 'InMemory');
	AdapterTestUtils.checkEachStandardMethods(ADAPTER_LABEL);
	AdapterTestUtils.checkApplications(ADAPTER_LABEL);
	AdapterTestUtils.checkRegisterAdapter(ADAPTER_LABEL, 'inMemory');
})();
