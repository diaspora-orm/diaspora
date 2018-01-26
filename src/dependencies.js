'use strict';

module.exports = {
	_: (() => { 
		return global._ || require( 'lodash' );
	})(),
	SequentialEvent: (() => { 
		return global.SequentialEvent || require( 'sequential-event' );
	})(),
	Promise: (() => { 
		return global.Promise && global.Promise.version ? global.Promise : require( 'bluebird' );
	})(),
};
