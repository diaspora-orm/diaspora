import * as _ from 'lodash';

import { Diaspora } from '../../src/diaspora';
import { Model } from '../../src/model';
import { Entity, IRawEntityAttributes } from '../../src/entityFactory';
import '../utils';
import * as Bluebird from 'bluebird';
import { EntityStateError } from '../../src/errors';

let testModel: Model;
let testedEntity: Entity;
const MODEL_NAME = 'testModel';
const SOURCE = 'inMemory-simple';

beforeAll(() => {
	Diaspora.createNamedDataSource(SOURCE, 'inMemory');
	testModel = Diaspora.declareModel(MODEL_NAME, {
		sources: [SOURCE],
		//schema:     false,
		attributes: {
			foo: {
				type: 'string',
			},
		},
	});
});
it('Should create a model', () => {
	expect(testModel).toBeInstanceOf(Model);
	if ('undefined' === typeof window) {
		expect(testModel.ctor.name).toEqual('Model');
	}
});
it('Should be able to create an entity of the defined model.', () => {
	const entity1 = testModel.spawn({});
	expect(entity1).toBeAnEntity(testModel, {}, true);
	const entity2 = testModel.spawn({
		foo: 'bar',
	});
	expect(entity2).toBeAnEntity(
		testModel,
		{
			foo: 'bar',
		},
		true
	);
});
it('Should be able to create multiple entities.', () => {
	const objects = [
		{
			foo: 'bar',
		},
		undefined,
	];
	const entities = testModel.spawnMany(objects);
	expect(entities)
		.toBeAnEntitySet(testModel, objects, true)
		.that.have.lengthOf(2);
});
describe('Should be able to use model methods to find, update, delete & create', () => {
	describe('- Create instances', () => {
		it('Create a single instance', () => {
			expect(testModel).to.respondTo('insert');
			const object = {
				foo: 'bar',
			};
			return testModel.insert(object).then(newEntity => {
				expect(newEntity).toBeAnEntity(testModel, object, SOURCE);
			});
		});
		it('Create multiple instances', () => {
			expect(testModel).to.respondTo('insertMany');
			const objects = [
				{
					foo: 'baz',
				},
				undefined,
				{
					foo: undefined,
				},
				{
					foo: 'baz',
				},
			];
			return testModel.insertMany(objects).then(newEntities => {
				expect(newEntities)
					.toBeAnEntitySet(testModel, objects, SOURCE)
					.that.have.lengthOf(4);
			});
		});
	});
	describe('- Find instances', () => {
		const checkFind = async (query, many = true) => {
			const foundEntities = await testModel[many ? 'findMany' : 'find'](query);
			if (many) {
				expect(foundEntities).toBeAnEntitySet(testModel, query, SOURCE);
			} else if (!_.isNil(foundEntities)) {
				expect(foundEntities).toBeAnEntity(testModel, query, SOURCE);
			}
		};
		it('Find a single instance', () => {
			expect(testModel).to.respondTo('find');
			return Bluebird.mapSeries(
				[
					{
						foo: undefined,
					},
					{
						foo: 'baz',
					},
					{
						foo: 'bar',
					},
				],
				item => checkFind(item, false)
			);
		});
		it('Find multiple instances', () => {
			expect(testModel).to.respondTo('findMany');
			return Bluebird.mapSeries(
				[
					{
						query: {
							foo: undefined,
						},
						length: 2,
					},
					{
						query: {
							foo: 'baz',
						},
						length: 2,
					},
					{
						query: {
							foo: 'bar',
						},
						length: 1,
					},
				],
				item => {
					checkFind(item.query, true).then(foundEntities => {
						expect(foundEntities).toHaveLength(item.length);
					});
				}
			);
		});
		it('Find all instances', () => {
			return testModel.findMany({}).then(foundEntities => {
				expect(foundEntities).toHaveLength(5);
			});
		});
	});
	describe('- Update instances', () => {
		const checkUpdate = async (query, update, many = true) => {
			const updatedEntities = await testModel[many ? 'updateMany' : 'update'](
				query,
				update
			);
			if (many) {
				expect(updatedEntities).toBeAnEntitySet(testModel, update, SOURCE);
			} else if (!_.isUndefined(updatedEntities)) {
				expect(updatedEntities).toBeAnEntity(testModel, update, SOURCE);
			}
		};
		it('Update a single instance', () => {
			expect(testModel).to.respondTo('update');
			return Promise.resolve()
				.then(() =>
					checkUpdate(
						{
							foo: undefined,
						},
						{
							foo: 'qux',
						},
						false
					)
				)
				.then(() =>
					checkUpdate(
						{
							foo: 'baz',
						},
						{
							foo: 'qux',
						},
						false
					)
				)
				.then(() =>
					checkUpdate(
						{
							foo: 'bar',
						},
						{
							foo: undefined,
						},
						false
					)
				);
		});
		it('Update multiple instances', () => {
			//process.exit()
			expect(testModel).to.respondTo('updateMany');
			return Promise.resolve()
				.then(() =>
					checkUpdate(
						{
							foo: undefined,
						},
						{
							foo: 'bar',
						},
						true
					).then(foundEntities => {
						expect(foundEntities).toHaveLength(2);
						return Promise.resolve();
					})
				)
				.then(() =>
					checkUpdate(
						{
							foo: 'baz',
						},
						{
							foo: undefined,
						},
						true
					).then(foundEntities => {
						expect(foundEntities).toHaveLength(1);
						return Promise.resolve();
					})
				)
				.then(() =>
					checkUpdate(
						{
							foo: 'bat',
						},
						{
							foo: 'twy',
						},
						true
					).then(foundEntities => {
						expect(foundEntities).toHaveLength(0);
						return Promise.resolve();
					})
				);
		});
	});
	describe('- Delete instances', () => {
		const checkDestroy = (query, many = true) => {
			return testModel
				.findMany(query)
				.then(entities => {
					return Promise.resolve(entities.length);
				})
				.then(beforeCount => {
					return testModel[many ? 'deleteMany' : 'delete'](query).then(() =>
						Promise.resolve(beforeCount)
					);
				})
				.then(beforeCount => {
					return testModel.findMany(query).then(entities => {
						return Promise.resolve({
							before: beforeCount,
							after: entities.length,
						});
					});
				})
				.then(result => {
					if (many || 0 === result.before) {
						expect(result.after).to.be.equal(0);
					} else {
						expect(result.after).to.be.equal(result.before - 1);
					}
				});
		};
		it('Delete a single instance', () => {
			expect(testModel).to.respondTo('delete');
			return Promise.resolve()
				.then(() =>
					checkDestroy(
						{
							foo: undefined,
						},
						false
					)
				)
				.then(() =>
					checkDestroy(
						{
							foo: 'bar',
						},
						false
					)
				);
		});
		it('Delete multiple instances', () => {
			expect(testModel).to.respondTo('deleteMany');
			return Promise.resolve()
				.then(() =>
					checkDestroy(
						{
							foo: undefined,
						},
						true
					)
				)
				.then(() =>
					checkDestroy(
						{
							foo: 'baz',
						},
						true
					)
				)
				.then(() =>
					checkDestroy(
						{
							foo: 'qux',
						},
						true
					)
				);
		});
		it('Delete all instances', () => {
			return testModel.deleteMany({});
		});
	});
});
describe('Should be able to persist, fetch & delete an entity of the defined model.', () => {
	it('Fetch should be rejected with an error on orphan items', () => {
		const object = {
			foo: 'bar',
		};
		testedEntity = testModel.spawn(object);
		expect(testedEntity).toBeAnEntity(testModel, object, true);
		const retPromise = testedEntity.fetch();
		expect(testedEntity.state).toEqual('syncing');
		expect(testedEntity).toBeAnEntity(testModel, object, null);
		expect(retPromise).rejects.toBeInstanceOf(EntityStateError);
	});
	it('Destroy should be rejected with an error on orphan items', () => {
		const object = {
			foo: 'bar',
		};
		testedEntity = testModel.spawn(object);
		expect(testedEntity).toBeAnEntity(testModel, object, true);
		const retPromise = testedEntity.destroy();
		expect(testedEntity.state).toEqual('syncing');
		expect(testedEntity).toBeAnEntity(testModel, object, null);
		expect(retPromise).rejects.toBeInstanceOf(EntityStateError);
	});
	it('Persist should change the entity', () => {
		const object = {
			foo: 'bar',
		};
		testedEntity = testModel.spawn(object);
		expect(testedEntity).toBeAnEntity(testModel, object, true);
		const retPromise = testedEntity.persist();
		expect(testedEntity.state).toEqual('syncing');
		expect(testedEntity).toBeAnEntity(testModel, object, null);
		return retPromise.then(() => {
			expect(testedEntity).toBeAnEntity(testModel, object, SOURCE);
		});
	});
	it('Fetch should change the entity', () => {
		const object = {
			foo: 'bar',
		};
		return testModel.find(object).then(entity => {
			expect(entity).to.respondTo('fetch');
			expect(entity).toBeAnEntity(testModel, object, SOURCE);
			entity.attributes.foo = 'baz';
			expect(entity).toBeAnEntity(
				testModel,
				{
					foo: 'baz',
				},
				SOURCE
			);
			const retPromise = entity.fetch();
			expect(entity.state).toEqual('syncing');
			return retPromise.then(() => {
				expect(testedEntity).toBeAnEntity(testModel, object, SOURCE);
			});
		});
	});
	it('Destroy should change the entity', () => {
		const object = {
			foo: 'bar',
		};
		return testModel.find(object).then(entity => {
			expect(entity).to.respondTo('destroy');
			expect(entity).toBeAnEntity(testModel, object, SOURCE);
			const retPromise = entity.destroy();
			expect(entity.state).toEqual('syncing');
			return retPromise.then(() => {
				expect(entity.lastDataSource).toEqual(SOURCE);
				expect(entity.state).toEqual('orphan');
				expect(entity).toBeAnEntity(testModel, {}, null);
			});
		});
	});
});
