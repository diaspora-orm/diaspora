'use strict';

const LocalStorage = require('node-localstorage').LocalStorage;
const fs = require('fs');
const localStorageDir = '.localStorageTest';
try{
fs.unlinkSync(path.resolve(__dirname, '../../', localStorageDir));
} catch(e){
	console.log(e);
}
global.localStorage = new LocalStorage(localStorageDir);

const AdapterTestUtils = require('./utils');

AdapterTestUtils.checkSpawnedAdapter('localstorage', {}, 'LocalStorage');
AdapterTestUtils.checkRegisterAdapter('localstorage', 'localStorage');