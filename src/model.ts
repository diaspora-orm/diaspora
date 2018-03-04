import Bluebird from 'bluebird';
import _ from 'lodash';
import { IEventHandler } from 'sequential-event';

import {
	EntityFactory,
	EntitySpawner,
	Entity,
	IRawEntityAttributes,
} from './entityFactory';
import { Diaspora } from './diaspora';
import { Set } from './set';
import { Validator } from './validator';
import {
	SelectQuery,
	QueryOptionsRaw,
	QueryOptions,
} from './adapters/base/queryLanguage';
import { Adapter } from './adapters/base/adapter';
import { AdapterEntity } from './adapters/base/entity';

/**
 * @module Model
 */

export interface SourcesHash {
	[key: string]: object;
}
/**
 * Object describing a model.
 *
 * @typedef  {Object} ModelDescription
 * @author gerkin
 * @property sources         - List of sources to use with this model.
 * @property attributes      - Attributes of the model.
 * @property methods         - Methods to add to entities prototype.
 * @property staticMethods   - Static methods to add to entities.
 * @property lifecycleEvents - Events to bind on entities.
 */
export interface ModelDescriptionRaw {
	sources: string | Array<string> | { [key: string]: object | boolean };
	attributes: { [key: string]: FieldDescriptor | string };
	methods: { [key: string]: Function };
	staticMethods: { [key: string]: Function };
	// TODO: To improve
	lifecycleEvents: { [key: string]: IEventHandler };
}
export interface ModelDescription extends ModelDescriptionRaw {
	attributes: { [key: string]: FieldDescriptor };
	sources: SourcesHash;
}

/**
 * Object describing the attributes of a {@link Model~Model}.
 *
 * @typedef  FieldDescriptor
 * @author gerkin
 * @property [type]           - Expected type of the value. Either `type` or `model` should be defined, or none.
 * @property [model]          - Expected model of the value. Either `type` or `model` should be defined, or none.
 * @property [of] - Description (or array of descriptions) of possible values for this field
 * @property [required=false] - Set to `true` to require a value. Even when `true`, empty arrays are allowed. To require at least one element in an array, use the `minLength` property
 * @property [validate] - Custom validation callback.
 */
export interface FieldDescriptor {
	type?: string;
	validate?: Function | Function[];
	of?: FieldDescriptor | FieldDescriptor[];
	model?: string;
	required?: boolean;
	attributes?: { [key: string]: FieldDescriptor };
	default?: Function | string;
	enum: Array<any>;
}

interface IQueryParamsRaw {
	queryFind?: SelectQuery;
	options: QueryOptionsRaw;
	dataSourceName: string;
}
interface IQueryParams extends IQueryParamsRaw {
	dataSource: Adapter;
}

const findArgs = (model: Model, ...argsLeft: Array<any>): IQueryParams => {
	let paramsRaw: IQueryParamsRaw;
	if (_.isString(argsLeft[1]) && _.isNil(argsLeft[2])) {
		// TODO: Elude case...
		paramsRaw = {
			dataSourceName: argsLeft[1],
			options: {},
		};
	} else if (
		_.isString(argsLeft[0]) &&
		_.isNil(argsLeft[1]) &&
		_.isNil(argsLeft[2])
	) {
		paramsRaw = {
			dataSourceName: argsLeft[0],
			queryFind: {},
			options: {},
		};
	} else {
		paramsRaw = {
			queryFind: argsLeft[0],
			options: argsLeft[1],
			dataSourceName: argsLeft[2],
		};
	}
	return _.defaults(
		{ dataSource: model.getDataSource(paramsRaw.dataSourceName) },
		paramsRaw
	);
};

const makeSet = (
	model: Model,
	dataSourceEntities: Array<AdapterEntity | undefined>
): Set => {
	const newEntities = _.map(
		dataSourceEntities,
		dataSourceEntity => new model.entityFactory(dataSourceEntity)
	);
	const set = new Set(model, newEntities);
	return set;
};
const makeEntity = (
	model: Model,
	dataSourceEntity: AdapterEntity
): Entity | void => {
	if (_.isNil(dataSourceEntity)) {
		return;
	}
	const newEntity = new model.entityFactory(dataSourceEntity);
	return newEntity;
};

enum EDeleteMethod {
	'deleteOne',
	'deleteMany',
}
const doDelete = (methodName: EDeleteMethod, model: Model) => {
	return (
		queryFind: SelectQuery = {},
		options: QueryOptionsRaw = {},
		dataSourceName: string
	): Bluebird<void> => {
		// Sort arguments
		const args = findArgs(model, queryFind, options, dataSourceName);
		return (args.dataSource as any)[methodName](
			model.name,
			args.queryFind,
			args.options
		);
	};
};

async function doFindUpdate(
	model: Model,
	plural: true,
	queryFind: SelectQuery,
	options: QueryOptionsRaw,
	dataSourceName: string,
	update?: IRawEntityAttributes
): Bluebird<Set>;
async function doFindUpdate(
	model: Model,
	plural: false,
	queryFind: SelectQuery,
	options: QueryOptionsRaw,
	dataSourceName: string,
	update?: IRawEntityAttributes
): Bluebird<Entity | undefined>;
async function doFindUpdate(
	model: Model,
	plural: boolean,
	queryFind: SelectQuery,
	options: QueryOptionsRaw,
	dataSourceName: string,
	update?: IRawEntityAttributes
): Bluebird<Entity | undefined | Set> {
	// Sort arguments
	const queryComponents = findArgs(model, queryFind, options, dataSourceName);
	const args = _([model.name, queryComponents.queryFind])
		.push(update)
		.push(queryComponents.options)
		.compact()
		.value();
	const queryMethod = (update ? 'update' : 'find') + (plural ? 'Many' : 'One');
	const queryResults = (await (queryComponents.dataSource as any)[queryMethod](
		...args
	)) as AdapterEntity | AdapterEntity[];
	if (queryResults instanceof Array) {
		return makeSet(model, queryResults);
	} else {
		const entity = makeEntity(model, queryResults);
		return entity ? entity : undefined;
	}
}

const normalizeRemaps = (modelDesc: ModelDescriptionRaw) => {
	const sourcesRaw = modelDesc.sources;
	let sources: SourcesHash;
	if (_.isString(sourcesRaw)) {
		sources = { [sourcesRaw as string]: {} };
	} else if (_.isArrayLike(sourcesRaw)) {
		sources = _.zipObject(sourcesRaw, _.times(sourcesRaw.length, _.constant({})));
	} else {
		sources = _.mapValues(sourcesRaw, (remap, dataSourceName) => {
			if (true === remap) {
				return {};
			} else if (_.isObject(remap)) {
				return remap as object;
			} else {
				throw new TypeError(
					`Datasource "${dataSourceName}" value is invalid: expect \`true\` or a remap hash, but have ${JSON.stringify(
						remap
					)}`
				);
			}
		});
	}
	return sources;
};

const deepFreeze = <T>(object: T) => {
	const deepMap = (obj: T, mapper: Function): T => {
		return mapper(
			_.mapValues(obj, function(v) {
				return _.isPlainObject(v) ? deepMap(v, mapper) : v;
			})
		);
	};
	return deepMap(object, Object.freeze);
};

/**
 * The model class is used to interact with the population of all data of the same type.
 */
export class Model {
	public attributes: { [key: string]: FieldDescriptor };

	private _dataSources: { [key: string]: Adapter };
	public get dataSources() {
		return this._dataSources;
	}
	private defaultDataSource: string;
	private _entityFactory: EntitySpawner;
	public get entityFactory() {
		return this._entityFactory;
	}
	private _validator: Validator;
	public get validator() {
		return this._validator;
	}
	/**
	 * Create a new Model that is allowed to interact with all entities of data sources tables selected.
	 *
	 * @author gerkin
	 * @param name      - Name of the model.
	 * @param modelDesc - Hash representing the configuration of the model.
	 */
	constructor(public name: string, modelDesc: ModelDescriptionRaw) {
		// Check model configuration
		if (
			!modelDesc.hasOwnProperty('sources') ||
			!(
				_.isArrayLike(modelDesc.sources) ||
				_.isObject(modelDesc.sources) ||
				_.isString(modelDesc.sources)
			)
		) {
			throw new TypeError(
				`Expect model sources to be either a string, an array or an object, had ${JSON.stringify(
					modelDesc.sources
				)}.`
			);
		}
		// Normalize our sources: normalized form is an object with keys corresponding to source name, and key corresponding to remaps
		const sourcesNormalized = normalizeRemaps(modelDesc);
		// List sources required by this model
		const sourceNames = _.keys(sourcesNormalized);
		const modelSources = _.pick(Diaspora.dataSources, sourceNames);
		const missingSources = _.difference(sourceNames, _.keys(modelSources));
		if (0 !== missingSources.length) {
			throw new Error(
				`Missing data sources ${missingSources.map(v => `"${v}"`).join(', ')}`
			);
		}

		if (!_.isObject(modelDesc.attributes)) {
			throw new TypeError(
				`Model attributes should be an object, have ${JSON.stringify(
					modelDesc.attributes
				)}`
			);
		}

		// Now, we are sure that config is valid. We can configure our _dataSources with model options, and set `this` properties.
		const modelDescNormalized = modelDesc as ModelDescription;
		_.forEach(sourcesNormalized, (remap, sourceName) =>
			modelSources[sourceName].configureCollection(name, remap)
		);
		this._dataSources = modelSources;
		this.defaultDataSource = _(modelSources)
			.keys()
			.first() as string;
		this._entityFactory = EntityFactory(name, modelDescNormalized, this);
		this._validator = new Validator(modelDescNormalized.attributes);
		// TODO: Normalize attributes before
		this.attributes = deepFreeze(modelDesc.attributes) as {
			[key: string]: FieldDescriptor;
		};
	}

	/**
	 * Create a new Model that is allowed to interact with all entities of data sources tables selected.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if requested source name does not exists.
	 * @param   sourceName - Name of the source to get. It corresponds to one of the sources you set in {@link Model#modelDesc}.Sources.
	 * @returns Source adapter with requested name.
	 */
	getDataSource(sourceName: string = this.defaultDataSource): Adapter {
		if (_.isNil(sourceName)) {
			sourceName = this.defaultDataSource;
		} else if (!this._dataSources.hasOwnProperty(sourceName)) {
			throw new Error(
				`Unknown data source "${sourceName}" in model "${
					this.name
				}", available are ${_.keys(this._dataSources)
					.map(v => `"${v}"`)
					.join(', ')}`
			);
		}
		return this._dataSources[sourceName];
	}

	/**
	 * Create a new *orphan* {@link Entity entity}.
	 *
	 * @author gerkin
	 * @param   source - Object to copy attributes from.
	 * @returns New *orphan* entity.
	 */
	spawn(source: object): Entity {
		const newEntity = new this.entityFactory(source);
		return newEntity;
	}

	/**
	 * Create multiple new *orphan* {@link Entity entities}.
	 *
	 * @author gerkin
	 * @param   sources - Array of objects to copy attributes from.
	 * @returns Set with new *orphan* entities.
	 */
	spawnMany(sources: object[]): Set {
		return new Set(this, _.map(sources, source => this.spawn(source)));
	}

	/**
	 * Insert a raw source object in the data store.
	 *
	 * @author gerkin
	 * @param   source         - Object to copy attributes from.
	 * @param   dataSourceName - Name of the data source to insert in.
	 * @returns Promise resolved with new *sync* {@link Entity entity}.
	 */
	async insert(
		source: object,
		dataSourceName: string = this.defaultDataSource
	): Bluebird<Entity> {
		const dataSource = this.getDataSource(dataSourceName);
		const entity = await dataSource.insertOne(this.name, source);
		return new this.entityFactory(entity);
	}

	/**
	 * Insert multiple raw source objects in the data store.
	 *
	 * @author gerkin
	 * @param   sources        - Array of object to copy attributes from.
	 * @param   dataSourceName - Name of the data source to insert in.
	 * @returns Promise resolved with a {@link Set set} containing new *sync* entities.
	 */
	async insertMany(
		sources: object[],
		dataSourceName: string = this.defaultDataSource
	): Bluebird<Set> {
		const dataSource = this.getDataSource(dataSourceName);
		const entities = await dataSource.insertMany(this.name, sources);
		return makeSet(this, entities);
	}

	/**
	 * Retrieve a single entity from specified data source that matches provided `queryFind` and `options`.
	 *
	 * @author gerkin
	 * @param   queryFind      - Query to get desired entity.
	 * @param   options        - Options for this query.
	 * @param   dataSourceName - Name of the data source to get entity from.
	 * @returns Promise resolved with the found {@link Entity entity} in *sync* state.
	 */
	async find(
		queryFind: SelectQuery,
		options: QueryOptionsRaw = {},
		dataSourceName: string = this.defaultDataSource
	): Bluebird<Entity | null> {
		const updated = await doFindUpdate(
			this,
			false,
			queryFind,
			options,
			dataSourceName
		);
		return updated ? updated : null;
	}

	/**
	 * Retrieve multiple entities from specified data source that matches provided `queryFind` and `options`.
	 *
	 * @author gerkin
	 * @param   queryFind      - Query to get desired entities.
	 * @param   options        - Options for this query.
	 * @param   dataSourceName - Name of the data source to get entities from.
	 * @returns Promise resolved with a {@link Set set} of found entities in *sync* state.
	 */
	async findMany(
		queryFind: SelectQuery,
		options: QueryOptionsRaw = {},
		dataSourceName: string = this.defaultDataSource
	): Bluebird<Set> {
		return doFindUpdate(this, true, queryFind, options, dataSourceName);
	}

	/**
	 * Update a single entity from specified data source that matches provided `queryFind` and `options`.
	 *
	 * @author gerkin
	 * @param   queryFind      - Query to get desired entity.
	 * @param   update         - Attributes to update on matched set.
	 * @param   options        - Options for this query.
	 * @param   dataSourceName - Name of the data source to get entity from.
	 * @returns Promise resolved with the updated {@link Entity entity} in *sync* state.
	 */
	async update(
		queryFind: SelectQuery,
		update: object,
		options: QueryOptionsRaw = {},
		dataSourceName: string = this.defaultDataSource
	): Bluebird<Entity | null> {
		const updated = await doFindUpdate(
			this,
			false,
			queryFind,
			options,
			dataSourceName,
			update
		);
		return updated ? updated : null;
	}

	/**
	 * Update multiple entities from specified data source that matches provided `queryFind` and `options`.
	 *
	 * @author gerkin
	 * @param   queryFind      - Query to get desired entities.
	 * @param   update         - Attributes to update on matched set.
	 * @param   options        - Options for this query.
	 * @param   dataSourceName - Name of the data source to get entities from.
	 * @returns Promise resolved with the {@link Set set} of found entities in *sync* state.
	 */
	async updateMany(
		queryFind: SelectQuery,
		update: object,
		options: QueryOptionsRaw = {},
		dataSourceName: string = this.defaultDataSource
	): Bluebird<Set> {
		return doFindUpdate(this, true, queryFind, options, dataSourceName, update);
	}

	/**
	 * Delete a single entity from specified data source that matches provided `queryFind` and `options`.
	 *
	 * @author gerkin
	 * @param   queryFind      - Query to get desired entity.
	 * @param   options        - Options for this query.
	 * @param   dataSourceName - Name of the data source to get entity from.
	 * @returns Promise resolved with `undefined`.
	 */
	async delete(
		queryFind: SelectQuery,
		options: QueryOptionsRaw = {},
		dataSourceName: string = this.defaultDataSource
	): Bluebird<void> {
		return doDelete(EDeleteMethod.deleteOne, this)(
			queryFind,
			options,
			dataSourceName
		);
	}

	/**
	 * Delete multiple entities from specified data source that matches provided `queryFind` and `options`.
	 *
	 * @author gerkin
	 * @param   queryFind      - Query to get desired entities.
	 * @param   options        - Options for this query.
	 * @param   dataSourceName - Name of the data source to get entities from.
	 * @returns Promise resolved with `undefined`.
	 */
	async deleteMany(
		queryFind: SelectQuery = {},
		options: QueryOptionsRaw = {},
		dataSourceName: string = this.defaultDataSource
	): Bluebird<void> {
		return doDelete(EDeleteMethod.deleteMany, this)(
			queryFind,
			options,
			dataSourceName
		);
	}
}

module.exports = Model;
