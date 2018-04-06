import * as _ from 'lodash';
import { resolve } from 'path';
import * as chalk from 'chalk';
import { Adapter, AdapterEntity } from '../src/adapters/base';
import { Model } from '../src/model';
import { IRawEntityAttributes, Entity } from '../src/entity/entityFactory';
import { Set as EntitySet } from '../src/entity/set';
import { Diaspora } from '../src/diaspora';
import { InMemoryAdapter } from '../src/adapters/inMemory';

process.on('unhandledRejection', r => console.log(r));
const projectPath = resolve('../');
let config;
try {
	config = require('./config.js');
} catch (err) {
	if ('MODULE_NOT_FOUND' === err.code) {
		console.error(
			'Missing required file "config.js", please copy "config-sample.js" and edit it.'
		);
	} else {
		console.error(err);
	}
	process.exit();
}

export const conf = config;

export const dataSources: { [key: string]: Adapter } = {};

const styles =
	'undefined' === typeof window
		? {
				category: (chalk as any).bold.underline.blue,
				taskCategory: (chalk as any).underline.white,
				bold: (chalk as any).bold,
				adapter: (chalk as any).bold.red,
				model: (chalk as any).bold.red,
		  }
		: {};

export const getStyle = (styleName: string, text: string) => {
	const styleFct = styles[styleName];
	if (_.isFunction(styleFct)) {
		return styleFct(text);
	}
	return text;
};

export const getConfig = (adapterName: string): object => {
	return (config && config[adapterName]) || {};
};

export const importTest = (name: string, modulePath: string) => {
	describe(name, () => {
		require(modulePath);
	});
};

export const lifecycleEvents = {
	create: [
		'beforePersist',
		'beforeValidate',
		'afterValidate',
		'beforePersistCreate',
		'afterPersistCreate',
		'afterPersist',
	],
	update: [
		'beforePersist',
		'beforeValidate',
		'afterValidate',
		'beforePersistUpdate',
		'afterPersistUpdate',
		'afterPersist',
	],
	find: ['beforeFetch', 'afterFetch'],
	delete: ['beforeDestroy', 'afterDestroy'],
};

export const createMockModel = (scope: string) => {
	const MODEL_NAME = `${scope}-test`;
	const SOURCE = `inMemory-${scope}-test`;
	return {
		adapter: Diaspora.createNamedDataSource(SOURCE, 'inMemory'),
		model: Diaspora.declareModel(MODEL_NAME, {
			sources: [SOURCE],
			//schema:     false,
			attributes: {
				foo: {
					type: 'string',
				},
				baz: {
					type: 'string',
				},
			},
		}),
		MODEL_NAME,
		SOURCE,
	};
};

const check = (
	entity: Entity,
	model: Model,
	props: IRawEntityAttributes = {},
	orphan?: boolean | string
) => {
	expect(entity).toBeInstanceOf(Entity);
	expect(entity.ctor.model).toEqual(model);
	const dataSourceName = 'string' === typeof orphan ? orphan : undefined;
	const orphanState = dataSourceName ? false : orphan;
	switch (orphanState) {
		case true:
			{
				expect(entity.state).toEqual('orphan');
			}
			break;

		case false:
			{
				expect(entity.state).not.toEqual('orphan');
			}
			break;
	}
	if (orphanState) {
		expect(entity.lastDataSource).toEqual(null);
		expect(entity.attributes).not.toHaveProperty('id');
		expect(entity.attributes).not.toHaveProperty('idHash');
	} else if (null !== orphanState) {
		const lds = entity.lastDataSource;
		if (dataSourceName) {
			expect(lds).toEqual(Diaspora.dataSources[dataSourceName]);
		} else {
			expect(lds).not.toEqual(null);
		}

		// Check dataSources weakmap
		expect(entity.dataSources).toBeInstanceOf(WeakMap);
		expect(entity.dataSources.get(lds)).toBeAnAdapterEntity(lds);

		expect(entity.attributes).toBeInstanceOf(Object);
		expect(entity.attributes).not.toHaveProperty('id');
		expect(entity.attributes).not.toHaveProperty('idHash');
	}
	_.forEach(['persist', 'fetch', 'destroy', 'toObject'], word => {
		expect(entity).toImplementMethod(word);
	});
	const toObj = entity.toObject();
	expect(entity.attributes).toMatchWithUndefined(props);
};
const hasOwnMethod = (received: any, methodName: string) => {
	return !!(received && _.isFunction(received[methodName]));
};

expect.extend({
	toImplementMethod(received: any, methodName: string) {
		const pass = hasOwnMethod(received, methodName);
		return {
			message: () =>
				`Expected to implement method ${this.utils.printExpected(methodName)}`,
			pass: pass,
		};
	},
	toImplementOneOfMethods(received: any, methodNames: string[]) {
		const pass =
			received &&
			_.some(methodNames, methodName => hasOwnMethod(received, methodName));
		return {
			message: () =>
				`Expected to implement one of methods ${this.utils.printExpected(
					methodNames.join(', ')
				)}`,
			pass: pass,
		};
	},
	toMatchWithUndefined(received: any, expected: any) {
		_.forEach(expected, (val, key) => {
			if (_.isUndefined(val)) {
				expect(received).not.toHaveProperty(key);
			} else {
				expect(received).toHaveProperty(key, val);
			}
		});
		return {
			message: () => '',
			pass: true,
		};
	},
	toBeAnEntity(
		received: any,
		expectedModel: Model,
		expectedAttributes: IRawEntityAttributes,
		expectedOrphan?: boolean | string
	) {
		check(received, expectedModel, expectedAttributes, expectedOrphan);
		return {
			message: () => '',
			pass: true,
		};
	},
	toBeAnEntitySet(
		receivedSet: any,
		expectedModel: Model,
		expectedAttributesArray: IRawEntityAttributes | IRawEntityAttributes[],
		expectedOrphan?: boolean | string
	) {
		expect(receivedSet).toBeInstanceOf(EntitySet);
		expect(receivedSet).toHaveProperty('length');
		if (_.isArray(expectedAttributesArray)) {
			expect(receivedSet).toHaveLength(expectedAttributesArray.length);
		}
		_.forEach(['persist', 'fetch', 'destroy', 'toObject'], word => {
			expect(receivedSet).toImplementMethod(word);
		});
		receivedSet.forEach((received, index) => {
			const expectedAttributes = _.isArray(expectedAttributesArray)
				? expectedAttributesArray[index]
				: expectedAttributesArray;
			expect(received).toBeAnEntity(
				expectedModel,
				expectedAttributes,
				expectedOrphan
			);
		});
		return {
			message: () => '',
			pass: true,
		};
	},
	toBeAnAdapterEntity(
		received: any,
		expectedAdapter: Adapter,
		expectedAttributes?: any
	) {
		expect(received).toBeInstanceOf(AdapterEntity);
		const receivedEntity = received as AdapterEntity;
		const adapter = receivedEntity.dataSource;
		expect(receivedEntity.dataSource).toBeInstanceOf(Adapter);
		expect(receivedEntity.dataSource).toEqual(expectedAdapter);
		expect(receivedEntity.attributes).toBeInstanceOf(Object);
		expect(receivedEntity.attributes.idHash).toBeInstanceOf(Object);
		expect(receivedEntity.attributes).toHaveProperty('id');
		expect(receivedEntity.attributes).toHaveProperty('idHash');
		expect(receivedEntity.attributes.idHash).toHaveProperty(
			adapter.name,
			receivedEntity.attributes.id
		);
		expect(receivedEntity.attributes.id).not.toBeUndefined();
		expect(receivedEntity.attributes.id).not.toBeNull();
		if ('undefined' === typeof window) {
			const baseName = (
				adapter.name[0].toUpperCase() + adapter.name.substr(1)
			).replace(/Adapter$/, '');
			expect(receivedEntity.constructor.name).toEqual(`${baseName}Entity`);
		}
		expect(receivedEntity.attributes).toMatchWithUndefined(expectedAttributes);
		return {
			message: () => '',
			pass: true,
		};
	},
	toBeAnAdapterEntitySet(
		receivedArray: any[],
		expectedAdapter: Adapter,
		expectedAttributesArray?: any[] | any
	) {
		expect(receivedArray).toBeInstanceOf(Array);
		_.forEach(receivedArray, (received, index) => {
			expect(received).toBeInstanceOf(AdapterEntity);
			const receivedEntity = received as AdapterEntity;
			const adapter = receivedEntity.dataSource;
			expect(receivedEntity.dataSource).toBeInstanceOf(Adapter);
			expect(receivedEntity.dataSource).toEqual(expectedAdapter);
			expect(receivedEntity.attributes).toBeInstanceOf(Object);
			expect(receivedEntity.attributes.idHash).toBeInstanceOf(Object);
			expect(receivedEntity.attributes).toHaveProperty('id');
			expect(receivedEntity.attributes).toHaveProperty('idHash');
			expect(receivedEntity.attributes.idHash).toHaveProperty(
				adapter.name,
				receivedEntity.attributes.id
			);
			expect(receivedEntity.attributes.id).not.toBeUndefined();
			expect(receivedEntity.attributes.id).not.toBeNull();
			if ('undefined' === typeof window) {
				const baseName = (
					adapter.name[0].toUpperCase() + adapter.name.substr(1)
				).replace(/Adapter$/, '');
				expect(receivedEntity.constructor.name).toEqual(`${baseName}Entity`);
			}
			const expectedAttributes = _.isArray(expectedAttributesArray)
				? expectedAttributesArray[index]
				: expectedAttributesArray;
			expect(receivedEntity.attributes).toMatchWithUndefined(expectedAttributes);
		});
		return {
			message: () => '',
			pass: true,
		};
	},
});

declare global {
	namespace jest {
		interface Matchers<R> {
			// Method implementation
			toImplementMethod(methodName: string): void;
			toImplementOneOfMethods(methodNames: string[]): void;
			// Matcher
			toMatchWithUndefined(expected: any);
			// Adapter Entity
			toBeAnAdapterEntity(expectedAdapter: Adapter, expected?: any): void;
			toBeAnAdapterEntitySet(
				expectedAdapter: Adapter,
				expectedAttributesArray?: any[] | any
			): void;
			// Entity
			toBeAnEntity(
				expectedModel: Model,
				expectedAttributes: IRawEntityAttributes,
				expectedOrphan?: boolean | string
			): void;
			toBeAnEntitySet(
				expectedModel: Model,
				expectedAttributesArray: IRawEntityAttributes | IRawEntityAttributes[],
				expectedOrphan?: boolean | string
			): void;
		}
	}
}
