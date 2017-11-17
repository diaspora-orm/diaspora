'use strict';

/* globals it: false, require: false, getConfig: false */

const ADAPTER_LABEL = 'webApi';
const adapterConfig = getConfig( ADAPTER_LABEL );

if(!process.browser){
	const express = require('express');
	const DiasporaServer = require('diaspora-server');
	const app = express();
	app.use( '/api', DiasporaServer({
		webserverType: 'express',
		models:        {
			PhoneBook: {
				singular: 'PhoneBook',
				plural:   'PhoneBooks',
			},
			Ignored: false,
		},
	}));
	const server = app.listen( 12345, () => {
		console.log( `Example app listening on port ${ 12345 }!` );
		if ( module.exports.after ) {
			module.exports.after();
		}
	});
}

var AdapterTestUtils = require( './utils' );

AdapterTestUtils.createDataSource( ADAPTER_LABEL, {} );
AdapterTestUtils.checkSpawnedAdapter( ADAPTER_LABEL );
AdapterTestUtils.checkEachStandardMethods( ADAPTER_LABEL );
AdapterTestUtils.checkApplications( ADAPTER_LABEL );
AdapterTestUtils.checkRegisterAdapter( ADAPTER_LABEL );