'use strict';
const AdapterTestUtils = require('./utils');
const ADAPTER_LABEL = 'inMemory';
AdapterTestUtils.createDataSource(ADAPTER_LABEL, {});
AdapterTestUtils.checkSpawnedAdapter(ADAPTER_LABEL);
AdapterTestUtils.checkEachStandardMethods(ADAPTER_LABEL);
AdapterTestUtils.checkApplications(ADAPTER_LABEL);
AdapterTestUtils.checkRegisterAdapter(ADAPTER_LABEL);
//# sourceMappingURL=inMemory.js.map