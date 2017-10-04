'use strict';

var glob = 'undefined' !== typeof window ? window : global;

if ('undefined' === typeof window) {
	glob.path = require('path');
	glob.projectPath = path.resolve('../');
	glob.chalk = require('chalk');

	var stackTrace = require('stack-trace');
	glob.getCurrentDir = function () {
		var stackItem = stackTrace.get()[2];
		return path.dirname(stackItem.getFileName());
	};

	glob.chalk = require('chalk');
	try {
		glob.config = require('./config.js');
	} catch (err) {
		if ('MODULE_NOT_FOUND' === err.code) {
			console.error('Missing required file "config.js", please copy "config-sample.js" and edit it.');
		} else {
			console.error(err);
		}
		process.exit();
	}
} else {
	glob.config = {};
	glob.getCurrentDir = function () {
		return '';
		var scriptPath = '';
		try {
			//Throw an error to generate a stack trace
			throw new Error();
		} catch (e) {
			console.log(e, e.stack);
			//Split the stack trace into each line
			var stackLines = e.stack.split('\n');
			console.log(stackLines);
			var callerIndex = 0;
			//Now walk though each line until we find a path reference
			for (var i in stackLines) {
				if (!stackLines[i].match(/(?:https?|file):\/\//)) {
					continue;
				}
				//We skipped all the lines with out an http so we now have a script reference
				//This one is the class constructor, the next is the getScriptPath() call
				//The one after that is the user code requesting the path info (so offset by 2)
				callerIndex = Number(i) + 2;
				break;
			}
			//Now parse the string for each section we want to return
			pathParts = stackLines[callerIndex].match(/((?:https?|file):\/\/.+\/)([^\/]+\.js)/);
			return pathParts[1];
		}
	};
}

glob.getConfig = function (adapterName) {
	return config && config[adapterName] || {};
};

glob.importTest = function (name, modulePath) {
	var fullPath = 'undefined' === typeof window ? path.resolve(getCurrentDir(), modulePath) : modulePath;
	describe(name, function () {
		require(fullPath);
	});
};

glob.l = require('lodash');
glob.c = require('check-types');
glob.CheckTypes = c;
if (typeof window === 'undefined') {
	var _chai2 = require('chai');
}
glob.assert = chai.assert;
glob.expect = chai.expect;
glob.SequentialEvent = require('sequential-event');
glob.Promise = require('bluebird');

glob.style = {
	white: 'undefined' === typeof window ? chalk.underline.white : function (v) {
		return v;
	},
	bold: 'undefined' === typeof window ? chalk.bold : function (v) {
		return v;
	}
};

chai.use(function (_chai, utils) {
	utils.addProperty(chai.Assertion.prototype, 'set', function () {
		var obj = utils.flag(this, 'object');
		var assert = this.assert(c.array(this._obj), 'expected #{this} to be a collection', 'expected #{this} to not be a collection');
		utils.flag(this, 'collection', true);
	});
	utils.addProperty(chai.Assertion.prototype, 'of', function () {});
	utils.addChainableMethod(chai.Assertion.prototype, 'boolean', function checkBool() {
		var elem = this._obj;
		var collection = utils.flag(this, 'collection');
		this.assert(collection ? l.every(elem, c.boolean) : c.boolean(elem), 'expected #{this} to be a ' + (collection ? 'collection of ' : '') + 'boolean', 'expected #{this} to not be a ' + (collection ? 'collection of ' : '') + 'boolean');
	});
	utils.addChainableMethod(chai.Assertion.prototype, 'dataStoreEntity', function checkDataStoreEntity(adapter, properties) {
		var data = this._obj;
		var collection = utils.flag(this, 'collection');
		utils.flag(this, 'entityType', 'dataStoreEntity');
		var check = function check(entity) {
			var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			try {
				expect(entity).to.be.an('object');
				//	console.log({name: adapter.name, idHash: entity.idHash, id: entity.id})
				expect(entity.idHash).to.be.an('object').that.have.property(adapter.name, entity.id);
				expect(entity).to.include.all.keys('id', 'idHash');
				expect(entity.id).to.not.be.undefined;
				if (!entity.id) {
					throw new Error();
				}
				if ('undefined' === typeof window) {
					expect(entity.constructor.name, 'Entity Class name does not comply to naming convention').to.equal(adapter.baseName + 'Entity');
				}
				l.forEach(props, function (val, key) {
					if (c.undefined(val)) {
						expect(entity).to.satisfy(function (obj) {
							return c.undefined(obj[key]) || !obj.hasOwnProperty(key);
						});
					} else {
						expect(entity).to.have.property(key, val);
					}
				});
			} catch (e) {
				return e;
			}
		};
		var errorOut = void 0;
		if (collection) {
			if (c.array(properties) && properties.length === data.length) {
				l.forEach(data, function (entity, index) {
					errorOut = check(entity, properties[index]);
					return !errorOut;
				});
			} else {
				l.forEach(data, function (entity) {
					errorOut = check(entity, properties);
					return !errorOut;
				});
			}
		} else {
			errorOut = check(data, properties);
		}
		this.assert(!errorOut, 'expected #{this} to be a ' + (collection ? 'collection of ' : '') + 'DataStoreEntity: failed because of ' + errorOut, 'expected #{this} to not be a ' + (collection ? 'collection of ' : '') + 'DataStoreEntity: failed because of ' + errorOut);
	});
	utils.addChainableMethod(chai.Assertion.prototype, 'entity', function checkDataStoreEntity(model, properties) {
		var orphan = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

		var data = this._obj;
		var collection = utils.flag(this, 'collection');
		utils.flag(this, 'entityType', 'entity');
		var check = function check(entity) {
			var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			try {
				expect(entity.model).to.equal(model);
				var dataSource = 'string' === typeof orphan ? orphan : false;
				orphan = dataSource ? false : orphan;
				switch (orphan) {
					case true:
						{
							expect(entity.getState(), 'Entity should be orphan').to.equal('orphan');
						}break;

					case false:
						{
							expect(entity.getState(), 'Entity should not be orphan').to.not.equal('orphan');
						}break;

					case null:
						{}break;
				}
				if (orphan) {
					expect(entity.getLastDataSource(), 'Orphans should not have a last data source').to.be.eql(null);
					expect(entity, 'id should be an undefined value or key on orphans').to.not.have.property('id');
					expect(entity, 'idHash should be an undefined value or key on orphans').to.not.have.property('idHash');
				} else if (null !== orphan) {
					if (dataSource) {
						expect(entity.getLastDataSource()).to.be.eql(dataSource);
					} else {
						expect(entity.getLastDataSource(), 'Non orphans should have a last data source').to.be.not.eql(null);
					}
					var lds = entity.getLastDataSource();
					expect(entity.dataSources[lds], 'id should be a defined value on non-orphan last data source').to.be.an('object').that.have.property('id');
					expect(entity.dataSources[lds], 'idHash should be a hash on non-orphan last data source').to.be.an('object').that.have.property('idHash').that.is.an('object');
					expect(entity, 'id should not be copied in model\'s value').to.be.an('object').that.have.not.property('id');
					expect(entity, 'idHash should be a hash on non-orphan model').to.be.an('object').that.have.property('idHash').that.is.an('object');
				}
				expect(entity).to.respondTo('persist');
				expect(entity).to.respondTo('toObject');
				var toObj = entity.toObject();
				l.forEach(props, function (val, key) {
					if (c.undefined(val)) {
						expect(toObj).to.satisfy(function (obj) {
							return c.undefined(obj[key]) || !obj.hasOwnProperty(key);
						});
					} else {
						expect(toObj).to.have.property(key, val);
					}
				});
			} catch (e) {
				return e;
			}
		};
		var errorOut = void 0;
		if (collection) {
			if (c.array(properties) && properties.length === data.length) {
				l.forEach(data, function (entity, index) {
					errorOut = check(entity, properties[index]);
					return !errorOut;
				});
			} else {
				l.forEach(data, function (entity) {
					errorOut = check(entity, properties);
					return !errorOut;
				});
			}
		} else {
			errorOut = check(data, properties);
		}
		this.assert(!errorOut, 'expected #{this} to be a' + (collection ? ' collection of' : 'n') + ' Entity: failed because of ' + errorOut, 'expected #{this} to not be a' + (collection ? ' collection of' : 'n') + ' Entity: failed because of ' + errorOut);
	});
});
