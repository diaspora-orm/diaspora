import _ from 'lodash';
import { Winston } from 'winston';

import { Adapter, AdapterEntity, QueryLanguage } from './adapters/base';
import { Entity, IRawEntityAttributes, EntityUid } from './entityFactory';
import { Set } from './set';
import {
	ModelDescription,
	FieldDescriptor,
	Model,
	ModelDescriptionRaw,
} from './model';

/**
 * Event emitter that can execute async handlers in sequence
 *
 * @typedef {Object} SequentialEvent
 * @author Gerkin
 * @see {@link https://gerkindev.github.io/SequentialEvent.js/SequentialEvent.html Sequential Event documentation}.
 */

interface IAdapterRegistry {
	[key: string]: typeof Adapter;
}
export interface IDataSourceRegistry {
	[key: string]: Adapter<AdapterEntity>;
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

const ensureAllEntities = (adapter: Adapter<AdapterEntity>, table: string) => {
	// Filter our results
	const filterResults = (entity: any): any => {
		// Remap fields
		entity = adapter.remapOutput(table, entity);
		// Force results to be class instances
		if (entity instanceof adapter.classEntity) {
			return new adapter.classEntity(entity, adapter);
		}
		return entity;
	};

	return (results: Entity | Entity[]): Entity | Entity[] | void => {
		if (_.isNil(results)) {
			return;
		} else if (_.isArrayLike(results)) {
			return _.map(results, filterResults);
		} else {
			return filterResults(results);
		}
	};
};

const remapArgs = (
	args: any[],
	optIndex: number | false,
	update: boolean,
	queryType: any,
	remapFunction: IRemapIterator
) => {
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
};

const getRemapFunction = (adapter: Adapter<AdapterEntity>, table: string) => {
	return (query: IRawEntityAttributes) => {
		return adapter.remapInput(table, query);
	};
};

const wrapDataSourceAction = (
	callback: Function,
	queryType: string,
	adapter: Adapter<AdapterEntity>
) => {
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
			remapArgs(args, optIndex, upd, queryType, getRemapFunction(adapter, table));
		} catch (err) {
			return Promise.reject(err);
		}

		// Hook after promise resolution
		return callback
			.call(adapter, table, ...args)
			.then(ensureAllEntities(adapter, table));
	};
};

const ERRORS = {
	NON_EMPTY_STR: _.template(
		'<%= c %> <%= p %> must be a non empty string, had "<%= v %>"'
	),
};

const requireName = (classname: string, value: any) => {
	if (!_.isString(value) && value.length > 0) {
		throw new Error(
			ERRORS.NON_EMPTY_STR({
				c: classname,
				p: 'name',
				v: value,
			})
		);
	}
};

const getDefaultFunction = (identifier: any | Function) => {
	if (_.isString(identifier)) {
		const match = identifier.match(/^(.+?)(?:::(.+?))+$/);
		if (match) {
			const parts = identifier.split('::');
			const namedFunction = _.get(DiasporaStatic.namedFunctions, parts);
			if (_.isFunction(namedFunction)) {
				return namedFunction();
			}
		}
	}
	return identifier;
};

/**
 * Diaspora main namespace
 * @namespace Diaspora
 * @public
 * @author gerkin
 */
export class DiasporaStatic {
	static namedFunctions = {
		Diaspora: {
			'Date.now()': () => new Date(),
		},
	};

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
	private _logger: Winston | Console | any = (() => {
		if (!process.browser) {
			const winston = require('winston');
			const { createLogger, format, transports } = winston;
			const { combine, timestamp, label, prettyPrint, json, simple } = format;

			const log = createLogger({
				level: 'silly',
				format: json(),
				transports: [
					//
					// - Write to all logs with level `info` and below to `combined.log`
					// - Write all logs error (and below) to `error.log`.
					//
				],
			});

			//
			// If we're not in production then log to the `console` with the format:
			// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
			//
			if (process.env.NODE_ENV !== 'production') {
				const trimToLength = (
					str: string | number,
					len: number,
					filler = ' ',
					left = true
				) => {
					filler = filler.repeat(len);
					str = left ? filler + str : str + filler;
					return str.slice(left ? -len : len);
				};
				const td = _.partialRight(trimToLength, 2, '0') as (
					str: string | number
				) => string;
				const formatDate = (date = new Date()) => {
					return `${td(date.getFullYear())}/${td(date.getMonth() + 1)}/${td(
						date.getDay()
					)} ${td(date.getHours())}:${td(date.getMinutes())}:${td(
						date.getSeconds()
					)}`;
				};

				log.add(
					new transports.Console({
						format: combine(
							format.colorize(),
							// TODO: replace with logform TransformableInfos when Winston typings updated to 3.x
							format((infos: any, opts: any) => {
								const MESSAGE = Symbol.for('message');
								const LEVEL = Symbol.for('level');
								const level = infos[LEVEL];
								let message = `${infos.level.replace(level, 'Diaspora: ' + level)}${
									log.paddings[level]
								}@${formatDate()} => ${infos.message}`;
								const omittedKeys = ['level', 'message', 'splat'];
								if (!_.isEmpty(_.difference(_.keys(infos), omittedKeys))) {
									message += ' ' + JSON.stringify(_.omit(infos, omittedKeys));
								}
								infos[MESSAGE] = message;
								return infos;
							})()
						),
					})
				);
			}
			return log;
		} else {
			return console;
		}
	})();
	public get logger() {
		return this._logger;
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

	/**
	 * Set default values if required.
	 *
	 * @author gerkin
	 * @param   entity    - Entity to set defaults in.
	 * @param   modelDesc - Model description.
	 * @returns  Entity merged with default values.
	 */
	default(
		entity: IRawEntityAttributes,
		modelDesc: { [key: string]: FieldDescriptor }
	) {
		// Apply method `defaultField` on each field described
		return _.defaults(
			entity,
			_.mapValues(modelDesc, (fieldDesc, field) =>
				this.defaultField(entity[field], fieldDesc)
			),
			{ idHash: {} }
		);
	}

	/**
	 * Set the default on a single field according to its description.
	 *
	 * @author gerkin
	 * @param   value     - Value to default.
	 * @param   fieldDesc - Description of the field to default.
	 * @returns Defaulted value.
	 */
	defaultField(value: any, fieldDesc: FieldDescriptor): any {
		let out;

		// Apply the `default` if value is undefined
		if (!_.isUndefined(value)) {
			out = value;
		} else {
			out = _.isFunction(fieldDesc.default)
				? (fieldDesc.default as Function)()
				: getDefaultFunction(fieldDesc.default);
		}

		// Recurse if we are defaulting an object
		if (
			fieldDesc.attributes &&
			'object' === fieldDesc.type &&
			_.keys(fieldDesc.attributes).length > 0 &&
			!_.isNil(out)
		) {
			return this.default(out, fieldDesc.attributes);
		} else {
			return out;
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
	createDataSource(adapterLabel: string, ...config: any[]) {
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
		const baseAdapter = new (this.adapters[adapterLabel] as any)(...config);
		const newDataSource = new Proxy(baseAdapter, {
			get(target, key: string) {
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
						return wrapDataSourceAction(
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
	 * Stores the data source with provided label.
	 *
	 * @author gerkin
	 * @throws  {Error} Error is thrown if parameters are incorrect or the name is already used or `dataSource` is not an adapter.
	 * @param   name       - Name associated with this datasource.
	 * @param   dataSource - Datasource itself.
	 * @returns
	 */
	registerDataSource(dataSource: Adapter<AdapterEntity>) {
		// TODO Oh that's bad....
		requireName('DataSource', name);
		if (this.dataSources.hasOwnProperty(name)) {
			throw new Error(`DataSource name already used, had "${name}"`);
		}
		/*		if ( !( dataSource instanceof Diaspora.components.Adapters.Adapter )) {
			throw new Error( 'DataSource must be an instance inheriting "DiasporaAdapter"' );
		}*/
		this.dataSources[name] = dataSource;
		return dataSource;
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
		configHash: object
	) {
		const dataSource = this.createDataSource(
			adapterLabel,
			sourceName,
			configHash
		);
		return this.registerDataSource(dataSource);
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
			requireName('Model', name);
		}
		if (!_.isObject(modelDesc)) {
			throw new Error('"modelDesc" must be an object');
		}
		const model = new Model(name, modelDesc);
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
	registerAdapter(label: string, adapter: typeof Adapter) {
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
Diaspora.registerAdapter('inMemory', require('./adapters/inMemory/adapter'));
Diaspora.registerAdapter('webApi', require('./adapters/webApi/adapter'));
// Register webStorage only if in browser
if (process.browser) {
	Diaspora.registerAdapter(
		'webStorage',
		require('./adapters/webStorage/adapter')
	);
}
