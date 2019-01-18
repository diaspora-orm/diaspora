import { isString, isNumber, map, isNil, Dictionary, chain, castArray, forEach } from 'lodash';

import { Adapter as _Base } from './base';
import AAdapterEntity = _Base.Base.AAdapterEntity;
import AAdapter = _Base.Base.AAdapter;
import IAdapterEntityCtr = _Base.IAdapterEntityCtr;
import { IDataSourceQuerier } from '../types/dataSourceQuerier';
import { SequentialEvent } from 'sequential-event';
import { _QueryLanguage, QueryLanguage } from '../types/queryLanguage';
import { IEntityAttributes } from '../types/entity';


export namespace Adapter {
	/**
	 * TODO: Replace with a decorator to register type validation.
	 * For instance, mongo may use the new decorator to declare a checking class that may recognize a class instance as an entity uid.
	 * It would allow the mongo adapter to use normal mongo uuid as EntityUid type member
	 * 
	 * @author Gerkin
	 */
	export class EntityUid {
		/**
		 * Use `isEntityUid` to check if the value can be a valid entity uid
		 * 
		 * @returns True if it is a valid entity Uid, false otherwise.
		 * @author Gerkin
		 * @see http://www.ecma-international.org/ecma-262/6.0/#sec-function.prototype-@@hasinstance `Symbol.hasInstance` should defined with `Object.defineProperty`
		 */
		public static isEntityUid( query: any ): query is EntityUid {
			return ( isString( query ) && query !== '' ) ||
				( isNumber( query ) && query !== 0 );
		}
	}	

	/**
	 * The Data Access Layer class is the components that wraps adapter calls to provide standard inputs & outputs. Typically, it casts raw query & raw query options in standard query & standard query options, and casts POJO from the output of the adapter's query in adapter entity.
	 *
	 * @author Gerkin
	 */
	export class DataAccessLayer<
		TEntity extends AAdapterEntity = AAdapterEntity,
		TAdapter extends AAdapter<TEntity> = AAdapter<TEntity>
	> extends SequentialEvent implements IDataSourceQuerier<
		TEntity,
		TEntity,
		QueryLanguage.SearchQuery | undefined,
		QueryLanguage.IQueryOptions | undefined
	> {
		public get classEntity() {
			return this.adapter.classEntity;
		}
		
		public get remapInput() {
			return this.adapter.remapInput;
		}
		
		public get remapOutput() {
			return this.adapter.remapOutput;
		}
		
		public get normalizeOptions() {
			return this.adapter.normalizeOptions;
		}
		
		/**
		 * Normalize the query to cast it from its most user-friendly form to a standard one.
		 * If the parameter is an ID, it will be wrapped in correct query.
		 *
		 * @author Gerkin
		 * @param originalQuery - Query to cast to its canonical form
		 * @param options       - Options to apply to the query
		 * @returns Returns the normalized query.
		 */
		public normalizeQuery(
			originalQuery: QueryLanguage.SearchQuery | undefined,
			options: _QueryLanguage.IQueryOptions
		) {
			const canonicalQuery = this.ensureQueryObject( originalQuery );
			return this.adapter.normalizeQuery( canonicalQuery, options );
		}
		
		public get name() {
			return this.adapter.name;
		}
		
		protected static dataAccessLayersRegistry = new WeakMap<AAdapter, DataAccessLayer>();
		
		/**
		 * Constructs a new instance of DataAccessLayer. This new instance is automatically registered in the registry of DataAccessLayer
		 *
		 * @author Gekrin
		 * @param adapter - Adapter to wrap
		 */
		public constructor( public adapter: TAdapter ) {
			super();
			// TODO: Fix typings problems
			DataAccessLayer.dataAccessLayersRegistry.set( adapter as any, this as any );
		}
		
		/**
		 * Get the access layer that wraps the provided adapter. If it does not exists, this method constructs a new instance of {@link DataAccessLayer}
		 *
		 * @author Gerkin
		 * @param adapter - Adapter to get access layer from.
		 */
		public static retrieveAccessLayer( adapter: AAdapter ) {
			const foundAccessLayer = this.dataAccessLayersRegistry.get( adapter );
			if ( foundAccessLayer ) {
				return foundAccessLayer;
			} else {
				return new DataAccessLayer( adapter );
			}
		}
		
		// -----
		// ### Insert
		
		/**
		 * Insert the provided entity in the desired collection
		 *
		 * @author Gerkin
		 * @param collectionName - Name of the collection to insert the entity into
		 * @param entity         - Object containing the properties of the entity to insert
		 */
		public async insertOne( collectionName: string, entity: IEntityAttributes ) {
			const entityRemappedIn = this.remapInput( collectionName, entity );
			const newEntity = await this.adapter.insertOne(
				collectionName,
				entityRemappedIn
			);
			if ( newEntity ) {
				const newEntityRemappedOut = this.remapOutput( collectionName, newEntity );
				return new this.classEntity( newEntityRemappedOut, this.adapter );
			} else {
				return undefined;
			}
		}
		
		/**
		 * Insert the provided entities in the desired collection
		 *
		 * @author Gerkin
		 * @param collectionName - Name of the collection to insert entities into
		 * @param entities       - Array of objects containing the properties of the entities to insert
		 */
		public async insertMany(
			collectionName: string,
			entities: IEntityAttributes[]
		) {
			const entitiesRemappedIn = map( entities, entity =>
				this.remapInput( collectionName, entity )
			);
			const newEntities = await this.adapter.insertMany(
				collectionName,
				entitiesRemappedIn
			);
			return map( newEntities, newEntity => {
				const newEntityRemapped = this.remapOutput( collectionName, newEntity );
				return new this.classEntity( newEntityRemapped, this.adapter );
			} );
		}
		
		// -----
		// ### Find
		
		/**
		 * Retrieve a single entity from the desired collection.
		 *
		 * @author Gerkin
		 * @param collectionName - Name of the collection to search into
		 * @param searchQuery    - Description of the entity to find
		 * @param options        - Options to apply to the query
		 */
		public async findOne(
			collectionName: string,
			searchQuery: QueryLanguage.SearchQuery | undefined,
			options: QueryLanguage.IQueryOptions = {}
		) {
			// Options to canonical
			const optionsNormalized = this.normalizeOptions( options );
			// Query search to cannonical
			const finalSearchQuery = this.remapInput(
				collectionName,
				this.normalizeQuery( searchQuery, optionsNormalized )
			);
			const foundEntity = await this.adapter.findOne(
				collectionName,
				finalSearchQuery,
				optionsNormalized
			);
			if ( foundEntity ) {
				const foundEntityRemapped = this.remapOutput( collectionName, foundEntity );
				return new this.classEntity( foundEntityRemapped, this.adapter );
			} else {
				return undefined;
			}
		}
		
		/**
		 * Retrieve several entities from the desired collection.
		 *
		 * @author Gerkin
		 * @param collectionName - Name of the collection to search into
		 * @param searchQuery    - Description of the entities to find
		 * @param options        - Options to apply to the query
		 */
		public async findMany(
			collectionName: string,
			searchQuery: QueryLanguage.SearchQuery | undefined,
			options: QueryLanguage.IQueryOptions = {}
		) {
			// Options to canonical
			const optionsNormalized = this.normalizeOptions( options );
			// Query search to cannonical
			
			const finalSearchQuery = this.remapInput(
				collectionName,
				this.normalizeQuery( searchQuery, optionsNormalized )
			);
			const foundEntities = await this.adapter.findMany(
				collectionName,
				finalSearchQuery,
				optionsNormalized
			);
			return map( foundEntities, foundEntity => {
				const foundEntityRemapped = this.remapOutput( collectionName, foundEntity );
				return new this.classEntity( foundEntityRemapped, this.adapter );
			} );
		}
		
		// -----
		// ### Update
		
		/**
		 * Update a single entity from the desired collection
		 *
		 * @author Gerkin
		 * @param collectionName - Name of the collection to update
		 * @param searchQuery    - Description of the entity to update
		 * @param update         - Properties to modify on the matched entity
		 * @param options        - Options to apply to the query
		 */
		public async updateOne(
			collectionName: string,
			searchQuery: QueryLanguage.SearchQuery | undefined,
			update: IEntityAttributes,
			options: QueryLanguage.IQueryOptions = {}
		) {
			const updateRemappedIn = this.remapInput( collectionName, update );
			// Options to canonical
			const optionsNormalized = this.normalizeOptions( options );
			// Query search to cannonical
			const finalSearchQuery = this.remapInput(
				collectionName,
				this.normalizeQuery( searchQuery, optionsNormalized )
			);
			const updatedEntity = await this.adapter.updateOne(
				collectionName,
				finalSearchQuery,
				updateRemappedIn,
				optionsNormalized
			);
			if ( updatedEntity ) {
				const updatedEntityRemapped = this.remapOutput(
					collectionName,
					updatedEntity
				);
				return new this.classEntity( updatedEntityRemapped, this.adapter );
			} else {
				return undefined;
			}
		}
		
		/**
		 * Update entities from the desired collection
		 *
		 * @author Gerkin
		 * @param collectionName - Name of the collection to update
		 * @param searchQuery    - Description of the entities to update
		 * @param update         - Properties to modify on the matched entities
		 * @param options        - Options to apply to the query
		 */
		public async updateMany(
			collectionName: string,
			searchQuery: QueryLanguage.SearchQuery | undefined,
			update: IEntityAttributes,
			options: QueryLanguage.IQueryOptions = {}
		) {
			const updateRemappedIn = this.remapInput( collectionName, update );
			// Options to canonical
			const optionsNormalized = this.normalizeOptions( options );
			// Query search to cannonical
			const finalSearchQuery = this.remapInput(
				collectionName,
				this.normalizeQuery( searchQuery, optionsNormalized )
			);
			const updatedEntities = await this.adapter.updateMany(
				collectionName,
				finalSearchQuery,
				updateRemappedIn,
				optionsNormalized
			);
			return map( updatedEntities, updatedEntity => {
				const updatedEntityRemapped = this.remapOutput(
					collectionName,
					updatedEntity
				);
				return new this.classEntity( updatedEntityRemapped, this.adapter );
			} );
		}
		
		// -----
		// ### Delete
		
		/**
		 * Delete an entity from the desired collection
		 *
		 * @author Gerkin
		 * @param collectionName - Name of the collection to delete entity from
		 * @param searchQuery    - Description of the entity to delete
		 * @param options        - Options to apply to the query
		 */
		public async deleteOne(
			collectionName: string,
			searchQuery: QueryLanguage.SearchQuery | undefined,
			options: QueryLanguage.IQueryOptions = {}
		) {
			// Options to canonical
			const optionsNormalized = this.normalizeOptions( options );
			// Query search to cannonical
			const finalSearchQuery = this.remapInput(
				collectionName,
				this.normalizeQuery( searchQuery, optionsNormalized )
			);
			return this.adapter.deleteOne(
				collectionName,
				finalSearchQuery,
				optionsNormalized
			);
		}
		
		/**
		 * Delete entities from the desired collection
		 *
		 * @author Gerkin
		 * @param collectionName - Name of the collection to delete entities from
		 * @param searchQuery    - Description of the entities to delete
		 * @param options        - Options to apply to the query
		 */
		public async deleteMany(
			collectionName: string,
			searchQuery: QueryLanguage.SearchQuery | undefined,
			options: QueryLanguage.IQueryOptions = {}
		) {
			// Options to canonical
			const optionsNormalized = this.normalizeOptions( options );
			// Query search to cannonical
			const finalSearchQuery = this.remapInput(
				collectionName,
				this.normalizeQuery( searchQuery, optionsNormalized )
			);
			return this.adapter.deleteMany(
				collectionName,
				finalSearchQuery,
				optionsNormalized
			);
		}
		
		// -----
		// ### Utility

		/**
		 * Check if the collection contains at least one element matching the query.
		 * 
		 * @param collectionName - Name of the collection to search entities in
		 * @param searchQuery    - Description of the entities to match
		 * @param options        - Options to apply to the query
		 */
		public async contains(
			collectionName: string,
			searchQuery: QueryLanguage.SearchQuery | undefined,
			options: QueryLanguage.IQueryOptions | undefined
		): Promise<boolean> {
			// Options to canonical
			const optionsNormalized = this.normalizeOptions( options );
			// Query search to cannonical
			const finalSearchQuery = this.remapInput(
				collectionName,
				this.normalizeQuery( searchQuery, optionsNormalized )
			);
			return this.adapter.contains(
				collectionName,
				finalSearchQuery,
				optionsNormalized
			);
		}

		/**
		 * Get the number of elements in a collection matching the query.
		 * 
		 * @param collectionName - Name of the collection to search entities in
		 * @param searchQuery    - Description of the entities to match
		 * @param options        - Options to apply to the query
		 */
		public async count(
			collectionName: string,
			searchQuery: QueryLanguage.SearchQuery | undefined,
			options: QueryLanguage.IQueryOptions | undefined
		): Promise<number> {
			// Options to canonical
			const optionsNormalized = this.normalizeOptions( options );
			// Query search to cannonical
			const finalSearchQuery = this.remapInput(
				collectionName,
				this.normalizeQuery( searchQuery, optionsNormalized )
			);
			return this.adapter.count(
				collectionName,
				finalSearchQuery,
				optionsNormalized
			);
		}

		/**
		 * Check if every elements in the collection matches the query.
		 * 
		 * @param collectionName - Name of the collection to search entities in
		 * @param searchQuery    - Description of the entities to match
		 * @param options        - Options to apply to the query
		 */
		public async every(
			collectionName: string,
			searchQuery: QueryLanguage.SearchQuery | undefined,
			options: QueryLanguage.IQueryOptions | undefined
		): Promise<boolean> {
			// Options to canonical
			const optionsNormalized = this.normalizeOptions( options );
			// Query search to cannonical
			const finalSearchQuery = this.remapInput(
				collectionName,
				this.normalizeQuery( searchQuery, optionsNormalized )
			);
			return this.adapter.every(
				collectionName,
				finalSearchQuery,
				optionsNormalized
			);
		}
		
		// -----
		// ### Various
		
		/**
		 * Generates a query object if the only provided parameter is an {@link EntityUid}.
		 *
		 * @param query - Entity ID or query to potentialy transform
		 */
		public ensureQueryObject(
			query?: QueryLanguage.SearchQuery
		): QueryLanguage.SelectQueryOrCondition {
			if ( isNil( query ) ) {
				return {};
			} else if ( EntityUid.isEntityUid( query ) ) {
				return {
					id: query,
				};
			} else {
				return query;
			}
		}
		
		/**
		 * Waits for the underlying adapter to be ready.
		 *
		 * @author Gerkin
		 * @see Adapter.waitReady
		 */
		public async waitReady() {
			await this.adapter.waitReady();
			return this;
		}
		
		/**
		 * Saves the remapping table, the reversed remapping table and the filter table in the adapter. Those tables will be used later when manipulating models & entities.
		 *
		 * @author gerkin
		 * @param collectionName - Name of the collection
		 * @param remaps         - Remappings to apply on properties
		 * @param filters        - Filters to apply on properties
		 */
		public configureCollection(
			collectionName: string,
			remaps: Dictionary<string> = {},
			filters: Dictionary<any> = {}
		) {
			this.adapter.configureCollection( collectionName, remaps, filters );
			return this;
		}
		
		/**
		 * Propagate the provided events from the adapter to the data access layer
		 *
		 * @author Gerkin
		 * @param eventNames - Name of the events to propagate
		 */
		protected transmitEvent( eventNames: string | string[] ) {
			forEach( castArray( eventNames ), eventName =>
				this.adapter.on( eventName, ( ...args: any[] ) => this.emit( eventName, ...args ) )
			);
		}
	}

	export type TDataSource = string | AAdapter | DataAccessLayer;
}
