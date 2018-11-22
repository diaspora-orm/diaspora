import * as _ from 'lodash';

import { Adapter } from './adapters';
import AAdapterEntity = Adapter.Base.AAdapterEntity;
import AAdapter = Adapter.Base.AAdapter;
import DataAccessLayer = Adapter.DataAccessLayer;
import TDataSource = Adapter.TDataSource;

import { Entity, Set, EntityFactory } from './entities';
import { deepFreeze } from './utils';
import { EntityTransformers } from './entityTransformers';
import {
	Raw,
	FieldDescriptor,
	IModelDescription,
	EFieldType,
	IAttributesDescription,
} from './types/modelDescription';
import { QueryLanguage } from './types/queryLanguage';
import { IDataSourceRegistry, dataSourceRegistry } from './staticStores';
import { IEntityAttributes } from './types/entity';

/**
 * The model class is used to interact with the population of all data of the same type.
 * 
 * @typeParam TEntity - Test
 * @param TEntity - Test
 */
export class Model<TEntity extends IEntityAttributes> {
	public attributes: { [key: string]: FieldDescriptor };
	
	private readonly _dataSources: IDataSourceRegistry;
	public modelDesc: IModelDescription;
	public get dataSources() {
		return this._dataSources;
	}
	private readonly defaultDataSource: string;
	private readonly _entityFactory: Entity.IEntitySpawner<TEntity>;
	public get entityFactory() {
		return this._entityFactory;
	}
	private readonly _entityTransformers: {
		default: EntityTransformers.DefaultTransformer;
		check: EntityTransformers.CheckTransformer;
		[key: string]: EntityTransformers.AEntityTransformer | undefined;
	};
	public get entityTransformers() {
		return this._entityTransformers;
	}
	
	public get ctor() {
		return this.constructor as typeof Model;
	}
	
	/**
	 * Modifies the raw attributes description to standardize it
	 *
	 * @param desc - Attributes description map to transform
	 * @returns Attributes description map normalized, with properties defaulted
	 * @author Gerkin
	 */
	private static normalizeAttributesDescription( desc: Raw.IAttributesDescription ): IAttributesDescription {
		return _.mapValues(
			desc,
			val => Model.normalizeAttributeDescription( val )
		);
	}

	/**
	 * Normalize fields to convert a {@link Raw.FieldDescriptor} to a {@link FieldDescriptor}
	 *
	 * @param attributeDesc - Attributes description to transform
	 * @returns Attribute description normalized, with properties defaulted
	 * @author Gerkin
	 */
	private static normalizeAttributeDescription( attributeDesc: Raw.FieldDescriptor ): FieldDescriptor{
		const fieldDescriptorToDefault = Raw.FieldDescriptor.FieldDescriptorTypeChecks.isObjectFieldDescriptor( attributeDesc ) ? attributeDesc : { type: attributeDesc } as Raw.ObjectFieldDescriptor;
		const fieldDescriptorWithRequired = _.defaults( fieldDescriptorToDefault , {required: false } );

		// Perform deep defaulting
		if ( fieldDescriptorWithRequired.type === EFieldType.OBJECT ){
			const attributesDefaulted = fieldDescriptorWithRequired.attributes ? Model.normalizeAttributesDescription( fieldDescriptorWithRequired.attributes ) : undefined;
			return _.assign( _.omit( fieldDescriptorWithRequired, 'attributes' ), {attributes: attributesDefaulted} );
		} else if ( fieldDescriptorWithRequired.type === EFieldType.ARRAY ){
			const ofDefaulted = Model.normalizeAttributeDescription( fieldDescriptorWithRequired.of ? fieldDescriptorWithRequired.of : EFieldType.ANY );
			return _.assign( _.omit( fieldDescriptorWithRequired, 'of' ), {of: ofDefaulted} );
		} else {
			return fieldDescriptorWithRequired;
		}
	}
	
	/**
	 * Create a new Model that is allowed to interact with all entities of data sources tables selected.
	 *
	 * @author gerkin
	 * @param name      - Name of the model.
	 * @param modelDesc - Hash representing the configuration of the model.
	 */
	public constructor( public name: string, modelDesc: Raw.IModelDescription ) {
		// Normalize our sources: normalized form is an object with keys corresponding to source name, and key corresponding to remaps
		const sourcesNormalized = Model.normalizeRemaps( modelDesc );
		// List sources required by this model
		const sourceNames = _.keys( sourcesNormalized );
		const modelSources = _.pick( dataSourceRegistry, sourceNames );
		const missingSources = _.difference( sourceNames, _.keys( modelSources ) );
		if ( 0 !== missingSources.length ) {
			throw new Error( `Missing data sources ${missingSources.map( v => `"${v}"` ).join( ', ' )}` );
		}
		
		// Now, we are sure that config is valid. We can configure our _dataSources with model options, and set `this` properties.
		// Configure attributes-related elements
		const attributes = Model.normalizeAttributesDescription( modelDesc.attributes );
		this._entityTransformers = {
			default: new EntityTransformers.DefaultTransformer( attributes ),
			check: new EntityTransformers.CheckTransformer( attributes ),
		};
		this.attributes = deepFreeze( attributes );
		
		// Configure source-related elements
		_.forEach( sourcesNormalized, ( remap, sourceName ) => {
			modelSources[sourceName].configureCollection( name, remap );
		} );
		this._dataSources = modelSources;
		this.defaultDataSource = _.chain( modelSources ).keys().head().value() as string;
		
		// Store & expose the model description
		this.modelDesc = deepFreeze( _.assign( modelDesc, { attributes, sources: sourcesNormalized } ) );
		// Prepare our entity factory
		this._entityFactory = EntityFactory( name, this.modelDesc, this );
	}
	
	/**
	 * TODO
	 *
	 * @author Gerkin
	 * @param modelDesc - Description of the model to normalize remaps for
	 */
	protected static normalizeRemaps( modelDesc: Raw.IModelDescription ) {
		const sourcesRaw = modelDesc.sources;
		if ( _.isString( sourcesRaw ) ) {
			// Single source: create an empty remap hash
			return { [sourcesRaw]: {} } as _.Dictionary<_.Dictionary<string>>;
		} else if ( _.isArrayLike( sourcesRaw ) ) {
			return _.zipObject(
				sourcesRaw,
				// TODO: What does it do?
				_.times( sourcesRaw.length, _.constant( {} as _.Dictionary<string> ) )
			);
		} else {
			return _.mapValues( sourcesRaw, ( remap, dataSourceName ) => {
				if ( true === remap ) {
					return {} as _.Dictionary<string>;
				} else if ( _.isObject( remap ) ) {
					return remap as _.Dictionary<string>;
				} else {
					throw new TypeError(
						`Datasource "${dataSourceName}" value is invalid: expect \`true\` or a remap hash, but have ${JSON.stringify(
							remap
						)}`
					);
				}
			} );
		}
	}
	
	/**
	 * Create a new Model that is allowed to interact with all entities of data sources tables selected.
	 *
	 * @author gerkin
	 * @throws  {ReferenceError} Thrown if requested source name does not exists.
	 * @param   dataSource - Name of the source to get. It corresponds to one of the sources you set in {@link Model#modelDesc}.Sources.
	 * @returns Source adapter with requested name.
	 */
	public getDataSource(
		dataSource: TDataSource = this.defaultDataSource
	): DataAccessLayer {
		// If argument is a data access layer, check that it is in our {@link _dataSources} hash.
		if ( dataSource instanceof DataAccessLayer ) {
			if ( _.values( this._dataSources ).indexOf( dataSource ) === -1 ) {
				throw new ReferenceError(
					`Model does not contain data source "${dataSource.adapter.name}"`
				);
			}
			return dataSource;
		} else {
			const dataSourceName =
			dataSource instanceof AAdapter ? dataSource.name : dataSource;
			if ( !this._dataSources.hasOwnProperty( dataSourceName ) ) {
				throw new ReferenceError(
					`Model does not contain data source "${dataSourceName}"`
				);
			}
			return this._dataSources[dataSourceName];
		}
	}
	
	/**
	 * Create a new *orphan* {@link Entity entity}.
	 *
	 * @author gerkin
	 * @param   source - Object to copy attributes from.
	 * @returns New *orphan* entity.
	 */
	public spawn( source: Partial<TEntity> ): Entity<TEntity> {
		const newEntity = new this.entityFactory( source );
		return newEntity;
	}
	
	/**
	 * Create multiple new *orphan* {@link Entity entities}.
	 *
	 * @author gerkin
	 * @param   sources - Array of objects to copy attributes from.
	 * @returns Set with new *orphan* entities.
	 */
	public spawnMany( sources: Array<Partial<TEntity>> ): Set<TEntity> {
		return new Set( this, _.map( sources, source => this.spawn( source ) ) );
	}
	
	/**
	 * Insert a raw source object in the data store.
	 *
	 * @author gerkin
	 * @param   source         - Object to copy attributes from.
	 * @param   dataSourceName - Name of the data source to insert in.
	 * @returns Promise resolved with new *sync* {@link Entity entity}.
	 */
	public async insert(
		source: TEntity,
		dataSourceName: string = this.defaultDataSource
	): Promise<Entity<TEntity> | null> {
		return this.makeEntity(
			this.getDataSource( dataSourceName ).insertOne( this.name, source )
		);
	}
	
	/**
	 * Insert multiple raw source objects in the data store.
	 *
	 * @author gerkin
	 * @param   sources        - Array of object to copy attributes from.
	 * @param   dataSourceName - Name of the data source to insert in.
	 * @returns Promise resolved with a {@link Set set} containing new *sync* entities.
	 */
	public async insertMany(
		sources: TEntity[],
		dataSourceName: string = this.defaultDataSource
	): Promise<Set<TEntity>> {
		return this.makeSet(
			this.getDataSource( dataSourceName ).insertMany( this.name, sources )
		);
	}
	
	/**
	 * Retrieve a single entity from specified data source that matches provided `queryFind` and `options`.
	 *
	 * @author gerkin
	 * @param   queryFind      - Query to get desired entity.
	 * @param   options        - Options for this query.
	 * @param   dataSourceName - Name of the data source to get entity from.
	 * @returns Promise resolved with the found {@link Entity entity} in *sync* state.
	 */
	public async find(
		queryFind?: QueryLanguage.Raw.SearchQuery,
		options: QueryLanguage.Raw.IQueryOptions = {},
		dataSourceName: string = this.defaultDataSource
	): Promise<Entity<TEntity> | null> {
		return this.makeEntity(
			this.getDataSource( dataSourceName ).findOne( this.name, queryFind, options )
		);
	}
	
	/**
	 * Retrieve multiple entities from specified data source that matches provided `queryFind` and `options`.
	 *
	 * @author gerkin
	 * @param   queryFind      - Query to get desired entities.
	 * @param   options        - Options for this query.
	 * @param   dataSourceName - Name of the data source to get entities from.
	 * @returns Promise resolved with a {@link Set set} of found entities in *sync* state.
	 */
	public async findMany(
		queryFind?: QueryLanguage.Raw.SearchQuery,
		options: QueryLanguage.Raw.IQueryOptions = {},
		dataSourceName: string = this.defaultDataSource
	): Promise<Set<TEntity>> {
		return this.makeSet(
			this.getDataSource( dataSourceName ).findMany( this.name, queryFind, options )
		);
	}
	
	/**
	 * Update a single entity from specified data source that matches provided `queryFind` and `options`.
	 *
	 * @author gerkin
	 * @param   queryFind      - Query to get desired entity.
	 * @param   update         - Attributes to update on matched set.
	 * @param   options        - Options for this query.
	 * @param   dataSourceName - Name of the data source to get entity from.
	 * @returns Promise resolved with the updated {@link Entity entity} in *sync* state.
	 */
	public async update(
		queryFind: QueryLanguage.Raw.SearchQuery | undefined,
		update: object,
		options: QueryLanguage.Raw.IQueryOptions = {},
		dataSourceName: string = this.defaultDataSource
	): Promise<Entity<TEntity> | null> {
		return this.makeEntity(
			this.getDataSource( dataSourceName ).updateOne(
				this.name,
				queryFind,
				update,
				options
			)
		);
	}
	
	/**
	 * Update multiple entities from specified data source that matches provided `queryFind` and `options`.
	 *
	 * @author gerkin
	 * @param   queryFind      - Query to get desired entities.
	 * @param   update         - Attributes to update on matched set.
	 * @param   options        - Options for this query.
	 * @param   dataSourceName - Name of the data source to get entities from.
	 * @returns Promise resolved with the {@link Set set} of found entities in *sync* state.
	 */
	public async updateMany(
		queryFind: QueryLanguage.Raw.SearchQuery | undefined,
		update: object,
		options: QueryLanguage.Raw.IQueryOptions = {},
		dataSourceName: string = this.defaultDataSource
	): Promise<Set<TEntity>> {
		return this.makeSet(
			this.getDataSource( dataSourceName ).updateMany(
				this.name,
				queryFind,
				update,
				options
			)
		);
	}
	
	/**
	 * Delete a single entity from specified data source that matches provided `queryFind` and `options`.
	 *
	 * @author gerkin
	 * @param   queryFind      - Query to get desired entity.
	 * @param   options        - Options for this query.
	 * @param   dataSourceName - Name of the data source to get entity from.
	 * @returns Promise resolved with `undefined`.
	 */
	public async delete(
		queryFind?: QueryLanguage.Raw.SearchQuery,
		options: QueryLanguage.Raw.IQueryOptions = {},
		dataSourceName: string = this.defaultDataSource
	): Promise<void> {
		return this.getDataSource( dataSourceName ).deleteOne(
			this.name,
			queryFind,
			options
		);
	}
	
	/**
	 * Delete multiple entities from specified data source that matches provided `queryFind` and `options`.
	 *
	 * @author gerkin
	 * @param   queryFind      - Query to get desired entities.
	 * @param   options        - Options for this query.
	 * @param   dataSourceName - Name of the data source to get entities from.
	 * @returns Promise resolved with `undefined`.
	 */
	public async deleteMany(
		queryFind?: QueryLanguage.Raw.SearchQuery,
		options: QueryLanguage.Raw.IQueryOptions = {},
		dataSourceName: string = this.defaultDataSource
	): Promise<void> {
		return this.getDataSource( dataSourceName ).deleteMany(
			this.name,
			queryFind,
			options
		);
	}
	
	/**
	 * Generate a new Set containing provided `AdapterEntities` wrapped in `Entities`
	 *
	 * @param dataSourceEntitiesPromise - Promise that may return adapter entities to wrap in a newly created `Set`
	 */
	protected async makeSet(
		dataSourceEntitiesPromise: Promise<Array<AAdapterEntity | undefined>>
	) {
		const dataSourceEntities = await dataSourceEntitiesPromise;
		const newEntities = _.chain( dataSourceEntities )
		.map( dataSourceEntity => new this.entityFactory( dataSourceEntity ) )
		.compact()
		.value();
		const set = new Set<TEntity>( this, newEntities );
		return set;
	}
	
	/**
	 * Generate a new entity from the promise's result
	 *
	 * @author Gerkin
	 * @param dataSourceEntityPromise - Promise that may return an adapter entity to wrap in a newly created `Entity`
	 */
	protected async makeEntity(
		dataSourceEntityPromise: Promise<AAdapterEntity | undefined>
	) {
		const dataSourceEntity = await dataSourceEntityPromise;
		if ( _.isNil( dataSourceEntity ) ) {
			return null;
		}
  return new this.entityFactory( dataSourceEntity );
	}
}
