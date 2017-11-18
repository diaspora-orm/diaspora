'use strict';

/* globals it: false, require: false, getConfig: false */

const ADAPTER_LABEL = 'webApi';
const adapterConfig = getConfig( ADAPTER_LABEL );

var AdapterTestUtils = require( './utils' );

AdapterTestUtils.createDataSource( ADAPTER_LABEL, {} );
if(!process.browser){
	const express = require('express');
	const DiasporaServer = require('diaspora-server');
	const app = express();
	console.log(Diaspora.dataSources);
	app.use( '/api', DiasporaServer({
		webserverType: 'express',
		models:        {
			[ADAPTER_LABEL]: {
				singular: ADAPTER_LABEL,
				plural:   ADAPTER_LABEL + 's',
			},
		},
	}));
	const server = app.listen( 12345, () => {
		console.log( `Example app listening on port ${ 12345 }!` );
	});
}
AdapterTestUtils.checkSpawnedAdapter( ADAPTER_LABEL );
AdapterTestUtils.checkEachStandardMethods( ADAPTER_LABEL );
AdapterTestUtils.checkApplications( ADAPTER_LABEL );
AdapterTestUtils.checkRegisterAdapter( ADAPTER_LABEL );