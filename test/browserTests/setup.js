
requirejs.config({
	paths: {
		bluebird:           'https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.5.0/bluebird.min',
		lodash:             'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min',
		defineGlobals:      '../defineGlobals',
		'check-types':      'https://rawgit.com/philbooth/check-types.js/master/src/check-types.min',
		chai:               'https://cdnjs.cloudflare.com/ajax/libs/chai/4.1.2/chai.min',
		'sequential-event': 'https://rawgit.com/GerkinDev/SequentialEvent.js/master/dist/sequential-event.min',

		diasporaStandalone: '../../build/standalone/dist/diaspora',
		diasporaComposed:   '../../build/composed/dist/diaspora',

		TestModels:       '../models/index',
		TestInMemory:     '../adapters/inMemory',
		TestLocalStorage: '../adapters/localStorage',
		utils:            '../adapters/utils',
	},
	shim: {
		utils: {
			deps: [ 'bluebird' ],
		},
		TestModels: {
			deps: [ 'utils', '../models/simple', '../models/simple-remapping' ],
		},
		TestInMemory: {
			deps: [ 'utils' ],
		},
		TestLocalStorage: {
			deps: [ 'utils' ],
		},
		defineGlobals: {
			deps:    [ 'bluebird', 'lodash', 'check-types', 'chai', 'sequential-event' ],
			exports: 'adaptersUtils',
		},
		diasporaStandalone: {
			exports: 'Diaspora',
		},
		diasporaComposed: {
			deps:    [ 'bluebird', 'lodash', 'check-types', 'sequential-event' ],
			exports: 'Diaspora',
		},
	},
});

window.dataSources = {};

mocha.setup( 'bdd' );
mocha.checkLeaks();
config = {};
require([ 'defineGlobals', 'bluebird', target ], ( g, Promise, Diaspora ) => {
	window.Diaspora = Diaspora;
	describe( 'Testing adapters', () => {
		return new Promise( resolve => {
			describe( 'In Memory', () => {
				require([ 'TestInMemory' ], () => {
					return resolve();
				});
			});
		}).then(() => {
			return new Promise( resolve => {
				describe( 'Local Storage', () => {
					require([ 'TestLocalStorage' ], () => {
						return resolve();
					});
				});
			});
		}).then(() => {
			mocha.run();
		});
	});
	describe( 'Testing models', () => {
		return new Promise( resolve => {
			require([ 'TestModels' ], () => {	
				return resolve();
			});
		});
	});
});
