'use strict';

const AdapterTestUtils = require('./utils');

const ADAPTER_LABEL = 'mongo';
const dataSource = AdapterTestUtils.createDataSource(ADAPTER_LABEL, {
	database: 'diaspora_test',
	appname: 'DiasporaTest',
	username: 'admin',
});
it('Wait for purge of mongodb collection', () => {
	dataSource.waitReady().then(() => {
		const collection = dataSource.db.collection('test');
		return collection.drop();
	});
});
AdapterTestUtils.checkSpawnedAdapter(ADAPTER_LABEL, 'Mongo');
AdapterTestUtils.checkEachStandardMethods(ADAPTER_LABEL);
AdapterTestUtils.checkRegisterAdapter(ADAPTER_LABEL, 'mongo');