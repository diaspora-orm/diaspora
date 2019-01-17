import * as _ from 'lodash';

import { QueryLanguage } from './queryLanguage';

export interface IDataSourceQuerier<
	TIn,
	TOut extends TIn,
	TQuery = QueryLanguage.SelectQueryOrCondition,
	TOptions = QueryLanguage.IQueryOptions
> {
	// -----
	// ### Insert

	/**
	 * Insert a single entity in the data store.
	 *
	 * @summary At least one of {@link insertOne} or {@link insertMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	insertOne( table: string, entity: TIn ): Promise<TOut | undefined>;

	/**
	 * Insert several entities in the data store.
	 *
	 * @summary At least one of {@link insertOne} or {@link insertMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	insertMany( table: string, entities: TIn[] ): Promise<TOut[]>;

	// -----
	// ### Find

	/**
	 * Retrieve a single entity from the data store.
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
	 * Retrieve several entities from the data store.
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
	 * Update a single entity from the data store.
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
	 * Update several entities from the data store.
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
	 * Delete a single entity from the data store.
	 *
	 * @summary At least one of {@link deleteOne} or {@link deleteMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	deleteOne( table: string, queryFind: TQuery, options: TOptions ): Promise<void>;

	/**
	 * Delete several entities from the data store.
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

	/**
	 * Check if the data store contains at least one element matching the query.
	 * 
	 * @param collectionName - Name of the data store to search entities in
	 * @param queryFind      - Description of the entities to match
	 * @param options        - Options to apply to the query
	 */
	contains(
		table: string,
		queryFind: TQuery,
		options: TOptions
	): Promise<boolean>;
	
	/**
	 * Get the number of elements in a data store matching the query.
	 * 
	 * @param collectionName - Name of the data store to search entities in
	 * @param queryFind      - Description of the entities to match
	 * @param options        - Options to apply to the query
	 */
	count(
		table: string,
		queryFind: TQuery,
		options: TOptions
	): Promise<number>;
	
	/**
	 * Check if every elements in the data store matches the query.
	 * 
	 * @param collectionName - Name of the data store to search entities in
	 * @param queryFind      - Description of the entities to match
	 * @param options        - Options to apply to the query
	 */
	every(
		table: string,
		queryFind: TQuery,
		options: TOptions
	): Promise<boolean>;

	// -----
	// ### Various

	/**
	 * Returns a promise resolved once the data source querier is ready.
	 *
	 * @author gerkin
	 * @returns Promise resolved when the data source is ready, and rejected if an error occured.
	 */
	waitReady(): Promise<this>;

	/**
	 * Saves the remapping table, the reversed remapping table and the filter table in the adapter. Those tables will be used later when manipulating models & entities.
	 *
	 * @author gerkin
	 */
	configureCollection(
		tableName: string,
		remaps: _.Dictionary<string>,
		filters: _.Dictionary<any>
	): this;
}
