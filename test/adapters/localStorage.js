'use strict';

const LocalStorage = require('node-localstorage').LocalStorage;
const fs = require('fs');
const localStorageDir = '.localStorageTest';
try{
	const dataDir = path.resolve(__dirname, '../../', localStorageDir);
	/**
	 * @see https://stackoverflow.com/a/32197381/4839162
	 */
	const deleteFolderRecursive = path => {
		if (fs.existsSync(path)) {
			fs.readdirSync(path).forEach(function(file, index){
				const curPath = path + "/" + file;
				
				if (fs.lstatSync(curPath).isDirectory()) {
					// recurse
					deleteFolderRecursive(curPath);
				} else { 
					// delete file
					fs.unlinkSync(curPath);
				}
			});
			fs.rmdirSync(path);
		}
	};
	deleteFolderRecursive(dataDir);
} catch(e){
	console.log(e);
}
global.localStorage = new LocalStorage(localStorageDir);

const AdapterTestUtils = require('./utils');

const ADAPTER_LABEL = 'localstorage';
AdapterTestUtils.createDataSource(ADAPTER_LABEL, {});
AdapterTestUtils.checkSpawnedAdapter(ADAPTER_LABEL, 'LocalStorage');
AdapterTestUtils.checkEachStandardMethods(ADAPTER_LABEL);
AdapterTestUtils.checkRegisterAdapter(ADAPTER_LABEL, 'localStorage');
/*
AdapterTestUtils.createDataSource(ADAPTER_LABEL, {session: true});
AdapterTestUtils.checkSpawnedAdapter(ADAPTER_LABEL, 'SessionStorage');
AdapterTestUtils.checkEachStandardMethods(ADAPTER_LABEL);
AdapterTestUtils.checkRegisterAdapter(ADAPTER_LABEL, 'sessionStorage');
*/