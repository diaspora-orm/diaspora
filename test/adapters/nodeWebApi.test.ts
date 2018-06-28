import * as _ from 'lodash';
import express from 'express';
import {json, urlencoded} from 'body-parser';

import { Diaspora } from '../../src/diaspora';
import { IWebApiAdapterConfig } from '../../src/adapters/webApi/adapter';
import { getConfig } from '../utils';
import {
	createDataSource,
	checkSpawnedAdapter,
	checkEachStandardMethods,
} from './utils';
import { AdapterEntity, Adapter } from '../../src/adapters/base';
import { QueryLanguage } from '../../src/types/queryLanguage';
import { NodeWebApiAdapter } from '../../src/adapters/webApi/subAdapters/nodeAdapter';

const ADAPTER_LABEL = 'webApiNode';
const adapterConfig = getConfig( ADAPTER_LABEL ) as IWebApiAdapterConfig;

let server;

Diaspora.registerAdapter( ADAPTER_LABEL, NodeWebApiAdapter );
createDataSource( ADAPTER_LABEL, adapterConfig );

beforeAll( () => {
	const parseQs = _.partialRight( _.mapValues, JSON.parse ) as (
		str: string
	) => { where: any } & QueryLanguage.QueryOptions;
	const app = express();
	const ENDPOINT = '/api/test';
	const inMemoryAdapter = Diaspora.createDataSource(
		'inMemory',
		'foobar2'
	);
	const INMEMORY_TABLE = 'test-expressstore';
	app.use( urlencoded( {
		extended: true,
	} ) );
	
	app.use( json() );
	
	app.post( ENDPOINT, ( req, res ) => {
		const body = req.body;
		inMemoryAdapter.insertOne( INMEMORY_TABLE, body ).then( entity => {
			if ( !_.isNil( entity ) ) {
				entity.attributes.id = entity.attributes.idHash.foobar;
				delete entity.attributes.idHash;
				return res.json( entity.attributes );
			}
			return res.json();
		} );
	} );
	app.post( `${ENDPOINT}s`, ( req, res ) => {
		const body = req.body;
		inMemoryAdapter.insertMany( INMEMORY_TABLE, body ).then( entities => {
			if ( !_.isEmpty( entities ) ) {
				return res.json(
					_.map( entities, ( entity: AdapterEntity ) => {
						entity.attributes.id = entity.attributes.idHash.foobar;
						delete entity.attributes.idHash;
						return entity.attributes;
					} )
				);
			}
			return res.json();
		} );
	} );
	
	app.get( ENDPOINT, ( req, res ) => {
		const query = parseQs( req.query );
		inMemoryAdapter
		.findOne( INMEMORY_TABLE, query.where, _.omit( query, ['where'] ) )
		.then( entity => {
			if ( !_.isNil( entity ) ) {
				entity.attributes.id = entity.attributes.idHash.foobar;
				delete entity.attributes.idHash;
				return res.json( entity.attributes );
			}
			return res.json();
		} );
	} );
	app.get( `${ENDPOINT}s`, ( req, res ) => {
		const query = parseQs( req.query );
		inMemoryAdapter
		.findMany( INMEMORY_TABLE, query.where, _.omit( query, ['where'] ) )
		.then( entities => {
			if ( !_.isEmpty( entities ) ) {
				return res.json(
					_.map( entities, ( entity: AdapterEntity ) => {
						entity.attributes.id = entity.attributes.idHash.foobar;
						delete entity.attributes.idHash;
						return entity.attributes;
					} )
				);
			}
			return res.json( [] );
		} );
	} );
	
	app.patch( ENDPOINT, ( req, res ) => {
		const body = req.body;
		const query = parseQs( req.query );
		inMemoryAdapter
		.updateOne( INMEMORY_TABLE, query.where, body, _.omit( query, ['where'] ) )
		.then( entity => {
			if ( !_.isNil( entity ) ) {
				entity.attributes.id = entity.attributes.idHash.foobar;
				delete entity.attributes.idHash;
				return res.json( entity.attributes );
			}
			return res.json( entity );
		} );
	} );
	app.patch( `${ENDPOINT}s`, ( req, res ) => {
		const body = req.body;
		const query = parseQs( req.query );
		inMemoryAdapter
		.updateMany( INMEMORY_TABLE, query.where, body, _.omit( query, ['where'] ) )
		.then( entities => {
			if ( !_.isEmpty( entities ) ) {
				return res.json(
					_.map( entities, ( entity: AdapterEntity ) => {
						entity.attributes.id = entity.attributes.idHash.foobar;
						delete entity.attributes.idHash;
						return entity.attributes;
					} )
				);
			}
			return res.json( [] );
		} );
	} );
	
	app.delete( ENDPOINT, ( req, res ) => {
		const query = parseQs( req.query );
		inMemoryAdapter
		.deleteOne( INMEMORY_TABLE, query.where, _.omit( query, ['where'] ) )
		.then( () => {
			return res.json();
		} );
	} );
	app.delete( `${ENDPOINT}s`, ( req, res ) => {
		const query = parseQs( req.query );
		inMemoryAdapter
		.deleteMany( INMEMORY_TABLE, query.where, _.omit( query, ['where'] ) )
		.then( () => {
			return res.json();
		} );
	} );
	
	return new Promise( ( resolve, reject ) => {
		server = app.listen( adapterConfig.port, () => {
			console.log( `Example app listening on port ${adapterConfig.port}!` );
			return resolve();
		} );
	} );
} );

checkSpawnedAdapter( ADAPTER_LABEL );
checkEachStandardMethods( ADAPTER_LABEL );

afterAll( () => {
	if ( server ) {
		return new Promise( ( resolve, reject ) => {
			server.close( () => {
				console.log( 'Example app closed' );
				return resolve();
			} );
		} );
	}
} );