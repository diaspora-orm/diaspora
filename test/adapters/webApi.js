'use strict';

/* globals it: false, require: false, getConfig: false */

const ADAPTER_LABEL = 'webApi';
const PORT = 12345;
const adapterConfig = getConfig( ADAPTER_LABEL );

var AdapterTestUtils = require( './utils' );

AdapterTestUtils.createDataSource( ADAPTER_LABEL, {
	host:'localhost',
	port: PORT,
	protocol: 'http',
	baseUrl: '/api',
} );
if(!process.browser){
	const parseQs = l.partialRight(l.mapValues, JSON.parse);
	const express = require('express');
	const DiasporaServer = require('diaspora-server');
	const app = express();
	const ENDPOINT = '/api/test';
	const inMemoryAdapter = Diaspora.createDataSource('inMemory');
	const INMEMORY_TABLE = 'test-expressstore';
	inMemoryAdapter.name = 'foobar';
	app.use(ENDPOINT, require('body-parser')());
	app.use(ENDPOINT + 's', require('body-parser')());

	app.put(ENDPOINT, (req, res) => {
		const body = req.body;
		inMemoryAdapter.insertOne(INMEMORY_TABLE, body).then(entity => {
			if(!l.isNil(entity)){
				entity.id = entity.idHash.foobar;
				delete entity.idHash;
			}
			return res.json(entity);
		});
	});
	app.put(ENDPOINT + 's', (req, res) => {
		const body = req.body;
		inMemoryAdapter.insertMany(INMEMORY_TABLE, body).then(entities => {
			if(!l.isEmpty(entities)){
				entities = l.map(entities, entity => {
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
		inMemoryAdapter.findOne(INMEMORY_TABLE, query.where, l.omit(query, ['where'])).then(entity => {
			if(!l.isNil(entity)){
				entity.id = entity.idHash.foobar;
				delete entity.idHash;
			}
			return res.json(entity);
		});
	});
	app.get(ENDPOINT + 's', (req, res) => {
		const query = parseQs(req.query);
		inMemoryAdapter.findMany(INMEMORY_TABLE, query.where, l.omit(query, ['where'])).then(entities => {
			if(!l.isEmpty(entities)){
				entities = l.map(entities, entity => {
					entity.id = entity.idHash.foobar;
					delete entity.idHash;
					return entity;
				});
			}
			return res.json(entities);
		});
	});

	app.post(ENDPOINT, (req, res) => {
		const body = req.body;
		const query = parseQs(req.query);
		inMemoryAdapter.updateOne(INMEMORY_TABLE, query.where, body, l.omit(query, ['where'])).then(entity => {
			if(!l.isNil(entity)){
				entity.id = entity.idHash.foobar;
				delete entity.idHash;
			}
			return res.json(entity);
		});
	});
	app.post(ENDPOINT + 's', (req, res) => {
		const body = req.body;
		const query = parseQs(req.query);
		inMemoryAdapter.updateMany(INMEMORY_TABLE, query.where, body, l.omit(query, ['where'])).then(entities => {
			if(!l.isEmpty(entities)){
				entities = l.map(entities, entity => {
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
		inMemoryAdapter.deleteOne(INMEMORY_TABLE, query.where, l.omit(query, ['where'])).then(() => {
			return res.json();
		});
	});
	app.delete(ENDPOINT + 's', (req, res) => {
		const query = parseQs(req.query);
		inMemoryAdapter.deleteMany(INMEMORY_TABLE, query.where, l.omit(query, ['where'])).then(() => {
			return res.json();
		});
	});
	
	// console.log(require('util').inspect(req, {colors: true}));
	const server = app.listen( PORT, () => {
		console.log( `Example app listening on port ${ PORT }!` );
	});
}
AdapterTestUtils.checkSpawnedAdapter( ADAPTER_LABEL );
AdapterTestUtils.checkEachStandardMethods( ADAPTER_LABEL );
//AdapterTestUtils.checkApplications( ADAPTER_LABEL );
AdapterTestUtils.checkRegisterAdapter( ADAPTER_LABEL );