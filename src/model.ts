import * as _ from 'lodash';
import { IEventHandler } from 'sequential-event';

import {
	EntityFactory,
	EntitySpawner,
	Entity,
	IRawEntityAttributes,
} from './entity/entityFactory';
import { DiasporaStatic, IDataSourceRegistry } from './diaspora';
import { Set } from './entity/set';
import { Validator } from './validator';
import { Adapter } from './adapters/base/adapter';
import { AdapterEntity } from './adapters/base/entity';
import { QueryLanguage } from './adapters/base';
import { deepFreeze } from './utils';

export interface SourcesHash {
	[key: string]: object;
}

/**
 * Object describing a model.
 *
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
	methods?: { [key: string]: Function };
	staticMethods?: { [key: string]: Function };
	// TODO: To improve
	lifecycleEvents?: { [key: string]: IEventHandler | IEventHandler[] };
}
export interface ModelDescription extends ModelDescriptionRaw {
	attributes: { [key: string]: FieldDescriptor };
	sources: SourcesHash;
}

export interface BaseFieldDescriptor {
	type?: string;
	validate?: Function | Function[];
	required?: boolean;
	default?: Function | string;
}
export interface ArrayFieldDescriptor extends BaseFieldDescriptor {
	of: FieldDescriptor | FieldDescriptor[];
}
export interface ObjectFieldDescriptor extends BaseFieldDescriptor {
	attributes: { [key: string]: FieldDescriptor };
}
export interface EnumFieldDescriptor extends BaseFieldDescriptor {
	enum: Array<any>;
}
export interface RelationalFieldDescriptor extends BaseFieldDescriptor {
	model: string;
}

export const FieldDescriptorTypeChecks = {
	isArrayFieldDescriptor(
		fieldDescriptor: FieldDescriptor
	): fieldDescriptor is ArrayFieldDescriptor {
		return fieldDescriptor.hasOwnProperty('of');
	},
	isObjectFieldDescriptor(
		fieldDescriptor: FieldDescriptor
	): fieldDescriptor is ObjectFieldDescriptor {
		return fieldDescriptor.hasOwnProperty('attributes');
	},
	isEnumFieldDescriptor(
		fieldDescriptor: FieldDescriptor
	): fieldDescriptor is EnumFieldDescriptor {
		return fieldDescriptor.hasOwnProperty('enum');
	},
	isRelationalFieldDescriptor(
		fieldDescriptor: FieldDescriptor
	): fieldDescriptor is RelationalFieldDescriptor {
		return fieldDescriptor.hasOwnProperty('model');
	},
};

/**
 * Object describing the attributes of a {@link Model~Model}.
 *
 * @typedef FieldDescriptor
 * @author gerkin
 * @property type     - Expected type of the value. Either `type` or `model` should be defined, or none.
 * @property model    - Expected model of the value. Either `type` or `model` should be defined, or none.
 * @property of       - Description (or array of descriptions) of possible values for this field
 * @property required - Set to `true` to require a value. Even when `true`, empty arrays are allowed. To require at least one element in an array, use the `minLength` property
 * @property validate - Custom validation callback.
 */
export type FieldDescriptor =
	| BaseFieldDescriptor
	| ArrayFieldDescriptor
	| ObjectFieldDescriptor
	| EnumFieldDescriptor
	| RelationalFieldDescriptor;

interface IQueryParamsRaw {
	queryFind?: QueryLanguage.SelectQuery;
	options: QueryLanguage.QueryOptionsRaw;
	dataSourceName: string;
}
interface IQueryParams<T extends AdapterEntity> extends IQueryParamsRaw {
	dataSource: Adapter<T>;
}

const findArgs = (
	model: Model,
	...argsLeft: Array<any>
): IQueryParams<AdapterEntity> => {
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
	Single = 'deleteOne',
	Multiple = 'deleteMany',
}
const doDelete = (methodName: EDeleteMethod, model: Model) => {
	return (
		queryFind: QueryLanguage.SelectQuery = {},
		options: QueryLanguage.QueryOptionsRaw = {},
		dataSourceName: string
	): Promise<void> => {
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
	queryFind: QueryLanguage.SelectQuery,
	options: QueryLanguage.QueryOptionsRaw,
	dataSourceName: string,
	update?: IRawEntityAttributes
): Promise<Set>;
async function doFindUpdate(
	model: Model,
	plural: false,
	queryFind: QueryLanguage.SelectQuery,
	options: QueryLanguage.QueryOptionsRaw,
	dataSourceName: string,
	update?: IRawEntityAttributes
): Promise<Entity | undefined>;
async function doFindUpdate(
	model: Model,
	plural: boolean,
	queryFind: QueryLanguage.SelectQuery,
	options: QueryLanguage.QueryOptionsRaw,
	dataSourceName: string,
	update?: IRawEntityAttributes
): Promise<Entity | undefined | Set> {
	// Sort arguments
	const queryComponents = findArgs(model, queryFind, options, dataSourceName);
	const args = _.chain([model.name, queryComponents.queryFind])
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

/**
 * The model class is used to interact with the population of all data of the same type.
 */
export class Model {
	public attributes: { [key: string]: FieldDescriptor };

	private _dataSources: { [key: string]: Adapter<AdapterEntity> };
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

	public get ctor() {
		return this.constructor as typeof Model;
	}
	/**
	 * Create a new Model that is allowed to interact with all entities of data sources tables selected.
	 *
	 * @author gerkin
	 * @param name      - Name of the model.
	 * @param modelDesc - Hash representing the configuration of the model.
	 */
	constructor(
		private Diaspora: DiasporaStatic,
		public name: string,
		modelDesc: ModelDescriptionRaw
	) {
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
		const modelSources: IDataSourceRegistry = _.pick(
			Diaspora.dataSources,
			sourceNames
		);
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
		this.defaultDataSource = _.chain(modelSources)
			.keys()
			.head()
			.value() as string;
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
	getDataSource(
		sourceName: string = this.defaultDataSource
	): Adapter<AdapterEntity> {
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
	): Promise<Entity> {
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
	): Promise<Set> {
		const dataSource = this.getDataSource(dataSourceName);
		const entities: AdapterEntity[] = (await dataSource.insertMany(
			this.name,
			sources
		)) as any;
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
		queryFind: QueryLanguage.SelectQuery,
		options: QueryLanguage.QueryOptionsRaw = {},
		dataSourceName: string = this.defaultDataSource
	): Promise<Entity | null> {
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
		queryFind: QueryLanguage.SelectQuery,
		options: QueryLanguage.QueryOptionsRaw = {},
		dataSourceName: string = this.defaultDataSource
	): Promise<Set> {
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
		queryFind: QueryLanguage.SelectQuery,
		update: object,
		options: QueryLanguage.QueryOptionsRaw = {},
		dataSourceName: string = this.defaultDataSource
	): Promise<Entity | null> {
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
		queryFind: QueryLanguage.SelectQuery,
		update: object,
		options: QueryLanguage.QueryOptionsRaw = {},
		dataSourceName: string = this.defaultDataSource
	): Promise<Set> {
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
		queryFind: QueryLanguage.SelectQuery,
		options: QueryLanguage.QueryOptionsRaw = {},
		dataSourceName: string = this.defaultDataSource
	): Promise<void> {
		return doDelete(EDeleteMethod.Single, this)(
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
		queryFind: QueryLanguage.SelectQuery = {},
		options: QueryLanguage.QueryOptionsRaw = {},
		dataSourceName: string = this.defaultDataSource
	): Promise<void> {
		return doDelete(EDeleteMethod.Multiple, this)(
			queryFind,
			options,
			dataSourceName
		);
	}
}
