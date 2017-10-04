'use strict';

var Promise = require('bluebird');
var l = require('lodash');

/* globals l: false, c: false */

function getDataSourceLabel(name) {
	var addName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

	return name + 'Adapter' + (addName ? '.' + addName : '');
}

var TABLE = 'test';

var AdapterTestUtils = {
	createDataSource: function createDataSource(adapterLabel, config) {
		var addName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

		var dataSourceLabel = getDataSourceLabel(adapterLabel, addName);
		var dataSource = Diaspora.createDataSource(adapterLabel, config);
		dataSources[dataSourceLabel] = dataSource;
		return dataSource;
	},
	checkSpawnedAdapter: function checkSpawnedAdapter(adapterLabel, baseName) {
		var addName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

		it(style.white('Create ' + adapterLabel + ' adapter'), function (done) {
			var dataSourceLabel = getDataSourceLabel(adapterLabel, addName);
			dataSources[dataSourceLabel].waitReady().then(function (adapter) {
				adapter.baseName = baseName;
				expect(adapter).to.be.an('object');
				if ('undefined' === typeof window) {
					expect(adapter.constructor.name, 'Adapter name does not comply to naming convention').to.equal(baseName + 'DiasporaAdapter');
					expect(adapter.classEntity.name, 'Class entity name does not comply to naming convention').to.equal(baseName + 'Entity');
				}
				l.forEach(['insert', 'find', 'update', 'delete'], function (word) {
					expect(adapter).to.satisfy(function (o) {
						return o.__proto__.hasOwnProperty(word + 'One') || o.__proto__.hasOwnProperty(word + 'Many');
					}, 'should have at least one "' + word + '" method');
				});
				return done();
			}).catch(done);
		});
	},
	checkEachStandardMethods: function checkEachStandardMethods(adapterLabel) {
		var addName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

		var adapter = dataSources[getDataSourceLabel(adapterLabel, addName)];
		var getTestLabel = function getTestLabel(fctName) {
			if (adapter.__proto__.hasOwnProperty(fctName)) {
				return fctName;
			} else {
				return fctName + ' (from BaseAdapter)';
			}
		};

		describe(style.white('Check filtering options') + ' with ' + adapterLabel, function () {
			it('Check "normalizeOptions"', function () {
				var no = adapter.normalizeOptions;
				expect(no()).to.deep.include({
					skip: 0,
					remapInput: true,
					remapOutput: true
				});
				expect(no({
					skip: 1,
					remapInput: false,
					remapOutput: false
				})).to.deep.include({
					skip: 1,
					remapInput: false,
					remapOutput: false
				});
				expect(no({
					page: 1,
					limit: 10
				})).to.deep.include({
					skip: 10,
					limit: 10
				}).and.not.have.property('page');
				expect(no.bind(adapter, {
					page: 1
				})).to.throw();
				expect(no.bind(adapter, {
					page: -1,
					limit: 5
				})).to.throw();
				expect(no.bind(adapter, {
					limit: -1
				})).to.throw();
				expect(no.bind(adapter, {
					skip: -1
				})).to.throw();
				expect(no.bind(adapter, {
					page: 'aze'
				})).to.throw();
				expect(no.bind(adapter, {
					limit: 'aze'
				})).to.throw();
				expect(no.bind(adapter, {
					skip: 'aze'
				})).to.throw();
			});
			describe('Check "normalizeQuery"', function () {
				var nq = l.partialRight(adapter.normalizeQuery, {
					remapInput: true
				});
				it('Empty query', function () {
					expect(nq({})).to.deep.eql({});
				});
				it(style.bold('~') + ' ($exists)', function () {
					expect(nq({
						foo: undefined
					})).to.deep.eql({
						foo: {
							$exists: false
						}
					});
					expect(nq({
						foo: {
							'~': true
						}
					})).to.deep.eql({
						foo: {
							$exists: true
						}
					});
					expect(nq({
						foo: {
							$exists: true
						}
					})).to.deep.eql({
						foo: {
							$exists: true
						}
					});
					expect(nq({
						foo: {
							'~': false
						}
					})).to.deep.eql({
						foo: {
							$exists: false
						}
					});
					expect(nq({
						foo: {
							$exists: false
						}
					})).to.deep.eql({
						foo: {
							$exists: false
						}
					});
					expect(nq.bind(adapter, {
						foo: {
							'~': 'bar',
							$exists: 'bar'
						}
					})).to.throw();
				});
				it(style.bold('==') + ' ($equal)', function () {
					expect(nq({
						foo: 'bar'
					})).to.deep.eql({
						foo: {
							$equal: 'bar'
						}
					});
					expect(nq({
						foo: {
							$equal: 'bar'
						}
					})).to.deep.eql({
						foo: {
							$equal: 'bar'
						}
					});
					expect(nq({
						foo: {
							'==': 'bar'
						}
					})).to.deep.eql({
						foo: {
							$equal: 'bar'
						}
					});
					expect(nq.bind(adapter, {
						foo: {
							'==': 'bar',
							$equal: 'bar'
						}
					})).to.throw();
				});
				it(style.bold('!=') + ' ($diff)', function () {
					expect(nq({
						foo: {
							$diff: 'bar'
						}
					})).to.deep.eql({
						foo: {
							$diff: 'bar'
						}
					});
					expect(nq({
						foo: {
							'!=': 'bar'
						}
					})).to.deep.eql({
						foo: {
							$diff: 'bar'
						}
					});
					expect(nq.bind(adapter, {
						foo: {
							'!=': 'bar',
							$diff: 'bar'
						}
					})).to.throw();
				});
				it(style.bold('<') + ' ($less)', function () {
					expect(nq({
						foo: {
							$less: 1
						}
					})).to.deep.eql({
						foo: {
							$less: 1
						}
					});
					expect(nq({
						foo: {
							'<': 1
						}
					})).to.deep.eql({
						foo: {
							$less: 1
						}
					});
					expect(nq.bind(adapter, {
						foo: {
							'<': 1,
							$less: 1
						}
					})).to.throw();
					expect(nq.bind(adapter, {
						foo: {
							'<': 'aze'
						}
					})).to.throw();
					expect(nq.bind(adapter, {
						foo: {
							$less: 'aze'
						}
					})).to.throw();
				});
				it(style.bold('<=') + ' ($lessEqual)', function () {
					expect(nq({
						foo: {
							$lessEqual: 1
						}
					})).to.deep.eql({
						foo: {
							$lessEqual: 1
						}
					});
					expect(nq({
						foo: {
							'<=': 1
						}
					})).to.deep.eql({
						foo: {
							$lessEqual: 1
						}
					});
					expect(nq.bind(adapter, {
						foo: {
							'<=': 1,
							$lessEqual: 1
						}
					})).to.throw();
					expect(nq.bind(adapter, {
						foo: {
							'<=': 'aze'
						}
					})).to.throw();
					expect(nq.bind(adapter, {
						foo: {
							$lessEqual: 'aze'
						}
					})).to.throw();
				});
				it(style.bold('>') + ' ($greater)', function () {
					expect(nq({
						foo: {
							$greater: 1
						}
					})).to.deep.eql({
						foo: {
							$greater: 1
						}
					});
					expect(nq({
						foo: {
							'>': 1
						}
					})).to.deep.eql({
						foo: {
							$greater: 1
						}
					});
					expect(nq.bind(adapter, {
						foo: {
							'>': 1,
							$greater: 1
						}
					})).to.throw();
					expect(nq.bind(adapter, {
						foo: {
							'>': 'aze'
						}
					})).to.throw();
					expect(nq.bind(adapter, {
						foo: {
							$greater: 'aze'
						}
					})).to.throw();
				});
				it(style.bold('>=') + ' ($greaterEqual)', function () {
					expect(nq({
						foo: {
							$greaterEqual: 1
						}
					})).to.deep.eql({
						foo: {
							$greaterEqual: 1
						}
					});
					expect(nq({
						foo: {
							'>=': 1
						}
					})).to.deep.eql({
						foo: {
							$greaterEqual: 1
						}
					});
					expect(nq.bind(adapter, {
						foo: {
							'>=': 1,
							$greaterEqual: 1
						}
					})).to.throw();
					expect(nq.bind(adapter, {
						foo: {
							'>=': 'aze'
						}
					})).to.throw();
					expect(nq.bind(adapter, {
						foo: {
							$greaterEqual: 'aze'
						}
					})).to.throw();
				});
			});
			describe('Check "matchEntity"', function () {
				var me = adapter.matchEntity;
				it('Empty query', function () {
					expect(me({}, {
						foo: 'bar'
					})).to.be.true;
				});
				it(style.bold('~') + ' ($exists)', function () {
					expect(me({
						foo: {
							$exists: true
						}
					}, {
						foo: 'bar'
					})).to.be.true;
					expect(me({
						foo: {
							$exists: true
						}
					}, {
						foo: undefined
					})).to.be.false;
					expect(me({
						foo: {
							$exists: false
						}
					}, {
						foo: 'bar'
					})).to.be.false;
					expect(me({
						foo: {
							$exists: false
						}
					}, {
						foo: undefined
					})).to.be.true;
				});
				it(style.bold('==') + ' ($equal)', function () {
					expect(me({
						foo: {
							$equal: 'bar'
						}
					}, {
						foo: 'bar'
					})).to.be.true;
					expect(me({
						foo: {
							$equal: 'bar'
						}
					}, {
						foo: undefined
					})).to.be.false;
					expect(me({
						foo: {
							$equal: 'bar'
						}
					}, {
						foo: 'baz'
					})).to.be.false;
				});
				it(style.bold('!=') + ' ($diff)', function () {
					expect(me({
						foo: {
							$diff: 'bar'
						}
					}, {
						foo: 'bar'
					})).to.be.false;
					expect(me({
						foo: {
							$diff: 'bar'
						}
					}, {
						foo: 'baz'
					})).to.be.true;
					expect(me({
						foo: {
							$diff: 'bar'
						}
					}, {
						foo: undefined
					})).to.be.false;
					expect(me({
						foo: {
							$diff: 'bar'
						}
					}, {
						bar: 'qux'
					})).to.be.false;
				});
				it(style.bold('<') + ' ($less)', function () {
					expect(me({
						foo: {
							$less: 2
						}
					}, {
						foo: undefined
					})).to.be.false;
					expect(me({
						foo: {
							$less: 2
						}
					}, {
						foo: 1
					})).to.be.true;
					expect(me({
						foo: {
							$less: 2
						}
					}, {
						foo: 2
					})).to.be.false;
					expect(me({
						foo: {
							$less: 2
						}
					}, {
						foo: 3
					})).to.be.false;
				});
				it(style.bold('<=') + ' ($lessEqual)', function () {
					expect(me({
						foo: {
							$lessEqual: 2
						}
					}, {
						foo: undefined
					})).to.be.false;
					expect(me({
						foo: {
							$lessEqual: 2
						}
					}, {
						foo: 1
					})).to.be.true;
					expect(me({
						foo: {
							$lessEqual: 2
						}
					}, {
						foo: 2
					})).to.be.true;
					expect(me({
						foo: {
							$lessEqual: 2
						}
					}, {
						foo: 3
					})).to.be.false;
				});
				it(style.bold('>') + ' ($greater)', function () {
					expect(me({
						foo: {
							$greater: 2
						}
					}, {
						foo: undefined
					})).to.be.false;
					expect(me({
						foo: {
							$greater: 2
						}
					}, {
						foo: 1
					})).to.be.false;
					expect(me({
						foo: {
							$greater: 2
						}
					}, {
						foo: 2
					})).to.be.false;
					expect(me({
						foo: {
							$greater: 2
						}
					}, {
						foo: 3
					})).to.be.true;
				});
				it(style.bold('>=') + ' ($greaterEqual)', function () {
					expect(me({
						foo: {
							$greaterEqual: 2
						}
					}, {
						foo: undefined
					})).to.be.false;
					expect(me({
						foo: {
							$greaterEqual: 2
						}
					}, {
						foo: 1
					})).to.be.false;
					expect(me({
						foo: {
							$greaterEqual: 2
						}
					}, {
						foo: 2
					})).to.be.true;
					expect(me({
						foo: {
							$greaterEqual: 2
						}
					}, {
						foo: 3
					})).to.be.true;
				});
			});
		});
		describe(style.white('Test adapter methods'), function () {
			var findManyOk = false;
			var findAllOk = false;
			describe('✨ Insert methods', function () {
				it(getTestLabel('insertOne'), function () {
					expect(adapter).to.respondTo('insertOne');
					var object = {
						foo: 'bar'
					};
					return adapter.insertOne(TABLE, object).then(function (entity) {
						expect(entity).to.be.a.dataStoreEntity(adapter, object);
					});
				});
				it(getTestLabel('insertMany'), function () {
					expect(adapter).to.respondTo('insertMany');
					var objects = [{
						baz: 'qux'
					}, {
						qux: 'foo'
					}, {
						foo: 'bar'
					}];
					return adapter.insertMany(TABLE, objects).then(function (entities) {
						expect(entities).to.be.a.set.of.dataStoreEntity(adapter, objects).that.have.lengthOf(objects.length);
					});
				});
			});
			describe('Specification level 1', function () {
				describe('🔎 Find methods', function () {
					it(getTestLabel('findOne'), function () {
						expect(adapter).to.respondTo('findOne');
						var object = {
							baz: 'qux'
						};
						return adapter.findOne(TABLE, object).then(function (entity) {
							return Promise.try(function () {
								expect(entity).to.be.a.dataStoreEntity(adapter, object);
								return Promise.resolve();
							});
						});
					});
					it(getTestLabel('findMany'), function () {
						expect(adapter).to.respondTo('findMany');
						var objects = {
							foo: 'bar'
						};
						return adapter.findMany(TABLE, objects).then(function (entities) {
							return Promise.try(function () {
								expect(entities).to.be.a.set.of.dataStoreEntity(adapter, objects).that.have.lengthOf(2);
								findManyOk = true;
								return Promise.resolve();
							});
						});
					});
					it('Find all', function skippable() {
						if (findManyOk !== true) {
							this.skip();
							return;
						}
						expect(adapter).to.respondTo('findMany');
						return adapter.findMany(TABLE, {}).then(function (entities) {
							return Promise.try(function () {
								expect(entities).to.be.a.set.of.dataStoreEntity(adapter).that.have.lengthOf(4);
								findAllOk = true;
								return Promise.resolve();
							});
						});
					});
				});
				describe('🔃 Update methods', function () {
					it(getTestLabel('updateOne'), function () {
						expect(adapter).to.respondTo('updateOne');
						var fromObj = {
							baz: 'qux'
						};
						var targetObj = {
							foo: 'bar'
						};
						return adapter.updateOne(TABLE, fromObj, targetObj).then(function (entity) {
							expect(entity).to.be.a.dataStoreEntity(adapter, l.assign({}, fromObj, targetObj));
						});
					});
					it(getTestLabel('updateMany'), function () {
						expect(adapter).to.respondTo('updateMany');
						var fromObj = {
							foo: 'bar'
						};
						var targetObj = {
							baz: 'qux'
						};
						return adapter.updateMany(TABLE, fromObj, targetObj).then(function (entities) {
							expect(entities).to.be.a.set.of.dataStoreEntity(adapter, l.assign({}, fromObj, targetObj)).that.have.lengthOf(3);
						});
					});
				});
				describe('❌ Delete methods', function () {
					it(getTestLabel('deleteOne'), function () {
						expect(adapter).to.respondTo('deleteOne');
						var obj = {
							qux: 'foo'
						};
						return adapter.deleteOne(TABLE, obj).then(function () {
							for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
								args[_key] = arguments[_key];
							}

							expect(args).to.be.an('array').that.eql([undefined]);
							return Promise.resolve();
						});
					});
					it(getTestLabel('deleteMany'), function () {
						expect(adapter).to.respondTo('deleteMany');
						var obj = {
							foo: 'bar'
						};
						return adapter.deleteMany(TABLE, obj).then(function () {
							for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
								args[_key2] = arguments[_key2];
							}

							expect(args).to.be.an('array').that.eql([undefined]);
							return Promise.resolve();
						});
					});
					it('Check deletion: find all again', function skippable() {
						if (findAllOk !== true) {
							this.skip();
							return;
						}
						return adapter.findMany(TABLE, {}).then(function (entities) {
							return Promise.try(function () {
								expect(entities).to.be.an('array').that.have.lengthOf(0);
								return Promise.resolve();
							});
						});
					});
				});
			});
			describe('Specification level 2', function () {
				it('Initialize test data', function () {
					var objects = [
					// Tests for $exists
					{
						foo: 1
					}, {
						foo: undefined
					},
					// Tests for comparison operators
					{
						bar: 1
					}, {
						bar: 2
					}, {
						bar: 3
					}];
					return adapter.insertMany(TABLE, objects).then(function (entities) {
						expect(entities).to.be.a.set.of.dataStoreEntity(adapter, objects).that.have.lengthOf(objects.length);
					});
				});
				it(style.bold('~') + ' ($exists) operator', function () {
					return Promise.all([adapter.findOne(TABLE, {
						foo: {
							'~': true
						}
					}).then(function (output) {
						expect(output).to.be.a.dataStoreEntity(adapter, {
							foo: 1
						});
					}), adapter.findOne(TABLE, {
						foo: {
							'~': false
						}
					}).then(function (output) {
						expect(output).to.be.a.dataStoreEntity(adapter, {
							foo: undefined
						});
					})]);
				});
				it(style.bold('==') + ' ($equal) operator', function () {
					return adapter.findOne(TABLE, {
						foo: {
							'==': 1
						}
					}).then(function (output) {
						expect(output).to.be.a.dataStoreEntity(adapter, {
							foo: 1
						});
					});
				});
				it(style.bold('!=') + ' ($diff) operator', function () {
					return Promise.all([adapter.findOne(TABLE, {
						bar: {
							'!=': 1
						}
					}).then(function (output) {
						expect(output).to.be.a.dataStoreEntity(adapter, {
							bar: 2
						});
					}), adapter.findOne(TABLE, {
						foo: {
							'!=': 1
						}
					}).then(function (output) {
						expect(output).to.be.undefined;
					}), adapter.findOne(TABLE, {
						foo: {
							'!=': 2
						}
					}).then(function (output) {
						expect(output).to.be.a.dataStoreEntity(adapter, {
							foo: 1
						});
					})]);
				});
				it(style.bold('<') + ' ($less) operator', function () {
					return adapter.findMany(TABLE, {
						bar: {
							'<': 2
						}
					}).then(function (outputs) {
						expect(outputs).to.be.a.set.of.dataStoreEntity(adapter, [{
							bar: 1
						}]).that.have.lengthOf(1);
					});
				});
				it(style.bold('<=') + ' ($lessEqual) operator', function () {
					return adapter.findMany(TABLE, {
						bar: {
							'<=': 2
						}
					}).then(function (outputs) {
						expect(outputs).to.be.a.set.of.dataStoreEntity(adapter, [{
							bar: 1
						}, {
							bar: 2
						}]).that.have.lengthOf(2);
					});
				});
				it(style.bold('>') + ' ($greater) operator', function () {
					return adapter.findMany(TABLE, {
						bar: {
							'>': 2
						}
					}).then(function (outputs) {
						expect(outputs).to.be.a.set.of.dataStoreEntity(adapter, [{
							bar: 3
						}]).that.have.lengthOf(1);
					});
				});
				it(style.bold('>=') + ' ($greaterEqual) operator', function () {
					return adapter.findMany(TABLE, {
						bar: {
							'>=': 2
						}
					}).then(function (outputs) {
						expect(outputs).to.be.a.set.of.dataStoreEntity(adapter, [{
							bar: 2
						}, {
							bar: 3
						}]).that.have.lengthOf(2);
					});
				});
			});
		});
	},
	checkApplications: function checkApplications(adapterLabel) {
		var addName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

		if ('undefined' !== typeof window) {
			return;
		}
		var adapter = dataSources[getDataSourceLabel(adapterLabel, addName)];
		require('../testApps/adapters/index')(adapter);
	},
	checkRegisterAdapter: function checkRegisterAdapter(adapterLabel, dataSourceName) {
		var addName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

		it(style.white('Register named ' + adapterLabel + ' dataSource'), function () {
			var namespace = TABLE;
			Diaspora.registerDataSource(namespace, dataSourceName, dataSources[getDataSourceLabel(adapterLabel, addName)]);
			//console.log(Diaspora.dataSources);
			expect(Diaspora.dataSources[namespace][dataSourceName]).to.eql(dataSources[getDataSourceLabel(adapterLabel, addName)]);
		});
	}
};

if ('undefined' !== typeof define) {
	define(AdapterTestUtils);
} else {
	module.exports = AdapterTestUtils;
}
