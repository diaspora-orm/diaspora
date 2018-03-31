import * as _ from 'lodash';

import {
	Adapter,
	AdapterEntity,
	QueryLanguage,
	IAdapterEntityCtr,
	IAdapterCtr,
} from './adapters/base';
import { Entity, IRawEntityAttributes, EntityUid } from './entityFactory';
import { Set } from './set';
import {
	ModelDescription,
	FieldDescriptor,
	Model,
	ModelDescriptionRaw,
} from './model';
import { logger } from './logger';
import { InMemoryAdapter } from './adapters/inMemory';
import { WebApiAdapter } from './adapters/webApi';
import { WebStorageAdapter } from './adapters/webStorage';

/**
 * Event emitter that can execute async handlers in sequence
 *
 * @typedef {Object} SequentialEvent
 * @author Gerkin
 * @see {@link https://gerkindev.github.io/SequentialEvent.js/SequentialEvent.html Sequential Event documentation}.
 */

interface IAdapterRegistry {
	[key: string]: IAdapterCtr;
}
export interface IDataSourceRegistry {
	[key: string]: Adapter;
}
interface IModelRegistry {
	[key: string]: Model;
}
interface IRemapIterator {
	(entity: IRawEntityAttributes): void;
}
interface IQueryTypeDescriptor {
	full: string;
	query: string;
	number: string;
}

/**
 * Diaspora main namespace
 * @namespace Diaspora
 * @public
 * @author gerkin
 */
export class DiasporaStatic {
	private static _instance: DiasporaStatic;
	public static get instance() {
		if (DiasporaStatic._instance) {
			return DiasporaStatic._instance;
		} else {
			return (DiasporaStatic._instance = new this());
		}
	}

	/**
	 * Logger used by Diaspora and its adapters. You can use this property to configure winston. On brower environment, this is replaced by a reference to global {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/console Console}.
	 *
	 * @author gerkin
	 */
	public get logger() {
		return logger;
	}

	/**
	 * Hash containing all available adapters. The only universal adapter is `inMemory`.
	 *
	 * @author gerkin
	 * @see Use {@link Diaspora.registerAdapter} to add adapters.
	 */
	private adapters: IAdapterRegistry = {};

	/**
	 * Hash containing all available data sources.
	 *
	 * @author gerkin
	 * @see Use {@link Diaspora.createNamedDataSource} or {@link Diaspora.registerDataSource} to make data sources available for models.
	 */
	private _dataSources: IDataSourceRegistry = {};
	public get dataSources() {
		return _.assign({}, this._dataSources);
	}

	/**
	 * Hash containing all available models.
	 *
	 * @author gerkin
	 * @see Use {@link Diaspora.declareModel} to add models.
	 */
	private models: IModelRegistry = {};

	private static ensureAllEntities(adapter: Adapter, table: string) {
		// Filter our results
		const filterResults = (entity: AdapterEntity | object): AdapterEntity => {
			// Remap fields
			const remappedEntity = adapter.remapOutput(
				table,
				entity instanceof adapter.classEntity ? entity.attributes : entity
			);
			// Force results to be class instances
			return new adapter.classEntity(remappedEntity, adapter);
		};

		return (
			results: AdapterEntity | AdapterEntity[] | object | object[]
		): AdapterEntity | AdapterEntity[] | void => {
			if (_.isNil(results)) {
				return;
			} else if (_.isArrayLike(results)) {
				return _.map(results, filterResults);
			} else {
				return filterResults(results);
			}
		};
	}

	private static remapArgs(
		args: any[],
		optIndex: number | false,
		update: boolean,
		queryType: any,
		remapFunction: IRemapIterator
	) {
		if (false !== optIndex) {
			const options = args[optIndex] as QueryLanguage.QueryOptions;
			// Remap input objects
			if (true === options.remapInput) {
				// Remap the query
				args[0] = remapFunction(args[0]);

				// Remap also the update if there are some
				if (true === update) {
					args[1] = remapFunction(args[1]);
				}
			}
			options.remapInput = false;
		} else if ('insert' === queryType.query) {
			// If inserting, then, we'll need to know if we are inserting *several* entities or a *single* one.
			if ('many' === queryType.number) {
				// If inserting *several* entities, map the array to remap each entity objects...
				args[0] = _.map(
					args[0] as IRawEntityAttributes[],
					(insertion: IRawEntityAttributes) => remapFunction(insertion)
				);
			} else {
				// ... or we are inserting a *single* one. We still need to remap entity.
				args[0] = remapFunction(args[0]);
			}
		}
	}

	private static getRemapFunction(adapter: Adapter, table: string) {
		return (query: IRawEntityAttributes) => {
			return adapter.remapInput(table, query);
		};
	}

	private static wrapDataSourceAction(
		callback: Function,
		queryType: string,
		adapter: Adapter
	) {
		return (table: string, ...args: any[]) => {
			// Transform arguments for find, update & delete
			let optIndex: number | false = false;
			let upd = false;
			if (['find', 'delete'].includes(queryType)) {
				// For find & delete, options are 3rd argument (so 2nd item in `args`)
				optIndex = 1;
			} else if ('update' === queryType) {
				// For update, options are 4th argument (so 3nd item in `args`), and `upd` flag is toggled on.
				optIndex = 2;
				upd = true;
			}
			try {
				if (false !== optIndex) {
					// Options to canonical
					args[optIndex] = adapter.normalizeOptions(args[optIndex]);
					// Query search to cannonical
					args[0] = adapter.normalizeQuery(args[0], args[optIndex]);
				}
				DiasporaStatic.remapArgs(
					args,
					optIndex,
					upd,
					queryType,
					DiasporaStatic.getRemapFunction(adapter, table)
				);
			} catch (err) {
				return Promise.reject(err);
			}

			// Hook after promise resolution
			return callback
				.call(adapter, table, ...args)
				.then(DiasporaStatic.ensureAllEntities(adapter, table));
		};
	}

	private static ERRORS = {
		NON_EMPTY_STR: _.template(
			'<%= c %> <%= p %> must be a non empty string, had "<%= v %>"'
		),
	};

	private static requireName(classname: string, value: any) {
		if (!_.isString(value) && value.length > 0) {
			throw new Error(
				DiasporaStatic.ERRORS.NON_EMPTY_STR({
					c: classname,
					p: 'name',
					v: value,
				})
			);
		}
	}

	/**
	 * Create a data source (usually, a database connection) that may be used by models.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if provided `adapter` label does not correspond to any adapter registered.
	 * @param   adapterLabel - Label of the adapter used to create the data source.
	 * @param   config       - Adapter specific configuration. Check your adapter's doc
	 * @returns New adapter spawned.
	 */
	createDataSource(adapterLabel: string, sourceName?: string, ...config: any[]) {
		if (!this.adapters.hasOwnProperty(adapterLabel)) {
			const moduleName = `diaspora-${adapterLabel}`;
			try {
				try {
					require.resolve(moduleName);
				} catch (e) {
					throw new Error(
						`Unknown adapter "${adapterLabel}" (expected in module "${moduleName}"). Available currently are ${Object.keys(
							this.adapters
						).join(', ')}. Additionnaly, an error was thrown: ${e}`
					);
				}
				require(moduleName);
			} catch (e) {
				throw new Error(
					`Could not load adapter "${adapterLabel}" (expected in module "${moduleName}"), an error was thrown: ${e}`
				);
			}
		}
		const adapterCtr = this.adapters[adapterLabel];
		const baseAdapter = new adapterCtr(sourceName || adapterLabel, ...config);
		const newDataSource = new Proxy(baseAdapter, {
			get(target: any, key: string) {
				// If this is an adapter action method, wrap it with filters. Our method keys are only string, not tags
				if (_.isString(key)) {
					let method = key.match(/^(find|update|insert|delete)(Many|One)$/);
					if (null !== method) {
						method = method as RegExpMatchArray;
						method[2] = method[2].toLowerCase();
						// Cast regex match to object like this: {full: 'findMany', query: 'find', number: 'many'}
						const methodObj: IQueryTypeDescriptor = {
							full: method[0],
							query: method[1],
							number: method[2],
						};
						return DiasporaStatic.wrapDataSourceAction(
							target[key],
							methodObj.query as string,
							target
						);
					}
				}
				return target[key];
			},
		});
		return newDataSource;
	}

	/**
	 * Create a data source (usually, a database connection) that may be used by models.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if provided `adapter` label does not correspond to any adapter registered.
	 * @param   sourceName   - Name associated with this datasource.
	 * @param   adapterLabel - Label of the adapter used to create the data source.
	 * @param   configHash   - Configuration hash. This configuration hash depends on the adapter we want to use.
	 * @returns New adapter spawned.
	 */
	createNamedDataSource(
		sourceName: string,
		adapterLabel: string,
		...otherConfig: any[]
	) {
		DiasporaStatic.requireName('DataSource', sourceName);
		const dataSource = this.createDataSource(
			adapterLabel,
			sourceName,
			...otherConfig
		);
		if (this._dataSources.hasOwnProperty(sourceName)) {
			throw new Error(`DataSource name already used, had "${sourceName}"`);
		}
		this._dataSources[sourceName] = dataSource;
		return dataSource;
	}

	/**
	 * Create a new Model with provided description.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if parameters are incorrect.
	 * @param   name      - Name associated with this datasource.
	 * @param   modelDesc - Description of the model to define.
	 * @returns Model created.
	 */
	declareModel(name: string, modelDesc: ModelDescriptionRaw) {
		if (_.isString(name) && name.length > 0) {
			DiasporaStatic.requireName('Model', name);
		}
		if (!_.isObject(modelDesc)) {
			throw new Error('"modelDesc" must be an object');
		}
		const model = new Model(this, name, modelDesc);
		this.models[name] = model;
		return model;
	}

	/**
	 * Register a new adapter and make it available to use by models.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if an adapter already exists with same label.
	 * @throws  {TypeError} Thrown if adapter does not extends {@link Adapters.DiasporaAdapter}.
	 * @param   label   - Label of the adapter to register.
	 * @param   adapter - The adapter to register.
	 * @returns This function does not return anything.
	 */
	registerAdapter(label: string, adapter: IAdapterCtr) {
		if (this.adapters.hasOwnProperty(label)) {
			throw new Error(`Adapter with label "${label}" already exists.`);
		}
		// Check inheritance of adapter
		/*if ( !( adapter.prototype instanceof Diaspora.components.Adapters.Adapter )) {
			throw new TypeError( `Trying to register an adapter with label "${ label }", but it does not extends DiasporaAdapter.` );
		}*/
		this.adapters[label] = adapter;
	}
}

export const Diaspora = DiasporaStatic.instance;

// Register available built-in adapters
Diaspora.registerAdapter('inMemory', InMemoryAdapter);
Diaspora.registerAdapter('webApi', WebApiAdapter);
// Register webStorage only if in browser
if (process.browser) {
	Diaspora.registerAdapter('webStorage', WebStorageAdapter);
}
