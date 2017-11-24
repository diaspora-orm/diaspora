'use strict';

console.log('>> Loading Diaspora');


// browserify-ignore-start
const _ = require('lodash');
const cachedDiaspora = _.find(require.cache, (module, path) => {
	return path.endsWith('/diaspora.js');
});
if(!_.isEmpty(_.get(cachedDiaspora, 'exports'))){
	console.log('Retrieving loaded diaspora');
	return module.exports = cachedDiaspora;
}
// browserify-ignore-stop

const Diaspora = require( './lib/diaspora' );

module.exports = Diaspora;
