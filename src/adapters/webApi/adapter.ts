import * as _ from 'lodash';

import { Adapter } from '../base';
import { WebApiEntity } from './entity';
import { DefaultQueryTransformerFactory } from './defaultQueryTransformer';
import { logger } from '../../logger';
import { QueryLanguage } from '../../types/queryLanguage';
import { IEntityProperties, IEntityAttributes } from '../../types/entity';

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

export interface IWebApiAdapterInternalConfig extends IWebApiAdapterConfig{
	host: string | false;
	scheme: string | false;
	port: number | false;
	path: string;
	pluralApis?: { [key: string]: string };
	baseEndPoint?: string;
}

export interface IEventProviderFactory {
	( ...args: any[] ): IEventProvider;
}
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
interface PluralEndpoint extends String {}
export interface IApiDescription {
	method: EHttpVerb;
	endPoint: string;
	body: object;
	queryString: object;
}

export type TEntitiesJsonResponse =
	| IEntityProperties
	| IEntityProperties[]
	| undefined;

/**
 * Adapter for RESTful HTTP APIs.
 *
 * @see https://www.npmjs.com/package/diaspora-server Diaspora-Server: Package built on Diaspora & Express.js to easily configure HTTP APIs compatible with this adapter.
 */
export abstract class WebApiAdapter extends Adapter<WebApiEntity> {
	protected static readonly httpErrorFactories = {
		400: ( xhr: IXhrResponse ) =>
			new Error(
				`Posted data through HTTP is invalid; message ${WebApiAdapter.getMessage(
					xhr
				)}`
			),
		404: ( xhr: IXhrResponse ) =>
			new Error( `Reached 404, message is ${WebApiAdapter.getMessage( xhr )}` ),
		_: ( xhr: IXhrResponse ) =>
			new Error(
				`Unhandled HTTP error with status code ${
					xhr.status
				} & message ${WebApiAdapter.getMessage( xhr )}`
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
		config: IWebApiAdapterInternalConfig,
		eventProviders: IEventProvider[] = [DefaultQueryTransformerFactory()]
	) {
		super( WebApiEntity, dataSourceName );
		
		if ( typeof config.baseEndPoint === 'undefined' ){
			this.baseEndPoint = this.generateBaseEndPoint( config.scheme, config.host, config.port, config.path );
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
	 * Gets the field 'message' in an XHR
	 * TODO: Check if relevant
	 * 
	 * @param xhr - XHR to get field from
	 */
	private static getMessage( xhr: IXhrResponse ) {
		return _.get( xhr, 'response.message' )
			? `"${( xhr as { response: { message: string } } ).response.message}"`
			: 'NULL';
	}

	/**
	 * Filters the query object for non-http query relevant informations
	 * 
	 * @param queryFind - Selection query object
	 * @param options   - Options object
	 */
	private static getQueryObject(
		queryFind: QueryLanguage.SelectQuery,
		options: QueryLanguage.QueryOptions
	) {
		if ( 0 === options.skip ) {
			delete options.skip;
		}
		if ( !isFinite( options.limit ) ) {
			delete options.limit;
		}

		return _.assign( {}, _.omit( options, ['remapInput', 'remapOutput'] ), {
			where: queryFind,
		} );
	}

	/**
	 * Fills the id of entities
	 * 
	 * @param entities - Entities received
	 * @param adapter  - Source of those entities
	 */
	private static maybeAddIdHashToEntities(
		entities: IEntityAttributes[],
		adapter: WebApiAdapter
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
		let newEntity = await this.apiQuery( EHttpVerb.POST, table, entity );
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
			EHttpVerb.POST,
			this.getPluralEndpoint( table ),
			entities
		);
		newEntities = WebApiAdapter.maybeAddIdHashToEntities( newEntities, this );
		return newEntities || [];
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
		queryFind: QueryLanguage.SelectQuery,
		options: QueryLanguage.QueryOptions
	): Promise<IEntityProperties | undefined> {
		const apiDesc: IApiDescription = await this.emit(
			'beforeQuery',
			'find',
			'one',
			table,
			queryFind,
			null,
			options
		);
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
		queryFind: QueryLanguage.SelectQuery,
		options: QueryLanguage.QueryOptions
	): Promise<IEntityProperties[]> {
		const apiDesc = await this.emit(
			'beforeQuery',
			'find',
			'many',
			table,
			queryFind,
			null,
			options
		);
		let newEntities = await this.apiQuery(
			apiDesc.method,
			apiDesc.endPoint as PluralEndpoint,
			apiDesc.body,
			apiDesc.queryString
		);
		newEntities = WebApiAdapter.maybeAddIdHashToEntities( newEntities, this );
		return newEntities || [];
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
		queryFind: QueryLanguage.SelectQuery,
		update: IEntityAttributes,
		options: QueryLanguage.QueryOptions
	): Promise<IEntityProperties | undefined> {
		let entity = await this.apiQuery(
			EHttpVerb.PATCH,
			table,
			update,
			WebApiAdapter.getQueryObject( queryFind, options )
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
		queryFind: QueryLanguage.SelectQuery,
		update: IEntityAttributes,
		options: QueryLanguage.QueryOptions
	): Promise<IEntityProperties[]> {
		let entities = await this.apiQuery(
			EHttpVerb.PATCH,
			this.getPluralEndpoint( table ),
			update,
			WebApiAdapter.getQueryObject( queryFind, options )
		);
		entities = WebApiAdapter.maybeAddIdHashToEntities( entities, this );
		return entities || [];
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
		queryFind: QueryLanguage.SelectQuery,
		options: QueryLanguage.QueryOptions
	): Promise<void> {
		await this.apiQuery(
			EHttpVerb.DELETE,
			table,
			undefined,
			WebApiAdapter.getQueryObject( queryFind, options )
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
		queryFind: QueryLanguage.SelectQuery,
		options: QueryLanguage.QueryOptions
	): Promise<void> {
		await this.apiQuery(
			EHttpVerb.DELETE,
			this.getPluralEndpoint( table ),
			undefined,
			WebApiAdapter.getQueryObject( queryFind, options )
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
		method: EHttpVerb,
		endPoint: string,
		data?: object | true,
		queryObject?: object
	): Promise<TEntitiesJsonResponse>;

	/**
	 * Generates the URL to the base of the API
	 * 
	 * @param scheme - Represents the protocol (`http` or `https` most of the time)
	 * @param host   - Hostname to target (domain name, IP, ...)
	 * @param port   - Port of the target to point to
	 * @param path   - Absolute URI on the API
	 * @returns The URI string to the base of the API
	 */
	protected generateBaseEndPoint( scheme: string | false, host: string | false, port: number | false, path: string ){
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
		verb: EHttpVerb,
		endPoint: string,
		data?: object,
		queryObject?: object
	): Promise<IEntityProperties | undefined>;
	private apiQuery(
		verb: EHttpVerb,
		endPoint: PluralEndpoint,
		data?: object,
		queryObject?: object
	): Promise<IEntityProperties[]>;
	private apiQuery(
		verb: EHttpVerb,
		endPoint: string,
		data?: object,
		queryObject?: object
	): Promise<TEntitiesJsonResponse> {
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
		verb: EHttpVerb,
		endPoint: string,
		body?: object,
		queryString?: object
	) {
		logger.verbose( `Sending ${verb} HTTP request to "${endPoint}" with data:`, {
			body,
			queryString,
		} );
		const response = await this.httpRequest(
			verb,
			endPoint,
			body,
			queryString
		);
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
	private getPluralEndpoint( endpoint: string ): PluralEndpoint {
		return _.get( this.pluralApis, endpoint, endpoint + 's' );
	}
}
