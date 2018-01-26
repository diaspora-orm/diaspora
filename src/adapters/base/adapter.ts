import { _, Promise, SequentialEvent } from '../../dependencies';
import * as _Diaspora from '../../';

import AdapterEntity = _Diaspora.Adapters.BaseAdapter.AdapterEntity;
import QueryLanguage = _Diaspora.QueryLanguage;
import { Diaspora } from '../../diaspora';
import Bluebird from 'bluebird';

/**
 * @namespace Adapters
 */

/**
 * @typedef {undefined|null} Nil
 * @memberof Adapters
 * @public
 * @instance
 * @author gerkin
 */

/**
 * @typedef {Adapters.Nil|Object} NilOrObject
 * @memberof Adapters
 * @public
 * @instance
 * @author gerkin
 */

const {
	OPERATORS,
	CANONICAL_OPERATORS,
	QUERY_OPTIONS_TRANSFORMS,
	iterateLimit,
	remapIO,
} = require('./adapter-utils');

/**
 * Adapter is the base class of adapters. Adapters are components that are in charge to interact with data sources (files, databases, etc etc) with standardized methods. You should not use this class directly: extend this class and re-implement some methods to build an adapter. See the (upcoming) tutorial section.
 * @extends SequentialEvent
 * @memberof Adapters
 * @author gerkin
 */
class Adapter extends SequentialEvent {
	public name: string;

	/**
	 * Hash of functions to cast data store values to JSON standard values in entity.
	 *
	 * @property {Function} * - Filter to execute to get standard JSON value.
	 * @author Gerkin
	 */
	protected filters: object;

	/**
	 * Hash to transform entity fields to data store fields.
	 *
	 * @property {string} * - Data store field associated with this entity field.
	 * @author Gerkin
	 */
	protected remaps: object;

	/**
	 * Hash to transform data store fields to entity fields.
	 *
	 * @property {string} * - Entity field associated with this data store field.
	 * @author Gerkin
	 */
	protected remapsInverted: object;

	/**
	 * Error triggered by adapter initialization.
	 *
	 * @type {Error}
	 * @author Gerkin
	 */
	protected error?: Error;

	/**
	 * Describe current adapter status.
	 * @author Gerkin
	 */
	private state: string;

	/**
	 * Link to the constructor of the class generated by this adapter.
	 *
	 * @author Gerkin
	 */
	private classEntity: typeof AdapterEntity;

	// -----
	// ### Initialization

	/**
	 * Create a new instance of adapter. This base class should be used by all other adapters.
	 *
	 * @public
	 * @author gerkin
	 * @param {DataStoreEntities.DataStoreEntity} classEntity - Entity to spawn with this adapter.
	 */
	constructor(classEntity: typeof AdapterEntity) {
		super();
		this.filters = {};
		this.remaps = {};
		this.remapsInverted = {};
		this.error = undefined;
		this.state = 'preparing';
		this.classEntity = classEntity;

		// Bind events
		this.on('ready', () => {
			this.state = 'ready';
		}).on('error', (err: Error) => {
			this.state = 'error';
			Diaspora.logger.error(
				'Error while initializing:',
				_.pick(err, Object.getOwnPropertyNames(err))
			);
			this.error = err;
		});
	}

	/**
	 * Saves the remapping table, the reversed remapping table and the filter table in the adapter. Those tables will be used later when manipulating models & entities.
	 *
	 * @author gerkin
	 */
	configureCollection(tableName: string, remaps: object, filters = {}): void {
		(this.remaps as any)[tableName] = {
			normal: remaps,
			inverted: _.invert(remaps),
		};
		(this.filters as any)[tableName] = filters;
	}

	// -----
	// ### Events

	/**
	 * Fired when the adapter is ready to use. You should not try to use the adapter before this event is emitted.
	 *
	 * @event Adapters.Adapter#ready
	 * @type {undefined}
	 * @see {@link Adapters.Adapter#waitReady waitReady} Convinience method to wait for state change.
	 */

	/**
	 * Fired if the adapter failed to initialize or changed to `error` state. Called with the triggering `error`.
	 *
	 * @event Adapters.Adapter#error
	 * @type {Error}
	 * @see {@link Adapters.Adapter#waitReady waitReady} Convinience method to wait for state change.
	 */

	// -----
	// ### Utils

	/**
	 * Returns a promise resolved once adapter state is ready.
	 *
	 * @author gerkin
	 * @listens Adapters.Adapter#error
	 * @listens Adapters.Adapter#ready
	 * @returns {Promise} Promise resolved when adapter is ready, and rejected if an error occured.
	 */
	waitReady(): Bluebird<this | Error> {
		return new Promise((resolve, reject) => {
			if ('ready' === this.state) {
				return resolve(this);
			} else if ('error' === this.state) {
				return reject(this.error);
			}
			this.on('ready', () => {
				return resolve(this);
			}).on('error', err => {
				return reject(err);
			});
		});
	}

	/**
	 * Cast the provided data to an adapter entity if the data is not nil.
	 */
	maybeCastEntity(data?: object): AdapterEntity<any> {
		return _.isNil(data) ? undefined : new this.classEntity(data, this);
	}

	/**
	 * Cast the provided array of datas to adapter entities if the data is not nil. Note that {@link Adapters.Nil nil values} aren't filtered out from the resulting array.
	 */
	maybeCastSet(datas?: object[]): AdapterEntity<any> {
		return _.isNil(datas) ? [] : _.map(datas, this.maybeCastEntity.bind(this));
	}

	/**
	 * TODO.
	 *
	 * @author gerkin
	 * @see TODO remapping.
	 * @see {@link Adapters.Adapter#remapIO remapIO}
	 */
	remapInput(tableName: string, query: object): object {
		return remapIO(this, tableName, query, true);
	}

	/**
	 * TODO.
	 *
	 * @author gerkin
	 * @see TODO remapping.
	 * @see {@link Adapters.Adapter#remapIO remapIO}
	 */
	remapOutput(tableName: string, query: object): object {
		return remapIO(this, tableName, query, false);
	}

	/**
	 * Refresh the `idHash` with current adapter's `id` injected.
	 *
	 * @author gerkin
	 */
	setIdHash(entity: object, propName: string = 'id'): object {
		const entityAny: any = entity as any;
		entityAny.idHash = _.assign({}, entityAny.idHash, {
			[this.name]: entityAny[propName],
		});
		return entity;
	}

	/**
	 * Check if provided `entity` is matched by the query. Query must be in its canonical form before using this function.
	 *
	 * @author gerkin
	 */
	matchEntity(query: QueryLanguage.SelectQuery, entity: object): boolean {
		const matchResult = _.every(_.toPairs(query), ([key, desc]) => {
			if (_.isObject(desc)) {
				const entityVal = (entity as any)[key];
				return _.every(desc, (val, operation) => {
					if (OPERATORS.hasOwnProperty(operation)) {
						return OPERATORS[operation](entityVal, val);
					} else {
						return false;
					}
				});
			}
			return false;
		});
		return matchResult;
	}

	/**
	 * Transform options to their canonical form. This function must be applied before calling adapters' methods.
	 *
	 * @author gerkin
	 * @throws  {TypeError} Thrown if an option does not have an acceptable type.
	 * @throws  {ReferenceError} Thrown if a required option is not present.
	 * @throws  {Error} Thrown when there isn't more precise description of the error is available (eg. when conflicts occurs).
	 * @returns {Object} Transformed options (also called `canonical options`).
	 */
	normalizeOptions(
		opts: QueryLanguage.QueryOptionsRaw = {}
	): QueryLanguage.QueryOptions {
		opts = _.cloneDeep(opts);
		_.forEach(QUERY_OPTIONS_TRANSFORMS, (transform, optionName) => {
			if (opts.hasOwnProperty(optionName)) {
				QUERY_OPTIONS_TRANSFORMS[optionName](opts);
			}
		});
		_.defaults(opts, {
			skip: 0,
			remapInput: true,
			remapOutput: true,
		});
		return opts as QueryLanguage.QueryOptions;
	}

	/**
	 * Transform a search query to its canonical form, replacing aliases or shorthands by full query.
	 *
	 * @author gerkin
	 */
	normalizeQuery(
		originalQuery: QueryLanguage.SelectQueryOrCondition,
		options: QueryLanguage.QueryOptions
	): QueryLanguage.SelectQueryOrCondition {
		if (_.isString(originalQuery)) {
			originalQuery = { id: originalQuery };
		}
		const normalizedQuery =
			true === options.remapInput
				? _(_.cloneDeep(originalQuery))
						.mapValues(attrSearch => {
							if (_.isUndefined(attrSearch)) {
								return { $exists: false };
							} else if (!(attrSearch instanceof Object)) {
								return { $equal: attrSearch };
							} else {
								// Replace operations alias by canonical expressions
								attrSearch = _.mapKeys(attrSearch, (val, operator, obj) => {
									if (CANONICAL_OPERATORS.hasOwnProperty(operator)) {
										// ... check for conflict with canonical operation name...
										if (obj.hasOwnProperty(CANONICAL_OPERATORS[operator])) {
											throw new Error(
												`Search can't have both "${operator}" and "${CANONICAL_OPERATORS[
													operator
												]}" keys, as they are synonyms`
											);
										}
										return CANONICAL_OPERATORS[operator];
									}
									return operator;
								});
								// For arithmetic comparison, check if values are numeric (TODO later: support date)
								_.forEach(
									['$less', '$lessEqual', '$greater', '$greaterEqual'],
									operation => {
										if (
											attrSearch.hasOwnProperty(operation) &&
											!(
												_.isNumber(attrSearch[operation]) ||
												_.isDate(attrSearch[operation])
											)
										) {
											throw new TypeError(
												`Expect "${operation}" in ${JSON.stringify(
													attrSearch
												)} to be a numeric value`
											);
										}
									}
								);
								return attrSearch;
							}
						})
						.value()
				: _.cloneDeep(originalQuery);
		return normalizedQuery;
	}

	/**
	 * Returns a POJO representing the current adapter.
	 *
	 * @returns {Object} JSON representation of the adapter.
	 */
	toJSON(): object {
		return _.pick(this, [
			'state',
			'remaps',
			'remapsInverted',
			'classEntity',
			'error',
		]);
	}

	// -----
	// ### Insert

	/**
	 * Insert a single entity in the data store. This function is a default polyfill if the inheriting adapter does not provide `insertOne` itself.
	 *
	 * @summary At least one of {@link insertOne} or {@link insertMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	insertOne(table: string, entity: object): Bluebird<any> {
		return this.insertMany(table, [entity]).then(entities =>
			Promise.resolve(_.first(entities))
		);
	}

	/**
	 * Insert several entities in the data store. This function is a default polyfill if the inheriting adapter does not provide `insertMany` itself.
	 *
	 * @summary At least one of {@link insertOne} or {@link insertMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	insertMany(table: string, entities: object[]): Bluebird<any> {
		return Promise.mapSeries(entities, entity =>
			this.insertOne(table, entity || {})
		);
	}

	// -----
	// ### Find

	/**
	 * Retrieve a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `findOne` itself.
	 *
	 * @summary At least one of {@link findOne} or {@link findMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	findOne(
		table: string,
		queryFind: QueryLanguage.SelectQueryOrCondition,
		options: QueryLanguage.QueryOptionsRaw = {}
	): Bluebird<any> {
		options.limit = 1;
		return this.findMany(table, queryFind, options).then(entities =>
			Promise.resolve(_.first(entities))
		);
	}

	/**
	 * Retrieve several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `findMany` itself.
	 *
	 * @summary At least one of {@link findOne} or {@link findMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	findMany(
		table: string,
		queryFind: QueryLanguage.SelectQueryOrCondition,
		options: QueryLanguage.QueryOptionsRaw = {}
	): Bluebird<any> {
		options = this.normalizeOptions(options);
		return iterateLimit(options, this.findOne.bind(this, table, queryFind))(true);
	}

	// -----
	// ### Update

	/**
	 * Update a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `updateOne` itself.
	 *
	 * @summary At least one of {@link updateOne} or {@link updateMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	updateOne(
		table: string,
		queryFind: QueryLanguage.SelectQueryOrCondition,
		update: object,
		options: QueryLanguage.QueryOptionsRaw = {}
	): Bluebird<any> {
		options = this.normalizeOptions(options);
		options.limit = 1;
		return this.updateMany(table, queryFind, update, options).then(entities =>
			Promise.resolve(_.first(entities))
		);
	}

	/**
	 * Update several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `updateMany` itself.
	 *
	 * @summary At least one of {@link updateOne} or {@link updateMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	updateMany(
		table: string,
		queryFind: QueryLanguage.SelectQueryOrCondition,
		update: object,
		options: QueryLanguage.QueryOptionsRaw = {}
	): Bluebird<any> {
		options = this.normalizeOptions(options);
		return iterateLimit(
			options,
			this.updateOne.bind(this, table, queryFind, update)
		)(true);
	}

	// -----
	// ### Delete

	/**
	 * Delete a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `deleteOne` itself.
	 *
	 * @summary At least one of {@link deleteOne} or {@link deleteMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	deleteOne(
		table: string,
		queryFind: QueryLanguage.SelectQueryOrCondition,
		options: QueryLanguage.QueryOptionsRaw = {}
	): Bluebird<any> {
		options.limit = 1;
		return this.deleteMany(table, queryFind, options);
	}

	/**
	 * Delete several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `deleteMany` itself.
	 *
	 * @summary At least one of {@link deleteOne} or {@link deleteMany} must be reimplemented by adapter.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to delete data from.
	 * @param   {QueryLanguage.SelectQueryOrCondition} queryFind    - Hash representing the entities to find.
	 * @param   {QueryLanguage.QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`).
	 */
	deleteMany(
		table: string,
		queryFind: QueryLanguage.SelectQueryOrCondition,
		options: QueryLanguage.QueryOptionsRaw = {}
	): Bluebird<any> {
		let count = 0;
		// We are going to loop until we find enough items
		const loopFind = (): Bluebird<void> => {
			// First, search for the item.
			return this.findOne(table, queryFind, options).then(found => {
				// If the search returned nothing, then just finish the findMany
				if (_.isNil(found)) {
					return Promise.resolve();
					// Else, if this is a value and not the initial `true`, add it to the list
				}
				// If we found enough items, return them
				if (count === options.limit) {
					return Promise.resolve();
				}
				// Increase our counter
				count++;
				// Do the deletion & loop
				return this.deleteOne(table, queryFind, options).then(loopFind);
			});
		};
		return loopFind();
	}
}

export default Adapter;
