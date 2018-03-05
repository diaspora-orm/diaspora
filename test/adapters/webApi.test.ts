import _ from 'lodash';

import { Diaspora } from '../../src/diaspora';
import { IWebApiAdapterConfig } from '../../src/adapters/webApi/adapter';
import { getConfig } from '../utils';

const ADAPTER_LABEL = 'webApi';
const adapterConfig = getConfig(ADAPTER_LABEL) as IWebApiAdapterConfig;

const AdapterTestUtils = require('./utils');

let server;

AdapterTestUtils.createDataSource(ADAPTER_LABEL, adapterConfig);

beforeAll(() => {
	const parseQs = _.partialRight(_.mapValues, JSON.parse);
	const express = require('express');
	const DiasporaServer = require('diaspora-server');
	const app = express();
	const ENDPOINT = '/api/test';
	const inMemoryAdapter = Diaspora.createDataSource('inMemory');
	const INMEMORY_TABLE = 'test-expressstore';
	inMemoryAdapter.name = 'foobar';
	app.use(ENDPOINT, require('body-parser')());
	app.use(`${ENDPOINT}s`, require('body-parser')());

	app.post(ENDPOINT, (req, res) => {
		const body = req.body;
		inMemoryAdapter.insertOne(INMEMORY_TABLE, body).then(entity => {
			if (!_.isNil(entity)) {
				entity.id = entity.idHash.foobar;
				delete entity.idHash;
			}
			return res.json(entity);
		});
	});
	app.post(`${ENDPOINT}s`, (req, res) => {
		const body = req.body;
		inMemoryAdapter.insertMany(INMEMORY_TABLE, body).then(entities => {
			if (!_.isEmpty(entities)) {
				entities = _.map(entities, entity => {
					entity.id = entity.idHash.foobar;
					delete entity.idHash;
					return entity;
				});
			}
			return res.json(entities);
		});
	});

	app.get(ENDPOINT, (req, res) => {
		const query = parseQs(req.query);
		inMemoryAdapter
			.findOne(INMEMORY_TABLE, query.where, _.omit(query, ['where']))
			.then(entity => {
				if (!_.isNil(entity)) {
					entity.id = entity.idHash.foobar;
					delete entity.idHash;
				}
				return res.json(entity);
			});
	});
	app.get(`${ENDPOINT}s`, (req, res) => {
		const query = parseQs(req.query);
		inMemoryAdapter
			.findMany(INMEMORY_TABLE, query.where, _.omit(query, ['where']))
			.then(entities => {
				if (!_.isEmpty(entities)) {
					entities = _.map(entities, entity => {
						entity.id = entity.idHash.foobar;
						delete entity.idHash;
						return entity;
					});
				}
				return res.json(entities);
			});
	});

	app.patch(ENDPOINT, (req, res) => {
		const body = req.body;
		const query = parseQs(req.query);
		inMemoryAdapter
			.updateOne(INMEMORY_TABLE, query.where, body, _.omit(query, ['where']))
			.then(entity => {
				if (!_.isNil(entity)) {
					entity.id = entity.idHash.foobar;
					delete entity.idHash;
				}
				return res.json(entity);
			});
	});
	app.patch(`${ENDPOINT}s`, (req, res) => {
		const body = req.body;
		const query = parseQs(req.query);
		inMemoryAdapter
			.updateMany(INMEMORY_TABLE, query.where, body, _.omit(query, ['where']))
			.then(entities => {
				if (!_.isEmpty(entities)) {
					entities = _.map(entities, entity => {
						entity.id = entity.idHash.foobar;
						delete entity.idHash;
						return entity;
					});
				}
				return res.json(entities);
			});
	});

	app.delete(ENDPOINT, (req, res) => {
		const query = parseQs(req.query);
		inMemoryAdapter
			.deleteOne(INMEMORY_TABLE, query.where, _.omit(query, ['where']))
			.then(() => {
				return res.json();
			});
	});
	app.delete(`${ENDPOINT}s`, (req, res) => {
		const query = parseQs(req.query);
		inMemoryAdapter
			.deleteMany(INMEMORY_TABLE, query.where, _.omit(query, ['where']))
			.then(() => {
				return res.json();
			});
	});

	// console.log(require('util').inspect(req, {colors: true}));
	return new Promise((resolve, reject) => {
		server = app.listen(adapterConfig.port, () => {
			console.log(`Example app listening on port ${adapterConfig.port}!`);
			return resolve();
		});
	});
});

AdapterTestUtils.checkSpawnedAdapter(ADAPTER_LABEL);
AdapterTestUtils.checkEachStandardMethods(ADAPTER_LABEL);
//AdapterTestUtils.checkApplications( ADAPTER_LABEL );
AdapterTestUtils.checkRegisterAdapter(ADAPTER_LABEL);

after(() => {
	if (server) {
		return new Promise((resolve, reject) => {
			server.close(() => {
				console.log('Example app closed');
				return resolve();
			});
		});
	}
});
