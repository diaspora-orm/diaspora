'use strict';

module.exports = {
	mongo: {
		database: 'diaspora_test',
		username: 'admin',
		//		password: false,
	},
	redis: {
		database: 3,
	},
	webStorage: {},
	webApi: process.browser ? {
		port:   12345,
		path:   '/api',
	} : {
		host:   'localhost',
		port:   12345,
		scheme: 'http',
		path:   '/api',
	},
};
