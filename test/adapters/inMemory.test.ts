import {
	createDataSource,
	checkSpawnedAdapter,
	checkEachStandardMethods,
	checkApplications,
} from './utils';

const ADAPTER_LABEL = 'inMemory';

createDataSource(ADAPTER_LABEL, {});
checkSpawnedAdapter(ADAPTER_LABEL);
checkEachStandardMethods(ADAPTER_LABEL);
checkApplications(ADAPTER_LABEL);
