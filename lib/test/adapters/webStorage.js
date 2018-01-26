'use strict';
/* globals it: false, require: false, getConfig: false */
const ADAPTER_LABEL = 'webStorage';
const adapterConfig = getConfig(ADAPTER_LABEL);
localStorage.clear();
sessionStorage.clear();
var AdapterTestUtils = require('./utils');
AdapterTestUtils.createDataSource(ADAPTER_LABEL, {});
AdapterTestUtils.checkSpawnedAdapter(ADAPTER_LABEL);
AdapterTestUtils.checkEachStandardMethods(ADAPTER_LABEL);
AdapterTestUtils.checkApplications(ADAPTER_LABEL);
AdapterTestUtils.checkRegisterAdapter(ADAPTER_LABEL);
if ('undefined' !== typeof window) {
    AdapterTestUtils.createDataSource(ADAPTER_LABEL, { session: true });
    AdapterTestUtils.checkSpawnedAdapter(ADAPTER_LABEL);
    AdapterTestUtils.checkEachStandardMethods(ADAPTER_LABEL);
    AdapterTestUtils.checkApplications(ADAPTER_LABEL);
    AdapterTestUtils.checkRegisterAdapter(ADAPTER_LABEL);
}
//# sourceMappingURL=webStorage.js.map