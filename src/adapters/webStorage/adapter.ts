import * as _ from 'lodash';

import { Adapter as _AAdapter } from '../base';
import AAdapter = _AAdapter.Base.AAdapter;
import EAdapterState = _AAdapter.EAdapterState;
import { Adapter as _WebStorageEntity } from './entity';
import WebStorageEntity = _WebStorageEntity.WebStorage.WebStorageEntity;
import * as Utils from '../../utils';
import { QueryLanguage } from '../../types/queryLanguage';
import { EntityUid, IEntityAttributes, IEntityProperties } from '../../types/entity';

export namespace Adapter.WebStorage {
	/**
	 * This class is used to use local storage or session storage as a data store. This adapter should be used only by the browser.
	 */
	export class WebStorageAdapter extends AAdapter<WebStorageEntity> {
		/**
		 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Storage Storage api} where to store data.
		 *
		 * @author Gerkin
		 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage localStorage} and {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage sessionStorage} on MDN web docs.
		 * @see {@link Adapters.WebStorageDiasporaAdapter}:config.session parameter.
		 */
		private readonly source: Storage;
		
		private readonly config: WebStorageAdapter.IOptions;
		
		/**
		 * Create a new instance of local storage adapter.
		 *
		 * @author gerkin
		 * @param config - Configuration object.
		 */
		public constructor(
			dataSourceName: string,
			config?: WebStorageAdapter.IOptionsRaw
		) {
			super( WebStorageEntity, dataSourceName );
			this.config = _.defaults( config, {
				session: false,
			} );
			this.state = EAdapterState.READY;
			this.source = this.config.session
			? window.sessionStorage
			: window.localStorage;
		}
		
		/**
		 * Deduce the item name from table name and item ID.
		 *
		 * @author gerkin
		 * @param   table - Name of the table to construct name for.
		 * @param   id    - Id of the item to find.
		 * @returns Name of the item.
		 */
		private static getItemName( table: string, id: EntityUid ): string {
			return `${table}.id=${id}`;
		}
		
		/**
		 * Create the collection index and call {@link Adapters.DiasporaAdapter#configureCollection}.
		 *
		 * @author gerkin
		 * @param tableName - Name of the table (usually, model name).
		 * @param remaps    - Associative hash that links entity field names with data source field names.
		 * @returns This function does not return anything.
		 */
		public configureCollection(
			tableName: string,
			remaps: _.Dictionary<string>,
			filters: _.Dictionary<any>
		) {
			super.configureCollection( tableName, remaps );
			this.ensureCollectionExists( tableName );
			return this;
		}
		
		// -----
		// ### Insert
		
		/**
		 * Insert a single entity in the local storage.
		 *
		 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for local storage or session storage interactions.
		 * @author gerkin
		 * @param   table  - Name of the table to insert data in.
		 * @param   entity - Hash representing the entity to insert.
		 * @returns Promise resolved once insertion is done. Called with (*{@link DataStoreEntities.WebStorageEntity}* `entity`).
		 */
		public async insertOne(
			table: string,
			entity: IEntityAttributes
		): Promise<IEntityProperties | undefined> {
			const rawAdapterAttributes = WebStorageEntity.setId(
				entity,
				this,
				Utils.generateUUID()
			);
			const tableIndex = this.ensureCollectionExists( table );
			tableIndex.push( rawAdapterAttributes.id as string );
			this.source.setItem( table, JSON.stringify( tableIndex ) );
			this.source.setItem(
				WebStorageAdapter.getItemName( table, entity.id ),
				JSON.stringify( rawAdapterAttributes )
			);
			return rawAdapterAttributes;
		}
		
		/**
		 * Insert several entities in the local storage.
		 *
		 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertMany}, modified for local storage or session storage interactions.
		 * @author gerkin
		 * @param   table    - Name of the table to insert data in.
		 * @param   entities - Array of hashes representing entities to insert.
		 * @returns Promise resolved once insertion is done. Called with (*{@link DataStoreEntities.WebStorageEntity}[]* `entities`).
		 */
		public async insertMany(
			table: string,
			entities: IEntityAttributes[]
		): Promise<IEntityProperties[]> {
			entities = _.cloneDeep( entities );
			const tableIndex = this.ensureCollectionExists( table );
			const rawAdapterAttributesArr = entities.map( entity => {
				const rawAdapterAttributes = WebStorageEntity.setId(
					entity,
					this,
					Utils.generateUUID()
				);
				tableIndex.push( rawAdapterAttributes.id as string );
				this.source.setItem(
					WebStorageAdapter.getItemName( table, rawAdapterAttributes.id ),
					JSON.stringify( rawAdapterAttributes )
				);
				return rawAdapterAttributes;
			} );
			this.source.setItem( table, JSON.stringify( tableIndex ) );
			return rawAdapterAttributesArr;
		}
		
		// -----
		// ### Find
		
		/**
		 * Find a single local storage entity using its id.
		 *
		 * @author gerkin
		 * @param   table - Name of the collection to search entity in.
		 * @param   id    - Id of the entity to search.
		 * @returns Found entity, or undefined if not found.
		 */
		public findOneById( table: string, id: string ): IEntityProperties | undefined {
			const item = this.source.getItem( WebStorageAdapter.getItemName( table, id ) );
			if ( !_.isNil( item ) ) {
				return JSON.parse( item );
			}
			return undefined;
		}
		
		/**
		 * Retrieve a single entity from the local storage.
		 *
		 * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for local storage or session storage interactions.
		 * @author gerkin
		 * @param   table     - Name of the model to retrieve data from.
		 * @param   queryFind - Hash representing the entity to find.
		 * @param   options   - Hash of options.
		 * @returns Promise resolved once item is found. Called with (*{@link DataStoreEntities.WebStorageEntity}* `entity`).
		 */
		public async findOne(
			table: string,
			queryFind: QueryLanguage.ISelectQuery,
			options: QueryLanguage.IQueryOptions
		): Promise<IEntityProperties | undefined> {
			_.defaults( options, {
				skip: 0,
			} );
			if (
				_.isEqual( _.keys( queryFind ), ['id'] ) &&
				_.isEqual( _.keys( queryFind.id ), ['$equal'] )
			) {
				return this.findOneById( table, queryFind.id.$equal );
			}
			const itemIds = this.ensureCollectionExists( table );
			let returnedItem;
			let matched = 0;
			// Iterate on each item ID, to test each one.
			_.each( itemIds, itemId => {
				// Retrieve the item...
				const itemInWebStorage = this.source.getItem(
					// ... by its complete name
					WebStorageAdapter.getItemName( table, itemId )
				);
				// If the item simply does not exist, just ignore and skip to the next
				// TODO: Repair the table?
				if ( !itemInWebStorage ) {
					return true;
				}
				// Parse the item to match against its content
				const item = JSON.parse( itemInWebStorage );
				// Following tests are to match the entity and skip the right number of items
				if ( WebStorageEntity.matches( item, queryFind ) ) {
					matched++;
					// If we matched enough items
					if ( matched > options.skip ) {
						returnedItem = item;
						// Kill the iteration
						return false;
					}
				}
				return true;
			} );
			return returnedItem;
		}
		
		// -----
		// ### Update
		
		/**
		 * Update a single entity in the memory.
		 *
		 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for local storage or session storage interactions.
		 * @author gerkin
		 * @param   table     - Name of the table to update data in.
		 * @param   queryFind - Hash representing the entity to find.
		 * @param   update    - Object properties to set.
		 * @param   options   - Hash of options.
		 * @returns Promise resolved once update is done. Called with (*{@link DataStoreEntities.WebStorageEntity}* `entity`).
		 */
		public async updateOne(
			table: string,
			queryFind: QueryLanguage.ISelectQuery,
			update: IEntityAttributes,
			options: QueryLanguage.IQueryOptions
		): Promise<IEntityProperties | undefined> {
			_.defaults( options, {
				skip: 0,
			} );
			const entity = await this.findOne( table, queryFind, options );
			
			if ( _.isNil( entity ) ) {
				return undefined;
			}
			Utils.applyUpdateEntity( update, entity );
			this.source.setItem(
				WebStorageAdapter.getItemName( table, entity.id ),
				JSON.stringify( entity )
			);
			return entity;
		}
		
		// -----
		// ### Delete
		
		/**
		 * Delete a single entity from the local storage.
		 *
		 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for local storage or session storage interactions.
		 * @author gerkin
		 * @param   table     - Name of the table to delete data from.
		 * @param   queryFind - Hash representing the entity to find.
		 * @param   options   - Hash of options.
		 * @returns Promise resolved once item is deleted. Called with (*undefined*).
		 */
		public async deleteOne(
			table: string,
			queryFind: QueryLanguage.ISelectQuery,
			options: QueryLanguage.IQueryOptions
		): Promise<void> {
			const entityToDelete = await this.findOne( table, queryFind, options );
			
			if ( !entityToDelete ) {
				return;
			}
			const tableIndex = this.ensureCollectionExists( table );
			_.pull( tableIndex, entityToDelete.id );
			this.source.setItem( table, JSON.stringify( tableIndex ) );
			this.source.removeItem(
				WebStorageAdapter.getItemName( table, entityToDelete.id )
			);
		}
		
		/**
		 * Delete several entities from the local storage.
		 *
		 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteMany}, modified for local storage or session storage interactions.
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
			const entitiesToDelete = await this.findMany( table, queryFind, options );
			
			const tableIndex = this.ensureCollectionExists( table );
			_.pullAll( tableIndex, _.map( entitiesToDelete, 'id' ) );
			this.source.setItem( table, JSON.stringify( tableIndex ) );
			_.forEach( entitiesToDelete, entityToDelete => {
				this.source.removeItem(
					WebStorageAdapter.getItemName( table, entityToDelete.id )
				);
			} );
		}
		
		/**
		 * Create the table key if it does not exist.
		 *
		 * @author gerkin
		 * @param   table - Name of the table.
		 * @returns Index of the collection.
		 */
		private ensureCollectionExists( table: string ) {
			const index = this.source.getItem( table );
			if ( _.isNil( index ) ) {
				const newIndex: string[] = [];
				this.source.setItem( table, JSON.stringify( newIndex ) );
				return newIndex;
			} else {
				return JSON.parse( index ) as string[];
			}
		}
	}

	export namespace WebStorageAdapter {
		export interface IOptions {
			session: boolean;
		}
		export interface IOptionsRaw {
			session?: boolean;
		}
	}
}
