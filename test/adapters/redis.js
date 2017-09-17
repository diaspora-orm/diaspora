'use strict';

const AdapterTestUtils = require('./utils');

const ADAPTER_LABEL = 'redis';
const adapterConfig = getConfig(ADAPTER_LABEL);
if(!adapterConfig.database){
	return it('Redis adapter unconfigured', function(){
		this.skip();
	});
}
const dataSource = AdapterTestUtils.createDataSource(ADAPTER_LABEL, adapterConfig);
it('Wait for purge of redis database', () => {
	return dataSource.waitReady().then(dataSource.client.flushdbAsync.call(dataSource.client));
});
AdapterTestUtils.checkSpawnedAdapter(ADAPTER_LABEL, 'Redis');
AdapterTestUtils.checkEachStandardMethods(ADAPTER_LABEL);
AdapterTestUtils.checkRegisterAdapter(ADAPTER_LABEL, 'redis');