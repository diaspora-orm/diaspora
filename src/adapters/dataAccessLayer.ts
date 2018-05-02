import * as _ from 'lodash';

import { Adapter, AdapterEntity, IAdapterEntityCtr } from './base';
import { DataSourceQuerier, IRemapsHash, IFiltersHash, IEnumeratedHash } from '../types/dataSourceQuerier';
import { SequentialEvent } from 'sequential-event';
import { IRawEntityAttributes } from '../entities';
import { QueryLanguage } from '../types/queryLanguage';

/**
 * The Data Access Layer class is the components that wraps adapter calls to provide standard inputs & outputs. Typically, it casts raw query & raw query options in standard query & standard query options, and casts POJO from the output of the adapter's query in adapter entity.
 * 
 * @author Gerkin
 */
export class DataAccessLayer<
TEntity extends AdapterEntity = AdapterEntity,
TAdapter extends Adapter<TEntity> = Adapter<TEntity>
> extends SequentialEvent implements DataSourceQuerier<TEntity>{
	public get classEntity(){
		return this.adapter.classEntity;
	}

	public get remapInput(){
		return this.adapter.remapInput;
	}

	public get remapOutput(){
		return this.adapter.remapOutput;
	}

	public get normalizeOptions(){
		return this.adapter.normalizeOptions;
	}

	public get normalizeQuery(){
		return this.adapter.normalizeQuery;
	}

	public get name(){
		return this.adapter.name;
	}

	protected static dataAccessLayersRegistry = new WeakMap<Adapter, DataAccessLayer>();
	
	/**
	 * Constructs a new instance of DataAccessLayer. This new instance is automatically registered in the registry of DataAccessLayer
	 * 
	 * @author Gekrin
	 * @param adapter - Adapter to wrap
	 */
	public constructor( public adapter: TAdapter ){
		super();
		// TODO: Fix typings problems
		DataAccessLayer.dataAccessLayersRegistry.set( adapter, this );
	}
	
	/**
	 * Get the access layer that wraps the provided adapter. If it does not exists, this method constructs a new instance of {@link DataAccessLayer}
	 * 
	 * @author Gerkin
	 * @param adapter - Adapter to get access layer from.
	 */
	public static retrieveAccessLayer( adapter: Adapter ){
		const foundAccessLayer = this.dataAccessLayersRegistry.get( adapter );
		if ( foundAccessLayer ){
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
	public async insertOne(
		collectionName: string,
		entity: IRawEntityAttributes
	){
		const entityRemappedIn = this.remapInput( collectionName, entity );
		const newEntity = await this.adapter.insertOne( collectionName, entityRemappedIn );
		if ( newEntity ){
			const newEntityRemappedOut = this.remapOutput(
				collectionName,
				newEntity
			);
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
		entities: IRawEntityAttributes[]
	){
		const entitiesRemappedIn = _.map( entities, entity => this.remapInput( collectionName, entity ) );
		const newEntities = await this.adapter.insertMany( collectionName, entitiesRemappedIn );
		return _.map( newEntities, newEntity => {
			const newEntityRemapped = this.remapOutput(
				collectionName,
				newEntity
			);
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
	 * @param queryFind      - Description of the entity to find
	 * @param options        - Options to apply to the query
	 */
	public async findOne(
		collectionName: string,
		queryFind: QueryLanguage.SelectQueryOrConditionRaw,
		options: QueryLanguage.QueryOptionsRaw = {}
	){
		const queryFindRemappedIn = this.remapInput( collectionName, queryFind );
		// Options to canonical
		const optionsNormalized = this.adapter.normalizeOptions( options );
		// Query search to cannonical
		const queryFindNormalized = this.normalizeQuery( queryFindRemappedIn, optionsNormalized );
		const foundEntity = await this.adapter.findOne( collectionName, queryFindNormalized, optionsNormalized );
		if ( foundEntity ){
			const foundEntityRemapped = this.remapOutput(
				collectionName,
				foundEntity
			);
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
	 * @param queryFind      - Description of the entities to find
	 * @param options        - Options to apply to the query
	 */
	public async findMany(
		collectionName: string,
		queryFind: QueryLanguage.SelectQueryOrConditionRaw,
		options: QueryLanguage.QueryOptionsRaw = {}
	){
		const queryFindRemappedIn = this.remapInput( collectionName, queryFind );
		// Options to canonical
		const optionsNormalized = this.adapter.normalizeOptions( options );
		// Query search to cannonical
		const queryFindNormalized = this.normalizeQuery( queryFindRemappedIn, optionsNormalized );
		const foundEntities = await this.adapter.findMany( collectionName, queryFindNormalized, optionsNormalized );
		return _.map( foundEntities, foundEntity => {
			const foundEntityRemapped = this.remapOutput(
				collectionName,
				foundEntity
			);
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
	 * @param queryFind      - Description of the entity to update
	 * @param update         - Properties to modify on the matched entity
	 * @param options        - Options to apply to the query
	 */
	public async updateOne(
		collectionName: string,
		queryFind: QueryLanguage.SelectQueryOrConditionRaw,
		update: IRawEntityAttributes,
		options: QueryLanguage.QueryOptionsRaw = {}
	){
		const queryFindRemappedIn = this.remapInput( collectionName, queryFind );
		const updateRemappedIn = this.remapInput( collectionName, update );
		// Options to canonical
		const optionsNormalized = this.adapter.normalizeOptions( options );
		// Query search to cannonical
		queryFind = this.normalizeQuery( queryFindRemappedIn, optionsNormalized );
		const updatedEntity = await this.adapter.updateOne( collectionName, queryFind, updateRemappedIn, optionsNormalized );
		if ( updatedEntity ){
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
	 * @param queryFind      - Description of the entities to update
	 * @param update         - Properties to modify on the matched entities
	 * @param options        - Options to apply to the query
	 */
	public async updateMany(
		collectionName: string,
		queryFind: QueryLanguage.SelectQueryOrConditionRaw,
		update: IRawEntityAttributes,
		options: QueryLanguage.QueryOptionsRaw = {}
	){
		const queryFindRemappedIn = this.remapInput( collectionName, queryFind );
		const updateRemappedIn = this.remapInput( collectionName, update );
		// Options to canonical
		const optionsNormalized = this.adapter.normalizeOptions( options );
		// Query search to cannonical
		queryFind = this.normalizeQuery( queryFindRemappedIn, optionsNormalized );
		const updatedEntities = await this.adapter.updateMany( collectionName, queryFind, updateRemappedIn, optionsNormalized );
		return _.map( updatedEntities, updatedEntity => {
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
	 * @param queryFind      - Description of the entity to delete
	 * @param options        - Options to apply to the query
	 */
	public async deleteOne(
		collectionName: string,
		queryFind: QueryLanguage.SelectQueryOrConditionRaw,
		options: QueryLanguage.QueryOptionsRaw = {}
	){
		const queryFindRemappedIn = this.remapInput( collectionName, queryFind );
		// Options to canonical
		const optionsNormalized = this.adapter.normalizeOptions( options );
		// Query search to cannonical
		queryFind = this.normalizeQuery( queryFindRemappedIn, optionsNormalized );
		return this.adapter.deleteOne( collectionName, queryFind, optionsNormalized );
	}
	
	/**
	 * Delete entities from the desired collection
	 * 
	 * @author Gerkin
	 * @param collectionName - Name of the collection to delete entities from
	 * @param queryFind      - Description of the entities to delete
	 * @param options        - Options to apply to the query
	 */
	public async deleteMany(
		collectionName: string,
		queryFind: QueryLanguage.SelectQueryOrConditionRaw,
		options: QueryLanguage.QueryOptionsRaw = {}
	){
		const queryFindRemappedIn = this.remapInput( collectionName, queryFind );
		// Options to canonical
		const optionsNormalized = this.adapter.normalizeOptions( options );
		// Query search to cannonical
		queryFind = this.normalizeQuery( queryFindRemappedIn, optionsNormalized );
		return this.adapter.deleteMany( collectionName, queryFind, optionsNormalized );
	}
	
	// -----
	// ### Utils
	
	/**
	 * Waits for the underlying adapter to be ready.
	 * 
	 * @author Gerkin
	 * @see Adapter.waitReady
	 */
	public async waitReady(){
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
		remaps: IRemapsHash,
		filters: IFiltersHash = {}
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
	protected transmitEvent( eventNames: string | string[] ){
		_.chain( eventNames ).castArray().forEach( eventName => this.adapter.on( eventName, ( ...args: any[] ) => this.emit( eventName, ...args ) ) );
	}
}

export type TDataSource = string | Adapter | DataAccessLayer;
