import * as _ from 'lodash';

import { Adapter, EAdapterState } from '../base';
import * as Utils from '../../utils';
import { InMemoryEntity } from './entity';
import { QueryLanguage } from '../../types/queryLanguage';
import { IRemapsHash, IFiltersHash } from '../../types/dataSourceQuerier';
import { IEntityProperties, IEntityAttributes } from '../../types/entity';

/**
 * This class is used to use the memory as a data store. Every data you insert are stored in an array contained by this class. This adapter can be used by both the browser & Node.JS.
 * TODO: Add the index mechanism
 * 
 * @author Gerkin
 */
export class InMemoryAdapter extends Adapter<InMemoryEntity> {
	/**
	 * Plain old javascript object used as data store.
	 *
	 * @author Gerkin
	 */
	private readonly store: InMemoryAdapter.IDataStoreHash = {};
	
	/**
	 * Create a new instance of in memory adapter.
	 *
	 * @author gerkin
	 */
	public constructor( dataSourceName: string ) {
		super( InMemoryEntity as any, dataSourceName );
		this.state = EAdapterState.READY;
	}
	
	// -----
	// ### Insert
	
	/**
	 * Insert a single entity in the memory store.
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   table  - Name of the table to insert data in.
	 * @param   entity - Hash representing the entity to insert.
	 * @returns Promise resolved once insertion is done. Called with (*{@link InMemoryEntity}* `entity`).
	 */
	public async insertOne(
		table: string,
		entity: IEntityAttributes
	): Promise<IEntityProperties | undefined> {
		const storeTable = this.ensureCollectionExists( table );
		const adapterEntityAttributes = InMemoryEntity.setId(
			_.omitBy( _.cloneDeep( entity ), _.isUndefined ),
			this
		);
		storeTable.items.push( adapterEntityAttributes );
		return _.assign( {}, adapterEntityAttributes );
	}

	/**
	 * Insert several entities in the memory store.
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertMany}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   table    - Name of the table to insert data in.
	 * @param   entities - Array of hashes representing the entities to insert.
	 * @returns Promise resolved once insertion is done. Called with (*{@link IEntityProperties[]}* inserted datas).
	 */
	public async insertMany(
		table: string,
		entities: IEntityAttributes[]
	): Promise<IEntityProperties[]> {
		const storeTable = this.ensureCollectionExists( table );
		const adapterEntitiesAttributes = _.map( entities, entity => InMemoryEntity.setId( _.omitBy( _.cloneDeep( entity ), _.isUndefined ), this ) );
		storeTable.items = storeTable.items.concat( adapterEntitiesAttributes );
		return _.assign( {}, adapterEntitiesAttributes );
	}
	
	// -----
	// ### Find
	
	/**
	 * Retrieve a single entity from the memory.
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   table     - Name of the table to retrieve data from.
	 * @param   queryFind - Hash representing the entity to find.
	 * @param   options   - Hash of options.
	 * @returns Promise resolved once item is found. Called with (*{@link InMemoryEntity}* `entity`).
	 */
	public async findOne(
		table: string,
		queryFind: QueryLanguage.ISelectQuery,
		options: InMemoryAdapter.IQueryOptions
	): Promise<IEntityProperties | undefined> {
		const storeTable = this.ensureCollectionExists( table );
		const matches = _.filter( storeTable.items, item =>
			InMemoryEntity.matches( item, queryFind )
		);
		const reducedMatches = Utils.applyOptionsToSet( matches, options );
		const match = _.first( reducedMatches );
		// If the entity is nil, do not clone it, or it would return an empty object
		return options.clone === false || _.isNil( match ) ? match : _.assign( {}, match );
	}
	
	/**
	 * Main `many` search function that choose the right iterator depending on query.
	 * TODO: Add indexes
	 * 
	 * @author Gerkin
	 * @param storeTable - Table containing entities to search
	 * @param queryFind  - Query to apply for the search operation
	 * @param options    - Options to use for the search.
	 */
	private static findManyIterators(
		storeTable: InMemoryAdapter.IStoreTable,
		queryFind: QueryLanguage.SelectQueryOrCondition,
		options: QueryLanguage.IQueryOptions
	){
		// Choose the right iterator to be faster
		if ( isFinite( options.limit ) ){
			const limitAndSkip = options.limit + options.skip;
			const matches = _.transform(
				storeTable.items,
				( acc, item ) => {
					if ( InMemoryEntity.matches( item, queryFind ) ){
						acc.push( item );
					}
					return limitAndSkip > acc.length;
				},
				[] as IEntityProperties[]
			);
			return Utils.applyOptionsToSet( matches, options ) || [];
		} else {
			const matches = _.filter( storeTable.items, item => InMemoryEntity.matches( item, queryFind ) );
			return Utils.applyOptionsToSet( matches, options ) || [];
		}
	}

	/**
	 * Retrieve several entities from the memory.
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#findMany}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   table     - Name of the table to retrieve data from.
	 * @param   queryFind - Hash representing entities to find.
	 * @param   options   - Hash of options.
	 * @returns Promise resolved once items are found. Called with (*{@link InMemoryEntity}[]* `entities`).
	 */
	public async findMany(
		table: string,
		queryFind: QueryLanguage.ISelectQuery,
		options: InMemoryAdapter.IQueryOptions
	): Promise<IEntityProperties[]> {
		const storeTable = this.ensureCollectionExists( table );
		const foundItems = InMemoryAdapter.findManyIterators( storeTable, queryFind, options );
		return options.clone === false ? foundItems : _.map( foundItems, match => _.assign( {}, match ) );
	}
	
	// -----
	// ### Update
	
	/**
	 * Update a single entity in the memory.
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   table     - Name of the table to update data in.
	 * @param   queryFind - Hash representing the entity to find.
	 * @param   update    - Object properties to set.
	 * @param   options   - Hash of options.
	 * @returns Promise resolved once update is done. Called with (*{@link InMemoryEntity}* `entity`).
	 */
	public async updateOne(
		table: string,
		queryFind: QueryLanguage.ISelectQuery,
		update: IEntityAttributes,
		options: QueryLanguage.IQueryOptions
	): Promise<IEntityProperties | undefined> {
		const found = await this.findOne( table, queryFind, _.assign( {}, options, {clone: false} ) );
		
		if ( !_.isNil( found ) ) {
			if ( found ) {
				// Because our `match` is a reference to the in-memory stored object, we can just modify it.
				Utils.applyUpdateEntity( update, found );
				return _.assign( {}, found );
			}
		}
		return undefined;
	}
	
	/**
	 * Update several entities in the memory.
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateMany}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   table     - Name of the table to update data in.
	 * @param   queryFind - Hash representing entities to find.
	 * @param   update    - Object properties to set.
	 * @param   options   - Hash of options.
	 * @returns Promise resolved once update is done. Called with (*{@link InMemoryEntity}[]* `entities`).
	 */
	public async updateMany(
		table: string,
		queryFind: QueryLanguage.ISelectQuery,
		update: IEntityAttributes,
		options: QueryLanguage.IQueryOptions
	): Promise<IEntityProperties[]> {
		const foundEntities = await this.findMany( table, queryFind, _.assign( {}, options, {clone: false} ) );
		
		if ( !_.isNil( foundEntities ) && foundEntities.length > 0 ) {
			return _.map( foundEntities, item => {
				Utils.applyUpdateEntity( update, item );
				return _.assign( {}, item );
			} );
		} else {
			return [];
		}
	}
	
	// -----
	// ### Delete
	
	/**
	 * Delete a single entity from the memory.
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   table     - Name of the table to delete data from.
	 * @param   queryFind - Hash representing the entity to find.
	 * @param   options   - Hash of options.
	 * @returns Promise resolved once item is found. Called with (*undefined*).
	 */
	public async deleteOne(
		table: string,
		queryFind: QueryLanguage.ISelectQuery,
		options: QueryLanguage.IQueryOptions
	): Promise<void> {
		const storeTable = this.ensureCollectionExists( table );
		const entityToDelete = await this.findOne( table, queryFind, options );
		
		if ( !_.isNil( entityToDelete ) ) {
			storeTable.items = _.reject(
				storeTable.items,
				entity => entity.id === entityToDelete.id
			);
		}
	}
	
	/**
	 * Delete several entities from the memory.
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteMany}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   table     - Name of the table to delete data from.
	 * @param   queryFind - Hash representing entities to find.
	 * @param   options   - Hash of options.
	 * @returns Promise resolved once items are deleted. Called with (*undefined*).
	 */
	public async deleteMany(
		table: string,
		queryFind: QueryLanguage.ISelectQuery,
		options: QueryLanguage.IQueryOptions
	): Promise<void> {
		const storeTable = this.ensureCollectionExists( table );
		const entitiesToDelete = await this.findMany( table, queryFind, _.assign( {}, options, {clone:false} ) );
		const entitiesIds = _.map( entitiesToDelete, entity => entity.id );
		storeTable.items = _.reject( storeTable.items, entity =>
			_.includes( entitiesIds, entity.id )
		);
	}
	
	/**
	 * Create the data store and call {@link Adapters.DiasporaAdapter#configureCollection}.
	 *
	 * @author gerkin
	 * @param   tableName - Name of the table (usually, model name).
	 * @param   remaps    - Associative hash that links entity field names with data source field names.
	 * @returns This function does not return anything.
	 */
	public configureCollection(
		tableName: string,
		remaps: IRemapsHash,
		filters: IFiltersHash
	) {
		super.configureCollection( tableName, remaps, filters );
		this.ensureCollectionExists( tableName );
		return this;
	}
	
	/**
	 * Get or create the store hash.
	 *
	 * @author gerkin
	 * @param   table - Name of the table.
	 * @returns In memory table to use.
	 */
	private ensureCollectionExists( table: string ) {
		if ( this.store.hasOwnProperty( table ) ) {
			return this.store[table];
		} else {
			return ( this.store[table] = {
				items: [],
			} );
		}
	}
}

export namespace InMemoryAdapter {
	export interface IStoreTable{
		items: IEntityProperties[];
	}
	export interface IDataStoreHash {
		[key: string]: IStoreTable;
	}
	export interface IQueryOptions extends QueryLanguage.IQueryOptions {
		/**
		 * Indicates if the query should end by cloning the object.
		 */
		clone?: boolean;
	}
}
