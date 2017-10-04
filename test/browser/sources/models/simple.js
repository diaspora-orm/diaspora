'use strict';

(function () {
	var testModel = void 0;
	var testedEntity = void 0;
	var MODEL_NAME = 'testModel';
	var SOURCE = 'inMemory';

	it('Should create a model', function () {
		testModel = Diaspora.declareModel('test', MODEL_NAME, {
			sources: [SOURCE],
			schema: false,
			attributes: {
				foo: {
					type: 'string'
				}
			}
		});
		expect(testModel).to.be.an('object');
		if ('undefined' === typeof window) {
			expect(testModel.constructor.name).to.be.eql('Model');
		}
	});
	it('Should be able to create an entity of the defined model.', function () {
		var entity1 = testModel.spawn();
		expect(entity1).to.be.an.entity(testModel, {}, true);
		var entity2 = testModel.spawn({
			foo: 'bar'
		});
		expect(entity2).to.be.an.entity(testModel, {
			foo: 'bar'
		}, true);
	});
	it('Should be able to create multiple entities.', function () {
		var objects = [{
			foo: 'bar'
		}, undefined];
		var entities = testModel.spawnMulti(objects);
		expect(entities).to.be.a.set.of.entity(testModel, objects, true).that.have.lengthOf(2);
	});
	describe('Should be able to use model methods to find, update, delete & create', function () {
		describe('- Create instances', function () {
			it('Create a single instance', function () {
				expect(testModel).to.respondTo('insert');
				var object = {
					foo: 'bar'
				};
				return testModel.insert(object).then(function (newEntity) {
					expect(newEntity).to.be.an.entity(testModel, object, 'inMemory');
					return Promise.resolve();
				});
			});
			it('Create multiple instances', function () {
				expect(testModel).to.respondTo('insertMany');
				var objects = [{
					foo: 'baz'
				}, undefined, {
					foo: undefined
				}, {
					foo: 'baz'
				}];
				return testModel.insertMany(objects).then(function (newEntities) {
					expect(newEntities).to.be.a.set.of.entity(testModel, objects, 'inMemory').that.have.lengthOf(4);
					return Promise.resolve();
				});
			});
		});
		describe('- Find instances', function () {
			function checkFind(query) {
				var many = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

				return testModel[many ? 'findMany' : 'find'](query).then(function (foundEntities) {
					if (many) {
						expect(foundEntities).to.be.a.set.of.entity(testModel, query, SOURCE);
					} else if (c.assigned(foundEntities)) {
						expect(foundEntities).to.be.an.entity(testModel, query, SOURCE);
					}
					return Promise.resolve(foundEntities);
				});
			}
			it('Find a single instance', function () {
				expect(testModel).to.respondTo('find');
				return Promise.mapSeries([{
					foo: undefined
				}, {
					foo: 'baz'
				}, {
					foo: 'bar'
				}], function (item) {
					return checkFind(item, false);
				});
			});
			it('Find multiple instances', function () {
				expect(testModel).to.respondTo('findMany');
				return Promise.mapSeries([{
					query: {
						foo: undefined
					},
					length: 2
				}, {
					query: {
						foo: 'baz'
					},
					length: 2
				}, {
					query: {
						foo: 'bar'
					},
					length: 1
				}], function (item) {
					return checkFind(item.query, true).then(function (foundEntities) {
						expect(foundEntities).to.have.lengthOf(item.length);
					});
				});
			});
			it('Find all instances', function () {
				return testModel.findMany({}).then(function (foundEntities) {
					expect(foundEntities).to.have.lengthOf(5);
				});
			});
		});
		describe('- Update instances', function () {
			function checkUpdate(query, update) {
				var many = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

				return testModel[many ? 'updateMany' : 'update'](query, update).then(function (updatedEntities) {
					if (many) {
						expect(updatedEntities).to.be.a.set.of.entity(testModel, update, SOURCE);
					} else if (c.assigned(updatedEntities)) {
						expect(updatedEntities).to.be.an.entity(testModel, update, SOURCE);
					}
					return Promise.resolve(updatedEntities);
				});
			}
			it('Update a single instance', function () {
				expect(testModel).to.respondTo('update');
				return Promise.resolve().then(function () {
					return checkUpdate({
						foo: undefined
					}, {
						foo: 'qux'
					}, false);
				}).then(function () {
					return checkUpdate({
						foo: 'baz'
					}, {
						foo: 'qux'
					}, false);
				}).then(function () {
					return checkUpdate({
						foo: 'bar'
					}, {
						foo: undefined
					}, false);
				});
			});
			it('Update multiple instances', function () {
				//process.exit()
				expect(testModel).to.respondTo('updateMany');
				return Promise.resolve().then(function () {
					return checkUpdate({
						foo: undefined
					}, {
						foo: 'bar'
					}, true).then(function (foundEntities) {
						expect(foundEntities).to.have.lengthOf(2);
						return Promise.resolve();
					});
				}).then(function () {
					return checkUpdate({
						foo: 'baz'
					}, {
						foo: undefined
					}, true).then(function (foundEntities) {
						expect(foundEntities).to.have.lengthOf(1);
						return Promise.resolve();
					});
				}).then(function () {
					return checkUpdate({
						foo: 'bat'
					}, {
						foo: 'twy'
					}, true).then(function (foundEntities) {
						expect(foundEntities).to.have.lengthOf(0);
						return Promise.resolve();
					});
				});
			});
		});
		describe('- Delete instances', function () {
			function checkDestroy(query) {
				var many = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

				return testModel.findMany(query).then(function (entities) {
					return Promise.resolve(entities.length);
				}).then(function (beforeCount) {
					return testModel[many ? 'deleteMany' : 'delete'](query).then(function () {
						return Promise.resolve(beforeCount);
					});
				}).then(function (beforeCount) {
					return testModel.findMany(query).then(function (entities) {
						return Promise.resolve({
							before: beforeCount,
							after: entities.length
						});
					});
				}).then(function (result) {
					if (many || 0 === result.before) {
						expect(result.after).to.be.equal(0);
					} else {
						expect(result.after).to.be.equal(result.before - 1);
					}
				});
			}
			it('Delete a single instance', function () {
				expect(testModel).to.respondTo('delete');
				return Promise.resolve().then(function () {
					return checkDestroy({
						foo: undefined
					}, false);
				}).then(function () {
					return checkDestroy({
						foo: 'bar'
					}, false);
				});
			});
			it('Delete multiple instances', function () {
				expect(testModel).to.respondTo('deleteMany');
				return Promise.resolve().then(function () {
					return checkDestroy({
						foo: undefined
					}, true);
				}).then(function () {
					return checkDestroy({
						foo: 'baz'
					}, true);
				}).then(function () {
					return checkDestroy({
						foo: 'qux'
					}, true);
				});
			});
			it('Delete all instances', function () {
				return testModel.deleteMany({});
			});
		});
	});
	describe('Should be able to persist, fetch & delete an entity of the defined model.', function () {
		it('Persist should change the entity', function () {
			var object = {
				foo: 'bar'
			};
			testedEntity = testModel.spawn(object);
			expect(testedEntity).to.be.an.entity(testModel, object, true);
			var retPromise = testedEntity.persist();
			//			expect( testedEntity.getState()).to.be.eql( 'syncing' );
			expect(testedEntity).to.be.an.entity(testModel, object, null);
			return retPromise.then(function () {
				expect(testedEntity).to.be.an.entity(testModel, object, SOURCE);
			});
		});
		it('Fetch should change the entity', function () {
			var object = {
				foo: 'bar'
			};
			return testModel.find(object).then(function (entity) {
				expect(entity).to.respondTo('fetch');
				expect(entity).to.be.an.entity(testModel, object, SOURCE);
				entity.foo = 'baz';
				expect(entity).to.be.an.entity(testModel, {
					foo: 'baz'
				}, SOURCE);
				var retPromise = entity.fetch();
				return retPromise.then(function () {
					expect(testedEntity).to.be.an.entity(testModel, object, SOURCE);
				});
			});
		});
		it('Destroy should change the entity', function () {
			var object = {
				foo: 'bar'
			};
			return testModel.find(object).then(function (entity) {
				expect(entity).to.respondTo('destroy');
				expect(entity).to.be.an.entity(testModel, object, SOURCE);
				var retPromise = entity.destroy();
				return retPromise.then(function () {
					expect(entity.getLastDataSource()).to.be.eql(SOURCE);
					expect(entity.getState()).to.be.eql('orphan');
					expect(entity).to.be.an.entity(testModel, {}, null);
				});
			});
		});
	});
})();
