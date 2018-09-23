import * as _ from 'lodash';
import { SequentialEvent } from 'sequential-event';

import { Adapter } from '../adapters';
import AAdapterEntity = Adapter.Base.AAdapterEntity;
import AAdapter = Adapter.Base.AAdapter;
import DataAccessLayer = Adapter.DataAccessLayer;
import TDataSource = Adapter.TDataSource;

import { Errors } from '../errors';
import { Model } from '../model';
import { QueryLanguage } from '../types/queryLanguage';
import { IModelDescription } from '../types/modelDescription';
import { IEntityAttributes, EEntityState, IIdHash, IEntityProperties, EntityUid } from '../types/entity';
import { logger } from '../logger';

const DEFAULT_OPTIONS = { skipEvents: false };

/**
 * The entity is the class you use to manage a single document in all data sources managed by your model.
 * > Note that this class is proxied: you may try to access to undocumented class properties to get entity's data attributes
 *
 * @extends SequentialEvent
 */
export abstract class Entity<TEntity extends IEntityAttributes> extends SequentialEvent {
	public get attributes() {
		return this.getAttributes();
	}
	
	public set attributes( newAttributes: TEntity | null ) {
		this._attributes = newAttributes;
	}
	
	public get state() {
		return this._state;
	}
	
	public get lastDataSource() {
		return this._lastDataSource;
	}
	
	public get dataSources() {
		return this._dataSources;
	}
	
	public get ctor() {
		return this.constructor as typeof Entity & Entity.IEntitySpawner<TEntity>;
	}
	
	private _attributes: TEntity | null = null;
	
	private _state: EEntityState = EEntityState.ORPHAN;
	
	private _lastDataSource: DataAccessLayer | null;
	
	private readonly _dataSources: Entity.IDataSourceMap<AAdapterEntity>;
	
	private idHash: IIdHash;
	
	/**
	 * Create a new entity.
	 *
	 * @author gerkin
	 * @param modelDesc   - Model configuration that generated the associated `model`.
	 * @param source - Hash with properties to copy on the new object.
	 *        If provided object inherits AdapterEntity, the constructed entity is built in `sync` state.
	 */
	public constructor(
		public readonly model: Model<TEntity>,
		source?: AAdapterEntity | TEntity | null
	) {
		super();
		const modelAttrsKeys = _.keys( this.model.modelDesc.attributes );
		
		// ### Init defaults
		const sources = _.reduce(
			model.dataSources,
			( acc: Entity.IDataSourceMap<AAdapterEntity>, adapter ) =>
			acc.set( adapter, null ),
			new WeakMap()
		);
		this._dataSources = Object.seal( sources );
		this._lastDataSource = null;
		this.idHash = {};
		
			// ### Load datas from source
			// If we construct our Entity from a datastore entity (that can happen internally in Diaspora), set it to `sync` state
		if ( source instanceof AAdapterEntity ) {
			// ### Load datas from source
			// If we construct our Entity from a datastore entity (that can happen internally in Diaspora), set it to `sync` state
			this.setLastDataSourceEntity(
				DataAccessLayer.retrieveAccessLayer( source.dataSource ),
				source
			);
		} else {
			// ### Generate attributes
			// Now we know that the source is valid. Deep clone to detach object values from entity
			this._attributes = _.isNil( source ) ? null : this.applyDefaults( _.cloneDeep( source ) );
		}
		

		// ### Final validation
		// Check keys provided in source
		const sourceDModel = _.difference( _.keys( this._attributes ), modelAttrsKeys );
		if ( 0 !== sourceDModel.length ) {
			// Later, add a criteria for schemaless models
			throw new Error(
				`Source has unknown keys: ${JSON.stringify(
					sourceDModel
				)} in ${JSON.stringify( source )}`
			);
		}
		
		// ### Load events
		_.forEach(
			this.model.modelDesc.lifecycleEvents,
			( eventFunctions, eventName ) => {
				// Iterate on each event functions. `_.castArray` will ensure we iterate on an array if a single function is provided.
				_.forEach( _.castArray( eventFunctions ), eventFunction => {
					this.on( eventName, eventFunction );
				} );
			}
		);
	}
	
	/**
	 * Apply the default values using the {@link DefaultTransformer}.
	 *
	 * @author Gerkin
	 */
	public applyDefaults(): this;
	public applyDefaults( attributes: TEntity | null ): TEntity | null;
	public applyDefaults( attributes?: TEntity | null ) {
		const attrs = _.isUndefined( attributes ) ? this._attributes : attributes;
		const defaultApplied = _.isNull( attrs ) ? null : this.ctor.model.entityTransformers.default.apply( attrs ) as TEntity;
		return _.isUndefined( attributes ) ? this : defaultApplied;
	}
	
	/**
	 * Check if the entity matches model description.
	 *
	 * @author gerkin
	 * @throws EntityValidationError Thrown if validation failed. This breaks event chain and prevent persistance.
	 * @returns This function does not return anything.
	 * @see Validator.Validator#validate
	 */
	public validate(): this;
	public validate( attributes: TEntity | null ): TEntity | null;
	public validate( attributes?: TEntity | null ) {
		const attrs = _.isUndefined( attributes ) ? this._attributes : attributes;
		const validateApplied = _.isNull( attrs ) ? null : this.ctor.model.entityTransformers.check.apply( attrs ) as TEntity;
		return _.isUndefined( attributes ) ? this : validateApplied;
	}
	
	/**
	 * Applied before persisting the entity, this function is in charge to convert entity convinient attributes to a raw entity.
	 *
	 * @author gerkin
	 * @param   data - Data to convert to primitive types.
	 * @returns Object with Primitives-only types.
	 */
	public static serialize(
		data: IEntityAttributes | null
	): IEntityAttributes | undefined {
		return data ? _.cloneDeep( data ) : undefined;
	}
	
	/**
	 * Applied after retrieving the entity, this function is in charge to convert entity raw attributes to convinient types.
	 *
	 * @author gerkin
	 * @param   data - Data to convert from primitive types.
	 * @returns Object with Primitives & non primitives types.
	 */
	public static deserialize(
		data: IEntityAttributes | null
	): IEntityAttributes | undefined {
		return data ? _.cloneDeep( data ) : undefined;
	}
	
	/**
	 * Generate the query to get this unique entity in the desired data source.
	 *
	 * @author gerkin
	 * @param   dataSource - Data source to get query for.
	 * @returns Query to find this entity.
	 */
	public uidQuery(
		dataSource?: TDataSource
	): QueryLanguage.Raw.SelectQueryOrCondition {
		const dataSourceFixed = this.getDataSource( dataSource );
		// Todo: precise return type
		return {
			id: this.idHash[dataSourceFixed.name],
		};
	}
	
	/**
	 * Return the collectionName of this entity in the specified data source.
	 *
	 * @author gerkin
	 * @returns Name of the collectionName.
	 */
	public collectionName( dataSource?: TDataSource ) {
		// Will be used later
		return this.model.name;
	}
	
	/**
	 * Returns a copy of this entity attributes.
	 *
	 * @author gerkin
	 * @returns Attributes of this entity.
	 */
	public getAttributes( dataSource?: undefined ): TEntity | null;
	public getAttributes( dataSource: TDataSource ): TEntity;
	public getAttributes(
		dataSource?: TDataSource | undefined
	): TEntity | null {
		if ( dataSource ) {
			// Get the target data source
			const dataSourceFixed = this.getDataSource( dataSource );
			const adapterEntity = this._dataSources.get( dataSourceFixed );
			return adapterEntity ? adapterEntity.attributes as any : null;
		}
		return this._attributes;
	}
	
	/**
	 * Returns a copy of this entity attributes.
	 *
	 * @author gerkin
	 * @returns Attributes of this entity.
	 */
	public getProperties( dataSource: TDataSource ): ( TEntity & IEntityProperties ) | null {
		// Get the target data source
		const dataSourceFixed = this.getDataSource( dataSource );
		const adapterEntity = this._dataSources.get( dataSourceFixed );
		return adapterEntity ? adapterEntity.properties as any : null;
	}
	
	/**
	 * Save this entity in specified data source.
	 *
	 * @fires Entity#beforeUpdate
	 * @fires Entity#afterUpdate
	 * @author gerkin
	 * @param   sourceName - Name of the data source to persist entity in.
	 * @param   options    - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
	 * @returns Promise resolved once entity is saved. Resolved with `this`.
	 */
	public async persist(
		dataSource?: TDataSource,
		options: Entity.IOptions = {}
	) {
		_.defaults( options, DEFAULT_OPTIONS );
		// Change the state of the entity
		const beforeState = this.state;
		this._state = EEntityState.SYNCING;
		// Get the target data source & its name
		const dataSourceFixed = this.getDataSource( dataSource );
		const finalSourceName = dataSourceFixed.name;
		// Generate events args
		const eventsArgs = [finalSourceName, this.serialize()];
		const _maybeEmit = this.maybeEmit.bind( this, options, eventsArgs );
		
		// Get suffix. If entity was orphan, we are creating. Otherwise, we are updating
		const suffix = 'orphan' === beforeState ? 'Create' : 'Update';
		
		// Trigger events & validation
		await _maybeEmit( ['beforePersist', 'beforeValidate'] );
		this.attributes = this.validate( this.attributes );
		this.attributes = this.applyDefaults( this.attributes );
		await _maybeEmit( ['afterValidate', `beforePersist${suffix}`] );
		
		// Depending on state, we are going to perform a different operation
		const dataStoreEntity: AAdapterEntity | undefined = await ( beforeState === 'orphan'
		? this.persistCreate( dataSourceFixed )
		: this.persistUpdate( dataSourceFixed, options ) );
		if ( !dataStoreEntity ) {
			throw new Error( 'Insert/Update returned nothing.' );
		}
		// Now we insert data in stores
		this.setLastDataSourceEntity( dataSourceFixed, dataStoreEntity );
		
		return _maybeEmit( [`afterPersist${suffix}`, 'afterPersist'] );
	}
	
	/**
	 * Reload this entity from specified data source.
	 *
	 * @fires Entity#beforeFind
	 * @fires Entity#afterFind
	 * @author gerkin
	 * @param   sourceName         - Name of the data source to fetch entity from.
	 * @param   options            - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
	 * @returns Promise resolved once entity is reloaded. Resolved with `this`.
	 */
	public async fetch( dataSource?: TDataSource, options: Entity.IOptions = {} ) {
		_.defaults( options, DEFAULT_OPTIONS );
		// Change the state of the entity
		const beforeState = this.state;
		this._state = EEntityState.SYNCING;
		// Generate events args
		const dataSourceFixed = this.getDataSource( dataSource );
		const eventsArgs = [dataSourceFixed.name, this.serialize()];
		const _maybeEmit = this.maybeEmit.bind( this, options, eventsArgs );
		
		await _maybeEmit( 'beforeFetch' );
		
		const dataStoreEntity = await this.execIfOkState(
			beforeState,
			dataSourceFixed,
			'findOne'
		);
		// Now we insert data in stores
		this.setLastDataSourceEntity( dataSourceFixed, dataStoreEntity );
		
		return _maybeEmit( 'afterFetch' );
	}
	
	/**
	 * Delete this entity from the specified data source.
	 *
	 * @fires Entity#beforeDelete
	 * @fires Entity#afterDelete
	 * @author gerkin
	 * @param   sourceName - Name of the data source to delete entity from.
	 * @param   options    - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
	 * @returns Promise resolved once entity is destroyed. Resolved with `this`.
	 */
	public async destroy(
		dataSource?: TDataSource,
		options: Entity.IOptions = {}
	) {
		_.defaults( options, DEFAULT_OPTIONS );
		// Change the state of the entity
		const beforeState = this.state;
		this._state = EEntityState.SYNCING;
		// Generate events args
		const dataSourceFixed = this.getDataSource( dataSource );
		const eventsArgs = [dataSourceFixed.name, this.serialize()];
		const _maybeEmit = this.maybeEmit.bind( this, options, eventsArgs );
		
		await _maybeEmit( 'beforeDestroy' );
		
		await this.execIfOkState( beforeState, dataSourceFixed, 'deleteOne' );
		
		// Now we insert data in stores
		this.setLastDataSourceEntity( dataSourceFixed, null );
		
		return _maybeEmit( 'afterDestroy' );
	}
	
	/**
	 * Get the ID for the given source name. This ID is retrieved from the Data Store entity, not the latest ID hash of the entity itself
	 *
	 * @param   sourceName - Name of the source to get ID from.
	 * @returns Id of this entity in requested data source.
	 */
	public getId( dataSource: TDataSource ): EntityUid | null {
		const dataSourceFixed = this.getDataSource( dataSource );
		const entity = this.dataSources.get( dataSourceFixed );
		if ( entity ) {
			return entity.id;
		} else {
			return null;
		}
	}
	
	/**
	 * Generate a diff update query by checking deltas with last source interaction.
	 *
	 * @author gerkin
	 * @param   dataSource - Data source to diff with.
	 * @returns Diff query.
	 */
	public getDiff( dataSource?: TDataSource ): IEntityAttributes | undefined {
		const dataSourceFixed = this.getDataSource( dataSource );
		const dataStoreEntity = this.dataSources.get( dataSourceFixed );
		// All is diff if not present
		if ( _.isNil( dataStoreEntity ) || _.isNil( this.attributes ) ) {
			return this.attributes || undefined;
		}
		const dataStoreObject = dataStoreEntity.attributes;
		const currentAttributes = this.attributes;
		
		const potentialChangedKeys = _.chain( currentAttributes )
		// Get all keys in current attributes
		.keys()
		// Add to it the keys of the stored object
		.concat( _.keys( dataStoreObject ) )
		// Remove duplicates
		.uniq();
		
		// Omit values that did not changed between now & stored object
		const diffKeys = potentialChangedKeys.reject( ( key: string ) => _.isEqual( dataStoreEntity.attributes[key], currentAttributes[key] ) );
		
		return diffKeys.transform( ( accumulator: IEntityAttributes, key: string ) => {
			accumulator[key] = currentAttributes[key];
			return accumulator;
		},                         {} ).value();
	}
	
	/**
	 * Get the data access layer object that matches with the input type.
	 *
	 * @author Gerkin
	 * @param dataSource - String, Adapter or DataAccessLayer to get in the DataAccessLayer form
	 */
	protected getDataSource( dataSource?: TDataSource ) {
		return this.ctor.model.getDataSource( dataSource );
	}
	
	/**
	 * Serialize an entity
	 *
	 * TODO: a real description
	 */
	protected serialize() {
		return Entity.serialize( this.attributes );
	}
	
	/**
	 * Deserialize an entity
	 *
	 * TODO: a real description
	 */
	protected deserialize() {
		return Entity.deserialize( this.attributes );
	}
	
	/**
	 * Cast fields from their raw type to their expected type
	 *
	 * @author Gerkin
	 * @param source - Raw entity properties to cast
	 * @returns the casted properties
	 */
	private castTypes( source: {[key in keyof TEntity]: any} ): TEntity {
		const attrs = this.model.modelDesc.attributes;
		const foo: Partial<TEntity> | undefined = undefined;
		return _.mapValues( source, <TKey extends keyof TEntity>( currentVal: any, attrName: keyof TEntity ) => {
			const attrDesc = attrs[attrName as string];
			if ( _.isObject( attrDesc ) ) {
				switch ( attrDesc.type ) {
					case 'datetime':
					{
						if ( _.isString( currentVal ) || _.isInteger( currentVal ) ) {
							return new Date( currentVal );
						} else if ( !( currentVal instanceof Date ) ) {
							logger.error(
								'Incoherent data type received, expected DateTime castable data, but received: ' +
								currentVal
							);
							return undefined;
						}
					}
					break;
				}
			}
			return currentVal as TEntity[TKey];
		} ) as TEntity;
	}
	
	/**
	 * Conditionaly triggers the provided events names with provided arguments if the options requires it.
	 *
	 * @author Gerkin
	 * @param options    - Options of the current entity operation
	 * @param eventsArgs - Arguments to transmit by the events
	 * @param events     - Event name(s) to trigger
	 */
	private async maybeEmit(
		options: Entity.IOptions,
		eventsArgs: any[],
		events: string | string[]
	): Promise<this> {
		events = _.castArray( events );
		if ( options.skipEvents ) {
			return this;
		} else {
			await this.emit( events[0], ...eventsArgs );
			if ( events.length > 1 ) {
				return this.maybeEmit( options, eventsArgs, _.slice( events, 1 ) );
			} else {
				return this;
			}
		}
	}
	
	/**
	 * Runs the provided query if the entity is not in {@link EEntityState.ORPHAN} mode.
	 *
	 * @author Gerkin
	 * @param beforeState - The last stable state of the entity (before the current operation)
	 * @param dataSource  -
	 * @param method      -
	 */
	private execIfOkState<TAdapterEntity extends AAdapterEntity>(
		beforeState: EEntityState,
		dataSource: DataAccessLayer,
		// TODO: precise it
		method: string
	): Promise<TAdapterEntity> {
		// Depending on state, we are going to perform a different operation
		if ( EEntityState.ORPHAN === beforeState ) {
			return Promise.reject(
				new Errors.EntityStateError( "Can't fetch an orphan entity." )
			);
		} else {
			this._lastDataSource = dataSource;
			const execMethod: (
				collectionName: string,
				query: object
			) => Promise<TAdapterEntity> = ( dataSource as any )[method];
			return execMethod.call(
				dataSource,
				this.collectionName( dataSource.name ),
				this.uidQuery( dataSource )
			);
		}
	}
	
	/**
	 * Refresh last data source, attributes, state & data source entity
	 *
	 * @author Gerkin
	 * @param dataSource       - Data source to set as last used
	 * @param dataSourceEntity - New entity returned by this data source
	 */
	private setLastDataSourceEntity(
		dataSource: DataAccessLayer,
		dataSourceEntity: AAdapterEntity | null
	) {
		// We have used data source, store it
		this._lastDataSource = dataSource;
		// Refresh data source's entity
		this._dataSources.set( dataSource, dataSourceEntity );
		// Set attributes from dataSourceEntity
		if ( dataSourceEntity ) {
			// Set the state
			this._state = EEntityState.SYNC;
			const attrs = this.castTypes( dataSourceEntity.attributes as any );
			this.idHash = _.cloneDeep( dataSourceEntity.properties.idHash );
			this._attributes = _.cloneDeep( attrs );
		} else {
			this._attributes = null;
			// If this was our only data source, then go back to orphan state
			if (
				_.chain( this.model.dataSources )
				.values()
				.without( dataSource )
				.isEmpty()
				.value()
			) {
				this._state = EEntityState.ORPHAN;
			} else {
				this._state = EEntityState.SYNC;
				this.idHash = {};
			}
		}
		return this;
	}
	
	/**
	 * Persist the entity in the data source by performing an `insertOne` action
	 *
	 * @author Gerkin
	 * @param dataSource     - Data source to persist entity into
	 */
	private async persistCreate( dataSource: DataAccessLayer ) {
		if ( this.attributes ) {
			return dataSource.insertOne(
				this.collectionName( dataSource ),
				this.attributes
			);
		} else {
			return undefined;
		}
	}
	
	/**
	 * Persist the entity in the data source by performing an `updateOne` action
	 *
	 * @author Gerkin
	 * @param dataSource - Data source to persist entity into
	 * @param options    - Optional options hash for the `update` operation
	 */
	private async persistUpdate(
		dataSource: DataAccessLayer,
		options?: Entity.IOptions
	) {
		const diff = this.getDiff( dataSource );
		return diff
		? dataSource.updateOne(
			this.collectionName( dataSource ),
			this.uidQuery( dataSource ),
			diff,
			options as any
		)
		: undefined;
	}
}

export namespace Entity {
	export interface IOptions {
		skipEvents?: boolean;
	}
	
	export interface IEntitySpawner<TEntity> {
		model: Model<TEntity>;
		name: string;
		new ( source?: IEntityAttributes ): Entity<TEntity>;
	}
	export interface IDataSourceMap<TAdapterEntity extends AAdapterEntity>
	extends WeakMap<DataAccessLayer<TAdapterEntity, AAdapter<TAdapterEntity>>, TAdapterEntity | null> {}
	
	/**
	 * This factory function generate a new class constructor, prepared for a specific model.
	 *
	 * @author Gerkin
	 * @param   name      - Name of this model.
	 * @param   modelDesc - Model configuration that generated the associated `model`.
	 * @param   model     - Model that will spawn entities.
	 * @returns Entity constructor to use with this model.
	 */
	export interface IEntityFactory{
		<TEntity>( name: string, modelDesc: IModelDescription, model: Model<TEntity> ): IEntitySpawner<TEntity>;
		Entity: typeof Entity;
	}
}

// =====
// ## Lifecycle Events

// -----
// ### Persist

/**
 * @event Entity#beforePersist
 * @type {String}
 */

/**
 * @event Entity#beforeValidate
 * @type {String}
 */

/**
 * @event Entity#afterValidate
 * @type {String}
 */

/**
 * @event Entity#beforePersistCreate
 * @type {String}
 */

/**
 * @event Entity#beforePersistUpdate
 * @type {String}
 */

/**
 * @event Entity#afterPersistCreate
 * @type {String}
 */

/**
 * @event Entity#afterPersistUpdate
 * @type {String}
 */

/**
 * @event Entity#afterPersist
 * @type {String}
 */

// -----
// ### Find

/**
 * @event Entity#beforeFind
 * @type {String}
 */

/**
 * @event Entity#afterFind
 * @type {String}
 */

// -----
// ### Destroy

/**
 * @event Entity#beforeDestroy
 * @type {String}
 */

/**
 * @event Entity#afterDestroy
 * @type {String}
 */
