import * as _ from 'lodash';
import { SequentialEvent } from 'sequential-event';

import { AdapterEntity, IAdapterEntityCtr } from '.';
import {
	remapIO,
	CANONICAL_OPERATORS,
	QUERY_OPTIONS_TRANSFORMS,
	Constructable,
} from './adapter-utils';
import { QueryLanguage } from '../../types/queryLanguage';
import { IRemapsHash, IFiltersHash, DataSourceQuerier, IEnumeratedHash } from '../../types/dataSourceQuerier';
import { logger } from '../../logger';
import { IEntityProperties, IEntityAttributes } from '../../types/entity';

/**
 * Represents the current state of the adapter. Those states corresponds to event names emitted by the adapter when they are passed.
 * 
 * @author Gerkin
 */
export enum EAdapterState {
	READY = 'ready',
	ERROR = 'error',
	PREPARING = 'preparing',
}


export interface IAdapterCtr<T extends AdapterEntity = AdapterEntity>
extends Constructable<Adapter<T>> {
	new ( dataSourceName: string, ...args: any[] ): Adapter<T>;
}

/**
 * Adapter is the base class of adapters. Adapters are components that are in charge to interact with data sources (files, databases, etc etc) with standardized methods. You should not use this class directly: extend this class and re-implement some methods to build an adapter. See the (upcoming) tutorial section.
 * @extends SequentialEvent
 * @author gerkin
 * @see {@link https://gerkindev.github.io/SequentialEvent.js/SequentialEvent.html Sequential Event documentation}.
 */
export abstract class Adapter<
T extends AdapterEntity = AdapterEntity
> extends SequentialEvent implements DataSourceQuerier<IEntityAttributes, IEntityProperties> {
	public get classEntity() {
		return this._classEntity;
	}
	
	/**
	 * Hash of functions to cast data store values to JSON standard values in entity.
	 *
	 * @author Gerkin
	 */
	protected filters: object;
	
	/**
	 * Hash to transform entity fields to data store fields.
	 *
	 * @author Gerkin
	 */
	protected remaps: object;
	
	/**
	 * Hash to transform data store fields to entity fields.
	 *
	 * @author Gerkin
	 */
	protected remapsInverted: object;
	
	/**
	 * Error triggered by adapter initialization.
	 *
	 * @author Gerkin
	 */
	protected error?: Error;
	
	/**
	 * Describe current adapter status.
	 *
	 * @author Gerkin
	 */
	protected state: EAdapterState;
	
	// -----
	// ### Initialization
	
	/**
	 * Create a new instance of adapter. This base class should be used by all other adapters.
	 *
	 * @author gerkin
	 * @param classEntity - Entity to spawn with this adapter.
	 */
	public constructor(
		protected _classEntity: IAdapterEntityCtr<T>,
		public readonly name: string
	) {
		super();
		this.filters = {};
		this.remaps = {};
		this.remapsInverted = {};
		this.error = undefined;
		this.state = EAdapterState.PREPARING;
		
		// Bind events
		this.on( EAdapterState.READY, () => {
			this.state = EAdapterState.READY;
		} ).on( EAdapterState.ERROR, ( err: Error ) => {
			this.state = EAdapterState.ERROR;
			logger.error(
				'Error while initializing:',
				_.pick( err, Object.getOwnPropertyNames( err ) )
			);
			this.error = err;
		} );
	}
	
	/**
	 * Runs the query in loops to fulfill requirements in the options hash
	 * 
	 * @author Gerkin
	 * @param options - Hash of options that forms the query
	 * @param query   - Query function to loop
	 */
	private static async iterateLimit(
		options: QueryLanguage.QueryOptions,
		query: (
			options: QueryLanguage.QueryOptions
		) => Promise<IEntityProperties | undefined>
	){
		const foundEntities: IEntityProperties[] = [];
		const localOptions = _.assign( {}, options );
		let origSkip = options.skip;
		
		// We are going to loop until we find enough items
		while ( foundEntities.length < localOptions.limit ) {
			const found = await query( localOptions );
			if ( _.isNil( found ) ){
				return foundEntities;
			} else {
				foundEntities.push( found );
			}
			localOptions.skip = origSkip + foundEntities.length;
		}
		return foundEntities;
	}
	
	// -----
	// ### Events
	
	/**
	 * Fired when the adapter is ready to use. You should not try to use the adapter before this event is emitted.
	 *
	 * @event Adapters.Adapter#ready
	 * @see {@link Adapters.Adapter#waitReady waitReady} Convinience method to wait for state change.
	 */
	
	/**
	 * Fired if the adapter failed to initialize or changed to `error` state. Called with the triggering `error`.
	 *
	 * @event Adapters.Adapter#error
	 * @see {@link Adapters.Adapter#waitReady waitReady} Convinience method to wait for state change.
	 */
	
	// -----
	// ### Utils
	
	/**
	 * Returns a promise resolved once adapter state is ready.
	 *
	 * @author gerkin
	 * @listens Adapters.Adapter#error
	 * @listens Adapters.Adapter#ready
	 * @returns Promise resolved when adapter is ready, and rejected if an error occured.
	 */
	public waitReady(): Promise<this> {
		return new Promise( ( resolve, reject ) => {
			if ( EAdapterState.READY === this.state ) {
				return resolve( this );
			} else if ( EAdapterState.ERROR === this.state ) {
				return reject( this.error );
			}
			
			this.on( EAdapterState.READY, () => {
				return resolve( this );
			} ).on( EAdapterState.ERROR, ( err: Error ) => {
				return reject( err );
			} );
		} );
	}
	
	/**
	 * TODO.
	 *
	 * @author gerkin
	 * @see TODO remapping.
	 * @see {@link Adapters.Adapter#remapIO remapIO}
	 */
	public remapInput<TProps extends IEntityAttributes>(
		tableName: string,
		query: TProps
	): TProps {
		return remapIO( this, tableName, query, true );
	}
	
	/**
	 * TODO.
	 *
	 * @author gerkin
	 * @see TODO remapping.
	 * @see {@link Adapters.Adapter#remapIO remapIO}
	 */
	public remapOutput<TProps extends IEnumeratedHash<any>>(
		tableName: string,
		query: TProps
	): TProps {
		return remapIO( this, tableName, query, false );
	}
	
	/**
	 * Transform options to their canonical form. This function must be applied before calling adapters' methods.
	 *
	 * @author gerkin
	 * @throws  {TypeError} Thrown if an option does not have an acceptable type.
	 * @throws  {ReferenceError} Thrown if a required option is not present.
	 * @throws  {Error} Thrown when there isn't more precise description of the error is available (eg. when conflicts occurs).
	 * @returns Transformed options (also called `canonical options`).
	 */
	public normalizeOptions(
		opts: QueryLanguage.Raw.QueryOptions = {}
	): QueryLanguage.QueryOptions {
		opts = _.cloneDeep( opts );
		_.forEach( QUERY_OPTIONS_TRANSFORMS, ( transform, optionName ) => {
			if ( opts.hasOwnProperty( optionName ) ) {
				QUERY_OPTIONS_TRANSFORMS[optionName]( opts );
			}
		} );
		const optsDefaulted = _.defaults( opts, {
			skip: 0,
			remapInput: true,
			remapOutput: true,
			limit: Infinity,
		} );
		return optsDefaulted;
	}
	
	/**
	 * Transform a search query to its canonical form, replacing aliases or shorthands by full query.
	 *
	 * @author gerkin
	 */
	public normalizeQuery(
		originalQuery: QueryLanguage.Raw.SelectQueryOrCondition,
		options: QueryLanguage.QueryOptions
	): QueryLanguage.SelectQueryOrCondition {
		if ( _.isString( originalQuery ) ) {
			originalQuery = { id: originalQuery };
		}
		const normalizedQuery =
		true === options.remapInput
		? _.chain( _.cloneDeep( originalQuery ) )
		.mapValues( attrSearch => {
			if ( _.isUndefined( attrSearch ) ) {
				return { $exists: false };
			} else if ( !( attrSearch instanceof Object ) ) {
				return { $equal: attrSearch };
			} else {
				// Replace operations alias by canonical expressions
				attrSearch = _.mapKeys( attrSearch, ( val, operator, obj ) => {
					if ( CANONICAL_OPERATORS.hasOwnProperty( operator ) ) {
						// ... check for conflict with canonical operation name...
						if ( obj.hasOwnProperty( CANONICAL_OPERATORS[operator] ) ) {
							throw new Error(
								`Search can't have both "${operator}" and "${
									CANONICAL_OPERATORS[operator]
								}" keys, as they are synonyms`
							);
						}
						return CANONICAL_OPERATORS[operator];
					}
					return operator;
				} );
				// For arithmetic comparison, check if values are numeric (TODO later: support date)
				_.forEach(
					['$less', '$lessEqual', '$greater', '$greaterEqual'],
					operation => {
						if (
							attrSearch.hasOwnProperty( operation ) &&
							!(
								_.isNumber( attrSearch[operation] ) || _.isDate( attrSearch[operation] )
							)
						) {
							throw new TypeError(
								`Expect "${operation}" in ${JSON.stringify(
									attrSearch
								)} to be a numeric value`
							);
						}
					}
				);
				return attrSearch;
			}
		} )
		.value()
		: _.cloneDeep( originalQuery );
		return normalizedQuery;
	}
	
	/**
	 * Returns a POJO representing the current adapter.
	 *
	 * @returns JSON representation of the adapter.
	 */
	public toJSON(): object {
		return _.pick( this, [
			'state',
			'remaps',
			'remapsInverted',
			'classEntity',
			'error',
		] );
	}
	
	// -----
	// ### Insert
	
	/**
	 * Insert a single entity in the data store. This function is a default polyfill if the inheriting adapter does not provide `insertOne` itself.
	 *
	 * @summary At least one of {@link insertOne} or {@link insertMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	public async insertOne(
		table: string,
		entity: IEntityAttributes
	): Promise<IEntityProperties | undefined> {
		return _.first( await this.insertMany( table, [entity] ) );
	}
	
	/**
	 * Insert several entities in the data store. This function is a default polyfill if the inheriting adapter does not provide `insertMany` itself.
	 *
	 * @summary At least one of {@link insertOne} or {@link insertMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	public async insertMany(
		table: string,
		entities: IEntityAttributes[]
	): Promise<IEntityProperties[]> {
		const mapped = [];
		for ( let i = 0; i < entities.length; i++ ) {
			mapped.push( await this.insertOne( table, entities[i] || {} ) );
		}
		return _.compact( mapped );
	}
	
	// -----
	// ### Find
	
	/**
	 * Retrieve a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `findOne` itself.
	 *
	 * @summary At least one of {@link findOne} or {@link findMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	public async findOne(
		table: string,
		queryFind: QueryLanguage.SelectQueryOrCondition,
		options: QueryLanguage.QueryOptions
	): Promise<IEntityProperties | undefined> {
		options.limit = 1;
		return _.first( await this.findMany( table, queryFind, options ) );
	}
	
	/**
	 * Retrieve several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `findMany` itself.
	 *
	 * @summary At least one of {@link findOne} or {@link findMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	public async findMany(
		table: string,
		queryFind: QueryLanguage.SelectQueryOrCondition,
		options: QueryLanguage.QueryOptions
	): Promise<IEntityProperties[]> {
		const boundQuery = this.findOne.bind( this, table, queryFind );
		return Adapter.iterateLimit( options, boundQuery );
	}
	
	// -----
	// ### Update
	
	/**
	 * Update a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `updateOne` itself.
	 *
	 * @summary At least one of {@link updateOne} or {@link updateMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	public async updateOne(
		table: string,
		queryFind: QueryLanguage.SelectQueryOrCondition,
		update: IEntityAttributes,
		options: QueryLanguage.QueryOptions
	): Promise<IEntityProperties | undefined> {
		options.limit = 1;
		return _.first( await this.updateMany( table, queryFind, update, options ) );
	}
	
	/**
	 * Update several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `updateMany` itself.
	 *
	 * @summary At least one of {@link updateOne} or {@link updateMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	public async updateMany(
		table: string,
		queryFind: QueryLanguage.SelectQueryOrCondition,
		update: IEntityAttributes,
		options: QueryLanguage.QueryOptions
	): Promise<IEntityProperties[]> {
		return Adapter.iterateLimit(
			options,
			this.updateOne.bind( this, table, queryFind, update )
		);
	}
	
	// -----
	// ### Delete
	
	/**
	 * Delete a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `deleteOne` itself.
	 *
	 * @summary At least one of {@link deleteOne} or {@link deleteMany} must be reimplemented by adapter.
	 * @author gerkin
	 */
	public async deleteOne(
		table: string,
		queryFind: QueryLanguage.SelectQueryOrCondition,
		options: QueryLanguage.QueryOptions
	) {
		options.limit = 1;
		await this.deleteMany( table, queryFind, options );
	}
	
	/**
	 * Delete several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `deleteMany` itself.
	 *
	 * @summary At least one of {@link deleteOne} or {@link deleteMany} must be reimplemented by adapter.
	 * @author gerkin
	 * @param   table     - Name of the table to delete data from.
	 * @param   queryFind - Hash representing the entities to find.
	 * @param   options   - Hash of options.
	 * @returns Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`).
	 */
	public async deleteMany(
		table: string,
		queryFind: QueryLanguage.SelectQueryOrCondition,
		options: QueryLanguage.QueryOptions
	) {
		const boundQuery = this.deleteOne.bind( this, table, queryFind );
		await Adapter.iterateLimit( options, boundQuery );
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
		( this.remaps as any )[tableName] = {
			normal: remaps,
			inverted: _.invert( remaps ),
		};
		( this.filters as any )[tableName] = filters;
		return this;
	}
}
