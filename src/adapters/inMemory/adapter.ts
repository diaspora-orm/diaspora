import Bluebird from 'bluebird';
import _ from 'lodash';

import {
	Adapter,
	EAdapterState,
	AdapterEntity,
	IRemapsHash,
	IFiltersHash,
	QueryLanguage,
} from '../base';
import {
	IRawEntityAttributes,
	EntityUid,
	IEntityAttributes,
} from '../../entityFactory';
import * as Utils from '../../utils';
import { InMemoryEntity } from '.';

interface IDataStoreItem {
	id: string;
	idHash: { [key: string]: EntityUid };
	[key: string]: any;
}
interface IDataStoreHash {
	[key: string]: { items: IDataStoreItem[] };
}
/**
 * This class is used to use the memory as a data store. Every data you insert are stored in an array contained by this class. This adapter can be used by both the browser & Node.JS.
 *
 * @extends Adapters.DiasporaAdapter
 * @memberof Adapters
 */
export class InMemoryAdapter extends Adapter {
	/**
	 * Plain old javascript object used as data store.
	 *
	 * @author Gerkin
	 */
	private store: IDataStoreHash = {};

	/**
	 * Create a new instance of in memory adapter.
	 *
	 * @author gerkin
	 */
	constructor() {
		super(InMemoryEntity, 'inMemory');
		this.state = EAdapterState.READY;
	}

	/**
	 * Create the data store and call {@link Adapters.DiasporaAdapter#configureCollection}.
	 *
	 * @author gerkin
	 * @param   tableName - Name of the table (usually, model name).
	 * @param   remaps    - Associative hash that links entity field names with data source field names.
	 * @returns This function does not return anything.
	 */
	protected configureCollection(
		tableName: string,
		remaps: IRemapsHash,
		filters: IFiltersHash
	) {
		super.configureCollection(tableName, remaps, filters);
		this.ensureCollectionExists(tableName);
	}

	// -----
	// ### Utils

	/**
	 * Get or create the store hash.
	 *
	 * @author gerkin
	 * @param   table - Name of the table.
	 * @returns In memory table to use.
	 */
	private ensureCollectionExists(table: string) {
		if (this.store.hasOwnProperty(table)) {
			return this.store[table];
		} else {
			return (this.store[table] = {
				items: [],
			});
		}
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
	async insertOne(
		table: string,
		entity: IRawEntityAttributes
	): Bluebird<InMemoryEntity | undefined> {
		entity = _.cloneDeep(entity);
		const storeTable = this.ensureCollectionExists(table);
		entity.id = Utils.generateUUID();
		this.setIdHash(entity);
		storeTable.items.push(entity as IDataStoreItem);
		const newEntity = new this.classEntity(entity, this) as
			| InMemoryEntity
			| undefined;
		return newEntity;
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
	async findOne(
		table: string,
		queryFind: QueryLanguage.SelectQuery,
		options: QueryLanguage.QueryOptions = this.normalizeOptions()
	): Bluebird<InMemoryEntity | undefined> {
		const storeTable = this.ensureCollectionExists(table);
		const matches = _.filter(
			storeTable.items,
			_.partial(this.matchEntity, queryFind)
		);
		const reducedMatches = Utils.applyOptionsToSet(matches, options);
		return Promise.resolve(this.maybeCastEntity(_.first(reducedMatches)));
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
	async findMany(
		table: string,
		queryFind: QueryLanguage.SelectQuery,
		options: QueryLanguage.QueryOptions = this.normalizeOptions()
	): Bluebird<InMemoryEntity[]> {
		const storeTable = this.ensureCollectionExists(table);
		const matches = _.filter(
			storeTable.items,
			_.partial(this.matchEntity, queryFind)
		);
		const reducedMatches = Utils.applyOptionsToSet(matches, options);
		return Promise.resolve(this.maybeCastSet(reducedMatches));
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
	async updateOne(
		table: string,
		queryFind: QueryLanguage.SelectQuery,
		update: IRawEntityAttributes,
		options: QueryLanguage.QueryOptions = this.normalizeOptions()
	): Bluebird<InMemoryEntity | undefined> {
		const found = await this.findOne(table, queryFind, options);

		if (!_.isNil(found)) {
			const storeTable = this.ensureCollectionExists(table);
			const match = _.find(storeTable.items, {
				id: found.id,
			});
			if (match) {
				Utils.applyUpdateEntity(update, match);
				return this.maybeCastEntity(match);
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
	async updateMany(
		table: string,
		queryFind: QueryLanguage.SelectQuery,
		update: IRawEntityAttributes,
		options: QueryLanguage.QueryOptions = this.normalizeOptions()
	): Bluebird<InMemoryEntity[]> {
		const foundEntity = await this.findMany(table, queryFind, options);

		if (!_.isNil(foundEntity) && foundEntity.length > 0) {
			const storeTable = this.ensureCollectionExists(table);
			const foundIds = _.map(foundEntity, 'id');
			const matches = _.filter(
				storeTable.items,
				item => -1 !== foundIds.indexOf(item.id)
			);
			return this.maybeCastSet(
				_.map(matches, item => {
					Utils.applyUpdateEntity(update, item);
					return item;
				})
			);
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
	async deleteOne(
		table: string,
		queryFind: QueryLanguage.SelectQuery,
		options: QueryLanguage.QueryOptions = this.normalizeOptions()
	): Bluebird<void> {
		const storeTable = this.ensureCollectionExists(table);
		const entityToDelete = await this.findOne(table, queryFind, options);

		if (!_.isNil(entityToDelete)) {
			storeTable.items = _.reject(
				storeTable.items,
				entity => entity.id === entityToDelete.idHash[this.name]
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
	async deleteMany(
		table: string,
		queryFind: QueryLanguage.SelectQuery,
		options: QueryLanguage.QueryOptions = this.normalizeOptions()
	): Bluebird<void> {
		const storeTable = this.ensureCollectionExists(table);
		return this.findMany(table, queryFind, options).then(entitiesToDelete => {
			const entitiesIds = _.map(entitiesToDelete, entity =>
				_.get(entity, `idHash.${this.name}`)
			);
			storeTable.items = _.reject(storeTable.items, entity => {
				return _.includes(entitiesIds, entity.id);
			});
			return Promise.resolve();
		});
	}
}
