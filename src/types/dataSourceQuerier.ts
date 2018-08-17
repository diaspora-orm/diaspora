import { QueryLanguage } from './queryLanguage';

export interface IEnumeratedHash<THash> {
  [key: string]: THash;
}

export interface IRemapsHash extends IEnumeratedHash<any> {}

export interface IFiltersHash extends IEnumeratedHash<any> {}

export interface IDataSourceQuerier<
	TIn,
	TOut extends TIn,
	TQuery = QueryLanguage.SelectQueryOrCondition,
	TOptions = QueryLanguage.IQueryOptions
> {
	// -----
	// ### Insert

	/**
	 * Insert a single entity in the data store. This function is a default polyfill if the inheriting adapter does not provide `insertOne` itself.
	 *
	 * @summary At least one of {@link insertOne} or {@link insertMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	insertOne( table: string, entity: TIn ): Promise<TOut | undefined>;

	/**
	 * Insert several entities in the data store. This function is a default polyfill if the inheriting adapter does not provide `insertMany` itself.
	 *
	 * @summary At least one of {@link insertOne} or {@link insertMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	insertMany( table: string, entities: TIn[] ): Promise<TOut[]>;

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
	queryFind: TQuery,
	options: TOptions
	): Promise<TOut | undefined>;

	/**
	 * Retrieve several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `findMany` itself.
	 *
	 * @summary At least one of {@link findOne} or {@link findMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	findMany(
	table: string,
	queryFind: TQuery,
	options: TOptions
	): Promise<TOut[]>;

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
	queryFind: TQuery,
	update: TIn,
	options: TOptions
	): Promise<TOut | undefined>;

	/**
	 * Update several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `updateMany` itself.
	 *
	 * @summary At least one of {@link updateOne} or {@link updateMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	updateMany(
	table: string,
	queryFind: TQuery,
	update: TIn,
	options: TOptions
	): Promise<TOut[]>;

	// -----
	// ### Delete

	/**
	 * Delete a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `deleteOne` itself.
	 *
	 * @summary At least one of {@link deleteOne} or {@link deleteMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	deleteOne( table: string, queryFind: TQuery, options: TOptions ): Promise<void>;

	/**
	 * Delete several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `deleteMany` itself.
	 *
	 * @summary At least one of {@link deleteOne} or {@link deleteMany} must be reimplemented by adapter.
	 * @author gerkin
	 * @param   table     - Name of the table to delete data from.
	 * @param   queryFind - Hash representing the entities to find.
	 * @param   options   - Hash of options.
	 * @returns Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`).
	 */
	deleteMany(
	table: string,
	queryFind: TQuery,
	options: TOptions
	): Promise<void>;

	// -----
	// ### Utils

	waitReady(): Promise<this>;

	/**
	 * Saves the remapping table, the reversed remapping table and the filter table in the adapter. Those tables will be used later when manipulating models & entities.
	 *
	 * @author gerkin
	 */
	configureCollection(
	tableName: string,
	remaps: IRemapsHash,
	filters: IFiltersHash
	): this;
}
