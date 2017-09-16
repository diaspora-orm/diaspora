'use strict';

const AdapterTestUtils = require('./utils');

AdapterTestUtils.checkSpawnedAdapter('in-memory', {}, 'InMemory');
AdapterTestUtils.checkRegisterAdapter('in-memory', 'inMemory');