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
	webApiBrowser: {
		host:   'localhost',
		port:   12345,
		scheme: 'http',
		path:   '/api',
	},
	webApiNode: {
		host:   'localhost',
		port:   23456,
		scheme: 'http',
		path:   '/api',
	},
};
