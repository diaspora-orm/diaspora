path = require( 'path' );
l = require( 'lodash' );
c = require( 'check-types' );
CheckTypes = c;
projectPath = path.resolve( '../' );
chalk = require( 'chalk' );
const chai = require( 'chai' );
assert = chai.assert;
expect = chai.expect;
util = require( 'util' );
SequentialEvent = require( 'sequential-event' );
Promise = require( 'bluebird' );
chalk = require('chalk');
const stackTrace = require( 'stack-trace' );
let config;
try{
	config = require('./config.js');
} catch(err){
	if('MODULE_NOT_FOUND' === err.code){
		console.error('Missing required file "config.js", please copy "config-sample.js" and edit it.');
	} else {
		console.error(err);
	}
	process.exit();
}

importTest = ( name, modulePath ) => {
	const stackItem = stackTrace.get()[1];
	const fullPath = `${ path.dirname( stackItem.getFileName()) }/${ modulePath }`;
	describe( name, () => {
		require( fullPath );
	});
};
getConfig = adapterName => {
	return config[adapterName] || {};
};
chai.use(function (_chai, utils) {
	utils.addProperty(chai.Assertion.prototype, 'set', function () {
		var obj = utils.flag(this, 'object');
		const assert = this.assert(
			c.array(this._obj),
			'expected #{this} to be a collection',
			'expected #{this} to not be a collection');
		utils.flag(this, 'collection', true);
	});
	utils.addProperty(chai.Assertion.prototype, 'of', function () {
	});
	utils.addChainableMethod(chai.Assertion.prototype, 'boolean', function checkBool(){
		const elem = this._obj;
		const collection = utils.flag(this, 'collection');
		this.assert(
			collection ? l.every(elem, c.boolean) : c.boolean(elem),
			`expected #{this} to be a ${collection ? 'collection of ' : '' }boolean`,
			`expected #{this} to not be a ${collection ? 'collection of ' : '' }boolean`
		);
	});
	utils.addChainableMethod(chai.Assertion.prototype, 'dataStoreEntity', function checkDataStoreEntity(adapter, properties){
		const data = this._obj;
		const collection = utils.flag(this, 'collection');
		const check = (entity, props) => {
			try{
				l.forEach(props, (val, key) => {
					expect(entity).to.have.property(key, val);
				});
				expect(entity).to.include.all.keys('id', 'idHash');
				expect(entity.idHash).to.be.an('object').that.have.property(adapter.name, entity.id);
				expect( entity.constructor.name, 'Entity Class name does not comply to naming convention' ).to.equal( `${adapter.baseName}Entity` );
				valid = true;
			} catch(e){
				return e;
			}
		}
		let errorOut;
		if(collection){
			if(c.array(properties) && properties.length === data.length){
				l.forEach(data, (entity, index) => {
					errorOut = check(entity, properties[index]);
					return !errorOut;
				})
			} else {
				l.forEach(data, entity => {
					errorOut = check(entity, properties);
					return !errorOut;
				})
			}
		} else {
			errorOut = check(data, properties);
		}
		this.assert(
			!errorOut,
			`expected #{this} to be a ${collection ? 'collection of ' : '' }AdapterEntity: failed because of ${errorOut}`,
			`expected #{this} to not be a ${collection ? 'collection of ' : '' }AdapterEntity: failed because of ${errorOut}`
		);
	});
});