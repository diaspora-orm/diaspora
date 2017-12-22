'use strict';

/* globals require: false, getConfig: false */

const ADAPTER_LABEL = 'webApi';
const adapterConfig = getConfig( ADAPTER_LABEL );

const AdapterTestUtils = require( './utils' );

let server;

AdapterTestUtils.createDataSource( ADAPTER_LABEL, adapterConfig );

before(() => {
	if ( !process.browser ) {
		const parseQs = l.partialRight( l.mapValues, JSON.parse );
		const express = require( 'express' );
		const DiasporaServer = require( 'diaspora-server' );
		const app = express();
		const ENDPOINT = '/api/test';
		const inMemoryAdapter = Diaspora.createDataSource( 'inMemory' );
		const INMEMORY_TABLE = 'test-expressstore';
		inMemoryAdapter.name = 'foobar';
		app.use( ENDPOINT, require( 'body-parser' )());
		app.use( `${ ENDPOINT  }s`, require( 'body-parser' )());

		app.post( ENDPOINT, ( req, res ) => {
			const body = req.body;
			inMemoryAdapter.insertOne( INMEMORY_TABLE, body ).then( entity => {
				if ( !l.isNil( entity )) {
					entity.id = entity.idHash.foobar;
					delete entity.idHash;
				}
				return res.json( entity );
			});
		});
		app.post( `${ ENDPOINT  }s`, ( req, res ) => {
			const body = req.body;
			inMemoryAdapter.insertMany( INMEMORY_TABLE, body ).then( entities => {
				if ( !l.isEmpty( entities )) {
					entities = l.map( entities, entity => {
						entity.id = entity.idHash.foobar;
						delete entity.idHash;
						return entity;
					});
				}
				return res.json( entities );
			});
		});

		app.get( ENDPOINT, ( req, res ) => {
			const query = parseQs( req.query );
			inMemoryAdapter.findOne( INMEMORY_TABLE, query.where, l.omit( query, [ 'where' ])).then( entity => {
				if ( !l.isNil( entity )) {
					entity.id = entity.idHash.foobar;
					delete entity.idHash;
				}
				return res.json( entity );
			});
		});
		app.get( `${ ENDPOINT  }s`, ( req, res ) => {
			const query = parseQs( req.query );
			inMemoryAdapter.findMany( INMEMORY_TABLE, query.where, l.omit( query, [ 'where' ])).then( entities => {
				if ( !l.isEmpty( entities )) {
					entities = l.map( entities, entity => {
						entity.id = entity.idHash.foobar;
						delete entity.idHash;
						return entity;
					});
				}
				return res.json( entities );
			});
		});

		app.patch( ENDPOINT, ( req, res ) => {
			const body = req.body;
			const query = parseQs( req.query );
			inMemoryAdapter.updateOne( INMEMORY_TABLE, query.where, body, l.omit( query, [ 'where' ])).then( entity => {
				if ( !l.isNil( entity )) {
					entity.id = entity.idHash.foobar;
					delete entity.idHash;
				}
				return res.json( entity );
			});
		});
		app.patch( `${ ENDPOINT  }s`, ( req, res ) => {
			const body = req.body;
			const query = parseQs( req.query );
			inMemoryAdapter.updateMany( INMEMORY_TABLE, query.where, body, l.omit( query, [ 'where' ])).then( entities => {
				if ( !l.isEmpty( entities )) {
					entities = l.map( entities, entity => {
						entity.id = entity.idHash.foobar;
						delete entity.idHash;
						return entity;
					});
				}
				return res.json( entities );
			});
		});

		app.delete( ENDPOINT, ( req, res ) => {
			const query = parseQs( req.query );
			inMemoryAdapter.deleteOne( INMEMORY_TABLE, query.where, l.omit( query, [ 'where' ])).then(() => {
				return res.json();
			});
		});
		app.delete( `${ ENDPOINT  }s`, ( req, res ) => {
			const query = parseQs( req.query );
			inMemoryAdapter.deleteMany( INMEMORY_TABLE, query.where, l.omit( query, [ 'where' ])).then(() => {
				return res.json();
			});
		});

		// console.log(require('util').inspect(req, {colors: true}));
		return new Promise(( resolve, reject ) => {
			server = app.listen( adapterConfig.port, () => {
				console.log( `Example app listening on port ${ adapterConfig.port }!` );
				return resolve();
			});
		});
	}
});

AdapterTestUtils.checkSpawnedAdapter( ADAPTER_LABEL );
AdapterTestUtils.checkEachStandardMethods( ADAPTER_LABEL );
//AdapterTestUtils.checkApplications( ADAPTER_LABEL );
AdapterTestUtils.checkRegisterAdapter( ADAPTER_LABEL );

after(() => {
	if ( server ) {
		return new Promise(( resolve, reject ) => {
			server.close(() => {
				console.log( 'Example app closed' );
				return resolve();
			});
		});
	}
});
