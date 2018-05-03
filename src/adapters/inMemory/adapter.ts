import * as _ from 'lodash';

import {
	Adapter,
	EAdapterState,
	IRawAdapterEntityAttributes,
} from '../base';
import { IRawEntityAttributes, EntityUid } from '../../entities/entityFactory';
import * as Utils from '../../utils';
import { InMemoryEntity } from './entity';
import { QueryLanguage } from '../../types/queryLanguage';
import { IRemapsHash, IFiltersHash } from '../../types/dataSourceQuerier';

interface IDataStoreHash {
	[key: string]: { items: IRawAdapterEntityAttributes[] };
}
/**
 * This class is used to use the memory as a data store. Every data you insert are stored in an array contained by this class. This adapter can be used by both the browser & Node.JS.
 */
export class InMemoryAdapter extends Adapter<InMemoryEntity> {
	/**
	 * Plain old javascript object used as data store.
	 *
	 * @author Gerkin
	 */
	private readonly store: IDataStoreHash = {};

	/**
	 * Create a new instance of in memory adapter.
	 *
	 * @author gerkin
	 */
	public constructor( dataSourceName: string ) {
		super( InMemoryEntity, dataSourceName );
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
		entity: IRawEntityAttributes
	): Promise<IRawAdapterEntityAttributes | undefined> {
		const storeTable = this.ensureCollectionExists( table );
		const adapterEntityAttributes = InMemoryEntity.setId(
			_.omitBy( _.cloneDeep( entity ), _.isUndefined ),
			this
		);
		storeTable.items.push( adapterEntityAttributes );
		return adapterEntityAttributes;
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
		queryFind: QueryLanguage.SelectQuery,
		options: QueryLanguage.QueryOptions = this.normalizeOptions()
	): Promise<IRawAdapterEntityAttributes | undefined> {
		const storeTable = this.ensureCollectionExists( table );
		const matches = _.filter( storeTable.items, item =>
			InMemoryEntity.matches( item, queryFind )
		);
		const reducedMatches = Utils.applyOptionsToSet( matches, options );
		return _.first( reducedMatches );
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
		queryFind: QueryLanguage.SelectQuery,
		options: QueryLanguage.QueryOptions = this.normalizeOptions()
	): Promise<IRawAdapterEntityAttributes[]> {
		const storeTable = this.ensureCollectionExists( table );
		const matches = _.filter( storeTable.items, item =>
			InMemoryEntity.matches( item, queryFind )
		);
		const reducedMatches = Utils.applyOptionsToSet( matches, options );
		return reducedMatches || [];
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
		queryFind: QueryLanguage.SelectQuery,
		update: IRawEntityAttributes,
		options: QueryLanguage.QueryOptions = this.normalizeOptions()
	): Promise<IRawAdapterEntityAttributes | undefined> {
		const found = await this.findOne( table, queryFind, options );

		if ( !_.isNil( found ) ) {
			const storeTable = this.ensureCollectionExists( table );
			const match = _.find( storeTable.items, {
				id: found.id,
			} ) as any as IRawAdapterEntityAttributes;
			if ( match ) {
				Utils.applyUpdateEntity( update, match );
				return match;
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
		queryFind: QueryLanguage.SelectQuery,
		update: IRawEntityAttributes,
		options: QueryLanguage.QueryOptions = this.normalizeOptions()
	): Promise<IRawAdapterEntityAttributes[]> {
		const foundEntity = await this.findMany( table, queryFind, options );

		if ( !_.isNil( foundEntity ) && foundEntity.length > 0 ) {
			const storeTable = this.ensureCollectionExists( table );
			const foundIds = _.map( foundEntity, 'id' );
			const matches = _.filter(
				storeTable.items,
				item => -1 !== foundIds.indexOf( item.id )
			);
			return _.map( matches, item => {
				Utils.applyUpdateEntity( update, item );
				return item;
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
		queryFind: QueryLanguage.SelectQuery,
		options: QueryLanguage.QueryOptions = this.normalizeOptions()
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
		queryFind: QueryLanguage.SelectQuery,
		options: QueryLanguage.QueryOptions = this.normalizeOptions()
	): Promise<void> {
		const storeTable = this.ensureCollectionExists( table );
		const entitiesToDelete = await this.findMany( table, queryFind, options );
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
