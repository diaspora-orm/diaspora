/// <reference path="./global.d.ts"/>
/// <reference path="./diaspora.d.ts"/>

import * as dependencies from './dependencies';
const { _, Promise } = dependencies;
import { Winston } from 'winston';

/**
 * Event emitter that can execute async handlers in sequence
 *
 * @typedef {Object} SequentialEvent
 * @author Gerkin
 * @see {@link https://gerkindev.github.io/SequentialEvent.js/SequentialEvent.html Sequential Event documentation}.
 */

/**
 * @module Diaspora
 */

const logger = (() => {
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
			const trimToLength = (str, len, filler = ' ', left = true) => {
				filler = filler.repeat(len);
				str = left ? filler + str : str + filler;
				return str.slice(left ? -len : len);
			};
			const td = _.partialRight(trimToLength, 2, '0');
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
						format((infos, opts) => {
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

const adapters: Diaspora.IAdapterRegistry = {};
const dataSources = {};
const models = {};

const ensureAllEntities = (adapter: Diaspora.Adapter, table: string) => {
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

	return (results: Diaspora.EntityOrCollection): Diaspora.EntityOrCollection => {
		if (_.isNil(results)) {
			return Promise.resolve();
		} else if (_.isArrayLike(results)) {
			return Promise.resolve(_.map(results, filterResults));
		} else {
			return Promise.resolve(filterResults(results));
		}
	};
};

const remapArgs = (
	args: any[],
	optIndex: number | false,
	update: boolean,
	queryType: any,
	remapFunction: Diaspora.RemapIterator
) => {
	if (false !== optIndex) {
		// Remap input objects
		if (true === args[optIndex].remapInput) {
			args[0] = remapFunction(args[0]);

			if (true === update) {
				args[1] = remapFunction(args[1]);
			}
		}
		args[optIndex].remapInput = false;
	} else if ('insert' === queryType.query) {
		// If inserting, then, we'll need to know if we are inserting *several* entities or a *single* one.
		if ('many' === queryType.number) {
			// If inserting *several* entities, map the array to remap each entity objects...
			args[0] = _.map(args[0], (insertion: Diaspora.Entity) =>
				remapFunction(insertion)
			);
		} else {
			// ... or we are inserting a *single* one. We still need to remap entity.
			args[0] = remapFunction(args[0]);
		}
	}
};

const getRemapFunction = (adapter: Diaspora.Adapter, table: string) => {
	return (query: object) => {
		return adapter.remapInput(table, query);
	};
};

const wrapDataSourceAction = (
	callback: Function,
	queryType: string,
	adapter: Diaspora.Adapter
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
			const namedFunction = _.get(_Diaspora.namedFunctions, parts);
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
const _Diaspora: Diaspora.Diaspora = {
	namedFunctions: {
		Diaspora: {
			'Date.now()': () => new Date(),
		},
	},

	/**
	 * Set default values if required.
	 *
	 * @author gerkin
	 * @param   {Object}         entity    - Entity to set defaults in.
	 * @param   {ModelPrototype} modelDesc - Model description.
	 * @returns {Object} Entity merged with default values.
	 */
	default(entity: Diaspora.EntityObject, modelDesc: object) {
		// Apply method `defaultField` on each field described
		return _.defaults(
			entity,
			_.mapValues(modelDesc, (fieldDesc: object, field: string) =>
				this.defaultField(entity[field], fieldDesc)
			)
		);
	},

	/**
	 * Set the default on a single field according to its description.
	 *
	 * @author gerkin
	 * @param   {Any}             value     - Value to default.
	 * @param   {FieldDescriptor} fieldDesc - Description of the field to default.
	 * @returns {Any} Defaulted value.
	 */
	defaultField(value: any, fieldDesc: Diaspora.IFieldDescriptor) {
		let out;
		if (!_.isUndefined(value)) {
			out = value;
		} else {
			out = _.isFunction(fieldDesc.default)
				? (fieldDesc.default as Function)()
				: getDefaultFunction(fieldDesc.default);
		}
		if (
			'object' === fieldDesc.type &&
			_.isObject(fieldDesc.attributes) &&
			_.keys(fieldDesc.attributes).length > 0 &&
			!_.isNil(out)
		) {
			return this.default(out, fieldDesc.attributes);
		} else {
			return out;
		}
	},

	/**
	 * Create a data source (usually, a database connection) that may be used by models.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if provided `adapter` label does not correspond to any adapter registered.
	 * @param   {string} adapterLabel - Label of the adapter used to create the data source.
	 * @param   {Object} config       - Configuration hash. This configuration hash depends on the adapter we want to use.
	 * @returns {Adapters.DiasporaAdapter} New adapter spawned.
	 */
	createDataSource(adapterLabel: string, config: object) {
		if (!adapters.hasOwnProperty(adapterLabel)) {
			const moduleName = `diaspora-${adapterLabel}`;
			try {
				try {
					require.resolve(moduleName);
				} catch (e) {
					throw new Error(
						`Unknown adapter "${adapterLabel}" (expected in module "${moduleName}"). Available currently are ${Object.keys(
							adapters
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
		const baseAdapter = new (adapters[adapterLabel] as any)(config);
		const newDataSource = new Proxy(baseAdapter, {
			get(target, key: string) {
				// If this is an adapter action method, wrap it with filters. Our method keys are only string, not tags
				if (_.isString(key)) {
					let method = key.match(/^(find|update|insert|delete)(Many|One)$/);
					if (null !== method) {
						method = method as RegExpMatchArray;
						method[2] = method[2].toLowerCase();
						// Cast regex match to object like this: {full: 'findMany', query: 'find', number: 'many'}
						const methodObj: Diaspora.IQueryTypeDescriptor = {
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
	},

	/**
	 * Stores the data source with provided label.
	 *
	 * @author gerkin
	 * @throws  {Error} Error is thrown if parameters are incorrect or the name is already used or `dataSource` is not an adapter.
	 * @param   {string}          name       - Name associated with this datasource.
	 * @param   {DiasporaAdapter} dataSource - Datasource itself.
	 * @returns {undefined} This function does not return anything.
	 */
	registerDataSource(name: string, dataSource: Diaspora.Adapter) {
		requireName('DataSource', name);
		if (dataSources.hasOwnProperty(name)) {
			throw new Error(`DataSource name already used, had "${name}"`);
		}
		/*		if ( !( dataSource instanceof Diaspora.components.Adapters.Adapter )) {
			throw new Error( 'DataSource must be an instance inheriting "DiasporaAdapter"' );
		}*/
		dataSource.name = name;
		_.merge(dataSources, {
			[name]: dataSource,
		});
		return dataSource;
	},

	/**
	 * Create a data source (usually, a database connection) that may be used by models.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if provided `adapter` label does not correspond to any adapter registered.
	 * @param   {string} sourceName   - Name associated with this datasource.
	 * @param   {string} adapterLabel - Label of the adapter used to create the data source.
	 * @param   {Object} configHash   - Configuration hash. This configuration hash depends on the adapter we want to use.
	 * @returns {Adapters.DiasporaAdapter} New adapter spawned.
	 */
	createNamedDataSource(
		sourceName: string,
		adapterLabel: string,
		configHash: object
	) {
		const dataSource = _Diaspora.createDataSource(adapterLabel, configHash);
		return _Diaspora.registerDataSource(sourceName, dataSource);
	},

	/**
	 * Create a new Model with provided description.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if parameters are incorrect.
	 * @param   {string} name      - Name associated with this datasource.
	 * @param   {Object} modelDesc - Description of the model to define.
	 * @returns {Model} Model created.
	 */
	declareModel(name: string, modelDesc: object) {
		if (_.isString(name) && name.length > 0) {
			requireName('Model', name);
		}
		if (!_.isObject(modelDesc)) {
			throw new Error('"modelDesc" must be an object');
		}
		const model = new _Diaspora.components.Model(name, modelDesc);
		_.assign(models, {
			[name]: model,
		});
		return model;
	},

	/**
	 * Register a new adapter and make it available to use by models.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if an adapter already exists with same label.
	 * @throws  {TypeError} Thrown if adapter does not extends {@link Adapters.DiasporaAdapter}.
	 * @param   {string}                   label   - Label of the adapter to register.
	 * @param   {Adapters.DiasporaAdapter} adapter - The adapter to register.
	 * @returns {undefined} This function does not return anything.
	 */
	registerAdapter(label: string, adapter: Diaspora.Adapter) {
		if (adapters.hasOwnProperty(label)) {
			throw new Error(`Adapter with label "${label}" already exists.`);
		}
		// Check inheritance of adapter
		/*if ( !( adapter.prototype instanceof Diaspora.components.Adapters.Adapter )) {
			throw new TypeError( `Trying to register an adapter with label "${ label }", but it does not extends DiasporaAdapter.` );
		}*/
		adapters[label] = adapter;
	},

	/**
	 * Hash containing all available models.
	 *
	 * @type {Object}
	 * @property {Model} * - Model associated with that name.
	 * @memberof Diaspora
	 * @public
	 * @author gerkin
	 * @see Use {@link Diaspora.declareModel} to add models.
	 */
	models,

	/**
	 * Hash containing all available data sources.
	 *
	 * @type {Object}
	 * @property {Adapters.DiasporaAdapter} * - Instances of adapters declared.
	 * @memberof Diaspora
	 * @private
	 * @author gerkin
	 * @see Use {@link Diaspora.createNamedDataSource} or {@link Diaspora.registerDataSource} to make data sources available for models.
	 */
	dataSources,

	/**
	 * Hash containing all available adapters. The only universal adapter is `inMemory`.
	 *
	 * @type {Object}
	 * @property {Adapters.DiasporaAdapter}        *        - Adapter constructor. Those constructors must be subclasses of DiasporaAdapter.
	 * @property {Adapters.InMemorDiasporaAdapter} inMemory - InMemoryDiasporaAdapter constructor.
	 * @memberof Diaspora
	 * @private
	 * @author gerkin
	 * @see Use {@link Diaspora.registerAdapter} to add adapters.
	 */
	adapters,

	/**
	 * Dependencies of Diaspora.
	 *
	 * @type {Object}
	 * @property {Bluebird}        Promise          - Bluebird lib.
	 * @property {Lodash}          _                - Lodash lib.
	 * @property {SequentialEvent} sequential-event - SequentialEvent lib.
	 * @memberof Diaspora
	 * @private
	 * @author gerkin
	 */
	dependencies: dependencies,

	/**
	 * Logger used by Diaspora and its adapters. You can use this property to configure winston. On brower environment, this is replaced by a reference to global {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/console Console}.
	 *
	 * @type {Winston|Console}
	 * @memberof Diaspora
	 * @public
	 * @author gerkin
	 */
	logger,
} as Diaspora.Diaspora;

export const Diaspora = _Diaspora;

// Load components after export, so requires of Diaspora returns a complete object
/**
 * Hash of components exposed by Diaspora.
 *
 * @type {Object}
 * @memberof Diaspora
 * @private
 * @author gerkin
 */
Diaspora.components = {
	Errors: {
		ExtendableError: require('./errors/extendableError'),
		ValidationError: require('./errors/validationError'),
		EntityValidationError: require('./errors/entityValidationError'),
		SetValidationError: require('./errors/setValidationError'),
		EntityStateError: require('./errors/entityStateError'),
	},
};
_.assign(Diaspora.components, {
	Adapters: {
		Adapter: require('./adapters/base/adapter'),
		Entity: require('./adapters/base/entity'),
	},
});
_.assign(Diaspora.components, {
	Model: require('./model'),
	EntityFactory: require('./entityFactory'),
	Entity: require('./entityFactory').Entity,
	Set: require('./set'),
	Validator: require('./validator'),
	Utils: require('./utils'),
});

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
