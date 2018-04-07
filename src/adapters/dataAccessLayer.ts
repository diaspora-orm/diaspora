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
	
	public constructor( public adapter: TAdapter ){
		super();
		DataAccessLayer.dataAccessLayersRegistry.set( adapter, this );
	}
	
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
	
	public async insertOne(
		table: string,
		entity: IRawEntityAttributes
	){
		const entityRemappedIn = this.remapInput( table, entity );
		const newEntity = await this.adapter.insertOne( table, entityRemappedIn );
		if ( newEntity ){
			const newEntityRemappedOut = this.remapOutput(
				table,
				newEntity
			);
			return new this.classEntity( newEntityRemappedOut, this.adapter );
		} else {
			return undefined;
		}
	}
	
	public async insertMany(
		table: string,
		entities: IRawEntityAttributes[]
	){
		const entitiesRemappedIn = _.map( entities, entity => this.remapInput( table, entity ) );
		const newEntities = await this.adapter.insertMany( table, entitiesRemappedIn );
		return _.map( newEntities, newEntity => {
			const newEntityRemapped = this.remapOutput(
				table,
				newEntity
			);
			return new this.classEntity( newEntityRemapped, this.adapter );
		} );
	} 
	
	// -----
	// ### Find
	
	public async findOne(
		table: string,
		queryFind: QueryLanguage.SelectQueryOrConditionRaw,
		options: QueryLanguage.QueryOptionsRaw = {}
	){
		const queryFindRemappedIn = this.remapInput( table, queryFind );
		// Options to canonical
		const optionsNormalized = this.adapter.normalizeOptions( options );
		// Query search to cannonical
		const queryFindNormalized = this.normalizeQuery( queryFindRemappedIn, optionsNormalized );
		const foundEntity = await this.adapter.findOne( table, queryFindNormalized, optionsNormalized );
		if ( foundEntity ){
			const foundEntityRemapped = this.remapOutput(
				table,
				foundEntity
			);
			return new this.classEntity( foundEntityRemapped, this.adapter );
		} else {
			return undefined;
		}
	}
	
	public async findMany(
		table: string,
		queryFind: QueryLanguage.SelectQueryOrConditionRaw,
		options: QueryLanguage.QueryOptionsRaw = {}
	){
		const queryFindRemappedIn = this.remapInput( table, queryFind );
		// Options to canonical
		const optionsNormalized = this.adapter.normalizeOptions( options );
		// Query search to cannonical
		const queryFindNormalized = this.normalizeQuery( queryFindRemappedIn, optionsNormalized );
		const foundEntities = await this.adapter.findMany( table, queryFindNormalized, optionsNormalized );
		return _.map( foundEntities, foundEntity => {
			const foundEntityRemapped = this.remapOutput(
				table,
				foundEntity
			);
			return new this.classEntity( foundEntityRemapped, this.adapter );
		} );
	} 
	
	// -----
	// ### Update
	
	public async updateOne(
		table: string,
		queryFind: QueryLanguage.SelectQueryOrConditionRaw,
		update: IRawEntityAttributes,
		options: QueryLanguage.QueryOptionsRaw = {}
	){
		const queryFindRemappedIn = this.remapInput( table, queryFind );
		const updateRemappedIn = this.remapInput( table, update );
		// Options to canonical
		const optionsNormalized = this.adapter.normalizeOptions( options );
		// Query search to cannonical
		queryFind = this.normalizeQuery( queryFindRemappedIn, optionsNormalized );
		const updatedEntity = await this.adapter.updateOne( table, queryFind, updateRemappedIn, optionsNormalized );
		if ( updatedEntity ){
			const updatedEntityRemapped = this.remapOutput(
				table,
				updatedEntity
			);
			return new this.classEntity( updatedEntityRemapped, this.adapter );
		} else {
			return undefined;
		}
	}
	
	public async updateMany(
		table: string,
		queryFind: QueryLanguage.SelectQueryOrConditionRaw,
		update: IRawEntityAttributes,
		options: QueryLanguage.QueryOptionsRaw = {}
	){
		const queryFindRemappedIn = this.remapInput( table, queryFind );
		const updateRemappedIn = this.remapInput( table, update );
		// Options to canonical
		const optionsNormalized = this.adapter.normalizeOptions( options );
		// Query search to cannonical
		queryFind = this.normalizeQuery( queryFindRemappedIn, optionsNormalized );
		const updatedEntities = await this.adapter.updateMany( table, queryFind, updateRemappedIn, optionsNormalized );
		return _.map( updatedEntities, updatedEntity => {
			const updatedEntityRemapped = this.remapOutput(
				table,
				updatedEntity
			);
			return new this.classEntity( updatedEntityRemapped, this.adapter );
		} );
	} 
	
	// -----
	// ### Delete
	
	public async deleteOne(
		table: string,
		queryFind: QueryLanguage.SelectQueryOrConditionRaw,
		options: QueryLanguage.QueryOptionsRaw = {}
	){
		const queryFindRemappedIn = this.remapInput( table, queryFind );
		// Options to canonical
		const optionsNormalized = this.adapter.normalizeOptions( options );
		// Query search to cannonical
		queryFind = this.normalizeQuery( queryFindRemappedIn, optionsNormalized );
		return this.adapter.deleteOne( table, queryFind, optionsNormalized );
	}
	
	public async deleteMany(
		table: string,
		queryFind: QueryLanguage.SelectQueryOrConditionRaw,
		options: QueryLanguage.QueryOptionsRaw = {}
	){
		const queryFindRemappedIn = this.remapInput( table, queryFind );
		// Options to canonical
		const optionsNormalized = this.adapter.normalizeOptions( options );
		// Query search to cannonical
		queryFind = this.normalizeQuery( queryFindRemappedIn, optionsNormalized );
		return this.adapter.deleteMany( table, queryFind, optionsNormalized );
	}
	
	// -----
	// ### Utils
	
	public async waitReady(){
		await this.adapter.waitReady();
		return this;
	}
	
	/**
	 * Saves the remapping table, the reversed remapping table and the filter table in the adapter. Those tables will be used later when manipulating models & entities.
	 *
	 * @author gerkin
	 */
	public configureCollection(
		tableName: string,
		remaps: IRemapsHash,
		filters: IFiltersHash = {}
	): this {
		this.adapter.configureCollection( tableName, remaps, filters );
		return this;
	}
	
	protected transmitEvent( eventName: string ){
		this.adapter.on( eventName, ( ...args: any[] ) => this.emit( eventName, ...args ) );
	}
}
