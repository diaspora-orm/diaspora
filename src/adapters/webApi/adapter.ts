import * as _ from 'lodash';

import { Adapter as _AAdapter } from '../base';
import AAdapter = _AAdapter.Base.AAdapter;
import { Adapter as _WebApiEntity } from './entity';
import WebApiEntity = _WebApiEntity.WebApi.WebApiEntity;
import { Adapter as _DefaultQueryTransformerFactory } from './defaultQueryTransformer';
import DefaultQueryTransformerFactory = _DefaultQueryTransformerFactory.WebApi.DefaultQueryTransformerFactory;

import { logger } from '../../logger';
import { QueryLanguage } from '../../types/queryLanguage';
import { IEntityProperties, IEntityAttributes } from '../../types/entity';


export namespace Adapter.WebApi {
	interface IPluralEndpoint extends String {}

	/**
	 * Adapter for RESTful HTTP APIs.
	 *
	 * @see https://www.npmjs.com/package/%40diaspora/plugin-server Diaspora Server plugin: Package built on Diaspora & Express.js to easily configure HTTP APIs compatible with this adapter.
	 */
	export abstract class AWebApiAdapter extends AAdapter<WebApiEntity> {
		protected static readonly httpErrorFactories = {
			400: ( response: AWebApiAdapter.IErrorMessage, statusCode: number ) =>
			new Error(
				`Bad Request: Posted data through HTTP is invalid; message ${AWebApiAdapter.getMessage(
					response
				)}`
			),
			404: ( response: AWebApiAdapter.IErrorMessage, statusCode: number ) =>
			new Error(
				`Not Found: Reached 404, message is ${AWebApiAdapter.getMessage(
					response
				)}`
			),
			_: ( response: AWebApiAdapter.IErrorMessage, statusCode: number ) =>
			new Error(
				`Unhandled HTTP error with status code ${statusCode} & message ${AWebApiAdapter.getMessage(
					response
				)}`
			),
		};
		
		private readonly baseEndPoint: string;
		
		/**
		 * Hash mapping singular API names to plural API names
		 *
		 * @author Gerkin
		 */
		private readonly pluralApis: { [key: string]: string };
		
		/**
		 * Create a new instance of web api adapter.
		 *
		 * @param config         - Configuration of this adapter.
		 * @param eventProviders - Event providers that will catch requests and pre/post process around them.
		 * @author Gerkin
		 */
		public constructor(
			dataSourceName: string,
			config: AWebApiAdapter.IWebApiAdapterInternalConfig,
			eventProviders: AWebApiAdapter.IEventProvider[] = [
				DefaultQueryTransformerFactory(),
			]
		) {
			super( WebApiEntity as any, dataSourceName );
			
			if ( typeof config.baseEndPoint === 'undefined' ) {
				this.baseEndPoint = this.generateBaseEndPoint(
					config.scheme,
					config.host,
					config.port,
					config.path
				);
			} else {
				this.baseEndPoint = config.baseEndPoint;
			}
			
			this.pluralApis = config.pluralApis || {};
			
			// Bind lifecycle events
			_.map( eventProviders, eventProvider =>
				_.forIn( eventProvider, ( listener, event ) => this.on( event, listener ) )
			);
			
			if ( this.has( 'initialize' ) ) {
				this.emit( 'initialize' )
				.then( () => this.emit( 'ready' ) )
				.catch( err => this.emit( 'error', err ) );
			} else {
				this.emit( 'ready' ).catch( err => this.emit( 'error', err ) );
			}
		}
		
		/**
		 * Triggers the `beforeQuery` event that serves to generate the API call description
		 * 
		 * @param apiDesc - Raw description sent by the adapter
		 */
		private beforeQuery(
			apiDesc: AWebApiAdapter.IQueryDescriptorRaw
		): Promise<AWebApiAdapter.IQueryDescriptor> {
			const filteredApiDescOptions = AWebApiAdapter.transformQueryOptions( apiDesc.options );
			return this.emit( 'beforeQuery', _.assign(
				_.omit( apiDesc, ['options'] ),
				{ options: filteredApiDescOptions }
			) );
		}
		
		/**
		 * Gets the field 'message' in an XHR
		 *
		 * @param xhr - XHR to get field from
		 */
		protected static getMessage( response: { message?: string } ) {
			return `"${response.message || 'NULL'}"`;
		}
		
		/**
		 * Filters the query object for non-http query relevant informations
		 *
		 * @param queryFind - Selection query object
		 * @param options   - Options object
		 */
		private static transformQueryOptions(
			options: QueryLanguage.IQueryOptions
		): AWebApiAdapter.QueryOptions {
			if ( 0 === options.skip ) {
				delete options.skip;
			}
			if ( !isFinite( options.limit ) ) {
				delete options.limit;
			}
			
			return _.omit( options, ['remapInput', 'remapOutput'] );
		}
		
		/**
		 * Fills the id of entities
		 *
		 * @param entities - Entities received
		 * @param adapter  - Source of those entities
		 */
		private static maybeAddIdHashToEntities(
			entities: IEntityAttributes[] | undefined,
			adapter: AWebApiAdapter
		) {
			return _.map( entities, entity => WebApiEntity.setId( entity, adapter ) );
		}
		
		// -----
		// ### Insert
		
		/**
		 * Insert a single entity through an HTTP API.
		 *
		 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for use of web api.
		 * @author gerkin
		 * @param   table  - Name of the table to insert data in.
		 * @param   entity - Hash representing the entity to insert.
		 * @returns Promise resolved once insertion is done. Called with (*{@link WebApiEntity}* `entity`).
		 */
		public async insertOne(
			table: string,
			entity: IEntityAttributes
		): Promise<IEntityProperties | undefined> {
			let newEntity = await this.apiQuery(
				AWebApiAdapter.EHttpVerb.POST,
				table,
				entity
			);
			if ( !_.isNil( newEntity ) ) {
				return WebApiEntity.setId( newEntity, this );
			} else {
				return undefined;
			}
		}
		
		/**
		 * Insert several entities through an HTTP API.
		 *
		 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertMany}, modified for use of web api.
		 * @author gerkin
		 * @param   table    - Name of the table to insert data in.
		 * @param   entities - Hash representing entities to insert.
		 * @returns Promise resolved once insertion is done. Called with (*{@link WebApiEntity[]}* `entities`).
		 */
		public async insertMany(
			table: string,
			entities: IEntityAttributes[]
		): Promise<IEntityProperties[]> {
			let newEntities = await this.apiQuery(
				AWebApiAdapter.EHttpVerb.POST,
				this.getPluralEndpoint( table ),
				entities
			);
			newEntities = AWebApiAdapter.maybeAddIdHashToEntities( newEntities, this );
			return newEntities;
		}
		
		// -----
		// ### Find
		
		/**
		 * Find a single entity from the web api store
		 *
		 * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for use of web api.
		 * @author gerkin
		 * @param   table     - Name of the table to retrieve data from.
		 * @param   queryFind - Hash representing the entity to find.
		 * @param   options   - Hash of options.
		 * @returns Promise resolved once item is found. Called with (*{@link InMemoryEntity}* `entity`).
		 */
		public async findOne(
			table: string,
			queryFind: QueryLanguage.ISelectQuery,
			options: QueryLanguage.IQueryOptions
		): Promise<IEntityProperties | undefined> {
			const { apiDesc } = await this.beforeQuery( {
				queryType: 'find',
				queryNum: 'one',
				modelName: table,
				select: queryFind,
				options: options,
				apiDesc: undefined as any,
			} );
			const newEntity = await this.apiQuery(
				apiDesc.method,
				apiDesc.endPoint,
				apiDesc.body,
				apiDesc.queryString
			);
			if ( !_.isNil( newEntity ) ) {
				return WebApiEntity.setId( newEntity, this );
			} else {
				return newEntity;
			}
		}
		
		/**
		 * Find several entities from the web api store
		 *
		 * @summary This reimplements {@link Adapters.DiasporaAdapter#findMany}, modified for use of web api.
		 * @author gerkin
		 * @param   table     - Name of the table to retrieve data from.
		 * @param   queryFind - Hash representing entities to find.
		 * @param   options   - Hash of options.
		 * @returns Promise resolved once items are found. Called with (*{@link InMemoryEntity}[]* `entities`).
		 */
		public async findMany(
			table: string,
			queryFind: QueryLanguage.ISelectQuery,
			options: QueryLanguage.IQueryOptions
		): Promise<IEntityProperties[]> {
			const { apiDesc } = await this.beforeQuery( {
				queryType: 'find',
				queryNum: 'many',
				modelName: table,
				select: queryFind,
				options: options,
				apiDesc: undefined as any,
			} );
			const newEntities = await this.apiQuery(
				apiDesc.method,
				apiDesc.endPoint as IPluralEndpoint,
				apiDesc.body,
				apiDesc.queryString
			);
			return AWebApiAdapter.maybeAddIdHashToEntities( newEntities, this );
		}
		
		// -----
		// ### Update
		
		/**
		 * Update a single entity from the web api store
		 *
		 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for use of web api.
		 * @author gerkin
		 * @param   table     - Name of the table to update data in.
		 * @param   queryFind - Hash representing the entity to find.
		 * @param   update    - Object properties to set.
		 * @param   options   - Hash of options.
		 * @returns  Promise resolved once update is done. Called with (*{@link InMemoryEntity}* `entity`).
		 */
		public async updateOne(
			table: string,
			queryFind: QueryLanguage.ISelectQuery,
			update: IEntityAttributes,
			options: QueryLanguage.IQueryOptions
		): Promise<IEntityProperties | undefined> {
			const { apiDesc } = await this.beforeQuery( {
				queryType: 'update',
				queryNum: 'one',
				modelName: table,
				select: queryFind,
				update,
				options: options,
				apiDesc: undefined as any,
			} );
			const entity = await this.apiQuery(
				apiDesc.method,
				apiDesc.endPoint,
				apiDesc.body,
				apiDesc.queryString
			);
			if ( !_.isNil( entity ) ) {
				entity.idHash = {
					[this.name]: entity.id,
				};
			}
			return entity;
		}
		
		/**
		 * Update several entities from the web api store
		 *
		 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateMany}, modified for use of web api.
		 * @author gerkin
		 * @param   table     - Name of the table to update data in.
		 * @param   queryFind - Hash representing entities to find.
		 * @param   update    - Object properties to set.
		 * @param   options   - Hash of options.
		 * @returns Promise resolved once update is done. Called with (*{@link InMemoryEntity}[]* `entities`).
		 */
		public async updateMany(
			table: string,
			queryFind: QueryLanguage.ISelectQuery,
			update: IEntityAttributes,
			options: QueryLanguage.IQueryOptions
		): Promise<IEntityProperties[]> {
			const { apiDesc } = await this.beforeQuery( {
				queryType: 'update',
				queryNum: 'many',
				modelName: table,
				select: queryFind,
				update,
				options: options,
				apiDesc: undefined as any,
			} );
			const entities = await this.apiQuery(
				apiDesc.method,
				apiDesc.endPoint as IPluralEndpoint,
				apiDesc.body,
				apiDesc.queryString
			);
			return AWebApiAdapter.maybeAddIdHashToEntities( entities, this );
		}
		
		// -----
		// ### Delete
		
		/**
		 * Destroy a single entity from the web api store
		 *
		 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for use of web api.
		 * @author gerkin
		 * @param   table     - Name of the table to delete data from.
		 * @param   queryFind - Hash representing the entity to find.
		 * @param   options   - Hash of options.
		 * @returns Promise resolved once item is found. Called with (*undefined*).
		 */
		public async deleteOne(
			table: string,
			queryFind: QueryLanguage.ISelectQuery,
			options: QueryLanguage.IQueryOptions
		): Promise<void> {
			const { apiDesc } = await this.beforeQuery( {
				queryType: 'delete',
				queryNum: 'one',
				modelName: table,
				select: queryFind,
				options: options,
				apiDesc: undefined as any,
			} );
			await this.apiQuery(
				apiDesc.method,
				apiDesc.endPoint,
				apiDesc.body,
				apiDesc.queryString
			);
		}
		
		/**
		 * Destroy several entities from the web api store
		 *
		 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteMany}, modified for use of web api.
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
			const { apiDesc } = await this.beforeQuery( {
				queryType: 'delete',
				queryNum: 'many',
				modelName: table,
				select: queryFind,
				options: options,
				apiDesc: undefined as any,
			} );
			await this.apiQuery(
				apiDesc.method,
				apiDesc.endPoint as IPluralEndpoint,
				apiDesc.body,
				apiDesc.queryString
			);
		}
		
		/**
		 * Creates a request, send it and get the result
		 *
		 * @param method      - HTTP verb that describes the request type
		 * @param endPoint    - Url to send on
		 * @param data        - Object to send
		 * @param queryObject - Object to put in query string
		 */
		protected abstract async httpRequest(
			method: AWebApiAdapter.EHttpVerb,
			endPoint: string,
			data?: object,
			queryObject?: object
		): Promise<AWebApiAdapter.TEntitiesJsonResponse>;
		
		/**
		 * Generates the URL to the base of the API
		 *
		 * @param scheme - Represents the protocol (`http` or `https` most of the time)
		 * @param host   - Hostname to target (domain name, IP, ...)
		 * @param port   - Port of the target to point to
		 * @param path   - Absolute URI on the API
		 * @returns The URI string to the base of the API
		 */
		protected generateBaseEndPoint(
			scheme: string | false,
			host: string | false,
			port: number | false,
			path: string
		) {
			const portString = port ? `:${port}` : '';
			const schemeString = scheme ? `${scheme}:` : '';
			return `${schemeString}//${host}${portString}${path}`;
		}
		
		/**
		 * Send an http query to the targeted `endPoint` using `method` as verb.
		 *
		 * @async
		 * @param   verb        - Valid HTTP verb. This adapter uses `GET`, `POST`, `PATCH` & `DELETE`.
		 * @param   endPoint    - Name of the endpoint to interact with. It will be prepended with {@link Adapters.WebApiDiasporaAdapter#baseEndPoint}.
		 * @param   data        - Optionnal data to send within the body of the request.
		 * @param   queryObject - Optionnal query object to send along with the request.
		 * @returns Promise resolved with the resulting data.
		 */
		private apiQuery(
			verb: AWebApiAdapter.EHttpVerb,
			endPoint: string,
			data?: object,
			queryObject?: object
		): Promise<IEntityProperties | undefined>;
		private apiQuery(
			verb: AWebApiAdapter.EHttpVerb,
			endPoint: IPluralEndpoint,
			data?: object,
			queryObject?: object
		): Promise<IEntityProperties[] | undefined>;
		private apiQuery(
			verb: AWebApiAdapter.EHttpVerb,
			endPoint: string,
			data?: object,
			queryObject?: object
		): Promise<AWebApiAdapter.TEntitiesJsonResponse> {
			return this.sendRequest(
				verb,
				`${this.baseEndPoint}/${endPoint.toLowerCase()}`,
				data,
				queryObject
			);
		}
		
		/**
		 * Send the query, and log inputs & outputs
		 *
		 * @see WebApiAdapter.httpRequest
		 * @author Gerkin
		 * @param method      - HTTP verb that describes the request type
		 * @param endPoint    - Url to send on
		 * @param data        - Object to send
		 * @param queryObject - Object to put in query string
		 */
		private async sendRequest(
			verb: AWebApiAdapter.EHttpVerb,
			endPoint: string,
			body?: object,
			queryString?: object
		) {
			logger.verbose( `Sending ${verb} HTTP request to "${endPoint}" with data:`, {
				body,
				queryString,
			} );
			const response = await this.httpRequest( verb, endPoint, body, queryString );
			logger.silly( 'HTTP Request response:', response );
			return response;
		}
		
		/**
		 * Returns the endpoint that corresponds to the plural variant of the provided endpoint.
		 *
		 * @see WebApiAdapter.pluralApis
		 * @author Gerkin
		 * @param endpoint - Name of the endpoint
		 */
		private getPluralEndpoint( endpoint: string ): IPluralEndpoint {
			return _.get( this.pluralApis, endpoint, endpoint + 's' );
		}
		
		/**
		 * Generates the error corresponding to the status code & message.
		 *
		 * @author Gerkin
		 * @param response   - Object containing the raw response of the server
		 * @param statusCode - Status code of the response
		 * @returns the constructed error to throw
		 */
		protected static handleError(
			response: AWebApiAdapter.IErrorMessage | undefined,
			statusCode: number
		) {
			// Retrieve the function that will generate the error
			const errorBuilder = _.get(
				AWebApiAdapter.httpErrorFactories,
				statusCode,
				AWebApiAdapter.httpErrorFactories._
			);
			return errorBuilder( response || {}, statusCode );
		}
	}

	export namespace AWebApiAdapter {
		export interface IXhrResponse extends XMLHttpRequest {
			response: {
				message?: string;
			};
		}
		
		export interface IWebApiAdapterConfig {
			/**
			 * Hostname of the endpoint. On server environment, this parameter is *required*.
			 */
			host?: string | false;
			/**
			 * Scheme to use. On server environment, this parameter is *required*. On browser environment, it defaults to a relative scheme (IE ``). Note that it will be suffixed with `//`.
			 */
			scheme?: string | false;
			/**
			 * Port of the endpoint.
			 */
			port?: number | false;
			/**
			 * Path to the endpoint.
			 */
			path: string;
			/**
			 * Hash with keys being the singular name of the endpoint, and values being the associated plural name of the same endpoint.
			 */
			pluralApis?: { [key: string]: string };
		}
		
		export interface IWebApiAdapterInternalConfig extends IWebApiAdapterConfig {
			host: string | false;
			scheme: string | false;
			port: number | false;
			path: string;
			pluralApis?: { [key: string]: string };
			baseEndPoint?: string;
		}
		
		export type IEventProviderFactory = ( ...args: any[] ) => IEventProvider;
		export interface IEventProvider {}
		
		/**
		 * Defines the HTTP verbs usable by a query.
		 *
		 * @author Gerkin
		 */
		export enum EHttpVerb {
			GET = 'GET',
			POST = 'POST',
			PATCH = 'PATCH',
			DELETE = 'DELETE',
		}
		export interface IApiDescription {
			method: EHttpVerb;
			endPoint: string;
			body: object;
			queryString: object;
		}
		
		export interface IErrorMessage {
			message?: string;
		}
		export type TEntitiesJsonResponse =
		| IEntityProperties
		| IEntityProperties[]
		| undefined;
		
		export interface IQueryDescriptor {
			queryType: 'find' | 'update' | 'delete' | 'insert';
			queryNum: 'one' | 'many';
			modelName: string;
			select: QueryLanguage.SelectQueryOrCondition;
			update?: IEntityAttributes;
			options: QueryOptions;
			apiDesc: IApiDescription;
		}
		export interface IQueryDescriptorRaw {
			queryType: 'find' | 'update' | 'delete' | 'insert';
			queryNum: 'one' | 'many';
			modelName: string;
			select: QueryLanguage.SelectQueryOrCondition;
			update?: IEntityAttributes;
			options: QueryLanguage.IQueryOptions;
			apiDesc: IApiDescription;
		}

		export type QueryOptions = {
			skip?: number;
			limit?: number;
		} | {
			limit: number;
			page: number;
		};
	}
}
