import * as _ from 'lodash';
import { SequentialEvent } from 'sequential-event';

import { Errors } from '../errors';
import {
	AdapterEntity,
	Adapter,
	IRawAdapterEntityAttributes,
	IIdHash,
} from '../adapters/base';
import { Model } from '../model';
import { ModelDescription } from '../types/modelDescription';
import { DataAccessLayer, TDataSource } from '../adapters/dataAccessLayer';

const DEFAULT_OPTIONS = { skipEvents: false };

export interface IOptions {
	skipEvents?: boolean;
}
export interface IRawEntityAttributes {
	[key: string]: any;
}

/**
 * Reflects the state of the entity.
 * 
 * @author Gerkin
 */
export enum EEntityState {
	ORPHAN = 'orphan',
	SYNCING = 'syncing',
	SYNC = 'sync',
}
export type EntityUid = string | number;

export interface EntitySpawner {
	model: Model;
	name: string;
	new ( source?: IRawEntityAttributes ): Entity;
}
export interface IDataSourceMap<T extends AdapterEntity>
extends WeakMap<DataAccessLayer<T, Adapter<T>>, T | null> {}


const entityCtrSteps = {
	castTypes( source: IRawAdapterEntityAttributes, modelDesc: ModelDescription ) {
		const attrs = modelDesc.attributes;
		_.forEach( source, ( currentVal: any, attrName: string ) => {
			const attrDesc = attrs[attrName];
			if ( _.isObject( attrDesc ) ) {
				switch ( attrDesc.type ) {
					case 'date':
					{
						if ( _.isString( currentVal ) || _.isInteger( currentVal ) ) {
							source[attrName] = new Date( currentVal );
						}
					}
					break;
				}
			}
		} );
		return source;
	},
	loadSource( this: Entity, source: IRawEntityAttributes ) {
		return source;
	},
};

/**
 * The entity is the class you use to manage a single document in all data sources managed by your model.
 * > Note that this class is proxied: you may try to access to undocumented class properties to get entity's data attributes
 *
 * @extends SequentialEvent
 */
export abstract class Entity extends SequentialEvent {
	public get attributes() {
		return this._attributes;
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
		return this.constructor as typeof Entity & EntitySpawner;
	}
	
	public get id(){
		return this.getId();
	}
	
	private _attributes: IRawEntityAttributes | null = null;
	
	private _state: EEntityState = EEntityState.ORPHAN;
	
	private _lastDataSource: DataAccessLayer | null;
	
	private readonly _dataSources: IDataSourceMap<AdapterEntity>;
	
	private idHash: IIdHash;
	
	/**
	 * Create a new entity.
	 *
	 * @author gerkin
	 * @param name        - Name of this model.
	 * @param modelDesc   - Model configuration that generated the associated `model`.
	 * @param model       - Model that will spawn entities.
	 * @param source - Hash with properties to copy on the new object.
	 *        If provided object inherits AdapterEntity, the constructed entity is built in `sync` state.
	 */
	public constructor(
		private readonly name: string,
		private readonly modelDesc: ModelDescription,
		private readonly model: Model,
		source: AdapterEntity | IRawEntityAttributes = {}
	) {
		super();
		const modelAttrsKeys = _.keys( modelDesc.attributes );
		
		// ### Init defaults
		const sources = _.reduce(
			model.dataSources,
			( acc: IDataSourceMap<AdapterEntity>, adapter ) => acc.set( adapter, null ),
			new WeakMap()
		);
		this._dataSources = Object.seal( sources );
		this._lastDataSource = null;
		this.idHash = {};
		
		// ### Load datas from source
		// If we construct our Entity from a datastore entity (that can happen internally in Diaspora), set it to `sync` state
		if ( source instanceof AdapterEntity ) {
			this.setLastDataSourceEntity( DataAccessLayer.retrieveAccessLayer( source.dataSource ), source );
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
		
		// ### Generate attributes
		// Now we know that the source is valid. Deep clone to detach object values from entity then Default model attributes with our model desc
		const definitiveSource = this.attributes || source;
		this._attributes = _.cloneDeep( definitiveSource );
		model.entityTransformers.default.apply( this._attributes ).then( attrsDefaulted => {
			this._attributes = attrsDefaulted;
			this.emit( 'ready' );
		} ).catch( error => {
			this._attributes = null;
			this.emit( 'readyerror', error );
		} );
		
		// ### Load events
		_.forEach( modelDesc.lifecycleEvents, ( eventFunctions, eventName ) => {
			// Iterate on each event functions. `_.castArray` will ensure we iterate on an array if a single function is provided.
			_.forEach( _.castArray( eventFunctions ), eventFunction => {
				this.on( eventName, eventFunction );
			} );
		} );
	}
	
	/**
	 * Promise generator that resolves after the entity has been defaulted.
	 * 
	 * @author Gerkin
	 */
	public onceDefaulted(){
		return new Promise( ( resolve, reject ) => this.once( 'ready', resolve ).once( 'readyerror', reject ) );
	}
	
	/**
	 * Applied before persisting the entity, this function is in charge to convert entity convinient attributes to a raw entity.
	 *
	 * @author gerkin
	 * @param   data - Data to convert to primitive types.
	 * @returns Object with Primitives-only types.
	 */
	public static serialize(
		data: IRawEntityAttributes | null
	): IRawEntityAttributes | undefined {
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
		data: IRawEntityAttributes | null
	): IRawEntityAttributes | undefined {
		return data ? _.cloneDeep( data ) : undefined;
	}
	
	/**
	 * Generate the query to get this unique entity in the desired data source.
	 *
	 * @author gerkin
	 * @param   dataSource - Data source to get query for.
	 * @returns Query to find this entity.
	 */
	public uidQuery( dataSource?: TDataSource ): object {
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
		return this.name;
	}
	
	/**
	 * Check if the entity matches model description.
	 *
	 * @author gerkin
	 * @throws EntityValidationError Thrown if validation failed. This breaks event chain and prevent persistance.
	 * @returns This function does not return anything.
	 * @see Validator.Validator#validate
	 */
	public validate() {
		if ( this.attributes ) {
			this.ctor.model.entityTransformers.check.apply( this.attributes );
		}
		return this;
	}
	
	/**
	 * Remove all editable properties & replace them with provided object.
	 *
	 * @author gerkin
	 * @param   newContent - Replacement content.
	 * @returns Returns `this`.
	 */
	public replaceAttributes( newContent: IRawEntityAttributes = {} ) {
		newContent.idHash = this.idHash;
		this._attributes = newContent;
		return this;
	}
	
	/**
	 * Returns a copy of this entity attributes.
	 *
	 * @author gerkin
	 * @returns Attributes of this entity.
	 */
	public toObject() {
		return _.cloneDeep( this.attributes );
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
	public async persist( dataSource?: TDataSource, options: IOptions = {} ) {
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
		this.validate();
		await _maybeEmit( ['afterValidate', `beforePersist${suffix}`] );
		
		// Depending on state, we are going to perform a different operation
		const dataStoreEntity: AdapterEntity | undefined = await ( ( beforeState === 'orphan' ) ?
		this.persistCreate( dataSourceFixed ) :
		this.persistUpdate( dataSourceFixed, options ) );
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
	public async fetch( dataSource?: TDataSource, options: IOptions = {} ) {
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
	public async destroy( dataSource?: TDataSource, options: IOptions = {} ) {
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
	public getId( dataSource?: TDataSource ): EntityUid | null {
		const dataSourceFixed = this.getDataSource( dataSource );
		const entity = this.dataSources.get( dataSourceFixed );
		if ( entity ) {
			return entity.attributes.id;
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
	public getDiff( dataSource?: TDataSource ): IRawEntityAttributes | undefined {
		const dataSourceFixed = this.getDataSource( dataSource );
		const dataStoreEntity = this.dataSources.get( dataSourceFixed );
		// All is diff if not present
		if ( _.isNil( dataStoreEntity ) || _.isNil( this.attributes ) ) {
			return this.attributes || undefined;
		}
		const dataStoreObject = dataStoreEntity.toObject() as IRawEntityAttributes;
		const currentAttributes = this.attributes;
		
		const potentialChangedKeys = _.chain( currentAttributes )
		// Get all keys in current attributes
		.keys()
		// Add to it the keys of the stored object
		.concat( _.keys( dataStoreObject ) )
		// Remove duplicates
		.uniq();
		
		const diffKeys = potentialChangedKeys
		// Omit values that did not changed between now & stored object
		.reject( ( key: string ) => ['id', 'idHash'].includes( key ) || _.isEqual( dataStoreEntity.attributes[key], currentAttributes[key] ) );
		
		return diffKeys.transform( ( accumulator: IRawEntityAttributes, key: string ) => {
			accumulator[key] = currentAttributes[key];
			return accumulator;
		}, {} ).value();
	}
	
	/**
	 * Get the data access layer object that matches with the input type.
	 * 
	 * @author Gerkin
	 * @param dataSource - String, Adapter or DataAccessLayer to get in the DataAccessLayer form
	 */
	protected getDataSource( dataSource?: TDataSource ){
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
	 * Conditionaly triggers the provided events names with provided arguments if the options requires it.
	 * 
	 * @author Gerkin
	 * @param options    - Options of the current entity operation
	 * @param eventsArgs - Arguments to transmit by the events
	 * @param events     - Event name(s) to trigger
	 */
	private async maybeEmit(
		options: IOptions,
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
	private execIfOkState<T extends AdapterEntity>(
		beforeState: EEntityState,
		dataSource: DataAccessLayer,
		// TODO: precise it
		method: string
	): Promise<T>{
		// Depending on state, we are going to perform a different operation
		if ( EEntityState.ORPHAN === beforeState ) {
			return Promise.reject( new Errors.EntityStateError( "Can't fetch an orphan entity." ) );
		} else {
			this._lastDataSource = dataSource;
			const execMethod: (
				collectionName: string,
				query: object
			) => Promise<T> = ( dataSource as any )[method];
			return execMethod.call( dataSource, this.collectionName( dataSource.name ), this.uidQuery( dataSource ) );
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
		dataSourceEntity: AdapterEntity | null
	) {
		// We have used data source, store it
		this._lastDataSource = dataSource;
		// Refresh data source's entity
		this._dataSources.set( dataSource, dataSourceEntity );
		// Set attributes from dataSourceEntity
		if ( dataSourceEntity ) {
			// Set the state
			this._state = EEntityState.SYNC;
			const attrs = entityCtrSteps.castTypes(
				dataSourceEntity.toObject(),
				this.modelDesc
			);
			this.idHash = attrs.idHash;
			this._attributes = _.omit( attrs, ['id', 'idHash'] );
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
			return ( dataSource.insertOne( this.collectionName( dataSource ), this.attributes ) );
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
	private async persistUpdate( dataSource: DataAccessLayer, options?: IOptions ) {
		const diff = this.getDiff( dataSource );
		return diff
		? ( ( dataSource.updateOne(
			this.collectionName( dataSource ),
			this.uidQuery( dataSource ),
			diff,
			options as any
		) ) )
		: undefined;
	}
}

/**
 * This factory function generate a new class constructor, prepared for a specific model.
 *
 * @author Gerkin
 * @param   name      - Name of this model.
 * @param   modelDesc - Model configuration that generated the associated `model`.
 * @param   model     - Model that will spawn entities.
 * @returns Entity constructor to use with this model.
 */
export interface IEntityFactory {
	( name: string, modelDesc: ModelDescription, model: Model ): EntitySpawner;
	Entity: Entity;
}

// We init the function as any to define the Entity property later.
const ef: any = ( name: string, modelDesc: ModelDescription, model: Model ) => {
	/**
	 * @ignore
	 */
	class SubEntity extends Entity {
		/**
		 * Name of the class.
		 *
		 * @author gerkin
		 */
		public static get modelName() {
			return `${name}Entity`;
		}
		
		/**
		 * Reference to this entity's model.
		 *
		 * @author gerkin
		 */
		public static get model() {
			return model;
		}
	}
	// We use keys `methods` and not `functions` as explained in this [StackOverflow thread](https://stackoverflow.com/a/155655/4839162).
	// Extend prototype with methods in our model description
	_.forEach( modelDesc.methods, ( method: Function, methodName: string ) => {
		( SubEntity.prototype as any )[methodName] = method;
	} );
	// Add static methods
	_.forEach(
		modelDesc.staticMethods,
		( staticMethod: Function, staticMethodName: string ) => {
			( SubEntity as any )[staticMethodName] = staticMethod;
		}
	);
	return SubEntity.bind( SubEntity, name, modelDesc, model ) as EntitySpawner;
};
ef.Entity = Entity;
export const EntityFactory: IEntityFactory = ef;

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
