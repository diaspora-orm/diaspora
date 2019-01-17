import * as _ from 'lodash';

import { Adapter as _AAdapter } from '../base';
import AAdapter = _AAdapter.Base.AAdapter;
import { Adapter as _WebApiEntity } from './entity';
import WebApiEntity = _WebApiEntity.WebApi.WebApiEntity;
import { Adapter as _DefaultQueryTransformerFactory } from './defaultQueryTransformer';

import { logger } from '../../logger';
import { _QueryLanguage } from '../../types/queryLanguage';
import { IEntityProperties, IEntityAttributes } from '../../types/entity';
import * as WebApiTypes from './types';

export namespace Adapter.WebApi {
	/**
	 * Adapter for RESTful HTTP APIs.
	 *
	 * @see https://www.npmjs.com/package/%40diaspora/plugin-server Diaspora Server plugin: Package built on Diaspora & Express.js to easily configure HTTP APIs compatible with this adapter.
	 */
	export abstract class AWebApiAdapter extends AAdapter<WebApiEntity> {
		protected static readonly httpErrorFactories = {
			400: ( response: WebApiTypes.IErrorMessage, statusCode: number ) =>
			new Error(
				`Bad Request: Posted data through HTTP is invalid; message ${AWebApiAdapter.getMessage( response )}`
			),
			404: ( response: WebApiTypes.IErrorMessage, statusCode: number ) =>
			new Error(
				`Not Found: Reached 404, message is ${AWebApiAdapter.getMessage( response )}`
			),
			_: ( response: WebApiTypes.IErrorMessage, statusCode: number ) =>
			new Error(
				`Unhandled HTTP error with status code ${statusCode} & message ${AWebApiAdapter.getMessage( response )}`
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
			config: AWebApiAdapter.IWebApiAdapterConfig,
			eventProviders: AWebApiAdapter.IEventProvider[] = [
				AWebApiAdapter.DefaultQueryTransformerFactory(),
			]
		) {
			super( WebApiEntity, dataSourceName );
			const transformedConfig = this.normalizeConfig( config );
			if ( typeof transformedConfig.baseEndPoint === 'undefined' ) {
				this.baseEndPoint = this.generateBaseEndPoint(
					transformedConfig.scheme,
					transformedConfig.host,
					transformedConfig.port,
					transformedConfig.path
				);
			} else {
				this.baseEndPoint = transformedConfig.baseEndPoint;
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
			apiDesc: WebApiTypes.IQueryDescriptorRaw
		): Promise<WebApiTypes.IQueryDescriptor> {
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

		protected abstract normalizeConfig( options:WebApiTypes.IWebApiAdapterConfig ): WebApiTypes.IWebApiAdapterInternalConfig;
		
		/**
		 * Filters the query object for non-http query relevant informations
		 *
		 * @param queryFind - Selection query object
		 * @param options   - Options object
		 */
		private static transformQueryOptions(
			options: _QueryLanguage.IQueryOptions
		): WebApiTypes.QueryOptions {
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
		private postProcessManyQuery( entities: WebApiTypes.TEntitiesJsonResponse ) {
			if ( !_.isArray( entities ) && !_.isUndefined( entities ) ){
				throw new TypeError( `The API should have returned "undefined" or an array, but received ${JSON.stringify( entities )}` );
			}
			if ( !_.isNil( entities ) ) {
				return _.map( entities, entity => this.postProcessOneQuery( entity ) as IEntityProperties );
			} else {
				return [];
			}
		}

		private postProcessOneQuery( entity: WebApiTypes.TEntitiesJsonResponse ) {
			if ( _.isArray( entity ) ){
				throw new TypeError( `The API should have returned "undefined" or a single plain object, but received ${JSON.stringify( entity )}` );
			}
			if ( !_.isNil( entity ) ) {
				entity.idHash = { [this.name]: entity.id };
			}
			return entity;
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
			const newEntity = await this.apiQuery( WebApiTypes.EHttpVerb.POST, table, entity );
			return this.postProcessOneQuery( newEntity );
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
			const newEntities = await this.apiQuery( WebApiTypes.EHttpVerb.POST, this.getPluralEndpoint( table ), entities );
			return this.postProcessManyQuery( newEntities );
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
			queryFind: _QueryLanguage.ISelectQuery,
			options: _QueryLanguage.IQueryOptions
		): Promise<IEntityProperties | undefined> {
			const { apiDesc } = await this.beforeQuery( {
				queryType: 'find',
				queryNum: 'one',
				modelName: table,
				select: queryFind,
				options: options,
				apiDesc: undefined as any,
			} );
			const entity = await this.apiQuery( apiDesc.method, apiDesc.endPoint, apiDesc.body, apiDesc.queryString );
			return this.postProcessOneQuery( entity );
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
			queryFind: _QueryLanguage.ISelectQuery,
			options: _QueryLanguage.IQueryOptions
		): Promise<IEntityProperties[]> {
			const { apiDesc } = await this.beforeQuery( {
				queryType: 'find',
				queryNum: 'many',
				modelName: table,
				select: queryFind,
				options: options,
				apiDesc: undefined as any,
			} );
			const entities = await this.apiQuery( apiDesc.method, apiDesc.endPoint, apiDesc.body, apiDesc.queryString );
			return this.postProcessManyQuery( entities );
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
			queryFind: _QueryLanguage.ISelectQuery,
			update: IEntityAttributes,
			options: _QueryLanguage.IQueryOptions
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
			const entity = await this.apiQuery( apiDesc.method, apiDesc.endPoint, apiDesc.body, apiDesc.queryString );
			return this.postProcessOneQuery( entity );
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
			queryFind: _QueryLanguage.ISelectQuery,
			update: IEntityAttributes,
			options: _QueryLanguage.IQueryOptions
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
			const entities = await this.apiQuery( apiDesc.method, apiDesc.endPoint, apiDesc.body, apiDesc.queryString );
			return this.postProcessManyQuery( entities );
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
			queryFind: _QueryLanguage.ISelectQuery,
			options: _QueryLanguage.IQueryOptions
		): Promise<void> {
			const { apiDesc } = await this.beforeQuery( {
				queryType: 'delete',
				queryNum: 'one',
				modelName: table,
				select: queryFind,
				options: options,
				apiDesc: undefined as any,
			} );
			await this.apiQuery( apiDesc.method, apiDesc.endPoint, apiDesc.body, apiDesc.queryString );
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
			queryFind: _QueryLanguage.ISelectQuery,
			options: _QueryLanguage.IQueryOptions
		): Promise<void> {
			const { apiDesc } = await this.beforeQuery( {
				queryType: 'delete',
				queryNum: 'many',
				modelName: table,
				select: queryFind,
				options: options,
				apiDesc: undefined as any,
			} );
			await this.apiQuery( apiDesc.method, apiDesc.endPoint, apiDesc.body, apiDesc.queryString );
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
			method: WebApiTypes.EHttpVerb,
			endPoint: string,
			data?: object,
			queryObject?: object
		): Promise<WebApiTypes.TEntitiesJsonResponse>;
		
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
			verb: WebApiTypes.EHttpVerb,
			endPoint: string,
			data?: object,
			queryObject?: object
		): Promise<WebApiTypes.TEntitiesJsonResponse> {
			return this.sendRequest( verb, `${this.baseEndPoint}/${endPoint.toLowerCase()}`, data, queryObject );
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
			verb: WebApiTypes.EHttpVerb,
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
		private getPluralEndpoint( endpoint: string ): string {
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
			response: WebApiTypes.IErrorMessage | undefined,
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
		export import IWebApiAdapterConfig = WebApiTypes.IWebApiAdapterConfig;
		export import IEventProvider = WebApiTypes.IEventProvider;
		export import DefaultQueryTransformerFactory = _DefaultQueryTransformerFactory.WebApi.DefaultQueryTransformerFactory;
	}
}
