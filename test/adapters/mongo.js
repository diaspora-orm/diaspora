'use strict';

const AdapterTestUtils = require('./utils');

const ADAPTER_LABEL = 'mongo';
const adapterConfig = getConfig(ADAPTER_LABEL);
if(!adapterConfig.database){
	return it('MongoDB adapter unconfigured', function(){
		this.skip();
	});
}

const dataSource = AdapterTestUtils.createDataSource(ADAPTER_LABEL, l.assign({ appname: 'DiasporaTest' }, adapterConfig));
it('Wait for purge of mongodb collection', () => {
	return dataSource.waitReady().then(() => {
		const collection = dataSource.db.collection('test');
		return collection.drop();
	}).catch(e => console.error(e));
});
AdapterTestUtils.checkSpawnedAdapter(ADAPTER_LABEL, 'Mongo');
AdapterTestUtils.checkEachStandardMethods(ADAPTER_LABEL);
AdapterTestUtils.checkRegisterAdapter(ADAPTER_LABEL, 'mongo');