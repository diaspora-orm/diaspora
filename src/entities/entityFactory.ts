import * as _ from 'lodash';
import { SequentialEvent } from 'sequential-event';

import { EntityStateError } from '../errors';
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
		this._attributes = model.validator.default( _.cloneDeep( definitiveSource ) );

		// ### Load events
		_.forEach( modelDesc.lifecycleEvents, ( eventFunctions, eventName ) => {
			// Iterate on each event functions. `_.castArray` will ensure we iterate on an array if a single function is provided.
			_.forEach( _.castArray( eventFunctions ), eventFunction => {
				this.on( eventName, eventFunction );
			} );
		} );
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
	 * Return the table of this entity in the specified data source.
	 *
	 * @author gerkin
	 * @returns Name of the table.
	 */
	public table( dataSource?: TDataSource ) {
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
			this.ctor.model.validator.validate( this.attributes );
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

		const potentialChangedKeys = _.chain( this.attributes )
			// Get all keys in current attributes
			.keys()
			// Add to it the keys of the stored object
			.concat( _.keys( dataStoreObject ) )
			.filter( 'id' )
			// Remove duplicates
			.uniq();

		const storedValues = potentialChangedKeys
			// Replace keys with stored values
			.map( ( key: string ) => dataStoreEntity.attributes[key] );
		const diff = potentialChangedKeys
			// Make an object with potentially changed keys as keys, & stored values as values
			.zipObject( storedValues.value() )
			// Omit values that did not changed between now & stored object
			.omitBy( ( val: any, key: string ) =>
				_.isEqual( dataStoreEntity.attributes[key], currentAttributes[key] )
			)
			.value();
		return diff;
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
	 * @fires EntityFactory.Entity#beforeUpdate
	 * @fires EntityFactory.Entity#afterUpdate
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

		const table = this.table( finalSourceName );
		// Depending on state, we are going to perform a different operation
		const operation =
			'orphan' === beforeState ? this.persistCreate : this.persistUpdate;
		const dataStoreEntity: AdapterEntity | undefined = await operation.call(
			this,
			dataSourceFixed,
			table
		);
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
	 * @fires EntityFactory.Entity#beforeFind
	 * @fires EntityFactory.Entity#afterFind
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
			this,
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
	 * @fires EntityFactory.Entity#beforeDelete
	 * @fires EntityFactory.Entity#afterDelete
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

		await this.execIfOkState( this, beforeState, dataSourceFixed, 'deleteOne' );

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
	
	protected getDataSource( dataSource?: TDataSource ){
		return this.ctor.model.getDataSource( dataSource );
	}

	protected serialize() {
		return Entity.serialize( this.attributes );
	}

	protected deserialize() {
		return Entity.deserialize( this.attributes );
	}

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

	private execIfOkState<T extends AdapterEntity>(
		entity: Entity,
		beforeState: EEntityState,
		dataSource: DataAccessLayer,
		// TODO: precise it
		method: string
	): Promise<T>{
		// Depending on state, we are going to perform a different operation
		if ( EEntityState.ORPHAN === beforeState ) {
			return Promise.reject( new EntityStateError( "Can't fetch an orphan entity." ) );
		} else {
			this._lastDataSource = dataSource;
			const execMethod: (
				table: string,
				query: object
			) => Promise<T> = ( dataSource as any )[method];
			return execMethod.call( dataSource, entity.table( dataSource.name ), entity.uidQuery( dataSource ) );
		}
	}
	
	/**
	 * Refresh last data source, attributes, state & data source entity
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

	private async persistCreate( dataSource: Adapter, table: string ) {
		if ( this.attributes ) {
			return ( await dataSource.insertOne( table, this.attributes ) ) as any;
		} else {
			return undefined;
		}
	}

	private async persistUpdate( dataSource: Adapter, table: string ) {
		const diff = this.getDiff( dataSource );
		return diff
			? ( ( await dataSource.updateOne(
					this.table( table ),
					this.uidQuery( dataSource ),
					diff
			  ) ) as any )
			: undefined;
	}
}

/**
 * This factory function generate a new class constructor, prepared for a specific model.
 *
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
 * @event EntityFactory.Entity#beforePersist
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#beforeValidate
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#afterValidate
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#beforePersistCreate
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#beforePersistUpdate
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#afterPersistCreate
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#afterPersistUpdate
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#afterPersist
 * @type {String}
 */

// -----
// ### Find

/**
 * @event EntityFactory.Entity#beforeFind
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#afterFind
 * @type {String}
 */

// -----
// ### Destroy

/**
 * @event EntityFactory.Entity#beforeDestroy
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#afterDestroy
 * @type {String}
 */
